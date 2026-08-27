import Phaser from 'phaser';

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.isDisabled = false;

    // 1. Tắt toàn bộ Key Captures mặc định của Phaser để không chặn phím Space, E, W, A, S, D trên trình duyệt
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

    // Đảm bảo sau khi addKey thì Phaser vẫn không gọi preventDefault()
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.clearCaptures();
      scene.input.keyboard.preventDefault = false;
    }

    // 3. Trình quản lý Focus / Blur toàn cục (Global Focus Manager)
    this.setupGlobalFocusManager();
  }

  setupGlobalFocusManager() {
    if (typeof document === 'undefined') return;

    // Khi người dùng click vào bất kỳ ô nhập liệu (Chat, Nickname, Email, Notes...)
    document.addEventListener('focusin', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
          this.scene.input.keyboard.enabled = false;
        }
        if (this.scene.player) {
          this.scene.player.stopMovement();
        }
      }
    });

    // Khi người dùng click ra ngoài hoặc đóng modal
    document.addEventListener('focusout', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
          this.scene.input.keyboard.enabled = true;
          this.scene.input.keyboard.resetKeys();
        }
      }
    });
  }

  disableInput() {
    this.isDisabled = true;
    if (this.scene && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = false;
    }
  }

  enableInput() {
    this.isDisabled = false;
    if (this.scene && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = true;
      this.scene.input.keyboard.resetKeys();
    }
  }

  isInputBlocked() {
    if (this.isDisabled) return true;

    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
        return true;
      }
      const authModal = document.getElementById('auth-modal');
      const interactiveModal = document.getElementById('interactive-modal');

      if (authModal && !authModal.classList.contains('hidden')) return true;
      if (interactiveModal && !interactiveModal.classList.contains('hidden')) return true;
    }
    return false;
  }

  isActionJustDown() {
    if (this.isInputBlocked()) return false;
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

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

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
