import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
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
router.post('/register', authLimiter, sanitizeInput, authController.register);

/**
 * POST /api/auth/login - Đăng nhập tài khoản
 */
router.post('/login', authLimiter, sanitizeInput, authController.login);

/**
 * GET /api/auth/me - Lấy thông tin tài khoản hiện tại từ JWT Token
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * PUT /api/auth/profile - Cập nhật thông tin hồ sơ (Tên hiển thị, Avatar)
 */
router.put('/profile', authenticateToken, sanitizeInput, authController.updateProfile);

/**
 * PUT /api/auth/sync-profile - Đồng bộ toàn diện dữ liệu nhân vật, trang phục, túi đồ, nhiệm vụ & kỷ lục vào DB
 */
router.put('/sync-profile', authenticateToken, authController.syncProfile);

/**
 * PUT /api/auth/customization - Lưu cấu hình Wardrobe & Equipped Item vào DB
 */
router.put('/customization', authenticateToken, authController.updateCustomization);

/**
 * GET /api/auth/check-name - Kiểm tra tên hiển thị / biệt danh có bị trùng hoặc cấm không
 */
router.get('/check-name', authController.checkName);

export default router;
