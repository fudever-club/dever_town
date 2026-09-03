import Phaser from 'phaser';
import { ITEMS_DATABASE } from '../config/items.js';

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
    const candidateKey = `char_${avatarId}`;
    // Fallback an toàn nếu texture chưa được generate
    const textureKey = (scene && scene.textures.exists(candidateKey)) ? candidateKey : 'char_dev_hoodie';

    super(scene, x, y, textureKey, 0);

    this.id = options.id;
    this.name = options.name || 'Thành viên khác';
    this.avatarId = avatarId;
    this.role = options.role || 'guest';
    this.equippedItemId = options.equippedItemId || null;

    scene.add.existing(this);

    this.targetX = x;
    this.targetY = y;
    this.targetDirection = 'down';
    this.targetMoving = false;
    this.currentDirection = 'down';
    this.lastPacketTime = performance.now();

    this.speechBubble = null;
    this.speechTimer = null;

    this.createNameTag();
    this.createEquippedItemDisplay();
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

  createEquippedItemDisplay() {
    if (this.equippedContainer) {
      this.equippedContainer.destroy();
      this.equippedContainer = null;
    }

    if (!this.equippedItemId || !ITEMS_DATABASE[this.equippedItemId]) return;

    const item = ITEMS_DATABASE[this.equippedItemId];
    this.equippedContainer = this.scene.add.container(this.x + 14, this.y - 8);
    this.equippedContainer.setDepth(1000002);

    const bgGfx = this.scene.add.graphics();
    bgGfx.fillStyle(0x0f172a, 0.85);
    bgGfx.fillCircle(0, 0, 9);
    bgGfx.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(item.accentColor || '#f26f21').color, 1);
    bgGfx.strokeCircle(0, 0, 9);

    const icon = this.scene.add.text(0, 0, item.icon, {
      fontSize: '10px'
    }).setOrigin(0.5, 0.5);

    this.equippedContainer.add([bgGfx, icon]);

    this.scene.tweens.add({
      targets: this.equippedContainer,
      y: this.y - 12,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setEquippedItem(itemId) {
    this.equippedItemId = itemId;
    this.createEquippedItemDisplay();
  }

  getRoleColor() {
    switch (this.role) {
      case 'admin': return 'rgba(217, 119, 6, 0.9)';
      case 'leader': return 'rgba(147, 51, 234, 0.9)';
      case 'dev': return 'rgba(37, 99, 235, 0.9)';
      default: return 'rgba(71, 85, 105, 0.85)';
    }
  }

  setTargetPosition(x, y, direction, isMoving) {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = direction || this.targetDirection;
    this.targetMoving = isMoving !== undefined ? isMoving : false;
    this.lastPacketTime = performance.now();

    // Nếu khoảng cách nhảy vọt quá xa (> 100px), snap ngay tức thì tránh glitch trượt map
    const distSq = (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y);
    if (distSq > 10000) {
      this.x = x;
      this.y = y;
    }
  }

  showSpeechBubble(message) {
    if (this.speechBubble) {
      this.speechBubble.destroy();
      this.speechBubble = null;
    }
    if (this.speechTimer) {
      this.speechTimer.remove();
      this.speechTimer = null;
    }

    const maxChars = 50;
    const safeText = safeUnicodeTruncate(message, maxChars);

    const bubbleContainer = this.scene.add.container(this.x, this.y - 52);
    bubbleContainer.setDepth(1000002);

    const textObj = this.scene.add.text(0, 0, safeText, {
      fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: '11px',
      color: '#0f172a',
      align: 'center',
      wordWrap: { width: 170, useAdvancedWrap: true },
      padding: { top: 4, bottom: 4, left: 6, right: 6 },
      lineSpacing: 3
    }).setOrigin(0.5, 0.5);

    const padX = 14;
    const padY = 8;
    const boxW = Math.max(textObj.width + padX, 50);
    const boxH = Math.max(textObj.height + padY, 24);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    bg.lineStyle(2, 0x94a3b8, 1);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);

    bg.fillStyle(0xffffff, 0.95);
    bg.fillTriangle(-5, boxH / 2 - 1, 5, boxH / 2 - 1, 0, boxH / 2 + 5);

    bubbleContainer.add([bg, textObj]);
    this.speechBubble = bubbleContainer;

    this.speechTimer = this.scene.time.delayedCall(4500, () => {
      if (this.speechBubble) {
        this.speechBubble.destroy();
        this.speechBubble = null;
      }
    });
  }

  updateProfile({ name, avatarId, role, equippedItemId }) {
    if (name) this.name = name;
    if (avatarId && avatarId !== this.avatarId) {
      this.avatarId = avatarId;
      const textureKey = `char_${avatarId}`;
      if (this.scene.textures.exists(textureKey)) {
        this.setTexture(textureKey, 0);
      }
    }
    if (role) this.role = role;
    if (equippedItemId !== undefined) {
      this.setEquippedItem(equippedItemId);
    }
    this.createNameTag();
  }

  showEmote(emoteId) {
    const emoteIcons = {
      wave: '👋',
      heart: '❤️',
      fire: '🔥',
      clap: '👏',
      dance: '🕺',
      question: '❓'
    };
    const icon = emoteIcons[emoteId] || '✨';

    if (this.emoteContainer) {
      this.emoteContainer.destroy();
      this.emoteContainer = null;
    }

    const container = this.scene.add.container(this.x, this.y - 48);
    container.setDepth(1000003);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.9);
    bg.fillCircle(0, 0, 16);
    bg.lineStyle(2, 0xc084fc, 1);
    bg.strokeCircle(0, 0, 16);

    const txt = this.scene.add.text(0, 0, icon, {
      fontSize: '18px'
    }).setOrigin(0.5, 0.5);

    container.add([bg, txt]);
    this.emoteContainer = container;

    // Float upward tween
    this.scene.tweens.add({
      targets: container,
      y: this.y - 68,
      alpha: { from: 1, to: 0 },
      duration: 2600,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (this.emoteContainer === container) {
          container.destroy();
          this.emoteContainer = null;
        }
      }
    });

    // If dance, play a fun wiggle bounce animation on sprite
    if (emoteId === 'dance') {
      const origY = this.y;
      this.scene.tweens.add({
        targets: this,
        angle: { from: -8, to: 8 },
        y: origY - 6,
        yoyo: true,
        repeat: 5,
        duration: 120,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.setAngle(0);
          this.y = origY;
        }
      });
    }
  }

  update(time, delta = 16.67) {
    const distSq = (this.targetX - this.x) * (this.targetX - this.x) + (this.targetY - this.y) * (this.targetY - this.y);

    if (distSq > 10000) {
      // Nhảy vọt lớn (teleport / spawn)
      this.x = this.targetX;
      this.y = this.targetY;
    } else if (distSq < 0.64 && !this.targetMoving) {
      // Đã đến rất gần mục tiêu và không di chuyển -> Snap triệt tiêu vi rung
      this.x = this.targetX;
      this.y = this.targetY;
    } else {
      // Nội suy thích ứng theo delta time: mượt mà ở mọi FPS (30 - 120 FPS)
      const lerpSpeed = this.targetMoving ? 0.32 : 0.45;
      const dtFactor = Math.min(1.0, (delta / 16.67) * lerpSpeed);
      this.x = Phaser.Math.Linear(this.x, this.targetX, dtFactor);
      this.y = Phaser.Math.Linear(this.y, this.targetY, dtFactor);
    }

    this.currentDirection = this.targetDirection;

    // Tự động kích hoạt animation walk nếu đang di chuyển hoặc khoảng cách còn xa
    const isVisiblyMoving = this.targetMoving || distSq > 4;
    const animPrefix = isVisiblyMoving ? 'walk' : 'idle';
    const animKey = `${animPrefix}_${this.currentDirection}_${this.avatarId}`;

    try {
      if (this.scene?.anims?.exists(animKey)) {
        this.anims.play(animKey, true);
      }
    } catch (e) {}

    if (isVisiblyMoving) {
      const bob = Math.sin(performance.now() / 85) * 0.05;
      this.scaleY = 1.0 + bob;
      this.scaleX = 1.0 - bob * 0.7;
    } else {
      this.scaleY = 1.0;
      this.scaleX = 1.0;
    }

    if (this.lastX !== this.x || this.lastY !== this.y) {
      this.lastX = this.x;
      this.lastY = this.y;
      this.setDepth(this.y);

      if (this.nameTagContainer) {
        this.nameTagContainer.setPosition(this.x, this.y - 28);
      }

      if (this.speechBubble) {
        this.speechBubble.setPosition(this.x, this.y - 52);
      }

      if (this.equippedContainer) {
        this.equippedContainer.setPosition(this.x + 14, this.y - 8);
      }
    }
  }

  destroy(fromScene) {
    if (this.nameTagContainer) {
      this.nameTagContainer.destroy();
    }
    if (this.speechBubble) {
      this.speechBubble.destroy();
    }
    if (this.equippedContainer) {
      this.equippedContainer.destroy();
    }
    if (this.emoteContainer) {
      this.emoteContainer.destroy();
      this.emoteContainer = null;
    }
    if (this.speechTimer) {
      this.speechTimer.remove();
    }
    super.destroy(fromScene);
  }
}
