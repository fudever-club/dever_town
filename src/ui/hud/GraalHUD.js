/**
 * DEVER TOWN — GRAAL CYBER-GLASS HUD (Phase A)
 *
 * ADAPT layer: cyber-glass styling ported onto the EXISTING HUD.
 * Mounted ALONGSIDE existing components — nothing existing is replaced:
 *   - 50 HP bar — LIVE, wired to healthManager.onChange() (Phase C)
 *   - Safe-zone badge "VÙNG AN TOÀN" — state set via setSafeZone(isSafe)
 *   - D-coin wallet pill — LIVE, wired to walletManager.onChange()
 *   - Action dock: 6 buttons + hotkey badges 1-6
 *       1 Balo    -> existing InventoryModal.toggle()
 *       2 Viec lam-> JobsModal Phase D1 (cleaner/delivery/bugHunter + barista/fishing sibling)
 *       3 Bang hoi -> ClanModal Phase E (bang hoi + su kien phao dai test)
 *       4 Arcade  -> existing minigame select (interactiveModal arcade_games)
 *       5 Cho     -> toast "sap ra mat"
 *       6 KTX     -> toast "sap ra mat"
 *   - Radar reskin: adds the graal-radar-skin class to the EXISTING
 *     #minimap-overlay container. MinimapOverlay LOGIC untouched.
 *
 * Preservation: no existing DOM IDs are changed, no existing components
 * or behavior are modified. Additive DOM + CSS only. No emoji anywhere.
 */
import { walletManager } from '../../managers/WalletManager.js';
import { healthManager } from '../../managers/HealthManager.js';
import { clanManager } from '../../managers/ClanManager.js';
import { fortEventManager } from '../../managers/FortEventManager.js';
import { COMBAT_CONFIG, FORT_EVENT_STATES } from '../../config/combatConfig.js';
import { getClanById } from '../../config/clansConfig.js';
import { toastManager } from '../common/ToastManager.js';

