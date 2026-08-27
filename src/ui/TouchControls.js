import { audioManager } from '../utils/AudioManager.js';

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
        if (this.inputController.touchInput) {
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

    // 4. Action Button [💬] (Toggle Mobile Chat)
    const btnChat = document.getElementById('touch-btn-chat');
    if (btnChat) {
      btnChat.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const chatWrapper = document.getElementById('chat-wrapper');
        if (chatWrapper) {
          chatWrapper.classList.toggle('mobile-open');
          audioManager.playClick();
        }
      });
    }

    // Tự động kiểm tra hiển thị trên thiết bị di động
    this.checkVisibility();
    window.addEventListener('resize', () => this.checkVisibility());
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
