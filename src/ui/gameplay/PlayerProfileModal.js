/**
 * PlayerProfileModal: Modal xem hồ sơ người chơi khác, kết bạn,
 * hiển thị mô hình nhân vật trực tiếp xoay 360 độ kèm hành động nhảy vui vẻ,
 * trang phục, kỉ lục minigame, Bestie Streak và thú cưng Buggy đồng hành.
 * Tuyệt đối không hiển thị email hay mật khẩu.
 */
import { friendManager } from '../../managers/FriendManager.js';
import { audioManager } from '../../utils/AudioManager.js';
import { ITEMS_DATABASE } from '../../config/items.js';
import { TextureGenerator } from '../../utils/TextureGenerator.js';

export class PlayerProfileModal {
  constructor({ onWhisper, onTeleportTo, onOpenAvatarSelector } = {}) {
    this.onWhisper = onWhisper;
    this.onTeleportTo = onTeleportTo;
    this.onOpenAvatarSelector = onOpenAvatarSelector;
    this.currentPlayer = null;
    this.isOpen = false;

    // 360° Rotation & Animation state
    this.directions = ['down', 'right', 'up', 'left']; // 0°, 90°, 180°, 270°
    this.directionLabels = ['Chính Diện (0°)', 'Nghiêng Phải (90°)', 'Sau Lưng (180°)', 'Nghiêng Trái (270°)'];
    this.currentDirIndex = 0;
    this.animFrame = 0;
    this.animTimer = null;
    this.isDragging = false;
    this.dragStartX = 0;

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

        <!-- 360° Interactive Character Showcase -->
        <div class="profile-character-showcase">
          <div class="character-preview-stage">
            <canvas id="profile-character-canvas" width="160" height="160" title="Kéo chuột sang trái/phải để xoay 360°"></canvas>
            <div class="character-action-tag">Đang Nhảy Vui Vẻ</div>
          </div>
          <div class="character-rotation-bar">
            <button type="button" class="btn-rotate" id="btn-profile-rot-left" title="Xoay 90° sang trái">◀ Xoay Trái</button>
            <span class="rotate-angle-label" id="profile-rot-angle-text">Chính Diện (0°)</span>
            <button type="button" class="btn-rotate" id="btn-profile-rot-right" title="Xoay 90° sang phải">Xoay Phải ▶</button>
          </div>
          <p class="rotate-hint-sub">Có thể kéo chuột trên nhân vật để xoay 360 độ</p>
        </div>

        <!-- Dynamic Details (Trang Phục, Kỉ Lục, Bestie Streak) -->
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

    // Nút xoay 360 độ
    const rotLeftBtn = this.modalEl.querySelector('#btn-profile-rot-left');
    const rotRightBtn = this.modalEl.querySelector('#btn-profile-rot-right');

    if (rotLeftBtn) {
      rotLeftBtn.addEventListener('click', () => {
        this.rotateLeft();
      });
    }

    if (rotRightBtn) {
      rotRightBtn.addEventListener('click', () => {
        this.rotateRight();
      });
    }

    // Kéo thả chuột để xoay nhân vật 360 độ mượt mà
    const canvas = this.modalEl.querySelector('#profile-character-canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.dragStartX = e.clientX;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !this.isOpen) return;
        const diff = e.clientX - this.dragStartX;
        if (Math.abs(diff) > 30) {
          if (diff > 0) this.rotateRight();
          else this.rotateLeft();
          this.dragStartX = e.clientX;
        }
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      // Touch drag cho mobile
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX;
        }
      });

      canvas.addEventListener('touchmove', (e) => {
        if (!this.isDragging || !this.isOpen || e.touches.length === 0) return;
        const diff = e.touches[0].clientX - this.dragStartX;
        if (Math.abs(diff) > 30) {
          if (diff > 0) this.rotateRight();
          else this.rotateLeft();
          this.dragStartX = e.touches[0].clientX;
        }
      });

      canvas.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    }

    friendManager.subscribe(() => {
      if (this.isOpen && this.currentPlayer) {
        this.renderFriendshipContent();
      }
    });
  }

  rotateLeft() {
    this.currentDirIndex = (this.currentDirIndex - 1 + 4) % 4;
    this.updateAngleLabel();
    audioManager.playClick?.();
  }

  rotateRight() {
    this.currentDirIndex = (this.currentDirIndex + 1) % 4;
    this.updateAngleLabel();
    audioManager.playClick?.();
  }

  updateAngleLabel() {
    const labelEl = this.modalEl.querySelector('#profile-rot-angle-text');
    if (labelEl) {
      labelEl.textContent = this.directionLabels[this.currentDirIndex];
    }
  }

  startCharacterAnimation() {
    this.stopCharacterAnimation();

    const canvas = this.modalEl.querySelector('#profile-character-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Temporary 32x32 canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 32;
    tempCanvas.height = 32;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    const frames = [0, 1, 2, 1]; // Chu kỳ bước nhảy vui vẻ

    this.animTimer = setInterval(() => {
      if (!this.isOpen) {
        this.stopCharacterAnimation();
        return;
      }

      this.animFrame = (this.animFrame + 1) % frames.length;
      const fIdx = frames[this.animFrame];
      const dir = this.directions[this.currentDirIndex];

      // Hiệu ứng nhảy vui vẻ (hop -3px khi ở frame nhấc chân)
      const hopY = (fIdx === 1) ? -2 : 0;

      // Chuẩn bị config trang phục
      const config = this.getWardrobeConfig();

      tempCtx.clearRect(0, 0, 32, 32);
      TextureGenerator.drawCharacterFrame(tempCtx, 0, hopY, dir, fIdx, config);

      // Render lên canvas preview (160x160, character 128x128 4x scale)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Nền sân khấu gradient spotlight
      const grad = ctx.createRadialGradient(80, 80, 10, 80, 80, 75);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vòng tròn bệ đỡ sân khấu
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.ellipse(80, 135, 42, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vẽ nhân vật phóng to 4x (128x128)
      ctx.drawImage(tempCanvas, 0, 0, 32, 32, 16, 14, 128, 128);
    }, 180);
  }

  stopCharacterAnimation() {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
  }

  getWardrobeConfig() {
    const friend = friendManager.getFriend(this.currentPlayer?.name);
    const avatarId = this.currentPlayer?.avatarId || friend?.avatarId || 'dev_hoodie';

    let shirtColor = '#f26f21';
    let outfitType = 'hoodie';

    if (avatarId === 'polo_white') {
      shirtColor = '#f8fafc';
      outfitType = 'polo';
    } else if (avatarId === 'cyber_punk') {
      shirtColor = '#06b6d4';
      outfitType = 'cyber';
    } else if (avatarId === 'event_tee') {
      shirtColor = '#7c3aed';
      outfitType = 'tee';
    }

    return this.currentPlayer?.wardrobeConfig || {
      gender: 'male',
      hairstyle: 'short',
      hair: '#0f172a',
      skin: '#fcd34d',
      outfitType: outfitType,
      shirt: shirtColor,
      collarColor: '#002147',
      pants: '#1e293b',
      accessory: 'none'
    };
  }

  getOutfitName(avatarId) {
    const map = {
      dev_hoodie: 'Áo Hoodie Dev FPTU Cam',
      polo_white: 'Áo Polo FPTU Trắng Lịch Lãm',
      cyber_punk: 'Trang Phục Cyberpunk Coder',
      event_tee: 'Áo Thun Sự Kiện Hackathon FU-DEVER',
      tech_suit: 'Bộ Suit Công Nghệ Cao Cấp',
      academic_robe: 'Áo Cử Nhân Tốt Nghiệp FUDA',
      sport_jersey: 'Áo Thể Thao CLB Năng Động'
    };
    return map[avatarId] || 'Đồng Phục Coder FU-DEVER';
  }

  getEquippedItemInfo(itemId) {
    if (!itemId) return null;
    return ITEMS_DATABASE[itemId] || null;
  }

  show(playerData) {
    if (!playerData) return;
    this.currentPlayer = playerData;
    this.isOpen = true;
    this.currentDirIndex = 0;
    this.updateAngleLabel();
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
      if (playerData.customAvatarUrl) {
        avatarEl.innerHTML = `<img src="${playerData.customAvatarUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
      } else {
        const role = playerData.role || 'dev';
        const icon = role === 'admin' ? '👑' : role === 'leader' ? '⚡' : '🧑‍💻';
        avatarEl.textContent = icon;
      }
    }

    this.renderFriendshipContent();
    this.modalEl.classList.remove('hidden');
    this.modalEl.style.display = 'flex';

    // Bắt đầu vòng lặp nhảy vui vẻ và xoay 360 độ
    this.startCharacterAnimation();
  }

  hide() {
    this.isOpen = false;
    this.stopCharacterAnimation();
    this.modalEl.classList.add('hidden');
    this.modalEl.style.display = '';
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

    // Trang phục & Vật phẩm cầm tay
    const avatarId = this.currentPlayer.avatarId || friend?.avatarId || 'dev_hoodie';
    const outfitName = this.getOutfitName(avatarId);
    const equippedId = this.currentPlayer.equippedItemId || friend?.equippedItemId || null;
    const equippedItem = this.getEquippedItemInfo(equippedId);

    // Kỉ lục minigame (dữ liệu mô phỏng / local records)
    const snakeHigh = localStorage.getItem('dever_snake_high') || '85';
    const bballHigh = localStorage.getItem('dever_bball_high') || '14';
    const penaltyHigh = localStorage.getItem('dever_penalty_high') || '4';

    const wardrobeHtml = `
      <!-- Wardrobe & Gear Section -->
      <div class="profile-section-card profile-wardrobe-card">
        <div class="profile-section-header">
          <span class="section-title-label">Trang Phục & Vật Phẩm</span>
        </div>
        <div class="profile-wardrobe-grid">
          <div class="profile-gear-item">
            <span class="gear-label">Bộ Trang Phục:</span>
            <strong class="gear-value">${outfitName}</strong>
          </div>
          <div class="profile-gear-item">
            <span class="gear-label">Vật Phẩm Cầm Tay:</span>
            <strong class="gear-value ${equippedItem ? 'highlight' : ''}">
              ${equippedItem ? `${equippedItem.icon} ${equippedItem.name}` : 'Không cầm vật phẩm'}
            </strong>
          </div>
        </div>
      </div>

      <!-- Minigame Records Section (Tuyệt đối không hiển thị gmail / password) -->
      <div class="profile-section-card profile-records-card">
        <div class="profile-section-header">
          <span class="section-title-label">Kỉ Lục & Hoạt Động Metaverse</span>
        </div>
        <div class="profile-records-grid">
          <div class="record-stat-box">
            <span class="record-num">${snakeHigh}</span>
            <span class="record-label">Rắn Săn Mồi</span>
          </div>
          <div class="record-stat-box">
            <span class="record-num">${bballHigh}</span>
            <span class="record-label">Ném Bóng Rổ</span>
          </div>
          <div class="record-stat-box">
            <span class="record-num">${penaltyHigh}</span>
            <span class="record-label">Sút Penalty</span>
          </div>
          <div class="record-stat-box">
            <span class="record-num">Active</span>
            <span class="record-label">Trạng Thái</span>
          </div>
        </div>
      </div>
    `;

    if (this.currentPlayer.isMe) {
      bodyEl.innerHTML = `
        ${wardrobeHtml}
        <div class="profile-section-card">
          <div class="profile-section-header">
            <span class="section-title-label">Hồ Sơ Của Bạn</span>
          </div>
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5;">
            Đây là nhân vật và trang phục bạn đang mặc trong Metaverse. Bạn có thể mở tủ đồ để đổi trang phục hoặc mở kho Avatar để tùy chỉnh ảnh đại diện.
          </p>
        </div>
      `;

      actionsEl.innerHTML = `
        <button type="button" class="btn-profile-action" id="btn-profile-change-avatar" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white;">
          Đổi Avatar Cá Nhân
        </button>
        <button type="button" class="btn-profile-action" id="btn-profile-open-wardrobe" style="background: #1e293b; color: #38bdf8;">
          Mở Tủ Đồ
        </button>
      `;

      const changeAvatarBtn = actionsEl.querySelector('#btn-profile-change-avatar');
      if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
          this.hide();
          const ws = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
          if (ws && ws.avatarSelectorModal) {
            ws.avatarSelectorModal.show();
          }
        });
      }

      const openWardrobeBtn = actionsEl.querySelector('#btn-profile-open-wardrobe');
      if (openWardrobeBtn) {
        openWardrobeBtn.addEventListener('click', () => {
          this.hide();
          const ws = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
          if (ws && ws.wardrobeModal) {
            ws.wardrobeModal.show();
          }
        });
      }
      return;
    }

    if (!isFriend) {
      bodyEl.innerHTML = `
        ${wardrobeHtml}

        <div class="profile-not-friend-box">
          <div class="not-friend-icon">DEVER</div>
          <h4 class="not-friend-title">${isPending ? 'Đang chờ phản hồi...' : 'Chưa kết bạn'}</h4>
          <p class="not-friend-desc">
            ${isPending
              ? 'Lời mời kết bạn đã được gửi tới người này. Hãy đợi đối phương chọn Đồng Ý nhé!'
              : 'Gửi lời mời kết bạn để cùng trò chuyện riêng, xây dựng chuỗi Bestie Streak 🔥 mỗi ngày và ấp nở Thú cưng Buggy đồng hành!'}
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
            if (worldScene && worldScene.showToast) {
              worldScene.showToast('Bạn cần kết nối mạng để gửi lời mời kết bạn!');
            } else {
              alert('Bạn cần kết nối mạng để gửi lời mời kết bạn!');
            }
          }
        });
      }
    } else {
      const durationText = friendManager.getFriendshipDurationText(friend);
      const streak = friend.streak || 1;
      const pet = friendManager.getPetInfo(streak);

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
        ${wardrobeHtml}

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
        if (isFriend) {
          friendManager.recordInteraction(this.currentPlayer.id || this.currentPlayer.name);
        }
        this.hide();
      });
    }
  }
}
