import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class RemotePlayer extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} name
   * @param {string} id
   */
  constructor(scene, x, y, name = 'Dev Member', id = '') {
    super(scene, x, y, 'player_sprites', 1);

    this.scene = scene;
    this.name = name;
    this.id = id;

    this.targetX = x;
    this.targetY = y;
    this.targetDirection = 'down';
    this.targetIsMoving = false;

    // Thêm vào Scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setImmovable(true);
    this.body.moves = false; // Vị trí do Lerp điều khiển

    // Tạo Name Tag
    this.createNameTag();

    // Biến lưu Speech Bubble
    this.bubbleContainer = null;
    this.bubbleTimer = null;
  }

  createNameTag() {
    this.nameText = this.scene.add.text(this.x, this.y - 24, this.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontWeight: '600',
      fill: '#93c5fd',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 6, y: 2 }
    });
    this.nameText.setOrigin(0.5, 0.5);
    this.nameText.setDepth(999999);
  }

  updateName(newName) {
    this.name = newName;
    if (this.nameText) {
      this.nameText.setText(newName);
    }
  }

  setTargetPosition(x, y, direction, isMoving) {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = direction || this.targetDirection;
    this.targetIsMoving = isMoving;

    // Nếu khoảng cách quá xa (lag mạng hoặc spawn lại), snap ngay lập tức
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
    if (dist > GAME_CONFIG.NETWORK.MAX_SNAP_DISTANCE) {
      this.setPosition(this.targetX, this.targetY);
    }
  }

  update() {
    // 1. Nội suy tọa độ Lerp mượt mà
    const lerpFactor = GAME_CONFIG.NETWORK.LERP_FACTOR;
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor);

    // 2. Cập nhật Depth theo vị trí Y (2.5D sorting)
    this.setDepth(this.y);

    // 3. Cập nhật Name Tag
    if (this.nameText) {
      this.nameText.setPosition(Math.round(this.x), Math.round(this.y - 24));
    }

    // 4. Cập nhật Bubble vị trí nếu có
    if (this.bubbleContainer) {
      this.bubbleContainer.setPosition(Math.round(this.x), Math.round(this.y - 44));
    }

    // 5. Cập nhật Animation
    if (this.targetIsMoving) {
      const animKey = `player_walk_${this.targetDirection}`;
      if (this.anims.currentAnim?.key !== animKey || !this.anims.isPlaying) {
        this.anims.play(animKey, true);
      }
    } else {
      if (this.anims.isPlaying) {
        this.anims.stop();
      }
      const idleFrames = { down: 1, left: 4, right: 7, up: 10 };
      this.setFrame(idleFrames[this.targetDirection] || 1);
    }
  }

  showSpeechBubble(message) {
    // Xóa bubble cũ nếu còn
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = null;
    }
    if (this.bubbleTimer) {
      this.bubbleTimer.remove();
    }

    const maxLen = 40;
    const displayMsg = message.length > maxLen ? message.substring(0, maxLen) + '...' : message;

    const bubble = this.scene.add.container(this.x, this.y - 44);
    bubble.setDepth(1000001);

    const text = this.scene.add.text(0, 0, displayMsg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#0f172a',
      wordWrap: { width: 160 }
    }).setOrigin(0.5, 0.5);

    const padX = 16;
    const padY = 10;
    const w = text.width + padX;
    const h = text.height + padY;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    // Mũi nhọn bong bóng thoại
    bg.fillTriangle(0, h / 2 + 5, -5, h / 2, 5, h / 2);

    bubble.add([bg, text]);
    this.bubbleContainer = bubble;

    // Tự động mờ dần và hủy sau 4.5s
    this.bubbleTimer = this.scene.time.delayedCall(4500, () => {
      if (this.bubbleContainer) {
        this.scene.tweens.add({
          targets: this.bubbleContainer,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            if (this.bubbleContainer) {
              this.bubbleContainer.destroy();
              this.bubbleContainer = null;
            }
          }
        });
      }
    });
  }

  destroy(fromScene) {
    if (this.nameText) {
      this.nameText.destroy();
    }
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
    }
    if (this.bubbleTimer) {
      this.bubbleTimer.remove();
    }
    super.destroy(fromScene);
  }
}
