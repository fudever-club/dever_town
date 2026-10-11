/**
 * DEVER TOWN - HEALTH MANAGER VERIFICATION SUITE (Phase C)
 * Kiểm định hệ thống thể lực 50 HP + vùng an toàn:
 * 1. Hằng số cân bằng (maxHP 50, storage key, điểm hồi sinh, giữ 100% đồ/coin)
 *    nằm trong src/config/combatConfig.js — không hardcode.
 * 2. Manager mới bắt đầu từ 50 HP (không KO).
 * 3. heal(): hồi máu, kẹp ở maxHP, từ chối số lượng không hợp lệ.
 * 4. damage(): BỊ CHẶN ở vùng an toàn (mặc định); có hiệu lực ở vùng
 *    thách đấu (qua zone provider); từ chối số lượng không hợp lệ.
 * 5. HP chạm 0 → tự động knockOut(): phát sự kiện 'ko', hồi đầy 50 HP,
 *    không mất vật phẩm/coin (không có trừ điểm nào xảy ra).
 * 6. onChange/offChange: đăng ký và hủy đăng ký sự kiện.
 * 7. Persistence: instance mới đọc lại HP đã lưu.
 * 8. Giá trị lưu trữ hỏng: fallback về maxHP.
 * 9. Cờ vùng trong maps.js: 4 vùng masterplan = 'safe'; phòng không khai
 *    báo cờ → mặc định 'safe' (DEFAULT_ZONE).
 * 10. Singleton healthManager dùng chung toàn game.
 */

import { COMBAT_CONFIG, ZONE_SAFE, ZONE_CHALLENGE, DEFAULT_ZONE } from '../src/config/combatConfig.js';
import { HealthManager, healthManager } from '../src/managers/HealthManager.js';
import { MAPS_CONFIG } from '../src/config/maps.js';
import { NPC_CONFIG } from '../src/config/npcs.js';

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

function assertThrows(fn, message) {
  totalTests++;
  try {
    fn();
    console.error(`[FAIL] ${message} (không ném lỗi như kỳ vọng)`);
    process.exitCode = 1;
  } catch (e) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  }
}

// Mock LocalStorage (mock sau import — HealthManager tự bảo vệ khi
// localStorage undefined ở thời điểm import, instance mới sau mock
// sẽ đọc được storage như trong browser).
const memoryStore = {};
global.localStorage = {
  getItem: (k) => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; }
};

console.log('--- BẮT ĐẦU KIỂM THỬ HEALTH MANAGER (50 HP + SAFE ZONE) ---');

// 1. Hằng số cân bằng trong src/config/combatConfig.js
assert(COMBAT_CONFIG.maxHP === 50, 'maxHP chuẩn GraalOnline là 50');
assert(COMBAT_CONFIG.healthStorageKey === 'devertown_health_v1', 'Storage key HP là devertown_health_v1');
assert(COMBAT_CONFIG.healOnSafeZoneEnter === true, 'Vào vùng an toàn → hồi đầy HP');
assert(COMBAT_CONFIG.respawn.roomId === 'main_hall', 'Điểm hồi sinh tại Tòa Alpha (main_hall)');
assert(COMBAT_CONFIG.respawn.x === 400 && COMBAT_CONFIG.respawn.y === 350, 'Tọa độ hồi sinh = (400, 350)');
assert(COMBAT_CONFIG.knockOutKeepInventoryPercent === 100, 'KO giữ 100% vật phẩm (không rơi đồ)');
assert(COMBAT_CONFIG.knockOutKeepCoinsPercent === 100, 'KO giữ 100% D-Coin');
assert(ZONE_SAFE === 'safe', 'Hằng số ZONE_SAFE = safe');
assert(ZONE_CHALLENGE === 'challenge', 'Hằng số ZONE_CHALLENGE = challenge');
assert(DEFAULT_ZONE === ZONE_SAFE, 'DEFAULT_ZONE thận trọng = safe');

