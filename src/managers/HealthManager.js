/**
 * DEVER TOWN — HEALTH MANAGER (QUẢN LÝ THỂ LỰC 50 HP)
 *
 * Quản lý thanh thể lực duy nhất của người chơi — nền tảng cho cơ chế
 * Safe Zone / Challenge Zone hướng GraalOnline (Masterplan — Trụ cột 1).
 *
 * - Chuẩn 50 HP (COMBAT_CONFIG.maxHP). HP lưu trong localStorage.
 * - KHÔNG có PvP: người chơi không bao giờ gây sát thương trực tiếp cho
 *   nhau. damage() chỉ có hiệu lực khi canTakeDamage() là true, và vùng
 *   quyết định điều đó qua zone provider do scene đăng ký
 *   (setZoneProvider). Mặc định mọi vùng đều 'safe' → không nhận sát
 *   thương cho đến khi Phase E định nghĩa vùng thách đấu.
 * - KO giữ nguyên 100% vật phẩm và D-Coin (không rơi đồ — thân thiện
 *   sinh viên). knockOut() hồi đầy HP và phát sự kiện 'ko' để scene
 *   thực hiện hồi sinh tại Trạm Y Tế FPTU (Tòa Alpha).
 */
import { COMBAT_CONFIG, ZONE_SAFE } from '../config/combatConfig.js';

export class HealthManager {
  constructor() {
    this.maxHP = COMBAT_CONFIG.maxHP;
    this.hp = COMBAT_CONFIG.maxHP;
    this.listeners = new Set();
    this.zoneProvider = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(COMBAT_CONFIG.healthStorageKey);
      if (raw === null || raw === undefined) {
        this.saveToStorage();
        return;
      }
      const parsed = Number(raw);
      this.hp = HealthManager.isValidAmount(parsed) ? Math.min(parsed, this.maxHP) : this.maxHP;
    } catch (e) {
      console.warn('[Health] Loi nap HP tu LocalStorage:', e);
      this.hp = this.maxHP;
    }
  }

  saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(COMBAT_CONFIG.healthStorageKey, String(this.hp));
    } catch (e) {
      console.warn('[Health] Loi luu HP vao LocalStorage:', e);
    }
  }

  /**
   * Kiểm tra lượng HP hợp lệ: số nguyên, không âm, hữu hạn.
   * Từ chối NaN, Infinity, số lẻ, số âm và kiểu không phải số.
   */
  static isValidAmount(amount) {
    return typeof amount === 'number'
      && Number.isFinite(amount)
      && Number.isInteger(amount)
      && amount >= 0;
  }

  /**
   * Đăng ký nguồn cung cấp vùng hiện tại (do scene cài đặt).
   * @param {Function|null} fn - Trả về 'safe' | 'challenge'.
   */
  setZoneProvider(fn) {
    this.zoneProvider = typeof fn === 'function' ? fn : null;
  }

  /** Vùng hiện tại của người chơi (mặc định 'safe' khi chưa đăng ký provider). */
  getCurrentZone() {
    try {
      const z = this.zoneProvider ? this.zoneProvider() : ZONE_SAFE;
      return z || ZONE_SAFE;
    } catch (e) {
      return ZONE_SAFE;
    }
  }

  /**
   * Người chơi chỉ nhận sát thương khi đang ở vùng cho phép
   * (vùng thách đấu — Phase E). Vùng an toàn luôn trả về false.
   */
  canTakeDamage() {
    return this.getCurrentZone() !== ZONE_SAFE;
  }

  /**
   * Gây sát thương lên người chơi. Không có tác dụng khi đang ở vùng an
   * toàn (trả về HP hiện tại, không phát sự kiện). HP chạm 0 → tự động
   * knockOut() (hồi đầy HP + phát sự kiện 'ko' để scene hồi sinh).
   * @param {number} amount - Lượng sát thương (số nguyên không âm).
   * @param {string} source - Nguồn sát thương (vd: 'water_gun', 'fort_event').
   * @returns {number} HP sau khi trừ.
   * @throws {Error} Nếu lượng sát thương không hợp lệ.
   */
  damage(amount, source = 'unknown') {
    if (!HealthManager.isValidAmount(amount)) {
      throw new Error(`[Health] damage: luong sat thuong khong hop le (${String(amount)}) tu nguon '${source}'`);
    }
    if (!this.canTakeDamage()) {
      return this.hp; // Vùng an toàn: miễn nhiễm, không phát sự kiện.
    }
    this.hp = Math.max(0, this.hp - amount);
    this.saveToStorage();
    if (this.hp <= 0) {
      this.knockOut(source);
      return this.hp;
    }
    this.emitChange({ type: 'damage', amount, source, hp: this.hp, maxHP: this.maxHP });
    return this.hp;
  }

  /**
   * Hồi HP cho người chơi (kẹp ở maxHP).
   * @param {number} amount - Lượng hồi (số nguyên không âm).
   * @param {string} source - Nguồn hồi (vd: 'safe_zone', 'nurse', 'item').
   * @returns {number} HP sau khi hồi.
   * @throws {Error} Nếu lượng hồi không hợp lệ.
   */
  heal(amount, source = 'unknown') {
    if (!HealthManager.isValidAmount(amount)) {
      throw new Error(`[Health] heal: luong hoi phuc khong hop le (${String(amount)}) tu nguon '${source}'`);
    }
    if (amount === 0 || this.hp >= this.maxHP) return this.hp;
    this.hp = Math.min(this.maxHP, this.hp + amount);
    this.saveToStorage();
    this.emitChange({ type: 'heal', amount, source, hp: this.hp, maxHP: this.maxHP });
    return this.hp;
  }

  /** Hồi đầy HP (dùng khi bước vào vùng an toàn). */
  healToFull(source = 'safe_zone') {
    return this.heal(this.maxHP - this.hp, source);
  }

  /**
   * Gục ngã: giữ nguyên 100% vật phẩm và D-Coin (không rơi đồ), hồi đầy
   * HP, phát sự kiện 'ko' để scene thực hiện hồi sinh tại Trạm Y Tế FPTU.
   * @param {string} source - Nguồn gây KO cuối cùng.
   */
  knockOut(source = 'unknown') {
    this.hp = this.maxHP;
    this.saveToStorage();
    // Thân thiện sinh viên: KHÔNG trừ vật phẩm, KHÔNG trừ D-Coin.
    this.emitChange({ type: 'ko', source, hp: this.hp, maxHP: this.maxHP });
    return this.hp;
  }

  /** HP hiện tại. */
  getHP() {
    return this.hp;
  }

  /** HP tối đa. */
  getMaxHP() {
    return this.maxHP;
  }

  /** true khi HP đã chạm 0 (chưa được knockOut xử lý). */
  isKO() {
    return this.hp <= 0;
  }

  /**
   * Đăng ký lắng nghe thay đổi HP.
   * @param {Function} cb - Nhận event { type: 'damage'|'heal'|'ko', amount?, source, hp, maxHP }.
   * @returns {Function} Hàm hủy đăng ký.
   */
  onChange(cb) {
    if (typeof cb === 'function') this.listeners.add(cb);
    return () => this.offChange(cb);
  }

  /** Hủy đăng ký lắng nghe thay đổi HP. */
  offChange(cb) {
    this.listeners.delete(cb);
  }

  emitChange(event) {
    for (const cb of this.listeners) {
      try {
        cb(event);
      } catch (e) {
        console.warn('[Health] Loi trong health onChange listener:', e);
      }
    }
  }
}

/** Singleton thể lực dùng chung toàn game. */
export const healthManager = new HealthManager();
