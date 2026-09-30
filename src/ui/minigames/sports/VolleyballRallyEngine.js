/**
 * DEVER TOWN - THE SPIKE: VOLLEYBALL RALLY 3.0
 * Kế thừa tinh hoa từ "The Spike - Volleyball Story" & Notion Superpowers:
 * 1. Cơ chế đập bóng đỉnh cao: Sweet Spot Timing Ring, Perfect Boom Spike ⚡, Good Spike, Tip Shot.
 * 2. Cứu bóng trượt sàn (Slide / Diving Dig 🛡️) cứu nguy hiểm hóc.
 * 3. Game Feel chuẩn mực: Apex Hang (lơ lửng trên không), Hit-Stop (40ms impact freeze), White Flash & Screen Shake.
 * 4. Đồ họa Chibi Vận Động Viên FPTU với cử động lấy đà (crouch), ưỡn lưng (arch-back), quất tay (spike) và trượt sàn.
 * 5. Sân đấu sàn gỗ Maple bóng loáng có vạch 3m, ăng-ten lưới và bóng phản chiếu.
 * 6. Bot AI 3.0 phán đoán điểm rơi Parabol và bật nhảy chắn bóng (Block).
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
    this.keys = { left: false, right: false, up: false, down: false, space: false };

    // The Spike Visual & Feel Timers
    this.hitStopTimer = 0;
    this.whiteFlashAlpha = 0;
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    this.slideTimer = 0;
    this.slideCooldownTimer = 0;
    this.isSliding = false;
    this.slideDir = 1;

    this.animTime = 0;
    this.ballTrails = [];
    this.ballRotation = 0;
    this.sweetSpotActive = false;
    this.sweetSpotScale = 1.0;

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
      touches: 0,
      pose: 'idle', // 'idle' | 'run' | 'crouch' | 'jump_arch' | 'spike_swing' | 'slide'
      spikeCooldown: 0
    };

    this.bot = {
      x: 520,
      y: cfg.floorY,
      vx: 0,
      vy: 0,
      isGrounded: true,
      touches: 0,
      pose: 'idle',
      jumpTargetX: 520,
      spikeCooldown: 0,
      slideTimer: 0,
      slideCooldown: 0,
      slideDir: -1
    };

    this.ball = {
      x: servingSide === 'player' ? 135 : 505,
      y: cfg.floorY - 38,
      vx: 0,
      vy: 0,
      radius: cfg.ball.radius,
      isSpiked: false,
      isBoomSpike: false
    };

    this.lastTouch = servingSide; // 'player' | 'bot'
    this.botServeTimer = 0.85;
    this.ballTrails = [];
    this.hitStopTimer = 0;
    this.whiteFlashAlpha = 0;
    this.isSliding = false;
    this.sweetSpotActive = false;
  }

  onActionTrigger() {
    const cfg = VOLLEYBALL_CONFIG;
    const spikeCfg = cfg.theSpike;

    if (this.state === 'serving_player') {
      // Phát bóng bổng đầy uy lực
      this.state = 'rally';
      this.lastTouch = 'player';
      this.ball.vx = cfg.serve.playerVx;
      this.ball.vy = cfg.serve.playerVy;
      this.player.vy = cfg.serve.playerJumpVy;
      this.player.isGrounded = false;
      this.player.pose = 'jump_arch';
      audioManager.playKick(1.0);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#38bdf8');
      return;
    }

    if (this.state === 'scored') {
      this.resetServe(this.servingSide);
      return;
    }

    if (this.state !== 'rally') return;

    // 1. Nếu đang ở trên mặt sàn (Grounded hoặc còn Coyote Time)
    if (this.player.isGrounded || this.coyoteTimer > 0) {
      // Kiểm tra tình huống cứu bóng trượt sàn (Slide / Diving Dig):
      // Khi bóng bay thấp về phía sau hoặc người chơi đang di chuyển sát bóng
      const dxBall = this.ball.x - this.player.x;
      const isBallDroppingLow = this.ball.y > 210 && this.ball.x < cfg.net.x - 20;

      if (isBallDroppingLow && Math.abs(dxBall) > 35 && Math.abs(dxBall) < 130 && this.slideCooldownTimer <= 0) {
        this.triggerSlide(dxBall > 0 ? 1 : -1);
        return;
      }

      // Nhảy thông thường
      this.player.vy = cfg.player.jumpPower;
      this.player.isGrounded = false;
      this.coyoteTimer = 0;
      this.player.pose = 'crouch';
      setTimeout(() => {
        if (!this.player.isGrounded && this.player.pose === 'crouch') {
          this.player.pose = 'jump_arch';
        }
      }, 70);
      audioManager.playKick(0.75);
      return;
    }

    // 2. Nếu đang ở trên không trung: Thực hiện cú ĐẬP BÓNG (The Spike Smash)
    if (!this.player.isGrounded) {
      const dx = this.ball.x - this.player.x;
      const dy = this.ball.y - (this.player.y - 28);
      const dist = Math.hypot(dx, dy);

      // Phạm vi sweet spot của The Spike
      if (dist < spikeCfg.sweetSpotRadius && this.ball.y < this.player.y + 10) {
        this.executeTheSpike(dx, dy, dist);
      } else {
        // Ghi nhận jump buffer để vừa chạm đất là bật nhảy tiếp
        this.jumpBufferTimer = spikeCfg.jumpBufferTime;
      }
    }
  }

  triggerSlide(direction = 1) {
    const spikeCfg = VOLLEYBALL_CONFIG.theSpike;
    this.isSliding = true;
    this.slideDir = direction;
    this.slideTimer = spikeCfg.slideDuration;
    this.slideCooldownTimer = spikeCfg.slideCooldown;
    this.player.pose = 'slide';
    audioManager.playKick(0.5);
    this.juiceFX.spawnSparkles(this.player.x, this.player.y, 6, '#ffffff');
  }

  executeTheSpike(dx, dy, dist) {
    const cfg = VOLLEYBALL_CONFIG;
    const spikeCfg = cfg.theSpike;
    this.player.pose = 'spike_swing';
    this.player.spikeCooldown = 0.25;
    this.lastTouch = 'player';

    // Đánh giá nhịp đập: Perfect Boom Spike vs Good Spike vs Tip
    // Đập chuẩn khi cầu thủ ở quanh đỉnh nhảy (|vy| thấp) và bóng ở phía trước trên đầu (dx: 8..35, dy: -35..-10)
    const isApexStrike = Math.abs(this.player.vy) < spikeCfg.apexThreshold;
    const isOptimalZone = dx >= 5 && dx <= 38 && dy <= -8 && dy >= -36;

    // Tính toán quỹ đạo vật lý đảm bảo bóng luôn vượt qua trên mép lưới an toàn
    const netX = cfg.net.x; // 320
    const netTopY = cfg.net.y; // 185
    const distToNet = Math.max(16, netX - this.ball.x);
    const g = cfg.gravity;

    if (isApexStrike && isOptimalZone) {
      // ⚡ 1. PERFECT BOOM SPIKE (Cực phẩm Haikyuu / The Spike)
      const vx = spikeCfg.boomSpikeSpeed.vx || 12.8;
      const tNet = distToNet / vx;
      const targetNetY = netTopY - 28; // Luôn cao hơn đỉnh lưới ít nhất 28px
      const reqVy = (targetNetY - this.ball.y - 0.5 * g * tNet * tNet) / tNet;

      this.ball.vx = vx;
      this.ball.vy = Math.min(-1.5, reqVy);
      this.ball.isSpiked = true;
      this.ball.isBoomSpike = true;

      // Hit-stop đóng băng khung hình & chớp sáng
      this.hitStopTimer = spikeCfg.hitStopDuration;
      this.whiteFlashAlpha = 0.75;

      audioManager.playSpikeSmash();
      this.juiceFX.shake(9, 0.25);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 22, '#ef4444');
      this.juiceFX.spawnFloatingText('⚡ BOOM SPIKE!', this.ball.x, this.ball.y - 25, {
        color: '#ef4444',
        size: 22,
        fontWeight: '900'
      });
    } else if (dist < 45) {
      // 💥 2. GOOD POWER SPIKE
      const vx = spikeCfg.goodSpikeSpeed.vx || 10.4;
      const tNet = distToNet / vx;
      const targetNetY = netTopY - 32; // Luôn cao hơn đỉnh lưới 32px
      const reqVy = (targetNetY - this.ball.y - 0.5 * g * tNet * tNet) / tNet;

      this.ball.vx = vx;
      this.ball.vy = Math.min(-2.0, reqVy);
      this.ball.isSpiked = true;
      this.ball.isBoomSpike = false;

      this.hitStopTimer = 0.02;
      audioManager.playSpikeSmash();
      this.juiceFX.shake(5, 0.15);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 14, '#f59e0b');
      this.juiceFX.spawnFloatingText('POWER SPIKE!', this.ball.x, this.ball.y - 20, {
        color: '#f59e0b',
        size: 18,
        fontWeight: '800'
      });
    } else {
      // 🪶 3. FEINT / TIP SHOT (Bỏ nhỏ tinh tế qua đầu chắn)
      const vx = spikeCfg.tipSpikeSpeed.vx || 5.8;
      const tNet = distToNet / vx;
      const targetNetY = netTopY - 24; // Cao hơn đỉnh lưới 24px
      const reqVy = (targetNetY - this.ball.y - 0.5 * g * tNet * tNet) / tNet;

      this.ball.vx = vx;
      this.ball.vy = Math.min(-3.0, reqVy);
      this.ball.isSpiked = false;
      this.ball.isBoomSpike = false;

      audioManager.playKick(0.9);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#38bdf8');
      this.juiceFX.spawnFloatingText('FEINT TIP', this.ball.x, this.ball.y - 15, {
        color: '#38bdf8',
        size: 14,
        fontWeight: '700'
      });
    }
  }

  computeBotReturnVx(targetX, vy) {
    const cfg = VOLLEYBALL_CONFIG;
    const g = cfg.gravity;
    const h = Math.max(10, cfg.floorY - this.ball.y);
    const disc = vy * vy + 2 * g * h;
    const tFlight = disc >= 0 ? (-vy + Math.sqrt(disc)) / g : 35;
    const reqVx = (targetX - this.ball.x) / Math.max(12, tFlight);
    // Giới hạn an toàn để không bắn vọt ra ngoài màn hình và luôn rơi trúng phần sân chơi
    return Math.max(-8.5, Math.min(-3.2, reqVx));
  }

  update(dt) {
    const cfg = VOLLEYBALL_CONFIG;
    const spikeCfg = cfg.theSpike;
    this.animTime += dt;

    // 1. Xử lý Hit-stop (Impact Freeze)
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      if (this.whiteFlashAlpha > 0) {
        this.whiteFlashAlpha = Math.max(0, this.whiteFlashAlpha - dt * 4.5);
      }
      return; // Đóng băng logic vật lý trong khoảnh khắc va chạm
    }

    if (this.whiteFlashAlpha > 0) {
      this.whiteFlashAlpha = Math.max(0, this.whiteFlashAlpha - dt * 4.5);
    }

    // 2. Cập nhật Cooldowns & Timers
    if (this.slideCooldownTimer > 0) this.slideCooldownTimer -= dt;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.player.spikeCooldown > 0) this.player.spikeCooldown -= dt;
    if (this.bot.spikeCooldown > 0) this.bot.spikeCooldown -= dt;
    if (this.bot.slideCooldown > 0) this.bot.slideCooldown -= dt;

    // 3. Trạng thái giao bóng
    if (this.state === 'serving_player') {
      if (this.keys.left && this.player.x > 35) this.player.x -= cfg.player.moveSpeed;
      if (this.keys.right && this.player.x < cfg.net.x - 30) this.player.x += cfg.player.moveSpeed;
      this.ball.x = this.player.x + 14;
      this.ball.y = this.player.y - 38;
      this.player.pose = 'idle';
      return;
    }

    if (this.state === 'serving_bot') {
      this.botServeTimer -= dt;
      if (this.botServeTimer <= 0) {
        this.state = 'rally';
        this.lastTouch = 'bot';
        const targetX = 145 + Math.random() * 65;
        this.ball.vy = cfg.serve.botVy;
        this.ball.vx = this.computeBotReturnVx(targetX, this.ball.vy);
        this.bot.vy = cfg.serve.botJumpVy;
        this.bot.isGrounded = false;
        this.bot.pose = 'jump_arch';
        audioManager.playKick(1.0);
        this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#f59e0b');
      }
      return;
    }

    if (this.state === 'scored') return;

    // 4. Di chuyển người chơi & Xử lý Trượt sàn (Slide)
    if (this.isSliding) {
      this.slideTimer -= dt;
      this.player.x += this.slideDir * spikeCfg.slideSpeed;
      this.player.x = Math.max(18, Math.min(cfg.net.x - 28, this.player.x));
      this.player.pose = 'slide';

      // Tạo bụi trượt sàn
      if (Math.random() < 0.4) {
        this.juiceFX.spawnSparkles(this.player.x - this.slideDir * 12, cfg.floorY, 2, '#fde68a');
      }

      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.player.pose = 'idle';
      }
    } else {
      let isMoving = false;
      if (this.keys.left && this.player.x > 32) {
        this.player.x -= cfg.player.moveSpeed;
        isMoving = true;
      }
      if (this.keys.right && this.player.x < cfg.net.x - 30) {
        this.player.x += cfg.player.moveSpeed;
        isMoving = true;
      }

      // Cập nhật Pose đi đứng
      if (this.player.isGrounded) {
        this.player.pose = isMoving ? 'run' : 'idle';
      }
    }

    // 5. Trọng lực người chơi & Cơ chế Apex Hang
    let currentGravity = cfg.gravity;
    if (!this.player.isGrounded && Math.abs(this.player.vy) < spikeCfg.apexThreshold) {
      currentGravity *= spikeCfg.apexGravityMultiplier; // Giảm 50% trọng lực tại đỉnh nhảy (Apex Hang)
      if (this.player.spikeCooldown <= 0) {
        this.player.pose = 'jump_arch';
      }
    }

    this.player.vy += currentGravity;
    this.player.y += this.player.vy;

    if (this.player.y >= cfg.floorY) {
      this.player.y = cfg.floorY;
      this.player.vy = 0;
      const wasAirborne = !this.player.isGrounded;
      this.player.isGrounded = true;

      // Xử lý Jump Buffer: nếu người chơi đã bấm nhảy trước đó thì nhảy tiếp ngay
      if (this.jumpBufferTimer > 0) {
        this.player.vy = cfg.player.jumpPower;
        this.player.isGrounded = false;
        this.jumpBufferTimer = 0;
        audioManager.playKick(0.75);
      } else if (wasAirborne && !this.isSliding) {
        this.player.pose = 'idle';
      }
    } else {
      if (this.player.vy > 1.5 && this.player.spikeCooldown <= 0) {
        this.player.pose = 'fall';
      }
    }

    // 6. Bot AI 3.0: Phán đoán điểm rơi Parabol & Chắn bóng (Block)
    this.updateBotAI(dt, cfg);

    // 7. Vật lý quả bóng & Vệt bóng (Ball Trails)
    this.ball.vy += cfg.gravity;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    this.ballRotation += this.ball.vx * 0.08;

    // Cơ chế The Spike Dive: Khi đập bóng đã vượt qua đỉnh lưới sang sân đối phương, bóng cắm dốc xuống sàn
    if (this.ball.x > cfg.net.x + 4 && this.ball.x < cfg.net.x + 80) {
      if (this.ball.isBoomSpike) {
        this.ball.vy = Math.max(this.ball.vy, 6.2);
      } else if (this.ball.isSpiked) {
        this.ball.vy = Math.max(this.ball.vy, 4.2);
      }
    }

    // Giới hạn biên màn hình tránh bóng bay khỏi tầm mắt người chơi
    if (this.ball.x < 18) {
      this.ball.x = 18;
      if (this.ball.vx < 0) this.ball.vx = -this.ball.vx * 0.4;
    } else if (this.ball.x > 622) {
      this.ball.x = 622;
      if (this.ball.vx > 0) this.ball.vx = -this.ball.vx * 0.4;
    }

    // Lưu vệt bóng sau (After-image)
    if (this.ball.isSpiked || Math.hypot(this.ball.vx, this.ball.vy) > 8.0) {
      this.ballTrails.unshift({
        x: this.ball.x,
        y: this.ball.y,
        alpha: 0.75,
        isBoom: this.ball.isBoomSpike
      });
      if (this.ballTrails.length > 7) this.ballTrails.pop();
    } else if (this.ballTrails.length > 0) {
      this.ballTrails.pop();
    }

    // 8. Căn chỉnh Sweet Spot Marker khi bóng ở trên không phía người chơi
    if (
      this.ball.x < cfg.net.x &&
      this.ball.y < cfg.floorY - 70 &&
      !this.player.isGrounded &&
      this.ball.y < this.player.y + 15
    ) {
      this.sweetSpotActive = true;
      const dist = Math.hypot(this.ball.x - this.player.x, this.ball.y - (this.player.y - 28));
      this.sweetSpotScale = Math.max(0.4, Math.min(1.4, dist / 45));
    } else {
      this.sweetSpotActive = false;
    }

    // 9. Va chạm Cứu bóng khi Trượt sàn (Diving Dig Collision)
    if (this.isSliding && this.ball.y >= cfg.floorY - 26 && this.ball.y <= cfg.floorY + 5) {
      const dxSlide = this.ball.x - this.player.x;
      if (Math.abs(dxSlide) < 32 && this.ball.vy > 0) {
        this.lastTouch = 'player';
        this.ball.vx = 4.2;
        this.ball.vy = -10.6; // Nảy bổng hình cầu vồng cứu thua
        this.ball.isSpiked = false;
        this.ball.isBoomSpike = false;
        this.rallyCount++;
        audioManager.playKick(1.2);
        this.juiceFX.shake(4, 0.12);
        this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 12, '#38bdf8');
        this.juiceFX.spawnFloatingText('DIVING DIG! 🛡️', this.ball.x, this.ball.y - 20, {
          color: '#38bdf8',
          size: 16,
          fontWeight: '800'
        });
      }
    }

    // 10. Va chạm đầu & thân người chơi (Arc-Head Bounce)
    const headX = this.player.x;
    const headY = this.player.y - 26;
    const distP = Math.hypot(this.ball.x - headX, this.ball.y - headY);
    if (!this.isSliding && distP < this.ball.radius + cfg.player.headRadius && this.ball.vy > 0) {
      this.lastTouch = 'player';
      const angle = Math.atan2(this.ball.y - headY, this.ball.x - headX);
      const jumpBoost = !this.player.isGrounded ? 2.4 : 0;
      this.ball.vx = Math.cos(angle) * (7.8 + jumpBoost);
      this.ball.vy = -Math.abs(Math.sin(angle) * 8.8) - 2.4 - jumpBoost;
      this.ball.isSpiked = false;
      this.ball.isBoomSpike = false;
      this.rallyCount++;
      audioManager.playKick(1.1);
      this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#38bdf8');
      this.juiceFX.spawnFloatingText('+1 Tâng Bóng', this.ball.x, this.ball.y - 15, {
        color: '#38bdf8',
        size: 13,
        fontWeight: '700'
      });
    }

    // 11. Va chạm bóng với Bot AI (Spike, Bump/Receive, Diving Dig, Net Block)
    if (this.ball.x >= cfg.net.x - 10) {
      let botHit = false;

      // A. Bot Chắn bóng trên lưới (Net Block)
      if (
        !this.bot.isGrounded &&
        this.bot.x <= cfg.net.x + 65 &&
        this.ball.x <= cfg.net.x + 35 &&
        this.ball.y <= cfg.net.y + 25 &&
        Math.hypot(this.ball.x - this.bot.x, this.ball.y - (this.bot.y - 28)) < 38
      ) {
        this.lastTouch = 'bot';
        this.ball.vx = -(3.8 + Math.random() * 1.8);
        this.ball.vy = 2.4 + Math.random() * 2.0;
        this.ball.isSpiked = false;
        this.ball.isBoomSpike = false;
        this.rallyCount++;
        audioManager.playKick(1.25);
        this.juiceFX.shake(6, 0.16);
        this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 10, '#ef4444');
        this.juiceFX.spawnFloatingText('BLOCKED! 🚫', cfg.net.x, cfg.net.y - 20, {
          color: '#ef4444',
          size: 16,
          fontWeight: '900'
        });
        botHit = true;
      }

      // B. Bot Đập bóng trên không (Airborne Spike Smash)
      if (!botHit && !this.bot.isGrounded && this.bot.vy < 3.2 && this.bot.spikeCooldown <= 0) {
        const dxSpike = this.ball.x - this.bot.x;
        const dySpike = this.ball.y - (this.bot.y - 28);
        const distSpike = Math.hypot(dxSpike, dySpike);

        if (distSpike < 46) {
          this.lastTouch = 'bot';
          this.bot.pose = 'spike_swing';
          this.bot.spikeCooldown = 0.45;

          const isHardSpike = Math.random() < 0.65;
          if (isHardSpike) {
            // Đập bóng cắm chéo sân người chơi (targetX từ 130 đến 210)
            const targetX = 130 + Math.random() * 80;
            this.ball.vy = 3.6 + Math.random() * 2.2;
            this.ball.vx = this.computeBotReturnVx(targetX, this.ball.vy);
            this.ball.isSpiked = true;
            this.ball.isBoomSpike = false;
            this.juiceFX.shake(6, 0.18);
            this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 12, '#f59e0b');
            this.juiceFX.spawnFloatingText('BOT SPIKE! ⚡', this.bot.x, this.bot.y - 35, {
              color: '#f59e0b',
              size: 15,
              fontWeight: '800'
            });
          } else {
            // Đập bổng sâu về cuối sân người chơi (targetX từ 85 đến 145)
            const targetX = 85 + Math.random() * 60;
            this.ball.vy = -5.8;
            this.ball.vx = this.computeBotReturnVx(targetX, this.ball.vy);
            this.ball.isSpiked = true;
            this.ball.isBoomSpike = false;
            this.juiceFX.shake(4, 0.12);
            this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#f59e0b');
          }

          this.rallyCount++;
          audioManager.playKick(1.2);
          this.hitStopTimer = 0.035;
          botHit = true;
        }
      }

      // C. Bot Trượt sàn Cứu bóng (Diving Dig)
      if (!botHit && this.bot.pose === 'slide' && this.ball.y >= cfg.floorY - 30 && this.ball.y <= cfg.floorY + 5) {
        const dxSlide = Math.abs(this.ball.x - this.bot.x);
        if (dxSlide < 45 && this.ball.vy > 0) {
          this.lastTouch = 'bot';
          const targetX = 135 + Math.random() * 75; // [135, 210]
          this.ball.vy = -9.8;
          this.ball.vx = this.computeBotReturnVx(targetX, this.ball.vy);
          this.ball.isSpiked = false;
          this.ball.isBoomSpike = false;
          this.rallyCount++;
          audioManager.playKick(1.1);
          this.juiceFX.shake(4, 0.12);
          this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 10, '#38bdf8');
          this.juiceFX.spawnFloatingText('BOT DIVING DIG! 🛡️', this.bot.x, this.bot.y - 25, {
            color: '#38bdf8',
            size: 14,
            fontWeight: '800'
          });
          botHit = true;
        }
      }

      // D. Bot Đỡ bước 1 / Tâng bóng (Standing Bump / Receive)
      if (!botHit && this.bot.pose !== 'slide') {
        const dxBump = Math.abs(this.ball.x - this.bot.x);
        const dyBump = this.ball.y - (this.bot.y - 24);
        if (
          dxBump < 36 &&
          dyBump >= -38 && dyBump <= 28 &&
          this.ball.vy > 0
        ) {
          this.lastTouch = 'bot';
          const targetX = 150 + Math.random() * 65; // [150, 215]
          this.ball.vy = -(8.6 + Math.random() * 1.4);
          this.ball.vx = this.computeBotReturnVx(targetX, this.ball.vy);
          this.ball.isSpiked = false;
          this.ball.isBoomSpike = false;
          this.rallyCount++;
          audioManager.playKick(0.95);
          this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#f59e0b');
          this.juiceFX.spawnFloatingText('+1 Bot Đỡ Bóng', this.bot.x, this.bot.y - 25, {
            color: '#f59e0b',
            size: 13,
            fontWeight: '700'
          });
          botHit = true;
        }
      }
    }

    // 12. Va chạm lưới giữa sân
    const net = cfg.net;
    const netLeft = net.x - net.width / 2;
    const netRight = net.x + net.width / 2;
    if (
      this.ball.x + this.ball.radius >= netLeft &&
      this.ball.x - this.ball.radius <= netRight &&
      this.ball.y >= net.y
    ) {
      // Nếu chạm vào mép trên cùng của lưới (băng viền trắng top 14px): Lăn qua lưới (Tape Roll / Net In)
      if (this.ball.y <= net.y + 14) {
        audioManager.playKick(0.5);
        this.juiceFX.shake(2, 0.08);
        this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 8, '#ffffff');
        this.juiceFX.spawnFloatingText('NET ROLL! 🏐', net.x, net.y - 25, {
          color: '#fbbf24',
          size: 14,
          fontWeight: '800'
        });
        if (this.ball.vx > 0) {
          this.ball.x = netRight + this.ball.radius + 2;
          this.ball.vx = Math.max(3.6, this.ball.vx * 0.7);
          this.ball.vy = 2.4;
        } else {
          this.ball.x = netLeft - this.ball.radius - 2;
          this.ball.vx = -Math.max(3.6, Math.abs(this.ball.vx) * 0.7);
          this.ball.vy = 2.4;
        }
      } else {
        if (this.ball.x < net.x) {
          this.ball.x = netLeft - this.ball.radius - 3;
          this.ball.vx = -Math.abs(this.ball.vx) * cfg.netBounce.restitutionX - cfg.netBounce.extraVx;
        } else {
          this.ball.x = netRight + this.ball.radius + 3;
          this.ball.vx = Math.abs(this.ball.vx) * cfg.netBounce.restitutionX + cfg.netBounce.extraVx;
        }
        this.ball.vy = -Math.abs(this.ball.vy) * cfg.netBounce.restitutionY - cfg.netBounce.extraVy;
        audioManager.playKick(0.6);
        this.juiceFX.shake(3, 0.1);
        this.juiceFX.spawnSparkles(this.ball.x, this.ball.y, 6, '#ffffff');
      }
    }

    // 13. Bóng chạm sàn
    if (this.ball.y >= cfg.floorY) {
      this.resolvePoint();
    }
  }

  updateBotAI(dt, cfg) {
    const spikeCfg = cfg.theSpike;
    const net = cfg.net;
    const floorY = cfg.floorY;

    // 1. Phán đoán quỹ đạo và điểm rơi của bóng bằng công thức vật lý chính xác
    let predictedLandingX = this.bot.x;
    const isBallHeadingToBot = this.ball.vx > 0.3 || this.ball.x > net.x - 30;

    if (this.ball.y < floorY) {
      const g = cfg.gravity;
      const h = floorY - this.ball.y;
      const disc = this.ball.vy * this.ball.vy + 2 * g * h;
      if (disc >= 0) {
        const timeToFloor = (-this.ball.vy + Math.sqrt(disc)) / g;
        predictedLandingX = this.ball.x + this.ball.vx * timeToFloor;
      }
    }

    // Giới hạn điểm rơi an toàn trong nửa sân Bot [net.x + 35, 600]
    const targetX = Math.max(net.x + 35, Math.min(predictedLandingX, 600));

    // Cập nhật trạng thái trượt sàn của Bot nếu đang trượt
    if (this.bot.slideTimer > 0) {
      this.bot.slideTimer -= dt;
      this.bot.x += this.bot.slideDir * (spikeCfg.slideSpeed * 0.95);
      this.bot.x = Math.max(net.x + 30, Math.min(605, this.bot.x));
      this.bot.pose = 'slide';
      if (Math.random() < 0.3) {
        this.juiceFX.spawnSparkles(this.bot.x, floorY, 2, '#fde68a');
      }
      if (this.bot.slideTimer <= 0) {
        this.bot.pose = 'idle';
      }
    } else if (isBallHeadingToBot && this.ball.x > net.x - 40) {
      // BÓNG ĐANG Ở PHẦN SÂN BOT HOẶC BAY SANG SÂN BOT
      const dxToTarget = targetX - this.bot.x;
      const distToTarget = Math.abs(dxToTarget);

      // A. KIỂM TRA ĐIỀU KIỆN TRƯỢT SÀN CỨU BÓNG (Bot Slide / Diving Dig)
      // Khi bóng sắp chạm đất (y > 225) mà bot còn cách điểm rơi 30px - 95px
      if (
        this.bot.isGrounded &&
        this.ball.y > 225 &&
        distToTarget > 32 &&
        distToTarget < 95 &&
        this.bot.slideCooldown <= 0
      ) {
        this.bot.slideTimer = spikeCfg.slideDuration;
        this.bot.slideCooldown = 1.2;
        this.bot.slideDir = dxToTarget > 0 ? 1 : -1;
        this.bot.pose = 'slide';
        audioManager.playKick(0.8);
      } else {
        // B. DI CHUYỂN BÌNH THƯỜNG / CHẠY VỀ ĐIỂM ĐÓN BÓNG
        const botSpeed = distToTarget > 50 ? 4.8 : 3.8;
        if (dxToTarget > 6) {
          this.bot.x += botSpeed;
          if (this.bot.isGrounded) this.bot.pose = 'run';
        } else if (dxToTarget < -6) {
          this.bot.x -= botSpeed;
          if (this.bot.isGrounded) this.bot.pose = 'run';
        } else if (this.bot.isGrounded && this.bot.pose !== 'spike_swing') {
          this.bot.pose = 'idle';
        }

        // C. QUYẾT ĐỊNH BẬT NHẢY ĐẬP BÓNG (Bot Spike Smash)
        // Khi bóng ở độ cao thích hợp (y trong khoảng 140 - 200) và bot gần bóng
        const isSweetHeight = this.ball.y >= 140 && this.ball.y <= 200;
        const isNearBallX = Math.abs(this.ball.x - this.bot.x) < 42;
        if (
          this.bot.isGrounded &&
          isSweetHeight &&
          isNearBallX &&
          this.bot.spikeCooldown <= 0
        ) {
          this.bot.vy = -8.8;
          this.bot.isGrounded = false;
          this.bot.pose = 'jump_arch';
          audioManager.playKick(0.7);
        }
      }
    } else {
      // BÓNG ĐANG Ở SÂN NGƯỜI CHƠI
      const isPlayerSpiking = this.ball.isSpiked || this.ball.isBoomSpike;
      if (isPlayerSpiking && this.ball.x > net.x - 70 && this.bot.isGrounded) {
        // Bám lưới nhảy chắn bóng (Net Block)
        const blockX = net.x + 38;
        if (this.bot.x > blockX + 6) this.bot.x -= 3.6;
        else if (this.bot.x < blockX - 6) this.bot.x += 3.6;
        else {
          this.bot.vy = -8.2;
          this.bot.isGrounded = false;
          this.bot.pose = 'jump_arch';
        }
      } else {
        // Trở về vị trí phòng ngự trung tâm sân (homeX = 490)
        const homeX = 490;
        if (this.bot.x < homeX - 6) {
          this.bot.x += 2.4;
          if (this.bot.isGrounded) this.bot.pose = 'run';
        } else if (this.bot.x > homeX + 6) {
          this.bot.x -= 2.4;
          if (this.bot.isGrounded) this.bot.pose = 'run';
        } else if (this.bot.isGrounded && this.bot.pose !== 'spike_swing') {
          this.bot.pose = 'idle';
        }
      }
    }

    // 2. Trọng lực và hạ cánh của Bot
    this.bot.vy += cfg.gravity;
    this.bot.y += this.bot.vy;
    if (this.bot.y >= floorY) {
      this.bot.y = floorY;
      this.bot.vy = 0;
      this.bot.isGrounded = true;
      if (this.bot.pose === 'jump_arch' || this.bot.pose === 'spike_swing') {
        this.bot.pose = 'idle';
      }
    }
  }

  resolvePoint() {
    this.state = 'scored';
    const cfg = VOLLEYBALL_CONFIG;

    // Sân thi đấu chuẩn trong vạch: x từ 48 đến 592
    const isOutOfBounds = this.ball.x < 48 || this.ball.x > 592;

    let playerWonPoint = false;
    let pointReason = '';

    if (isOutOfBounds) {
      // BÓNG NGOÀI SÂN (OUT)
      // Người chạm bóng cuối cùng sẽ làm mất điểm cho đối thủ!
      if (this.lastTouch === 'player') {
        playerWonPoint = false;
        pointReason = 'OUT! BÓNG NGOÀI SÂN';
      } else {
        playerWonPoint = true;
        pointReason = 'OUT! ĐỐI THỦ ĐÁNH RA NGOÀI';
      }
    } else {
      // BÓNG TRONG SÂN (IN)
      // Bóng rơi sân nào thì đối phương ghi điểm
      if (this.ball.x > cfg.net.x) {
        playerWonPoint = true;
        pointReason = this.ball.isBoomSpike ? '⚡ BOOM SPIKE ĐIỂM!' : 'ĐIỂM CHO BẠN!';
      } else {
        playerWonPoint = false;
        pointReason = 'ĐỐI THỦ GHI ĐIỂM!';
      }
    }

    if (playerWonPoint) {
      // Người chơi ghi điểm!
      this.playerScore++;
      this.servingSide = 'player';
      audioManager.playGoalFanfare();
      this.juiceFX.shake(6, 0.2);
      this.juiceFX.spawnConfetti(this.ball.x, this.ball.y, 30);
      const bonusPts = this.ball.isBoomSpike ? 25 : 10;
      const earned = this.rallyCount * 10 + bonusPts;
      this.juiceFX.spawnFloatingText(`${pointReason} +${earned}đ`, 320, 130, {
        color: '#22c55e',
        size: 21,
        fontWeight: '900'
      });
      this.callbacks.onScoreUpdate?.(earned);
      this.rallyCount = 0;
    } else {
      // Bot ghi điểm
      this.botScore++;
      this.servingSide = 'bot';
      this.rallyCount = 0;
      audioManager.playKick(0.5);
      this.juiceFX.shake(4, 0.15);
      this.juiceFX.spawnFloatingText(pointReason, 320, 130, {
        color: '#ef4444',
        size: 20,
        fontWeight: '800'
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cfg = VOLLEYBALL_CONFIG;

    // 1. Sân bóng sàn gỗ Maple & Nhà thi đấu
    this.drawCourt(ctx, w, h, cfg);

    // 2. Vệt bóng sấm sét (Ball Trails)
    this.drawBallTrails(ctx);

    // 3. Vòng tròn Sweet Spot Timing Ring (The Spike)
    if (this.sweetSpotActive) {
      this.drawSweetSpotMarker(ctx, this.ball.x, this.ball.y, this.sweetSpotScale);
    }

    // 4. Bóng phản chiếu trên sàn gỗ (Floor Reflections)
    this.drawReflections(ctx, cfg);

    // 5. Cầu thủ người chơi & Bot AI dạng Chibi Vận Động Viên
    this.drawPlayerChibi(ctx, this.player.x, this.player.y, this.player.pose, true);
    this.drawPlayerChibi(ctx, this.bot.x, this.bot.y, this.bot.pose, false);

    // 6. Lưới thi đấu & Cột ăng-ten
    this.drawNet(ctx, cfg);

    // 7. Quả bóng chuyền Mikasa quay tròn theo vận tốc
    this.drawBall(ctx, this.ball.x, this.ball.y, this.ball.radius, this.ballRotation, this.ball.isSpiked, this.ball.isBoomSpike);

    // 8. Chớp sáng va chạm (White Flash Hit-Stop)
    if (this.whiteFlashAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.whiteFlashAlpha})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 9. HUD Tỉ số & Hướng dẫn
    this.renderHUD(ctx);
  }

  drawCourt(ctx, w, h, cfg) {
    const spikeCfg = cfg.theSpike;

    // Bầu không khí khán đài nhà thi đấu (Dark Arena Top)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, cfg.floorY);
    skyGrad.addColorStop(0, '#0a0f1d');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, cfg.floorY + 12);

    // Sàn gỗ thi đấu bóng chuyền Maple (Hardwood Court)
    const floorY = cfg.floorY + 12;
    const floorHeight = h - floorY;

    ctx.fillStyle = '#b45309'; // Gỗ viền ngoài
    ctx.fillRect(0, floorY, w, floorHeight);

    // Vùng sân chính (Màu vàng hổ phách sáng)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(35, floorY, w - 70, floorHeight);

    // Vẽ các thanh nan gỗ (Plank lines)
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w - 40; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Vạch biên & Vạch 3m (Attack Lines)
    ctx.strokeStyle = spikeCfg.court.lineColor;
    ctx.lineWidth = 2.5;

    // Vạch giữa sân
    ctx.beginPath();
    ctx.moveTo(cfg.net.x, floorY);
    ctx.lineTo(cfg.net.x, floorY + 10);
    ctx.stroke();

    // Vạch 3m (Người chơi & Bot)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(spikeCfg.court.attackLineX, floorY);
    ctx.lineTo(spikeCfg.court.attackLineX, floorY + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(spikeCfg.court.botAttackLineX, floorY);
    ctx.lineTo(spikeCfg.court.botAttackLineX, floorY + 15);
    ctx.stroke();
  }

  drawNet(ctx, cfg) {
    const net = cfg.net;
    const floorY = cfg.floorY + 12;

    // Cột trụ lưới kim loại
    ctx.fillStyle = '#475569';
    ctx.fillRect(net.x - 2, net.y - 10, 4, floorY - (net.y - 10));

    // Lưới đan mắt cáo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    for (let y = net.y; y < floorY; y += 7) {
      ctx.beginPath();
      ctx.moveTo(net.x - 7, y);
      ctx.lineTo(net.x + 7, y);
      ctx.stroke();
    }

    // Mép viền lưới trắng (Top white band)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(net.x - 7, net.y, 14, 5);

    // Cột ăng-ten sọc đỏ trắng chuẩn Olympic (Antenna)
    const antTopY = net.y - 32;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(net.x - 1, antTopY, 2, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(net.x - 1, antTopY + 8, 2, 8);
    ctx.fillRect(net.x - 1, antTopY + 24, 2, 8);
  }

  drawReflections(ctx, cfg) {
    const floorY = cfg.floorY + 12;
    // Bóng mờ phản chiếu người chơi
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.translate(this.player.x, floorY);
    ctx.scale(1, -0.35);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-10, 0, 20, 30);
    ctx.restore();

    // Bóng mờ phản chiếu bot
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.translate(this.bot.x, floorY);
    ctx.scale(1, -0.35);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-10, 0, 20, 30);
    ctx.restore();
  }

  drawPlayerChibi(ctx, x, y, pose, isPlayer = true) {
    ctx.save();
    ctx.translate(x, y);

    const primaryColor = isPlayer ? '#0284c7' : '#d97706'; // Áo jersey
    const accentColor = isPlayer ? '#38bdf8' : '#fbbf24';  // Viền số áo
    const hairColor = isPlayer ? '#0f172a' : '#78350f';
    const skinColor = '#fed7aa';

    // 1. Tư thế Trượt sàn (Diving Slide)
    if (pose === 'slide') {
      const dir = isPlayer ? this.slideDir : -1;
      ctx.scale(dir, 1);

      // Thân nằm rạp sát sàn
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-22, -14, 32, 12);

      // Đầu Chibi nằm nghiêng
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(14, -12, 10, 0, Math.PI * 2);
      ctx.fill();

      // Tóc
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(14, -15, 10, Math.PI, 0);
      ctx.fill();

      // Hai tay duỗi dài hất bóng
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(10, -8);
      ctx.lineTo(26, -6);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 2. Tư thế Nhảy ưỡn lưng (Jump Arch Back - The Spike Signature)
    if (pose === 'jump_arch') {
      // Thân ưỡn cong về sau
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-12, -26, 22, 22);

      // Số áo thể thao
      ctx.fillStyle = accentColor;
      ctx.font = '800 10px sans-serif';
      ctx.fillText(isPlayer ? '10' : '7', -5, -12);

      // Đầu ngửa lên đón bóng
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(-2, -34, 12, 0, Math.PI * 2);
      ctx.fill();

      // Tóc bay theo gió
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(-4, -38, 12, Math.PI * 0.8, Math.PI * 0.1);
      ctx.fill();

      // Băng đô thể thao
      ctx.fillStyle = isPlayer ? '#ef4444' : '#10b981';
      ctx.fillRect(-14, -38, 24, 3);

      // Hai tay vung ngược ra sau chuẩn bị quất bóng
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-8, -24);
      ctx.lineTo(-20, -32);
      ctx.stroke();

      // Hai chân co gập về sau (Knee bend)
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(-14, 4);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 3. Tư thế Quất tay đập bóng (Spike Swing)
    if (pose === 'spike_swing') {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-10, -25, 20, 22);

      // Đầu Chibi gập về trước
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(2, -33, 12, 0, Math.PI * 2);
      ctx.fill();

      // Tóc
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(0, -37, 12, Math.PI * 0.8, Math.PI * 0.2);
      ctx.fill();

      // Cánh tay quất mạnh về trước góc 45 độ
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4, -24);
      ctx.lineTo(18, -12);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 4. Tư thế Đứng / Chạy bình thường (Idle / Run)
    const legOffset = pose === 'run' ? Math.sin(this.animTime * 14) * 6 : 0;

    // Thân Chibi (Áo jersey thể thao)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-11, -26, 22, 22);

    // Viền cổ áo & Số áo
    ctx.fillStyle = accentColor;
    ctx.fillRect(-6, -26, 12, 3);
    ctx.font = '800 10px sans-serif';
    ctx.fillText(isPlayer ? '10' : '7', -5, -12);

    // Chân & Giày thể thao
    ctx.fillStyle = '#0f172a'; // Quần soóc
    ctx.fillRect(-11, -4, 22, 4);

    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-6 + legOffset, 8); // Chân trái
    ctx.moveTo(6, 0);
    ctx.lineTo(6 - legOffset, 8);  // Chân phải
    ctx.stroke();

    // Giày thể thao trắng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-9 + legOffset, 7, 6, 4);
    ctx.fillRect(3 - legOffset, 7, 6, 4);

    // Đầu Chibi tròn trịa dễ thương
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -35, 12, 0, Math.PI * 2);
    ctx.fill();

    // Mắt Chibi
    ctx.fillStyle = '#0f172a';
    const faceDir = isPlayer ? 1 : -1;
    ctx.fillRect(faceDir * 3, -37, 3, 4);

    // Tóc Chibi thể thao
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -39, 12, Math.PI, 0);
    ctx.fill();

    // Băng đô thể thao
    ctx.fillStyle = isPlayer ? '#ef4444' : '#10b981';
    ctx.fillRect(-12, -40, 24, 3);

    ctx.restore();
  }

  drawBall(ctx, x, y, radius, rotation, isSpiked, isBoomSpike) {
    ctx.save();
    ctx.translate(x, y);

    // Bóng đổ trên sàn
    const floorY = VOLLEYBALL_CONFIG.floorY + 12;
    const shadowDist = Math.max(0, floorY - y);
    const shadowScale = Math.max(0.3, 1.0 - shadowDist / 250);

    ctx.save();
    ctx.translate(0, shadowDist);
    ctx.scale(shadowScale, shadowScale * 0.35);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Xoay bóng theo vận tốc
    ctx.rotate(rotation);

    // Quả bóng chuyền Mikasa 3 màu (Xanh - Vàng - Trắng)
    ctx.fillStyle = isBoomSpike ? '#ef4444' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2 dải màu cong đặc trưng của bóng chuyền
    ctx.fillStyle = isBoomSpike ? '#fbbf24' : '#0284c7';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, -0.6, 0.6);
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.fillStyle = isBoomSpike ? '#f97316' : '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, Math.PI - 0.6, Math.PI + 0.6);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Viền bóng
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawBallTrails(ctx) {
    for (let i = 0; i < this.ballTrails.length; i++) {
      const t = this.ballTrails[i];
      const trailAlpha = (1.0 - i / this.ballTrails.length) * 0.65;
      const trailRadius = Math.max(3, 11 - i * 1.3);

      ctx.save();
      ctx.fillStyle = t.isBoom
        ? `rgba(239, 68, 68, ${trailAlpha})`
        : `rgba(245, 158, 11, ${trailAlpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, trailRadius, 0, Math.PI * 2);
      ctx.fill();

      // Tia sét điện quang nếu là Boom Spike
      if (t.isBoom && i < 3) {
        ctx.strokeStyle = `rgba(254, 240, 138, ${trailAlpha * 1.2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x + (Math.random() - 0.5) * 14, t.y + (Math.random() - 0.5) * 14);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawSweetSpotMarker(ctx, x, y, scale) {
    ctx.save();
    const ringRadius = 24 * scale;
    ctx.strokeStyle = scale < 0.65 ? '#ef4444' : '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 4 dấu ngắm hồng tâm (Crosshairs)
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - ringRadius - 6, y);
    ctx.lineTo(x - ringRadius + 2, y);
    ctx.moveTo(x + ringRadius - 2, y);
    ctx.lineTo(x + ringRadius + 6, y);
    ctx.moveTo(x, y - ringRadius - 6);
    ctx.lineTo(x, y - ringRadius + 2);
    ctx.moveTo(x, y + ringRadius - 2);
    ctx.lineTo(x, y + ringRadius + 6);
    ctx.stroke();

    ctx.restore();
  }

  renderHUD(ctx) {
    ctx.save();

    // Bảng Tỉ số phong cách Scoreboard điện tử
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(220, 10, 200, 52);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(220, 10, 200, 52);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 18px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.playerScore}   :   ${this.botScore}`, 320, 34);

    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`RALLY CHUỖI: ${this.rallyCount}`, 320, 52);

    // Gợi ý hành động bên dưới
    ctx.font = '700 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    if (this.state === 'serving_player') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Bấm nút Hành Động / Phím Cách để PHÁT BÓNG!', 320, 340);
    } else if (this.state === 'rally') {
      if (this.player.isGrounded) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Nhảy: [Cách/W/Lên] | Cứu bóng xa: Bấm nhả khi bóng sát sàn', 320, 340);
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('⚡ BẤM ĐÚNG VÒNG HỒNG TÂM ĐỂ TUNG BOOM SPIKE! ⚡', 320, 340);
      }
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Bấm nút Hành Động để sang lượt tiếp theo', 320, 340);
    }

    ctx.restore();
  }
}