// 2. Manager mới: 50 HP, không KO
const h = new HealthManager();
assert(h.getHP() === 50, 'Manager mới bắt đầu với 50/50 HP');
assert(h.getMaxHP() === 50, 'getMaxHP() = 50');
assert(h.isKO() === false, 'Manager mới không ở trạng thái KO');

// 3. heal(): hồi máu, kẹp ở maxHP, từ chối số không hợp lệ
h.setZoneProvider(() => ZONE_CHALLENGE); // cho phép damage để tạo HP thiếu
h.damage(20, 'test_setup');
assert(h.getHP() === 30, 'damage 20 ở vùng thách đấu → còn 30 HP');
h.heal(10, 'safe_zone');
assert(h.getHP() === 40, 'heal 10 → 40 HP');
h.heal(100, 'safe_zone');
assert(h.getHP() === 50, 'heal vượt trần → kẹp ở 50 HP');
assertThrows(() => h.heal(-5, 'x'), 'heal(-5) ném lỗi');
assertThrows(() => h.heal(2.5, 'x'), 'heal(2.5) ném lỗi (số lẻ)');
assertThrows(() => h.heal(NaN, 'x'), 'heal(NaN) ném lỗi');
assertThrows(() => h.heal('10', 'x'), 'heal("10") ném lỗi (không phải số)');

// 4a. damage BỊ CHẶN ở vùng an toàn (không PvP, không sát thương vùng)
const events = [];
const unsub = h.onChange((e) => events.push(e));
h.setZoneProvider(() => ZONE_SAFE);
const hpBefore = h.getHP();
const afterBlocked = h.damage(30, 'water_gun');
assert(afterBlocked === hpBefore && h.getHP() === hpBefore, 'damage ở vùng an toàn → HP giữ nguyên');
assert(events.length === 0, 'damage bị chặn → không phát sự kiện');
h.setZoneProvider(null); // chưa đăng ký provider → mặc định safe
h.damage(30, 'water_gun');
assert(h.getHP() === hpBefore, 'chưa đăng ký zone provider → mặc định safe, damage bị chặn');

// 4b. damage có hiệu lực ở vùng thách đấu
events.length = 0;
h.setZoneProvider(() => ZONE_CHALLENGE);
h.damage(15, 'fort_event');
assert(h.getHP() === 35, 'damage 15 ở vùng thách đấu → còn 35 HP');
assert(events.length === 1 && events[0].type === 'damage' && events[0].amount === 15, "Phát sự kiện { type: 'damage', amount: 15 }");
assertThrows(() => h.damage(-1, 'x'), 'damage(-1) ném lỗi');
assertThrows(() => h.damage(Infinity, 'x'), 'damage(Infinity) ném lỗi');

// 5. HP chạm 0 → knockOut(): sự kiện 'ko', hồi đầy 50, giữ đồ/coin
events.length = 0;
h.damage(35, 'water_gun'); // 35 - 35 = 0 → KO
assert(events.length === 1 && events[0].type === 'ko', "HP chạm 0 → phát sự kiện { type: 'ko' }");
assert(h.getHP() === 50, 'Sau KO → HP hồi đầy 50');
assert(h.isKO() === false, 'Sau KO → isKO() = false');
assert(localStorage.getItem('devertown_health_v1') === '50', 'HP sau KO được persist vào localStorage');

// knockOut() công khai: giữ nguyên ví D-Coin (không trừ)
const hp2 = new HealthManager();
hp2.setZoneProvider(() => ZONE_CHALLENGE);
hp2.damage(10, 'x');
let koFired = false;
hp2.onChange((e) => { if (e.type === 'ko') koFired = true; });
hp2.knockOut('manual_test');
assert(koFired, "knockOut() công khai phát sự kiện 'ko'");
assert(hp2.getHP() === 50, 'knockOut() công khai → HP về 50');

