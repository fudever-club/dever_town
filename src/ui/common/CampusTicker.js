/**
 * CampusTicker: Tin tức & sự kiện DEVER TOWN (redesigned 2026-10-09)
 * - Không còn marquee ở footer (footer đã slim).
 * - Thông báo mới -> toast popup + lịch sử trong chuông header (bell dropdown).
 */
export class CampusTicker {
  constructor() {
    this.messages = [
      'Bước qua cổng Portal màu tím để khám phá trọn vẹn 9 phân khu DEVER TOWN!',
      'Thử thách kiến thức lập trình & toán nhẩm với Đấu Trí Siêu Tốc [Phím Z]!',
      'Cầu may mắn học kỳ mới với Linh Vật Cóc Vàng FUDA tại Sảnh Alpha!',
      'Thưởng thức cà phê muối Đà Nẵng & giai điệu Lo-Fi tại Căn Tin & Cafe!',
      'Khám phá trọn bộ 8 danh hiệu thành tựu độc bản để nhận điểm thưởng!',
      'Trang bị MacBook M3, Cóc Vàng hay Bàn Phím Cơ từ Túi Đồ [Phím I]!'
    ];
    // history: [{ text, time, unread }]
    this.history = this.messages.map((text) => ({ text, time: Date.now(), unread: false }));
    this.unreadCount = 0;

    this.bellBtn = document.getElementById('header-bell-btn');
    this.bellDropdown = document.getElementById('bell-dropdown');
    this.bellList = document.getElementById('bell-dropdown-list');
    this.bellDot = document.getElementById('bell-unread-dot');

    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.renderList();

    if (this.bellBtn) {
      this.bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      if (
        this.bellDropdown &&
        !this.bellDropdown.classList.contains('hidden') &&
        !this.bellDropdown.contains(e.target) &&
        e.target !== this.bellBtn &&
        !this.bellBtn?.contains(e.target)
      ) {
        this.bellDropdown.classList.add('hidden');
      }
    });
  }

  toggleDropdown() {
    if (!this.bellDropdown) return;
    const willOpen = this.bellDropdown.classList.contains('hidden');
    if (willOpen && this.bellBtn) {
      // position:fixed dropdown — anchor under the bell button
      const r = this.bellBtn.getBoundingClientRect();
      this.bellDropdown.style.top = `${Math.round(r.bottom + 8)}px`;
      this.bellDropdown.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
    }
    this.bellDropdown.classList.toggle('hidden');
    if (willOpen) {
      this.clearUnread();
    }
  }

  clearUnread() {
    this.unreadCount = 0;
    this.history.forEach((h) => { h.unread = false; });
    if (this.bellDot) this.bellDot.classList.add('hidden');
    this.renderList();
  }

  renderList() {
    if (!this.bellList) return;
    this.bellList.innerHTML = '';

    if (this.history.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'bell-empty';
      empty.textContent = 'Chưa có thông báo nào.';
      this.bellList.appendChild(empty);
      return;
    }

    this.history.slice(0, 20).forEach((item) => {
      const row = document.createElement('div');
      row.className = `bell-item ${item.unread ? 'unread' : ''}`;

      const textSpan = document.createElement('span');
      textSpan.textContent = item.text;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'bell-item-time';
      try {
        timeSpan.textContent = new Date(item.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        timeSpan.textContent = '';
      }

      row.appendChild(textSpan);
      row.appendChild(timeSpan);
      this.bellList.appendChild(row);
    });
  }

  showToast(text) {
    try {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (scene && typeof scene.showToast === 'function') {
        scene.showToast(text);
      }
    } catch (e) {}
  }

  /**
   * Đẩy một thông báo mới: toast popup + thêm vào lịch sử chuông + chấm đỏ.
   * @param {string} msg
   */
  broadcast(msg) {
    if (!msg) return;
    const text = String(msg);
    this.history.unshift({ text, time: Date.now(), unread: true });
    if (this.history.length > 30) this.history.length = 30;
    this.unreadCount++;
    if (this.bellDot) this.bellDot.classList.remove('hidden');
    this.renderList();
    this.showToast(text);
  }

  destroy() {
    // Không còn timer/footer DOM — giữ API để tương thích.
    if (this.bellDropdown) this.bellDropdown.classList.add('hidden');
  }
}
