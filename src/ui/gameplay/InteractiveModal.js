import { INTERACTION_PRESETS, ROOM_SLIDE_PRESETS } from '../../config/interactions.js';
import { MUSIC_GENRES, LOFI_PRESETS, extractYouTubeVideoId } from '../../config/musicPresets.js';
import { PomodoroTimer } from '../minigames/PomodoroTimer.js';
import { questManager } from '../../managers/QuestManager.js';
import { audioManager } from '../../utils/AudioManager.js';
import { SportsArcade } from '../minigames/SportsArcade.js';
import { RetroArcade } from '../minigames/RetroArcade.js';
import { ROBOT_GAMES } from '../../config/robotGames.js';
import { authService } from '../../services/AuthService.js';

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
    this.currentSlideSet = null;
    this.currentSlideIndex = 0;

    this.initPomodoro();
    this.initSportsEngine();
    this.initEvents();
  }

  initPomodoro() {
    this.pomodoro = new PomodoroTimer({
      onTick: (timeStr, mode) => {
        const timeEl = document.getElementById('pomo-timer') || document.getElementById('pomo-timer-display');
        const badgeEl = document.getElementById('pomo-badge') || document.getElementById('pomo-mode-badge');
        if (timeEl) timeEl.textContent = timeStr;
        if (badgeEl) {
          badgeEl.textContent = mode === 'work' ? 'Tập Trung (Work)' : 'Nghỉ Ngơi (Break)';
          badgeEl.className = `pomo-badge ${mode}`;
        }
      },
      onComplete: (mode) => {
        audioManager.playSuccess();
        const badgeEl = document.getElementById('pomo-badge') || document.getElementById('pomo-mode-badge');
        if (badgeEl) {
          badgeEl.textContent = mode === 'work' ? 'Đã Hoàn Thành (25p)' : 'Sẵn Sàng Làm Việc';
        }
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

    // 4. Lofi Music Loader & Presets (Personal Client Scope)
    const lofiLoadBtn = document.getElementById('lofi-load-btn');
    if (lofiLoadBtn) {
      lofiLoadBtn.addEventListener('click', () => {
        const input = document.getElementById('lofi-url-input');
        if (input && input.value.trim()) {
          const rawUrl = input.value.trim();
          const videoId = extractYouTubeVideoId(rawUrl);
          if (videoId) {
            // Lưu link cá nhân riêng của người chơi hiện tại, không can thiệp người khác
            try {
              localStorage.setItem('dever_personal_lofi_url', rawUrl);
            } catch (e) {}
            this.loadLofiVideo(videoId);
            questManager.incrementProgress('focus_lofi_pomo', 1);
          }
        }
      });
    }

    // 5. Slides (Bảo mật: Chỉ Admin mới có quyền đổi URL ngoài bài giảng)
    const loadSlideBtn = document.getElementById('slide-load-btn');
    if (loadSlideBtn) {
      loadSlideBtn.addEventListener('click', () => {
        if (!authService.isAdmin()) {
          alert('🔒 Chỉ Quản trị viên (Admin / Leader) mới có quyền đổi URL Slide bài giảng CLB.');
          return;
        }
        const input = document.getElementById('slide-url-input');
        if (input && input.value.trim()) {
          this.currentSlideSet = null;
          this.loadSlideIframe(input.value.trim());
          this.showSlideIframe();
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
      sportActionBtn.addEventListener('click', () => {
        if (this.sportsArcade) this.sportsArcade.onActionTrigger();
      });
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
    this.currentRoomId = zoneData.roomId || zoneData.room || window.__DEVER_GAME__?.scene?.keys?.WorldScene?.currentRoomId || 'main_hall';

    const titleEl = document.getElementById('interactive-modal-title');
    const descEl = document.getElementById('interactive-modal-desc');

    if (titleEl) titleEl.textContent = zoneData.name || 'Khu Vực Tương Tác FU-DEVER';
    if (descEl) descEl.textContent = 'FU-DEVER • FPT UNIVERSITY ĐÀ NẴNG • WORK HARD - PLAY HARD';

    const panes = this.modalEl.querySelectorAll('.interactive-pane');
    panes.forEach(p => p.classList.add('hidden'));

    try {
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
          window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('coffee_salt');
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
          window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('campus_scholar');
          break;
        case 'canteen_menus':
          this.setupCanteenMenuView(zoneData);
          break;
        case 'campus_map':
          this.setupCampusMapView(zoneData);
          window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('campus_scholar');
          break;
        case 'dever_charter':
        case 'swe201c_guide':
          this.setupCharterGuideView(zoneData);
          break;
        case 'arcade_games':
          this.setupArcadeGamesView(zoneData);
          break;
        case 'robot_showcase':
          this.setupRobotShowcaseView(zoneData);
          break;
        case 'golden_frog_fortune':
          this.setupGoldenFrogFortuneView(zoneData);
          window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('golden_frog');
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('⚠️ Lỗi khi khởi tạo giao diện tương tác:', err);
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
    if (this.retroArcade) {
      this.retroArcade.stop();
    }
    this.modalEl.classList.add('hidden');

    const panes = this.modalEl.querySelectorAll('.interactive-pane');
    panes.forEach(p => p.classList.add('hidden'));

    const slideIframe = document.getElementById('slide-iframe');
    if (slideIframe) slideIframe.src = 'about:blank';

    const meetingIframe = document.getElementById('meeting-iframe');
    if (meetingIframe) meetingIframe.src = 'about:blank';

    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) lofiIframe.src = 'about:blank';

    const webIframe = document.getElementById('web-iframe');
    if (webIframe) webIframe.src = 'about:blank';

    const gameCanvas = document.querySelector('#game-container canvas');
    if (gameCanvas) {
      gameCanvas.focus();
    }

    if (this.onClose) {
      this.onClose();
    }
  }

  setupSlidesView(zoneData) {
    const pane = document.getElementById('pane-slides');
    if (!pane) return;
    pane.classList.remove('hidden');

    // Bảo mật: Chỉ Admin mới thấy thanh chỉnh sửa URL slide bên ngoài
    const addressBar = pane.querySelector('.slide-address-bar');
    if (addressBar) {
      if (authService.isAdmin()) {
        addressBar.style.display = 'flex';
      } else {
        addressBar.style.display = 'none';
      }
    }

    this.renderSlidePresets(zoneData);

    // Chọn slide phù hợp với phòng hiện tại
    const roomSlide = ROOM_SLIDE_PRESETS.find(s => s.room === this.currentRoomId)
      || ROOM_SLIDE_PRESETS.find(s => s.id === zoneData.id)
      || ROOM_SLIDE_PRESETS[0];

    this.loadSlideEntry(roomSlide);
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

        this.loadSlideEntry(item);
        audioManager.playClick();
      });

      pillsContainer.appendChild(btn);
    });
  }

  loadSlideEntry(item) {
    if (!item) return;
    const input = document.getElementById('slide-url-input');
    if (input) input.value = item.url || '';

    if (item.slides && item.slides.length > 0) {
      // Mode: HTML Slide nội bộ
      this.currentSlideSet = item.slides;
      this.currentSlideIndex = 0;
      this.renderInlineSlide();
    } else if (item.url) {
      // Mode: Iframe
      this.currentSlideSet = null;
      this.loadSlideIframe(item.url);
      this.showSlideIframe();
    }
  }

  renderInlineSlide() {
    const slideSet = this.currentSlideSet;
    if (!slideSet || slideSet.length === 0) return;

    const iframe = document.getElementById('slide-iframe');
    if (iframe) iframe.classList.add('hidden');

    // Tìm hoặc tạo container inline
    let inlineView = document.getElementById('slide-inline-view');
    if (!inlineView) {
      const pane = document.getElementById('pane-slides');
      inlineView = document.createElement('div');
      inlineView.id = 'slide-inline-view';
      inlineView.style.cssText = 'position:relative;width:100%;height:420px;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;';
      if (iframe) iframe.parentNode.insertBefore(inlineView, iframe);
      else pane.appendChild(inlineView);
    }
    inlineView.style.display = 'flex';

    const slide = slideSet[this.currentSlideIndex];
    const total = slideSet.length;
    const idx = this.currentSlideIndex;

    inlineView.innerHTML = `
      <div style="flex:1;background:${slide.bg || '#0f172a'};padding:24px 28px;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;">
        <div style="color:#e2e8f0;font-family:'Outfit',sans-serif;line-height:1.6;">${slide.content}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.7);padding:10px 18px;flex-shrink:0;">
        <button id="slide-prev-btn" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.85rem;" ${idx === 0 ? 'disabled style="opacity:0.4;cursor:default;background:rgba(255,255,255,0.1);border:none;color:#fff;padding:6px 14px;border-radius:8px;"' : ''}>&#8592; Trước</button>
        <div style="display:flex;gap:6px;align-items:center;">
          ${slideSet.map((_,i) => `<span style="width:8px;height:8px;border-radius:50%;background:${i===idx?'#f26f21':'rgba(255,255,255,0.3)'};display:inline-block;"></span>`).join('')}
          <span style="color:#64748b;font-size:0.78rem;margin-left:6px;">${idx+1}/${total}</span>
        </div>
        <button id="slide-next-btn" style="background:rgba(242,111,33,0.8);border:none;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.85rem;" ${idx === total-1 ? 'disabled style="opacity:0.4;cursor:default;background:rgba(242,111,33,0.4);border:none;color:#fff;padding:6px 14px;border-radius:8px;"' : ''}>Tiếp &#8594;</button>
      </div>
    `;

    const prevBtn = document.getElementById('slide-prev-btn');
    const nextBtn = document.getElementById('slide-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (this.currentSlideIndex > 0) { this.currentSlideIndex--; this.renderInlineSlide(); audioManager.playClick(); }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (this.currentSlideIndex < slideSet.length - 1) { this.currentSlideIndex++; this.renderInlineSlide(); audioManager.playClick(); }
    });
  }

  showSlideIframe() {
    const iframe = document.getElementById('slide-iframe');
    if (iframe) iframe.classList.remove('hidden');
    const inlineView = document.getElementById('slide-inline-view');
    if (inlineView) inlineView.style.display = 'none';
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

    // Khôi phục bài hát cá nhân của riêng người chơi nếu có lưu trước đó
    const personalLofi = localStorage.getItem('dever_personal_lofi_url');
    if (personalLofi) {
      const input = document.getElementById('lofi-url-input');
      if (input) input.value = personalLofi;
      const videoId = extractYouTubeVideoId(personalLofi);
      if (videoId) {
        this.loadLofiVideo(videoId);
        return;
      }
    }

    const firstPreset = LOFI_PRESETS[0];
    const initialId = firstPreset ? firstPreset.videoId : 'm7Wya6Z-QdM';
    this.loadLofiVideo(initialId);
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
    const selectEl = document.getElementById('lofi-preset-select');
    if (!selectEl) return;

    const filtered = this.activeMusicGenre === 'all'
      ? LOFI_PRESETS
      : LOFI_PRESETS.filter(p => p.genre === this.activeMusicGenre);

    selectEl.innerHTML = `<option value="">🎵 Chọn bài hát gợi ý có sẵn (${filtered.length} bài)...</option>`;

    filtered.forEach(preset => {
      const opt = document.createElement('option');
      opt.value = preset.videoId;
      opt.textContent = preset.name;
      selectEl.appendChild(opt);
    });

    if (!selectEl.dataset.bound) {
      selectEl.dataset.bound = 'true';
      selectEl.addEventListener('change', () => {
        const vid = selectEl.value;
        if (vid) {
          const input = document.getElementById('lofi-url-input');
          if (input) input.value = `https://youtu.be/${vid}`;
          this.loadLofiVideo(vid);
        }
      });
    }
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

  setupArcadeGamesView(zoneData) {
    const pane = document.getElementById('pane-arcade-games');
    if (!pane) return;
    pane.classList.remove('hidden');

    const canvas = document.getElementById('retro-arcade-canvas');
    if (canvas && !this.retroArcade) {
      this.retroArcade = new RetroArcade(canvas);
    }

    const defaultGame = (zoneData && zoneData.defaultGame) || 'snake';
    if (this.retroArcade) {
      this.retroArcade.setGame(defaultGame);
      this.retroArcade.start();
    }

    const navTabs = document.getElementById('arcade-nav-tabs');
    if (navTabs) {
      navTabs.querySelectorAll('.arcade-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.game === defaultGame);
      });
      if (!navTabs.dataset.initialized) {
        navTabs.dataset.initialized = 'true';
        navTabs.querySelectorAll('.arcade-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            navTabs.querySelectorAll('.arcade-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const game = tab.dataset.game;
            if (this.retroArcade) {
              this.retroArcade.setGame(game);
            }
            audioManager.playClick();
          });
        });
      }
    }
  }

  setupRobotShowcaseView(zoneData) {
    const pane = document.getElementById('pane-robot-showcase');
    if (!pane) return;
    pane.classList.remove('hidden');

    const grid = document.getElementById('robot-games-grid');
    if (!grid) return;

    const isAdmin = authService.isAdmin();

    grid.innerHTML = '';
    ROBOT_GAMES.forEach(game => {
      const savedLink = localStorage.getItem(`dever_robot_link_${game.id}`) || game.link;
      const card = document.createElement('div');
      card.className = 'robot-card';
      card.innerHTML = `
        <div class="robot-card-img" style="display:flex;align-items:center;justify-content:center;font-size:52px;background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;">${game.icon}</div>
        <h3 class="robot-card-title" style="margin-top:10px;font-size:1.15rem;color:#38bdf8;">${game.name}</h3>
        <p class="robot-card-desc" style="font-size:0.85rem;color:#cbd5e1;line-height:1.5;">${game.desc}</p>
        
        <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;margin-top:auto;font-size:11.5px;color:#94a3b8;display:grid;gap:4px;">
          <div><strong style="color:#fbbf24;">📦 Gói cài đặt:</strong> ${game.fileName} (${game.fileSize || 'Zip'})</div>
          <div><strong style="color:#10b981;">🚀 File chạy:</strong> <code style="color:#34d399;background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px;">${game.exeName || 'Game.exe'}</code></div>
          <div><strong style="color:#38bdf8;">🎮 Phím bấm:</strong> ${game.controls}</div>
          <div><strong style="color:#c084fc;">⚙️ Yêu cầu:</strong> ${game.req}</div>
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;">
          <button type="button" class="robot-card-btn" style="flex:1;background:linear-gradient(135deg,#f26f21,#ea580c);color:#fff;font-weight:700;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;" data-game-id="${game.id}">
            <span>⬇️ Tải Game (.exe)</span>
          </button>
          ${isAdmin ? `
            <button type="button" class="robot-edit-link-btn" title="[Admin] Cập nhật link tải của CLB" style="background:rgba(242,111,33,0.15);border:1px solid rgba(242,111,33,0.4);color:#f26f21;border-radius:8px;padding:0 10px;cursor:pointer;font-size:12px;font-weight:700;" data-game-id="${game.id}">
              ✏️ Admin
            </button>
          ` : ''}
        </div>
      `;

      const downloadBtn = card.querySelector('.robot-card-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          const targetUrl = localStorage.getItem(`dever_robot_link_${game.id}`) || game.link;
          audioManager.playClick();
          window.open(targetUrl, '_blank');
        });
      }

      const editBtn = card.querySelector('.robot-edit-link-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          if (!authService.isAdmin()) {
            alert('🔒 Chỉ Quản trị viên (Admin / Leader) mới có quyền đổi link tải game.');
            return;
          }
          const currentUrl = localStorage.getItem(`dever_robot_link_${game.id}`) || game.link;
          const newUrl = prompt(`[Admin] Nhập link tải Google Drive / GitHub / Mediafire cho game "${game.name}":`, currentUrl);
          if (newUrl !== null && newUrl.trim()) {
            localStorage.setItem(`dever_robot_link_${game.id}`, newUrl.trim());
            alert(`✅ [Admin] Đã cập nhật link tải thành công cho "${game.name}"!`);
          }
        });
      }

      grid.appendChild(card);
    });
  }

  /**
   * Thiết lập view Bái Cóc Vàng Tâm Linh & Rút Quẻ Coder Mỗi Ngày
   */
  setupGoldenFrogFortuneView(zoneData) {
    const pane = document.getElementById('pane-golden-frog');
    if (!pane) return;
    pane.classList.remove('hidden');

    const fortunes = [
      { grade: 'ĐẠI CÁT', title: 'Code Không Bug - Deadline Không Dí', desc: 'Build một phát ăn ngay, 0 warnings. Mọi API hôm nay phản hồi 200 OK với tốc độ ánh sáng.', reward: 25 },
      { grade: 'THƯỢNG CÁT', title: 'Logic Sáng Nước - Senior Gật Gù', desc: 'Pull Request được approve ngay trong 5 phút. Code structure mạch lạc chuẩn Clean Architecture.', reward: 20 },
      { grade: 'TRUNG CÁT', title: 'Thuận Buồm Xuôi Gió', desc: 'Gặp bug nan giải? Stack Overflow và Gemini sẽ mang tới câu trả lời đúng trọng tâm ngay dòng đầu tiên.', reward: 15 },
      { grade: 'ĐẠI CÁT', title: 'Pass Môn Rực Rỡ - Cóc Vàng Phù Trợ', desc: 'Kỳ thi Practical Exam (PE) điểm số mỹ mãn. Tinh thần thép, gõ phím như rồng múa.', reward: 30 },
      { grade: 'HỶ CÁT', title: 'Duyên Đến Tự Nhiên', desc: 'Hôm nay crush rủ ngồi chung bàn tại Thư Viện FUDA để thảo luận đề án Software Engineering.', reward: 20 },
      { grade: 'CÁT LÀNH', title: 'Tỉnh Táo & Sáng Tạo', desc: 'Một ngụm Cà phê muối Đà Nẵng mở khóa giải pháp thuật toán O(n) thay vì O(n^2).', reward: 15 },
      { grade: 'BÌNH HÒA', title: 'Tích Tiểu Thành Đại', desc: 'Commit đều tay, giữ vững streak xanh rờn trên GitHub. Mỗi ngày tốt hơn hôm qua 1%.', reward: 15 },
      { grade: 'KHAI TÂM', title: 'Tập Trung Cao Độ', desc: '25 phút Pomodoro không xao nhãng. Một trang giấy sạch, một tâm trí sáng.', reward: 20 }
    ];

    const todayStr = new Date().toISOString().slice(0, 10);
    const storageKey = `dever_frog_fortune_${todayStr}`;
    const savedFortuneRaw = localStorage.getItem(storageKey);

    const gradeEl = document.getElementById('oracle-grade');
    const titleEl = document.getElementById('oracle-title');
    const descEl = document.getElementById('oracle-desc');
    const rewardEl = document.getElementById('oracle-reward');
    const drawBtn = document.getElementById('btn-draw-fortune');

    const renderFortune = (fortune, alreadyClaimed = false) => {
      if (gradeEl) gradeEl.textContent = fortune.grade;
      if (titleEl) titleEl.textContent = fortune.title;
      if (descEl) descEl.textContent = fortune.desc;
      if (rewardEl) {
        rewardEl.textContent = alreadyClaimed
          ? `Đã nhận +${fortune.reward} Dever Points hôm nay`
          : `+${fortune.reward} Dever Points`;
      }
      if (drawBtn) {
        drawBtn.textContent = alreadyClaimed ? 'Hôm Nay Đã Bái Cóc Vàng' : 'Bái Cóc Vàng & Rút Quẻ';
        drawBtn.disabled = alreadyClaimed;
        drawBtn.style.opacity = alreadyClaimed ? '0.6' : '1';
        drawBtn.style.cursor = alreadyClaimed ? 'not-allowed' : 'pointer';
      }
    };

    if (savedFortuneRaw) {
      try {
        const saved = JSON.parse(savedFortuneRaw);
        renderFortune(saved, true);
        return;
      } catch (e) {}
    }

    // Reset view if not claimed today
    renderFortune({
      grade: 'QUẺ HÔM NAY',
      title: 'Bái Cóc Vàng Xin Quẻ',
      desc: 'Thành tâm bái Cóc Vàng để nhận quẻ bói may mắn coder và điểm thưởng mỗi ngày.',
      reward: 20
    }, false);

    if (drawBtn) {
      drawBtn.onclick = () => {
        const picked = fortunes[Math.floor(Math.random() * fortunes.length)];
        localStorage.setItem(storageKey, JSON.stringify(picked));
        audioManager.playVictory();
        questManager.addPoints(picked.reward, 'Bái Cóc Vàng');
        renderFortune(picked, true);
      };
    }
  }
}
