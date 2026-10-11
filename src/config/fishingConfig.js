/**
 * fishingConfig.js — Hằng số cân bằng cho Job Câu Cá Hồ Vịt (Phase D2).
 *
 * TIỀN LƯƠNG: đọc trực tiếp từ JOBS_CONFIG (src/config/jobsConfig.js, do
 * worker Phase D sibling sở hữu) — KHÔNG duplicate số ở đây. Mọi thay đổi
 * lương thực hiện duy nhất trong jobsConfig.js (spec Phase D2: fishing
 * common 20 / rare 50, barista 25 D-Coin).
 *
 * Mọi thông số vật lý/gameplay câu cá BẮT BUỘC nằm ở đây (AGENTS.md §6),
 * không hardcode trong FishingEngine hay FishingJob.
 */

import { JOBS_CONFIG } from './jobsConfig.js';
import { POND_TILE_RECT } from './pondConfig.js';

// Lương job — dẫn xuất từ JOBS_CONFIG, không hardcode.
export const FISHING_WAGES = { ...JOBS_CONFIG.wages.fishing };
export const BARISTA_WAGE = JOBS_CONFIG.wages.barista;

// FSM tường minh của job câu cá:
// idle -> casting -> waiting -> hooked -> minigame -> caught | escaped
export const FISHING_STATES = Object.freeze({
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING: 'waiting',
  HOOKED: 'hooked',
  MINIGAME: 'minigame',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
});

export const FISHING_CONFIG = {
  // Không gian logic của engine (giống BaristaSimulatorEngine: 640x360).
  canvas: { w: 640, h: 360 },

  // Hồ vẽ trong canvas engine (độc lập layout map; hồ map thật ở
  // pondConfig.js POND_TILE_RECT cols 1-5 / rows 16-18 main_hall).
  pondRect: { ...POND_TILE_RECT },

  // Quăng cần: giữ E (hoặc nút) để nạp lực.
  cast: {
    chargeTimeSec: 1.2,   // giữ tối đa -> lực 100%
    minDistPx: 70,        // khoảng cách phao tối thiểu (tính từ mép cỏ)
    maxDistPx: 250,       // khoảng cách phao tối đa
    flyTimeSec: 0.55,     // thời gian phao bay ra điểm đã chọn
  },

  // Chờ cá cắn câu.
  wait: {
    minSec: 3.0,
    maxSec: 9.0,
  },

  // Sau khi "!" hiện: cửa sổ giật cần, quá hạn cá thoát.
  hook: {
    windowSec: 1.4,
  },

  // Minigame giữ cá trong thanh xanh.
  minigame: {
    startProgress: 25,    // % tiến độ khởi đầu khi dính câu
    gaugeX: 528,          // vị trí cột gauge trong canvas 640x360
    gaugeY: 60,
    gaugeH: 240,
    gaugeW: 44,
  },

  // Vật lý thanh điều khiển của người chơi (tap/giữ để nâng, thả để hạ).
  bar: {
    raiseAccelPxS2: 640,
    gravityPxS2: 500,
    maxVelPxS: 270,
  },

  // 3 bậc khó (Hưng duyệt 3, không phải 5 — Phase D2).
  // wageKey -> tra FISHING_WAGES. weight = tỉ lệ xuất hiện khi quăng cần.
  tiers: {
    rophi: {
      name: 'Cá rô phi',
      rarity: 'common',
      wageKey: 'common',
      weight: 45,
      fishSpeedPxS: 70,     // tốc độ di chuyển cá trong gauge
      barHPx: 120,          // chiều cao thanh xanh của người chơi
      fillPerSec: 24,       // tốc độ đầy tiến độ khi cá nằm trong thanh
      drainPerSec: 10,      // tốc độ tụt tiến độ khi cá ngoài thanh
      dartChance: 0.0,      // xác suất cá "lạng" đột ngột mỗi giây
      dartSpeedMult: 1.6,
    },
    cachep: {
      name: 'Cá chép',
      rarity: 'common',
      wageKey: 'common',
      weight: 40,
      fishSpeedPxS: 115,
      barHPx: 92,
      fillPerSec: 19,
      drainPerSec: 14,
      dartChance: 0.15,
      dartSpeedMult: 2.0,
    },
    cavang: {
      name: 'Cá vàng hiếm',
      rarity: 'rare',
      wageKey: 'rare',
      weight: 15,
      fishSpeedPxS: 165,
      barHPx: 66,
      fillPerSec: 17,
      drainPerSec: 18,
      dartChance: 0.45,
      dartSpeedMult: 2.6,
    },
  },
};

/**
 * Chọn bậc cá theo weight. Trả về key tier ('rophi' | 'cachep' | 'cavang').
 * randomFn cho phép test gieo seed.
 */
export function rollFishTier(randomFn = Math.random) {
  const entries = Object.entries(FISHING_CONFIG.tiers);
  const total = entries.reduce((s, [, t]) => s + t.weight, 0);
  let roll = randomFn() * total;
  for (const [key, t] of entries) {
    roll -= t.weight;
    if (roll <= 0) return key;
  }
  return entries[0][0];
}
