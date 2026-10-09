/**
 * ToastManager — single FIFO queue for ALL toast/banner notifications.
 *
 * Problem it fixes (UI critique 2026-10-09, items #2 + #5): achievement
 * toasts, quest toasts, legacy pills and the reconnect banner used to render
 * independently and stack on top of each other with no limit. On mobile the
 * reconnect banner even wrapped one word per line.
 *
 * Screen zones (never overlap by construction):
 *   - Header zone : y 0..58px            (header bar, own DOM)
 *   - Toast zone  : #dever-toast-stack   (this manager, fixed top-center
 *                                         below the header)
 *   - World zone  : Phaser canvas        (portal labels live in-world)
 *
 * Rules:
 *   - Max 2 visible at once; the rest wait FIFO.
 *   - Small dark pills, auto-dismiss, Be Vietnam Pro, no emoji.
 *   - Existing caller APIs keep working; the manager wraps them.
 */
export const TOAST_CONFIG = {
  MAX_VISIBLE: 2,
  DURATIONS: {
    pill: 3200, // legacy #dever-toast style messages
    quest: 3600, // quest point toasts
    achievement: 5200, // golden achievement banners
  },
  FADE_MS: 350,
};

export class ToastManager {
  constructor() {
    this.stack = null;
    this.queue = []; // pending items: { id, kind, duration, persistent, adopted, render }
    this.visible = new Map(); // id -> { el, timer, adopted, originalParent, originalNext }
    this._seq = 0;
  }

  _ensureStack() {
    if (typeof document === 'undefined') return null;
    if (this.stack) return this.stack;
    const el = document.createElement('div');
    el.id = 'dever-toast-stack';
    el.className = 'dever-toast-stack';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    this.stack = el;
    return el;
  }

  _nextId(prefix) {
    this._seq += 1;
    return `toast-${prefix}-${this._seq}`;
  }

  /**
   * Small dark pill toast (replaces the legacy #dever-toast element).
   * @param {string} message
   * @param {Object} [opts] { duration, id }
   * @returns {string} toast id
   */
  toast(message, { duration = TOAST_CONFIG.DURATIONS.pill, id } = {}) {
    if (typeof document === 'undefined') return null;
    const toastId = id || this._nextId('pill');
    this._enqueue({
      id: toastId,
      kind: 'pill',
      duration,
      persistent: false,
      render: () => {
        const el = document.createElement('div');
        el.className = 'dever-toast';
        el.dataset.toastId = toastId;
        el.textContent = String(message);
        return el;
      },
    });
    return toastId;
  }

  /**
   * Quest point toast. Keeps the .quest-toast-banner class (tests/styles).
   */
  questToast(message, { duration = TOAST_CONFIG.DURATIONS.quest, id } = {}) {
    if (typeof document === 'undefined') return null;
    const toastId = id || this._nextId('quest');
    this._enqueue({
      id: toastId,
      kind: 'quest',
      duration,
      persistent: false,
      render: () => {
        const el = document.createElement('div');
        el.className = 'quest-toast-banner';
        el.dataset.toastId = toastId;
        el.setAttribute('role', 'status');
        const dot = document.createElement('span');
        dot.className = 'toast-dot';
        const msg = document.createElement('span');
        msg.textContent = String(message);
        el.appendChild(dot);
        el.appendChild(msg);
        return el;
      },
    });
    return toastId;
  }

  /**
   * Golden achievement banner. Keeps the .achievement-toast-banner class
   * (tests/styles) so existing selectors keep working.
   */
  achievementToast({ iconHTML, title, desc, rewardHTML, duration = TOAST_CONFIG.DURATIONS.achievement, id } = {}) {
    if (typeof document === 'undefined') return null;
    const toastId = id || this._nextId('ach');
    this._enqueue({
      id: toastId,
      kind: 'achievement',
      duration,
      persistent: false,
      render: () => {
        const el = document.createElement('div');
        el.className = 'achievement-toast-banner';
        el.dataset.toastId = toastId;
        // Icon box is only rendered when there's an actual icon — an empty
        // box looks broken (reported 2026-10-09).
        const iconDiv = iconHTML && iconHTML.trim()
          ? `<div class="achievement-toast-icon">${iconHTML}</div>`
          : '';
        // innerHTML only with game-config strings (titles/descs), never user input.
        el.innerHTML = `
          ${iconDiv}
          <div class="achievement-toast-content">
            <span class="achievement-toast-tag">DANH HIỆU MỚI MỞ KHÓA</span>
            <h4 class="achievement-toast-title"></h4>
            <p class="achievement-toast-desc"></p>
          </div>
          <div class="achievement-toast-reward">${rewardHTML || ''}</div>
        `;
        el.querySelector('.achievement-toast-title').textContent = String(title || '');
        el.querySelector('.achievement-toast-desc').textContent = String(desc || '');
        return el;
      },
    });
    return toastId;
  }

