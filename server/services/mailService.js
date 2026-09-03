import 'dotenv/config';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * MailService: Quản lý gửi email xác thực OTP và thông báo bảo mật.
 * Hỗ trợ linh hoạt:
 *  1. Resend REST API (Khuyên dùng - Đơn giản nhất với 1 API Key 're_...')
 *  2. SMTP Transporter (Nodemailer - Hỗ trợ Gmail, Brevo, SendGrid)
 *  3. Dynamic Logger & Dev Fallback (Tự động thích ứng nếu chưa cấu hình)
 */
export class MailService {
  constructor() {
    this.resendClient = null;
    this.smtpTransporter = null;
  }

  /**
   * Lấy Resend Client với khả năng nạp động biến môi trường
   */
  getResendClient() {
    const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
    if (apiKey) {
      if (!this.resendClient || this._lastResendKey !== apiKey) {
        try {
          this.resendClient = new Resend(apiKey.trim());
          this._lastResendKey = apiKey;
          console.log(`🚀 [MailService] Đã kích hoạt Resend REST API Client thành công!`);
        } catch (err) {
          console.warn(`⚠️ [MailService] Lỗi khởi tạo Resend Client:`, err.message);
          this.resendClient = null;
        }
      }
    }
    return this.resendClient;
  }

  /**
   * Lấy địa chỉ Sender gửi đi
   */
  getSenderEmail() {
    return process.env.RESEND_FROM || process.env.SENDER_EMAIL || 'DEVER TOWN <onboarding@resend.dev>';
  }

  /**
   * Lấy SMTP Transporter
   */
  getSmtpTransporter() {
    const user = process.env.SMTP_USER || process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 587);

