/**
 * ChatBox: Điều khiển giao diện Chat HTML, hiển thị Role Badges và phím tắt Enter.
 */
export class ChatBox {
  /**
   * @param {Object} options
   * @param {Function} options.onSendMessage
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

    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSend();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const isFocused = document.activeElement === this.chatInput;
        if (!isFocused) {
          const authModal = document.getElementById('auth-modal');
          if (!authModal || authModal.classList.contains('hidden')) {
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
    this.chatInput.blur();
  }

  getRoleBadgeHTML(role) {
    switch (role) {
      case 'admin':
        return '<span class="role-tag admin">👑 Admin</span>';
      case 'leader':
        return '<span class="role-tag leader">⭐ Leader</span>';
      case 'dev':
        return '<span class="role-tag dev">💻 Dev</span>';
      default:
        return '<span class="role-tag guest">👤 Khách</span>';
    }
  }

  addMessage({ name, message, role = 'dev', isSelf = false, timestamp = Date.now() }) {
    if (!this.messagesContainer) return;

    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgEl = document.createElement('div');
    msgEl.className = `chat-item ${isSelf ? 'self' : 'other'}`;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'chat-meta';

    // Role badge
    metaDiv.innerHTML = `
      ${this.getRoleBadgeHTML(role)}
      <span class="chat-author">${this.escapeHTML(name)}</span>
      <span class="chat-time">${timeStr}</span>
    `;

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'chat-body';
    bodyDiv.textContent = message;

    msgEl.appendChild(metaDiv);
    msgEl.appendChild(bodyDiv);

    this.messagesContainer.appendChild(msgEl);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}
