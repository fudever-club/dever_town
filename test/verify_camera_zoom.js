/**
 * DEVER TOWN - CAMERA ZOOM + X-RAY TEST SUITE (Task C)
 * Kiểm thử (pure functions, không cần DOM/Phaser):
 * 1. cameraConfig: fit-room min zoom, clamp, snap 2 decimals, parseStoredZoom,
 *    default mobile adaptive, zoom-to-point formula, worldPointAt.
 * 2. XRAY: occluder predicate (tường/nội thất), trigger-A predicate.
 * 3. WorldScene + TilePool đã đấu nối zoom/x-ray (static check).
 */

import { readFileSync } from 'fs';
import {
  CAMERA_VIEW_W,
  CAMERA_VIEW_H,
  CAMERA_ZOOM,
  XRAY,
  computeMinZoom,
  clampZoom,
  snapZoom,
  parseStoredZoom,
  computeDefaultMobileZoom,
  isOccluderTileType,
  shouldXrayFade,
  worldPointAt,
  zoomToPointScroll
} from '../src/config/cameraConfig.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

function approx(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

/* ---------- 1. Fit-room min zoom ---------- */
assert(CAMERA_VIEW_W === 800 && CAMERA_VIEW_H === 600, 'Config: viewport logic 800x600');
const minZoom = computeMinZoom(800, 608);
assert(approx(minZoom, 600 / 608), `Fit-room: min(800/800, 600/608) = ${minZoom.toFixed(4)} (~0.987)`);
assert(approx(computeMinZoom(800, 608, 800, 600), 0.9868421052631579), 'Fit-room: đúng công thức min(viewW/roomW, viewH/roomH)');
assert(computeMinZoom(400, 304) > 1, 'Fit-room: phòng nhỏ hơn viewport → min zoom > 1');
assert(computeMinZoom(0, 0) === 1, 'Fit-room: input lỗi → fallback 1');

/* ---------- 2. Clamp + snap ---------- */
assert(CAMERA_ZOOM.MAX === 2.5, 'Config: ZOOM_MAX = 2.5');
assert(CAMERA_ZOOM.WHEEL_STEP === 1.12, 'Config: ZOOM_WHEEL_STEP = 1.12');
assert(CAMERA_ZOOM.DEFAULT_DESKTOP === 1.0, 'Config: DEFAULT desktop = 1.0 (thấy toàn phòng)');
assert(CAMERA_ZOOM.SMOOTH_MS === 150, 'Config: smoothing ~150ms');
assert(clampZoom(3, minZoom, 2.5) === 2.5, 'Clamp: trên max → max');
assert(approx(clampZoom(0.5, minZoom, 2.5), minZoom), 'Clamp: dưới min → min');
assert(clampZoom(1.5, minZoom, 2.5) === 1.5, 'Clamp: trong khoảng giữ nguyên');
assert(clampZoom(NaN, minZoom, 2.5) === minZoom, 'Clamp: NaN → min (an toàn)');
assert(snapZoom(1.326) === 1.33, 'Snap: 1.326 → 1.33 (2 chữ số, chống shimmer)');
assert(snapZoom(1.324) === 1.32, 'Snap: 1.324 → 1.32');
assert(snapZoom(2) === 2, 'Snap: số nguyên giữ nguyên');

/* ---------- 3. parseStoredZoom ---------- */
assert(parseStoredZoom('1.5', minZoom, 2.5) === 1.5, 'Storage: "1.5" → 1.5');
assert(approx(parseStoredZoom('0.5', minZoom, 2.5), minZoom), 'Storage: dưới min → clamp về min');
assert(parseStoredZoom('abc', minZoom, 2.5) === null, 'Storage: rác → null (dùng default)');
assert(parseStoredZoom(null, minZoom, 2.5) === null, 'Storage: null → null');
assert(parseStoredZoom('', minZoom, 2.5) === null, 'Storage: rỗng → null');

/* ---------- 4. Default mobile adaptive (giữ công thức cũ) ---------- */
const mobPortrait = computeDefaultMobileZoom(375, 667);
assert(mobPortrait >= 1.15 && mobPortrait <= 1.35, `Mobile dọc 375x667: ${mobPortrait.toFixed(3)} trong [1.15, 1.35]`);
assert(approx(computeDefaultMobileZoom(340, 700), 1.15), 'Mobile dọc: 340px → kẹp dưới 1.15');
const mobLandscape = computeDefaultMobileZoom(844, 390);
assert(mobLandscape >= 1.1 && mobLandscape <= 1.3, `Mobile ngang 844x390: ${mobLandscape.toFixed(3)} trong [1.1, 1.3]`);

/* ---------- 5. Zoom-to-point ---------- */
// Camera 800x600 tại (0,0), scroll (100,50), zoom 1. Con trỏ tại (400,300)
// → world point = (500, 350). Zoom 2x giữ điểm đó dưới con trỏ:
// scroll mới = (500,350) − (400,300)/2 = (300, 200).
const wp = worldPointAt(400, 300, 0, 0, 100, 50, 1);
assert(approx(wp.x, 500) && approx(wp.y, 350), `worldPointAt: (${wp.x}, ${wp.y}) = (500, 350)`);
const sc = zoomToPointScroll(500, 350, 400, 300, 0, 0, 2);
assert(approx(sc.scrollX, 300) && approx(sc.scrollY, 200), `zoomToPointScroll: (${sc.scrollX}, ${sc.scrollY}) = (300, 200)`);
// Với camera offset (cam.x=59.98): điểm thế giới dưới con trỏ không đổi sau zoom
const wp2 = worldPointAt(459.98, 375.2, 59.98, 75.2, 100, 50, 1);
const sc2 = zoomToPointScroll(wp2.x, wp2.y, 459.98, 375.2, 59.98, 75.2, 1.5);
const wpAfter = worldPointAt(459.98, 375.2, 59.98, 75.2, sc2.scrollX, sc2.scrollY, 1.5);
assert(approx(wpAfter.x, wp2.x) && approx(wpAfter.y, wp2.y), 'Zoom-to-point: world point dưới con trỏ bất biến qua zoom');

/* ---------- 6. XRAY occluder predicate ---------- */
assert(isOccluderTileType(2), 'Occluder: tường 2');
assert(isOccluderTileType(15), 'Occluder: tường 15');
assert(isOccluderTileType(30) && isOccluderTileType(39), 'Occluder: nội thất 30–39');
assert(!isOccluderTileType(1), 'Occluder: sàn 1 KHÔNG phải');
assert(!isOccluderTileType(10), 'Occluder: portal 10 KHÔNG phải');
assert(XRAY.FADE_ALPHA === 0.35, 'XRAY: fade alpha 0.35');
assert(XRAY.FADE_MS === 150, 'XRAY: fade 150ms');

/* ---------- 7. Trigger-A predicate ---------- */
// Tile 32px, tâm (400, 300) → đáy 316. Player đứng sau: y > 308, |dx| < 24.
assert(shouldXrayFade(400, 320, 400, 300, 32), 'Trigger A: player ngay sau tường → fade');
assert(shouldXrayFade(410, 309, 400, 300, 32), 'Trigger A: biên X trong 0.75 tile, biên Y > đáy−8 → fade');
assert(!shouldXrayFade(400, 307, 400, 300, 32), 'Trigger A: player TRƯỚC tường (y < đáy−8) → không fade');
assert(!shouldXrayFade(400, 290, 400, 300, 32), 'Trigger A: player đứng trên tường → không fade');
assert(!shouldXrayFade(430, 320, 400, 300, 32), 'Trigger A: xa trục X (>0.75 tile) → không fade');

/* ---------- 8. Static wiring check ---------- */
const worldSrc = readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8');
assert(worldSrc.includes('STORAGE_KEY'), 'WorldScene: đọc/ghi localStorage dever_camera_zoom (qua CAMERA_ZOOM.STORAGE_KEY)');
assert(worldSrc.includes('setFollowOffset(-(w - w / zoom) / 2, -(h - h / zoom) / 2)'), 'WorldScene: follow-offset centering fix (dấu âm, theo Camera.preRender) trên mọi lần đổi zoom');
assert(worldSrc.includes("addEventListener('wheel'") && worldSrc.includes('passive: false'), 'WorldScene: wheel listener passive:false trên canvas');
assert(worldSrc.includes('preventDefault()'), 'WorldScene: wheel preventDefault (chỉ trên canvas)');
assert(worldSrc.includes('pointerdown') && worldSrc.includes('pointermove'), 'WorldScene: pinch 2-pointer tracking');
assert(worldSrc.includes('this.occluderTiles = []'), 'WorldScene: build occluderTiles[] trong loadRoom()');
assert(worldSrc.includes('_updateXray()'), 'WorldScene: update() gọi x-ray check');
assert(worldSrc.includes('XRAY.DOLLHOUSE_ENABLED'), 'WorldScene: Trigger B dollhouse sau cờ config');
assert(worldSrc.includes('new ZoomControls('), 'WorldScene: khởi tạo ZoomControls');

const tilePoolSrc = readFileSync(new URL('../src/utils/TilePool.js', import.meta.url), 'utf8');
const alphaResets = (tilePoolSrc.match(/setAlpha\(1\)/g) || []).length;
assert(alphaResets >= 2, `TilePool: reset alpha=1 ở acquire + releaseAll (${alphaResets} chỗ)`);

const zcSrc = readFileSync(new URL('../src/ui/hud/ZoomControls.js', import.meta.url), 'utf8');
assert(zcSrc.includes('dever-zoom-controls') && zcSrc.includes('dzc-pill'), 'ZoomControls: DOM +/− và pill %');
assert(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(zcSrc), 'ZoomControls: không emoji trong UI');

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert(indexHtml.includes('zoom-controls.css'), 'index.html: load zoom-controls.css sau main.css');

const zoomCss = readFileSync(new URL('../src/styles/zoom-controls.css', import.meta.url), 'utf8');
assert(zoomCss.includes('touch-action: none'), 'zoom-controls.css: touch-action:none trên canvas (pinch)');

/* ---------- Tổng kết ---------- */
console.log(`\n[SUMMARY] ${passedTests}/${totalTests} tests passed`);
if (passedTests !== totalTests) {
  console.error('[SUMMARY] CÓ TEST FAIL');
  process.exitCode = 1;
}
