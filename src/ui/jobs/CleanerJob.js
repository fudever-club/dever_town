/**
 * DEVER TOWN — CLEANER JOB (LAO CÔNG CAMPUS) — Phase D1
 *
 * Nhặt rác quanh hồ vườn sân Tòa Alpha, mang đến 2 thùng Vô cơ / Hữu cơ
 * và nhấn E để phân loại. Phân loại đúng: +15 D-Coin / món
 * (JOBS_CONFIG.wages.cleaner, qua walletManager.earn(..., 'job_cleaner')).
 * Thùng sai: không cộng coin, hiện gợi ý.
 *
 * FSM (AGENTS.md §6): idle → active → picking → carrying → sorting → done.
 * Không chạm map/layout/collider — rác & thùng là sprite in-world, không solid.
 */
import { JOBS_CONFIG } from '../../config/jobsConfig.js';

export const CLEANER_STATES = {
  IDLE: 'idle',
  ACTIVE: 'active',     // đang nhặt rác (chưa đầy túi hoặc chưa hết rác)
  PICKING: 'picking',   // khoảnh khắc nhấn E nhặt
  CARRYING: 'carrying', // đang mang rác trong túi
  SORTING: 'sorting',   // khoảnh khắc nhấn E phân loại
  DONE: 'done',
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

export class CleanerJob {
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
    this.cfg = JOBS_CONFIG.cleaner;
    this.state = CLEANER_STATES.IDLE;
    this.litter = [];   // { sprite, tileX, tileY, kind, x, y }
    this.bins = [];     // { sprite, binKind, x, y, label }
    this.bag = [];      // kind[] đang mang trong túi
    this.prompt = null;
    this._eHandler = null;
    this._lastEAt = 0;
  }

  getState() {
    return this.state;
  }

  getBagCount() {
    return this.bag.length;
  }

  getRemainingCount() {
    return this.litter.length;
  }

  // ------------------------------------------------------------- start/stop
  start() {
    if (this.state !== CLEANER_STATES.IDLE && this.state !== CLEANER_STATES.DONE) return false;
    if (!this.scene || !this.scene.player) {
      this._say('Không tìm thấy người chơi.');
      return false;
    }
    if (this.scene.currentRoomId !== JOBS_CONFIG.mainHallRoomId) {
      this._say('Hãy đến Sảnh Alpha (sân Tòa Alpha) để bắt đầu ca lao công.');
      return false;
    }
    this._spawnLitter();
    this._spawnBins();
    this._bindE();
    this._makePrompt();
    this.state = CLEANER_STATES.ACTIVE;
    this._refreshStatus();
    this._say(`Ca lao công bắt đầu: nhặt ${this.litter.length} món rác quanh hồ vườn, rồi phân loại đúng thùng.`);
    return true;
  }

  stop() {
    this._unbindE();
    for (const l of this.litter) { try { l.sprite?.destroy(); } catch (e) { /* noop */ } }
    for (const b of this.bins) { try { b.sprite?.destroy(); } catch (e) { /* noop */ } }
    if (this.prompt) { try { this.prompt.destroy(); } catch (e) { /* noop */ } }
    this.litter = [];
    this.bins = [];
    this.bag = [];
    this.prompt = null;
    this.state = CLEANER_STATES.IDLE;
    this.setStatus(null);
  }

  // ------------------------------------------------------------- update
  /**
   * @param {number} time - ms
   * @param {number} delta - ms
   */
  update(time, delta) {
    if (this.state === CLEANER_STATES.IDLE || this.state === CLEANER_STATES.DONE) return;
    const target = this._nearestTarget();
    if (!this.prompt) return;
    if (target) {
      this.prompt.setVisible(true);
      this.prompt.setPosition(target.x, target.y - 26);
      this.prompt.setText(target.promptText);
    } else {
      this.prompt.setVisible(false);
    }
  }

  // ------------------------------------------------------------- interact
  _bindE() {
    this._eHandler = () => {
      const now = Date.now();
      if (now - this._lastEAt < 200) return; // debounce như InteractionManager
      this._lastEAt = now;
      if (!this._canInteractNow()) return;
      this._onE();
    };
    try { this.scene.input.keyboard.on('keydown-E', this._eHandler); } catch (e) { /* noop */ }
  }

  _unbindE() {
    if (this._eHandler) {
      try { this.scene.input.keyboard.off('keydown-E', this._eHandler); } catch (e) { /* noop */ }
      this._eHandler = null;
    }
  }

  _canInteractNow() {
    // Không cướp phím E khi modal khác đang mở (giống InteractionManager).
    const im = this.scene?.interactionManager;
    if (im && typeof im.canInteract === 'function' && !im.canInteract()) return false;
    return this.state !== CLEANER_STATES.IDLE && this.state !== CLEANER_STATES.DONE;
  }

  _nearestTarget() {
    const p = this.scene?.player;
    if (!p) return null;
    const R = JOBS_CONFIG.interactRadius;
    let best = null;
    let bestD = Infinity;
    for (const l of this.litter) {
      const d = Math.hypot(p.x - l.x, p.y - l.y);
      if (d <= R && d < bestD) {
        bestD = d;
        const label = this.cfg.kindLabels[l.kind] || l.kind;
        best = { type: 'litter', item: l, x: l.x, y: l.y, promptText: `[E] Nhặt: ${label}` };
      }
    }
    if (this.bag.length > 0) {
      for (const b of this.bins) {
        const d = Math.hypot(p.x - b.x, p.y - b.y);
        if (d <= R && d < bestD) {
          bestD = d;
          best = { type: 'bin', item: b, x: b.x, y: b.y, promptText: `[E] Phân loại vào ${b.label} (${this.bag.length} món)` };
        }
      }
    }
    return best;
  }

  _onE() {
    const target = this._nearestTarget();
    if (!target) return;
    if (target.type === 'litter') this._pickUp(target.item);
    else if (target.type === 'bin') this._sortAt(target.item);
  }

  _pickUp(litter) {
    this.state = CLEANER_STATES.PICKING;
    const idx = this.litter.indexOf(litter);
    if (idx >= 0) this.litter.splice(idx, 1);
    try { litter.sprite?.destroy(); } catch (e) { /* noop */ }
    this.bag.push(litter.kind);
    this.state = CLEANER_STATES.CARRYING;
    this._refreshStatus();
    const label = this.cfg.kindLabels[litter.kind] || litter.kind;
    this._say(`Đã nhặt ${label} (${this.bag.length} món trong túi). Mang đến thùng phân loại.`);
  }

  _sortAt(bin) {
    this.state = CLEANER_STATES.SORTING;
    const carried = this.bag.splice(0);
    let correct = 0;
    for (const kind of carried) {
      if (this.cfg.kindToBin[kind] === bin.binKind) correct += 1;
    }
    const wrong = carried.length - correct;
    if (correct > 0 && this.wallet) {
      const earned = this.wallet.earn(correct * JOBS_CONFIG.wages.cleaner, this.cfg.walletSource);
      this._say(`Phân loại đúng ${correct} món: +${correct * JOBS_CONFIG.wages.cleaner} D-Coin (ví: ${earned}).`);
    }
    if (wrong > 0) {
      this._say(`Phân loại sai ${wrong} món vào ${bin.label}: không được cộng coin. Gợi ý — Vô cơ: cốc/chai nhựa; Hữu cơ: vỏ trái cây.`);
    }
    if (this.litter.length === 0 && this.bag.length === 0) {
      this.state = CLEANER_STATES.DONE;
      this.setStatus(null);
      this._say('Hoàn thành ca lao công. Sân Tòa Alpha đã sạch.');
      this.stop();
    } else {
      this.state = CLEANER_STATES.CARRYING;
      this._refreshStatus();
    }
  }

  // ------------------------------------------------------------- spawn
  _spawnLitter() {
    for (const t of this.cfg.litterTiles) {
      const x = t.tileX * TILE + TILE / 2;
      const y = t.tileY * TILE + TILE / 2;
      const sprite = this.scene.add.image(x, y, `job_litter_${t.kind}`);
      sprite.setDepth(y - 4);
      this.litter.push({ sprite, tileX: t.tileX, tileY: t.tileY, kind: t.kind, x, y });
    }
  }

  _spawnBins() {
    for (const [binKind, def] of Object.entries(this.cfg.bins)) {
      const x = def.tileX * TILE + TILE / 2;
      const y = def.tileY * TILE + TILE / 2;
      const sprite = this.scene.add.image(x, y - 8, `job_bin_${binKind}`);
      sprite.setDepth(y + 4);
      this.bins.push({ sprite, binKind, x, y, label: def.label });
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

  _refreshStatus() {
    const total = this.cfg.litterCount;
    const done = total - this.litter.length - this.bag.length;
    this.setStatus(`Lao công: túi ${this.bag.length} | đã dọn ${done}/${total}`);
  }

  _say(msg) {
    if (this.toast && typeof this.toast.toast === 'function') {
      this.toast.toast(msg);
    }
  }
}
