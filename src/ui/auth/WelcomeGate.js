import { authService } from '../../services/AuthService.js';
import { audioManager } from '../../utils/AudioManager.js';
import { i18n } from '../../config/i18n.js';

export class WelcomeGate {
  /**
   * @param {Object} options
   * @param {Function} options.onEnterGame
   */
  constructor({ onEnterGame }) {
    this.onEnterGame = onEnterGame;
    this.gateEl = document.getElementById('welcome-gate');
    this.loadingEl = document.getElementById('game-loading-screen');
    this.currentTab = 'guest';
    this.pendingForgotEmail = '';

    this.initDOM();
    this.bindEvents();
    this.setupPasswordToggles();
    
    // Tự động duy trì phiên nếu vừa mới chơi / reload trang trong vòng 24 giờ
    setTimeout(() => this.checkAutoLogin(), 50);
  }

  checkAutoLogin() {
    if (authService.isSessionValid(24)) {
      const user = authService.getUser();
      if (user) {
        console.log('🔄 [WelcomeGate] Tự động duy trì phiên đăng nhập gần nhất:', user.display_name || user.email);
        this.startLoadingAndEnter({
          user,
          isGuest: user.role === 'guest'
        });
        return true;
      }
    }
    return false;
  }

  initDOM() {
    i18n.applyToDOM();

    // Tự động điền biệt danh cũ nếu có
    const savedNick = localStorage.getItem('dever_nickname');
    const guestInput = document.getElementById('gate-guest-name');
    if (guestInput && savedNick) {
      guestInput.value = savedNick;
    }
  }

  setupPasswordToggles() {
    if (!this.gateEl) return;
    const toggleBtns = this.gateEl.querySelectorAll('.btn-toggle-password');
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
    if (!this.gateEl) return;

    // Ngăn chặn phím lan ra ngoài Phaser
    const inputs = this.gateEl.querySelectorAll('input, select, textarea');
    inputs.forEach(inp => {
      const stopBubble = (e) => e.stopPropagation();
      inp.addEventListener('keydown', stopBubble);
      inp.addEventListener('keyup', stopBubble);
      inp.addEventListener('keypress', stopBubble);
    });

    // Tab buttons
    const tabBtns = this.gateEl.querySelectorAll('.gate-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        audioManager.playClick();
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Cài đặt âm lượng & ngôn ngữ ở Welcome Gate
    const gateSettingsBtn = document.getElementById('gate-settings-btn');
    if (gateSettingsBtn) {
      gateSettingsBtn.addEventListener('click', () => {
        audioManager.playClick();
        if (window.__SETTINGS_MODAL__) {
          window.__SETTINGS_MODAL__.show();
        } else {
          const sm = document.getElementById('settings-modal');
          if (sm) sm.classList.remove('hidden');
        }
      });
    }

    // Forms
    const guestForm = document.getElementById('gate-form-guest');
    if (guestForm) {
      guestForm.addEventListener('submit', (e) => this.handleGuestSubmit(e));
    }

    const loginForm = document.getElementById('gate-form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }

    const regForm = document.getElementById('gate-form-register');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }

    // Nút chuyển sang màn hình Quên Mật Khẩu ở Welcome Gate
    const gotoForgotBtn = document.getElementById('gate-btn-goto-forgot');
    if (gotoForgotBtn) {
      gotoForgotBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.switchTab('forgot');
      });
    }

