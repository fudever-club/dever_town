/**
 * TilePool: Quản lý tái sử dụng (Object Pooling) các Tile Images trong WorldScene.
 * Giúp triệt tiêu Garbage Collection spikes và micro-stutter khi chuyển phòng / load room.
 */
export class TilePool {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} poolSize - Số lượng sprite khởi tạo trước (mặc định 600 ô cho map 25x19 = 475 ô)
   */
  constructor(scene, poolSize = 600) {
    this.scene = scene;
    this.pool = [];
    this.active = [];

    // Tạo sẵn pool sprites ẩn
    for (let i = 0; i < poolSize; i++) {
      const img = scene.add.image(-9999, -9999, 'town_tileset', 0);
      img.setVisible(false);
      img.setActive(false);
      this.pool.push(img);
    }
  }

  /**
   * Lấy một tile sprite từ pool và đặt vị trí / frame
   * @param {number} x
   * @param {number} y
   * @param {number} frame
   * @param {number} depth
   * @returns {Phaser.GameObjects.Image}
   */
  acquire(x, y, frame, depth = 0) {
    let img = null;
    if (this.pool.length > 0) {
      img = this.pool.pop();
    } else {
      // Khi pool hết (ví dụ map đặc biệt to), tạo bổ sung
      img = this.scene.add.image(-9999, -9999, 'town_tileset', 0);
    }

    img.setPosition(x, y);
    img.setFrame(frame);
    img.setDepth(depth);
    img.setVisible(true);
    img.setActive(true);

    this.active.push(img);
    return img;
  }

  /**
   * Thu hồi toàn bộ tile đang active về pool (không destroy đối tượng)
   */
  releaseAll() {
    for (let i = 0; i < this.active.length; i++) {
      const img = this.active[i];
      img.setVisible(false);
      img.setActive(false);
      img.setPosition(-9999, -9999);
      this.pool.push(img);
    }
    this.active.length = 0;
  }

  /**
   * Huỷ toàn bộ pool khi Scene bị shutdown / destroy
   */
  destroy() {
    this.releaseAll();
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].destroy();
    }
    this.pool = [];
    this.active = [];
  }
}
