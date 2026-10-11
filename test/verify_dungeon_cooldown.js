// Verify: Bug Dungeon anti-farm — cooldown từng bug + trần D-Coin/ngày (Phase 0).
// Mock localStorage tối thiểu cho môi trường Node.
const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};

const {
  DUNGEON_BALANCE,
  getDungeonCooldowns,
  setDungeonCooldown,
  getDungeonCooldownRemainingMs,
  getDungeonDailyEarn,
  addDungeonDailyEarn,
  getDungeonDailyRemaining
} = await import('../src/config/dungeonConfig.js');

let pass = 0, fail = 0;
const ok = (cond, name) => {
  if (cond) { pass++; console.log(`  PASS: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}`); }
};

console.log('== Dungeon anti-farm ==');
ok(DUNGEON_BALANCE.bugRespawnCooldownMs === 10 * 60 * 1000, 'cooldown mặc định 10 phút');
ok(DUNGEON_BALANCE.dailyCoinCap === 500, 'trần ngày 500 D-Coin');

// 1. Bug mới: không cooldown
ok(getDungeonCooldownRemainingMs('bug_nullpointer') === 0, 'bug chưa fix -> sẵn sàng');

// 2. Sau khi fix: có cooldown ~10 phút
setDungeonCooldown('bug_nullpointer');
const left = getDungeonCooldownRemainingMs('bug_nullpointer');
ok(left > 9 * 60 * 1000 && left <= 10 * 60 * 1000, `vừa fix -> còn chờ ~10 phút (còn ${Math.round(left / 1000)}s)`);

// 3. Bug khác không bị ảnh hưởng
ok(getDungeonCooldownRemainingMs('bug_memoryleak') === 0, 'bug khác vẫn sẵn sàng');

// 4. Cooldown hết hạn (giả lập 11 phút trước)
setDungeonCooldown('bug_old', Date.now() - 11 * 60 * 1000);
ok(getDungeonCooldownRemainingMs('bug_old') === 0, 'quá 10 phút -> hết cooldown');

// 5. Trần ngày
localStorage.clear();
ok(getDungeonDailyRemaining() === 500, 'đầu ngày còn 500');
addDungeonDailyEarn(100);
ok(getDungeonDailyRemaining() === 400, 'sau +100 còn 400');
addDungeonDailyEarn(450);
ok(getDungeonDailyRemaining() === 0, 'vượt trần -> còn 0 (không âm)');
ok(getDungeonDailyEarn().earned === 550, 'earned ghi nhận đủ (cap áp ở lúc grant)');

// 6. Sang ngày mới tự reset
const rec = JSON.parse(localStorage.getItem(DUNGEON_BALANCE.dailyEarnStorageKey));
rec.date = '2000-01-01';
localStorage.setItem(DUNGEON_BALANCE.dailyEarnStorageKey, JSON.stringify(rec));
ok(getDungeonDailyRemaining() === 500, 'sang ngày mới reset về 500');

// 7. Map cooldown đọc được
setDungeonCooldown('bug_nullpointer');
const map = getDungeonCooldowns();
ok(typeof map === 'object' && 'bug_nullpointer' in map, 'getDungeonCooldowns trả về map');

console.log(`\nKẾT QUẢ: ${pass}/${pass + fail} TESTS PASSED!`);
if (fail > 0) process.exit(1);
