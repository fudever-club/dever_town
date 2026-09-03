export class ChatBox {
  /**
   * @param {Object} options
   * @param {Function} options.onSendMessage
   */
  constructor({ onSendMessage } = {}) {
    this.onSendMessage = onSendMessage;
    this.chatWrapper = document.getElementById('chat-wrapper');
    this.chatForm = document.getElementById('chat-form');
    this.chatInput = document.getElementById('chat-input');
    this.chatMessages = document.getElementById('chat-messages');
    this.stickerBtn = document.getElementById('chat-sticker-btn');
    this.stickerPopover = document.getElementById('chat-sticker-popover');
    this.closeBtn = document.getElementById('chat-mobile-close-btn');
    this.mobileBackdrop = document.getElementById('chat-mobile-backdrop');

    this.initEvents();
    this.initStickers();
    this.initMobileEvents();
  }

  initEvents() {
    if (!this.chatForm || !this.chatInput) return;

    // Ngăn chặn sự kiện phím từ ô chat lan ra ngoài window / canvas
    const stopBubble = (e) => {
      e.stopPropagation();
    };
    this.chatInput.addEventListener('keydown', stopBubble);
    this.chatInput.addEventListener('keyup', stopBubble);
    this.chatInput.addEventListener('keypress', stopBubble);

    // Bắt sự kiện submit form
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });

    // Lắng nghe phím Enter và kiểm tra IME Composition (tránh gửi nhầm khi đang gõ dấu tiếng Việt)
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Phím Enter toàn cục để focus nhanh vào chatbox khi đang chơi game
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
    // 1. Nút đóng Chat trên Mobile
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeMobileChat();
      });
    }

    // 2. Backdrop đóng chat khi click ra ngoài
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
    if (this.chatInput) {
      this.chatInput.blur();
    }
  }

  toggleMobileChat() {
    if (this.chatWrapper && this.chatWrapper.classList.contains('mobile-open')) {
      this.closeMobileChat();
    } else {
      this.openMobileChat();
    }
  }

  initStickers() {
    if (!this.stickerBtn || !this.stickerPopover) return;

    this.activeStickerCategory = 'dever'; // 'dever' | 'buggy'

    const renderPopoverContent = () => {
      this.stickerPopover.innerHTML = '';

      // Tabs Header
      const tabsNav = document.createElement('div');
      tabsNav.className = 'sticker-tabs-nav';

      const deverTab = document.createElement('button');
      deverTab.type = 'button';
      deverTab.className = `sticker-tab-btn ${this.activeStickerCategory === 'dever' ? 'active' : ''}`;
      deverTab.textContent = '🦊 DEVER (11)';
      deverTab.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeStickerCategory = 'dever';
        renderPopoverContent();
      });

      const buggyTab = document.createElement('button');
      buggyTab.type = 'button';
      buggyTab.className = `sticker-tab-btn ${this.activeStickerCategory === 'buggy' ? 'active' : ''}`;
      buggyTab.textContent = '🐞 Buggy (20)';
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

      const count = this.activeStickerCategory === 'dever' ? 11 : 20;
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

    // Toggle popover
    this.stickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stickerPopover.classList.toggle('hidden');
    });

    // Close when clicking outside
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
    if (this.onSendMessage) {
      this.onSendMessage(`[sticker:${category}:${stickerId}]`);
    }
  }

  handleSend() {
    if (!this.chatInput) return;
    const raw = this.chatInput.value || '';
    const text = Array.from(raw.normalize('NFC').trim()).slice(0, 140).join('');

    if (text.length > 0) {
      if (this.onSendMessage) {
        this.onSendMessage(text);
      }
      this.chatInput.value = '';
    }
  }

  /**
   * Thêm tin nhắn mới vào danh sách chat
   */
  addMessage({ senderName, message, role = 'guest', timestamp = null, isSelf = false }) {
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

    // Kiểm tra tin nhắn Sticker (hỗ trợ cả [sticker:dever:x], [sticker:buggy:x] và format cũ [sticker:x])
    const catStickerMatch = normalizedMsg.match(/^\[sticker:(dever|buggy):(\d+)\]$/);
    const legacyStickerMatch = normalizedMsg.match(/^\[sticker:(\d+)\]$/);

    if (catStickerMatch) {
      const cat = catStickerMatch[1];
      const stickerNum = parseInt(catStickerMatch[2], 10);
      const maxCount = cat === 'dever' ? 11 : 20;
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
      if (stickerNum >= 1 && stickerNum <= 11) {
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

    // Auto-scroll xuống dòng cuối cùng
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}
