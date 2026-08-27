/**
 * ChatBox: Điều khiển giao diện Chat HTML, danh sách tin nhắn và phím tắt Enter.
 */
export class ChatBox {
  /**
   * @param {Object} options
   * @param {Function} options.onSendMessage - Callback gửi tin nhắn
   */
  constructor({ onSendMessage }) {
    this.onSendMessage = onSendMessage;
    this.messagesContainer = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input');
    this.chatForm = document.getElementById('chat-form');
    this.chatWrapper = document.getElementById('chat-wrapper');

    this.initEvents();
  }

  initEvents() {
    if (!this.chatForm || !this.chatInput) return;

    // Gửi tin nhắn khi submit form (nhấn Enter hoặc bấm nút Gửi)
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });

    // Lắng nghe phím Enter toàn cục để nhanh chóng kích hoạt ô chat
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const isFocused = document.activeElement === this.chatInput;
        if (!isFocused) {
          // Nếu chưa focus ô chat và không đang trong modal khác -> Focus vào chat
          const modal = document.getElementById('nickname-modal');
          if (!modal || modal.classList.contains('hidden')) {
            e.preventDefault();
            this.chatInput.focus();
          }
        }
      } else if (e.key === 'Escape') {
        if (document.activeElement === this.chatInput) {
          this.chatInput.blur();
        }
      }
    });
  }

  handleSend() {
    const text = this.chatInput.value.trim();
    if (!text) {
      this.chatInput.blur();
      return;
    }

    if (this.onSendMessage) {
      this.onSendMessage(text);
    }

    this.chatInput.value = '';
    this.chatInput.blur(); // Trả lại quyền điều khiển di chuyển cho game
  }

  addMessage({ name, message, isSelf = false, timestamp = Date.now() }) {
    if (!this.messagesContainer) return;

    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgEl = document.createElement('div');
    msgEl.className = `chat-item ${isSelf ? 'self' : 'other'}`;

    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = name;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.textContent = timeStr;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'chat-body';
    bodyDiv.textContent = message;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'chat-meta';
    headerDiv.appendChild(authorSpan);
    headerDiv.appendChild(timeSpan);

    msgEl.appendChild(headerDiv);
    msgEl.appendChild(bodyDiv);

    this.messagesContainer.appendChild(msgEl);

    // Tự động cuộn xuống cuối
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
