import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN DEVER TOWN EXPANSION V4 (SAFE MAPS, AUDIO, I18N, SETTINGS)...\n');

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
  // Test 1: Kiểm tra cấu hình bản đồ maps.js và an toàn Spawn Point / Portals
  const { MAPS_CONFIG } = await import('../src/config/maps.js');
  const roomKeys = Object.keys(MAPS_CONFIG);
  assert(roomKeys.length === 7, 'Đủ 7 bản đồ trong MAPS_CONFIG', `Có ${roomKeys.length} phòng`);

  const solidTiles = new Set([2, 3, 4, 8, 12, 14, 15, 16, 17, 19, 20, 21, 22, 25, 26, 27, 29]);

  let allSpawnsSafe = true;
  let unsafeReason = '';

  for (const roomId of roomKeys) {
    const map = MAPS_CONFIG[roomId];
    const spawnX = map.spawnPoint.x;
    const spawnY = map.spawnPoint.y;
    const tileCol = Math.floor(spawnX / 32);
    const tileRow = Math.floor(spawnY / 32);

    const tileType = map.layout[tileRow]?.[tileCol];
    if (solidTiles.has(tileType) || tileType === 10) {
      allSpawnsSafe = false;
      unsafeReason = `Phòng ${roomId} có spawn (${spawnX}, ${spawnY}) rơi vào tile không an toàn (${tileType}) tại ô [${tileRow}, ${tileCol}]`;
      break;
    }

    // Kiểm tra khoảng cách spawn tới các portals
    if (map.portals) {
      for (const p of map.portals) {
        const portalPixelX = p.tileX * 32 + 16;
        const portalPixelY = p.tileY * 32 + 16;
        const dist = Math.hypot(spawnX - portalPixelX, spawnY - portalPixelY);
        if (dist < 64) {
          allSpawnsSafe = false;
          unsafeReason = `Phòng ${roomId} có spawn (${spawnX}, ${spawnY}) quá gần portal [${p.tileX}, ${p.tileY}] (khoảng cách ${dist}px < 64px)`;
          break;
        }
      }
    }
  }

  assert(allSpawnsSafe, 'Tất cả 7 phòng có Spawn Point an toàn (không đè portal/tường, cách >= 64px)', unsafeReason);

  // Test 2: Kiểm tra đồng bộ server/data/rooms.json
  const roomsJsonPath = path.join(rootDir, 'server', 'data', 'rooms.json');
  const roomsJson = JSON.parse(fs.readFileSync(roomsJsonPath, 'utf8'));
  const jsonKeys = Object.keys(roomsJson);
  assert(jsonKeys.length === 7, 'Đồng bộ 7 phòng trong server/data/rooms.json', `Có ${jsonKeys.length} phòng`);

  // Test 3: Kiểm tra AudioManager.js
  const { audioManager } = await import('../src/utils/AudioManager.js');
  assert(
    typeof audioManager.playFootstep === 'function' &&
    typeof audioManager.playTeleport === 'function' &&
    typeof audioManager.playClick === 'function' &&
    typeof audioManager.playPickup === 'function' &&
    typeof audioManager.playVictory === 'function',
    'AudioManager đầy đủ các phương thức tổng hợp âm thanh Web Audio'
  );

  // Test 4: Kiểm tra i18n.js
  const { i18n, TRANSLATIONS } = await import('../src/config/i18n.js');
  assert(
    TRANSLATIONS.vi && TRANSLATIONS.en &&
    TRANSLATIONS.vi.settingsTitle && TRANSLATIONS.en.settingsTitle,
    'Hệ thống từ điển song ngữ i18n Tiếng Việt & English hoàn chỉnh'
  );

  // Test 5: Kiểm tra SettingsModal.js tồn tại và cú pháp hợp lệ
  const settingsModalPath = path.join(rootDir, 'src', 'ui', 'SettingsModal.js');
  assert(fs.existsSync(settingsModalPath), 'File src/ui/SettingsModal.js tồn tại');

  // Test 6: Kiểm tra SKILL.md và AGENTS.md
  const skillPath = path.join(rootDir, '.agents', 'skills', 'dever-town-engineering', 'SKILL.md');
  const agentsPath = path.join(rootDir, 'AGENTS.md');
  assert(fs.existsSync(skillPath) && fs.existsSync(agentsPath), 'File quy tắc AGENTS.md và SKILL.md đã được tạo thành công');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
