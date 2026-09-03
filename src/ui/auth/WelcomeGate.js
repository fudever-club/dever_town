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

    this.initDOM();
    this.bindEvents();
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

  bindEvents() {
    if (!this.gateEl) return;

    // Ngăn chặn phím lan ra ngoài
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

    this.clearError();
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
