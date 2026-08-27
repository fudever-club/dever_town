import { authService } from '../services/AuthService.js';

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

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    if (!this.modalEl) return;

    this.avatars = [
      { id: 'dev_hoodie', name: 'Developer', desc: 'Áo hoodie xanh & balo cam', color: '#3b82f6', icon: 'DEV' },
      { id: 'cyberpunk_pink', name: 'Cyberpunk', desc: 'Neon hồng & kính VR', color: '#ec4899', icon: 'NEO' },
      { id: 'red_gamer', name: 'Gamer Pro', desc: 'Hoodie đỏ & tai nghe', color: '#ef4444', icon: 'PRO' },
      { id: 'green_coder', name: 'Hacker', desc: 'Bomber ngọc & kính mắt', color: '#10b981', icon: 'HEX' }
    ];
  }

  bindEvents() {
    if (!this.modalEl) return;

    // Ngăn chặn sự kiện phím từ các input trong modal lan ra ngoài canvas
    const inputs = this.modalEl.querySelectorAll('input, select, textarea');
    inputs.forEach(inp => {
      const stopBubble = (e) => e.stopPropagation();
      inp.addEventListener('keydown', stopBubble);
      inp.addEventListener('keyup', stopBubble);
      inp.addEventListener('keypress', stopBubble);
    });

    // Switch Tabs
    const tabBtns = this.modalEl.querySelectorAll('.auth-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Avatar Selection
    const avatarItems = this.modalEl.querySelectorAll('.avatar-option');
    avatarItems.forEach(item => {
      item.addEventListener('click', () => {
        avatarItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        this.selectedAvatar = item.dataset.avatar;
      });
    });

    // Form Submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    const guestForm = document.getElementById('guest-form');
    if (guestForm) {
      guestForm.addEventListener('submit', (e) => this.handleGuest(e));
    }

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
    }

    // Nút đóng modal
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Click ra ngoài backdrop để đóng
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    // Phím Escape đóng modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modalEl.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  switchTab(tab) {
    this.currentTab = tab;
    const tabBtns = this.modalEl.querySelectorAll('.auth-tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const panes = this.modalEl.querySelectorAll('.auth-pane');
    panes.forEach(pane => {
      pane.classList.toggle('hidden', pane.id !== `${tab}-form` && pane.id !== `pane-${tab}`);
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
    const errorEl = this.modalEl.querySelector('.auth-error-msg');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }
  }

  clearError() {
    const errorEl = this.modalEl.querySelector('.auth-error-msg');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
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
      this.showError(err.message);
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
        avatarId: this.selectedAvatar
      });
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user, isGuest: false });
      }
    } catch (err) {
      this.showError(err.message);
    }
  }

  async handleGuest(e) {
    e.preventDefault();
    this.clearError();

    const rawName = document.getElementById('guest-name').value.trim();
    const name = rawName || `Khách #${Math.floor(1000 + Math.random() * 9000)}`;
    const user = authService.setGuestSession(name, this.selectedAvatar);
    this.hide();

    if (this.onAuthSuccess) {
      this.onAuthSuccess({ user, isGuest: true });
    }
  }

  async handleUpdateProfile(e) {
    e.preventDefault();
    this.clearError();

    const name = document.getElementById('profile-name').value.trim();
    try {
      const updatedUser = await authService.updateProfile({
        displayName: name,
        avatarId: this.selectedAvatar
      });
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user: updatedUser, isGuest: !authService.isLoggedIn() });
      }
    } catch (err) {
      this.showError(err.message);
    }
  }
}
