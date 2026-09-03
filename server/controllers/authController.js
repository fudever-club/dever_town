import bcrypt from 'bcryptjs';
import { getDB } from '../db/index.js';
import { generateToken, sanitizeUser } from '../middleware/authMiddleware.js';
import { mailService } from '../services/mailService.js';

// Bộ nhớ tạm lưu trữ mã OTP khôi phục mật khẩu (TTL 10 phút)
const resetOtpStore = new Map();

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
        displayName,
        avatarId: chosenAvatar,
        role: 'dev'
      });

      const safeUser = sanitizeUser(newUser);
      const token = generateToken(newUser);

      console.log(`🎉 [Auth] Đăng ký thành công tài khoản: ${safeUser.email} (${safeUser.display_name})`);

      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        token,
        user: safeUser
      });
    } catch (err) {
      console.error('❌ [Auth Register Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
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
          message: 'Vui lòng điền đầy đủ email và mật khẩu!'
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

      const safeUser = sanitizeUser(user);
      const token = generateToken(user);

      console.log(`🔐 [Auth] Đăng nhập thành công: ${safeUser.email} [${safeUser.role}]`);

      return res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user: safeUser
      });
    } catch (err) {
      console.error('❌ [Auth Login Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
    }
  },

  /**
   * POST /api/auth/forgot-password - Yêu cầu gửi mã OTP đặt lại mật khẩu về Email
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email đã đăng ký!' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const db = getDB();
      const user = await db.getUserByEmail(cleanEmail);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy tài khoản nào gắn với email "${cleanEmail}". Vui lòng kiểm tra lại!`
        });
      }

      // Tạo mã OTP 6 số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresInMinutes = 10;
      const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

      // Lưu mã OTP vào bộ nhớ tạm
      resetOtpStore.set(cleanEmail, {
        otp: otpCode,
        expiresAt,
        attempts: 0
      });

      // Gửi email chứa mã OTP
      const mailResult = await mailService.sendPasswordResetOtp(cleanEmail, {
        otpCode,
        displayName: user.display_name,
        expiresInMinutes
      });

      return res.json({
        success: true,
        message: mailResult.realEmailSent
          ? `Mã xác thực OTP gồm 6 chữ số đã được gửi tới ${cleanEmail}. Vui lòng kiểm tra hộp thư!`
          : `Mã OTP đã được gửi! (Dev Mode: Mã OTP của bạn là [${otpCode}])`,
        devOtp: mailResult.realEmailSent ? undefined : otpCode
      });
    } catch (err) {
      console.error('❌ [Auth Forgot Password Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xử lý yêu cầu quên mật khẩu!' });
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
      const record = resetOtpStore.get(cleanEmail);

      if (!record) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy yêu cầu đặt lại mật khẩu hoặc mã OTP đã hết hạn!'
        });
      }

      if (Date.now() > record.expiresAt) {
        resetOtpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          message: 'Mã OTP đã hết hiệu lực. Vui lòng bấm "Gửi lại mã"!'
        });
      }

      if (record.otp !== String(otpCode).trim()) {
        record.attempts = (record.attempts || 0) + 1;
        if (record.attempts >= 5) {
          resetOtpStore.delete(cleanEmail);
          return res.status(400).json({
            success: false,
            message: 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới!'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Mã OTP không chính xác! (Còn ${5 - record.attempts} lần thử)`
        });
      }

      return res.json({
        success: true,
        message: 'Mã OTP chính xác! Bạn có thể đặt mật khẩu mới.'
      });
    } catch (err) {
      console.error('❌ [Auth Verify OTP Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi xác thực mã OTP!' });
    }
  },

  /**
   * POST /api/auth/reset-password - Đổi mật khẩu mới bằng mã OTP
   */
  async resetPassword(req, res) {
    try {
      const { email, otpCode, newPassword } = req.body;

      if (!email || !otpCode || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ email, mã OTP và mật khẩu mới!'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!'
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      const record = resetOtpStore.get(cleanEmail);

      if (!record || record.otp !== String(otpCode).trim() || Date.now() > record.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại!'
        });
      }

      const db = getDB();
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const updated = await db.updatePasswordByEmail(cleanEmail, passwordHash);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Không thể cập nhật mật khẩu cho tài khoản này!'
        });
      }

      // Xóa mã OTP sau khi đổi mật khẩu thành công
      resetOtpStore.delete(cleanEmail);

      console.log(`🔑 [Auth] Đổi mật khẩu thành công bằng OTP cho: ${cleanEmail}`);

      return res.json({
        success: true,
        message: '🎉 Đặt lại mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.'
      });
    } catch (err) {
      console.error('❌ [Auth Reset Password Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi đặt lại mật khẩu!' });
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
