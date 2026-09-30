/**
 * DEVER TOWN - CAMPUS TIME & DAY-NIGHT HUD
 * Widget Đồng Hồ Thời Gian & Chu Kỳ Ngày Đêm FPTU
 * Phong cách Cyber-Glassmorphism, tuân thủ nghiêm ngặt Quy chuẩn Zero Emoji trên UI buttons.
 */

import { audioManager } from '../../utils/AudioManager.js';

export class CampusTimeHUD {
  /**
   * @param {Object} options
   * @param {Object} options.lightingManager
   */
  constructor({ lightingManager } = {}) {
    this.lightingManager = lightingManager;
    this.root = null;
    this.timeEl = null;
    this.periodEl = null;
    this.modeEl = null;
    this.iconContainer = null;
    this.pickerMenu = null;
    this.isOpenPicker = false;
    this.updateInterval = null;

    this.init();
  }

  init() {
    // 1. Kiểm tra hoặc tạo container trong DOM
    let root = document.getElementById('campus-time-hud');
    if (!root) {
      root = document.createElement('div');
      root.id = 'campus-time-hud';
      root.className = 'campus-time-hud';
      document.body.appendChild(root);
    }
    this.root = root;

    // 2. Cấu trúc HTML của HUD
    this.root.innerHTML = `
      <div class="campus-time-pill" id="campus-time-pill" title="Bấm để chỉnh chu kỳ ngày đêm">
        <div class="campus-time-celestial" id="campus-time-icon"></div>
        <div class="campus-time-info">
          <span class="campus-time-clock" id="campus-time-clock">--:--</span>
          <span class="campus-time-period" id="campus-time-period">Ban Ngày</span>
        </div>
      </div>
      <div class="campus-time-menu" id="campus-time-menu" style="display: none;">
        <div class="time-menu-header">CHU KỲ THỜI GIAN</div>
        <div class="time-menu-section">
          <div class="time-menu-title">Chế độ vận hành</div>
          <div class="time-menu-btn-group">
            <button class="time-mode-btn" data-mode="realtime" id="btn-mode-realtime">Giờ Thực Tế</button>
            <button class="time-mode-btn" data-mode="fast_cycle" id="btn-mode-fast">Vòng Lặp Nhanh</button>
          </div>
        </div>
        <div class="time-menu-section">
          <div class="time-menu-title">Chọn buổi nhanh</div>
          <div class="time-presets-grid">
            <button class="time-preset-btn" data-h="6" data-m="30">Bình Minh</button>
            <button class="time-preset-btn" data-h="11" data-m="0">Ban Ngày</button>
            <button class="time-preset-btn" data-h="17" data-m="45">Hoàng Hôn</button>
            <button class="time-preset-btn" data-h="20" data-m="30">Ban Đêm</button>
            <button class="time-preset-btn" data-h="1" data-m="0">Đêm Khuya</button>
          </div>
        </div>
      </div>
    `;

    this.timeEl = document.getElementById('campus-time-clock');
    this.periodEl = document.getElementById('campus-time-period');
    this.iconContainer = document.getElementById('campus-time-icon');
    this.pickerMenu = document.getElementById('campus-time-menu');
    this.pillEl = document.getElementById('campus-time-pill');

    this.bindEvents();
    this.render();

    // 3. Chu kỳ cập nhật mỗi 500ms
    this.updateInterval = setInterval(() => {
      this.render();
    }, 500);
  }

  bindEvents() {
    if (!this.pillEl) return;

    this.pillEl.addEventListener('click', (e) => {
      e.stopPropagation();
      try { audioManager.playClick(); } catch (err) {}
      this.togglePicker();
    });

    // Bắt sự kiện chọn Mode
    const modeBtns = this.root.querySelectorAll('.time-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { audioManager.playClick(); } catch (err) {}
        const mode = btn.dataset.mode;
        if (this.lightingManager) {
          this.lightingManager.setTimeMode(mode);
        }
        this.updateActiveButtons();
        this.render();
      });
    });

    // Bắt sự kiện chọn Buổi
    const presetBtns = this.root.querySelectorAll('.time-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { audioManager.playClick(); } catch (err) {}
        const h = parseInt(btn.dataset.h, 10);
        const m = parseInt(btn.dataset.m, 10);
        if (this.lightingManager) {
          this.lightingManager.setTime(h, m);
        }
        this.updateActiveButtons();
        this.render();
      });
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (this.isOpenPicker && !this.root.contains(e.target)) {
        this.closePicker();
      }
    });
  }

  togglePicker() {
    this.isOpenPicker = !this.isOpenPicker;
    if (this.pickerMenu) {
      this.pickerMenu.style.display = this.isOpenPicker ? 'block' : 'none';
      if (this.isOpenPicker) {
        this.updateActiveButtons();
      }
    }
  }

  closePicker() {
    this.isOpenPicker = false;
    if (this.pickerMenu) {
      this.pickerMenu.style.display = 'none';
    }
  }

  updateActiveButtons() {
    if (!this.lightingManager) return;
    const mode = this.lightingManager.timeMode;
    const modeBtns = this.root.querySelectorAll('.time-mode-btn');
    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  getSVGIcon(periodId) {
    switch (periodId) {
      case 'dawn':
        // Icon Bình Minh (Mặt trời mọc với tia sáng hồng/vàng)
        return `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f472b6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M4.93 10.93l2.83-2.83M2 18h2M20 18h2M19.07 10.93l-2.83-2.83"/>
            <path d="M16 18a4 4 0 0 0-8 0"/>
            <path d="M4 22h16"/>
          </svg>
        `;
      case 'day':
        // Icon Ban Ngày (Mặt trời rực rỡ)
        return `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        `;
      case 'sunset':
        // Icon Hoàng Hôn (Mặt trời lặn ngả cam)
        return `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10v4M4.93 10.93l2.83 2.83M2 18h20M19.07 10.93l-2.83 2.83"/>
            <path d="M16 18a4 4 0 0 0-8 0"/>
            <path d="M4 22h16"/>
          </svg>
        `;
      case 'night':
      case 'midnight':
      default:
        // Icon Ban Đêm (Mặt trăng khuyết và sao đêm xanh cyan)
        return `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            <path d="M19 3v4M21 5h-4" stroke-width="1.5"/>
          </svg>
        `;
    }
  }

  render() {
    if (!this.lightingManager) return;

    const state = this.lightingManager.getTimeState();
    if (this.timeEl) {
      this.timeEl.textContent = state.timeString;
    }
    if (this.periodEl) {
      this.periodEl.textContent = state.period?.label || 'Ban Ngày';
    }
    if (this.iconContainer) {
      this.iconContainer.innerHTML = this.getSVGIcon(state.period?.id);
    }
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
      this.root = null;
    }
  }
}
