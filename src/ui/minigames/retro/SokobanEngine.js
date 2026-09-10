/**
 * DEVER TOWN - SOKOBAN 2.0 (15 MÀN MICROBAN & CƠ CHẾ HIỆN ĐẠI)
 * Mô phỏng đẩy hộp trí tuệ chuyên nghiệp:
 * 1. 15 màn chơi tăng dần độ khó (Dễ -> Trung bình -> Hack não)
 * 2. Sàn băng trơn (Ice Floor) đẩy trượt theo quán tính
 * 3. Ngăn xếp hoàn tác vô hạn (Unlimited Undo Stack)
 * 4. Thuật toán phát hiện kẹt góc thông minh (Deadlock Detector)
 * 5. Đánh giá 3 sao theo số bước di chuyển tối ưu
 */

import { SOKOBAN_LEVELS } from '../../../config/sokobanLevels.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class SokobanEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.currentLevelIndex = 0;
    this.tileSize = 38;
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.currentLevelIndex = index % SOKOBAN_LEVELS.length;
    this.levelData = SOKOBAN_LEVELS[this.currentLevelIndex];

    // Sao chép map
    this.map = this.levelData.map.map(row => [...row]);
    this.rows = this.map.length;
    this.cols = this.map[0].length;

    this.player = { x: 0, y: 0 };
    this.moves = 0;
    this.history = []; // Undo stack
    this.won = false;
    this.deadlockedBoxes = [];

    // Tìm vị trí người chơi
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 5 || this.map[r][c] === 6) {
          this.player = { x: c, y: r };
        }
      }
    }

    // Căn giữa map trên canvas
    this.offsetX = Math.floor((this.canvas.width - this.cols * this.tileSize) / 2);
    this.offsetY = Math.floor((this.canvas.height - this.rows * this.tileSize) / 2);

    this.checkDeadlocks();
  }

  onActionTrigger() {
    if (this.won) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.undo();
    }
  }

  undo() {
    if (this.history.length === 0 || this.won) return;
    const prev = this.history.pop();
    this.map = prev.map.map(r => [...r]);
    this.player = { ...prev.player };
    this.moves = prev.moves;
    audioManager.playUndo();
    this.checkDeadlocks();
    this.juiceFX.spawnFloatingText('HOÀN TÁC', this.canvas.width / 2, 100, { color: '#38bdf8', size: 14 });
  }

  move(dx, dy) {
    if (this.won) return;

    const px = this.player.x;
    const py = this.player.y;
    const nx = px + dx;
    const ny = py + dy;

    // Ngoài biên hoặc là tường
    if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) return;
    if (this.map[ny][nx] === 1) return;

    const targetTile = this.map[ny][nx];
    const isBox = targetTile === 3 || targetTile === 4;

    if (isBox) {
      let nnx = nx + dx;
      let nny = ny + dy;
      if (nnx < 0 || nnx >= this.cols || nny < 0 || nny >= this.rows) return;

      // Không thể đẩy 2 hộp liền nhau hoặc đẩy vào tường
      const nextNextTile = this.map[nny][nnx];
      if (nextNextTile === 1 || nextNextTile === 3 || nextNextTile === 4) return;

      // Lưu lịch sử để Undo
      this.history.push({
        map: this.map.map(r => [...r]),
        player: { ...this.player },
        moves: this.moves
      });

      // Cơ chế Sàn Băng Trơn (Ice Floor - tile 7)
      while (
        this.map[nny][nnx] === 7 &&
        nnx + dx >= 0 &&
        nnx + dx < this.cols &&
        nny + dy >= 0 &&
        nny + dy < this.rows &&
        ![1, 3, 4].includes(this.map[nny + dy][nnx + dx])
      ) {
        nnx += dx;
        nny += dy;
      }

      // Di chuyển hộp
      this.map[ny][nx] = targetTile === 4 ? 2 : 0;
      const destTile = this.map[nny][nnx];
      this.map[nny][nnx] = destTile === 2 ? 4 : 3;

      audioManager.playSokobanSlide();
      this.juiceFX.spawnSparkles(
        this.offsetX + nnx * this.tileSize + this.tileSize / 2,
        this.offsetY + nny * this.tileSize + this.tileSize / 2,
        4,
        '#38bdf8'
      );
    } else {
      // Lưu lịch sử
      this.history.push({
        map: this.map.map(r => [...r]),
        player: { ...this.player },
        moves: this.moves
      });
    }

    // Di chuyển người chơi
    const currTile = this.map[py][px];
    this.map[py][px] = currTile === 6 ? 2 : 0;
    this.map[ny][nx] = this.map[ny][nx] === 2 ? 6 : 5;
    this.player = { x: nx, y: ny };
    this.moves++;

    this.checkDeadlocks();
    this.checkWinCondition();
  }

  checkDeadlocks() {
    this.deadlockedBoxes = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // Hộp chưa vào đích
        if (this.map[r][c] === 3) {
          // Kiểm tra kẹt góc chết 90 độ
          const wallUp = r === 0 || this.map[r - 1][c] === 1;
          const wallDown = r === this.rows - 1 || this.map[r + 1][c] === 1;
          const wallLeft = c === 0 || this.map[r][c - 1] === 1;
          const wallRight = c === this.cols - 1 || this.map[r][c + 1] === 1;

          if ((wallUp && wallLeft) || (wallUp && wallRight) || (wallDown && wallLeft) || (wallDown && wallRight)) {
            this.deadlockedBoxes.push({ x: c, y: r });
          }
        }
      }
    }
  }

  checkWinCondition() {
    // Thắng khi không còn hộp số 3 (chưa vào đích)
    let remainingBoxes = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 3) remainingBoxes++;
      }
    }

    if (remainingBoxes === 0) {
      this.won = true;
      audioManager.playGoalFanfare();
      this.juiceFX.shake(6, 0.2);
      this.juiceFX.spawnConfetti(this.canvas.width / 2, this.canvas.height / 2, 40);

      const stars = this.moves <= this.levelData.parMoves ? 3 : this.moves <= this.levelData.parMoves * 1.5 ? 2 : 1;
      this.juiceFX.spawnFloatingText(`CHIẾN THẮNG! ${'★'.repeat(stars)}`, this.canvas.width / 2, 120, { color: '#fbbf24', size: 24 });
      this.callbacks.onScoreUpdate?.(stars * 100);
    }
  }

  update(dt) {}

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Nền phòng máy chủ Server Room
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const ts = this.tileSize;

    // Vẽ toàn bộ ma trận gạch map
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetX + c * ts;
        const y = this.offsetY + r * ts;
        const tile = this.map[r][c];

        ctx.save();
        if (tile === 1) {
          // Tường đá phiến 3D
          ctx.fillStyle = '#334155';
          ctx.fillRect(x, y, ts, ts);
          ctx.fillStyle = '#475569';
          ctx.fillRect(x, y, ts, 6);
          ctx.strokeStyle = '#1e293b';
          ctx.strokeRect(x, y, ts, ts);
        } else if (tile === 7) {
          // Sàn băng trơn
          ctx.fillStyle = '#38bdf8';
          ctx.globalAlpha = 0.35;
          ctx.fillRect(x, y, ts, ts);
          ctx.strokeStyle = '#7dd3fc';
          ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
        } else {
          // Sàn bình thường
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, ts, ts);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeRect(x, y, ts, ts);
        }

        // Điểm đích socket vi mạch (2 hoặc 4 hoặc 6)
        if (tile === 2 || tile === 4 || tile === 6) {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hộp kim loại (3 hoặc 4)
        if (tile === 3 || tile === 4) {
          ctx.fillStyle = tile === 4 ? '#15803d' : '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(x + 4, y + 4, ts - 8, ts - 8, 4);
          ctx.fill();
          ctx.strokeStyle = tile === 4 ? '#4ade80' : '#fbbf24';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Chữ X trang trí hộp
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 8);
          ctx.lineTo(x + ts - 8, y + ts - 8);
          ctx.moveTo(x + ts - 8, y + 8);
          ctx.lineTo(x + 8, y + ts - 8);
          ctx.stroke();
        }

        // Người chơi (5 hoặc 6)
        if (tile === 5 || tile === 6) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, ts / 2 - 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // Cảnh báo kẹt góc Deadlock
    for (const d of this.deadlockedBoxes) {
      const x = this.offsetX + d.x * ts + ts / 2;
      const y = this.offsetY + d.y * ts + ts / 2;
      ctx.fillStyle = '#ef4444';
      ctx.font = '800 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', x, y + 4);
    }

    // HUD Màn chơi & Số bước
    this.renderHUD(ctx);
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 15px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.levelData.name} (${this.currentLevelIndex + 1}/15)`, 20, 28);
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Số Bước: ${this.moves} · Chuẩn Par: ${this.levelData.parMoves}`, 20, 48);

    if (this.deadlockedBoxes.length > 0 && !this.won) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('CẢNH BÁO: Hộp bị kẹt góc chết! Bấm nút Hoàn Tác (U)', 20, 68);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 13px Outfit, sans-serif';
    if (this.won) {
      ctx.fillText('CHIẾN THẮNG! Bấm nút Hành Động để sang Màn Tiếp Theo', 320, 335);
    } else {
      ctx.fillText('Dùng WASD / Mũi Tên để di chuyển · Bấm U hoặc nút để HOÀN TÁC', 320, 335);
    }
    ctx.restore();
  }
}
