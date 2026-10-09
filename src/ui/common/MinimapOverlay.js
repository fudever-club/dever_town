/**
 * MinimapOverlay: Radar HUD thu nhỏ ở góc màn hình
 * Hiển thị toàn cảnh phòng 25x19 tiles, vị trí người chơi, bạn bè và cổng dịch chuyển.
 *
 * Perf: lớp tĩnh (nền + lưới tile + cổng) được vẽ MỘT LẦN vào offscreen canvas
 * mỗi khi đổi phòng (xem invalidate()). render() mỗi frame chỉ blit drawImage
 * + vẽ các chấm động (người chơi, bạn bè, pulse). Tránh 475 fillRect + arc
 * và tránh cấp phát Set mỗi frame.
 */
import { MAPS_CONFIG } from '../../config/maps.js';

// Hoist lên module scope: không cấp phát lại mỗi frame (perf fix)
const SOLID_TILES = new Set([
  2, 3, 4, 8, 12, 14, 15, 16, 17, 19, 20, 21, 22,
  25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37,
  42 // hồ vườn FUDA (chặn đi bộ)
]);

// localStorage key cho vị trí kéo-thả của minimap (persist qua các lần load)
const MINIMAP_POS_KEY = 'dever_minimap_pos_v1';

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

    // Offscreen cache cho lớp tĩnh (nền + tile + cổng). Vẽ lại khi đổi phòng.
    this.staticCanvas = null;

    this.initDOM();
    this.bindEvents();
    this._initDrag();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'minimap-overlay';
    this.container.className = 'minimap-container';

    this.container.innerHTML = `
      <div class="minimap-header">
        <span class="minimap-grip" title="Kéo để di chuyển">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
            <circle cx="2.5" cy="2.5" r="1.3"/><circle cx="7.5" cy="2.5" r="1.3"/>
            <circle cx="2.5" cy="7" r="1.3"/><circle cx="7.5" cy="7" r="1.3"/>
            <circle cx="2.5" cy="11.5" r="1.3"/><circle cx="7.5" cy="11.5" r="1.3"/>
          </svg>
        </span>
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

    // Tự động thu gọn trên Mobile/Tablet để mở rộng không gian nhìn game
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.collapse();
    }
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

  // ---------------------------------------------------------------
  // Kéo-thả minimap (draggable HUD)
  // - Kéo bằng header (chuột + cảm ứng qua Pointer Events)
  // - Vị trí lưu localStorage, khôi phục khi load lại
  // - Giới hạn trong viewport; resize thì kẹp lại
  // - Double-click header để reset về vị trí mặc định
  // ---------------------------------------------------------------
  _initDrag() {
    this._dragState = null;
    this._onDragMove = this._onDragMove.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onResizeClamp = () => this._clampToViewport();

    this._applySavedPosition();

    const header = this.container.querySelector('.minimap-header');
    if (header) {
      header.addEventListener('pointerdown', (e) => this._onDragStart(e));
      header.addEventListener('dblclick', (e) => this._onHeaderDblClick(e));
    }
    window.addEventListener('resize', this._onResizeClamp);
  }

  _applySavedPosition() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(MINIMAP_POS_KEY));
    } catch (err) { /* bỏ qua */ }
    if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
      this._setPosition(saved.left, saved.top, true);
    } else {
      // Chuyển vị trí CSS mặc định (bottom/left hoặc media-query top/left)
      // thành left/top inline để drag tính toán nhất quán
      this._captureCssPosition();
    }
  }

  _captureCssPosition() {
    const rect = this.container.getBoundingClientRect();
    this.container.style.left = rect.left + 'px';
    this.container.style.top = rect.top + 'px';
    this.container.style.right = 'auto';
    this.container.style.bottom = 'auto';
  }

  _setPosition(left, top, skipSave) {
    const rect = this.container.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    const cl = Math.min(Math.max(0, left), maxLeft);
    const ct = Math.min(Math.max(0, top), maxTop);
    this.container.style.left = cl + 'px';
    this.container.style.top = ct + 'px';
    this.container.style.right = 'auto';
    this.container.style.bottom = 'auto';
    if (!skipSave) {
      try {
        localStorage.setItem(MINIMAP_POS_KEY, JSON.stringify({ left: cl, top: ct }));
      } catch (err) { /* bỏ qua */ }
    }
  }

  _clampToViewport() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this._setPosition(rect.left, rect.top, false);
  }

  _onDragStart(e) {
    // Không kéo khi bấm vào nút thu gọn; chỉ nút trái chuột / cảm ứng
    if (e.target && e.target.closest && e.target.closest('.minimap-toggle-btn')) return;
    if (e.button !== undefined && e.button !== 0) return;

    e.preventDefault();
    const rect = this.container.getBoundingClientRect();
    this._dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
      pointerId: e.pointerId,
    };

    const header = this.container.querySelector('.minimap-header');
    try {
      header.setPointerCapture(e.pointerId);
    } catch (err) { /* bỏ qua */ }
    this.container.classList.add('dragging');
    header.addEventListener('pointermove', this._onDragMove);
    header.addEventListener('pointerup', this._onDragEnd, { once: true });
    header.addEventListener('pointercancel', this._onDragEnd, { once: true });
  }

  _onDragMove(e) {
    const s = this._dragState;
    if (!s || e.pointerId !== s.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) s.moved = true;
    // skipSave=true trong lúc kéo để tránh ghi localStorage mỗi frame
    this._setPosition(s.startLeft + dx, s.startTop + dy, true);
  }

  _onDragEnd(e) {
    const header = this.container.querySelector('.minimap-header');
    if (header) header.removeEventListener('pointermove', this._onDragMove);
    const s = this._dragState;
    this._dragState = null;
    if (this.container) this.container.classList.remove('dragging');
    if (s && s.moved && this.container) {
      // Lưu vị trí cuối sau khi thả
      const rect = this.container.getBoundingClientRect();
      try {
        localStorage.setItem(MINIMAP_POS_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
      } catch (err) { /* bỏ qua */ }
    }
  }

  _onHeaderDblClick(e) {
    if (e.target && e.target.closest && e.target.closest('.minimap-toggle-btn')) return;
    try {
      localStorage.removeItem(MINIMAP_POS_KEY);
    } catch (err) { /* bỏ qua */ }
    // Tắt transition tạm thời để đọc vị trí CSS mặc định chính xác
    // (nếu không, getBoundingClientRect sẽ đọc giữa chừng animation)
    this.container.classList.add('dragging');
    this.container.style.left = '';
    this.container.style.top = '';
    this.container.style.right = '';
    this.container.style.bottom = '';
    void this.container.offsetHeight; // force reflow để CSS áp dụng ngay
    this._captureCssPosition();
    this.container.classList.remove('dragging');
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.container) {
      this.container.classList.toggle('collapsed', this.isCollapsed);
    }
    if (!this.isCollapsed) {
      this.render();
    }
  }

  collapse() {
    this.isCollapsed = true;
    if (this.container) {
      this.container.classList.add('collapsed');
    }
  }

  expand() {
    this.isCollapsed = false;
    if (this.container) {
      this.container.classList.remove('collapsed');
    }
    this.render();
  }

  setRoom(roomId) {
    this.currentRoomId = roomId;
    this.refresh();
  }

  /**
   * Vẽ lại lớp tĩnh (nền + lưới tile + cổng) vào offscreen canvas.
   * Gọi khi đổi phòng, hoặc khi layout/size thay đổi (resize hook cho
   * sibling worker responsive canvas: gọi minimap.invalidate() sau khi
   * đổi kích thước minimap).
   */
  invalidate() {
    this._renderStaticLayer();
  }

  /**
   * Vẽ lại lớp tĩnh rồi vẽ đầy đủ một frame mới.
   */
  refresh() {
    this.invalidate();
    this.render();
  }

  /**
   * Vẽ lớp tĩnh (background, tile grid, portals) vào offscreen canvas.
   * Kết quả pixel-identical với cách vẽ trực tiếp trước đây vì per-frame
   * render() chỉ blit drawImage rồi vẽ các chấm động lên trên.
   */
  _renderStaticLayer() {
    const mapData = MAPS_CONFIG[this.currentRoomId];
    if (!mapData || !mapData.layout) return;

    if (!this.staticCanvas) {
      this.staticCanvas = document.createElement('canvas');
      this.staticCanvas.width = this.width;
      this.staticCanvas.height = this.height;
    }
    const ctx = this.staticCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Vẽ nền tối
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Vẽ Layout Map
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = mapData.layout[r]?.[c] ?? 0;
        const x = c * this.tileW;
        const y = r * this.tileH;

        if (SOLID_TILES.has(tile)) {
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
  }

  /**
   * Vẽ một frame: blit lớp tĩnh đã cache + chỉ vẽ các yếu tố động
   * (chấm người chơi khác, chấm người chơi chính, radar pulse).
   * Gọi mỗi frame từ WorldScene.update() — rẻ, không cấp phát.
   */
  render() {
    if (!this.ctx || this.isCollapsed) return;

    const mapData = MAPS_CONFIG[this.currentRoomId];
    if (!mapData || !mapData.layout) return;

    // Lazy build cache (ví dụ frame đầu tiên hoặc khi expand)
    if (!this.staticCanvas) {
      this._renderStaticLayer();
      if (!this.staticCanvas) return;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(this.staticCanvas, 0, 0);

    // 4. Vẽ Người chơi khác (RemotePlayers)
    if (this.scene && this.scene.remotePlayers) {
      for (const remote of this.scene.remotePlayers.values()) {
        const rx = (remote.x / 800) * this.width;
        const ry = (remote.y / 608) * this.height;

        // Vẽ chấm màu xanh ngọc bích nổi bật (khác biệt hoàn toàn với Cổng màu tím)
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 0.8;
        ctx.stroke();
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
    if (this._onResizeClamp) {
      window.removeEventListener('resize', this._onResizeClamp);
      this._onResizeClamp = null;
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.staticCanvas = null;
  }
}
