/**
 * DEVER TOWN - SPORTS ARCADE HTML5 CANVAS ENGINE 2.0
 * Module trò chơi thể thao arcade thế hệ mới (Clean Facade Pattern):
 * 1. ⚽ Sút Phạt Đền & Đối Kháng 2 Chiều (PenaltyShootoutEngine)
 * 2. 🏀 Bóng Rổ Ném Xiên Parabol & Swish (BasketballShootoutEngine)
 * 3. 🏐 Bóng Chuyền 3 Chạm & Đập Bóng Spike (VolleyballRallyEngine)
 * 4. ☕ Barista FPTU 4 Trạm Tương Tác & Vẽ Latte Art (BaristaSimulatorEngine)
 */
import { audioManager } from '../../utils/AudioManager.js';
import { questManager } from '../../managers/QuestManager.js';
import { authService } from '../../services/AuthService.js';
import { CanvasJuiceFX } from './common/CanvasJuiceFX.js';
import { PenaltyShootoutEngine } from './sports/PenaltyShootoutEngine.js';
import { BasketballShootoutEngine } from './sports/BasketballShootoutEngine.js';
import { VolleyballRallyEngine } from './sports/VolleyballRallyEngine.js';
import { BaristaSimulatorEngine } from './sports/BaristaSimulatorEngine.js';

export class SportsArcade {
  constructor(canvasEl, options = {}) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.options = options;
    this.currentGame = 'football'; // 'football' | 'basketball' | 'volleyball' | 'barista'
    this.animId = null;
    this.running = false;

    // Kích thước chuẩn 16:9
    this.width = 640;
    this.height = 360;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Điểm số & Kỷ lục
    this.scores = {
      footballStreak: parseInt(localStorage.getItem('dever_penalty_streak') || '0', 10),
      footballHigh: parseInt(localStorage.getItem('dever_penalty_high') || '0', 10),
      basketballScore: 0,
      basketballHigh: parseInt(localStorage.getItem('dever_basketball_high') || '0', 10),
      volleyballRally: 0,
      volleyballHigh: parseInt(localStorage.getItem('dever_volleyball_high') || '0', 10),
      baristaScore: parseInt(localStorage.getItem('dever_barista_score') || '0', 10)
    };

    // Phím điều khiển
    this.keys = { left: false, right: false, up: false, space: false };
    this.particles = [];
    this.activationGraceUntil = 0;

    // Engine hiệu ứng Game Feel & "Juice"
    this.juiceFX = new CanvasJuiceFX();

    // Khởi tạo các Sub-Engines chuyên dụng thế hệ 2.0
    this.initSubEngines();

    // Đối tượng tương thích ngược cho các bài test cũ (Zero-Regression)
    this.initCompatibilityAdapters();