const ICONS = {
  backpack: `<svg class="dock-action-icon" viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="10" width="18" height="18" rx="5" fill="#ea580c"/><path d="M7 14 C7 10, 25 10, 25 14 L23 18 L9 18 Z" fill="#c2410c"/><rect x="11" y="13" width="2" height="12" fill="#78350f" rx="1"/><rect x="19" y="13" width="2" height="12" fill="#78350f" rx="1"/><rect x="10.5" y="19" width="3" height="3" fill="#fbbf24" rx="0.5"/><rect x="18.5" y="19" width="3" height="3" fill="#fbbf24" rx="0.5"/><rect x="11" y="21" width="10" height="6" rx="2" fill="#fb923c"/><path d="M12 10 C12 6, 20 6, 20 10" fill="none" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  briefcase: `<svg class="dock-action-icon" viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="11" width="22" height="16" rx="3" fill="#059669"/><path d="M5 11 L16 19 L27 11 Z" fill="#047857"/><rect x="9" y="11" width="2" height="16" fill="#b45309" rx="0.5"/><rect x="21" y="11" width="2" height="16" fill="#b45309" rx="0.5"/><rect x="8.5" y="17" width="3" height="3" fill="#fbbf24" rx="0.5"/><rect x="20.5" y="17" width="3" height="3" fill="#fbbf24" rx="0.5"/><circle cx="16" cy="18" r="2" fill="#fbbf24"/><path d="M12 11 C12 7, 20 7, 20 11" fill="none" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  shield: `<svg class="dock-action-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 L26 8 C26 18, 16 26, 16 28 C16 26, 6 18, 6 8 Z" fill="#fbbf24"/><path d="M16 6.5 L24 9.8 C24 17.5, 16 24, 16 25.5 C16 24, 8 17.5, 8 9.8 Z" fill="#1d4ed8"/><path d="M16 10 L20 15 L16 14 L12 15 Z" fill="#f8fafc"/><path d="M16 15 L20 20 L16 19 L12 20 Z" fill="#f59e0b"/></svg>`,
  gamepad: `<svg class="dock-action-icon" viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="10" width="22" height="14" rx="6" fill="#7c3aed"/><path d="M8 24 L5 20 L5 16 Z" fill="#6d28d9"/><path d="M24 24 L27 20 L27 16 Z" fill="#6d28d9"/><rect x="8" y="15" width="6" height="2" fill="#e2e8f0" rx="0.5"/><rect x="10" y="13" width="2" height="6" fill="#e2e8f0" rx="0.5"/><circle cx="21" cy="14" r="1.5" fill="#ef4444"/><circle cx="23" cy="16" r="1.5" fill="#3b82f6"/><circle cx="19" cy="16" r="1.5" fill="#10b981"/><circle cx="21" cy="18" r="1.5" fill="#fbbf24"/></svg>`,
  shop: `<svg class="dock-action-icon" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 11 C10 11, 6 15, 6 22 C6 27, 10 28, 16 28 C22 28, 26 27, 26 22 C26 15, 22 11, 16 11 Z" fill="#d97706"/><ellipse cx="16" cy="12" rx="7" ry="2.5" fill="#b45309"/><rect x="11" y="11" width="10" height="2" fill="#ef4444" rx="1"/><path d="M16 12 L14 16 M16 12 L18 16" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="8" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1"/><circle cx="18" cy="7.5" r="3.5" fill="#fef08a" stroke="#d97706" stroke-width="1"/><circle cx="16" cy="21" r="3" fill="#fbbf24"/><text x="16" y="22.5" font-size="4" font-weight="900" fill="#78350f" text-anchor="middle">D</text></svg>`,
  building: `<svg class="dock-action-icon" viewBox="0 0 32 32" aria-hidden="true"><rect x="8" y="14" width="16" height="14" rx="2" fill="#fed7aa"/><path d="M6 15 L16 6 L26 15 Z" fill="#ea580c"/><rect x="20" y="7" width="3" height="5" fill="#9a3412" rx="0.5"/><rect x="10.5" y="17" width="4.5" height="4.5" rx="1" fill="#fef08a" stroke="#d97706" stroke-width="0.8"/><line x1="12.75" y1="17" x2="12.75" y2="21.5" stroke="#d97706" stroke-width="0.6"/><line x1="10.5" y1="19.25" x2="15" y2="19.25" stroke="#d97706" stroke-width="0.6"/><rect x="17" y="18" width="5" height="10" rx="1" fill="#9a3412"/><circle cx="18" cy="23" r="0.7" fill="#fbbf24"/></svg>`,
};

