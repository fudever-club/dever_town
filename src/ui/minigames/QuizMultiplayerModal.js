/**
 * src/ui/minigames/QuizMultiplayerModal.js
 * Phase 1c: UI cho Quiz multiplayer — lobby, câu hỏi, reveal, leaderboard, kết quả.
 * Render theo state của QuizEngine (FSM). Không emoji trong buttons/labels.
 */
import { QuizEngine } from '../../minigames/QuizEngine.js';
import { QUIZ_CONFIG } from '../../config/quizConfig.js';

const S = QUIZ_CONFIG.states;

export class QuizMultiplayerModal {
  constructor({ socket }) {
    this.engine = new QuizEngine({ socket });
    this.engine.onStateChange = (state, data) => this.render(state, data);
    this.engine.onEvent = (event, data) => this.handleEvent(event, data);
    this.timerInterval = null;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modal = document.createElement('div');
    this.modal.id = 'quiz-multiplayer-modal';
    this.modal.className = 'modal-backdrop hidden';
    this.modal.innerHTML = `
      <div class="modal-card quiz-card">
        <div class="quiz-header">
          <div class="quiz-title-group">
            <span class="quiz-badge">QUIZ CLB</span>
            <h2 class="quiz-title">Đấu Trí Đồng Đội</h2>
          </div>
          <button type="button" class="modal-close-btn" id="quiz-close-btn">✕</button>
        </div>
        <div class="quiz-body" id="quiz-body"></div>
      </div>`;
    document.body.appendChild(this.modal);
    this.body = this.modal.querySelector('#quiz-body');
  }

