import { audioManager } from '../../utils/AudioManager.js';

export class OnboardingGuide {
  constructor() {
    this.overlay = document.getElementById('onboarding-guide-overlay');
    this.closeBtn = document.getElementById('onboarding-close-btn');
    /** Optional hook fired when the welcome card is dismissed (used to chain the coach-marks tour). */
    this.onDismiss = null;

    this.init();
  }

  init() {
    if (!this.overlay) return;

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.dismiss());
    }

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.dismiss();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (this.isOpen() && (e.key === 'Escape' || e.key === 'Enter')) {
        this.dismiss();
      }
    });
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  wasSeen() {
    try {
      return localStorage.getItem('dever_onboarding_seen') === 'true';
    } catch (e) {
      return true;
    }
  }

  checkAndShow() {
    try {
      if (!this.wasSeen() && this.overlay) {
        // Hiện sau 800ms khi vừa vào game
        setTimeout(() => {
          this.overlay.classList.remove('hidden');
        }, 800);
        return true;
      }
    } catch (e) {
      // LocalStorage access safeguard
    }
    return false;
  }

  dismiss() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    audioManager.playClick();
    try {
      localStorage.setItem('dever_onboarding_seen', 'true');
    } catch (e) {}
    if (typeof this.onDismiss === 'function') {
      try {
        this.onDismiss();
      } catch (e) {}
    }
  }
}
