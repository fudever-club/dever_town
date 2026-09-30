/**
 * DEVER TOWN - CLUB SETTLEMENT VERIFICATION SUITE
 * Kiểm định toàn diện logic Quản lý Định Cư 25 CLB & Kinh Tế D-Coin Thụ Động:
 * 1. Khởi tạo trạng thái mặc định với danh sách tài năng chờ.
 * 2. Cơ chế Định cư (Stationing) nhân vật vào CLB và tính điểm Danh Vọng.
 * 3. Thưởng chuyên môn (Affinity Bonus) nhân đôi sản lượng D-Coin.
 * 4. Giới hạn số lượng thành viên tối đa (Max 3/booth).
 * 5. Tích lũy và Thu hoạch D-Coin thụ động (Passive Income Claim).
 * 6. Rút thành viên (Unstation) và Giải cứu thành viên mới (Rescue/Unlock).
 */

import { ClubSettlementManager, TALENT_ROSTER_DEF } from '../src/managers/ClubSettlementManager.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// Mock LocalStorage
const memoryStore = {};
global.localStorage = {
  getItem: (k) => memoryStore[k] || null,
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; }
};

// Mock document
global.document = {
  getElementById: () => null
};

console.log('--- BẮT ĐẦU KIỂM THỬ CLUB SETTLEMENT & DELVERIUM ECONOMY ---');

const manager = new ClubSettlementManager();

// 1. Kiểm tra khởi tạo
assert(TALENT_ROSTER_DEF.length >= 8, 'Danh mục tài năng có ít nhất 8 NPC định cư');
const available = manager.getAvailableTalents();
assert(available.length === 3, 'Khởi tạo mặc định có 3 tài năng sẵn sàng định cư');

// 2. Định cư một thành viên đúng chuyên môn (Affinity)
// coder_cuong có affinity ['itsc', 'src', 'fudever']
const stationResult = manager.stationTalent('coder_cuong', 'itsc');
assert(stationResult.success === true, 'Định cư coder_cuong vào itsc thành công');
assert(stationResult.isAffinity === true, 'Kích hoạt thành công Affinity Bonus đúng chuyên môn');
assert(stationResult.repGain === 150, 'Điểm danh vọng nhận được 150 (Affinity matched)');

// 3. Kiểm tra thông tin định cư của CLB itsc
const itscSettlement = manager.getClubSettlement('itsc');
assert(itscSettlement.members.length === 1, 'CLB itsc có 1 thành viên định cư');
assert(itscSettlement.members[0].id === 'coder_cuong', 'Thành viên định cư là coder_cuong');
assert(itscSettlement.reputation === 150, 'Danh vọng CLB itsc đạt 150');
assert(itscSettlement.level === 1, 'CLB itsc đạt Cấp 1 (Khởi Sắc)');
assert(itscSettlement.yieldPerMin === 1.0, 'Sản lượng D-Coin / phút là 1.0 (0.5 x 2 Affinity)');

// 4. Định cư thêm thành viên khác (không affinity)
// barista_nga có affinity ['canteen', 'event', 'dever_lab'], đưa vào itsc
const station2 = manager.stationTalent('barista_nga', 'itsc');
assert(station2.success === true, 'Định cư barista_nga vào itsc thành công');
assert(station2.isAffinity === false, 'Không trùng chuyên môn (Affinity = false)');
assert(station2.repGain === 100, 'Điểm danh vọng cơ bản là 100');

const itscSettlement2 = manager.getClubSettlement('itsc');
assert(itscSettlement2.reputation === 250, 'Tổng danh vọng CLB đạt 250');
assert(itscSettlement2.level === 2, 'CLB itsc thăng cấp 2 (Tinh Hoa)');
// Sản lượng: (1.0 + 0.5) * 1.25 = 1.875 D-Coin/min
assert(itscSettlement2.yieldPerMin === 1.875, 'Sản lượng D-Coin tăng lên 1.875 nhờ Level 2 Tinh Hoa');

// 5. Kiểm tra giới hạn thành viên (Max 3)
// Định cư thành viên thứ 3
manager.stationTalent('artist_linh', 'itsc');
assert(manager.getClubSettlement('itsc').members.length === 3, 'CLB itsc đạt tối đa 3 thành viên');

// Thử mở khóa một tài năng mới và định cư thành viên thứ 4
manager.unlockTalent('dancer_khoi');
const station4 = manager.stationTalent('dancer_khoi', 'itsc');
assert(station4.success === false, 'Từ chối định cư vượt quá giới hạn 3 thành viên');

// 6. Rút thành viên (Unstation)
const unstationResult = manager.unstationTalent('barista_nga', 'itsc');
assert(unstationResult.success === true, 'Rút thành viên barista_nga thành công');
assert(manager.getClubSettlement('itsc').members.length === 2, 'CLB itsc còn lại 2 thành viên');
assert(manager.getAvailableTalents().some(t => t.id === 'barista_nga'), 'barista_nga quay trở lại danh sách chờ');

// 7. Giải cứu tài năng mới (Rescue Talent)
assert(manager.unlockTalent('mascot_buggy') === true, 'Mở khóa thành công linh vật Buggy Pro');
assert(manager.getAvailableTalents().some(t => t.id === 'mascot_buggy'), 'Buggy Pro xuất hiện trong danh sách chờ');

// 8. Tích lũy và Thu hoạch D-Coin thụ động
// Giả lập trôi qua 60 phút
manager.lastClaimTimestamp = Date.now() - (60 * 60 * 1000);
const accumulated = manager.getAccumulatedCoins();
assert(accumulated > 0, `Đã tích lũy ${accumulated} D-Coin sau 60 phút`);

// Khởi tạo ví người chơi
localStorage.setItem('dever_points', '1000');
const claimResult = manager.claimPassiveCoins();
assert(claimResult.success === true, 'Thu hoạch D-Coin thành công');
assert(claimResult.amount === accumulated, 'Số lượng D-Coin nhận được đúng bằng số tích lũy');
assert(parseInt(localStorage.getItem('dever_points'), 10) === 1000 + accumulated, 'Số dư ví được cộng chính xác');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);
