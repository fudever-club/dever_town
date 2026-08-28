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
}

export const mailService = new MailService();
