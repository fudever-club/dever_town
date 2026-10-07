/**
 * DEVER TOWN - SHEEP DREAM ENGINE (Đếm Cừu Trong Mơ)
 *
 * Mini-game khi người chơi ngủ: vào giấc mơ đêm, cừu nhảy qua hàng rào,
 * người chơi nhấn vào cừu (hoặc Space) để đếm. Cừu càng lúc càng nhanh.
 *
 * FSM: 'idle' → 'falling_asleep' → 'dreaming' → 'waking' → 'idle'
 * - falling_asleep: fade từ game vào mơ (1.2s)
 * - dreaming: gameplay chính - cừu spawn từ phải, nhảy qua rào ở giữa
 * - waking: fade ra, hiện kết quả
 *
 * Điều khiển: Click/Tap vào cừu, hoặc phím Space (đếm con gần rào nhất).
 */

import { SHEEP_DREAM_CONFIG, SHEEP_DREAM_FSM } from '../../../config/sheepDreamConfig.js';

export class SheepDreamEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;
    this.cfg = SHEEP_DREAM_CONFIG;

    this.w = canvas.width || this.cfg.canvas.width;
    this.h = canvas.height || this.cfg.canvas.height;

    this.state = SHEEP_DREAM_FSM.IDLE;
    this.sheep = [];           // Đàn cừu đang chạy
    this.counted = 0;          // Số cừu đã đếm
    this.missed = 0;           // Số cừu bị bỏ sót
    this.combo = 0;            // Combo liên tiếp
    this.score = 0;
    this.spawnTimer = 0;
    this.sheepSpawned = 0;

    this.fadeAlpha = 0;        // 0 = trong suốt, 1 = đen hoàn toàn
    this.fadeDirection = 0;    // 1 = đang tối dần, -1 = đang sáng dần

    this.animTime = 0;

    // Bầu trời sao
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h * 0.6,
        r: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 1 + Math.random() * 2,
      });
    }

    // Hiệu ứng ZZZ bay
    this.zzzParticles = [];

    this.boundClick = this.handleClick.bind(this);
    this.boundKey = this.handleKey.bind(this);
  }

  // ===== FSM =====

  start() {
    if (this.state !== SHEEP_DREAM_FSM.IDLE) return;
    this.reset();
    this.setState(SHEEP_DREAM_FSM.FALLING_ASLEEP);
    this.fadeDirection = 1;
    this.attachInput();
  }

  reset() {
    this.sheep = [];
    this.counted = 0;
    this.missed = 0;
    this.combo = 0;
    this.score = 0;
    this.spawnTimer = 0;
    this.sheepSpawned = 0;
    this.fadeAlpha = 0;
    this.fadeDirection = 0;
    this.zzzParticles = [];
  }

  setState(newState) {
    const old = this.state;
    this.state = newState;
    this.callbacks.onStateChange?.(newState, old);
  }

  wakeUp() {
    if (this.state !== SHEEP_DREAM_FSM.DREAMING) return;
    this.setState(SHEEP_DREAM_FSM.WAKING);
    this.fadeDirection = 1;
    this.detachInput();
  }

  // ===== INPUT =====

  attachInput() {
    this.canvas.addEventListener('click', this.boundClick);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundKey);
    }
  }

  detachInput() {
    this.canvas.removeEventListener('click', this.boundClick);
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKey);
    }
  }

  handleClick(e) {
    if (this.state !== SHEEP_DREAM_FSM.DREAMING) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Nút tỉnh dậy
    const wb = this.wakeBtn;
    if (wb && x >= wb.x && x <= wb.x + wb.w && y >= wb.y && y <= wb.y + wb.h) {
      this.wakeUp();
      return;
    }

    this.tryCountAt(x, y);
  }

  handleKey(e) {
    if (this.state !== SHEEP_DREAM_FSM.DREAMING) return;
    if (e.code === 'Space') {
      e.preventDefault();
      // Đếm con cừu gần hàng rào nhất
      let nearest = null;
      let nearestDist = Infinity;
      const fenceX = this.cfg.fence.x;
      for (const s of this.sheep) {
        if (s.counted) continue;
        const d = Math.abs(s.x - fenceX);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = s;
        }
      }
      if (nearest) this.countSheep(nearest);
    }
    if (e.code === 'Escape') {
      this.wakeUp();
    }
  }

  tryCountAt(x, y) {
    // Tìm cừu được click (hitbox)
    for (const s of this.sheep) {
      if (s.counted) continue;
      const hw = this.cfg.sheep.width / 2 + 6;
      const hh = this.cfg.sheep.height / 2 + 6;
      if (Math.abs(x - s.x) < hw && Math.abs(y - s.y) < hh) {
        this.countSheep(s);
        return;
      }
    }
  }

  countSheep(sheep) {
    if (sheep.counted) return;
    sheep.counted = true;
    sheep.countFlash = 0.3; // Hiệu ứng flash khi đếm
    this.counted++;
    this.combo++;

    let points = this.cfg.scoring.pointsPerSheep;
    if (this.combo > 0 && this.combo % 5 === 0) {
      points += this.cfg.scoring.comboBonus;
    }
    this.score += points;

    // Hiệu ứng "+1" bay lên
    sheep.scorePop = { text: `+${points}`, timer: 0.8 };

    this.callbacks.onCount?.(this.counted, this.score);

    // Đủ target → tự động hoàn thành sau 1s
    if (this.counted >= this.cfg.flow.targetSheep) {
      setTimeout(() => {
        if (this.state === SHEEP_DREAM_FSM.DREAMING) this.complete();
      }, 1000);
    }
  }

  complete() {
    // Thưởng hoàn hảo
    if (this.missed === 0) {
      this.score += this.cfg.scoring.perfectBonus;
    }
    this.callbacks.onComplete?.({
      counted: this.counted,
      missed: this.missed,
      score: this.score,
      perfect: this.missed === 0,
      dcoin: this.cfg.scoring.dcoinReward,
    });
    this.wakeUp();
  }

  // ===== UPDATE =====

  update(dt) {
    this.animTime += dt;

    // Fade
    if (this.fadeDirection !== 0) {
      const fadeSpeed = dt / (this.cfg.flow.fadeDurationMs / 1000);
      this.fadeAlpha += this.fadeDirection * fadeSpeed;
      if (this.fadeDirection === 1 && this.fadeAlpha >= 1) {
        this.fadeAlpha = 1;
        this.fadeDirection = 0;
        if (this.state === SHEEP_DREAM_FSM.FALLING_ASLEEP) {
          this.setState(SHEEP_DREAM_FSM.DREAMING);
          this.fadeDirection = -1; // Fade in vào giấc mơ
        } else if (this.state === SHEEP_DREAM_FSM.WAKING) {
          this.setState(SHEEP_DREAM_FSM.IDLE);
          this.callbacks.onWake?.({
            counted: this.counted,
            score: this.score,
          });
        }
      } else if (this.fadeDirection === -1 && this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.fadeDirection = 0;
      }
    }

    if (this.state !== SHEEP_DREAM_FSM.DREAMING) return;

    // Spawn cừu
    const speedLevel = Math.floor(this.sheepSpawned / this.cfg.sheep.speedIncrementEvery);
    const speed = Math.min(
      this.cfg.sheep.baseSpeed + speedLevel * this.cfg.sheep.speedIncrement,
      this.cfg.sheep.maxSpeed
    );
    const interval = Math.max(
      this.cfg.sheep.spawnIntervalMs * Math.pow(this.cfg.sheep.spawnIntervalDecay, this.sheepSpawned),
      this.cfg.sheep.minSpawnIntervalMs
    );

    this.spawnTimer += dt * 1000;
    if (this.spawnTimer >= interval && this.sheepSpawned < this.cfg.flow.maxSheep) {
      this.spawnTimer = 0;
      this.spawnSheep(speed);
    }

    // Update cừu
    const fenceX = this.cfg.fence.x;
    for (let i = this.sheep.length - 1; i >= 0; i--) {
      const s = this.sheep[i];
      s.x -= s.speed * dt;

      // Nhảy qua hàng rào
      const distToFence = s.x - fenceX;
      // Crouch (lấy đà) khi sắp tới rào
      s.crouch = !s.jumping && distToFence < 110 && distToFence >= 60;
      if (!s.jumping && distToFence < 60 && distToFence > -10) {
        s.jumping = true;
        s.jumpT = 0;
        s.crouch = false;
      }
      if (s.jumping) {
        s.jumpT += dt;
        const jumpDur = this.cfg.sheep.jumpDurationMs / 1000;
        const t = Math.min(s.jumpT / jumpDur, 1);
        // Parabol: lên rồi xuống
        s.jumpY = -Math.sin(t * Math.PI) * this.cfg.sheep.jumpHeight;
        if (t >= 1) {
          s.jumping = false;
          s.jumpY = 0;
          s.landT = 0.18; // Squash khi tiếp đất
        }
      }
      // Giảm land squash
      if (s.landT > 0) s.landT -= dt;

      // Chân chạy
      s.legPhase += dt * 12;

      // Flash khi đếm
      if (s.countFlash > 0) s.countFlash -= dt;
      if (s.scorePop) {
        s.scorePop.timer -= dt;
        if (s.scorePop.timer <= 0) s.scorePop = null;
      }

      // Ra khỏi màn hình
      if (s.x < -60) {
        if (!s.counted) {
          this.missed++;
          this.combo = 0;
          this.callbacks.onMiss?.(this.missed);
        }
        this.sheep.splice(i, 1);
      }
    }

    // ZZZ particles
    if (Math.random() < dt * 2) {
      this.zzzParticles.push({
        x: this.w - 60 - Math.random() * 40,
        y: this.h - 40,
        vy: -30 - Math.random() * 20,
        size: 14 + Math.random() * 10,
        alpha: 1,
        sway: Math.random() * Math.PI * 2,
      });
    }
    for (let i = this.zzzParticles.length - 1; i >= 0; i--) {
      const p = this.zzzParticles[i];
      p.y += p.vy * dt;
      p.sway += dt * 2;
      p.x += Math.sin(p.sway) * 10 * dt;
      p.alpha -= dt * 0.5;
      if (p.alpha <= 0 || p.y < 20) this.zzzParticles.splice(i, 1);
    }
  }

  spawnSheep(speed) {
    this.sheep.push({
      x: this.w + 40,
      y: this.cfg.fence.y - this.cfg.sheep.height / 2,
      speed,
      jumping: false,
      jumpT: 0,
      jumpY: 0,
      legPhase: Math.random() * Math.PI * 2,
      counted: false,
      countFlash: 0,
      scorePop: null,
      woolOffset: Math.random() * 10,
    });
    this.sheepSpawned++;
  }

  // ===== RENDER =====

  render() {
    const ctx = this.ctx;
    const c = this.cfg.colors;

    // Bầu trời đêm
    const grad = ctx.createLinearGradient(0, 0, 0, this.h);
    grad.addColorStop(0, c.skyTop);
    grad.addColorStop(1, c.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.w, this.h);

    // Mặt trăng
    ctx.save();
    ctx.fillStyle = c.moonGlow;
    ctx.beginPath();
    ctx.arc(this.w - 80, 70, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.moon;
    ctx.beginPath();
    ctx.arc(this.w - 80, 70, 28, 0, Math.PI * 2);
    ctx.fill();
    // Vết trên mặt trăng
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.arc(this.w - 90, 62, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(this.w - 72, 78, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Sao nhấp nháy
    for (const st of this.stars) {
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(this.animTime * st.speed + st.phase));
      ctx.fillStyle = `rgba(255,255,255,${twinkle.toFixed(2)})`;
      ctx.fillRect(st.x, st.y, st.r, st.r);
    }

    // Đồi cỏ
    ctx.fillStyle = c.grassDark;
    ctx.beginPath();
    ctx.ellipse(this.w / 2, this.h + 60, this.w * 0.7, 140, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.grass;
    ctx.beginPath();
    ctx.ellipse(this.w / 2, this.h + 80, this.w * 0.6, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hàng rào
    this.drawFence(ctx);

    // Cừu
    for (const s of this.sheep) {
      this.drawSheep(ctx, s);
    }

    // ZZZ
    ctx.save();
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    for (const p of this.zzzParticles) {
      ctx.fillStyle = `rgba(175, 220, 250, ${p.alpha.toFixed(2)})`;
      ctx.fillText('Z', p.x, p.y);
    }
    ctx.restore();

    // HUD
    this.drawHUD(ctx);

    // Fade overlay
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(5, 5, 20, ${this.fadeAlpha.toFixed(2)})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }

    // Title khi falling_asleep
    if (this.state === SHEEP_DREAM_FSM.FALLING_ASLEEP && this.fadeAlpha > 0.5) {
      ctx.save();
      ctx.fillStyle = c.text;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.cfg.text.title, this.w / 2, this.h / 2 - 10);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = c.textDim;
      ctx.fillText(this.cfg.text.subtitle, this.w / 2, this.h / 2 + 20);
      ctx.restore();
    }
  }

  drawFence(ctx) {
    const c = this.cfg.colors;
    const f = this.cfg.fence;
    const topY = f.y - f.height;
    // Cột cắm sâu xuống đất (không lơ lửng): đáy cột = f.postBottom
    const botY = f.postBottom || f.y;
    const postW = 14;
    const postH = botY - topY;
    const postL = f.x - 30;   // Cột trái
    const postR = f.x + 30;   // Cột phải

    // Vẽ 1 cột gỗ (có vân, highlight, đầu nhọn)
    const drawPost = (px) => {
      const x0 = px - postW / 2;
      // Thân cột
      ctx.fillStyle = c.fence;
      ctx.fillRect(x0, topY, postW, postH);
      // Highlight bên trái
      ctx.fillStyle = c.fenceLight;
      ctx.fillRect(x0, topY, 3, postH);
      // Bóng bên phải
      ctx.fillStyle = c.fenceDark;
      ctx.fillRect(x0 + postW - 3, topY, 3, postH);
      // Vân gỗ dọc
      ctx.fillStyle = c.fenceDark;
      ctx.fillRect(x0 + 6, topY + 8, 2, postH - 16);
      ctx.fillRect(x0 + 10, topY + 20, 1, postH - 40);
      // Đầu nhọn
      ctx.fillStyle = c.fence;
      ctx.beginPath();
      ctx.moveTo(x0, topY);
      ctx.lineTo(x0 + postW / 2, topY - 8);
      ctx.lineTo(x0 + postW, topY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.fenceLight;
      ctx.fillRect(x0 + 2, topY - 5, 3, 5);
      // Mắt gỗ
      ctx.fillStyle = c.fenceDark;
      ctx.beginPath();
      ctx.ellipse(x0 + postW / 2 + 1, topY + postH * 0.55, 2.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawPost(postL);
    drawPost(postR);

    // Ụ đất ở chân cột — chỗ cột đâm xuống mặt cỏ
    // (mặt đồi cỏ tại x cột ≈ 370 với canvas 640x400)
    const groundY = 372;
    ctx.fillStyle = c.fenceDark;
    [postL, postR].forEach((px) => {
      ctx.beginPath();
      ctx.ellipse(px, groundY, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3 thanh ngang
    const railY = [topY + 14, topY + 40, topY + 66];
    const railX0 = postL - 14;
    const railX1 = postR + 14;
    const railW = railX1 - railX0;
    railY.forEach((ry, idx) => {
      // Bóng dưới
      ctx.fillStyle = c.fenceDark;
      ctx.fillRect(railX0, ry, railW, 9);
      // Thân
      ctx.fillStyle = c.fence;
      ctx.fillRect(railX0, ry, railW, 7);
      // Highlight trên
      ctx.fillStyle = c.fenceLight;
      ctx.fillRect(railX0, ry, railW, 2);
      // Vân gỗ ngang
      ctx.fillStyle = c.fenceDark;
      ctx.fillRect(railX0 + 8 + idx * 13, ry + 4, 18, 1);
      ctx.fillRect(railX0 + railW - 30 - idx * 7, ry + 5, 12, 1);
      // Đinh tán
      ctx.fillStyle = '#5b3413';
      ctx.fillRect(postL - 2, ry + 2, 4, 4);
      ctx.fillRect(postR - 2, ry + 2, 4, 4);
      ctx.fillStyle = c.fenceLight;
      ctx.fillRect(postL - 2, ry + 2, 4, 1);
      ctx.fillRect(postR - 2, ry + 2, 4, 1);
    });
  }

  drawSheep(ctx, s) {
    const c = this.cfg.colors;
    const w = this.cfg.sheep.width;
    const h = this.cfg.sheep.height;

    // Squash & stretch theo trạng thái
    let scaleX = 1, scaleY = 1;
    let tucked = false; // Chân co khi đang bay
    if (s.jumping) {
      const jumpDur = this.cfg.sheep.jumpDurationMs / 1000;
      const t = Math.min(s.jumpT / jumpDur, 1);
      if (t < 0.22) {
        // Bật lên: kéo dài người
        scaleY = 1.14; scaleX = 0.9;
      } else if (t > 0.78) {
        // Sắp tiếp đất: hơi co lại
        scaleY = 0.94; scaleX = 1.05;
      }
      if (t > 0.15 && t < 0.85) tucked = true; // Co chân giữa cú nhảy
    } else if (s.landT > 0) {
      // Squash khi tiếp đất
      const k = Math.max(s.landT / 0.18, 0);
      scaleY = 1 - 0.2 * k;
      scaleX = 1 + 0.2 * k;
    } else if (s.crouch) {
      // Lấy đà trước khi nhảy
      scaleY = 0.9; scaleX = 1.08;
    }

    ctx.save();
    // Dịch tới vị trí cừu, flip ngang để mặt hướng theo chiều di chuyển (sang trái)
    ctx.translate(s.x, s.y + (s.jumpY || 0));
    ctx.scale(-scaleX, scaleY);

    // Flash trắng khi được đếm
    if (s.countFlash > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
    }

    // Thân (bông) — vẽ quanh gốc (0,0)
    ctx.fillStyle = c.sheepWool;
    const woolCircles = [
      [-14, -6, 9], [-6, -10, 10], [2, -10, 10], [10, -8, 9], [16, -2, 8],
      [-14, 4, 8], [-6, 2, 9], [2, 2, 9], [10, 4, 8],
    ];
    for (const [ox, oy, r] of woolCircles) {
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Bóng dưới bông cho chiều sâu
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.arc(0, 6, 14, 0, Math.PI);
    ctx.fill();

    // Đầu (bên +x, sau flip sẽ hướng sang trái = hướng di chuyển)
    const headX = 20;
    const headY = -2;
    ctx.fillStyle = c.sheepFace;
    ctx.fillRect(headX - 6, headY - 8, 14, 16); // mặt
    // Tai
    ctx.fillRect(headX - 10, headY - 6, 5, 8);
    ctx.fillRect(headX + 7, headY - 6, 5, 8);
    // Mắt (trợn tròn khi nhảy!)
    const eyeH = s.jumping ? 6 : 5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX - 2, headY - 4, 4, eyeH);
    ctx.fillRect(headX + 4, headY - 4, 4, eyeH);
    ctx.fillStyle = '#000000';
    const pupilY = s.jumping ? headY - 2 : headY - 3; // Mắt nhìn lên khi bay
    ctx.fillRect(headX - 1, pupilY, 2, 3);
    ctx.fillRect(headX + 5, pupilY, 2, 3);
    // Bông trên đầu
    ctx.fillStyle = c.sheepWool;
    ctx.beginPath();
    ctx.arc(headX + 1, headY - 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // Chân
    ctx.fillStyle = c.sheepFace;
    if (tucked) {
      // Co chân lên khi đang bay qua rào
      ctx.fillRect(-12, 4, 5, 7);
      ctx.fillRect(-4, 4, 5, 7);
      ctx.fillRect(6, 4, 5, 7);
      ctx.fillRect(14, 4, 5, 7);
    } else {
      // Chạy: 2 cặp chân đung đưa ngược pha
      const legSwing = Math.sin(s.legPhase) * 5;
      const legSwing2 = Math.sin(s.legPhase + Math.PI) * 5;
      ctx.fillRect(-14 + legSwing2, 8, 4, 12 - Math.abs(legSwing2) * 0.5);
      ctx.fillRect(-8 + legSwing, 8, 4, 12 - Math.abs(legSwing) * 0.5);
      ctx.fillRect(8 + legSwing, 8, 4, 12 - Math.abs(legSwing) * 0.5);
      ctx.fillRect(14 + legSwing2, 8, 4, 12 - Math.abs(legSwing2) * 0.5);
    }

    ctx.restore();

    // Dấu tick khi đã đếm (vẽ ở tọa độ thế giới, không flip)
    const wy = s.y + (s.jumpY || 0);
    if (s.counted) {
      ctx.save();
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', s.x, wy - 22);
      ctx.restore();
    }

    // Score popup
    if (s.scorePop) {
      ctx.save();
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      const popY = wy - 30 - (0.8 - s.scorePop.timer) * 30;
      ctx.globalAlpha = Math.min(1, s.scorePop.timer * 2);
      ctx.fillText(s.scorePop.text, s.x, popY);
      ctx.restore();
    }
  }

  drawHUD(ctx) {
    const c = this.cfg.colors;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, this.w, 44);

    ctx.fillStyle = c.text;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.cfg.text.sheepCounted}: ${this.counted}`, 16, 28);

    ctx.textAlign = 'center';
    ctx.fillStyle = c.textDim;
    ctx.font = '14px sans-serif';
    ctx.fillText(`${this.cfg.text.target}: ${this.cfg.flow.targetSheep}`, this.w / 2, 28);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${this.score} đ`, this.w - 16, 28);

    // Combo
    if (this.combo >= 5) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Combo x${this.combo}!`, this.w / 2, 62);
    }

    // Nút tỉnh dậy (góc dưới)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    const btnW = 110, btnH = 32, btnX = this.w - btnW - 12, btnY = this.h - btnH - 12;
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    ctx.fillStyle = c.text;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.cfg.text.wakeUp, btnX + btnW / 2, btnY + 21);

    // Lưu vị trí nút để xử lý click
    this.wakeBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
    ctx.restore();
  }

  // ===== GAME LOOP =====

  run() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this.update(dt);
      this.render();
      if (this.state !== SHEEP_DREAM_FSM.IDLE) {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  destroy() {
    this.detachInput();
    this.state = SHEEP_DREAM_FSM.IDLE;
  }
}
