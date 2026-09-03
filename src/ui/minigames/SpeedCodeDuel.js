/**
 * SpeedCodeDuel: Minigame Đấu Trí Lập Trình Siêu Tốc (Quick Quiz Showdown)
 * Trải nghiệm nhịp độ nhanh: 10 câu hỏi/lượt, 10s đếm ngược, combo x2 x3,
 * phím 1-2-3-4, âm thanh chiptune Web Audio API, lưu kỷ lục Bảng Vàng.
 */
import { QUIZ_QUESTIONS } from '../../config/quizQuestions.js';
import { audioManager } from '../../utils/AudioManager.js';
import { authService } from '../../services/AuthService.js';
import { questManager } from '../../managers/QuestManager.js';

export class SpeedCodeDuel {
  constructor() {
    this.isOpen = false;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.timeLeft = 10;
    this.timerInterval = null;
    this.isAnsweringLocked = false;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modal = document.createElement('div');
    this.modal.id = 'speed-code-duel-modal';
    this.modal.className = 'modal-backdrop hidden';

    this.modal.innerHTML = `
      <div class="modal-card duel-card">
        <!-- Header -->
        <div class="duel-header">
          <div class="duel-title-group">
            <span class="duel-badge">SPEED QUIZ ⚡</span>
            <h2 class="duel-title">Đấu Trí Lập Trình Siêu Tốc</h2>
          </div>
          <button type="button" class="modal-close-btn" id="duel-close-btn">✕</button>
        </div>

        <!-- Intro Screen -->
        <div class="duel-pane" id="duel-pane-intro">
          <div class="duel-hero">
            <div class="duel-icon-big">⚡</div>
            <h3>Thử Thách Toán Nhẩm & Coder Siêu Tốc</h3>
            <p>10 câu hỏi siêu tốc · 10 giây/câu · Combo nhân điểm · Nhịp độ bùng nổ!</p>
            <div class="duel-rules-grid">
              <div class="duel-rule-item">⚡ <strong>10s</strong> mỗi câu</div>
              <div class="duel-rule-item">🔥 <strong>Combo x2, x3</strong> khi đúng liên tiếp</div>
              <div class="duel-rule-item">⌨️ Phím <strong>1, 2, 3, 4</strong> để chọn nhanh</div>
            </div>
          </div>
          <button type="button" class="duel-btn-primary" id="duel-start-btn">
            <span>Bắt Đầu Trận Đấu ⚡</span>
          </button>
        </div>

        <!-- Gameplay Screen -->
        <div class="duel-pane hidden" id="duel-pane-gameplay">
          <!-- Top HUD -->
          <div class="duel-hud-bar">
            <div class="hud-stat">
              <span class="hud-label">CÂU HỎI</span>
              <span class="hud-val" id="duel-q-progress">1 / 10</span>
            </div>
            <div class="hud-stat">
              <span class="hud-label">ĐIỂM SỐ</span>
              <span class="hud-val highlight" id="duel-score-val">0</span>
            </div>
            <div class="hud-stat">
              <span class="hud-label">COMBO</span>
              <span class="hud-val streak" id="duel-streak-val">x1</span>
            </div>
          </div>

          <!-- Timer Bar -->
          <div class="duel-timer-track">
            <div class="duel-timer-fill" id="duel-timer-fill"></div>
          </div>

          <!-- Question Box -->
          <div class="duel-question-box">
            <span class="duel-cat-tag" id="duel-cat-tag">PYTHON</span>
            <div class="duel-question-text" id="duel-question-text">Đang tải câu hỏi...</div>
          </div>

          <!-- 4 Answer Buttons -->
          <div class="duel-answers-grid" id="duel-answers-grid">
            <!-- Buttons generated dynamically -->
          </div>

          <!-- Feedback Toast -->
          <div class="duel-feedback-toast hidden" id="duel-feedback-toast"></div>
        </div>

        <!-- Result Screen -->
        <div class="duel-pane hidden" id="duel-pane-result">
          <div class="duel-result-hero">
            <div class="duel-trophy-icon" id="duel-result-icon">🏆</div>
            <h3 class="duel-result-rank" id="duel-result-rank">Chiến Binh Code ⚡</h3>
            <p class="duel-result-sub" id="duel-result-sub">Bạn đã hoàn thành xuất sắc thử thách!</p>

            <div class="duel-stats-summary">
              <div class="duel-summary-box">
                <span class="sum-label">Tổng Điểm</span>
                <span class="sum-val" id="duel-final-score">0</span>
              </div>
              <div class="duel-summary-box">
                <span class="sum-label">Độ Chính Xác</span>
                <span class="sum-val" id="duel-final-accuracy">0%</span>
              </div>
              <div class="duel-summary-box">
                <span class="sum-label">Chuỗi Đúng Kỷ Lục</span>
                <span class="sum-val" id="duel-final-streak">0 🔥</span>
              </div>
            </div>

            <div class="duel-result-actions">
              <button type="button" class="duel-btn-secondary" id="duel-replay-btn">Chơi Lại 🔄</button>
              <button type="button" class="duel-btn-primary" id="duel-submit-btn">Lưu Bảng Vàng ⭐</button>
            </div>
            <div id="duel-submit-status" class="duel-submit-status"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Cache elements
    this.closeBtn = this.modal.querySelector('#duel-close-btn');
    this.startBtn = this.modal.querySelector('#duel-start-btn');
    this.replayBtn = this.modal.querySelector('#duel-replay-btn');
    this.submitBtn = this.modal.querySelector('#duel-submit-btn');

    this.paneIntro = this.modal.querySelector('#duel-pane-intro');
    this.paneGameplay = this.modal.querySelector('#duel-pane-gameplay');
    this.paneResult = this.modal.querySelector('#duel-pane-result');

    this.qProgressEl = this.modal.querySelector('#duel-q-progress');
    this.scoreValEl = this.modal.querySelector('#duel-score-val');
    this.streakValEl = this.modal.querySelector('#duel-streak-val');
    this.timerFillEl = this.modal.querySelector('#duel-timer-fill');
    this.catTagEl = this.modal.querySelector('#duel-cat-tag');
    this.qTextEl = this.modal.querySelector('#duel-question-text');
    this.answersGrid = this.modal.querySelector('#duel-answers-grid');
    this.feedbackToast = this.modal.querySelector('#duel-feedback-toast');

    this.resultRankEl = this.modal.querySelector('#duel-result-rank');
    this.resultSubEl = this.modal.querySelector('#duel-result-sub');
    this.finalScoreEl = this.modal.querySelector('#duel-final-score');
    this.finalAccuracyEl = this.modal.querySelector('#duel-final-accuracy');
    this.finalStreakEl = this.modal.querySelector('#duel-final-streak');
    this.submitStatusEl = this.modal.querySelector('#duel-submit-status');
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startNewMatch());
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => this.startNewMatch());
    }

    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', () => this.submitScore());
    }

    // Keyboard controls: 1, 2, 3, 4 and Escape
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      if (e.code === 'Escape') {
        this.hide();
        return;
      }

      if (this.isGameplayActive() && !this.isAnsweringLocked) {
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
          const keyNum = e.code.includes('Digit') ? e.code.replace('Digit', '') : e.code.replace('Numpad', '');
          const idx = parseInt(keyNum, 10) - 1;
          this.handleAnswer(idx);
        }
      }
    });
  }

  isGameplayActive() {
    return this.isOpen && !this.paneGameplay.classList.contains('hidden');
  }

  show() {
    this.isOpen = true;
    this.modal.classList.remove('hidden');
    this.switchPane('intro');
  }

  hide() {
    this.isOpen = false;
    this.clearCountdown();
    this.modal.classList.add('hidden');
  }

  switchPane(pane) {
    this.paneIntro.classList.toggle('hidden', pane !== 'intro');
    this.paneGameplay.classList.toggle('hidden', pane !== 'gameplay');
    this.paneResult.classList.toggle('hidden', pane !== 'result');
  }

  startNewMatch() {
    // Pick 10 random questions from pool
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    this.questions = shuffled.slice(0, 10);
    this.currentIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.isAnsweringLocked = false;
    if (this.submitStatusEl) this.submitStatusEl.textContent = '';
    if (this.submitBtn) this.submitBtn.disabled = false;

    this.switchPane('gameplay');
    this.loadQuestion(this.currentIndex);
  }

  loadQuestion(index) {
    if (index >= this.questions.length) {
      this.finishMatch();
      return;
    }

    const q = this.questions[index];
    this.isAnsweringLocked = false;
    this.feedbackToast.classList.add('hidden');

    // Update HUD
    this.qProgressEl.textContent = `${index + 1} / ${this.questions.length}`;
    this.scoreValEl.textContent = this.score.toString();
    this.updateStreakDisplay();

    // Set text & tag
    this.catTagEl.textContent = q.category === 'math' ? 'TOÁN NHẨM' :
                               q.category === 'python' ? 'PYTHON SNIPPET' : 'CODER LOGIC';
    this.qTextEl.textContent = q.question;

    // Render 4 answer buttons
    this.answersGrid.innerHTML = '';
    q.options.forEach((opt, optIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'duel-ans-btn';
      btn.setAttribute('data-index', optIdx.toString());
      btn.innerHTML = `
        <span class="ans-key">[${optIdx + 1}]</span>
        <span class="ans-text">${this.escapeHtml(opt)}</span>
      `;
      btn.addEventListener('click', () => {
        if (!this.isAnsweringLocked) {
          this.handleAnswer(optIdx);
        }
      });
      this.answersGrid.appendChild(btn);
    });

    // Start 10s timer
    this.startCountdown();
  }

  startCountdown() {
    this.clearCountdown();
    this.timeLeft = 10;
    this.updateTimerBar(10);

    const stepMs = 50;
    const totalMs = 10000;
    let elapsedMs = 0;

    this.timerInterval = setInterval(() => {
      elapsedMs += stepMs;
      const remainingSec = Math.max(0, (totalMs - elapsedMs) / 1000);
      this.timeLeft = remainingSec;
      this.updateTimerBar(remainingSec);

      if (elapsedMs >= totalMs) {
        this.clearCountdown();
        this.handleTimeOut();
      }
    }, stepMs);
  }

  clearCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerBar(seconds) {
    const pct = Math.max(0, Math.min(100, (seconds / 10) * 100));
    if (this.timerFillEl) {
      this.timerFillEl.style.width = `${pct}%`;
      if (pct < 25) {
        this.timerFillEl.style.backgroundColor = '#ef4444'; // Red
      } else if (pct < 50) {
        this.timerFillEl.style.backgroundColor = '#f59e0b'; // Amber
      } else {
        this.timerFillEl.style.backgroundColor = '#38bdf8'; // Cyan
      }
    }
  }

  handleAnswer(selectedIdx) {
    if (this.isAnsweringLocked) return;
    this.isAnsweringLocked = true;
    this.clearCountdown();

    const q = this.questions[this.currentIndex];
    const isCorrect = selectedIdx === q.correct;
    const buttons = this.answersGrid.querySelectorAll('.duel-ans-btn');

    // Highlight buttons
    buttons.forEach((btn, idx) => {
      if (idx === q.correct) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Score calculation: 100 base + time bonus * streak multiplier
      const multiplier = this.streak >= 5 ? 3.0 :
                         this.streak >= 3 ? 2.0 :
                         this.streak >= 2 ? 1.5 : 1.0;
      const gainedScore = Math.round((100 + Math.round(this.timeLeft * 10)) * multiplier);
      this.score += gainedScore;

      audioManager.playCorrectChime(this.streak);
      this.showFeedbackToast(true, `+${gainedScore} ĐIỂM! ${q.hint}`);

      if (this.scene?.juiceManager && this.scene.player) {
        this.scene.juiceManager.showFloatingText(
          this.scene.player.x,
          this.scene.player.y,
          `+${gainedScore} ĐIỂM!`,
          { color: '#38bdf8', fontSize: '13px' }
        );
        this.scene.juiceManager.pulseDOM('#duel-score-val');
      }
    } else {
      this.streak = 0;
      audioManager.playWrongBoop();
      this.showFeedbackToast(false, `CHƯA CHÍNH XÁC! ${q.hint}`);
    }

    this.scoreValEl.textContent = this.score.toString();
    this.updateStreakDisplay();

    // Advance to next after 1.2s
    setTimeout(() => {
      this.currentIndex++;
      this.loadQuestion(this.currentIndex);
    }, 1250);
  }

  handleTimeOut() {
    if (this.isAnsweringLocked) return;
    this.isAnsweringLocked = true;

    const q = this.questions[this.currentIndex];
    this.streak = 0;
    this.updateStreakDisplay();
    audioManager.playWrongBoop();

    const buttons = this.answersGrid.querySelectorAll('.duel-ans-btn');
    buttons.forEach((btn, idx) => {
      if (idx === q.correct) btn.classList.add('correct');
    });

    this.showFeedbackToast(false, `HẾT GIỜ! ${q.hint}`);

    setTimeout(() => {
      this.currentIndex++;
      this.loadQuestion(this.currentIndex);
    }, 1250);
  }

  showFeedbackToast(isSuccess, text) {
    this.feedbackToast.className = `duel-feedback-toast ${isSuccess ? 'success' : 'error'}`;
    this.feedbackToast.textContent = text;
    this.feedbackToast.classList.remove('hidden');
  }

  updateStreakDisplay() {
    if (!this.streakValEl) return;
    if (this.streak >= 5) {
      this.streakValEl.textContent = `x3 🔥🔥 (${this.streak})`;
      this.streakValEl.className = 'hud-val streak fiery';
    } else if (this.streak >= 3) {
      this.streakValEl.textContent = `x2 🔥 (${this.streak})`;
      this.streakValEl.className = 'hud-val streak hot';
    } else if (this.streak >= 2) {
      this.streakValEl.textContent = `x1.5 (${this.streak})`;
      this.streakValEl.className = 'hud-val streak';
    } else {
      this.streakValEl.textContent = 'x1';
      this.streakValEl.className = 'hud-val streak';
    }
  }

  finishMatch() {
    this.clearCountdown();
    this.switchPane('result');
    audioManager.playWin();

    // Record quest progress
    questManager.incrementProgress('focus_lofi_pomo', 1);

    const accuracy = Math.round((this.correctCount / this.questions.length) * 100);

    if (this.correctCount === this.questions.length && this.scene?.achievementManager) {
      this.scene.achievementManager.unlock('speed_coder');
    }

    this.finalScoreEl.textContent = this.score.toLocaleString();
    this.finalAccuracyEl.textContent = `${accuracy}% (${this.correctCount}/10)`;
    this.finalStreakEl.textContent = `${this.maxStreak} 🔥`;

    // Title rank
    if (this.score >= 2500 && accuracy === 100) {
      this.resultRankEl.textContent = 'Huyền Thoại DEVER 🏆';
      this.resultSubEl.textContent = 'Trí tuệ siêu đẳng, trả lời đúng toàn bộ 10/10 với tốc độ ánh sáng!';
    } else if (this.score >= 1800) {
      this.resultRankEl.textContent = 'Bậc Thầy Tính Nhẩm ⭐';
      this.resultSubEl.textContent = 'Khả năng phản xạ và xử lý code thần tốc, rất ấn tượng!';
    } else if (this.score >= 1000) {
      this.resultRankEl.textContent = 'Chiến Binh Code ⚡';
      this.resultSubEl.textContent = 'Nhịp độ rất tốt, duy trì phong độ để đạt điểm số cao hơn nhé!';
    } else {
      this.resultRankEl.textContent = 'Tập Sự Python 🐍';
      this.resultSubEl.textContent = 'Hãy luyện tập thêm để làm quen với các bẫy logic của coder!';
    }
  }

  async submitScore() {
    if (this.submitBtn) this.submitBtn.disabled = true;
    if (this.submitStatusEl) {
      this.submitStatusEl.textContent = 'Đang đồng bộ thành tích lên hệ thống...';
      this.submitStatusEl.className = 'duel-submit-status loading';
    }

    try {
      const user = authService.getUser();
      const playerName = user?.display_name || user?.displayName || localStorage.getItem('dever_nickname') || 'Dev Alpha';
      const userId = user?.id || null;

      const res = await fetch(`${authService.getBaseUrl()}/api/game/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authService.getToken() ? { 'Authorization': `Bearer ${authService.getToken()}` } : {})
        },
        body: JSON.stringify({
          gameType: 'code_duel',
          score: this.score,
          streak: this.maxStreak,
          playerName,
          userId
        })
      });

      const data = await res.json();
      if (data.success) {
        if (this.submitStatusEl) {
          this.submitStatusEl.textContent = 'Đã lưu điểm số lên Bảng Vàng thành công!';
          this.submitStatusEl.className = 'duel-submit-status success';
        }
      } else {
        throw new Error(data.message || 'Lỗi lưu điểm');
      }
    } catch (err) {
      if (this.submitStatusEl) {
        this.submitStatusEl.textContent = 'Đã lưu cục bộ. Máy chủ hiện đang ngoại tuyến.';
        this.submitStatusEl.className = 'duel-submit-status warning';
      }
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  destroy() {
    this.clearCountdown();
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}
