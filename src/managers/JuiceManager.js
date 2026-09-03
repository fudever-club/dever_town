import Phaser from 'phaser';
import { audioManager } from '../utils/AudioManager.js';

/**
 * JuiceManager: Hệ thống Game Feel, Phản Hồi Xúc Cảm & Hiệu Ứng Bùng Nổ ("Juice") cho DEVER TOWN
 * Cung cấp:
 * - Chữ số bay đàn hồi (Floating Score / Combat Text)
 * - Rung lắc màn hình tinh tế (Micro Camera Shake)
 * - Pháo hoa giấy ăn mừng (Celebration Confetti)
 * - Hiệu ứng nảy số điểm (Score Bounce Pulse)
 */
export class JuiceManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.initConfettiTexture();
  }

  initConfettiTexture() {
    if (!this.scene || !this.scene.textures) return;

    if (!this.scene.textures.exists('particle_confetti')) {
      const canvas = document.createElement('canvas');
      canvas.width = 6;
      canvas.height = 6;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 6, 6);
      this.scene.textures.addCanvas('particle_confetti', canvas);
    }
  }

  /**
   * Hiển thị chữ số / nhãn bay lên từ một vị trí trong canvas
   * @param {number} x
   * @param {number} y
   * @param {string} text
   * @param {Object} options
   */
  showFloatingText(x, y, text, options = {}) {
    if (!this.scene || !this.scene.add) return;

    const color = options.color || '#38bdf8';
    const fontSize = options.fontSize || '13px';
    const fontWeight = options.fontWeight || '800';
    const strokeColor = options.strokeColor || '#070a12';
    const strokeThickness = options.strokeThickness ?? 3;

    const floatingText = this.scene.add.text(x, y - 10, text, {
      fontFamily: "'Outfit', 'JetBrains Mono', sans-serif",
      fontSize,
      fontWeight,
      color,
      stroke: strokeColor,
      strokeThickness,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5, 0.5);

    floatingText.setDepth(2000000); // Luôn nổi trên nhãn và nhân vật
    floatingText.setScale(0.6);

    // Tween nảy bật lên trên rồi tan biến
    this.scene.tweens.add({
      targets: floatingText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 180,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: floatingText,
          y: y - 52,
          scaleX: 1.0,
          scaleY: 1.0,
          alpha: 0,
          duration: 1100,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            if (floatingText && floatingText.destroy) {
              floatingText.destroy();
            }
          }
        });
      }
    });

    if (options.playSound !== false) {
      audioManager.playScorePopup();
    }
  }

  /**
   * Rung lắc nhẹ camera để tạo cảm giác tác động mạnh (Micro-shake)
   * @param {number} durationMs Thời gian rung (ms)
   * @param {number} intensity Cường độ rung (0.002 -> 0.008)
   */
  screenShake(durationMs = 130, intensity = 0.004) {
    if (!this.scene || !this.scene.cameras || !this.scene.cameras.main) return;
    this.scene.cameras.main.shake(durationMs, intensity);
  }

  /**
   * Bắn pháo hoa giấy rực rỡ ăn mừng thành tích
   * @param {number} x
   * @param {number} y
   * @param {number} count
   */
  celebrationConfetti(x, y, count = 36) {
    if (!this.scene || !this.scene.add) return;

    try {
      const tints = [0xf26f21, 0x38bdf8, 0x10b981, 0xfacc15, 0xa855f7, 0xec4899];
      const emitter = this.scene.add.particles(x, y, 'particle_confetti', {
        speed: { min: 80, max: 220 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0.3 },
        rotate: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 },
        lifespan: 1400,
        gravityY: 160,
        tint: tints,
        emitting: false
      });

      emitter.setDepth(2000001);
      emitter.explode(count);

      this.scene.time.delayedCall(1600, () => {
        if (emitter && emitter.destroy) emitter.destroy();
      });
    } catch (e) {
      console.warn('Lỗi tạo confetti:', e);
    }
  }

  /**
   * Kích hoạt hiệu ứng nảy trên một phần tử DOM
   * @param {string} selector
   */
  pulseDOM(selector) {
    if (typeof document === 'undefined') return;
    const el = document.querySelector(selector);
    if (!el) return;

    el.classList.remove('juice-pulse');
    // Force reflow
    void el.offsetWidth;
    el.classList.add('juice-pulse');
  }
}
