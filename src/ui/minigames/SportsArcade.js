/**
 * DEVER TOWN - SPORTS ARCADE HTML5 CANVAS ENGINE
 * Module trò chơi thể thao arcade đa chế độ:
 * 1. ⚽ Sút Phạt Đền 11M (Penalty Shootout with Aim Bar & Goalkeeper AI)
 * 2. 🏀 Bóng Rổ Flappy Dunk (Physics-based Dunk & Swish Challenge)
 * 3. 🏐 Bóng Chuyền & Cầu Lông 1v1 (Spike & Rally Arcade)
 * 4. ☕ Barista Pha Chế Cà Phê Muối & Trà Sữa
 */
import { audioManager } from '../../utils/AudioManager.js';
import { questManager } from '../../managers/QuestManager.js';
import { authService } from '../../services/AuthService.js';

export class SportsArcade {
  constructor(canvasEl, options = {}) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.options = options;
    this.currentGame = 'football'; // 'football' | 'basketball' | 'volleyball' | 'barista'
    this.animId = null;
    this.running = false;

    // Kích thước chuẩn
    this.width = 640;
    this.height = 360;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Điểm số & Kỷ lục
    this.scores = {
      footballStreak: parseInt(localStorage.getItem('dever_penalty_streak') || '0', 10),
      footballHigh: parseInt(localStorage.getItem('dever_penalty_high') || '0', 10),
      basketballScore: 0,
      basketballHigh: parseInt(localStorage.getItem('dever_basketball_high') || '0', 10),
      volleyballRally: 0,
      volleyballHigh: parseInt(localStorage.getItem('dever_volleyball_high') || '0', 10),
      baristaScore: parseInt(localStorage.getItem('dever_barista_score') || '0', 10)
    };

    // Phím điều khiển
    this.keys = { left: false, right: false, up: false, space: false };
    this.particles = [];
    this.activationGraceUntil = 0;

    this.initFootball();
    this.initBasketball();
    this.initVolleyball();
    this.initBarista();

