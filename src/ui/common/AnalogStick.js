import { ANALOG_DEADZONE, ANALOG_VISIBLE_KEY } from '../../config/controls.js';

/**
 * AnalogStick — cần analog 360° cho mobile (phong cách PUBG Mobile).
 *
 * - Floating origin: chạm vào đâu trong vùng trái màn hình, gốc cần hiện ở đó.
 * - Kéo để di chuyển: hướng = vector kéo, lực đẩy = magnitude (0..1).
 * - Magnitude được giữ nguyên → tốc độ nhân vật tỉ lệ với lực đẩy
 *   (đẩy nhẹ = đi chậm, đẩy hết = chạy nhanh). Xử lý trong InputController.
 * - Chế độ ẩn (analogVisible=false): vẫn vuốt để di chuyển, chỉ không hiện hình.
 */
export class AnalogStick {
  /**
   * @param {Object} options
   * @param {import('../../config/controls.js').InputController} options.inputController
   */
  constructor({ inputController } = {}) {
    this.inputController = inputController;
    this.enabled = false;

    // Bán kính cần (px) và deadzone — khớp hằng số trong controls.js.
    this.RADIUS = 52;
    this.DEADZONE = ANALOG_DEADZONE;

    this.activePointerId = null;
    this.originX = 0;
    this.originY = 0;

    this.zoneEl = null;
    this.baseEl = null;
    this.knobEl = null;

    this.buildDOM();
  }

  buildDOM() {
    if (typeof document === 'undefined') return;

    // Vùng chạm: nửa trái màn hình, dưới header. Nằm dưới các nút action.
    this.zoneEl = document.createElement('div');
    this.zoneEl.id = 'analog-stick-zone';
    this.zoneEl.className = 'analog-stick-zone hidden';

    // Đế cần (hiện tại điểm chạm)
    this.baseEl = document.createElement('div');
    this.baseEl.className = 'analog-stick-base';
    this.baseEl.style.opacity = '0';

    // Núm cần
    this.knobEl = document.createElement('div');
    this.knobEl.className = 'analog-stick-knob';
    this.baseEl.appendChild(this.knobEl);

    this.zoneEl.appendChild(this.baseEl);
    document.body.appendChild(this.zoneEl);

    this.zoneEl.addEventListener('pointerdown', (e) => this.onDown(e));
    window.addEventListener('pointermove', (e) => this.onMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.onUp(e));
    window.addEventListener('pointercancel', (e) => this.onUp(e));

    this.applyVisibility();
  }

  /** Bật/tắt toàn bộ vùng analog (theo chế độ di chuyển). */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.zoneEl) {
      this.zoneEl.classList.toggle('hidden', !enabled);
    }
    if (!enabled) this.reset();
  }

  /** Đọc/toggle hiển thị hình cần (vuốt ẩn vẫn di chuyển được). */
  isVisible() {
    try {
      return localStorage.getItem(ANALOG_VISIBLE_KEY) !== '0';
    } catch (e) {
      return true;
    }
  }

  setVisible(visible) {
    try {
      localStorage.setItem(ANALOG_VISIBLE_KEY, visible ? '1' : '0');
    } catch (e) {}
    this.applyVisibility();
  }

  applyVisibility() {
    const vis = this.isVisible();
    if (this.baseEl) {
      this.baseEl.dataset.invisible = vis ? '0' : '1';
    }
  }

  onDown(e) {
    if (!this.enabled || this.activePointerId !== null) return;
    // Không bắt đầu cần khi modal đang mở hoặc đang gõ chat.
    if (this.inputController && this.inputController.isInputBlocked()) return;
    // Bỏ qua nếu chạm vào nút con (không có, nhưng phòng thủ).
    if (e.target !== this.zoneEl && e.target !== this.baseEl) return;

    // Nhường cho HUD tương tác (minimap kéo được, nút, v.v.): kiểm tra
    // phần tử thật bên dưới zone bằng cách tạm ẩn zone.
    if (!this.isTopmostAt(e.clientX, e.clientY)) return;

    e.preventDefault();
    this.activePointerId = e.pointerId;
    this.originX = e.clientX;
    this.originY = e.clientY;

    // Đặt đế cần tại điểm chạm, kẹp trong viewport.
    const baseR = 60;
    const x = Math.min(Math.max(e.clientX, baseR), window.innerWidth - baseR);
    const y = Math.min(Math.max(e.clientY, baseR), window.innerHeight - baseR);
    this.baseEl.style.left = `${x - baseR}px`;
    this.baseEl.style.top = `${y - baseR}px`;
    this.baseEl.style.opacity = '1';
    this.baseEl.classList.add('active');

    if (navigator.vibrate) navigator.vibrate(8);
  }

  /**
   * True nếu tại điểm chạm, zone là phần tử tương tác trên cùng
   * (không bị HUD nào như minimap đè lên). Tạm ẩn zone để đo.
   */
  isTopmostAt(x, y) {
    if (!this.zoneEl) return true;
    const prev = this.zoneEl.style.visibility;
    this.zoneEl.style.visibility = 'hidden';
    const el = document.elementFromPoint(x, y);
    this.zoneEl.style.visibility = prev;
    if (!el) return true;
    // Canvas / body / zone-con là vùng game — cần analog được phép bắt đầu.
    // Mọi thứ khác (minimap, nút, panel) được nhường.
    if (el === document.body || el === document.documentElement) return true;
    const canvas = el.closest ? el.closest('#game-container canvas, canvas') : null;
    if (canvas) return true;
    return false;
  }

  onMove(e) {
    if (e.pointerId !== this.activePointerId) return;
    // Chặn scroll trình duyệt khi đang kéo cần.
    if (e.cancelable) e.preventDefault();

    let dx = e.clientX - this.originX;
    let dy = e.clientY - this.originY;
    const dist = Math.hypot(dx, dy);

    if (dist > this.RADIUS) {
      dx = (dx / dist) * this.RADIUS;
      dy = (dy / dist) * this.RADIUS;
    }

    this.knobEl.style.transform = `translate(${dx}px, ${dy}px)`;

    const nx = dx / this.RADIUS;
    const ny = dy / this.RADIUS;
    const mag = Math.hypot(nx, ny);

    if (this.inputController && this.inputController.touchInput) {
      if (mag < this.DEADZONE) {
        this.inputController.touchInput.analogX = 0;
        this.inputController.touchInput.analogY = 0;
      } else {
        this.inputController.touchInput.analogX = nx;
        this.inputController.touchInput.analogY = ny;
      }
    }
  }

  onUp(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.reset();
  }

  reset() {
    this.activePointerId = null;
    if (this.inputController && this.inputController.touchInput) {
      this.inputController.touchInput.analogX = 0;
      this.inputController.touchInput.analogY = 0;
    }
    if (this.knobEl) this.knobEl.style.transform = 'translate(0px, 0px)';
    if (this.baseEl) {
      this.baseEl.style.opacity = '0';
      this.baseEl.classList.remove('active');
    }
  }

  destroy() {
    this.reset();
    if (this.zoneEl && this.zoneEl.parentElement) {
      this.zoneEl.parentElement.removeChild(this.zoneEl);
    }
    this.zoneEl = null;
  }
}
