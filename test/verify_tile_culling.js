/**
 * DEVER TOWN - TILE FRUSTUM CULLING TEST SUITE (perf fix #4)
 * Kiểm thử (pure functions + static checks, không cần DOM/Phaser):
 * 1. isInCulledView: AABB predicate đúng cho in-view / out-of-view / margin.
 * 2. PERF_CONFIG: TILE_CULL_* constants tồn tại và hợp lý.
 * 3. WorldScene đấu nối culling (static check): _cullTiles, throttle trong
 *    update(), shadow đi cùng tile, dùng camera.worldView (RESIZE-aware).
 */

import { readFileSync } from 'fs';
import { PERF_CONFIG } from '../src/config/perfConfig.js';
import { isInCulledView } from '../src/utils/culling.js';

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

/* ---------- 1. AABB predicate ---------- */
// View 320x240 world px tại (240,180) — mô phỏng zoom 2.5, viewport 1280x720
const view = { x: 240, y: 180, right: 560, bottom: 420 };
const M = 64;
const H = 16; // nửa tile 32px

assert(isInCulledView(400, 300, H, H, view, M), 'Predicate: tile giữa view → in-view');
assert(!isInCulledView(0, 0, H, H, view, M), 'Predicate: tile xa view → out-of-view');
assert(!isInCulledView(700, 300, H, H, view, M), 'Predicate: tile phải view quá margin → out');
// Tile ngay mép view (x=560+15): trong margin 64 → vẫn in-view (chống pop-in)
assert(isInCulledView(575, 300, H, H, view, M), 'Predicate: tile sát mép trong margin → in-view');
assert(!isInCulledView(641, 300, H, H, view, M), 'Predicate: tile ngoài view+margin → out');
// Tile chạm đúng biên trong: x - half < right (575 < 560+64) → true; x=625: 625-16=609 > 624 → false
assert(isInCulledView(560, 300, H, H, view, M), 'Predicate: tile đúng biên phải view → in-view');
assert(!isInCulledView(100, 100, H, H, view, M), 'Predicate: tile góc xa → out');
assert(isInCulledView(240, 180, H, H, view, M), 'Predicate: tile đúng góc trái-trên view → in-view');
// Margin 0: hành vi thuần AABB
assert(!isInCulledView(577, 300, H, H, view, 0), 'Predicate: margin 0 → tile ngoài view là out');

/* ---------- 2. PERF_CONFIG constants ---------- */
assert(PERF_CONFIG.TILE_CULL_ENABLED === true, 'Config: TILE_CULL_ENABLED = true');
assert(PERF_CONFIG.TILE_CULL_MARGIN === 64, 'Config: TILE_CULL_MARGIN = 64 (khớp RemotePlayer)');
assert(PERF_CONFIG.TILE_CULL_INTERVAL_MS === 200, 'Config: TILE_CULL_INTERVAL_MS = 200');
assert(
  PERF_CONFIG.TILE_CULL_MARGIN >= 32,
  'Config: margin >= 1 tile (32px) để không pop-in khi pan nhanh'
);

/* ---------- 3. Static wiring trong WorldScene.js ---------- */
const ws = readFileSync('src/scenes/WorldScene.js', 'utf8');

assert(ws.includes('_cullTiles()'), 'Wiring: _cullTiles() tồn tại');
assert(ws.includes('this._tileCullTimer'), 'Wiring: _tileCullTimer được khởi tạo và dùng');
assert(
  ws.includes('PERF_CONFIG.TILE_CULL_INTERVAL_MS'),
  'Wiring: update() throttle theo TILE_CULL_INTERVAL_MS'
);
assert(ws.includes('camera.worldView'), 'Wiring: culling dùng camera.worldView (RESIZE-aware)');
assert(
  ws.includes('shadow._tileSprite = tileSprite'),
  'Wiring: shadow ellipse link tới tile sprite của nó'
);
assert(
  ws.includes('s._tileSprite'),
  'Wiring: shadow cull theo visible của tile'
);
assert(
  !/cull/i.test(ws.match(/CAMERA_VIEW_W \/ 2|CAMERA_VIEW_H \/ 2/)?.[0] || ''),
  'Wiring: culling không hardcode 800x600'
);
// Không động vào RemotePlayer.updateCulling
assert(
  !ws.includes('updateCulling'),
  'Wiring: WorldScene không can thiệp RemotePlayer.updateCulling()'
);
// Không destroy/reposition tile trong culling
const cullFn = ws.slice(ws.indexOf('_cullTiles() {'), ws.indexOf('_cullTiles() {') + 2500);
assert(!cullFn.includes('.destroy('), 'Wiring: _cullTiles chỉ toggle visible, không destroy');
assert(!cullFn.includes('setPosition('), 'Wiring: _cullTiles không reposition tile');

console.log(`\n[RESULT] ${passedTests}/${totalTests} tests passed`);