    if (user && pass && !this.smtpTransporter) {
      try {
        this.smtpTransporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
      } catch (err) {
        console.warn(`⚠️ [MailService] Lỗi khởi tạo SMTP:`, err.message);
      }
    }
    return this.smtpTransporter;
  }

  /**
   * Gửi mã OTP xác thực đặt lại mật khẩu
   * @param {string} userEmail - Email nhận mã
   * @param {Object} data - { otpCode, displayName, expiresInMinutes }
   */
  async sendPasswordResetOtp(userEmail, { otpCode, displayName = 'Thành viên DEVER', expiresInMinutes = 10 }) {
    const cleanEmail = userEmail.trim().toLowerCase();
    const emailSubject = `[FU-DEVER TOWN] 🔑 Mã Xác Thực Đặt Lại Mật Khẩu: ${otpCode}`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #f26f21, #ea580c); padding: 24px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 1px;">DEVER TOWN</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #fed7aa; text-transform: uppercase; letter-spacing: 2px;">FU-DEVER • FPT UNIVERSITY ĐÀ NẴNG</p>
        </div>
        
        <div style="padding: 30px 30px 20px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Xin chào ${displayName},</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Bạn (hoặc ai đó) vừa gửi yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản DEVER TOWN gắn với email: <span style="color: #38bdf8; font-weight: bold;">${cleanEmail}</span>.
          </p>

          <div style="background: #1e293b; border: 2px dashed #f26f21; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Mã Xác Thực Bảo Mật (OTP) Của Bạn:</div>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #f26f21; font-family: 'Courier New', Courier, monospace;">${otpCode}</div>
            <div style="font-size: 12px; color: #fbbf24; margin-top: 8px;">⏳ Mã này có hiệu lực trong vòng <strong>${expiresInMinutes} phút</strong>.</div>
          </div>

          <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5; line-height: 1.5;">
              ⚠️ <strong>Cảnh báo bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả Ban Quản Trị CLB FU-DEVER.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được bảo vệ an toàn.
          </p>
        </div>

        <div style="background: #020617; padding: 16px 30px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b;">
          © 2026 FU-DEVER Club • FPT University Đà Nẵng (FUDA)<br/>
          <em>WORK HARD - PLAY HARD</em>
        </div>
      </div>
    `;

    const textContent = `
Xin chào ${displayName},

Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản DEVER TOWN (${cleanEmail}).

MÃ XÁC THỰC BẢO MẬT (OTP) CỦA BẠN: [ ${otpCode} ]
Hiệu lực: ${expiresInMinutes} phút.

Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
Trân trọng,
Đội Ngũ Kỹ Thuật CLB FU-DEVER • FUDA
    `.trim();

    // 1. Luôn in ra console server
    console.log(`\n================== 📧 [PASSWORD RESET OTP EMAIL] ==================`);
    console.log(`To: ${cleanEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`OTP Code: >>> [ ${otpCode} ] <<< (Valid for ${expiresInMinutes} mins)`);
    console.log(`===================================================================\n`);

    // 2. Gửi qua Resend REST API (Nếu có RESEND_API_KEY)
    const resend = this.getResendClient();
    if (resend) {
      const sender = this.getSenderEmail();
      try {
        console.log(`📤 [MailService] Đang gửi OTP qua Resend API từ [${sender}] tới [${cleanEmail}]...`);
        const { data, error } = await resend.emails.send({
          from: sender,
          to: [cleanEmail],
          subject: emailSubject,
          text: textContent,
          html: htmlContent
        });

        if (error) {
          console.error(`❌ [MailService:Resend Error]:`, error);
          return {
            success: true,
            deliveredTo: cleanEmail,
            realEmailSent: false,
            resendError: error.message || String(error),
            timestamp: Date.now()
          };
        }

        console.log(`✅ [MailService:Resend Success] Đã gửi email thành công! Message ID:`, data?.id);
        return {
          success: true,
          deliveredTo: cleanEmail,
          realEmailSent: true,
          provider: 'resend',
          id: data?.id,
          timestamp: Date.now()
        };
      } catch (resendEx) {
        console.error(`❌ [MailService:Resend Exception]:`, resendEx.message);
        return {
          success: true,
          deliveredTo: cleanEmail,
          realEmailSent: false,
          resendError: resendEx.message,
          timestamp: Date.now()
        };
      }
    }

    // 3. Gửi qua SMTP nếu có
    const smtp = this.getSmtpTransporter();
    if (smtp) {
      try {
        const info = await smtp.sendMail({
          from: `"FU-DEVER TOWN" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: emailSubject,
          text: textContent,
          html: htmlContent
        });
        console.log(`✅ [MailService:SMTP Success] Đã gửi email qua SMTP! ID:`, info.messageId);
        return {
          success: true,
          deliveredTo: cleanEmail,
          realEmailSent: true,
          provider: 'smtp',
          messageId: info.messageId,
          timestamp: Date.now()
        };
      } catch (smtpEx) {
        console.error(`❌ [MailService:SMTP Error]:`, smtpEx.message);
      }
    }

    // 4. Fallback Dev Mode
    return {
      success: true,
      deliveredTo: cleanEmail,
      realEmailSent: false,
      timestamp: Date.now()
    };
  }

  /**
   * Gửi email cảnh báo đăng nhập thiết bị mới
   */
  async sendNewDeviceAlert(userEmail, details = {}) {
    const {
      displayName = 'Thành viên DEVER',
      ip = '127.0.0.1',
      userAgent = 'Web Browser',
      time = new Date().toLocaleString('vi-VN'),
      activeDevicesCount = 1
    } = details;

    const emailSubject = `[FU-DEVER TOWN] 🛡️ Cảnh Báo: Thiết bị mới vừa đăng nhập tài khoản của bạn`;
    const emailBodyText = `Xin chào ${displayName},\n\nHệ thống bảo mật DEVER TOWN vừa ghi nhận một lượt đăng nhập mới vào tài khoản của bạn (${userEmail}):\n- Thời gian: ${time}\n- IP: ${ip}\n- Trình duyệt: ${userAgent}\n\nTrân trọng,\nĐội Ngũ Kỹ Thuật FU-DEVER`;

    const resend = this.getResendClient();
    if (resend) {
      try {
        await resend.emails.send({
          from: this.getSenderEmail(),
          to: [userEmail],
          subject: emailSubject,
          text: emailBodyText
        });
      } catch (e) {
        console.warn('Lỗi gửi email cảnh báo qua Resend:', e.message);
      }
    }

    return { success: true, deliveredTo: userEmail, timestamp: Date.now() };
  }
}

export const mailService = new MailService();
