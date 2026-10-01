/**
 * src/config/audioZones.js
 * Phase 1b: Spatial voice v2 — âm lượng theo khoảng cách + private areas.
 *
 * - SPATIAL_VOICE_CONFIG: bán kính nghe rõ / fade out, tần suất cập nhật.
 * - PRIVATE_AREAS: vùng chữ nhật (pixel world) khóa âm thanh — người trong
 *   vùng chỉ nghe người cùng vùng, người ngoài không nghe được.
 */

export const SPATIAL_VOICE_CONFIG = {
  enabled: true,
  // Trong bán kính này (px) nghe 100% âm lượng
  fullVolumeRadius: 170,
  // Ngoài khoảng cách này (px) âm lượng = 0 (fade tuyến tính ở giữa)
  fadeDistance: 520,
  // Cập nhật volume mỗi N ms (đủ mượt, không tốn CPU)
  updateIntervalMs: 250,
};

export const PRIVATE_AREAS = {
  // Phòng họp CLB: khu bàn họp chữ U là vùng kín
  meeting_room: [
    {
      id: 'meet_table_private',
      name: 'Bàn Họp Kín',
      // tiles x:5-15, y:5-10  ->  px
      x1: 160, y1: 160, x2: 512, y2: 352,
    },
  ],
  // Lab code: dãy bàn PC là vùng kín cho pair-programming
  code_lab: [
    {
      id: 'codelab_bench_private',
      name: 'Khu Pair Programming',
      // tiles x:2-16, y:3-7  ->  px
      x1: 64, y1: 96, x2: 544, y2: 256,
    },
  ],
  // Các phòng khác chưa có private area — bổ sung khi cần
};

/**
 * Tìm private area chứa một điểm trong phòng.
 * @returns {object|null} private area hoặc null nếu ngoài mọi vùng kín
 */
export function findPrivateArea(roomId, x, y) {
  const areas = PRIVATE_AREAS[roomId];
  if (!areas) return null;
  for (const a of areas) {
    if (x >= a.x1 && x <= a.x2 && y >= a.y1 && y <= a.y2) return a;
  }
  return null;
}

/**
 * Tính âm lượng spatial (0..1) theo khoảng cách.
 * Quy tắc private area:
 * - Cả hai cùng trong một private area -> volume theo khoảng cách
 * - Một trong hai ở vùng kín khác nhau (hoặc một trong một ngoài) -> 0
 * - Cả hai ngoài mọi vùng kín -> volume theo khoảng cách
 */
export function computeSpatialVolume(localPos, remotePos, roomId) {
  const cfg = SPATIAL_VOICE_CONFIG;
  if (!cfg.enabled) return 1;

  const localArea = findPrivateArea(roomId, localPos.x, localPos.y);
  const remoteArea = findPrivateArea(roomId, remotePos.x, remotePos.y);

  // Lệch vùng kín -> câm
  if ((localArea || remoteArea) && (!localArea || !remoteArea || localArea.id !== remoteArea.id)) {
    return 0;
  }

  const dx = localPos.x - remotePos.x;
  const dy = localPos.y - remotePos.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= cfg.fullVolumeRadius) return 1;
  if (dist >= cfg.fadeDistance) return 0;
  // Fade tuyến tính
  return 1 - (dist - cfg.fullVolumeRadius) / (cfg.fadeDistance - cfg.fullVolumeRadius);
}
