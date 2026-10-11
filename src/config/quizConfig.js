/**
 * src/config/quizConfig.js
 * Phase 1c: Hằng số cân bằng cho Quiz Engine multiplayer.
 * Mọi thông số thời gian/điểm số nằm ở đây, không hardcode trong engine.
 */

export const QUIZ_CONFIG = {
  // Thời gian (giây)
  countdownSeconds: 3,       // đếm ngược trước khi bắt đầu
  questionSeconds: 15,       // thời gian trả lời mỗi câu
  revealSeconds: 4,          // hiện đáp án đúng + điểm
  leaderboardSeconds: 5,     // bảng xếp hạng giữa các câu (mỗi 5 câu)
  maxQuestions: 10,          // số câu mỗi trận
  minPlayers: 2,             // số người tối thiểu để host bắt đầu
  maxPlayers: 20,            // số người tối đa mỗi phòng quiz

  // Điểm số
  basePoints: 100,           // điểm cơ bản cho câu đúng
  maxSpeedBonus: 100,        // thưởng tốc độ tối đa (trả lời càng nhanh càng cao)
  comboStep: 0.25,           // mỗi combo đúng liên tiếp +25% (cap bên dưới)
  maxComboMultiplier: 3,     // combo tối đa x3

  // FSM states
  states: {
    IDLE: 'idle',
    LOBBY: 'lobby',
    COUNTDOWN: 'countdown',
    QUESTION: 'question',
    REVEAL: 'reveal',
    LEADERBOARD: 'leaderboard',
    FINISHED: 'finished',
  },
};

/**
 * Tính điểm cho một câu trả lời đúng.
 * @param {number} answerTimeMs - thời gian trả lời (ms từ lúc hiện câu hỏi)
 * @param {number} questionTimeMs - tổng thời gian cho phép (ms)
 * @param {number} combo - số câu đúng liên tiếp trước câu này
 * @returns {number} điểm (làm tròn)
 */
export function computeQuizScore(answerTimeMs, questionTimeMs, combo) {
  const speedRatio = Math.max(0, 1 - answerTimeMs / questionTimeMs);
  const speedBonus = Math.round(QUIZ_CONFIG.maxSpeedBonus * speedRatio);
  const multiplier = Math.min(
    1 + combo * QUIZ_CONFIG.comboStep,
    QUIZ_CONFIG.maxComboMultiplier
  );
  return Math.round((QUIZ_CONFIG.basePoints + speedBonus) * multiplier);
}
