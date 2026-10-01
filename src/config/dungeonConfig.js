/**
 * DEVER TOWN — Cấu hình cân bằng Bug Dungeon (Hầm Sự Cố)
 * Mọi hằng số cân bằng gameplay của dungeon BẮT BUỘC nằm ở đây (AGENTS.md §6),
 * không hardcode trong InteractiveModal hay update loop.
 */
export const DUNGEON_BALANCE = {
  /** Cooldown hồi sinh của mỗi bug sau khi khắc phục (ms). Mặc định 10 phút. */
  bugRespawnCooldownMs: 10 * 60 * 1000,
  /** Trần D-Coin kiếm được từ dungeon mỗi ngày (chống farm vô hạn). */
  dailyCoinCap: 500,
  /** Key localStorage lưu cooldown từng bug: { [zoneId]: timestampMs } */
  cooldownStorageKey: 'dever_dungeon_cooldowns_v1',
  /** Key localStorage lưu coin đã kiếm hôm nay: { date: 'YYYY-MM-DD', earned: number } */
  dailyEarnStorageKey: 'dever_dungeon_daily_v1'
};

/** Đọc map cooldown { zoneId: timestampMs } từ localStorage. */
export function getDungeonCooldowns() {
  try {
    return JSON.parse(localStorage.getItem(DUNGEON_BALANCE.cooldownStorageKey) || '{}');
  } catch {
    return {};
  }
}

/** Ghi timestamp khắc phục của một bug. */
export function setDungeonCooldown(zoneId, timestampMs = Date.now()) {
  const map = getDungeonCooldowns();
  map[zoneId] = timestampMs;
  try {
    localStorage.setItem(DUNGEON_BALANCE.cooldownStorageKey, JSON.stringify(map));
  } catch { /* storage đầy: bỏ qua, cooldown chỉ mất khi reload */ }
}

/** Số ms còn phải chờ trước khi bug có thể farm lại (0 = sẵn sàng). */
export function getDungeonCooldownRemainingMs(zoneId, nowMs = Date.now()) {
  const last = getDungeonCooldowns()[zoneId] || 0;
  return Math.max(0, last + DUNGEON_BALANCE.bugRespawnCooldownMs - nowMs);
}

/** Lấy { date, earned } của hôm nay; tự reset khi sang ngày mới. */
export function getDungeonDailyEarn() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(localStorage.getItem(DUNGEON_BALANCE.dailyEarnStorageKey) || 'null');
    if (raw && raw.date === today) return raw;
  } catch { /* ignore */ }
  return { date: today, earned: 0 };
}

/** Cộng coin vào tổng hôm nay (đã kiểm tra cap ở ngoài). */
export function addDungeonDailyEarn(amount) {
  const rec = getDungeonDailyEarn();
  rec.earned += amount;
  try {
    localStorage.setItem(DUNGEON_BALANCE.dailyEarnStorageKey, JSON.stringify(rec));
  } catch { /* ignore */ }
  return rec.earned;
}

/** Coin còn có thể kiếm hôm nay trước khi chạm trần. */
export function getDungeonDailyRemaining() {
  return Math.max(0, DUNGEON_BALANCE.dailyCoinCap - getDungeonDailyEarn().earned);
}