// 6. onChange/offChange
let count = 0;
const cb = () => { count++; };
const off = hp2.onChange(cb);
hp2.setZoneProvider(() => ZONE_CHALLENGE);
hp2.damage(5, 'x');
assert(count === 1, 'onChange nhận sự kiện damage');
off();
hp2.damage(5, 'x');
assert(count === 1, 'offChange (qua hàm trả về) ngừng nhận sự kiện');
unsub();

// 7. Persistence: instance mới đọc lại HP đã lưu
const persisted = new HealthManager();
persisted.setZoneProvider(() => ZONE_CHALLENGE);
persisted.damage(12, 'x'); // 50 - 12 = 38 (persisted.hp trước đó là 40 → 28)
const savedHP = persisted.getHP();
const reloaded = new HealthManager();
assert(reloaded.getHP() === savedHP, `Instance mới đọc lại HP ${savedHP} từ localStorage`);

// 8. Giá trị lưu trữ hỏng → fallback về maxHP
localStorage.setItem('devertown_health_v1', 'khong-phai-so');
const corrupted = new HealthManager();
assert(corrupted.getHP() === 50, 'Giá trị lưu trữ hỏng → fallback về 50');
localStorage.setItem('devertown_health_v1', '999');
const overMax = new HealthManager();
assert(overMax.getHP() === 50, 'Giá trị lưu trữ vượt maxHP → kẹp về 50');

// 9. Cờ vùng trong maps.js
assert(MAPS_CONFIG.main_hall.zone === ZONE_SAFE, "main_hall (Sảnh Lễ Tân Tòa Alpha) zone = 'safe'");
assert(MAPS_CONFIG.library_lounge.zone === ZONE_SAFE, "library_lounge (Thư Viện) zone = 'safe'");
assert(MAPS_CONFIG.sports_complex.zone === ZONE_SAFE, "sports_complex (PE Exam) zone = 'safe'");
assert(MAPS_CONFIG.meeting_room.zone === ZONE_SAFE, "meeting_room (Văn phòng CLB) zone = 'safe'");
for (const [roomId, cfg] of Object.entries(MAPS_CONFIG)) {
  const zone = cfg.zone || DEFAULT_ZONE;
  assert(zone === ZONE_SAFE || zone === ZONE_CHALLENGE, `Phòng ${roomId}: cờ zone hợp lệ (mặc định safe)`);
}

// 9b. NPC Cô Y Tá tại Trạm Y Tế (Tòa Alpha) — thoại Vitamin C, không emoji
const mainHallNPCs = NPC_CONFIG.main_hall || [];
const nurse = mainHallNPCs.find((n) => n.id === 'npc_yta_clinic');
assert(!!nurse, "NPC 'npc_yta_clinic' tồn tại trong main_hall");
assert(nurse.name === 'Cô Y Tá', "Tên NPC là 'Cô Y Tá'");
const nurseLines = Object.values(nurse.dialogues || {}).flatMap((d) => d.lines || []);
assert(nurseLines.some((l) => /vitamin c/i.test(l)), 'Thoại Cô Y Tá có nhắc Vitamin C (hồi sinh)');
assert(nurseLines.every((l) => !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(l)), 'Thoại Cô Y Tá không chứa emoji');
assert(nurse.tileX * 32 >= 0 && nurse.tileY * 32 >= 0, 'Vị trí Cô Y Tá hợp lệ trên map');

// 10. Singleton dùng chung toàn game
assert(healthManager instanceof HealthManager, 'healthManager là instance của HealthManager');
assert(typeof healthManager.damage === 'function', 'Singleton có phương thức damage');
assert(typeof healthManager.heal === 'function', 'Singleton có phương thức heal');
assert(typeof healthManager.knockOut === 'function', 'Singleton có phương thức knockOut');
assert(typeof healthManager.getHP === 'function', 'Singleton có phương thức getHP');
assert(typeof healthManager.isKO === 'function', 'Singleton có phương thức isKO');
assert(typeof healthManager.canTakeDamage === 'function', 'Singleton có phương thức canTakeDamage');
assert(typeof healthManager.setZoneProvider === 'function', 'Singleton có phương thức setZoneProvider');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);
