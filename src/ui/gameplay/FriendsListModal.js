/**
 * FriendsListModal: Modal quản lý danh sách bạn bè, tìm kiếm ID/Tên kết bạn,
 * theo dõi chuỗi Bestie Streak và kết nối trực tiếp với hệ thống Chat riêng.
 */
import { friendManager } from '../../managers/FriendManager.js';
import { audioManager } from '../../utils/AudioManager.js';

export class FriendsListModal {
  /**
   * @param {Object} options
   * @param {Function} options.onViewProfile - Callback khi bấm Xem Hồ Sơ bạn bè
   * @param {Function} options.onChatWith - Callback khi bấm Nhắn Tin với bạn bè
   */
  constructor({ onViewProfile, onChatWith } = {}) {
    this.onViewProfile = onViewProfile;
    this.onChatWith = onChatWith;
    this.isOpen = false;
    this.activeTab = 'friends'; // 'friends' | 'requests'
    this.searchQuery = '';

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'friends-list-modal';
    this.modalEl.className = 'modal-backdrop hidden';

    this.modalEl.innerHTML = `
      <div class="modal-card modal-card-lg friends-modal-card">
        <div class="modal-header">
          <div class="modal-title-row">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <div>
              <h2 class="modal-title">Danh Sách Bạn Bè & Kết Bạn</h2>
              <p class="modal-sub">Quản lý bạn thân, theo dõi chuỗi Bestie Streak và tìm kiếm bạn bè trong Metaverse.</p>
            </div>
          </div>
          <button type="button" id="friends-modal-close-btn" class="modal-close-btn">&times;</button>
        </div>

        <!-- Add Friend by ID / Name Form -->
        <div class="friends-search-add-box">
          <div class="friends-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="friends-add-input"
              class="friends-add-input"
              placeholder="Nhập Tên hoặc ID người chơi để gửi lời mời kết bạn..."
              autocomplete="off"
            />
          </div>
          <button type="button" id="friends-send-req-btn" class="btn-send-friend-req">Gửi Lời Mời</button>
        </div>

        <!-- Tabs Navigation -->
        <div class="friends-tabs-nav">
          <button type="button" class="friends-tab-btn active" data-tab="friends" id="tab-friends-list">
            Bạn Bè (<span id="friends-count-num">0</span>)
          </button>
          <button type="button" class="friends-tab-btn" data-tab="requests" id="tab-friends-requests">
            Lời Mời Chờ Duyệt (<span id="requests-count-num">0</span>)
          </button>
        </div>

        <!-- Tab 1: Friends List Content -->
        <div id="friends-tab-content-list" class="friends-tab-view">
          <div class="friends-filter-bar">
            <input
              type="text"
              id="friends-filter-input"
              class="friends-filter-input"
              placeholder="Lọc nhanh danh sách bạn bè..."
            />
          </div>
          <div id="friends-cards-container" class="friends-cards-container">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Tab 2: Pending Requests Content -->
        <div id="friends-tab-content-requests" class="friends-tab-view hidden">
          <div id="friends-requests-container" class="friends-cards-container">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
  }

  bindEvents() {
    // Ngăn chặn sự kiện phím lan ra canvas khi đang gõ tìm kiếm / nhập ID
    const inputs = this.modalEl.querySelectorAll('input');
    inputs.forEach(input => {
      const stopProp = (e) => e.stopPropagation();
      input.addEventListener('keydown', stopProp);
      input.addEventListener('keyup', stopProp);
      input.addEventListener('keypress', stopProp);
    });

    // Nút đóng modal
    const closeBtn = this.modalEl.querySelector('#friends-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Click backdrop
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    // Phím Escape đóng modal, phím F mở/đóng bạn bè
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      } else if ((e.key === 'f' || e.key === 'F') && !this.isInputFocused()) {
        const activeModal = document.querySelector('.modal-backdrop:not(.hidden)');
        if (!activeModal || activeModal === this.modalEl) {
          e.preventDefault();
          this.toggle();
        }
      }
    });

    // Tabs chuyển đổi
    const tabBtns = this.modalEl.querySelectorAll('.friends-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Gửi lời mời kết bạn theo Tên / ID
    const sendReqBtn = this.modalEl.querySelector('#friends-send-req-btn');
    const addInput = this.modalEl.querySelector('#friends-add-input');

    const handleSendRequest = () => {
      const val = (addInput.value || '').trim();
      if (!val) {
        this.showFeedback('Vui lòng nhập Tên hoặc ID người chơi.');
        return;
      }

      const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const currentName = worldScene?.player?.name || 'Tôi';
      if (val.toLowerCase() === currentName.toLowerCase()) {
        this.showFeedback('Bạn không thể tự kết bạn với chính mình!');
        return;
      }

      if (friendManager.isFriend(val)) {
        this.showFeedback(`Bạn và ${val} đã là bạn bè rồi!`);
        return;
      }

      if (friendManager.isPending(val)) {
        this.showFeedback(`Đã gửi lời mời tới ${val}, đang chờ phản hồi!`);
        return;
      }

      if (worldScene && worldScene.socketManager && worldScene.socketManager.isConnected) {
        worldScene.socketManager.sendFriendRequest({ targetName: val });
        friendManager.setPending(val);
        audioManager.playClick();
        this.showFeedback(`Đã gửi lời mời kết bạn tới ${val}. Đang chờ đối phương đồng ý!`, true);
        addInput.value = '';
        this.render();
      } else {
        this.showFeedback('Cần kết nối mạng để gửi lời mời kết bạn.');
      }
    };

    if (sendReqBtn) {
      sendReqBtn.addEventListener('click', handleSendRequest);
    }
    if (addInput) {
      addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSendRequest();
        }
      });
    }

    // Lọc danh sách bạn bè
    const filterInput = this.modalEl.querySelector('#friends-filter-input');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        this.renderFriendsList();
      });
    }

    // Lắng nghe dữ liệu bạn bè thay đổi
    friendManager.subscribe(() => {
      if (this.isOpen) {
        this.render();
      }
      this.updateHeaderBadge();
    });
  }

  isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
  }

  isOpenModal() {
    return this.isOpen;
  }

  show() {
    this.isOpen = true;
    this.modalEl.classList.remove('hidden');
    audioManager.playClick();
    this.render();

    const addInput = this.modalEl.querySelector('#friends-add-input');
    if (addInput) {
      setTimeout(() => addInput.focus(), 100);
    }
  }

  hide() {
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
    if (window.__DEVER_GAME__?.canvas) {
      window.__DEVER_GAME__.canvas.focus();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  switchTab(tab) {
    this.activeTab = tab;
    audioManager.playClick();

    const tabFriends = this.modalEl.querySelector('#tab-friends-list');
    const tabReqs = this.modalEl.querySelector('#tab-friends-requests');
    const viewFriends = this.modalEl.querySelector('#friends-tab-content-list');
    const viewReqs = this.modalEl.querySelector('#friends-tab-content-requests');

    if (tab === 'friends') {
      tabFriends.classList.add('active');
      tabReqs.classList.remove('active');
      viewFriends.classList.remove('hidden');
      viewReqs.classList.add('hidden');
    } else {
      tabReqs.classList.add('active');
      tabFriends.classList.remove('active');
      viewReqs.classList.remove('hidden');
      viewFriends.classList.add('hidden');
    }

    this.render();
  }

  render() {
    const friends = friendManager.getFriends();
    const countFriendsEl = this.modalEl.querySelector('#friends-count-num');
    const countReqsEl = this.modalEl.querySelector('#requests-count-num');

    if (countFriendsEl) countFriendsEl.textContent = friends.length;
    if (countReqsEl) countReqsEl.textContent = window.__PENDING_REQUESTS__?.length || 0;

    if (this.activeTab === 'friends') {
      this.renderFriendsList();
    } else {
      this.renderPendingRequests();
    }

    this.updateHeaderBadge();
  }

  renderFriendsList() {
    const container = this.modalEl.querySelector('#friends-cards-container');
    if (!container) return;

    container.innerHTML = '';
    const friends = friendManager.getFriends();

    const filtered = friends.filter(f => {
      if (!this.searchQuery) return true;
      return (f.name || '').toLowerCase().includes(this.searchQuery);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="friends-empty-box">
          <div class="friends-empty-icon">DEVER</div>
          <h4 class="friends-empty-title">
            ${this.searchQuery ? 'Không tìm thấy người bạn phù hợp' : 'Chưa có bạn bè nào trong danh sách'}
          </h4>
          <p class="friends-empty-desc">
            ${this.searchQuery
              ? 'Hãy thử tìm kiếm với từ khóa hoặc tên khác.'
              : 'Hãy nhập Tên hoặc ID ở ô phía trên để gửi lời mời, hoặc nhấp vào người chơi cùng phòng trong Metaverse để kết bạn!'}
          </p>
        </div>
      `;
      return;
    }

