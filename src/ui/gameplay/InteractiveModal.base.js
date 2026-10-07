/**
 * InteractiveModal.base — core shell of the InteractiveModal class.
 *
 * Holds the constructor, lifecycle (isOpen/openForZone/show/hide), global
 * event wiring (initEvents) and the Pomodoro timer. Every interaction type
 * (slides, meeting, code, coffee, ...) is attached to
 * InteractiveModal.prototype by its own InteractiveModal.<area>.js module,
 * following the prototype-patch pattern established in
 * InteractiveModal.dream.js. InteractiveModal.js imports them all.
 */
import { INTERACTION_PRESETS } from '../../config/interactions.js';
import { extractYouTubeVideoId } from '../../config/musicPresets.js';
import { PomodoroTimer } from '../minigames/PomodoroTimer.js';
import { questManager } from '../../managers/QuestManager.js';
import { audioManager } from '../../utils/AudioManager.js';
import { authService } from '../../services/AuthService.js';
import { voiceService } from '../../services/VoiceService.js';

export class InteractiveModal {
  /**
   * @param {Object} options
   * @param {Function} options.onOpen
   * @param {Function} options.onClose
   * @param {Function} options.onAchievement
   */
  constructor({ onOpen, onClose, onAchievement } = {}) {
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onAchievement = onAchievement;
    this.modalEl = document.getElementById('interactive-modal');
    this.voiceService = voiceService;
    this.currentZone = null;
    this.currentMemoryIndex = 0;
    this.currentSlideSet = null;
    this.currentSlideIndex = 0;

    this.initPomodoro();
    this.initSportsEngine();
    this.initVoiceEngine();
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
          alert('Chỉ Quản trị viên (Admin / Leader) mới có quyền đổi URL Slide bài giảng CLB.');
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
    const prevMemoryBtn = document.getElementById('gallery-prev-btn') || document.getElementById('memory-prev-btn');
    const nextMemoryBtn = document.getElementById('gallery-next-btn') || document.getElementById('memory-next-btn');

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

    window.addEventListener('keydown', (e) => {
      if (!this.isOpen()) return;
      const paneGallery = document.getElementById('pane-gallery');
      if (paneGallery && !paneGallery.classList.contains('hidden')) {
        const memories = INTERACTION_PRESETS.gallery_memory.memories;
        if (e.key === 'ArrowLeft') {
          this.currentMemoryIndex = (this.currentMemoryIndex - 1 + memories.length) % memories.length;
          this.renderMemorySlide(memories[this.currentMemoryIndex]);
        } else if (e.key === 'ArrowRight') {
          this.currentMemoryIndex = (this.currentMemoryIndex + 1) % memories.length;
          this.renderMemorySlide(memories[this.currentMemoryIndex]);
        }
      }
    });

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
        case 'club_booth':
          this.setupClubBoothView(zoneData);
          break;
        case 'rest_bed':
          this.setupRestView(zoneData);
          break;
        case 'bug_dungeon_hunt':
          this.setupBugDungeonView(zoneData);
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

    if (this.voiceService) {
      this.voiceService.leave();
    }
    const voiceLobby = document.getElementById('voice-lobby');
    if (voiceLobby) voiceLobby.classList.remove('hidden');
    const voiceActiveRoom = document.getElementById('voice-active-room');
    if (voiceActiveRoom) voiceActiveRoom.classList.add('hidden');

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
}
