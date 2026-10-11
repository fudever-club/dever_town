/**
 * server/socket/quizHandler.js
 * Phase 1c: Quiz Engine multiplayer — quản lý phòng quiz phía server.
 *
 * FSM server: lobby -> countdown -> question -> reveal -> (question...)
 *           -> leaderboard (mỗi 5 câu) -> finished
 *
 * Events client -> server:
 *   quiz:create { roomId, questionCount, category } -> { quizId }
 *   quiz:join { quizId } -> { success, quizId, players }
 *   quiz:start {} (host only)
 *   quiz:answer { questionIndex, optionIndex }
 *   quiz:leave {}
 *
 * Events server -> client:
 *   quiz:created { quizId }
 *   quiz:lobby { players: [{socketId, name}], hostId }
 *   quiz:countdown { seconds }
 *   quiz:question { index, total, question, options, endsAt }
 *   quiz:reveal { index, correctIndex, scores: [{socketId, name, score, combo}] }
 *   quiz:leaderboard { scores }
 *   quiz:finished { scores, winner }
 *   quiz:error { message }
 */

import { QUIZ_QUESTIONS } from '../../src/config/quizQuestions.js';
import { QUIZ_CONFIG, computeQuizScore } from '../../src/config/quizConfig.js';

const STATES = QUIZ_CONFIG.states;

// quizId -> session
const quizSessions = new Map();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(count, category) {
  let pool = QUIZ_QUESTIONS;
  if (category && category !== 'mixed') {
    pool = QUIZ_QUESTIONS.filter(q => q.category === category);
  }
  if (pool.length === 0) pool = QUIZ_QUESTIONS;
  return shuffle(pool).slice(0, Math.min(count, pool.length, QUIZ_CONFIG.maxQuestions));
}

function publicScores(session) {
  return [...session.players.values()]
    .map(p => ({ socketId: p.socketId, name: p.name, score: p.score, combo: p.combo, correct: p.correctCount }))
    .sort((a, b) => b.score - a.score);
}

function emitToQuiz(io, session, event, data) {
  for (const p of session.players.values()) {
    io.to(p.socketId).emit(event, data);
  }
}

function clearSessionTimer(session) {
  if (session.timer) {
    clearTimeout(session.timer);
    session.timer = null;
  }
}

function startQuestion(io, session) {
  session.state = STATES.QUESTION;
  session.questionIndex++;
  session.questionStartAt = Date.now();
  session.answers.clear();

  const q = session.questions[session.questionIndex];
  const questionTimeMs = QUIZ_CONFIG.questionSeconds * 1000;

  emitToQuiz(io, session, 'quiz:question', {
    index: session.questionIndex,
    total: session.questions.length,
    question: q.question,
    options: q.options,
    hint: q.hint,
    endsAt: Date.now() + questionTimeMs,
  });

  session.timer = setTimeout(() => revealQuestion(io, session), questionTimeMs);
}

function revealQuestion(io, session) {
  clearSessionTimer(session);
  session.state = STATES.REVEAL;

  const q = session.questions[session.questionIndex];
  emitToQuiz(io, session, 'quiz:reveal', {
    index: session.questionIndex,
    correctIndex: q.correct,
    scores: publicScores(session),
  });

  const isLast = session.questionIndex >= session.questions.length - 1;
  const showBoard = (session.questionIndex + 1) % 5 === 0 && !isLast;

  session.timer = setTimeout(() => {
    if (isLast) {
      finishQuiz(io, session);
    } else if (showBoard) {
      session.state = STATES.LEADERBOARD;
      emitToQuiz(io, session, 'quiz:leaderboard', { scores: publicScores(session) });
      session.timer = setTimeout(() => startQuestion(io, session), QUIZ_CONFIG.leaderboardSeconds * 1000);
    } else {
      startQuestion(io, session);
    }
  }, QUIZ_CONFIG.revealSeconds * 1000);
}

function finishQuiz(io, session) {
  clearSessionTimer(session);
  session.state = STATES.FINISHED;
  const scores = publicScores(session);
  emitToQuiz(io, session, 'quiz:finished', {
    scores,
    winner: scores[0] || null,
  });
  // Giữ session 60s cho client xem kết quả rồi dọn
  session.timer = setTimeout(() => {
    quizSessions.delete(session.quizId);
  }, 60000);
}

function removePlayerFromQuiz(io, socket) {
  const quizId = socket._currentQuizId;
  if (!quizId) return;
  const session = quizSessions.get(quizId);
  socket._currentQuizId = null;
  if (!session) return;

  session.players.delete(socket.id);
  if (session.players.size === 0) {
    clearSessionTimer(session);
    quizSessions.delete(quizId);
    return;
  }
  // Chuyển host nếu host rời
  if (session.hostId === socket.id) {
    session.hostId = [...session.players.keys()][0];
  }
  emitToQuiz(io, session, 'quiz:lobby', {
    players: [...session.players.values()].map(p => ({ socketId: p.socketId, name: p.name })),
    hostId: session.hostId,
  });
}

