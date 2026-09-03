/**
 * MinimapOverlay: Radar HUD thu nhỏ ở góc màn hình
 * Hiển thị toàn cảnh phòng 25x19 tiles, vị trí người chơi, bạn bè và cổng dịch chuyển.
 */
import { MAPS_CONFIG } from '../../config/maps.js';

export class MinimapOverlay {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene
   */
  constructor({ scene } = {}) {
    this.scene = scene;
    this.isCollapsed = false;
    this.currentRoomId = 'main_hall';

    this.width = 150;
    this.height = 114;
    this.cols = 25;
    this.rows = 19;
    this.tileW = this.width / this.cols; // 6px
    this.tileH = this.height / this.rows; // 6px

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'minimap-overlay';
    this.container.className = 'minimap-container';

    this.container.innerHTML = `
      <div class="minimap-header">
        <span class="minimap-title">RADAR HUD</span>
        <button type="button" class="minimap-toggle-btn" id="minimap-toggle-btn" title="Thu nhỏ / Mở rộng [M]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      <div class="minimap-body" id="minimap-body">
        <canvas id="minimap-canvas" width="${this.width}" height="${this.height}"></canvas>
        <div class="minimap-legend">
          <span class="legend-item"><span class="dot player-dot"></span>Bạn</span>
          <span class="legend-item"><span class="dot other-dot"></span>Bạn bè</span>
          <span class="legend-item"><span class="dot portal-dot"></span>Cổng</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.canvas = this.container.querySelector('#minimap-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.bodyEl = this.container.querySelector('#minimap-body');
    this.toggleBtn = this.container.querySelector('#minimap-toggle-btn');
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCollapse();
      });
    }

    // Phím tắt M
    window.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleCollapse();
      }
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.container) {
      this.container.classList.toggle('collapsed', this.isCollapsed);
    }
  }

  setRoom(roomId) {
    this.currentRoomId = roomId;
    this.render();
  }

  render() {
    if (!this.ctx || this.isCollapsed) return;

    const mapData = MAPS_CONFIG[this.currentRoomId];
    if (!mapData || !mapData.layout) return;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Vẽ nền tối
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Vẽ Layout Map
    const solidTiles = new Set([2, 3, 4, 8, 12, 14, 15, 16, 17, 19, 20, 21, 22, 25, 26, 27, 29, 30, 31]);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = mapData.layout[r]?.[c] ?? 0;
        const x = c * this.tileW;
        const y = r * this.tileH;

        if (solidTiles.has(tile)) {
          ctx.fillStyle = '#334155'; // Tường / Vật cản
          ctx.fillRect(x, y, this.tileW, this.tileH);
        } else if (tile === 10) {
          ctx.fillStyle = 'rgba(192, 132, 252, 0.4)'; // Portal ô
          ctx.fillRect(x, y, this.tileW, this.tileH);
        } else {
          ctx.fillStyle = '#0f172a'; // Sàn
          ctx.fillRect(x, y, this.tileW, this.tileH);
        }
      }
    }

    // 3. Vẽ các cổng dịch chuyển (Portals)
    if (mapData.portals) {
      mapData.portals.forEach(p => {
        const px = p.tileX * this.tileW + this.tileW / 2;
        const py = p.tileY * this.tileH + this.tileH / 2;

        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // 4. Vẽ Người chơi khác (RemotePlayers)
    if (this.scene && this.scene.remotePlayers) {
      for (const remote of this.scene.remotePlayers.values()) {
        const rx = (remote.x / 800) * this.width;
        const ry = (remote.y / 608) * this.height;

        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 5. Vẽ Người chơi chính (Local Player) với hiệu ứng Radar Pulse
    if (this.scene && this.scene.player) {
      const px = (this.scene.player.x / 800) * this.width;
      const py = (this.scene.player.y / 608) * this.height;

      // Glow Pulse Ring
      const now = performance.now() / 300;
      const pulseRadius = 3.5 + Math.sin(now) * 1.5;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Main Dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
