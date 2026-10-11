/**
 * DEVER TOWN - SCENE TRANSITION CONFIG
 * Tham số hiệu ứng chuyển cảnh (portal, đổi tầng).
 */

export const TRANSITION_CONFIG = {
  // Pixel-dissolve kiểu Pokémon: canvas low-res scale lên bằng NEAREST cho hạt pixel to
  dissolveWidth: 160,
  dissolveHeight: 90,
  // Thời gian dissolve ra/vào (ms)
  dissolveOutMs: 380,
  dissolveInMs: 420,
  // Flash trắng nhanh trước khi dissolve (kiểu Pokémon GBA)
  flashMs: 70,
  // Màu dissolve (đen xanh đêm)
  dissolveColor: { r: 11, g: 15, b: 25 },
};
