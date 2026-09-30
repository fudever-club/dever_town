/**
 * DEVER TOWN - GEOMETRY DASH / DEVER DASH 3.0 (RETRO ARCADE)
 * Trò chơi vượt chướng ngại vật nhịp điệu tốc độ cao (Rhythm-Action Platformer):
 * 1. Khối Cyber Cube lướt trên đường băng, xoay 90 độ mượt mà khi bật nhảy.
 * 2. Đa dạng chướng ngại vật & cơ chế:
 *    - Gai nhọn Neon Spikes (chạm vào là vỡ tan)
 *    - Khối hộp Solid Blocks (tiếp đất trên đỉnh an toàn, đâm vào cạnh trước là va chạm)
 *    - Đệm nhún Jump Pads (vàng bật cao, hồng bật thấp)
 *    - Vòng đệm trên không Jump Rings (nhấp phím khi chạm vòng để nhảy kép trên không)
 *    - Cổng Đảo Trọng Lực Gravity Portals (Lộn ngược trần nhà và sàn nhà)
 * 3. Hồi sinh siêu tốc (Instant Respawn 0.28s) không làm đứt mạch hưng phấn.
 * 4. Thanh tiến trình màn chơi (0% -> 100%) và bộ đếm số lần thử (Attempts Counter).
 */

