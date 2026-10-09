import { audioManager } from '../../utils/AudioManager.js';
import { getEmoteIconURL } from '../../utils/emoteIcons.js';

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

    this.init();
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
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
    if (isTouchDevice) {
      this.container.classList.remove('hidden');
    } else {
      this.container.classList.add('hidden');
    }
  }
}
