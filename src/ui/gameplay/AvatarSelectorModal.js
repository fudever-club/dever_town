/**
 * AvatarSelectorModal: Modal quản lý đổi Avatar cá nhân, tải ảnh avatar từ máy tính
 * và mở khóa các Avatar độc quyền khi vượt qua nhiệm vụ / minigames trong game.
 */
import { friendManager } from '../../managers/FriendManager.js';
import { authService } from '../../services/AuthService.js';
import { audioManager } from '../../utils/AudioManager.js';

export const UNLOCKABLE_AVATARS = [
  {
    id: 'avatar_dev_hoodie',
    name: 'Dev Hoodie Cam FPTU',
    category: 'Mặc Định',
    icon: '🧑‍💻',
    desc: 'Trang phục biểu tượng của lập trình viên CLB FU-DEVER.',
    checkUnlock: () => true,
    reqText: 'Mở khóa sẵn cho mọi thành viên'
  },
  {
    id: 'avatar_buggy_streak_3',
    name: 'Buggy Bestie Lửa Thiêng',
    category: 'Bạn Thân',
    icon: '🔥',
    desc: 'Ngọn lửa tình bạn rực cháy, cùng bạn thân vượt mọi thử thách.',
    checkUnlock: () => {
      const friends = friendManager.getFriends();
      return friends.some(f => (f.streak || 0) >= 3);
    },
    reqText: 'Đạt chuỗi Bestie Streak từ 3 ngày liên tục với một người bạn'
  },
  {
    id: 'avatar_snake_master',
    name: 'Bậc Thầy Rắn Săn Mồi',
    category: 'Arcade',
    icon: '🐍',
    desc: 'Phản xạ nhạy bén, quét sạch mọi con mồi tại máy game cổ điển.',
    checkUnlock: () => {
      const score = parseInt(localStorage.getItem('dever_snake_high') || '0', 10);
      return score >= 100;
    },
    reqText: 'Đạt từ 100 điểm tại minigame Rắn Săn Mồi Retro Arcade'
  },
  {
    id: 'avatar_hoop_shooter',
    name: 'Xạ Thủ Bóng Rổ Canteen',
    category: 'Thể Thao',
    icon: '🏀',
    desc: 'Tay ném 3 điểm huyền thoại của khu thể thao Canteen.',
    checkUnlock: () => {
      const score = parseInt(localStorage.getItem('dever_bball_high') || '0', 10);
      return score >= 15;
    },
    reqText: 'Đạt từ 15 điểm ném bóng rổ tại Khu Thể Thao Canteen'
  },
  {
    id: 'avatar_penalty_striker',
    name: 'Vua Phá Lưới Penalty',
    category: 'Thể Thao',
    icon: '⚽',
    desc: 'Cú sút sấm sét đánh bại thủ môn tại sân cỏ Metaverse.',
    checkUnlock: () => {
      const score = parseInt(localStorage.getItem('dever_penalty_high') || '0', 10);
      return score >= 5;
    },
    reqText: 'Sút thành công 5 bàn thắng tại Sân Bóng Đá Mini'
  },
  {
    id: 'avatar_hackathon_champ',
    name: 'Quán Quân Hackathon Mini',
    category: 'Vinh Danh',
    icon: '🏆',
    desc: 'Cúp vàng danh giá của nhà vô địch lập trình FU-DEVER.',
    checkUnlock: () => {
      try {
        const inv = JSON.parse(localStorage.getItem('dever_inventory') || '{}');
        return (inv['hackathon_trophy'] || 0) > 0;
      } catch { return false; }
    },
    reqText: 'Nhặt được Cúp Vô Địch Hackathon trong phòng Memory Room'
  },
  {
    id: 'avatar_speed_duel',
    name: 'Bậc Thầy Thuật Toán Duel',
    category: 'Đấu Trí',
    icon: '⚡',
    desc: 'Tư duy logic đỉnh cao, giải mã thuật toán trong chớp mắt.',
    checkUnlock: () => {
      const wins = parseInt(localStorage.getItem('dever_duel_wins') || '0', 10);
      return wins >= 1;
    },
    reqText: 'Chiến thắng ít nhất 1 trận tại Đấu Trí Lập Trình Siêu Tốc'
  },
  {
    id: 'avatar_royal_buggy',
    name: 'Buggy Hoàng Gia Cầm Cúp',
    category: 'Tối Thượng',
    icon: '👑',
    desc: 'Đôi bạn tri kỷ Metaverse! Buggy tỏa sáng với vương miện rực rỡ.',
    checkUnlock: () => {
      const friends = friendManager.getFriends();
      return friends.some(f => (f.streak || 0) >= 14);
    },
    reqText: 'Duy trì chuỗi Bestie Streak liên tiếp từ 14 ngày trở lên'
  }
];