export function setupQuizHandler(io, socket) {
  /**
   * Tạo phòng quiz mới (người tạo = host)
   */
  socket.on('quiz:create', ({ roomId, questionCount = 10, category = 'mixed' } = {}) => {
    try {
      removePlayerFromQuiz(io, socket);

      const quizId = `quiz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const questions = pickQuestions(questionCount, category);
      if (questions.length === 0) {
        socket.emit('quiz:error', { message: 'Không có câu hỏi khả dụng.' });
        return;
      }

      const name = socket.authUser?.displayName || `Guest_${socket.id.slice(0, 5)}`;
      const session = {
        quizId,
        roomId: roomId || 'main_hall',
        hostId: socket.id,
        state: STATES.LOBBY,
        players: new Map(),
        questions,
        questionIndex: -1,
        questionStartAt: 0,
        answers: new Map(), // socketId -> { optionIndex, at }
        timer: null,
      };
      session.players.set(socket.id, {
        socketId: socket.id, name, score: 0, combo: 0, correctCount: 0,
      });
      quizSessions.set(quizId, session);
      socket._currentQuizId = quizId;

      socket.emit('quiz:created', { quizId });
      emitToQuiz(io, session, 'quiz:lobby', {
        players: [{ socketId: socket.id, name }],
        hostId: session.hostId,
      });
    } catch (err) {
      socket.emit('quiz:error', { message: 'Không tạo được phòng quiz.' });
    }
  });

  /**
   * Tham gia phòng quiz
   */
  socket.on('quiz:join', ({ quizId } = {}) => {
    const session = quizSessions.get(quizId);
    if (!session) {
      socket.emit('quiz:error', { message: 'Phòng quiz không tồn tại.' });
      return;
    }
    if (session.state !== STATES.LOBBY) {
      socket.emit('quiz:error', { message: 'Trận quiz đã bắt đầu.' });
      return;
    }
    if (session.players.size >= QUIZ_CONFIG.maxPlayers) {
      socket.emit('quiz:error', { message: 'Phòng quiz đã đầy.' });
      return;
    }
    removePlayerFromQuiz(io, socket);
    const name = socket.authUser?.displayName || `Guest_${socket.id.slice(0, 5)}`;
    session.players.set(socket.id, {
      socketId: socket.id, name, score: 0, combo: 0, correctCount: 0,
    });
    socket._currentQuizId = quizId;
    // Dedicated joined response carrying the ID (guest client sets engine.quizId from this)
    socket.emit('quiz:joined', { quizId });
    emitToQuiz(io, session, 'quiz:lobby', {
      players: [...session.players.values()].map(p => ({ socketId: p.socketId, name: p.name })),
      hostId: session.hostId,
    });
  });

  /**
   * Host bắt đầu trận
   */
  socket.on('quiz:start', () => {
    const session = quizSessions.get(socket._currentQuizId);
    if (!session || session.hostId !== socket.id) {
      socket.emit('quiz:error', { message: 'Chỉ host mới bắt đầu được.' });
      return;
    }
    if (session.state !== STATES.LOBBY) return;
    if (session.players.size < QUIZ_CONFIG.minPlayers) {
      socket.emit('quiz:error', { message: `Cần ít nhất ${QUIZ_CONFIG.minPlayers} người chơi.` });
      return;
    }
    session.state = STATES.COUNTDOWN;
    emitToQuiz(io, session, 'quiz:countdown', { seconds: QUIZ_CONFIG.countdownSeconds });
    session.timer = setTimeout(() => startQuestion(io, session), QUIZ_CONFIG.countdownSeconds * 1000);
  });

  /**
   * Trả lời câu hỏi
   */
  socket.on('quiz:answer', ({ questionIndex, optionIndex } = {}) => {
    const session = quizSessions.get(socket._currentQuizId);
    if (!session || session.state !== STATES.QUESTION) return;
    if (questionIndex !== session.questionIndex) return;
    if (session.answers.has(socket.id)) return; // mỗi người 1 đáp án

    const player = session.players.get(socket.id);
    if (!player) return;

    const q = session.questions[session.questionIndex];
    const answerTimeMs = Date.now() - session.questionStartAt;
    session.answers.set(socket.id, { optionIndex, at: Date.now() });

    if (optionIndex === q.correct) {
      const gained = computeQuizScore(answerTimeMs, QUIZ_CONFIG.questionSeconds * 1000, player.combo);
      player.score += gained;
      player.combo += 1;
      player.correctCount += 1;
      socket.emit('quiz:answer_result', { correct: true, gained, combo: player.combo });
    } else {
      player.combo = 0;
      socket.emit('quiz:answer_result', { correct: false, gained: 0, combo: 0 });
    }
  });

  /**
   * Rời phòng quiz
   */
  socket.on('quiz:leave', () => {
    removePlayerFromQuiz(io, socket);
  });

  socket.on('disconnect', () => {
    removePlayerFromQuiz(io, socket);
  });

  return { removePlayerFromQuiz: () => removePlayerFromQuiz(io, socket) };
}
