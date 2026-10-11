/**
 * DEVER TOWN — DELIVERY JOB (GIAO HÀNG KTX) — Phase D1
 *
 * Nhận đơn tại Quầy Căn Tin (canteen_cafe) bằng phím E → đồng hồ đếm ngược
 * 60s (JOBS_CONFIG.delivery.timeLimitSec) → chạy đến Bàn Học KTX (dorm_room)
 * trước khi hết giờ → +35 D-Coin (walletManager.earn(..., 'job_delivery')).
 * Hết giờ: thất bại, không cộng coin.
 *
 * FSM (AGENTS.md §6): idle → pickup → en_route → delivered | failed.
 * Không chạm map/layout/portal — chỉ đọc currentRoomId + vị trí player.
 */
import { JOBS_CONFIG } from '../../config/jobsConfig.js';

export const DELIVERY_STATES = {
  IDLE: 'idle',
  PICKUP: 'pickup',       // đang chờ nhận đơn ở Căn Tin
  EN_ROUTE: 'en_route',   // đang giao, đồng hồ chạy
  DELIVERED: 'delivered',
  FAILED: 'failed',
};

const TILE = 32;
const PROMPT_STYLE = {
  fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontSize: '12px',
  fontWeight: '700',
  color: '#ffffff',
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  padding: { left: 8, right: 8, top: 4, bottom: 4 },
};

export class DeliveryJob {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene - WorldScene
   * @param {Object} options.wallet - WalletManager (có earn)
   * @param {Object} options.toast - ToastManager (có toast)
   * @param {Function} [options.setStatus] - (text|null) => void, pill trạng thái HUD
   */
  constructor({ scene, wallet, toast, setStatus } = {}) {
    this.scene = scene || null;
    this.wallet = wallet || null;
    this.toast = toast || null;
    this.setStatus = typeof setStatus === 'function' ? setStatus : () => {};
    this.cfg = JOBS_CONFIG.delivery;
    this.state = DELIVERY_STATES.IDLE;
    this.timeLeft = 0; // giây
    this.pickupBeacon = null;
    this.targetMarker = null;
    this.prompt = null;
    this._eHandler = null;
    this._lastEAt = 0;
  }

