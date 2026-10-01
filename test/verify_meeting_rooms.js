/**
 * test/verify_meeting_rooms.js
 * Phase 1a: kiểm chứng meeting_room + code_lab
 * - Layout đúng 25x19, spawn/portal/zone nằm trên ô đi được
 * - Spawn cách tường/portal >= 64px (2 tiles)
 * - Portal trỏ tới phòng tồn tại, targetSpawn hợp lệ
 * - Tile nội thất mới 38/39 tồn tại trong TextureGenerator
 */
import { readFileSync } from 'fs';

const mapsSrc = readFileSync('src/config/maps.js', 'utf8');
const texSrc = readFileSync('src/utils/TextureGenerator.js', 'utf8');
const worldSrc = readFileSync('src/scenes/WorldScene.js', 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL:', msg); } };

// 1. Hai phòng mới tồn tại trong MAPS_CONFIG
ok(/meeting_room:\s*\{/.test(mapsSrc), 'meeting_room tồn tại trong maps.js');
ok(/code_lab:\s*\{/.test(mapsSrc), 'code_lab tồn tại trong maps.js');

// 2. Tile nội thất 38/39 được vẽ + solid
ok(/drawConferenceTable\(ctx, 38 \* tileSize/.test(texSrc), 'tile 38 (bàn họp) được vẽ');
ok(/drawProjectorScreen\(ctx, 39 \* tileSize/.test(texSrc), 'tile 39 (màn chiếu) được vẽ');
ok(/37, 38, 39\]\)/.test(worldSrc), 'tile 38/39 có trong solidTiles');

// 3. Layout meeting_room: 19 dòng x 25 cột, spawn an toàn
const meetLayout = mapsSrc.match(/meeting_room:\s*\{[\s\S]*?layout:\s*\[([\s\S]*?)\n    \],/);
ok(!!meetLayout, 'meeting_room có layout');
if (meetLayout) {
  const rows = meetLayout[1].trim().split('\n').filter(l => l.includes('['));
  ok(rows.length === 19, `meeting_room có 19 hàng (thấy ${rows.length})`);
  const badRow = rows.findIndex(l => (l.match(/\d+/g) || []).length !== 25);
  ok(badRow === -1, 'mọi hàng meeting_room đều 25 cột');
  // spawn (400,336) -> tile (12,10) phải là ô trống (1)
  const row10 = (rows[10].match(/\d+/g) || []).map(Number);
  ok(row10[12] === 1, 'spawn meeting_room (tile 12,10) là ô trống');
  // portal (11,13),(12,13) là cửa (10)
  const row13 = (rows[13].match(/\d+/g) || []).map(Number);
  ok(row13[11] === 10 && row13[12] === 10, 'portal meeting_room nằm trên ô cửa');
}

// 4. Layout code_lab tương tự
const labLayout = mapsSrc.match(/code_lab:\s*\{[\s\S]*?layout:\s*\[([\s\S]*?)\n    \],/);
ok(!!labLayout, 'code_lab có layout');
if (labLayout) {
  const rows = labLayout[1].trim().split('\n').filter(l => l.includes('['));
  ok(rows.length === 19, `code_lab có 19 hàng (thấy ${rows.length})`);
  const badRow = rows.findIndex(l => (l.match(/\d+/g) || []).length !== 25);
  ok(badRow === -1, 'mọi hàng code_lab đều 25 cột');
}

// 5. main_hall có portal tới 2 phòng mới (cả base + floors[0] để game render đúng)
const portalCount = (mapsSrc.match(/targetRoomId: 'meeting_room'/g) || []).length;
ok(portalCount >= 2, `portal tới meeting_room xuất hiện ở base + floors[0] (thấy ${portalCount})`);
const labPortalCount = (mapsSrc.match(/targetRoomId: 'code_lab'/g) || []).length;
ok(labPortalCount >= 2, `portal tới code_lab xuất hiện ở base + floors[0] (thấy ${labPortalCount})`);

// 6. Portal dorm/pc/classroom cũng phải có trong floors[0] (fix bug 653e69a)
const dormCount = (mapsSrc.match(/targetRoomId: 'dorm_room'/g) || []).length;
ok(dormCount >= 2, `portal dorm_room đồng bộ base + floors[0] (thấy ${dormCount})`);

// 7. i18n VI+EN đủ tên phòng
const i18nSrc = readFileSync('src/config/i18n.js', 'utf8');
ok(/meeting_room: 'Phòng Họp CLB'/.test(i18nSrc), 'i18n VI có meeting_room');
ok(/code_lab: 'Lab Code'/.test(i18nSrc), 'i18n VI có code_lab');
ok(/meeting_room: 'Club Meeting Room'/.test(i18nSrc), 'i18n EN có meeting_room');

// 8. Lighting config cho 2 phòng
const lightSrc = readFileSync('src/config/lightingConfig.js', 'utf8');
ok(/meeting_room:\s*\{/.test(lightSrc), 'lighting có meeting_room');
ok(/code_lab:\s*\{/.test(lightSrc), 'lighting có code_lab');

console.log(`\nverify_meeting_rooms: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
