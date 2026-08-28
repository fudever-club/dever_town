import { audioManager } from '../utils/AudioManager.js';

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

  show({ requestId, ip, time, userAgent }) {
    this.currentRequestId = requestId;
    if (this.ipEl) this.ipEl.textContent = ip || '127.0.0.1';
    if (this.timeEl) this.timeEl.textContent = time || new Date().toLocaleTimeString('vi-VN');
    if (this.agentEl) this.agentEl.textContent = userAgent || 'Trình duyệt Web';

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
}
