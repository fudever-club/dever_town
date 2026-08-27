import Phaser from 'phaser';

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.isDisabled = false;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  disableInput() {
    this.isDisabled = true;
  }

  enableInput() {
    this.isDisabled = false;
  }

  isInputBlocked() {
    if (this.isDisabled) return true;

    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return true;
      }
      // Nếu bất kỳ modal nào đang mở
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
