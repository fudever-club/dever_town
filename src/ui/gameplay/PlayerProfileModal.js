/**
 * PlayerProfileModal: Modal xem hồ sơ người chơi khác, kết bạn, theo dõi thời gian kết bạn,
 * chuỗi Bestie Streak và thú cưng Buggy đồng hành.
 */
import { friendManager } from '../../managers/FriendManager.js';
import { audioManager } from '../../utils/AudioManager.js';

export class PlayerProfileModal {
  constructor({ onWhisper, onTeleportTo } = {}) {
    this.onWhisper = onWhisper;
    this.onTeleportTo = onTeleportTo;
    this.currentPlayer = null;
    this.isOpen = false;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'player-profile-modal';
    this.modalEl.className = 'player-profile-modal-overlay hidden';

    this.modalEl.innerHTML = `
      <div class="player-profile-card">
        <button type="button" class="player-profile-close" id="profile-modal-close-btn" title="Đóng">&times;</button>
        
        <div class="profile-card-header">
          <div class="profile-card-avatar-wrapper">
            <div class="profile-card-avatar" id="target-player-avatar">🧑‍💻</div>
            <span class="profile-card-online-dot" title="Đang trực tuyến"></span>
          </div>
          <div class="profile-card-titles">
            <div class="profile-name-badge-row">
              <h3 id="target-player-name" class="profile-player-name">Tên người chơi</h3>
              <span id="target-player-role" class="profile-role-badge">Dev</span>
            </div>
            <p id="target-player-status" class="profile-player-status">Đang cùng phòng với bạn</p>
          </div>
        </div>

        <!-- Dynamic Friendship & Streak Container -->
        <div id="profile-friendship-body" class="profile-friendship-container">
          <!-- Rendered dynamically -->
        </div>

        <div class="profile-card-actions" id="profile-card-actions">
          <!-- Dynamic action buttons -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
  }

  bindEvents() {
    const closeBtn = this.modalEl.querySelector('#profile-modal-close-btn');
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

    friendManager.subscribe(() => {
      if (this.isOpen && this.currentPlayer) {
        this.renderFriendshipContent();
      }
    });
  }

  show(playerData) {
    if (!playerData) return;
    this.currentPlayer = playerData;
    this.isOpen = true;
    audioManager.playClick();

    const nameEl = this.modalEl.querySelector('#target-player-name');
    const roleEl = this.modalEl.querySelector('#target-player-role');
    const avatarEl = this.modalEl.querySelector('#target-player-avatar');

    if (nameEl) nameEl.textContent = playerData.name || 'Người chơi';
    if (roleEl) {
      const role = playerData.role || 'dev';
      roleEl.textContent = role === 'admin' ? 'BQT Admin' : role === 'leader' ? 'Leader' : role === 'dev' ? 'Thành Viên CLB' : 'Khách';
      roleEl.className = `profile-role-badge ${role}`;
    }

    if (avatarEl) {
      const role = playerData.role || 'dev';
      const icon = role === 'admin' ? '👑' : role === 'leader' ? '⚡' : '💻';
      avatarEl.textContent = icon;
    }

    this.renderFriendshipContent();
    this.modalEl.classList.remove('hidden');
  }

  hide() {
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
    if (window.__DEVER_GAME__?.canvas) {
      window.__DEVER_GAME__.canvas.focus();
    }
  }

  renderFriendshipContent() {
    const bodyEl = this.modalEl.querySelector('#profile-friendship-body');
    const actionsEl = this.modalEl.querySelector('#profile-card-actions');
    if (!bodyEl || !actionsEl) return;

    const friend = friendManager.getFriend(this.currentPlayer.id || this.currentPlayer.name);
    const isFriend = !!friend;
    const isPending = friendManager.isPending(this.currentPlayer.id) || friendManager.isPending(this.currentPlayer.name);

    if (!isFriend) {
      // 1. Chưa là bạn bè
      bodyEl.innerHTML = `
        <div class="profile-not-friend-box">
          <div class="not-friend-icon">DEVER</div>
          <h4 class="not-friend-title">${isPending ? 'Đang chờ phản hồi...' : 'Chưa kết bạn'}</h4>
          <p class="not-friend-desc">
            ${isPending
              ? 'Lời mời kết bạn đã được gửi tới người này. Hãy đợi đối phương chọn Đồng Ý nhé!'
              : 'Gửi lời mời kết bạn để cùng trò chuyện, xây dựng chuỗi Bestie Streak 🔥 mỗi ngày và ấp nở Thú cưng Buggy đồng hành!'}
          </p>
        </div>
      `;

      actionsEl.innerHTML = `
        <button type="button" class="btn-profile-action add-friend ${isPending ? 'pending' : ''}" id="btn-add-friend" ${isPending ? 'disabled style="opacity:0.65;cursor:not-allowed;"' : ''}>
          ${isPending ? 'Đã Gửi Lời Mời...' : 'Gửi Lời Mời Kết Bạn'}
        </button>
        <button type="button" class="btn-profile-action whisper" id="btn-whisper-player">
          Nhắn Tin
        </button>
      `;

      const addBtn = actionsEl.querySelector('#btn-add-friend');
      if (addBtn && !isPending) {
        addBtn.addEventListener('click', () => {
          const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
          if (worldScene && worldScene.socketManager && worldScene.socketManager.isConnected) {
            worldScene.socketManager.sendFriendRequest({
              targetSocketId: this.currentPlayer.id,
              targetName: this.currentPlayer.name
            });
            friendManager.setPending(this.currentPlayer.name);
            if (this.currentPlayer.id) friendManager.setPending(this.currentPlayer.id);
            audioManager.playClick();
            this.renderFriendshipContent();
          } else {
            // Không có kết nối Socket: nhắc người chơi
            if (worldScene && worldScene.showToast) {
              worldScene.showToast('Bạn cần kết nối mạng để gửi lời mời kết bạn!');
            } else {
              alert('Bạn cần kết nối mạng để gửi lời mời kết bạn!');
            }
          }
        });
      }
    } else {
      // 2. Đã là bạn bè
      const durationText = friendManager.getFriendshipDurationText(friend);
      const streak = friend.streak || 1;
      const pet = friendManager.getPetInfo(streak);

      // Tính tiến trình thú cưng
      let progressPercent = 100;
      let progressLabel = 'Đạt cấp độ tối thượng';
      if (pet.level === 1) {
        progressPercent = Math.min(100, Math.round((streak / 3) * 100));
        progressLabel = `${streak} / 3 ngày để nở Trứng thành Buggy Chibi`;
      } else if (pet.level === 2) {
        progressPercent = Math.min(100, Math.round(((streak - 3) / (7 - 3)) * 100));
        progressLabel = `${streak} / 7 ngày để lên Buggy Kỹ Sư`;
      } else if (pet.level === 3) {
        progressPercent = Math.min(100, Math.round(((streak - 7) / (14 - 7)) * 100));
        progressLabel = `${streak} / 14 ngày để lên Buggy Cầm Cúp`;
      }

      bodyEl.innerHTML = `
        <div class="profile-friend-stats-card">
          <div class="friend-duration-row">
            <span class="duration-badge">${durationText}</span>
          </div>

          <!-- Bestie Streak Box -->
          <div class="bestie-streak-box">
            <div class="streak-header-row">
              <div class="streak-count-col">
                <span class="streak-fire-icon">🔥</span>
                <span class="streak-number">${streak}</span>
                <span class="streak-text-label">Ngày Streak</span>
              </div>
              <div class="streak-status-tag">
                ${friend.lastStreakDate === friendManager.getTodayDateString() ? 'Đã duy trì hôm nay' : 'Nhắn tin để giữ chuỗi'}
              </div>
            </div>
            <p class="streak-hint">Nhắn tin trò chuyện mỗi ngày để duy trì lửa tình bạn và nâng cấp thú cưng!</p>
          </div>

          <!-- Pet Mascot Companion Box -->
          <div class="pet-companion-box">
            <div class="pet-visual-row">
              <div class="pet-avatar-circle">${pet.icon}</div>
              <div class="pet-info-col">
                <div class="pet-name-badge-row">
                  <strong class="pet-name">${pet.name}</strong>
                  <span class="pet-badge">${pet.badge}</span>
                </div>
                <p class="pet-desc">${pet.desc}</p>
              </div>
            </div>

            <!-- Pet Evolution Progress Bar -->
            <div class="pet-progress-wrapper">
              <div class="pet-progress-bar">
                <div class="pet-progress-fill" style="width: ${progressPercent}%"></div>
              </div>
              <span class="pet-progress-label">${progressLabel}</span>
            </div>
          </div>
        </div>
      `;

      actionsEl.innerHTML = `
        <button type="button" class="btn-profile-action whisper" id="btn-whisper-player">
          Nhắn Tin
        </button>
        <button type="button" class="btn-profile-action teleport" id="btn-teleport-player">
          Đi Tới Gần
        </button>
        <button type="button" class="btn-profile-action unfriend" id="btn-unfriend-player" title="Hủy kết bạn">
          Hủy Bạn
        </button>
      `;

      const teleportBtn = actionsEl.querySelector('#btn-teleport-player');
      if (teleportBtn) {
        teleportBtn.addEventListener('click', () => {
          if (this.onTeleportTo) this.onTeleportTo(this.currentPlayer);
          this.hide();
        });
      }

      const unfriendBtn = actionsEl.querySelector('#btn-unfriend-player');
      if (unfriendBtn) {
        unfriendBtn.addEventListener('click', () => {
          if (confirm(`Bạn có chắc muốn hủy kết bạn với ${this.currentPlayer.name}?`)) {
            friendManager.removeFriend(this.currentPlayer.id || this.currentPlayer.name);
            this.renderFriendshipContent();
          }
        });
      }
    }

    const whisperBtn = actionsEl.querySelector('#btn-whisper-player');
    if (whisperBtn) {
      whisperBtn.addEventListener('click', () => {
        if (this.onWhisper) {
          this.onWhisper(this.currentPlayer);
        }
        // Khi nhắn tin, tự động ghi nhận tương tác duy trì Streak!
        if (isFriend) {
          const result = friendManager.recordInteraction(this.currentPlayer.id || this.currentPlayer.name);
          if (result && result.streakIncreased) {
            console.log(`🔥 [Bestie Streak] Chuỗi bạn thân với ${this.currentPlayer.name} tăng lên ${result.currentStreak} ngày!`);
          }
        }
        this.hide();
      });
    }
  }
}
