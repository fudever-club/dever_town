/**
 * DEVER TOWN - WIND SLASH ARC FX (HIỆU ỨNG VỆT KHÍ CHÉM VÕ THUẬT)
 * Tái hiện vệt chém khí vòng cung bán nguyệt (Crescent Wind Arc)
 * khi nhân vật tung đòn đấm (Punch - phím J) hoặc đá (Kick - phím K)
 * tham chiếu chính xác từ video & motion sprite sheet người dùng cung cấp.
 */

export class WindSlashFX {
  constructor(scene) {
    this.scene = scene;
    this.slashes = [];
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(99999);
  }

  /**
   * Tạo vệt khí chém vòng cung
   * @param {number} x - Tọa độ X của nắm đấm / bàn chân
   * @param {number} y - Tọa độ Y
   * @param {string} direction - Hướng tung đòn ('down', 'left', 'right', 'up')
   * @param {string} actionType - 'punch' | 'kick'
   */
  spawnSlash(x, y, direction = 'down', actionType = 'punch') {
    let baseAngle = 0;
    if (direction === 'right') baseAngle = 0;
    else if (direction === 'down') baseAngle = Math.PI / 2;
    else if (direction === 'left') baseAngle = Math.PI;
    else if (direction === 'up') baseAngle = -Math.PI / 2;

    const isKick = actionType === 'kick';
    const arcSpan = isKick ? Math.PI * 0.75 : Math.PI * 0.45;
    const radius = isKick ? 24 : 16;
    const duration = isKick ? 0.16 : 0.12;

    this.slashes.push({
      x,
      y,
      baseAngle,
      arcSpan,
      radius,
      duration,
      life: duration,
      color: 0x38bdf8,
      isKick
    });
  }

  update(dt) {
    this.graphics.clear();
    if (this.slashes.length === 0) return;

    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.slashes.splice(i, 1);
        continue;
      }

      const progress = 1 - s.life / s.duration;
      const alpha = Math.sin((1 - progress) * Math.PI);
      const currentRadius = s.radius * (0.7 + progress * 0.4);

      // 1. Vệt sáng chính màu xanh ngọc Cyber Cyan
      this.graphics.lineStyle(s.isKick ? 3.5 : 2.5, 0x38bdf8, alpha * 0.9);
      this.graphics.beginPath();
      const startAngle = s.baseAngle - s.arcSpan / 2;
      const endAngle = s.baseAngle + s.arcSpan / 2;
      this.graphics.arc(s.x, s.y, currentRadius, startAngle, endAngle, false);
      this.graphics.strokePath();

      // 2. Lõi vệt chém màu trắng sáng (White Core)
      this.graphics.lineStyle(1.5, 0xffffff, alpha * 0.95);
      this.graphics.beginPath();
      this.graphics.arc(s.x, s.y, currentRadius - 1, startAngle + 0.1, endAngle - 0.1, false);
      this.graphics.strokePath();

      // 3. Tia bụi gió lượn
      this.graphics.fillStyle(0x7dd3fc, alpha * 0.75);
      const tipX = s.x + Math.cos(endAngle) * currentRadius;
      const tipY = s.y + Math.sin(endAngle) * currentRadius;
      this.graphics.fillCircle(tipX, tipY, 2);
    }
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
    this.slashes = [];
  }
}
