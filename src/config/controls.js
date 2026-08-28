import Phaser from 'phaser';

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.isDisabled = false;

    // 1. Tắt Key Captures mặc định của Phaser để không chặn phím trên input
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.clearCaptures();
      scene.input.keyboard.preventDefault = false;
    }

    // 2. Khởi tạo phím di chuyển và phím tương tác
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Trạng thái Touch D-Pad dành cho Mobile
    this.touchInput = {
      up: false,
      down: false,
      left: false,
      right: false,
      interactE: false
    };

    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.clearCaptures();
      scene.input.keyboard.preventDefault = false;
    }

    // 3. Trình quản lý Focus / Blur toàn cục chống kẹt phím khi dùng chuột
    this.setupGlobalFocusManager();
  }

  setupGlobalFocusManager() {
    if (typeof document === 'undefined') return;

    // Khi người dùng focus vào ô nhập liệu
    document.addEventListener('focusin', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        if (!e.target.closest('.hidden') && !e.target.closest('.fade-out')) {
          if (this.scene?.input?.keyboard) {
            this.scene.input.keyboard.enabled = false;
          }
          if (this.scene?.player) {
            this.scene.player.stopMovement();
          }
        }
      }
    });

    // Khi người dùng click ra ngoài ô nhập liệu
    document.addEventListener('focusout', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        setTimeout(() => {
          if (!this.isTypingActive() && !this.isModalOpen()) {
            this.enableInput();
          }
        }, 50);
      }
    });

    // Khi click chuột ở bất kỳ đâu ngoài ô gõ văn bản -> Tự động khôi phục điều khiển game
    window.addEventListener('pointerdown', (e) => {
      const isTypingField = e.target.closest('input, textarea, [contenteditable="true"]');
      if (!isTypingField && !this.isModalOpen()) {
        this.enableInput();
        const canvas = document.querySelector('#game-container canvas');
        if (canvas) {
          canvas.focus();
        }
      }
    });

    // Khi quay lại tab trình duyệt
    window.addEventListener('focus', () => {
      if (!this.isTypingActive() && !this.isModalOpen()) {
        this.enableInput();
      }
    });
  }

  isTypingActive() {
    if (typeof document === 'undefined') return false;
    const activeEl = document.activeElement;
    if (!activeEl) return false;

    const isField = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;
    if (!isField) return false;

    // Nếu ô nhập liệu đang nằm trong một modal bị ẩn (hidden / fade-out) -> tự động blur và không tính là đang gõ
    if (activeEl.closest('.hidden') || activeEl.closest('.fade-out')) {
      if (typeof activeEl.blur === 'function') activeEl.blur();
      return false;
    }

    return true;
  }

  isModalOpen() {
    if (typeof document === 'undefined') return false;
    const welcomeGate = document.getElementById('welcome-gate');
    const gameLoading = document.getElementById('game-loading-screen');
    const authModal = document.getElementById('auth-modal');
    const interactiveModal = document.getElementById('interactive-modal');
    const inventoryModal = document.getElementById('inventory-modal');
    const wardrobeModal = document.getElementById('wardrobe-modal');
    const settingsModal = document.getElementById('settings-modal');
    const questModal = document.getElementById('quest-modal');

    if (welcomeGate && !welcomeGate.classList.contains('hidden') && !welcomeGate.classList.contains('fade-out')) return true;
    if (gameLoading && !gameLoading.classList.contains('hidden') && !gameLoading.classList.contains('fade-out')) return true;
    if (authModal && !authModal.classList.contains('hidden')) return true;
    if (interactiveModal && !interactiveModal.classList.contains('hidden')) return true;
    if (inventoryModal && !inventoryModal.classList.contains('hidden')) return true;
    if (wardrobeModal && !wardrobeModal.classList.contains('hidden')) return true;
    if (settingsModal && !settingsModal.classList.contains('hidden')) return true;
    if (questModal && !questModal.classList.contains('hidden')) return true;

    return false;
  }

  disableInput() {
    this.isDisabled = true;
    if (this.scene?.input?.keyboard) {
      this.scene.input.keyboard.enabled = false;
    }
  }

  enableInput() {
    this.isDisabled = false;
    if (this.scene?.input?.keyboard) {
      this.scene.input.keyboard.enabled = true;
      this.scene.input.keyboard.resetKeys();
    }
  }

  isInputBlocked() {
    if (this.isDisabled) return true;
    if (this.isTypingActive()) return true;
    if (this.isModalOpen()) return true;
    return false;
  }

  isActionJustDown() {
    if (this.isInputBlocked()) return false;
    if (this.touchInput.interactE) {
      this.touchInput.interactE = false;
      return true;
    }
    return Phaser.Input.Keyboard.JustDown(this.keyE);
  }

  getMovementVector() {
    if (this.isInputBlocked()) {
      return {
        vector: new Phaser.Math.Vector2(0, 0),
        left: false,
        right: false,
        up: false,
        down: false,
        isMoving: false
      };
    }

    // Tự động đảm bảo keyboard luôn enabled nếu không bị chặn
    if (this.scene?.input?.keyboard && !this.scene.input.keyboard.enabled) {
      this.scene.input.keyboard.enabled = true;
    }

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchInput.left;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchInput.right;
    const up = this.cursors.up.isDown || this.wasd.up.isDown || this.touchInput.up;
    const down = this.cursors.down.isDown || this.wasd.down.isDown || this.touchInput.down;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    const vector = new Phaser.Math.Vector2(vx, vy);
    if (vector.lengthSq() > 0) {
      vector.normalize();
    }

    return {
      vector,
      left,
      right,
      up,
      down,
      isMoving: vector.lengthSq() > 0
    };
  }
}
