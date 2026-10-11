/**
 * src/minigames/QuizEngine.js
 * Phase 1c: Client-side Quiz Engine multiplayer.
 *
 * FSM tường minh (theo AGENTS.md):
 *   IDLE -> LOBBY -> COUNTDOWN -> QUESTION -> REVEAL
 *        -> LEADERBOARD -> QUESTION ... -> FINISHED -> IDLE
 *
 * Engine chỉ quản lý state + socket; UI render qua callbacks onStateChange/onEvent.
 */
import { QUIZ_CONFIG } from '../config/quizConfig.js';

const S = QUIZ_CONFIG.states;

const TRANSITIONS = {
  [S.IDLE]: [S.LOBBY],
  [S.LOBBY]: [S.COUNTDOWN, S.IDLE],
  [S.COUNTDOWN]: [S.QUESTION, S.IDLE],
  [S.QUESTION]: [S.REVEAL, S.IDLE],
  [S.REVEAL]: [S.QUESTION, S.LEADERBOARD, S.FINISHED, S.IDLE],
  [S.LEADERBOARD]: [S.QUESTION, S.IDLE],
  [S.FINISHED]: [S.IDLE, S.LOBBY],
};

export class QuizEngine {
  constructor({ socket }) {
    this.socket = socket;
    this.state = S.IDLE;
    this.quizId = null;
    this.isHost = false;
    this.players = [];
    this.hostId = null;
    this.currentQuestion = null; // { index, total, question, options, hint, endsAt }
    this.lastReveal = null;      // { index, correctIndex, scores }
    this.leaderboard = [];
    this.finalResult = null;
    this.myAnswer = null;        // optionIndex đã chọn
    this.onStateChange = null;   // (state, data) => void
    this.onEvent = null;         // (eventName, data) => void
    this._bound = false;
  }

  /** Chuyển state có kiểm tra transition hợp lệ */
  _setState(next, data = {}) {
    const allowed = TRANSITIONS[this.state] || [];
    if (!allowed.includes(next)) {
      console.warn(`[QuizEngine] Transition không hợp lệ: ${this.state} -> ${next}`);
      return false;
    }
    this.state = next;
    if (this.onStateChange) this.onStateChange(next, data);
    return true;
  }

  _emit(event, data) {
    if (this.onEvent) this.onEvent(event, data);
  }

  /**
   * Kiểm tra socket có kết nối trước khi gửi sự kiện.
   * Nếu mất kết nối: hiện toast lỗi qua kênh 'error' (modal đã xử lý)
   * và trả về false để caller return sớm, tránh emit bị socket.io buffer ngầm.
   */
  _socketUsable(action) {
    if (this.socket && this.socket.connected) return true;
    this._emit('error', {
      message: action === 'create'
        ? 'Chưa kết nối máy chủ, không thể tạo phòng. Vui lòng thử lại sau.'
        : 'Chưa kết nối máy chủ, không thể tham gia phòng. Vui lòng thử lại sau.',
    });
    return false;
  }

  _bindSocket() {
    if (this._bound || !this.socket) return;
    this._bound = true;
    const s = this.socket;

    s.on('quiz:created', ({ quizId }) => {
      this.quizId = quizId;
      this.isHost = true;
      this._setState(S.LOBBY, { quizId });
    });

    s.on('quiz:lobby', ({ players, hostId }) => {
      this.players = players;
      this.hostId = hostId;
      this.isHost = hostId === s.id;
      if (this.state === S.IDLE) this._setState(S.LOBBY, {});
      else this._emit('lobby_update', { players, hostId });
    });

    // Dedicated joined response: guest learns its quizId reliably
    s.on('quiz:joined', ({ quizId }) => {
      this.quizId = quizId;
      if (this.state === S.IDLE) this._setState(S.LOBBY, { quizId });
    });

    s.on('quiz:countdown', ({ seconds }) => {
      this._setState(S.COUNTDOWN, { seconds });
    });

    s.on('quiz:question', (q) => {
      this.currentQuestion = q;
      this.myAnswer = null;
      this._setState(S.QUESTION, q);
    });

    s.on('quiz:answer_result', (res) => {
      this._emit('answer_result', res);
    });

    s.on('quiz:reveal', (reveal) => {
      this.lastReveal = reveal;
      this._setState(S.REVEAL, reveal);
    });

    s.on('quiz:leaderboard', ({ scores }) => {
      this.leaderboard = scores;
      this._setState(S.LEADERBOARD, { scores });
    });

    s.on('quiz:finished', (result) => {
      this.finalResult = result;
      this._setState(S.FINISHED, result);
    });

    s.on('quiz:error', ({ message }) => {
      this._emit('error', { message });
    });
  }

  // ---- Actions (client -> server) ----

  create({ roomId, questionCount = 10, category = 'mixed' } = {}) {
    if (!this._socketUsable('create')) return;
    this._bindSocket();
    this.reset();
    this.socket.emit('quiz:create', { roomId, questionCount, category });
  }

  join(quizId) {
    if (!this._socketUsable('join')) return;
    this._bindSocket();
    this.reset();
    this.socket.emit('quiz:join', { quizId });
  }

  start() {
    if (!this.isHost || this.state !== S.LOBBY) return;
    this.socket.emit('quiz:start');
  }

  answer(optionIndex) {
    if (this.state !== S.QUESTION || this.myAnswer !== null) return;
    if (!this.currentQuestion) return;
    this.myAnswer = optionIndex;
    this.socket.emit('quiz:answer', {
      questionIndex: this.currentQuestion.index,
      optionIndex,
    });
    this._emit('answered', { optionIndex });
  }

  leave() {
    if (this.socket && this.quizId) {
      this.socket.emit('quiz:leave');
    }
    this.reset();
  }

  reset() {
    this.state = S.IDLE;
    this.quizId = null;
    this.isHost = false;
    this.players = [];
    this.hostId = null;
    this.currentQuestion = null;
    this.lastReveal = null;
    this.leaderboard = [];
    this.finalResult = null;
    this.myAnswer = null;
    if (this.onStateChange) this.onStateChange(S.IDLE, {});
  }
}
