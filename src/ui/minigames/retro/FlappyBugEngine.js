/**
 * DEVER TOWN - FLAPPY BUGGY 3.0 (RETRO ARCADE)
 * Trò chơi điều khiển chú bọ Buggy vỗ cánh bay qua các cột Server FPTU:
 * 1. Vật lý bay lượn chân thực (Gravity, Flap Impulse, Góc nghiêng chúi/ngẩng đầu theo vận tốc).
 * 2. Cột Server Racks công nghệ cao: Thân kim loại, đèn LED trạng thái nhấp nháy, viền laser neon.
 * 3. Nền Parallax 3 lớp: Bầu trời sao đêm lấp lánh, hình bóng Tòa nhà Alpha FPTU & Cầu Rồng Đà Nẵng.
 * 4. Hệ thống Huy Chương (Medals): Đồng (10đ), Bạc (25đ), Vàng (50đ), Bạch Kim (100đ).
 * 5. Điều khiển đa năng: Phím Space, Phím Mũi Tên Lên, W, Click Chuột / Chạm Cảm Ứng.
 */

import { FLAPPY_BUG_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';
import { isTouchDevice } from '../common/touchHints.js';

export class FlappyBugEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;
    // Hint điều khiển in-canvas phải đúng thiết bị (2026-10-09, yêu cầu của Hưng).
    this.isTouch = isTouchDevice();

    this.cfg = FLAPPY_BUG_CONFIG;
    this.w = canvas.width;
    this.h = canvas.height;

    this.state = 'ready'; // 'ready', 'playing', 'game_over'
    this.score = 0;
    const savedHigh = typeof localStorage !== 'undefined' ? localStorage.getItem('dever_flappy_high') : null;
    this.highScore = parseInt(savedHigh || '0', 10);

    this.buggy = {
      x: this.cfg.buggy.startX || 120,
      y: this.cfg.buggy.startY || 160,
      vy: 0,
      angle: 0,
      radius: this.cfg.buggy.radius || 14,
      wingTimer: 0
    };

    this.pipes = [];
    this.pipeTimer = 0;
    this.groundOffset = 0;
    this.animTimer = 0;
    this.deathCooldown = 0;
    this.hitStop = 0;
    this.newBest = false;
    this.modalY = -240; // Slide down animation

    // Khởi tạo các ngôi sao lấp lánh trên bầu trời
    this.stars = [];
    for (let i = 0; i < 35; i++) {
      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * (this.h - 90),
        r: 1 + Math.random() * 1.8,
        speed: 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.reset();
  }

  reset() {
    this.state = 'ready';
    this.score = 0;
    this.newBest = false;
    this.modalY = -240;
    this.deathCooldown = 0;

    this.buggy.x = this.cfg.buggy.startX || 120;
    this.buggy.y = this.cfg.buggy.startY || 160;
    this.buggy.vy = 0;
    this.buggy.angle = 0;
    this.buggy.wingTimer = 0;

    this.pipes = [];
    this.pipeTimer = 0.5; // Đợi một chút trước khi cột đầu tiên xuất hiện

    this.callbacks.onScoreUpdate?.(0);
  }

  // Playfield thích ứng hướng màn hình (2026-10-09): cập nhật w/h, kẹp chú bọ
  // vào biên mới, co giãn các cột hiện có theo tỉ lệ mặt đất mới, rải lại sao.
  // Vật lý (gravity 920, flapForce -310, pipeSpeed 140) giữ nguyên.
  resize(w, h) {
    const phys = this.cfg.physics;
    const groundH = phys.groundHeight || 44;
    const oldGroundY = this.h - groundH;
    this.w = w;
    this.h = h;
    const groundY = h - groundH;

    const r = this.buggy.radius || 14;
    this.buggy.y = Math.min(Math.max(this.buggy.y, r), groundY - r);

    const gap = phys.pipeGap || 116;
    const oldSpan = Math.max(1, oldGroundY - gap);
    const newSpan = Math.max(1, groundY - gap);
    for (const p of this.pipes) {
      p.x = Math.min(p.x, w + 10);
      const ratio = p.topH / oldSpan;
      p.topH = Math.floor(ratio * newSpan);
      p.bottomY = p.topH + gap;
      p.bottomH = groundY - p.bottomY;
    }

    for (const s of this.stars) {
      s.x = Math.random() * w;
      s.y = Math.random() * Math.max(60, h - 90);
    }
  }

  flap() {
    if (this.state === 'game_over') {
      if (this.deathCooldown <= 0) {
        this.hitStop = 0;
        this.reset();
      }
      return;
    }

    if (this.hitStop > 0) return;

    if (this.state === 'ready') {
      this.state = 'playing';
      this.buggy.vy = this.cfg.physics.flapForce || -310;
      audioManager.playSwish();
      this.juiceFX.spawnDust(this.buggy.x - 6, this.buggy.y + 4, 3, '#34d399');
    } else if (this.state === 'playing') {
      this.buggy.vy = this.cfg.physics.flapForce || -310;
      this.buggy.wingTimer = 0.28; // Hoạt ảnh đập cánh nhanh
      audioManager.playSwish();
      this.juiceFX.spawnDust(this.buggy.x - 6, this.buggy.y + 4, 3, '#34d399');
    }
  }

  onActionTrigger() {
    this.flap();
  }

  handleKeyDown(e) {
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || key === ' ' || key === 'enter' || code === 'Enter') {
      this.flap();
    } else if (code === 'KeyR' || key === 'r') {
      this.reset();
    }
  }

  handlePointerClick(x, y) {
    this.flap();
  }

  update(dt) {
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    this.animTimer += dt;
    const phys = this.cfg.physics;
    const groundY = this.h - (phys.groundHeight || 44);

    if (this.state === 'ready') {
      // Chú bọ Buggy bồng bềnh nhấp nhô trên không trung
      this.buggy.y = (this.cfg.buggy.startY || 160) + Math.sin(this.animTimer * 4.5) * 8;
      this.buggy.angle = Math.sin(this.animTimer * 3) * 0.08;
      this.groundOffset = (this.groundOffset + 60 * dt) % 24;
      return;
    }

    if (this.state === 'playing') {
      // 1. Vật lý rơi tự do
      this.buggy.vy += phys.gravity * dt;
      if (this.buggy.vy > (phys.maxDropSpeed || 440)) {
        this.buggy.vy = phys.maxDropSpeed;
      }
      this.buggy.y += this.buggy.vy * dt;

      // 2. Góc nghiêng theo vận tốc rơi/bay
      const targetAngle = Math.max(-0.45, Math.min(1.25, this.buggy.vy * 0.003));
      this.buggy.angle += (targetAngle - this.buggy.angle) * 14 * dt;

      // 3. Cuộn mặt đất & các cột server
      this.groundOffset = (this.groundOffset + phys.pipeSpeed * dt) % 24;

      // Sinh cột mới
      this.pipeTimer -= dt;
      if (this.pipeTimer <= 0) {
        this.pipeTimer = phys.pipeIntervalSec || 1.85;
        this.spawnPipe();
      }

      // 4. Cập nhật vị trí và va chạm của các cột Server
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const p = this.pipes[i];
        p.x -= phys.pipeSpeed * dt;

        // Điểm số khi vượt qua giữa khe hở
        if (!p.passed && p.x + p.w / 2 < this.buggy.x) {
          p.passed = true;
          this.score++;

          audioManager.playPickup();
          this.juiceFX.spawnFloatingText('+1', this.buggy.x + 8, this.buggy.y - 18, { color: '#38bdf8', size: 16 });
          this.juiceFX.spawnSparkles(p.x + p.w / 2, p.topH + p.gap / 2, 8, '#38bdf8');

          if (this.score > this.highScore) {
            this.highScore = this.score;
            this.newBest = true;
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('dever_flappy_high', this.highScore.toString());
            }
          }

          this.callbacks.onScoreUpdate?.(this.score);
        }

        // Xóa cột đã trôi ra ngoài màn hình
        if (p.x + p.w < -30) {
          this.pipes.splice(i, 1);
          continue;
        }

        // Kiểm tra va chạm với cột Server
        if (this.checkPipeCollision(p)) {
          this.triggerGameOver();
          return;
        }
      }

      // 5. Kiểm tra va chạm trần hoặc mặt đất
      if (this.buggy.y - this.buggy.radius <= 0) {
        this.buggy.y = this.buggy.radius;
        this.buggy.vy = 0;
      }
      if (this.buggy.y + this.buggy.radius >= groundY) {
        this.buggy.y = groundY - this.buggy.radius;
        this.triggerGameOver();
        return;
      }
    }

    if (this.state === 'game_over') {
      if (this.deathCooldown > 0) {
        this.deathCooldown -= dt;
      }

      // Buggy rơi xuống sàn nếu đang trên không
      if (this.buggy.y + this.buggy.radius < groundY) {
        this.buggy.vy += phys.gravity * 1.2 * dt;
        this.buggy.y += this.buggy.vy * dt;
        this.buggy.angle = Math.min(1.4, this.buggy.angle + 6 * dt);
        if (this.buggy.y + this.buggy.radius >= groundY) {
          this.buggy.y = groundY - this.buggy.radius;
          this.buggy.vy = 0;
        }
      }

      // Animation bảng điểm trượt xuống
      if (this.modalY < 48) {
        this.modalY += (48 - this.modalY) * 10 * dt;
      }
    }
  }

  spawnPipe() {
    const phys = this.cfg.physics;
    const groundY = this.h - (phys.groundHeight || 44);
    const minTop = 45;
    // Màn hình dọc: khe hở phân bố trên toàn chiều cao mới thay vì chỉ 185px
    // trên cùng (2026-10-09). Desktop (h<=400) giữ nguyên để không đổi độ khó.
    const gap = phys.pipeGap || 116;
    const maxTop = this.h > 400
      ? Math.floor(groundY - gap - (this.cfg.portraitPipeTopMargin || 80))
      : 185;
    const topH = Math.floor(minTop + Math.random() * Math.max(20, maxTop - minTop));

    this.pipes.push({
      x: this.w + 10,
      topH,
      gap,
      w: phys.pipeWidth || 54,
      passed: false,
      bottomY: topH + gap,
      bottomH: groundY - (topH + gap),
      ledSeed: Math.random() * 100
    });
  }

  checkPipeCollision(p) {
    const bx = this.buggy.x;
    const by = this.buggy.y;
    const r = this.buggy.radius - 2.5; // Hitbox thu gọn 2.5px để công bằng và đã tay

    // 1. Cột trên: [p.x, 0, p.w, p.topH]
    const closestXTop = Math.max(p.x, Math.min(bx, p.x + p.w));
    const closestYTop = Math.max(0, Math.min(by, p.topH));
    if (Math.hypot(bx - closestXTop, by - closestYTop) < r) {
      return true;
    }

    // 2. Cột dưới: [p.x, p.bottomY, p.w, p.bottomH]
    const closestXBot = Math.max(p.x, Math.min(bx, p.x + p.w));
    const closestYBot = Math.max(p.bottomY, Math.min(by, p.bottomY + p.bottomH));
    if (Math.hypot(bx - closestXBot, by - closestYBot) < r) {
      return true;
    }

    return false;
  }

  triggerGameOver() {
    if (this.state === 'game_over') return;
    this.state = 'game_over';
    this.deathCooldown = 0.45;
    this.hitStop = 0.06;

    audioManager.playExplosion();
    this.juiceFX.shake(9, 0.25);
    this.juiceFX.spawnConfetti(this.buggy.x, this.buggy.y, 35);
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    const groundY = h - (this.cfg.physics.groundHeight || 44);

    // 1. Nền Bầu Trời Đêm Cyberpunk Parallax
    const gradSky = ctx.createLinearGradient(0, 0, 0, groundY);
    gradSky.addColorStop(0, this.cfg.colors?.skyTop || '#090d16');
    gradSky.addColorStop(1, this.cfg.colors?.skyBottom || '#1e1b4b');
    ctx.fillStyle = gradSky;
    ctx.fillRect(0, 0, w, groundY);

    // Ngôi sao lấp lánh
    ctx.fillStyle = '#ffffff';
    for (const s of this.stars) {
      const alpha = 0.3 + 0.7 * (Math.sin(this.animTimer * s.speed + s.phase) * 0.5 + 0.5);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Mặt trăng tỏa sáng trên cao
    ctx.save();
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.5)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(w - 75, 55, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Silhouette Đường Chân Trời Đà Nẵng (Tòa Alpha & Cầu Rồng)
    this.renderSkyline(ctx, groundY);

    // 3. Các Cột Server Racks FPTU (Pipes)
    for (const p of this.pipes) {
      this.renderServerRackPipe(ctx, p, groundY);
    }

    // 4. Mặt Đất Cyber Grid
    this.renderGround(ctx, groundY);

    // 5. Chú Bọ Buggy FPTU
    this.renderBuggy(ctx);

    // 6. Điểm Số Đang Chơi hoặc Bảng Tổng Kết Game Over
    this.renderHUD(ctx);
  }

  renderSkyline(ctx, groundY) {
    ctx.save();
    ctx.fillStyle = '#111827';
    ctx.globalAlpha = 0.55;

    // Lát (tile) skyline theo chiều ngang để phủ màn hình rộng (landscape 2:1).
    // (2026-10-09, orientation-aware layout)
    for (let ox = 0; ox < this.w; ox += 640) {
      ctx.save();
      ctx.translate(ox, 0);

    // Vòm Cầu Rồng uốn lượn xa xăm
    ctx.beginPath();
    ctx.moveTo(30, groundY);
    ctx.quadraticCurveTo(110, groundY - 65, 190, groundY);
    ctx.quadraticCurveTo(270, groundY - 65, 350, groundY);
    ctx.fill();

    // Dãy tòa nhà Campus FPTU & Tòa Alpha góc nhọn
    ctx.fillRect(410, groundY - 80, 50, 80);
    ctx.fillRect(470, groundY - 110, 45, 110);
    // Mái chéo tòa Alpha
    ctx.beginPath();
    ctx.moveTo(525, groundY);
    ctx.lineTo(525, groundY - 95);
    ctx.lineTo(580, groundY - 130);
    ctx.lineTo(605, groundY - 60);
    ctx.lineTo(605, groundY);
    ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  renderServerRackPipe(ctx, p, groundY) {
    ctx.save();

    const bodyColor = this.cfg.colors?.pipeBody || '#1e293b';
    const borderColor = this.cfg.colors?.pipeBorder || '#334155';
    const neonCyan = this.cfg.colors?.pipeGlow || '#06b6d4';

    // 1. CỘT TRÊN (Top Server Rack)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(p.x, 0, p.w, p.topH);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, 0, p.w, p.topH);

    // Nắp chân đế rack trên (Cap)
    const capH = 14;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p.x - 3, p.topH - capH, p.w + 6, capH);
    ctx.strokeStyle = neonCyan;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x - 3, p.topH - capH, p.w + 6, capH);

    // Đèn Laser chỉ điểm ở mép khe hở
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillRect(p.x + 4, p.topH - 3, p.w - 8, 2);

    // Các rãnh máy chủ và đèn LED cột trên
    this.renderRackUnits(ctx, p.x, 10, p.w, p.topH - capH - 12, p.ledSeed);

    // 2. CỘT DƯỚI (Bottom Server Rack)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(p.x, p.bottomY, p.w, p.bottomH);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.bottomY, p.w, p.bottomH);

    // Nắp chân đế rack dưới (Cap)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p.x - 3, p.bottomY, p.w + 6, capH);
    ctx.strokeStyle = neonCyan;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x - 3, p.bottomY, p.w + 6, capH);

    // Đèn Laser chỉ điểm ở mép khe hở
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillRect(p.x + 4, p.bottomY + 1, p.w - 8, 2);

    // Các rãnh máy chủ và đèn LED cột dưới
    this.renderRackUnits(ctx, p.x, p.bottomY + capH + 6, p.w, p.bottomH - capH - 12, p.ledSeed + 50);

    ctx.restore();
  }

  renderRackUnits(ctx, x, startY, w, totalH, seed) {
    if (totalH <= 16) return;
    const unitH = 14;
    const count = Math.floor(totalH / unitH);

    for (let i = 0; i < count; i++) {
      const uy = startY + i * unitH;
      // Đường phân chia rack U
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 5, uy + 2, w - 10, unitH - 4);

      // Đèn LED nhấp nháy
      const blink = Math.sin(this.animTimer * 6 + seed + i * 2) > 0.1;
      ctx.fillStyle = blink ? '#22c55e' : (i % 2 === 0 ? '#38bdf8' : '#eab308');
      ctx.beginPath();
      ctx.arc(x + 11, uy + unitH / 2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Khe tản nhiệt
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(x + 18, uy + unitH / 2 - 1.5, w - 26, 3);
    }
  }

  renderGround(ctx, groundY) {
    const h = this.h;
    const w = this.w;
    const gh = h - groundY;

    ctx.save();
    // Khối đất cyber
    ctx.fillStyle = this.cfg.colors?.ground || '#0f172a';
    ctx.fillRect(0, groundY, w, gh);

    // Đường viền Neon Cyan ngăn cách bầu trời
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // Lưới vi mạch cuộn theo bước di chuyển
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    const step = 24;
    for (let x = -step + this.groundOffset; x < w + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 12, h);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderBuggy(ctx) {
    const b = this.buggy;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);

    // 1. Cánh bọ Beetle trong suốt (Flapping Wings)
    const isFlapping = b.wingTimer > 0 || Math.abs(b.vy) > 80;
    const wingFlapAngle = Math.sin(this.animTimer * 28) * 0.45;

    ctx.save();
    ctx.fillStyle = this.cfg.colors?.buggyWing || 'rgba(255, 255, 255, 0.65)';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;

    // Cánh trái
    ctx.beginPath();
    ctx.ellipse(-6, -11 + (isFlapping ? wingFlapAngle * 5 : 0), 11, 5, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cánh phải
    ctx.beginPath();
    ctx.ellipse(-6, 11 - (isFlapping ? wingFlapAngle * 5 : 0), 11, 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Thân Vỏ Bọ Tròn Linh Vật Buggy (Green Shell)
    ctx.fillStyle = this.cfg.colors?.buggyShell || '#10b981';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.radius + 2, b.radius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Điểm đốm vàng nhận diện linh vật Buggy
    ctx.fillStyle = this.cfg.colors?.buggySpots || '#fde047';
    ctx.beginPath();
    ctx.arc(-4, -5, 2.8, 0, Math.PI * 2);
    ctx.arc(-4, 5, 2.8, 0, Math.PI * 2);
    ctx.arc(-8, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Đường viền chia cánh lưng
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(b.radius - 2, 0);
    ctx.lineTo(-b.radius, 0);
    ctx.stroke();

    // 3. Hai Ăng-ten chú bọ Buggy
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const antennaSway = Math.sin(this.animTimer * 12) * 2;

    // Ăng-ten trên
    ctx.beginPath();
    ctx.moveTo(b.radius - 2, -4);
    ctx.quadraticCurveTo(b.radius + 6, -10 + antennaSway, b.radius + 10, -12);
    ctx.stroke();
    // Chóp ăng-ten
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(b.radius + 10, -12, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Ăng-ten dưới
    ctx.beginPath();
    ctx.moveTo(b.radius - 2, 4);
    ctx.quadraticCurveTo(b.radius + 6, 10 - antennaSway, b.radius + 10, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.radius + 10, 12, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Mắt To Tròn Linh Vật Anime
    // Tròng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.radius - 4, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Con ngươi đen
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(b.radius - 2.5, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Đốm sáng long lanh
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(b.radius - 3, -5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Má hồng phấn dễ thương
    ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(b.radius - 6, 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderHUD(ctx) {
    const w = this.w;
    const h = this.h;

    ctx.save();

    if (this.state === 'ready') {
      // Dòng chữ hướng dẫn nhấp nháy
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 24px "Be Vietnam Pro", sans-serif';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fillText('FLAPPY BUGGY', w / 2, 110);

      ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#38bdf8';
      const pulse = Math.sin(this.animTimer * 6) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillText(this.isTouch ? 'CHẠM ĐỂ VỖ CÁNH' : 'BẤM PHÍM CÁCH (SPACE) HOẶC CLICK ĐỂ VỖ CÁNH', w / 2, 230);
      ctx.globalAlpha = 1.0;
    } else if (this.state === 'playing') {
      // Điểm số lớn sắc nét trên đỉnh màn hình
      ctx.textAlign = 'center';
      ctx.font = '900 38px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(this.score.toString(), w / 2, 54);
    } else if (this.state === 'game_over') {
      // Khung Modal Bảng Điểm Tổng Kết rơi xuống
      const my = this.modalY;
      const mw = 360;
      const mh = 220;
      const mx = (w - mw) / 2;

      // Hộp modal kính mờ viền neon
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, mh, 10);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tiêu đề Game Over
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 22px "Be Vietnam Pro", sans-serif';
      ctx.fillText('BUGGY ĐÃ VA CHẠM!', w / 2, my + 38);

      // Huy chương (Medal)
      this.renderMedal(ctx, mx + 55, my + 105);

      // Điểm số hiện tại & Kỷ lục
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText('ĐIỂM SỐ', mx + mw - 35, my + 82);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 26px "Be Vietnam Pro", sans-serif';
      ctx.fillText(this.score.toString(), mx + mw - 35, my + 112);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText('KỶ LỤC TỐT NHẤT', mx + mw - 35, my + 140);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 22px "Be Vietnam Pro", sans-serif';
      ctx.fillText(this.highScore.toString(), mx + mw - 35, my + 166);

      if (this.newBest) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = '800 12px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ KỶ LỤC MỚI ĐƯỢC THIẾT LẬP! ★', w / 2, my + mh - 26);
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.isTouch ? 'Chạm để bay tiếp' : 'Bấm Space hoặc Click Chuột để bay tiếp', w / 2, my + mh - 26);
      }
    }

    ctx.restore();
  }

  renderMedal(ctx, cx, cy) {
    const medals = this.cfg.medals;
    let medalName = 'Tập Sự';
    let medalColor = '#64748b';
    let ringColor = '#94a3b8';

    if (this.score >= medals.platinum) {
      medalName = 'Bạch Kim';
      medalColor = '#38bdf8';
      ringColor = '#e0f2fe';
    } else if (this.score >= medals.gold) {
      medalName = 'Vàng';
      medalColor = '#facc15';
      ringColor = '#fef08a';
    } else if (this.score >= medals.silver) {
      medalName = 'Bạc';
      medalColor = '#cbd5e1';
      ringColor = '#ffffff';
    } else if (this.score >= medals.bronze) {
      medalName = 'Đồng';
      medalColor = '#d97706';
      ringColor = '#fde68a';
    }

    ctx.save();
    // Vòng huy chương kim loại
    ctx.fillStyle = medalColor;
    ctx.shadowColor = medalColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ngôi sao ở giữa
    ctx.fillStyle = ringColor;
    ctx.font = '900 18px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', cx, cy + 1);

    // Tên huy chương
    ctx.fillStyle = ringColor;
    ctx.font = '800 11px "Be Vietnam Pro", sans-serif';
    ctx.fillText(medalName, cx, cy + 38);
    ctx.restore();
  }
}
