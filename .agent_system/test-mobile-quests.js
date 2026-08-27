import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ MOBILE RESPONSIVE & DAILY QUESTS SYSTEM (DEVER TOWN)...\n');

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
  // Test 1: Kiểm tra các file mới tồn tại
  assert(fs.existsSync(path.join(rootDir, 'src', 'managers', 'QuestManager.js')), 'Tồn tại file QuestManager.js');
  assert(fs.existsSync(path.join(rootDir, 'src', 'ui', 'QuestModal.js')), 'Tồn tại file QuestModal.js');
  assert(fs.existsSync(path.join(rootDir, 'src', 'ui', 'TouchControls.js')), 'Tồn tại file TouchControls.js');

  // Test 2: Kiểm tra QuestManager Logic
  const { QuestManager, DAILY_QUESTS_DEF } = await import('../src/managers/QuestManager.js');
  assert(DAILY_QUESTS_DEF.length >= 6, 'Có đầy đủ danh sách nhiệm vụ hằng ngày');
  const qm = new QuestManager();

  const state1 = qm.getState();
  assert(state1.quests.some(q => q.id === 'daily_login' && q.completed), 'Nhiệm vụ Điểm danh hằng ngày tự động hoàn thành khi vào game');

  // Thử tăng tiến độ penalty_goal
  qm.incrementProgress('penalty_goal', 1);
  const state2 = qm.getState();
  const penaltyQuest = state2.quests.find(q => q.id === 'penalty_goal');
  assert(penaltyQuest && penaltyQuest.completed, 'Nhiệm vụ Chân sút vàng hoàn thành khi ghi bàn');

  // Thử nhận thưởng
  const pointsBefore = qm.points;
  const claimed = qm.claimQuestReward('penalty_goal');
  assert(claimed && qm.points === pointsBefore + 30, 'Nhận thưởng nhiệm vụ cộng chính xác 30 Dever Points');

  const doubleClaim = qm.claimQuestReward('penalty_goal');
  assert(!doubleClaim, 'Chống nhận thưởng 2 lần cho cùng 1 nhiệm vụ');

  // Test 3: Kiểm tra HTML chứa touch controls và quest modal
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  assert(indexHtml.includes('mobile-touch-controls'), 'index.html chứa container phím ảo mobile-touch-controls');
  assert(indexHtml.includes('quest-modal'), 'index.html chứa modal quest-modal');
  assert(indexHtml.includes('header-quests-btn'), 'index.html chứa nút header-quests-btn');
  assert(indexHtml.includes('user-scalable=no, viewport-fit=cover'), 'index.html có thẻ meta viewport chuẩn Mobile');

  // Test 4: Kiểm tra CSS responsive rules
  const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf-8');
  assert(mainCss.includes('.mobile-touch-controls'), 'main.css chứa styles cho mobile touch controls');
  assert(mainCss.includes('.btn-quests') && mainCss.includes('.quest-modal-body'), 'main.css chứa styles cho Quests Modal');
  assert(mainCss.includes('@media (max-width: 1024px)'), 'main.css chứa responsive rules cho Mobile/Tablet');

  // Test 5: Zero-Regression kiểm tra 8 phòng
  const { MAPS_CONFIG } = await import('../src/config/maps.js');
  assert(Object.keys(MAPS_CONFIG).length === 8, 'Bảo toàn 8 phòng chức năng không thay đổi');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ MOBILE & QUESTS: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
