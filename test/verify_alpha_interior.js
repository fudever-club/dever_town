/**
 * DEVER TOWN - ALPHA INTERIOR VERIFICATION SUITE
 * Kiểm định phòng mới alpha_interior (nội thất Tòa Alpha, hybrid painted map V1):
 * 1. Room tồn tại trong MAPS_CONFIG, zone 'safe', paintedBackground 1376x768 đúng pattern main_hall.
 * 2. File art public/devertown_alpha_interior_v3.jpg tồn tại, đúng 1376x768.
 * 3. BootScene preload imageKey 'map_alpha_interior'.
 * 4. Spawn + portal pads không nằm trong collision rect, không giao cắt rect.
 * 5. Portal 2 chiều: sân (746,290) -> alpha_interior; trong sảnh -> main_hall (746,330) walkable.
 * 6. Portal lab -> dever_lab, targetSpawn walkable (tile 9).
 * 7. Courtyard: 6 portal ngoài trời (thư viện/họp/kỷ niệm + cầu thang đã dời vào sảnh Alpha);
 *    sports/canteen portals không đổi; sảnh Alpha có 7 cổng; cổng gian hàng targetFloor 1.
 * 8. Cooldown teleport >= 1.5s trong WorldScene.
 * 9. i18n rooms/portals/zones (2 locale), option #opt-alpha_interior trong index.html.
 * 10. Không emoji trong labels mới; DAY_NIGHT_CYCLE_ENABLED=false giữ nguyên.
 * 11. floors[1] (tầng 2 lab): layout 19x25 hợp lệ, spawn walkable, cầu thang 2 chiều.
 */

import { readFileSync, existsSync } from 'fs';
import { MAPS_CONFIG } from '../src/config/maps.js';
import { DAY_NIGHT_CYCLE_ENABLED } from '../src/config/lightingConfig.js';

let passed = 0, failed = 0;
const ok = (cond, msg) => {
  if (cond) { passed++; console.log(`[PASS] ${msg}`); }
  else { failed++; console.error(`[FAIL] ${msg}`); process.exitCode = 1; }
};
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

const room = MAPS_CONFIG.alpha_interior;
ok(!!room, 'alpha_interior tồn tại trong MAPS_CONFIG');
ok(room?.zone === 'safe', "alpha_interior zone = 'safe'");
ok(Object.keys(MAPS_CONFIG).length === 12, `tổng 12 phòng (không room lạ): ${Object.keys(MAPS_CONFIG).length}`);

// 2. Art file
const artPath = 'public/devertown_alpha_interior_v3.jpg';
ok(existsSync(artPath), `${artPath} tồn tại`);
const pb = room?.paintedBackground || {};
ok(pb.imageKey === 'map_alpha_interior', "imageKey = 'map_alpha_interior'");
ok(pb.imagePath === 'devertown_alpha_interior_v3.jpg', "imagePath trỏ đúng file art");
ok(pb.width === 1376 && pb.height === 768, 'canvas 1376x768 (đồng nhất V2 courtyard)');
ok(pb.spawnPoint?.x === 680 && pb.spawnPoint?.y === 580, 'spawnPoint (680,580) — sàn trống trong sảnh, 96px bắc cửa chính');
ok(Array.isArray(pb.collisionRects) && pb.collisionRects.length === 23, `23 collision rects (đủ tường/bàn/ghế/cửa)`);

// 3. BootScene preload
const bootSrc = readFileSync('src/scenes/BootScene.js', 'utf-8');
ok(bootSrc.includes("this.load.image('map_alpha_interior', 'devertown_alpha_interior_v3.jpg')"),
  "BootScene preload 'map_alpha_interior'");

// Rect helpers
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const padOf = (p) => ({ x: p.x - 16, y: p.y - 16, w: 32, h: 32 });

