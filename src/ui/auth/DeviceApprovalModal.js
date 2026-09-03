import { audioManager } from '../../utils/AudioManager.js';

export class DeviceApprovalModal {
  constructor({ onDecision } = {}) {
    this.onDecision = onDecision;
    this.modalEl = document.getElementById('device-approval-modal');
    this.ipEl = document.getElementById('approval-device-ip');
    this.timeEl = document.getElementById('approval-device-time');
    this.agentEl = document.getElementById('approval-device-agent');
    this.allowBtn = document.getElementById('approval-btn-allow');
    this.denyBtn = document.getElementById('approval-btn-deny');
    this.currentRequestId = null;

    this.init();
  }

  init() {
    if (this.allowBtn) {
      this.allowBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.respond(true);
      });
    }

    if (this.denyBtn) {
      this.denyBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.respond(false);
      });
    }
  }

  show({ requestId, ip, time, userAgent, deviceType }) {
    this.currentRequestId = requestId;
    if (this.ipEl) this.ipEl.textContent = ip || '127.0.0.1';
    if (this.timeEl) this.timeEl.textContent = time || new Date().toLocaleTimeString('vi-VN');
    if (this.agentEl) this.agentEl.textContent = deviceType || userAgent || 'Thiết bị khác';

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      audioManager.playClick();
    }
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
    }
    this.currentRequestId = null;
  }

  respond(approved) {
    const reqId = this.currentRequestId;
    this.hide();

    if (reqId && this.onDecision) {
      this.onDecision({ requestId: reqId, approved });
    }
  }

  showWaitingNotice(message) {
    let waitingEl = document.getElementById('device-waiting-overlay');
    if (!waitingEl) {
      waitingEl = document.createElement('div');
      waitingEl.id = 'device-waiting-overlay';
      waitingEl.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.92);backdrop-filter:blur(8px);z-index:10000020;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Outfit,sans-serif;';
      waitingEl.innerHTML = `
        <div style="text-align:center;padding:32px;background:rgba(30,41,59,0.95);border:1px solid rgba(242,111,33,0.5);border-radius:16px;max-width:420px;box-shadow:0 10px 40px rgba(0,0,0,0.8);">
          <div style="width:40px;height:40px;border:3px solid rgba(242,111,33,0.3);border-top-color:#f26f21;border-radius:50%;margin:0 auto 16px;animation:spinNeonRing 1s linear infinite;"></div>
          <h3 style="font-size:1.25rem;font-weight:800;color:#fbbf24;margin-bottom:10px;">Chờ Xác Nhận Thiết Bị</h3>
          <p id="device-waiting-msg" style="font-size:0.9rem;color:#cbd5e1;line-height:1.6;margin-bottom:18px;">
            ${message || 'Tài khoản của bạn đang mở trên thiết bị khác. Vui lòng bấm Xác nhận trên thiết bị đó để chuyển sang máy này.'}
          </p>
          <div style="font-size:0.8rem;color:#94a3b8;">Đang kết nối bảo mật...</div>
        </div>
      `;
      document.body.appendChild(waitingEl);
    } else {
      waitingEl.style.display = 'flex';
      const msgEl = document.getElementById('device-waiting-msg');
      if (msgEl && message) msgEl.textContent = message;
    }
  }

  hideWaitingNotice() {
    const waitingEl = document.getElementById('device-waiting-overlay');
    if (waitingEl) {
      waitingEl.style.display = 'none';
    }
  }
}
