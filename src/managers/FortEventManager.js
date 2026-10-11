/**
 * DEVER TOWN — FORT TEST EVENT MANAGER — Phase E
 *
 * Framework sự kiện pháo đài TEST (kích hoạt thủ công — chưa phải sự kiện
 * tuần cố định). Masterplan Trụ cột 3 (Clans & Base Forts).
 *
 * Máy trạng thái (FSM — mọi hằng số nằm ở src/config/combatConfig.js):
 *   IDLE → COUNTDOWN → ACTIVE → ENDED → PAYOUT → (IDLE | COUNTDOWN mới)
 *
 * - King-of-the-hill: mỗi tick, bang có NHIỀU thành viên nhất trong vùng
 *   pháo đài (rect tọa độ, không đụng map/collider) được cộng điểm.
 *   Presence-based — v1 không cần combat vì chưa có nguồn PvP damage.
 * - Luật Graal 2026 (chống scam): thưởng participation-based — chia quỹ
 *   thưởng (FORT_EVENT_CONFIG.prizePool) cho TẤT CẢ participant (ở trong
 *   fort >= minParticipationSec), tỉ lệ theo thời gian trong vùng.
 *   KHÔNG winner-takes-all. Bang dẫn điểm chỉ mang tính danh dự.
 * - Chỉ thành viên bang (có clanId hợp lệ) mới được tính điểm và thưởng.
 *
 * v1 — GIỚI HẠN ĐÃ BIẾT: chưa có server. Presence gồm: người chơi local
 * (qua setPositionProvider) + remote presence bơm qua registerRemotePresence
 * (server sau này gọi) + bot test (seedTestBots — gắn nhãn isBot rõ ràng,
 * chỉ dùng để test framework). Payout tiền thật chỉ áp cho người chơi local
 * qua walletManager.earn(); phần của bot/remote chỉ ghi trong report.
 */
import { FORT_EVENT_CONFIG, FORT_EVENT_STATES } from '../config/combatConfig.js';
import { isValidClanId } from '../config/clansConfig.js';
import { walletManager } from './WalletManager.js';
import { clanManager } from './ClanManager.js';

const S = FORT_EVENT_STATES;

export class FortEventManager {
  /**
   * @param {Object} [options]
   * @param {Object} [options.config] - Ghi đè FORT_EVENT_CONFIG (cho test).
   */
  constructor({ config } = {}) {
    this.config = { ...FORT_EVENT_CONFIG, ...(config || {}) };
    this.fort = { ...FORT_EVENT_CONFIG.fort, ...((config && config.fort) || {}) };
    this.listeners = new Set();
    this.state = S.IDLE;

    this._countdownMs = 0;
    this._countdownSec = 0;
    this._durationSec = 0;
    this._elapsedMs = 0;
    this._tickAccMs = 0;

    this._positionProvider = null;
    this._localPlayer = { id: 'local', name: 'Dever Member' };
    this._remotes = new Map(); // id -> { name, clanId, x, y, roomId }
    this._bots = [];           // [{ id, name, clanId, x, y, tx, ty, isBot }]
    this._participants = {};   // id -> { name, clanId, isBot, isLocal }
    this._timeInZone = {};     // id -> seconds
    this._scores = {};         // clanId -> points
    this._leaderClanId = null;
    this._lastReport = null;
  }

  // ------------------------------------------------------------- events --
  /** Sự kiện: {type:'state',state} | {type:'tick',...} | {type:'payout',report} */
  onChange(listener) {
    if (typeof listener === 'function') this.listeners.add(listener);
    return () => this.offChange(listener);
  }

  offChange(listener) {
    this.listeners.delete(listener);
  }

