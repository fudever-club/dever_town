/**
 * CampusTicker: Thanh tin tức & sự kiện trực tiếp DEVER TOWN (Live Campus Ticker)
 * Hiển thị luân phiên các mẹo khám phá, sự kiện trường và tin vui CLB
 */
export class CampusTicker {
  constructor() {
    this.messages = [
      '💡 Bước qua cổng Portal màu tím để khám phá trọn vẹn 9 phân khu DEVER TOWN!',
      '⚡ Thử thách kiến thức lập trình & toán nhẩm với Đấu Trí Siêu Tốc [Phím Z / Nút ⚡]!',
      '🐸 Cầu may mắn học kỳ mới với Linh Vật Cóc Vàng FUDA tại Sảnh Alpha!',
      '☕ Thưởng thức cà phê muối Đà Nẵng & giai điệu Lo-Fi tại Căn Tin & Cafe!',
      '🏆 Khám phá trọn bộ 8 danh hiệu thành tựu độc bản để nhận điểm thưởng!',
      '🎒 Trang bị MacBook M3, Cóc Vàng hay Bàn Phím Cơ từ Túi Đồ [Phím I]!'
    ];
    this.currentIndex = 0;
    this.timer = null;
    this.el = null;

    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    // Tìm footer để gắn ticker
    const footerLeft = document.querySelector('.footer-left');
    if (!footerLeft) return;

    this.container = document.createElement('div');
    this.container.className = 'campus-ticker-wrapper';
    this.container.innerHTML = `
      <span class="ticker-badge">LIVE</span>
      <span class="ticker-text" id="campus-ticker-text">${this.messages[0]}</span>
    `;

    footerLeft.appendChild(this.container);
    this.textEl = this.container.querySelector('#campus-ticker-text');

    // Chuyển tin mỗi 6.5s
    this.startRotation();
  }

  startRotation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), 6500);
  }

  next() {
    if (!this.textEl) return;
    this.currentIndex = (this.currentIndex + 1) % this.messages.length;

    this.textEl.classList.add('fade-out');
    setTimeout(() => {
      if (this.textEl) {
        this.textEl.textContent = this.messages[this.currentIndex];
        this.textEl.classList.remove('fade-out');
      }
    }, 280);
  }

  /**
   * Đẩy một thông báo khẩn cấp / tức thì lên ticker (ví dụ khi ai đó mở thành tựu)
   * @param {string} msg
   */
  broadcast(msg) {
    if (!this.textEl) return;
    this.textEl.textContent = msg;
    this.startRotation();
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
