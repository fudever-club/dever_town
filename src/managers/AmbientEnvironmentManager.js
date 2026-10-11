import Phaser from 'phaser';
import { WEATHER_CONFIG } from '../config/weatherConfig.js';

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

    // --- Weather (mưa + mây trôi cho phòng ngoài trời) ---
    this.weather = 'clear';
    this.cloudSprites = [];
    this.rainEmitter = null;
    this.rainTint = null;
    this.weatherTimer = null;

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

    // 7. Đom đóm đêm (Fireflies)
    if (!this.scene.textures.exists('particle_firefly')) {
      const canvas = document.createElement('canvas');
      canvas.width = 6;
      canvas.height = 6;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(3, 3, 0, 3, 3, 3);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#bef264');
      grad.addColorStop(1, 'rgba(190, 242, 100, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 6, 6);
      this.scene.textures.addCanvas('particle_firefly', canvas);
    }

    // 8. Hạt mưa (Rain Streak) — vệt xiên mảnh, xanh nhạt trong suốt
    if (!this.scene.textures.exists('particle_rain')) {
      const canvas = document.createElement('canvas');
      canvas.width = 3;
      canvas.height = 18;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 18);
      grad.addColorStop(0, 'rgba(186, 230, 253, 0)');
      grad.addColorStop(0.45, 'rgba(186, 230, 253, 0.9)');
      grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2.4, 0);
      ctx.lineTo(0.6, 18);
      ctx.stroke();
      this.scene.textures.addCanvas('particle_rain', canvas);
    }

    // 9. Mây pixel (Cloud) — cụm ellipse trắng mềm, vẽ procedural
    if (!this.scene.textures.exists('particle_cloud')) {
      const canvas = document.createElement('canvas');
      canvas.width = 96;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      const blobs = [
        [30, 26, 22], [52, 20, 26], [74, 27, 20], [16, 30, 12], [86, 32, 10]
      ];
      for (const [cx, cy, r] of blobs) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      this.scene.textures.addCanvas('particle_cloud', canvas);
    }
  }

  /**
   * Bật / Tắt hiệu ứng Đom Đóm đêm cho các khu vực ngoài trời
   * @param {boolean} enabled
   */
  setFirefliesEnabled(enabled) {
    if (enabled) {
      if (this.fireflyEmitter) return;
      const mapW = 800;
      const mapH = 608;
      this.fireflyEmitter = this.createEmitter('particle_firefly', {
        x: { min: 40, max: mapW - 40 },
        y: { min: 80, max: mapH - 60 },
        lifespan: { min: 3500, max: 6000 },
        speedX: { min: -18, max: 18 },
        speedY: { min: -15, max: 15 },
        scale: { start: 0.3, end: 1.1 },
        alpha: { start: 0, end: 0.85, ease: 'Sine.easeInOut' },
        quantity: 1,
        frequency: 450,
        blendMode: 'ADD'
      });
    } else {
      if (this.fireflyEmitter) {
        try { this.fireflyEmitter.destroy(); } catch (e) {}
        const idx = this.activeEmitters.indexOf(this.fireflyEmitter);
        if (idx !== -1) this.activeEmitters.splice(idx, 1);
        this.fireflyEmitter = null;
      }
    }
  }

  /**
   * Thiết lập không khí môi trường theo phòng hiện tại
   * @param {string} roomId
   */
  setRoom(roomId) {
    this.clearEmitters();
    this.clearWeather();
    this.currentRoomId = roomId;
    this.applyAmbientLight(roomId);

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

    // Thời tiết động cho phòng ngoài trời (mây trôi + mưa ngẫu nhiên)
    this.setupWeather(roomId);
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
   * Tạo cụm bụi bước chân li ti khi người chơi di chuyển.
   *
   * Perf: dùng MỘT ParticleEmitter tái sử dụng (tạo lười một lần) + explode(3)
   * thay vì scene.add.particles + delayedCall destroy mỗi bước (~13 lần/giây
   * khi đang đi). Không cấp phát mỗi bước, không garbage churn.
   * @param {number} x
   * @param {number} y
   */
  _getFootstepEmitter() {
    if (this.footstepEmitter && this.footstepEmitter.active) return this.footstepEmitter;
    if (!this.scene || !this.scene.add) return null;

    try {
      this.footstepEmitter = this.scene.add.particles(0, 0, 'particle_dust', {
        lifespan: 350,
        speedX: { min: -15, max: 15 },
        speedY: { min: -5, max: 5 },
        scale: { start: 1, end: 0.2 },
        alpha: { start: 0.65, end: 0 },
        emitting: false
      });
      // Không đưa vào activeEmitters: emitter này sống suốt đời scene,
      // không bị clearEmitters() hủy khi đổi phòng.
      return this.footstepEmitter;
    } catch (e) {
      return null;
    }
  }

  spawnFootstepDust(x, y) {
    if (!this.scene || !this.scene.add) return;

    try {
      const dust = this._getFootstepEmitter();
      if (!dust) return;
      dust.setDepth(y - 1);
      dust.explode(3, x, y + 10);
    } catch (e) {}
  }

  /* ================= HỆ THỐNG THỜI TIẾT (Phase 2) =================
   * Mây trôi + mưa ngẫu nhiên cho phòng ngoài trời.
   * Mưa: hạt streak xiên, tint lạnh rất nhẹ, tiếng mưa procedural.
   * Mây: sprite procedural trôi ngang phía trên, depth thấp (sau nhân vật).
   */

  setupWeather(roomId) {
    if (!WEATHER_CONFIG.outdoorRooms.includes(roomId)) return;
    if (!this.scene || !this.scene.add) return;
    this.spawnClouds();
    this.scheduleWeatherCheck();
  }

  /**
   * Phát hiện thiết bị di động - cùng công thức với WorldScene.computeDefaultZoom()
   * để hành vi mobile nhất quán trong toàn game (màn nhỏ hoặc có touch).
   */
  _isMobileDevice() {
    if (typeof window === 'undefined' || !window) return false;
    return window.innerWidth <= 1024 ||
      ('ontouchstart' in window) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
  }

  spawnClouds() {
    const mapW = 800;
    const isMobile = this._isMobileDevice();
    const cloudCount = isMobile ? WEATHER_CONFIG.mobileCloudCount : WEATHER_CONFIG.cloudCount;
    const cloudAlpha = isMobile ? WEATHER_CONFIG.mobileCloudAlpha : WEATHER_CONFIG.cloudAlpha;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.scene.add.image(
        Phaser.Math.Between(-120, mapW + 120),
        Phaser.Math.Between(16, 130),
        'particle_cloud'
      );
      cloud.setDepth(5);
      cloud.setAlpha(cloudAlpha * Phaser.Math.FloatBetween(0.7, 1));
      const scale = Phaser.Math.FloatBetween(0.9, 1.8);
      cloud.setScale(scale);
      this.cloudSprites.push(cloud);
      this.driftCloud(cloud, mapW);
    }
  }

  driftCloud(cloud, mapW) {
    if (!cloud || !cloud.active) return;
    const speed = Phaser.Math.FloatBetween(WEATHER_CONFIG.cloudSpeedMin, WEATHER_CONFIG.cloudSpeedMax);
    const distance = mapW + 240 - cloud.x;
    const duration = (distance / speed) * 1000;
    this.scene.tweens.add({
      targets: cloud,
      x: mapW + 120,
      duration,
      ease: 'Linear',
      onComplete: () => {
        if (!cloud.active) return;
        cloud.x = -120;
        cloud.y = Phaser.Math.Between(16, 130);
        this.driftCloud(cloud, mapW);
      }
    });
  }

  /**
   * Bắt đầu mưa. intensity 0..1.
   */
  startRain(intensity) {
    if (this.weather === 'rain' || !this.scene || !this.scene.add) return;
    this.weather = 'rain';
    const level = intensity ?? Phaser.Math.FloatBetween(
      WEATHER_CONFIG.rainIntensityMin, WEATHER_CONFIG.rainIntensityMax
    );

    const mapW = 800;
    const mapH = 608;
    // Mobile: chia đôi quantity + tăng gấp đôi interval để giảm fullscreen
    // overdraw alpha-blend (~75% ít streak đồng thời), mưa vẫn đọc được.
    const isMobile = this._isMobileDevice();
    const rainQuantity = isMobile
      ? Math.max(2, Math.round((3 + level * 5) / WEATHER_CONFIG.mobileRainQuantityDivisor))
      : Math.round(3 + level * 5);
    const rainFrequency = isMobile
      ? WEATHER_CONFIG.mobileRainFrequencyMs
      : WEATHER_CONFIG.rainFrequencyMs;
    try {
      this.rainEmitter = this.scene.add.particles(0, 0, 'particle_rain', {
        x: { min: -40, max: mapW + 40 },
        y: -30,
        lifespan: 1400,
        speedY: { min: 480, max: 680 },
        speedX: { min: -90, max: -50 },
        scale: { min: 0.9, max: 1.4 },
        alpha: { start: 0.7, end: 0.3 },
        quantity: rainQuantity,
        frequency: rainFrequency
      });
      this.rainEmitter.setDepth(2000); // Mưa ở tiền cảnh, trước nhân vật
    } catch (e) {
      console.warn('Lỗi khởi tạo mưa:', e);
    }

    // Tint lạnh rất nhẹ gợi cảm giác mưa (vẫn sáng như gather.town)
    if (!this.rainTint) {
      this.rainTint = this.scene.add.rectangle(
        400, 304, mapW, mapH,
        WEATHER_CONFIG.rainTintColor, 0
      ).setDepth(999990).setScrollFactor(0);
    }
    this.scene.tweens.add({
      targets: this.rainTint,
      alpha: WEATHER_CONFIG.rainTintAlpha,
      duration: 2000,
      ease: 'Sine.easeInOut'
    });

    // Tiếng mưa procedural (Web Audio noise qua lowpass)
    if (this.scene.audioManager && this.scene.audioManager.startRainSound) {
      this.scene.audioManager.startRainSound(level);
    }
  }

  stopRain() {
    if (this.weather !== 'rain') return;
    this.weather = 'clear';
    if (this.rainEmitter) {
      try { this.rainEmitter.destroy(); } catch (e) {}
      this.rainEmitter = null;
    }
    if (this.rainTint) {
      this.scene.tweens.add({
        targets: this.rainTint,
        alpha: 0,
        duration: 2000,
        ease: 'Sine.easeInOut'
      });
    }
    if (this.scene.audioManager && this.scene.audioManager.stopRainSound) {
      this.scene.audioManager.stopRainSound();
    }
  }

  /**
   * Lên lịch kiểm tra thời tiết: mỗi chu kỳ có xác suất đổ mưa.
   */
  scheduleWeatherCheck() {
    if (this.weatherTimer) {
      this.weatherTimer.remove();
      this.weatherTimer = null;
    }
    if (!this.scene || !this.scene.time) return;
    this.weatherTimer = this.scene.time.delayedCall(WEATHER_CONFIG.autoCheckMs, () => {
      this.weatherTimer = null;
      if (this.weather === 'clear' && Math.random() < WEATHER_CONFIG.rainChance) {
        const duration = Phaser.Math.Between(
          WEATHER_CONFIG.rainDurationMin, WEATHER_CONFIG.rainDurationMax
        );
        this.startRain();
        this.scene.time.delayedCall(duration, () => this.stopRain());
      }
      // Lên lịch vòng tiếp theo (chỉ khi vẫn ở phòng ngoài trời)
      if (WEATHER_CONFIG.outdoorRooms.includes(this.currentRoomId)) {
        this.scheduleWeatherCheck();
      }
    });
  }

  clearWeather() {
    this.stopRainSoundOnly();
    if (this.weatherTimer) {
      try { this.weatherTimer.remove(); } catch (e) {}
      this.weatherTimer = null;
    }
    if (this.rainEmitter) {
      try { this.rainEmitter.destroy(); } catch (e) {}
      this.rainEmitter = null;
    }
    if (this.rainTint) {
      try { this.rainTint.destroy(); } catch (e) {}
      this.rainTint = null;
    }
    this.cloudSprites.forEach(c => { try { if (c && c.destroy) c.destroy(); } catch (e) {} });
    this.cloudSprites = [];
    this.weather = 'clear';
  }

  stopRainSoundOnly() {
    // Dừng tiếng mưa ngay lập tức khi đổi phòng (không fade dài)
    if (this.scene?.audioManager?.stopRainSound) {
      this.scene.audioManager.stopRainSound();
    }
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

  /**
   * Áp dụng ánh sáng môi trường (Ambient Tint) theo phòng kiểu Stardew Valley
   * @param {string} roomId
   */
  applyAmbientLight(roomId) {
    if (!this.scene || !this.scene.add) return;

    const lightingConfig = {
      main_hall: { ambientTint: 0xffffff, alpha: 0 },         // Sảnh Alpha sáng trong trẻo
      dever_lab: { ambientTint: 0x0f172a, alpha: 0.08 },      // Cyber Lab xanh thẫm công nghệ
      library_lounge: { ambientTint: 0xfef3c7, alpha: 0.06 }, // Thư viện đèn vàng đọc sách
      memory_room: { ambientTint: 0x1e1b4b, alpha: 0.10 },    // Phòng truyền thống tím sẫm trang trọng
      canteen_cafe: { ambientTint: 0xfef9c3, alpha: 0.05 },   // Căn tin ấm cúng cafe
      sports_complex: { ambientTint: 0xd1fae5, alpha: 0.04 }, // Thể thao ngoài trời tươi mát
      tea_garden: { ambientTint: 0xecfdf5, alpha: 0.04 },     // Vườn trà dịu mát
      game_arcade: { ambientTint: 0x3b0764, alpha: 0.08 },    // Arcade tím neon
      dorm_room: { ambientTint: 0xfef3c7, alpha: 0.05 },      // KTX đèn vàng ấm cúng
      meeting_room: { ambientTint: 0xfef9c3, alpha: 0.04 },   // Phòng họp vàng ấm
      academic_hub: { ambientTint: 0xffffff, alpha: 0 }
    };

    const cfg = lightingConfig[roomId] || { ambientTint: 0xffffff, alpha: 0 };
    if (!this.lightOverlay) {
      if (cfg.alpha > 0) {
        this.lightOverlay = this.scene.add.rectangle(
          400, 304, 800, 608, cfg.ambientTint, cfg.alpha
        ).setDepth(999990).setScrollFactor(0);
      }
    } else {
      if (cfg.alpha > 0) {
        this.lightOverlay.setFillStyle(cfg.ambientTint, cfg.alpha);
        this.lightOverlay.setVisible(true);
      } else {
        this.lightOverlay.setVisible(false);
      }
    }
  }

  destroy() {
    this.clearEmitters();
    this.clearWeather();
    if (this.lightOverlay) {
      this.lightOverlay.destroy();
      this.lightOverlay = null;
    }
    // Emitter bụi bước chân tái sử dụng (không nằm trong activeEmitters)
    if (this.footstepEmitter) {
      try { this.footstepEmitter.destroy(); } catch (e) {}
      this.footstepEmitter = null;
    }
  }
}
