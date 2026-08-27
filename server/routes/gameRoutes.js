import express from 'express';
import { getDB } from '../db/index.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/game/score - Lưu điểm số và streak minigame
 */
router.post('/score', async (req, res) => {
  try {
    const { gameType, score, streak, playerName, userId } = req.body;

    if (!gameType || (!score && score !== 0)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu minigame không hợp lệ!' });
    }

    const effectiveUserId = userId || (req.user ? req.user.id : `guest_${Date.now()}`);
    const effectiveName = playerName || (req.user ? req.user.display_name : 'Khách FUDA');

    const db = getDB();
    const result = await db.saveGameScore(effectiveUserId, {
      gameType,
      score: Number(score),
      streak: Number(streak || 0),
      playerName: effectiveName
    });

    const leaderboard = await db.getLeaderboard(gameType, 5);

    return res.json({
      success: true,
      message: 'Cập nhật thành tích thành công!',
      record: result,
      leaderboard
    });
  } catch (err) {
    console.error('❌ [Game Score Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
  }
});

/**
 * GET /api/game/leaderboard/:gameType - Lấy bảng xếp hạng top người chơi
 */
router.get('/leaderboard/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params;
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const db = getDB();
    const leaderboard = await db.getLeaderboard(gameType, limit);

    return res.json({
      success: true,
      gameType,
      leaderboard
    });
  } catch (err) {
    console.error('❌ [Game Leaderboard Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
  }
});

export default router;