// 4. Spawn + portal pads không nằm trong rect / không giao cắt rect
const rects = pb.collisionRects;
const sp = pb.spawnPoint;
ok(!rects.some(r => inRect(sp.x, sp.y, r)), 'spawn (680,580) không nằm trong rect nào');
for (const p of room.portals) {
  const pad = padOf(p);
  const hit = rects.some(r => rectsOverlap(pad, r));
  ok(!hit, `portal pad (${p.x},${p.y}) -> ${p.targetRoomId} không giao cắt collision rect`);
  ok(!rects.some(r => inRect(p.x, p.y, r)), `portal center (${p.x},${p.y}) ngoài rect`);
}
// Zones trong canvas
for (const z of room.zones) {
  ok(z.x >= 0 && z.x <= 1376 && z.y >= 0 && z.y <= 768, `zone ${z.id} trong canvas`);
}
ok(room.zones.length === 4, '4 zones tầng trệt (lễ tân, bảng tin, lofi, cầu thang)');

// 5. Portal 2 chiều sân <-> sảnh
const exitP = room.portals.find(p => p.targetRoomId === 'main_hall');
ok(!!exitP, 'có portal sảnh -> main_hall (Ra Sân Tòa Alpha)');
ok(exitP?.targetSpawn?.x === 746 && exitP?.targetSpawn?.y === 330, 'targetSpawn (746,330) — sân trước cửa tòa');
const mh = MAPS_CONFIG.main_hall;
const mhRects = mh.paintedBackground.collisionRects;
ok(!mhRects.some(r => inRect(746, 330, r)), 'targetSpawn (746,330) walkable trên sân V2');
// Cổng sân -> sảnh (cả top-level và floors[0])
for (const src of [mh, mh.floors?.[0]]) {
  const gate = src?.portals?.find(p => p.x === 746 && p.y === 290);
  ok(gate?.targetRoomId === 'alpha_interior', 'cổng sân (746,290) -> alpha_interior');
  ok(gate?.targetSpawn?.x === 680 && gate?.targetSpawn?.y === 580, 'gate targetSpawn = spawn sảnh (680,580)');
}

// 6. Portal lab -> dever_lab, target walkable
const lab = MAPS_CONFIG.dever_lab;
const tileAt = (x, y) => lab.layout[Math.floor(y / 32)]?.[Math.floor(x / 32)];
for (const p of room.portals.filter(p => p.targetRoomId === 'dever_lab')) {
  const t = tileAt(p.targetSpawn.x, p.targetSpawn.y);
  ok(t === 9, `lab portal (${p.x},${p.y}) target (${p.targetSpawn.x},${p.targetSpawn.y}) tile=9 walkable (got ${t})`);
}

// 7. Courtyard: 6 portal ngoài trời (thư viện/họp/kỷ niệm + cầu thang đã dời vào
// sảnh Alpha); sports/canteen không đổi. Sảnh Alpha có 7 cổng (3 cũ + 4 mới).
ok(mh.portals.length === 6, `main_hall giữ 6 portal ngoài trời (got ${mh.portals.length})`);
ok(mh.floors[0].portals.length === 6, `main_hall floors[0] giữ 6 portal (got ${mh.floors[0].portals.length})`);
for (const src of [mh, mh.floors[0]]) {
  ok(!src.portals.some(p => ['library_lounge', 'meeting_room', 'memory_room'].includes(p.targetRoomId)),
    'sân không còn cổng thư viện/họp/kỷ niệm (đã dời vào sảnh Alpha)');
  ok(!src.zones.some(z => z.id === 'zone_main_stair_f1_f2'), 'sân không còn stair zone lên gian hàng');
}
for (const src of [room, room.floors[0]]) {
  ok(src.portals.length === 7, `alpha_interior có 7 cổng (ra sân, 2 lab, thư viện, họp, kỷ niệm, gian hàng) (got ${src.portals.length})`);
  const boothP = src.portals.find(p => p.labelKey === 'portals.main_hall_booths');
  ok(boothP?.targetRoomId === 'main_hall' && boothP?.targetFloor === 1, 'cổng gian hàng -> main_hall tầng 2 (targetFloor 1)');
}
const sports = mh.portals.find(p => p.targetRoomId === 'sports_complex');
ok(sports?.x === 1336 && sports?.y === 550, 'portal Khu Thể Thao (1336,550) nguyên vẹn');
const canteens = mh.portals.filter(p => p.targetRoomId === 'canteen_cafe');
ok(canteens.length === 2 && canteens[0].x === 600 && canteens[1].x === 776, '2 portal Căn Tin (600/776,735) nguyên vẹn');

