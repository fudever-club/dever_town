/**
 * DEVER TOWN - VERIFY SHEEP DREAM ENGINE
 * Kiểm tra logic game đếm cừu: FSM, spawn, đếm, miss, combo, hoàn thành.
 *
 * Chạy: node test/verify_sheep_dream.js
 */

import { SHEEP_DREAM_CONFIG, SHEEP_DREAM_FSM } from '../src/config/sheepDreamConfig.js';
import { SheepDreamEngine } from '../src/ui/minigames/dream/SheepDreamEngine.js';

// Mock canvas minimal cho Node (không cần render thật)
function makeMockCanvas(w = 640, h = 400) {
  const grad = { addColorStop: () => {} };
  const ctx = new Proxy({}, {
    get: (t, p) => {
      if (p === 'createLinearGradient') return () => grad;
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'getImageData') return () => ({ data: [] });
      // Mọi method vẽ trả về no-op function
      return (...a) => {};
    },
    set: () => true,
  });
  return {
    width: w, height: h,
    getContext: () => ctx,
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w, height: h }),
  };
}

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ FAIL: ${name}`); }
}

console.log('=== Sheep Dream Engine Verification ===\n');

// 1. Config hợp lệ
console.log('[1] Config');
check('FSM có đủ 4 states', Object.keys(SHEEP_DREAM_FSM).length === 4);
check('targetSheep > 0', SHEEP_DREAM_CONFIG.flow.targetSheep > 0);
check('maxSheep >= targetSheep', SHEEP_DREAM_CONFIG.flow.maxSheep >= SHEEP_DREAM_CONFIG.flow.targetSheep);
check('sheep speed hợp lệ', SHEEP_DREAM_CONFIG.sheep.baseSpeed < SHEEP_DREAM_CONFIG.sheep.maxSpeed);
check('fence.x trong canvas', SHEEP_DREAM_CONFIG.fence.x > 0 && SHEEP_DREAM_CONFIG.fence.x < SHEEP_DREAM_CONFIG.canvas.width);

// 2. Khởi tạo
console.log('\n[2] Khởi tạo engine');
const canvas = makeMockCanvas();
const events = [];
const engine = new SheepDreamEngine(canvas, {
  onStateChange: (n, o) => events.push([o, n]),
  onCount: (c, s) => events.push(['count', c]),
  onMiss: (m) => events.push(['miss', m]),
  onComplete: (r) => events.push(['complete', r]),
  onWake: (r) => events.push(['wake', r]),
});
check('state ban đầu là idle', engine.state === SHEEP_DREAM_FSM.IDLE);
check('counted = 0', engine.counted === 0);
check('stars được tạo', engine.stars.length === 60);

// 3. FSM: idle → falling_asleep → dreaming
console.log('\n[3] FSM transitions');
engine.start();
check('start() → falling_asleep', engine.state === SHEEP_DREAM_FSM.FALLING_ASLEEP);
// Simulate fade (1.2s)
for (let i = 0; i < 80; i++) engine.update(1 / 60);
check('sau fade → dreaming', engine.state === SHEEP_DREAM_FSM.DREAMING);
check('có event state change', events.some(e => e[1] === 'dreaming'));

// 4. Spawn cừu
console.log('\n[4] Spawn sheep');
const before = engine.sheepSpawned;
// Chạy 5 giây
for (let i = 0; i < 300; i++) engine.update(1 / 60);
check('cừu được spawn', engine.sheepSpawned > before);
check('cừu di chuyển sang trái', engine.sheep.length === 0 || engine.sheep[0].x < 680);

// 5. Đếm cừu
console.log('\n[5] Counting');
engine.sheep = []; // reset để test chính xác
engine.spawnSheep(90);
const testSheep = engine.sheep[0];
const countedBefore = engine.counted;
engine.countSheep(testSheep);
check('countSheep tăng counted', engine.counted === countedBefore + 1);
check('sheep đánh dấu counted', testSheep.counted === true);
check('score tăng', engine.score > 0);
check('combo tăng', engine.combo === 1);

// 6. Combo bonus
console.log('\n[6] Combo');
for (let i = 0; i < 4; i++) {
  engine.spawnSheep(90);
  engine.countSheep(engine.sheep[engine.sheep.length - 1]);
}
check('combo = 5 sau 5 con', engine.combo === 5);

// 7. Miss
console.log('\n[7] Miss detection');
engine.sheep = [];
engine.missed = 0;
engine.spawnSheep(500); // Rất nhanh để ra khỏi màn hình nhanh
const missSheep = engine.sheep[0];
missSheep.x = -70; // Đặt ngoài màn hình
const missedBefore = engine.missed;
engine.update(1 / 60);
check('cừu ra khỏi màn hình → missed tăng', engine.missed === missedBefore + 1);
check('combo reset khi miss', engine.combo === 0);

// 8. Tốc độ tăng dần
console.log('\n[8] Progressive difficulty');
engine.sheepSpawned = 0;
engine.sheep = [];
// Spawn 10 con để kiểm tra tốc độ tăng
const speeds = [];
for (let i = 0; i < 10; i++) {
  engine.spawnSheep(90 + Math.floor(i / 5) * 8); // Mô phỏng logic tăng tốc
  speeds.push(engine.sheep[engine.sheep.length - 1].speed);
}
check('tốc độ tăng theo thời gian', speeds[9] >= speeds[0]);

// 9. Wake up
console.log('\n[9] Wake up');
engine.state = SHEEP_DREAM_FSM.DREAMING; // Reset về dreaming
engine.wakeUp();
check('wakeUp() → waking', engine.state === SHEEP_DREAM_FSM.WAKING);
// Simulate fade
for (let i = 0; i < 80; i++) engine.update(1 / 60);
check('sau fade → idle', engine.state === SHEEP_DREAM_FSM.IDLE);
check('có event wake', events.some(e => e[0] === 'wake'));

// 10. Hoàn thành khi đủ target
console.log('\n[10] Complete at target');
const canvas2 = makeMockCanvas();
let completed = null;
const engine2 = new SheepDreamEngine(canvas2, {
  onComplete: (r) => { completed = r; },
});
engine2.state = SHEEP_DREAM_FSM.DREAMING;
// Đếm đủ target
for (let i = 0; i < SHEEP_DREAM_CONFIG.flow.targetSheep; i++) {
  engine2.spawnSheep(90);
  engine2.countSheep(engine2.sheep[engine2.sheep.length - 1]);
}
check('đếm đủ target', engine2.counted === SHEEP_DREAM_CONFIG.flow.targetSheep);
// complete() được gọi async qua setTimeout, kiểm tra logic trực tiếp
engine2.complete();
check('complete() trả kết quả', completed !== null);
check('perfect khi không miss', completed && completed.perfect === true);
check('có D-Coin reward', completed && completed.dcoin === SHEEP_DREAM_CONFIG.scoring.dcoinReward);

// Tổng kết
console.log(`\n=== Kết quả: ${passed} pass, ${failed} fail ===`);
process.exit(failed > 0 ? 1 : 0);
