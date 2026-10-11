/**
 * DEVER TOWN — WALLET MANAGER (VÍ D-COIN TRUNG TÂM)
 *
 * Quản lý số dư D-Coin duy nhất của người chơi — nền tảng cho kinh tế
 * hướng GraalOnline (việc làm campus, clan, shop). Mọi nguồn thưởng D-Coin
 * (Snake, SheepDream, BugDungeon, ClubSettlement...) BẮT BUỘC đi qua
 * walletManager.earn(); mọi khoản chi (shop, phí...) BẮT BUỘC đi qua
 * walletManager.spend(). Không cộng/trừ D-Coin bằng localStorage trực tiếp.
 *
 * - Số dư lưu trong localStorage (key trong src/config/economyConfig.js).
 * - Số lượng hợp lệ: số nguyên không âm, hữu hạn (từ chối NaN, số lẻ, âm).
 * - earn(): cộng coin, phát sự kiện 'change', trả về số dư mới.
 * - spend(): trả về false nếu không đủ số dư, ngược lại trừ và phát sự kiện.
 */
import { ECONOMY_CONFIG } from '../config/economyConfig.js';

export class WalletManager {
  constructor() {
    this.balance = ECONOMY_CONFIG.startingBalance;
    this.listeners = new Set();
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(ECONOMY_CONFIG.walletStorageKey);
      if (raw === null || raw === undefined) {
        this.saveToStorage();
        return;
      }
      const parsed = Number(raw);
      this.balance = WalletManager.isValidAmount(parsed)
        ? parsed
        : ECONOMY_CONFIG.startingBalance;
    } catch (e) {
      console.warn('[Wallet] Loi nap so du vi tu LocalStorage:', e);
      this.balance = ECONOMY_CONFIG.startingBalance;
    }
  }

  saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(ECONOMY_CONFIG.walletStorageKey, String(this.balance));
    } catch (e) {
      console.warn('[Wallet] Loi luu so du vi vao LocalStorage:', e);
    }
  }

  /**
   * Kiểm tra số lượng D-Coin hợp lệ: số nguyên, không âm, hữu hạn.
   * Từ chối NaN, Infinity, số lẻ, số âm và kiểu không phải số.
   */
  static isValidAmount(amount) {
    return typeof amount === 'number'
      && Number.isFinite(amount)
      && Number.isInteger(amount)
      && amount >= 0;
  }

  /**
   * Cộng D-Coin vào ví.
   * @param {number} amount - Số lượng (số nguyên không âm).
   * @param {string} source - Nguồn thu (vd: 'snake', 'sheep_dream', 'bug_dungeon').
   * @returns {number} Số dư mới sau khi cộng.
   * @throws {Error} Nếu số lượng không hợp lệ.
   */
  earn(amount, source = 'unknown') {
    if (!WalletManager.isValidAmount(amount)) {
      throw new Error(`[Wallet] earn: so luong khong hop le (${String(amount)}) tu nguon '${source}'`);
    }
    this.balance += amount;
    this.saveToStorage();
    this.emitChange({ type: 'earn', amount, source, balance: this.balance });
    return this.balance;
  }

  /**
   * Trừ D-Coin khỏi ví (vd: mua vật phẩm, phí dịch vụ).
   * @param {number} amount - Số lượng (số nguyên không âm).
   * @param {string} sink - Nơi chi tiêu (vd: 'shop', 'fee').
   * @returns {boolean} false nếu số dư không đủ, true nếu trừ thành công.
   * @throws {Error} Nếu số lượng không hợp lệ.
   */
  spend(amount, sink = 'unknown') {
    if (!WalletManager.isValidAmount(amount)) {
      throw new Error(`[Wallet] spend: so luong khong hop le (${String(amount)}) cho '${sink}'`);
    }
    if (amount > this.balance) return false;
    this.balance -= amount;
    this.saveToStorage();
    this.emitChange({ type: 'spend', amount, sink, balance: this.balance });
    return true;
  }

  /** Số dư D-Coin hiện tại. */
  getBalance() {
    return this.balance;
  }

  /**
   * Đăng ký lắng nghe thay đổi số dư.
   * @param {Function} cb - Nhận event { type: 'earn'|'spend', amount, source|sink, balance }.
   * @returns {Function} Hàm hủy đăng ký.
   */
  onChange(cb) {
    if (typeof cb === 'function') this.listeners.add(cb);
    return () => this.offChange(cb);
  }

  /** Hủy đăng ký lắng nghe thay đổi số dư. */
  offChange(cb) {
    this.listeners.delete(cb);
  }

  emitChange(event) {
    for (const cb of this.listeners) {
      try {
        cb(event);
      } catch (e) {
        console.warn('[Wallet] Loi trong wallet onChange listener:', e);
      }
    }
  }
}

/** Singleton ví D-Coin trung tâm dùng toàn game. */
export const walletManager = new WalletManager();
