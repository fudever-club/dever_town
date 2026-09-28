import { getDB } from '../db/index.js';
import { sanitizeUser, JWT_SECRET } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const VALID_GAME_TYPES = new Set([
  'football', 'basketball', 'volleyball', 'barista',
  'snake', 'sokoban', 'goldminer', 'code_duel'
]);

export const gameController = {
  /**
   * POST /api/game/score - Lưu điểm số và streak minigame
   */
  async saveScore(req, res) {
    try {
      const { gameType, score, streak, playerName, userId } = req.body;

      if (!gameType || !VALID_GAME_TYPES.has(gameType)) {
        return res.status(400).json({ success: false, message: 'Loại trò chơi không hợp lệ!' });
      }

      const numScore = Number(score);
      if (isNaN(numScore) || numScore < 0 || numScore > 500000) {
        return res.status(400).json({ success: false, message: 'Điểm số không hợp lệ (Phải từ 0 đến 500,000)!' });
      }

      const numStreak = Number(streak || 0);
      if (isNaN(numStreak) || numStreak < 0 || numStreak > 1000) {
        return res.status(400).json({ success: false, message: 'Chuỗi thành tích không hợp lệ!' });
      }

      // Tự động kiểm tra Token xác thực nếu có gửi kèm Header
      let authenticatedUser = null;
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, JWT_SECRET);
          const db = getDB();
          const found = await db.getUserById(decoded.id);
          if (found) authenticatedUser = sanitizeUser(found);
        } catch (e) {}
      }

      const effectiveUserId = authenticatedUser ? authenticatedUser.id : (userId || `guest_${Date.now()}`);
      const effectiveName = authenticatedUser
        ? authenticatedUser.display_name
        : Array.from(String(playerName || 'Khách FUDA').normalize('NFC').trim()).slice(0, 40).join('');

      const db = getDB();
      const result = await db.saveGameScore(effectiveUserId, {
        gameType,
        score: numScore,
        streak: numStreak,
        playerName: effectiveName
      });

      const sanitizeEntry = (entry) => {
        if (!entry) return null;
        return {
          playerName: entry.player_name || entry.playerName || 'Thành viên',
          highScore: entry.high_score || entry.highScore || 0,
          bestStreak: entry.best_streak || entry.bestStreak || 0,
          lastPlayed: entry.last_played || entry.lastPlayed || null
        };
      };

      const leaderboard = await db.getLeaderboard(gameType, 5);

      return res.json({
        success: true,
        message: 'Cập nhật thành tích thành công!',
        record: sanitizeEntry(result),
        leaderboard: (leaderboard || []).map(sanitizeEntry)
      });
    } catch (err) {
      console.error('❌ [Game Score Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
    }
  },

  /**
   * GET /api/game/leaderboard/:gameType - Lấy bảng xếp hạng top người chơi
   */
  async getLeaderboard(req, res) {
    try {
      const { gameType } = req.params;
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

      const db = getDB();
      const leaderboard = await db.getLeaderboard(gameType, limit);

      const sanitizeEntry = (entry) => {
        if (!entry) return null;
        return {
          playerName: entry.player_name || entry.playerName || 'Thành viên',
          highScore: entry.high_score || entry.highScore || 0,
          bestStreak: entry.best_streak || entry.bestStreak || 0,
          lastPlayed: entry.last_played || entry.lastPlayed || null
        };
      };

      return res.json({
        success: true,
        gameType,
        leaderboard: (leaderboard || []).map(sanitizeEntry)
      });
    } catch (err) {
      console.error('❌ [Game Leaderboard Error]:', err);
      return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ!' });
    }
  }
};
