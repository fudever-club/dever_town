/**
 * DEVER TOWN - CANVAS JUICE & GAME FEEL ENGINE
 * Cung cấp phản hồi xúc giác giác quan cho toàn bộ minigames:
 * 1. Micro-Camera Shake
 * 2. Floating Score/Combat Text
 * 3. Confetti Celebration Particles
 * 4. Sparkles & Fire Trails
 * 5. Bọt sóng & Khói ấm ASMR
 */

export class CanvasJuiceFX {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.shakeOffset = { x: 0, y: 0 };
  }

  /** Rung lắc camera */
  shake(intensity = 6, duration = 0.15) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  /** Chữ bay ăn mừng / điểm số */
  spawnFloatingText(text, x, y, options = {}) {
    this.floatingTexts.push({
      text,
      x,
      y,
      startY: y,
      color: options.color || '#fbbf24',
      size: options.size || 18,
      duration: options.duration || 1.1,
      life: options.duration || 1.1,
      scale: 0.6,
      vx: (Math.random() - 0.5) * 15,
      vy: -35 - Math.random() * 20
    });
  }

  /** Pháo hoa Confetti */
  spawnConfetti(x, y, count = 25) {
    const colors = ['#f26f21', '#22c55e', '#38bdf8', '#fbbf24', '#ec4899', '#a855f7', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 80;
      this.particles.push({
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        gravity: 120,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 4 + Math.random() * 4,
        height: 2 + Math.random() * 3,
        alpha: 1,
        life: 1.2,
        maxLife: 1.2
      });
    }
  }

  /** Tia lửa / Vết bốc cháy (On Fire / Spike) */
  spawnSparkles(x, y, count = 8, color = '#f97316') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 50;
      this.particles.push({
        type: 'sparkle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 30,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1,
        life: 0.5,
        maxLife: 0.5
      });
    }
  }

  /** Khói ấm cà phê / Hơi nước ASMR */
  spawnSteam(x, y, count = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'steam',
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -18 - Math.random() * 12,
        gravity: -5,
        size: 4 + Math.random() * 5,
        growth: 8,
        alpha: 0.45,
        color: 'rgba(255, 255, 255, ',
        life: 1.4,
        maxLife: 1.4
      });
    }
  }

  update(dt) {
    // 1. Cập nhật Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const decay = Math.max(0, this.shakeDuration / 0.15);
      this.shakeOffset.x = (Math.random() * 2 - 1) * this.shakeIntensity * decay;
      this.shakeOffset.y = (Math.random() * 2 - 1) * this.shakeIntensity * decay;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }

    // 2. Cập nhật Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      const progress = 1 - ft.life / ft.duration;
      // Nhịp nảy lúc đầu sau đó trôi nhẹ
      if (progress < 0.25) {
        ft.scale = 0.6 + (progress / 0.25) * 0.6; // Nảy lên 1.2
      } else {
        ft.scale = 1.2 - ((progress - 0.25) / 0.75) * 0.2; // Trở về 1.0
      }
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 3. Cập nhật Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;

      if (p.type === 'confetti') {
        p.rotation += p.rotSpeed * dt;
      } else if (p.type === 'steam') {
        p.size += p.growth * dt;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Vẽ Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'steam') {
        ctx.fillStyle = p.color + (p.alpha * 0.35) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Vẽ Floating Texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      const alpha = Math.min(1, ft.life / 0.3);
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${Math.round(ft.size * ft.scale)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Viền bóng đen
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Chữ nổi màu
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}
