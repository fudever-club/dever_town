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

    this.initEvents();
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
    bodyDiv.textContent = normalizedMsg;

    itemDiv.appendChild(metaDiv);
    itemDiv.appendChild(bodyDiv);

    this.chatMessages.appendChild(itemDiv);

    // Tự động cuộn xuống tin nhắn mới nhất
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}
