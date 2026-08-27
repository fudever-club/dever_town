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
    this.currentMemoryIndex = 0;

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
          badgeEl.textContent = mode === 'work' ? 'Tập trung (25p)' : 'Nghỉ ngơi (5p)';
          badgeEl.className = `pomo-badge ${mode}`;
        }
      },
      onComplete: (mode) => {
        alert(mode === 'work' ? 'Đã hết 25 phút tập trung! Hãy nghỉ giải lao 5 phút.' : 'Hết giờ nghỉ ngơi! Bắt đầu phiên làm việc mới nào.');
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

    // 4. Slide URL Loader
    const loadSlideBtn = document.getElementById('slide-load-btn');
    if (loadSlideBtn) {
      loadSlideBtn.addEventListener('click', () => {
        const input = document.getElementById('slide-url-input');
        if (input && input.value.trim()) {
          this.loadSlideIframe(input.value.trim());
        }
      });
    }

    // 5. Memory Gallery Next/Prev
    const prevMemoryBtn = document.getElementById('memory-prev-btn');
    const nextMemoryBtn = document.getElementById('memory-next-btn');

    if (prevMemoryBtn) {
      prevMemoryBtn.addEventListener('click', () => {
        const memories = INTERACTION_PRESETS.gallery_memory.memories;
        this.currentMemoryIndex = (this.currentMemoryIndex - 1 + memories.length) % memories.length;
        this.renderMemorySlide(memories[this.currentMemoryIndex]);
      });
    }

    if (nextMemoryBtn) {
      nextMemoryBtn.addEventListener('click', () => {
        const memories = INTERACTION_PRESETS.gallery_memory.memories;
        this.currentMemoryIndex = (this.currentMemoryIndex + 1) % memories.length;
        this.renderMemorySlide(memories[this.currentMemoryIndex]);
      });
    }

    // 6. Website URL Loader & Fallback
    const loadWebBtn = document.getElementById('web-load-btn');
    if (loadWebBtn) {
      loadWebBtn.addEventListener('click', () => {
        const input = document.getElementById('web-url-input');
        if (input && input.value.trim()) {
          this.loadWebsiteIframe(input.value.trim());
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

    if (titleEl) titleEl.textContent = zoneData.name || 'Khu Vực Tương Tác';
    if (descEl) descEl.textContent = 'Không gian hoạt động chuyên biệt của DEVER TOWN';

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
      case 'gallery_memory':
        this.setupGalleryView(zoneData);
        break;
      case 'club_website':
        this.setupWebsiteView(zoneData);
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

    const slideIframe = document.getElementById('slide-iframe');
    if (slideIframe) slideIframe.src = 'about:blank';

    const meetingIframe = document.getElementById('meeting-iframe');
    if (meetingIframe) meetingIframe.src = 'about:blank';

    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) lofiIframe.src = 'about:blank';

    const webIframe = document.getElementById('web-iframe');
    if (webIframe) webIframe.src = 'about:blank';

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
    outputEl.textContent = 'Đang chạy mã nguồn...\n';

    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args) => logs.push('Lỗi: ' + args.join(' ')),
      warn: (...args) => logs.push('Cảnh báo: ' + args.join(' '))
    };

    try {
      const runFn = new Function('console', code);
      runFn(customConsole);
      outputEl.textContent = logs.length > 0 ? logs.join('\n') : 'Mã chạy thành công (Không có console output).';
    } catch (err) {
      outputEl.textContent = `Lỗi thực thi: ${err.message}`;
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

  setupGalleryView(zoneData) {
    const pane = document.getElementById('pane-gallery');
    if (!pane) return;
    pane.classList.remove('hidden');

    const memories = INTERACTION_PRESETS.gallery_memory.memories;
    const meta = zoneData.metadata;

    let targetIdx = 0;
    if (meta && meta.imgId) {
      const found = memories.findIndex(m => m.id === meta.imgId);
      if (found !== -1) targetIdx = found;
    }

    this.currentMemoryIndex = targetIdx;
    this.renderMemorySlide(memories[this.currentMemoryIndex]);
  }

  renderMemorySlide(memory) {
    if (!memory) return;

    const titleEl = document.getElementById('memory-slide-title');
    const dateEl = document.getElementById('memory-slide-date');
    const tagEl = document.getElementById('memory-slide-tag');
    const storyEl = document.getElementById('memory-slide-story');
    const counterEl = document.getElementById('memory-slide-counter');
    const canvasArt = document.getElementById('memory-art-canvas');

    const memories = INTERACTION_PRESETS.gallery_memory.memories;

    if (titleEl) titleEl.textContent = memory.title;
    if (dateEl) dateEl.textContent = memory.date;
    if (tagEl) {
      tagEl.textContent = memory.tag;
      tagEl.style.borderColor = memory.accentColor || '#3b82f6';
      tagEl.style.color = memory.accentColor || '#3b82f6';
    }
    if (storyEl) storyEl.textContent = memory.story;
    if (counterEl) counterEl.textContent = `${this.currentMemoryIndex + 1} / ${memories.length}`;

    // Vẽ tranh minh họa nghệ thuật Pixel lên Canvas
    if (canvasArt) {
      const ctx = canvasArt.getContext('2d');
      ctx.clearRect(0, 0, canvasArt.width, canvasArt.height);

      // Nền gradient
      const grad = ctx.createLinearGradient(0, 0, canvasArt.width, canvasArt.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasArt.width, canvasArt.height);

      // Khung tranh mạ vàng
      ctx.strokeStyle = memory.accentColor || '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvasArt.width - 20, canvasArt.height - 20);

      // Pixel Art Illustration
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(memory.title, canvasArt.width / 2, canvasArt.height / 2 - 10);

      ctx.fillStyle = memory.accentColor || '#38bdf8';
      ctx.font = '14px Outfit, sans-serif';
      ctx.fillText(`DEVER TOWN ARCHIVE • ${memory.date}`, canvasArt.width / 2, canvasArt.height / 2 + 20);
    }
  }

  setupWebsiteView(zoneData) {
    const pane = document.getElementById('pane-website');
    if (!pane) return;
    pane.classList.remove('hidden');

    const meta = zoneData.metadata || {};
    const url = meta.url || INTERACTION_PRESETS.club_website.defaultUrl;

    const input = document.getElementById('web-url-input');
    if (input) input.value = url;

    this.loadWebsiteIframe(url);
  }

  loadWebsiteIframe(url) {
    const iframe = document.getElementById('web-iframe');
    if (iframe) {
      iframe.src = url;
    }

    const openTabBtn = document.getElementById('web-open-tab-btn');
    if (openTabBtn) {
      openTabBtn.href = url;
    }
  }
}
