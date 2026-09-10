/**
 * DEVER TOWN - GOLD MINER 2.0 (BUGGY GOLD RUSH & DYNAMITE CHAIN)
 * Mô phỏng Vua Đào Vàng cổ điển với cơ chế hiện đại:
 * 1. Dây tời xích sắt cơ học & Móc kẹp kim loại đóng mở tự nhiên
 * 2. Nổ dây chuyền thùng thuốc nổ TNT (Chain Reaction Blast)
 * 3. 7 loại khoáng sản phong phú (Vàng 3 cỡ, Kim cương, Đá cuội, Túi bí ẩn, TNT)
 * 4. Thuốc nổ Dynamite (phím Space để nổ bỏ vật nặng khi đang kéo)
 */

import { GOLD_MINER_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class GoldMinerEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.cash = 0;
    this.targetCash = 650;
    this.day = 1;
    this.dynamiteCount = 2;
    this.hasStrengthDrink = false;

    this.resetDay();
  }

  resetDay() {
    this.state = 'playing'; // 'playing' | 'day_clear' | 'game_over'
    this.timeLeft = 60;

    const cfg = GOLD_MINER_CONFIG.hook;
    this.hook = {
      x: cfg.startX,
      y: cfg.startY,
      angle: 0,
      dir: 1,
      length: cfg.baseLength,
      state: 'swing', // 'swing' | 'shoot' | 'pull'
      grabbed: null
    };

    // Tạo ngẫu nhiên mỏ khoáng sản phong phú
    this.minerals = [];
    const pool = [
      'gold_s', 'gold_s', 'gold_m', 'gold_m', 'gold_l',
      'diamond', 'diamond', 'rock', 'rock', 'tnt', 'mystery'
    ];

    for (const key of pool) {
      const def = GOLD_MINER_CONFIG.minerals[key];
      this.minerals.push({
        type: key,
        name: def.name,
        x: 60 + Math.random() * (this.canvas.width - 120),
        y: 110 + Math.random() * (this.canvas.height - 150),
        r: def.r,
        val: def.val,
        weight: def.weight || 1.0,
        color: def.color,
        isBomb: def.isBomb || false,
        isMystery: def.isMystery || false
      });
    }
  }

  onActionTrigger() {
    if (this.state === 'playing') {
      if (this.hook.state === 'swing') {
        this.shootHook();
      } else if (this.hook.state === 'pull' && this.hook.grabbed) {
        // Dùng kíp nổ Dynamite để hủy vật nặng
        this.useDynamite();
      }
    } else if (this.state === 'day_clear') {
      this.day++;
      this.targetCash += 800;
      this.resetDay();
    } else if (this.state === 'game_over') {
      this.cash = 0;
      this.day = 1;
      this.targetCash = 650;
      this.dynamiteCount = 2;
      this.resetDay();
    }
  }

  shootHook() {
    this.hook.state = 'shoot';
    audioManager.playWinchCrank();
  }

  useDynamite() {
    if (this.dynamiteCount <= 0 || !this.hook.grabbed) return;
    this.dynamiteCount--;
    audioManager.playExplosion();
    this.juiceFX.shake(8, 0.2);

    const hx = this.hook.x + Math.sin(this.hook.angle) * this.hook.length;
    const hy = this.hook.y + Math.cos(this.hook.angle) * this.hook.length;
    this.juiceFX.spawnConfetti(hx, hy, 25);
    this.juiceFX.spawnFloatingText('NỔ DYNAMITE!', hx, hy - 20, { color: '#ef4444', size: 18 });

    this.hook.grabbed = null;
  }

  update(dt) {
    if (this.state !== 'playing') return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      if (this.cash >= this.targetCash) {
        this.state = 'day_clear';
        audioManager.playGoalFanfare();
        this.juiceFX.spawnConfetti(320, 180, 40);
      } else {
        this.state = 'game_over';
        audioManager.playExplosion();
      }
      return;
    }

    const h = this.hook;
    const cfg = GOLD_MINER_CONFIG.hook;

    if (h.state === 'swing') {
      h.angle += cfg.swingSpeed * h.dir;
      if (h.angle > cfg.maxAngle || h.angle < -cfg.maxAngle) {
        h.dir *= -1;
      }
    } else if (h.state === 'shoot') {
      h.length += cfg.shootSpeed;
      const hx = h.x + Math.sin(h.angle) * h.length;
      const hy = h.y + Math.cos(h.angle) * h.length;

      // Va chạm biên bản đồ
      if (hx < 0 || hx > this.canvas.width || hy > this.canvas.height) {
        h.state = 'pull';
      }

      // Va chạm khoáng sản
      for (let i = 0; i < this.minerals.length; i++) {
        const m = this.minerals[i];
        if (Math.hypot(hx - m.x, hy - m.y) <= m.r + 5) {
          if (m.isBomb) {
            // Kích nổ TNT liên hoàn!
            this.detonateTNT(m.x, m.y);
            h.state = 'pull';
          } else {
            h.grabbed = m;
            this.minerals.splice(i, 1);
            h.state = 'pull';
            audioManager.playPostClang();
          }
          break;
        }
      }
    } else if (h.state === 'pull') {
      let speed = cfg.pullBaseSpeed;
      if (h.grabbed) {
        speed = Math.max(1.2, speed / (h.grabbed.weight || 1));
        if (this.hasStrengthDrink) speed *= 2.2;
      }
      h.length -= speed;

      if (h.length <= cfg.baseLength) {
        h.length = cfg.baseLength;
        h.state = 'swing';

        if (h.grabbed) {
          this.resolveLoot(h.grabbed);
          h.grabbed = null;
        }
      }
    }
  }

  detonateTNT(bx, by) {
    audioManager.playExplosion();
    this.juiceFX.shake(10, 0.3);
    this.juiceFX.spawnConfetti(bx, by, 35);
    this.juiceFX.spawnFloatingText('BOOM! THÙNG TNT PHÁT NỔ!', bx, by - 25, { color: '#ef4444', size: 20 });

    const radius = 92;
    for (let i = this.minerals.length - 1; i >= 0; i--) {
      const m = this.minerals[i];
      if (Math.hypot(m.x - bx, m.y - by) <= radius) {
        this.minerals.splice(i, 1);
      }
    }
  }

  resolveLoot(m) {
    let earned = m.val;
    if (m.isMystery) {
      earned = Math.round(50 + Math.random() * 550);
      this.juiceFX.spawnFloatingText(`TÚI BÍ ẨN: +$${earned}`, 320, 100, { color: '#a855f7', size: 20 });
    } else {
      this.juiceFX.spawnFloatingText(`+$${earned}`, 320, 100, { color: '#fbbf24', size: 18 });
    }

    this.cash += earned;
    audioManager.playIceClink();
    this.callbacks.onScoreUpdate?.(this.cash);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Nền hầm mỏ đất sâu 3 tầng
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, w, 60);

    const grad = ctx.createLinearGradient(0, 60, 0, h);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#451a03');
    grad.addColorStop(1, '#1c1917');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 60, w, h - 60);

    // Vẽ khoáng sản
    for (const m of this.minerals) {
      ctx.save();
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();

      if (m.isBomb) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 10px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TNT', m.x, m.y + 3);
      } else if (m.isMystery) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', m.x, m.y + 4);
      }
      ctx.restore();
    }

    // Tọa độ đầu móc
    const hook = this.hook;
    const hx = hook.x + Math.sin(hook.angle) * hook.length;
    const hy = hook.y + Math.cos(hook.angle) * hook.length;

    // Vẽ xích sắt cơ học từng mắt xích
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(hook.x, hook.y);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    // Móc kẹp kim loại 2 càng
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-hook.angle);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    // 2 càng kẹp
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-10, 10);
    ctx.moveTo(6, 0);
    ctx.lineTo(10, 10);
    ctx.stroke();

    // Nếu đang kẹp vật phẩm
    if (hook.grabbed) {
      ctx.fillStyle = hook.grabbed.color;
      ctx.beginPath();
      ctx.arc(0, 14, hook.grabbed.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Thợ mỏ Buggy trên giàn tời gỗ
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(hook.x, hook.y - 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444'; // Mũ bảo hộ
    ctx.fillRect(hook.x - 11, hook.y - 24, 22, 6);

    // HUD Điểm & Mục tiêu
    this.renderHUD(ctx);
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 15px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Tiền: $${this.cash} / Mục tiêu: $${this.targetCash}`, 20, 28);
    ctx.fillText(`Ngày ${this.day} · Thời Gian: ${Math.ceil(this.timeLeft)}s`, 20, 48);

    ctx.textAlign = 'right';
    ctx.fillText(`Thuốc Nổ Dynamite: ${this.dynamiteCount} quả`, this.canvas.width - 20, 28);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 13px Outfit, sans-serif';
    if (this.state === 'playing') {
      ctx.fillText('Bấm nút để BẮN MÓC · Nhấn nút khi đang kéo đá để DÙNG DYNAMITE', 320, 345);
    } else if (this.state === 'day_clear') {
      ctx.fillText('ĐẠT MỤC TIÊU! Bấm nút để sang Ngày Tiếp Theo', 320, 180);
    } else {
      ctx.fillText('HẾT THỜI GIAN! Bấm nút để thử lại từ Ngày 1', 320, 180);
    }
    ctx.restore();
  }
}
