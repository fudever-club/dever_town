/**
 * DEVER TOWN — FISHING ENGINE (Phase D2 — Campus Jobs: Câu Cá Hồ Vịt)
 *
 * Stardew-style fishing tại Hồ Vịt (main_hall):
 *   idle -> casting -> waiting -> hooked -> minigame -> caught | escaped
 *
 * - idle:     bờ cỏ, cần câu, prompt quăng cần.
 * - casting:  giữ E / nút (hoặc click-drag trên mặt hồ) để chọn khoảng cách.
 * - waiting:  phao trôi, chờ cá cắn câu (ngẫu nhiên 3-9s).
 * - hooked:   "!" + phao chìm — giật cần trong 1.4s để dính cá.
 * - minigame: giữ cá trong thanh xanh (giữ để nâng, thả để hạ), thanh tiến
 *             độ đầy = bắt được cá, về 0 = cá thoát.
 * - caught:   nhận D-Coin qua walletManager.earn(wage, 'job_fishing').
 * - escaped:  cá thoát, quay lại idle.
 *
 * 3 bậc cá (Hưng duyệt 3): Cá rô phi (dễ), Cá chép (trung bình),
 * Cá vàng hiếm (nhanh/lạng, lương rare).
 *
 * Pattern theo BaristaSimulatorEngine: constructor(canvas, juiceFX,
 * callbacks), layoutView/toViewCoords/resize, input handlers, update, render.
 */

import { FISHING_CONFIG, FISHING_STATES, FISHING_WAGES, rollFishTier } from '../../../config/fishingConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';
import { walletManager } from '../../../managers/WalletManager.js';
import { isTouchDevice } from '../common/touchHints.js';

const S = FISHING_STATES;
const CFG = FISHING_CONFIG;

const TIER_COLORS = {
  rophi: { body: '#94a3b8', fin: '#64748b', label: '#e2e8f0' },
  cachep: { body: '#fb923c', fin: '#c2410c', label: '#fdba74' },
  cavang: { body: '#fbbf24', fin: '#b45309', label: '#fde68a' },
};

