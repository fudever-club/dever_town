import nodemailer from 'nodemailer';

/**
 * MailService: Gửi email cảnh báo bảo mật và thông báo đăng nhập thiết bị mới / OTP đặt lại mật khẩu.
 * Hỗ trợ cấu hình SMTP thực tế (Gmail, SendGrid, Brevo, Custom SMTP) qua biến môi trường.
 * Nếu chưa cấu hình SMTP, tự động chuyển sang chế độ Console Security Logger phục vụ thử nghiệm local.
 */
export class MailService {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com';
    this.smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
    this.smtpUser = process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER || null;
    this.smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASS || null;
    this.senderEmail = process.env.SENDER_EMAIL || this.smtpUser || 'fudever.club@gmail.com';
    this.transporter = null;

    this.initTransporter();
  }

  initTransporter() {
    if (this.smtpUser && this.smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: this.smtpHost,
          port: this.smtpPort,
          secure: this.smtpPort === 465,
          auth: {
            user: this.smtpUser,
            pass: this.smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log(`📧 [MailService] Đã kích hoạt SMTP Transporter kết nối tới ${this.smtpHost}:${this.smtpPort} (${this.smtpUser})`);
      } catch (err) {
        console.warn(`⚠️ [MailService] Không thể khởi tạo SMTP transporter:`, err.message);
        this.transporter = null;
      }
    } else {
      console.log(`ℹ️ [MailService] Chưa cấu hình SMTP_USER / SMTP_PASS. Chạy ở chế độ Dev Console Logger (Mã OTP sẽ hiển thị trực tiếp trên Terminal Server).`);
    }
  }

  /**
   * Gửi mã OTP xác thực đặt lại mật khẩu
   * @param {string} userEmail - Email nhận mã
   * @param {Object} data - { otpCode, displayName, expiresInMinutes }
   */
  async sendPasswordResetOtp(userEmail, { otpCode, displayName = 'Thành viên DEVER', expiresInMinutes = 10 }) {
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
            Bạn (hoặc ai đó) vừa gửi yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản DEVER TOWN gắn với email: <span style="color: #38bdf8; font-weight: bold;">${userEmail}</span>.
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

Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản DEVER TOWN (${userEmail}).

MÃ XÁC THỰC BẢO MẬT (OTP) CỦA BẠN: [ ${otpCode} ]
Hiệu lực: ${expiresInMinutes} phút.

Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
Trân trọng,
Đội Ngũ Kỹ Thuật CLB FU-DEVER • FUDA
    `.trim();

    // 1. Luôn in ra console server để dev dễ kiểm tra và debug
    console.log(`\n================== 📧 [PASSWORD RESET OTP EMAIL] ==================`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`OTP Code: >>> [ ${otpCode} ] <<< (Valid for ${expiresInMinutes} mins)`);
    console.log(`===================================================================\n`);

    // 2. Nếu đã cấu hình SMTP Transporter, gửi email thật tới hộp thư
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"FU-DEVER TOWN Security" <${this.senderEmail}>`,
          to: userEmail,
          subject: emailSubject,
          text: textContent,
          html: htmlContent
        });
        console.log(`✅ [MailService] Đã gửi email OTP thực tế thành công tới ${userEmail} (MessageId: ${info.messageId})`);
        return {
          success: true,
          deliveredTo: userEmail,
          realEmailSent: true,
          messageId: info.messageId,
          timestamp: Date.now()
        };
      } catch (sendErr) {
        console.error(`❌ [MailService] Lỗi khi gửi email thực tế qua SMTP:`, sendErr.message);
      }
    }

    return {
      success: true,
      deliveredTo: userEmail,
      realEmailSent: false,
      timestamp: Date.now()
    };
  }

  /**
   * Gửi email cảnh báo đăng nhập thiết bị mới
   * @param {string} userEmail - Email người dùng nhận cảnh báo
   * @param {Object} details - Thông tin chi tiết thiết bị
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
    
    const emailBodyText = `
Xin chào ${displayName},

Hệ thống bảo mật DEVER TOWN vừa ghi nhận một lượt đăng nhập mới vào tài khoản của bạn (${userEmail}):

- Thời gian: ${time}
- Địa chỉ IP: ${ip}
- Thiết bị / Trình duyệt: ${userAgent}
- Số thiết bị đang hoạt động: ${activeDevicesCount}/4 thiết bị

Nếu đây là bạn, bạn có thể bỏ qua email này.
Nếu bạn KHÔNG thực hiện đăng nhập này, vui lòng truy cập game ngay để đổi mật khẩu và liên hệ Ban Quản Trị CLB FU-DEVER.

Trân trọng,
Đội Ngũ Kỹ Thuật FU-DEVER
    `.trim();

    console.log(`\n================== 📧 [SECURITY EMAIL DISPATCHED] ==================`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Details: IP=${ip} | User=${displayName} | Time=${time} | ActiveDevices=${activeDevicesCount}/4`);
    console.log(`===================================================================\n`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"FU-DEVER TOWN Security" <${this.senderEmail}>`,
          to: userEmail,
          subject: emailSubject,
          text: emailBodyText
        });
      } catch (e) {
        console.warn('Lỗi gửi email cảnh báo thiết bị:', e.message);
      }
    }

    return {
      success: true,
      deliveredTo: userEmail,
      timestamp: Date.now()
    };
  }
}

export const mailService = new MailService();