const COIN_SVG = `
  <svg class="hud-dcoin-coin" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#b45309" stroke-width="1.6"/>
    <circle cx="12" cy="12" r="6.6" fill="none" stroke="#b45309" stroke-width="1.2"/>
    <path d="M10 8.6h3.4a2.9 2.9 0 0 1 0 5.8H10z M10 8.6v7" fill="none" stroke="#92400e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

export class GraalHUD {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} [options.scene] - WorldScene (for inventoryModal / interactiveModal)
   */
  constructor({ scene } = {}) {
    this.scene = scene || null;
    // Phase C: HP thật từ HealthManager (persisted, chuẩn 50 HP).
    this.hpCurrent = healthManager.getHP();
    this.hpMax = COMBAT_CONFIG.maxHP;
    this._unsubWallet = null;
    this._unsubHealth = null;
    this._unsubClan = null;
    this._unsubFort = null;
    this._keyHandler = null;
    this._overlay = null;

    this._buildDOM();
    this._renderHP();
    this._renderWallet(walletManager.getBalance());
    this._wireWallet();
    this._wireHealth();
    this._wireClans();
    this._wireKeyboard();
    this._reskinRadar();
  }

  // ------------------------------------------------------------- DOM ----
  _buildDOM() {
    const overlay = document.createElement('div');
    overlay.id = 'graal-hud-overlay';
    overlay.className = 'in-game-hud-overlay';

    overlay.innerHTML = `
      <div class="graal-vitals" id="graal-vitals">
        <div class="graal-vital-card graal-glass" id="graal-hp-card" role="status" aria-label="Mau (HP)">
          <span class="graal-vital-label">HP</span>
          <div class="hp-track" aria-hidden="true">
            <div class="hp-fill" id="graal-hp-fill"></div>
          </div>
          <span class="hp-value" id="graal-hp-value">50/50</span>
        </div>
        <div class="graal-vital-card graal-glass hud-safe-zone-pill" id="graal-safe-zone" role="status">
          <span class="hud-safe-zone-dot" aria-hidden="true"></span>
          <span>VÙNG AN TOÀN</span>
        </div>
        <div class="graal-vital-card graal-glass hud-dcoin-box" id="graal-wallet" role="status" aria-label="Vi D-Coin">
          ${COIN_SVG}
          <span class="hud-dcoin-amount" id="graal-dcoin-amount">0</span>
          <span class="hud-dcoin-unit">D-COIN</span>
        </div>
      </div>
      <nav class="graal-dock graal-glass" id="graal-dock" aria-label="Thanh hanh dong nhanh">
        ${this._dockButtonHTML('1', 'inventory', 'Balo', ICONS.backpack, 'Mo tui do [1]')}
        ${this._dockButtonHTML('2', 'jobs', 'Vi\u1ec7c l\u00e0m', ICONS.briefcase, 'Viec lam [2]')}
        ${this._dockButtonHTML('3', 'guild', 'Bang h\u1ed9i', ICONS.shield, 'Bang hoi [3]')}
        ${this._dockButtonHTML('4', 'arcade', 'Arcade', ICONS.gamepad, 'Khu game Arcade [4]')}
        ${this._dockButtonHTML('5', 'market', 'Ch\u1ee3', ICONS.shop, 'Cho [5]')}
        ${this._dockButtonHTML('6', 'dorm', 'KTX', ICONS.building, 'KTX [6]')}
      </nav>
      <div class="fort-event-pill graal-glass hidden" id="fort-event-pill" role="status" aria-label="Su kien phao dai">
        <span class="fort-pill-name">PH\u00c1O \u0110\u00c0I</span>
        <span class="fort-pill-timer" id="fort-pill-timer">--:--</span>
        <span class="fort-pill-leader hidden" id="fort-pill-leader"></span>
      </div>
    `;

    document.body.appendChild(overlay);
    this._overlay = overlay;

    overlay.querySelectorAll('.dock-action-btn').forEach((btn) => {
      btn.addEventListener('click', () => this._activateDockAction(btn.dataset.dockAction));
    });
  }

  _dockButtonHTML(hotkey, action, label, iconSvg, title) {
    return `
      <button type="button" class="dock-action-btn" data-dock-action="${action}" title="${title}">
        <span class="hotkey-badge" aria-hidden="true">${hotkey}</span>
        ${iconSvg}
        <span class="dock-label">${label}</span>
      </button>`;
  }

  // -------------------------------------------------------------- HP ----
  /** Cập nhật thanh HP (được HealthManager gọi qua _wireHealth). */
  setHP(current, max) {
    if (Number.isFinite(current)) this.hpCurrent = Math.max(0, current);
    if (Number.isFinite(max) && max > 0) this.hpMax = max;
    this._renderHP();
  }

  _renderHP() {
    const fill = this._overlay?.querySelector('#graal-hp-fill');
    const value = this._overlay?.querySelector('#graal-hp-value');
    const pct = this.hpMax > 0 ? Math.min(100, Math.max(0, (this.hpCurrent / this.hpMax) * 100)) : 0;
    if (fill) fill.style.width = `${pct}%`;
    if (value) value.textContent = `${this.hpCurrent}/${this.hpMax}`;
  }

  // ---------------------------------------------------------- Wallet ----
  _renderWallet(balance) {
    const el = this._overlay?.querySelector('#graal-dcoin-amount');
    if (el) {
      const n = Number.isFinite(balance) ? Math.max(0, Math.floor(balance)) : 0;
      el.textContent = n.toLocaleString('vi-VN');
      el.parentElement?.setAttribute('aria-label', `Vi D-Coin: ${n} D-Coin`);
    }
  }

  _wireWallet() {
    this._unsubWallet = walletManager.onChange((event) => {
      this._renderWallet(event?.balance ?? walletManager.getBalance());
    });
  }

  // --------------------------------------------------------- Health ----
  /** Phase C: thanh HP phản ánh HP thật từ HealthManager. */
  _wireHealth() {
    this._unsubHealth = healthManager.onChange((event) => {
      if (event && typeof event.hp === 'number') {
        this.setHP(event.hp, event.maxHP ?? COMBAT_CONFIG.maxHP);
      }
    });
  }

  // ---------------------------------------------------------- Clans ----
  /**
   * Phase E: tag bang cạnh tên người chơi (header) + pill timer sự kiện
   * pháo đài. Lắng nghe ClanManager / FortEventManager.
   */
  _wireClans() {
    this._renderClanTag();
    this._unsubClan = clanManager.onChange(() => this._renderClanTag());
    this._unsubFort = fortEventManager.onChange((event) => {
      if (!event) return;
      if (event.type === 'state' || event.type === 'tick') {
        this.setFortEvent(event.snapshot || fortEventManager.getSnapshot());
      } else if (event.type === 'payout') {
        this.setFortEvent(fortEventManager.getSnapshot());
      }
    });
    this.setFortEvent(fortEventManager.getSnapshot());
  }

  /** Tag bang nhỏ cạnh tên người chơi trên header (#clan-tag-pill). */
  _renderClanTag() {
    const pill = document.getElementById('clan-tag-pill');
    if (!pill) return;
    const clan = clanManager.getMyClan();
    if (!clan) {
      pill.classList.add('hidden');
      pill.textContent = '';
      return;
    }
    pill.classList.remove('hidden');
    pill.textContent = clan.shortName;
    pill.style.setProperty('--clan-color', clan.color);
    pill.setAttribute('aria-label', `Bang hoi: ${clan.name}`);
    pill.title = clan.name;
  }

  /**
   * Pill timer sự kiện pháo đài: hiện trong COUNTDOWN/ACTIVE, kèm bang
   * đang dẫn đầu. Ẩn ở các state còn lại.
   */
  setFortEvent(snapshot) {
    const pill = this._overlay?.querySelector('#fort-event-pill');
    if (!pill || !snapshot) return;
    const timerEl = pill.querySelector('#fort-pill-timer');
    const leaderEl = pill.querySelector('#fort-pill-leader');
    const active = snapshot.state === FORT_EVENT_STATES.COUNTDOWN
      || snapshot.state === FORT_EVENT_STATES.ACTIVE;
    if (!active) {
      pill.classList.add('hidden');
      return;
    }
    pill.classList.remove('hidden');
    pill.classList.toggle('is-countdown', snapshot.state === FORT_EVENT_STATES.COUNTDOWN);
    if (timerEl) {
      const s = Math.max(0, snapshot.secondsLeft || 0);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      timerEl.textContent = `${mm}:${ss}`;
    }
    if (leaderEl) {
      const clan = snapshot.leaderClanId ? getClanById(snapshot.leaderClanId) : null;
      if (clan) {
        leaderEl.classList.remove('hidden');
        leaderEl.textContent = clan.shortName;
        leaderEl.style.setProperty('--leader-color', clan.color);
        leaderEl.title = `${clan.name} đang dẫn điểm`;
      } else {
        leaderEl.classList.add('hidden');
        leaderEl.textContent = '';
      }
    }
  }

  /**
   * Đặt trạng thái huy hiệu vùng: true = VÙNG AN TOÀN (xanh ngọc),
   * false = VÙNG THÁCH ĐẤU (đỏ). DOM ID #graal-safe-zone được giữ nguyên.
   */
  setSafeZone(isSafe) {
    const badge = this._overlay?.querySelector('#graal-safe-zone');
    if (!badge) return;
    const label = badge.querySelector('span:last-child');
    if (isSafe) {
      badge.classList.remove('is-challenge');
      badge.setAttribute('aria-label', 'Vung an toan: khong the nhan sat thuong');
      if (label) label.textContent = 'VÙNG AN TOÀN';
    } else {
      badge.classList.add('is-challenge');
      badge.setAttribute('aria-label', 'Vung thach dau: co the nhan sat thuong');
      if (label) label.textContent = 'VÙNG THÁCH ĐẤU';
    }
  }

  // -------------------------------------------------------- Dock acts --
  _activateDockAction(action) {
    switch (action) {
      case 'inventory': {
        const inv = this.scene?.inventoryModal;
        if (inv && typeof inv.toggle === 'function') {
          inv.toggle();
        } else {
          toastManager.toast('T\u00fai \u0111\u1ed3 ch\u01b0a s\u1eb5n s\u00e0ng');
        }
        break;
      }
      case 'arcade': {
        const modal = this.scene?.interactiveModal;
        if (modal && typeof modal.openForZone === 'function') {
          modal.openForZone({
            id: 'dock_arcade',
            type: 'arcade_games',
            name: 'Khu Game Arcade',
            label: 'Arcade',
          });
          // Wire to the minigame SELECT screen ("Chọn game"): entering an
          // arcade zone auto-starts its defaultGame, so explicitly go back
          // to the select grid afterwards.
          if (typeof modal.showArcadeSelect === 'function') {
            modal.showArcadeSelect();
          }
        } else {
          toastManager.toast('Khu game Arcade ch\u01b0a s\u1eb5n s\u00e0ng');
        }
        break;
      }
      case 'jobs': {
        // Phase D1: mở modal Việc làm campus thay vì toast "sắp ra mắt".
        const jm = this.scene?.jobsModal;
        if (jm && typeof jm.toggle === 'function') {
          jm.toggle();
        } else {
          toastManager.toast('Việc làm chưa sẵn sàng');
        }
        break;
      }
      case 'guild': {
        // Phase E: mở modal Bang Hội & Sự Kiện Pháo Đài thay vì toast.
        const cm = this.scene?.clanModal;
        if (cm && typeof cm.toggle === 'function') {
          cm.toggle();
        } else {
          toastManager.toast('Bang h\u1ed9i ch\u01b0a s\u1eb5n s\u00e0ng');
        }
        break;
      }
      case 'market':
        toastManager.toast('Ch\u1ee3: s\u1eafp ra m\u1eaft');
        break;
      case 'dorm':
        toastManager.toast('KTX: s\u1eafp ra m\u1eaft');
        break;
      default:
        break;
    }
  }

  // -------------------------------------------------------- Keyboard ---
  _wireKeyboard() {
    this._keyHandler = (e) => {
      const ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) {
        return; // never hijack typing
      }
      const map = { Digit1: 'inventory', Digit2: 'jobs', Digit3: 'guild', Digit4: 'arcade', Digit5: 'market', Digit6: 'dorm' };
      const action = map[e.code];
      if (!action) return;
      e.preventDefault();
      this._activateDockAction(action);
    };
    window.addEventListener('keydown', this._keyHandler);
  }

  // ----------------------------------------------------- Radar reskin --
  /**
   * Applies the cyber-glass disc skin to the EXISTING minimap container.
   * MinimapOverlay logic/IDs are untouched.
   */
  _reskinRadar() {
    const radar = document.getElementById('minimap-overlay');
    if (radar) {
      radar.classList.add('graal-radar-skin', 'hud-radar-disc');
    }
  }

  destroy() {
    if (this._unsubWallet) {
      this._unsubWallet();
      this._unsubWallet = null;
    }
    if (this._unsubHealth) {
      this._unsubHealth();
      this._unsubHealth = null;
    }
    if (this._unsubClan) {
      this._unsubClan();
      this._unsubClan = null;
    }
    if (this._unsubFort) {
      this._unsubFort();
      this._unsubFort = null;
    }
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
    }
    this._overlay = null;
  }
}
