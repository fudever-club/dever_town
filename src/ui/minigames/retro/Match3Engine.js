/**
 * DEVER TOWN - CYBER CANDY MATCH-3 ENGINE (Candy Crush Clone)
 * Động cơ giải đố Match-3 vi mạch công nghệ cao phong cách Candy Crush Saga:
 * - Bàn cờ 8x8 với 6 loại ngọc vi mạch công nghệ (Ruby, Sapphire, Emerald, Topaz, Amethyst, Cyber Star)
 * - Tương tác kéo thả chuột/cảm ứng (Drag & Drop) và Click-to-Swap mượt mà
 * - Kẹo đặc biệt: Kẹo Sọc (quét hàng/cột), Kẹo Bọc (bom nổ 3x3 kép), Kẹo Cầu Vồng (tiêu diệt toàn bộ 1 màu)
 * - Combo đặc biệt: Sọc + Sọc, Sọc + Bọc, Cầu Vồng + Sọc, Cầu Vồng + Cầu Vồng (Sugar Crush Mega Bomb)
 * - Trọng lực rơi tự do & Nổ dây chuyền liên hoàn (Cascade Chains) với hệ số nhân điểm combo
 * - Chống bế tắc tự động (Deadlock Auto-Shuffle) và Tự động gợi ý nước đi (Auto-Hint)
 */
import { MATCH3_CONFIG } from '../../../config/minigamesConfig.js';
import { isTouchDevice } from '../common/touchHints.js';

export class Match3Engine {
  constructor(canvas, juiceFX = null, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;
    // Hint điều khiển in-canvas phải đúng thiết bị (2026-10-09, yêu cầu của Hưng).
    this.isTouch = isTouchDevice();
    this.config = MATCH3_CONFIG;

    this.state = 'ready'; // 'ready', 'swapping', 'swapping_back', 'clearing', 'dropping', 'game_over', 'game_clear'
    this.rows = this.config.grid.rows;
    this.cols = this.config.grid.cols;
    this.cellSize = this.config.grid.cellSize;
    this.cellGap = this.config.grid.cellGap;
    this.startX = this.config.grid.startX;
    this.startY = this.config.grid.startY;

    this.grid = []; // 2D array [row][col] of Gem objects
    this.selectedCell = null; // { r, c }
    this.dragStart = null; // { x, y, r, c }
    this.cursor = { r: 3, c: 3 }; // Keyboard cursor

    this.movesLeft = this.config.rules.movesLimit;
    this.score = 0;
    this.highScore = typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('dever_match3_high') || '0', 10) : 0;
    this.combo = 0;
    this.lastActionTime = Date.now();
    this.hintPair = null; // [ {r, c}, {r, c} ]
    this.hintTimer = 0;

    // Hiệu ứng Visual Juice
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.lasers = [];
    this.screenShake = 0;

    // Hoạt họa Swap & Drop
    this.swapAnimation = null; // { r1, c1, r2, c2, progress, duration, isReverting, onFinish }
    this.clearingAnimation = null; // { matchedKeys: Set, progress, duration, specialSpawns }
    this.shuffleAnimation = null; // { progress, duration }

    // Âm thanh procedural
    this.audioCtx = null;
    this.initAudio();

