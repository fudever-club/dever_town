import { authService } from '../../services/AuthService.js';

export class AuthModal {
  /**
   * @param {Object} options
   * @param {Function} options.onAuthSuccess
   */
  constructor({ onAuthSuccess }) {
    this.onAuthSuccess = onAuthSuccess;
    this.modalEl = document.getElementById('auth-modal');
    this.selectedAvatar = 'dev_hoodie';
    this.currentTab = 'login';

    this.bindEvents();
  }

  bindEvents() {
    if (!this.modalEl) return;

    // Chặn phím lan sang Phaser
    const inputs = this.modalEl.querySelectorAll('input, select, textarea');
    inputs.forEach(inp => {
      const stopBubble = (e) => e.stopPropagation();
      inp.addEventListener('keydown', stopBubble);
      inp.addEventListener('keyup', stopBubble);
      inp.addEventListener('keypress', stopBubble);
    });

    // Tab buttons
    const tabBtns = this.modalEl.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Form Submissions
    const guestForm = document.getElementById('pane-guest');
    if (guestForm) {
      guestForm.addEventListener('submit', (e) => this.handleGuest(e));
    }

    const loginForm = document.getElementById('pane-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const registerForm = document.getElementById('pane-register');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    const profileForm = document.getElementById('pane-profile');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
    }

    // Nút đóng modal
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Click backdrop
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    // Phím Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  switchTab(tab) {
    this.currentTab = tab;
    const tabBtns = this.modalEl.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const panes = this.modalEl.querySelectorAll('.auth-pane');
    panes.forEach(pane => {
      pane.classList.toggle('hidden', pane.id !== `pane-${tab}`);
    });

    this.clearError();
  }

  show(defaultTab = 'login') {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.switchTab(defaultTab);
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    this.clearError();
  }

  showError(msg) {
    const errorEl = document.getElementById('auth-error-msg');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }
  }

  clearError() {
    const errorEl = document.getElementById('auth-error-msg');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  async handleGuest(e) {
    e.preventDefault();
    this.clearError();

    const nameInput = document.getElementById('guest-name');
    const displayName = nameInput ? nameInput.value.trim() : 'Dever Member';

    if (!displayName) {
      this.showError('Vui lòng nhập biệt danh');
      return;
    }

    localStorage.setItem('dever_nickname', displayName);
    this.hide();

    if (this.onAuthSuccess) {
      this.onAuthSuccess({
        user: { display_name: displayName, avatar_id: 'dev_hoodie', role: 'guest' },
        isGuest: true
      });
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    this.clearError();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const user = await authService.login({ email, password });
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user, isGuest: false });
      }
    } catch (err) {
      this.showError(err.message || 'Đăng nhập thất bại.');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    this.clearError();

    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const displayName = document.getElementById('reg-name').value.trim();

    try {
      const user = await authService.register({
        email,
        password,
        displayName,
        avatarId: 'dev_hoodie'
      });
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user, isGuest: false });
      }
    } catch (err) {
      this.showError(err.message || 'Đăng ký thất bại.');
    }
  }

  async handleUpdateProfile(e) {
    e.preventDefault();
    this.clearError();

    const displayName = document.getElementById('profile-name').value.trim();

    try {
      const user = await authService.updateProfile({
        displayName
      });
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user, isGuest: false });
      }
    } catch (err) {
      this.showError(err.message || 'Cập nhật thất bại.');
    }
  }
}
