/**
 * Test Suite: Xác thực tích hợp Content Pack FPTU Đà Nẵng, Cổng học vụ, Menu Căn tin, Map 9 phân khu và Sticker DEVER
 */

import { INTERACTION_PRESETS } from '../src/config/interactions.js';
import { MAPS_CONFIG } from '../src/config/maps.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

console.log('🚀 BẮT ĐẦU KIỂM THỬ CONTENT PACK & CỔNG TIỆN ÍCH FPTU ĐÀ NẴNG...\n');

// 1. Kiểm thử Cổng Tiện Ích Học Vụ & Phần Mềm Thi
const portal = INTERACTION_PRESETS.fptu_student_portal;
assert(portal !== undefined, 'INTERACTION_PRESETS có cấu hình fptu_student_portal');
assert(portal.systems.length === 6, 'Có đủ 6 hệ thống học vụ trực tuyến FPTU');
assert(portal.systems.some(s => s.url.includes('fap.fpt.edu.vn')), 'Có link Cổng thông tin FAP (fap.fpt.edu.vn)');
assert(portal.systems.some(s => s.url.includes('flm.fpt.edu.vn')), 'Có link Đề cương môn học FLM (flm.fpt.edu.vn)');
assert(portal.systems.some(s => s.url.includes('resetdn.fpt.edu.vn')), 'Có link Đổi mật khẩu WiFi/EOS (resetdn.fpt.edu.vn)');
assert(portal.systems.some(s => s.url.includes('lmsdn.fpt.edu.vn/hd/')), 'Có link IT Helpdesk FPTU (lmsdn.fpt.edu.vn/hd/)');
assert(portal.systems.some(s => s.url.includes('lmsdn.fpt.edu.vn') && !s.url.includes('/hd/')), 'Có link Khóa học LMS FPTU (lmsdn.fpt.edu.vn)');
assert(portal.systems.some(s => s.url.includes('e360.fpt.edu.vn')), 'Có link Checkout sau thi E360 (e360.fpt.edu.vn)');

assert(portal.examApps.length === 3, 'Có đủ 3 phần mềm thi (SEB, EOS, PEA)');
assert(portal.examApps.some(a => a.name.includes('Safe Exam Browser')), 'Có link tải SEB');
assert(portal.examApps.some(a => a.name.includes('EOS Client')), 'Có link tải EOS Client');
assert(portal.examApps.some(a => a.name.includes('PEA Client')), 'Có link tải PEA Client');

// 2. Kiểm thử Thực đơn Căn tin Thực tế
const canteen = INTERACTION_PRESETS.canteen_menus;
assert(canteen !== undefined, 'INTERACTION_PRESETS có cấu hình canteen_menus');
assert(canteen.tabs.length === 3, 'Có đủ 3 Tab thực đơn Căn tin (Tầng 1 và Tầng 2)');
assert(canteen.tabs.some(t => t.image === '/assets/canteen/canteen_menu1.jpg'), 'Có ảnh menu1 Căn tin');
assert(canteen.tabs.some(t => t.image === '/assets/canteen/canteen_menu2.jpg'), 'Có ảnh menu2 The High Deli');
assert(canteen.tabs.some(t => t.image === '/assets/canteen/canteen_menu3.jpg'), 'Có ảnh menu3 FC Canteen');

// 3. Kiểm thử Bản đồ Campus 9 Phân Khu
const campusMap = INTERACTION_PRESETS.campus_map;
assert(campusMap !== undefined, 'INTERACTION_PRESETS có cấu hình campus_map');
assert(campusMap.locations.length === 9, 'Có đủ 9 phân khu trên bản đồ Campus FPTU Đà Nẵng');
assert(campusMap.locations.some(l => l.name.includes('Tòa Alpha')), 'Có phân khu Tòa Alpha');
assert(campusMap.locations.some(l => l.name.includes('Tòa Gamma')), 'Có phân khu Tòa Gamma');
assert(campusMap.locations.some(l => l.name.includes('Tòa Beta')), 'Có phân khu Tòa Beta');

// 4. Kiểm thử Quy chế CLB & Cẩm nang SWE201c
assert(INTERACTION_PRESETS.dever_charter !== undefined, 'Có cấu hình dever_charter');
assert(INTERACTION_PRESETS.swe201c_guide !== undefined, 'Có cấu hình swe201c_guide');
assert(INTERACTION_PRESETS.swe201c_guide.topics.length >= 5, 'Có đủ 5 chủ đề trọng tâm PE SWE201c');

// 5. Kiểm thử Tệp Tin Asset Tồn Tại Vật Lý
const rootDir = process.cwd();
assert(fs.existsSync(path.join(rootDir, 'public/assets/logos/2021-FPTU-Eng.png')), 'Asset tồn tại: 2021-FPTU-Eng.png');
assert(fs.existsSync(path.join(rootDir, 'public/assets/logos/dever_logo_white.png')), 'Asset tồn tại: dever_logo_white.png');
assert(fs.existsSync(path.join(rootDir, 'public/assets/canteen/canteen_menu1.jpg')), 'Asset tồn tại: canteen_menu1.jpg');
assert(fs.existsSync(path.join(rootDir, 'public/assets/campus/fuda_map.webp')), 'Asset tồn tại: fuda_map.webp');
assert(fs.existsSync(path.join(rootDir, 'public/assets/campus/fuda_mau.webp')), 'Asset tồn tại: fuda_mau.webp');

for (let s = 1; s <= 11; s++) {
  assert(fs.existsSync(path.join(rootDir, `public/assets/stickers/${s}.png`)), `Asset tồn tại: sticker ${s}.png`);
}

// 6. Kiểm thử Cấu hình Phòng và Zone Tương Tác
assert(MAPS_CONFIG.main_hall.zones.some(z => z.type === 'campus_map'), 'Sảnh Alpha có zone campus_map');
assert(MAPS_CONFIG.library_lounge.zones.some(z => z.type === 'swe201c_guide'), 'Thư viện có zone swe201c_guide');
assert(MAPS_CONFIG.media_hub.zones.some(z => z.type === 'fptu_student_portal'), 'Media Hub có zone fptu_student_portal');
assert(MAPS_CONFIG.canteen_cafe.zones.some(z => z.type === 'canteen_menus'), 'Căn Tin có zone canteen_menus');

console.log('\n========================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('========================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
