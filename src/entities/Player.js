import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} name
   * @param {boolean} isCurrentPlayer
   */
  constructor(scene, x, y, name = 'Dev Member', isCurrentPlayer = true) {
    super(scene, x, y, 'player_sprites', 1); // Frame 1: Idle Down

    this.scene = scene;
    this.name = name;
    this.isCurrentPlayer = isCurrentPlayer;
    this.currentDirection = 'down';

    // Thêm vào Scene và bật Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Cấu hình Hitbox ở phần chân để va chạm 2.5D mượt mà
    this.body.setSize(GAME_CONFIG.HITBOX.WIDTH, GAME_CONFIG.HITBOX.HEIGHT);
    this.body.setOffset(GAME_CONFIG.HITBOX.OFFSET_X, GAME_CONFIG.HITBOX.OFFSET_Y);
    this.body.setCollideWorldBounds(true);

    // Tạo Name Tag phía trên đầu
    this.createNameTag();

    // Khởi tạo Animation nếu chưa có
    this.initAnimations();
  }

  createNameTag() {
    this.nameText = this.scene.add.text(this.x, this.y - 24, this.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontWeight: '600',
      fill: '#ffffff',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      padding: { x: 5, y: 2 }
    });
    this.nameText.setOrigin(0.5, 0.5);
    this.nameText.setDepth(999999); // Luôn ở trên cùng
  }

  initAnimations() {
    const anims = this.scene.anims;
    if (anims.exists('player_walk_down')) return;

    // Hướng Down (Row 0: frames 0, 1, 2)
    anims.create({
      key: 'player_walk_down',
      frames: anims.generateFrameNumbers('player_sprites', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });

    // Hướng Left (Row 1: frames 3, 4, 5)
    anims.create({
      key: 'player_walk_left',
      frames: anims.generateFrameNumbers('player_sprites', { start: 3, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    // Hướng Right (Row 2: frames 6, 7, 8)
    anims.create({
      key: 'player_walk_right',
      frames: anims.generateFrameNumbers('player_sprites', { start: 6, end: 8 }),
      frameRate: 8,
      repeat: -1
    });

    // Hướng Up (Row 3: frames 9, 10, 11)
    anims.create({
      key: 'player_walk_up',
      frames: anims.generateFrameNumbers('player_sprites', { start: 9, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
  }

  update(inputData) {
    if (!this.body) return;

    // Cập nhật Depth theo vị trí Y (2.5D sorting)
    this.setDepth(this.y);

    // Đồng bộ vị trí Name Tag
    if (this.nameText) {
      this.nameText.setPosition(Math.round(this.x), Math.round(this.y - 24));
    }

    if (!this.isCurrentPlayer || !inputData) return;

    const { vector, left, right, up, down, isMoving } = inputData;

    if (isMoving) {
      // Chuẩn hóa vector và nhân với vận tốc cấu hình
      this.body.setVelocity(
        vector.x * GAME_CONFIG.PLAYER_SPEED,
        vector.y * GAME_CONFIG.PLAYER_SPEED
      );

      // Xác định animation theo hướng ưu tiên
      if (left) {
        this.currentDirection = 'left';
        this.anims.play('player_walk_left', true);
      } else if (right) {
        this.currentDirection = 'right';
        this.anims.play('player_walk_right', true);
      } else if (up) {
        this.currentDirection = 'up';
        this.anims.play('player_walk_up', true);
      } else if (down) {
        this.currentDirection = 'down';
        this.anims.play('player_walk_down', true);
      }
    } else {
      // Dừng di chuyển
      this.body.setVelocity(0, 0);
      this.anims.stop();

      // Đặt frame Idle tương ứng với hướng quay mặt cuối cùng
      const idleFrames = {
        down: 1,
        left: 4,
        right: 7,
        up: 10
      };
      this.setFrame(idleFrames[this.currentDirection] || 1);
    }
  }

  destroy(fromScene) {
    if (this.nameText) {
      this.nameText.destroy();
    }
    super.destroy(fromScene);
  }
}
