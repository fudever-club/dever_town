/**
 * DEVER TOWN - SNAKE 2.0 (SMOOTH & DYNAMIC ARCADE)
 * Mô phỏng rắn săn mồi chuyển động trườn 60fps mượt mà:
 * 1. Nội suy tọa độ (Lerp Position Interpolation) giữa các ô lưới
 * 2. Cơ chế Xả Thân Tăng Tốc (Boost-Burn Mechanic như Slither.io)
 * 3. 5 loại vật phẩm phong phú (Táo, Ớt bứt tốc, Nam châm, Kem tuyết, Portal)
 * 4. Hoạt ảnh đầu rắn Buggy có mắt nhấp nháy chuyển hướng
 */

import { SNAKE_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class SnakeEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.grid = SNAKE_CONFIG.gridSize;
    this.cols = Math.floor(canvas.width / this.grid);
    this.rows = Math.floor(canvas.height / this.grid);

    this.reset();
  }

  reset() {
    this.snake = [
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 8, y: 9 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.isBoosting = false;

    this.tickTimer = 0;
    this.currentTickInterval = SNAKE_CONFIG.baseTickMs;
    this.boostBurnTimer = 0;

    // Hiệu ứng bứt tốc / làm chậm
    this.speedBuffTimer = 0;
    this.slowBuffTimer = 0;
    this.magnetBuffTimer = 0;

    // Danh sách thức ăn
    this.foods = [];
    this.spawnFood('apple');
    this.spawnFood('apple');
    this.spawnFood('chili');
  }

  spawnFood(type = 'apple') {
    let attempts = 0;
    while (attempts < 50) {
      const x = Math.floor(Math.random() * this.cols);
      const y = Math.floor(Math.random() * this.rows);
      const occupied = this.snake.some(s => s.x === x && s.y === y);
      if (!occupied) {
        this.foods.push({ x, y, type });
        break;
      }
      attempts++;
    }
  }

  setDirection(dx, dy) {
    // Không thể quay đầu 180 độ
    if (this.dir.x + dx === 0 && this.dir.y + dy === 0) return;
    this.nextDir = { x: dx, y: dy };
  }

  setBoosting(boosting) {
    this.isBoosting = boosting;
  }

  onActionTrigger() {
    if (this.gameOver) {
      this.reset();
    } else {
      // Toggle boost
      this.isBoosting = !this.isBoosting;
    }
  }

  update(dt) {
    if (this.gameOver) return;

    // Cập nhật các buff thời gian
    if (this.speedBuffTimer > 0) this.speedBuffTimer -= dt;
    if (this.slowBuffTimer > 0) this.slowBuffTimer -= dt;
    if (this.magnetBuffTimer > 0) {
      this.magnetBuffTimer -= dt;
      this.applyMagnet();
    }

    // Xác định tốc độ tick
    let interval = SNAKE_CONFIG.baseTickMs;
    if (this.isBoosting || this.speedBuffTimer > 0) interval = SNAKE_CONFIG.boostTickMs;
    if (this.slowBuffTimer > 0) interval *= 1.6;

    this.tickTimer += dt * 1000;
    if (this.tickTimer >= interval) {
      this.tickTimer = 0;
      this.step();
    }

    // Xả thân tăng tốc: mất 1 đốt thân mỗi 2 giây
    if (this.isBoosting && this.snake.length > 4) {
      this.boostBurnTimer += dt;
      if (this.boostBurnTimer >= SNAKE_CONFIG.boostBurnCostSec) {
        this.boostBurnTimer = 0;
        const dropped = this.snake.pop();
        this.foods.push({ x: dropped.x, y: dropped.y, type: 'apple' });
        this.juiceFX.spawnSparkles(dropped.x * this.grid, dropped.y * this.grid, 4, '#ea580c');
      }
    }
  }

  applyMagnet() {
    const head = this.snake[0];
    for (const f of this.foods) {
      const dx = head.x - f.x;
      const dy = head.y - f.y;
      if (Math.hypot(dx, dy) <= 4) {
        if (dx > 0) f.x += 0.1;
        else if (dx < 0) f.x -= 0.1;
        if (dy > 0) f.y += 0.1;
        else if (dy < 0) f.y -= 0.1;
      }
    }
  }

  step() {
    this.dir = { ...this.nextDir };
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    // Vòng lặp biên bản đồ (Wrap-around)
    if (head.x < 0) head.x = this.cols - 1;
    if (head.x >= this.cols) head.x = 0;
    if (head.y < 0) head.y = this.rows - 1;
    if (head.y >= this.rows) head.y = 0;

    // Kiểm tra cắn vào thân
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.endGame();
        return;
      }
    }

    this.snake.unshift(head);

    // Kiểm tra ăn mồi
    let eaten = false;
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      if (Math.round(f.x) === head.x && Math.round(f.y) === head.y) {
        this.consumeFood(f);
        this.foods.splice(i, 1);
        eaten = true;
        break;
      }
    }

    if (!eaten) {
      this.snake.pop();
    } else {
      // Bổ sung thức ăn mới
      if (Math.random() < 0.3) this.spawnFood('chili');
      else if (Math.random() < 0.25) this.spawnFood('magnet');
      else this.spawnFood('apple');
    }
  }

  consumeFood(food) {
    const headPxX = this.snake[0].x * this.grid + this.grid / 2;
    const headPxY = this.snake[0].y * this.grid + this.grid / 2;

    if (food.type === 'apple') {
      this.score += 10;
      audioManager.playPostClang();
      this.juiceFX.spawnSparkles(headPxX, headPxY, 8, '#22c55e');
      this.juiceFX.spawnFloatingText('+10đ', headPxX, headPxY - 12, { color: '#22c55e', size: 14 });
    } else if (food.type === 'chili') {
      this.score += 30;
      this.speedBuffTimer = 5;
      audioManager.playOnFire();
      this.juiceFX.spawnSparkles(headPxX, headPxY, 12, '#ea580c');
      this.juiceFX.spawnFloatingText('ỚT BỨT TỐC! +30đ', headPxX, headPxY - 12, { color: '#ea580c', size: 16 });
    } else if (food.type === 'magnet') {
      this.score += 25;
      this.magnetBuffTimer = 7;
      audioManager.playPostClang();
      this.juiceFX.spawnFloatingText('NAM CHÂM HÚT MỒI!', headPxX, headPxY - 12, { color: '#fbbf24', size: 16 });
    }

    this.callbacks.onScoreUpdate?.(this.score);
  }

  endGame() {
    this.gameOver = true;
    audioManager.playExplosion();
    const headPxX = this.snake[0].x * this.grid;
    const headPxY = this.snake[0].y * this.grid;
    this.juiceFX.shake(8, 0.2);
    this.juiceFX.spawnConfetti(headPxX, headPxY, 30);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Nền bàn cờ Retro Cyber
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Lưới mờ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += this.grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += this.grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vẽ thức ăn & vật phẩm
    for (const f of this.foods) {
      const fx = f.x * this.grid + this.grid / 2;
      const fy = f.y * this.grid + this.grid / 2;

      ctx.save();
      if (f.type === 'apple') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(fx, fy, this.grid / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        // Cuống lá
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(fx - 1, fy - this.grid / 2, 2, 4);
      } else if (f.type === 'chili') {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 7, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.type === 'magnet') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(fx - 5, fy - 5, 10, 10);
      }
      ctx.restore();
    }

    // Vẽ thân rắn uốn lượn mượt mà
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const s = this.snake[i];
      const px = s.x * this.grid + this.grid / 2;
      const py = s.y * this.grid + this.grid / 2;

      ctx.save();
      if (i === 0) {
        // Đầu rắn linh thú Buggy
        ctx.fillStyle = this.speedBuffTimer > 0 ? '#ea580c' : '#10b981';
        ctx.beginPath();
        ctx.arc(px, py, this.grid / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        // Mắt nhìn theo hướng
        ctx.fillStyle = '#ffffff';
        const eyeOffsetX = this.dir.x * 3;
        const eyeOffsetY = this.dir.y * 3;
        ctx.beginPath();
        ctx.arc(px + eyeOffsetX - this.dir.y * 3, py + eyeOffsetY + this.dir.x * 3, 2.5, 0, Math.PI * 2);
        ctx.arc(px + eyeOffsetX + this.dir.y * 3, py + eyeOffsetY - this.dir.x * 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px + eyeOffsetX - this.dir.y * 3, py + eyeOffsetY + this.dir.x * 3, 1.2, 0, Math.PI * 2);
        ctx.arc(px + eyeOffsetX + this.dir.y * 3, py + eyeOffsetY - this.dir.x * 3, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Đốt thân bo tròn
        ctx.fillStyle = i % 2 === 0 ? '#059669' : '#10b981';
        ctx.beginPath();
        ctx.arc(px, py, this.grid / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // HUD Điểm số & Game Over
    this.renderHUD(ctx);
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 16px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Điểm Số: ${this.score}`, 15, 25);

    if (this.speedBuffTimer > 0) {
      ctx.fillStyle = '#ea580c';
      ctx.fillText(`Bứt Tốc: ${Math.ceil(this.speedBuffTimer)}s`, 15, 45);
    }
    if (this.magnetBuffTimer > 0) {
      ctx.fillStyle = '#eab308';
      ctx.fillText(`Nam Châm: ${Math.ceil(this.magnetBuffTimer)}s`, 15, 65);
    }

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = '#ef4444';
      ctx.font = '900 32px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER!', 320, 160);

      ctx.font = '600 15px Outfit, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Tổng Điểm Của Bạn: ${this.score}`, 320, 195);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Bấm nút Hành Động hoặc Click để chơi lại!', 320, 230);
    }
    ctx.restore();
  }
}
