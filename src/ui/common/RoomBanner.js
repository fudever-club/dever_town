/**
 * RoomBanner: Thông báo chào mừng điện ảnh khi chuyển phòng (Cinematic Room Arrival)
 * Trôi nhẹ từ trên xuống hiển thị tên phòng, mô tả ngắn và số người chơi đang online.
 */
import { MAPS_CONFIG } from '../../config/maps.js';
import { i18n } from '../../config/i18n.js';

export class RoomBanner {
  constructor() {
    this.timer = null;
    this.initDOM();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'room-banner';
    this.container.className = 'room-banner-container hidden';

    this.container.innerHTML = `
      <div class="room-banner-card">
        <div class="room-banner-accent"></div>
        <div class="room-banner-content">
          <div class="room-banner-header">
            <span class="room-banner-icon" id="room-banner-icon">🏛️</span>
            <h2 class="room-banner-title" id="room-banner-title">Tòa Alpha - Sảnh Chính</h2>
            <span class="room-banner-badge" id="room-banner-count">1 người</span>
          </div>
          <p class="room-banner-desc" id="room-banner-desc">Hội trường trung tâm FPTU Đà Nẵng, kết nối toàn bộ các khu vực.</p>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.iconEl = this.container.querySelector('#room-banner-icon');
    this.titleEl = this.container.querySelector('#room-banner-title');
    this.badgeEl = this.container.querySelector('#room-banner-count');
    this.descEl = this.container.querySelector('#room-banner-desc');
  }

  getRoomIcon(roomId) {
    const icons = {
      main_hall: '🏛️',
      dever_lab: '💻',
      game_arcade: '🕹️',
      library_lounge: '📚',
      memory_room: '🏆',
      web_room: '🌐',
      media_hub: '📰',
      sports_complex: '⚽',
      canteen_cafe: '☕'
    };
    return icons[roomId] || '📍';
  }

  show(roomId, playerCount = 1) {
    const mapData = MAPS_CONFIG[roomId] || MAPS_CONFIG.main_hall;
    if (!mapData) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const roomName = i18n ? (i18n.get(`rooms.${roomId}`) || mapData.name) : mapData.name;
    const roomDesc = mapData.description || 'Không gian sinh hoạt kỹ thuật số FU-DEVER';

    if (this.iconEl) this.iconEl.textContent = this.getRoomIcon(roomId);
    if (this.titleEl) this.titleEl.textContent = roomName;
    if (this.descEl) this.descEl.textContent = roomDesc;
    if (this.badgeEl) {
      this.badgeEl.textContent = `${playerCount} ${playerCount > 1 ? 'thành viên' : 'người chơi'}`;
    }

    // Show with animation
    this.container.classList.remove('hidden');
    // Force reflow
    void this.container.offsetWidth;
    this.container.classList.add('visible');

    this.timer = setTimeout(() => {
      this.hide();
    }, 3500);
  }

  hide() {
    if (!this.container) return;
    this.container.classList.remove('visible');
    setTimeout(() => {
      if (!this.container.classList.contains('visible')) {
        this.container.classList.add('hidden');
      }
    }, 450);
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer);
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