    filtered.forEach(friend => {
      const streak = friend.streak || 1;
      const pet = friendManager.getPetInfo(streak);
      const durationText = friendManager.getFriendshipDurationText(friend);

      const card = document.createElement('div');
      card.className = 'friend-list-card';

      card.innerHTML = `
        <div class="friend-card-left">
          <div class="friend-avatar-circle">
            <span class="friend-avatar-icon">${friend.role === 'admin' ? '👑' : friend.role === 'leader' ? '⚡' : '💻'}</span>
            <span class="friend-online-dot" title="Đang trực tuyến"></span>
          </div>
          <div class="friend-info-col">
            <div class="friend-name-row">
              <strong class="friend-name">${friend.name}</strong>
              <span class="friend-role-badge ${friend.role || 'dev'}">
                ${friend.role === 'admin' ? 'Admin' : friend.role === 'leader' ? 'Leader' : 'Thành Viên CLB'}
              </span>
            </div>
            <div class="friend-streak-meta">
              <span class="friend-streak-pill" title="Chuỗi Bestie Streak">
                🔥 ${streak} Ngày
              </span>
              <span class="friend-pet-pill" title="${pet.name} (${pet.badge})">
                ${pet.icon} ${pet.name}
              </span>
            </div>
            <span class="friend-duration-label">${durationText}</span>
          </div>
        </div>

        <div class="friend-card-actions">
          <button type="button" class="btn-friend-action profile-btn" data-action="profile">Hồ Sơ</button>
          <button type="button" class="btn-friend-action chat-btn" data-action="chat">Nhắn Tin</button>
          <button type="button" class="btn-friend-action unfriend-btn" data-action="unfriend" title="Hủy kết bạn">&times;</button>
        </div>
      `;

      // Event: Xem hồ sơ
      const profileBtn = card.querySelector('[data-action="profile"]');
      if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.onViewProfile) {
            this.onViewProfile(friend);
          }
        });
      }

      // Event: Nhắn tin riêng
      const chatBtn = card.querySelector('[data-action="chat"]');
      if (chatBtn) {
        chatBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hide();
          if (this.onChatWith) {
            this.onChatWith(friend);
          }
        });
      }

      // Event: Hủy bạn
      const unfriendBtn = card.querySelector('[data-action="unfriend"]');
      if (unfriendBtn) {
        unfriendBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${friend.name}?`)) {
            friendManager.removeFriend(friend.id || friend.name);
            this.render();
          }
        });
      }

      container.appendChild(card);
    });
  }

  renderPendingRequests() {
    const container = this.modalEl.querySelector('#friends-requests-container');
    if (!container) return;

    container.innerHTML = '';
    const pendingList = window.__PENDING_REQUESTS__ || [];

    if (pendingList.length === 0) {
      container.innerHTML = `
        <div class="friends-empty-box">
          <div class="friends-empty-icon">DEVER</div>
          <h4 class="friends-empty-title">Không có lời mời nào đang chờ</h4>
          <p class="friends-empty-desc">Khi người chơi khác gửi lời mời kết bạn tới bạn, thông báo và danh sách sẽ hiển thị tại đây.</p>
        </div>
      `;
      return;
    }

    pendingList.forEach((req, idx) => {
      const card = document.createElement('div');
      card.className = 'friend-list-card request-card';

      card.innerHTML = `
        <div class="friend-card-left">
          <div class="friend-avatar-circle">
            <span class="friend-avatar-icon">${req.fromRole === 'admin' ? '👑' : req.fromRole === 'leader' ? '⚡' : '💻'}</span>
          </div>
          <div class="friend-info-col">
            <div class="friend-name-row">
              <strong class="friend-name">${req.fromName}</strong>
              <span class="friend-role-badge ${req.fromRole || 'guest'}">${req.fromRole || 'Khách'}</span>
            </div>
            <span class="friend-duration-label">Đã gửi lời mời kết bạn tới bạn.</span>
          </div>
        </div>

        <div class="friend-card-actions">
          <button type="button" class="btn-friend-action accept-btn" data-idx="${idx}">Đồng Ý</button>
          <button type="button" class="btn-friend-action decline-btn" data-idx="${idx}">Từ Chối</button>
        </div>
      `;

      const acceptBtn = card.querySelector('.accept-btn');
      const declineBtn = card.querySelector('.decline-btn');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
          if (worldScene && worldScene.friendRequestModal) {
            worldScene.friendRequestModal.handleAccept(req);
            pendingList.splice(idx, 1);
            this.render();
          }
        });
      }

      if (declineBtn) {
        declineBtn.addEventListener('click', () => {
          const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
          if (worldScene && worldScene.friendRequestModal) {
            worldScene.friendRequestModal.handleDecline(req);
            pendingList.splice(idx, 1);
            this.render();
          }
        });
      }

      container.appendChild(card);
    });
  }

  showFeedback(msg, isSuccess = false) {
    const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    if (worldScene && worldScene.showToast) {
      worldScene.showToast(msg);
    } else {
      alert(msg);
    }
  }

  updateHeaderBadge() {
    const badgeEl = document.getElementById('friends-badge-count');
    if (!badgeEl) return;

    const count = friendManager.getFriends().length;
    if (count > 0) {
      badgeEl.textContent = count;
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }
  }
}
