import { audioManager } from '../../utils/AudioManager.js';
import { getEmoteIconURL } from '../../utils/emoteIcons.js';
import { AnalogStick } from './AnalogStick.js';
import { MOVE_MODE_KEY, ANALOG_VISIBLE_KEY } from '../../config/controls.js';

export class TouchControls {
  /**
   * @param {Object} options
   * @param {import('../config/controls.js').InputController} options.inputController
   * @param {import('../scenes/WorldScene.js').WorldScene} options.scene
   */
  constructor({ inputController, scene } = {}) {
    this.inputController = inputController;
    this.scene = scene;
    this.container = document.getElementById('mobile-touch-controls');
    this.analogStick = null;

    this.init();
    this.applyMoveMode(this.getMoveMode());
  }

  /** Chế độ di chuyển: 'dpad' (mặc định) | 'analog'. Lưu localStorage. */
  getMoveMode() {
    try {
      return localStorage.getItem(MOVE_MODE_KEY) === 'analog' ? 'analog' : 'dpad';
    } catch (e) {
      return 'dpad';
    }
  }

  setMoveMode(mode) {
    const m = mode === 'analog' ? 'analog' : 'dpad';
    try {
      localStorage.setItem(MOVE_MODE_KEY, m);
    } catch (e) {}
    this.applyMoveMode(m);
    // Báo cho SettingsModal (nếu đang mở) đồng bộ UI.
    window.dispatchEvent(new CustomEvent('dever:move-mode-changed', { detail: { mode: m } }));
  }

  isAnalogVisible() {
    try {
      return localStorage.getItem(ANALOG_VISIBLE_KEY) !== '0';
    } catch (e) {
      return true;
    }
  }

  setAnalogVisible(visible) {
    if (this.analogStick) {
      this.analogStick.setVisible(visible);
    } else {
      try {
        localStorage.setItem(ANALOG_VISIBLE_KEY, visible ? '1' : '0');
      } catch (e) {}
    }
  }

  isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
  }

  applyMoveMode(mode) {
    const dpadContainer = this.container ? this.container.querySelector('.touch-dpad-container') : null;
    const isAnalog = mode === 'analog';

    if (dpadContainer) {
      dpadContainer.classList.toggle('hidden', isAnalog);
    }

    if (isAnalog) {
      if (!this.analogStick) {
        this.analogStick = new AnalogStick({ inputController: this.inputController });
      }
      // Chỉ bật zone trên thiết bị cảm ứng — desktop không bao giờ chặn click.
      this.analogStick.setEnabled(this.isTouchDevice());
    } else {
      if (this.analogStick) {
        this.analogStick.setEnabled(false);
      }
      // Xóa vector analog còn sót khi chuyển về D-pad.
      if (this.inputController && this.inputController.touchInput) {
        this.inputController.touchInput.analogX = 0;
        this.inputController.touchInput.analogY = 0;
      }
    }
  }

  init() {
    if (!this.container || !this.inputController) return;

    // Thay emoji placeholder bang pixel-art icons (khop voi EmoteBar).
    // Giu nguyen DOM IDs va span badge ben trong nut chat.
    this.injectPixelIcons();

    // 1. D-Pad Direction Buttons
    const dpadButtons = {
      up: document.getElementById('touch-btn-up'),
      down: document.getElementById('touch-btn-down'),
      left: document.getElementById('touch-btn-left'),
      right: document.getElementById('touch-btn-right')
    };

    Object.entries(dpadButtons).forEach(([dir, btn]) => {
      if (!btn) return;

      const setDirection = (active) => {
        if (this.inputController.touchInput) {
          this.inputController.touchInput[dir] = active;
        }
        if (active) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      };

      // Pointer / Touch Handlers
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDirection(true);
      });

      btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        setDirection(false);
      });

      btn.addEventListener('pointercancel', (e) => {
        setDirection(false);
      });

      btn.addEventListener('pointerleave', (e) => {
        setDirection(false);
      });
    });

    // 2. Action Button [E] (Interact)
    const btnE = document.getElementById('touch-btn-interact');
    if (btnE) {
      btnE.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnE.classList.add('active');
        if (this.scene && this.scene.interactionManager) {
          this.scene.interactionManager.interactCurrentZone();
        }
        if (this.inputController && this.inputController.touchInput) {
          this.inputController.touchInput.interactE = true;
        }
        audioManager.playClick();
      });

      btnE.addEventListener('pointerup', () => {
        btnE.classList.remove('active');
      });

      btnE.addEventListener('pointerleave', () => {
        btnE.classList.remove('active');
      });
    }

    // 3. Action Button [I] (Inventory)
    const btnI = document.getElementById('touch-btn-inventory');
    if (btnI) {
      btnI.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnI.classList.add('active');
        if (this.scene && this.scene.inventoryModal) {
          this.scene.inventoryModal.toggle();
        }
        audioManager.playClick();
      });

      btnI.addEventListener('pointerup', () => {
        btnI.classList.remove('active');
      });

      btnI.addEventListener('pointerleave', () => {
        btnI.classList.remove('active');
      });
    }

    // 4. Action Button [⚡] (Speed Duel)
    const btnDuel = document.getElementById('touch-btn-speed-duel');
    if (btnDuel) {
      btnDuel.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnDuel.classList.add('active');
        if (this.scene && this.scene.speedCodeDuel) {
          this.scene.speedCodeDuel.show();
        }
        audioManager.playClick();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      });
      btnDuel.addEventListener('pointerup', () => btnDuel.classList.remove('active'));
      btnDuel.addEventListener('pointerleave', () => btnDuel.classList.remove('active'));
    }

    // 5. Action Button [✨] (Emote Bar)
    const btnEmote = document.getElementById('touch-btn-emote');
    if (btnEmote) {
      btnEmote.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnEmote.classList.add('active');
        if (this.scene && this.scene.emoteBar) {
          this.scene.emoteBar.toggle();
        }
        audioManager.playClick();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      });
      btnEmote.addEventListener('pointerup', () => btnEmote.classList.remove('active'));
      btnEmote.addEventListener('pointerleave', () => btnEmote.classList.remove('active'));
    }

    // 6. Action Button [💬] (Toggle Mobile Chat)
    const btnChat = document.getElementById('touch-btn-chat');
    if (btnChat) {
      btnChat.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        btnChat.classList.add('active');
        if (this.scene && this.scene.chatBox && typeof this.scene.chatBox.openMobileChat === 'function') {
          // Phase 0 fix: toggleMobileChat() không tồn tại — dùng open/close theo trạng thái mobile-open.
          const wrapper = document.getElementById('chat-wrapper');
          const isOpen = wrapper ? wrapper.classList.contains('mobile-open') : false;
          if (isOpen) {
            this.scene.chatBox.closeMobileChat();
          } else {
            this.scene.chatBox.openMobileChat();
          }
        } else {
          const chatWrapper = document.getElementById('chat-wrapper');
          if (chatWrapper) {
            chatWrapper.classList.toggle('mobile-open');
          }
        }
        audioManager.playClick();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
      });
      btnChat.addEventListener('pointerup', () => btnChat.classList.remove('active'));
      btnChat.addEventListener('pointerleave', () => btnChat.classList.remove('active'));
    }

    // Tự động kiểm tra hiển thị trên thiết bị di động
    this.checkVisibility();
    window.addEventListener('resize', () => this.checkVisibility());
  }

  /**
   * Thay emoji trong cac nut action bang pixel-art <img> (16x16 dataURL).
   * Fallback giu emoji neu icon chua duoc sinh (BootScene chua chay).
   */
  injectPixelIcons() {
    const mapping = [
      ['touch-btn-speed-duel', 'touch_duel', 'Đấu Trí Siêu Tốc'],
      ['touch-btn-emote', 'touch_emote', 'Biểu Cảm'],
      ['touch-btn-chat', 'touch_chat', 'Mở Chat'],
      ['touch-btn-inventory', 'touch_bag', 'Túi Đồ']
    ];

    mapping.forEach(([btnId, iconId, alt]) => {
      const btn = document.getElementById(btnId);
      if (!btn || btn.querySelector('.touch-pixel-icon')) return;
      const url = this.scene ? getEmoteIconURL(this.scene, iconId) : null;
      if (!url) return; // fallback: giu emoji cu

      const img = document.createElement('img');
      img.className = 'touch-pixel-icon';
      img.src = url;
      img.alt = alt;
      img.draggable = false;

      // Nut chat co span badge ben trong — chen img truoc span, xoa text node emoji.
      const badge = btn.querySelector('.touch-chat-unread');
      Array.from(btn.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      if (badge) {
        btn.insertBefore(img, badge);
      } else {
        btn.prepend(img);
      }
    });
  }

  checkVisibility() {
    if (!this.container) return;
    const isTouchDevice = this.isTouchDevice();
    if (isTouchDevice) {
      this.container.classList.remove('hidden');
    } else {
      this.container.classList.add('hidden');
    }
    // Desktop: tắt hẳn analog zone để không chặn click chuột.
    if (this.analogStick) {
      const shouldEnable = isTouchDevice && this.getMoveMode() === 'analog';
      this.analogStick.setEnabled(shouldEnable);
    }
  }
}
