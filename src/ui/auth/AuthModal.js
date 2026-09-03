import { authService } from '../../services/AuthService.js';
import { audioManager } from '../../utils/AudioManager.js';

export class AuthModal {
  /**
   * @param {Object} options
   * @param {Function} options.onAuthSuccess
   */
  constructor({ onAuthSuccess } = {}) {
    this.onAuthSuccess = onAuthSuccess;
    this.modalEl = document.getElementById('auth-modal');
    this.selectedAvatar = 'dev_hoodie';
    this.currentTab = 'login';
    this.pendingForgotEmail = '';

    this.bindEvents();
    this.setupPasswordToggles();
  }

  setupPasswordToggles() {
    if (!this.modalEl) return;
    const toggleBtns = this.modalEl.querySelectorAll('.btn-toggle-password');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = btn.closest('.password-input-wrapper');
        if (!wrapper) return;
        const input = wrapper.querySelector('input');
        const iconEye = btn.querySelector('.icon-eye');
        const iconEyeOff = btn.querySelector('.icon-eye-off');
        if (!input) return;

        if (input.type === 'password') {
          input.type = 'text';
          if (iconEye) iconEye.classList.add('hidden');
          if (iconEyeOff) iconEyeOff.classList.remove('hidden');
        } else {
          input.type = 'password';
          if (iconEye) iconEye.classList.remove('hidden');
          if (iconEyeOff) iconEyeOff.classList.add('hidden');
        }
      });
    });
  }

  bindEvents() {
    if (!this.modalEl) return;

    // Chặn phím lan sang Phaser Canvas
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
        audioManager.playClick();
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

    const profileForm = document.getElementById('pane-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
    }

    // Toggle Form Đổi Mật Khẩu Trong Game
    const toggleChangePwBtn = document.getElementById('btn-toggle-change-pw-form');
    if (toggleChangePwBtn) {
      toggleChangePwBtn.addEventListener('click', () => {
        const form = document.getElementById('profile-change-pw-form');
        if (form) {
          form.classList.toggle('hidden');
          const isHidden = form.classList.contains('hidden');
          const btnText = toggleChangePwBtn.querySelector('.btn-text-link');
          if (btnText) btnText.textContent = isHidden ? 'Mở Form ▼' : 'Đóng Form ▲';
        }
      });
    }

    // Submit Đổi Mật Khẩu Trong Game
    const changePwForm = document.getElementById('profile-change-pw-form');
    if (changePwForm) {
      changePwForm.addEventListener('submit', (e) => this.handleInGameChangePassword(e));
    }

    // Google SSO Buttons
    const guestGoogleBtn = document.getElementById('guest-google-btn');
    if (guestGoogleBtn) {
      guestGoogleBtn.addEventListener('click', () => this.handleGoogleLogin());
    }

    const loginGoogleBtn = document.getElementById('login-google-btn');
    if (loginGoogleBtn) {
      loginGoogleBtn.addEventListener('click', () => this.handleGoogleLogin());
    }

    // Nút chuyển sang màn hình Quên Mật Khẩu
    const gotoForgotBtn = document.getElementById('btn-goto-forgot');
    if (gotoForgotBtn) {
      gotoForgotBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.switchTab('forgot');
      });
    }

    // Nút quay lại Đăng nhập từ màn hình Quên Mật Khẩu
    const backToLoginBtn = document.getElementById('btn-back-to-login');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.switchTab('login');
      });
    }

    // Form Quên Mật Khẩu - Bước 1: Gửi OTP
    const forgotStep1Form = document.getElementById('forgot-step1-form');
    if (forgotStep1Form) {
      forgotStep1Form.addEventListener('submit', (e) => this.handleRequestOtp(e));
    }

    // Form Quên Mật Khẩu - Bước 2: Nhập OTP & Đổi Mật Khẩu
    const forgotStep2Form = document.getElementById('forgot-step2-form');
    if (forgotStep2Form) {
      forgotStep2Form.addEventListener('submit', (e) => this.handleResetPasswordWithOtp(e));
    }

    // Nút Nâng cấp tài khoản (dành cho Khách)
    const upgradeBtn = document.getElementById('profile-upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.switchTab('register');
      });
    }

    // Nút Đăng xuất
    const logoutBtn = document.getElementById('profile-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Nút đóng modal
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.hide();
      });
    }

    // Click backdrop để đóng
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

  populateProfileData() {
    const user = authService.getUser() || {};
    const isLoggedIn = authService.isLoggedIn();
    const isGoogle = user.auth_provider === 'google' || user.provider === 'google' || (user.email && user.email.toLowerCase().endsWith('@fpt.edu.vn'));

    // 1. Tên hiển thị
    const currentNameEl = document.getElementById('profile-current-name');
    const nameInput = document.getElementById('profile-name');
    const displayName = user.display_name || user.displayName || localStorage.getItem('dever_nickname') || 'Dev Member';

    if (currentNameEl) currentNameEl.textContent = displayName;
    if (nameInput) nameInput.value = displayName;

    // 2. Avatar
    const avatarIconEl = document.getElementById('profile-avatar-icon');
    if (avatarIconEl) {
      if (user.role === 'admin') avatarIconEl.textContent = '👑';
      else if (user.role === 'leader') avatarIconEl.textContent = '⭐';
      else if (isGoogle) avatarIconEl.textContent = '🎓';
      else avatarIconEl.textContent = '🧑‍💻';
    }

    // 3. Role Tag
    const roleTagEl = document.getElementById('profile-current-role');
    if (roleTagEl) {
      const role = (user.role || (isLoggedIn ? 'dev' : 'guest')).toLowerCase();
      roleTagEl.className = `role-tag ${role}`;
      if (role === 'admin') roleTagEl.textContent = 'ADMIN BQT';
      else if (role === 'leader') roleTagEl.textContent = 'LEADER CLB';
      else if (role === 'dev') roleTagEl.textContent = 'MEMBER DEV';
      else roleTagEl.textContent = 'KHÁCH (GUEST)';
    }

    // 4. DEVER Points
    const pointsBadgeEl = document.getElementById('profile-points-badge');
    if (pointsBadgeEl) {
      const points = user.dever_points ?? localStorage.getItem('dever_points') ?? 0;
      pointsBadgeEl.textContent = `⭐ ${points} Points`;
    }

    // 5. User ID
    const userIdEl = document.getElementById('profile-user-id');
    if (userIdEl) {
      const idStr = user.id ? String(user.id).slice(0, 14) : 'guest';
      userIdEl.textContent = `#ID: ${idStr}`;
    }

    // 6. Phương thức đăng nhập & Email
    const loginMethodEl = document.getElementById('profile-login-method');
    const userEmailEl = document.getElementById('profile-user-email');
    const upgradeBtn = document.getElementById('profile-upgrade-btn');

    if (loginMethodEl) {
      if (isGoogle) {
        loginMethodEl.innerHTML = `
          <span class="auth-provider-tag google">
            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 4px;">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google FPT Education (@fpt.edu.vn)
          </span>`;
      } else if (isLoggedIn && user.email) {
        loginMethodEl.innerHTML = `<span class="auth-provider-tag email">🔐 Tài Khoản Thành Viên (Email & Mật khẩu)</span>`;
      } else {
        loginMethodEl.innerHTML = `<span class="auth-provider-tag guest">🎮 Khách Vãng Lai (Guest Session)</span>`;
      }
    }

    if (userEmailEl) {
      if (user.email) {
        userEmailEl.innerHTML = `<span class="email-text-highlight">${user.email}</span>`;
      } else {
        userEmailEl.innerHTML = `<span class="text-muted">Chưa liên kết Email (Dữ liệu lưu tạm)</span>`;
      }
    }

    // Hiển thị nút nâng cấp nếu đang là khách
    if (upgradeBtn) {
      upgradeBtn.classList.toggle('hidden', isLoggedIn);
    }

    // 7. Toggle khung đổi mật khẩu trong game (chỉ hiển thị cho thành viên email)
    const changePwBox = document.getElementById('profile-change-pw-box');
    if (changePwBox) {
      changePwBox.classList.toggle('hidden', !isLoggedIn || isGoogle);
      const form = document.getElementById('profile-change-pw-form');
      if (form) {
        form.reset();
        form.classList.add('hidden');
      }
      const btnText = document.querySelector('#btn-toggle-change-pw-form .btn-text-link');
      if (btnText) btnText.textContent = 'Mở Form ▼';
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    const titleEl = document.getElementById('auth-modal-title');
    const subEl = document.getElementById('auth-modal-sub');
    const tabsContainer = document.getElementById('auth-modal-tabs');

    if (tab === 'profile') {
      if (titleEl) titleEl.textContent = 'Hồ Sơ Nhân Vật & Tài Khoản';
      if (subEl) subEl.textContent = 'Quản lý thông tin định danh và tài khoản trong DEVER TOWN';
      if (tabsContainer) tabsContainer.classList.add('hidden');
      this.populateProfileData();
    } else if (tab === 'forgot') {
      if (titleEl) titleEl.textContent = 'Khôi Phục Mật Khẩu';
      if (subEl) subEl.textContent = 'Nhận mã OTP 6 số qua email để thiết lập mật khẩu mới';
      if (tabsContainer) tabsContainer.classList.add('hidden');
      this.resetForgotSteps();
    } else {
      if (titleEl) titleEl.textContent = 'Tham Gia DEVER TOWN';
      if (subEl) subEl.textContent = 'Đăng nhập hoặc tham gia nhanh để kết nối cộng đồng';
      if (tabsContainer) tabsContainer.classList.remove('hidden');
    }

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

  resetForgotSteps() {
    const step1 = document.getElementById('forgot-step1-form');
    const step2 = document.getElementById('forgot-step2-form');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');
    const emailInput = document.getElementById('forgot-email');
    const loginEmailInput = document.getElementById('login-email');
    if (emailInput && loginEmailInput && loginEmailInput.value) {
      emailInput.value = loginEmailInput.value;
    }
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
      this.showError('Vui lòng nhập biệt danh!');
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

  async handleGoogleLogin() {
    this.clearError();
    const promptEmail = prompt('Nhập Email FPT Education của bạn (@fpt.edu.vn hoặc @fe.edu.vn):', 'dev.fuda@fpt.edu.vn');
    if (!promptEmail) return;

    if (!promptEmail.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }

    const defaultName = promptEmail.split('@')[0].replace('.', ' ').toUpperCase();
    const promptName = prompt('Nhập Tên hiển thị mong muốn:', defaultName) || defaultName;

    try {
      const user = await authService.loginWithGoogle({
        email: promptEmail,
        displayName: promptName
      });
      audioManager.playVictory();
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user, isGuest: false });
      }
    } catch (err) {
      this.showError(err.message || 'Đăng nhập Google thất bại!');
    }
  }

  async handleRequestOtp(e) {
    e.preventDefault();
    this.clearError();

    const emailInput = document.getElementById('forgot-email');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      this.showError('Vui lòng nhập địa chỉ email đã đăng ký!');
      return;
    }

    try {
      const sendBtn = document.getElementById('btn-send-otp');
      if (sendBtn) sendBtn.disabled = true;

      const cleanEmail = email.toLowerCase().trim();
      const res = await authService.requestPasswordReset(cleanEmail);
      this.pendingForgotEmail = cleanEmail;
      sessionStorage.setItem('dever_pending_forgot_email', cleanEmail);

      const targetEmailEl = document.getElementById('otp-target-email');
      if (targetEmailEl) targetEmailEl.textContent = cleanEmail;

      const step1 = document.getElementById('forgot-step1-form');
      const step2 = document.getElementById('forgot-step2-form');
      if (step1) step1.classList.add('hidden');
      if (step2) step2.classList.remove('hidden');

      const otpInput = document.getElementById('reset-otp-input');
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }

      if (sendBtn) sendBtn.disabled = false;
      audioManager.playClick();
    } catch (err) {
      const sendBtn = document.getElementById('btn-send-otp');
      if (sendBtn) sendBtn.disabled = false;
      this.showError(err.message || 'Lỗi gửi mã OTP.');
    }
  }

  async handleResetPasswordWithOtp(e) {
    e.preventDefault();
    this.clearError();

    const email = (
      this.pendingForgotEmail || 
      sessionStorage.getItem('dever_pending_forgot_email') || 
      document.getElementById('otp-target-email')?.textContent || 
      document.getElementById('forgot-email')?.value || 
      ''
    ).toLowerCase().trim();

    const otpCode = (document.getElementById('reset-otp-input')?.value || '').replace(/\D/g, '').trim();
    const newPassword = document.getElementById('reset-new-password')?.value;
    const confirmPassword = document.getElementById('reset-confirm-password')?.value;

    if (!email) {
      this.showError('Không tìm thấy thông tin email. Vui lòng quay lại bước 1 và bấm gửi mã.');
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      this.showError('Mã xác thực OTP phải gồm đúng 6 chữ số.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      this.showError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    try {
      const resetBtn = document.getElementById('btn-confirm-reset');
      if (resetBtn) resetBtn.disabled = true;

      await authService.resetPassword({
        email,
        otpCode,
        newPassword
      });

      sessionStorage.removeItem('dever_pending_forgot_email');
      this.pendingForgotEmail = '';

      audioManager.playVictory();
      alert('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.');

      if (resetBtn) resetBtn.disabled = false;

      // Chuyển sang tab đăng nhập và điền sẵn email
      this.switchTab('login');
      const loginEmail = document.getElementById('login-email');
      if (loginEmail) loginEmail.value = email;
    } catch (err) {
      const resetBtn = document.getElementById('btn-confirm-reset');
      if (resetBtn) resetBtn.disabled = false;
      this.showError(err.message || 'Đặt lại mật khẩu không thành công.');
    }
  }

  async handleUpdateProfile(e) {
    e.preventDefault();
    this.clearError();

    const displayName = document.getElementById('profile-name').value.trim();
    if (!displayName) {
      this.showError('Tên hiển thị không được để trống.');
      return;
    }

    try {
      const user = await authService.updateProfile({
        displayName
      });
      audioManager.playClick();
      alert(`Cập nhật tên hiển thị thành "${displayName}" thành công.`);
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user, isGuest: !authService.isLoggedIn() });
      }
    } catch (err) {
      this.showError(err.message || 'Cập nhật không thành công.');
    }
  }

  async handleInGameChangePassword(e) {
    e.preventDefault();
    this.clearError();

    const oldPassword = document.getElementById('change-old-password')?.value;
    const newPassword = document.getElementById('change-new-password')?.value;
    const confirmPassword = document.getElementById('change-confirm-password')?.value;

    if (!oldPassword) {
      this.showError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      this.showError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    try {
      await authService.changePassword({ oldPassword, newPassword });
      audioManager.playVictory();
      alert('Đổi mật khẩu thành công. Mật khẩu mới đã được cập nhật.');

      const form = document.getElementById('profile-change-pw-form');
      if (form) {
        form.reset();
        form.classList.add('hidden');
      }
      const btnText = document.querySelector('#btn-toggle-change-pw-form .btn-text-link');
      if (btnText) btnText.textContent = 'Mở Form ▼';
    } catch (err) {
      this.showError(err.message || 'Đổi mật khẩu không thành công.');
    }
  }

  handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi thị trấn?')) {
      audioManager.playClick();
      authService.logout();
      const guestUser = {
        display_name: `Khách #${Math.floor(1000 + Math.random() * 9000)}`,
        avatar_id: 'dev_hoodie',
        role: 'guest'
      };
      this.hide();
      if (this.onAuthSuccess) {
        this.onAuthSuccess({ user: guestUser, isGuest: true });
      }
      window.location.reload();
    }
  }
}
