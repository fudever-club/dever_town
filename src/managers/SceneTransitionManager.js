/**
 * SceneTransitionManager — hiệu ứng chuyển cảnh kiểu Pokémon GBA.
 *
 * Dùng một CanvasTexture low-res phủ toàn màn hình, vẽ bằng ma trận Bayer
 * ordered-dithering: khi qua portal/tầng, các pixel đen "ăn" dần vào khung hình
 * theo từng ô vuông (không mờ nhòe canvas). Tới ngưỡng 1 (đen toàn màn) thì
 * swap nội dung phòng, sau đó dissolve ngược lại để lộ phòng mới.
 *
 * Manager giữ trạng thái nội bộ (isTransitioning) để tránh gọi chồng.
 */
import { TRANSITION_CONFIG } from '../config/transitionConfig.js';

// Ma trận Bayer 4x4 — cho dissolve mượt mà kiểu retro
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export class SceneTransitionManager {
  constructor(scene) {
    this.scene = scene;
    this.isTransitioning = false;
    this.overlay = null;
    this.canvasTexture = null;
    this.threshold = 0;
    this._timerEvent = null;

    this.width = TRANSITION_CONFIG.dissolveWidth;
    this.height = TRANSITION_CONFIG.dissolveHeight;
    const { r, g, b } = TRANSITION_CONFIG.dissolveColor;
    this.fillStyle = `rgb(${r},${g},${b})`;
  }

  /**
   * Tạo overlay canvas nếu chưa có. Trả về true nếu đã sẵn sàng.
   */
  ensureOverlay() {
    if (!this.scene || !this.scene.add) return false;
    if (this.overlay && this.overlay.active) return true;

    const key = 'transition-dissolve';
    if (!this.scene.textures.exists(key)) {
      const tex = this.scene.textures.createCanvas(key, this.width, this.height);
      if (!tex) return false;
      this.canvasTexture = tex;
    } else {
      this.canvasTexture = this.scene.textures.get(key);
    }

    this.overlay = this.scene.add.image(0, 0, key);
    this.overlay.setOrigin(0, 0);
    this.overlay.setDisplaySize(
      this.scene.cameras.main.width,
      this.scene.cameras.main.height
    );
    // Game đã bật pixelArt: true toàn cục nên texture scale lên giữ hạt pixel rõ,
    // không mờ (không cần setFilter thủ công).
    this.overlay.setScrollFactor(0);
    this.overlay.setDepth(9999);
    this.overlay.setVisible(false);
    this.setThreshold(0);
    // Cập nhật kích thước overlay khi cửa sổ resize
    if (this.scene.scale && !this._resizeHooked) {
      this._resizeHooked = true;
      this.scene.scale.on('resize', () => this.refreshSize());
    }
    return true;
  }

  /**
   * Đồng bộ kích thước overlay với camera hiện tại (gọi khi resize).
   */
  refreshSize() {
    if (!this.overlay || !this.overlay.active || !this.scene?.cameras?.main) return;
    const cam = this.scene.cameras.main;
    this.overlay.setDisplaySize(cam.width, cam.height);
    this.overlay.setScale(cam.width / this.width, cam.height / this.height);
  }

  /**
   * Vẽ lại overlay theo ngưỡng 0..1 (1 = đen toàn màn).
   */
  setThreshold(t) {
    this.threshold = Math.max(0, Math.min(1, t));
    if (!this.canvasTexture) return;
    const ctx = this.canvasTexture.getContext();
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);
    if (this.threshold <= 0) {
      this.canvasTexture.refresh();
      return;
    }
    ctx.fillStyle = this.fillStyle;
    const level = this.threshold * 16;
    // Vẽ theo khối 4x4 để khớp ma trận Bayer, nhanh hơn từng pixel
    for (let by = 0; by < h; by += 4) {
      for (let bx = 0; bx < w; bx += 4) {
        for (let oy = 0; oy < 4 && by + oy < h; oy++) {
          for (let ox = 0; ox < 4 && bx + ox < w; ox++) {
            if (BAYER_4X4[oy][ox] < level) {
              ctx.fillRect(bx + ox, by + oy, 1, 1);
            }
          }
        }
      }
    }
    this.canvasTexture.refresh();
  }

  /**
   * Chạy transition đầy đủ: flash trắng -> dissolve ra -> swapCallback()
   * -> dissolve vào. Trả về Promise resolve khi xong.
   */
  async transition(swapCallback) {
    if (this.isTransitioning) return;
    if (!this.ensureOverlay()) {
      // Fallback: không có overlay thì swap ngay
      if (swapCallback) await swapCallback();
      return;
    }
    this.isTransitioning = true;
    try {
      const cam = this.scene.cameras.main;
      this.overlay.setVisible(true);
      // 1. Flash trắng nhanh kiểu Pokémon GBA
      cam.flash(TRANSITION_CONFIG.flashMs, 255, 255, 255, false);
      await this.wait(TRANSITION_CONFIG.flashMs);
      // 2. Dissolve ra (đen dần)
      await this.animateThreshold(0, 1, TRANSITION_CONFIG.dissolveOutMs);
      // 3. Swap nội dung
      if (swapCallback) await swapCallback();
      // 4. Dissolve vào (lộ dần)
      await this.animateThreshold(1, 0, TRANSITION_CONFIG.dissolveInMs);
      this.overlay.setVisible(false);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Animate ngưỡng threshold từ a đến b trong ms.
   */
  animateThreshold(a, b, ms) {
    return new Promise((resolve) => {
      if (this._timerEvent) this._timerEvent.remove();
      const start = performance.now();
      const step = () => {
        const elapsed = performance.now() - start;
        const p = Math.min(1, elapsed / ms);
        // easeInOut nhẹ cho dissolve mượt
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        this.setThreshold(a + (b - a) * eased);
        if (p < 1) {
          this._timerEvent = this.scene.time.delayedCall(16, step);
        } else {
          this._timerEvent = null;
          resolve();
        }
      };
      step();
    });
  }

  wait(ms) {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, resolve);
    });
  }

  destroy() {
    if (this._timerEvent) {
      this._timerEvent.remove();
      this._timerEvent = null;
    }
    if (this.overlay) {
      this.overlay.destroy();
      this.overlay = null;
    }
    this.canvasTexture = null;
    this.isTransitioning = false;
  }
}