  getState() {
    return this.state;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  // ------------------------------------------------------------- start/stop
  start() {
    if (this.state !== DELIVERY_STATES.IDLE
      && this.state !== DELIVERY_STATES.DELIVERED
      && this.state !== DELIVERY_STATES.FAILED) return false;
    if (!this.scene || !this.scene.player) {
      this._say('Không tìm thấy người chơi.');
      return false;
    }
    if (this.scene.currentRoomId !== this.cfg.pickup.roomId) {
      this._say(`Hãy vào Căn Tin FUDA để nhận đơn giao hàng (điểm nhận: ${this.cfg.pickup.label}).`);
      return false;
    }
    this._spawnMarkers();
    this._bindE();
    this._makePrompt();
    this.state = DELIVERY_STATES.PICKUP;
    this.setStatus(`Giao hàng: đến ${this.cfg.pickup.label} nhận đơn [E]`);
    this._say(`Đơn hàng sẵn sàng tại ${this.cfg.pickup.label}. Nhấn [E] để nhận, giao đến ${this.cfg.target.label} trong ${this.cfg.timeLimitSec} giây.`);
    return true;
  }

  stop() {
    this._unbindE();
    for (const s of [this.pickupBeacon, this.targetMarker, this.prompt]) {
      try { s?.destroy(); } catch (e) { /* noop */ }
    }
    this.pickupBeacon = null;
    this.targetMarker = null;
    this.prompt = null;
    this.state = DELIVERY_STATES.IDLE;
    this.timeLeft = 0;
    this.setStatus(null);
  }

  // ------------------------------------------------------------- update
  /**
   * @param {number} time - ms
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.state === DELIVERY_STATES.IDLE) return;
    const p = this.scene?.player;
    if (!p) return;

    if (this.state === DELIVERY_STATES.PICKUP) {
      this._updatePromptNear(this._pickupPos(), `[E] Nhận đơn giao hàng (${this.cfg.timeLimitSec}s)`);
      return;
    }

    if (this.state === DELIVERY_STATES.EN_ROUTE) {
      this.timeLeft -= delta / 1000;
      if (this.timeLeft <= 0) {
        this._fail();
        return;
      }
      this.setStatus(`Giao hàng → ${this.cfg.target.label}: ${this._fmtTime(this.timeLeft)}`);
      const t = this._targetPos();
      const inRoom = this.scene.currentRoomId === this.cfg.target.roomId;
      if (inRoom && Math.hypot(p.x - t.x, p.y - t.y) <= JOBS_CONFIG.interactRadius) {
        this._deliver();
        return;
      }
      this._updatePromptNear(inRoom ? t : null, inRoom ? `Đến ${this.cfg.target.label} để giao` : `Vào KTX (${this.cfg.target.label})`);
    }
  }

  // ------------------------------------------------------------- interact
  _bindE() {
    this._eHandler = () => {
      const now = Date.now();
      if (now - this._lastEAt < 200) return;
      this._lastEAt = now;
      if (this.state !== DELIVERY_STATES.PICKUP) return;
      const im = this.scene?.interactionManager;
      if (im && typeof im.canInteract === 'function' && !im.canInteract()) return;
      const p = this.scene?.player;
      const pos = this._pickupPos();
      if (p && pos && Math.hypot(p.x - pos.x, p.y - pos.y) <= JOBS_CONFIG.interactRadius) {
        this._takeOrder();
      }
    };
    try { this.scene.input.keyboard.on('keydown-E', this._eHandler); } catch (e) { /* noop */ }
  }

  _unbindE() {
    if (this._eHandler) {
      try { this.scene.input.keyboard.off('keydown-E', this._eHandler); } catch (e) { /* noop */ }
      this._eHandler = null;
    }
  }

  _takeOrder() {
    this.state = DELIVERY_STATES.EN_ROUTE;
    this.timeLeft = this.cfg.timeLimitSec;
    try { this.pickupBeacon?.destroy(); } catch (e) { /* noop */ }
    this.pickupBeacon = null;
    this._say(`Đã nhận đơn. Giao đến ${this.cfg.target.label} trong ${this.cfg.timeLimitSec} giây — chạy nhanh lên.`);
  }

  _deliver() {
    this.state = DELIVERY_STATES.DELIVERED;
    const wage = JOBS_CONFIG.wages.delivery;
    let balance = null;
    if (this.wallet) balance = this.wallet.earn(wage, this.cfg.walletSource);
    this.setStatus(null);
    this._say(balance !== null
      ? `Giao hàng thành công: +${wage} D-Coin (ví: ${balance}).`
      : `Giao hàng thành công: +${wage} D-Coin.`);
    this.stop();
  }

  _fail() {
    this.state = DELIVERY_STATES.FAILED;
    this.setStatus(null);
    this._say('Hết giờ giao hàng. Đơn bị hủy — không được cộng coin.');
    this.stop();
  }

  // ------------------------------------------------------------- helpers
  _pickupPos() {
    return {
      x: this.cfg.pickup.tileX * TILE + TILE / 2,
      y: this.cfg.pickup.tileY * TILE + TILE / 2,
    };
  }

  _targetPos() {
    return {
      x: this.cfg.target.tileX * TILE + TILE / 2,
      y: this.cfg.target.tileY * TILE + TILE / 2,
    };
  }

  _spawnMarkers() {
    // Marker in-world thuần trang trí (không solid, không đè zone/portals).
    try {
      const pp = this._pickupPos();
      this.pickupBeacon = this.scene.add.image(pp.x, pp.y - 20, 'job_litter_cup');
      this.pickupBeacon.setDepth(pp.y + 10).setScale(1.4);
      const tp = this._targetPos();
      this.targetMarker = this.scene.add.image(tp.x, tp.y - 20, 'job_bin_organic');
      this.targetMarker.setDepth(tp.y + 10).setAlpha(0.9).setScale(0.9);
    } catch (e) {
      this.pickupBeacon = null;
      this.targetMarker = null;
    }
  }

  _makePrompt() {
    try {
      this.prompt = this.scene.add.text(0, 0, '', PROMPT_STYLE).setOrigin(0.5, 0.5);
      this.prompt.setDepth(99999);
      this.prompt.setVisible(false);
    } catch (e) {
      this.prompt = null;
    }
  }

  _updatePromptNear(pos, text) {
    if (!this.prompt) return;
    const p = this.scene?.player;
    if (pos && p && Math.hypot(p.x - pos.x, p.y - pos.y) <= JOBS_CONFIG.interactRadius * 2.2) {
      this.prompt.setVisible(true);
      this.prompt.setPosition(pos.x, pos.y - 40);
      this.prompt.setText(text);
    } else {
      this.prompt.setVisible(false);
    }
  }

  _fmtTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    return `0:${String(s).padStart(2, '0')}`;
  }

  _say(msg) {
    if (this.toast && typeof this.toast.toast === 'function') {
      this.toast.toast(msg);
    }
  }
}