export class AvatarSelectorModal {
  /**
   * @param {Object} options
   * @param {Function} options.onAvatarChanged - Callback khi đổi avatar
   */
  constructor({ onAvatarChanged } = {}) {
    this.onAvatarChanged = onAvatarChanged;
    this.isOpen = false;
    this.currentAvatar = localStorage.getItem('dever_current_avatar') || 'avatar_dev_hoodie';
    this.customAvatarUrl = localStorage.getItem('dever_custom_avatar_url') || null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'avatar-selector-modal';
    this.modalEl.className = 'modal-backdrop hidden';

    this.modalEl.innerHTML = `
      <div class="modal-card modal-card-lg avatar-modal-card">
        <div class="modal-header">
          <div class="modal-title-row">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
            </svg>
            <div>
              <h2 class="modal-title">Đổi Avatar Cá Nhân & Mở Khóa</h2>
              <p class="modal-sub">Tải avatar yêu thích của bạn hoặc làm nhiệm vụ trong game để mở khóa avatar độc quyền.</p>
            </div>
          </div>
          <button type="button" id="avatar-modal-close-btn" class="modal-close-btn">&times;</button>
        </div>

        <!-- Section 1: Current Avatar & Custom Upload -->
        <div class="avatar-current-section">
          <div class="avatar-current-preview">
            <div class="avatar-big-circle" id="current-avatar-circle">
              <!-- Rendered dynamically -->
            </div>
            <div class="avatar-current-info">
              <span class="avatar-current-label">Avatar Đang Dùng</span>
              <strong id="current-avatar-name" class="avatar-current-name">Dev Hoodie Cam FPTU</strong>
              <span class="avatar-current-sub">Hiển thị trong chat và trên thanh trạng thái</span>
            </div>
          </div>

          <div class="avatar-upload-box">
            <input type="file" id="avatar-file-input" accept="image/png, image/jpeg, image/webp" class="hidden" />
            <button type="button" id="btn-trigger-upload" class="modal-btn btn-upload-avatar">
              Tải Ảnh Từ Máy Tính
            </button>
            <span class="upload-hint">Hỗ trợ JPG, PNG, WebP (Tối đa 2MB)</span>
          </div>
        </div>

        <!-- Section 2: Unlockable Avatars Catalog -->
        <div class="avatar-catalog-section">
          <div class="avatar-catalog-header">
            <h3 class="catalog-title">Kho Avatar Độc Quyền DEVER TOWN</h3>
            <span class="catalog-sub">Hoàn thành thử thách để mở khóa</span>
          </div>
          <div id="avatar-cards-grid" class="avatar-cards-grid">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
  }

  bindEvents() {
    const closeBtn = this.modalEl.querySelector('#avatar-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });

    // Nút kích hoạt chọn file upload
    const uploadBtn = this.modalEl.querySelector('#btn-trigger-upload');
    const fileInput = this.modalEl.querySelector('#avatar-file-input');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
          alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64Url = loadEvent.target.result;
          this.setCustomAvatar(base64Url);
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      });
    }
  }

  setCustomAvatar(dataUrl) {
    this.customAvatarUrl = dataUrl;
    this.currentAvatar = 'custom_uploaded';
    localStorage.setItem('dever_current_avatar', this.currentAvatar);
    localStorage.setItem('dever_custom_avatar_url', dataUrl);

    audioManager.playFanfare?.();
    this.notifyChange();
    this.render();

    const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    if (worldScene && worldScene.showToast) {
      worldScene.showToast('Đã tải lên và áp dụng avatar cá nhân thành công!');
    }
  }

  setGameAvatar(avatarItem) {
    this.customAvatarUrl = null;
    this.currentAvatar = avatarItem.id;
    localStorage.setItem('dever_current_avatar', this.currentAvatar);
    localStorage.removeItem('dever_custom_avatar_url');

    audioManager.playClick();
    this.notifyChange();
    this.render();

    const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    if (worldScene && worldScene.showToast) {
      worldScene.showToast(`Đã áp dụng avatar: ${avatarItem.name}`);
    }
  }

  notifyChange() {
    if (this.onAvatarChanged) {
      this.onAvatarChanged({
        avatarId: this.currentAvatar,
        customUrl: this.customAvatarUrl
      });
    }

    // Cập nhật header avatar icon nếu có
    const headerAvatarWrap = document.getElementById('header-user-avatar-wrap');
    if (headerAvatarWrap) {
      if (this.customAvatarUrl) {
        headerAvatarWrap.innerHTML = `<img src="${this.customAvatarUrl}" class="header-avatar-img" alt="Avatar" />`;
      } else {
        const item = UNLOCKABLE_AVATARS.find(a => a.id === this.currentAvatar);
        headerAvatarWrap.innerHTML = `<span>${item?.icon || '🧑‍💻'}</span>`;
      }
    }
  }

  show() {
    this.isOpen = true;
    this.modalEl.classList.remove('hidden');
    audioManager.playClick();
    this.render();
  }

  hide() {
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
    if (window.__DEVER_GAME__?.canvas) {
      window.__DEVER_GAME__.canvas.focus();
    }
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }

  render() {
    const circleEl = this.modalEl.querySelector('#current-avatar-circle');
    const nameEl = this.modalEl.querySelector('#current-avatar-name');

    if (circleEl && nameEl) {
      if (this.customAvatarUrl) {
        circleEl.innerHTML = `<img src="${this.customAvatarUrl}" class="avatar-preview-img" alt="Avatar" />`;
        nameEl.textContent = 'Avatar Cá Nhân Tự Tải';
      } else {
        const activeItem = UNLOCKABLE_AVATARS.find(a => a.id === this.currentAvatar) || UNLOCKABLE_AVATARS[0];
        circleEl.innerHTML = `<span class="avatar-big-icon">${activeItem.icon}</span>`;
        nameEl.textContent = activeItem.name;
      }
    }

    const gridEl = this.modalEl.querySelector('#avatar-cards-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    UNLOCKABLE_AVATARS.forEach(item => {
      const isUnlocked = item.checkUnlock ? item.checkUnlock() : true;
      const isSelected = (!this.customAvatarUrl && this.currentAvatar === item.id);

      const card = document.createElement('div');
      card.className = `avatar-item-card ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="avatar-card-top">
          <div class="avatar-item-icon-box">
            <span class="avatar-icon-char">${item.icon}</span>
            ${!isUnlocked ? '<span class="avatar-lock-badge">Khóa</span>' : ''}
          </div>
          <div class="avatar-card-meta">
            <span class="avatar-category-tag">${item.category}</span>
            <strong class="avatar-item-name">${item.name}</strong>
          </div>
        </div>
        <p class="avatar-item-desc">${item.desc}</p>
        <div class="avatar-req-box">
          <span class="avatar-req-text">${item.reqText}</span>
        </div>
        <button type="button" class="btn-select-avatar ${isSelected ? 'active-using' : ''}" ${!isUnlocked ? 'disabled' : ''}>
          ${!isUnlocked ? 'Chưa Đạt Điều Kiện' : (isSelected ? 'Đang Dùng' : 'Sử Dụng')}
        </button>
      `;

      const selectBtn = card.querySelector('.btn-select-avatar');
      if (selectBtn && isUnlocked && !isSelected) {
        selectBtn.addEventListener('click', () => {
          this.setGameAvatar(item);
        });
      }

      gridEl.appendChild(card);
    });
  }
}