  _emit(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.warn('[FortEvent] Loi listener:', e);
      }
    }
  }

  _setState(next) {
    this.state = next;
    this._emit({ type: 'state', state: next, snapshot: this.getSnapshot() });
  }

  // ------------------------------------------------------------ wiring --
  /** Đăng ký nguồn vị trí người chơi local: () => {x, y, roomId} | null. */
  setPositionProvider(fn) {
    this._positionProvider = typeof fn === 'function' ? fn : null;
  }

  /** Định danh người chơi local (cho payout). */
  setLocalPlayer({ id, name } = {}) {
    if (id) this._localPlayer.id = String(id);
    if (typeof name === 'string' && name.trim()) {
      this._localPlayer.name = name.trim().slice(0, 24);
    }
  }

  /**
   * Server (phase sau) bơm presence của người chơi khác.
   * @param {string} id - Định danh duy nhất của người chơi.
   * @param {Object} info - { name, clanId, x, y, roomId }.
   */
  registerRemotePresence(id, info = {}) {
    if (!id) return;
    this._remotes.set(String(id), {
      name: String(info.name || 'Dever Member').slice(0, 24),
      clanId: isValidClanId(info.clanId) ? info.clanId : null,
      x: Number(info.x),
      y: Number(info.y),
      roomId: info.roomId || null,
    });
  }

  clearRemotePresence(id) {
    this._remotes.delete(String(id));
  }

  clearAllRemotePresence() {
    this._remotes.clear();
  }

  // ---------------------------------------------------------- test bots --
  /**
   * Gieo bot test để kiểm chứng framework (king-of-the-hill, payout).
   * Bot được gắn nhãn isBot rõ ràng trong mọi report — KHÔNG phải người
   * chơi thật, KHÔNG nhận D-Coin thật.
   */
  seedTestBots(count) {
    this.clearTestBots();
    const n = Math.max(0, Math.floor(Number(count) || 0));
    const clanIds = ['web_builders', 'ai_core', 'mobile_masters', 'game_devs'];
    const f = this.fort;
    for (let i = 0; i < n; i++) {
      const bot = {
        id: `testbot-${i + 1}`,
        name: `TestBot-${String(i + 1).padStart(2, '0')}`,
        clanId: clanIds[i % clanIds.length],
        x: f.x + f.w / 2 + (Math.random() - 0.5) * 400,
        y: f.y + f.h / 2 + (Math.random() - 0.5) * 300,
        tx: 0,
        ty: 0,
        isBot: true,
      };
      this._pickBotTarget(bot);
      this._bots.push(bot);
    }
    return this._bots.length;
  }

  clearTestBots() {
    this._bots = [];
  }

  getTestBots() {
    return this._bots.map((b) => ({ ...b }));
  }

  _pickBotTarget(bot) {
    const f = this.fort;
    if (Math.random() < 0.65) {
      // 65%: đi vào trong fort — tạo tranh chấp king-of-the-hill.
      bot.tx = f.x + 8 + Math.random() * Math.max(1, f.w - 16);
      bot.ty = f.y + 8 + Math.random() * Math.max(1, f.h - 16);
    } else {
      const ang = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 160;
      bot.tx = f.x + f.w / 2 + Math.cos(ang) * r;
      bot.ty = f.y + f.h / 2 + Math.sin(ang) * r;
    }
  }

  _updateBots(deltaMs) {
    const speed = Number(this.config.botWanderSpeed) || 60;
    for (const b of this._bots) {
      const dx = b.tx - b.x;
      const dy = b.ty - b.y;
      const d = Math.hypot(dx, dy);
      if (d < 8) {
        this._pickBotTarget(b);
        continue;
      }
      const step = Math.min((speed * deltaMs) / 1000, d);
      b.x += (dx / d) * step;
      b.y += (dy / d) * step;
    }
  }

  // --------------------------------------------------------------- FSM --
  /**
   * Bắt đầu một test event thủ công. Chỉ gọi được từ IDLE hoặc PAYOUT.
   * @param {Object} [overrides] - { countdownSec, durationSec, testBotCount }
   *   (dùng cho test / demo nhanh).
   * @throws {Error} khi state hiện tại không cho phép hoặc tham số sai.
   */
  startTestEvent(overrides = {}) {
    if (this.state !== S.IDLE && this.state !== S.PAYOUT) {
      throw new Error(`[FortEvent] khong the bat dau test event khi state=${this.state}`);
    }
    const o = overrides || {};
    const countdownSec = o.countdownSec ?? this.config.countdownSec;
    const durationSec = o.durationSec ?? this.config.durationSec;
    const testBotCount = o.testBotCount ?? this.config.testBotCount;
    if (!Number.isFinite(countdownSec) || countdownSec < 0) {
      throw new Error('[FortEvent] countdownSec phai la so >= 0');
    }
    if (!Number.isFinite(durationSec) || durationSec <= 0) {
      throw new Error('[FortEvent] durationSec phai la so > 0');
    }
    if (!Number.isInteger(Number(testBotCount)) || Number(testBotCount) < 0) {
      throw new Error('[FortEvent] testBotCount phai la so nguyen >= 0');
    }
    this._resetRun();
    this._countdownSec = countdownSec;
    this._durationSec = durationSec;
    this._countdownMs = countdownSec * 1000;
    this.seedTestBots(testBotCount);
    this._setState(S.COUNTDOWN);
    return true;
  }

  /** Hủy event đang chạy, về IDLE. */
  cancelEvent() {
    if (this.state === S.IDLE) return false;
    this._resetRun();
    this._setState(S.IDLE);
    return true;
  }

  _resetRun() {
    this.clearTestBots();
    this._participants = {};
    this._timeInZone = {};
    this._scores = {};
    this._leaderClanId = null;
    this._elapsedMs = 0;
    this._tickAccMs = 0;
    this._countdownMs = 0;
  }

  /**
   * WorldScene.update() gọi mỗi frame. Bọc try/catch ở phía gọi để không
   * bao giờ crash game loop.
   */
  update(deltaMs) {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
    if (this.state === S.COUNTDOWN || this.state === S.ACTIVE) {
      this._updateBots(deltaMs);
    }
    if (this.state === S.COUNTDOWN) {
      this._countdownMs -= deltaMs;
      if (this._countdownMs <= 0) {
        this._elapsedMs = 0;
        this._tickAccMs = 0;
        this._setState(S.ACTIVE);
      } else {
        this._emit({ type: 'tick', state: this.state, snapshot: this.getSnapshot() });
      }
    } else if (this.state === S.ACTIVE) {
      this._elapsedMs += deltaMs;
      this._tickAccMs += deltaMs;
      const tickMs = Math.max(1, (Number(this.config.tickSec) || 1) * 1000);
      while (this._tickAccMs >= tickMs) {
        this._tickAccMs -= tickMs;
        this._doTick();
      }
      if (this._elapsedMs >= this._durationSec * 1000) {
        this._finishEvent();
      }
    }
  }

  // ------------------------------------------------------------- scoring --
  _gatherPresences() {
    const list = [];
    try {
      const p = this._positionProvider ? this._positionProvider() : null;
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        list.push({
          id: this._localPlayer.id,
          name: this._localPlayer.name,
          clanId: clanManager.getMyClanId(),
          x: p.x,
          y: p.y,
          roomId: p.roomId || null,
          isLocal: true,
        });
      }
    } catch (e) { /* provider lỗi — bỏ qua tick này */ }
    for (const [id, r] of this._remotes) {
      list.push({ id, ...r });
    }
    for (const b of this._bots) {
      list.push({
        id: b.id,
        name: b.name,
        clanId: b.clanId,
        x: b.x,
        y: b.y,
        roomId: this.fort.roomId,
        isBot: true,
      });
    }
    return list;
  }

  /** Điểm (px) có nằm trong rect pháo đài của đúng phòng không. */
  isInFort(x, y, roomId) {
    const f = this.fort;
    return (
      roomId === f.roomId
      && Number.isFinite(x) && Number.isFinite(y)
      && x >= f.x && x <= f.x + f.w
      && y >= f.y && y <= f.y + f.h
    );
  }

  _doTick() {
    const tickSec = Number(this.config.tickSec) || 1;
    const membersInFort = {}; // clanId -> count
    for (const p of this._gatherPresences()) {
      if (!isValidClanId(p.clanId)) continue; // chỉ thành viên bang
      if (!this.isInFort(p.x, p.y, p.roomId)) continue;
      if (!this._participants[p.id]) {
        this._participants[p.id] = {
          name: p.name,
          clanId: p.clanId,
          isBot: !!p.isBot,
          isLocal: !!p.isLocal,
        };
      }
      this._timeInZone[p.id] = (this._timeInZone[p.id] || 0) + tickSec;
      membersInFort[p.clanId] = (membersInFort[p.clanId] || 0) + 1;
    }
    // Bang đông người nhất trong fort dẫn điểm; hòa → giữ leader cũ.
    let best = null;
    let bestCount = 0;
    for (const [clanId, count] of Object.entries(membersInFort)) {
      if (count > bestCount) {
        best = clanId;
        bestCount = count;
      }
    }
    if (best) this._leaderClanId = best;
    if (this._leaderClanId) {
      const pts = Number(this.config.pointsPerTick) || 0;
      this._scores[this._leaderClanId] = (this._scores[this._leaderClanId] || 0) + pts;
    }
    this._emit({
      type: 'tick',
      state: this.state,
      scores: { ...this._scores },
      leaderClanId: this._leaderClanId,
      secondsLeft: this._secondsLeft(),
    });
  }

  // -------------------------------------------------------------- payout --
  _finishEvent() {
    this._setState(S.ENDED);
    const report = this._buildPayoutReport();
    // v1: chỉ người chơi local nhận D-Coin thật qua ví trung tâm.
    const local = report.participants.find((p) => p.isLocal);
    if (local && local.amount > 0) {
      try {
        walletManager.earn(local.amount, 'fort_event');
      } catch (e) {
        console.warn('[FortEvent] Loi cong D-Coin thuong su kien:', e);
      }
    }
    this._lastReport = report;
    this.clearTestBots();
    this._setState(S.PAYOUT);
    this._emit({ type: 'payout', report });
  }

  /**
   * Chia quỹ thưởng theo tỉ lệ thời gian trong vùng (largest remainder —
   * tổng distributed luôn đúng bằng prizePool, đơn vị D-Coin nguyên).
   * Thuần túy, không đụng state — dùng trực tiếp trong test.
   */
  static computePayoutShares(entries, prizePool) {
    const result = {};
    if (!Array.isArray(entries) || entries.length === 0) return result;
    const pool = Math.floor(Number(prizePool) || 0);
    if (pool <= 0) return result;
    const total = entries.reduce((s, e) => s + (Number(e.timeSec) || 0), 0);
    if (total <= 0) return result;
    const rows = entries.map((e) => {
      const exact = (pool * (Number(e.timeSec) || 0)) / total;
      const amount = Math.floor(exact);
      return { id: e.id, amount, rem: exact - amount, timeSec: Number(e.timeSec) || 0 };
    });
    let leftover = pool - rows.reduce((s, r) => s + r.amount, 0);
    rows.sort(
      (a, b) => b.rem - a.rem || b.timeSec - a.timeSec || String(a.id).localeCompare(String(b.id)),
    );
    let i = 0;
    while (leftover > 0 && rows.length > 0) {
      rows[i % rows.length].amount += 1;
      leftover -= 1;
      i += 1;
    }
    for (const r of rows) result[r.id] = r.amount;
    return result;
  }

  _buildPayoutReport() {
    const pool = Math.floor(Number(this.config.prizePool) || 0);
    const minT = Number(this.config.minParticipationSec) || 0;
    const eligible = Object.entries(this._timeInZone)
      .filter(([, t]) => t >= minT)
      .map(([id, t]) => ({ id, timeSec: t, ...this._participants[id] }));
    const shares = FortEventManager.computePayoutShares(
      eligible.map((e) => ({ id: e.id, timeSec: e.timeSec })),
      pool,
    );
    const participants = eligible
      .map((e) => ({ ...e, amount: shares[e.id] || 0 }))
      .sort((a, b) => b.amount - a.amount || b.timeSec - a.timeSec);
    return {
      eventName: 'Fort Test Event',
      fortName: this.fort.name,
      prizePool: pool,
      minParticipationSec: minT,
      distributed: participants.reduce((s, p) => s + p.amount, 0),
      participantCount: participants.length,
      // Bang dẫn điểm (danh dự) — KHÔNG quyết định thưởng (luật Graal 2026).
      leaderClanId: this._leaderClanId,
      scores: { ...this._scores },
      participants,
      endedAt: Date.now(),
    };
  }

  // ------------------------------------------------------------- getters --
  getState() {
    return this.state;
  }

  getLeader() {
    return this._leaderClanId;
  }

  getScores() {
    return { ...this._scores };
  }

  getLastReport() {
    return this._lastReport ? { ...this._lastReport } : null;
  }

  _secondsLeft() {
    if (this.state === S.COUNTDOWN) return Math.max(0, Math.ceil(this._countdownMs / 1000));
    if (this.state === S.ACTIVE) {
      return Math.max(0, Math.ceil((this._durationSec * 1000 - this._elapsedMs) / 1000));
    }
    return 0;
  }

  /** Snapshot cho HUD (pill timer + bang dẫn đầu). */
  getSnapshot() {
    return {
      state: this.state,
      secondsLeft: this._secondsLeft(),
      scores: { ...this._scores },
      leaderClanId: this._leaderClanId,
      participantCount: Object.keys(this._timeInZone).length,
      fortName: this.fort.name,
      lastReport: this._lastReport,
    };
  }
}

/** Singleton dùng chung toàn game. */
export const fortEventManager = new FortEventManager();