  /**
   * Persistent status pill (e.g. the lag/reconnect banner). Not auto-dismissed;
   * call dismiss(id) to remove it. Accepts an existing element so its id and
   * classes (e.g. #lag-spinner-overlay) survive — tests keep passing.
   * The element is adopted into the toast stack while visible and restored to
   * its original parent on dismiss.
   * @param {string} id stable id, e.g. 'lag-status'
   * @param {HTMLElement} el existing element to show
   */
  status(id, el) {
    if (typeof document === 'undefined' || !el) return null;
    // Already visible → make sure it is shown.
    const cur = this.visible.get(id);
    if (cur) {
      cur.el.classList.remove('hidden');
      return id;
    }
    // Already queued → nothing to do.
    if (this.queue.some((q) => q.id === id)) return id;
    this._enqueue({
      id,
      kind: 'status',
      duration: 0,
      persistent: true,
      adopted: true,
      render: () => el,
    });
    return id;
  }

  /** Dismiss a visible toast or drop a queued one. Safe to call for unknown ids. */
  dismiss(id) {
    if (!id) return;
    const v = this.visible.get(id);
    if (v) {
      if (v.timer) clearTimeout(v.timer);
      this.visible.delete(id);
      const el = v.el;
      el.classList.remove('show');
      el.classList.add('toast-leaving');
      setTimeout(() => {
        el.classList.remove('toast-leaving');
        if (v.adopted) {
          // Restore adopted elements (e.g. #lag-spinner-overlay) to their
          // original home instead of destroying them.
          el.classList.add('hidden');
          if (v.originalParent) {
            if (v.originalNext && v.originalNext.parentElement === v.originalParent) {
              v.originalParent.insertBefore(el, v.originalNext);
            } else {
              v.originalParent.appendChild(el);
            }
          }
        } else {
          if (el.parentElement) el.parentElement.removeChild(el);
        }
      }, TOAST_CONFIG.FADE_MS);
      this._pump();
      return;
    }
    this.queue = this.queue.filter((q) => q.id !== id);
  }

  /** Clear everything: visible + queued. */
  clear() {
    // Drop the queue FIRST so _pump() (called by dismiss) cannot pull
    // pending items into the visible slots we are clearing.
    this.queue = [];
    [...this.visible.keys()].forEach((id) => this.dismiss(id));
  }

  _enqueue(item) {
    this.queue.push(item);
    this._pump();
  }

  _pump() {
    const stack = this._ensureStack();
    if (!stack) return;
    while (this.visible.size < TOAST_CONFIG.MAX_VISIBLE && this.queue.length > 0) {
      const item = this.queue.shift();
      const el = item.render();
      const adopted = !!item.adopted;
      const rec = { el, timer: null, adopted, originalParent: null, originalNext: null };
      if (adopted) {
        rec.originalParent = el.parentElement;
        rec.originalNext = el.nextElementSibling;
        el.classList.remove('hidden');
      }
      stack.appendChild(el);
      // Force reflow so the enter transition plays.
      void el.offsetWidth;
      el.classList.add('show');
      if (!item.persistent && item.duration > 0) {
        rec.timer = setTimeout(() => this.dismiss(item.id), item.duration);
      }
      this.visible.set(item.id, rec);
    }
  }
}

export const toastManager = new ToastManager();

// Debug / test hook.
if (typeof window !== 'undefined') {
  window.__DEVER_TOAST__ = toastManager;
}
