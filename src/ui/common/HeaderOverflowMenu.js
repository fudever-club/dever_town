/**
 * HeaderOverflowMenu: gom các nút header phụ vào menu "⋯" (2026-10-09).
 * - Desktop: click toggle mở dropdown.
 * - Mobile: touch tương tự.
 * - Đóng khi: click ngoài menu, phím Esc, hoặc chọn một mục.
 * - Các nút giữ nguyên DOM ID nên mọi wiring hiện có (WorldScene, QuestModal,
 *   EmoteBar...) không đổi.
 */
export class HeaderOverflowMenu {
  constructor() {
    this.toggleBtn = document.getElementById('header-overflow-btn');
    this.menu = document.getElementById('header-overflow-menu');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.toggleBtn || !this.menu) return;

    this.toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Click / chạm ngoài menu -> đóng
    document.addEventListener('pointerdown', (e) => {
      if (!this.isOpen) return;
      if (this.menu.contains(e.target)) return;
      if (this.toggleBtn.contains(e.target)) return;
      this.close();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Chọn một mục -> đóng menu (handler riêng của nút vẫn chạy trước)
    this.menu.addEventListener('click', () => {
      this.close();
    });

    // Neo lại vị trí khi resize / xoay màn hình
    window.addEventListener('resize', () => {
      if (this.isOpen) this.anchor();
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.menu) return;
    this.isOpen = true;
    this.menu.classList.remove('hidden');
    this.menu.setAttribute('aria-hidden', 'false');
    this.toggleBtn.classList.add('active');
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.anchor();
  }

  close() {
    if (!this.menu) return;
    this.isOpen = false;
    this.menu.classList.add('hidden');
    this.menu.setAttribute('aria-hidden', 'true');
    this.toggleBtn.classList.remove('active');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
  }

  /**
   * Neo menu fixed ngay dưới nút toggle, căn phải theo nút.
   * (giống cách bell-dropdown thoát khỏi overflow-x của .header-actions)
   */
  anchor() {
    if (!this.toggleBtn || !this.menu) return;
    const r = this.toggleBtn.getBoundingClientRect();
    this.menu.style.top = `${Math.round(r.bottom + 8)}px`;
    this.menu.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
    this.menu.style.left = 'auto';
  }
}
