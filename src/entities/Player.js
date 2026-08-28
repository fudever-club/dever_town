import Phaser from 'phaser';
import { ITEMS_DATABASE } from '../config/items.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

function safeUnicodeTruncate(str, maxLen = 45) {
  if (!str) return '';
  const chars = Array.from(str.normalize('NFC'));
  return chars.length > maxLen ? chars.slice(0, maxLen).join('') + '...' : chars.join('');
}

export class Player extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    let wardrobeConfig = options.wardrobeConfig || null;
    if (!wardrobeConfig && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('dever_wardrobe_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Đảm bảo không dùng null (JSON.stringify(null) => "null")
          if (parsed && typeof parsed === 'object') wardrobeConfig = parsed;
        } catch (e) {}
      }
    }

    let avatarId = options.avatarId || (wardrobeConfig ? 'custom_wardrobe' : 'dev_hoodie');
    let resolvedTextureKey = `char_${avatarId}`;

    if (wardrobeConfig && scene) {
      if (!scene.textures.exists('char_custom_wardrobe')) {
        // Tạo texture mới, nhận actual key (có thể là versioned)
        const actualKey = TextureGenerator.generateCustomAvatar(scene, wardrobeConfig, 'char_custom_wardrobe');
        if (actualKey) resolvedTextureKey = actualKey;
      } else {
        // Texture đã có (từ BootScene), dùng actual key từ registry
        resolvedTextureKey = TextureGenerator.getActualKey('char_custom_wardrobe');
      }
      avatarId = 'custom_wardrobe';
    }

    const safeTextureKey = (scene && scene.textures.exists(resolvedTextureKey)) ? resolvedTextureKey : 'char_dev_hoodie';
    super(scene, x, y, safeTextureKey, 0);

    this.name = options.name || 'Dever Member';
    // Đồng bộ avatarId với actual texture key để animation key luôn khớp
    this.avatarId = (scene && scene.textures.exists(resolvedTextureKey))
      ? resolvedTextureKey.replace(/^char_/, '')
      : 'dev_hoodie';
    this.wardrobeConfig = wardrobeConfig;
    this.role = options.role || 'guest';
    this.isCurrentPlayer = options.isCurrentPlayer || false;
    this.equippedItemId = options.equippedItemId || null;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(18, 14);
    this.body.setOffset(7, 18);
    this.body.setCollideWorldBounds(true);

    this.currentDirection = 'down';
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

  setCustomWardrobe(avatarId = 'custom_wardrobe', wardrobeConfig = null) {
    if (wardrobeConfig) {
      this.wardrobeConfig = wardrobeConfig;
    }
    const logicalKey = `char_${avatarId}`;
    if (this.scene) {
      const cfgToUse = this.wardrobeConfig || (typeof localStorage !== 'undefined' ? (() => {
        try {
          const p = JSON.parse(localStorage.getItem('dever_wardrobe_config') || 'null');
          return (p && typeof p === 'object') ? p : null;
        } catch (e) { return null; }
      })() : null);

      if (cfgToUse) {
        // Ghi nhớ key cũ đang được Sprite sử dụng
        const oldActualKey = this.texture ? this.texture.key : null;

        // Tạo texture mới với versioned key an toàn (KHÔNG xóa key cũ ở bước này)
        const newActualKey = TextureGenerator.generateCustomAvatar(this.scene, cfgToUse, logicalKey);
        const keyToUse = newActualKey || logicalKey;

        if (this.scene.textures.exists(keyToUse)) {
          // Gán texture mới cho Sprite TRƯỚC
          this.setTexture(keyToUse, 0);
          // Cập nhật avatarId để khớp với actual key (bỏ prefix 'char_')
          // Vì animation được tạo với avatarId = actual key minus 'char_'
          this.avatarId = keyToUse.replace(/^char_/, '');
          this.stopMovement();
          // Sau khi Sprite đã dùng texture mới, xóa texture cũ nếu là versioned
          TextureGenerator.cleanupOldKey(this.scene, logicalKey, oldActualKey);
        }
      } else if (this.scene.textures.exists(logicalKey)) {
        this.setTexture(logicalKey, 0);
        this.avatarId = avatarId;
        this.stopMovement();
      }
    }
  }

  getRoleColor() {
    switch (this.role) {
      case 'admin': return 'rgba(217, 119, 6, 0.9)'; // Amber
      case 'leader': return 'rgba(147, 51, 234, 0.9)'; // Purple
      case 'dev': return 'rgba(37, 99, 235, 0.9)'; // Blue
      default: return 'rgba(71, 85, 105, 0.85)'; // Slate
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
    let rawMessage = message || '';
    const catStickerMatch = rawMessage.match(/^\[sticker:(dever|buggy):(\d+)\]$/);
    const legacyStickerMatch = rawMessage.match(/^\[sticker:(\d+)\]$/);

    if (catStickerMatch) {
      rawMessage = catStickerMatch[1] === 'dever'
        ? `🦊 [Sticker DEVER #${catStickerMatch[2]}]`
        : `🐞 [Sticker Buggy #${catStickerMatch[2]}]`;
    } else if (legacyStickerMatch) {
      rawMessage = `🦊 [Sticker DEVER #${legacyStickerMatch[1]}]`;
    }

    const maxChars = 50;
    const safeText = safeUnicodeTruncate(rawMessage, maxChars);

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
    bg.lineStyle(2, 0x3b82f6, 1);
    bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);

    // Mũi tên chỉ xuống đầu
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

  updateProfile({ name, avatarId, role, equippedItemId, wardrobeConfig }) {
    if (name) this.name = name;
    if (role) this.role = role;
    if (equippedItemId !== undefined) {
      this.setEquippedItem(equippedItemId);
    }

    if (wardrobeConfig) {
      this.setCustomWardrobe('custom_wardrobe', wardrobeConfig);
    } else if (avatarId && avatarId !== this.avatarId) {
      const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
      if (savedWardrobeRaw && this.avatarId === 'custom_wardrobe') {
        // Đang sử dụng custom wardrobe, giữ nguyên avatarId
      } else {
        this.avatarId = avatarId;
        const textureKey = `char_${avatarId}`;
        if (this.scene && this.scene.textures.exists(textureKey)) {
          this.setTexture(textureKey, 0);
        }
      }
    }
    this.createNameTag();
  }

  stopMovement() {
    if (this.body) {
      this.body.setVelocity(0, 0);
      const idleAnim = `idle_${this.currentDirection}_${this.avatarId}`;
      try {
        if (this.scene?.anims?.exists(idleAnim)) {
          this.anims.play(idleAnim, true);
        }
      } catch (e) {}
    }
  }

  update(inputData) {
    if (!inputData) return;

    const speed = 160;
    const { vector, left, right, up, down, isMoving } = inputData;

    this.body.setVelocity(vector.x * speed, vector.y * speed);

    if (left) {
      this.currentDirection = 'left';
    } else if (right) {
      this.currentDirection = 'right';
    } else if (up) {
      this.currentDirection = 'up';
    } else if (down) {
      this.currentDirection = 'down';
    }

    const animPrefix = isMoving ? 'walk' : 'idle';
    const animKey = `${animPrefix}_${this.currentDirection}_${this.avatarId}`;

    try {
      if (this.scene?.anims?.exists(animKey)) {
        this.anims.play(animKey, true);
      }
    } catch (e) {}

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
    if (this.speechTimer) {
      this.speechTimer.remove();
    }
    super.destroy(fromScene);
  }
}