    // Nút quay lại Đăng nhập từ màn hình Quên Mật Khẩu
    const backToLoginBtn = document.getElementById('gate-btn-back-to-login');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.switchTab('login');
      });
    }

    // Quên mật khẩu - Bước 1: Gửi OTP
    const forgotStep1Form = document.getElementById('gate-forgot-step1-form');
    if (forgotStep1Form) {
      forgotStep1Form.addEventListener('submit', (e) => this.handleGateRequestOtp(e));
    }

    // Quên mật khẩu - Bước 2: Nhập OTP & Đổi Mật Khẩu
    const forgotStep2Form = document.getElementById('gate-forgot-step2-form');
    if (forgotStep2Form) {
      forgotStep2Form.addEventListener('submit', (e) => this.handleGateResetPasswordWithOtp(e));
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    const tabBtns = this.gateEl.querySelectorAll('.gate-tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const panes = this.gateEl.querySelectorAll('.gate-form-pane');
    panes.forEach(p => {
      p.classList.toggle('hidden', p.id !== `gate-form-${tab}`);
    });

    if (tab === 'forgot') {
      this.resetForgotSteps();
    }

    this.clearError();
  }

  resetForgotSteps() {
    const step1 = document.getElementById('gate-forgot-step1-form');
    const step2 = document.getElementById('gate-forgot-step2-form');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');

    const emailInput = document.getElementById('gate-forgot-email');
    const loginEmailInput = document.getElementById('gate-login-email');
    if (emailInput && loginEmailInput && loginEmailInput.value) {
      emailInput.value = loginEmailInput.value;
    }
  }

  showError(msg) {
    const errBox = document.getElementById('gate-error-msg');
    if (errBox) {
      errBox.textContent = msg;
      errBox.classList.remove('hidden');
    }
  }

  clearError() {
    const errBox = document.getElementById('gate-error-msg');
    if (errBox) {
      errBox.textContent = '';
      errBox.classList.add('hidden');
    }
  }

  async handleGuestSubmit(e) {
    e.preventDefault();
    this.clearError();

    const input = document.getElementById('gate-guest-name');
    const nickname = input ? input.value.trim() : '';

    if (!nickname) {
      this.showError('Vui lòng nhập biệt danh để vào game.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 25) {
      this.showError('Biệt danh phải từ 2 đến 25 ký tự.');
      return;
    }

    // 1. Kiểm tra chống trùng tên với thành viên / Admin đã đăng ký trong Database
    const checkResult = await authService.checkNameAvailability(nickname);
    if (!checkResult.available) {
      this.showError(checkResult.message || 'Biệt danh này đã thuộc về thành viên đã đăng ký. Vui lòng đăng nhập hoặc chọn tên khác!');
      return;
    }

    // 2. Thiết lập phiên Khách sạch (Hủy bỏ mọi quyền / Token của tài khoản cũ)
    authService.setGuestSession(nickname);

    this.startLoadingAndEnter({
      user: authService.getUser(),
      isGuest: true
    });
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    this.clearError();

    const email = document.getElementById('gate-login-email').value.trim();
    const password = document.getElementById('gate-login-password').value;

    try {
      const user = await authService.login({ email, password });
      this.startLoadingAndEnter({ user, isGuest: false });
    } catch (err) {
      this.showError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
    }
  }

  async handleRegisterSubmit(e) {
    e.preventDefault();
    this.clearError();

    const displayName = document.getElementById('gate-reg-name').value.trim();
    const email = document.getElementById('gate-reg-email').value.trim();
    const password = document.getElementById('gate-reg-password').value;

    try {
      const user = await authService.register({ email, password, displayName, avatarId: 'dev_hoodie' });
      this.startLoadingAndEnter({ user, isGuest: false });
    } catch (err) {
      this.showError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  }

  async handleGateRequestOtp(e) {
    e.preventDefault();
    this.clearError();

    const emailInput = document.getElementById('gate-forgot-email');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      this.showError('Vui lòng nhập địa chỉ email đã đăng ký!');
      return;
    }

    try {
      const sendBtn = document.getElementById('gate-btn-send-otp');
      if (sendBtn) sendBtn.disabled = true;

      const cleanEmail = email.toLowerCase().trim();
      const res = await authService.requestPasswordReset(cleanEmail);
      this.pendingForgotEmail = cleanEmail;
      sessionStorage.setItem('dever_pending_forgot_email', cleanEmail);

      const targetEmailEl = document.getElementById('gate-otp-target-email');
      if (targetEmailEl) targetEmailEl.textContent = cleanEmail;

      const step1 = document.getElementById('gate-forgot-step1-form');
      const step2 = document.getElementById('gate-forgot-step2-form');
      if (step1) step1.classList.add('hidden');
      if (step2) step2.classList.remove('hidden');

      const otpInput = document.getElementById('gate-reset-otp-input');
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }

      if (sendBtn) sendBtn.disabled = false;
      audioManager.playClick();
    } catch (err) {
      const sendBtn = document.getElementById('gate-btn-send-otp');
      if (sendBtn) sendBtn.disabled = false;
      this.showError(err.message || 'Lỗi gửi mã OTP.');
    }
  }

  async handleGateResetPasswordWithOtp(e) {
    e.preventDefault();
    this.clearError();

    const email = (
      this.pendingForgotEmail || 
      sessionStorage.getItem('dever_pending_forgot_email') || 
      document.getElementById('gate-otp-target-email')?.textContent || 
      document.getElementById('gate-forgot-email')?.value || 
      ''
    ).toLowerCase().trim();

    const otpCode = (document.getElementById('gate-reset-otp-input')?.value || '').replace(/\D/g, '').trim();
    const newPassword = document.getElementById('gate-reset-new-password')?.value;
    const confirmPassword = document.getElementById('gate-reset-confirm-password')?.value;

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
      const resetBtn = document.getElementById('gate-btn-confirm-reset');
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
      const loginEmail = document.getElementById('gate-login-email');
      if (loginEmail) loginEmail.value = email;
    } catch (err) {
      const resetBtn = document.getElementById('gate-btn-confirm-reset');
      if (resetBtn) resetBtn.disabled = false;
      this.showError(err.message || 'Đặt lại mật khẩu không thành công.');
    }
  }

  startLoadingAndEnter({ user, isGuest }) {
    // 1. Blur bất kỳ input nào đang focus để giải phóng bàn phím
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    // 2. Ẩn Welcome Gate ngay lập tức
    if (this.gateEl) {
      this.gateEl.classList.add('fade-out');
      this.gateEl.classList.add('hidden');
    }

    // 3. Hiển thị Animated Buggy Loading Screen
    if (this.loadingEl) {
      this.loadingEl.classList.remove('hidden');
      this.loadingEl.classList.remove('fade-out');
    }

    this.runLoadingSimulation(() => {
      // Khi load xong, ẩn loading screen và vào WorldScene
      if (this.loadingEl) {
        this.loadingEl.classList.add('fade-out');
        setTimeout(() => {
          this.loadingEl.classList.add('hidden');
        }, 300);
      }

      if (this.onEnterGame) {
        this.onEnterGame({ user, isGuest });
      }

      // Khôi phục focus vào canvas trò chơi
      const canvas = document.querySelector('#game-container canvas');
      if (canvas) {
        canvas.focus();
      }
    });
  }

  runLoadingSimulation(onComplete) {
    const steps = [
      { progress: 20, text: 'Khởi tạo Game Engine Phaser 3 & Bộ Canvas 2D...' },
      { progress: 45, text: 'Sinh 30 bộ Tileset Pixel Art, Sân thể thao & Cóc Vàng FPTU...' },
      { progress: 70, text: 'Nạp 7 phân khu chức năng & Cổng thông tin FU-DEVER...' },
      { progress: 90, text: 'Kết nối Realtime Socket.io & Hệ thống Túi đồ...' },
      { progress: 100, text: 'Hoàn tất! Chào mừng bạn đến với DEVER TOWN ✨' }
    ];

    const progressBar = document.getElementById('loading-progress-fill');
    const percentText = document.getElementById('loading-percent-text');
    const statusText = document.getElementById('loading-status-text');
    const buggyEl = document.getElementById('loading-buggy-sprite');

    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        if (progressBar) progressBar.style.width = `${step.progress}%`;
        if (percentText) percentText.textContent = `${step.progress}%`;
        if (statusText) statusText.textContent = step.text;
        if (buggyEl) buggyEl.style.left = `calc(${step.progress}% - 24px)`;

        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 400);
      }
    }, 320);
  }
}
