import express from 'express';
import { gameController } from '../controllers/gameController.js';
import { createRateLimiter, sanitizeInput } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiter chống spam gửi điểm (tối đa 30 lần / phút)
const scoreLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Bạn đang gửi điểm số quá nhanh. Vui lòng chậm lại một chút!'
});

/**
 * POST /api/game/score - Lưu điểm số và streak minigame (Có Rate Limit & Kiểm tra hợp lệ)
 */
router.post('/score', scoreLimiter, sanitizeInput, gameController.saveScore);

/**
 * GET /api/game/leaderboard/:gameType - Lấy bảng xếp hạng top người chơi
 */
router.get('/leaderboard/:gameType', gameController.getLeaderboard);

export default router;
