/**
 * DEVER TOWN — BUG HUNTER JOB (SĂN BỌ ĐÊM) — Phase D1
 *
 * Bọ phát sáng lang thang quanh vườn hoa sân Tòa Alpha (wander AI theo mẫu
 * DuckWander). Người chơi đến gần + nhấn E → vung vợt (net swing) → popup
 * 1 câu quiz từ src/config/quizQuestions.js (Python / Toán) → trả lời đúng:
 * +40 D-Coin (walletManager.earn(..., 'job_bug_hunter')); trả lời sai:
 * bọ trốn thoát, không cộng coin.
 *
 * FSM (AGENTS.md §6): idle → hunting → quiz → caught | escaped → hunting → done.
 * Không chạm map/layout — bọ & vợt là sprite in-world, không solid.
 */
import { JOBS_CONFIG } from '../../config/jobsConfig.js';
import { QUIZ_QUESTIONS } from '../../config/quizQuestions.js';

export const BUG_HUNTER_STATES = {
  IDLE: 'idle',
  HUNTING: 'hunting',   // bọ đang lang thang, chờ người chơi vợt
  QUIZ: 'quiz',         // popup quiz đang mở
  CAUGHT: 'caught',     // khoảnh khắc bắt đúng (chuyển tiếp)
  ESCAPED: 'escaped',    // khoảnh khắc bọ trốn (chuyển tiếp)
  DONE: 'done',
};

const PROMPT_STYLE = {
  fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontSize: '12px',
  fontWeight: '700',
  color: '#ffffff',
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  padding: { left: 8, right: 8, top: 4, bottom: 4 },
};

export class BugHunterJob {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene - WorldScene
   * @param {Object} options.wallet - WalletManager (có earn)
   * @param {Object} options.toast - ToastManager (có toast)
   * @param {Function} [options.setStatus] - (text|null) => void, pill trạng thái HUD
   */
  constructor({ scene, wallet, toast, setStatus } = {}) {
    this.scene = scene || null;
    this.wallet = wallet || null;
    this.toast = toast || null;
    this.setStatus = typeof setStatus === 'function' ? setStatus : () => {};
    this.cfg = JOBS_CONFIG.bugHunter;
    this.state = BUG_HUNTER_STATES.IDLE;
    this.bugs = []; // { sprite, x, y, angle, speed, stateTimer, phase }
    this.caught = 0;
    this.quizPopup = null;
    this._pendingBug = null;
    this._pendingQuestion = null;
    this.prompt = null;
    this._eHandler = null;
    this._lastEAt = 0;
    this._elapsed = 0;
  }

  getState() {
    return this.state;
  }

  getCaughtCount() {
    return this.caught;
  }

  getBugCount() {
    return this.bugs.length;
  }

  // ------------------------------------------------------------- start/stop
  start() {
    if (this.state !== BUG_HUNTER_STATES.IDLE && this.state !== BUG_HUNTER_STATES.DONE) return false;
    if (!this.scene || !this.scene.player) {
      this._say('Không tìm thấy người chơi.');
      return false;
    }
    if (this.scene.currentRoomId !== JOBS_CONFIG.mainHallRoomId) {
      this._say('Hãy đến Sảnh Alpha (vườn hoa sân Tòa Alpha) để săn bọ.');
      return false;
    }
    this._spawnBugs();
    this._bindE();
    this._makePrompt();
    this.state = BUG_HUNTER_STATES.HUNTING;
    this._refreshStatus();
    this._say(`Săn bọ bắt đầu: ${this.bugs.length} con bọ phát sáng trong vườn hoa. Đến gần + [E] để vung vợt, trả lời đúng quiz để giữ bọ.`);
    return true;
  }

  stop() {
    this._unbindE();
    this._closeQuiz();
    for (const b of this.bugs) { try { b.sprite?.destroy(); } catch (e) { /* noop */ } }
    if (this.prompt) { try { this.prompt.destroy(); } catch (e) { /* noop */ } }
    this.bugs = [];
    this.prompt = null;
    this._pendingBug = null;
    this._pendingQuestion = null;
    this.state = BUG_HUNTER_STATES.IDLE;
    this.setStatus(null);
  }

