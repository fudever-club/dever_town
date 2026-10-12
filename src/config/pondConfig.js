/**
 * pondConfig.js — Hằng số cân bằng cho Hồ Vườn FUDA (sân Tòa Alpha) & vịt trời.
 * Mọi thông số vật lý/hành vi của hệ vịt đều nằm ở đây, không hardcode trong update().
 */

// Tile nước hồ vườn (khác tile 28 hồ bơi: hồ vườn là nước tự nhiên, chặn đi bộ).
export const POND_TILE_INDEX = 42;

// Hồ chữ nhật trong layout main_hall tầng 1 (LEGACY tile): cols 1-5, rows 16-18 (tile 32px).
// Giữ lại cho engine canvas minigame câu cá (fishingConfig pondRect); bản đồ vẽ tay
// dùng collisionRects trong maps.js thay thế.
export const POND_TILE_RECT = { x0: 1, y0: 16, x1: 5, y1: 18 };

// Vùng bơi của vịt (pixel) — khớp hồ nước trong art V2 (collisionRect x80-418/y311-581),
// inset khỏi mép hồ để vịt không đè lên cỏ.
export const DUCK_SWIM_BOUNDS = { x0: 150, y0: 350, x1: 350, y1: 550 };

// Chỉ spawn vịt ở main_hall tầng 1 (floorIndex 0) — nơi có hồ.
export const DUCK_ROOM_ID = 'main_hall';
export const DUCK_FLOOR_INDEX = 0;

export const DUCK_CONFIG = {
  count: 3,               // số vịt trang trí
  speedMin: 14,           // px/s — bơi chậm rãi
  speedMax: 26,
  idleChance: 0.35,       // xác suất đứng yên (ríu rít) mỗi lần đổi hướng
  idleTimeMin: 1.2,       // s
  idleTimeMax: 3.0,
  steerTimeMin: 2.0,      // s giữa các lần đổi hướng khi đang bơi
  steerTimeMax: 5.0,
  paddleFps: 5,           // tốc độ đập cánh (2 frame)
  bobAmplitude: 2.2,      // px nhấp nhô mặt nước
  bobFrequency: 2.4,      // rad/s
};

// Tượng "Nhà tư tưởng" (Thinker) — LEGACY: decor sprite đã vẽ trực tiếp trong
// art V2 (bệ tượng = collisionRect x1145-1225/y330-440). Giữ config cho fallback
// tile nếu cần.
export const STATUE_CONFIG = {
  textureKey: 'thinker_statue',
  tileX: 20,              // bãi cỏ phía Đông hồ — thoáng, không chắn lối/portal
  tileY: 16,
  solid: true,            // chặn đi bộ qua bệ tượng
};

// Vườn hoa sân Tòa Alpha — decor tĩnh solid trên cỏ (không chắn lối đi).
export const FLOWER_GARDEN_CONFIG = [
  { id: 'decor_bougainvillea_1', textureKey: 'flower_bougainvillea', tileX: 12, tileY: 16 },
  { id: 'decor_bougainvillea_2', textureKey: 'flower_bougainvillea', tileX: 14, tileY: 16 },
  { id: 'decor_rose_1', textureKey: 'flower_rose', tileX: 11, tileY: 18 },
  { id: 'decor_rose_2', textureKey: 'flower_rose', tileX: 13, tileY: 18 },
];
