import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ HỆ THỐNG ĐA NGÔN NGỮ (i18n) & SLIDE PRESETS (DEVER TOWN)...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, extraInfo = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${extraInfo}`);
  }
}

async function runTests() {
  const { TRANSLATIONS, i18n } = await import('../src/config/i18n.js');
  const { ROOM_SLIDE_PRESETS } = await import('../src/config/interactions.js');
  const { MAPS_CONFIG } = await import('../src/config/maps.js');

  // Test 1: Kiểm tra 8 phòng trong TRANSLATIONS vi và en
  const roomKeys = Object.keys(MAPS_CONFIG);
  assert(roomKeys.length === 8, 'Hệ thống có đầy đủ 8 phòng chức năng');
  roomKeys.forEach(r => {
    assert(TRANSLATIONS.vi.rooms[r] !== undefined, `i18n Tiếng Việt có tên phòng: ${r}`);
    assert(TRANSLATIONS.en.rooms[r] !== undefined, `i18n Tiếng Anh có tên phòng: ${r}`);
    assert(TRANSLATIONS.vi.portals[r] !== undefined, `i18n Tiếng Việt có nhãn portal: ${r}`);
    assert(TRANSLATIONS.en.portals[r] !== undefined, `i18n Tiếng Anh có nhãn portal: ${r}`);
  });

  // Test 2: Kiểm tra chuyển đổi ngôn ngữ
  i18n.setLanguage('en');
  assert(i18n.currentLang === 'en', 'i18n chuyển sang Tiếng Anh (en) thành công');
  assert(i18n.get('rooms.main_hall') === 'Alpha Main Hall', 'Dịch đúng tên Sảnh Alpha sang tiếng Anh');
  assert(i18n.get('rooms.canteen_cafe') === 'Canteen & Cafe', 'Dịch đúng Căn tin sang tiếng Anh');

  i18n.setLanguage('vi');
  assert(i18n.currentLang === 'vi', 'i18n chuyển về Tiếng Việt (vi) thành công');
  assert(i18n.get('rooms.main_hall') === 'Sảnh Alpha', 'Dịch đúng tên Sảnh Alpha sang tiếng Việt');

  // Test 3: Kiểm tra ROOM_SLIDE_PRESETS có ít nhất 8 slides cho các phòng
  assert(ROOM_SLIDE_PRESETS.length >= 8, 'ROOM_SLIDE_PRESETS có ít nhất 8 bộ slide đề xuất', `Số lượng: ${ROOM_SLIDE_PRESETS.length}`);
  const hasCanteenSlide = ROOM_SLIDE_PRESETS.some(s => s.room === 'canteen_cafe');
  const hasLabSlide = ROOM_SLIDE_PRESETS.some(s => s.room === 'dever_lab');
  const hasLibSlide = ROOM_SLIDE_PRESETS.some(s => s.room === 'library_lounge');
  assert(hasCanteenSlide, 'Có slide đề xuất cho Căn Tin & Cafe');
  assert(hasLabSlide, 'Có slide đề xuất cho Tech Lab');
  assert(hasLibSlide, 'Có slide đề xuất cho Thư Viện FUDA');

  // Test 4: Kiểm tra WorldScene.js hỗ trợ refreshSceneLanguage
  const worldSceneCode = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'WorldScene.js'), 'utf-8');
  assert(worldSceneCode.includes('refreshSceneLanguage()'), 'WorldScene.js chứa hàm refreshSceneLanguage');
  assert(worldSceneCode.includes('this.i18n.subscribe'), 'WorldScene.js đăng ký lắng nghe thay đổi ngôn ngữ');

  // Test 5: Kiểm tra index.html có data-i18n cho header, footer, chat
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  assert(indexHtml.includes('data-i18n="inventoryBtn"'), 'index.html chứa data-i18n cho nút Túi đồ');
  assert(indexHtml.includes('data-i18n="wardrobeBtn"'), 'index.html chứa data-i18n cho nút Tủ đồ');
  assert(indexHtml.includes('slide-presets-pills'), 'index.html chứa container slide-presets-pills');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ i18n & SLIDE PRESETS: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
