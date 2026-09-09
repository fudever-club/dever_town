import { friendManager } from '../../managers/FriendManager.js';
import { audioManager } from '../../utils/AudioManager.js';

export class ChatBox {
  /**
   * @param {Object} options
   * @param {Function} options.onSendMessage - Gửi tin nhắn phòng chung
   * @param {Function} options.onSendPrivateMessage - Gửi tin nhắn riêng 1-1
   */
  constructor({ onSendMessage, onSendPrivateMessage } = {}) {
    this.onSendMessage = onSendMessage;
    this.onSendPrivateMessage = onSendPrivateMessage;

    this.chatWrapper = document.getElementById('chat-wrapper');
    this.chatForm = document.getElementById('chat-form');
    this.chatInput = document.getElementById('chat-input');
    this.chatMessages = document.getElementById('chat-messages');
    this.chatPrivateMessages = document.getElementById('chat-private-messages');
    this.stickerBtn = document.getElementById('chat-sticker-btn');
    this.stickerPopover = document.getElementById('chat-sticker-popover');
    this.closeBtn = document.getElementById('chat-mobile-close-btn');
    this.mobileBackdrop = document.getElementById('chat-mobile-backdrop');

    // Tabs & Private Chat UI
    this.tabRoomBtn = document.getElementById('chat-tab-room');
    this.tabFriendsBtn = document.getElementById('chat-tab-friends');
    this.unreadDot = document.getElementById('chat-unread-dot');
    this.privateBar = document.getElementById('chat-private-bar');
    this.privateTargetNameEl = document.getElementById('chat-private-target-name');
    this.switchFriendBtn = document.getElementById('chat-switch-friend-btn');
    this.friendPickerDropdown = document.getElementById('chat-friend-picker-dropdown');
    this.chatSubEl = document.querySelector('.chat-sub');

    this.activeTab = 'room'; // 'room' | 'friends'
    this.activeFriend = null; // { id, name, role, avatarId }
    this.privateHistories = new Map(); // key: friendName (lowercase) -> array of messages
    this.unreadCount = 0;

    this.loadPrivateHistories();
    this.initEvents();
    this.initTabs();
    this.initStickers();
    this.initMobileEvents();
  }

  loadPrivateHistories() {
    try {
      const stored = localStorage.getItem('dever_pm_histories');
      if (stored) {
        const obj = JSON.parse(stored);
        Object.entries(obj).forEach(([name, list]) => {
          if (Array.isArray(list)) {
            this.privateHistories.set(name.toLowerCase(), list);
          }
        });
      }
    } catch (e) {
      console.warn('[ChatBox] Lỗi đọc lịch sử chat riêng:', e);
    }
  }

  savePrivateHistories() {
    try {
      const obj = {};
      this.privateHistories.forEach((list, name) => {
        obj[name] = list.slice(-50); // Lưu 50 tin nhắn gần nhất
      });
      localStorage.setItem('dever_pm_histories', JSON.stringify(obj));
    } catch (e) {
      console.warn('[ChatBox] Lỗi lưu lịch sử chat riêng:', e);
    }
  }

