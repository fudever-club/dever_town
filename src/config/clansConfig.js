/**
 * DEVER TOWN — CẤU HÌNH BANG HỘI (CLANS)
 *
 * 4 bang hội chính thức của DEVER TOWN (Masterplan — Trụ cột 3: Clans &
 * Base Forts). Mọi hằng số cân bằng / định danh bang hội BẮT BUỘC nằm ở đây,
 * không hardcode trong managers, scenes hay UI.
 *
 * Phase E (v1): roster bang hội lưu localStorage — CHƯA có server đồng bộ.
 * getMembers() chỉ trả về thành viên local (người chơi hiện tại sau khi
 * join). Server roster sẽ thay thế ở phase sau mà không đổi API.
 */

/** Key localStorage lưu tư cách thành viên của người chơi hiện tại. */
export const CLAN_MEMBERSHIP_STORAGE_KEY = 'devertown_clan_membership_v1';

/** Key localStorage lưu roster local của từng bang (v1 — chưa có server). */
export const CLAN_ROSTER_STORAGE_KEY = 'devertown_clan_roster_v1';

export const CLAN_IDS = ['web_builders', 'ai_core', 'mobile_masters', 'game_devs'];

/**
 * Định nghĩa 4 bang hội chính thức. Mỗi bang có một "base" là phòng trong
 * game (roomId trong src/config/maps.js) — nơi thành viên tụ họp.
 */
export const CLANS = [
  {
    id: 'web_builders',
    name: 'Web Builders',
    shortName: 'WEB',
    color: '#38bdf8',
    baseRoomId: 'dever_lab',
    baseName: 'Lab Alpha',
    description: 'Dựng web, UI và trải nghiệm số cho DEVER TOWN.',
  },
  {
    id: 'ai_core',
    name: 'AI Core',
    shortName: 'AI',
    color: '#a78bfa',
    baseRoomId: 'library_lounge',
    baseName: 'Thư viện F3',
    description: 'Machine learning, computer vision và những mô hình thông minh.',
  },
  {
    id: 'mobile_masters',
    name: 'Mobile Masters',
    shortName: 'MOB',
    color: '#34d399',
    baseRoomId: 'canteen_cafe',
    baseName: 'Bàn tròn Canteen',
    description: 'App mobile, Capacitor và trải nghiệm chạm mượt mà.',
  },
  {
    id: 'game_devs',
    name: 'Game Devs',
    shortName: 'GAME',
    color: '#fb7185',
    baseRoomId: 'game_arcade',
    baseName: 'Arcade Hub',
    description: 'Phaser, game feel và những minigame gây nghiện.',
  },
];

/** Tra cứu định nghĩa bang theo id; trả về null nếu id không hợp lệ. */
export function getClanById(clanId) {
  return CLANS.find((c) => c.id === clanId) || null;
}

/** Kiểm tra clanId có thuộc 4 bang chính thức không. */
export function isValidClanId(clanId) {
  return CLAN_IDS.includes(clanId);
}
