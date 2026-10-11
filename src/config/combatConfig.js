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

/* ==========================================================================
 * Phase E — SỰ KIỆN PHÁO ĐÀI TEST (FORT TEST EVENTS)
 *
 * Masterplan Trụ cột 3 (Clans & Base Forts). Phase E chỉ triển khai TEST
 * EVENTS kích hoạt thủ công (chưa phải sự kiện tuần cố định).
 *
 * Luật Graal 2026 (chống scam): thưởng chia cho TẤT CẢ người tham gia
 * (participation-based), KHÔNG winner-takes-all. Không có PvP damage ngoài
 * vùng challenge / pháo đài.
 *
 * Vùng pháo đài test "Phòng Server": một hình chữ nhật tọa độ trong phòng
 * sports_complex (25x19 tiles, tile 32px → 800x608). KHÔNG sửa maps.js,
 * colliders hay spawn — rect này chỉ dùng để tính điểm presence.
 * Tọa độ: x 320–480 (tile 10–15), y 288–384 (tile 9–12) — hành lang trung
 * tâm, toàn ô đi được (tile 5).
 * ========================================================================== */

/** Các trạng thái của máy trạng thái sự kiện pháo đài. */
export const FORT_EVENT_STATES = {
  IDLE: 'idle',
  COUNTDOWN: 'countdown',
  ACTIVE: 'active',
  ENDED: 'ended',
  PAYOUT: 'payout',
};

export const FORT_EVENT_CONFIG = {
  states: FORT_EVENT_STATES,

  /** Vùng pháo đài test: rect tọa độ (px) trong một phòng, không đụng map. */
  fort: {
    roomId: 'sports_complex',
    name: 'Phòng Server (Test)',
    zone: 'challenge',
    x: 320,
    y: 288,
    w: 160,
    h: 96,
  },

  /** Đếm ngược trước khi mở cổng pháo đài (giây). */
  countdownSec: 10,

  /** Thời lượng cửa sổ test (giây) — 3 phút cho test event. */
  durationSec: 180,

  /** Chu kỳ tính điểm king-of-the-hill (giây). */
  tickSec: 1,

  /** Điểm mỗi tick cho bang đang dẫn đầu (nhiều thành viên trong fort nhất). */
  pointsPerTick: 10,

  /** Tổng quỹ thưởng mỗi test event (D-Coin) — chia cho mọi participant. */
  prizePool: 300,

  /** Ngưỡng tham gia: ở trong fort ít nhất bấy nhiêu giây mới được chia thưởng. */
  minParticipationSec: 30,

  /** Số bot test tự động gieo khi startTestEvent() (0 = tắt). */
  testBotCount: 6,

  /** Tốc độ di chuyển của bot test (px/giây). */
  botWanderSpeed: 60,
};