import { GEOMETRY_DASH_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class GeometryDashEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.cfg = GEOMETRY_DASH_CONFIG;
    this.w = canvas.width;
    this.h = canvas.height;

    this.state = 'ready'; // 'ready', 'running', 'dead', 'complete'
    const savedAttempts = typeof localStorage !== 'undefined' ? localStorage.getItem('dever_dash_attempts') : null;
    const savedBest = typeof localStorage !== 'undefined' ? localStorage.getItem('dever_dash_best') : null;
    this.attempts = parseInt(savedAttempts || '1', 10);
    this.bestPercent = parseInt(savedBest || '0', 10);
    this.currentPercent = 0;

    this.screenX = 110; // Tọa độ X cố định của Cube trên màn hình
    this.size = this.cfg.physics.cubeSize || 28;
    this.groundY = this.cfg.physics.groundY || 300;
    this.ceilingY = this.cfg.physics.ceilingY || 52;

    this.cube = {
      y: this.groundY - this.size,
      vy: 0,
      angle: 0,
      targetAngle: 0,
      gravityDir: 1, // 1: trọng lực hướng xuống sàn, -1: lộn ngược lên trần
      isGrounded: true,
      currentSpeed: this.cfg.physics.baseSpeed || 330
    };

    this.cameraX = 0;
    this.isHoldingJump = false;
    this.respawnTimer = 0;
    this.animTimer = 0;
    this.trail = []; // Vệt mờ đằng sau cube

    // Tạo các phần tử của màn chơi
    this.initLevel();
  }

  initLevel() {
    this.elements = [];
    const bs = this.size; // 28px
    const gy = this.groundY; // 300
    const cy = this.ceilingY; // 52

    // Helper tạo gai
    const addSpike = (x, y = gy, dir = 1) => {
      this.elements.push({ type: 'spike', x, y, w: bs, h: bs, dir });
    };

    // Helper tạo khối hộp
    const addBlock = (x, y, wCount = 1, hCount = 1) => {
      for (let r = 0; r < hCount; r++) {
        for (let c = 0; c < wCount; c++) {
          this.elements.push({
            type: 'block',
            x: x + c * bs,
            y: y - r * bs - bs,
            w: bs,
            h: bs
          });
        }
      }
    };

    // Helper tạo đệm nhún
    const addPad = (x, y = gy, color = 'yellow') => {
      this.elements.push({ type: 'pad', x, y, w: bs, h: 10, color });
    };

    // Helper tạo vòng nhảy trên không
    const addRing = (x, y, color = 'yellow') => {
      this.elements.push({ type: 'ring', x, y, r: 14, color, triggered: false });
    };

    // Helper tạo cổng trọng lực
    const addPortal = (x, y, portalType = 'gravity_up') => {
      this.elements.push({ type: 'portal', x, y, w: 24, h: 72, portalType });
    };

    // ========================================================
    // THIẾT KẾ MÀN CHƠI: "DEVER RHYTHM ODYSSEY" (Chiều dài 10200px)
    // ========================================================

    // --- PHẦN 1: KHỞI ĐỘNG NHẬP MÔN (0% - 22% / x: 0 -> 2200) ---
    addSpike(420);
    addSpike(680);
    addSpike(710); // Double spike

    // Cầu thang hộp 3 bậc
    addBlock(950, gy, 2, 1);
    addBlock(1060, gy, 2, 2);
    addSpike(1160);
    addBlock(1260, gy, 2, 1);

    // Đệm vàng bật qua hố gai triple
    addPad(1460, gy, 'yellow');
    addSpike(1520);
    addSpike(1550);
    addSpike(1580);
    addBlock(1640, gy, 3, 1);

    addSpike(1850);
    addBlock(1980, gy, 2, 2);
    addSpike(2080);

    // --- PHẦN 2: THÁP LƠ LỬNG & VÒNG NHẢY TRÊN KHÔNG (22% - 48% / x: 2200 -> 4800) ---
    // Nhảy qua vòng vàng trên không
    addSpike(2360);
    addRing(2420, gy - 60, 'yellow');
    addBlock(2550, gy, 2, 2);
    addSpike(2680);

    // Bậc thang lơ lửng trên cao
    addBlock(2850, gy - 45, 3, 1);
    addBlock(3020, gy - 90, 3, 1);
    addSpike(3030, gy); // Gai dưới sàn khi đang đi trên cao
    addSpike(3060, gy);
    addRing(3180, gy - 130, 'yellow');
    addBlock(3300, gy - 70, 3, 1);
    addSpike(3450);

    // Đệm hồng nhún thấp
    addPad(3650, gy, 'pink');
    addBlock(3730, gy, 1, 2);
    addSpike(3820);
    addRing(3920, gy - 65, 'yellow');
    addBlock(4050, gy, 3, 2);
    addSpike(4180);
    addSpike(4210);

    addBlock(4400, gy, 2, 1);
    addBlock(4520, gy, 2, 2);
    addBlock(4640, gy, 2, 3);

    // --- PHẦN 3: CỔNG ĐẢO TRỌNG LỰC (GRAVITY FLIP) (48% - 74% / x: 4800 -> 7500) ---
    // Cổng cam lộn ngược lên trần
    addPortal(4900, gy - 80, 'gravity_up');
    // Từ đây nhân vật đi trên trần nhà (ceilingY)
    addSpike(5150, cy, -1); // Gai nhọn chúc xuống từ trần
    addSpike(5380, cy, -1);

    // Bục lơ lửng bám trần
    addBlock(5550, cy + bs * 2, 3, 1);
    addSpike(5700, cy, -1);
    addSpike(5730, cy, -1);
    addRing(5880, cy + 80, 'yellow');
    addBlock(6020, cy + bs, 3, 1);

    // Đệm nhún trên trần
    addPad(6250, cy + 10, 'yellow');
    addSpike(6320, cy, -1);
    addSpike(6350, cy, -1);
    addBlock(6450, cy + bs * 2, 2, 1);

    // Cổng xanh đưa trọng lực trở lại sàn
    addPortal(6750, gy - 80, 'gravity_down');
    addSpike(6980);
    addBlock(7120, gy, 3, 2);
    addSpike(7260);

    // --- PHẦN 4: BỨT TỐC SPEED RUN & GAUNTLET (74% - 94% / x: 7500 -> 9600) ---
    addPortal(7550, gy - 80, 'speed_fast');
    addSpike(7780);
    addPad(7900, gy, 'yellow');
    addSpike(7980);
    addSpike(8010);
    addBlock(8100, gy, 2, 2);

    addRing(8280, gy - 70, 'yellow');
    addBlock(8420, gy, 2, 1);
    addSpike(8530);
    addRing(8650, gy - 65, 'yellow');
    addBlock(8780, gy, 3, 2);
    addSpike(8930);
    addSpike(8960);
    addSpike(8990); // Triple spike ở tốc độ cao

    addBlock(9150, gy, 2, 1);
    addBlock(9270, gy, 2, 2);
    addPad(9400, gy, 'pink');
    addBlock(9480, gy, 3, 2);

    // --- PHẦN 5: CỔNG ĐÍCH VICTORY (94% - 100% / x: 9600 -> 10200) ---
    addPortal(9700, gy - 80, 'speed_normal');
    this.finishX = this.cfg.level?.lengthPx || 10200;
  }

  reset() {
    this.state = 'ready';
    this.cameraX = 0;
    this.currentPercent = 0;
    this.trail = [];
    this.respawnTimer = 0;

    this.cube.y = this.groundY - this.size;
    this.cube.vy = 0;
    this.cube.angle = 0;
    this.cube.targetAngle = 0;
    this.cube.gravityDir = 1;
    this.cube.isGrounded = true;
    this.cube.currentSpeed = this.cfg.physics.baseSpeed || 330;

    // Reset các vòng nhảy
    for (const el of this.elements) {
      if (el.type === 'ring') el.triggered = false;
    }

    this.callbacks.onScoreUpdate?.(0);
  }

  jump() {
    if (this.state === 'ready') {
      this.state = 'running';
      this.doJump();
      return;
    }

    if (this.state === 'running') {
      this.doJump();
    } else if (this.state === 'complete') {
      this.reset();
    }
  }

  doJump() {
    const phys = this.cfg.physics;
    const worldCubeX = this.cameraX;

    // 1. Kiểm tra kích hoạt Vòng Nhảy (Jump Ring) trên không
    for (const el of this.elements) {
      if (el.type === 'ring' && !el.triggered) {
        const dist = Math.hypot(worldCubeX + this.size / 2 - el.x, this.cube.y + this.size / 2 - el.y);
        if (dist <= el.r + this.size / 2 + 8) {
          el.triggered = true;
          this.cube.vy = (phys.jumpImpulse || -560) * this.cube.gravityDir;
          this.cube.isGrounded = false;
          audioManager.playPickup();
          this.juiceFX.spawnSparkles(this.screenX + this.size / 2, this.cube.y + this.size / 2, 10, '#facc15');
          this.juiceFX.spawnFloatingText('ORB JUMP!', this.screenX, this.cube.y - 18, { color: '#facc15', size: 14 });
          return;
        }
      }
    }

    // 2. Nhảy từ mặt sàn hoặc mặt khối hộp
    if (this.cube.isGrounded) {
      this.cube.vy = (phys.jumpImpulse || -560) * this.cube.gravityDir;
      this.cube.isGrounded = false;
      audioManager.playSwish();
      this.juiceFX.spawnDust(
        this.screenX + this.size / 2,
        this.cube.gravityDir === 1 ? this.cube.y + this.size : this.cube.y,
        4,
        '#a855f7'
      );
    }
  }

  onActionTrigger() {
    this.jump();
  }

  handleKeyDown(e) {
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW' || key === ' ' || key === 'enter' || code === 'Enter') {
      this.isHoldingJump = true;
      this.jump();
    } else if (code === 'KeyR' || key === 'r') {
      this.attempts++;
      this.saveAttempts();
      this.reset();
    }
  }

  handleKeyUp(e) {
    const code = e.code || '';
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      this.isHoldingJump = false;
    }
  }

  handlePointerClick(x, y) {
    this.jump();
  }

  update(dt) {
    this.animTimer += dt;
    const phys = this.cfg.physics;

    if (this.state === 'dead') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.attempts++;
        this.saveAttempts();
        this.reset();
      }
      return;
    }

    if (this.state === 'ready') {
      return;
    }

    if (this.state === 'complete') {
      return;
    }

    // --- TRẠNG THÁI RUNNING ---
    // 1. Di chuyển camera / màn hình sang phải
    this.cameraX += this.cube.currentSpeed * dt;

    // Tính phần trăm hoàn thành (0% -> 100%)
    const pct = Math.min(100, Math.floor((this.cameraX / this.finishX) * 100));
    this.currentPercent = pct;
    if (pct > this.bestPercent) {
      this.bestPercent = pct;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dever_dash_best', this.bestPercent.toString());
      }
    }
    this.callbacks.onScoreUpdate?.(pct);

    // Kiểm tra về đích 100%
    if (this.cameraX >= this.finishX) {
      this.state = 'complete';
      audioManager.playVictory();
      this.juiceFX.shake(8, 0.3);
      this.juiceFX.spawnConfetti(this.w / 2, this.h / 2, 60);
      this.juiceFX.spawnFloatingText('MÀN CHƠI HOÀN THÀNH 100%!', this.w / 2, 120, { color: '#fbbf24', size: 24 });
      return;
    }

    // 2. Vật lý trọng lực & rơi
    this.cube.vy += phys.gravity * this.cube.gravityDir * dt;
    this.cube.y += this.cube.vy * dt;

    // 3. Xoay tròn khối Cube khi ở trên không (90 độ mỗi cú nhảy)
    if (!this.cube.isGrounded) {
      const rotSpeed = Math.PI * 4.6 * this.cube.gravityDir;
      this.cube.angle += rotSpeed * dt;
    } else {
      // Khi tiếp đất: snap phẳng góc về bội số của 90 độ (PI / 2)
      const snap = Math.round(this.cube.angle / (Math.PI / 2)) * (Math.PI / 2);
      this.cube.angle += (snap - this.cube.angle) * 22 * dt;
    }

    // 4. Lưu vết Motion Trail
    this.trail.unshift({
      x: this.screenX,
      y: this.cube.y,
      angle: this.cube.angle,
      alpha: 0.65
    });
    if (this.trail.length > 7) {
      this.trail.pop();
    }
    for (const t of this.trail) {
      t.alpha -= dt * 2.8;
    }

    // 5. Kiểm tra tiếp xúc sàn hoặc trần tự nhiên
    const worldCubeX = this.cameraX;
    let groundedThisFrame = false;

    if (this.cube.gravityDir === 1) {
      // Trọng lực thường: sàn là groundY
      if (this.cube.y + this.size >= this.groundY) {
        this.cube.y = this.groundY - this.size;
        this.cube.vy = 0;
        groundedThisFrame = true;
      }
    } else {
      // Trọng lực ngược: trần là ceilingY
      if (this.cube.y <= this.ceilingY) {
        this.cube.y = this.ceilingY;
        this.cube.vy = 0;
        groundedThisFrame = true;
      }
    }

    // 6. Kiểm tra va chạm với các phần tử màn chơi (Blocks, Spikes, Pads, Portals)
    const cubeBox = {
      x: worldCubeX,
      y: this.cube.y,
      w: this.size,
      h: this.size
    };

    for (const el of this.elements) {
      // Bỏ qua các phần tử quá xa màn hình
      if (el.x < worldCubeX - 100 || el.x > worldCubeX + 160) continue;

      if (el.type === 'spike') {
        // Va chạm Gai nhọn (Hitbox thu nhỏ cho công bằng)
        if (this.checkSpikeCollision(cubeBox, el)) {
          this.triggerDeath();
          return;
        }
      } else if (el.type === 'block') {
        // Khối hộp rắn: Tiếp đất trên đỉnh HOẶC đâm vào cạnh trước
        const hit = this.checkBlockCollision(cubeBox, el);
        if (hit === 'land') {
          groundedThisFrame = true;
        } else if (hit === 'crash') {
          this.triggerDeath();
          return;
        }
      } else if (el.type === 'pad') {
        // Đệm nhún tự động nảy
        if (
          cubeBox.x + cubeBox.w > el.x + 3 &&
          cubeBox.x < el.x + el.w - 3 &&
          Math.abs(cubeBox.y + (this.cube.gravityDir === 1 ? cubeBox.h : 0) - el.y) < 14
        ) {
          const impulse = el.color === 'pink' ? (phys.jumpImpulse || -560) * 0.85 : (phys.jumpPadImpulse || -740);
          this.cube.vy = impulse * this.cube.gravityDir;
          this.cube.isGrounded = false;
          audioManager.playSwish();
          this.juiceFX.spawnSparkles(this.screenX + this.size / 2, this.cube.y + this.size / 2, 8, el.color === 'pink' ? '#f43f5e' : '#facc15');
        }
      } else if (el.type === 'portal') {
        // Cổng trọng lực & tốc độ
        if (Math.abs(worldCubeX - el.x) < 16) {
          if (el.portalType === 'gravity_up' && this.cube.gravityDir === 1) {
            this.cube.gravityDir = -1;
            this.juiceFX.spawnSparkles(this.screenX, this.cube.y, 14, '#f97316');
            audioManager.playTeleport();
            this.juiceFX.spawnFloatingText('ĐẢO TRỌNG LỰC!', this.screenX, this.cube.y - 18, { color: '#f97316', size: 14 });
          } else if (el.portalType === 'gravity_down' && this.cube.gravityDir === -1) {
            this.cube.gravityDir = 1;
            this.juiceFX.spawnSparkles(this.screenX, this.cube.y, 14, '#38bdf8');
            audioManager.playTeleport();
            this.juiceFX.spawnFloatingText('TRỌNG LỰC BÌNH THƯỜNG', this.screenX, this.cube.y - 18, { color: '#38bdf8', size: 14 });
          } else if (el.portalType === 'speed_fast') {
            this.cube.currentSpeed = (phys.baseSpeed || 330) * 1.35;
          } else if (el.portalType === 'speed_normal') {
            this.cube.currentSpeed = phys.baseSpeed || 330;
          }
        }
      }
    }

    this.cube.isGrounded = groundedThisFrame;

    // Giữ phím nhảy tự động nảy tiếp khi tiếp đất
    if (this.isHoldingJump && this.cube.isGrounded) {
      this.doJump();
    }
  }

  checkSpikeCollision(cube, spike) {
    const insetX = 5;
    const insetY = 3;
    // Kiểm tra overlap AABB thu nhỏ
    const overlapX = cube.x + cube.w - insetX > spike.x + insetX && cube.x + insetX < spike.x + spike.w - insetX;
    if (!overlapX) return false;

    if (spike.dir === 1) {
      // Gai mọc từ dưới lên: đỉnh gai tại spike.y - spike.h
      const spikeTop = spike.y - spike.h + insetY;
      return cube.y + cube.h > spikeTop && cube.y + insetY < spike.y;
    } else {
      // Gai chúc từ trên xuống: đáy gai tại spike.y + spike.h
      const spikeBottom = spike.y + spike.h - insetY;
      return cube.y < spikeBottom && cube.y + cube.h - insetY > spike.y;
    }
  }

  checkBlockCollision(cube, block) {
    const inset = 3;
    const overlapX = cube.x + cube.w > block.x + inset && cube.x < block.x + block.w - inset;
    if (!overlapX) return 'none';

    if (this.cube.gravityDir === 1) {
      // Trọng lực hướng xuống: tiếp đất trên đỉnh khối hộp
      const prevBottom = cube.y + cube.h - this.cube.vy * 0.016;
      if (prevBottom <= block.y + 14 && cube.y + cube.h >= block.y && this.cube.vy >= 0) {
        this.cube.y = block.y - cube.h;
        this.cube.vy = 0;
        return 'land';
      }
    } else {
      // Trọng lực hướng lên: bám vào đáy dưới khối hộp
      const prevTop = cube.y - this.cube.vy * 0.016;
      if (prevTop >= block.y + block.h - 14 && cube.y <= block.y + block.h && this.cube.vy <= 0) {
        this.cube.y = block.y + block.h;
        this.cube.vy = 0;
        return 'land';
      }
    }

    // Đâm vào cạnh bên hoặc dưới khối
    const overlapY = cube.y + cube.h - inset > block.y && cube.y + inset < block.y + block.h;
    if (overlapY) {
      return 'crash';
    }

    return 'none';
  }

  triggerDeath() {
    if (this.state === 'dead') return;
    this.state = 'dead';
    this.respawnTimer = this.cfg.physics.respawnDelaySec || 0.28;

    audioManager.playExplosion();
    this.juiceFX.shake(10, 0.25);
    this.juiceFX.spawnConfetti(this.screenX + this.size / 2, this.cube.y + this.size / 2, 40);
  }

  saveAttempts() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dever_dash_attempts', this.attempts.toString());
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    const gy = this.groundY;
    const cy = this.ceilingY;

    // 1. Bầu trời Neon Synthwave
    const gradBg = ctx.createLinearGradient(0, 0, 0, h);
    gradBg.addColorStop(0, this.cfg.colors?.bgTop || '#050510');
    gradBg.addColorStop(1, this.cfg.colors?.bgBottom || '#180e29');
    ctx.fillStyle = gradBg;
    ctx.fillRect(0, 0, w, h);

    // Lưới vi mạch nền cuộn chậm
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    const bgStep = 40;
    const bgOffset = (this.cameraX * 0.3) % bgStep;
    for (let x = -bgOffset; x < w; x += bgStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // 2. Vẽ Sàn nhà & Trần nhà Cyber Grid
    this.renderBounds(ctx, gy, cy);

    // 3. Vẽ các phần tử màn chơi (Spikes, Blocks, Pads, Portals)
    this.renderLevelElements(ctx);

    // 4. Vẽ Vệt Motion Trail & Khối Cyber Cube
    if (this.state !== 'dead') {
      this.renderTrail(ctx);
      this.renderCube(ctx);
    }

    // 5. Thanh Tiến Trình (Progress Bar) & HUD
    this.renderHUD(ctx);
  }

  renderBounds(ctx, gy, cy) {
    const w = this.w;
    const h = this.h;

    ctx.save();
    // Khối sàn dưới
    ctx.fillStyle = this.cfg.colors?.ground || '#0c0f1d';
    ctx.fillRect(0, gy, w, h - gy);

    // Viền sàn phát sáng Neon Tím
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();

    // Khối trần trên
    ctx.fillStyle = '#0c0f1d';
    ctx.fillRect(0, 0, w, cy);

    // Viền trần Neon Xanh
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // Lưới ô sàn cuộn theo tốc độ camera
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 1.5;
    const step = 32;
    const groundOffset = this.cameraX % step;
    for (let x = -groundOffset; x < w + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x - 16, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x - 16, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderLevelElements(ctx) {
    const camX = this.cameraX;
    const scrX = this.screenX;

    for (const el of this.elements) {
      // Tọa độ màn hình của phần tử
      const screenPosX = el.x - camX + scrX;
      if (screenPosX < -60 || screenPosX > this.w + 60) continue;

      ctx.save();
      if (el.type === 'spike') {
        // Gai nhọn Neon Đỏ/Cam
        const sx = screenPosX;
        const sy = el.y;
        const sw = el.w;
        const sh = el.h * el.dir;

        ctx.fillStyle = this.cfg.colors?.spikeFill || '#ef4444';
        ctx.shadowColor = this.cfg.colors?.spikeGlow || '#f87171';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + sw / 2, sy - sh);
        ctx.lineTo(sx + sw, sy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (el.type === 'block') {
        // Khối hộp Solid Block
        ctx.fillStyle = this.cfg.colors?.blockBody || '#1e1b4b';
        ctx.fillRect(screenPosX, el.y, el.w, el.h);

        ctx.strokeStyle = this.cfg.colors?.blockBorder || '#818cf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenPosX, el.y, el.w, el.h);

        // Hoa văn vi mạch bên trong khối
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(screenPosX + el.w / 2 - 3, el.y + el.h / 2 - 3, 6, 6);
      } else if (el.type === 'pad') {
        // Đệm nhún Jump Pad
        const isYellow = el.color === 'yellow';
        ctx.fillStyle = isYellow ? '#facc15' : '#f43f5e';
        ctx.shadowColor = isYellow ? '#facc15' : '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(screenPosX + 2, el.y - 8, el.w - 4, 8, 3);
        ctx.fill();
      } else if (el.type === 'ring') {
        // Vòng nhảy trên không Jump Ring
        const pulse = Math.sin(this.animTimer * 8) * 2;
        ctx.strokeStyle = el.triggered ? '#64748b' : '#facc15';
        ctx.shadowColor = el.triggered ? 'transparent' : '#facc15';
        ctx.shadowBlur = el.triggered ? 0 : 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenPosX, el.y, el.r + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = el.triggered ? '#475569' : '#fef08a';
        ctx.beginPath();
        ctx.arc(screenPosX, el.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (el.type === 'portal') {
        // Cổng Portal
        const isGravUp = el.portalType === 'gravity_up';
        const portalColor = isGravUp ? '#f97316' : '#38bdf8';
        ctx.strokeStyle = portalColor;
        ctx.shadowColor = portalColor;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(screenPosX + el.w / 2, el.y + el.h / 2, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  renderTrail(ctx) {
    for (const t of this.trail) {
      if (t.alpha <= 0) continue;
      ctx.save();
      ctx.translate(t.x + this.size / 2, t.y + this.size / 2);
      ctx.rotate(t.angle);
      ctx.fillStyle = this.cfg.colors?.cubeBody || '#06b6d4';
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  renderCube(ctx) {
    const c = this.cube;
    const cx = this.screenX + this.size / 2;
    const cy = c.y + this.size / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(c.angle);

    // 1. Thân Khối Lập Phương Cyber Neon
    ctx.fillStyle = this.cfg.colors?.cubeBody || '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

    ctx.strokeStyle = this.cfg.colors?.cubeBorder || '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

    // 2. Lõi Năng Lượng Buggy / Robot ở giữa
    ctx.fillStyle = this.cfg.colors?.cubeCore || '#facc15';
    ctx.fillRect(-this.size / 4, -this.size / 4, this.size / 2, this.size / 2);

    // Mắt biểu cảm của Cube
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -4, 3, 4);
    ctx.fillRect(2, -4, 3, 4);

    ctx.restore();
  }

  renderHUD(ctx) {
    const w = this.w;

    ctx.save();
    // 1. Thanh Tiến Trình (Progress Bar 0% -> 100%)
    const barW = 280;
    const barH = 12;
    const barX = (w - barW) / 2;
    const barY = 16;

    // Khung nền thanh tiến trình
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dải tiến trình lấp đầy
    const fillW = Math.max(0, (this.currentPercent / 100) * (barW - 4));
    if (fillW > 0) {
      const gradFill = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      gradFill.addColorStop(0, '#06b6d4');
      gradFill.addColorStop(1, '#a855f7');
      ctx.fillStyle = gradFill;
      ctx.beginPath();
      ctx.roundRect(barX + 2, barY + 2, fillW, barH - 4, 4);
      ctx.fill();
    }

    // Phần trăm hiển thị
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 11px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.currentPercent}%`, barX + barW / 2, barY + barH / 2);

    // 2. Bộ Đếm Số Lần Thử & Kỷ Lục
    ctx.textAlign = 'left';
    ctx.font = '800 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`LẦN THỬ: ${this.attempts}`, 18, 26);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`TỐT NHẤT: ${this.bestPercent}%`, w - 18, 26);

    // 3. Màn hình Chờ Bắt Đầu hoặc Hoàn Thành
    if (this.state === 'ready') {
      ctx.textAlign = 'center';
      ctx.font = '900 24px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.fillText('DEVER DASH 3.0', w / 2, 120);

      ctx.font = '700 13px Outfit, sans-serif';
      ctx.fillStyle = '#38bdf8';
      const pulse = Math.sin(this.animTimer * 6) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillText('BẤM PHÍM CÁCH (SPACE) HOẶC CLICK ĐỂ BẮT ĐẦU', w / 2, 230);
      ctx.globalAlpha = 1.0;
    } else if (this.state === 'complete') {
      ctx.textAlign = 'center';
      ctx.font = '900 28px Outfit, sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 16;
      ctx.fillText('CHIẾN THẮNG 100%!', w / 2, 140);

      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`Hoàn thành sau ${this.attempts} lần thử!`, w / 2, 180);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Bấm Phím Cách (Space) để chạy lại từ đầu', w / 2, 220);
    }

    ctx.restore();
  }
}
