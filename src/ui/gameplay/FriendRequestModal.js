/**
 * FriendRequestModal: Modal thông báo khi nhận được lời mời kết bạn từ người chơi khác.
 * Cho phép người nhận quyền Đồng Ý (Accept) hoặc Từ Chối (Decline).
 */
import { audioManager } from '../../utils/AudioManager.js';

export class FriendRequestModal {
  constructor({ onAccept, onDecline } = {}) {
    this.onAccept = onAccept;
    this.onDecline = onDecline;
    this.currentRequest = null;
    this.timer = null;
    this.countdownSeconds = 45;
    this.countdownInterval = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'friend-request-modal';
    this.modalEl.className = 'friend-request-overlay hidden';

    this.modalEl.innerHTML = `
      <div class="friend-request-card">
        <div class="friend-request-header">
          <div class="request-tag">LỜI MỜI KẾT BẠN</div>
          <span class="request-timer-badge" id="request-timer-badge">45s</span>
        </div>

        <div class="friend-request-body">
          <div class="request-user-row">
            <div class="request-avatar-circle" id="request-avatar">🧑‍💻</div>
            <div class="request-user-info">
              <div class="request-name-row">
                <h3 id="request-sender-name" class="request-sender-name">Người chơi</h3>
                <span id="request-sender-role" class="request-role-badge">Dev</span>
              </div>
              <p class="request-sub-text">Đang ở cùng bạn trong thế giới DEVER TOWN</p>
            </div>
          </div>

          <div class="request-invitation-box">
            <p class="invitation-text" id="request-invitation-text">
              muốn kết bạn cùng bạn! Cùng nhau duy trì chuỗi <strong>Bestie Streak 🔥</strong> mỗi ngày và ấp nở <strong>Thú cưng Buggy</strong> đồng hành nhé!
            </p>
          </div>
        </div>

        <div class="friend-request-actions">
          <button type="button" class="btn-friend-accept" id="btn-friend-accept">
            Đồng Ý Kết Bạn
          </button>
          <button type="button" class="btn-friend-decline" id="btn-friend-decline">
            Từ Chối
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);
  }

  bindEvents() {
    const acceptBtn = this.modalEl.querySelector('#btn-friend-accept');
    const declineBtn = this.modalEl.querySelector('#btn-friend-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        this.accept();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        this.decline();
      });
    }
  }

  show(requestData) {
    if (!requestData) return;
    this.currentRequest = requestData;

    const nameEl = this.modalEl.querySelector('#request-sender-name');
    const roleEl = this.modalEl.querySelector('#request-sender-role');
    const avatarEl = this.modalEl.querySelector('#request-avatar');
    const timerBadge = this.modalEl.querySelector('#request-timer-badge');

    if (nameEl) nameEl.textContent = requestData.fromName || 'Thành viên DEVER';
    if (roleEl) {
      const role = requestData.fromRole || 'dev';
      roleEl.textContent = role === 'admin' ? 'BQT Admin' : role === 'leader' ? 'Leader' : role === 'dev' ? 'Dev' : 'Khách';
      roleEl.className = `request-role-badge ${role}`;
    }

    if (avatarEl) {
      const role = requestData.fromRole || 'dev';
      avatarEl.textContent = role === 'admin' ? '👑' : role === 'leader' ? '⚡' : '💻';
    }

    this.modalEl.classList.remove('hidden');
    if (audioManager && audioManager.playClick) {
      audioManager.playClick();
    }

    // Đếm ngược 45s
    this.countdownSeconds = 45;
    if (timerBadge) timerBadge.textContent = `${this.countdownSeconds}s`;

    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      if (timerBadge) timerBadge.textContent = `${this.countdownSeconds}s`;
      if (this.countdownSeconds <= 0) {
        this.decline();
      }
    }, 1000);
  }

  hide() {
    clearInterval(this.countdownInterval);
    this.modalEl.classList.add('hidden');
    this.currentRequest = null;
  }

  accept() {
    const req = this.currentRequest;
    this.hide();
    if (req && this.onAccept) {
      this.onAccept(req);
    }
  }

  decline() {
    const req = this.currentRequest;
    this.hide();
    if (req && this.onDecline) {
      this.onDecline(req);
    }
  }
}
