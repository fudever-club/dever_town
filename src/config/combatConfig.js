/**
 * DEVER TOWN — CẤU HÌNH CHIẾN ĐẤU / THỂ LỰC (COMBAT & HEALTH)
 *
 * Mọi hằng số cân bằng của hệ thống HP / vùng an toàn BẮT BUỘC nằm ở đây
 * (AGENTS.md §6), không hardcode trong managers, scenes hay UI.
 *
 * Phase C (theo Masterplan GraalOnline — Trụ cột 1):
 * - Chuẩn 50 HP (chuẩn GraalOnline). Không PvP ngoài vùng thách đấu —
 *   người chơi KHÔNG BAO GIỜ gây sát thương trực tiếp cho nhau; sát thương
 *   chỉ đến từ cơ chế vùng (sự kiện pháo đài, súng nước — Phase E).
 * - Vùng an toàn: hồi 100% HP khi bước vào, huy hiệu VÙNG AN TOÀN trên HUD.
 * - KO: giữ nguyên 100% vật phẩm + D-Coin (thân thiện sinh viên, không rơi đồ),
 *   hồi sinh tại Trạm Y Tế FPTU (Tòa Alpha) với NPC Cô Y Tá phát Vitamin C.
 */

/** Cờ vùng an toàn tuyệt đối — không thể nhận sát thương. */
export const ZONE_SAFE = 'safe';

/** Cờ vùng thách đấu — có thể nhận sát thương từ cơ chế vùng (Phase E). */
export const ZONE_CHALLENGE = 'challenge';

/**
 * Vùng mặc định cho phòng không khai báo cờ zone trong src/config/maps.js.
 * Thận trọng: 'safe' — không có sát thương cho đến khi Phase E định nghĩa
 * vùng thách đấu.
 */
export const DEFAULT_ZONE = ZONE_SAFE;

export const COMBAT_CONFIG = {
  /** Máu tối đa / chuẩn của người chơi. */
  maxHP: 50,

  /** Key localStorage lưu HP hiện tại của người chơi. */
  healthStorageKey: 'devertown_health_v1',

  /** Tự hồi đầy HP khi bước vào vùng an toàn. */
  healOnSafeZoneEnter: true,

  /** Điểm hồi sinh: Trạm Y Tế FPTU tại Tòa Alpha (Sảnh Chính). */
  respawn: {
    roomId: 'main_hall',
    x: 400,
    y: 350,
  },

  /** KO giữ nguyên 100% vật phẩm trong balo (không rơi đồ). */
  knockOutKeepInventoryPercent: 100,

  /** KO giữ nguyên 100% D-Coin trong ví. */
  knockOutKeepCoinsPercent: 100,
};
