/**
 * DEVER TOWN - STREETBALL BASKETBALL SHOOTOUT 3.0
 * Nâng cấp toàn diện cơ chế ném rổ arcade & vật lý quỹ đạo:
 * 1. Cơ chế Kéo Thả Tự Do (Drag-to-Aim / Trajectory Physics): Tự do chỉnh góc và lực ném qua chuột/cảm ứng hoặc phím.
 * 2. Cầu thủ Chibi FPTU Ném Rổ: Tư thế nhồi bóng (dribble), chùng gối lấy đà (crouch), bật nhảy vung cổ tay (jump flick).
 * 3. Lưới rổ biến dạng lò xo vật lý (Spring Net Simulation): Co giãn nảy sóng khi bóng xé lưới.
 * 4. Phân loại điểm số kỹ thuật: Clean Swish (xé lưới không chạm vành), Bank Shot (đập bảng mica), và Regular Basket.
 * 5. Chuỗi bốc lửa đa tầng: On Fire Tier 1 (Lửa cam x2) & Heat Check Tier 2 (Lửa xanh tím x3).
 * 6. Sân bóng rổ Streetball hiện đại với vạch 3 điểm, vùng Paint zone và bảng mica trong suốt.
 */

import { BASKETBALL_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';
import { isTouchDevice } from '../common/touchHints.js';

export class BasketballShootoutEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;
    // Hint điều khiển in-canvas phải đúng thiết bị (2026-10-09, yêu cầu của Hưng).
    this.isTouch = isTouchDevice();

    this.score = 0;
    this.streak = 0;
    this.highScore = 0;
    this.keys = { left: false, right: false, up: false, down: false, space: false };

    // Kéo thả Slingshot ngắm bắn
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.didPointerShoot = false;

    // Thời gian & Hoạt ảnh
    this.animTime = 0;
    this.playerPose = 'dribble'; // 'dribble' | 'aim_crouch' | 'jump_flick' | 'celebrate' | 'miss_sigh'
    this.poseTimer = 0;

    // Lưới rổ vật lý lò xo (Spring-mass net)
    this.initSpringNet();

    this.reset();
  }

  initSpringNet() {
    const cfg = BASKETBALL_CONFIG;
    const rimX = cfg.rim.x;
    const rimY = cfg.rim.y;
    const rimW = cfg.rim.width;
    const netCfg = cfg.theShooter?.net || { cols: 6, rows: 5, depth: 38 };

    this.netCols = netCfg.cols;
    this.netRows = netCfg.rows;
    this.netNodes = [];

    for (let c = 0; c <= this.netCols; c++) {
      this.netNodes[c] = [];
      const pct = c / this.netCols;
      const baseX = rimX + pct * rimW;
      for (let r = 0; r <= this.netRows; r++) {
        const rPct = r / this.netRows;
        // Lưới thu nhỏ dần về phía đáy (tapered shape)
        const taper = 1.0 - rPct * 0.35;
        const x = rimX + rimW * 0.5 + (baseX - (rimX + rimW * 0.5)) * taper;
        const y = rimY + rPct * netCfg.depth;
        this.netNodes[c][r] = {
          x,
          y,
          origX: x,
          origY: y,
          vx: 0,
          vy: 0
        };
      }
    }
  }

  reset() {
    const cfg = BASKETBALL_CONFIG;
    const shooterCfg = cfg.theShooter;

    this.state = 'aiming'; // 'aiming' | 'flying' | 'scored' | 'missed'
    this.power = shooterCfg ? shooterCfg.defaultPower : 0.65;
    this.angle = shooterCfg ? shooterCfg.defaultAngleDeg : 55; // Góc ném độ
    this.isDragging = false;
    this.didPointerShoot = false;
    this.playerPose = 'dribble';

    const b = cfg.ball;
    const playerX = shooterCfg?.player?.x ?? 100;
    const playerY = shooterCfg?.player?.floorY ?? 260;

    this.player = {
      x: playerX,
      y: playerY,
      jumpY: 0
    };

    this.ball = {
      x: playerX + 16,
      y: playerY - 32,
      vx: 0,
      vy: 0,
      radius: b.radius,
      rotation: 0,
      hitBackboard: false,
      hitRim: false,
      swishCandidate: true
    };

    this.hoopY = cfg.rim.y;
    this.hoopSpeed = cfg.movingHoop.speedY;
    this.ballTrails = [];

    // Kiểm tra trạng thái On Fire
    this.isOnFire = this.streak >= cfg.scoring.onFireThreshold;
    this.isHeatCheck = this.streak >= (shooterCfg?.scoring?.onFireTier2 ?? 6);
  }

  handlePointerDown(x, y) {
    if (this.state !== 'aiming') return;
    this.isDragging = true;
    this.dragStart = { x, y };
    this.dragCurrent = { x, y };
    this.playerPose = 'aim_crouch';
  }

  handlePointerMove(x, y) {
    if (!this.isDragging || this.state !== 'aiming') return;
    this.dragCurrent = { x, y };

    const cfg = BASKETBALL_CONFIG;
    const shooterCfg = cfg.theShooter;
    const dx = this.dragStart.x - x;
    const dy = this.dragStart.y - y;
    const dist = Math.hypot(dx, dy);

    // Tính lực kéo ném
    const maxDist = shooterCfg?.dragMaxDist ?? 110;
    this.power = Math.max(0.2, Math.min(1.0, dist / maxDist));

    // Tính góc ném ném xiên (góc từ phương ngang ngược chiều kéo)
    if (dist > 8) {
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const minA = shooterCfg?.minAngleDeg ?? 25;
      const maxA = shooterCfg?.maxAngleDeg ?? 85;
      this.angle = Math.max(minA, Math.min(maxA, deg));
    }
  }

  handlePointerUp(x, y) {
    if (!this.isDragging || this.state !== 'aiming') {
      this.isDragging = false;
      return;
    }
    this.isDragging = false;

    const dx = this.dragStart.x - x;
    const dy = this.dragStart.y - y;
    const dist = Math.hypot(dx, dy);

    if (dist > 18) {
      this.didPointerShoot = true;
      this.shoot();
    } else {
      this.playerPose = 'dribble';
    }
  }

  onActionTrigger() {
    if (this.state === 'aiming') {
      this.shoot();
    } else if (['scored', 'missed'].includes(this.state)) {
      this.reset();
    }
  }

  shoot() {
    if (this.state !== 'aiming') return;
    this.state = 'flying';
    this.playerPose = 'jump_flick';
    this.poseTimer = 0.45;

    const cfg = BASKETBALL_CONFIG;
    const shooterCfg = cfg.theShooter;
    const rad = (this.angle * Math.PI) / 180;

    const minSpd = shooterCfg?.minSpeed ?? 11.0;
    const maxSpd = shooterCfg?.maxSpeed ?? 20.0;
    const speed = minSpd + this.power * (maxSpd - minSpd);

    this.ball.x = this.player.x + 18;
    this.ball.y = this.player.y - 48;
    this.ball.vx = Math.cos(rad) * speed;
    this.ball.vy = -Math.sin(rad) * speed;
    this.ball.hitBackboard = false;
    this.ball.hitRim = false;
    this.ball.swishCandidate = true;

    audioManager.playKick(0.85);
    const sparkleColor = this.isHeatCheck ? '#38bdf8' : this.isOnFire ? '#ef4444' : '#ea580c';
    this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, sparkleColor);
  }

  update(dt) {
    const cfg = BASKETBALL_CONFIG;
    const shooterCfg = cfg.theShooter;
    this.animTime += dt;

    // 1. Cập nhật tư thế cầu thủ
    if (this.poseTimer > 0) {
      this.poseTimer -= dt;
      if (this.poseTimer <= 0) {
        if (this.state === 'flying') this.playerPose = 'idle';
      }
    }

    // 2. Điều khiển bằng bàn phím khi đang ngắm (Keyboard Controls)
    if (this.state === 'aiming' && !this.isDragging) {
      const minA = shooterCfg?.minAngleDeg ?? 25;
      const maxA = shooterCfg?.maxAngleDeg ?? 85;

      if (this.keys.up) {
        this.angle = Math.min(maxA, this.angle + dt * 45);
      }
      if (this.keys.down) {
        this.angle = Math.max(minA, this.angle - dt * 45);
      }
      if (this.keys.right) {
        this.power = Math.min(1.0, this.power + dt * 0.7);
      }
      if (this.keys.left) {
        this.power = Math.max(0.2, this.power - dt * 0.7);
      }

      // Giữ bóng ở tay cầu thủ khi đang nhồi bóng
      const dribbleOffset = Math.sin(this.animTime * 10) * 8;
      this.ball.x = this.player.x + 16;
      this.ball.y = this.player.y - 28 + dribbleOffset;
    }

    // 3. Di chuyển trụ rổ ở điểm số cao
    if (this.score >= cfg.movingHoop.startScore) {
      this.hoopY += this.hoopSpeed * 60 * dt;
      if (this.hoopY > cfg.movingHoop.maxY || this.hoopY < cfg.movingHoop.minY) {
        this.hoopSpeed *= -1;
      }
    }

    // 4. Cập nhật dao động lò xo của lưới rổ (Spring Net Physics)
    this.updateSpringNet(dt, cfg);

    if (this.state !== 'flying') return;

    // 5. Vật lý ném xiên Parabol & ma sát không khí
    this.ball.vy += cfg.physics.gravity;
    this.ball.vx *= cfg.physics.airResistance;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ball.rotation -= 0.05 + this.ball.vx * 0.015; // Xoay ngược chiều (Backspin)

    // Lưu vệt bóng sau (Fire Trail)
    if (this.isOnFire || Math.hypot(this.ball.vx, this.ball.vy) > 11) {
      this.ballTrails.unshift({
        x: this.ball.x,
        y: this.ball.y,
        alpha: 0.7,
        isHeat: this.isHeatCheck
      });
      if (this.ballTrails.length > 8) this.ballTrails.pop();
    } else if (this.ballTrails.length > 0) {
      this.ballTrails.pop();
    }

    const bb = cfg.backboard;
    const rimX = cfg.rim.x;
    const rimY = this.hoopY;
    const rimW = cfg.rim.width;

    // 6. Va chạm Bảng rổ Mica (Backboard)
    if (
      this.ball.x + this.ball.radius >= bb.x &&
      this.ball.x - this.ball.radius <= bb.x + bb.width &&
      this.ball.y >= bb.y - 15 &&
      this.ball.y <= bb.y + bb.height
    ) {
      this.ball.vx = -Math.abs(this.ball.vx) * cfg.physics.restitutionBackboard;
      this.ball.x = bb.x - this.ball.radius - 1;
      this.ball.hitBackboard = true;
      audioManager.playRimBounce();
      this.juiceFX.shake(3.5, 0.1);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 6, '#ffffff');
    }

    // 7. Va chạm chốt vành sắt trái & phải (Rim Pegs)
    const pegs = [
      { x: rimX, y: rimY },
      { x: rimX + rimW, y: rimY }
    ];

    for (const peg of pegs) {
      const dx = this.ball.x - peg.x;
      const dy = this.ball.y - peg.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.ball.radius + cfg.rim.pegRadius) {
        const angle = Math.atan2(dy, dx);
        const speed = Math.hypot(this.ball.vx, this.ball.vy) * cfg.physics.restitutionRim;
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
        this.ball.hitRim = true;
        this.ball.swishCandidate = false;
        audioManager.playRimBounce();
        this.juiceFX.shake(4.5, 0.12);
        this.juiceFX.spawnSparkles(peg.x, peg.y, 8, '#f59e0b');
      }
    }

    // 8. Tác động quả bóng vào lưới rổ khi lọt rổ
    const hoopCenterX = rimX + rimW * 0.5;
    if (
      this.ball.y >= rimY &&
      this.ball.y <= rimY + 22 &&
      this.ball.vy > 0 &&
      Math.abs(this.ball.x - hoopCenterX) < rimW * 0.5 - 3
    ) {
      // Tác động lực đẩy lưới rổ nảy sóng
      this.distortNet(this.ball.x, this.ball.y, this.ball.vx, this.ball.vy);
      this.resolveBasket(this.ball.hitRim, this.ball.hitBackboard);
      return;
    }

    // 9. Rơi chạm đất -> Ném trượt
    if (this.ball.y > 330) {
      this.state = 'missed';
      this.streak = 0;
      this.isOnFire = false;
      this.isHeatCheck = false;
      this.playerPose = 'miss_sigh';
      this.juiceFX.spawnFloatingText('NÉM TRƯỢT!', 320, 160, {
        color: '#94a3b8',
        size: 18,
        fontWeight: '700'
      });
    }
  }

  updateSpringNet(dt, cfg) {
    const netCfg = cfg.theShooter?.net || { springStiffness: 0.18, damping: 0.88, depth: 38 };
    const rimX = cfg.rim.x;
    const rimY = this.hoopY;
    const rimW = cfg.rim.width;

    for (let c = 0; c <= this.netCols; c++) {
      const pct = c / this.netCols;
      const baseX = rimX + pct * rimW;

      for (let r = 0; r <= this.netRows; r++) {
        const node = this.netNodes[c][r];
        if (r === 0) {
          // Điểm gắn cố định trên vành rổ
          node.x = baseX;
          node.y = rimY;
          continue;
        }

        const rPct = r / this.netRows;
        const taper = 1.0 - rPct * 0.35;
        const targetX = rimX + rimW * 0.5 + (baseX - (rimX + rimW * 0.5)) * taper;
        const targetY = rimY + rPct * netCfg.depth;

        // Lực đàn hồi kéo về vị trí cân bằng
        const forceX = (targetX - node.x) * netCfg.springStiffness;
        const forceY = (targetY - node.y) * netCfg.springStiffness;

        node.vx = (node.vx + forceX) * netCfg.damping;
        node.vy = (node.vy + forceY) * netCfg.damping;

        node.x += node.vx;
        node.y += node.vy;
      }
    }
  }

  distortNet(ballX, ballY, vx, vy) {
    for (let c = 0; c <= this.netCols; c++) {
      for (let r = 1; r <= this.netRows; r++) {
        const node = this.netNodes[c][r];
        const dist = Math.hypot(node.x - ballX, node.y - ballY);
        if (dist < 28) {
          node.vx += vx * 0.45;
          node.vy += Math.abs(vy) * 0.55;
        }
      }
    }
  }

  resolveBasket(hitRim, hitBackboard) {
    this.state = 'scored';
    this.streak++;
    this.playerPose = 'celebrate';

    const cfg = BASKETBALL_CONFIG;
    const shooterCfg = cfg.theShooter;
    const scoringCfg = shooterCfg?.scoring ?? cfg.scoring;

    this.isOnFire = this.streak >= (scoringCfg.onFireTier1 ?? 3);
    this.isHeatCheck = this.streak >= (scoringCfg.onFireTier2 ?? 6);

    let pts = scoringCfg.normalBasket ?? 2;
    let label = 'VÀO RỔ! +2đ';

    if (!hitRim && !hitBackboard) {
      // 🏀 CLEAN SWISH (Xé lưới hoàn hảo)
      pts = scoringCfg.swishBonus ?? 5;
      label = 'CLEAN SWISH! ⚡ +5đ';
      audioManager.playSwish();
    } else if (hitBackboard && !hitRim) {
      // 🎯 BANK SHOT (Đập bảng vào rổ)
      pts = (scoringCfg.normalBasket ?? 2) + (scoringCfg.bankShotBonus ?? 2);
      label = 'BANK SHOT! 🎯 +4đ';
      audioManager.playGoalFanfare();
    } else {
      audioManager.playGoalFanfare();
    }

    // Hệ số nhân chuỗi bốc lửa
    if (this.isHeatCheck) {
      pts *= 3;
      label += ' (HEAT CHECK! ⚡🔥)';
      audioManager.playOnFire();
    } else if (this.isOnFire) {
      pts *= 2;
      label += ' (ON FIRE! 🔥)';
      audioManager.playOnFire();
    }

    this.score += pts;
    this.juiceFX.shake(6.5, 0.18);
    this.juiceFX.spawnConfetti(cfg.rim.x + 30, this.hoopY, 30);
    this.juiceFX.spawnFloatingText(label, 320, 130, {
      color: this.isHeatCheck ? '#38bdf8' : this.isOnFire ? '#ef4444' : '#fbbf24',
      size: 22,
      fontWeight: '900'
    });

    this.callbacks.onScoreUpdate?.(pts);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cfg = BASKETBALL_CONFIG;

    // 1. Sân bóng rổ Streetball hiện đại
    this.drawStreetballCourt(ctx, w, h, cfg);

    // 2. Vệt lửa & khói bay theo bóng (Fire Trail)
    this.drawBallTrails(ctx);

    // 3. Đường chấm dự đoán quỹ đạo Parabol (Trajectory preview)
    if (this.state === 'aiming') {
      this.renderAimTrajectory(ctx);
    }

    // 4. Trụ rổ, Bảng Mica & Vành rổ
    this.drawHoopAndBackboard(ctx, cfg);

    // 5. Cầu thủ Chibi FPTU Ném Rổ
    this.drawChibiShooter(ctx, this.player.x, this.player.y, this.playerPose);

    // 6. Quả bóng rổ xoay tròn
    this.drawBasketball(ctx, this.ball.x, this.ball.y, this.ball.radius, this.ball.rotation);

    // 7. Lưới rổ chuyển động đàn hồi lò xo (Spring Net)
    this.drawSpringNet(ctx);

    // 8. Bảng điều khiển lực & góc ném Slingshot
    if (this.state === 'aiming') {
      this.drawAimControls(ctx);
    }

    // 9. HUD Điểm & Chuỗi
    this.renderHUD(ctx);
  }

  drawStreetballCourt(ctx, w, h, cfg) {
    const courtY = 250;
    const courtHeight = h - courtY;

    // Bầu không khí nhà thi đấu / hoàng hôn đường phố
    const bgGrad = ctx.createLinearGradient(0, 0, 0, courtY);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, courtY);

    // Mặt sân thể thao phủ sơn Polyurethane Cam Đất
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, courtY, w, courtHeight);

    // Khu vực ném phạt Paint Zone (Màu xanh thể thao)
    const rimX = cfg.rim.x;
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(rimX - 110, courtY, 150, courtHeight);

    // Vạch biên & Vòng cung 3 điểm (Three-Point Arc)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;

    // Vạch cung 3 điểm
    ctx.beginPath();
    ctx.arc(rimX + 30, courtY, 195, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Vạch ném tự do (Free throw line)
    ctx.beginPath();
    ctx.moveTo(rimX - 110, courtY);
    ctx.lineTo(rimX - 110, h);
    ctx.stroke();

    // Vòng tròn ném phạt
    ctx.beginPath();
    ctx.arc(rimX - 110, courtY + 30, 42, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
  }

  drawHoopAndBackboard(ctx, cfg) {
    const bb = cfg.backboard;
    const rimX = cfg.rim.x;
    const rimY = this.hoopY;
    const rimW = cfg.rim.width;

    // Trụ rổ sắt chịu lực
    ctx.fillStyle = '#334155';
    ctx.fillRect(bb.x + bb.width, rimY - 45, 10, 240);

    // Cần vươn kim loại đỡ bảng rổ
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bb.x + bb.width, rimY + 15);
    ctx.lineTo(bb.x + bb.width + 35, rimY + 50);
    ctx.stroke();

    // Bảng rổ Mica trong suốt viền dạ quang (Acrylic Backboard)
    ctx.fillStyle = 'rgba(241, 245, 249, 0.82)';
    ctx.fillRect(bb.x, bb.y, bb.width, bb.height);

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bb.x, bb.y, bb.width, bb.height);

    // Ô vuông nhắm bắn đỏ cam trên bảng rổ (Target Square)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(bb.x - 1, bb.y + 42, bb.width + 2, 34);

    // Vành rổ sắt cam kim loại (Rim)
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(rimX, rimY);
    ctx.lineTo(rimX + rimW, rimY);
    ctx.stroke();

    // 2 chốt lò xo vành rổ
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.arc(rimX, rimY, 3, 0, Math.PI * 2);
    ctx.arc(rimX + rimW, rimY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSpringNet(ctx) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;

    // Vẽ các sợi dây dọc
    for (let c = 0; c <= this.netCols; c++) {
      ctx.beginPath();
      for (let r = 0; r <= this.netRows; r++) {
        const node = this.netNodes[c][r];
        if (r === 0) ctx.moveTo(node.x, node.y);
        else ctx.lineTo(node.x, node.y);
      }
      ctx.stroke();
    }

    // Vẽ các vòng đan ngang
    for (let r = 1; r <= this.netRows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= this.netCols; c++) {
        const node = this.netNodes[c][r];
        if (c === 0) ctx.moveTo(node.x, node.y);
        else ctx.lineTo(node.x, node.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawChibiShooter(ctx, x, y, pose) {
    ctx.save();
    ctx.translate(x, y);

    const primaryColor = '#ea580c'; // Áo jersey cam FPTU
    const accentColor = '#ffffff';
    const skinColor = '#fed7aa';
    const hairColor = '#0f172a';

    // 1. Tư thế Bật nhảy ném rổ (Jump Flick)
    if (pose === 'jump_flick') {
      const jumpY = -22;
      ctx.translate(0, jumpY);

      // Thân bật nhảy
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-10, -28, 20, 24);

      // Số áo 23
      ctx.fillStyle = accentColor;
      ctx.font = '800 10px sans-serif';
      ctx.fillText('23', -5, -14);

      // Đầu Chibi ngửa lên nhìn rổ
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, -36, 12, 0, Math.PI * 2);
      ctx.fill();

      // Băng đô thể thao
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-12, -41, 24, 3.5);

      // Tóc
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -41, 12, Math.PI * 0.9, Math.PI * 0.1);
      ctx.fill();

      // Hai tay vung cao đẩy bóng (Wrist flick)
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4, -24);
      ctx.lineTo(16, -38);
      ctx.lineTo(24, -36); // Cổ tay gập xuống
      ctx.stroke();

      // Hai chân co gập trên không
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-10, -4, 20, 4);

      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-10, 8);
      ctx.moveTo(5, 0);
      ctx.lineTo(2, 8);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 2. Tư thế Chùng gối nhắm ném (Aim Crouch)
    if (pose === 'aim_crouch') {
      ctx.translate(0, 4);

      // Thân chùng xuống
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-11, -26, 22, 22);

      // Số áo
      ctx.fillStyle = accentColor;
      ctx.font = '800 10px sans-serif';
      ctx.fillText('23', -6, -12);

      // Đầu Chibi tập trung
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, -34, 12, 0, Math.PI * 2);
      ctx.fill();

      // Băng đô
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-12, -39, 24, 3.5);

      // Tóc
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -39, 12, Math.PI, 0);
      ctx.fill();

      // Hai tay nâng bóng ngang trán
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(14, -28);
      ctx.stroke();

      // Chân gập chùng gối
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -4, 22, 4);
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-8, 8);
      ctx.moveTo(6, 0);
      ctx.lineTo(8, 8);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 3. Tư thế Đứng nhồi bóng bình thường (Dribble / Idle)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-10, -28, 20, 24);

    ctx.fillStyle = accentColor;
    ctx.font = '800 10px sans-serif';
    ctx.fillText('23', -5, -14);

    // Đầu Chibi
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -36, 12, 0, Math.PI * 2);
    ctx.fill();

    // Mắt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -38, 3, 4);

    // Băng đô
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-12, -41, 24, 3.5);

    // Tóc
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -41, 12, Math.PI, 0);
    ctx.fill();

    // Cánh tay nhồi bóng lên xuống
    const handY = -18 + Math.sin(this.animTime * 10) * 6;
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(4, -24);
    ctx.lineTo(14, handY);
    ctx.stroke();

    // Chân & Giày
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -4, 20, 4);

    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-5, 9);
    ctx.moveTo(5, 0);
    ctx.lineTo(5, 9);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, 8, 6, 4);
    ctx.fillRect(2, 8, 6, 4);

    ctx.restore();
  }

  drawBasketball(ctx, x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);

    // Bóng đổ trên sàn
    const floorY = 270;
    const shadowDist = Math.max(0, floorY - y);
    const shadowScale = Math.max(0.3, 1.0 - shadowDist / 200);

    ctx.save();
    ctx.translate(0, shadowDist);
    ctx.scale(shadowScale, shadowScale * 0.35);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.rotate(rotation);

    // Màu quả bóng (Cam hoặc Rực lửa On Fire / Heat Check)
    ctx.fillStyle = this.isHeatCheck ? '#38bdf8' : this.isOnFire ? '#ea580c' : '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Rãnh cao su màu đen của quả bóng rổ
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 0.5, 0, Math.PI * 2);
    ctx.moveTo(-radius, 0);
    ctx.lineTo(radius, 0);
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.stroke();

    ctx.restore();
  }

  drawBallTrails(ctx) {
    for (let i = 0; i < this.ballTrails.length; i++) {
      const t = this.ballTrails[i];
      const alpha = (1.0 - i / this.ballTrails.length) * 0.65;
      const radius = Math.max(3, 12 - i * 1.2);

      ctx.save();
      ctx.fillStyle = t.isHeat
        ? `rgba(56, 189, 248, ${alpha})`
        : `rgba(234, 88, 12, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  renderAimTrajectory(ctx) {
    ctx.save();
    const rad = (this.angle * Math.PI) / 180;
    const shooterCfg = BASKETBALL_CONFIG.theShooter;
    const minSpd = shooterCfg?.minSpeed ?? 11.0;
    const maxSpd = shooterCfg?.maxSpeed ?? 20.0;
    const speed = minSpd + this.power * (maxSpd - minSpd);

    let simX = this.ball.x;
    let simY = this.ball.y;
    let simVx = Math.cos(rad) * speed;
    let simVy = -Math.sin(rad) * speed;

    ctx.fillStyle = this.isHeatCheck ? 'rgba(56, 189, 248, 0.75)' : 'rgba(251, 191, 36, 0.75)';

    for (let i = 0; i < 18; i++) {
      simVy += BASKETBALL_CONFIG.physics.gravity;
      simX += simVx;
      simY += simVy;

      // Không vẽ qua sàn
      if (simY > 280) break;

      const dotSize = Math.max(1.8, 3.8 - i * 0.14);
      ctx.beginPath();
      ctx.arc(simX, simY, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawAimControls(ctx) {
    ctx.save();
    const barX = 20;
    const barY = 300;
    const barW = 130;
    const barH = 12;

    // Thanh hiển thị lực ném
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(barX, barY, barW, barH);

    const pColor = this.power > 0.8 ? '#ef4444' : this.power > 0.5 ? '#f59e0b' : '#22c55e';
    ctx.fillStyle = pColor;
    ctx.fillRect(barX, barY, barW * this.power, barH);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 11px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`LỰC: ${Math.round(this.power * 100)}% | GÓC: ${Math.round(this.angle)}°`, barX, barY - 5);

    // Gợi ý kéo thả
    if (this.isDragging) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.dragStart.x, this.dragStart.y);
      ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderHUD(ctx) {
    ctx.save();

    // Bảng Tỉ số & Điểm cao
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(15, 12, 175, 52);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, 12, 175, 52);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 16px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`ĐIỂM: ${this.score}`, 25, 34);

    let fireTag = '';
    if (this.isHeatCheck) fireTag = '⚡ HEAT CHECK! x3';
    else if (this.isOnFire) fireTag = '🔥 ON FIRE! x2';

    ctx.font = '700 11px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = this.isHeatCheck ? '#38bdf8' : this.isOnFire ? '#ea580c' : '#fbbf24';
    ctx.fillText(`CHUỖI: ${this.streak} ${fireTag}`, 25, 52);

    // Hướng dẫn tương tác
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 13px "Be Vietnam Pro", sans-serif';

    if (this.state === 'aiming') {
      ctx.fillText(this.isTouch ? 'Kéo để NHẮM & NÉM TỰ DO' : 'Kéo chuột/vuốt màn hình để NHẮM NÉM TỰ DO | Phím: [Mũi tên/Cách]', 320, 342);
    } else {
      ctx.fillText(this.isTouch ? 'Chạm để ném quả tiếp theo' : 'Bấm nút Hành Động hoặc Phím Cách để ném quả tiếp theo', 320, 342);
    }

    ctx.restore();
  }
}