    this.bindEvents();
  }

  initSubEngines() {
    // 1. Penalty Shootout Engine
    this.penaltyEngine = new PenaltyShootoutEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (pts) => {
        this.scores.footballStreak = (this.scores.footballStreak || 0) + 1;
        this.penaltyEngine.streak = this.scores.footballStreak;
        if (this.scores.footballStreak > this.scores.footballHigh) {
          this.scores.footballHigh = this.scores.footballStreak;
          localStorage.setItem('dever_penalty_high', this.scores.footballHigh.toString());
        }
        localStorage.setItem('dever_penalty_streak', this.scores.footballStreak.toString());
        questManager.incrementProgress('penalty_goal', 1);
        questManager.incrementProgress('penalty_shootout', 1);
        if (this.scores.footballStreak >= 3) {
          this.options.onAchievement?.('striker');
        }
        this.syncFootballCompatibility();
        this.updateHUD();
      }
    });

    // 2. Basketball Shootout Engine
    this.basketballEngine = new BasketballShootoutEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (pts) => {
        this.scores.basketballScore = this.basketballEngine.score;
        if (this.scores.basketballScore > this.scores.basketballHigh) {
          this.scores.basketballHigh = this.scores.basketballScore;
          localStorage.setItem('dever_basketball_high', this.scores.basketballHigh.toString());
        }
        questManager.incrementProgress('basketball_dunk', 1);
        this.updateHUD();
      }
    });

    // 3. Volleyball Rally Engine
    this.volleyballEngine = new VolleyballRallyEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (pts) => {
        this.scores.volleyballRally = this.volleyballEngine.rallyCount;
        if (this.scores.volleyballRally > this.scores.volleyballHigh) {
          this.scores.volleyballHigh = this.scores.volleyballRally;
          localStorage.setItem('dever_volleyball_high', this.scores.volleyballHigh.toString());
        }
        this.updateHUD();
      }
    });

    // 4. Barista Simulator Engine
    this.baristaEngine = new BaristaSimulatorEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (earnedTips) => {
        this.scores.baristaScore = (this.scores.baristaScore || 0) + earnedTips;
        localStorage.setItem('dever_barista_score', this.scores.baristaScore.toString());
        questManager.incrementProgress('barista_coffee', 1);
        this.updateHUD();
      }
    });
  }

  initCompatibilityAdapters() {
    this.football = {
      state: 'aiming',
      aimTime: 0,
      aimX: 0,
      ball: this.penaltyEngine.ball,
      gk: this.penaltyEngine.gk,
      resultText: ''
    };
    this.bb = { state: 'ready', score: 0 };
    this.vb = { state: 'serving_player' };
    this.barista = { power: 50 };
  }

  syncFootballCompatibility() {
    if (this.penaltyEngine) {
      this.football.state = this.penaltyEngine.state;
      this.football.ball = this.penaltyEngine.ball;
      this.football.gk = this.penaltyEngine.gk;
    }
  }

  updateFootball(dt) {
    if (this.penaltyEngine) {
      if (this.football.ball) {
        this.penaltyEngine.ball.targetX = this.football.ball.targetX;
        this.penaltyEngine.ball.targetY = this.football.ball.targetY;
        this.penaltyEngine.ball.startX = this.football.ball.startX;
        this.penaltyEngine.ball.startY = this.football.ball.startY;
        this.penaltyEngine.ball.progress = this.football.ball.progress;
      }
      if (this.football.gk) {
        this.penaltyEngine.gk.targetX = this.football.gk.targetX;
        this.penaltyEngine.gk.diveProgress = this.football.gk.diveProgress;
      }
      this.penaltyEngine.state = this.football.state;
      this.penaltyEngine.update(dt);
      this.syncFootballCompatibility();
    }
  }

  bindEvents() {
    this.handleKeyDown = (e) => {
      if (!this.running) return;
      if (e.repeat) return; // Chống lặp phím liên tục khi người chơi nhấn giữ Space
      if (Date.now() < this.activationGraceUntil) return;

      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyW', 'Enter'].includes(e.code) || [' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
        this.keys.space = true;
        this.keys.up = true;
        this.onActionTrigger();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    };

    this.handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
        this.keys.space = false;
        this.keys.up = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    };

    this.getCanvasCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    this.handlePointerDown = (e) => {
      if (!this.running || Date.now() < this.activationGraceUntil) return;
      const { x, y } = this.getCanvasCoords(e);
      if (this.currentGame === 'barista') {
        this.baristaEngine.handlePointerDown(x, y);
      }
    };

    this.handlePointerMove = (e) => {
      if (!this.running) return;
      const { x, y } = this.getCanvasCoords(e);
      if (this.currentGame === 'football') {
        this.penaltyEngine.handlePointerMove(x, y);
      } else if (this.currentGame === 'barista') {
        this.baristaEngine.handlePointerMove(x, y);
      }
    };

    this.handlePointerUp = (e) => {
      if (!this.running) return;
      if (this.currentGame === 'barista') {
        this.baristaEngine.handlePointerUp();
      }
    };

    this.handleCanvasClick = (e) => {
      if (!this.running || Date.now() < this.activationGraceUntil) return;
      e.preventDefault();
      this.onActionTrigger();
    };

    this.handleCanvasTouch = (e) => {
      if (!this.running || Date.now() < this.activationGraceUntil) return;
      e.preventDefault();
      this.onActionTrigger();
    };
  }

  setGame(gameType) {
    this.currentGame = gameType;
    this.particles = [];
    if (gameType === 'football') this.penaltyEngine.resetStriker();
    else if (gameType === 'basketball') this.basketballEngine.reset();
    else if (gameType === 'volleyball') this.volleyballEngine.resetServe('player');
    else if (gameType === 'barista') this.baristaEngine.reset();
    this.updateHUD();
  }

  start() {
    if (this.running) {
      this.stop();
    }
    this.running = true;
    this.activationGraceUntil = Date.now() + 300;
    let lastTime = performance.now();

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    this.canvas.addEventListener('mousemove', this.handlePointerMove);
    window.addEventListener('mouseup', this.handlePointerUp);

    this.canvas.addEventListener('touchstart', this.handlePointerDown, { passive: false });
    this.canvas.addEventListener('touchmove', this.handlePointerMove, { passive: false });
    window.addEventListener('touchend', this.handlePointerUp);

    this.canvas.addEventListener('click', this.handleCanvasClick);

    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      this.update(dt);
      this.render();

      this.animId = requestAnimationFrame(loop);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.canvas.removeEventListener('mousedown', this.handlePointerDown);
    this.canvas.removeEventListener('mousemove', this.handlePointerMove);
    window.removeEventListener('mouseup', this.handlePointerUp);

    this.canvas.removeEventListener('touchstart', this.handlePointerDown);
    this.canvas.removeEventListener('touchmove', this.handlePointerMove);
    window.removeEventListener('touchend', this.handlePointerUp);

    this.canvas.removeEventListener('click', this.handleCanvasClick);
  }

  destroy() {
    this.stop();
  }

  onActionTrigger() {
    if (this.currentGame === 'football') {
      this.penaltyEngine.onActionTrigger();
      this.syncFootballCompatibility();
    } else if (this.currentGame === 'basketball') {
      this.basketballEngine.onActionTrigger();
    } else if (this.currentGame === 'volleyball') {
      this.volleyballEngine.onActionTrigger();
    } else if (this.currentGame === 'barista') {
      this.baristaEngine.onActionTrigger();
    }
  }

  updateHUD() {
    if (this.options.onScoreUpdate) {
      this.options.onScoreUpdate({
        game: this.currentGame,
        scores: this.scores
      });
    }

    // Tự động đồng bộ kỷ lục thể thao lên máy chủ
    try {
      if (authService && authService.isLoggedIn() && typeof authService.syncFullProfile === 'function') {
        authService.syncFullProfile({
          gameRecords: {
            footballStreak: this.scores.footballStreak || 0,
            footballHigh: this.scores.footballHigh || 0,
            basketballHigh: this.scores.basketballHigh || 0,
            volleyballHigh: this.scores.volleyballHigh || 0,
            baristaScore: this.scores.baristaScore || 0
          }
        });
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ kỷ lục thể thao lên máy chủ:', e);
    }
  }

  update(dt) {
    this.juiceFX.update(dt);

    if (this.currentGame === 'football') {
      this.penaltyEngine.update(dt);
      this.syncFootballCompatibility();
    } else if (this.currentGame === 'basketball') {
      this.basketballEngine.update(dt);
    } else if (this.currentGame === 'volleyball') {
      this.volleyballEngine.keys = this.keys;
      this.volleyballEngine.update(dt);
    } else if (this.currentGame === 'barista') {
      this.baristaEngine.update(dt);
    }
  }

  render() {
    this.ctx.save();

    // Rung lắc camera Game Feel
    if (this.juiceFX.shakeOffset.x !== 0 || this.juiceFX.shakeOffset.y !== 0) {
      this.ctx.translate(this.juiceFX.shakeOffset.x, this.juiceFX.shakeOffset.y);
    }

    if (this.currentGame === 'football') {
      this.penaltyEngine.render();
    } else if (this.currentGame === 'basketball') {
      this.basketballEngine.render();
    } else if (this.currentGame === 'volleyball') {
      this.volleyballEngine.render();
    } else if (this.currentGame === 'barista') {
      this.baristaEngine.render();
    }

    // Render hiệu ứng Juice (hạt, chữ bay) lên trên cùng
    this.juiceFX.render(this.ctx);

    this.ctx.restore();
  }
}
