import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class RemotePlayer extends Phaser.Physics.Arcade.Sprite {
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
    this.id = options.id || '';
    this.avatarId = avatarId;
    this.role = options.role || 'dev';

    this.targetX = x;
    this.targetY = y;
    this.targetDirection = 'down';
    this.targetIsMoving = false;

    // Thêm vào Scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setImmovable(true);
    this.body.moves = false;

    // Tạo Name Tag
    this.createNameTag();

    // Khởi tạo Animations
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
      case 'admin': return '#fbbf24';
      case 'leader': return '#c084fc';
      case 'dev': return '#60a5fa';
      default: return '#cbd5e1';
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

  setTargetPosition(x, y, direction, isMoving) {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = direction || this.targetDirection;
    this.targetIsMoving = isMoving;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
    if (dist > GAME_CONFIG.NETWORK.MAX_SNAP_DISTANCE) {
      this.setPosition(this.targetX, this.targetY);
    }
  }

  update() {
    const lerpFactor = GAME_CONFIG.NETWORK.LERP_FACTOR;
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor);

    this.setDepth(this.y);

    if (this.nameText) {
      this.nameText.setPosition(Math.round(this.x), Math.round(this.y - 24));
    }

    if (this.bubbleContainer) {
      this.bubbleContainer.setPosition(Math.round(this.x), Math.round(this.y - 44));
    }

    const animPrefix = `avatar_${this.avatarId}`;

    if (this.targetIsMoving) {
      const animKey = `${animPrefix}_walk_${this.targetDirection}`;
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
