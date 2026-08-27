import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ PHÒNG CĂN TIN & CAFE + MỞ RỘNG CAMERA HEADROOM (DEVER TOWN)...\n');

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
  // Test 1: Kiểm tra cấu hình MAPS_CONFIG có 8 phòng
  const { MAPS_CONFIG } = await import('../src/config/maps.js');
  const roomKeys = Object.keys(MAPS_CONFIG);
  assert(roomKeys.length === 8, 'Hệ thống có đầy đủ 8 phòng chức năng', `Số phòng: ${roomKeys.length}`);
  assert(MAPS_CONFIG.canteen_cafe !== undefined, 'Tồn tại cấu hình phòng canteen_cafe trong MAPS_CONFIG');

  // Test 2: Kiểm tra kích thước và an toàn của canteen_cafe
  const cafeMap = MAPS_CONFIG.canteen_cafe;
  assert(cafeMap.layout.length === 19 && cafeMap.layout[0].length === 25, 'canteen_cafe đúng kích thước chuẩn 25x19 tiles');
  assert(cafeMap.spawnPoint && cafeMap.spawnPoint.x === 400 && cafeMap.spawnPoint.y === 120, 'canteen_cafe có spawnPoint an toàn tại x=400, y=120');

  // Test 3: Kiểm tra liên kết cổng 2 chiều giữa main_hall và canteen_cafe
  const mainHall = MAPS_CONFIG.main_hall;
  const mainToCafe = mainHall.portals.find(p => p.targetRoomId === 'canteen_cafe');
  const cafeToMain = cafeMap.portals.find(p => p.targetRoomId === 'main_hall');
  assert(mainToCafe !== undefined, 'Sảnh chính main_hall có cổng dẫn tới canteen_cafe');
  assert(cafeToMain !== undefined, 'canteen_cafe có cổng dẫn về main_hall');

  // Test 4: Kiểm tra Camera Padding và Headroom trong WorldScene.js
  const worldSceneCode = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'WorldScene.js'), 'utf-8');
  assert(worldSceneCode.includes('camera.setBounds(-PADDING_X, -PADDING_Y'), 'WorldScene.js mở rộng camera bounds với padding phía Bắc (North)');
  assert(worldSceneCode.includes('solidTiles.has') && worldSceneCode.includes('30') && worldSceneCode.includes('31'), 'WorldScene.js đăng ký vật cản cho tile 30 và 31');

  // Test 5: Kiểm tra TextureGenerator.js có vẽ tile 30 và 31
  const texGenCode = fs.readFileSync(path.join(rootDir, 'src', 'utils', 'TextureGenerator.js'), 'utf-8');
  assert(texGenCode.includes('drawCanteenCounter') && texGenCode.includes('drawCafeDiningTable'), 'TextureGenerator.js sinh tile quầy Căn tin và Bàn cafe');
  assert(texGenCode.includes('numTiles = 32'), 'TextureGenerator.js sinh 32 ô tile');

  // Test 6: Kiểm tra server/data/rooms.json có canteen_cafe
  const roomsJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'server', 'data', 'rooms.json'), 'utf-8'));
  assert(roomsJson.canteen_cafe !== undefined, 'server/data/rooms.json đồng bộ phòng canteen_cafe');

  // Test 7: Kiểm tra i18n và UI
  const { TRANSLATIONS } = await import('../src/config/i18n.js');
  assert(TRANSLATIONS.vi.rooms.canteen_cafe !== undefined, 'i18n tiếng Việt có tên phòng canteen_cafe');
  assert(TRANSLATIONS.en.rooms.canteen_cafe !== undefined, 'i18n tiếng Anh có tên phòng canteen_cafe');

  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  assert(indexHtml.includes('opt-canteen_cafe'), 'index.html dropdown chứa option opt-canteen_cafe');

  // Test 8: Kiểm tra vật phẩm mới trong items.js
  const { ITEMS_DATABASE, PICKUP_SPOTS } = await import('../src/config/items.js');
  assert(ITEMS_DATABASE.danang_salt_coffee !== undefined, 'Tồn tại vật phẩm Ly Cà Phê Muối Đà Nẵng');
  assert(ITEMS_DATABASE.fuda_banh_mi !== undefined, 'Tồn tại vật phẩm Bánh Mì Chả Canteen FUDA');
  assert(PICKUP_SPOTS.some(s => s.roomId === 'canteen_cafe'), 'Có điểm nhặt vật phẩm trong canteen_cafe');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ CANTEEN & CAFE + CAMERA: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
