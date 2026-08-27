import Phaser from 'phaser';

/**
 * Hàm cắt chuỗi an toàn chuẩn Unicode Grapheme (tránh cắt giữa chừng ký tự có dấu hoặc emoji)
 */
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
    const avatarId = options.avatarId || 'dev_hoodie';
    const textureKey = `char_${avatarId}`;

    super(scene, x, y, textureKey, 0);

    this.name = options.name || 'Dever Member';
    this.avatarId = avatarId;
    this.role = options.role || 'guest';
    this.isCurrentPlayer = options.isCurrentPlayer || false;

    // Đưa vào Scene và bật Arcade Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Cấu hình Hitbox chỉ ở phần chân (18x14 px)
    this.body.setSize(18, 14);
    this.body.setOffset(7, 18);
    this.body.setCollideWorldBounds(true);

    this.currentDirection = 'down';
    this.speechBubble = null;
    this.speechTimer = null;

    // Tạo Name Tag trên đầu
    this.createNameTag();

    // Bật Depth Sorting 2.5D
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
      case 'admin': return 'rgba(217, 119, 6, 0.9)'; // Amber
      case 'leader': return 'rgba(147, 51, 234, 0.9)'; // Purple
      case 'dev': return 'rgba(37, 99, 235, 0.9)'; // Blue
      default: return 'rgba(30, 41, 59, 0.85)'; // Slate
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

  /**
   * Hiển thị Speech Bubble với bộ xử lý Unicode tiếng Việt hoàn chỉnh
   */
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

    // Text object với font stack hỗ trợ Unicode đầy đủ và padding chống cắt dấu
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
    bg.lineStyle(1.5, 0x3b82f6, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    // Mũi nhọn phía dưới bong bóng
    bg.fillStyle(0xffffff, 0.96);
    bg.beginPath();
    bg.moveTo(-5, h / 2);
    bg.lineTo(5, h / 2);
    bg.lineTo(0, h / 2 + 5);
    bg.closePath();
    bg.fillPath();

    this.speechBubble.add([bg, text]);

    // Tự động mờ dần và biến mất sau 4.5s
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

  stopMovement() {
    if (this.body) {
      this.body.setVelocity(0, 0);
    }
    const animKey = `idle_${this.currentDirection}_${this.avatarId}`;
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    }
  }

  update(inputData) {
    const speed = 160;
    const { vector, isMoving, left, right, up, down } = inputData;

    this.body.setVelocity(vector.x * speed, vector.y * speed);

    // Xác định hướng nhìn
    if (down) this.currentDirection = 'down';
    else if (up) this.currentDirection = 'up';
    else if (left) this.currentDirection = 'left';
    else if (right) this.currentDirection = 'right';

    // Chạy Animation tương ứng với Avatar
    const animPrefix = isMoving ? 'walk' : 'idle';
    const animKey = `${animPrefix}_${this.currentDirection}_${this.avatarId}`;

    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    }

    // Cập nhật độ sâu 2.5D Depth Sorting
    this.setDepth(this.y);

    // Cập nhật vị trí Name Tag & Speech Bubble
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
