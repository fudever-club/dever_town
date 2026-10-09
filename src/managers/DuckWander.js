import {
  DUCK_CONFIG,
  DUCK_SWIM_BOUNDS,
  DUCK_ROOM_ID,
  DUCK_FLOOR_INDEX,
} from '../config/pondConfig.js';

/**
 * DuckWander — Hệ vịt trời trang trí bơi quanh hồ vườn FUDA (sân Tòa Alpha).
 *
 * Thiết kế cô lập, không phụ thuộc hệ AI chung (codebase chưa có AI lang thang):
 * - 3 vịt bơi trong hình chữ nhật DUCK_SWIM_BOUNDS (pixel), đổi hướng ngẫu nhiên
 *   mỗi vài giây, thỉnh thoảng đứng yên "ríu rít".
 * - Sprite lật ngang theo hướng bơi (flipX), nhấp nhô hình sin, đập cánh 2 frame.
 * - Thuần trang trí: không physics body, không va chạm, không tương tác.
 * - Tự dọn vịt khi rời phòng/đổi tầng (setRoom), không rò rỉ object.
 */
export class DuckWander {
  /**
   * @param {Phaser.Scene} scene — WorldScene
   */
  constructor(scene) {
    this.scene = scene;
    this.ducks = [];
    this.active = false;
    this._elapsed = 0;
  }

  /**
   * Gọi khi loadRoom: spawn vịt nếu đúng phòng + tầng có hồ, ngược lại dọn sạch.
   * @param {string} roomId
   * @param {number} floorIndex
   */
  setRoom(roomId, floorIndex = 0) {
    this.clear();
    if (roomId === DUCK_ROOM_ID && floorIndex === DUCK_FLOOR_INDEX) {
      this._spawnDucks();
      this.active = true;
    } else {
      this.active = false;
    }
  }

  _spawnDucks() {
    const cfg = DUCK_CONFIG;
    const b = DUCK_SWIM_BOUNDS;
    for (let i = 0; i < cfg.count; i++) {
      const x = b.x0 + Math.random() * (b.x1 - b.x0);
      const y = b.y0 + Math.random() * (b.y1 - b.y0);
      const img = this.scene.add.image(x, y, 'duck', 0);
      // Vịt nổi trên mặt nước: depth theo Y để lớp đúng khi camera lia.
      img.setDepth(y + 10);
      this.ducks.push({
        img,
        x,
        y,
        angle: Math.random() * Math.PI * 2,
        speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
        state: 'swim', // 'swim' | 'idle'
        stateTimer: cfg.steerTimeMin + Math.random() * (cfg.steerTimeMax - cfg.steerTimeMin),
        paddleTimer: Math.random() * (1 / cfg.paddleFps),
        phase: Math.random() * Math.PI * 2, // pha nhấp nhô riêng
      });
    }
  }

  /**
   * @param {number} time — ms
   * @param {number} delta — ms
   */
  update(time, delta) {
    if (!this.active || this.ducks.length === 0) return;
    const cfg = DUCK_CONFIG;
    const b = DUCK_SWIM_BOUNDS;
    const dt = Math.min(delta / 1000, 0.1);
    this._elapsed += dt;

    for (const d of this.ducks) {
      d.stateTimer -= dt;

      if (d.stateTimer <= 0) {
        // Đổi hành vi: bơi tiếp (hướng mới) hoặc đứng yên rỉa lông.
        if (d.state === 'swim' && Math.random() < cfg.idleChance) {
          d.state = 'idle';
          d.stateTimer = cfg.idleTimeMin + Math.random() * (cfg.idleTimeMax - cfg.idleTimeMin);
        } else {
          d.state = 'swim';
          d.angle = Math.random() * Math.PI * 2;
          d.stateTimer = cfg.steerTimeMin + Math.random() * (cfg.steerTimeMax - cfg.steerTimeMin);
        }
      }

      if (d.state === 'swim') {
        d.x += Math.cos(d.angle) * d.speed * dt;
        d.y += Math.sin(d.angle) * d.speed * dt * 0.7; // hồ dẹt theo Y, bơi Y chậm hơn

        // Nảy lại khi chạm mép hồ (giữ vịt trong nước).
        if (d.x < b.x0) { d.x = b.x0; d.angle = Math.PI - d.angle; }
        if (d.x > b.x1) { d.x = b.x1; d.angle = Math.PI - d.angle; }
        if (d.y < b.y0) { d.y = b.y0; d.angle = -d.angle; }
        if (d.y > b.y1) { d.y = b.y1; d.angle = -d.angle; }

        // Đập cánh khi bơi, khép cánh khi nghỉ.
        d.paddleTimer += dt;
        if (d.paddleTimer >= 1 / cfg.paddleFps) {
          d.paddleTimer = 0;
          d.img.setFrame(d.img.frame.name === 0 ? 1 : 0);
        }
      }

      // Lật sprite theo hướng bơi (vịt vẽ nhìn sang phải).
      const movingRight = Math.cos(d.angle) >= 0;
      d.img.setFlipX(!movingRight);

      // Nhấp nhô mặt nước.
      const bob = Math.sin(this._elapsed * cfg.bobFrequency + d.phase) * cfg.bobAmplitude;
      d.img.setPosition(d.x, d.y + bob);
      d.img.setDepth(d.y + 10);
    }
  }

  /** Dọn toàn bộ vịt (đổi phòng/tầng). */
  clear() {
    for (const d of this.ducks) {
      if (d.img) d.img.destroy();
    }
    this.ducks = [];
    this.active = false;
  }

  /** Số vịt đang hoạt động (dùng cho test). */
  getDuckCount() {
    return this.ducks.length;
  }
}
