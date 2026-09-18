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
import { WARDROBE_CONFIG } from '../../config/wardrobe.js';

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
        
        <div class="profile-layout-grid">
          <!-- Cột Trái: Thông tin người chơi, Hoạt ảnh 360 độ và Nút hành động -->
          <div class="profile-left-col">
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
              <p class="rotate-hint-sub">Kéo chuột trên nhân vật để xoay 360 độ</p>
            </div>

            <!-- Nút hành động (Nhắn Tin, Đi Tới Gần, Hủy Bạn / Kết Bạn) -->
            <div class="profile-card-actions" id="profile-card-actions">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Cột Phải: Trang Phục, Kỉ Lục Minigames, Bestie Streak & Thú Cưng Buggy -->
          <div class="profile-right-col">
            <div id="profile-friendship-body" class="profile-friendship-container">
              <!-- Rendered dynamically -->
            </div>
          </div>
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

    // Temporary 48x64 canvas (khớp kích thước frame sprite)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 48;
    tempCanvas.height = 64;
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

      // Chuẩn bị config trang phục thực tế
      const config = this.getWardrobeConfig();
      const outfitId = config.outfitId || 'hoodie_fuda';
      const normalizedOutfitId = outfitId === 'barista_apron' ? 'apron_barista' : outfitId;
      const prebakedKey = `char_${normalizedOutfitId}`;

      tempCtx.clearRect(0, 0, 48, 64);

      let usedPrebaked = false;
      const gameScene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (gameScene?.textures?.exists(prebakedKey)) {
        try {
          const srcTex = gameScene.textures.get(prebakedKey);
          const srcImg = srcTex.getSourceImage();
          if (srcImg) {
            const dirRow = { 'down': 0, 'left': 1, 'right': 2, 'up': 3 }[dir] || 0;
            tempCtx.drawImage(srcImg, fIdx * 48, dirRow * 64, 48, 64, 0, hopY, 48, 64);
            usedPrebaked = true;

            if (config.inHandItem && config.inHandItem !== 'none') {
              TextureGenerator.drawInHandEquipment(tempCtx, 0, hopY, dir, fIdx, config.inHandItem);
            }
          }
        } catch (e) {}
      }

      if (!usedPrebaked) {
        TextureGenerator.drawCharacterFrame(tempCtx, 0, hopY, dir, fIdx, config);
      }

      // Render lên canvas preview (160x160, character 2.5x scale = 120x160)
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

      // Vẽ nhân vật phóng to 2.5x (120x160)
      ctx.drawImage(tempCanvas, 0, 0, 48, 64, 20, 0, 120, 160);
    }, 180);
  }

  stopCharacterAnimation() {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
  }

  getWardrobeConfig() {
    let rawConfig = this.currentPlayer?.wardrobeConfig;
    if (!rawConfig && this.currentPlayer?.isMe) {
      try {
        const saved = localStorage.getItem('dever_wardrobe_config');
        if (saved) rawConfig = JSON.parse(saved);
      } catch (e) {}
    }
    const friend = friendManager.getFriend(this.currentPlayer?.name);
    const outfitId = rawConfig?.outfitId || this.currentPlayer?.avatarId || friend?.avatarId || 'hoodie_fuda';
    const normalizedOutfitId = outfitId === 'barista_apron' ? 'apron_barista' : outfitId;
    const outfitObj = WARDROBE_CONFIG.outfits.find(o => o.id === normalizedOutfitId || o.id === outfitId) || WARDROBE_CONFIG.outfits[0];

    return {
      gender: rawConfig?.gender || 'male',
      hairstyle: rawConfig?.hairstyle || 'short',
      hair: rawConfig?.hairColor || rawConfig?.hair || '#0f172a',
      skin: rawConfig?.skinColor || rawConfig?.skin || '#fbd1a2',
      skinTone: rawConfig?.skinTone || 'skin_natural',
      facialHair: rawConfig?.facialHair || 'none',
      expression: rawConfig?.expression || 'expr_focus',
      outfitId: normalizedOutfitId,
      outfitType: rawConfig?.outfitType || outfitObj?.type || 'hoodie',
      shirt: rawConfig?.hoodieColor || outfitObj?.color || '#f26f21',
      collarColor: rawConfig?.collarColor || outfitObj?.collarColor || '#002147',
      pants: rawConfig?.pantsColor || '#1e293b',
      accessory: rawConfig?.accessory || 'none',
      inHandItem: this.currentPlayer?.equippedItemId || rawConfig?.inHandItem || (this.currentPlayer?.isMe ? localStorage.getItem('dever_equipped_item') : null) || null
    };
  }

  getOutfitName(avatarId) {
    if (!avatarId) return 'Áo Hoodie FUDA Cam';
    const normalized = avatarId === 'barista_apron' ? 'apron_barista' : avatarId;
    const found = WARDROBE_CONFIG.outfits.find(o => o.id === normalized || o.id === avatarId);
    if (found) return found.name;
    const upcoming = WARDROBE_CONFIG.upcomingOutfits?.find(o => o.id === avatarId);
    if (upcoming) return upcoming.name;
    return 'Đồng Phục Coder FU-DEVER';
  }

  getEquippedItemInfo(itemId) {
    if (!itemId || itemId === 'none') return null;
    const inHand = WARDROBE_CONFIG.inHandEquipments.find(i => i.id === itemId);
    if (inHand) return inHand;
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
        // Vẽ mini Chibi Avatar sắc nét trực tiếp từ spritesheet
        const config = this.getWardrobeConfig();
        const outfitId = config.outfitId || 'hoodie_fuda';
        const prebakedKey = `char_${outfitId}`;
        const gameScene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');

        let avatarRendered = false;
        if (gameScene?.textures?.exists(prebakedKey)) {
          try {
            const srcTex = gameScene.textures.get(prebakedKey);
            const srcImg = srcTex.getSourceImage();
            if (srcImg) {
              const miniCanvas = document.createElement('canvas');
              miniCanvas.width = 44;
              miniCanvas.height = 44;
              const miniCtx = miniCanvas.getContext('2d');
              miniCtx.imageSmoothingEnabled = false;
              // Cắt phần mặt Chibi chính diện (x: 4..44, y: 4..44)
              miniCtx.drawImage(srcImg, 4, 4, 40, 40, 0, 0, 44, 44);
              avatarEl.innerHTML = '';
              avatarEl.appendChild(miniCanvas);
              avatarRendered = true;
            }
          } catch (e) {}
        }

        if (!avatarRendered) {
          const role = playerData.role || 'dev';
          const icon = role === 'admin' ? '👑' : role === 'leader' ? '⚡' : '🧑‍💻';
          avatarEl.textContent = icon;
        }
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
