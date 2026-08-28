import { INTERACTION_PRESETS, ROOM_SLIDE_PRESETS } from '../config/interactions.js';
import { MUSIC_GENRES, LOFI_PRESETS, extractYouTubeVideoId } from '../config/musicPresets.js';
import { PomodoroTimer } from './PomodoroTimer.js';
import { questManager } from '../managers/QuestManager.js';
import { audioManager } from '../utils/AudioManager.js';
import { SportsArcade } from './SportsArcade.js';

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
    this.initSportsEngine();
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

    if (pomoStartBtn) {
      pomoStartBtn.addEventListener('click', () => {
        this.pomodoro.start();
        questManager.incrementProgress('focus_lofi_pomo', 1);
      });
    }
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
          questManager.incrementProgress('focus_lofi_pomo', 1);
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

  openForZone(zoneData) {
    this.show(zoneData);
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
      case 'fptu_student_portal':
        this.setupFptuPortalView(zoneData);
        break;
      case 'canteen_menus':
        this.setupCanteenMenuView(zoneData);
        break;
      case 'campus_map':
        this.setupCampusMapView(zoneData);
        break;
      case 'dever_charter':
      case 'swe201c_guide':
        this.setupCharterGuideView(zoneData);
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
    this.stopPowerLoop();
    if (this.sportsArcade) {
      this.sportsArcade.stop();
    }
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

    this.renderSlidePresets(zoneData);

    // Tự động chọn slide đầu tiên phù hợp với phòng hoặc mặc định
    const roomSlide = ROOM_SLIDE_PRESETS.find(s => s.room === this.currentRoomId) || ROOM_SLIDE_PRESETS[0];
    const initialUrl = roomSlide ? roomSlide.url : INTERACTION_PRESETS.whiteboard_slides.defaultUrl;
    const input = document.getElementById('slide-url-input');
    if (input) input.value = initialUrl;
    this.loadSlideIframe(initialUrl);
  }

  renderSlidePresets(zoneData) {
    const pillsContainer = document.getElementById('slide-presets-pills');
    if (!pillsContainer) return;

    pillsContainer.innerHTML = '';
    ROOM_SLIDE_PRESETS.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `slide-pill-btn ${idx === 0 ? 'active' : ''}`;
      btn.innerHTML = `<span class="pill-room">[${item.roomName}]</span> ${item.title}`;
      btn.title = item.desc;

      btn.addEventListener('click', () => {
        pillsContainer.querySelectorAll('.slide-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const input = document.getElementById('slide-url-input');
        if (input) input.value = item.url;

        this.loadSlideIframe(item.url);
        audioManager.playClick();
      });

      pillsContainer.appendChild(btn);
    });
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
    const langSelect = document.getElementById('code-lang-select');
    const templateBtn = document.getElementById('code-template-btn');
    const notesArea = document.getElementById('notes-textarea');

    const languages = INTERACTION_PRESETS.code_editor.languages;
    let savedLang = 'javascript';
    try {
      savedLang = localStorage.getItem('dever_code_lang') || 'javascript';
    } catch (e) {}

    if (langSelect) {
      langSelect.value = savedLang;
      if (!langSelect.dataset.initialized) {
        langSelect.dataset.initialized = 'true';
        langSelect.addEventListener('change', () => {
          const newLang = langSelect.value;
          try {
            localStorage.setItem('dever_code_lang', newLang);
          } catch (e) {}
          this.loadCodeForLanguage(newLang);
        });
      }
    }

    if (templateBtn && !templateBtn.dataset.initialized) {
      templateBtn.dataset.initialized = 'true';
      templateBtn.addEventListener('click', () => {
        const curLang = langSelect ? langSelect.value : 'javascript';
        const langDef = languages.find(l => l.id === curLang) || languages[0];
        if (codeArea && langDef) {
          codeArea.value = langDef.sample;
          try {
            localStorage.setItem(`dever_code_sandbox_${curLang}`, langDef.sample);
          } catch (e) {}
        }
      });
    }

    if (codeArea && !codeArea.dataset.initialized) {
      codeArea.dataset.initialized = 'true';
      codeArea.addEventListener('input', () => {
        const curLang = langSelect ? langSelect.value : 'javascript';
        try {
          localStorage.setItem(`dever_code_sandbox_${curLang}`, codeArea.value);
        } catch (e) {}
      });
    }

    this.loadCodeForLanguage(savedLang);

    if (notesArea && !notesArea.value) {
      const savedNotes = localStorage.getItem('dever_club_notes');
      notesArea.value = savedNotes || INTERACTION_PRESETS.code_editor.defaultNotes;
    }
  }

  loadCodeForLanguage(langId) {
    const codeArea = document.getElementById('code-textarea');
    if (!codeArea) return;

    const languages = INTERACTION_PRESETS.code_editor.languages;
    const langDef = languages.find(l => l.id === langId) || languages[0];

    let savedCode = null;
    try {
      savedCode = localStorage.getItem(`dever_code_sandbox_${langId}`);
    } catch (e) {}

    codeArea.value = savedCode !== null ? savedCode : (langDef ? langDef.sample : '');
  }

  async executeCode() {
    const codeArea = document.getElementById('code-textarea');
    const outputEl = document.getElementById('code-output');
    const runBtn = document.getElementById('code-run-btn');
    const langSelect = document.getElementById('code-lang-select');
    if (!codeArea || !outputEl) return;

    const code = codeArea.value.trim();
    if (!code) {
      outputEl.textContent = '⚠️ Vui lòng nhập mã nguồn trước khi thực thi.';
      return;
    }

    const selectedLang = langSelect ? langSelect.value : 'javascript';
    const languages = INTERACTION_PRESETS.code_editor.languages;
    const langDef = languages.find(l => l.id === selectedLang) || languages[0];

    if (runBtn) {
      runBtn.disabled = true;
      runBtn.innerHTML = '⏳ Đang chạy...';
    }

    outputEl.textContent = `[${langDef.name}] Đang biên dịch & thực thi mã nguồn...\n`;

    // 1. JavaScript Engine (Chạy an toàn ngay trong browser)
    if (selectedLang === 'javascript') {
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args) => logs.push('❌ Error: ' + args.join(' ')),
        warn: (...args) => logs.push('⚠️ Warning: ' + args.join(' ')),
        info: (...args) => logs.push('ℹ️ Info: ' + args.join(' '))
      };

      try {
        const startTime = performance.now();
        const runFn = new Function('console', code);
        runFn(customConsole);
        const elapsed = (performance.now() - startTime).toFixed(1);
        const outText = logs.length > 0 ? logs.join('\n') : 'Chương trình thực thi thành công (Không có console output).';
        outputEl.textContent = `=== KẾT QUẢ THỰC THI (JavaScript Engine • ${elapsed}ms) ===\n${outText}`;
      } catch (err) {
        outputEl.textContent = `❌ Lỗi thực thi JavaScript: ${err.message}`;
      } finally {
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.innerHTML = 'Chạy Code &rtrif;';
        }
      }
      return;
    }

    // 2. Các ngôn ngữ khác (C, C++, Java, Pascal, Python, Go, Rust, C#, PHP) qua Wandbox Compiler Engine
    try {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: langDef.wandboxCompiler || 'cpython-3.12.7',
          code: code
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const elapsed = (performance.now() - startTime).toFixed(0);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const status = result.status; // "0" is success
      const stdout = result.program_output || '';
      const stderr = result.program_error || '';
      const compilerError = result.compiler_error || '';
      const compilerMsg = result.compiler_message || '';

      let displayText = `=== KẾT QUẢ BIÊN DỊCH & THỰC THI (${langDef.name} • ${elapsed}ms | Status: ${status === '0' ? 'Thành công (0)' : 'Lỗi (' + status + ')'}) ===\n`;

      if (compilerError) {
        displayText += `❌ LỖI BIÊN DỊCH (Compiler Error):\n${compilerError}\n`;
      } else if (compilerMsg && compilerMsg.includes('warning')) {
        displayText += `⚠️ CẢNH BÁO BIÊN DỊCH:\n${compilerMsg}\n\n`;
      }

      if (stdout) {
        displayText += stdout;
      }
      if (stderr) {
        displayText += (stdout ? '\n\n' : '') + `⚠️ RUNTIME STDERR:\n${stderr}`;
      }
      if (!stdout && !stderr && !compilerError) {
        displayText += 'Chương trình thực thi hoàn tất không có output.';
      }

      outputEl.textContent = displayText;
    } catch (err) {
      if (err.name === 'AbortError') {
        outputEl.textContent = `⏱️ Quá thời gian chờ (Timeout 25s): Trình biên dịch ${langDef.name} mất quá nhiều thời gian để phản hồi.`;
      } else {
        outputEl.textContent = `⚠️ Lỗi kết nối máy chủ biên dịch (${langDef.name}): ${err.message}\n💡 Mẹo: Vui lòng kiểm tra kết nối mạng Internet. Đối với JavaScript, bạn có thể chạy Offline 100%.`;
      }
    } finally {
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.innerHTML = 'Chạy Code &rtrif;';
      }
    }
  }

  setupCoffeeView(zoneData) {
    const pane = document.getElementById('pane-coffee');
    if (!pane) return;
    pane.classList.remove('hidden');

    questManager.incrementProgress('focus_lofi_pomo', 1);

    this.activeMusicGenre = this.activeMusicGenre || 'all';
    this.renderMusicGenreTabs();
    this.renderLofiPresets();
    this.loadLofiVideo('jfKfPfyJRdk');
  }

  renderMusicGenreTabs() {
    const nav = document.getElementById('lofi-genres-nav');
    if (!nav) return;

    nav.innerHTML = '';
    MUSIC_GENRES.forEach(g => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `lofi-genre-pill ${this.activeMusicGenre === g.id ? 'active' : ''}`;
      btn.textContent = g.name;
      btn.addEventListener('click', () => {
        this.activeMusicGenre = g.id;
        this.renderMusicGenreTabs();
        this.renderLofiPresets();
      });
      nav.appendChild(btn);
    });
  }

  renderLofiPresets() {
    const listEl = document.getElementById('lofi-presets-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const filtered = this.activeMusicGenre === 'all'
      ? LOFI_PRESETS
      : LOFI_PRESETS.filter(p => p.genre === this.activeMusicGenre);

    filtered.forEach(preset => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lofi-preset-btn';
      btn.textContent = preset.name;
      btn.title = preset.desc;

      btn.addEventListener('click', () => {
        listEl.querySelectorAll('.lofi-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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

  initSportsEngine() {
    this.sportsGameType = 'football';
    this.sportsDirection = 'center';
    this.sportsPower = 50;
    this.sportsPowerDir = 1;
    this.sportsAnimId = null;
    this.penaltyStreak = parseInt(localStorage.getItem('dever_penalty_streak') || '0', 10);
    this.penaltyHighScore = parseInt(localStorage.getItem('dever_penalty_high') || '0', 10);
    this.basketballShots = [];
    this.basketballHighScore = parseInt(localStorage.getItem('dever_bball_high') || '0', 10);

    const dirBtns = document.querySelectorAll('.sports-dir-btn');
    dirBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dirBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sportsDirection = btn.dataset.dir || 'center';
        audioManager.playClick();
      });
    });
  }

  setupSportsView(zoneData) {
    const pane = document.getElementById('pane-sports');
    if (!pane) return;
    pane.classList.remove('hidden');

    const meta = zoneData.metadata || {};
    const initialSport = meta.sport || 'football';

    const canvas = document.getElementById('sports-arcade-canvas');
    if (canvas && !this.sportsArcade) {
      this.sportsArcade = new SportsArcade(canvas, {
        onScoreUpdate: ({ game, scores }) => {
          this.updateSportsBadges(game, scores);
        }
      });
    }

    if (this.sportsArcade) {
      this.sportsArcade.setGame(initialSport);
      this.sportsArcade.start();
    }

    // Tabs navigation
    const navTabs = document.getElementById('sports-nav-tabs');
    if (navTabs && !navTabs.dataset.initialized) {
      navTabs.dataset.initialized = 'true';
      navTabs.querySelectorAll('.sports-nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          navTabs.querySelectorAll('.sports-nav-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const sport = tab.dataset.sport;
          if (this.sportsArcade) {
            this.sportsArcade.setGame(sport);
          }
          this.syncSportsTabUI(sport);
        });
      });
    }

    // Action button
    const actionBtn = document.getElementById('sports-action-btn');
    if (actionBtn && !actionBtn.dataset.initialized) {
      actionBtn.dataset.initialized = 'true';
      actionBtn.addEventListener('click', () => {
        if (this.sportsArcade) this.sportsArcade.onActionTrigger();
      });
    }

    // Touch controls for mobile / directional
    const btnLeft = document.getElementById('sports-btn-left');
    const btnRight = document.getElementById('sports-btn-right');
    const btnJump = document.getElementById('sports-btn-jump');

    if (btnLeft && !btnLeft.dataset.initialized) {
      btnLeft.dataset.initialized = 'true';
      btnLeft.addEventListener('pointerdown', () => { if (this.sportsArcade) this.sportsArcade.keys.left = true; });
      btnLeft.addEventListener('pointerup', () => { if (this.sportsArcade) this.sportsArcade.keys.left = false; });
    }
    if (btnRight && !btnRight.dataset.initialized) {
      btnRight.dataset.initialized = 'true';
      btnRight.addEventListener('pointerdown', () => { if (this.sportsArcade) this.sportsArcade.keys.right = true; });
      btnRight.addEventListener('pointerup', () => { if (this.sportsArcade) this.sportsArcade.keys.right = false; });
    }
    if (btnJump && !btnJump.dataset.initialized) {
      btnJump.dataset.initialized = 'true';
      btnJump.addEventListener('click', () => { if (this.sportsArcade) this.sportsArcade.onActionTrigger(); });
    }

    this.syncSportsTabUI(initialSport);
  }

  syncSportsTabUI(sport) {
    const navTabs = document.getElementById('sports-nav-tabs');
    if (navTabs) {
      navTabs.querySelectorAll('.sports-nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.sport === sport);
      });
    }

    const typeBadge = document.getElementById('sports-type-badge');
    const descEl = document.getElementById('sports-game-desc');
    const actionBtn = document.getElementById('sports-action-btn');
    const touchControls = document.getElementById('sports-touch-controls');

    if (touchControls) {
      touchControls.classList.toggle('hidden', sport !== 'volleyball');
    }

    if (sport === 'football') {
      if (typeBadge) typeBadge.textContent = '⚽ SÚT PHẠT ĐỀN 11M';
      if (descEl) descEl.textContent = 'Canh thanh ngắm qua lại và nhấn nút (hoặc phím SPACE) để sút bóng vào lưới đánh bại thủ môn!';
      if (actionBtn) actionBtn.textContent = 'SÚT BÓNG NGAY (SPACE) ⚽';
    } else if (sport === 'basketball') {
      if (typeBadge) typeBadge.textContent = '🏀 BÓNG RỔ FLAPPY DUNK';
      if (descEl) descEl.textContent = 'Bấm phím SPACE hoặc Click để nhấp bóng nảy lên, căn lực rơi lọt qua từng chiếc rổ để ghi điểm!';
      if (actionBtn) actionBtn.textContent = 'NHẢY BÓNG (SPACE) 🏀';
    } else if (sport === 'volleyball') {
      if (typeBadge) typeBadge.textContent = '🏐 BÓNG CHUYỀN SPIKE RALLY';
      if (descEl) descEl.textContent = 'Dùng phím A/D (hoặc nút bấm) di chuyển, SPACE để nhảy đập bóng đối đầu với Bot FUDA!';
      if (actionBtn) actionBtn.textContent = 'NHẢY & ĐẬP BÓNG (SPACE) 🏐';
    } else if (sport === 'barista') {
      if (typeBadge) typeBadge.textContent = '☕ QUẦY BARISTA DEVER';
      if (descEl) descEl.textContent = 'Canh con trỏ vào Vùng Xanh và bấm nút để pha chế ly Cà Phê Muối / Trà Sữa béo ngậy!';
      if (actionBtn) actionBtn.textContent = 'PHA CHẾ ĐỒ UỐNG ☕';
    }

    if (this.sportsArcade) {
      this.updateSportsBadges(sport, this.sportsArcade.scores);
    }
  }

  updateSportsBadges(sport, scores) {
    const streakBadge = document.getElementById('sports-streak-badge');
    const highBadge = document.getElementById('sports-high-badge');

    if (sport === 'football') {
      if (streakBadge) {
        streakBadge.classList.remove('hidden');
        streakBadge.textContent = `🔥 Chuỗi: ${scores.footballStreak || 0}`;
      }
      if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${scores.footballHigh || 0}`;
    } else if (sport === 'basketball') {
      if (streakBadge) {
        streakBadge.classList.remove('hidden');
        streakBadge.textContent = `🏀 Điểm: ${scores.basketballScore || 0}`;
      }
      if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${scores.basketballHigh || 0}đ`;
    } else if (sport === 'volleyball') {
      if (streakBadge) {
        streakBadge.classList.remove('hidden');
        streakBadge.textContent = `🔥 Rally: ${scores.volleyballRally || 0}`;
      }
      if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${scores.volleyballHigh || 0}`;
    } else if (sport === 'barista') {
      if (streakBadge) streakBadge.classList.add('hidden');
      if (highBadge) highBadge.textContent = `🏆 Điểm Barista: ${scores.baristaScore || 0}đ`;
    }
  }

  stopPowerLoop() {
    if (this.sportsArcade) {
      this.sportsArcade.stop();
    }
  }

  async syncScoreToServer(gameType, score, streak) {
    try {
      const token = localStorage.getItem('dever_token');
      const userRaw = localStorage.getItem('dever_user');
      const user = userRaw ? JSON.parse(userRaw) : null;

      await fetch('/api/game/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          gameType,
          score,
          streak,
          userId: user ? user.id : undefined,
          playerName: user ? (user.display_name || user.displayName) : 'Khách FUDA'
        })
      });
    } catch (e) {
      // Offline fallback
    }
  }

  setupFptuPortalView(zoneData) {
    const pane = document.getElementById('pane-fptu-portal');
    if (!pane) return;
    pane.classList.remove('hidden');

    const portalDef = INTERACTION_PRESETS.fptu_student_portal;
    const systemsGrid = document.getElementById('fptu-systems-grid');
    const examGrid = document.getElementById('fptu-exam-apps-grid');

    if (systemsGrid) {
      systemsGrid.innerHTML = '';
      portalDef.systems.forEach(sys => {
        const card = document.createElement('a');
        card.href = sys.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'fptu-system-card';
        card.innerHTML = `
          <div class="fptu-card-header">
            <span class="fptu-card-badge" style="background: ${sys.color}20; color: ${sys.color}; border: 1px solid ${sys.color}40;">${sys.badge}</span>
            <span class="fptu-card-arrow">↗</span>
          </div>
          <h4 class="fptu-card-name">${sys.name}</h4>
          <p class="fptu-card-desc">${sys.desc}</p>
        `;
        card.addEventListener('click', () => audioManager.playClick());
        systemsGrid.appendChild(card);
      });
    }

    if (examGrid) {
      examGrid.innerHTML = '';
      portalDef.examApps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'fptu-exam-card';
        card.innerHTML = `
          <div class="exam-card-badge">${app.tag}</div>
          <h4 class="exam-card-name">${app.name}</h4>
          <p class="exam-card-purpose">${app.purpose}</p>
          <p class="exam-card-guide">💡 ${app.guide}</p>
          <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="exam-card-download-btn">
            📥 Tải Bộ Cài Đặt / Truy Cập
          </a>
        `;
        const btn = card.querySelector('.exam-card-download-btn');
        if (btn) btn.addEventListener('click', () => audioManager.playClick());
        examGrid.appendChild(card);
      });
    }
  }

  setupCanteenMenuView(zoneData) {
    const pane = document.getElementById('pane-canteen-menu');
    if (!pane) return;
    pane.classList.remove('hidden');

    const canteenDef = INTERACTION_PRESETS.canteen_menus;
    const tabsBar = document.getElementById('canteen-tabs-bar');
    const imgEl = document.getElementById('canteen-menu-img');
    const fullBtn = document.getElementById('canteen-img-full-btn');
    const titleEl = document.getElementById('canteen-tab-title');
    const descEl = document.getElementById('canteen-tab-desc');
    const highlightsList = document.getElementById('canteen-highlights-list');

    const selectTab = (tab) => {
      if (imgEl) imgEl.src = tab.image;
      if (fullBtn) fullBtn.href = tab.image;
      if (titleEl) titleEl.textContent = tab.name;
      if (descEl) descEl.textContent = tab.desc;

      if (highlightsList) {
        highlightsList.innerHTML = '';
        tab.highlights.forEach(h => {
          const item = document.createElement('div');
          item.className = 'canteen-highlight-item';
          item.textContent = h;
          highlightsList.appendChild(item);
        });
      }

      if (tabsBar) {
        tabsBar.querySelectorAll('.canteen-tab-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.tabId === tab.id);
        });
      }
    };

    if (tabsBar) {
      tabsBar.innerHTML = '';
      canteenDef.tabs.forEach((tab, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.tabId = tab.id;
        btn.className = `canteen-tab-btn ${idx === 0 ? 'active' : ''}`;
        btn.textContent = tab.name;
        btn.addEventListener('click', () => {
          audioManager.playClick();
          selectTab(tab);
        });
        tabsBar.appendChild(btn);
      });
    }

    if (canteenDef.tabs.length > 0) {
      selectTab(canteenDef.tabs[0]);
    }
  }

  setupCampusMapView(zoneData) {
    const pane = document.getElementById('pane-campus-map');
    if (!pane) return;
    pane.classList.remove('hidden');

    const mapDef = INTERACTION_PRESETS.campus_map;
    const listEl = document.getElementById('campus-locations-list');

    if (listEl) {
      listEl.innerHTML = '';
      mapDef.locations.forEach(loc => {
        const item = document.createElement('div');
        item.className = 'campus-loc-item';
        item.innerHTML = `
          <span class="loc-num">${loc.num}</span>
          <div class="loc-details">
            <h4 class="loc-name">${loc.name}</h4>
            <p class="loc-desc">${loc.desc}</p>
          </div>
        `;
        listEl.appendChild(item);
      });
    }
  }

  setupCharterGuideView(zoneData) {
    const pane = document.getElementById('pane-charter-guide');
    if (!pane) return;
    pane.classList.remove('hidden');

    const charterTabBtn = document.getElementById('tab-btn-charter');
    const sweTabBtn = document.getElementById('tab-btn-swe');
    const contentBox = document.getElementById('charter-content-box');

    const renderCharter = () => {
      if (charterTabBtn) charterTabBtn.classList.add('active');
      if (sweTabBtn) sweTabBtn.classList.remove('active');
      const def = INTERACTION_PRESETS.dever_charter;

      if (contentBox) {
        contentBox.innerHTML = `
          <div class="charter-doc-card">
            <h3 class="charter-doc-title">${def.title}</h3>
            <p class="charter-doc-sub">${def.description}</p>
            <div class="charter-info-grid">
              <div class="charter-stat"><strong>🎯 Sứ Mệnh:</strong> ${def.mission}</div>
              <div class="charter-stat"><strong>🌟 Tầm Nhìn:</strong> ${def.vision}</div>
              <div class="charter-stat"><strong>💰 Lệ Phí Hoạt Động:</strong> ${def.fee}</div>
            </div>
            <h4 class="charter-sec-heading">Cơ Cấu Ban Chủ Nhiệm (BCN) CLB</h4>
            <div class="charter-roles-list">
              ${def.roles.map(r => `
                <div class="charter-role-item">
                  <strong>${r.title}:</strong> <span>${r.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    };

    const renderSWE = () => {
      if (charterTabBtn) charterTabBtn.classList.remove('active');
      if (sweTabBtn) sweTabBtn.classList.add('active');
      const def = INTERACTION_PRESETS.swe201c_guide;

      if (contentBox) {
        contentBox.innerHTML = `
          <div class="charter-doc-card">
            <h3 class="charter-doc-title">${def.title}</h3>
            <p class="charter-doc-sub">${def.description}</p>
            <div class="swe-authors-tag">✍️ Tác giả: <strong>${def.authors}</strong> (FU-DEVER Special Edition)</div>
            <h4 class="charter-sec-heading">5 Chủ Đề Trọng Tâm Đề Thi PE SWE201c Thực Tế</h4>
            <div class="swe-topics-list">
              ${def.topics.map(t => `
                <div class="swe-topic-item">
                  <h5 class="swe-topic-name">${t.name}</h5>
                  <p class="swe-topic-desc">${t.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    };

    if (charterTabBtn) {
      charterTabBtn.onclick = () => {
        audioManager.playClick();
        renderCharter();
      };
    }
    if (sweTabBtn) {
      sweTabBtn.onclick = () => {
        audioManager.playClick();
        renderSWE();
      };
    }

    if (zoneData.type === 'swe201c_guide') {
      renderSWE();
    } else {
      renderCharter();
    }
  }
}
