/**
 * DEVER TOWN - WEATHER CONFIG
 * Cấu hình thời tiết động (mưa, mây trôi) cho các phòng ngoài trời.
 */

export const WEATHER_CONFIG = {
  // Phòng ngoài trời được áp dụng thời tiết
  outdoorRooms: ['main_hall', 'sports_complex'],

  // Chu kỳ tự động: mỗi AUTO_CHECK_MS lại tung xúc xắc mưa
  autoCheckMs: 90000,
  rainChance: 0.3,

  // Thời lượng một cơn mưa (ms)
  rainDurationMin: 25000,
  rainDurationMax: 55000,

  // Cường độ mưa 0..1
  rainIntensityMin: 0.45,
  rainIntensityMax: 0.9,

  // Tần suất phát hạt mưa desktop (ms) - tương ứng quantity ~5..8/emission
  rainFrequencyMs: 35,

  // Mobile scaling (perf): giảm mật độ hạt + mây để đỡ fullscreen overdraw trên GPU yếu.
  // Desktop giữ nguyên; mobile chia quantity và nhân đôi interval (mưa vẫn đọc được nhưng ~75% ít hạt).
  mobileRainQuantityDivisor: 2,
  mobileRainFrequencyMs: 70,
  mobileCloudCount: 2,
  mobileCloudAlpha: 0.28,

  // Mây: số lượng, tốc độ trôi (px/s), độ trong suốt
  cloudCount: 4,
  cloudSpeedMin: 8,
  cloudSpeedMax: 22,
  cloudAlpha: 0.4,

  // Lớp phủ tint lạnh rất nhẹ khi mưa (giữ sáng như gather.town, chỉ gợi cảm giác mưa)
  rainTintColor: 0x93c5fd,
  rainTintAlpha: 0.08,
};