// 8. Cooldown >= 1.5s
const wsSrc = readFileSync('src/scenes/WorldScene.js', 'utf-8');
const cdMatch = wsSrc.match(/now - this\.lastTeleportTime < (\d+)/);
ok(cdMatch && Number(cdMatch[1]) >= 1500, `teleport cooldown ${cdMatch?.[1]}ms >= 1500ms`);

// 9. i18n + index.html
const i18nSrc = readFileSync('src/config/i18n.js', 'utf-8');
ok(i18nSrc.includes("alpha_interior: 'Nội Thất Tòa Alpha'"), 'i18n VI rooms.alpha_interior');
ok(i18nSrc.includes("alpha_interior: 'Vào Tòa Alpha'"), 'i18n VI portals.alpha_interior');
ok(i18nSrc.includes("alpha_interior: 'Alpha Building Interior'"), 'i18n EN rooms.alpha_interior');
ok(i18nSrc.includes("alpha_interior: 'Enter Alpha Building'"), 'i18n EN portals.alpha_interior');
const htmlSrc = readFileSync('index.html', 'utf-8');
ok(htmlSrc.includes('id="opt-alpha_interior" value="alpha_interior"'), 'index.html có option #opt-alpha_interior');

// 10. Không emoji + day/night off
const mapsSrc = readFileSync('src/config/maps.js', 'utf-8');
const newLabels = [...room.portals.map(p => p.label), ...room.zones.map(z => z.label + ' ' + z.name), room.name];
ok(newLabels.every(l => !EMOJI_RE.test(l)), 'labels mới không emoji');
ok(DAY_NIGHT_CYCLE_ENABLED === false, 'DAY_NIGHT_CYCLE_ENABLED=false giữ nguyên');

// 11. floors[1]: tầng 2 lab
ok(room.floors?.length === 2, '2 floors (trệt + tầng 2 lab)');
const f1 = room.floors[1];
ok(f1.layout.length === 19 && f1.layout.every(r => r.length === 25), 'tầng 2 layout 19x25');
const f1Tile = (x, y) => f1.layout[Math.floor(y / 32)]?.[Math.floor(x / 32)];
ok(f1Tile(f1.spawnPoint.x, f1.spawnPoint.y) === 9, `tầng 2 spawn (${f1.spawnPoint.x},${f1.spawnPoint.y}) walkable`);
const up = room.floors[0].zones.find(z => z.type === 'stair_transition');
const down = f1.zones.find(z => z.type === 'stair_transition');
ok(up?.targetFloor === 1 && down?.targetFloor === 0, 'cầu thang 2 chiều trệt<->tầng 2');
ok(f1.zones.length === 4, 'tầng 2 có 4 zones (cầu thang, bảng, 2 bàn lab)');
ok(!f1.paintedBackground, 'tầng 2 dùng tile layout (không painted)');

// Phòng cũ không bị đụng: dever_lab trả về sảnh Alpha (phân cấp mới)
const labBack = lab.portals.some(p => p.targetRoomId === 'alpha_interior' && p.labelKey === 'portals.back_to_alpha');
ok(labBack, 'dever_lab giữ portal về alpha_interior (không gãy phòng cũ)');
ok(!lab.portals.some(p => p.targetRoomId === 'main_hall'), 'dever_lab không còn portal thẳng về sân');

console.log(`\n[RESULT] ${passed} passed, ${failed} failed`);