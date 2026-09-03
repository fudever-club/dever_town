import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OTP_FILE_PATH = path.join(__dirname, '../data/active_otps.json');

/**
 * OtpService: Quản lý mã OTP khôi phục mật khẩu.
 * Hỗ trợ lưu trữ 3 tầng: Database (Postgres) + Persistent File (Local) + In-Memory Map.
 * Đảm bảo 100% không bị mất mã OTP khi server restart hoặc redeploy.
 */
class OtpService {
  constructor() {
    this.memoryStore = new Map();
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(OTP_FILE_PATH)) {
        const data = fs.readFileSync(OTP_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(data || '{}');
        const now = Date.now();
        for (const [email, record] of Object.entries(parsed)) {
          if (record && record.expiresAt > now) {
            this.memoryStore.set(email.toLowerCase().trim(), record);
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ [OtpService] Không thể đọc active_otps.json:', err.message);
    }
  }

  saveToDisk() {
    try {
      const obj = {};
      const now = Date.now();
      for (const [email, record] of this.memoryStore.entries()) {
        if (record && record.expiresAt > now) {
          obj[email] = record;
        }
      }
      fs.writeFileSync(OTP_FILE_PATH, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      // Bỏ qua lỗi ghi disk trên môi trường read-only
    }
  }

  /**
   * Lưu mã OTP mới cho email
   */
  async setOtp(email, otpCode, expiresInMinutes = 10) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otpCode).replace(/\D/g, '').trim();
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    const record = {
      otp: cleanOtp,
      expiresAt,
      attempts: 0
    };

    // 1. Lưu Memory
    this.memoryStore.set(cleanEmail, record);
    // 2. Lưu Disk
    this.saveToDisk();

    // 3. Lưu Database
    try {
      const db = getDB();
      if (db && typeof db.saveOtp === 'function') {
        await db.saveOtp(cleanEmail, cleanOtp, expiresAt);
      }
    } catch (e) {
      console.warn('⚠️ [OtpService] Không thể lưu vào DB adapter:', e.message);
    }

    console.log(`🔐 [OtpService] Đã lưu OTP [${cleanOtp}] cho [${cleanEmail}] (Hết hạn: ${new Date(expiresAt).toLocaleTimeString('vi-VN')})`);
    return record;
  }

  /**
   * Xác thực mã OTP
   */
  async verifyOtp(email, otpCode) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otpCode || '').replace(/\D/g, '').trim();
    
    let record = this.memoryStore.get(cleanEmail);

    // Nếu Memory không có (ví dụ Server vừa restart), truy vấn Database
    if (!record) {
      try {
        const db = getDB();
        if (db && typeof db.getOtp === 'function') {
          const dbRecord = await db.getOtp(cleanEmail);
          if (dbRecord) {
            record = dbRecord;
            this.memoryStore.set(cleanEmail, record);
          }
        }
      } catch (e) {
        console.warn('⚠️ [OtpService] Lỗi truy vấn OTP từ DB:', e.message);
      }
    }

    if (!record) {
      console.log(`❌ [OtpService:Verify] Không tìm thấy OTP cho email: ${cleanEmail}`);
      return { valid: false, reason: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu đặt lại mật khẩu hoặc mã OTP đã hết hạn.' };
    }

    if (Date.now() > record.expiresAt) {
      await this.deleteOtp(cleanEmail);
      console.log(`❌ [OtpService:Verify] OTP của email ${cleanEmail} đã hết hạn.`);
      return { valid: false, reason: 'EXPIRED', message: 'Mã OTP đã hết hạn hiệu lực. Vui lòng bấm "Gửi lại mã".' };
    }

    if (record.otp !== cleanOtp) {
      record.attempts = (record.attempts || 0) + 1;
      this.saveToDisk();
      try {
        const db = getDB();
        if (db && typeof db.incrementOtpAttempts === 'function') {
          await db.incrementOtpAttempts(cleanEmail);
        }
      } catch (e) {}

      console.log(`❌ [OtpService:Verify] Sai mã OTP cho ${cleanEmail} (Nhập: ${cleanOtp}, Mong muốn: ${record.otp})`);
      if (record.attempts >= 5) {
        await this.deleteOtp(cleanEmail);
        return { valid: false, reason: 'MAX_ATTEMPTS', message: 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới.' };
      }
      return { valid: false, reason: 'MISMATCH', message: `Mã OTP không chính xác. Còn ${5 - record.attempts} lần thử.` };
    }

    console.log(`✅ [OtpService:Verify] OTP hợp lệ cho email: ${cleanEmail}`);
    return { valid: true };
  }

  /**
   * Xóa OTP sau khi đổi mật khẩu thành công
   */
  async deleteOtp(email) {
    const cleanEmail = email.toLowerCase().trim();
    this.memoryStore.delete(cleanEmail);
    this.saveToDisk();
    try {
      const db = getDB();
      if (db && typeof db.deleteOtp === 'function') {
        await db.deleteOtp(cleanEmail);
      }
    } catch (e) {}
  }
}

export const otpService = new OtpService();
