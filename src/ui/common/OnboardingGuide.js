import { audioManager } from '../../utils/AudioManager.js';

export class OnboardingGuide {
  constructor() {
    this.overlay = document.getElementById('onboarding-guide-overlay');
    this.closeBtn = document.getElementById('onboarding-close-btn');

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

  checkAndShow() {
    try {
      const hasSeen = localStorage.getItem('dever_onboarding_seen');
      if (!hasSeen && this.overlay) {
        // Hiện sau 800ms khi vừa vào game
        setTimeout(() => {
          this.overlay.classList.remove('hidden');
        }, 800);
      }
    } catch (e) {
      // LocalStorage access safeguard
    }
  }

  dismiss() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    audioManager.playClick();
    try {
      localStorage.setItem('dever_onboarding_seen', 'true');
    } catch (e) {}
  }
}
