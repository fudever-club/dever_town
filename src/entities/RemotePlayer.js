import Phaser from 'phaser';
import { ITEMS_DATABASE } from '../config/items.js';
import { PERF_CONFIG } from '../config/perfConfig.js';
import { playBodyEmote, syncEmoteOverlays, isBodyEmote } from '../utils/emoteAnimations.js';

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

    // Phase 0 perf: client-side culling of render work when off-camera.
    // Only rendering visibility is ever touched here — network, interpolation
    // and state updates keep running untouched. Local player is a different
    // class (Player) so it can never be culled by this code.
    this._renderCulled = false;

    this.shadowEllipse = scene.add.ellipse(x, y + 30, 22, 8, 0x000000, 0.28);
    this.shadowEllipse.setDepth(this.y - 0.1);

    this.createNameTag();
    this.createEquippedItemDisplay();
    this.setDepth(this.y + 30);

    // Bật tương tác click vào nhân vật để xem Hồ sơ & Kết bạn
    this.setInteractive({ cursor: 'pointer' });
    this.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.openProfile();
      }
    });
  }

  createNameTag() {
    if (this.nameTagContainer) {
      this.nameTagContainer.destroy();
    }

    this.nameTagContainer = this.scene.add.container(this.x, this.y - 38);
    this.nameTagContainer.setDepth(1000001);
    this.nameTagContainer.setAlpha(0);

    // Hiệu ứng nảy vào êm ái khi người chơi khác xuất hiện
    this.scene.tweens.add({
      targets: this.nameTagContainer,
      y: this.y - 28,
      alpha: 1,
      duration: 320,
      ease: 'Back.easeOut'
    });

    const rolePrefix = this.role === 'admin' ? '[Admin] ' :
                       this.role === 'leader' ? '[Leader] ' :
                       this.role === 'dev' ? '[Dev] ' : '';

    const displayName = `${rolePrefix}${this.name}`;

    const tagText = this.scene.add.text(0, 0, displayName, {
      fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: '11px',
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: this.getRoleColor(),
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5, 0.5);

    tagText.setInteractive({ cursor: 'pointer' });
    tagText.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.openProfile();
      }
    });

    this.nameTagContainer.add(tagText);
  }

  openProfile() {
    if (this.scene && this.scene.playerProfileModal) {
      this.scene.playerProfileModal.show({
        id: this.id,
        name: this.name,
        role: this.role,
        avatarId: this.avatarId,
        equippedItemId: this.equippedItemId,
        x: this.x,
        y: this.y
      });
    }
  }

  createEquippedItemDisplay() {
    if (this.equippedContainer) {
      this.equippedContainer.destroy();
      this.equippedContainer = null;
    }
    if (this._equippedTween) {
      this._equippedTween.stop();
      this._equippedTween = null;
    }
    // Xóa bỏ hoàn toàn bong bóng lơ lửng: Vật phẩm được vẽ trực tiếp vào bàn tay nhân vật
  }

  setEquippedItem(itemId) {
    this.equippedItemId = itemId;
    if (this.equippedContainer) {
      this.equippedContainer.destroy();
      this.equippedContainer = null;
    }
    if (this.wardrobeConfig) {
      this.wardrobeConfig.inHandItem = itemId;
      this.applyCustomWardrobe(this.wardrobeConfig);
    }
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
      fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
      nod: '👍',
      power: '💪',
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

    // Body emotes (wave/nod/power/dance): overlay tay pixel + squash/tween
    if (isBodyEmote(emoteId)) {
      playBodyEmote(this.scene, this, emoteId);
    }
  }

  /**
   * Đặt trạng thái hoạt động (ví dụ: 'dreaming').
   * Hiển thị text trạng thái trên đầu nhân vật.
   */
  setActivity(activity) {
    this.activity = activity;

    if (this.activityText) {
      this.activityText.destroy();
      this.activityText = null;
    }

    if (activity === 'dreaming') {
      this.activityText = this.scene.add.text(0, -52, 'đang mơ  Z', {
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontSize: '11px',
        color: '#a78bfa',
        backgroundColor: 'rgba(30, 27, 75, 0.85)',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5, 0.5);
      if (this.nameTagContainer) {
        this.nameTagContainer.add(this.activityText);
        this.activityText.setPosition(0, -24);
      }
    }
  }

  /**
   * Client-side render culling: hide all visuals of this RemotePlayer when it
   * is outside the camera world view (plus a margin so edge players don't pop),
   * and restore them when it comes back into view.
   * Pure rendering visibility — position, animation, interpolation, network
   * state all keep updating in update() regardless of culling.
   */
  updateCulling() {
    if (!PERF_CONFIG.REMOTE_PLAYER_CULL_ENABLED) {
      if (this._renderCulled) this._applyRenderVisibility(true);
      return;
    }
    const cam = this.scene?.cameras?.main;
    if (!cam) return;
    const view = cam.worldView;
    const m = PERF_CONFIG.REMOTE_PLAYER_CULL_MARGIN;
    const inView =
      this.x > view.x - m && this.x < view.right + m &&
      this.y > view.y - m && this.y < view.bottom + m;

    if (inView !== !this._renderCulled) {
      // Visibility state must change: inView -> visible, off-view -> hidden.
      this._applyRenderVisibility(inView);
    } else if (this._renderCulled) {
      // Stay culled: transient objects (speech bubbles, emote icons, body-emote
      // overlays) may have been created while hidden — keep them hidden so the
      // player can't pop partially visible while off-camera.
      this._hideTransientRenderObjects();
    }
  }

  _applyRenderVisibility(visible) {
    this._renderCulled = !visible;
    this.setVisible(visible);
    if (this.shadowEllipse) this.shadowEllipse.setVisible(visible);
    if (this.nameTagContainer) this.nameTagContainer.setVisible(visible);
    this._setTransientRenderObjectsVisible(visible);
    // No pointer events on a culled (invisible) player; restore on un-cull.
    if (this.input) this.input.enabled = visible;
    if (this.nameTagContainer && this.nameTagContainer.list) {
      for (const child of this.nameTagContainer.list) {
        if (child && child.input) child.input.enabled = visible;
      }
    }
  }

  _hideTransientRenderObjects() {
    this._setTransientRenderObjectsVisible(false);
  }

  _setTransientRenderObjectsVisible(visible) {
    if (this.speechBubble) this.speechBubble.setVisible(visible);
    if (this.equippedContainer) this.equippedContainer.setVisible(visible);
    if (this.emoteContainer) this.emoteContainer.setVisible(visible);
    if (this._emoteOverlays) {
      for (const o of this._emoteOverlays) {
        if (o && o.obj) o.obj.setVisible(visible);
      }
    }
  }

  update(time, delta = 16.67) {
    syncEmoteOverlays(this);
    const prevX = this.x;
    const prevY = this.y;
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

    // Tự động kích hoạt animation walk nếu đang di chuyển hoặc idle/breathe khi đứng yên
    const isVisiblyMoving = this.targetMoving || distSq > 4;
    const breatheKey = `idle_breathe_${this.currentDirection}_${this.avatarId}`;
    const defaultIdleKey = `idle_${this.currentDirection}_${this.avatarId}`;
    const animKey = isVisiblyMoving
      ? `walk_${this.currentDirection}_${this.avatarId}`
      : (this.scene?.anims?.exists(breatheKey) ? breatheKey : defaultIdleKey);

    try {
      if (this.scene?.anims?.exists(animKey)) {
        this.anims.play(animKey, true);
      }
    } catch (e) {}

    // --- Đồng bộ walk cycle với tốc độ nội suy thực tế (chống trượt chân) ---
    // Đo quãng đường đã đi trong frame này để ước lượng px/giây.
    const dtSec = Math.max(delta, 1) / 1000;
    const movedPx = Math.hypot(this.x - prevX, this.y - prevY);
    const pxPerSec = movedPx / dtSec;
    if (isVisiblyMoving) {
      this.anims.timeScale = Phaser.Math.Clamp(pxPerSec / 160, 0.2, 1.25);
    } else {
      this.anims.timeScale = 1;
    }

    if (isVisiblyMoving) {
      // Squash & stretch đồng bộ KHUNG HÌNH (2 nhịp/vòng 8 frame), thay cho sin tự do
      let walkProg = 0;
      try { walkProg = this.anims.getProgress?.() ?? 0; } catch (e) {}
      const bob = Math.sin(walkProg * Math.PI * 4) * 0.04;
      this.scaleY = 1.0 + bob;
      this.scaleX = 1.0 - bob * 0.7;
    } else {
      this.scaleY = 1.0;
      this.scaleX = 1.0;
    }

    // Cập nhật vị trí bóng chân và co giãn nhẹ theo nhịp bước
    if (this.shadowEllipse) {
      this.shadowEllipse.setPosition(this.x, this.y + 30);
      this.shadowEllipse.setDepth(this.y - 0.1);
      let shadowScale = 1.0;
      if (isVisiblyMoving) {
        try {
          const p = this.anims.getProgress?.() ?? 0;
          shadowScale = 0.94 + (0.5 + 0.5 * Math.sin(p * Math.PI * 4)) * 0.06;
        } catch (e) {}
      }
      this.shadowEllipse.setScale(shadowScale, 1.0);
    }

    if (this.lastX !== this.x || this.lastY !== this.y) {
      this.lastX = this.x;
      this.lastY = this.y;
      this.setDepth(this.y + 30);

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

    // Render culling is evaluated last, every frame. All movement/animation/
    // network state above runs regardless of visibility.
    this.updateCulling();
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
    if (this._equippedTween) {
      this._equippedTween.stop();
      this._equippedTween = null;
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
