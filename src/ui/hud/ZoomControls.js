/**
 * ZoomControls — Cụm nút +/− và pill hiển thị % zoom, góc phải-dưới #game-container.
 * Text thuần túy, không emoji (chuẩn AGENTS.md).
 */
import { CAMERA_ZOOM } from '../../config/cameraConfig.js';

export class ZoomControls {
  /**
   * @param {object} opts
   * @param {Phaser.Scene} opts.scene - WorldScene (cung cấp zoomByStep/getCurrentZoom)
   */
  constructor({ scene }) {
    this.scene = scene;

    this.root = document.createElement('div');
    this.root.className = 'dever-zoom-controls';
    this.root.setAttribute('aria-label', 'Điều khiển zoom camera');

    this.zoomOutBtn = document.createElement('button');
    this.zoomOutBtn.className = 'dzc-btn';
    this.zoomOutBtn.type = 'button';
    this.zoomOutBtn.textContent = '−';
    this.zoomOutBtn.setAttribute('aria-label', 'Thu nhỏ');

    this.pill = document.createElement('div');
    this.pill.className = 'dzc-pill';
    this.pill.textContent = '100%';

    this.zoomInBtn = document.createElement('button');
    this.zoomInBtn.className = 'dzc-btn';
    this.zoomInBtn.type = 'button';
    this.zoomInBtn.textContent = '+';
    this.zoomInBtn.setAttribute('aria-label', 'Phóng to');

    this.root.appendChild(this.zoomOutBtn);
    this.root.appendChild(this.pill);
    this.root.appendChild(this.zoomInBtn);

    const container = document.getElementById('game-container') || document.body;
    container.appendChild(this.root);

    this._onZoomIn = (e) => {
      e.stopPropagation();
      this.scene.zoomByStep(CAMERA_ZOOM.BUTTON_STEP);
    };
    this._onZoomOut = (e) => {
      e.stopPropagation();
      this.scene.zoomByStep(1 / CAMERA_ZOOM.BUTTON_STEP);
    };
    this.zoomInBtn.addEventListener('click', this._onZoomIn);
    this.zoomOutBtn.addEventListener('click', this._onZoomOut);

    this.refresh(typeof this.scene.getCurrentZoom === 'function' ? this.scene.getCurrentZoom() : 1);
  }

  /** Cập nhật pill % theo zoom hiện tại. */
  refresh(zoom) {
    if (this.pill) {
      this.pill.textContent = `${Math.round((zoom || 1) * 100)}%`;
    }
  }

  destroy() {
    if (this.zoomInBtn) this.zoomInBtn.removeEventListener('click', this._onZoomIn);
    if (this.zoomOutBtn) this.zoomOutBtn.removeEventListener('click', this._onZoomOut);
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
    this.root = null;
    this.scene = null;
  }
}