  bindEvents() {
    this.modal.querySelector('#quiz-close-btn').addEventListener('click', () => this.close());
    // Phím 1-4 chọn đáp án nhanh
    document.addEventListener('keydown', (e) => {
      if (this.modal.classList.contains('hidden')) return;
      if (this.engine.state !== S.QUESTION) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) this.engine.answer(n - 1);
    });
  }

  openAsHost(roomId) {
    this.hostRoomId = roomId;
    this.modal.classList.remove('hidden');
    this.renderSetup();
  }

  openAsGuest(quizId) {
    this.modal.classList.remove('hidden');
    this.engine.join(quizId);
  }

  close() {
    this.engine.leave();
    this.clearTimer();
    this.modal.classList.add('hidden');
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleEvent(event, data) {
    if (event === 'error') {
      this.showToast(data.message);
    } else if (event === 'answer_result') {
      this.markAnswerResult(data);
    } else if (event === 'lobby_update') {
      if (this.engine.state === S.LOBBY) this.renderLobby();
    }
  }

  showToast(msg) {
    // Toast hệ thống: văn phong kỹ thuật, không emoji (AGENTS.md)
    const t = document.createElement('div');
    t.className = 'quiz-toast';
    t.textContent = `[Quiz] ${msg}`;
    this.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ---------- Render theo state ----------

  render(state, data) {
    this.clearTimer();
    switch (state) {
      case S.IDLE: this.renderSetup(); break;
      case S.LOBBY: this.renderLobby(); break;
      case S.COUNTDOWN: this.renderCountdown(data.seconds); break;
      case S.QUESTION: this.renderQuestion(data); break;
      case S.REVEAL: this.renderReveal(data); break;
      case S.LEADERBOARD: this.renderLeaderboard(data.scores); break;
      case S.FINISHED: this.renderFinished(data); break;
    }
  }

  renderSetup() {
    this.body.innerHTML = `
      <div class="quiz-pane">
        <h3>Tạo phòng Quiz mới</h3>
        <label class="quiz-field">Chủ đề
          <select id="quiz-category">
            <option value="mixed">Tổng hợp</option>
            <option value="python">Python</option>
            <option value="math">Toán nhẩm</option>
            <option value="humor">Đố vui</option>
          </select>
        </label>
        <label class="quiz-field">Số câu hỏi
          <select id="quiz-count">
            <option value="5">5 câu</option>
            <option value="10" selected>10 câu</option>
          </select>
        </label>
        <button type="button" class="quiz-btn-primary" id="quiz-create-btn">Tạo Phòng</button>
        <div class="quiz-divider">hoặc</div>
        <label class="quiz-field">Mã phòng
          <input id="quiz-join-code" placeholder="quiz_xxx" />
        </label>
        <button type="button" class="quiz-btn-secondary" id="quiz-join-btn">Tham Gia</button>
      </div>`;
    this.body.querySelector('#quiz-create-btn').addEventListener('click', () => {
      this.engine.create({
        roomId: this.hostRoomId || 'main_hall',
        category: this.body.querySelector('#quiz-category').value,
        questionCount: parseInt(this.body.querySelector('#quiz-count').value, 10),
      });
    });
    this.body.querySelector('#quiz-join-btn').addEventListener('click', () => {
      const code = this.body.querySelector('#quiz-join-code').value.trim();
      if (code) this.engine.join(code);
    });
  }

  renderLobby() {
    const players = this.engine.players.map(p =>
      `<li>${this.escapeHtml(p.name)}${p.socketId === this.engine.hostId ? ' (Host)' : ''}</li>`
    ).join('');
    this.body.innerHTML = `
      <div class="quiz-pane">
        <h3>Phòng chờ</h3>
        <p class="quiz-code">Mã phòng: <code>${this.escapeHtml(this.engine.quizId || '')}</code></p>
        <ul class="quiz-player-list">${players}</ul>
        ${this.engine.isHost
          ? `<button type="button" class="quiz-btn-primary" id="quiz-start-btn">Bắt Đầu</button>
             <p class="quiz-hint">Cần ít nhất ${QUIZ_CONFIG.minPlayers} người chơi</p>`
          : `<p class="quiz-hint">Chờ host bắt đầu trận...</p>`}
        <button type="button" class="quiz-btn-secondary" id="quiz-leave-btn">Rời Phòng</button>
      </div>`;
    const startBtn = this.body.querySelector('#quiz-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => this.engine.start());
    this.body.querySelector('#quiz-leave-btn').addEventListener('click', () => this.renderSetup());
  }

  renderCountdown(seconds) {
    this.body.innerHTML = `
      <div class="quiz-pane quiz-center">
        <h3>Chuẩn bị...</h3>
        <div class="quiz-countdown" id="quiz-countdown-num">${seconds}</div>
      </div>`;
    let s = seconds;
    const el = this.body.querySelector('#quiz-countdown-num');
    this.timerInterval = setInterval(() => {
      s -= 1;
      if (el) el.textContent = Math.max(s, 0);
      if (s <= 0) this.clearTimer();
    }, 1000);
  }

  renderQuestion(q) {
    const opts = q.options.map((opt, i) =>
      `<button type="button" class="quiz-option" data-index="${i}">
         <span class="quiz-option-key">${i + 1}</span> ${this.escapeHtml(opt)}
       </button>`
    ).join('');
    this.body.innerHTML = `
      <div class="quiz-pane">
        <div class="quiz-qmeta">Câu ${q.index + 1}/${q.total}</div>
        <div class="quiz-timer-bar"><div class="quiz-timer-fill" id="quiz-timer-fill"></div></div>
        <h3 class="quiz-question">${this.escapeHtml(q.question)}</h3>
        <div class="quiz-options">${opts}</div>
        <p class="quiz-hint">Phím 1-4 để trả lời nhanh. Trả lời nhanh được thưởng điểm tốc độ.</p>
      </div>`;
    const fill = this.body.querySelector('#quiz-timer-fill');
    const total = QUIZ_CONFIG.questionSeconds * 1000;
    this.timerInterval = setInterval(() => {
      const left = Math.max(0, q.endsAt - Date.now());
      if (fill) fill.style.width = `${(left / total) * 100}%`;
      if (left <= 0) this.clearTimer();
    }, 100);
    this.body.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this.engine.answer(parseInt(btn.dataset.index, 10)));
    });
  }

  markAnswerResult({ correct, gained, combo }) {
    const btns = this.body.querySelectorAll('.quiz-option');
    btns.forEach(b => {
      b.disabled = true;
      if (parseInt(b.dataset.index, 10) === this.engine.myAnswer) {
        b.classList.add(correct ? 'quiz-correct-pick' : 'quiz-wrong-pick');
      }
    });
    const note = document.createElement('p');
    note.className = 'quiz-hint';
    note.textContent = correct ? `Chính xác! +${gained} điểm (combo x${combo})` : 'Chưa chính xác. Combo reset.';
    this.body.querySelector('.quiz-pane')?.appendChild(note);
  }

  renderReveal({ correctIndex, scores }) {
    const btns = this.body.querySelectorAll('.quiz-option');
    btns.forEach(b => {
      b.disabled = true;
      if (parseInt(b.dataset.index, 10) === correctIndex) b.classList.add('quiz-correct-answer');
    });
    const rows = scores.slice(0, 5).map((p, i) =>
      `<li><span class="quiz-rank">${i + 1}</span> ${this.escapeHtml(p.name)} — ${p.score} điểm</li>`
    ).join('');
    const board = document.createElement('div');
    board.className = 'quiz-mini-board';
    board.innerHTML = `<h4>Top điểm</h4><ul>${rows}</ul>`;
    this.body.querySelector('.quiz-pane')?.appendChild(board);
  }

  renderLeaderboard(scores) {
    const rows = scores.map((p, i) =>
      `<li><span class="quiz-rank">${i + 1}</span> ${this.escapeHtml(p.name)}
       — ${p.score} điểm <span class="quiz-sub">(${p.correct} câu đúng)</span></li>`
    ).join('');
    this.body.innerHTML = `
      <div class="quiz-pane">
        <h3>Bảng xếp hạng</h3>
        <ul class="quiz-player-list">${rows}</ul>
      </div>`;
  }

  renderFinished({ scores, winner }) {
    const rows = scores.map((p, i) =>
      `<li><span class="quiz-rank">${i + 1}</span> ${this.escapeHtml(p.name)}
       — ${p.score} điểm <span class="quiz-sub">(${p.correct} câu đúng)</span></li>`
    ).join('');
    this.body.innerHTML = `
      <div class="quiz-pane">
        <h3>Kết thúc trận Quiz</h3>
        ${winner ? `<p class="quiz-winner">Người thắng: ${this.escapeHtml(winner.name)} — ${winner.score} điểm</p>` : ''}
        <ul class="quiz-player-list">${rows}</ul>
        <button type="button" class="quiz-btn-primary" id="quiz-again-btn">Về Sảnh Chờ</button>
        <button type="button" class="quiz-btn-secondary" id="quiz-close2-btn">Đóng</button>
      </div>`;
    this.body.querySelector('#quiz-again-btn').addEventListener('click', () => this.renderSetup());
    this.body.querySelector('#quiz-close2-btn').addEventListener('click', () => this.close());
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
}
