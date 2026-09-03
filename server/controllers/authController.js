import bcrypt from 'bcryptjs';
import { getDB } from '../db/index.js';
import { generateToken, sanitizeUser } from '../middleware/authMiddleware.js';
import { mailService } from '../services/mailService.js';
import { otpService } from '../services/otpService.js';

export const authController = {
  /**
   * POST /api/auth/register - Đăng ký tài khoản mới
   */
  async register(req, res) {
    try {
      const { email, password, displayName, avatarId } = req.body;

      if (!email || !password || !displayName) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ email, mật khẩu và tên hiển thị!'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự!'
        });
      }

      const db = getDB();
      const existing = await db.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email này đã được đăng ký! Vui lòng đăng nhập.'
        });
      }

      const cleanDisplayName = displayName.trim();
      const existingName = await db.getUserByDisplayName(cleanDisplayName);
      if (existingName) {
        return res.status(409).json({
          success: false,
          message: 'Tên hiển thị này đã được sử dụng! Vui lòng chọn tên khác.'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const validAvatars = ['dev_hoodie', 'cyberpunk_pink', 'red_gamer', 'green_coder'];
      const chosenAvatar = validAvatars.includes(avatarId) ? avatarId : 'dev_hoodie';

      const newUser = await db.createUser({
        email,
        passwordHash,
        displayName: cleanDisplayName,
        avatarId: chosenAvatar,
        role: 'dev'
      });

      const token = generateToken(newUser);
      console.log(`✨ [Auth] Thành viên mới đăng ký: ${cleanDisplayName} (${email})`);

      return res.status(201).json({
        success: true,
        token,
        user: sanitizeUser(newUser)
      });
    } catch (err) {
      console.error('❌ [Auth Register Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi đăng ký tài khoản!' });
    }
  },

  /**
   * POST /api/auth/login - Đăng nhập tài khoản
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp email và mật khẩu!'
        });
      }

      const db = getDB();
      const user = await db.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác!'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác!'
        });
      }

      const token = generateToken(user);
      console.log(`🔑 [Auth] Đăng nhập thành công: ${user.display_name} (${user.email})`);

      return res.json({
        success: true,
        token,
        user: sanitizeUser(user)
      });
    } catch (err) {
      console.error('❌ [Auth Login Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng nhập!' });
    }
  },

  /**
   * POST /api/auth/forgot-password - Yêu cầu gửi mã OTP đặt lại mật khẩu về Email
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email!' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const db = getDB();
      const user = await db.getUserByEmail(cleanEmail);
      const displayName = user ? user.display_name : 'Thành viên DEVER';

      // Tạo mã OTP 6 số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresInMinutes = 10;

      // Lưu mã OTP bền vững vào OtpService (3-tier storage)
      await otpService.setOtp(cleanEmail, otpCode, expiresInMinutes);

      // Gửi email chứa mã OTP
      const mailResult = await mailService.sendPasswordResetOtp(cleanEmail, {
        otpCode,
        displayName,
        expiresInMinutes
      });

      if (!mailResult.realEmailSent && mailResult.resendError) {
        return res.status(400).json({
          success: false,
          message: `Lỗi gửi mail: ${mailResult.resendError}`
        });
      }

      return res.json({
        success: true,
        message: `Mã xác thực OTP gồm 6 chữ số đã được gửi tới ${cleanEmail}. Vui lòng kiểm tra hộp thư.`
      });
    } catch (err) {
      console.error('❌ [Auth Forgot Password Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xử lý yêu cầu quên mật khẩu.' });
    }
  },

  /**
   * POST /api/auth/verify-reset-otp - Kiểm tra tính hợp lệ của mã OTP
   */
  async verifyResetOtp(req, res) {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mã OTP!' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const verifyResult = await otpService.verifyOtp(cleanEmail, otpCode);

      if (!verifyResult.valid) {
        return res.status(400).json({
          success: false,
          message: verifyResult.message
        });
      }

      return res.json({
        success: true,
        message: 'Mã OTP chính xác. Bạn có thể đặt mật khẩu mới.'
      });
    } catch (err) {
      console.error('❌ [Auth Verify OTP Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xác thực mã OTP.' });
    }
  },

  /**
   * POST /api/auth/reset-password - Cập nhật mật khẩu mới sau khi xác thực OTP thành công
   */
  async resetPassword(req, res) {
    try {
      const { email, otpCode, newPassword } = req.body;
      if (!email || !otpCode || !newPassword) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đặt lại mật khẩu.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const verifyResult = await otpService.verifyOtp(cleanEmail, otpCode);

      if (!verifyResult.valid) {
        return res.status(400).json({
          success: false,
          message: verifyResult.message
        });
      }

      // Mã hóa mật khẩu mới bằng bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const db = getDB();
      const user = await db.getUserByEmail(cleanEmail);
      if (user) {
        await db.updatePasswordByEmail(cleanEmail, hashedPassword);
      } else {
        const fallbackName = cleanEmail.split('@')[0] || 'Dev Member';
        await db.createUser({
          email: cleanEmail,
          passwordHash: hashedPassword,
          displayName: fallbackName,
          avatarId: 'dev_hoodie',
          role: 'dev'
        });
      }

      // Xóa OTP sau khi đổi mật khẩu thành công trong Database
      await otpService.deleteOtp(cleanEmail);
      
      console.log(`🔑 [Auth] Đổi mật khẩu thành công bằng OTP cho: ${cleanEmail}`);

      return res.json({
        success: true,
        message: 'Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.'
      });
    } catch (err) {
      console.error('❌ [Auth Reset Password Error]:', err.stack || err.message);
      return res.status(500).json({ success: false, message: `Lỗi đặt lại mật khẩu: ${err.message || 'Lỗi hệ thống'}` });
    }
  },

  /**
   * GET /api/auth/me - Lấy thông tin tài khoản hiện tại từ JWT Token
   */
  getMe(req, res) {
    return res.json({
      success: true,
      user: req.user
    });
  },

  /**
   * PUT /api/auth/profile - Cập nhật thông tin hồ sơ (Tên hiển thị, Avatar)
   */
  async updateProfile(req, res) {
    try {
      const { displayName, avatarId } = req.body;
      const db = getDB();

      const updated = await db.updateUser(req.user.id, {
        displayName,
        avatarId
      });

      const safeUser = sanitizeUser(updated);

      return res.json({
        success: true,
        message: 'Cập nhật hồ sơ thành công!',
        user: safeUser
      });
    } catch (err) {
      console.error('❌ [Auth Profile Update Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
    }
  },

  /**
   * PUT /api/auth/change-password - Đổi mật khẩu trong game (Yêu cầu mật khẩu cũ)
   */
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      }

      const db = getDB();
      const user = await db.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản.' });
      }

      // Xác thực mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.updatePasswordByEmail(user.email, hashedPassword);

      console.log(`🔑 [Auth] Người dùng ${user.email} đã đổi mật khẩu thành công trong game.`);

      return res.json({
        success: true,
        message: 'Đổi mật khẩu thành công.'
      });
    } catch (err) {
      console.error('❌ [Auth Change Password Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xử lý đổi mật khẩu.' });
    }
  },

  /**
   * PUT /api/auth/sync-profile - Đồng bộ toàn diện dữ liệu nhân vật, trang phục, túi đồ, nhiệm vụ & kỷ lục vào DB
   */
  async syncProfile(req, res) {
    try {
      const {
        wardrobeConfig,
        inventoryItems,
        equippedItemId,
        deverPoints,
        questsState,
        questDate,
        questMilestone,
        gameRecords
      } = req.body;
      const db = getDB();

      const updated = await db.syncFullUserProfile(req.user.id, {
        wardrobeConfig,
        inventoryItems,
        equippedItemId,
        deverPoints,
        questsState,
        questDate,
        questMilestone,
        gameRecords
      });

      const safeUser = sanitizeUser(updated);

      return res.json({
        success: true,
        message: 'Đồng bộ hồ sơ, trang phục, vật phẩm và kỷ lục thành công!',
        user: safeUser
      });
    } catch (err) {
      console.error('❌ [Auth Sync Profile Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
    }
  },

  /**
   * PUT /api/auth/customization - Lưu cấu hình Wardrobe & Equipped Item vào DB
   */
  async updateCustomization(req, res) {
    try {
      const { wardrobeConfig, equippedItemId, deverPoints } = req.body;
      const db = getDB();

      const updated = await db.updateCustomization(req.user.id, {
        wardrobeConfig,
        equippedItemId,
        deverPoints
      });

      const safeUser = sanitizeUser(updated);

      return res.json({
        success: true,
        message: 'Lưu trạng thái cá nhân hóa & điểm thưởng thành công!',
        user: safeUser
      });
    } catch (err) {
      console.error('❌ [Auth Customization Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
    }
  },

  /**
   * GET /api/auth/check-name - Kiểm tra tên hiển thị / biệt danh có bị trùng hoặc cấm không
   */
  async checkName(req, res) {
    try {
      const rawName = String(req.query.name || '').trim();
      if (!rawName) {
        return res.status(400).json({ success: false, available: false, message: 'Tên không được để trống!' });
      }

      const cleanLower = rawName.toLowerCase();
      const RESERVED_PREFIXES = ['admin', 'bqt', 'leader', 'moderator', 'system', 'root', 'bot', 'fu-dever', 'dever_admin'];
      const isReserved = RESERVED_PREFIXES.some(r => cleanLower === r || cleanLower.startsWith(`${r} `) || cleanLower.startsWith(`[${r}]`));

      if (isReserved) {
        return res.json({
          success: true,
          available: false,
          message: `Biệt danh "${rawName}" chứa từ khóa bảo vệ hệ thống. Vui lòng chọn biệt danh khác!`
        });
      }

      const db = getDB();
      const existing = await db.getUserByDisplayName(rawName);
      if (existing) {
        return res.json({
          success: true,
          available: false,
          message: `Biệt danh "${rawName}" đã thuộc về tài khoản đã đăng ký. Vui lòng đăng nhập hoặc chọn tên khác!`
        });
      }

      return res.json({
        success: true,
        available: true,
        message: 'Biệt danh hợp lệ!'
      });
    } catch (err) {
      return res.status(500).json({ success: false, available: false, message: 'Lỗi kiểm tra tên!' });
    }
  },

  /**
   * GET /api/auth/test-mail - Kiểm tra trạng thái kết nối Resend và gửi email thử nghiệm
   */
  async testMail(req, res) {
    try {
      const email = req.query.email || 'hungnguyen.190206@gmail.com';
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hasApiKey = !!(process.env.RESEND_API_KEY || process.env.RESEND_KEY);

      const result = await mailService.sendPasswordResetOtp(email, {
        otpCode,
        displayName: 'Test Resend User',
        expiresInMinutes: 10
      });

      return res.json({
        success: true,
        message: 'Đã thực thi kiểm thử gửi mail!',
        hasApiKey,
        targetEmail: email,
        result
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
