import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OTP_FILE_PATH = path.join(__dirname, '../data/active_otps.json');

/**
 * OtpService: Quản lý mã OTP khôi phục mật khẩu.
 * Hỗ trợ lưu trữ bền vững (Persistent File + Memory Map) chống mất mã khi Server khởi động lại.
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
      // Trên môi trường read-only, bỏ qua lỗi ghi file và tiếp tục dùng memory
    }
  }

  /**
   * Lưu mã OTP mới cho email
   */
  setOtp(email, otpCode, expiresInMinutes = 10) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otpCode).replace(/\D/g, '').trim();
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    const record = {
      otp: cleanOtp,
      expiresAt,
      attempts: 0
    };

    this.memoryStore.set(cleanEmail, record);
    this.saveToDisk();

    console.log(`🔐 [OtpService] Đã lưu OTP [${cleanOtp}] cho [${cleanEmail}] (Hết hạn lúc: ${new Date(expiresAt).toLocaleTimeString('vi-VN')})`);
    return record;
  }

  /**
   * Lấy bản ghi OTP
   */
  getOtp(email) {
    const cleanEmail = email.toLowerCase().trim();
    return this.memoryStore.get(cleanEmail) || null;
  }

  /**
   * Xác thực mã OTP
   */
  verifyOtp(email, otpCode) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otpCode || '').replace(/\D/g, '').trim();
    const record = this.memoryStore.get(cleanEmail);

    if (!record) {
      return { valid: false, reason: 'NOT_FOUND', message: 'Không tìm thấy yêu cầu đặt lại mật khẩu hoặc mã OTP đã hết hạn.' };
    }

    if (Date.now() > record.expiresAt) {
      this.deleteOtp(cleanEmail);
      return { valid: false, reason: 'EXPIRED', message: 'Mã OTP đã hết hạn hiệu lực. Vui lòng bấm "Gửi lại mã".' };
    }

    if (record.otp !== cleanOtp) {
      record.attempts = (record.attempts || 0) + 1;
      this.saveToDisk();

      if (record.attempts >= 5) {
        this.deleteOtp(cleanEmail);
        return { valid: false, reason: 'MAX_ATTEMPTS', message: 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới.' };
      }
      return { valid: false, reason: 'MISMATCH', message: `Mã OTP không chính xác. Còn ${5 - record.attempts} lần thử.` };
    }

    return { valid: true };
  }

  /**
   * Xóa OTP sau khi đổi mật khẩu thành công
   */
  deleteOtp(email) {
    const cleanEmail = email.toLowerCase().trim();
    this.memoryStore.delete(cleanEmail);
    this.saveToDisk();
  }
}

export const otpService = new OtpService();