    this.bindEvents();
  }

  bindEvents() {
    this.handleKeyDown = (e) => {
      if (!this.running) return;
      if (Date.now() < this.activationGraceUntil) return;

      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'KeyW', 'Enter'].includes(e.code) || [' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
        this.keys.space = true;
        this.keys.up = true;
        this.onActionTrigger();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') this.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') this.keys.right = true;
    };

    this.handleKeyUp = (e) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
        this.keys.space = false;
        this.keys.up = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') this.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.key === 'd' || e.key === 'D') this.keys.right = false;
    };

    this.handleCanvasClick = (e) => {
      if (!this.running || Date.now() < this.activationGraceUntil) return;
      e.preventDefault();
      this.onActionTrigger();
    };

    this.handleCanvasTouch = (e) => {
      if (!this.running || Date.now() < this.activationGraceUntil) return;
      e.preventDefault();
      this.onActionTrigger();
    };
  }

  setGame(gameType) {
    this.currentGame = gameType;
    this.particles = [];
    if (gameType === 'football') this.resetFootball();
    else if (gameType === 'basketball') this.resetBasketball();
    else if (gameType === 'volleyball') this.resetVolleyball();
    else if (gameType === 'barista') this.resetBarista();
    this.updateHUD();
  }

  start() {
    if (this.running) {
      this.stop();
    }
    this.running = true;
    this.activationGraceUntil = Date.now() + 300;
    let lastTime = performance.now();

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('click', this.handleCanvasClick);
    this.canvas.addEventListener('touchstart', this.handleCanvasTouch, { passive: false });

    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      this.update(dt);
      this.render();

      this.animId = requestAnimationFrame(loop);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('click', this.handleCanvasClick);
    this.canvas.removeEventListener('touchstart', this.handleCanvasTouch);
  }

  destroy() {
    this.stop();
  }

  onActionTrigger() {
    if (this.currentGame === 'football') {
      this.triggerFootballShot();
    } else if (this.currentGame === 'basketball') {
      this.triggerBasketballFlap();
    } else if (this.currentGame === 'volleyball') {
      this.triggerVolleyballJump();
    } else if (this.currentGame === 'barista') {
      this.triggerBaristaBrew();
    }
  }

  updateHUD() {
    if (this.options.onScoreUpdate) {
      this.options.onScoreUpdate({
        game: this.currentGame,
        scores: this.scores
      });
    }

    // Tự động đồng bộ kỷ lục thể thao lên Database máy chủ khi đăng nhập
    try {
      if (authService && authService.isLoggedIn() && typeof authService.syncFullProfile === 'function') {
        authService.syncFullProfile({
          gameRecords: {
            footballStreak: this.scores.footballStreak || 0,
            footballHigh: this.scores.footballHigh || 0,
            basketballHigh: this.scores.basketballHigh || 0,
            volleyballHigh: this.scores.volleyballHigh || 0,
            baristaScore: this.scores.baristaScore || 0
          }
        });
      }
    } catch (e) {
      console.warn('⚠️ Lỗi đồng bộ kỷ lục thể thao lên máy chủ:', e);
    }
  }

  // ==========================================
  // 1. ⚽ FOOTBALL PENALTY SHOOTOUT
  // ==========================================
  initFootball() {
    this.football = {
      state: 'aiming', // 'aiming' | 'shooting' | 'celebrating' | 'saved' | 'missed'
      aimTime: 0,
      aimX: 0, // -160 to +160
      aimSpeed: 3.2,
      ball: { x: 320, y: 305, z: 0, targetX: 320, targetY: 140, startX: 320, startY: 305, progress: 0 },
      gk: { x: 320, y: 155, targetX: 320, diving: false, diveProgress: 0, diveDir: 0 },
      netRipple: 0,
      resultText: '',
      resultTimer: 0
    };
  }

  resetFootball() {
    this.football.state = 'aiming';
    this.football.aimTime = 0;
    this.football.ball.x = 320;
    this.football.ball.y = 305;
    this.football.ball.z = 0;
    this.football.ball.progress = 0;
    this.football.gk.x = 320;
    this.football.gk.targetX = 320;
    this.football.gk.diving = false;
    this.football.netRipple = 0;
    this.football.resultText = '';
  }

  triggerFootballShot() {
    if (this.football.state === 'celebrating' || this.football.state === 'saved' || this.football.state === 'missed') {
      this.resetFootball();
      return;
    }
    if (this.football.state !== 'aiming') return;

    this.football.state = 'shooting';
    const aimOffset = this.football.aimX; // -160 .. +160
    this.football.ball.startX = 320;
    this.football.ball.startY = 305;
    this.football.ball.targetX = 320 + aimOffset * 0.95;
    this.football.ball.targetY = 120 + Math.random() * 35;
    this.football.ball.progress = 0;

    // Goalkeeper AI phản xạ: chọn góc ngẫu nhiên (Trái / Giữa / Phải)
    const diveChoice = Math.random();
    if (diveChoice < 0.38) {
      this.football.gk.targetX = 320 - 95 - Math.random() * 35; // Lặn Trái
      this.football.gk.diveDir = -1;
    } else if (diveChoice < 0.76) {
      this.football.gk.targetX = 320 + 95 + Math.random() * 35; // Lặn Phải
      this.football.gk.diveDir = 1;
    } else {
      this.football.gk.targetX = 320 + (Math.random() - 0.5) * 40; // Đứng Giữa
      this.football.gk.diveDir = 0;
    }
    this.football.gk.diving = true;
    this.football.gk.diveProgress = 0;

    audioManager.playClick();
  }

  updateFootball(dt) {
    const f = this.football;
    if (f.state === 'aiming') {
      f.aimTime += dt * f.aimSpeed;
      f.aimX = Math.sin(f.aimTime) * 155; // Con lắc góc sút
    } else if (f.state === 'shooting') {
      f.ball.progress += dt * 2.2;
      const t = Math.min(f.ball.progress, 1);

      // Parabolic flight
      f.ball.x = f.ball.startX + (f.ball.targetX - f.ball.startX) * t;
      f.ball.y = f.ball.startY + (f.ball.targetY - f.ball.startY) * t - Math.sin(t * Math.PI) * 40;
      f.ball.z = t;

      // Goalkeeper dive lerp
      f.gk.diveProgress += dt * 2.4;
      const gkt = Math.min(f.gk.diveProgress, 1);
      f.gk.x = 320 + (f.gk.targetX - 320) * (1 - Math.pow(1 - gkt, 3));

      if (t >= 1) {
        // Kiểm tra bàn thắng
        const goalLeft = 190;
        const goalRight = 450;
        const shotX = f.ball.targetX;
        const gkDist = Math.abs(shotX - f.gk.x);

        if (shotX < goalLeft || shotX > goalRight) {
          // Bắn ra ngoài
          f.state = 'missed';
          f.resultText = 'Bóng bay ra ngoài cột dọc!';
          this.scores.footballStreak = 0;
          localStorage.setItem('dever_penalty_streak', '0');
          audioManager.playClick();
        } else if (gkDist < 42) {
          // Thủ môn cản phá
          f.state = 'saved';
          f.resultText = 'Thủ môn cản phá thành công!';
          this.scores.footballStreak = 0;
          localStorage.setItem('dever_penalty_streak', '0');
          audioManager.playClick();
        } else {
          // VÀOOO
          f.state = 'celebrating';
          f.resultText = 'VÀO! Bàn thắng tuyệt đẹp!';
          f.netRipple = 1.0;
          this.scores.footballStreak += 1;
          if (this.scores.footballStreak > this.scores.footballHigh) {
            this.scores.footballHigh = this.scores.footballStreak;
            localStorage.setItem('dever_penalty_high', this.scores.footballHigh.toString());
          }
          localStorage.setItem('dever_penalty_streak', this.scores.footballStreak.toString());

          questManager.incrementProgress('penalty_goal', 1);
          audioManager.playVictory();
          this.spawnConfetti(320, 140, 40);
        }
        this.updateHUD();
      }
    }
  }

  drawFootball() {
    const ctx = this.ctx;
    const f = this.football;

    // 1. Sân cỏ nhân tạo với các dải màu xanh
    ctx.fillStyle = '#1e3a1e';
    ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#166534';
      ctx.fillRect(0, 80 + i * 35, this.width, 35);
    }

    // 2. Vạch vôi & Khung thành
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    // Đường ngang cầu môn
    ctx.beginPath();
    ctx.moveTo(100, 175);
    ctx.lineTo(540, 175);
    ctx.stroke();

    // Vòng cung 16m50 & Chấm phạt đền
    ctx.beginPath();
    ctx.arc(320, 240, 60, Math.PI, 0);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(320, 305, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Khung thành bóng đá (Goal Posts & Net)
    const gL = 190;
    const gR = 450;
    const gT = 90;
    const gB = 175;

    // Lưới bóng đá
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let x = gL; x <= gR; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, gT);
      ctx.lineTo(x + (x - 320) * 0.1, gB);
      ctx.stroke();
    }
    for (let y = gT; y <= gB; y += 12) {
      ctx.beginPath();
      ctx.moveTo(gL, y);
      ctx.lineTo(gR, y);
      ctx.stroke();
    }

    // Cột dọc và xà ngang khung thành
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(gL, gB);
    ctx.lineTo(gL, gT);
    ctx.lineTo(gR, gT);
    ctx.lineTo(gR, gB);
    ctx.stroke();

    // 4. Thủ Môn (Goalkeeper)
    ctx.save();
    ctx.translate(f.gk.x, f.gk.y);
    if (f.gk.diving && f.gk.diveDir !== 0) {
      ctx.rotate((f.gk.diveDir * Math.PI) / 6);
    }
    // Thân thủ môn
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-12, -22, 24, 28);
    // Đầu
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -30, 9, 0, Math.PI * 2);
    ctx.fill();
    // Găng tay
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-16, -14, 6, 0, Math.PI * 2);
    ctx.arc(16, -14, 6, 0, Math.PI * 2);
    ctx.fill();
    // Quần & Chân
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, 6, 8, 14);
    ctx.fillRect(2, 6, 8, 14);
    ctx.restore();

    // 5. Thanh Ngắm Hướng Sút (Aim Pendulum Bar)
    if (f.state === 'aiming') {
      const aimScreenX = 320 + f.aimX;
      ctx.strokeStyle = 'rgba(242, 111, 33, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(320, 305);
      ctx.lineTo(aimScreenX, 135);
      ctx.stroke();
      ctx.setLineDash([]);

      // Điểm ngắm mục tiêu
      ctx.fillStyle = '#f26f21';
      ctx.beginPath();
      ctx.arc(aimScreenX, 135, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 6. Nhân vật sút phạt (Player Sprite)
    ctx.save();
    ctx.translate(285, 305);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-10, -26, 20, 26); // Áo
    ctx.fillStyle = '#fecdd3';
    ctx.beginPath();
    ctx.arc(0, -34, 8, 0, Math.PI * 2); // Đầu
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 0, 7, 12); // Chân
    ctx.fillRect(1, 0, 7, 12);
    ctx.restore();

    // 7. Trái bóng (Soccer Ball with 3D scale)
    const bScale = 1 - f.ball.z * 0.55;
    ctx.save();
    ctx.translate(f.ball.x, f.ball.y);
    ctx.scale(bScale, bScale);

    // Bóng đổ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Quả bóng trắng - đen
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 8. Text kết quả & Hướng dẫn
    if (f.state === 'aiming') {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Bấm phím Space hoặc Click để sút vào góc ngắm', 320, 40);
    } else if (f.resultText) {
      ctx.fillStyle = f.state === 'celebrating' ? '#4ade80' : '#f87171';
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.resultText, 320, 45);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillText('Nhấn phím Space hoặc Click để tiếp tục hiệp mới', 320, 68);
    }
  }

  // ==========================================
  // 2. 🏀 BASKETBALL FLAPPY DUNK
  // ==========================================
  initBasketball() {
    this.bb = {
      state: 'ready', // 'ready' | 'playing' | 'gameover'
      ball: { x: 120, y: 180, vx: 0, vy: 0, radius: 12, rotation: 0 },
      gravity: 0.38,
      jumpImpulse: -7.5,
      hoops: [],
      score: 0,
      highScore: this.scores.basketballHigh,
      spawnTimer: 0,
      combo: 0
    };
  }

  resetBasketball() {
    this.bb.state = 'ready';
    this.bb.ball.x = 120;
    this.bb.ball.y = 180;
    this.bb.ball.vx = 0;
    this.bb.ball.vy = 0;
    this.bb.ball.rotation = 0;
    this.bb.hoops = [];
    this.bb.score = 0;
    this.bb.combo = 0;
    this.bb.spawnTimer = 0;
    this.spawnHoop(380);
    this.spawnHoop(560);
  }

  spawnHoop(startX = 640) {
    const minY = 90;
    const maxY = 240;
    const hoopY = minY + Math.random() * (maxY - minY);
    this.bb.hoops.push({
      x: startX,
      y: hoopY,
      width: 52,
      height: 12,
      passed: false,
      scored: false,
      hitLeftRim: false,
      hitRightRim: false,
      hitOut: false
    });
  }

  triggerBasketballFlap() {
    if (this.bb.state === 'gameover') {
      this.resetBasketball();
      this.bb.state = 'playing';
      return;
    }
    if (this.bb.state === 'ready') {
      this.bb.state = 'playing';
    }

    this.bb.ball.vy = this.bb.jumpImpulse;
    this.bb.ball.vx = 0;
    audioManager.playClick();
    this.spawnConfetti(this.bb.ball.x, this.bb.ball.y, 6);
  }

  updateBasketball(dt) {
    const bb = this.bb;
    if (bb.state !== 'playing') return;

    // Lưu vị trí trước đó để kiểm tra điểm cắt lọt rổ
    const prevY = bb.ball.y;

    // Cập nhật vật lý bóng tự do
    bb.ball.vy += bb.gravity;
    bb.ball.y += bb.ball.vy;
    bb.ball.x += (bb.ball.vx || 0);

    // Lực ma sát không khí rất nhẹ
    if (bb.ball.vx) {
      bb.ball.vx *= 0.985;
      if (Math.abs(bb.ball.vx) < 0.02) bb.ball.vx = 0;
    }
    bb.ball.rotation += 0.08 + (bb.ball.vx || 0) * 0.02;

    // Rơi chạm sàn -> Game Over
    if (bb.ball.y > this.height - 25) {
      bb.ball.y = this.height - 25;
      this.endBasketballGame();
      return;
    }
    // Chạm trần
    if (bb.ball.y < 15) {
      bb.ball.y = 15;
      bb.ball.vy = Math.abs(bb.ball.vy) * 0.5;
    }

    // Di chuyển và kiểm tra va chạm các rổ bóng rổ
    const speed = 2.4;
    for (let i = bb.hoops.length - 1; i >= 0; i--) {
      const h = bb.hoops[i];
      h.x -= speed;

      // 1. CÁC THỰC THỂ CỨNG CỦA VÀNH RỔ (RIGID CIRCLE PEGS)
      const pegs = [
        { x: h.x + 4, y: h.y, r: 4 },           // Chốt vành trái
        { x: h.x + h.width - 4, y: h.y, r: 4 } // Chốt vành phải
      ];

      for (const peg of pegs) {
        const dx = bb.ball.x - peg.x;
        const dy = bb.ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = bb.ball.radius + peg.r;

        if (dist < minDist && dist > 0.0001) {
          // Vector pháp tuyến tiếp xúc đơn vị n
          const nx = dx / dist;
          const ny = dy / dist;

          // Positional separation (chống dính / lún vào vành)
          const overlap = minDist - dist;
          bb.ball.x += nx * overlap;
          bb.ball.y += ny * overlap;

          // Tính vận tốc dọc theo vector pháp tuyến: v · n
          const vDotN = (bb.ball.vx || 0) * nx + bb.ball.vy * ny;

          // Chỉ phản xạ khi bóng đang bay hướng về phía chốt vành
          if (vDotN < 0) {
            const restitution = 0.72; // Hệ số đàn hồi kim loại
            bb.ball.vx = (bb.ball.vx || 0) - (1 + restitution) * vDotN * nx;
            bb.ball.vy = bb.ball.vy - (1 + restitution) * vDotN * ny;

            audioManager.playClick();
            this.spawnConfetti(peg.x, peg.y, 6);
          }
        }
      }

      // 2. VA CHẠM BẢNG RỔ (BACKBOARD RIGID BODY)
      const boardX = h.x + h.width;
      const boardTop = h.y - 28;
      const boardBottom = h.y + 8;
      if (bb.ball.x + bb.ball.radius >= boardX && bb.ball.x - bb.ball.radius <= boardX + 6) {
        if (bb.ball.y >= boardTop && bb.ball.y <= boardBottom) {
          if ((bb.ball.vx || 0) > 0) {
            bb.ball.x = boardX - bb.ball.radius;
            bb.ball.vx = -(bb.ball.vx || 0) * 0.65;
            audioManager.playClick();
            this.spawnConfetti(boardX, bb.ball.y, 6);
          }
        }
      }

      // 3. KIỂM TRA BÓNG RƠI LỌT VÀO TRONG LÒNG RỔ (NET SENSOR)
      const isInsideHoopX = bb.ball.x >= h.x + 8 && bb.ball.x <= h.x + h.width - 8;
      const crossedRimPlane = prevY <= h.y && bb.ball.y >= h.y;

      if (!h.scored && isInsideHoopX && (crossedRimPlane || Math.abs(bb.ball.y - h.y) < 10) && bb.ball.vy > 0) {
        h.scored = true;
        bb.combo += 1;
        const pts = bb.combo > 1 ? 2 : 1;
        bb.score += pts;

        if (bb.score > this.scores.basketballHigh) {
          this.scores.basketballHigh = bb.score;
          localStorage.setItem('dever_basketball_high', bb.score.toString());
        }

        questManager.incrementProgress('basketball_shoot', 1);
        audioManager.playVictory();
        this.spawnConfetti(h.x + h.width / 2, h.y + 10, 20);
        this.updateHUD();
      }

      // Xóa rổ đã trôi ra ngoài màn hình
      if (h.x + h.width < 0) {
        if (!h.scored) {
          // Bỏ lỡ rổ -> kết thúc hiệp đấu
          this.endBasketballGame();
          return;
        }
        bb.hoops.splice(i, 1);
      }
    }

    // Spawn rổ mới
    const lastHoop = bb.hoops[bb.hoops.length - 1];
    if (!lastHoop || lastHoop.x < this.width - 180) {
      this.spawnHoop(this.width + 20);
    }
  }

  endBasketballGame() {
    this.bb.state = 'gameover';
    audioManager.playClick();
    this.updateHUD();
  }

  drawBasketball() {
    const ctx = this.ctx;
    const bb = this.bb;

    // 1. Background Sân bóng rổ trong nhà
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Sàn gỗ bóng rổ
    const floorY = this.height - 25;
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(0, floorY, this.width, 25);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, floorY, this.width, 25);

    // 2. Vẽ các rổ bóng rổ (Hoops & Net)
    bb.hoops.forEach(h => {
      // Bảng rổ (Backboard)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(h.x + h.width, h.y - 28, 6, 36);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(h.x + h.width, h.y - 28, 6, 36);

      // Má trái vành rổ (Left Rim Point)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(h.x + 4, h.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Vành rổ sắt (Steel Rim)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(h.x + 4, h.y - 3, h.width - 8, 6);

      // Má phải vành rổ (Right Rim Point)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(h.x + h.width - 4, h.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Lưới rổ (Net)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(h.x + 4, h.y + 3);
      ctx.lineTo(h.x + 10, h.y + 24);
      ctx.lineTo(h.x + h.width - 10, h.y + 24);
      ctx.lineTo(h.x + h.width - 4, h.y + 3);
      ctx.stroke();
    });

    // 3. Quả bóng rổ
    ctx.save();
    ctx.translate(bb.ball.x, bb.ball.y);
    ctx.rotate(bb.ball.rotation);

    // Thân bóng cam
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(0, 0, bb.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rãnh bóng rổ
    ctx.beginPath();
    ctx.moveTo(-bb.ball.radius, 0);
    ctx.lineTo(bb.ball.radius, 0);
    ctx.moveTo(0, -bb.ball.radius);
    ctx.lineTo(0, bb.ball.radius);
    ctx.stroke();
    ctx.restore();

    // 4. UI Điểm số & Trạng thái
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Điểm: ${bb.score}`, 320, 42);

    if (bb.state === 'ready') {
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Bấm phím Space hoặc Click để nhảy bóng lọt vào các rổ', 320, 80);
    } else if (bb.state === 'gameover') {
      ctx.fillStyle = '#ef4444';
      ctx.font = '800 20px Outfit, sans-serif';
      ctx.fillText('Hiệp Đấu Kết Thúc!', 320, 80);
      ctx.font = '13px Outfit, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Kỷ lục: ${this.scores.basketballHigh} điểm • Nhấn Space hoặc Click để chơi lại`, 320, 106);
    }
  }

  // ==========================================
  // 3. 🏐 VOLLEYBALL 1V1 SPIKE RALLY (TURN-BASED SERVE)
  // ==========================================
  initVolleyball() {
    this.vb = {
      state: 'serving_player', // 'serving_player' | 'serving_bot' | 'rally' | 'scored'
      servingSide: 'player',   // 'player' | 'bot'
      scores: { player: 0, bot: 0 },
      player: { x: 110, y: 285, vx: 0, vy: 0, isGrounded: true },
      bot: { x: 520, y: 285, vx: 0, vy: 0, isGrounded: true },
      ball: { x: 126, y: 255, vx: 0, vy: 0, radius: 10, rotation: 0 },
      net: { x: 320, y: 220, w: 8, h: 90 },
      rally: 0,
      highRally: this.scores.volleyballHigh,
      statusMsg: '',
      scoredSide: null,
      botServeCountdown: 1.2
    };
  }

  resetVolleyball() {
    this.vb.scores = { player: 0, bot: 0 };
    this.setupServe('player');
  }

  setupServe(servingSide = 'player') {
    const vb = this.vb;
    const floorY = 285;
    vb.servingSide = servingSide;
    vb.scoredSide = null;
    vb.statusMsg = '';
    vb.rally = 0;

    if (servingSide === 'player') {
      vb.state = 'serving_player';
      vb.player.x = 110;
      vb.player.y = floorY;
      vb.player.vx = 0;
      vb.player.vy = 0;
      vb.player.isGrounded = true;

      vb.bot.x = 510;
      vb.bot.y = floorY;
      vb.bot.vx = 0;
      vb.bot.vy = 0;
      vb.bot.isGrounded = true;

      vb.ball.x = vb.player.x + 14;
      vb.ball.y = vb.player.y - 28;
      vb.ball.vx = 0;
      vb.ball.vy = 0;
    } else {
      vb.state = 'serving_bot';
      vb.botServeCountdown = 1.3;

      vb.bot.x = 530;
      vb.bot.y = floorY;
      vb.bot.vx = 0;
      vb.bot.vy = 0;
      vb.bot.isGrounded = true;

      vb.player.x = 130;
      vb.player.y = floorY;
      vb.player.vx = 0;
      vb.player.vy = 0;
      vb.player.isGrounded = true;

      vb.ball.x = vb.bot.x - 14;
      vb.ball.y = vb.bot.y - 28;
      vb.ball.vx = 0;
      vb.ball.vy = 0;
    }
  }

  triggerVolleyballJump() {
    const vb = this.vb;
    if (vb.state === 'scored') {
      // Sang lượt phát bóng tiếp theo luân phiên
      this.setupServe(vb.servingSide);
      return;
    }

    if (vb.state === 'serving_player') {
      // Người chơi tung phát bóng bổng qua lưới
      vb.state = 'rally';
      vb.player.vy = -6.5;
      vb.player.isGrounded = false;
      vb.ball.vx = 4.4;
      vb.ball.vy = -7.6;
      audioManager.playClick();
      this.spawnConfetti(vb.ball.x, vb.ball.y, 8);
      return;
    }

    if (vb.state === 'rally' && vb.player.isGrounded) {
      vb.player.vy = -8.2;
      vb.player.isGrounded = false;
      audioManager.playClick();
    }
  }

  updateVolleyball(dt) {
    const vb = this.vb;
    const floorY = 285;
    const gravity = 0.32;

    // 1. Trạng thái Người chơi đang chuẩn bị phát bóng
    if (vb.state === 'serving_player') {
      if (this.keys.left && vb.player.x > 60) vb.player.x -= 2.8;
      if (this.keys.right && vb.player.x < 180) vb.player.x += 2.8;
      vb.ball.x = vb.player.x + 14;
      vb.ball.y = vb.player.y - 28;
      return;
    }

    // 2. Trạng thái Máy đang chuẩn bị phát bóng (Đếm ngược)
    if (vb.state === 'serving_bot') {
      if (this.keys.left && vb.player.x > 40) vb.player.x -= 3.2;
      if (this.keys.right && vb.player.x < vb.net.x - 30) vb.player.x += 3.2;

      vb.ball.x = vb.bot.x - 14;
      vb.ball.y = vb.bot.y - 28;

      vb.botServeCountdown -= dt;
      if (vb.botServeCountdown <= 0) {
        // Máy tung phát bóng vòng cung qua lưới
        vb.state = 'rally';
        vb.bot.vy = -6.4;
        vb.bot.isGrounded = false;
        vb.ball.vx = -4.3;
        vb.ball.vy = -7.5;
        audioManager.playClick();
        this.spawnConfetti(vb.ball.x, vb.ball.y, 8);
      }
      return;
    }

    if (vb.state === 'scored') return;

    // 3. Trạng thái Rally (Đang đánh bóng qua lại)
    // 3a. Người chơi di chuyển & trọng lực
    if (this.keys.left && vb.player.x > 40) vb.player.x -= 3.6;
    if (this.keys.right && vb.player.x < vb.net.x - 25) vb.player.x += 3.6;

    vb.player.vy += gravity;
    vb.player.y += vb.player.vy;
    if (vb.player.y >= floorY) {
      vb.player.y = floorY;
      vb.player.vy = 0;
      vb.player.isGrounded = true;
    }

    // 3b. Bot AI di chuyển & nhảy đập bóng
    const targetBotX = Math.max(vb.net.x + 30, Math.min(vb.ball.x + 10, 580));
    if (vb.ball.x > vb.net.x - 20) {
      if (vb.bot.x < targetBotX - 5) vb.bot.x += 3.2;
      else if (vb.bot.x > targetBotX + 5) vb.bot.x -= 3.2;

      // Bot nhảy đập bóng
      if (vb.bot.isGrounded && Math.abs(vb.ball.x - vb.bot.x) < 35 && vb.ball.y < 230 && vb.ball.y > 150) {
        vb.bot.vy = -7.8;
        vb.bot.isGrounded = false;
      }
    }
    vb.bot.vy += gravity;
    vb.bot.y += vb.bot.vy;
    if (vb.bot.y >= floorY) {
      vb.bot.y = floorY;
      vb.bot.vy = 0;
      vb.bot.isGrounded = true;
    }

    // 3c. Vật lý Quả bóng
    vb.ball.vy += 0.28;
    vb.ball.x += vb.ball.vx;
    vb.ball.y += vb.ball.vy;
    vb.ball.rotation += vb.ball.vx * 0.05;

    // Va chạm tường biên trái & phải
    if (vb.ball.x < 15) {
      vb.ball.x = 15;
      vb.ball.vx = Math.abs(vb.ball.vx) * 0.9;
    }
    if (vb.ball.x > this.width - 15) {
      vb.ball.x = this.width - 15;
      vb.ball.vx = -Math.abs(vb.ball.vx) * 0.9;
    }

    // Va chạm Lưới bóng chuyền ở giữa (Elastic Mesh Recoil & Bounce Upward)
    const netL = vb.net.x - 12;
    const netR = vb.net.x + vb.net.w + 12;
    if (vb.ball.x >= netL && vb.ball.x <= netR && vb.ball.y >= vb.net.y - 6) {
      if (vb.ball.x < vb.net.x + vb.net.w / 2) {
        // Chạm lưới từ sân trái (người chơi) -> Bật nảy bổng ngược về sân trái để kịp cứu bóng
        vb.ball.vx = -3.6;
        vb.ball.vy = -4.8;
        vb.ball.x = netL - 4;
      } else {
        // Chạm lưới từ sân phải (bot) -> Bật nảy bổng ngược về sân phải
        vb.ball.vx = 3.6;
        vb.ball.vy = -4.8;
        vb.ball.x = netR + 4;
      }
      audioManager.playClick();
      this.spawnConfetti(vb.ball.x, vb.ball.y, 6);
    }

    // Va chạm Người chơi (Player hit)
    const distP = Math.hypot(vb.ball.x - vb.player.x, vb.ball.y - (vb.player.y - 15));
    if (distP < 28 && vb.ball.vy > 0) {
      vb.ball.vy = -7.5 - Math.random() * 1.5;
      vb.ball.vx = 4.2 + (vb.ball.x - vb.player.x) * 0.12;
      vb.rally += 1;
      audioManager.playClick();
      this.spawnConfetti(vb.ball.x, vb.ball.y, 8);
    }

    // Va chạm Bot đối thủ (Bot hit)
    const distB = Math.hypot(vb.ball.x - vb.bot.x, vb.ball.y - (vb.bot.y - 15));
    if (distB < 28 && vb.ball.vy > 0) {
      vb.ball.vy = -7.2 - Math.random() * 1.5;
      vb.ball.vx = -4.0 - (vb.bot.x - vb.ball.x) * 0.1;
      vb.rally += 1;
      audioManager.playClick();
      this.spawnConfetti(vb.ball.x, vb.ball.y, 8);
    }

    // Bóng chạm sàn -> Tính điểm & Đổi bên phát bóng
    if (vb.ball.y >= floorY + 6) {
      vb.state = 'scored';
      if (vb.ball.x < vb.net.x) {
        // Rơi sân người chơi -> Máy ghi điểm!
        vb.scoredSide = 'bot';
        vb.scores.bot += 1;
        vb.servingSide = 'bot'; // Máy phát bóng lượt sau
        vb.statusMsg = 'Đối thủ ghi điểm!';
        audioManager.playClick();
      } else {
        // Rơi sân đối thủ -> Người chơi ghi điểm!
        vb.scoredSide = 'player';
        vb.scores.player += 1;
        vb.servingSide = 'player'; // Người chơi tiếp tục phát bóng
        vb.statusMsg = 'Điểm cho bạn!';
        if (vb.rally > this.scores.volleyballHigh) {
          this.scores.volleyballHigh = vb.rally;
          localStorage.setItem('dever_volleyball_high', vb.rally.toString());
        }
        audioManager.playVictory();
        this.spawnConfetti(vb.ball.x, vb.ball.y, 25);
      }
      this.updateHUD();
    }
  }

  drawVolleyball() {
    const ctx = this.ctx;
    const vb = this.vb;

    // 1. Sân bóng chuyền bãi biển / trong nhà
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(0, 0, this.width, this.height);

    // Mặt sân cát vàng
    const floorY = 300;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, floorY, this.width, 60);

    // 2. Cột Lưới bóng chuyền ở giữa
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(vb.net.x, vb.net.y, vb.net.w, vb.net.h);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 1;
    for (let y = vb.net.y; y <= floorY; y += 8) {
      ctx.beginPath();
      ctx.moveTo(vb.net.x, y);
      ctx.lineTo(vb.net.x + vb.net.w, y);
      ctx.stroke();
    }

    // 3. Người chơi (Bên trái)
    ctx.save();
    ctx.translate(vb.player.x, vb.player.y);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, -14, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(7, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Đối thủ Bot FUDA Cóc Vàng (Bên phải)
    ctx.save();
    ctx.translate(vb.bot.x, vb.bot.y);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -14, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-7, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Quả bóng chuyền
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(vb.ball.x, vb.ball.y, vb.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. UI Tỷ số & HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 20px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`BẠN: ${vb.scores.player}  -  ${vb.scores.bot} :BOT`, 320, 38);

    ctx.font = 'bold 13px Outfit, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Chuỗi tâng bóng: ${vb.rally} • Kỷ lục: ${this.scores.volleyballHigh}`, 320, 60);

    // 7. Thông báo trạng thái phát bóng / ghi điểm
    if (vb.state === 'serving_player') {
      ctx.font = '800 14px Outfit, sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.fillText('Lượt của bạn: Bấm phím Space hoặc Click để phát bóng qua lưới', 320, 90);
    } else if (vb.state === 'serving_bot') {
      ctx.font = '800 14px Outfit, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Đối thủ đang chuẩn bị phát bóng... (Sẵn sàng đón bóng)', 320, 90);
    } else if (vb.state === 'scored') {
      ctx.font = '800 16px Outfit, sans-serif';
      ctx.fillStyle = vb.scoredSide === 'player' ? '#4ade80' : '#f87171';
      ctx.fillText(vb.statusMsg, 320, 90);
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Bấm Space hoặc Click để bước vào quả phát bóng tiếp theo', 320, 112);
    } else {
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Di chuyển: Phím Mũi Tên / A D • Nhảy & Đập: Space / Phím Lên', 320, 85);
    }
  }

  // ==========================================
  // 4. ☕ BARISTA POWER TIMING
  // ==========================================
  initBarista() {
    this.barista = {
      power: 0,
      direction: 1,
      speed: 1.8,
      drink: 'cafe_muoi',
      resultText: ''
    };
  }

  resetBarista() {
    this.barista.power = 0;
    this.barista.direction = 1;
    this.barista.resultText = '';
  }

  triggerBaristaBrew() {
    const p = this.barista.power;
    if (p >= 35 && p <= 80) {
      this.scores.baristaScore = (this.scores.baristaScore || 0) + 100;
      localStorage.setItem('dever_barista_score', this.scores.baristaScore.toString());
      this.barista.resultText = 'Pha Chế Hoàn Hảo! +100 Điểm Thưởng!';
      
      // Kích hoạt thưởng điểm nhiệm vụ hàng ngày Barista
      questManager.incrementProgress('barista_coffee', 1);
      audioManager.playVictory();
      this.spawnConfetti(320, 180, 30);
    } else {
      this.barista.resultText = 'Tỉ Lệ Chưa Chuẩn! Hãy Thử Lại!';
      audioManager.playClick();
    }
    this.updateHUD();
  }

  updateBarista(dt) {
    const b = this.barista;
    b.power += b.direction * b.speed * 60 * dt;
    if (b.power >= 100) {
      b.power = 100;
      b.direction = -1;
    } else if (b.power <= 0) {
      b.power = 0;
      b.direction = 1;
    }
  }

  drawBarista() {
    const ctx = this.ctx;
    const b = this.barista;

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☕ QUẦY BARISTA CÀ PHÊ MUỐI & TRÀ SỮA', 320, 50);

    // Thanh lực
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(120, 150, 400, 30);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(120, 150, 400, 30);

    // Vùng xanh hoàn hảo
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(120 + 400 * 0.4, 150, 400 * 0.35, 30);

    // Con trỏ
    const curX = 120 + (400 * b.power) / 100;
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(curX - 4, 140, 8, 50);

    if (b.resultText) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 16px Outfit, sans-serif';
      ctx.fillText(b.resultText, 320, 240);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px Outfit, sans-serif';
      ctx.fillText('Canh con trỏ vào VÙNG XANH và bấm nút để pha chế!', 320, 230);
    }
  }

  // ==========================================
  // CONFETTI PARTICLES & CORE LOOP
  // ==========================================
  spawnConfetti(x, y, count = 20) {
    const colors = ['#f26f21', '#22c55e', '#38bdf8', '#fbbf24', '#ec4899', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.8) * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        alpha: 1
      });
    }
  }

  update(dt) {
    if (this.currentGame === 'football') this.updateFootball(dt);
    else if (this.currentGame === 'basketball') this.updateBasketball(dt);
    else if (this.currentGame === 'volleyball') this.updateVolleyball(dt);
    else if (this.currentGame === 'barista') this.updateBarista(dt);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentGame === 'football') this.drawFootball();
    else if (this.currentGame === 'basketball') this.drawBasketball();
    else if (this.currentGame === 'volleyball') this.drawVolleyball();
    else if (this.currentGame === 'barista') this.drawBarista();

    // Render particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(p.alpha, 0);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }
}
