/**
 * HelpOverlay: hộp thoại "Phím tắt & Hướng dẫn" (2026-10-09).
 * Mở bằng nút "?" ở footer. Đóng bằng backdrop / nút X / Esc.
 */
export class HelpOverlay {
  constructor() {
    this.overlay = document.getElementById('help-overlay');
    this.closeBtn = document.getElementById('help-overlay-close');
    this.helpBtn = document.getElementById('footer-help-btn');
    this.init();
  }

  init() {
    if (!this.overlay) return;

    if (this.helpBtn) {
      this.helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.show();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  show() {
    if (!this.overlay) return;
    this.overlay.classList.remove('hidden');
    this.overlay.setAttribute('aria-hidden', 'false');
  }

  hide() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    this.overlay.setAttribute('aria-hidden', 'true');
  }
}
