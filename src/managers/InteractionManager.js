import Phaser from 'phaser';

export class InteractionManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} options
   * @param {Function} options.onInteract
   */
  constructor(scene, { onInteract } = {}) {
    this.scene = scene;
    this.onInteract = onInteract;
    this.zones = [];
    this.activeZone = null;
    this.promptContainer = null;
    this.promptText = null;

    // Hysteresis Radius Thresholds
    this.R_IN = 52;   // Bán kính kích hoạt vào vùng
    this.R_OUT = 70;  // Bán kính rời khỏi vùng

    this.createPromptBadge();
  }

  createPromptBadge() {
    this.promptContainer = this.scene.add.container(0, 0);
    this.promptContainer.setDepth(1000002);
    this.promptContainer.setVisible(false);

    this.promptBg = this.scene.add.graphics();
    this.promptText = this.scene.add.text(0, 0, '[E] Tương tác', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontWeight: '700',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.promptContainer.add([this.promptBg, this.promptText]);

    // Hiệu ứng nhấp nhô nhẹ (Bobbing tween)
    this.scene.tweens.add({
      targets: this.promptContainer,
      y: '-=4',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setZones(zoneList) {
    this.zones = zoneList || [];
    this.activeZone = null;
    if (this.promptContainer) {
      this.promptContainer.setVisible(false);
    }
  }

  update(player) {
    if (!player || !this.zones || this.zones.length === 0) {
      if (this.promptContainer) this.promptContainer.setVisible(false);
      this.activeZone = null;
      return;
    }

    const tileSize = 32;
    let closestZone = null;
    let minDistance = Infinity;

    for (const z of this.zones) {
      const zX = z.tileX * tileSize + tileSize / 2;
      const zY = z.tileY * tileSize + tileSize / 2;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, zX, zY);

      if (dist < minDistance) {
        minDistance = dist;
        closestZone = { ...z, dist };
      }
    }

    // Thuật toán Hysteresis Dual-Threshold
    if (this.activeZone) {
      // Đang ở trong zone -> Chỉ thoát khi khoảng cách > R_OUT
      const zX = this.activeZone.tileX * tileSize + tileSize / 2;
      const zY = this.activeZone.tileY * tileSize + tileSize / 2;
      const currentDist = Phaser.Math.Distance.Between(player.x, player.y, zX, zY);

      if (currentDist > this.R_OUT) {
        this.activeZone = null;
        this.promptContainer.setVisible(false);
      }
    } else {
      // Chưa ở trong zone -> Chỉ kích hoạt khi khoảng cách <= R_IN
      if (closestZone && closestZone.dist <= this.R_IN) {
        this.activeZone = closestZone;
      }
    }

    // Cập nhật vị trí và nội dung Prompt Badge
    if (this.activeZone) {
      const label = this.activeZone.label || `[E] ${this.activeZone.name}`;
      this.promptText.setText(label);

      // Vẽ lại nền phát sáng neon
      const padX = 14;
      const padY = 6;
      const w = this.promptText.width + padX;
      const h = this.promptText.height + padY;

      this.promptBg.clear();
      this.promptBg.fillStyle(0x0f172a, 0.9);
      this.promptBg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      this.promptBg.lineStyle(1.5, 0x38bdf8, 0.85);
      this.promptBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

      this.promptContainer.setPosition(Math.round(player.x), Math.round(player.y - 48));
      this.promptContainer.setVisible(true);

      // Kiểm tra phím E
      if (this.scene.inputController && this.scene.inputController.isActionJustDown()) {
        if (this.onInteract) {
          this.onInteract(this.activeZone);
        }
      }
    } else {
      if (this.promptContainer) {
        this.promptContainer.setVisible(false);
      }
    }
  }

  destroy() {
    if (this.promptContainer) {
      this.promptContainer.destroy();
    }
  }
}
