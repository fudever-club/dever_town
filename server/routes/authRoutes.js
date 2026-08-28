import express from 'express';
import bcrypt from 'bcryptjs';
import { getDB } from '../db/index.js';
import { generateToken, sanitizeUser, authenticateToken } from '../middleware/authMiddleware.js';
import { createRateLimiter, sanitizeInput } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiter chống brute-force mật khẩu (30 lần / 15 phút)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Bạn đã thử đăng ký / đăng nhập quá nhiều lần. Vui lòng đợi 15 phút trước khi thử lại!'
});

/**
 * POST /api/auth/register - Đăng ký tài khoản mới
 */
router.post('/register', authLimiter, sanitizeInput, async (req, res) => {
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

    // Băm mật khẩu bất đồng bộ
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
});

/**
 * POST /api/auth/login - Đăng nhập tài khoản
 */
router.post('/login', authLimiter, sanitizeInput, async (req, res) => {
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

    // So khớp mật khẩu đã băm
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
});

/**
 * GET /api/auth/me - Lấy thông tin tài khoản hiện tại từ JWT Token
 */
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

/**
 * PUT /api/auth/profile - Cập nhật thông tin hồ sơ (Tên hiển thị, Avatar)
 */
router.put('/profile', authenticateToken, sanitizeInput, async (req, res) => {
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
});

/**
 * PUT /api/auth/sync-profile - Đồng bộ toàn diện dữ liệu nhân vật, trang phục, túi đồ, nhiệm vụ & kỷ lục vào DB
 */
router.put('/sync-profile', authenticateToken, async (req, res) => {
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
});

/**
 * PUT /api/auth/customization - Lưu cấu hình Wardrobe & Equipped Item vào DB gắn với User ID (Mục 1.3 Add-on v3)
 */
router.put('/customization', authenticateToken, async (req, res) => {
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
});

/**
 * GET /api/auth/check-name - Kiểm tra tên hiển thị / biệt danh có bị trùng hoặc cấm không
 */
router.get('/check-name', async (req, res) => {
  try {
    const rawName = String(req.query.name || '').trim();
    if (!rawName) {
      return res.status(400).json({ success: false, available: false, message: 'Tên không được để trống!' });
    }

    const cleanLower = rawName.toLowerCase();

    // 1. Kiểm tra các từ khóa hệ thống / ban quản trị cấm khách sử dụng
    const RESERVED_PREFIXES = ['admin', 'bqt', 'leader', 'moderator', 'system', 'root', 'bot', 'fu-dever', 'dever_admin'];
    const isReserved = RESERVED_PREFIXES.some(r => cleanLower === r || cleanLower.startsWith(`${r} `) || cleanLower.startsWith(`[${r}]`));

    if (isReserved) {
      return res.json({
        success: true,
        available: false,
        message: `Biệt danh "${rawName}" chứa từ khóa bảo vệ hệ thống. Vui lòng chọn biệt danh khác!`
      });
    }

    // 2. Kiểm tra xem tên có trùng với thành viên / Admin đã đăng ký trong cơ sở dữ liệu không
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
});

export default router;
