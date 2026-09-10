/**
 * DEVER TOWN - VOLLEYBALL 3-TOUCH RALLY 2.0
 * Mô phỏng bóng chuyền thi đấu 1v1 đối kháng:
 * 1. Vật lý vòm đầu bán nguyệt đàn hồi cao (Arc-body bounce)
 * 2. Cú đập bóng sấm sét (Power Spike Jump) dồn vệt lửa
 * 3. Chắn bóng trên lưới (Block) & Cứu bóng sát sàn
 * 4. Bot AI 3 cấp độ thông minh
 */

import { VOLLEYBALL_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class VolleyballRallyEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.playerScore = 0;
    this.botScore = 0;
    this.rallyCount = 0;
    this.keys = { left: false, right: false, up: false, spike: false };

    this.resetServe('player');
  }

  resetServe(servingSide = 'player') {
    const cfg = VOLLEYBALL_CONFIG;
    this.servingSide = servingSide;
    this.state = servingSide === 'player' ? 'serving_player' : 'serving_bot';

    this.player = {
      x: 120,
      y: cfg.floorY,
      vx: 0,
      vy: 0,
      isGrounded: true,
      touches: 0
    };

    this.bot = {
      x: 520,
      y: cfg.floorY,
      vx: 0,
      vy: 0,
      isGrounded: true,
      touches: 0
    };

    this.ball = {
      x: servingSide === 'player' ? 135 : 505,
      y: cfg.floorY - 35,
      vx: 0,
      vy: 0,
      radius: cfg.ball.radius,
      isSpiked: false
    };

    this.botServeTimer = 0.8;
  }

  onActionTrigger() {
    if (this.state === 'serving_player') {
      // Phát bóng bổng qua lưới
      this.state = 'rally';
      this.ball.vx = 4.8;
      this.ball.vy = -7.8;
      this.player.vy = -5.5;
      this.player.isGrounded = false;
      audioManager.playKick(1.0);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#38bdf8');
    } else if (this.state === 'rally') {
      // Nhảy hoặc Đập bóng (Spike) nếu bóng ở trên đầu
      if (this.player.isGrounded) {
        this.player.vy = VOLLEYBALL_CONFIG.player.jumpPower;
        this.player.isGrounded = false;
        audioManager.playKick(0.7);
      } else {
        // Kiểm tra tầm đập bóng Spike (Tăng bán kính với bóng lên 52px để người chơi dễ căn nhịp đập bóng)
        const dx = this.ball.x - this.player.x;
        const dy = this.ball.y - (this.player.y - 25);
        if (Math.hypot(dx, dy) < 52 && this.ball.y < this.player.y + 5) {
          // Spike smash uy lực!
          this.ball.vx = 9.4;
          this.ball.vy = 7.8;
          this.ball.isSpiked = true;
          audioManager.playSpikeSmash();
          this.juiceFX.shake(7, 0.2);
          this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 16, '#ef4444');
          this.juiceFX.spawnFloatingText('POWER SPIKE! 🔥', this.ball.x, this.ball.y - 20, { color: '#ef4444', size: 20 });
        }
      }
    } else if (this.state === 'scored') {
      this.resetServe(this.servingSide);
    }
  }

  update(dt) {
    const cfg = VOLLEYBALL_CONFIG;

    if (this.state === 'serving_player') {
      if (this.keys.left && this.player.x > 60) this.player.x -= cfg.player.moveSpeed;
      if (this.keys.right && this.player.x < cfg.net.x - 30) this.player.x += cfg.player.moveSpeed;
      this.ball.x = this.player.x + 14;
      this.ball.y = this.player.y - 35;
      return;
    }

    if (this.state === 'serving_bot') {
      this.botServeTimer -= dt;
      if (this.botServeTimer <= 0) {
        this.state = 'rally';
        this.ball.vx = -4.8;
        this.ball.vy = -7.8;
        this.bot.vy = -5.5;
        this.bot.isGrounded = false;
        audioManager.playKick(1.0);
        this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#f59e0b');
      }
      return;
    }

    if (this.state === 'scored') return;

    // 1. Trọng lực & Di chuyển người chơi
    if (this.keys.left && this.player.x > 45) this.player.x -= cfg.player.moveSpeed;
    if (this.keys.right && this.player.x < cfg.net.x - 25) this.player.x += cfg.player.moveSpeed;

    this.player.vy += cfg.gravity;
    this.player.y += this.player.vy;
    if (this.player.y >= cfg.floorY) {
      this.player.y = cfg.floorY;
      this.player.vy = 0;
      this.player.isGrounded = true;
    }

    // 2. Bot AI di chuyển đón bóng và nhảy đập
    const targetBotX = Math.max(cfg.net.x + 35, Math.min(this.ball.x + 5, 590));
    if (this.ball.x > cfg.net.x - 20) {
      if (this.bot.x < targetBotX - 4) this.bot.x += cfg.botTiers.medium.moveSpeed;
      else if (this.bot.x > targetBotX + 4) this.bot.x -= cfg.botTiers.medium.moveSpeed;

      // Bot nhảy đập bóng
      if (this.bot.isGrounded && Math.abs(this.ball.x - this.bot.x) < 32 && this.ball.y < 210 && this.ball.y > 140) {
        this.bot.vy = -8.2;
        this.bot.isGrounded = false;
      }
    }
    this.bot.vy += cfg.gravity;
    this.bot.y += this.bot.vy;
    if (this.bot.y >= cfg.floorY) {
      this.bot.y = cfg.floorY;
      this.bot.vy = 0;
      this.bot.isGrounded = true;
    }

    // 3. Vật lý quả bóng
    this.ball.vy += cfg.gravity;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // 4. Va chạm vòm đầu người chơi (Player Head Arc - Lực đánh bóng mạnh mẽ & có đà nhảy)
    const headX = this.player.x;
    const headY = this.player.y - 26;
    const distP = Math.hypot(this.ball.x - headX, this.ball.y - headY);
    if (distP < this.ball.radius + cfg.player.headRadius && this.ball.vy > 0) {
      const angle = Math.atan2(this.ball.y - headY, this.ball.x - headX);
      const jumpBoost = !this.player.isGrounded ? 2.2 : 0;
      this.ball.vx = Math.cos(angle) * (7.6 + jumpBoost);
      this.ball.vy = -Math.abs(Math.sin(angle) * 8.8) - 2.2 - jumpBoost;
      this.ball.isSpiked = false;
      this.rallyCount++;
      audioManager.playKick(1.1);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#38bdf8');
      this.juiceFX.spawnFloatingText('+1 Tâng Bóng', this.ball.x, this.ball.y - 15, { color: '#38bdf8', size: 13 });
    }

    // 5. Va chạm vòm đầu Bot AI
    const botHeadX = this.bot.x;
    const botHeadY = this.bot.y - 26;
    const distB = Math.hypot(this.ball.x - botHeadX, this.ball.y - botHeadY);
    if (distB < this.ball.radius + cfg.player.headRadius && this.ball.vy > 0) {
      const angle = Math.atan2(this.ball.y - botHeadY, this.ball.x - botHeadX);
      this.ball.vx = -Math.abs(Math.cos(angle) * 7.2) - 1.2;
      this.ball.vy = -Math.abs(Math.sin(angle) * 8.6) - 2.0;
      this.ball.isSpiked = false;
      this.rallyCount++;
      audioManager.playKick(0.9);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#f59e0b');
    }

    // 6. Va chạm lưới giữa sân (Triệt tiêu hoàn toàn lỗi dính lưới qua Positional Separation)
    const net = cfg.net;
    const netLeft = net.x - net.width / 2;
    const netRight = net.x + net.width / 2;
    if (
      this.ball.x + this.ball.radius >= netLeft &&
      this.ball.x - this.ball.radius <= netRight &&
      this.ball.y >= net.y
    ) {
      if (this.ball.x < net.x) {
        this.ball.x = netLeft - this.ball.radius - 3;
        this.ball.vx = -Math.abs(this.ball.vx || 4.2) * 0.85 - 2.0;
      } else {
        this.ball.x = netRight + this.ball.radius + 3;
        this.ball.vx = Math.abs(this.ball.vx || 4.2) * 0.85 + 2.0;
      }
      this.ball.vy = -Math.abs(this.ball.vy || 4.5) * 0.7 - 2.8;
      audioManager.playKick(0.6);
      this.juiceFX.shake(3, 0.1);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 6, '#ffffff');
    }

    // 7. Bóng chạm sàn
    if (this.ball.y >= cfg.floorY) {
      this.resolvePoint();
    }
  }

  resolvePoint() {
    this.state = 'scored';
    const cfg = VOLLEYBALL_CONFIG;

    if (this.ball.x > cfg.net.x) {
      // Người chơi ghi điểm!
      this.playerScore++;
      this.servingSide = 'player';
      audioManager.playGoalFanfare();
      this.juiceFX.shake(5, 0.15);
      this.juiceFX.spawnConfetti(this.ball.x, this.ball.y, 25);
      this.juiceFX.spawnFloatingText(`ĐIỂM CHO BẠN! +${this.rallyCount * 10}đ`, 320, 140, { color: '#22c55e', size: 22 });
      this.callbacks.onScoreUpdate?.(this.rallyCount * 10);
    } else {
      // Bot ghi điểm
      this.botScore++;
      this.servingSide = 'bot';
      this.rallyCount = 0;
      this.juiceFX.spawnFloatingText('ĐỐI THỦ GHI ĐIỂM!', 320, 140, { color: '#ef4444', size: 20 });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cfg = VOLLEYBALL_CONFIG;

    // Sân thi đấu sàn gỗ
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, cfg.floorY + 12, w, h - cfg.floorY - 12);

    // Lưới giữa sân
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cfg.net.x - 2, cfg.net.y, 4, cfg.floorY - cfg.net.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let y = cfg.net.y; y < cfg.floorY; y += 8) {
      ctx.beginPath();
      ctx.moveTo(cfg.net.x - 10, y);
      ctx.lineTo(cfg.net.x + 10, y);
      ctx.stroke();
    }

    // Người chơi (Xanh Cyan)
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    // Vòm đầu
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -25, cfg.player.headRadius, Math.PI, 0);
    ctx.fill();
    // Thân
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-12, -25, 24, 25);
    ctx.restore();

    // Bot AI (Vàng Cam)
    ctx.save();
    ctx.translate(this.bot.x, this.bot.y);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, -25, cfg.player.headRadius, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-12, -25, 24, 25);
    ctx.restore();

    // Quả bóng chuyền
    ctx.save();
    ctx.translate(this.ball.x, this.ball.y);
    ctx.fillStyle = this.ball.isSpiked ? '#ef4444' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // HUD Tỉ số
    this.renderHUD(ctx);
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 18px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`TỈ SỐ: ${this.playerScore}  -  ${this.botScore}`, 320, 32);

    ctx.font = '600 13px Outfit, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Rally Liên Hoàn: ${this.rallyCount} Lần`, 320, 54);

    ctx.font = '700 13px Outfit, sans-serif';
    ctx.fillStyle = '#38bdf8';
    if (this.state === 'serving_player') {
      ctx.fillText('Bấm nút Hành Động để PHÁT BÓNG BỔNG!', 320, 335);
    } else if (this.state === 'rally') {
      ctx.fillText('Bấm nút để NHẢY / ĐẬP BÓNG SPIKE!', 320, 335);
    } else {
      ctx.fillText('Bấm nút để sang lượt tiếp theo', 320, 335);
    }
    ctx.restore();
  }
}
