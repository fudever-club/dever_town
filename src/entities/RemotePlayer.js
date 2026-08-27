import Phaser from 'phaser';

function safeUnicodeTruncate(str, maxLen = 45) {
  if (!str) return '';
  const chars = Array.from(str.normalize('NFC'));
  return chars.length > maxLen ? chars.slice(0, maxLen).join('') + '...' : chars.join('');
}

export class RemotePlayer extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    const avatarId = options.avatarId || 'dev_hoodie';
    const textureKey = `char_${avatarId}`;

    super(scene, x, y, textureKey, 0);

    this.id = options.id;
    this.name = options.name || 'Thành viên';
    this.avatarId = avatarId;
    this.role = options.role || 'dev';

    scene.add.existing(this);

    this.targetX = x;
    this.targetY = y;
    this.targetDirection = 'down';
    this.isMoving = false;
    this.lerpFactor = 0.25;

    this.speechBubble = null;
    this.speechTimer = null;

    this.createNameTag();
    this.setDepth(this.y);
  }

  createNameTag() {
    if (this.nameTagContainer) {
      this.nameTagContainer.destroy();
    }

    this.nameTagContainer = this.scene.add.container(this.x, this.y - 28);
    this.nameTagContainer.setDepth(1000001);

    const rolePrefix = this.role === 'admin' ? '[Admin] ' :
                       this.role === 'leader' ? '[Leader] ' :
                       this.role === 'dev' ? '[Dev] ' : '';

    const displayName = `${rolePrefix}${this.name}`;

    const tagText = this.scene.add.text(0, 0, displayName, {
      fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: '11px',
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: this.getRoleColor(),
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5, 0.5);

    this.nameTagContainer.add(tagText);
  }

  getRoleColor() {
    switch (this.role) {
      case 'admin': return 'rgba(217, 119, 6, 0.9)';
      case 'leader': return 'rgba(147, 51, 234, 0.9)';
      case 'dev': return 'rgba(37, 99, 235, 0.9)';
      default: return 'rgba(30, 41, 59, 0.85)';
    }
  }

  updateProfile({ name, avatarId, role }) {
    if (name) this.name = name.normalize('NFC');
    if (role) this.role = role;
    if (avatarId && avatarId !== this.avatarId) {
      this.avatarId = avatarId;
      this.setTexture(`char_${avatarId}`, 0);
    }
    this.createNameTag();
  }

  setTargetPosition(x, y, direction, isMoving) {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = direction || this.targetDirection;
    this.isMoving = isMoving;
  }

  showSpeechBubble(message) {
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    if (this.speechTimer) {
      this.speechTimer.remove();
    }

    const displayMsg = safeUnicodeTruncate(message, 45);

    this.speechBubble = this.scene.add.container(this.x, this.y - 48);
    this.speechBubble.setDepth(1000003);

    const text = this.scene.add.text(0, 0, displayMsg, {
      fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: '11px',
      color: '#0f172a',
      fontStyle: 'normal',
      padding: { top: 4, bottom: 4, left: 6, right: 6 },
      lineSpacing: 3,
      wordWrap: { width: 170, useAdvancedWrap: true }
    }).setOrigin(0.5, 0.5);

    const padX = 14;
    const padY = 8;
    const w = text.width + padX;
    const h = text.height + padY;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.96);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, 0x8b5cf6, 1); // Purple border for remote players
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    bg.fillStyle(0xffffff, 0.96);
    bg.beginPath();
    bg.moveTo(-5, h / 2);
    bg.lineTo(5, h / 2);
    bg.lineTo(0, h / 2 + 5);
    bg.closePath();
    bg.fillPath();

    this.speechBubble.add([bg, text]);

    this.speechTimer = this.scene.time.delayedCall(4500, () => {
      if (this.speechBubble) {
        this.scene.tweens.add({
          targets: this.speechBubble,
          alpha: 0,
          y: '-=10',
          duration: 350,
          onComplete: () => {
            if (this.speechBubble) {
              this.speechBubble.destroy();
              this.speechBubble = null;
            }
          }
        });
      }
    });
  }

  update() {
    this.x = Phaser.Math.Linear(this.x, this.targetX, this.lerpFactor);
    this.y = Phaser.Math.Linear(this.y, this.targetY, this.lerpFactor);

    const animPrefix = this.isMoving ? 'walk' : 'idle';
    const animKey = `${animPrefix}_${this.targetDirection}_${this.avatarId}`;

    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    }

    this.setDepth(this.y);

    if (this.nameTagContainer) {
      this.nameTagContainer.setPosition(this.x, this.y - 28);
    }
    if (this.speechBubble) {
      this.speechBubble.setPosition(this.x, this.y - 48);
    }
  }

  destroy(fromScene) {
    if (this.nameTagContainer) {
      this.nameTagContainer.destroy();
    }
    if (this.speechBubble) {
      this.speechBubble.destroy();
    }
    if (this.speechTimer) {
      this.speechTimer.remove();
    }
    super.destroy(fromScene);
  }
}
