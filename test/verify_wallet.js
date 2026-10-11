/**
 * DEVER TOWN - WALLET MANAGER VERIFICATION SUITE (Phase B)
 * Kiểm định ví D-Coin trung tâm:
 * 1. Hằng số kinh tế (storage key, số dư khởi đầu 0) nằm trong src/config/economyConfig.js.
 * 2. Ví mới bắt đầu từ số dư khởi đầu (0).
 * 3. earn(): cộng coin, trả về số dư mới, lưu vào localStorage, phát sự kiện change.
 * 4. spend(): trừ coin khi đủ số dư; trả về false và giữ nguyên số dư khi thiếu.
 * 5. onChange/offChange: đăng ký và hủy đăng ký sự kiện.
 * 6. Xác thực số lượng: từ chối số âm, số lẻ, NaN, Infinity, kiểu không phải số.
 * 7. Persistence: instance mới đọc lại số dư đã lưu.
 * 8. Giá trị lưu trữ hỏng: fallback về số dư khởi đầu.
 * 9. Singleton walletManager dùng chung toàn game.
 */

import { ECONOMY_CONFIG } from '../src/config/economyConfig.js';
import { WalletManager, walletManager } from '../src/managers/WalletManager.js';

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

// Mock LocalStorage (mock sau import — WalletManager tự bảo vệ khi
// localStorage undefined ở thời điểm import, và instance mới sau mock
// sẽ đọc được storage như trong browser).
const memoryStore = {};
global.localStorage = {
  getItem: (k) => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; }
};

console.log('--- BẮT ĐẦU KIỂM THỬ WALLET MANAGER (D-COIN) ---');

// 1. Hằng số kinh tế trong src/config/
assert(ECONOMY_CONFIG.walletStorageKey === 'devertown_wallet_v1', 'Storage key ví là devertown_wallet_v1');
assert(ECONOMY_CONFIG.startingBalance === 0, 'Số dư khởi đầu ví là 0 D-Coin');

// 2. Ví mới bắt đầu từ 0
localStorage.clear();
let wallet = new WalletManager();
assert(wallet.getBalance() === 0, 'Ví mới có số dư 0');
assert(localStorage.getItem('devertown_wallet_v1') === '0', 'Ví mới lưu số dư 0 vào localStorage đúng key');

// 3. earn(): cộng coin, trả về số dư mới, phát sự kiện
localStorage.clear();
wallet = new WalletManager();
let lastEvent = null;
const unsub = wallet.onChange((ev) => { lastEvent = ev; });

const afterEarn = wallet.earn(100, 'snake');
assert(afterEarn === 100, 'earn(100) trả về số dư mới 100');
assert(wallet.getBalance() === 100, 'getBalance() = 100 sau khi earn');
assert(localStorage.getItem('devertown_wallet_v1') === '100', 'Số dư 100 được lưu vào localStorage');
assert(
  lastEvent && lastEvent.type === 'earn' && lastEvent.amount === 100
    && lastEvent.source === 'snake' && lastEvent.balance === 100,
  'Sự kiện change phát đúng { type: earn, amount: 100, source: snake, balance: 100 }'
);

// onChange trả về hàm hủy đăng ký
unsub();
lastEvent = null;
wallet.earn(10, 'sheep_dream');
assert(wallet.getBalance() === 110, 'earn tiếp 10 → số dư 110');
assert(lastEvent === null, 'Hủy đăng ký (unsub) thì không nhận sự kiện nữa');

// offChange hủy listener cụ thể
let calls = 0;
const listener = () => { calls++; };
wallet.onChange(listener);
wallet.offChange(listener);
wallet.earn(5, 'bug_dungeon');
assert(calls === 0, 'offChange(listener) hủy listener cụ thể');
assert(wallet.getBalance() === 115, 'Số dư 115 sau chuỗi earn');

// 4. spend(): đủ số dư → true; thiếu → false, giữ nguyên
const okSpend = wallet.spend(15, 'shop');
assert(okSpend === true, 'spend(15) thành công khi đủ số dư');
assert(wallet.getBalance() === 100, 'Số dư còn 100 sau khi spend 15');
assert(localStorage.getItem('devertown_wallet_v1') === '100', 'Số dư sau spend lưu vào localStorage');

const failSpend = wallet.spend(1000, 'shop');
assert(failSpend === false, 'spend(1000) trả về false khi không đủ số dư');
assert(wallet.getBalance() === 100, 'Số dư giữ nguyên 100 sau spend thất bại');

// Sự kiện spend
let spendEvent = null;
wallet.onChange((ev) => { spendEvent = ev; });
wallet.spend(20, 'fee');
assert(
  spendEvent && spendEvent.type === 'spend' && spendEvent.amount === 20
    && spendEvent.sink === 'fee' && spendEvent.balance === 80,
  'Sự kiện change phát đúng { type: spend, amount: 20, sink: fee, balance: 80 }'
);

// spend(0) / earn(0) hợp lệ (số nguyên không âm)
assert(wallet.spend(0, 'shop') === true, 'spend(0) hợp lệ, trả về true');
assert(wallet.earn(0, 'test') === 80, 'earn(0) hợp lệ, số dư không đổi');

// 5. Xác thực số lượng — từ chối giá trị không hợp lệ
assertThrows(() => wallet.earn(-5, 'test'), 'earn(-5): từ chối số âm');
assertThrows(() => wallet.earn(1.5, 'test'), 'earn(1.5): từ chối số lẻ');
assertThrows(() => wallet.earn(NaN, 'test'), 'earn(NaN): từ chối NaN');
assertThrows(() => wallet.earn(Infinity, 'test'), 'earn(Infinity): từ chối vô cực');
assertThrows(() => wallet.earn('10', 'test'), "earn('10'): từ chối kiểu string");
assertThrows(() => wallet.earn(undefined, 'test'), 'earn(undefined): từ chối undefined');
assertThrows(() => wallet.spend(-1, 'shop'), 'spend(-1): từ chối số âm');
assertThrows(() => wallet.spend(0.5, 'shop'), 'spend(0.5): từ chối số lẻ');
assertThrows(() => wallet.spend(NaN, 'shop'), 'spend(NaN): từ chối NaN');
assert(wallet.getBalance() === 80, 'Số dư giữ nguyên 80 sau các lệnh không hợp lệ');

// 6. Persistence: instance mới đọc lại số dư đã lưu
const reloaded = new WalletManager();
assert(reloaded.getBalance() === 80, 'Instance mới đọc lại số dư 80 từ localStorage');

// 7. Giá trị lưu trữ hỏng → fallback về số dư khởi đầu
localStorage.setItem('devertown_wallet_v1', 'khong-phai-so');
const corrupted = new WalletManager();
assert(corrupted.getBalance() === 0, 'Giá trị lưu trữ hỏng → fallback về 0');
localStorage.setItem('devertown_wallet_v1', '-50');
const negative = new WalletManager();
assert(negative.getBalance() === 0, 'Giá trị lưu trữ âm → fallback về 0');

// 8. Singleton dùng chung toàn game
assert(walletManager instanceof WalletManager, 'walletManager là instance của WalletManager');
assert(typeof walletManager.earn === 'function', 'Singleton có phương thức earn');
assert(typeof walletManager.spend === 'function', 'Singleton có phương thức spend');
assert(typeof walletManager.getBalance === 'function', 'Singleton có phương thức getBalance');
assert(typeof walletManager.onChange === 'function', 'Singleton có phương thức onChange');
assert(typeof walletManager.offChange === 'function', 'Singleton có phương thức offChange');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);
