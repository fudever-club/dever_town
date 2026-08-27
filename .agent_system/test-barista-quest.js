import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ ĐỒNG BỘ NHIỆM VỤ BARISTA CÀ PHÊ (DEVER TOWN)...\n');

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
  const { QuestManager, DAILY_QUESTS_DEF } = await import('../src/managers/QuestManager.js');

  // Test 1: Khởi tạo QuestManager
  const qm = new QuestManager();
  assert(DAILY_QUESTS_DEF.some(q => q.id === 'barista_coffee'), 'DAILY_QUESTS_DEF chứa nhiệm vụ barista_coffee');

  // Test 2: Kiểm tra state ban đầu
  const initial = qm.getState();
  const baristaQuest = initial.quests.find(q => q.id === 'barista_coffee');
  assert(baristaQuest !== undefined, 'State trả về có chứa nhiệm vụ barista_coffee');

  // Test 3: Thực hiện hoàn thành nhiệm vụ barista_coffee
  qm.incrementProgress('barista_coffee', 1);
  const updated = qm.getState();
  const updatedBarista = updated.quests.find(q => q.id === 'barista_coffee');
  assert(updatedBarista && updatedBarista.completed, 'Nhiệm vụ barista_coffee chuyển sang trạng thái completed: true');

  // Test 4: Nhận thưởng nhiệm vụ barista_coffee
  const ptsBefore = qm.points;
  const claimed = qm.claimQuestReward('barista_coffee');
  assert(claimed && qm.points === ptsBefore + 25, 'Nhận thưởng nhiệm vụ Barista cộng chính xác +25 Dever Points');

  // Test 5: Chống nhận trùng 2 lần
  const doubleClaim = qm.claimQuestReward('barista_coffee');
  assert(!doubleClaim, 'Không cho phép nhận thưởng 2 lần cho cùng 1 nhiệm vụ');

  // Test 6: Kiểm tra InteractiveModal.js chứa trigger barista_coffee
  const modalCode = fs.readFileSync(path.join(rootDir, 'src', 'ui', 'InteractiveModal.js'), 'utf-8');
  assert(modalCode.includes("questManager.incrementProgress('barista_coffee'"), 'InteractiveModal.js tự động gọi incrementProgress cho barista_coffee');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ BARISTA QUEST: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
