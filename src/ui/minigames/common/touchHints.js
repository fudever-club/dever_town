/**
 * DEVER TOWN — touch detection dùng chung cho các minigame engine.
 *
 * In-canvas control hints phải đúng thiết bị: trên cảm ứng (pointer: coarse)
 * hiện hướng dẫn chạm/vuốt/kéo, trên desktop giữ hướng dẫn phím.
 * Thêm 2026-10-09 (yêu cầu của Hưng: hint WASD/Space gây nhầm lẫn trên điện thoại).
 */

/**
 * true khi thiết bị dùng cảm ứng là chính (điện thoại / tablet).
 * Dùng cùng media query với CSS touch-native ((pointer: coarse)).
 * @returns {boolean}
 */
export function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}
