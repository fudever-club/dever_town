/**
 * cameraConfig.js — Cấu hình camera zoom + x-ray ("xuyên thấu") cho DEVER TOWN.
 *
 * - Zoom do người chơi điều khiển: wheel (desktop) / pinch (mobile) / nút +/−.
 * - Zoom min = fit toàn bộ phòng (tính động theo kích thước phòng, đúng cả khi
 *   phòng đổi layout), max = 2.5 (pixel-art vẫn nét với roundPixels).
 * - X-ray Trigger A: tile che khuất (tường, nội thất) mờ dần khi người chơi
 *   đi ra phía sau nó. Trigger B (dollhouse): khi zoom < 1.0, hàng tường phía
 *   Bắc mờ để nhìn xuyên phòng — giữ sau cờ XRAY.DOLLHOUSE_ENABLED.
 */

/**
 * Kích thước viewport logic tham chiếu của game (khớp width/height ban đầu trong
 * src/main.js). Dùng làm mốc tính zoom-range "vừa khít phòng" (0.99–2.5) và giá
 * trị dự phòng cho các phép đổi tọa độ màn hình — KHÔNG còn là kích thước canvas
 * thực tế (chế độ Phaser.Scale.RESIZE cho canvas bám theo #game-container).
 */
export const CAMERA_VIEW_W = 800;
export const CAMERA_VIEW_H = 600;

/**
 * Vùng đệm camera quanh phòng (headroom padding): cho phép camera nhìn rộng hơn
 * phòng một chút khi player đi về phía Bắc, không bị gò bó hoặc che khuất tên phòng.
 * (Giá trị cũ hardcode trong WorldScene.create: PADDING_X=64, PADDING_Y=96.)
 * updateCameraBounds() dùng làm bounds tối thiểu; khi viewport RESIZE lớn hơn,
 * bounds tự mở rộng đúng bằng vùng nhìn thấy để player luôn ở giữa màn hình.
 */
export const CAMERA_BOUNDS_PAD_X = 64;
export const CAMERA_BOUNDS_PAD_Y = 96;

export const CAMERA_ZOOM = {
  /** localStorage lưu zoom người dùng chọn. */
  STORAGE_KEY: 'dever_camera_zoom',
  /** localStorage đánh dấu đã hiện toast gợi ý zoom (chỉ hiện 1 lần). */
  HINT_STORAGE_KEY: 'dever_zoom_hint_shown',
  /** Mỗi nấc wheel: nhân/chia 1.12. */
  WHEEL_STEP: 1.12,
  /** Nút +/−: mỗi lần bấm nhân/chia 1.2. */
  BUTTON_STEP: 1.2,
  /** Zoom tối đa: pixel-art vẫn nét (roundPixels bật). */
  MAX: 2.5,
  /** Zoom mặc định desktop: 1.0 = thấy toàn bộ phòng 25x19. */
  DEFAULT_DESKTOP: 1.0,
  /** Thời gian mượt khi zoom (ms), kiểu Google Maps. */
  SMOOTH_MS: 150,
  /** Chu kỳ kiểm tra x-ray trong update() (ms) — rẻ, chỉ AABB với player. */
  XRAY_CHECK_MS: 100,
};

/**
 * Zoom tối thiểu = vừa khít toàn bộ phòng trong viewport.
 * Tính động để đúng khi phòng đổi kích thước.
 * Với phòng chuẩn 25x19 (800x608): min(800/800, 600/608) ≈ 0.9868.
 */
export function computeMinZoom(roomW, roomH, viewW = CAMERA_VIEW_W, viewH = CAMERA_VIEW_H) {
  if (!roomW || !roomH || !viewW || !viewH) return 1;
  return Math.min(viewW / roomW, viewH / roomH);
}

/** Kẹp zoom vào [min, max]. */
export function clampZoom(zoom, min, max) {
  if (!Number.isFinite(zoom)) return min;
  return Math.max(min, Math.min(max, zoom));
}

