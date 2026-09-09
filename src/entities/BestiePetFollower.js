/**
 * BestiePetFollower: Thú cưng / Linh vật Buggy đồng hành chạy theo sau nhân vật khi đạt mốc Bestie Streak với bạn bè
 */
import Phaser from 'phaser';

export class BestiePetFollower extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Sprite} targetPlayer
   * @param {Object} petInfo
   */
  constructor(scene, targetPlayer, petInfo = {}) {
    super(scene, targetPlayer.x - 24, targetPlayer.y - 10);
    this.scene = scene;
    this.targetPlayer = targetPlayer;
    this.petInfo = petInfo;

    scene.add.existing(this);
    this.setDepth(targetPlayer.depth + 1);

    this.initVisuals();
    this.initFollowerTween();
  }

  initVisuals() {
    this.removeAll(true);

    const icon = this.petInfo.icon || '🐞';
    const isMaxLevel = this.petInfo.level >= 4;
    const isTechLevel = this.petInfo.level === 3;

    // 1. Vòng hào quang sáng nhẹ dưới chân Pet
    const auraGfx = this.scene.add.graphics();
    auraGfx.fillStyle(isMaxLevel ? 0xfbbf24 : isTechLevel ? 0x00B2FF : 0x10b981, 0.25);
    auraGfx.fillEllipse(0, 10, 20, 10);
    this.add(auraGfx);

    // 2. Icon Thú Cưng (Emoji Chibi lớn)
    this.petSprite = this.scene.add.text(0, -2, icon, {
      fontSize: '22px',
      align: 'center'
    }).setOrigin(0.5, 0.5);
    this.add(this.petSprite);

    // 3. Name Tag nhỏ xinh xắn
    const tagText = this.scene.add.text(0, -18, `Pet ${this.petInfo.name ? this.petInfo.name.split(' ')[0] : 'Buggy'}`, {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '9.5px',
      fontWeight: '700',
      color: '#ffffff',
      backgroundColor: isMaxLevel ? 'rgba(217, 119, 6, 0.85)' : 'rgba(16, 185, 129, 0.85)',
      padding: { x: 4, y: 1 }
    }).setOrigin(0.5, 0.5);
    this.add(tagText);
  }

  initFollowerTween() {
    // Hiệu ứng nhấp nhô (bobbing float)
    this.scene.tweens.add({
      targets: this.petSprite,
      y: -6,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  updatePet(petInfo) {
    this.petInfo = petInfo;
    this.initVisuals();
  }

  update() {
    if (!this.targetPlayer || !this.targetPlayer.active) return;

    // Khoảng cách mục tiêu (bay lệch sau lưng nhân vật)
    const targetOffsetX = this.targetPlayer.flipX ? 22 : -22;
    const targetOffsetY = -8;
    const destX = this.targetPlayer.x + targetOffsetX;
    const destY = this.targetPlayer.y + targetOffsetY;

    // Di chuyển mượt mà bám theo nhân vật (Smooth LERP)
    this.x += (destX - this.x) * 0.12;
    this.y += (destY - this.y) * 0.12;

    this.setDepth(this.targetPlayer.y + 1);

    // Lật hướng nhìn theo nhân vật
    if (this.targetPlayer.flipX) {
      this.petSprite.setScale(-1, 1);
    } else {
      this.petSprite.setScale(1, 1);
    }
  }
}
