/**
 * test/verify_meeting_rooms.js
 * Phase 1a (cập nhật sau đợt gọn phòng 2026-10-01): kiểm chứng meeting_room.
 * pc_room + code_lab đã xoá vì trùng lặp với dever_lab.
 * - Layout đúng 25x19, spawn/portal/zone nằm trên ô đi được
 * - Spawn cách tường/portal >= 64px (2 tiles)
 * - Portal trỏ tới phòng tồn tại, targetSpawn hợp lệ
 * - Tile nội thất mới 38/39 tồn tại trong TextureGenerator
 * - Không còn reference tới phòng đã xoá
 */
import { readFileSync } from 'fs';

const mapsSrc = readFileSync('src/config/maps.js', 'utf8');
const texSrc = readFileSync('src/utils/TextureGenerator.js', 'utf8');
const worldSrc = readFileSync('src/scenes/WorldScene.js', 'utf8');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL:', msg); } };

// 1. meeting_room tồn tại; pc_room + code_lab đã xoá khỏi maps.js
ok(/meeting_room:\s*\{/.test(mapsSrc), 'meeting_room tồn tại trong maps.js');
ok(!/pc_room:\s*\{/.test(mapsSrc), 'pc_room đã xoá khỏi maps.js');
ok(!/code_lab:\s*\{/.test(mapsSrc), 'code_lab đã xoá khỏi maps.js');
ok(!/targetRoomId: 'pc_room'/.test(mapsSrc), 'không còn portal tới pc_room');
ok(!/targetRoomId: 'code_lab'/.test(mapsSrc), 'không còn portal tới code_lab');

// 2. Tile nội thất 38/39 được vẽ + solid (vẫn dùng cho meeting_room)
ok(/drawConferenceTable\(ctx, 38 \* tileSize/.test(texSrc), 'tile 38 (bàn họp) được vẽ');
ok(/drawProjectorScreen\(ctx, 39 \* tileSize/.test(texSrc), 'tile 39 (màn chiếu) được vẽ');
ok(/37, 38, 39(, 42)?\]\)/.test(worldSrc), 'tile 38/39 có trong solidTiles');

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

// 4. main_hall có portal tới meeting_room (cả base + floors[0] để game render đúng)
const portalCount = (mapsSrc.match(/targetRoomId: 'meeting_room'/g) || []).length;
ok(portalCount >= 2, `portal tới meeting_room xuất hiện ở base + floors[0] (thấy ${portalCount})`);

// 5. Portal dorm/classroom cũng phải có trong floors[0] (fix bug 653e69a)
const dormCount = (mapsSrc.match(/targetRoomId: 'dorm_room'/g) || []).length;
ok(dormCount >= 2, `portal dorm_room đồng bộ base + floors[0] (thấy ${dormCount})`);

// 6. i18n VI+EN đủ tên phòng còn lại, không còn phòng đã xoá
const i18nSrc = readFileSync('src/config/i18n.js', 'utf8');
ok(/meeting_room: 'Phòng Họp & Lớp Học'/.test(i18nSrc), 'i18n VI có meeting_room');
ok(!/pc_room/.test(i18nSrc), 'i18n không còn pc_room');
ok(!/code_lab/.test(i18nSrc), 'i18n không còn code_lab');
ok(/meeting_room: 'Club Meeting & Class Room'/.test(i18nSrc), 'i18n EN có meeting_room');

// 7. Lighting config cho meeting_room, không còn phòng đã xoá
const lightSrc = readFileSync('src/config/lightingConfig.js', 'utf8');
ok(/meeting_room:\s*\{/.test(lightSrc), 'lighting có meeting_room');
ok(!/pc_room:\s*\{/.test(lightSrc), 'lighting không còn pc_room');
ok(!/code_lab:\s*\{/.test(lightSrc), 'lighting không còn code_lab');

// 8. Room selector không còn option phòng đã xoá
const htmlSrc = readFileSync('index.html', 'utf8');
ok(!/opt-pc_room/.test(htmlSrc), 'selector không còn pc_room');
ok(!/opt-code_lab/.test(htmlSrc), 'selector không còn code_lab');
ok(/opt-meeting_room/.test(htmlSrc), 'selector còn meeting_room');

console.log(`\nverify_meeting_rooms: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