  // ------------------------------------------------------------- update
  /**
   * @param {number} time - ms
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.state !== BUG_HUNTER_STATES.HUNTING) return;
    const dt = delta / 1000;
    this._elapsed += dt;
    const b = this.cfg.bounds;
    for (const bug of this.bugs) {
      // Wander AI (mẫu DuckWander): đổi hướng ngẫu nhiên mỗi vài giây.
      bug.stateTimer -= dt;
      if (bug.stateTimer <= 0) {
        bug.angle = Math.random() * Math.PI * 2;
        bug.speed = this.cfg.speedMin + Math.random() * (this.cfg.speedMax - this.cfg.speedMin);
        bug.stateTimer = this.cfg.steerTimeMin + Math.random() * (this.cfg.steerTimeMax - this.cfg.steerTimeMin);
      }
      bug.x += Math.cos(bug.angle) * bug.speed * dt;
      bug.y += Math.sin(bug.angle) * bug.speed * dt;
      // Nảy lại trong bounds vườn hoa.
      if (bug.x < b.x0 || bug.x > b.x1) { bug.angle = Math.PI - bug.angle; bug.x = Math.min(Math.max(bug.x, b.x0), b.x1); }
      if (bug.y < b.y0 || bug.y > b.y1) { bug.angle = -bug.angle; bug.y = Math.min(Math.max(bug.y, b.y0), b.y1); }
      const s = bug.sprite;
      if (s) {
        s.setPosition(bug.x, bug.y);
        s.setDepth(bug.y + 6);
        const dx = Math.cos(bug.angle);
        if (typeof s.setFlipX === 'function' && Math.abs(dx) > 0.2) s.setFlipX(dx < 0);
        // Nhấp nháy phát sáng theo chu kỳ.
        const pulse = (Math.sin((this._elapsed / this.cfg.glowPeriod) * Math.PI * 2 + bug.phase) + 1) / 2;
        if (typeof s.setAlpha === 'function') s.setAlpha(0.75 + pulse * 0.25);
      }
    }
    // Prompt [E] cho con bọ gần nhất.
    const near = this._nearestBug();
    if (this.prompt) {
      if (near) {
        this.prompt.setVisible(true);
        this.prompt.setPosition(near.x, near.y - 24);
        this.prompt.setText('[E] Vung vợt bắt bọ');
      } else {
        this.prompt.setVisible(false);
      }
    }
  }

  // ------------------------------------------------------------- interact
  _bindE() {
    this._eHandler = () => {
      const now = Date.now();
      if (now - this._lastEAt < 200) return;
      this._lastEAt = now;
      if (this.state !== BUG_HUNTER_STATES.HUNTING) return;
      const im = this.scene?.interactionManager;
      if (im && typeof im.canInteract === 'function' && !im.canInteract()) return;
      const bug = this._nearestBug();
      if (bug) this._swingAt(bug);
    };
    try { this.scene.input.keyboard.on('keydown-E', this._eHandler); } catch (e) { /* noop */ }
  }

  _unbindE() {
    if (this._eHandler) {
      try { this.scene.input.keyboard.off('keydown-E', this._eHandler); } catch (e) { /* noop */ }
      this._eHandler = null;
    }
  }

  _nearestBug() {
    const p = this.scene?.player;
    if (!p) return null;
    const R = JOBS_CONFIG.interactRadius;
    let best = null;
    let bestD = Infinity;
    for (const bug of this.bugs) {
      const d = Math.hypot(p.x - bug.x, p.y - bug.y);
      if (d <= R && d < bestD) { bestD = d; best = bug; }
    }
    return best;
  }

  _swingAt(bug) {
    // Gỡ bọ khỏi sân, vung vợt 300ms rồi mở quiz.
    const idx = this.bugs.indexOf(bug);
    if (idx >= 0) this.bugs.splice(idx, 1);
    try { bug.sprite?.destroy(); } catch (e) { /* noop */ }
    this._pendingBug = bug;
    this._netSwing();
    const q = this._pickQuestion();
    this.state = BUG_HUNTER_STATES.QUIZ;
    if (this.prompt) this.prompt.setVisible(false);
    this._openQuiz(q);
  }

  _netSwing() {
    try {
      const p = this.scene.player;
      const net = this.scene.add.image(p.x, p.y - 34, 'job_net');
      net.setDepth(p.y + 40);
      net.setAngle(-28);
      const tweens = this.scene.tweens;
      if (tweens && typeof tweens.add === 'function') {
        tweens.add({
          targets: net, angle: 28, duration: 150, yoyo: true,
          onComplete: () => { try { net.destroy(); } catch (e) { /* noop */ } },
        });
      } else {
        setTimeout(() => { try { net.destroy(); } catch (e) { /* noop */ } }, 300);
      }
    } catch (e) { /* noop */ }
  }

  // ------------------------------------------------------------- quiz
  _pickQuestion() {
    const pool = QUIZ_QUESTIONS.filter((q) => this.cfg.quizCategories.includes(q.category));
    const list = pool.length > 0 ? pool : QUIZ_QUESTIONS;
    return list[Math.floor(Math.random() * list.length)];
  }

  _openQuiz(question) {
    this._pendingQuestion = question;
    if (typeof document === 'undefined') {
      // Môi trường test (không DOM): coi như trả lời đúng để kiểm FSM.
      this._answerQuiz(true);
      return;
    }
    this._closeQuiz();
    const wrap = document.createElement('div');
    wrap.id = 'jobs-quiz-popup';
    // class modal-backdrop để InteractionManager.canInteract() chặn E khi quiz mở.
    wrap.className = 'modal-backdrop jobs-quiz-popup';
    const catLabel = question.category === 'python' ? 'Python' : question.category === 'math' ? 'Toán' : 'Quiz';
    wrap.innerHTML = `
      <div class="modal-card jobs-quiz-card" role="dialog" aria-label="Quiz săn bọ">
        <div class="jobs-quiz-head">
          <span class="jobs-quiz-cat">${catLabel}</span>
          <span class="jobs-quiz-title">Trả lời để giữ con bọ</span>
        </div>
        <p class="jobs-quiz-q"></p>
        <div class="jobs-quiz-options"></div>
        <button type="button" class="jobs-quiz-giveup" id="jobs-quiz-giveup">Thả bọ</button>
      </div>`;
    wrap.querySelector('.jobs-quiz-q').textContent = question.question;
    const optBox = wrap.querySelector('.jobs-quiz-options');
    question.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jobs-quiz-opt';
      btn.textContent = opt;
      btn.addEventListener('click', () => this._answerQuiz(i === question.correct));
      optBox.appendChild(btn);
    });
    wrap.querySelector('#jobs-quiz-giveup').addEventListener('click', () => this._answerQuiz(false));
    wrap.addEventListener('click', (e) => { if (e.target === wrap) this._answerQuiz(false); });
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._answerQuiz(false); });
    document.body.appendChild(wrap);
    this.quizPopup = wrap;
    const first = optBox.querySelector('button');
    if (first) first.focus();
  }

  _closeQuiz() {
    if (this.quizPopup && this.quizPopup.parentNode) {
      this.quizPopup.parentNode.removeChild(this.quizPopup);
    }
    this.quizPopup = null;
  }

  _answerQuiz(correct) {
    this._closeQuiz();
    if (correct) {
      this.state = BUG_HUNTER_STATES.CAUGHT;
      this.caught += 1;
      const wage = JOBS_CONFIG.wages.bugHunter;
      let balance = null;
      if (this.wallet) balance = this.wallet.earn(wage, this.cfg.walletSource);
      this._say(balance !== null
        ? `Trả lời đúng: bắt được bọ phát sáng, +${wage} D-Coin (ví: ${balance}).`
        : `Trả lời đúng: bắt được bọ phát sáng, +${wage} D-Coin.`);
    } else {
      this.state = BUG_HUNTER_STATES.ESCAPED;
      this._say('Trả lời sai: con bọ trốn thoát. Không được cộng coin.');
    }
    this._pendingBug = null;
    this._pendingQuestion = null;
    if (this.bugs.length === 0 && this.state === BUG_HUNTER_STATES.CAUGHT) {
      this.state = BUG_HUNTER_STATES.DONE;
      this.setStatus(null);
      this._say(`Hoàn thành ca săn bọ: bắt được ${this.caught} con.`);
      this.stop();
    } else {
      // Bọ trốn → sinh lại 1 con khác để ca không bị cạn.
      if (this.state === BUG_HUNTER_STATES.ESCAPED) this._spawnOneBug();
      this.state = BUG_HUNTER_STATES.HUNTING;
      this._refreshStatus();
    }
  }

  // ------------------------------------------------------------- spawn
  _spawnBugs() {
    for (let i = 0; i < this.cfg.bugCount; i++) this._spawnOneBug();
  }

  _spawnOneBug() {
    const b = this.cfg.bounds;
    const x = b.x0 + Math.random() * (b.x1 - b.x0);
    const y = b.y0 + Math.random() * (b.y1 - b.y0);
    let sprite = null;
    try {
      sprite = this.scene.add.sprite(x, y, 'job_bug', 0);
      sprite.setDepth(y + 6);
    } catch (e) {
      sprite = null;
    }
    this.bugs.push({
      sprite,
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      speed: this.cfg.speedMin + Math.random() * (this.cfg.speedMax - this.cfg.speedMin),
      stateTimer: this.cfg.steerTimeMin + Math.random() * (this.cfg.steerTimeMax - this.cfg.steerTimeMin),
      phase: Math.random() * Math.PI * 2,
    });
  }

  _makePrompt() {
    try {
      this.prompt = this.scene.add.text(0, 0, '', PROMPT_STYLE).setOrigin(0.5, 0.5);
      this.prompt.setDepth(99999);
      this.prompt.setVisible(false);
    } catch (e) {
      this.prompt = null;
    }
  }

  _refreshStatus() {
    this.setStatus(`Săn bọ: đã bắt ${this.caught} | còn ${this.bugs.length} con`);
  }

  _say(msg) {
    if (this.toast && typeof this.toast.toast === 'function') {
      this.toast.toast(msg);
    }
  }
}
