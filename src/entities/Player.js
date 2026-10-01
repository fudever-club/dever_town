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

    let avatarId = options.avatarId || (wardrobeConfig ? (wardrobeConfig.characterId || wardrobeConfig.outfitId || 'hoodie_dever') : 'hoodie_dever');
    let resolvedTextureKey = `char_${avatarId}`;

    if (wardrobeConfig && scene) {
      const charId = wardrobeConfig.characterId || wardrobeConfig.outfitId || avatarId;
      const normalizedCharId = charId === 'barista_apron' ? 'apron_barista' : charId;
      const hasHandItem = wardrobeConfig.inHandItem && wardrobeConfig.inHandItem !== 'none';

      if (hasHandItem) {
        if (!scene.textures.exists('char_custom_wardrobe')) {
          const actualKey = TextureGenerator.generateCustomAvatar(scene, wardrobeConfig, 'char_custom_wardrobe');
          if (actualKey) resolvedTextureKey = actualKey;
        } else {
          resolvedTextureKey = 'char_custom_wardrobe';
        }
        avatarId = resolvedTextureKey.replace(/^char_/, '');
      } else {
        const directKey = `char_${normalizedCharId}`;
        if (scene.textures.exists(directKey)) {
          resolvedTextureKey = directKey;
          avatarId = normalizedCharId;
        }
      }
    }

    const safeTextureKey = (scene && scene.textures.exists(resolvedTextureKey)) ? resolvedTextureKey : 'char_hoodie_dever';
    super(scene, x, y, safeTextureKey, 0);

    this.name = options.name || 'Dever Member';
    this.avatarId = (scene && scene.textures.exists(safeTextureKey))
      ? safeTextureKey.replace(/^char_/, '')
      : 'hoodie_dever';
    this.wardrobeConfig = wardrobeConfig;
    this.role = options.role || 'guest';
    this.isCurrentPlayer = options.isCurrentPlayer || false;
    this.equippedItemId = options.equippedItemId || null;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics hitbox: 24×10px tại chân nhân vật (48×64 sprite — feet vùng y+54 to y+64)
    this.body.setSize(24, 10);
    this.body.setOffset(12, 54);
    this.body.setCollideWorldBounds(true);

    this.currentDirection = 'down';
    this.speechBubble = null;
    this.speechTimer = null;

    // Shadow ellipse dưới chân — vị trí y+30 tính từ origin sprite (64/2=32, chân tại +32)
    this.shadowEllipse = scene.add.ellipse(x, y + 30, 22, 8, 0x000000, 0.28);
    this.shadowEllipse.setDepth(this.y - 0.1);

    this.createNameTag();
    this.createEquippedItemDisplay();
    this.setDepth(this.y + 30);
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
    // Xóa bỏ hoàn toàn bong bóng lơ lửng: Vật phẩm được vẽ trực tiếp vào bàn tay nhân vật
  }

  setEquippedItem(itemId) {
    this.equippedItemId = itemId;
    if (this.equippedContainer) {
      this.equippedContainer.destroy();
      this.equippedContainer = null;
    }

    if (!this.wardrobeConfig) {
      this.wardrobeConfig = {};
    }
    this.wardrobeConfig.inHandItem = itemId;
    this.wardrobeConfig.equippedItemId = itemId;

    // Tự động tạo lại spritesheet để vẽ vật phẩm trực tiếp lên tay
    this.setCustomWardrobe(this.avatarId || 'custom_wardrobe', this.wardrobeConfig);
  }

  setCustomWardrobe(avatarId = 'custom_wardrobe', wardrobeConfig = null) {
    if (wardrobeConfig) {
      this.wardrobeConfig = wardrobeConfig;
    }
    if (!this.scene) return;

    const cfgToUse = this.wardrobeConfig || (typeof localStorage !== 'undefined' ? (() => {
      try {
        const p = JSON.parse(localStorage.getItem('dever_wardrobe_config') || 'null');
        return (p && typeof p === 'object') ? p : null;
      } catch (e) { return null; }
    })() : null);

    if (cfgToUse) {
      const charId = cfgToUse.characterId || cfgToUse.outfitId || avatarId;
      const normalizedCharId = charId === 'barista_apron' ? 'apron_barista' : charId;
      const directKey = `char_${normalizedCharId}`;
      const hasHandItem = cfgToUse.inHandItem && cfgToUse.inHandItem !== 'none';

      // Nếu có vật phẩm cầm tay, sinh texture composite (chồng item lên tay)
      if (hasHandItem) {
        const oldActualKey = this.texture ? this.texture.key : null;
        const actualKey = TextureGenerator.generateCustomAvatar(this.scene, cfgToUse, 'char_custom_wardrobe');
        const keyToUse = actualKey || directKey;
        if (this.scene.textures.exists(keyToUse)) {
          this.setTexture(keyToUse, 0);
          this.avatarId = keyToUse.replace(/^char_/, '');
          this.stopMovement();
          TextureGenerator.cleanupOldKey(this.scene, 'char_custom_wardrobe', oldActualKey);
        }
      } else if (this.scene.textures.exists(directKey)) {
        // Dùng trực tiếp spritesheet pre-baked của nhân vật với key chuẩn mực, không tạo versioned
        this.setTexture(directKey, 0);
        this.avatarId = normalizedCharId;
        this.stopMovement();
      } else {
        const actualKey = TextureGenerator.generateCustomAvatar(this.scene, cfgToUse, 'char_custom_wardrobe');
        if (actualKey && this.scene.textures.exists(actualKey)) {
          this.setTexture(actualKey, 0);
          this.avatarId = actualKey.replace(/^char_/, '');
          this.stopMovement();
        }
      }
    } else {
      const targetKey = `char_${avatarId}`;
      if (this.scene.textures.exists(targetKey)) {
        this.setTexture(targetKey, 0);
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

  showEmote(emoteId) {
    const emoteIcons = {
      wave: '👋',
      heart: '❤️',
      fire: '🔥',
      clap: '👏',
      dance: '🕺',
      question: '❓',
      fireworks: '🎉',
      buggy: '🐞'
    };
    const icon = emoteIcons[emoteId] || '✨';

    if (emoteId === 'fireworks' && this.scene?.juiceManager) {
      this.scene.juiceManager.spawnSparkles?.(this.x, this.y - 30, 20, '#f59e0b');
    }

    if (this.emoteContainer) {
      this.emoteContainer.destroy();
      this.emoteContainer = null;
    }

    const container = this.scene.add.container(this.x, this.y - 48);
    container.setDepth(1000003);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.9);
    bg.fillCircle(0, 0, 16);
    bg.lineStyle(2, 0x38bdf8, 1);
    bg.strokeCircle(0, 0, 16);

    const txt = this.scene.add.text(0, 0, icon, {
      fontSize: '18px'
    }).setOrigin(0.5, 0.5);

    container.add([bg, txt]);
    this.emoteContainer = container;

    // Float upward tween — dùng onUpdate để bám theo vị trí thực tế của player
    let elapsed = 0;
    const duration = 2600;
    this.scene.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        if (!container || container.destroyed) return;
        elapsed = tween.progress;
        const floatOffset = elapsed * 20;
        container.setPosition(this.x, this.y - 48 - floatOffset);
        container.setAlpha(1 - elapsed);
      },
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

  updateProfile({ name, avatarId, role, equippedItemId, wardrobeConfig }) {
    if (name) this.name = name;
    if (role) this.role = role;
    if (equippedItemId !== undefined) {
      this.setEquippedItem(equippedItemId);
    }

    if (wardrobeConfig) {
      this.setCustomWardrobe(this.avatarId || 'custom_wardrobe', wardrobeConfig);
    } else if (avatarId && avatarId !== this.avatarId) {
      this.avatarId = avatarId;
      const textureKey = `char_${avatarId}`;
      if (this.scene && this.scene.textures.exists(textureKey)) {
        this.setTexture(textureKey, 0);
        this.stopMovement();
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
        } else {
          // Fallback gán frame tĩnh theo hướng hiện tại để không bao giờ bị đơ sai hướng
          const dirFrames = { down: 0, left: 4, right: 8, up: 12 };
          this.setFrame(dirFrames[this.currentDirection] ?? 0);
        }
      } catch (e) {}
    }
  }

  update(inputData) {
    if (!inputData) return;

    const baseSpeed = 160;
    const speed = baseSpeed * (this.speedMultiplier ?? 1.0);
    const { vector, left, right, up, down, isMoving } = inputData;

    // --- Delta time độc lập khung hình (mượt ở mọi FPS) ---
    const deltaMs = this.scene?.sys?.game?.loop?.delta ?? 16.67;
    const dt = Math.min(deltaMs, 50) / 1000;

    // --- 1. EASED ACCELERATION / DECELERATION ---
    // Thay setVelocity tức thì bằng tiệm cận hàm mũ: tăng tốc ~120ms, dừng ~150ms.
    // Cảm giác: nhân vật có trọng lượng, không còn "teleport" mỗi khi nhấn phím.
    const targetVx = vector.x * speed;
    const targetVy = vector.y * speed;
    const easeRate = isMoving ? 12 : 16;
    const k = 1 - Math.exp(-easeRate * dt);
    let vx = Phaser.Math.Linear(this.body.velocity.x, targetVx, k);
    let vy = Phaser.Math.Linear(this.body.velocity.y, targetVy, k);
    // Triệt tiêu rung động vi mô khi gần dừng hẳn
    if (!isMoving && Math.hypot(vx, vy) < 8) { vx = 0; vy = 0; }
    this.body.setVelocity(vx, vy);

    const actualSpeed = Math.hypot(this.body.velocity.x, this.body.velocity.y);
    const speedRatio = Phaser.Math.Clamp(actualSpeed / speed, 0, 1.2);
    const visuallyMoving = actualSpeed > 12;

    // --- 2. TURN ANTICIPATION: "cú nảy" nhẹ khi đổi hướng ---
    const prevDir = this.currentDirection;
    if (left) {
      this.currentDirection = 'left';
    } else if (right) {
      this.currentDirection = 'right';
    } else if (up) {
      this.currentDirection = 'up';
    } else if (down) {
      this.currentDirection = 'down';
    }
    if (this.currentDirection !== prevDir) {
      this._turnT = 1; // trigger cú squash 120ms
    }
    if (this._turnT > 0) this._turnT = Math.max(0, this._turnT - dt * 8);
    const turnSquash = Math.sin(this._turnT * Math.PI) * 0.05;

    if (isMoving) {
      this._stoppedMovingTime = null;
      this._wasMoving = true;
      const walkKey = `walk_${this.currentDirection}_${this.avatarId}`;
      try {
        if (this.scene?.anims?.exists(walkKey)) {
          this.anims.play(walkKey, true);
        } else if (this.scene && this.avatarId) {
          TextureGenerator.createCharacterAnimations(this.scene, this.avatarId);
          if (this.scene.anims.exists(walkKey)) {
            this.anims.play(walkKey, true);
          }
        }
      } catch (e) {}

      // --- 3. WALK CYCLE ĐỒNG BỘ TỐC ĐỘ (chống trượt chân) ---
      // timeScale co giãn theo vận tốc thực: tăng tốc/giiảm tốc thì chân cũng nhanh/chậm theo.
      this.anims.timeScale = Phaser.Math.Clamp(speedRatio, 0.15, 1.15);

      // --- 4. SQUASH & STRETCH ĐỒNG BỘ KHUNG HÌNH ---
      // Dùng tiến trình vòng walk (0..1) thay cho sin(performance.now()) tự do:
      // nhún người khớp chính xác từng bước chân, 2 nhịp/vòng 8 frame.
      let walkProg = 0;
      try { walkProg = this.anims.getProgress?.() ?? 0; } catch (e) {}
      const bob = Math.sin(walkProg * Math.PI * 4) * 0.04;
      this.scaleY = 1.0 + bob - turnSquash * 0.6;
      this.scaleX = 1.0 - bob * 0.7 - turnSquash;

      // Xác định chất liệu mặt sàn dưới chân (cỏ, gỗ, đá, cyber)
      const tileX = Math.floor(this.x / 32);
      const tileY = Math.floor((this.y + 12) / 32);
      const mapLayout = this.scene?.mapData?.layout;
      const tileType = mapLayout?.[tileY]?.[tileX];

      const grassTiles = new Set([0, 7, 24]);
      const woodTiles = new Set([1, 31]);
      const cyberTiles = new Set([9, 18, 6]);

      // Hiệu ứng lá cỏ xòe phong cách Pokemon GBA
      if (grassTiles.has(tileType) && this.scene?.juiceManager) {
        if (!this._lastGrassRustle || performance.now() - this._lastGrassRustle > 230) {
          this._lastGrassRustle = performance.now();
          this.scene.juiceManager.spawnGrassRustle(this.x, this.y + 12);
        }
      }

      // Phát tiếng bước chân theo chất liệu mặt sàn
      if (this.scene?.audioManager) {
        let surface = 'stone';
        const roomId = this.scene?.currentRoomId;

        if (grassTiles.has(tileType) || roomId === 'sports_complex') surface = 'grass';
        else if (woodTiles.has(tileType) || roomId === 'canteen_cafe' || roomId === 'library') surface = 'wood';
        else if (cyberTiles.has(tileType) || roomId === 'server_dungeon' || roomId === 'dever_lab') surface = 'cyber';

        this.scene.audioManager.playFootstep(surface);
      }
    } else {
      if (!this._stoppedMovingTime) {
        this._stoppedMovingTime = performance.now();
      }
      // --- 5. SETTLE KHI VỪA DỪNG: lún nhẹ rồi nảy lại trong ~180ms ---
      if (this._wasMoving) {
        this._wasMoving = false;
        this._settleT = 1;
      }
      if (this._settleT > 0) this._settleT = Math.max(0, this._settleT - dt * 5.5);
      const settleDip = Math.sin(this._settleT * Math.PI) * 0.05;

      this.anims.timeScale = 1; // idle luôn chạy đúng nhịp thở gốc
      const idleElapsed = performance.now() - this._stoppedMovingTime;
      const breatheAnimKey = `idle_breathe_${this.currentDirection}_${this.avatarId}`;
      const defaultIdleKey = `idle_${this.currentDirection}_${this.avatarId}`;

      try {
        // Sau 500ms đứng yên, tự động chuyển sang nhịp thở nhẹ nhàng
        if (idleElapsed > 500 && this.scene?.anims?.exists(breatheAnimKey)) {
          this.anims.play(breatheAnimKey, true);
        } else if (this.scene?.anims?.exists(defaultIdleKey)) {
          this.anims.play(defaultIdleKey, true);
        } else {
          const dirFrames = { down: 0, left: 4, right: 8, up: 12 };
          this.setFrame(dirFrames[this.currentDirection] ?? 0);
        }
      } catch (e) {}

      // Nhịp thở ngực hữu cơ (Micro Organic Breathing Pulse ±1.8%) + settle
      const breathe = Math.sin(performance.now() / 650) * 0.018;
      this.scaleY = 1.0 + breathe - settleDip;
      this.scaleX = 1.0 - breathe * 0.4 + settleDip * 0.6;
    }

    // Bóng chân đồng bộ nhịp bước (co lại khi nhân vật nhún lên)
    if (this.shadowEllipse) {
      this.shadowEllipse.setPosition(this.x, this.y + 30);
      this.shadowEllipse.setDepth(this.y - 0.1);
      let shadowScale = 1.0;
      if (visuallyMoving) {
        try {
          const p = this.anims.getProgress?.() ?? 0;
          shadowScale = 0.94 + (0.5 + 0.5 * Math.sin(p * Math.PI * 4)) * 0.06;
        } catch (e) {}
      }
      this.shadowEllipse.setScale(shadowScale, 1.0);
    }

    // Hiệu ứng LED Breathing cho Cyber Mecha & Sparkling Eye Glint cho Cóc Vàng FUDA
    const outfit = this.wardrobeConfig?.outfit;
    if (outfit === 'special_mecha_suit' || this.avatarId === 'mecha') {
      const pulse = 0.88 + Math.sin(performance.now() / 350) * 0.12;
      const g = Math.floor(255 * pulse);
      const r = Math.floor(180 * pulse);
      this.setTint((r << 16) | (g << 8) | 255);
    } else {
      if (this.isTinted) this.clearTint();
    }

    if (outfit === 'special_frog_mascot' && this.scene?.juiceManager) {
      if (!this._lastFrogGlint || performance.now() - this._lastFrogGlint > 2400) {
        this._lastFrogGlint = performance.now();
        this.scene.juiceManager.spawnSparkles?.(this.x + 5, this.y - 22, 1, '#fde047');
      }
    }

    if (this.lastX !== this.x || this.lastY !== this.y) {
      this.lastX = this.x;
      this.lastY = this.y;
      this.setDepth(this.y + 30);

      if (this.nameTagContainer) {
        // Nametag trên đỉnh đầu sprite 64px — y - 38
        this.nameTagContainer.setPosition(this.x, this.y - 38);
      }

      if (this.speechBubble) {
        this.speechBubble.setPosition(this.x, this.y - 64);
      }

      if (this.equippedContainer) {
        this.equippedContainer.setPosition(this.x + 18, this.y - 8);
      }
    }
  }

  destroy(fromScene) {
    if (this.shadowEllipse) {
      this.shadowEllipse.destroy();
      this.shadowEllipse = null;
    }
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
