/**
 * DEVER TOWN - RETRO ARCADE HTML5 CANVAS ENGINE 2.0
 * Module trò chơi cổ điển Retro thế hệ mới (Clean Facade Pattern):
 * 1. 🐍 Rắn Săn Mồi Siêu Cấp 60fps (SnakeEngine)
 * 2. 📦 Đẩy Hộp Trí Tuệ 15 Màn Microban & Sàn Băng (SokobanEngine)
 * 3. ⛏️ Vua Đào Vàng Nổ Dây Chuyền TNT (GoldMinerEngine)
 */
import { CanvasJuiceFX } from './common/CanvasJuiceFX.js';
import { SnakeEngine } from './retro/SnakeEngine.js';
import { SokobanEngine } from './retro/SokobanEngine.js';
import { GoldMinerEngine } from './retro/GoldMinerEngine.js';
import { FlappyBugEngine } from './retro/FlappyBugEngine.js';
import { GeometryDashEngine } from './retro/GeometryDashEngine.js';
import { Match3Engine } from './retro/Match3Engine.js';
import { PacmanEngine } from './retro/PacmanEngine.js';
import { questManager } from '../../managers/QuestManager.js';
import { isTouchDevice } from './common/touchHints.js';

export class RetroArcade {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.width = canvas.width;
    this.height = canvas.height;

    this.currentGame = 'snake'; // 'snake', 'sokoban', 'goldminer', 'flappybug', 'geometrydash', 'match3', 'pacman'
    this.isRunning = false;
    this.animationId = null;

    // Điểm số & Kỷ lục
    this.scores = {
      snakeScore: 0,
      snakeHigh: parseInt(localStorage.getItem('dever_snake_high') || '0', 10),
      sokobanLevel: parseInt(localStorage.getItem('dever_sokoban_level') || '1', 10),
      goldminerScore: 0,
      goldminerHigh: parseInt(localStorage.getItem('dever_goldminer_high') || '0', 10),
      flappyScore: 0,
      flappyHigh: parseInt(localStorage.getItem('dever_flappy_high') || '0', 10),
      dashPercent: 0,
      dashHighPercent: parseInt(localStorage.getItem('dever_dash_best') || '0', 10),
      match3Score: 0,
      match3High: parseInt(localStorage.getItem('dever_match3_high') || '0', 10),
      pacmanScore: 0,
      pacmanHigh: parseInt(localStorage.getItem('dever_pacman_high') || '0', 10)
    };

    // Common input state
    this.keys = {};

    // Vuốt trên cảm ứng cho game định hướng (snake/pacman/sokoban):
    // ghi lại điểm chạm để phân biệt tap (đổi hướng theo vị trí chạm) và
    // swipe (đổi hướng theo hướng vuốt). Thêm 2026-10-09 (mobile touch-native).
    this.touchSwipeStart = null;
    this.SWIPE_THRESHOLD_PX = 24; // ngưỡng vuốt, tính theo pixel logic của canvas

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.handleOrientationChange = this.handleOrientationChange.bind(this);

    this.lastTime = 0;

    // Hiệu ứng Juice
    this.juiceFX = new CanvasJuiceFX();

    // Khởi tạo các Sub-Engines
    this.initSubEngines();

