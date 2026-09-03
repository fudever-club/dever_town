import Phaser from 'phaser';

/**
 * AmbientEnvironmentManager: Hệ thống Hạt Khí Quyển & Môi Trường Động Học cho DEVER TOWN
 * Tận dụng Phaser 3.88 WebGL Hardware-Accelerated Particle Emitters để tạo sự sống động
 * cho từng phòng (Lá trà bay ở Vườn Trà, Khói cafe ở Căn Tin, Hạt neon ở Lab, Bụi bước chân).
 */
export class AmbientEnvironmentManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentRoomId = null;
    this.activeEmitters = [];
    this.footstepEmitter = null;

    this.initTextures();
  }

  /**
   * Tự động tổng hợp các texture hạt pixel siêu nhẹ (0kb asset tải ngoài)
   */
  initTextures() {
    if (!this.scene || !this.scene.textures) return;

    // 1. Cánh hoa trà / lá xanh (Tea Leaf / Sakura)
    if (!this.scene.textures.exists('particle_leaf')) {
      const canvas = document.createElement('canvas');
      canvas.width = 6;
      canvas.height = 4;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#86efac'; // Xanh lá non
      ctx.fillRect(1, 0, 4, 3);
      ctx.fillStyle = '#22c55e'; // Xanh đậm
      ctx.fillRect(2, 1, 2, 2);
      this.scene.textures.addCanvas('particle_leaf', canvas);
    }

    // 2. Làn khói cà phê (Coffee Steam)
    if (!this.scene.textures.exists('particle_steam')) {
      const canvas = document.createElement('canvas');
      canvas.width = 6;
      canvas.height = 6;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(3, 3, 0, 3, 3, 3);
      grad.addColorStop(0, 'rgba(255, 237, 213, 0.7)');
      grad.addColorStop(1, 'rgba(255, 237, 213, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 6, 6);
      this.scene.textures.addCanvas('particle_steam', canvas);
    }

    // 3. Hạt dữ liệu không gian mạng (Cyber Data Mote)
    if (!this.scene.textures.exists('particle_data')) {
      const canvas = document.createElement('canvas');
      canvas.width = 4;
      canvas.height = 4;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#38bdf8'; // Cyan
      ctx.fillRect(0, 0, 3, 3);
      this.scene.textures.addCanvas('particle_data', canvas);
    }

    // 4. Bụi bước chân (Footstep Dust)
    if (!this.scene.textures.exists('particle_dust')) {
      const canvas = document.createElement('canvas');
      canvas.width = 4;
      canvas.height = 4;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fillRect(1, 1, 2, 2);
      this.scene.textures.addCanvas('particle_dust', canvas);
    }

    // 5. Ánh sáng lấp lánh (Sparkle / Star)
    if (!this.scene.textures.exists('particle_sparkle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 5;
      canvas.height = 5;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fde047'; // Vàng rực rỡ
      ctx.fillRect(2, 0, 1, 5);
      ctx.fillRect(0, 2, 5, 1);
      this.scene.textures.addCanvas('particle_sparkle', canvas);
    }

    // 6. Bọt nước hồ bơi (Water Caustic)
    if (!this.scene.textures.exists('particle_water')) {
      const canvas = document.createElement('canvas');
      canvas.width = 4;
      canvas.height = 4;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(103, 232, 249, 0.75)';
      ctx.fillRect(1, 1, 2, 2);
      this.scene.textures.addCanvas('particle_water', canvas);
    }
  }

  /**
   * Thiết lập không khí môi trường theo phòng hiện tại
   * @param {string} roomId
   */
  setRoom(roomId) {
    this.clearEmitters();
    this.currentRoomId = roomId;

    const mapW = 800;
    const mapH = 608;

    switch (roomId) {
      case 'tea_garden':
        // Vườn Trà FUDA: Cánh hoa lá trà bồng bềnh bay theo làn gió uốn lượn
        this.createEmitter('particle_leaf', {
          x: { min: 0, max: mapW + 100 },
          y: -20,
          lifespan: 8000,
          speedX: { min: -45, max: -20 },
          speedY: { min: 30, max: 60 },
          scale: { start: 1, end: 0.6 },
          rotate: { min: 0, max: 360 },
          alpha: { start: 0.9, end: 0 },
          quantity: 1,
          frequency: 350
        });
        break;

      case 'dever_lab':
        // Tech Lab: Hạt dữ liệu neon cyan/tím thăng hoa từ các dãy server
        this.createEmitter('particle_data', {
          x: { min: 100, max: mapW - 100 },
          y: { min: mapH - 120, max: mapH - 40 },
          lifespan: 3500,
          speedY: { min: -35, max: -15 },
          speedX: { min: -10, max: 10 },
          scale: { start: 1.2, end: 0.2 },
          alpha: { start: 0.85, end: 0 },
          quantity: 1,
          frequency: 300,
          tint: [0x38bdf8, 0xa855f7, 0x06b6d4]
        });
        break;

      case 'canteen_cafe':
        // Căn Tin & Cafe: Làn khói cà phê nghi ngút bốc lên từ các bàn ăn và quầy bar
        this.createEmitter('particle_steam', {
          x: { min: 180, max: mapW - 180 },
          y: { min: 280, max: mapH - 140 },
          lifespan: 3000,
          speedY: { min: -25, max: -12 },
          speedX: { min: -4, max: 4 },
          scale: { start: 0.6, end: 2.2 },
          alpha: { start: 0.45, end: 0 },
          quantity: 1,
          frequency: 450
        });
        break;

      case 'library_lounge':
        // Thư Viện: Bụi nắng vàng dịu dàng bay lơ lửng dưới đèn đọc sách
        this.createEmitter('particle_sparkle', {
          x: { min: 80, max: mapW - 80 },
          y: { min: 80, max: mapH - 80 },
          lifespan: 4000,
          speedX: { min: -6, max: 6 },
          speedY: { min: -8, max: 4 },
          scale: { start: 0.8, end: 0.2 },
          alpha: { start: 0.7, end: 0 },
          quantity: 1,
          frequency: 600,
          tint: [0xfde047, 0xfacc15]
        });
        break;

      case 'sports_complex':
        // Khu Thể Thao: Bọt nước phản quang lấp lánh trên bề mặt bể bơi
        this.createEmitter('particle_water', {
          x: { min: 220, max: 580 },
          y: { min: 160, max: 420 },
          lifespan: 2500,
          speedX: { min: -5, max: 5 },
          speedY: { min: -10, max: 10 },
          scale: { start: 1, end: 0.3 },
          alpha: { start: 0.8, end: 0 },
          quantity: 1,
          frequency: 250
        });
        break;

      case 'game_arcade':
        // Arcade & Robot: Tia lửa neon lấp lánh quanh các cỗ máy game thùng
        this.createEmitter('particle_sparkle', {
          x: { min: 120, max: mapW - 120 },
          y: { min: 120, max: mapH - 120 },
          lifespan: 1800,
          speedX: { min: -18, max: 18 },
          speedY: { min: -18, max: 18 },
          scale: { start: 1.1, end: 0.1 },
          alpha: { start: 0.9, end: 0 },
          quantity: 1,
          frequency: 200,
          tint: [0xec4899, 0xa855f7, 0x38bdf8, 0xfacc15]
        });
        break;

      case 'main_hall':
      default:
        // Sảnh Alpha: Bụi nắng vàng thanh khiết chào đón tân thủ
        this.createEmitter('particle_sparkle', {
          x: { min: 100, max: mapW - 100 },
          y: { min: 100, max: mapH - 100 },
          lifespan: 4500,
          speedX: { min: -8, max: 8 },
          speedY: { min: -10, max: 5 },
          scale: { start: 0.7, end: 0.1 },
          alpha: { start: 0.6, end: 0 },
          quantity: 1,
          frequency: 500,
          tint: [0xfef08a, 0x38bdf8]
        });
        break;
    }
  }

  /**
   * Tạo một Emitter an toàn với độ sâu depth thích hợp
   */
  createEmitter(textureKey, config) {
    if (!this.scene || !this.scene.add) return null;

    try {
      const emitter = this.scene.add.particles(0, 0, textureKey, config);
      emitter.setDepth(999); // Nằm trên sàn, dưới nhân vật và nhãn
      this.activeEmitters.push(emitter);
      return emitter;
    } catch (e) {
      console.warn('Lỗi khởi tạo Ambient Emitter:', e);
      return null;
    }
  }

  /**
   * Tạo cụm bụi bước chân li ti khi người chơi di chuyển
   * @param {number} x
   * @param {number} y
   */
  spawnFootstepDust(x, y) {
    if (!this.scene || !this.scene.add) return;

    try {
      const dust = this.scene.add.particles(x, y + 10, 'particle_dust', {
        lifespan: 350,
        speedX: { min: -15, max: 15 },
        speedY: { min: -5, max: 5 },
        scale: { start: 1, end: 0.2 },
        alpha: { start: 0.65, end: 0 },
        emitting: false
      });
      dust.setDepth(y - 1);
      dust.explode(3);

      this.scene.time.delayedCall(450, () => {
        if (dust && dust.destroy) dust.destroy();
      });
    } catch (e) {}
  }

  /**
   * Xóa sạch các emitter hiện tại để giải phóng bộ nhớ khi đổi phòng
   */
  clearEmitters() {
    this.activeEmitters.forEach(em => {
      try {
        if (em && em.destroy) em.destroy();
      } catch (e) {}
    });
    this.activeEmitters = [];
  }

  destroy() {
    this.clearEmitters();
  }
}
