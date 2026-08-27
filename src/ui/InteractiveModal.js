import { INTERACTION_PRESETS } from '../config/interactions.js';
import { PomodoroTimer } from './PomodoroTimer.js';

export class InteractiveModal {
  /**
   * @param {Object} options
   * @param {Function} options.onOpen
   * @param {Function} options.onClose
   */
  constructor({ onOpen, onClose } = {}) {
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.modalEl = document.getElementById('interactive-modal');
    this.currentZone = null;

    this.initPomodoro();
    this.initEvents();
  }

  initPomodoro() {
    this.pomodoro = new PomodoroTimer({
      onTick: (timeStr, mode) => {
        const timeEl = document.getElementById('pomo-timer-display');
        const badgeEl = document.getElementById('pomo-mode-badge');
        if (timeEl) timeEl.textContent = timeStr;
        if (badgeEl) {
          badgeEl.textContent = mode === 'work' ? '🎯 Tập trung (25p)' : '☕ Nghỉ ngơi (5p)';
          badgeEl.className = `pomo-badge ${mode}`;
        }
      },
      onComplete: (mode) => {
        alert(mode === 'work' ? '🎉 Đã hết 25 phút tập trung! Hãy nghỉ giải lao 5 phút.' : '⚡ Hết giờ nghỉ ngơi! Bắt đầu phiên làm việc mới nào.');
      }
    });
  }

  initEvents() {
    if (!this.modalEl) return;

    // Nút đóng modal
    const closeBtn = document.getElementById('interactive-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Phím Escape đóng modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });

    // 1. Code Editor Run Button
    const runCodeBtn = document.getElementById('code-run-btn');
    if (runCodeBtn) {
      runCodeBtn.addEventListener('click', () => this.executeCode());
    }

    // 2. Notes Auto-save
    const notesInput = document.getElementById('notes-textarea');
    if (notesInput) {
      const saved = localStorage.getItem('dever_club_notes');
      if (saved) notesInput.value = saved;
      notesInput.addEventListener('input', () => {
        localStorage.setItem('dever_club_notes', notesInput.value);
      });
    }

    // 3. Pomodoro Buttons
    const pomoStartBtn = document.getElementById('pomo-start-btn');
    const pomoPauseBtn = document.getElementById('pomo-pause-btn');
    const pomoResetBtn = document.getElementById('pomo-reset-btn');

    if (pomoStartBtn) pomoStartBtn.addEventListener('click', () => this.pomodoro.start());
    if (pomoPauseBtn) pomoPauseBtn.addEventListener('click', () => this.pomodoro.pause());
    if (pomoResetBtn) pomoResetBtn.addEventListener('click', () => this.pomodoro.reset('work'));

    // 4. Custom Slide URL Input
    const loadSlideBtn = document.getElementById('slide-load-btn');
    if (loadSlideBtn) {
      loadSlideBtn.addEventListener('click', () => {
        const input = document.getElementById('slide-url-input');
        if (input && input.value.trim()) {
          this.loadSlideIframe(input.value.trim());
        }
      });
    }
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  show(zoneData) {
    if (!this.modalEl) return;
    this.currentZone = zoneData;

    const titleEl = document.getElementById('interactive-modal-title');
    const descEl = document.getElementById('interactive-modal-desc');

    if (titleEl) titleEl.textContent = `${zoneData.icon || '✨'} ${zoneData.name}`;
    if (descEl) descEl.textContent = `Vùng tương tác không gian DEVER TOWN`;

    // Ẩn tất cả các view panes
    const panes = this.modalEl.querySelectorAll('.interactive-pane');
    panes.forEach(p => p.classList.add('hidden'));

    // Hiển thị view pane tương ứng với type
    switch (zoneData.type) {
      case 'whiteboard_slides':
        this.setupSlidesView(zoneData);
        break;
      case 'meeting_stage':
        this.setupMeetingView(zoneData);
        break;
      case 'code_editor':
        this.setupCodeView(zoneData);
        break;
      case 'coffee_lofi':
        this.setupCoffeeView(zoneData);
        break;
      default:
        break;
    }

    this.modalEl.classList.remove('hidden');

    if (this.onOpen) {
      this.onOpen();
    }
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');

    // Dọn dẹp iframes để dừng audio/video phát ngầm
    const slideIframe = document.getElementById('slide-iframe');
    if (slideIframe) slideIframe.src = 'about:blank';

    const meetingIframe = document.getElementById('meeting-iframe');
    if (meetingIframe) meetingIframe.src = 'about:blank';

    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) lofiIframe.src = 'about:blank';

    if (this.onClose) {
      this.onClose();
    }
  }

  setupSlidesView(zoneData) {
    const pane = document.getElementById('pane-slides');
    if (!pane) return;
    pane.classList.remove('hidden');

    const preset = INTERACTION_PRESETS.whiteboard_slides;
    const url = preset.defaultUrl;
    this.loadSlideIframe(url);
  }

  loadSlideIframe(rawUrl) {
    const iframe = document.getElementById('slide-iframe');
    if (!iframe) return;

    let targetUrl = rawUrl;
    // Tự động chuyển link Google Drive / Slides /edit sang /embed
    if (targetUrl.includes('docs.google.com/presentation') && targetUrl.includes('/edit')) {
      targetUrl = targetUrl.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000');
    }
    iframe.src = targetUrl;
  }

  setupMeetingView(zoneData) {
    const pane = document.getElementById('pane-meeting');
    if (!pane) return;
    pane.classList.remove('hidden');

    const roomName = `DeverTown_${zoneData.id || 'Room'}`;
    const jitsiUrl = INTERACTION_PRESETS.meeting_stage.getJitsiUrl(roomName);

    const iframe = document.getElementById('meeting-iframe');
    if (iframe) {
      iframe.src = jitsiUrl;
    }

    const gmeetBtn = document.getElementById('gmeet-open-btn');
    if (gmeetBtn) {
      gmeetBtn.href = `https://meet.google.com/new`;
    }
  }

  setupCodeView(zoneData) {
    const pane = document.getElementById('pane-code');
    if (!pane) return;
    pane.classList.remove('hidden');

    const codeArea = document.getElementById('code-textarea');
    if (codeArea && !codeArea.value) {
      codeArea.value = INTERACTION_PRESETS.code_editor.defaultCode;
    }

    const notesArea = document.getElementById('notes-textarea');
    if (notesArea && !notesArea.value) {
      notesArea.value = INTERACTION_PRESETS.code_editor.defaultNotes;
    }
  }

  executeCode() {
    const codeArea = document.getElementById('code-textarea');
    const outputEl = document.getElementById('code-output');
    if (!codeArea || !outputEl) return;

    const code = codeArea.value;
    outputEl.textContent = '⏳ Đang chạy mã nguồn...\n';

    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args) => logs.push('❌ Lỗi: ' + args.join(' ')),
      warn: (...args) => logs.push('⚠️ Cảnh báo: ' + args.join(' '))
    };

    try {
      const runFn = new Function('console', code);
      runFn(customConsole);
      outputEl.textContent = logs.length > 0 ? logs.join('\n') : '✅ Mã chạy thành công (Không có console output).';
    } catch (err) {
      outputEl.textContent = `💥 Lỗi thực thi: ${err.message}`;
    }
  }

  setupCoffeeView(zoneData) {
    const pane = document.getElementById('pane-coffee');
    if (!pane) return;
    pane.classList.remove('hidden');

    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) {
      lofiIframe.src = INTERACTION_PRESETS.coffee_lofi.getEmbedUrl('jfKfPfyJRdk');
    }
  }
}
