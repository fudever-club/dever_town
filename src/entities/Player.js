import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    const avatarId = options.avatarId || 'dev_hoodie';
    const textureKey = `avatar_${avatarId}`;

    super(scene, x, y, scene.textures.exists(textureKey) ? textureKey : 'player_sprites', 1);

    this.scene = scene;
    this.name = options.name || 'Dever Member';
    this.avatarId = avatarId;
    this.role = options.role || 'dev';
    this.isCurrentPlayer = options.isCurrentPlayer !== undefined ? options.isCurrentPlayer : true;
    this.currentDirection = 'down';

    // Thêm vào Scene & Bật Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Hitbox chân
    this.body.setSize(GAME_CONFIG.HITBOX.WIDTH, GAME_CONFIG.HITBOX.HEIGHT);
    this.body.setOffset(GAME_CONFIG.HITBOX.OFFSET_X, GAME_CONFIG.HITBOX.OFFSET_Y);
    this.body.setCollideWorldBounds(true);

    // Tạo Name Tag
    this.createNameTag();

    // Khởi tạo Animations cho avatar này
    this.initAnimations();

    this.bubbleContainer = null;
    this.bubbleTimer = null;
  }

  getRolePrefix() {
    switch (this.role) {
      case 'admin': return '👑 ';
      case 'leader': return '⭐ ';
      case 'dev': return '💻 ';
      case 'guest': return '👤 ';
      default: return '';
    }
  }

  getRoleColor() {
    switch (this.role) {
      case 'admin': return '#fbbf24'; // Vàng kim
      case 'leader': return '#c084fc'; // Tím
      case 'dev': return '#60a5fa';    // Xanh dương
      default: return '#cbd5e1';        // Xám bạc
    }
  }

  createNameTag() {
    if (this.nameText) this.nameText.destroy();

    const rolePrefix = this.getRolePrefix();
    const tagText = `${rolePrefix}${this.name}`;

    this.nameText = this.scene.add.text(this.x, this.y - 24, tagText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontWeight: '600',
      fill: this.getRoleColor(),
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      padding: { x: 6, y: 2 }
    });
    this.nameText.setOrigin(0.5, 0.5);
    this.nameText.setDepth(999999);
  }

  updateProfile({ name, avatarId, role }) {
    if (name) this.name = name;
    if (role) this.role = role;
    if (avatarId && avatarId !== this.avatarId) {
      this.setAvatar(avatarId);
    }
    this.createNameTag();
  }

  setAvatar(avatarId) {
    this.avatarId = avatarId;
    const textureKey = `avatar_${avatarId}`;
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey, 1);
      this.initAnimations();
    }
  }

  initAnimations() {
    const anims = this.scene.anims;
    const key = `avatar_${this.avatarId}`;
    const texture = this.scene.textures.exists(key) ? key : 'player_sprites';

    const animKeys = [
      { key: `${key}_walk_down`, row: 0, start: 0, end: 2 },
      { key: `${key}_walk_left`, row: 1, start: 3, end: 5 },
      { key: `${key}_walk_right`, row: 2, start: 6, end: 8 },
      { key: `${key}_walk_up`, row: 3, start: 9, end: 11 }
    ];

    animKeys.forEach(({ key: aKey, start, end }) => {
      if (!anims.exists(aKey)) {
        anims.create({
          key: aKey,
          frames: anims.generateFrameNumbers(texture, { start, end }),
          frameRate: 8,
          repeat: -1
        });
      }
    });
  }

  update(inputData) {
    if (!this.body) return;

    this.setDepth(this.y);

    if (this.nameText) {
      this.nameText.setPosition(Math.round(this.x), Math.round(this.y - 24));
    }

    if (this.bubbleContainer) {
      this.bubbleContainer.setPosition(Math.round(this.x), Math.round(this.y - 44));
    }

    if (!this.isCurrentPlayer || !inputData) return;

    const { vector, left, right, up, down, isMoving } = inputData;
    const animPrefix = `avatar_${this.avatarId}`;

    if (isMoving) {
      this.body.setVelocity(
        vector.x * GAME_CONFIG.PLAYER_SPEED,
        vector.y * GAME_CONFIG.PLAYER_SPEED
      );

      if (left) {
        this.currentDirection = 'left';
        this.anims.play(`${animPrefix}_walk_left`, true);
      } else if (right) {
        this.currentDirection = 'right';
        this.anims.play(`${animPrefix}_walk_right`, true);
      } else if (up) {
        this.currentDirection = 'up';
        this.anims.play(`${animPrefix}_walk_up`, true);
      } else if (down) {
        this.currentDirection = 'down';
        this.anims.play(`${animPrefix}_walk_down`, true);
      }
    } else {
      this.body.setVelocity(0, 0);
      this.anims.stop();

      const idleFrames = { down: 1, left: 4, right: 7, up: 10 };
      this.setFrame(idleFrames[this.currentDirection] || 1);
    }
  }

  showSpeechBubble(message) {
    if (this.bubbleContainer) {
      this.bubbleContainer.destroy();
      this.bubbleContainer = null;
    }
    if (this.bubbleTimer) {
      this.bubbleTimer.remove();
    }

    const maxLen = 45;
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
    bg.fillTriangle(0, h / 2 + 5, -5, h / 2, 5, h / 2);

    bubble.add([bg, text]);
    this.bubbleContainer = bubble;

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
    if (this.nameText) this.nameText.destroy();
    if (this.bubbleContainer) this.bubbleContainer.destroy();
    if (this.bubbleTimer) this.bubbleTimer.remove();
    super.destroy(fromScene);
  }
}
