import Phaser from 'phaser';

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  isInputBlocked() {
    // Nếu người chơi đang focus vào ô input HTML (Chat, Modal Nickname...)
    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return true;
      }
    }
    return false;
  }

  getMovementVector() {
    // Nếu bị block thì trả về vector đứng yên
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
