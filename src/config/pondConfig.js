/**
 * pondConfig.js — Hằng số cân bằng cho Hồ Vườn FUDA (sân Tòa Alpha) & vịt trời.
 * Mọi thông số vật lý/hành vi của hệ vịt đều nằm ở đây, không hardcode trong update().
 */

// Tile nước hồ vườn (khác tile 28 hồ bơi: hồ vườn là nước tự nhiên, chặn đi bộ).
export const POND_TILE_INDEX = 42;

// Hồ chữ nhật trong layout main_hall tầng 1: cols 1-5, rows 16-18 (tile 32px).
export const POND_TILE_RECT = { x0: 1, y0: 16, x1: 5, y1: 18 };

// Vùng bơi của vịt (pixel), inset khỏi mép hồ để vịt không đè lên cỏ.
export const DUCK_SWIM_BOUNDS = { x0: 48, y0: 528, x1: 176, y1: 592 };

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

// Tượng "Nhà tư tưởng" (Thinker) — decor tĩnh đặt trên cỏ cạnh hồ.
export const STATUE_CONFIG = {
  textureKey: 'thinker_statue',
  tileX: 1,               // góc Tây-Bắc của hồ, trên cỏ (không đè hồ)
  tileY: 15,
  solid: true,            // chặn đi bộ qua bệ tượng
};