export class FishingEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks; // { onCatch, onEscape, onStateChange }
    // Hint điều khiển in-canvas phải đúng thiết bị (giống BaristaSimulatorEngine).
    this.isTouch = isTouchDevice();

    // Camera view: logic luôn chạy trong 640x360; render áp transform.
    this.viewScale = 1;
    this.viewOX = 0;
    this.viewOY = 0;
    this.layoutView(canvas.width, canvas.height);

    // Aim bằng click-drag trên mặt hồ.
    this.aiming = false;
    this.aimX = 0;
    this.aimY = 0;

    this.reset();
  }

  reset() {
    this.state = S.IDLE;
    this.animTime = 0;

    // Casting
    this.castPower = 0;
    this.charging = false;
    this.bobber = { x: 320, y: 96, tx: 320, ty: 200, flyT: 0, flying: false };

    // Waiting / hooked
    this.waitTimer = 0;
    this.hookTimer = 0;
    this.biteFlash = 0;

    // Minigame
    this.tierKey = 'rophi';
    this.tier = CFG.tiers.rophi;
    this.fishY = 180;
    this.fishVel = 0;
    this.fishDir = 1;
    this.dartT = 0;
    this.barY = 180;
    this.barVel = 0;
    this.holding = false;
    this.progress = CFG.minigame.startProgress;

    // Kết quả
    this.lastCatch = null;   // { tierKey, tierName, wage, balance }
    this.resultTimer = 0;
  }

  // ---------------- FSM ----------------

  setState(next) {
    if (this.state === next) return;
    this.state = next;
    this.callbacks.onStateChange?.(next);
  }

  backToIdle() {
    this.reset(); // reset() đặt state='idle' nhưng không notify...
    this.callbacks.onStateChange?.(S.IDLE); // ...nên notify trực tiếp cho UI/test.
  }

  startCharge() {
    if (this.state !== S.IDLE) return;
    this.setState(S.CASTING);
    this.charging = true;
    this.castPower = 0;
    audioManager.playClick?.();
  }

  releaseCast(targetX = null, targetY = null) {
    if (this.state !== S.CASTING) return;
    this.charging = false;

    // Điểm rơi của phao: click-drag cho tọa độ trực tiếp, giữ E cho lực.
    const c = CFG.cast;
    let tx, ty;
    if (targetX !== null && targetY !== null) {
      tx = targetX;
      ty = targetY;
    } else {
      const dist = c.minDistPx + this.castPower * (c.maxDistPx - c.minDistPx);
      tx = 320 + (Math.random() - 0.5) * 60;
      ty = 130 + dist * 0.85;
    }
    // Kẹp trong vùng mặt hồ vẽ được.
    tx = Math.max(70, Math.min(570, tx));
    ty = Math.max(130, Math.min(340, ty));

    this.bobber.tx = tx;
    this.bobber.ty = ty;
    this.bobber.flyT = 0;
    this.bobber.flying = true;
    this.bobber.x = 320;
    this.bobber.y = 96;
    this.setState(S.WAITING);
    this.waitTimer = CFG.wait.minSec + Math.random() * (CFG.wait.maxSec - CFG.wait.minSec);
    audioManager.playClick?.();
  }

  startMinigame() {
    if (this.state !== S.HOOKED) return;
    this.tierKey = rollFishTier();
    this.tier = CFG.tiers[this.tierKey];
    const g = CFG.minigame;
    this.fishY = g.gaugeY + g.gaugeH / 2;
    this.fishVel = 0;
    this.fishDir = Math.random() < 0.5 ? -1 : 1;
    this.dartT = 0;
    this.barY = this.fishY;
    this.barVel = 0;
    this.holding = false;
    this.progress = CFG.minigame.startProgress;
    this.setState(S.MINIGAME);
    audioManager.playClick?.();
  }

  onCaught() {
    const wage = FISHING_WAGES[this.tier.wageKey] ?? FISHING_WAGES.common;
    let balance = null;
    try {
      balance = walletManager.earn(wage, 'job_fishing');
    } catch (err) {
      console.error('[Fishing] walletManager.earn that bai:', err);
    }
    this.lastCatch = {
      tierKey: this.tierKey,
      tierName: this.tier.name,
      rarity: this.tier.rarity,
      wage,
      balance,
    };
    this.resultTimer = 2.6;
    this.setState(S.CAUGHT);
    audioManager.playVictory?.();
    this.juiceFX?.spawnFloatingText(`+${wage} D-Coin`, 320, 150, { color: '#fbbf24', size: 22 });
    this.juiceFX?.spawnConfetti?.(320, 170, 30);
    this.callbacks.onCatch?.(this.lastCatch);
  }

  onEscaped() {
    this.resultTimer = 1.8;
    this.setState(S.ESCAPED);
    audioManager.playClick?.();
    this.juiceFX?.spawnFloatingText('Cá thoát mất...', 320, 170, { color: '#94a3b8', size: 16 });
    this.callbacks.onEscape?.();
  }

  // ---------------- INPUT ----------------

  handleActionDown() {
    if (this.state === S.IDLE) {
      this.startCharge();
    } else if (this.state === S.HOOKED) {
      this.startMinigame();
    } else if (this.state === S.MINIGAME) {
      this.holding = true;
    } else if (this.state === S.CAUGHT || this.state === S.ESCAPED) {
      this.backToIdle();
    }
  }

  handleActionUp() {
    if (this.state === S.CASTING && this.charging) {
      this.releaseCast();
    } else if (this.state === S.MINIGAME) {
      this.holding = false;
    }
  }

  onActionTrigger() {
    this.handleActionDown();
    this.handleActionUp();
  }

  handleKeyDown(e) {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
      this.handleActionDown();
    }
  }

  handleKeyUp(e) {
    if (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') {
      this.handleActionUp();
    }
  }

  handlePointerDown(x, y) {
    const v = this.toViewCoords(x, y);
    if (this.state === S.IDLE) {
      // Click-drag trên mặt hồ = chọn khoảng cách trực tiếp.
      if (v.y > 120 && v.y < 350) {
        this.setState(S.CASTING);
        this.charging = false;
        this.aiming = true;
        this.aimX = Math.max(70, Math.min(570, v.x));
        this.aimY = Math.max(130, Math.min(340, v.y));
      } else {
        this.handleActionDown();
      }
    } else {
      this.handleActionDown();
    }
  }

  handlePointerMove(x, y) {
    if (this.aiming && this.state === S.CASTING) {
      const v = this.toViewCoords(x, y);
      this.aimX = Math.max(70, Math.min(570, v.x));
      this.aimY = Math.max(130, Math.min(340, v.y));
    }
  }

  handlePointerUp() {
    if (this.aiming && this.state === S.CASTING) {
      this.aiming = false;
      this.releaseCast(this.aimX, this.aimY);
    } else {
      this.handleActionUp();
    }
  }

  // ---------------- UPDATE ----------------

  update(dt) {
    this.animTime += dt;
    const g = CFG.minigame;

    if (this.state === S.CASTING && this.charging) {
      this.castPower = Math.min(1, this.castPower + dt / CFG.cast.chargeTimeSec);
    }

    if (this.state === S.WAITING) {
      if (this.bobber.flying) {
        // Phao bay theo parabol tới điểm đã chọn.
        this.bobber.flyT += dt / CFG.cast.flyTimeSec;
        const t = Math.min(1, this.bobber.flyT);
        const sx = 320, sy = 96;
        this.bobber.x = sx + (this.bobber.tx - sx) * t;
        this.bobber.y = sy + (this.bobber.ty - sy) * t - Math.sin(t * Math.PI) * 60;
        if (t >= 1) {
          this.bobber.flying = false;
          this.bobber.x = this.bobber.tx;
          this.bobber.y = this.bobber.ty;
          this.juiceFX?.spawnDust?.(this.bobber.x, this.bobber.y, 6, 'rgba(186, 230, 253, 0.9)');
        }
      } else {
        this.waitTimer -= dt;
        if (this.waitTimer <= 0) {
          this.setState(S.HOOKED);
          this.hookTimer = CFG.hook.windowSec;
          this.biteFlash = 0;
          audioManager.playClick?.();
        }
      }
    }

    if (this.state === S.HOOKED) {
      this.hookTimer -= dt;
      this.biteFlash += dt;
      if (this.hookTimer <= 0) {
        this.onEscaped();
      }
    }

    if (this.state === S.MINIGAME) {
      // --- Cá di chuyển: sine + đổi hướng ngẫu nhiên + lạng đột ngột (dart).
      this.dartT -= dt;
      let speed = this.tier.fishSpeedPxS * this.fishDir;
      if (this.dartT <= 0 && Math.random() < this.tier.dartChance * dt) {
        this.dartT = 0.45 + Math.random() * 0.35;
        this.fishDir = Math.random() < 0.5 ? -1 : 1;
        speed = this.tier.fishSpeedPxS * this.tier.dartSpeedMult * this.fishDir;
        this.fishVel = speed;
      } else if (this.dartT > 0) {
        speed = this.tier.dartSpeedMult * this.tier.fishSpeedPxS * this.fishDir * (this.dartT / 0.8);
      }
      // Trôi nhẹ hình sine để chuyển động tự nhiên.
      const wobble = Math.sin(this.animTime * 3.2) * 18;
      this.fishVel += ((speed + wobble) - this.fishVel) * Math.min(1, dt * 6);
      this.fishY += this.fishVel * dt;

      const top = g.gaugeY + 14;
      const bottom = g.gaugeY + g.gaugeH - 14;
      if (this.fishY < top) { this.fishY = top; this.fishDir = 1; this.fishVel = Math.abs(this.fishVel); }
      if (this.fishY > bottom) { this.fishY = bottom; this.fishDir = -1; this.fishVel = -Math.abs(this.fishVel); }

      // --- Thanh người chơi: giữ để nâng, thả để rơi.
      const b = CFG.bar;
      if (this.holding) {
        this.barVel -= b.raiseAccelPxS2 * dt;
      } else {
        this.barVel += b.gravityPxS2 * dt;
      }
      this.barVel = Math.max(-b.maxVelPxS, Math.min(b.maxVelPxS, this.barVel));
      this.barY += this.barVel * dt;
      const barHalf = this.tier.barHPx / 2;
      if (this.barY - barHalf < g.gaugeY) { this.barY = g.gaugeY + barHalf; this.barVel = 0; }
      if (this.barY + barHalf > g.gaugeY + g.gaugeH) { this.barY = g.gaugeY + g.gaugeH - barHalf; this.barVel = 0; }

      // --- Tiến độ: cá trong thanh -> đầy, ngoài thanh -> tụt.
      const inside = Math.abs(this.fishY - this.barY) <= (this.tier.barHPx + 18) / 2;
      this.progress += (inside ? this.tier.fillPerSec : -this.tier.drainPerSec) * dt;
      this.progress = Math.max(0, Math.min(100, this.progress));

      if (this.progress >= 100) {
        this.onCaught();
      } else if (this.progress <= 0) {
        this.onEscaped();
      }
    }

    if (this.state === S.CAUGHT || this.state === S.ESCAPED) {
      this.resultTimer -= dt;
      if (this.resultTimer <= 0) this.backToIdle();
    }
  }

  // ---------------- RENDER ----------------

  layoutView(w, h) {
    this.viewScale = 1;
    this.viewOX = (w - 640) / 2;
    this.viewOY = 0;
  }

  resize(w, h) {
    this.layoutView(w, h);
  }

  toViewCoords(x, y) {
    return {
      x: (x - this.viewOX) / this.viewScale,
      y: (y - this.viewOY) / this.viewScale
    };
  }

  render() {
    const ctx = this.ctx;
    const dw = this.canvas.width;
    const dh = this.canvas.height;

    ctx.clearRect(0, 0, dw, dh);
    ctx.save();
    ctx.translate(this.viewOX, this.viewOY);
    ctx.scale(this.viewScale, this.viewScale);

    this.renderPondScene(ctx);

    if (this.state === S.MINIGAME) {
      this.renderMinigameUI(ctx);
    }

    this.renderTopBarHUD(ctx);
    this.renderStatePrompt(ctx);

    ctx.restore();
  }

  renderPondScene(ctx) {
    // Bờ cỏ phía trên (ngày sáng — DAY_NIGHT_CYCLE_ENABLED=false).
    const grassGrad = ctx.createLinearGradient(0, 0, 0, 120);
    grassGrad.addColorStop(0, '#4ade80');
    grassGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, 640, 120);

    // Viền đá bờ hồ.
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 112, 640, 8);
    ctx.fillStyle = '#cbd5e1';
    for (let x = 8; x < 640; x += 32) {
      ctx.fillRect(x, 112, 18, 8);
    }

    // Mặt hồ: gradient cyan sâu dần.
    const waterGrad = ctx.createLinearGradient(0, 120, 0, 360);
    waterGrad.addColorStop(0, '#38bdf8');
    waterGrad.addColorStop(0.5, '#0ea5e9');
    waterGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 120, 640, 240);

    // Gợn sóng.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) {
      const wy = 150 + i * 30;
      const phase = Math.sin(this.animTime * 1.6 + i * 1.3) * 6;
      ctx.beginPath();
      for (let x = 0; x <= 640; x += 20) {
        const yy = wy + Math.sin((x / 640) * Math.PI * 3 + this.animTime * 1.2 + i) * 3 + phase * 0.3;
        if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // Lá sen trang trí.
    this.drawLilyPad(ctx, 120, 220, 22);
    this.drawLilyPad(ctx, 480, 290, 28);
    this.drawLilyPad(ctx, 560, 170, 18);

    // Sậy ở mép trái/phải.
    this.drawReeds(ctx, 30, 130);
    this.drawReeds(ctx, 610, 130);

    // Người câu đứng trên bờ.
    this.drawAngler(ctx, 320, 62);

    // Dây câu từ đầu cần tới phao.
    if (this.state !== S.IDLE && this.state !== S.CASTING) {
      const tipX = 372, tipY = 34;
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.quadraticCurveTo((tipX + this.bobber.x) / 2, Math.min(tipY, this.bobber.y) - 30, this.bobber.x, this.bobber.y - 8);
      ctx.stroke();
    }

    // Phao câu.
    if (this.state === S.WAITING || this.state === S.HOOKED) {
      const dip = this.state === S.HOOKED ? Math.sin(this.biteFlash * 18) * 5 - 6 : Math.sin(this.animTime * 2.4) * 2;
      const bx = this.bobber.x, by = this.bobber.y + dip;
      // Vòng lan khi cắn câu.
      if (this.state === S.HOOKED) {
        const rr = 10 + (this.biteFlash * 30) % 22;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 - rr / 40})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, this.bobber.y, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bx, by - 6, 7, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(bx, by + 2, 7, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 1.5, by - 14, 3, 8);
    }

    // Vòng ngắm khi click-drag chọn điểm quăng.
    if (this.aiming && this.state === S.CASTING) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(this.aimX, this.aimY, 16 + Math.sin(this.animTime * 6) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Thanh lực khi đang nạp (giữ E).
    if (this.state === S.CASTING && this.charging) {
      const bw = 220, bx = 320 - bw / 2, by = 250;
      ctx.fillStyle = 'rgba(10, 18, 36, 0.75)';
      ctx.beginPath();
      ctx.roundRect(bx - 8, by - 8, bw + 16, 34, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(bx, by, bw, 18);
      const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      grad.addColorStop(0, '#22c55e');
      grad.addColorStop(0.7, '#fbbf24');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, bw * this.castPower, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LỰC QUĂNG', 320, by + 34 - 12 + 18);
    }

    // "!" khi cá cắn câu.
    if (this.state === S.HOOKED) {
      const blink = Math.sin(this.biteFlash * 14) > -0.2;
      if (blink) {
        const mx = this.bobber.x, my = this.bobber.y - 52;
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const s = 20;
        ctx.moveTo(mx, my - s);
        ctx.lineTo(mx + s * 0.9, my + s * 0.55);
        ctx.lineTo(mx - s * 0.9, my + s * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 24px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', mx, my + 8);
      }
    }
  }

  drawLilyPad(ctx, x, y, r) {
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0.3, Math.PI * 2 - 0.3);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(x + r * 0.4, y - r * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawReeds(ctx, x, y) {
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      const sway = Math.sin(this.animTime * 1.8 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(x + i * 10, y + 20);
      ctx.quadraticCurveTo(x + i * 10 + sway, y - 10, x + i * 10 + sway * 2, y - 26);
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(x + i * 10 + sway * 2, y - 30, 3, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawAngler(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // Bóng.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 34, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Thân áo cam FPT.
    ctx.fillStyle = '#f26f21';
    ctx.beginPath();
    ctx.roundRect(-13, 2, 26, 28, 6);
    ctx.fill();
    // Đầu.
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 12, 0, Math.PI * 2);
    ctx.fill();
    // Nón lá.
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(18, -18);
    ctx.lineTo(0, -32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Cần câu hướng xuống hồ.
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(52, -28);
    ctx.stroke();
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(52, -28);
    ctx.lineTo(58, -34);
    ctx.stroke();
    ctx.restore();
  }

  drawFishIcon(ctx, x, y, size, tierKey, flip) {
    const c = TIER_COLORS[tierKey] || TIER_COLORS.rophi;
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    // Đuôi.
    ctx.fillStyle = c.fin;
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, 0);
    ctx.lineTo(-size * 1.2, -size * 0.45);
    ctx.lineTo(-size * 1.2, size * 0.45);
    ctx.closePath();
    ctx.fill();
    // Thân.
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.75, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // Vây.
    ctx.fillStyle = c.fin;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.35);
    ctx.lineTo(size * 0.15, -size * 0.7);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    // Mắt.
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(size * 0.4, -size * 0.1, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderMinigameUI(ctx) {
    const g = CFG.minigame;
    const tierColor = TIER_COLORS[this.tierKey] || TIER_COLORS.rophi;

    // Panel gauge bên phải — vùng chạm lớn cho mobile.
    ctx.fillStyle = 'rgba(10, 18, 36, 0.72)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(g.gaugeX - 26, g.gaugeY - 40, g.gaugeW + 52, g.gaugeH + 80, 12);
    ctx.fill();
    ctx.stroke();

    // Rãnh gauge.
    ctx.fillStyle = 'rgba(2, 32, 71, 0.9)';
    ctx.beginPath();
    ctx.roundRect(g.gaugeX, g.gaugeY, g.gaugeW, g.gaugeH, 10);
    ctx.fill();

    // Thanh xanh của người chơi (giữ để nâng, thả để hạ).
    const barHalf = this.tier.barHPx / 2;
    const barGrad = ctx.createLinearGradient(g.gaugeX, 0, g.gaugeX + g.gaugeW, 0);
    barGrad.addColorStop(0, '#10b981');
    barGrad.addColorStop(1, '#34d399');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(g.gaugeX + 4, this.barY - barHalf, g.gaugeW - 8, this.tier.barHPx, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Icon cá.
    const flip = this.fishVel < -20;
    this.drawFishIcon(ctx, g.gaugeX + g.gaugeW / 2, this.fishY, 20, this.tierKey, flip);

    // Thanh tiến độ (dọc, bên trái gauge).
    const pX = g.gaugeX - 18;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(pX, g.gaugeY, 10, g.gaugeH, 5);
    ctx.fill();
    const pH = (g.gaugeH * this.progress) / 100;
    const pGrad = ctx.createLinearGradient(0, g.gaugeY + g.gaugeH, 0, g.gaugeY);
    pGrad.addColorStop(0, '#38bdf8');
    pGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = pGrad;
    if (pH > 4) {
      ctx.beginPath();
      ctx.roundRect(pX, g.gaugeY + g.gaugeH - pH, 10, pH, 5);
      ctx.fill();
    }

    // Tên cá + độ hiếm.
    ctx.textAlign = 'center';
    ctx.fillStyle = tierColor.label;
    ctx.font = '800 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.tier.name.toUpperCase(), g.gaugeX + g.gaugeW / 2, g.gaugeY - 22);
    ctx.fillStyle = this.tier.rarity === 'rare' ? '#fbbf24' : '#94a3b8';
    ctx.font = '700 10px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.tier.rarity === 'rare' ? 'HIẾM' : 'THƯỜNG', g.gaugeX + g.gaugeW / 2, g.gaugeY - 8);

    // % tiến độ.
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`${Math.round(this.progress)}%`, g.gaugeX + g.gaugeW / 2, g.gaugeY + g.gaugeH + 24);
  }

  renderTopBarHUD(ctx) {
    const dw = 640;
    // Chừa 150px bên phải cho nhãn bậc cá của panel minigame (tránh đè chữ).
    const barW = dw - 28 - 150;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 18, 36, 0.82)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 8, barW, 32, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 13px "Tilt Neon", "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CÂU CÁ HỒ VỊT', 26, 29);

    let balance = 0;
    try { balance = walletManager.getBalance?.() ?? 0; } catch (_) {}
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${balance} D-Coin`, 14 + barW - 12, 29);
    ctx.restore();
  }

  renderStatePrompt(ctx) {
    ctx.save();
    ctx.textAlign = 'center';
    const touch = this.isTouch;
    const hint = (t1, t2, color = '#f8fafc') => {
      ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = 'rgba(10, 18, 36, 0.7)';
      const w = ctx.measureText(t1).width + 36;
      ctx.beginPath();
      ctx.roundRect(320 - w / 2, 322, w, 30, 15);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillText(t1, 320, 342);
      if (t2) {
        ctx.font = '600 11px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(t2, 320, 312);
      }
    };

    if (this.state === S.IDLE) {
      hint(
        touch ? 'GIỮ nút để quăng cần' : 'GIỮ [E] để quăng cần',
        'hoặc click-drag trên mặt hồ để chọn điểm rơi'
      );
    } else if (this.state === S.WAITING && !this.bobber.flying) {
      hint('Chờ cá cắn câu...', 'khi thấy "!" hãy giật cần ngay', '#38bdf8');
    } else if (this.state === S.HOOKED) {
      const urgent = this.hookTimer < 0.6;
      hint(
        touch ? 'CHẠM NGAY để giật cần!' : 'NHẤN [E] NGAY để giật cần!',
        null,
        urgent ? '#ef4444' : '#fbbf24'
      );
    } else if (this.state === S.MINIGAME) {
      hint(
        touch ? 'GIỮ để nâng thanh • THẢ để hạ' : 'GIỮ [E] để nâng thanh • THẢ để hạ',
        'giữ cá trong thanh xanh để đầy tiến độ'
      );
    } else if (this.state === S.CAUGHT && this.lastCatch) {
      ctx.font = '800 22px "Tilt Neon", "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`BẮT ĐƯỢC ${this.lastCatch.tierName.toUpperCase()}!`, 320, 200);
      ctx.font = '700 15px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`+${this.lastCatch.wage} D-Coin vào ví`, 320, 226);
    } else if (this.state === S.ESCAPED) {
      ctx.font = '800 20px "Tilt Neon", "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('CÁ THOÁT MẤT RỒI!', 320, 200);
      ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText('Thử lại nhé', 320, 224);
    }
    ctx.restore();
  }
}