  initTabs() {
    if (this.tabRoomBtn) {
      this.tabRoomBtn.addEventListener('click', () => this.switchTab('room'));
    }
    if (this.tabFriendsBtn) {
      this.tabFriendsBtn.addEventListener('click', () => this.switchTab('friends'));
    }

    if (this.switchFriendBtn) {
      this.switchFriendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFriendPicker();
      });
    }

    document.addEventListener('click', (e) => {
      if (this.friendPickerDropdown && !this.friendPickerDropdown.contains(e.target) && e.target !== this.switchFriendBtn) {
        this.friendPickerDropdown.classList.add('hidden');
      }
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    audioManager.playClick();

    if (tabName === 'room') {
      if (this.tabRoomBtn) this.tabRoomBtn.classList.add('active');
      if (this.tabFriendsBtn) this.tabFriendsBtn.classList.remove('active');
      if (this.chatMessages) this.chatMessages.classList.remove('hidden');
      if (this.chatPrivateMessages) this.chatPrivateMessages.classList.add('hidden');
      if (this.privateBar) this.privateBar.classList.add('hidden');
      if (this.friendPickerDropdown) this.friendPickerDropdown.classList.add('hidden');
      if (this.chatSubEl) this.chatSubEl.textContent = 'Kênh phòng Realtime';
      if (this.chatInput) this.chatInput.placeholder = 'Nhập tin nhắn phòng...';
      if (this.chatMessages) this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    } else {
      if (this.tabFriendsBtn) this.tabFriendsBtn.classList.add('active');
      if (this.tabRoomBtn) this.tabRoomBtn.classList.remove('active');
      if (this.chatMessages) this.chatMessages.classList.add('hidden');
      if (this.chatPrivateMessages) this.chatPrivateMessages.classList.remove('hidden');
      if (this.privateBar) this.privateBar.classList.remove('hidden');
      if (this.chatSubEl) this.chatSubEl.textContent = 'Trò chuyện riêng tư 1-1';

      // Xóa chấm đỏ tin nhắn chưa đọc
      this.clearUnread();

      // Nếu chưa chọn bạn nào, tự động chọn người bạn đầu tiên nếu có
      if (!this.activeFriend) {
        const friends = friendManager.getFriends();
        if (friends.length > 0) {
          this.setActiveFriend(friends[0]);
        } else {
          this.updatePrivateTargetUI();
        }
      } else {
        this.renderPrivateMessagesForActiveFriend();
      }
    }
  }

  toggleFriendPicker() {
    if (!this.friendPickerDropdown) return;
    const isHidden = this.friendPickerDropdown.classList.contains('hidden');
    if (isHidden) {
      this.renderFriendPickerList();
      this.friendPickerDropdown.classList.remove('hidden');
    } else {
      this.friendPickerDropdown.classList.add('hidden');
    }
  }

  renderFriendPickerList() {
    if (!this.friendPickerDropdown) return;
    this.friendPickerDropdown.innerHTML = '';

    const friends = friendManager.getFriends();
    if (friends.length === 0) {
      this.friendPickerDropdown.innerHTML = '<div class="picker-empty">Chưa có bạn bè nào để chat riêng</div>';
      return;
    }

    friends.forEach(f => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `picker-friend-item ${this.activeFriend?.name === f.name ? 'selected' : ''}`;
      item.innerHTML = `
        <span class="picker-friend-icon">${f.role === 'admin' ? '👑' : f.role === 'leader' ? '⚡' : '💻'}</span>
        <span class="picker-friend-name">${f.name}</span>
        <span class="picker-friend-streak">🔥 ${f.streak || 1}d</span>
      `;
      item.addEventListener('click', () => {
        this.setActiveFriend(f);
        this.friendPickerDropdown.classList.add('hidden');
      });
      this.friendPickerDropdown.appendChild(item);
    });
  }

  setActiveFriend(friendData) {
    if (!friendData || !friendData.name) return;
    this.activeFriend = friendData;
    this.updatePrivateTargetUI();
    this.renderPrivateMessagesForActiveFriend();

    if (this.chatInput) {
      this.chatInput.placeholder = `Nhắn riêng cho ${friendData.name}...`;
    }
  }

  updatePrivateTargetUI() {
    if (this.privateTargetNameEl) {
      if (this.activeFriend) {
        this.privateTargetNameEl.textContent = this.activeFriend.name;
        this.privateTargetNameEl.className = 'chat-private-target active';
      } else {
        this.privateTargetNameEl.textContent = 'Chưa chọn bạn';
        this.privateTargetNameEl.className = 'chat-private-target empty';
      }
    }
  }

  renderPrivateMessagesForActiveFriend() {
    if (!this.chatPrivateMessages) return;

    // Giữ intro header
    const introEl = this.chatPrivateMessages.querySelector('.chat-private-intro');
    this.chatPrivateMessages.innerHTML = '';
    if (introEl) {
      this.chatPrivateMessages.appendChild(introEl);
      const descEl = introEl.querySelector('#chat-private-intro-desc');
      if (descEl && this.activeFriend) {
        descEl.textContent = `Cuộc trò chuyện riêng tư giữa bạn và ${this.activeFriend.name}. Nhắn tin mỗi ngày để giữ chuỗi Bestie Streak!`;
      }
    }

    if (!this.activeFriend) {
      const emptyNotice = document.createElement('div');
      emptyNotice.className = 'chat-private-no-friend';
      emptyNotice.innerHTML = `
        <p>Bạn chưa chọn người bạn nào để trò chuyện.</p>
        <button type="button" class="btn-select-friend-inline" id="btn-select-first-friend">Chọn Bạn Bè</button>
      `;
      const btn = emptyNotice.querySelector('#btn-select-first-friend');
      if (btn) {
        btn.addEventListener('click', () => this.toggleFriendPicker());
      }
      this.chatPrivateMessages.appendChild(emptyNotice);
      return;
    }

    const key = this.activeFriend.name.toLowerCase();
    const list = this.privateHistories.get(key) || [];

    list.forEach(msg => {
      this.appendPrivateMessageDOM(msg);
    });

    this.chatPrivateMessages.scrollTop = this.chatPrivateMessages.scrollHeight;
  }

  openPrivateChatWith(friendData) {
    if (!friendData || !friendData.name) return;
    this.openMobileChat();
    this.setActiveFriend(friendData);
    this.switchTab('friends');
    setTimeout(() => {
      if (this.chatInput) {
        this.chatInput.focus();
      }
    }, 150);
  }

  initEvents() {
    if (!this.chatForm || !this.chatInput) return;

    const stopBubble = (e) => {
      e.stopPropagation();
    };
    this.chatInput.addEventListener('keydown', stopBubble);
    this.chatInput.addEventListener('keyup', stopBubble);
    this.chatInput.addEventListener('keypress', stopBubble);

    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });

    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        this.handleSend();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          const authModal = document.getElementById('auth-modal');
          const interactiveModal = document.getElementById('interactive-modal');
          const isModalOpen = (authModal && !authModal.classList.contains('hidden')) ||
                              (interactiveModal && !interactiveModal.classList.contains('hidden'));

          if (!isModalOpen && this.chatInput) {
            e.preventDefault();
            this.openMobileChat();
            this.chatInput.focus();
          }
        }
      }
    });
  }

  initMobileEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMobileChat();
      });
    }

    if (this.mobileBackdrop) {
      this.mobileBackdrop.addEventListener('click', () => {
        this.closeMobileChat();
      });
    }
  }

  openMobileChat() {
    if (this.chatWrapper) {
      this.chatWrapper.classList.add('mobile-open');
    }
    if (this.mobileBackdrop) {
      this.mobileBackdrop.classList.remove('hidden');
    }
    setTimeout(() => {
      if (this.chatInput) {
        this.chatInput.focus();
      }
    }, 150);
  }

  closeMobileChat() {
    if (this.chatWrapper) {
      this.chatWrapper.classList.remove('mobile-open');
    }
    if (this.mobileBackdrop) {
      this.mobileBackdrop.classList.add('hidden');
    }
    if (this.stickerPopover) {
      this.stickerPopover.classList.add('hidden');
    }
    if (this.friendPickerDropdown) {
      this.friendPickerDropdown.classList.add('hidden');
    }
    if (this.chatInput) {
      this.chatInput.blur();
    }
  }

  initStickers() {
    if (!this.stickerBtn || !this.stickerPopover) return;

    this.activeStickerCategory = 'dever'; // 'dever' | 'buggy'

    const renderPopoverContent = () => {
      this.stickerPopover.innerHTML = '';

      const tabsNav = document.createElement('div');
      tabsNav.className = 'sticker-tabs-nav';

      const deverTab = document.createElement('button');
      deverTab.type = 'button';
      deverTab.className = `sticker-tab-btn ${this.activeStickerCategory === 'dever' ? 'active' : ''}`;
      deverTab.textContent = 'DEVER';
      deverTab.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeStickerCategory = 'dever';
        renderPopoverContent();
      });

      const buggyTab = document.createElement('button');
      buggyTab.type = 'button';
      buggyTab.className = `sticker-tab-btn ${this.activeStickerCategory === 'buggy' ? 'active' : ''}`;
      buggyTab.textContent = 'Buggy';
      buggyTab.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeStickerCategory = 'buggy';
        renderPopoverContent();
      });

      tabsNav.appendChild(deverTab);
      tabsNav.appendChild(buggyTab);
      this.stickerPopover.appendChild(tabsNav);

      const grid = document.createElement('div');
      grid.className = 'sticker-popover-grid';

      const count = this.activeStickerCategory === 'dever' ? 10 : 20;
      const cat = this.activeStickerCategory;

      for (let i = 1; i <= count; i++) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'sticker-select-item';
        item.title = `${cat === 'dever' ? 'DEVER Sticker' : 'Buggy Sticker'} #${i}`;
        item.innerHTML = `<img src="/assets/stickers/${cat}/${i}.png" alt="Sticker ${cat} ${i}" loading="lazy" />`;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sendSticker(cat, i);
        });
        grid.appendChild(item);
      }
      this.stickerPopover.appendChild(grid);
    };

    renderPopoverContent();

    this.stickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stickerPopover.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (this.stickerPopover && !this.stickerPopover.contains(e.target) && e.target !== this.stickerBtn) {
        this.stickerPopover.classList.add('hidden');
      }
    });
  }

  sendSticker(category, stickerId) {
    if (this.stickerPopover) {
      this.stickerPopover.classList.add('hidden');
    }
    const stickerText = `[sticker:${category}:${stickerId}]`;
    if (this.activeTab === 'room') {
      if (this.onSendMessage) {
        this.onSendMessage(stickerText);
      }
    } else {
      this.sendPrivateTextMessage(stickerText);
    }
  }

  whisperTo(name) {
    const friend = friendManager.getFriend(name);
    if (friend) {
      this.openPrivateChatWith(friend);
    } else {
      if (!this.chatInput) return;
      this.openMobileChat();
      this.switchTab('room');
      this.chatInput.value = `@${name} `;
      this.chatInput.focus();
    }
  }

  handleSend() {
    if (!this.chatInput) return;
    const raw = this.chatInput.value || '';
    const text = Array.from(raw.normalize('NFC').trim()).slice(0, 150).join('');
    if (!text) return;

    if (this.activeTab === 'room') {
      if (this.onSendMessage) {
        this.onSendMessage(text);
      }
      if (text.startsWith('@')) {
        const targetName = text.substring(1).split(' ')[0];
        if (targetName && friendManager.isFriend(targetName)) {
          friendManager.recordInteraction(targetName);
        }
      }
    } else {
      this.sendPrivateTextMessage(text);
    }

    this.chatInput.value = '';
  }

  sendPrivateTextMessage(text) {
    if (!this.activeFriend) {
      const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (worldScene && worldScene.showToast) {
        worldScene.showToast('Vui lòng chọn một người bạn để gửi tin nhắn riêng.');
      } else {
        alert('Vui lòng chọn một người bạn để gửi tin nhắn riêng.');
      }
      this.toggleFriendPicker();
      return;
    }

    const friendName = this.activeFriend.name;
    const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    const myName = worldScene?.player?.name || 'Tôi';

    if (this.onSendPrivateMessage) {
      this.onSendPrivateMessage({
        targetSocketId: this.activeFriend.id,
        targetName: friendName,
        message: text
      });
    }

    // Ghi nhận ngay vào danh sách và duy trì chuỗi Bestie Streak
    this.addPrivateMessage({
      senderName: myName,
      targetName: friendName,
      message: text,
      timestamp: Date.now(),
      isSelf: true
    });

    friendManager.recordInteraction(friendName);
  }

  /**
   * Nhận tin nhắn riêng mới (từ bạn bè gửi đến hoặc chính mình gửi đi)
   */
  addPrivateMessage({ senderName, senderRole = 'dev', targetName, message, timestamp = null, isSelf = false }) {
    const friendName = isSelf ? targetName : senderName;
    if (!friendName) return;

    const key = friendName.toLowerCase();
    if (!this.privateHistories.has(key)) {
      this.privateHistories.set(key, []);
    }

    const msgObj = {
      senderName,
      senderRole,
      targetName,
      message,
      timestamp: timestamp || Date.now(),
      isSelf: !!isSelf
    };

    const list = this.privateHistories.get(key);
    list.push(msgObj);
    this.savePrivateHistories();

    // Nếu đang ở đúng tab Bạn Bè và đúng người bạn này, render tin nhắn
    if (this.activeTab === 'friends' && this.activeFriend && this.activeFriend.name.toLowerCase() === key) {
      this.appendPrivateMessageDOM(msgObj);
      if (this.chatPrivateMessages) {
        this.chatPrivateMessages.scrollTop = this.chatPrivateMessages.scrollHeight;
      }
    } else if (!isSelf) {
      // Có tin nhắn riêng mới nhưng đang ở tab khác hoặc chat với bạn khác
      this.showUnread();
      const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (worldScene && worldScene.showToast) {
        worldScene.showToast(`Tin nhắn riêng mới từ ${senderName}: ${message.slice(0, 30)}...`);
      }
      if (audioManager && audioManager.playClick) {
        audioManager.playClick();
      }
    }
  }

  appendPrivateMessageDOM({ senderName, senderRole = 'dev', message, timestamp, isSelf }) {
    if (!this.chatPrivateMessages) return;

    const normalizedMsg = (message || '').normalize('NFC');
    const timeStr = timestamp
      ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const itemDiv = document.createElement('div');
    itemDiv.className = `chat-message-item private-msg ${isSelf ? 'self' : 'other'}`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'chat-meta';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = isSelf ? 'Bạn' : senderName;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.textContent = timeStr;

    const pmBadge = document.createElement('span');
    pmBadge.className = 'chat-pm-badge';
    pmBadge.textContent = 'Tin riêng';

    if (isSelf) {
      metaDiv.appendChild(timeSpan);
      metaDiv.appendChild(authorSpan);
      metaDiv.appendChild(pmBadge);
    } else {
      metaDiv.appendChild(pmBadge);
      metaDiv.appendChild(authorSpan);
      metaDiv.appendChild(timeSpan);
    }

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'chat-body';

    const catStickerMatch = normalizedMsg.match(/^\[sticker:(dever|buggy):(\d+)\]$/);
    if (catStickerMatch) {
      const cat = catStickerMatch[1];
      const stickerNum = parseInt(catStickerMatch[2], 10);
      const stickerImg = document.createElement('img');
      stickerImg.src = `/assets/stickers/${cat}/${stickerNum}.png`;
      stickerImg.className = 'chat-sticker-img';
      stickerImg.alt = `Sticker ${cat} ${stickerNum}`;
      bodyDiv.appendChild(stickerImg);
    } else {
      bodyDiv.textContent = normalizedMsg;
    }

    itemDiv.appendChild(metaDiv);
    itemDiv.appendChild(bodyDiv);

    this.chatPrivateMessages.appendChild(itemDiv);
  }

  showUnread() {
    this.unreadCount++;
    if (this.unreadDot) {
      this.unreadDot.classList.remove('hidden');
    }
  }

  clearUnread() {
    this.unreadCount = 0;
    if (this.unreadDot) {
      this.unreadDot.classList.add('hidden');
    }
  }

  /**
   * Thêm tin nhắn phòng công khai (Room Chat)
   */
  addMessage({ senderId, senderName, message, role = 'guest', timestamp = null, isSelf = false }) {
    if (!this.chatMessages) return;

    const normalizedMsg = (message || '').normalize('NFC');
    const timeStr = timestamp
      ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const itemDiv = document.createElement('div');
    itemDiv.className = `chat-message-item ${isSelf ? 'self' : 'other'}`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'chat-meta';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = (senderName || 'Anonymous').normalize('NFC');

    if (!isSelf) {
      authorSpan.classList.add('chat-author-clickable');
      authorSpan.title = 'Bấm để xem hồ sơ và kết bạn';
      authorSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        const worldScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        if (worldScene && worldScene.playerProfileModal) {
          worldScene.playerProfileModal.show({
            id: senderId || senderName,
            name: senderName,
            role: role
          });
        }
      });

      if (friendManager.isFriend(senderName)) {
        friendManager.recordInteraction(senderName);
      }
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.textContent = timeStr;

    const roleBadge = document.createElement('span');
    roleBadge.className = `chat-role-badge ${role}`;
    roleBadge.textContent = role === 'admin' ? 'BQT' : role === 'member' ? 'CLB' : 'GUEST';

    if (isSelf) {
      metaDiv.appendChild(timeSpan);
      metaDiv.appendChild(authorSpan);
      metaDiv.appendChild(roleBadge);
    } else {
      metaDiv.appendChild(roleBadge);
      metaDiv.appendChild(authorSpan);
      metaDiv.appendChild(timeSpan);
    }

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'chat-body';

    const catStickerMatch = normalizedMsg.match(/^\[sticker:(dever|buggy):(\d+)\]$/);
    const legacyStickerMatch = normalizedMsg.match(/^\[sticker:(\d+)\]$/);

    if (catStickerMatch) {
      const cat = catStickerMatch[1];
      const stickerNum = parseInt(catStickerMatch[2], 10);
      const maxCount = cat === 'dever' ? 10 : 20;
      if (stickerNum >= 1 && stickerNum <= maxCount) {
        const stickerImg = document.createElement('img');
        stickerImg.src = `/assets/stickers/${cat}/${stickerNum}.png`;
        stickerImg.className = 'chat-sticker-img';
        stickerImg.alt = `${cat === 'dever' ? 'DEVER' : 'Buggy'} Sticker ${stickerNum}`;
        bodyDiv.appendChild(stickerImg);
      } else {
        bodyDiv.textContent = normalizedMsg;
      }
    } else if (legacyStickerMatch) {
      const stickerNum = parseInt(legacyStickerMatch[1], 10);
      if (stickerNum >= 1 && stickerNum <= 10) {
        const stickerImg = document.createElement('img');
        stickerImg.src = `/assets/stickers/dever/${stickerNum}.png`;
        stickerImg.className = 'chat-sticker-img';
        stickerImg.alt = `DEVER Sticker ${stickerNum}`;
        bodyDiv.appendChild(stickerImg);
      } else {
        bodyDiv.textContent = normalizedMsg;
      }
    } else {
      bodyDiv.textContent = normalizedMsg;
    }

    itemDiv.appendChild(metaDiv);
    itemDiv.appendChild(bodyDiv);

    this.chatMessages.appendChild(itemDiv);

    if (this.activeTab === 'room') {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }
}
