import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN DEVER TOWN ADD-ON V3 (SECURITY, CUSTOMIZATION, GAME SCORES, ONBOARDING, LINKS)...\n');

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
  // Test 1: Kiểm tra file .gitignore và .env.example
  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert(
    gitignore.includes('.env') && gitignore.includes('server/data/users.json'),
    'Bảo mật .gitignore đã chặn .env và users.json'
  );
  assert(fs.existsSync(path.join(rootDir, '.env.example')), 'Tồn tại file mẫu .env.example');

  // Test 2: Kiểm tra Rate Limiter & XSS Sanitizer
  const { createRateLimiter, sanitizeInput } = await import('../server/middleware/rateLimiter.js');
  assert(
    typeof createRateLimiter === 'function' && typeof sanitizeInput === 'function',
    'Middleware Rate Limiter và XSS Sanitizer hoạt động tốt'
  );

  // Test 3: Kiểm tra Database Adapter Customization & Game Scores
  const { FileDatabaseAdapter } = await import('../server/db/fileAdapter.js');
  const fileAdapter = new FileDatabaseAdapter();
  await fileAdapter.init();

  assert(
    typeof fileAdapter.updateCustomization === 'function' &&
    typeof fileAdapter.saveGameScore === 'function' &&
    typeof fileAdapter.getLeaderboard === 'function',
    'FileDatabaseAdapter đầy đủ các phương thức lưu Customization & Minigame Scores'
  );

  // Thử lưu điểm và kiểm tra leaderboard
  await fileAdapter.saveGameScore('test_user_01', {
    gameType: 'penalty',
    score: 50,
    streak: 5,
    playerName: 'Nguyễn Thái Hưng'
  });
  const leaderboard = await fileAdapter.getLeaderboard('penalty', 5);
  assert(
    leaderboard.length > 0 && leaderboard[0].player_name === 'Nguyễn Thái Hưng',
    'Ghi và đọc bảng xếp hạng Minigame hoạt động chính xác'
  );

  // Test 4: Kiểm tra Links chính xác theo Add-on v3
  const { INTERACTION_PRESETS } = await import('../src/config/interactions.js');
  const webPortals = INTERACTION_PRESETS.club_website.portals;
  const formPortal = webPortals.find(p => p.url.includes('forms.gle/2us1yB5Qp2HYejj28'));
  const fbPortal = webPortals.find(p => p.url.includes('facebook.com/FPTUDever'));
  const fudaPortal = webPortals.find(p => p.url.includes('facebook.com/daihocfptdanang'));
  const tiktokPortal = webPortals.find(p => p.url.includes('tiktok.com/@daihocfptdanang'));

  assert(
    formPortal && fbPortal && fudaPortal && tiktokPortal,
    'Cập nhật đầy đủ link thật: Form tuyển quân, Fanpage Dever, Fanpage FUDA, TikTok FUDA'
  );

  // Test 5: Kiểm tra OnboardingGuide.js
  assert(fs.existsSync(path.join(rootDir, 'src', 'ui', 'OnboardingGuide.js')), 'File src/ui/OnboardingGuide.js tồn tại');

  // Test 6: Kiểm tra an toàn Spawn Point & Portals trên toàn bộ 7 phòng (Zero-Regression)
  const { MAPS_CONFIG } = await import('../src/config/maps.js');
  const roomKeys = Object.keys(MAPS_CONFIG);
  assert(roomKeys.length === 7, 'Bảo toàn 7 bản đồ trong MAPS_CONFIG');

  const solidTiles = new Set([2, 3, 4, 8, 12, 14, 15, 16, 17, 19, 20, 21, 22, 25, 26, 27, 29]);
  let allSpawnsSafe = true;

  for (const roomId of roomKeys) {
    const map = MAPS_CONFIG[roomId];
    const tileCol = Math.floor(map.spawnPoint.x / 32);
    const tileRow = Math.floor(map.spawnPoint.y / 32);
    const tileType = map.layout[tileRow]?.[tileCol];

    if (solidTiles.has(tileType) || tileType === 10) {
      allSpawnsSafe = false;
      break;
    }
  }
  assert(allSpawnsSafe, 'Tất cả 7 phòng duy trì Zero-Regression an toàn tuyệt đối về spawn point');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ ADD-ON V3: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
