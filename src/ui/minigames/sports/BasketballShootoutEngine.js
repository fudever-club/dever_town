/**
 * DEVER TOWN - BASKETBALL ARCADE SHOOTOUT 2.0
 * Mô phỏng ném bóng rổ ném xiên Parabol chuẩn arcade:
 * 1. Quỹ đạo ném xiên (Projectile Parabola Physics)
 * 2. Va chạm đàn hồi bảng rổ mica & chốt vành kim loại (Rim Rattle)
 * 3. Cơ chế SWISH xé lưới + Chuỗi bốc lửa ON FIRE! 🔥
 * 4. Trụ rổ di chuyển đung đưa ở điểm số cao
 */

import { BASKETBALL_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class BasketballShootoutEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.score = 0;
    this.streak = 0;
    this.highScore = 0;

    this.reset();
  }

  reset() {
    this.state = 'aiming'; // 'aiming' | 'flying' | 'scored' | 'missed'
    this.power = 0.5;
    this.angle = 55; // Độ
    this.powerDir = 1;

    const b = BASKETBALL_CONFIG.ball;
    this.ball = {
      x: b.startX,
      y: b.startY,
      vx: 0,
      vy: 0,
      radius: b.radius,
      rotation: 0,
      hitBackboard: false,
      hitRim: false
    };

    this.hoopY = BASKETBALL_CONFIG.rim.y;
    this.hoopSpeed = BASKETBALL_CONFIG.movingHoop.speedY;
    this.netRipple = 0;
    this.isOnFire = this.streak >= BASKETBALL_CONFIG.scoring.onFireThreshold;
  }

  onActionTrigger() {
    if (this.state === 'aiming') {
      this.shoot();
    } else if (['scored', 'missed'].includes(this.state)) {
      this.reset();
    }
  }

  shoot() {
    this.state = 'flying';
    const rad = (this.angle * Math.PI) / 180;
    const speed = 11.5 + this.power * 7.5;

    this.ball.vx = Math.cos(rad) * speed;
    this.ball.vy = -Math.sin(rad) * speed;
    this.ball.hitBackboard = false;
    this.ball.hitRim = false;

    audioManager.playKick(0.8);
    this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 6, this.isOnFire ? '#ef4444' : '#ea580c');
  }

  update(dt) {
    const cfg = BASKETBALL_CONFIG;

    // 1. Trạng thái ngắm bắn
    if (this.state === 'aiming') {
      this.power += this.powerDir * dt * 1.5;
      if (this.power >= 1.0) {
        this.power = 1.0;
        this.powerDir = -1;
      } else if (this.power <= 0.1) {
        this.power = 0.1;
        this.powerDir = 1;
      }
      return;
    }

    // 2. Di chuyển trụ rổ ở điểm số cao
    if (this.score >= cfg.movingHoop.startScore) {
      this.hoopY += this.hoopSpeed * 60 * dt;
      if (this.hoopY > cfg.movingHoop.maxY || this.hoopY < cfg.movingHoop.minY) {
        this.hoopSpeed *= -1;
      }
    }

    if (this.state !== 'flying') return;

    // 3. Vật lý ném xiên quả bóng
    this.ball.vy += cfg.physics.gravity;
    this.ball.vx *= cfg.physics.airResistance;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.rotation += 0.08 + this.ball.vx * 0.02;

    if (this.isOnFire) {
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 2, '#f97316');
    }

    const bb = cfg.backboard;
    const rimX = cfg.rim.x;
    const rimY = this.hoopY;
    const rimW = cfg.rim.width;

    // 4. Va chạm Bảng rổ (Backboard)
    if (
      this.ball.x + this.ball.radius >= bb.x &&
      this.ball.x - this.ball.radius <= bb.x + bb.width &&
      this.ball.y >= bb.y - 20 &&
      this.ball.y <= bb.y + bb.height
    ) {
      this.ball.vx = -Math.abs(this.ball.vx) * cfg.physics.restitutionBackboard;
      this.ball.x = bb.x - this.ball.radius - 1;
      this.ball.hitBackboard = true;
      audioManager.playRimBounce();
      this.juiceFX.shake(3, 0.1);
    }

    // 5. Va chạm chốt vành trái & phải
    const pegs = [
      { x: rimX, y: rimY },
      { x: rimX + rimW, y: rimY }
    ];

    for (const peg of pegs) {
      const dx = this.ball.x - peg.x;
      const dy = this.ball.y - peg.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.ball.radius + cfg.rim.pegRadius) {
        // Phản xạ góc đàn hồi
        const angle = Math.atan2(dy, dx);
        const speed = Math.hypot(this.ball.vx, this.ball.vy) * cfg.physics.restitutionRim;
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
        this.ball.hitRim = true;
        audioManager.playRimBounce();
        this.juiceFX.shake(4, 0.1);
      }
    }

    // 6. Kiểm tra lọt rổ
    const hoopCenterX = rimX + rimW / 2;
    if (
      this.ball.y >= rimY &&
      this.ball.y <= rimY + 16 &&
      this.ball.vy > 0 &&
      Math.abs(this.ball.x - hoopCenterX) < rimW / 2 - 4
    ) {
      this.resolveBasket(this.ball.hitRim || this.ball.hitBackboard);
      return;
    }

    // 7. Rơi chạm đất -> Ném trượt
    if (this.ball.y > 340) {
      this.state = 'missed';
      this.streak = 0;
      this.isOnFire = false;
      this.juiceFX.spawnFloatingText('NÉM TRƯỢT!', 320, 160, { color: '#94a3b8' });
    }
  }

  resolveBasket(touchedRim) {
    this.state = 'scored';
    this.streak++;
    this.isOnFire = this.streak >= BASKETBALL_CONFIG.scoring.onFireThreshold;

    let pts = BASKETBALL_CONFIG.scoring.normalBasket;
    let label = 'VÀO RỔ! +2đ';

    if (!touchedRim) {
      pts += BASKETBALL_CONFIG.scoring.swishBonus;
      label = 'SWISH! RÁCH LƯỚI! +5đ';
      audioManager.playSwish();
    } else {
      audioManager.playGoalFanfare();
    }

    if (this.isOnFire) {
      pts *= BASKETBALL_CONFIG.scoring.onFireMultiplier;
      label += ' (ON FIRE! 🔥)';
      audioManager.playOnFire();
    }

    this.score += pts;
    this.juiceFX.shake(6, 0.15);
    this.juiceFX.spawnConfetti(BASKETBALL_CONFIG.rim.x + 30, this.hoopY, 25);
    this.juiceFX.spawnFloatingText(label, 320, 140, { color: this.isOnFire ? '#ea580c' : '#fbbf24', size: 22 });

    this.callbacks.onScoreUpdate?.(pts);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cfg = BASKETBALL_CONFIG;

    // Sân bóng rổ sàn gỗ bóng phản chiếu
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 240, 0, h);
    grad.addColorStop(0, '#c2410c');
    grad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 250, w, h - 250);

    // Vạch sân bóng rổ
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cfg.rim.x + 30, 250, 140, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Bảng rổ mica & Vành rổ
    const bb = cfg.backboard;
    const rimX = cfg.rim.x;
    const rimY = this.hoopY;
    const rimW = cfg.rim.width;

    // Trụ rổ sắt
    ctx.fillStyle = '#475569';
    ctx.fillRect(bb.x + bb.width, rimY - 30, 8, 200);

    // Bảng rổ
    ctx.fillStyle = bb.color;
    ctx.fillRect(bb.x, bb.y, bb.width, bb.height);
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.strokeRect(bb.x, bb.y, bb.width, bb.height);

    // Vành rổ cam kim loại
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(rimX, rimY);
    ctx.lineTo(rimX + rimW, rimY);
    ctx.stroke();

    // Lưới bóng rổ vải dù
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rimX, rimY);
    ctx.lineTo(rimX + 10, rimY + cfg.rim.netDepth);
    ctx.lineTo(rimX + rimW - 10, rimY + cfg.rim.netDepth);
    ctx.lineTo(rimX + rimW, rimY);
    ctx.stroke();

    // Quả bóng rổ
    ctx.save();
    ctx.translate(this.ball.x, this.ball.y);
    ctx.rotate(this.ball.rotation);
    ctx.fillStyle = this.isOnFire ? '#f97316' : cfg.ball.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Rãnh cao su bóng rổ
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.ball.radius - 1, 0, Math.PI * 2);
    ctx.moveTo(-this.ball.radius, 0);
    ctx.lineTo(this.ball.radius, 0);
    ctx.stroke();
    ctx.restore();

    // Đường dự đoán quỹ đạo khi ngắm
    if (this.state === 'aiming') {
      this.renderAimTrajectory(ctx);
    }

    // HUD Điểm & Chuỗi
    this.renderHUD(ctx);
  }

  renderAimTrajectory(ctx) {
    ctx.save();
    const rad = (this.angle * Math.PI) / 180;
    const speed = 11.5 + this.power * 7.5;
    let simX = this.ball.x;
    let simY = this.ball.y;
    let simVx = Math.cos(rad) * speed;
    let simVy = -Math.sin(rad) * speed;

    ctx.fillStyle = 'rgba(251, 191, 36, 0.65)';
    for (let i = 0; i < 16; i++) {
      simVy += BASKETBALL_CONFIG.physics.gravity;
      simX += simVx;
      simY += simVy;
      ctx.beginPath();
      ctx.arc(simX, simY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 16px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Điểm Số: ${this.score}`, 20, 30);
    ctx.fillText(`Chuỗi Liên Hoàn: ${this.streak} ${this.isOnFire ? '🔥 ON FIRE!' : ''}`, 20, 52);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 13px Outfit, sans-serif';
    if (this.state === 'aiming') {
      ctx.fillText('Bấm nút Hành Động hoặc Click để NÉM BÓNG PARABOL!', 320, 335);
    } else {
      ctx.fillText('Bấm nút Hành Động để ném quả tiếp theo', 320, 335);
    }
    ctx.restore();
  }
}