    // Khởi tạo bàn cờ
    this.initBoard();
  }

  initAudio() {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
    } catch {
      this.audioCtx = null;
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.12, gainVal = 0.15) {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }

  playPopSound(pitchMultiplier = 1) {
    this.playTone(420 * pitchMultiplier, 'sine', 0.08, 0.14);
  }

  playLaserSound() {
    this.playTone(880, 'sawtooth', 0.22, 0.18);
  }

  playBombSound() {
    this.playTone(150, 'triangle', 0.35, 0.25);
  }

  getCellPos(r, c) {
    const totalCell = this.cellSize + this.cellGap;
    return {
      x: this.startX + c * totalCell + this.cellSize / 2,
      y: this.startY + r * totalCell + this.cellSize / 2
    };
  }

  getCellFromCoords(x, y) {
    const totalCell = this.cellSize + this.cellGap;
    if (
      x < this.startX ||
      x >= this.startX + this.cols * totalCell ||
      y < this.startY ||
      y >= this.startY + this.rows * totalCell
    ) {
      return null;
    }
    const c = Math.floor((x - this.startX) / totalCell);
    const r = Math.floor((y - this.startY) / totalCell);
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      return { r, c };
    }
    return null;
  }

  createGem(type, special = this.config.specialTypes.NONE, r = 0, c = 0) {
    const pos = this.getCellPos(r, c);
    return {
      type,
      special, // 0: None, 1: Striped_H, 2: Striped_V, 3: Wrapped, 4: Color_Bomb
      x: pos.x,
      y: pos.y,
      targetX: pos.x,
      targetY: pos.y,
      scale: 1.0,
      alpha: 1.0,
      vy: 0,
      isMatched: false
    };
  }

  initBoard() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        let type;
        let attempts = 0;
        do {
          type = Math.floor(Math.random() * this.config.gemTypes.length);
          attempts++;
        } while (
          attempts < 50 &&
          ((c >= 2 && this.grid[r][c - 1]?.type === type && this.grid[r][c - 2]?.type === type) ||
            (r >= 2 && this.grid[r - 1][c]?.type === type && this.grid[r - 2][c]?.type === type))
        );
        this.grid[r][c] = this.createGem(type, this.config.specialTypes.NONE, r, c);
      }
    }

    // Đảm bảo bàn cờ luôn có ít nhất 1 nước đi hợp lệ
    if (!this.hasValidMoves()) {
      this.shuffleBoard(false);
    }

    this.state = 'ready';
    this.selectedCell = null;
    this.combo = 0;
    this.lastActionTime = Date.now();
    this.hintPair = null;
  }

  resetGame() {
    this.movesLeft = this.config.rules.movesLimit;
    this.score = 0;
    this.combo = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.lasers = [];
    this.initBoard();
  }

  // ==========================================
  // THUẬT TOÁN NHẬN DIỆN MATCH & KẸO ĐẶC BIỆT
  // ==========================================
  findAllMatches() {
    const matchedCells = new Set();
    const horizontalRuns = [];
    const verticalRuns = [];

    // 1. Quét theo hàng ngang
    for (let r = 0; r < this.rows; r++) {
      let currentType = -1;
      let runStart = 0;
      let runLen = 0;

      for (let c = 0; c <= this.cols; c++) {
        const gem = c < this.cols ? this.grid[r][c] : null;
        const type = gem ? gem.type : -1;

        if (type !== -1 && type === currentType) {
          runLen++;
        } else {
          if (runLen >= 3 && currentType !== -1) {
            horizontalRuns.push({ r, startC: runStart, len: runLen, type: currentType });
            for (let i = runStart; i < runStart + runLen; i++) {
              matchedCells.add(`${r},${i}`);
            }
          }
          currentType = type;
          runStart = c;
          runLen = 1;
        }
      }
    }

    // 2. Quét theo cột dọc
    for (let c = 0; c < this.cols; c++) {
      let currentType = -1;
      let runStart = 0;
      let runLen = 0;

      for (let r = 0; r <= this.rows; r++) {
        const gem = r < this.rows ? this.grid[r][c] : null;
        const type = gem ? gem.type : -1;

        if (type !== -1 && type === currentType) {
          runLen++;
        } else {
          if (runLen >= 3 && currentType !== -1) {
            verticalRuns.push({ c, startR: runStart, len: runLen, type: currentType });
            for (let i = runStart; i < runStart + runLen; i++) {
              matchedCells.add(`${i},${c}`);
            }
          }
          currentType = type;
          runStart = r;
          runLen = 1;
        }
      }
    }

    // 3. Xác định vị trí sinh kẹo đặc biệt (Special Spawns)
    const specialSpawns = [];
    const usedForSpecial = new Set();

    // 3a. Kiểm tra giao nhau giữa hàng và cột (L hoặc T Shape -> WRAPPED Bomb)
    for (const h of horizontalRuns) {
      for (const v of verticalRuns) {
        if (h.type === v.type && v.c >= h.startC && v.c < h.startC + h.len && h.r >= v.startR && h.r < v.startR + v.len) {
          const key = `${h.r},${v.c}`;
          if (!usedForSpecial.has(key)) {
            specialSpawns.push({
              r: h.r,
              c: v.c,
              type: h.type,
              special: this.config.specialTypes.WRAPPED
            });
            usedForSpecial.add(key);
          }
        }
      }
    }

    // 3b. Kiểm tra 5 viên thẳng hàng -> COLOR_BOMB
    for (const h of horizontalRuns) {
      if (h.len >= 5) {
        const midC = h.startC + Math.floor(h.len / 2);
        const key = `${h.r},${midC}`;
        if (!usedForSpecial.has(key)) {
          specialSpawns.push({
            r: h.r,
            c: midC,
            type: 0, // Rainbow
            special: this.config.specialTypes.COLOR_BOMB
          });
          usedForSpecial.add(key);
        }
      }
    }
    for (const v of verticalRuns) {
      if (v.len >= 5) {
        const midR = v.startR + Math.floor(v.len / 2);
        const key = `${midR},${v.c}`;
        if (!usedForSpecial.has(key)) {
          specialSpawns.push({
            r: midR,
            c: v.c,
            type: 0,
            special: this.config.specialTypes.COLOR_BOMB
          });
          usedForSpecial.add(key);
        }
      }
    }

    // 3c. Kiểm tra 4 viên thẳng hàng -> STRIPED CANDY
    for (const h of horizontalRuns) {
      if (h.len === 4) {
        const midC = h.startC + 1;
        const key = `${h.r},${midC}`;
        if (!usedForSpecial.has(key)) {
          specialSpawns.push({
            r: h.r,
            c: midC,
            type: h.type,
            special: this.config.specialTypes.STRIPED_H
          });
          usedForSpecial.add(key);
        }
      }
    }
    for (const v of verticalRuns) {
      if (v.len === 4) {
        const midR = v.startR + 1;
        const key = `${midR},${v.c}`;
        if (!usedForSpecial.has(key)) {
          specialSpawns.push({
            r: midR,
            c: v.c,
            type: v.type,
            special: this.config.specialTypes.STRIPED_V
          });
          usedForSpecial.add(key);
        }
      }
    }

    return { matchedCells, specialSpawns };
  }

  // ==========================================
  // THAO TÁC HOÁN ĐỔI (SWAP MECHANISM)
  // ==========================================
  areNeighbors(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  requestSwap(r1, c1, r2, c2) {
    if (this.state !== 'ready') return false;
    if (!this.areNeighbors(r1, c1, r2, c2)) return false;

    const gemA = this.grid[r1][c1];
    const gemB = this.grid[r2][c2];
    if (!gemA || !gemB) return false;

    this.state = 'swapping';
    this.selectedCell = null;
    this.hintPair = null;
    this.lastActionTime = Date.now();

    const isSpecialCombo =
      (gemA.special === this.config.specialTypes.COLOR_BOMB && gemB.special !== this.config.specialTypes.NONE) ||
      (gemB.special === this.config.specialTypes.COLOR_BOMB && gemA.special !== this.config.specialTypes.NONE) ||
      (gemA.special !== this.config.specialTypes.NONE && gemB.special !== this.config.specialTypes.NONE) ||
      gemA.special === this.config.specialTypes.COLOR_BOMB ||
      gemB.special === this.config.specialTypes.COLOR_BOMB;

    this.swapAnimation = {
      r1,
      c1,
      r2,
      c2,
      gemA,
      gemB,
      progress: 0,
      duration: this.config.timings.swapDurationMs / 1000,
      isReverting: false,
      isSpecialCombo
    };

    this.playTone(520, 'sine', 0.1, 0.1);
    return true;
  }

  finishSwap(r1, c1, r2, c2, isReverting = false, isSpecialCombo = false) {
    // Hoán đổi ô trong mảng
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;

    // Cập nhật vị trí tọa độ
    const posA = this.getCellPos(r1, c1);
    const posB = this.getCellPos(r2, c2);
    this.grid[r1][c1].x = posA.x;
    this.grid[r1][c1].y = posA.y;
    this.grid[r2][c2].x = posB.x;
    this.grid[r2][c2].y = posB.y;

    if (isReverting) {
      this.state = 'ready';
      this.swapAnimation = null;
      return;
    }

    // Xử lý Special Combo đặc biệt nếu có
    if (isSpecialCombo) {
      this.movesLeft = Math.max(0, this.movesLeft - 1);
      this.swapAnimation = null;
      this.executeSpecialCombo(r1, c1, r2, c2);
      return;
    }

    // Kiểm tra match thông thường
    const { matchedCells, specialSpawns } = this.findAllMatches();
    if (matchedCells.size > 0) {
      this.movesLeft = Math.max(0, this.movesLeft - 1);
      this.swapAnimation = null;
      this.combo = 1;
      this.startClearing(matchedCells, specialSpawns);
    } else {
      // Không hợp lệ -> Trượt trả về
      this.playTone(260, 'sawtooth', 0.15, 0.12);
      this.swapAnimation = {
        r1,
        c1,
        r2,
        c2,
        gemA: this.grid[r1][c1],
        gemB: this.grid[r2][c2],
        progress: 0,
        duration: this.config.timings.swapDurationMs / 1000,
        isReverting: true
      };
      this.state = 'swapping_back';
    }
  }

  // ==========================================
  // XỬ LÝ COMBO KẸO ĐẶC BIỆT KHI HOÁN ĐỔI
  // ==========================================
  executeSpecialCombo(r1, c1, r2, c2) {
    const gemA = this.grid[r1][c1];
    const gemB = this.grid[r2][c2];
    const cellsToClear = new Set();
    const st = this.config.specialTypes;

    // 1. Cầu Vồng + Cầu Vồng -> Xóa toàn bộ bàn cờ (Sugar Crush Mega Bomb)
    if (gemA.special === st.COLOR_BOMB && gemB.special === st.COLOR_BOMB) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          cellsToClear.add(`${r},${c}`);
        }
      }
      this.screenShake = 16;
      this.playBombSound();
      this.spawnFloatingText('MEGA CRUSH!', 320, 180, '#facc15', 30);
    }
    // 2. Cầu Vồng + Kẹo Sọc -> Biến tất cả cùng màu thành Sọc và kích nổ
    else if (
      (gemA.special === st.COLOR_BOMB && (gemB.special === st.STRIPED_H || gemB.special === st.STRIPED_V)) ||
      (gemB.special === st.COLOR_BOMB && (gemA.special === st.STRIPED_H || gemA.special === st.STRIPED_V))
    ) {
      const targetColor = gemA.special === st.COLOR_BOMB ? gemB.type : gemA.type;
      cellsToClear.add(`${r1},${c1}`);
      cellsToClear.add(`${r2},${c2}`);

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const g = this.grid[r][c];
          if (g && g.type === targetColor) {
            g.special = Math.random() > 0.5 ? st.STRIPED_H : st.STRIPED_V;
            cellsToClear.add(`${r},${c}`);
          }
        }
      }
      this.screenShake = 12;
      this.playLaserSound();
      this.spawnFloatingText('SUPER LASER!', 320, 180, '#00d2ff', 26);
    }
    // 3. Cầu Vồng + Kẹo Thường -> Tiêu diệt toàn bộ viên màu đó
    else if (gemA.special === st.COLOR_BOMB || gemB.special === st.COLOR_BOMB) {
      const targetColor = gemA.special === st.COLOR_BOMB ? gemB.type : gemA.type;
      cellsToClear.add(`${r1},${c1}`);
      cellsToClear.add(`${r2},${c2}`);

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const g = this.grid[r][c];
          if (g && g.type === targetColor) {
            cellsToClear.add(`${r},${c}`);
          }
        }
      }
      this.screenShake = 8;
      this.playLaserSound();
      this.spawnFloatingText('COLOR BLAST!', 320, 180, '#ec4899', 24);
    }
    // 4. Kẹo Sọc + Kẹo Sọc -> Chữ thập 1 hàng + 1 cột
    else if (
      (gemA.special === st.STRIPED_H || gemA.special === st.STRIPED_V) &&
      (gemB.special === st.STRIPED_H || gemB.special === st.STRIPED_V)
    ) {
      this.addCrossCells(r2, c2, cellsToClear);
      this.screenShake = 9;
      this.playLaserSound();
      this.spawnFloatingText('CROSS LASER!', 320, 180, '#38bdf8', 22);
    }
    // 5. Kẹo Sọc + Kẹo Bọc -> Laser khổng lồ 3 hàng + 3 cột
    else if (
      ((gemA.special === st.STRIPED_H || gemA.special === st.STRIPED_V) && gemB.special === st.WRAPPED) ||
      (gemA.special === st.WRAPPED && (gemB.special === st.STRIPED_H || gemB.special === st.STRIPED_V))
    ) {
      for (let ro = -1; ro <= 1; ro++) {
        const tr = r2 + ro;
        if (tr >= 0 && tr < this.rows) {
          for (let c = 0; c < this.cols; c++) cellsToClear.add(`${tr},${c}`);
        }
      }
      for (let co = -1; co <= 1; co++) {
        const tc = c2 + co;
        if (tc >= 0 && tc < this.cols) {
          for (let r = 0; r < this.rows; r++) cellsToClear.add(`${r},${tc}`);
        }
      }
      this.screenShake = 14;
      this.playBombSound();
      this.spawnFloatingText('MEGA CROSS!', 320, 180, '#f59e0b', 26);
    }
    // 6. Kẹo Bọc + Kẹo Bọc -> Bom nổ diện rộng 5x5
    else if (gemA.special === st.WRAPPED && gemB.special === st.WRAPPED) {
      for (let ro = -2; ro <= 2; ro++) {
        for (let co = -2; co <= 2; co++) {
          const tr = r2 + ro;
          const tc = c2 + co;
          if (tr >= 0 && tr < this.rows && tc >= 0 && tc < this.cols) {
            cellsToClear.add(`${tr},${tc}`);
          }
        }
      }
      this.screenShake = 15;
      this.playBombSound();
      this.spawnFloatingText('DOUBLE BOMB!', 320, 180, '#ef4444', 26);
    }

    this.combo = 1;
    this.startClearing(cellsToClear, []);
  }

  addCrossCells(centerR, centerC, cellsSet) {
    for (let c = 0; c < this.cols; c++) cellsSet.add(`${centerR},${c}`);
    for (let r = 0; r < this.rows; r++) cellsSet.add(`${r},${centerC}`);
    const pos = this.getCellPos(centerR, centerC);
    this.lasers.push({ y: pos.y, isHorizontal: true, alpha: 1.0 });
    this.lasers.push({ x: pos.x, isHorizontal: false, alpha: 1.0 });
  }

  // ==========================================
  // XÓA ĐIỂM, KÍCH NỔ KẸO ĐẶC BIỆT & RƠI TỰ DO
  // ==========================================
  startClearing(matchedKeys, specialSpawns) {
    this.state = 'clearing';
    const finalClearSet = new Set(matchedKeys);
    const toProcess = Array.from(matchedKeys);
    const st = this.config.specialTypes;

    // Kích nổ lan truyền (Chain reactions) của kẹo đặc biệt bị quét trúng
    while (toProcess.length > 0) {
      const key = toProcess.pop();
      const [r, c] = key.split(',').map(Number);
      const gem = this.grid[r][c];
      if (!gem) continue;

      if (gem.special === st.STRIPED_H) {
        for (let col = 0; col < this.cols; col++) {
          const k = `${r},${col}`;
          if (!finalClearSet.has(k)) {
            finalClearSet.add(k);
            toProcess.push(k);
          }
        }
        const pos = this.getCellPos(r, c);
        this.lasers.push({ y: pos.y, isHorizontal: true, alpha: 1.0 });
      } else if (gem.special === st.STRIPED_V) {
        for (let row = 0; row < this.rows; row++) {
          const k = `${row},${c}`;
          if (!finalClearSet.has(k)) {
            finalClearSet.add(k);
            toProcess.push(k);
          }
        }
        const pos = this.getCellPos(r, c);
        this.lasers.push({ x: pos.x, isHorizontal: false, alpha: 1.0 });
      } else if (gem.special === st.WRAPPED) {
        for (let ro = -1; ro <= 1; ro++) {
          for (let co = -1; co <= 1; co++) {
            const tr = r + ro;
            const tc = c + co;
            if (tr >= 0 && tr < this.rows && tc >= 0 && tc < this.cols) {
              const k = `${tr},${tc}`;
              if (!finalClearSet.has(k)) {
                finalClearSet.add(k);
                toProcess.push(k);
              }
            }
          }
        }
        const pos = this.getCellPos(r, c);
        this.shockwaves.push({ x: pos.x, y: pos.y, radius: 10, maxRadius: 55, alpha: 1.0 });
      }
    }

    // Tính điểm số
    const basePointsPerGem = 20;
    const count = finalClearSet.size;
    const comboFactor = 1 + (this.combo - 1) * 0.5;
    const gainedPoints = Math.round(count * basePointsPerGem * comboFactor);
    this.score += gainedPoints;
    this.callbacks?.onScoreUpdate?.(this.score);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dever_match3_high', this.highScore.toString());
      }
    }

    // Hiệu ứng nổ hạt & âm thanh
    for (const key of finalClearSet) {
      const [r, c] = key.split(',').map(Number);
      const gem = this.grid[r][c];
      if (gem) {
        gem.isMatched = true;
        this.spawnGemExplosion(gem.x, gem.y, gem.type);
      }
    }

    this.playPopSound(1 + (this.combo - 1) * 0.15);

    // Banner nổi Game Feel
    if (this.combo >= 4) {
      this.spawnFloatingText('CYBER CRUSH!', 320, 150, '#ec4899', 28);
    } else if (this.combo === 3) {
      this.spawnFloatingText('DELICIOUS!', 320, 150, '#a855f7', 24);
    } else if (this.combo === 2) {
      this.spawnFloatingText('SWEET!', 320, 150, '#00ff88', 22);
    }

    this.clearingAnimation = {
      matchedKeys: finalClearSet,
      specialSpawns,
      progress: 0,
      duration: 0.18
    };
  }

  finishClearing() {
    if (!this.clearingAnimation) return;
    const { matchedKeys, specialSpawns } = this.clearingAnimation;

    // 1. Xóa các gem đã nổ
    for (const key of matchedKeys) {
      const [r, c] = key.split(',').map(Number);
      this.grid[r][c] = null;
    }

    // 2. Sinh các viên kẹo đặc biệt mới tại vị trí quy định
    for (const sp of specialSpawns) {
      this.grid[sp.r][sp.c] = this.createGem(sp.type, sp.special, sp.r, sp.c);
    }

    this.clearingAnimation = null;
    this.applyGravity();
  }

  applyGravity() {
    this.state = 'dropping';
    let maxFallDistance = 0;

    for (let c = 0; c < this.cols; c++) {
      let emptyCount = 0;
      // Duyệt từ dưới đáy lên đỉnh
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] === null) {
          emptyCount++;
        } else if (emptyCount > 0) {
          // Kéo viên gem phía trên rơi xuống lấp khoảng trống
          const targetR = r + emptyCount;
          this.grid[targetR][c] = this.grid[r][c];
          this.grid[r][c] = null;

          const targetPos = this.getCellPos(targetR, c);
          this.grid[targetR][c].targetY = targetPos.y;
          this.grid[targetR][c].vy = 0;
          maxFallDistance = Math.max(maxFallDistance, emptyCount);
        }
      }

      // Sinh các viên kẹo mới rơi từ trên trần nhà xuống
      for (let i = 0; i < emptyCount; i++) {
        const targetR = emptyCount - 1 - i;
        const type = Math.floor(Math.random() * this.config.gemTypes.length);
        const newGem = this.createGem(type, this.config.specialTypes.NONE, targetR, c);

        // Vị trí xuất phát trên cao
        const targetPos = this.getCellPos(targetR, c);
        newGem.y = this.startY - (i + 1) * (this.cellSize + this.cellGap);
        newGem.targetY = targetPos.y;
        newGem.vy = 0;

        this.grid[targetR][c] = newGem;
        maxFallDistance = Math.max(maxFallDistance, i + 1);
      }
    }
  }

  checkAfterDrop() {
    // Kiểm tra xem sau khi rơi có tạo thêm Match mới không (Cascade Chain)
    const { matchedCells, specialSpawns } = this.findAllMatches();

    if (matchedCells.size > 0) {
      this.combo++;
      this.startClearing(matchedCells, specialSpawns);
    } else {
      this.combo = 0;
      // Kiểm tra Game Over hoặc Clear
      if (this.movesLeft <= 0) {
        if (this.score >= this.config.rules.targetScores.star1) {
          this.state = 'game_clear';
          this.spawnFloatingText('LEVEL COMPLETE!', 320, 160, '#00ff88', 30);
          this.callbacks?.onGameClear?.(this.score);
        } else {
          this.state = 'game_over';
          this.spawnFloatingText('OUT OF MOVES!', 320, 160, '#ef4444', 28);
        }
        return;
      }

      // Kiểm tra bế tắc (Deadlock)
      if (!this.hasValidMoves()) {
        this.shuffleBoard(true);
      } else {
        this.state = 'ready';
        this.lastActionTime = Date.now();
      }
    }
  }

  // ==========================================
  // THUẬT TOÁN CHỐNG BẾ TẮC (DEADLOCK DETECTION)
  // ==========================================
  hasValidMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const gem = this.grid[r][c];
        if (!gem) continue;

        // Color bomb luôn tạo được nước đi hợp lệ
        if (gem.special === this.config.specialTypes.COLOR_BOMB) return true;

        // Thử hoán đổi với ô bên phải
        if (c + 1 < this.cols) {
          if (this.testSwapProducesMatch(r, c, r, c + 1)) return true;
        }
        // Thử hoán đổi với ô bên dưới
        if (r + 1 < this.rows) {
          if (this.testSwapProducesMatch(r, c, r + 1, c)) return true;
        }
      }
    }
    return false;
  }

  testSwapProducesMatch(r1, c1, r2, c2) {
    const gemA = this.grid[r1][c1];
    const gemB = this.grid[r2][c2];
    if (!gemA || !gemB) return false;

    // Special combos
    if (gemA.special !== this.config.specialTypes.NONE || gemB.special !== this.config.specialTypes.NONE) {
      return true;
    }

    // Tạm hoán đổi
    this.grid[r1][c1] = gemB;
    this.grid[r2][c2] = gemA;

    const { matchedCells } = this.findAllMatches();
    const hasMatch = matchedCells.size > 0;

    // Trả lại vị trí cũ
    this.grid[r1][c1] = gemA;
    this.grid[r2][c2] = gemB;

    return hasMatch;
  }

  findHint() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (c + 1 < this.cols && this.testSwapProducesMatch(r, c, r, c + 1)) {
          return [
            { r, c },
            { r, c: c + 1 }
          ];
        }
        if (r + 1 < this.rows && this.testSwapProducesMatch(r, c, r + 1, c)) {
          return [
            { r, c },
            { r: r + 1, c }
          ];
        }
      }
    }
    return null;
  }

  shuffleBoard(withAnimation = true) {
    const allTypes = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        allTypes.push({
          type: this.grid[r][c]?.type ?? Math.floor(Math.random() * this.config.gemTypes.length),
          special: this.grid[r][c]?.special ?? this.config.specialTypes.NONE
        });
      }
    }

    let attempts = 0;
    let foundValid = false;

    while (attempts < 100 && !foundValid) {
      // Fisher-Yates shuffle
      for (let i = allTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = allTypes[i];
        allTypes[i] = allTypes[j];
        allTypes[j] = temp;
      }

      let idx = 0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const item = allTypes[idx++];
          this.grid[r][c] = this.createGem(item.type, item.special, r, c);
        }
      }

      const { matchedCells } = this.findAllMatches();
      if (matchedCells.size === 0 && this.hasValidMoves()) {
        foundValid = true;
      }
      attempts++;
    }

    if (withAnimation) {
      this.playTone(380, 'triangle', 0.25, 0.15);
      this.spawnFloatingText('SHUFFLE!', 320, 180, '#facc15', 26);
    }
    this.state = 'ready';
    this.lastActionTime = Date.now();
  }

  // ==========================================
  // HỆ THỐNG VISUAL JUICE & PARTICLES
  // ==========================================
  spawnGemExplosion(x, y, gemType) {
    const color = this.config.gemTypes[gemType]?.color || '#ffffff';
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.4;
      const speed = 70 + Math.random() * 110;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1.0,
        decay: 2.2 + Math.random() * 1.2
      });
    }
  }

  spawnFloatingText(text, x, y, color = '#ffffff', fontSize = 18) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      fontSize,
      alpha: 1.0,
      scale: 0.6,
      vy: -45,
      lifetime: 0.9,
      age: 0
    });
  }

  // ==========================================
  // VÒNG LẶP UPDATE (60 FPS)
  // ==========================================
  update(dt) {
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // 1. Cập nhật hoạt họa hoán đổi (Swap)
    if (this.swapAnimation) {
      const anim = this.swapAnimation;
      anim.progress += dt / anim.duration;

      const pos1 = this.getCellPos(anim.r1, anim.c1);
      const pos2 = this.getCellPos(anim.r2, anim.c2);

      const t = Math.min(1.0, anim.progress);
      // Smooth easeInOutQuad
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      anim.gemA.x = pos1.x + (pos2.x - pos1.x) * ease;
      anim.gemA.y = pos1.y + (pos2.y - pos1.y) * ease;
      anim.gemB.x = pos2.x + (pos1.x - pos2.x) * ease;
      anim.gemB.y = pos2.y + (pos1.y - pos2.y) * ease;

      if (anim.progress >= 1.0) {
        this.finishSwap(anim.r1, anim.c1, anim.r2, anim.c2, anim.isReverting, anim.isSpecialCombo);
        return;
      }
    }

    // 2. Cập nhật hoạt họa nổ (Clearing)
    if (this.clearingAnimation) {
      const anim = this.clearingAnimation;
      anim.progress += dt / anim.duration;

      for (const key of anim.matchedKeys) {
        const [r, c] = key.split(',').map(Number);
        const gem = this.grid[r][c];
        if (gem) {
          gem.scale = Math.max(0, 1.0 - anim.progress * 1.3);
          gem.alpha = Math.max(0, 1.0 - anim.progress);
        }
      }

      if (anim.progress >= 1.0) {
        this.finishClearing();
        return;
      }
    }

    // 3. Cập nhật vật lý rơi (Dropping)
    if (this.state === 'dropping') {
      let anyFalling = false;
      const fallSpeed = this.config.timings.fallSpeedPxPerSec;

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const gem = this.grid[r][c];
          if (gem && gem.y < gem.targetY) {
            anyFalling = true;
            gem.vy += 1600 * dt;
            gem.y += gem.vy * dt;
            if (gem.y >= gem.targetY) {
              gem.y = gem.targetY;
              gem.vy = 0;
            }
          }
        }
      }

      if (!anyFalling) {
        this.checkAfterDrop();
      }
    }

    // 4. Tự động tìm gợi ý nếu người chơi dừng thao tác
    if (this.state === 'ready') {
      if (Date.now() - this.lastActionTime > this.config.timings.hintIdleTimeMs && !this.hintPair) {
        this.hintPair = this.findHint();
      }
      if (this.hintPair) {
        this.hintTimer += dt * 3.5;
      }
    }

    // 5. Cập nhật Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Cập nhật Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.age += dt;
      ft.y += ft.vy * dt;
      ft.scale = Math.min(1.0, ft.scale + dt * 2.5);
      if (ft.age > ft.lifetime * 0.6) {
        ft.alpha = Math.max(0, 1.0 - (ft.age - ft.lifetime * 0.6) / (ft.lifetime * 0.4));
      }
      if (ft.age >= ft.lifetime) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 7. Cập nhật Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 12 * dt;
      sw.alpha -= 2.5 * dt;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 8. Cập nhật Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.alpha -= 3.2 * dt;
      if (laser.alpha <= 0) {
        this.lasers.splice(i, 1);
      }
    }
  }

  // ==========================================
  // XỬ LÝ SỰ KIỆN TƯƠNG TÁC (INPUT)
  // ==========================================
  handlePointerDown(x, y) {
    if (this.state !== 'ready') return;
    const cell = this.getCellFromCoords(x, y);
    if (!cell) return;

    this.dragStart = { x, y, r: cell.r, c: cell.c };
  }

  handlePointerUp(x, y) {
    if (this.state !== 'ready') return;

    if (this.dragStart) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;
      const dist = Math.hypot(dx, dy);

      // Kéo thả chuột/cảm ứng (Drag-to-Swap)
      if (dist >= 16) {
        let targetR = this.dragStart.r;
        let targetC = this.dragStart.c;

        if (Math.abs(dx) > Math.abs(dy)) {
          targetC += dx > 0 ? 1 : -1;
        } else {
          targetR += dy > 0 ? 1 : -1;
        }

        if (targetR >= 0 && targetR < this.rows && targetC >= 0 && targetC < this.cols) {
          this.requestSwap(this.dragStart.r, this.dragStart.c, targetR, targetC);
        }
        this.dragStart = null;
        return;
      }
    }

    // Click chọn ô (Click-to-Swap)
    const clickedCell = this.getCellFromCoords(x, y);
    if (!clickedCell) {
      this.selectedCell = null;
      return;
    }

    if (!this.selectedCell) {
      this.selectedCell = clickedCell;
      this.playTone(480, 'sine', 0.06, 0.08);
    } else {
      if (this.areNeighbors(this.selectedCell.r, this.selectedCell.c, clickedCell.r, clickedCell.c)) {
        this.requestSwap(this.selectedCell.r, this.selectedCell.c, clickedCell.r, clickedCell.c);
      } else {
        this.selectedCell = clickedCell;
        this.playTone(480, 'sine', 0.06, 0.08);
      }
    }

    this.dragStart = null;
  }

  handleKeyDown(e) {
    if (this.state === 'game_over' || this.state === 'game_clear') {
      if (e.code === 'Space' || e.code === 'KeyR') {
        this.resetGame();
      }
      return;
    }

    if (this.state !== 'ready') return;

    // Điều hướng bàn phím
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.cursor.r = Math.max(0, this.cursor.r - 1);
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.cursor.r = Math.min(this.rows - 1, this.cursor.r + 1);
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.cursor.c = Math.max(0, this.cursor.c - 1);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.cursor.c = Math.min(this.cols - 1, this.cursor.c + 1);
    } else if (e.code === 'Space' || e.code === 'Enter') {
      if (!this.selectedCell) {
        this.selectedCell = { r: this.cursor.r, c: this.cursor.c };
      } else {
        if (this.areNeighbors(this.selectedCell.r, this.selectedCell.c, this.cursor.r, this.cursor.c)) {
          this.requestSwap(this.selectedCell.r, this.selectedCell.c, this.cursor.r, this.cursor.c);
        } else {
          this.selectedCell = { r: this.cursor.r, c: this.cursor.c };
        }
      }
    } else if (e.code === 'KeyH') {
      this.hintPair = this.findHint();
    } else if (e.code === 'KeyR') {
      this.resetGame();
    }
  }

  // ==========================================
  // RENDER GRAPHICS & HUD (640x360 CANVAS)
  // ==========================================
  render() {
    const ctx = this.ctx;
    ctx.save();

    // Rung chấn màn hình
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Nền Canvas Cyberpunk
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 360);
    bgGrad.addColorStop(0, this.config.colors.bgTop);
    bgGrad.addColorStop(1, this.config.colors.bgBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 360);

    // 2. Render Cột Trái (HUD: Điểm, Lượt đi, Mục tiêu 3 Sao)
    this.renderLeftHUD(ctx);

    // 3. Render Khung Bàn Cờ 8x8
    this.renderBoard(ctx);

    // 4. Render Các Viên Kẹo / Ngọc Vi Mạch
    this.renderGems(ctx);

    // 5. Render Hiệu Ứng Lasers, Shockwaves & Particles
    this.renderEffects(ctx);

    // 6. Render Cột Phải (Bảng Combo, Gợi ý, Hướng dẫn Kẹo)
    this.renderRightHUD(ctx);

    // 7. Overlay Kết thúc màn chơi (Game Over / Clear)
    if (this.state === 'game_over' || this.state === 'game_clear') {
      this.renderGameOverModal(ctx);
    }

    ctx.restore();
  }

  renderBoard(ctx) {
    const totalW = this.cols * (this.cellSize + this.cellGap) - this.cellGap;
    const totalH = this.rows * (this.cellSize + this.cellGap) - this.cellGap;

    // Viền phát quang bao quanh bàn cờ
    ctx.fillStyle = this.config.colors.boardBg;
    ctx.strokeStyle = this.config.colors.boardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(this.startX - 6, this.startY - 6, totalW + 12, totalH + 12, 10);
    ctx.fill();
    ctx.stroke();

    // Render từng ô lưới
    const totalCell = this.cellSize + this.cellGap;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.startX + c * totalCell;
        const y = this.startY + r * totalCell;

        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.6)';
        ctx.strokeStyle = this.config.colors.cellBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, y, this.cellSize, this.cellSize, 5);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Hiển thị gợi ý nước đi (Hint pulsing)
    if (this.hintPair && this.state === 'ready') {
      const pulseAlpha = 0.4 + Math.sin(this.hintTimer) * 0.35;
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulseAlpha})`;
      ctx.lineWidth = 3;
      for (const pt of this.hintPair) {
        const x = this.startX + pt.c * totalCell;
        const y = this.startY + pt.r * totalCell;
        ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      }
    }

    // Ô đang được chọn (Selected cell bracket)
    if (this.selectedCell) {
      const x = this.startX + this.selectedCell.c * totalCell;
      const y = this.startY + this.selectedCell.r * totalCell;
      ctx.strokeStyle = this.config.colors.selectedBorder;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x - 1, y - 1, this.cellSize + 2, this.cellSize + 2);
    }
  }

  renderGems(ctx) {
    const st = this.config.specialTypes;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const gem = this.grid[r][c];
        if (!gem) continue;

        ctx.save();
        ctx.translate(gem.x, gem.y);
        ctx.scale(gem.scale, gem.scale);
        ctx.globalAlpha = gem.alpha;

        const gemDef = this.config.gemTypes[gem.type] || this.config.gemTypes[0];
        const half = this.cellSize * 0.42;

        // Vẽ viên ngọc theo hình khối chuẩn
        ctx.fillStyle = gemDef.color;
        ctx.shadowColor = gemDef.glow;
        ctx.shadowBlur = 8;

        if (gem.special === st.COLOR_BOMB) {
          // Kẹo Cầu Vồng (Rainbow Sphere)
          this.renderColorBomb(ctx, half);
        } else {
          this.renderGemShape(ctx, gemDef.shape, half, gemDef.color);

          // Overlays Kẹo Đặc Biệt
          if (gem.special === st.STRIPED_H) {
            this.renderStripes(ctx, half, true);
          } else if (gem.special === st.STRIPED_V) {
            this.renderStripes(ctx, half, false);
          } else if (gem.special === st.WRAPPED) {
            this.renderWrappedShield(ctx, half);
          }
        }

        ctx.restore();
      }
    }
  }

  renderGemShape(ctx, shape, half, color) {
    ctx.beginPath();
    if (shape === 'diamond') {
      // Kim cương 4 cạnh
      ctx.moveTo(0, -half);
      ctx.lineTo(half, 0);
      ctx.lineTo(0, half);
      ctx.lineTo(-half, 0);
    } else if (shape === 'hexagon') {
      // Lục giác
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = Math.cos(angle) * half;
        const hy = Math.sin(angle) * half;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
    } else if (shape === 'circle') {
      // Tròn hạt ngọc
      ctx.arc(0, 0, half * 0.9, 0, Math.PI * 2);
    } else if (shape === 'square') {
      // Khối vuông bo góc
      ctx.roundRect(-half * 0.85, -half * 0.85, half * 1.7, half * 1.7, 4);
    } else if (shape === 'triangle') {
      // Tam giác lăng kính
      ctx.moveTo(0, -half);
      ctx.lineTo(half * 0.95, half * 0.8);
      ctx.lineTo(-half * 0.95, half * 0.8);
    } else {
      // Ngôi sao 5 cánh
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? half : half * 0.45;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const sx = Math.cos(angle) * r;
        const sy = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Điểm sáng phản chiếu (Glossy highlight)
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-half * 0.25, -half * 0.25, half * 0.35, half * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  renderStripes(ctx, half, isHorizontal) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(-half, -4);
      ctx.lineTo(half, -4);
      ctx.moveTo(-half, 4);
      ctx.lineTo(half, 4);
    } else {
      ctx.moveTo(-4, -half);
      ctx.lineTo(-4, half);
      ctx.moveTo(4, -half);
      ctx.lineTo(4, half);
    }
    ctx.stroke();
  }

  renderWrappedShield(ctx, half) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-half * 1.1, -half * 1.1, half * 2.2, half * 2.2);
    // 4 chấm góc
    ctx.fillStyle = '#ffffff';
    const s = half * 1.1;
    ctx.fillRect(-s - 1, -s - 1, 3, 3);
    ctx.fillRect(s - 2, -s - 1, 3, 3);
    ctx.fillRect(-s - 1, s - 2, 3, 3);
    ctx.fillRect(s - 2, s - 2, 3, 3);
  }

  renderColorBomb(ctx, half) {
    // Quả cầu cầu vồng đa sắc
    const grad = ctx.createRadialGradient(-half * 0.2, -half * 0.2, 2, 0, 0, half);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#f43f5e');
    grad.addColorStop(0.6, '#06b6d4');
    grad.addColorStop(0.9, '#a855f7');
    grad.addColorStop(1, '#050510');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, Math.PI * 2);
    ctx.fill();

    // Hạt đốm lấp lánh xung quanh
    const colors = ['#facc15', '#38bdf8', '#4ade80', '#f472b6'];
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i + Date.now() * 0.003;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (half * 0.65), Math.sin(angle) * (half * 0.65), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderEffects(ctx) {
    // 1. Lasers
    for (const laser of this.lasers) {
      ctx.save();
      ctx.globalAlpha = laser.alpha;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 7;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      if (laser.isHorizontal) {
        ctx.moveTo(this.startX, laser.y);
        ctx.lineTo(this.startX + this.cols * (this.cellSize + this.cellGap), laser.y);
      } else {
        ctx.moveTo(laser.x, this.startY);
        ctx.lineTo(laser.x, this.startY + this.rows * (this.cellSize + this.cellGap));
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }

    // 4. Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${ft.fontSize}px 'Segoe UI', Tahoma, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  renderLeftHUD(ctx) {
    const px = 18;
    const pw = 138;

    // Panel kính mờ
    ctx.fillStyle = this.config.colors.panelBg;
    ctx.strokeStyle = this.config.colors.panelBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px, 30, pw, 300, 8);
    ctx.fill();
    ctx.stroke();

    // Tiêu đề
    ctx.fillStyle = '#94a3b8';
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('MOVES LEFT', px + pw / 2, 54);

    // Huy hiệu số lượt đi (Moves)
    const movesColor = this.movesLeft <= 5 ? '#ef4444' : '#38bdf8';
    ctx.fillStyle = movesColor;
    ctx.font = "bold 32px 'Segoe UI', sans-serif";
    ctx.fillText(this.movesLeft.toString(), px + pw / 2, 90);

    // Đường kẻ phân cách
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(px + 12, 106);
    ctx.lineTo(px + pw - 12, 106);
    ctx.stroke();

    // Điểm số hiện tại
    ctx.fillStyle = '#94a3b8';
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.fillText('SCORE', px + pw / 2, 126);

    ctx.fillStyle = '#facc15';
    ctx.font = "bold 20px 'Segoe UI', sans-serif";
    ctx.fillText(this.score.toLocaleString(), px + pw / 2, 150);

    // Kỷ lục cao nhất
    ctx.fillStyle = '#64748b';
    ctx.font = "10px 'Segoe UI', sans-serif";
    ctx.fillText(`BEST: ${this.highScore.toLocaleString()}`, px + pw / 2, 168);

    // Thanh tiến độ 3 Sao (Target Progress)
    ctx.beginPath();
    ctx.moveTo(px + 12, 184);
    ctx.lineTo(px + pw - 12, 184);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.fillText('STAR TARGET', px + pw / 2, 204);

    const maxTarget = this.config.rules.targetScores.star3;
    const progress = Math.min(1.0, this.score / maxTarget);

    const barX = px + 16;
    const barY = 220;
    const barW = pw - 32;
    const barH = 10;

    // Rãnh thanh tiến độ
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();

    // Điền thanh tiến độ
    if (progress > 0) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 5);
      ctx.fill();
    }

    // 3 Mốc sao
    const stars = [
      { ratio: this.config.rules.targetScores.star1 / maxTarget, label: '★' },
      { ratio: this.config.rules.targetScores.star2 / maxTarget, label: '★★' },
      { ratio: 1.0, label: '★★★' }
    ];

    for (let i = 0; i < stars.length; i++) {
      const sx = barX + barW * stars[i].ratio;
      const isReached = this.score >= this.config.rules.targetScores[`star${i + 1}`];
      ctx.fillStyle = isReached ? '#facc15' : '#475569';
      ctx.beginPath();
      ctx.arc(sx, barY + barH / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hướng dẫn phím nhanh (cảm ứng: phím H/R không tồn tại → hiện hướng dẫn chạm)
    ctx.fillStyle = '#475569';
    ctx.font = "10px 'Segoe UI', sans-serif";
    if (this.isTouch) {
      ctx.fillText('Kéo để hoán đổi', px + pw / 2, 289);
    } else {
      ctx.fillText('[H] Gợi ý', px + pw / 2, 280);
      ctx.fillText('[R] Chơi lại', px + pw / 2, 298);
    }
  }

  renderRightHUD(ctx) {
    const px = 484;
    const pw = 138;

    // Panel kính mờ
    ctx.fillStyle = this.config.colors.panelBg;
    ctx.strokeStyle = this.config.colors.panelBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px, 30, pw, 300, 8);
    ctx.fill();
    ctx.stroke();

    // COMBO STREAK
    ctx.fillStyle = '#94a3b8';
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('COMBO STREAK', px + pw / 2, 54);

    const comboColor = this.combo > 1 ? '#00ff88' : '#64748b';
    ctx.fillStyle = comboColor;
    ctx.font = "bold 26px 'Segoe UI', sans-serif";
    ctx.fillText(`x${Math.max(1, this.combo)}`, px + pw / 2, 88);

    // Phân cách
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(px + 12, 106);
    ctx.lineTo(px + pw - 12, 106);
    ctx.stroke();

    // HƯỚNG DẪN KẸO ĐẶC BIỆT
    ctx.fillStyle = '#94a3b8';
    ctx.font = "bold 11px 'Segoe UI', sans-serif";
    ctx.fillText('SPECIAL GEMS', px + pw / 2, 126);

    ctx.textAlign = 'left';
    ctx.font = "10px 'Segoe UI', sans-serif";

    // Ghép 4
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('• Match 4: Kẹo Sọc', px + 14, 150);
    ctx.fillStyle = '#64748b';
    ctx.fillText('  (Quét cả hàng/cột)', px + 14, 164);

    // Ghép 5 L/T
    ctx.fillStyle = '#facc15';
    ctx.fillText('• Match 5 L/T: Kẹo Bọc', px + 14, 192);
    ctx.fillStyle = '#64748b';
    ctx.fillText('  (Nổ kép 3x3)', px + 14, 206);

    // Ghép 5 Thẳng
    ctx.fillStyle = '#ec4899';
    ctx.fillText('• Match 5 Line: Cầu Vồng', px + 14, 234);
    ctx.fillStyle = '#64748b';
    ctx.fillText('  (Tiêu diệt 1 màu)', px + 14, 248);

    // Trạng thái FSM
    ctx.textAlign = 'center';
    ctx.fillStyle = '#06b6d4';
    ctx.font = "10px 'Segoe UI', sans-serif";
    ctx.fillText(`STATUS: ${this.state.toUpperCase()}`, px + pw / 2, 298);
  }

  renderGameOverModal(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 13, 26, 0.85)';
    ctx.fillRect(0, 0, 640, 360);

    const isWin = this.state === 'game_clear';
    const modalW = 340;
    const modalH = 220;
    const modalX = (640 - modalW) / 2;
    const modalY = (360 - modalH) / 2;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = isWin ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(modalX, modalY, modalW, modalH, 12);
    ctx.fill();
    ctx.stroke();

    // Tiêu đề
    ctx.textAlign = 'center';
    ctx.fillStyle = isWin ? '#00ff88' : '#ef4444';
    ctx.font = "bold 24px 'Segoe UI', sans-serif";
    ctx.fillText(isWin ? 'LEVEL COMPLETED!' : 'OUT OF MOVES!', 320, modalY + 45);

    // Điểm đạt được
    ctx.fillStyle = '#cbd5e1';
    ctx.font = "14px 'Segoe UI', sans-serif";
    ctx.fillText(`Điểm số của bạn:`, 320, modalY + 80);

    ctx.fillStyle = '#facc15';
    ctx.font = "bold 28px 'Segoe UI', sans-serif";
    ctx.fillText(this.score.toLocaleString(), 320, modalY + 115);

    // Đánh giá sao
    let starText = 'Chưa đạt sao';
    if (this.score >= this.config.rules.targetScores.star3) starText = '★★★ Xuất Sắc!';
    else if (this.score >= this.config.rules.targetScores.star2) starText = '★★ Rất Tốt!';
    else if (this.score >= this.config.rules.targetScores.star1) starText = '★ Hoàn Thành!';

    ctx.fillStyle = '#38bdf8';
    ctx.font = "bold 15px 'Segoe UI', sans-serif";
    ctx.fillText(starText, 320, modalY + 145);

    // Lời nhắc
    ctx.fillStyle = '#94a3b8';
    ctx.font = "12px 'Segoe UI', sans-serif";
    ctx.fillText(this.isTouch ? 'Bấm nút [‹] để về danh sách game' : 'Bấm [Space] hoặc [R] để chơi lại', 320, modalY + 185);

    ctx.restore();
  }
}
