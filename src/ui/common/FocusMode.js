/**
 * FocusMode: chế độ tập trung — ẩn toàn bộ HUD chrome (2026-10-09).
 * Phím H bật/tắt, Esc thoát. Pure CSS class toggle trên body.
 * Không kích hoạt khi đang gõ phím trong input/textarea hoặc có modal mở
 * (để không xung đột với phím H "gợi ý" của minigame Match-3).
 */
export class FocusMode {
  constructor() {
    this.enabled = false;
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.code === 'KeyH') {
        if (this.isAnyModalOpen()) return;
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.enabled) {
        // Esc thoát focus mode (ưu tiên trước các handler khác khi đang ở focus mode)
        if (!this.isAnyModalOpen()) {
          this.setEnabled(false);
        }
      }
    });
  }

  isAnyModalOpen() {
    const modals = document.querySelectorAll('.modal-backdrop');
    for (const m of modals) {
      if (!m.classList.contains('hidden')) return true;
    }
    return false;
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  setEnabled(on) {
    this.enabled = !!on;
    document.body.classList.toggle('focus-mode', this.enabled);
  }
}
