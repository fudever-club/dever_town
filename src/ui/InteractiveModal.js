import { INTERACTION_PRESETS } from '../config/interactions.js';
import { LOFI_PRESETS, extractYouTubeVideoId } from '../config/musicPresets.js';
import { PomodoroTimer } from './PomodoroTimer.js';
import { audioManager } from '../utils/AudioManager.js';

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

    const closeBtn = document.getElementById('interactive-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });

    // 1. Code Editor
    const runCodeBtn = document.getElementById('code-run-btn');
    if (runCodeBtn) {
      runCodeBtn.addEventListener('click', () => this.executeCode());
    }

    // 2. Notes
    const notesInput = document.getElementById('notes-textarea');
    if (notesInput) {
      const saved = localStorage.getItem('dever_club_notes');
      if (saved) notesInput.value = saved;
      notesInput.addEventListener('input', () => {
        localStorage.setItem('dever_club_notes', notesInput.value);
      });
    }

    // 3. Pomodoro
    const pomoStartBtn = document.getElementById('pomo-start-btn');
    const pomoPauseBtn = document.getElementById('pomo-pause-btn');
    const pomoResetBtn = document.getElementById('pomo-reset-btn');

    if (pomoStartBtn) pomoStartBtn.addEventListener('click', () => this.pomodoro.start());
    if (pomoPauseBtn) pomoPauseBtn.addEventListener('click', () => this.pomodoro.pause());
    if (pomoResetBtn) pomoResetBtn.addEventListener('click', () => this.pomodoro.reset('work'));

    // 4. Lofi Music Loader & Presets
    const lofiLoadBtn = document.getElementById('lofi-load-btn');
    if (lofiLoadBtn) {
      lofiLoadBtn.addEventListener('click', () => {
        const input = document.getElementById('lofi-url-input');
        if (input && input.value.trim()) {
          const videoId = extractYouTubeVideoId(input.value.trim());
          this.loadLofiVideo(videoId);
        }
      });
    }

    // 5. Slides
    const loadSlideBtn = document.getElementById('slide-load-btn');
    if (loadSlideBtn) {
      loadSlideBtn.addEventListener('click', () => {
        const input = document.getElementById('slide-url-input');
        if (input && input.value.trim()) {
          this.loadSlideIframe(input.value.trim());
        }
      });
    }

    // 6. Memory Gallery
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

    // 7. Sports Game Action
    const sportActionBtn = document.getElementById('sports-action-btn');
    if (sportActionBtn) {
      sportActionBtn.addEventListener('click', () => this.playSportMiniGame());
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

    if (titleEl) titleEl.textContent = zoneData.name || 'Khu Vực Tương Tác FU-DEVER';
    if (descEl) descEl.textContent = 'FU-DEVER • FPT UNIVERSITY ĐÀ NẴNG • WORK HARD - PLAY HARD';

    const panes = this.modalEl.querySelectorAll('.interactive-pane');
    panes.forEach(p => p.classList.add('hidden'));

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
      case 'sports_activity':
        this.setupSportsView(zoneData);
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
    this.loadSlideIframe(preset.defaultUrl);
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

    const roomName = `FU_DEVER_${zoneData.id || 'Alpha'}`;
    const jitsiUrl = INTERACTION_PRESETS.meeting_stage.getJitsiUrl(roomName);

    const iframe = document.getElementById('meeting-iframe');
    if (iframe) iframe.src = jitsiUrl;

    const gmeetBtn = document.getElementById('gmeet-open-btn');
    if (gmeetBtn) gmeetBtn.href = `https://meet.google.com/new`;
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

    this.renderLofiPresets();
    this.loadLofiVideo('jfKfPfyJRdk');
  }

  renderLofiPresets() {
    const listEl = document.getElementById('lofi-presets-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    LOFI_PRESETS.forEach(preset => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lofi-preset-btn';
      btn.textContent = preset.name;
      btn.title = preset.desc;

      btn.addEventListener('click', () => {
        const input = document.getElementById('lofi-url-input');
        if (input) input.value = `https://youtu.be/${preset.videoId}`;
        this.loadLofiVideo(preset.videoId);
      });

      listEl.appendChild(btn);
    });
  }

  loadLofiVideo(videoId) {
    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) {
      lofiIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1`;
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
      tagEl.style.borderColor = memory.accentColor || '#0066CC';
      tagEl.style.color = memory.accentColor || '#0066CC';
    }
    if (storyEl) storyEl.textContent = memory.story;
    if (counterEl) counterEl.textContent = `${this.currentMemoryIndex + 1} / ${memories.length}`;

    if (canvasArt) {
      const ctx = canvasArt.getContext('2d');
      ctx.clearRect(0, 0, canvasArt.width, canvasArt.height);

      const grad = ctx.createLinearGradient(0, 0, canvasArt.width, canvasArt.height);
      grad.addColorStop(0, '#002147');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasArt.width, canvasArt.height);

      ctx.strokeStyle = memory.accentColor || '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvasArt.width - 20, canvasArt.height - 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(memory.title, canvasArt.width / 2, canvasArt.height / 2 - 12);

      ctx.fillStyle = memory.accentColor || '#38bdf8';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillText(`FU-DEVER • FPTU ĐÀ NẴNG • ${memory.date}`, canvasArt.width / 2, canvasArt.height / 2 + 18);
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
    this.renderPortalQuickLinks();
  }

  renderPortalQuickLinks() {
    const container = document.getElementById('web-portals-container');
    if (!container) return;

    container.innerHTML = '';
    const portals = INTERACTION_PRESETS.club_website.portals;

    portals.forEach(p => {
      const a = document.createElement('a');
      a.className = 'web-quick-link';
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = p.name;
      container.appendChild(a);
    });
  }

  loadWebsiteIframe(url) {
    const iframe = document.getElementById('web-iframe');
    if (iframe) iframe.src = url;

    const openTabBtn = document.getElementById('web-open-tab-btn');
    if (openTabBtn) openTabBtn.href = url;
  }

  setupSportsView(zoneData) {
    const pane = document.getElementById('pane-sports');
    if (!pane) return;
    pane.classList.remove('hidden');

    const meta = zoneData.metadata || {};
    const titleEl = document.getElementById('sports-game-title');
    const descEl = document.getElementById('sports-game-desc');
    const actionBtn = document.getElementById('sports-action-btn');
    const scoreEl = document.getElementById('sports-score-display');

    if (titleEl) titleEl.textContent = meta.title || 'HOẠT ĐỘNG THỂ THAO FPTU';
    if (descEl) {
      descEl.textContent = meta.sport === 'football'
        ? '⚽ Hãy canh lực sút bóng vào góc chữ A để ghi bàn thắng vàng cho FU-DEVER!'
        : '🏀 Hãy canh cự ly để thực hiện cú ném 3 điểm hoàn hảo vào rổ FPTU!';
    }
    if (actionBtn) {
      actionBtn.textContent = meta.sport === 'football' ? 'SÚT BÓNG VÀO LƯỚI ⚽' : 'NÉM BÓNG VÀO RỔ 🏀';
    }
    if (scoreEl) scoreEl.textContent = 'Sẵn sàng thi đấu!';
  }

  playSportMiniGame() {
    const scoreEl = document.getElementById('sports-score-display');
    const meta = this.currentZone?.metadata || {};
    const rand = Math.random();

    if (rand > 0.3) {
      const pts = Math.floor(Math.random() * 3) + 1;
      audioManager.playVictory();
      scoreEl.textContent = `🎉 VÀO RỒI! Bạn vừa thực hiện pha ghi điểm đẳng cấp (+${pts} Điểm)!`;
      scoreEl.className = 'sports-score-text success';
    } else {
      audioManager.playClick();
      scoreEl.textContent = `⚡ Tiếc quá! Bóng đã trúng xà ngang cột dọc! Hãy thử lại phát nữa nhé!`;
      scoreEl.className = 'sports-score-text fail';
    }
  }
}
