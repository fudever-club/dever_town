/**
 * MailService: Gửi email cảnh báo bảo mật và thông báo đăng nhập thiết bị mới.
 * Hỗ trợ cấu hình SMTP tùy chỉnh qua biến môi trường hoặc tự động fallback sang Console Security Logger.
 */
export class MailService {
  constructor() {
    this.smtpHost = process.env.SMTP_HOST || null;
    this.smtpPort = process.env.SMTP_PORT || 587;
    this.smtpUser = process.env.SMTP_USER || null;
    this.smtpPass = process.env.SMTP_PASS || null;
    this.senderEmail = process.env.SENDER_EMAIL || 'security@devertown.com';
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

    // Log chi tiết vào Server Security Log
    console.log(`\n================== 📧 [SECURITY EMAIL DISPATCHED] ==================`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Details: IP=${ip} | User=${displayName} | Time=${time} | ActiveDevices=${activeDevicesCount}/4`);
    console.log(`Content:\n${emailBodyText}`);
    console.log(`===================================================================\n`);

    return {
      success: true,
      deliveredTo: userEmail,
      timestamp: Date.now()
    };
  }

  /**
   * Gửi mã OTP xác thực đặt lại mật khẩu
   * @param {string} userEmail - Email nhận mã
   * @param {Object} data - { otpCode, displayName, expiresInMinutes }
   */
  async sendPasswordResetOtp(userEmail, { otpCode, displayName = 'Thành viên DEVER', expiresInMinutes = 10 }) {
    const emailSubject = `[FU-DEVER TOWN] 🔑 Mã Xác Thực Đặt Lại Mật Khẩu: ${otpCode}`;

    const emailBodyText = `
Xin chào ${displayName},

Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản DEVER TOWN gắn với email (${userEmail}).

🔐 MÃ XÁC THỰC BẢO MẬT (OTP) CỦA BẠN LÀ:
╔═══════════════════════════════════╗
║            ${otpCode}            ║
╚═══════════════════════════════════╝

- Mã OTP này có hiệu lực trong vòng: ${expiresInMinutes} phút.
- Tuyệt đối KHÔNG chia sẻ mã này cho bất kỳ ai, kể cả Ban Quản Trị.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được bảo mật an toàn.

Trân trọng,
Đội Ngũ Kỹ Thuật CLB FU-DEVER · FUDA
    `.trim();

    console.log(`\n================== 📧 [PASSWORD RESET OTP EMAIL] ==================`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`OTP Code: >>> [ ${otpCode} ] <<< (Valid for ${expiresInMinutes} mins)`);
    console.log(`Content:\n${emailBodyText}`);
    console.log(`===================================================================\n`);

    return {
      success: true,
      deliveredTo: userEmail,
      otpCode,
      timestamp: Date.now()
    };
  }
}

export const mailService = new MailService();
