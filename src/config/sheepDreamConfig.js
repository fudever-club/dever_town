/**
 * DEVER TOWN - SHEEP DREAM CONFIG
 * Cấu hình cho mini-game "Đếm Cừu Trong Mơ" (Counting Sheep Dream).
 * Người chơi ngủ → vào giấc mơ → đếm cừu nhảy qua hàng rào.
 *
 * FSM: 'idle' → 'falling_asleep' → 'dreaming' → 'waking' → 'idle'
 * Trong 'dreaming': sheep spawn và nhảy qua hàng rào, người chơi click/space để đếm.
 */

export const SHEEP_DREAM_FSM = {
  IDLE: 'idle',                 // Chưa ngủ
  FALLING_ASLEEP: 'falling_asleep', // Đang chìm vào giấc mơ (fade)
  DREAMING: 'dreaming',         // Đang mơ - gameplay chính
  WAKING: 'waking',             // Đang tỉnh dậy (fade)
};

export const SHEEP_DREAM_CONFIG = {
  canvas: { width: 640, height: 400 },

  // Luồng game
  flow: {
    fadeDurationMs: 1200,       // Thời gian fade khi vào/ra mơ
    targetSheep: 20,            // Đếm đủ 20 con thì hoàn thành
    maxSheep: 30,               // Tối đa 30 con nếu người chơi muốn tiếp tục
  },

  // Cừu
  sheep: {
    width: 44,
    height: 32,
    baseSpeed: 90,              // px/s lúc đầu
    speedIncrement: 8,          // +8 px/s mỗi 5 con
    speedIncrementEvery: 5,
    maxSpeed: 220,
    spawnIntervalMs: 2200,      // Lúc đầu 2.2s/con
    minSpawnIntervalMs: 900,    // Tối thiểu 0.9s/con
    spawnIntervalDecay: 0.94,   // Mỗi con giảm 6%
    jumpHeight: 95,             // Đủ cao để cừu chậm nhất cũng qua được rào 64px
    jumpDurationMs: 1200,       // Bay lâu hơn để kịp qua rào
  },

  // Hàng rào — thấp kiểu farm (theo reference của Hưng): 2 thanh ngang,
  // đỉnh rào chỉ cao hơn lưng cừu ~20px. Cột cắm sâu xuống đất.
  fence: {
    x: 320,                     // Giữa canvas
    width: 12,
    height: 52,                 // Thấp: đỉnh ở y=318 (mặt đất 370 - 52)
    y: 370,                     // Mặt đất nơi cừu chạy (khớp mặt đồi cỏ)
    postBottom: 395,            // Đáy cột cắm sâu vào đồi cỏ
  },

  // Điểm & thưởng
  scoring: {
    pointsPerSheep: 10,
    comboBonus: 5,              // Thưởng combo mỗi 5 con liên tiếp không miss
    perfectBonus: 100,          // Thưởng nếu đếm đủ target không miss con nào
    dcoinReward: 20,            // D-Coin khi hoàn thành giấc mơ
  },

  // Màu sắc (đêm)
  colors: {
    skyTop: '#0a0e27',
    skyBottom: '#1a1f4d',
    moon: '#fef9c3',
    moonGlow: 'rgba(254, 249, 195, 0.25)',
    star: '#ffffff',
    grass: '#14532d',
    grassDark: '#0f3d22',
    fence: '#92400e',
    fenceDark: '#78350f',
    fenceLight: '#b45309',     // Gỗ sáng (highlight)
    sheepBody: '#f8fafc',
    sheepFace: '#1e293b',
    sheepWool: '#e2e8f0',
    text: '#e2e8f0',
    textDim: '#94a3b8',
    accent: '#a78bfa',          // Tím mộng mị
  },

  // i18n
  text: {
    title: 'Giấc Mơ Đếm Cừu',
    subtitle: 'Nhấn vào cừu khi nó nhảy qua hàng rào để đếm',
    sheepCounted: 'Đã đếm',
    target: 'Mục tiêu',
    complete: 'Giấc mơ hoàn thành!',
    wakeUp: 'Tỉnh Dậy',
    continueDream: 'Mơ Tiếp',
    perfect: 'Hoàn hảo! Không bỏ sót con nào!',
  },
};
