import { INTERACTION_PRESETS, ROOM_SLIDE_PRESETS } from '../config/interactions.js';
import { LOFI_PRESETS, extractYouTubeVideoId } from '../config/musicPresets.js';
import { PomodoroTimer } from './PomodoroTimer.js';
import { questManager } from '../managers/QuestManager.js';
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

    questManager.incrementProgress('focus_lofi_pomo', 1);

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

  startPowerLoop() {
    if (this.sportsAnimId) return;

    const cursorEl = document.getElementById('sports-power-cursor');
    const valEl = document.getElementById('sports-power-val');

    const tick = () => {
      this.sportsPower += this.sportsPowerDir * 1.5;
      if (this.sportsPower >= 100) {
        this.sportsPower = 100;
        this.sportsPowerDir = -1;
      } else if (this.sportsPower <= 0) {
        this.sportsPower = 0;
        this.sportsPowerDir = 1;
      }

      if (cursorEl) {
        cursorEl.style.left = `${this.sportsPower}%`;
      }
      if (valEl) {
        valEl.textContent = `${Math.round(this.sportsPower)}%`;
      }

      this.sportsAnimId = requestAnimationFrame(tick);
    };

    this.sportsAnimId = requestAnimationFrame(tick);
  }

  stopPowerLoop() {
    if (this.sportsAnimId) {
      cancelAnimationFrame(this.sportsAnimId);
      this.sportsAnimId = null;
    }
  }

  setupSportsView(zoneData) {
    const pane = document.getElementById('pane-sports');
    if (!pane) return;
    pane.classList.remove('hidden');

    const meta = zoneData.metadata || {};
    this.sportsGameType = meta.sport || 'football';

    const typeBadge = document.getElementById('sports-type-badge');
    const streakBadge = document.getElementById('sports-streak-badge');
    const highBadge = document.getElementById('sports-high-badge');
    const titleEl = document.getElementById('sports-game-title');
    const descEl = document.getElementById('sports-game-desc');
    const actionBtn = document.getElementById('sports-action-btn');
    const scoreEl = document.getElementById('sports-score-display');
    const dirBar = document.getElementById('sports-direction-bar');
    const roundTracker = document.getElementById('sports-round-tracker');

    if (this.sportsGameType === 'football') {
      if (typeBadge) typeBadge.textContent = '⚽ SÚT PHẠT ĐỀN MINI';
      if (streakBadge) {
        streakBadge.classList.remove('hidden');
        streakBadge.textContent = `🔥 Chuỗi: ${this.penaltyStreak}`;
      }
      if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${this.penaltyHighScore}`;
      if (titleEl) titleEl.textContent = 'SÚT PHẠT ĐỀN 11M FUDA';
      if (descEl) descEl.textContent = 'Chọn góc sút (Trái/Giữa/Phải) và canh lực sút vào Vùng Xanh để đánh bại thủ môn!';
      if (actionBtn) actionBtn.textContent = 'SÚT BÓNG VÀO LƯỚI ⚽';
      if (dirBar) {
        dirBar.classList.remove('hidden');
        dirBar.innerHTML = `
          <button type="button" class="sports-dir-btn" data-dir="left">Góc Trái ↖</button>
          <button type="button" class="sports-dir-btn active" data-dir="center">Chính Diện ⬆</button>
          <button type="button" class="sports-dir-btn" data-dir="right">Góc Phải ↗</button>
        `;
        dirBar.querySelectorAll('.sports-dir-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            dirBar.querySelectorAll('.sports-dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.sportsDirection = btn.dataset.dir;
            audioManager.playClick();
          });
        });
      }
      if (roundTracker) roundTracker.classList.add('hidden');
    } else if (this.sportsGameType === 'barista') {
      if (typeBadge) typeBadge.textContent = '☕ PHA CHẾ CÀ PHÊ MUỐI & TRÀ SỮA';
      if (streakBadge) streakBadge.classList.add('hidden');
      if (highBadge) highBadge.textContent = `🏆 Điểm Barista: ${this.baristaScore || 0}đ`;
      if (titleEl) titleEl.textContent = 'QUẦY BARISTA CÀ PHÊ MUỐI & TRÀ SỮA DEVER';
      if (descEl) descEl.textContent = 'Chọn loại đồ uống và canh chuẩn tỉ lệ vào Vùng Xanh (40%-75%) để pha chế chuẩn vị Barista!';
      if (actionBtn) actionBtn.textContent = 'PHA CHẾ ĐỒ UỐNG ☕';
      if (dirBar) {
        dirBar.classList.remove('hidden');
        dirBar.innerHTML = `
          <button type="button" class="sports-dir-btn active" data-dir="cafe_muoi">☕ Cà Phê Muối</button>
          <button type="button" class="sports-dir-btn" data-dir="bac_xiu">🥛 Bạc Xỉu FPT</button>
          <button type="button" class="sports-dir-btn" data-dir="tra_sua">🧋 Trà Sữa DEVER</button>
        `;
        dirBar.querySelectorAll('.sports-dir-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            dirBar.querySelectorAll('.sports-dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.sportsDirection = btn.dataset.dir;
            audioManager.playClick();
          });
        });
      }
      if (roundTracker) roundTracker.classList.add('hidden');
    } else {
      if (typeBadge) typeBadge.textContent = '🏀 NÉM BÓNG RỔ 3 ĐIỂM';
      if (streakBadge) streakBadge.classList.add('hidden');
      if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${this.basketballHighScore}đ`;
      if (titleEl) titleEl.textContent = 'THỬ THÁCH NÉM BÓNG RỔ 3 ĐIỂM';
      if (descEl) descEl.textContent = 'Phiên thi đấu 10 quả: Canh cự ly rơi hoàn hảo để thực hiện chuỗi ném 3 điểm vào rổ!';
      if (actionBtn) actionBtn.textContent = 'NÉM BÓNG VÀO RỔ 🏀';
      if (dirBar) dirBar.classList.add('hidden');
      if (roundTracker) {
        roundTracker.classList.remove('hidden');
        this.renderBasketballBalls();
      }
    }

    if (scoreEl) scoreEl.textContent = 'Canh thanh lực và nhấn nút để thực hiện!';
    this.startPowerLoop();
  }

  renderBasketballBalls() {
    const ballsRow = document.getElementById('sports-balls-row');
    if (!ballsRow) return;
    ballsRow.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const dot = document.createElement('span');
      dot.className = 'ball-dot';
      if (i < this.basketballShots.length) {
        dot.classList.add(this.basketballShots[i] ? 'hit' : 'miss');
      }
      ballsRow.appendChild(dot);
    }
  }

  playSportMiniGame() {
    const scoreEl = document.getElementById('sports-score-display');
    const streakBadge = document.getElementById('sports-streak-badge');
    const highBadge = document.getElementById('sports-high-badge');
    const power = this.sportsPower;

    if (this.sportsGameType === 'football') {
      // 1. Minigame Sút Phạt Đền (Penalty Shootout)
      const directions = ['left', 'center', 'right'];
      // Thủ môn AI chọn hướng đổ người ngẫu nhiên
      const gkDive = directions[Math.floor(Math.random() * directions.length)];
      const playerDir = this.sportsDirection;

      const isPerfectPower = power >= 35 && power <= 80;
      const isOverPower = power > 85;
      const isWeakPower = power < 30;

      let isGoal = false;
      let reasonText = '';

      if (isOverPower) {
        reasonText = '⚡ Bóng bay vọt xà ngang ra ngoài khung thành!';
      } else if (isWeakPower) {
        reasonText = '🧤 Lực sút quá nhẹ, thủ môn đã ôm gọn trái bóng!';
      } else if (isPerfectPower) {
        if (gkDive !== playerDir || Math.random() > 0.35) {
          isGoal = true;
          reasonText = `🎉 VÀO RỒI! Cú sút căng như kẻ chỉ găm thẳng vào góc ${playerDir === 'left' ? 'trái' : playerDir === 'right' ? 'phải' : 'chính diện'}!`;
        } else {
          reasonText = '🧤 Thủ môn đã bay người cản phá xuất thần!';
        }
      } else {
        if (Math.random() > 0.6) {
          isGoal = true;
          reasonText = '🎉 BÓNG ĐẬP CỘT DỌC BAY VÀO LƯỚI! Bàn thắng may mắn!';
        } else {
          reasonText = '⚡ Bóng trúng mép ngoài cột dọc bật ra!';
        }
      }

      if (isGoal) {
        this.penaltyStreak += 1;
        if (this.penaltyStreak > this.penaltyHighScore) {
          this.penaltyHighScore = this.penaltyStreak;
          localStorage.setItem('dever_penalty_high', this.penaltyHighScore.toString());
        }
        localStorage.setItem('dever_penalty_streak', this.penaltyStreak.toString());

        audioManager.playVictory();
        scoreEl.textContent = `${reasonText} (Chuỗi thắng: 🔥 ${this.penaltyStreak})`;
        scoreEl.className = 'sports-score-text success';

        questManager.incrementProgress('penalty_goal', 1);
        this.syncScoreToServer('penalty', this.penaltyStreak * 10, this.penaltyStreak);
      } else {
        this.penaltyStreak = 0;
        localStorage.setItem('dever_penalty_streak', '0');

        audioManager.playClick();
        scoreEl.textContent = `${reasonText} (Chuỗi thắng bị ngắt!)`;
        scoreEl.className = 'sports-score-text fail';
      }

      if (streakBadge) streakBadge.textContent = `🔥 Chuỗi: ${this.penaltyStreak}`;
      if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${this.penaltyHighScore}`;
    } else if (this.sportsGameType === 'barista') {
      // 2. Minigame Barista Cà Phê Muối & Trà Sữa DEVER
      const isPerfect = power >= 35 && power <= 80;
      const drinkNames = {
        cafe_muoi: 'Cà Phê Muối Đà Nẵng',
        bac_xiu: 'Bạc Xỉu Sữa Tươi 3 Tầng FPT',
        tra_sua: 'Trà Sữa Trân Châu DEVER'
      };
      const drinkName = drinkNames[this.sportsDirection] || 'Cà Phê Muối Đà Nẵng';

      // Luôn ghi nhận hoàn thành nhiệm vụ hằng ngày khi thực hiện pha chế
      questManager.incrementProgress('barista_coffee', 1);
      questManager.incrementProgress('focus_lofi_pomo', 1);

      if (isPerfect) {
        this.baristaScore = (this.baristaScore || 0) + 30;
        audioManager.playVictory();
        scoreEl.textContent = `🎉 THÀNH CÔNG XUẤT SẮC! Ly ${drinkName} chuẩn vị béo ngậy (+30đ Barista & +20 Dever Points)!`;
        scoreEl.className = 'sports-score-text success';
        questManager.addPoints(20, 'Pha chế thành công ' + drinkName);
      } else {
        audioManager.playClick();
        scoreEl.textContent = `☕ Ly ${drinkName} đã pha xong! (Canh vào Vùng Xanh để nhận thêm điểm Barista hoàn hảo nhé!)`;
        scoreEl.className = 'sports-score-text success';
      }
      if (highBadge) highBadge.textContent = `🏆 Điểm Barista: ${this.baristaScore || 0}đ`;
    } else {
      // 3. Minigame Ném Bóng Rổ 3 Điểm (Basketball 3-Point Shootout)
      const isHit = power >= 42 && power <= 78;
      this.basketballShots.push(isHit);

      if (isHit) {
        audioManager.playVictory();
        scoreEl.textContent = `🏀 SWISH! Cú ném 3 điểm hoàn hảo (+3 Điểm)! [Quả ${this.basketballShots.length}/10]`;
        scoreEl.className = 'sports-score-text success';
      } else {
        audioManager.playClick();
        scoreEl.textContent = `⚡ Bóng nảy vành rổ ra ngoài! [Quả ${this.basketballShots.length}/10]`;
        scoreEl.className = 'sports-score-text fail';
      }

      this.renderBasketballBalls();

      if (this.basketballShots.length >= 10) {
        const hits = this.basketballShots.filter(Boolean).length;
        const totalPts = hits * 3;
        const rate = Math.round((hits / 10) * 100);

        if (totalPts > this.basketballHighScore) {
          this.basketballHighScore = totalPts;
          localStorage.setItem('dever_bball_high', this.basketballHighScore.toString());
        }

        questManager.incrementProgress('basketball_shoot', 1);

        setTimeout(() => {
          scoreEl.textContent = `🏆 HOÀN THÀNH PHIÊN NÉM: ${hits}/10 Trúng (${rate}%) - Tổng: ${totalPts} Điểm! ${rate >= 70 ? '⭐ Danh hiệu: Tay Ném Vàng FUDA!' : 'Hãy tiếp tục rèn luyện nhé!'}`;
          scoreEl.className = 'sports-score-text success';
          if (highBadge) highBadge.textContent = `🏆 Kỷ lục: ${this.basketballHighScore}đ`;
          this.syncScoreToServer('basketball', totalPts, hits);
          this.basketballShots = [];
        }, 1200);
      }
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