/**
 * Chốt zoom về 2 chữ số thập phân — tránh 1-px shimmer do Phaser tắt
 * renderRoundPixels fast-path ở zoom lẻ.
 */
export function snapZoom(zoom) {
  return Math.round(zoom * 100) / 100;
}

/**
 * Đọc zoom đã lưu, trả về null nếu không hợp lệ (để caller dùng default).
 */
export function parseStoredZoom(raw, min, max) {
  if (raw == null || raw === '') return null;
  const z = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(z)) return null;
  return clampZoom(z, min, max);
}

/**
 * Zoom mặc định mobile (giữ nguyên công thức adaptive cũ):
 * - Dọc: 1.15–1.35 theo chiều rộng. - Ngang: 1.1–1.3 theo chiều cao.
 */
export function computeDefaultMobileZoom(winW, winH) {
  const isPortrait = winH > winW;
  if (isPortrait) {
    return Math.max(1.15, Math.min(1.35, winW / 340));
  }
  return Math.max(1.1, Math.min(1.3, winH / 360));
}

/** Cấu hình x-ray ("xuyên thấu"). */
export const XRAY = {
  /** Tile che khuất: tường (2, 15) + nội thất (30–39). Bắt đầu thận trọng. */
  OCCLUDER_TILE_TYPES: new Set([2, 15, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39]),
  /** Alpha khi mờ vì người chơi đứng sau. */
  FADE_ALPHA: 0.35,
  /** Thời gian tween mờ/hiện (ms). */
  FADE_MS: 150,
  /** Trigger B: zoom < 1.0 thì hàng tường Bắc mờ kiểu dollhouse. Tắt = giữ nguyên. */
  DOLLHOUSE_ENABLED: true,
  /** Alpha của tường Bắc ở chế độ dollhouse. */
  DOLLHOUSE_ALPHA: 0.25,
  /** Số hàng tường phía Bắc chịu dollhouse (hàng 0 và 1). */
  DOLLHOUSE_MAX_ROW: 1,
};

export function isOccluderTileType(tileType) {
  return XRAY.OCCLUDER_TILE_TYPES.has(tileType);
}

/**
 * Trigger A: người chơi đứng PHÍA SAU tile (y lớn hơn đáy tile) và gần theo
 * trục X thì tile mờ đi. tileX/tileY là tâm tile (khớp loadRoom).
 */
export function shouldXrayFade(playerX, playerY, tileX, tileY, tileSize) {
  const tileBottomY = tileY + tileSize / 2;
  return playerY > tileBottomY - 8 && Math.abs(playerX - tileX) < tileSize * 0.75;
}

/**
 * Đổi tọa độ màn hình (game px, gốc tại camera) → tọa độ thế giới.
 * ĐÚNG ma trận camera Phaser 3.90 (đã kiểm chứng qua camera.matrix):
 *   screenX = zoom*(worldX − scrollX) + camX + originX*(1 − zoom).
 * (Mô hình cũ thiếu số hạng originX*(1−zoom) nên zoom-to-cursor và
 * follow-offset đều sai ở zoom ≠ 1.)
 */
export function worldPointAt(screenX, screenY, camX, camY, scrollX, scrollY, zoom, originX = CAMERA_VIEW_W / 2, originY = CAMERA_VIEW_H / 2) {
  return {
    x: (screenX - camX - originX * (1 - zoom)) / zoom + scrollX,
    y: (screenY - camY - originY * (1 - zoom)) / zoom + scrollY,
  };
}

/**
 * Zoom-to-point: giữ nguyên điểm thế giới đang nằm dưới con trỏ.
 * Trả về scroll mới cho newZoom (đúng ma trận camera như worldPointAt).
 */
export function zoomToPointScroll(worldX, worldY, screenX, screenY, camX, camY, newZoom, originX = CAMERA_VIEW_W / 2, originY = CAMERA_VIEW_H / 2) {
  return {
    scrollX: worldX - (screenX - camX - originX * (1 - newZoom)) / newZoom,
    scrollY: worldY - (screenY - camY - originY * (1 - newZoom)) / newZoom,
  };
}