    // Đối tượng tương thích ngược
    this.initCompatibilityAdapters();
  }

  initSubEngines() {
    this.snakeEngine = new SnakeEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (score) => {
        this.scores.snakeScore = score;
        if (score > this.scores.snakeHigh) {
          this.scores.snakeHigh = score;
          localStorage.setItem('dever_snake_high', score.toString());
        }
        if (score > 0 && score % 10 === 0) {
          try {
            questManager.addPoints?.(5, 'Cyber Snake đạt mốc điểm');
          } catch (_) {}
        }
        this.options.onScoreUpdate?.({ game: 'snake', score, high: this.scores.snakeHigh });
      }
    });

    this.sokobanEngine = new SokobanEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (lvl) => {
        const curLvl = typeof lvl === 'number' && lvl > 0 ? lvl : (this.sokobanEngine?.currentLevelIndex ?? 0) + 1;
        this.scores.sokobanLevel = Math.max(this.scores.sokobanLevel, curLvl);
        localStorage.setItem('dever_sokoban_level', this.scores.sokobanLevel.toString());
        questManager.incrementProgress?.('sokoban_puzzle', 1);
        try {
          questManager.addPoints?.(25, 'Giải màn đẩy hộp Sokoban');
        } catch (_) {}
        this.options.onScoreUpdate?.({ game: 'sokoban', score: curLvl, high: this.scores.sokobanLevel });
      }
    });

    this.goldMinerEngine = new GoldMinerEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (cash) => {
        this.scores.goldminerScore = cash;
        if (cash > this.scores.goldminerHigh) {
          this.scores.goldminerHigh = cash;
          localStorage.setItem('dever_goldminer_high', cash.toString());
        }
        questManager.incrementProgress?.('gold_miner_day', 1);
        try {
          questManager.addPoints?.(15, 'Khai thác mỏ vàng FPTU');
        } catch (_) {}
        this.options.onScoreUpdate?.({ game: 'goldminer', score: cash, high: this.scores.goldminerHigh });
      }
    });

    this.flappyBugEngine = new FlappyBugEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (score) => {
        this.scores.flappyScore = score;
        if (score > this.scores.flappyHigh) {
          this.scores.flappyHigh = score;
          localStorage.setItem('dever_flappy_high', score.toString());
        }
        questManager.incrementProgress?.('flappy_bug_score', 1);
        try {
          questManager.addPoints?.(10, 'Vượt chướng ngại vật Flappy Bug');
        } catch (_) {}
        this.options.onScoreUpdate?.({ game: 'flappybug', score, high: this.scores.flappyHigh });
      }
    });

    this.geometryDashEngine = new GeometryDashEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (pct) => {
        this.scores.dashPercent = pct;
        if (pct > this.scores.dashHighPercent) {
          this.scores.dashHighPercent = pct;
          localStorage.setItem('dever_dash_best', pct.toString());
        }
        if (pct > 0 && pct % 20 === 0) {
          try {
            questManager.addPoints?.(15, 'Tiến độ Dever Dash');
          } catch (_) {}
        }
        this.options.onScoreUpdate?.({ game: 'geometrydash', score: pct, high: this.scores.dashHighPercent });
      }
    });

    this.match3Engine = new Match3Engine(this.canvas, this.juiceFX, {
      onScoreUpdate: (score) => {
        this.scores.match3Score = score;
        if (score > this.scores.match3High) {
          this.scores.match3High = score;
          localStorage.setItem('dever_match3_high', score.toString());
        }
        if (score >= 1500) {
          try {
            questManager.incrementProgress?.('arcade_games_played', 1);
            questManager.addPoints?.(20, 'Đạt sao Cyber Match');
          } catch (_) {}
        }
        this.options.onScoreUpdate?.({ game: 'match3', score, high: this.scores.match3High });
      }
    });

    this.pacmanEngine = new PacmanEngine(this.canvas, this.juiceFX, {
      onScoreUpdate: (score) => {
        this.scores.pacmanScore = score;
        if (score > this.scores.pacmanHigh) {
          this.scores.pacmanHigh = score;
          localStorage.setItem('dever_pacman_high', score.toString());
        }
        if (score >= 500) {
          try {
            questManager.incrementProgress?.('arcade_games_played', 1);
            questManager.addPoints?.(25, 'Điểm số Cyber Pac-Man');
          } catch (_) {}
        }
        this.options.onScoreUpdate?.({ game: 'pacman', score, high: this.scores.pacmanHigh });
      }
    });
  }

  initCompatibilityAdapters() {
    this.snake = { gameOver: false, score: 0 };
    this.sokoban = { level: 0, won: false };
    this.miner = { score: 0 };
    this.flappy = { score: 0 };
    this.dash = { percent: 0 };
    this.match3 = { score: 0 };
    this.pacman = { score: 0 };
  }

  setGame(gameId) {
    this.currentGame = gameId;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // Bố cục playfield theo hướng màn hình (2026-10-09, yêu cầu của Hưng):
  // desktop giữ nguyên 640×360; mobile portrait → 480×640 (3:4, tận dụng
  // chiều dọc); mobile landscape → 720×360 (2:1, tận dụng chiều ngang).
  // Tốc độ px/sec của các engine không đổi nên độ khó giữ nguyên.
  getOrientationLayout() {
    if (!isTouchDevice()) return { w: 640, h: 360 };
    const portrait = window.innerHeight >= window.innerWidth;
    return portrait ? { w: 480, h: 640 } : { w: 720, h: 360 };
  }

  getCurrentEngine() {
    if (this.currentGame === 'snake') return this.snakeEngine;
    if (this.currentGame === 'sokoban') return this.sokobanEngine;
    if (this.currentGame === 'goldminer') return this.goldMinerEngine;
    if (this.currentGame === 'flappybug') return this.flappyBugEngine;
    if (this.currentGame === 'geometrydash') return this.geometryDashEngine;
    if (this.currentGame === 'match3') return this.match3Engine;
    if (this.currentGame === 'pacman') return this.pacmanEngine;
    return null;
  }

  // Đặt lại kích thước logic của canvas theo hướng hiện tại.
  // Trả về true nếu kích thước thực sự thay đổi. Các engine giữ state,
  // chỉ kẹp (clamp) thực thể vào biên mới qua resize(w, h).
  applyOrientationLayout() {
    const { w, h } = this.getOrientationLayout();
    if (this.canvas.width === w && this.canvas.height === h) return false;
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
    this.getCurrentEngine()?.resize?.(w, h);
    return true;
  }

  handleOrientationChange() {
    if (!this.isRunning) return;
    this.applyOrientationLayout();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.activationGraceUntil = Date.now() + 250;
    this.touchSwipeStart = null;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.addEventListener('resize', this.handleOrientationChange);
    window.addEventListener('orientationchange', this.handleOrientationChange);

    // Áp dụng playfield theo hướng màn hình TRƯỚC khi reset game,
    // để reset() dùng đúng cols/rows mới.
    this.applyOrientationLayout();

    // Reset game hiện tại
    if (this.currentGame === 'snake') this.snakeEngine.reset();
    else if (this.currentGame === 'sokoban') this.sokobanEngine.loadLevel(this.sokobanEngine.currentLevelIndex);
    else if (this.currentGame === 'goldminer') this.goldMinerEngine.resetDay();
    else if (this.currentGame === 'flappybug') this.flappyBugEngine.reset();
    else if (this.currentGame === 'geometrydash') this.geometryDashEngine.reset();
    else if (this.currentGame === 'match3') this.match3Engine.resetGame();
    else if (this.currentGame === 'pacman') this.pacmanEngine.reset();

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('resize', this.handleOrientationChange);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
  }

  handleKeyDown(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    this.keys[e.key] = true;

    // Ngăn chặn cuộn trang
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyE', 'KeyU', 'Enter'].includes(
        e.code
      ) ||
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
    ) {
      e.preventDefault();
    }

    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (this.currentGame === 'snake') {
      if (this.snakeEngine.handleKeyDown) {
        this.snakeEngine.handleKeyDown(e);
      } else {
        if (key === 'w' || code === 'ArrowUp' || key === 'arrowup' || code === 'KeyW') this.snakeEngine.setDirection(0, -1);
        else if (key === 's' || code === 'ArrowDown' || key === 'arrowdown' || code === 'KeyS') this.snakeEngine.setDirection(0, 1);
        else if (key === 'a' || code === 'ArrowLeft' || key === 'arrowleft' || code === 'KeyA') this.snakeEngine.setDirection(-1, 0);
        else if (key === 'd' || code === 'ArrowRight' || key === 'arrowright' || code === 'KeyD') this.snakeEngine.setDirection(1, 0);
        else if (code === 'ShiftLeft' || code === 'ShiftRight') this.snakeEngine.setBoosting(true);
        else if (code === 'KeyR' || key === 'r') this.snakeEngine.reset();
        else if (code === 'Space' || code === 'KeyE' || key === 'e' || key === 'enter' || code === 'Enter') {
          this.snakeEngine.onActionTrigger();
        }
      }
    } else if (this.currentGame === 'sokoban') {
      if (this.sokobanEngine.handleKeyDown) {
        this.sokobanEngine.handleKeyDown(e);
      } else {
        if (key === 'w' || code === 'ArrowUp' || key === 'arrowup' || code === 'KeyW') this.sokobanEngine.move(0, -1);
        else if (key === 's' || code === 'ArrowDown' || key === 'arrowdown' || code === 'KeyS') this.sokobanEngine.move(0, 1);
        else if (key === 'a' || code === 'ArrowLeft' || key === 'arrowleft' || code === 'KeyA') this.sokobanEngine.move(-1, 0);
        else if (key === 'd' || code === 'ArrowRight' || key === 'arrowright' || code === 'KeyD') this.sokobanEngine.move(1, 0);
        else if (key === 'u' || code === 'KeyU' || key === 'z' || code === 'KeyZ' || code === 'Backspace') this.sokobanEngine.undo();
        else if (key === 'r' || code === 'KeyR') this.sokobanEngine.restartLevel?.();
        else if (key === 'l' || code === 'KeyL') this.sokobanEngine.toggleLevelSelect?.();
        else if (code === 'Space' || code === 'KeyE' || key === 'e' || key === 'enter' || code === 'Enter') {
          this.sokobanEngine.onActionTrigger();
        }
      }
    } else if (this.currentGame === 'goldminer') {
      if (this.goldMinerEngine.handleKeyDown) {
        this.goldMinerEngine.handleKeyDown(e);
      } else if (
        code === 'Space' ||
        key === ' ' ||
        code === 'Enter' ||
        key === 'enter' ||
        code === 'KeyE' ||
        key === 'e' ||
        code === 'ArrowDown' ||
        key === 'arrowdown' ||
        code === 'KeyS' ||
        key === 's'
      ) {
        this.goldMinerEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'flappybug') {
      if (this.flappyBugEngine.handleKeyDown) {
        this.flappyBugEngine.handleKeyDown(e);
      } else {
        this.flappyBugEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'geometrydash') {
      if (this.geometryDashEngine.handleKeyDown) {
        this.geometryDashEngine.handleKeyDown(e);
      } else {
        this.geometryDashEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'match3') {
      if (this.match3Engine.handleKeyDown) {
        this.match3Engine.handleKeyDown(e);
      }
    } else if (this.currentGame === 'pacman') {
      if (this.pacmanEngine.handleKeyDown) {
        this.pacmanEngine.handleKeyDown(e);
      } else {
        this.pacmanEngine.onActionTrigger();
      }
    }
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;
    const code = e.code || '';
    if (this.currentGame === 'snake') {
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.snakeEngine.setBoosting(false);
      }
      if (this.snakeEngine.handleKeyUp) {
        this.snakeEngine.handleKeyUp(e);
      }
    } else if (this.currentGame === 'geometrydash') {
      if (this.geometryDashEngine.handleKeyUp) {
        this.geometryDashEngine.handleKeyUp(e);
      }
    } else if (this.currentGame === 'pacman') {
      if (this.pacmanEngine.handleKeyUp) {
        this.pacmanEngine.handleKeyUp(e);
      }
    }
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / (rect.width || 1);
    const scaleY = this.canvas.height / (rect.height || 1);
    const clientX = e.touches ? (e.touches[0] || e.changedTouches?.[0])?.clientX || 0 : e.clientX;
    const clientY = e.touches ? (e.touches[0] || e.changedTouches?.[0])?.clientY || 0 : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  handleMouseDown(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    if (this.currentGame === 'match3') {
      const coords = this.getCanvasCoords(e);
      this.match3Engine?.handlePointerDown(coords.x, coords.y);
    } else {
      this.handleClick(e);
    }
  }

  handleMouseUp(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    if (this.currentGame === 'match3') {
      const coords = this.getCanvasCoords(e);
      this.match3Engine?.handlePointerUp(coords.x, coords.y);
    }
  }

  handleTouchStart(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    if (this.currentGame === 'match3') {
      const coords = this.getCanvasCoords(e);
      this.match3Engine?.handlePointerDown(coords.x, coords.y);
    } else if (
      this.currentGame === 'snake' ||
      this.currentGame === 'pacman' ||
      this.currentGame === 'sokoban'
    ) {
      // Game định hướng: hoãn xử lý đến touchend để phân biệt tap vs swipe.
      // (flappy/dash/goldminer vẫn phản hồi ngay trên touchstart vì cần latency thấp.)
      this.touchSwipeStart = this.getCanvasCoords(e);
    } else {
      this.handleClick(e);
    }
  }

  handleTouchEnd(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    if (this.currentGame === 'match3') {
      const coords = this.getCanvasCoords(e);
      this.match3Engine?.handlePointerUp(coords.x, coords.y);
      return;
    }
    if (
      (this.currentGame === 'snake' ||
        this.currentGame === 'pacman' ||
        this.currentGame === 'sokoban') &&
      this.touchSwipeStart
    ) {
      const start = this.touchSwipeStart;
      this.touchSwipeStart = null;
      const end = this.getCanvasCoords(e);
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      if (Math.hypot(dx, dy) >= this.SWIPE_THRESHOLD_PX) {
        // Vuốt: đổi hướng theo trục chính của hướng vuốt
        const horiz = Math.abs(dx) > Math.abs(dy);
        const sx = horiz ? Math.sign(dx) : 0;
        const sy = horiz ? 0 : Math.sign(dy);
        if (this.currentGame === 'snake') this.snakeEngine?.setDirection(sx, sy);
        else if (this.currentGame === 'pacman') this.pacmanEngine?.setDirection(sx, sy);
        else if (this.currentGame === 'sokoban') this.sokobanEngine?.move(sx, sy);
      } else {
        // Tap: giữ nguyên hành vi cũ (đổi hướng theo vị trí chạm tương đối)
        this.handleTapAt(start.x, start.y);
      }
    }
  }

  // Xử lý tap tại tọa độ logic (x, y) cho game định hướng — dùng chung cho
  // touchend (tap) để giữ hành vi tap-relative-direction hiện tại.
  handleTapAt(x, y) {
    if (this.currentGame === 'snake') {
      if (this.snakeEngine.handlePointerClick) this.snakeEngine.handlePointerClick(x, y);
      else this.snakeEngine.onActionTrigger();
    } else if (this.currentGame === 'pacman') {
      if (this.pacmanEngine.handlePointerClick) this.pacmanEngine.handlePointerClick(x, y);
      else this.pacmanEngine.onActionTrigger();
    } else if (this.currentGame === 'sokoban') {
      if (this.sokobanEngine.handlePointerClick) this.sokobanEngine.handlePointerClick(x, y);
      else this.sokobanEngine.onActionTrigger();
    }
  }

  handleClick(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / (rect.width || 1);
    const scaleY = this.canvas.height / (rect.height || 1);
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (this.currentGame === 'snake') {
      if (this.snakeEngine.handlePointerClick) {
        this.snakeEngine.handlePointerClick(x, y);
      } else {
        this.snakeEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'sokoban') {
      if (this.sokobanEngine.handlePointerClick) {
        this.sokobanEngine.handlePointerClick(x, y);
      } else {
        this.sokobanEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'goldminer') {
      if (this.goldMinerEngine.handlePointerClick) {
        this.goldMinerEngine.handlePointerClick(x, y);
      } else {
        this.goldMinerEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'flappybug') {
      if (this.flappyBugEngine.handlePointerClick) {
        this.flappyBugEngine.handlePointerClick(x, y);
      } else {
        this.flappyBugEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'geometrydash') {
      if (this.geometryDashEngine.handlePointerClick) {
        this.geometryDashEngine.handlePointerClick(x, y);
      } else {
        this.geometryDashEngine.onActionTrigger();
      }
    } else if (this.currentGame === 'match3') {
      this.match3Engine?.handlePointerUp(x, y);
    } else if (this.currentGame === 'pacman') {
      if (this.pacmanEngine.handlePointerClick) {
        this.pacmanEngine.handlePointerClick(x, y);
      } else {
        this.pacmanEngine.onActionTrigger();
      }
    }
  }

  loop(timestamp) {
    if (!this.isRunning) return;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.juiceFX.update(dt);

    if (this.currentGame === 'snake') {
      this.snakeEngine.update(dt);
    } else if (this.currentGame === 'sokoban') {
      this.sokobanEngine.update(dt);
    } else if (this.currentGame === 'goldminer') {
      this.goldMinerEngine.update(dt);
    } else if (this.currentGame === 'flappybug') {
      this.flappyBugEngine.update(dt);
    } else if (this.currentGame === 'geometrydash') {
      this.geometryDashEngine.update(dt);
    } else if (this.currentGame === 'match3') {
      this.match3Engine.update(dt);
    } else if (this.currentGame === 'pacman') {
      this.pacmanEngine.update(dt);
    }
  }

  render() {
    this.ctx.save();

    if (this.juiceFX.shakeOffset.x !== 0 || this.juiceFX.shakeOffset.y !== 0) {
      this.ctx.translate(this.juiceFX.shakeOffset.x, this.juiceFX.shakeOffset.y);
    }

    if (this.currentGame === 'snake') {
      this.snakeEngine.render();
    } else if (this.currentGame === 'sokoban') {
      this.sokobanEngine.render();
    } else if (this.currentGame === 'goldminer') {
      this.goldMinerEngine.render();
    } else if (this.currentGame === 'flappybug') {
      this.flappyBugEngine.render();
    } else if (this.currentGame === 'geometrydash') {
      this.geometryDashEngine.render();
    } else if (this.currentGame === 'match3') {
      this.match3Engine.render();
    } else if (this.currentGame === 'pacman') {
      this.pacmanEngine.render();
    }

    this.juiceFX.render(this.ctx);
    this.ctx.restore();
  }

  moveUp() {
    if (this.currentGame === 'snake') this.snakeEngine?.setDirection(0, -1);
    else if (this.currentGame === 'pacman') this.pacmanEngine?.setDirection(0, -1);
    else if (this.currentGame === 'sokoban') this.sokobanEngine?.move(0, -1);
    else if (this.currentGame === 'flappybug') this.flappyBugEngine?.flap();
    else if (this.currentGame === 'geometrydash') this.geometryDashEngine?.jump();
    else if (this.currentGame === 'match3') this.match3Engine?.handleKeyDown({ code: 'ArrowUp' });
  }

  moveDown() {
    if (this.currentGame === 'snake') this.snakeEngine?.setDirection(0, 1);
    else if (this.currentGame === 'pacman') this.pacmanEngine?.setDirection(0, 1);
    else if (this.currentGame === 'sokoban') this.sokobanEngine?.move(0, 1);
    else if (this.currentGame === 'goldminer') this.goldMinerEngine?.onActionTrigger();
    else if (this.currentGame === 'match3') this.match3Engine?.handleKeyDown({ code: 'ArrowDown' });
  }

  moveLeft() {
    if (this.currentGame === 'snake') this.snakeEngine?.setDirection(-1, 0);
    else if (this.currentGame === 'pacman') this.pacmanEngine?.setDirection(-1, 0);
    else if (this.currentGame === 'sokoban') this.sokobanEngine?.move(-1, 0);
    else if (this.currentGame === 'match3') this.match3Engine?.handleKeyDown({ code: 'ArrowLeft' });
  }

  moveRight() {
    if (this.currentGame === 'snake') this.snakeEngine?.setDirection(1, 0);
    else if (this.currentGame === 'pacman') this.pacmanEngine?.setDirection(1, 0);
    else if (this.currentGame === 'sokoban') this.sokobanEngine?.move(1, 0);
    else if (this.currentGame === 'match3') this.match3Engine?.handleKeyDown({ code: 'ArrowRight' });
  }

  undo() {
    if (this.currentGame === 'sokoban') this.sokobanEngine?.undo();
  }

  triggerAction() {
    if (this.currentGame === 'snake') this.snakeEngine?.onActionTrigger();
    else if (this.currentGame === 'pacman') this.pacmanEngine?.onActionTrigger();
    else if (this.currentGame === 'sokoban') this.sokobanEngine?.onActionTrigger();
    else if (this.currentGame === 'goldminer') this.goldMinerEngine?.onActionTrigger();
    else if (this.currentGame === 'flappybug') this.flappyBugEngine?.onActionTrigger();
    else if (this.currentGame === 'geometrydash') this.geometryDashEngine?.onActionTrigger();
    else if (this.currentGame === 'match3') this.match3Engine?.handleKeyDown({ code: 'Space' });
  }
}
