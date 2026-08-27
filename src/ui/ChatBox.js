export class ChatBox {
  /**
   * @param {Object} options
   * @param {Function} options.onSendMessage
   */
  constructor({ onSendMessage } = {}) {
    this.onSendMessage = onSendMessage;
    this.chatForm = document.getElementById('chat-form');
    this.chatInput = document.getElementById('chat-input');
    this.chatMessages = document.getElementById('chat-messages');
    this.stickerBtn = document.getElementById('chat-sticker-btn');
    this.stickerPopover = document.getElementById('chat-sticker-popover');

    this.initEvents();
    this.initStickers();
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
            this.chatInput.focus();
          }
        }
      }
    });
  }

  initStickers() {
    if (!this.stickerBtn || !this.stickerPopover) return;

    // Render 11 stickers
    this.stickerPopover.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'sticker-popover-header';
    header.textContent = 'Bộ Sticker FU-DEVER';
    this.stickerPopover.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'sticker-popover-grid';

    for (let i = 1; i <= 11; i++) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'sticker-select-item';
      item.title = `Sticker #${i}`;
      item.innerHTML = `<img src="/assets/stickers/${i}.png" alt="Sticker ${i}" loading="lazy" />`;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sendSticker(i);
      });
      grid.appendChild(item);
    }
    this.stickerPopover.appendChild(grid);

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

  sendSticker(stickerId) {
    if (this.stickerPopover) {
      this.stickerPopover.classList.add('hidden');
    }
    if (this.onSendMessage) {
      this.onSendMessage(`[sticker:${stickerId}]`);
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
      this.chatInput.blur();
    }
  }

  /**
   * Thêm tin nhắn mới vào danh sách chat
   */
  addMessage({ name, role, avatarId, message, isSelf = false, timestamp = Date.now() }) {
    if (!this.chatMessages) return;

    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const normalizedName = (name || 'Thành viên').normalize('NFC');
    const normalizedMsg = (message || '').normalize('NFC');

    const itemDiv = document.createElement('div');
    itemDiv.className = `chat-item ${isSelf ? 'self' : 'other'}`;

    const roleClass = role || 'guest';
    const roleLabel = role === 'admin' ? 'Admin' :
                      role === 'leader' ? 'Leader' :
                      role === 'dev' ? 'Dev' : 'Khách';

    // Xây dựng DOM an toàn chống XSS
    const metaDiv = document.createElement('div');
    metaDiv.className = 'chat-meta';

    const roleBadge = document.createElement('span');
    roleBadge.className = `role-tag ${roleClass}`;
    roleBadge.textContent = roleLabel;

    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = normalizedName;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.textContent = timeStr;

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

    // Kiểm tra tin nhắn Sticker
    const stickerMatch = normalizedMsg.match(/^\[sticker:(\d+)\]$/);
    if (stickerMatch) {
      const stickerNum = parseInt(stickerMatch[1], 10);
      if (stickerNum >= 1 && stickerNum <= 11) {
        const stickerImg = document.createElement('img');
        stickerImg.src = `/assets/stickers/${stickerNum}.png`;
        stickerImg.className = 'chat-sticker-img';
        stickerImg.alt = `Sticker ${stickerNum}`;
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
