import Phaser from 'phaser';

// Analog stick tuning (mobile). Đặt ở config theo quy chuẩn project.
export const ANALOG_DEADZONE = 0.15;      // Bỏ qua rung tay nhẹ quanh tâm
export const ANALOG_DIR_THRESHOLD = 0.3;  // Ngưỡng suy ra hướng sprite từ analog
export const MOVE_MODE_KEY = 'dever_move_mode';         // 'dpad' | 'analog'
export const ANALOG_VISIBLE_KEY = 'dever_analog_visible'; // '1' | '0'

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.isDisabled = false;
    this.blocked = false;

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
      interactE: false,
      // Analog stick (360°): vector -1..1, magnitude = tốc độ (0 = đứng yên).
      // Khi magnitude > ANALOG_DEADZONE thì analog được ưu tiên hơn D-pad số.
      analogX: 0,
      analogY: 0
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

    // Khi người dùng focus vào ô nhập liệu hoặc dropdown select
    document.addEventListener('focusin', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
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

    // Khi người dùng click ra ngoài ô nhập liệu / select
    document.addEventListener('focusout', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        setTimeout(() => {
          if (!this.isTypingActive() && !this.isModalOpen()) {
            this.enableInput();
          }
        }, 50);
      }
    });

    // Khi click chuột ở bất kỳ đâu ngoài ô gõ văn bản -> Tự động khôi phục điều khiển game
    window.addEventListener('pointerdown', (e) => {
      const isTypingField = e.target.closest('input, textarea, select, [contenteditable="true"]');
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

    const isField = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable;
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

    // NPC Dialogue Modal — khi player đang hội thoại với NPC
    const npcDialogueModal = document.getElementById('npc-dialogue-modal');
    if (npcDialogueModal && npcDialogueModal.style.bottom !== '-200px' && npcDialogueModal.style.bottom !== '') return true;

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
    if (this.blocked) return true;
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

    // Analog stick (mobile) được ưu tiên khi vượt deadzone.
    // Giữ nguyên magnitude để tốc độ di chuyển tỉ lệ với lực đẩy cần.
    const ax = this.touchInput.analogX || 0;
    const ay = this.touchInput.analogY || 0;
    const aMag = Math.hypot(ax, ay);

    let left, right, up, down;

    if (aMag > ANALOG_DEADZONE) {
      const mag = Math.min(aMag, 1);
      vx = (ax / aMag) * mag;
      vy = (ay / aMag) * mag;
      // Suy ra hướng sprite từ trục chiếm ưu thế (giữ nguyên logic animation).
      left = ax < -ANALOG_DIR_THRESHOLD;
      right = ax > ANALOG_DIR_THRESHOLD;
      up = ay < -ANALOG_DIR_THRESHOLD;
      down = ay > ANALOG_DIR_THRESHOLD;
    } else {
      left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchInput.left;
      right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchInput.right;
      up = this.cursors.up.isDown || this.wasd.up.isDown || this.touchInput.up;
      down = this.cursors.down.isDown || this.wasd.down.isDown || this.touchInput.down;

      if (left) vx -= 1;
      if (right) vx += 1;
      if (up) vy -= 1;
      if (down) vy += 1;

      // Digital: chuẩn hoá về độ dài 1 (chéo 2 phím vẫn cùng tốc độ).
      const len = Math.hypot(vx, vy);
      if (len > 0) {
        vx /= len;
        vy /= len;
      }
    }

    const vector = new Phaser.Math.Vector2(vx, vy);
    // Digital: chuẩn hoá về độ dài 1. Analog: giữ magnitude (đã clamp ≤ 1 ở trên).

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
