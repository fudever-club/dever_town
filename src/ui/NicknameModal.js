/**
 * NicknameModal: Modal cho phép người chơi đặt tên trước khi vào thị trấn hoặc đổi tên.
 */
export class NicknameModal {
  /**
   * @param {Object} options
   * @param {Function} options.onConfirm - Callback khi người chơi xác nhận tên
   */
  constructor({ onConfirm }) {
    this.onConfirm = onConfirm;
    this.modalEl = document.getElementById('nickname-modal');
    this.inputEl = document.getElementById('nickname-input');
    this.formEl = document.getElementById('nickname-form');
    this.savedName = localStorage.getItem('dever_nickname') || '';

    this.init();
  }

  init() {
    if (this.inputEl && this.savedName) {
      this.inputEl.value = this.savedName;
    }

    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submit();
      });
    }

    // Nút mở modal đổi tên trên header
    const editBtn = document.getElementById('edit-name-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.show();
      });
    }
  }

  show() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    if (this.inputEl) {
      setTimeout(() => this.inputEl.focus(), 100);
    }
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    if (this.inputEl) {
      this.inputEl.blur();
    }
  }

  async submit() {
    let name = this.inputEl.value.trim();
    if (!name) {
      name = `Dev #${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      name = name.substring(0, 18);
      // Kiểm tra xem tên có bị trùng với tài khoản đã đăng ký không
      try {
        const { authService } = await import('../services/AuthService.js');
        const check = await authService.checkNameAvailability(name);
        if (!check.available) {
          alert(check.message || '⚠️ Biệt danh này đã thuộc về thành viên đã đăng ký. Vui lòng chọn tên khác!');
          return;
        }
      } catch (e) {}
    }

    localStorage.setItem('dever_nickname', name);
    this.hide();

    if (this.onConfirm) {
      this.onConfirm(name);
    }
  }
}
