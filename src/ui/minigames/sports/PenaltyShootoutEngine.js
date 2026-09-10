/**
 * DEVER TOWN - PENALTY SHOOTOUT & FREE-KICK DUEL 2.0
 * Mô phỏng bóng đá đối kháng 2 chiều:
 * 1. Lượt Tiền Đạo (Striker): Sút bóng cong 3D, hàng rào người chắn, bia hồng tâm góc chữ A
 * 2. Lượt Thủ Môn (Goalkeeper): Đeo găng tay bắt bóng thời gian thực
 * 3. Lưới khung thành lò xo đa điểm (Spring-Mass Net Grid 8x6)
 */

import { FOOTBALL_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class PenaltyShootoutEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.role = 'striker'; // 'striker' | 'goalkeeper'
    this.streak = 0;
    this.highScore = 0;

    this.initNetGrid();
    this.resetStriker();
  }

  initNetGrid() {
    this.netCols = 8;
    this.netRows = 6;
    this.netNodes = [];
    const p = FOOTBALL_CONFIG.pitch;
    for (let r = 0; r <= this.netRows; r++) {
      this.netNodes[r] = [];
      for (let c = 0; c <= this.netCols; c++) {
        const x = p.goalLeft + (c / this.netCols) * (p.goalRight - p.goalLeft);
        const y = p.crossbarY + (r / this.netRows) * (p.groundY - p.crossbarY);
        this.netNodes[r][c] = { x, y, origX: x, origY: y, vx: 0, vy: 0 };
      }
    }
  }

  resetStriker() {
    this.role = 'striker';
    this.state = 'aiming'; // 'aiming' | 'shooting' | 'celebrating' | 'saved' | 'missed'
    this.aimTime = 0;
    this.aimX = 0; // -150 to +150
    this.aimElevation = 0.5; // 0 (chìm) to 1 (xà ngang)

    const p = FOOTBALL_CONFIG.pitch;
    this.ball = {
      x: p.penaltySpotX,
      y: p.penaltySpotY,
      z: 0,
      startX: p.penaltySpotX,
      startY: p.penaltySpotY,
      targetX: p.penaltySpotX,
      targetY: 130,
      progress: 0,
      radius: 8,
      spin: 0
    };

    this.gk = {
      x: p.penaltySpotX,
      y: FOOTBALL_CONFIG.goalkeeper.startY,
      targetX: p.penaltySpotX,
      diving: false,
      diveProgress: 0,
      diveDir: 0
    };

    // Hàng rào chắn người (Defensive Wall) xuất hiện khi đạt chuỗi streak >= 2
    this.hasWall = this.streak >= FOOTBALL_CONFIG.wall.enabledAfterStreak;
    this.wallJumpY = 0;
  }

  resetGoalkeeper() {
    this.role = 'goalkeeper';
    this.state = 'gk_wait'; // 'gk_wait' | 'gk_in_flight' | 'gk_result'
    this.gkPlayerPos = { x: 320, y: 155 }; // Tọa độ găng tay người chơi

    const p = FOOTBALL_CONFIG.pitch;
    this.ball = {
      x: p.penaltySpotX,
      y: p.penaltySpotY,
      z: 0,
      startX: p.penaltySpotX,
      startY: p.penaltySpotY,
      targetX: p.goalLeft + 30 + Math.random() * (p.goalRight - p.goalLeft - 60),
      targetY: p.crossbarY + 15 + Math.random() * (p.groundY - p.crossbarY - 30),
      progress: 0,
      radius: 8
    };

    this.aiStrikerTimer = 0.8; // Máy đếm lùi lấy đà sút
  }

  onActionTrigger() {
    if (this.role === 'striker') {
      if (this.state === 'aiming') {
        this.triggerShoot();
      } else if (['celebrating', 'saved', 'missed'].includes(this.state)) {
        // Chuyển sang lượt làm Thủ Môn
        this.resetGoalkeeper();
      }
    } else {
      if (this.state === 'gk_result') {
        // Chuyển lại lượt Tiền Đạo
        this.resetStriker();
      }
    }
  }

  triggerShoot() {
    this.state = 'shooting';
    const p = FOOTBALL_CONFIG.pitch;

    this.ball.startX = p.penaltySpotX;
    this.ball.startY = p.penaltySpotY;
    this.ball.targetX = p.penaltySpotX + this.aimX * 0.95;
    this.ball.targetY = p.crossbarY + 10 + Math.random() * (p.groundY - p.crossbarY - 20);
    this.ball.progress = 0;
    this.ball.spin = (Math.random() - 0.5) * 20;

    // Goalkeeper AI phản xạ
    const diveChoice = Math.random();
    if (diveChoice < 0.4) {
      this.gk.targetX = p.goalLeft + 40 + Math.random() * 40;
      this.gk.diveDir = -1;
    } else if (diveChoice < 0.8) {
      this.gk.targetX = p.goalRight - 40 - Math.random() * 40;
      this.gk.diveDir = 1;
    } else {
      this.gk.targetX = p.penaltySpotX + (Math.random() - 0.5) * 30;
      this.gk.diveDir = 0;
    }
    this.gk.diving = true;
    this.gk.diveProgress = 0;

    // Hàng rào nhảy lên
    if (this.hasWall) {
      this.wallJumpY = FOOTBALL_CONFIG.wall.jumpMax;
    }

    audioManager.playKick(1.1);
  }

  handlePointerMove(x, y) {
    if (this.role === 'goalkeeper' && this.state !== 'gk_result') {
      const p = FOOTBALL_CONFIG.pitch;
      this.gkPlayerPos.x = Math.max(p.goalLeft + 15, Math.min(p.goalRight - 15, x));
      this.gkPlayerPos.y = Math.max(p.crossbarY + 15, Math.min(p.groundY, y));
    }
  }

  update(dt) {
    // Cập nhật dao động lưới lò xo
    for (let r = 0; r <= this.netRows; r++) {
      for (let c = 0; c <= this.netCols; c++) {
        const n = this.netNodes[r][c];
        const dx = n.origX - n.x;
        const dy = n.origY - n.y;
        n.vx += dx * 14 * dt;
        n.vy += dy * 14 * dt;
        n.vx *= 0.92;
        n.vy *= 0.92;
        n.x += n.vx;
        n.y += n.vy;
      }
    }

    if (this.role === 'striker') {
      this.updateStriker(dt);
    } else {
      this.updateGoalkeeperRole(dt);
    }
  }

  updateStriker(dt) {
    const p = FOOTBALL_CONFIG.pitch;

    if (this.state === 'aiming') {
      this.aimTime += dt * 3.4;
      this.aimX = Math.sin(this.aimTime) * 145;
    } else if (this.state === 'shooting') {
      this.ball.progress += dt * 2.2;
      const t = Math.min(this.ball.progress, 1);

      // Quỹ đạo Parabol 3D
      this.ball.x = this.ball.startX + (this.ball.targetX - this.ball.startX) * t;
      this.ball.y = this.ball.startY + (this.ball.targetY - this.ball.startY) * t - Math.sin(t * Math.PI) * 45;
      this.ball.z = t;

      // GK Dive Lerp
      this.gk.diveProgress += dt * FOOTBALL_CONFIG.goalkeeper.diveLerpSpeed;
      const gkt = Math.min(this.gk.diveProgress, 1);
      this.gk.x = p.penaltySpotX + (this.gk.targetX - p.penaltySpotX) * gkt;

      if (t >= 1) {
        this.resolveStrikerShot();
      }
    }
  }

  resolveStrikerShot() {
    const p = FOOTBALL_CONFIG.pitch;
    const bx = this.ball.targetX;
    const by = this.ball.targetY;

    // 1. Kiểm tra va chạm hồng tâm góc chữ A
    for (const b of FOOTBALL_CONFIG.bullseyes) {
      if (Math.hypot(bx - b.x, by - b.y) <= b.r + 8) {
        this.state = 'celebrating';
        this.streak++;
        audioManager.playPostClang();
        audioManager.playGoalFanfare();
        this.juiceFX.shake(8, 0.2);
        this.juiceFX.spawnConfetti(bx, by, 35);
        this.juiceFX.spawnFloatingText(`SIÊU PHẨM ${b.name}! +${b.pts}đ`, 320, 130, { color: '#fbbf24', size: 22 });
        this.triggerNetImpact(bx, by, 18);
        this.callbacks.onScoreUpdate?.(b.pts);
        return;
      }
    }

    // 2. Kiểm tra thủ môn cản phá
    const distGK = Math.hypot(bx - this.gk.x, by - this.gk.y);
    if (distGK < FOOTBALL_CONFIG.goalkeeper.reachRadius) {
      this.state = 'saved';
      this.streak = 0;
      audioManager.playKick(0.7);
      this.juiceFX.spawnFloatingText('THỦ MÔN CẢN PHÁ XUẤT SẮC!', 320, 140, { color: '#ef4444' });
      return;
    }

    // 3. Kiểm tra vào khung thành
    if (bx >= p.goalLeft && bx <= p.goalRight && by >= p.crossbarY && by <= p.groundY) {
      this.state = 'celebrating';
      this.streak++;
      audioManager.playGoalFanfare();
      this.juiceFX.shake(6, 0.18);
      this.juiceFX.spawnConfetti(bx, by, 30);
      this.juiceFX.spawnFloatingText('VÀO! GOLAZO! 🔥', 320, 130, { color: '#22c55e', size: 24 });
      this.triggerNetImpact(bx, by, 22);
      this.callbacks.onScoreUpdate?.(FOOTBALL_CONFIG.scoring.goal);
    } else {
      this.state = 'missed';
      this.streak = 0;
      audioManager.playPostClang();
      this.juiceFX.spawnFloatingText('BÓNG BAY VỌT XÀ!', 320, 140, { color: '#94a3b8' });
    }
  }

  triggerNetImpact(x, y, power = 15) {
    for (let r = 0; r <= this.netRows; r++) {
      for (let c = 0; c <= this.netCols; c++) {
        const n = this.netNodes[r][c];
        const dist = Math.hypot(x - n.x, y - n.y);
        if (dist < 60) {
          n.vx += (Math.random() - 0.5) * power;
          n.vy -= (1 - dist / 60) * power;
        }
      }
    }
  }

  updateGoalkeeperRole(dt) {
    if (this.state === 'gk_wait') {
      this.aiStrikerTimer -= dt;
      if (this.aiStrikerTimer <= 0) {
        this.state = 'gk_in_flight';
        this.ball.progress = 0;
        audioManager.playKick(1.0);
      }
    } else if (this.state === 'gk_in_flight') {
      this.ball.progress += dt * 1.8;
      const t = Math.min(this.ball.progress, 1);

      this.ball.x = this.ball.startX + (this.ball.targetX - this.ball.startX) * t;
      this.ball.y = this.ball.startY + (this.ball.targetY - this.ball.startY) * t - Math.sin(t * Math.PI) * 35;
      this.ball.z = t;

      // Kiểm tra găng tay người chơi đón bóng
      if (t >= 0.85 && t <= 1.0) {
        const dist = Math.hypot(this.ball.x - this.gkPlayerPos.x, this.ball.y - this.gkPlayerPos.y);
        if (dist < 32) {
          this.state = 'gk_result';
          this.streak++;
          audioManager.playKick(0.9);
          this.juiceFX.shake(6, 0.15);
          this.juiceFX.spawnConfetti(this.ball.x, this.ball.y, 25);
          this.juiceFX.spawnFloatingText('CẢN PHÁ THẦN SẦU! +120đ', 320, 130, { color: '#38bdf8', size: 22 });
          this.callbacks.onScoreUpdate?.(FOOTBALL_CONFIG.scoring.savePenalty);
          return;
        }
      }

      if (t >= 1) {
        this.state = 'gk_result';
        audioManager.playGoalFanfare();
        this.triggerNetImpact(this.ball.targetX, this.ball.targetY, 15);
        this.juiceFX.spawnFloatingText('ĐỐI THỦ GHI BÀN!', 320, 130, { color: '#ef4444' });
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = FOOTBALL_CONFIG.pitch;

    // Sân cỏ nhân tạo Oblique 2.5D
    ctx.fillStyle = '#1e3a1e';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#166534';
      ctx.fillRect(0, 80 + i * 35, w, 35);
    }

    // Vạch vôi sân cỏ
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, p.groundY);
    ctx.lineTo(540, p.groundY);
    ctx.stroke();

    // Vòng cung 16m50
    ctx.beginPath();
    ctx.arc(p.penaltySpotX, 240, 60, Math.PI, 0);
    ctx.stroke();

    // Vẽ lưới lò xo Spring-Mass Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= this.netRows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= this.netCols; c++) {
        const n = this.netNodes[r][c];
        if (c === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      }
      ctx.stroke();
    }
    for (let c = 0; c <= this.netCols; c++) {
      ctx.beginPath();
      for (let r = 0; r <= this.netRows; r++) {
        const n = this.netNodes[r][c];
        if (r === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      }
      ctx.stroke();
    }

    // Cột dọc và xà ngang khung thành
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(p.goalLeft, p.groundY);
    ctx.lineTo(p.goalLeft, p.crossbarY);
    ctx.lineTo(p.goalRight, p.crossbarY);
    ctx.lineTo(p.goalRight, p.groundY);
    ctx.stroke();

    // Vẽ Bia Hồng Tâm Góc Chữ A
    if (this.role === 'striker') {
      for (const b of FOOTBALL_CONFIG.bullseyes) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Thủ môn AI (Lượt Tiền Đạo)
    if (this.role === 'striker') {
      ctx.save();
      ctx.translate(this.gk.x, this.gk.y);
      if (this.gk.diving && this.gk.diveDir !== 0) {
        ctx.rotate((this.gk.diveDir * Math.PI) / 6);
      }
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-13, -22, 26, 28);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -30, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-16, -14, 6, 0, Math.PI * 2);
      ctx.arc(16, -14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Đôi găng tay thủ môn người chơi (Lượt Thủ Môn)
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(this.gkPlayerPos.x - 18, this.gkPlayerPos.y, 9, 0, Math.PI * 2);
      ctx.arc(this.gkPlayerPos.x + 18, this.gkPlayerPos.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Quả bóng 3D
    ctx.save();
    const ballScale = 1 - (this.ball.z || 0) * 0.35;
    ctx.translate(this.ball.x, this.ball.y);
    ctx.scale(ballScale, ballScale);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Hướng dẫn HUD
    this.renderHUD(ctx);
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 15px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Vai Trò: ${this.role === 'striker' ? 'TIỀN ĐẠO SÚT BÓNG' : 'THỦ MÔN BẮT BÓNG'}`, 20, 30);
    ctx.fillText(`Chuỗi Ghi Bàn: ${this.streak} 🔥`, 20, 52);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 13px Outfit, sans-serif';
    if (this.role === 'striker' && this.state === 'aiming') {
      ctx.fillText('Bấm nút Hành Động hoặc Click để SÚT VÀO GÓC CHỮ A!', 320, 335);
    } else if (this.role === 'goalkeeper' && this.state !== 'gk_result') {
      ctx.fillText('Di chuyển chuột / ngón tay để ĐEO GĂNG ĐÓN BÓNG!', 320, 335);
    } else {
      ctx.fillText('Bấm nút Hành Động để sang lượt tiếp theo', 320, 335);
    }
    ctx.restore();
  }
}
