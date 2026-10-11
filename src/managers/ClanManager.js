/**
 * DEVER TOWN — CLAN MANAGER (QUẢN LÝ BANG HỘI) — Phase E
 *
 * Quản lý tư cách thành viên bang hội của người chơi hiện tại + roster local.
 *
 * v1 — GIỚI HẠN ĐÃ BIẾT: roster lưu trong localStorage, CHƯA có server đồng
 * bộ. getMembers() chỉ thấy thành viên đã join trên máy này. Khi server
 * clan ra mắt, thay phần đọc/ghi roster bằng API mà KHÔNG đổi public API
 * của class này (joinClan/leaveClan/getMyClan/getMembers/onChange giữ nguyên).
 *
 * Định nghĩa 4 bang + storage keys nằm ở src/config/clansConfig.js.
 */
import {
  CLANS,
  CLAN_MEMBERSHIP_STORAGE_KEY,
  CLAN_ROSTER_STORAGE_KEY,
  getClanById,
  isValidClanId,
} from '../config/clansConfig.js';

const FALLBACK_NAME_STORAGE_KEY = 'dever_nickname';

export class ClanManager {
  constructor() {
    this.listeners = new Set();
    this.membership = null; // { clanId, joinedAt } | null
    this.roster = {};       // { [clanId]: [{ name, joinedAt }] }
    this.playerName = null; // override tên hiển thị khi join
    this._loadFromStorage();
  }

  // ------------------------------------------------------------ storage --
  _loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const rawMembership = localStorage.getItem(CLAN_MEMBERSHIP_STORAGE_KEY);
      if (rawMembership) {
        const parsed = JSON.parse(rawMembership);
        if (parsed && isValidClanId(parsed.clanId)) {
          this.membership = { clanId: parsed.clanId, joinedAt: Number(parsed.joinedAt) || Date.now() };
        }
      }
      const rawRoster = localStorage.getItem(CLAN_ROSTER_STORAGE_KEY);
      if (rawRoster) {
        const parsed = JSON.parse(rawRoster);
        if (parsed && typeof parsed === 'object') {
          for (const clanId of Object.keys(parsed)) {
            if (isValidClanId(clanId) && Array.isArray(parsed[clanId])) {
              this.roster[clanId] = parsed[clanId]
                .filter((m) => m && typeof m.name === 'string')
                .map((m) => ({ name: m.name, joinedAt: Number(m.joinedAt) || Date.now() }));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Clan] Loi nap du lieu bang hoi tu LocalStorage:', e);
      this.membership = null;
      this.roster = {};
    }
  }

  _saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      if (this.membership) {
        localStorage.setItem(CLAN_MEMBERSHIP_STORAGE_KEY, JSON.stringify(this.membership));
      } else {
        localStorage.removeItem(CLAN_MEMBERSHIP_STORAGE_KEY);
      }
      localStorage.setItem(CLAN_ROSTER_STORAGE_KEY, JSON.stringify(this.roster));
    } catch (e) {
      console.warn('[Clan] Loi luu du lieu bang hoi vao LocalStorage:', e);
    }
  }

  // ------------------------------------------------------------- events --
  /**
   * Đăng ký nhận sự kiện thay đổi bang. Sự kiện: { type: 'join'|'leave',
   * clanId, clan } . Trả về hàm hủy đăng ký.
   */
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
        console.warn('[Clan] Loi listener:', e);
      }
    }
  }

  // -------------------------------------------------------------- state --
  /** Danh sách 4 bang chính thức (bản sao để tránh bị sửa từ ngoài). */
  getClans() {
    return CLANS.map((c) => ({ ...c }));
  }

  /** Tên hiển thị dùng khi ghi roster (ưu tiên override, rồi nickname). */
  getPlayerName() {
    if (this.playerName) return this.playerName;
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(FALLBACK_NAME_STORAGE_KEY) || 'Dever Member';
      }
    } catch (e) { /* noop */ }
    return 'Dever Member';
  }

  /** Đặt tên hiển thị dùng cho roster (gọi sau khi đăng nhập). */
  setPlayerName(name) {
    if (typeof name === 'string' && name.trim()) {
      this.playerName = name.trim().slice(0, 24);
    }
  }

  /** Bang hiện tại của người chơi (định nghĩa đầy đủ) hoặc null. */
  getMyClan() {
    if (!this.membership) return null;
    return getClanById(this.membership.clanId);
  }

  /** clanId hiện tại hoặc null. */
  getMyClanId() {
    return this.membership ? this.membership.clanId : null;
  }

  /**
   * Tham gia bang. Rời bang cũ (nếu có) trước. Idempotent khi join lại
   * đúng bang hiện tại.
   * @throws {Error} nếu clanId không hợp lệ.
   */
  joinClan(clanId) {
    if (!isValidClanId(clanId)) {
      throw new Error(`[Clan] clanId khong hop le: ${clanId}`);
    }
    if (this.membership && this.membership.clanId === clanId) {
      return this.getMyClan(); // đã ở bang này — no-op
    }
    const previous = this.membership ? { ...this.membership } : null;
    if (previous) {
      this._removeFromRoster(previous.clanId, this.getPlayerName());
    }
    const now = Date.now();
    this.membership = { clanId, joinedAt: now };
    this._addToRoster(clanId, this.getPlayerName(), now);
    this._saveToStorage();
    if (previous) {
      this._emit({ type: 'leave', clanId: previous.clanId, clan: getClanById(previous.clanId) });
    }
    this._emit({ type: 'join', clanId, clan: getClanById(clanId) });
    return this.getMyClan();
  }

  /** Rời bang hiện tại (no-op nếu chưa tham gia bang nào). */
  leaveClan() {
    if (!this.membership) return null;
    const left = { ...this.membership };
    this._removeFromRoster(left.clanId, this.getPlayerName());
    this.membership = null;
    this._saveToStorage();
    this._emit({ type: 'leave', clanId: left.clanId, clan: getClanById(left.clanId) });
    return getClanById(left.clanId);
  }

  /**
   * Roster local của bang (v1: chỉ thành viên trên máy này).
   * @throws {Error} nếu clanId không hợp lệ.
   */
  getMembers(clanId) {
    if (!isValidClanId(clanId)) {
      throw new Error(`[Clan] clanId khong hop le: ${clanId}`);
    }
    return (this.roster[clanId] || []).map((m) => ({ ...m }));
  }

  /** Số thành viên local của bang. */
  getMemberCount(clanId) {
    if (!isValidClanId(clanId)) return 0;
    return (this.roster[clanId] || []).length;
  }

  // -------------------------------------------------------------- roster --
  _addToRoster(clanId, name, joinedAt) {
    const list = this.roster[clanId] || [];
    if (!list.some((m) => m.name === name)) {
      list.push({ name, joinedAt });
    }
    this.roster[clanId] = list;
  }

  _removeFromRoster(clanId, name) {
    const list = this.roster[clanId] || [];
    this.roster[clanId] = list.filter((m) => m.name !== name);
  }
}

/** Singleton dùng chung toàn game. */
export const clanManager = new ClanManager();
