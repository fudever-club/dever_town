/**
 * DEVER TOWN - PENALTY SHOOTOUT & FREE-KICK DUEL 3.0 (GOLAZO DUEL)
 * Đại tu toàn diện Minigame Bóng Đá theo chuẩn Notion Superpowers & Chibi Art:
 * 1. Sân vận động đêm FPTU Arena (Khán đài flash crowd, Dual Floodlights, LED Board)
 * 2. Cầu thủ Chibi Striker FPTU (Chạy đà, đặt trụ, quất mu bàn chân, trượt cỏ ăn mừng)
 * 3. Thủ môn Chibi Goalkeeper (Chùng gối, nhấp nhổm, bay người diving hết cỡ)
 * 4. Hàng rào 3 cầu thủ Chibi bật nhảy chắn bóng khi streak >= 2
 * 5. Cơ chế sút kép: Vuốt / Kéo chuột uốn cong Banana Curve HOẶC Phím nạp thanh lực Sweet Spot
 * 6. Kỹ thuật sút đa dạng: Banana Curl (Magnus effect), Knuckleball (lá tre), Panenka chip
 * 7. Lưới khung thành lò xo đa điểm 8x6 (Spring-Mass Net Grid)
 * 8. Lượt Thủ Môn phản xạ đấm bóng cứu thua xuất thần
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

    // Scrolling text offset cho bảng LED
    this.ledOffset = 0;
    this.animTime = 0;

    // Hit-stop freeze
    this.hitStopUntil = 0;

    // Khởi tạo lưới lò xo 8x6
    this.initNetGrid();

    // Khởi tạo điểm ngắm & thanh lực
    this.crosshair = { x: 320, y: 135 };
    this.powerCharging = false;
    this.power = 0; // 0 to 1
    this.powerDirection = 1;
    this.spinCurl = 0; // -1 (xoáy trái) to +1 (xoáy phải)

    // Trạng thái kéo chuột / vuốt bóng
    this.dragStart = null;
    this.dragCurrent = null;
    this.isDragging = false;

    // Khởi tạo lượt Tiền đạo
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
    this.state = 'aiming'; // 'aiming' | 'power_charging' | 'runup' | 'flight' | 'celebrating' | 'saved' | 'hit_wall' | 'missed'
    this.subStateTimer = 0;

    this.crosshair = { x: 320, y: 130 };
    this.powerCharging = false;
    this.power = 0;
    this.spinCurl = 0;
    this.shotType = 'regular'; // 'regular' | 'banana' | 'knuckle' | 'panenka'

    const p = FOOTBALL_CONFIG.pitch;
    this.ball = {
      x: p.penaltySpotX,
      y: p.penaltySpotY,
      z: 0,
      startX: p.penaltySpotX,
      startY: p.penaltySpotY,
      targetX: p.penaltySpotX,
      targetY: 130,
      flightDuration: 0.62,
      progress: 0,
      radius: 8.5,
      spin: 0,
      curveOffset: 0,
      rotation: 0
    };

    // Vị trí cầu thủ Chibi Striker (lấy đà lệch sang phải-sau bóng một chút)
    this.striker = {
      x: p.penaltySpotX + 28,
      y: p.penaltySpotY + 24,
      startX: p.penaltySpotX + 28,
      startY: p.penaltySpotY + 24,
      targetX: p.penaltySpotX + 8,
      targetY: p.penaltySpotY + 6,
      progress: 0,
      pose: 'idle', // 'idle' | 'run' | 'kick' | 'follow' | 'celebrate' | 'sad'
      legAngle: 0
    };

    // Thủ môn Chibi AI
    this.gk = {
      x: p.penaltySpotX,
      y: FOOTBALL_CONFIG.goalkeeper.startY,
      targetX: p.penaltySpotX,
      diving: false,
      diveProgress: 0,
      diveDir: 0,
      pose: 'ready', // 'ready' | 'dive' | 'save' | 'beaten'
      bobTimer: 0
    };

    // Hàng rào chắn người (Defensive Wall) xuất hiện khi streak >= 2
    this.hasWall = this.streak >= (FOOTBALL_CONFIG.wall?.enabledAfterStreak ?? 2);
    this.wallJumpY = 0;
    this.wallJumpVel = 0;

    // Reset cờ drag
    this.isDragging = false;
    this.dragStart = null;
    this.dragCurrent = null;
  }

  resetGoalkeeper() {
    this.role = 'goalkeeper';
    this.state = 'gk_wait'; // 'gk_wait' | 'gk_in_flight' | 'gk_result'
    this.gkPlayerPos = { x: 320, y: 155 }; // Tọa độ găng tay người chơi

    const p = FOOTBALL_CONFIG.pitch;
    const targetCornerX = Math.random() < 0.5
      ? p.goalLeft + 25 + Math.random() * 45
      : p.goalRight - 25 - Math.random() * 45;
    const targetCornerY = p.crossbarY + 15 + Math.random() * (p.groundY - p.crossbarY - 30);

    this.ball = {
      x: p.penaltySpotX,
      y: p.penaltySpotY,
      z: 0,
      startX: p.penaltySpotX,
      startY: p.penaltySpotY,
      targetX: targetCornerX,
      targetY: targetCornerY,
      flightDuration: 0.72,
      progress: 0,
      radius: 8.5,
      rotation: 0
    };

    this.aiStrikerTimer = 0.85; // Thời gian tiền đạo AI lấy đà sút
    this.aiStrikerProgress = 0;
  }

  // ==========================================
  // INPUT HANDLERS (POINTER & KEYBOARD)
  // ==========================================

  handlePointerDown(x, y) {
    if (this.role === 'striker') {
      if (this.state === 'aiming') {
        const p = FOOTBALL_CONFIG.pitch;
        const distToBall = Math.hypot(x - p.penaltySpotX, y - p.penaltySpotY);
        // Bắt đầu kéo vuốt nếu nhấn gần bóng hoặc bất kỳ đâu trên nửa dưới sân
        this.isDragging = true;
        this.dragStart = { x, y };
        this.dragCurrent = { x, y };
      } else if (['celebrating', 'saved', 'hit_wall', 'missed'].includes(this.state)) {
        this.resetGoalkeeper();
      }
    } else {
      if (this.state === 'gk_result') {
        this.resetStriker();
      }
    }
  }

  handlePointerMove(x, y) {
    if (this.role === 'striker') {
      if (this.isDragging && this.state === 'aiming') {
        this.dragCurrent = { x, y };
        // Tính toán hồng tâm và độ xoáy tức thì theo đường kéo
        const dx = this.dragCurrent.x - this.dragStart.x;
        const dy = this.dragCurrent.y - this.dragStart.y;
        const p = FOOTBALL_CONFIG.pitch;

        // Nếu kéo lùi (phong cách Slingshot): ngắm ngược hướng kéo
        if (dy > 10) {
          this.crosshair.x = Phaser ? Phaser.Math?.Clamp(p.penaltySpotX - dx * 2.2, p.goalLeft + 15, p.goalRight - 15) : Math.max(p.goalLeft + 15, Math.min(p.goalRight - 15, p.penaltySpotX - dx * 2.2));
          this.crosshair.y = Math.max(p.crossbarY + 12, Math.min(p.groundY - 10, p.crossbarY + 65 - dy * 0.7));
          this.spinCurl = Math.max(-1, Math.min(1, (dx / 80)));
        } else {
          // Kéo thẳng lên hướng khung thành
          this.crosshair.x = Math.max(p.goalLeft + 15, Math.min(p.goalRight - 15, x));
          this.crosshair.y = Math.max(p.crossbarY + 12, Math.min(p.groundY - 10, y));
          this.spinCurl = Math.max(-1, Math.min(1, (dx / 60)));
        }
      } else if (this.state === 'aiming') {
        // Di chuyển hồng tâm tự do theo chuột nếu không kéo
        const p = FOOTBALL_CONFIG.pitch;
        if (y < p.groundY + 30) {
          this.crosshair.x = Math.max(p.goalLeft + 15, Math.min(p.goalRight - 15, x));
          this.crosshair.y = Math.max(p.crossbarY + 12, Math.min(p.groundY - 10, y));
        }
      }
    } else if (this.role === 'goalkeeper') {
      const p = FOOTBALL_CONFIG.pitch;
      this.gkPlayerPos.x = Math.max(p.goalLeft + 18, Math.min(p.goalRight - 18, x));
      this.gkPlayerPos.y = Math.max(p.crossbarY + 15, Math.min(p.groundY, y));
    }
  }

  handlePointerUp(x, y) {
    if (this.role === 'striker' && this.isDragging && this.state === 'aiming') {
      this.isDragging = false;
      const dx = (this.dragCurrent?.x || x) - this.dragStart.x;
      const dy = (this.dragCurrent?.y || y) - this.dragStart.y;
      const dragDist = Math.hypot(dx, dy);

      if (dragDist > 15) {
        // Tính toán lực sút từ cự ly kéo
        const calcPower = Math.min(1, dragDist / 120);
        this.power = calcPower;
        this.triggerRunupAndShoot();
      }
      this.dragStart = null;
      this.dragCurrent = null;
    }
  }

  onActionTrigger() {
    if (this.role === 'striker') {
      if (this.state === 'aiming') {
        // Nhấn phím Hành động (Space/Enter) -> chuyển sang nạp lực
        this.state = 'power_charging';
        this.power = 0;
        this.powerDirection = 1;
      } else if (this.state === 'power_charging') {
        // Nhấn lần 2 -> Khóa lực và sút
        this.triggerRunupAndShoot();
      } else if (['celebrating', 'saved', 'hit_wall', 'missed'].includes(this.state)) {
        this.resetGoalkeeper();
      }
    } else {
      if (this.state === 'gk_result') {
        this.resetStriker();
      }
    }
  }

  handleKeyboardControls(keys, dt) {
    if (this.role === 'striker' && this.state === 'aiming') {
      const p = FOOTBALL_CONFIG.pitch;
      const moveSpeed = 240 * dt;
      if (keys.left) this.crosshair.x = Math.max(p.goalLeft + 15, this.crosshair.x - moveSpeed);
      if (keys.right) this.crosshair.x = Math.min(p.goalRight - 15, this.crosshair.x + moveSpeed);
      if (keys.up) this.crosshair.y = Math.max(p.crossbarY + 12, this.crosshair.y - moveSpeed);
      if (keys.down) this.crosshair.y = Math.min(p.groundY - 10, this.crosshair.y + moveSpeed);
    }
  }

  triggerRunupAndShoot() {
    this.state = 'runup';
    this.subStateTimer = 0;
    this.striker.pose = 'run';

    // Xác định kiểu sút
    if (this.power < 0.28) {
      this.shotType = 'panenka'; // Sục bóng bổng nhẹ
      this.ball.flightDuration = FOOTBALL_CONFIG.theGolazo?.ball?.panenkaDuration || 1.15;
    } else if (Math.abs(this.spinCurl) > 0.35) {
      this.shotType = 'banana'; // Sút xoáy quả chuối
      this.ball.flightDuration = 0.65;
    } else if (this.power >= 0.82 && Math.abs(this.spinCurl) < 0.15) {
      this.shotType = 'knuckle'; // Knuckleball lá tre zíc-zắc
      this.ball.flightDuration = 0.52;
    } else {
      this.shotType = 'regular';
      this.ball.flightDuration = FOOTBALL_CONFIG.theGolazo?.ball?.regularDuration || 0.62;
    }
  }

  executeShotPhysics() {
    this.state = 'flight';
    this.subStateTimer = 0;
    const p = FOOTBALL_CONFIG.pitch;

    this.ball.startX = p.penaltySpotX;
    this.ball.startY = p.penaltySpotY;
    this.ball.progress = 0;

    // Điểm đích đến thực tế
    let finalTargetX = this.crosshair.x;
    let finalTargetY = this.crosshair.y;

    // Nếu lực quá mạnh (> 0.96) mà không kiểm soát -> có tỉ lệ bóng bay vọt xà
    if (this.power > 0.95 && this.shotType !== 'knuckle') {
      finalTargetY = p.crossbarY - 14 - (this.power - 0.95) * 160;
    }

    this.ball.targetX = finalTargetX;
    this.ball.targetY = finalTargetY;
    this.ball.spin = this.spinCurl * 25;
    this.ball.curveOffset = this.spinCurl * (FOOTBALL_CONFIG.theGolazo?.ball?.maxCurve || 65);

    // Kích hoạt thủ môn AI phản xạ
    this.triggerGoalkeeperAI();

    // Hàng rào nhảy lên cản phá
    if (this.hasWall) {
      this.wallJumpY = FOOTBALL_CONFIG.theGolazo?.wall?.jumpMax || 28;
    }

    // Âm thanh sút bóng
    audioManager.playKick(1.2);
    this.juiceFX?.spawnDust?.(p.penaltySpotX, p.penaltySpotY + 6, 12);
  }

  triggerGoalkeeperAI() {
    const p = FOOTBALL_CONFIG.pitch;
    const targetX = this.ball.targetX;

    // AI phán đoán dựa trên hướng sút
    this.gk.pose = 'ready';
    this.gk.diving = false;

    // Độ trễ phản xạ 0.10s
    setTimeout(() => {
      if (this.state !== 'flight') return;
      this.gk.diving = true;
      this.gk.diveProgress = 0;

      // Phán đoán hướng sút (có tỉ lệ đoán sai nếu là cú sút Panenka hoặc Knuckleball)
      let aiGuessX = targetX;
      if (this.shotType === 'panenka') {
        // Thủ môn thường bị lừa đổ người sang góc sớm
        aiGuessX = Math.random() < 0.5 ? p.goalLeft + 45 : p.goalRight - 45;
      } else if (this.shotType === 'knuckle') {
        // Quỹ đạo zíc zắc làm giảm độ chính xác của GK
        aiGuessX = targetX + (Math.random() - 0.5) * 90;
      } else {
        // Tỉ lệ đọc vị góc sút phụ thuộc vào độ cong
        aiGuessX = targetX + (Math.random() - 0.5) * 45;
      }

      this.gk.targetX = Math.max(p.goalLeft + 35, Math.min(p.goalRight - 35, aiGuessX));
      this.gk.diveDir = this.gk.targetX < p.penaltySpotX - 20 ? -1 : (this.gk.targetX > p.penaltySpotX + 20 ? 1 : 0);
      this.gk.pose = 'dive';
    }, 110);
  }

  // ==========================================
  // UPDATE LOOP & LOGIC RESOLUTION
  // ==========================================

  update(dt) {
    this.animTime += dt;
    this.ledOffset = (this.ledOffset + dt * 45) % 800;

    // Đóng băng khung hình nếu đang trong Hit-Stop
    if (performance.now() < this.hitStopUntil) {
      return;
    }

    // 1. Cập nhật lò xo lưới khung thành
    this.updateNetPhysics(dt);

    // 2. Cập nhật theo vai trò hiện tại
    if (this.role === 'striker') {
      this.updateStriker(dt);
    } else {
      this.updateGoalkeeperRole(dt);
    }
  }

  updateNetPhysics(dt) {
    for (let r = 0; r <= this.netRows; r++) {
      for (let c = 0; c <= this.netCols; c++) {
        const n = this.netNodes[r][c];
        const dx = n.origX - n.x;
        const dy = n.origY - n.y;
        n.vx += dx * 16 * dt;
        n.vy += dy * 16 * dt;
        n.vx *= 0.90;
        n.vy *= 0.90;
        n.x += n.vx;
        n.y += n.vy;
      }
    }
  }

  triggerNetImpact(x, y, power = 18) {
    for (let r = 0; r <= this.netRows; r++) {
      for (let c = 0; c <= this.netCols; c++) {
        const n = this.netNodes[r][c];
        const dist = Math.hypot(x - n.x, y - n.y);
        if (dist < 75) {
          n.vx += (Math.random() - 0.5) * power;
          n.vy -= (1 - dist / 75) * power * 1.2;
        }
      }
    }
  }

  updateStriker(dt) {
    const p = FOOTBALL_CONFIG.pitch;

    // Nạp thanh lực nếu đang trong state power_charging
    if (this.state === 'power_charging') {
      this.power += dt * 1.8 * this.powerDirection;
      if (this.power >= 1) {
        this.power = 1;
        this.powerDirection = -1;
      } else if (this.power <= 0) {
        this.power = 0;
        this.powerDirection = 1;
      }
    }

    // Tiến trình chạy đà của Tiền đạo
    if (this.state === 'runup') {
      this.subStateTimer += dt;
      const runDur = FOOTBALL_CONFIG.theGolazo?.striker?.runupDuration || 0.22;
      const t = Math.min(1, this.subStateTimer / runDur);

      this.striker.x = this.striker.startX + (this.striker.targetX - this.striker.startX) * t;
      this.striker.y = this.striker.startY + (this.striker.targetY - this.striker.startY) * t;
      this.striker.legAngle = Math.sin(t * Math.PI * 4) * 0.45;

      if (t >= 1) {
        this.striker.pose = 'kick';
        this.executeShotPhysics();
      }
    }

    // Quỹ đạo bay của bóng
    if (this.state === 'flight') {
      this.subStateTimer += dt;
      const t = Math.min(1, this.subStateTimer / this.ball.flightDuration);
      this.ball.progress = t;

      // Đường bay Parabol 3D + Độ xoáy Magnus + Knuckleball
      let curveX = 0;
      if (this.shotType === 'banana') {
        curveX = Math.sin(t * Math.PI) * this.ball.curveOffset;
      } else if (this.shotType === 'knuckle') {
        curveX = Math.sin(t * Math.PI * 7) * (FOOTBALL_CONFIG.theGolazo?.ball?.knuckleJitter || 12);
      }

      // Độ cao nâng bóng (Z-axis arc)
      const arcHeight = this.shotType === 'panenka' ? 85 : 50;
      const elevation = Math.sin(t * Math.PI) * arcHeight;

      this.ball.x = this.ball.startX + (this.ball.targetX - this.ball.startX) * t + curveX;
      this.ball.y = this.ball.startY + (this.ball.targetY - this.ball.startY) * t - elevation;
      this.ball.z = t;
      this.ball.rotation += dt * (15 + Math.abs(this.ball.spin));

      // Hàng rào nhảy lên và rơi xuống
      if (this.hasWall && this.wallJumpY > 0) {
        this.wallJumpY = Math.max(0, this.wallJumpY - dt * 32);
      }

      // Kiểm tra va chạm hàng rào tại quãng 35% - 45% đường bay
      if (this.hasWall && t >= 0.35 && t <= 0.48) {
        const wallX = 320;
        const wallY = 220 - this.wallJumpY;
        const distToWallX = Math.abs(this.ball.x - wallX);
        const distToWallY = Math.abs(this.ball.y - wallY);

        if (distToWallX < 32 && distToWallY < 24) {
          // Va chạm hàng rào!
          this.state = 'hit_wall';
          this.streak = 0;
          this.striker.pose = 'sad';
          audioManager.playKick(0.7);
          this.juiceFX?.shake(5, 0.15);
          this.juiceFX?.spawnFloatingText('BÓNG ĐẬP TRÚNG HÀNG RÀO!', 320, 140, { color: '#ef4444' });
          return;
        }
      }

      // Cập nhật vị trí Thủ Môn AI bay người (Lerp)
      if (this.gk.diving) {
        this.gk.diveProgress += dt * (FOOTBALL_CONFIG.theGolazo?.goalkeeper?.diveSpeed || 3.0);
        const gkt = Math.min(1, this.gk.diveProgress);
        this.gk.x = p.penaltySpotX + (this.gk.targetX - p.penaltySpotX) * gkt;
      }

      if (t >= 1) {
        this.resolveStrikerOutcome();
      }
    }
  }

  resolveStrikerOutcome() {
    const p = FOOTBALL_CONFIG.pitch;
    const bx = this.ball.targetX;
    const by = this.ball.targetY;
    const scoring = FOOTBALL_CONFIG.theGolazo?.technicalScoring || FOOTBALL_CONFIG.scoring;

    // 1. Kiểm tra bóng đập xà ngang / cột dọc (Woodwork Clang)
    const hitCrossbar = Math.abs(by - p.crossbarY) < 6 && bx >= p.goalLeft - 6 && bx <= p.goalRight + 6;
    const hitLeftPost = Math.abs(bx - p.goalLeft) < 6 && by >= p.crossbarY && by <= p.groundY;
    const hitRightPost = Math.abs(bx - p.goalRight) < 6 && by >= p.crossbarY && by <= p.groundY;

    if (hitCrossbar || hitLeftPost || hitRightPost) {
      audioManager.playPostClang();
      this.juiceFX?.shake(9, 0.25);

      // Nếu đập mép trong và dội vào lưới -> Bàn thắng In-Off The Post siêu phẩm!
      const isInOff = (hitCrossbar && by >= p.crossbarY) || (hitLeftPost && bx >= p.goalLeft) || (hitRightPost && bx <= p.goalRight);
      if (isInOff) {
        this.triggerGoalSuccess('DỘI XÀ VÀO LƯỚI!', scoring.inOffPost || 200, '#fbbf24', bx, by);
        return;
      } else {
        this.state = 'missed';
        this.streak = 0;
        this.striker.pose = 'sad';
        this.juiceFX?.spawnFloatingText('BÓNG DỘI XÀ CỘT RA NGOÀI!', 320, 140, { color: '#94a3b8' });
        return;
      }
    }

    // 2. Kiểm tra hồng tâm góc chữ A (Top Corner Bullseyes)
    for (const b of FOOTBALL_CONFIG.bullseyes) {
      if (Math.hypot(bx - b.x, by - b.y) <= b.r + 8) {
        this.hitStopUntil = performance.now() + (FOOTBALL_CONFIG.theGolazo?.ball?.hitStopDuration || 40);
        this.triggerGoalSuccess(`GÓC CHỮ A ${b.name.toUpperCase()}!`, b.pts, '#fbbf24', bx, by, true);
        return;
      }
    }

    // 3. Kiểm tra Thủ môn cản phá (Goalkeeper Save)
    const distGK = Math.hypot(bx - this.gk.x, by - this.gk.y);
    const reachRadius = FOOTBALL_CONFIG.theGolazo?.goalkeeper?.reachRadius || 48;
    if (distGK < reachRadius) {
      this.state = 'saved';
      this.streak = 0;
      this.gk.pose = 'save';
      this.striker.pose = 'sad';
      audioManager.playKick(0.85);
      this.juiceFX?.shake(6, 0.16);
      this.juiceFX?.spawnFloatingText('THỦ MÔN CẢN PHÁ XUẤT THẦN!', 320, 140, { color: '#ef4444' });
      return;
    }

    // 4. Kiểm tra bóng vào trong khung thành
    if (bx >= p.goalLeft && bx <= p.goalRight && by >= p.crossbarY && by <= p.groundY) {
      let goalText = 'VÀO! GOLAZO! 🔥';
      let pts = scoring.regularGoal || 100;
      let color = '#22c55e';

      if (this.shotType === 'banana') {
        goalText = 'SIÊU PHẨM BẺ XOÁY QUẢ CHUỐI! 🍌';
        pts = scoring.curvedGolazo || 180;
        color = '#38bdf8';
      } else if (this.shotType === 'panenka') {
        goalText = 'PANENKA SỤC BÓNG TUYỆT HẢO! 🎩';
        pts = scoring.panenka || 160;
        color = '#a855f7';
      }

      this.triggerGoalSuccess(goalText, pts, color, bx, by);
    } else {
      this.state = 'missed';
      this.streak = 0;
      this.striker.pose = 'sad';
      this.juiceFX?.spawnFloatingText('BÓNG BAY VỌT XÀ / LỆCH CỘT!', 320, 140, { color: '#94a3b8' });
    }
  }

  triggerGoalSuccess(title, pts, color, bx, by, isSuperGolazo = false) {
    this.state = 'celebrating';
    this.streak++;
    this.striker.pose = 'celebrate';
    this.gk.pose = 'beaten';

    audioManager.playGoalFanfare();
    this.juiceFX?.shake(isSuperGolazo ? 10 : 7, 0.22);
    this.juiceFX?.spawnConfetti(bx, by, isSuperGolazo ? 45 : 30);
    this.juiceFX?.spawnFloatingText(`${title} +${pts}đ`, 320, 130, { color: color, size: 23 });

    this.triggerNetImpact(bx, by, isSuperGolazo ? 26 : 18);
    this.callbacks.onScoreUpdate?.(pts);
  }

  updateGoalkeeperRole(dt) {
    if (this.state === 'gk_wait') {
      this.aiStrikerTimer -= dt;
      if (this.aiStrikerTimer <= 0) {
        this.state = 'gk_in_flight';
        this.ball.progress = 0;
        audioManager.playKick(1.1);
      }
    } else if (this.state === 'gk_in_flight') {
      this.ball.progress += dt * 1.5;
      const t = Math.min(1, this.ball.progress);

      this.ball.x = this.ball.startX + (this.ball.targetX - this.ball.startX) * t;
      this.ball.y = this.ball.startY + (this.ball.targetY - this.ball.startY) * t - Math.sin(t * Math.PI) * 45;
      this.ball.z = t;
      this.ball.rotation += dt * 12;

      // Kiểm tra găng tay người chơi đón bóng tại sát vạch vôi
      if (t >= 0.82 && t <= 1.0) {
        const dist = Math.hypot(this.ball.x - this.gkPlayerPos.x, this.ball.y - this.gkPlayerPos.y);
        if (dist < 36) {
          this.state = 'gk_result';
          this.streak++;
          audioManager.playKick(0.9);
          this.juiceFX?.shake(7, 0.18);
          this.juiceFX?.spawnConfetti(this.ball.x, this.ball.y, 25);
          this.juiceFX?.spawnFloatingText('CẢN PHÁ THẦN SẦU! +150đ 🧤', 320, 130, { color: '#38bdf8', size: 22 });
          this.callbacks.onScoreUpdate?.(FOOTBALL_CONFIG.theGolazo?.technicalScoring?.gkSave || 150);
          return;
        }
      }

      if (t >= 1) {
        this.state = 'gk_result';
        audioManager.playGoalFanfare();
        this.triggerNetImpact(this.ball.targetX, this.ball.targetY, 16);
        this.juiceFX?.spawnFloatingText('ĐỐI THỦ GHI BÀN!', 320, 130, { color: '#ef4444' });
      }
    }
  }

  // ==========================================
  // RENDERING PIPELINE (CANVAS 2D ART)
  // ==========================================

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = FOOTBALL_CONFIG.pitch;

    ctx.clearRect(0, 0, w, h);

    // 1. Bầu trời đêm FPTU Stadium
    this.renderNightSky(ctx, w);

    // 2. Khán đài & Bảng LED điện tử
    this.renderGrandstandAndLED(ctx, w);

    // 3. Mặt cỏ phối cảnh 3D & Vạch vôi
    this.renderPitchGrass(ctx, w, h);

    // 4. Khung thành 3D & Lưới lò xo Spring-Mass
    this.renderGoalAndNet(ctx, p);

    // 5. Bia hồng tâm góc chữ A (nếu là lượt Tiền đạo)
    if (this.role === 'striker') {
      this.renderBullseyes(ctx);
    }

    // 6. Thủ Môn Chibi
    if (this.role === 'striker') {
      this.renderChibiGoalkeeperAI(ctx);
    } else {
      this.renderPlayerGloves(ctx);
    }

    // 7. Hàng rào 3 cầu thủ Chibi (nếu có)
    if (this.role === 'striker' && this.hasWall) {
      this.renderDefensiveWall(ctx);
    }

    // 8. Cầu thủ Tiền đạo Chibi Striker FPTU
    if (this.role === 'striker') {
      this.renderChibiStriker(ctx);
    }

    // 9. Quả bóng FIFA Telstar 3D & Bóng đổ
    this.renderFootball3D(ctx);

    // 10. Dẫn hướng ngắm & Kéo vuốt Banana Curve
    if (this.role === 'striker' && (this.state === 'aiming' || this.state === 'power_charging')) {
      this.renderAimGuide(ctx, p);
    }

    // 11. Đèn cao áp sân vận động (Dual Cone Floodlights)
    this.renderStadiumFloodlights(ctx, w, h);

    // 12. Giao diện HUD & Thanh Lực (Power Meter)
    this.renderHUD(ctx);
  }

  renderNightSky(ctx, w) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 75);
    skyGrad.addColorStop(0, '#040718');
    skyGrad.addColorStop(1, '#0c1538');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, 75);
  }

  renderGrandstandAndLED(ctx, w) {
    // Khán đài đêm & Chấm đèn flash nhấp nháy
    ctx.fillStyle = '#0a0f24';
    ctx.fillRect(0, 35, w, 32);

    ctx.save();
    // Vẽ khán giả dạng silhouette
    for (let x = 12; x < w; x += 14) {
      ctx.fillStyle = (x % 28 === 0) ? '#1e293b' : '#141c38';
      ctx.beginPath();
      ctx.arc(x, 48, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Camera Flash bulbs ngẫu nhiên
    for (let i = 0; i < 6; i++) {
      const fx = (Math.sin(this.animTime * 3 + i * 1.7) * 0.5 + 0.5) * (w - 40) + 20;
      const fy = 38 + (i % 3) * 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(fx, fy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bảng LED điện tử chạy chữ
    const ledY = 66;
    ctx.fillStyle = '#060a17';
    ctx.fillRect(0, ledY, w, 14);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, ledY, w, 14);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';

    const bannerText = FOOTBALL_CONFIG.theGolazo?.stadium?.ledText || 'FU-DEVER • WORK HARD - PLAY HARD • FPT UNIVERSITY DA NANG';
    const textWidth = ctx.measureText(bannerText).width + 80;
    const startX = -this.ledOffset;
    for (let offset = startX; offset < w; offset += textWidth) {
      ctx.fillText(bannerText, offset, ledY + 10);
    }
    ctx.restore();
  }

  renderPitchGrass(ctx, w, h) {
    const p = FOOTBALL_CONFIG.pitch;
    const topY = 80;

    // 8 Dải cắt cỏ phối cảnh 3D
    const stripeCount = 8;
    for (let i = 0; i < stripeCount; i++) {
      const y1 = topY + i * 35;
      ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#166534';
      ctx.fillRect(0, y1, w, 35);
    }

    // Vạch vôi sân cỏ phối cảnh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.5;

    // Vạch vôi khung thành
    ctx.beginPath();
    ctx.moveTo(80, p.groundY);
    ctx.lineTo(560, p.groundY);
    ctx.stroke();

    // Vòng cung 16m50
    ctx.beginPath();
    ctx.arc(p.penaltySpotX, 230, 68, Math.PI * 0.95, Math.PI * 0.05, true);
    ctx.stroke();

    // Vạch vôi vòng cấm Penalty Box
    ctx.beginPath();
    ctx.moveTo(130, p.groundY);
    ctx.lineTo(110, 345);
    ctx.lineTo(530, 345);
    ctx.lineTo(510, p.groundY);
    ctx.stroke();

    // Điểm đặt bóng Penalty Spot (chấm trắng)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.penaltySpotX, p.penaltySpotY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderGoalAndNet(ctx, p) {
    // 1. Vẽ lưới lò xo Spring-Mass Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = 1;

    // Hàng ngang
    for (let r = 0; r <= this.netRows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= this.netCols; c++) {
        const n = this.netNodes[r][c];
        if (c === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      }
      ctx.stroke();
    }
    // Hàng dọc
    for (let c = 0; c <= this.netCols; c++) {
      ctx.beginPath();
      for (let r = 0; r <= this.netRows; r++) {
        const n = this.netNodes[r][c];
        if (r === 0) ctx.moveTo(n.x, n.y);
        else ctx.lineTo(n.x, n.y);
      }
      ctx.stroke();
    }

    // 2. Cột sau & thanh chống đỡ lưới 3D
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p.goalLeft, p.crossbarY);
    ctx.lineTo(p.goalLeft + 20, p.crossbarY - 14);
    ctx.lineTo(p.goalRight - 20, p.crossbarY - 14);
    ctx.lineTo(p.goalRight, p.crossbarY);
    ctx.stroke();

    // 3. Khung thành chính (Cột dọc & Xà ngang kim loại trắng bóng)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.goalLeft, p.groundY + 2);
    ctx.lineTo(p.goalLeft, p.crossbarY);
    ctx.lineTo(p.goalRight, p.crossbarY);
    ctx.lineTo(p.goalRight, p.groundY + 2);
    ctx.stroke();

    // Điểm nối góc chữ A
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(p.goalLeft, p.crossbarY, 4, 0, Math.PI * 2);
    ctx.arc(p.goalRight, p.crossbarY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  renderBullseyes(ctx) {
    for (const b of FOOTBALL_CONFIG.bullseyes) {
      // Vòng ngoài đỏ
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();

      // Vòng giữa trắng
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Tâm vàng rực
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Hiệu ứng phát sáng nhẹ
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  renderChibiStriker(ctx) {
    const s = this.striker;
    ctx.save();
    ctx.translate(s.x, s.y);

    // Bóng đổ chân cầu thủ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (s.pose === 'celebrate') {
      // Tư thế trượt cỏ ăn mừng (Knee slide)
      // Chân trượt
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, 10, 20, 6);
      // Áo FPTU cam
      ctx.fillStyle = '#f26f21';
      ctx.fillRect(-10, -4, 20, 16);
      // Đầu nghiêng lên trời
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -14, 9, 0, Math.PI * 2);
      ctx.fill();
      // Tóc
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, -17, 9, Math.PI, Math.PI * 2);
      ctx.fill();
      // 2 Tay giơ cao ăn mừng
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(-15, -12);
      ctx.moveTo(8, 2);
      ctx.lineTo(15, -12);
      ctx.stroke();
    } else {
      // Tư thế đứng / chạy / sút
      const legBob = Math.sin(this.animTime * 6) * 1.5;

      // 2 Chân & Giày đá bóng
      ctx.fillStyle = '#f26f21'; // Tất cam
      ctx.fillRect(-6, 8, 4, 9);
      ctx.fillRect(2, 8 + (s.pose === 'run' ? s.legAngle * 10 : 0), 4, 9);

      // Giày đinh đen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, 15, 6, 3);
      ctx.fillRect(0, 15 + (s.pose === 'run' ? s.legAngle * 10 : 0), 6, 3);

      // Quần đùi đen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, 3, 16, 7);

      // Thân áo FPTU số 10
      ctx.fillStyle = '#f26f21';
      ctx.fillRect(-9, -11, 18, 15);

      // Số áo 10 sau lưng
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 8px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('10', 0, -1);

      // Cổ áo trắng
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -12, 8, 2);

      // Đầu Chibi
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -19 + legBob * 0.5, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // Mái tóc
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, -21 + legBob * 0.5, 9.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // Tay cầu thủ
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (s.pose === 'kick') {
        ctx.moveTo(-8, -6);
        ctx.lineTo(-16, -2);
        ctx.moveTo(8, -6);
        ctx.lineTo(14, 2);
      } else {
        ctx.moveTo(-9, -6);
        ctx.lineTo(-13, 2);
        ctx.moveTo(9, -6);
        ctx.lineTo(13, 2);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  renderChibiGoalkeeperAI(ctx) {
    const gk = this.gk;
    ctx.save();
    ctx.translate(gk.x, gk.y);

    // Bóng đổ sàn của thủ môn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (gk.pose === 'dive') {
      // Góc xoay bay người
      const rotAngle = (gk.diveDir * Math.PI) / 4.8;
      ctx.rotate(rotAngle);

      // Thân thủ môn nằm ngang
      ctx.fillStyle = '#eab308'; // Áo vàng neon
      ctx.fillRect(-14, -8, 28, 14);

      // Quần thủ môn
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-14, 4, 28, 6);

      // Đầu thủ môn
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(gk.diveDir * 6, -15, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Găng tay đỏ dang hết cỡ đón bóng
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(gk.diveDir * 22, -10, 5.5, 0, Math.PI * 2);
      ctx.arc(gk.diveDir * 20, 2, 5.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Thủ môn nhấp nhổm trên vạch vôi
      const bob = Math.sin(this.animTime * 5) * 1.5;

      // 2 Chân chùng gối
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-9, 4, 6, 10);
      ctx.fillRect(3, 4, 6, 10);

      // Áo thủ môn neon
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-11, -10 + bob, 22, 15);

      // Cổ áo
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -11 + bob, 10, 2);

      // Đầu thủ môn
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -18 + bob, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Tóc
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -20 + bob, 8.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // 2 Găng tay đỏ giơ rộng
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-16, -4 + bob, 5.5, 0, Math.PI * 2);
      ctx.arc(16, -4 + bob, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderDefensiveWall(ctx) {
    const wallBaseX = 320;
    const wallY = 220 - this.wallJumpY;

    // 3 Cầu thủ hàng rào áo tím xanh
    const offsets = [-20, 0, 20];
    offsets.forEach(offX => {
      ctx.save();
      ctx.translate(wallBaseX + offX, wallY);

      // Bóng đổ
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 16 + this.wallJumpY, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Chân
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-5, 6, 4, 10);
      ctx.fillRect(1, 6, 4, 10);

      // Quần
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-7, 2, 14, 6);

      // Áo tím xanh
      ctx.fillStyle = '#4338ca';
      ctx.fillRect(-8, -12, 16, 15);

      // Đầu
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -19, 8, 0, Math.PI * 2);
      ctx.fill();

      // Tóc
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -21, 8, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // 2 Tay giữ che trước bụng
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderPlayerGloves(ctx) {
    // Đôi găng tay thủ môn do người chơi điều khiển
    ctx.save();
    ctx.translate(this.gkPlayerPos.x, this.gkPlayerPos.y);

    // Găng tay trái
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-18, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Găng tay phải
    ctx.beginPath();
    ctx.arc(18, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lòng bàn tay màu trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-18, 0, 5, 0, Math.PI * 2);
    ctx.arc(18, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderFootball3D(ctx) {
    const b = this.ball;
    ctx.save();

    // Bóng đổ trên mặt cỏ (co giãn theo độ cao Z)
    const groundShadowY = b.startY + (b.targetY - b.startY) * b.progress;
    const shadowScale = Math.max(0.3, 1 - (b.z || 0) * 0.6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(b.x, groundShadowY + 6, b.radius * shadowScale * 1.3, b.radius * shadowScale * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tỉ lệ thu nhỏ bóng khi bay vào sâu khung thành
    const ballScale = 1 - (b.z || 0) * 0.32;
    ctx.translate(b.x, b.y);
    ctx.scale(ballScale, ballScale);
    ctx.rotate(b.rotation || 0);

    // Thân bóng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Họa tiết ngũ giác FIFA Telstar màu đen
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // 3 đốm đen phụ xung quanh
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const px = Math.cos(ang) * (b.radius * 0.72);
      const py = Math.sin(ang) * (b.radius * 0.72);
      ctx.beginPath();
      ctx.arc(px, py, b.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderAimGuide(ctx, p) {
    const cx = this.crosshair.x;
    const cy = this.crosshair.y;

    ctx.save();

    // 1. Đường chấm Parabol dẫn hướng
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(p.penaltySpotX, p.penaltySpotY - 8);

    // Điểm uốn cong nếu có spin xoáy
    const midX = (p.penaltySpotX + cx) / 2 + this.spinCurl * 45;
    const midY = (p.penaltySpotY + cy) / 2 - 35;
    ctx.quadraticCurveTo(midX, midY, cx, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Vòng tròn hồng tâm đích đến
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Dấu thập tâm nhắm
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx + 14, cy);
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx, cy + 14);
    ctx.stroke();

    // Mũi tên chỉ hướng xoáy (nếu có độ xoáy quả chuối)
    if (Math.abs(this.spinCurl) > 0.2) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 11px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      const arrow = this.spinCurl > 0 ? '⤸ Xoáy Phải' : '⤹ Xoáy Trái';
      ctx.fillText(arrow, midX, midY - 10);
    }

    ctx.restore();
  }

  renderStadiumFloodlights(ctx, w, h) {
    ctx.save();
    // Đèn cao áp bên trái
    const fl1 = ctx.createRadialGradient(90, 0, 10, 90, 0, 320);
    fl1.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
    fl1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fl1;
    ctx.fillRect(0, 0, w, h);

    // Đèn cao áp bên phải
    const fl2 = ctx.createRadialGradient(550, 0, 10, 550, 0, 320);
    fl2.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
    fl2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fl2;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  renderHUD(ctx) {
    ctx.save();

    // 1. Badge Vai trò & Chuỗi bàn thắng
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 15px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Vai Trò: ${this.role === 'striker' ? 'TIỀN ĐẠO SÚT BÓNG' : 'THỦ MÔN BẮT BÓNG'}`, 20, 26);
    ctx.fillText(`Chuỗi Ghi Bàn: ${this.streak} 🔥`, 20, 46);

    // 2. Thanh nạp lực (Power Meter) khi người chơi dùng phím nạp lực
    if (this.role === 'striker' && this.state === 'power_charging') {
      const barW = 180;
      const barH = 14;
      const barX = 320 - barW / 2;
      const barY = 285;

      // Nền thanh lực
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

      // Gradient màu lực: Xanh lá -> Vàng Sweet Spot -> Đỏ Vọt xà
      const fillW = barW * this.power;
      const powerGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      powerGrad.addColorStop(0, '#22c55e');
      powerGrad.addColorStop(0.70, '#eab308');
      powerGrad.addColorStop(0.92, '#f97316');
      powerGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = powerGrad;
      ctx.fillRect(barX, barY, fillW, barH);

      // Vạch Sweet Spot
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX + barW * 0.82, barY);
      ctx.lineTo(barX + barW * 0.82, barY + barH);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SWEET SPOT (85%)', barX + barW * 0.82, barY - 5);
    }

    // 3. Thông báo hướng dẫn dưới chân màn hình
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 13px "Be Vietnam Pro", sans-serif';

    if (this.role === 'striker') {
      if (this.state === 'aiming') {
        ctx.fillText('Kéo vuốt bóng để SÚT XOÁY QUẢ CHUỐI hoặc bấm Space để nạp lực!', 320, 345);
      } else if (this.state === 'power_charging') {
        ctx.fillText('Bấm Space / Enter lần nữa tại vạch vàng để sút!', 320, 345);
      } else {
        ctx.fillText('Bấm nút Hành Động hoặc Click để chuyển sang Lượt Thủ Môn', 320, 345);
      }
    } else {
      if (this.state === 'gk_wait' || this.state === 'gk_in_flight') {
        ctx.fillText('Di chuyển chuột / ngón tay để ĐEO GĂNG ĐÓN BÓNG CỨU THUA!', 320, 345);
      } else {
        ctx.fillText('Bấm nút Hành Động hoặc Click để trở lại Lượt Tiền Đạo', 320, 345);
      }
    }

    ctx.restore();
  }
}
