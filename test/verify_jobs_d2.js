/**
 * DEVER TOWN - JOBS PHASE D2 VERIFICATION SUITE
 * Kiểm định Job Câu Cá Hồ Vịt + reskin Barista:
 * 1. Hằng số cân bằng (lương, 3 bậc cá, FSM, vật lý) nằm trong src/config/fishingConfig.js.
 * 2. Lương đúng spec Phase D: fishing common 20 / rare 50, barista 25.
 * 3. jobsConfig.js (sibling sở hữu) chưa tồn tại -> dùng hằng số dự phòng, KHÔNG tạo file.
 * 4. FishingEngine FSM: idle -> casting -> waiting -> hooked -> minigame -> caught | escaped.
 * 5. Bắt cá thành công -> walletManager.earn(wage, 'job_barista'/'job_fishing') đúng số tiền.
 * 6. Quá cửa sổ giật cần / tiến độ về 0 -> escaped -> idle.
 * 7. Barista: mechanics không đổi (engine không import wallet), payout +25 qua wallet
 *    được đấu nối trong SportsArcade.
 * 8. Zone câu cá tồn tại trong main_hall, đúng tile, label không emoji.
 * 9. Không emoji trong file mới; DAY_NIGHT_CYCLE_ENABLED=false giữ nguyên.
 */

import { readFileSync, existsSync } from 'fs';
import { FISHING_CONFIG, FISHING_STATES, FISHING_WAGES, BARISTA_WAGE, rollFishTier } from '../src/config/fishingConfig.js';
import { FishingEngine } from '../src/ui/minigames/sports/FishingEngine.js';
import { MAPS_CONFIG } from '../src/config/maps.js';
import { DAY_NIGHT_CYCLE_ENABLED } from '../src/config/lightingConfig.js';
import { walletManager } from '../src/managers/WalletManager.js';

// Mock localStorage (sau import — WalletManager tự bảo vệ lúc import).
const memoryStore = {};
global.localStorage = {
  getItem: (k) => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { for (const k of Object.keys(memoryStore)) delete memoryStore[k]; },
};
global.window = undefined;

let passed = 0, failed = 0;
const ok = (cond, msg) => {
  if (cond) { passed++; console.log(`[PASS] ${msg}`); }
  else { failed++; console.error(`[FAIL] ${msg}`); process.exitCode = 1; }
};

// Canvas 2D stub: hấp thụ mọi lệnh vẽ (cho phép smoke-test render()).
function makeCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, p) {
      if (p === 'measureText') return () => ({ width: 10 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => grad;
      if (typeof p === 'string') return () => {};
      return undefined;
    },
    set() { return true; },
  });
}
function makeCanvas() {
  return { width: 640, height: 360, getContext: () => makeCtx() };
}
function makeEngine(cb = {}) {
  const states = [];
  const engine = new FishingEngine(makeCanvas(), null, {
    onStateChange: (s) => states.push(s),
    ...cb,
  });
  engine._testStates = states;
  return engine;
}

// ---------- 1+2. Config ----------
ok(FISHING_WAGES.common === 20 && FISHING_WAGES.rare === 50, 'lương fishing dự phòng: common 20 / rare 50');
ok(BARISTA_WAGE === 25, 'lương barista dự phòng: 25');
const tierKeys = Object.keys(FISHING_CONFIG.tiers);
ok(tierKeys.length === 3, `đúng 3 bậc cá (Hưng duyệt 3): ${tierKeys.join(', ')}`);
ok(tierKeys.includes('rophi') && tierKeys.includes('cachep') && tierKeys.includes('cavang'), '3 bậc: rô phi / chép / vàng hiếm');
const cavang = FISHING_CONFIG.tiers.cavang;
ok(cavang.wageKey === 'rare' && cavang.fishSpeedPxS > FISHING_CONFIG.tiers.cachep.fishSpeedPxS
  && cavang.barHPx < FISHING_CONFIG.tiers.cachep.barHPx, 'cá vàng hiếm: nhanh nhất + thanh hẹp nhất');
ok(Object.keys(FISHING_STATES).length === 7, 'FSM đủ 7 trạng thái tường minh');
ok(FISHING_CONFIG.hook.windowSec >= 1 && FISHING_CONFIG.wait.minSec >= 1, 'hằng số thời gian hợp lệ');

// ---------- 3. jobsConfig.js (sibling sở hữu) ----------
import { JOBS_CONFIG } from '../src/config/jobsConfig.js';
ok(existsSync('src/config/jobsConfig.js'), 'jobsConfig.js tồn tại (sibling sở hữu) — chỉ đọc, không tạo/sửa');
ok(JOBS_CONFIG.wages.fishing.common === 20 && JOBS_CONFIG.wages.fishing.rare === 50, 'JOBS_CONFIG.wages.fishing = {common 20, rare 50}');
ok(JOBS_CONFIG.wages.barista === 25, 'JOBS_CONFIG.wages.barista = 25');
ok(FISHING_WAGES.common === JOBS_CONFIG.wages.fishing.common
  && FISHING_WAGES.rare === JOBS_CONFIG.wages.fishing.rare, 'fishingConfig dẫn xuất lương từ JOBS_CONFIG (không duplicate)');
ok(BARISTA_WAGE === JOBS_CONFIG.wages.barista, 'BARISTA_WAGE dẫn xuất từ JOBS_CONFIG');

// ---------- rollFishTier ----------
ok(rollFishTier(() => 0) === 'rophi', 'roll 0 -> rô phi');
ok(rollFishTier(() => 0.5) === 'cachep', 'roll 0.5 -> cá chép');
ok(rollFishTier(() => 0.99) === 'cavang', 'roll 0.99 -> cá vàng hiếm');

// ---------- 4. FSM: cast -> chờ -> cắn câu -> minigame -> bắt được ----------
{
  const eng = makeEngine();
  ok(eng.state === 'idle', 'khởi đầu: idle');
  eng.handleActionDown();
  ok(eng.state === 'casting', 'E (giữ) -> casting');
  eng.update(1.3);
  ok(eng.castPower > 0.9, 'nạp lực đầy sau chargeTimeSec');
  eng.handleActionUp();
  ok(eng.state === 'waiting', 'thả E -> waiting (phao bay)');
  ok(eng.bobber.flying === true, 'phao đang bay');
  eng.update(0.6);
  ok(eng.bobber.flying === false, 'phao chạm mặt nước sau flyTimeSec');
  eng.waitTimer = 0.01;
  eng.update(0.02);
  ok(eng.state === 'hooked', 'hết waitTimer -> hooked ("!" hiện)');
  eng.handleActionDown();
  ok(eng.state === 'minigame', 'giật cần trong cửa sổ -> minigame');
  ok(['rophi', 'cachep', 'cavang'].includes(eng.tierKey), `tier hợp lệ: ${eng.tierKey}`);
  ok(eng.progress === FISHING_CONFIG.minigame.startProgress, 'tiến độ khởi đầu đúng config');

  // Chơi hoàn hảo: giữ cá luôn trong thanh -> bắt được.
  let guard = 0;
  while (eng.state === 'minigame' && guard++ < 600) {
    eng.barY = eng.fishY;
    eng.barVel = 0;
    eng.update(0.05);
  }
  ok(eng.state === 'caught', 'giữ cá trong thanh -> caught');
  ok(eng.lastCatch && [20, 50].includes(eng.lastCatch.wage), `lương đúng bậc: +${eng.lastCatch?.wage}`);
  eng.update(2.7);
  ok(eng.state === 'idle', 'sau caught -> idle');
  ok(eng._testStates.join(',').includes('casting,waiting,hooked,minigame,caught,idle'), 'chuỗi FSM đầy đủ');
}

// ---------- click-drag aim ----------
{
  const eng = makeEngine();
  eng.handlePointerDown(320, 250); // điểm trong mặt hồ
  ok(eng.aiming === true && eng.state === 'casting', 'click trên mặt hồ -> aim-drag');
  eng.handlePointerMove(400, 280);
  eng.handlePointerUp();
  ok(eng.state === 'waiting' && Math.abs(eng.bobber.tx - 400) < 1, 'thả chuột -> quăng đúng điểm aim');
}

// ---------- 6a. Quá cửa sổ giật cần -> escaped ----------
{
  const eng = makeEngine();
  eng.handleActionDown(); eng.handleActionUp();
  eng.update(0.6); // phao bay xong mới tính waitTimer
  eng.waitTimer = 0.01; eng.update(0.02);
  ok(eng.state === 'hooked', 'setup hooked');
  eng.update(FISHING_CONFIG.hook.windowSec + 0.2);
  ok(eng.state === 'escaped', 'quá hook.windowSec không giật -> escaped');
  eng.update(2.0);
  ok(eng.state === 'idle', 'sau escaped -> idle');
}

// ---------- 6b. Tiến độ về 0 trong minigame -> escaped ----------
{
  const eng = makeEngine();
  eng.handleActionDown(); eng.handleActionUp();
  eng.update(0.6); // phao bay xong mới tính waitTimer
  eng.waitTimer = 0.01; eng.update(0.02);
  eng.handleActionDown(); // -> minigame
  ok(eng.state === 'minigame', 'setup minigame');
  eng.tierKey = 'cavang';
  eng.tier = FISHING_CONFIG.tiers.cavang;
  eng.progress = 5;
  eng.fishY = FISHING_CONFIG.minigame.gaugeY + 14;
  eng.barY = FISHING_CONFIG.minigame.gaugeY + FISHING_CONFIG.minigame.gaugeH - 33;
  eng.update(0.5);
  ok(eng.state === 'escaped', 'cá ngoài thanh, tiến độ về 0 -> escaped');
}

// ---------- 5. Wallet integration ----------
{
  localStorage.clear();
  const before = walletManager.getBalance();
  const eng = makeEngine();
  eng.tierKey = 'rophi';
  eng.tier = FISHING_CONFIG.tiers.rophi;
  eng.onCaught();
  ok(eng.lastCatch.wage === 20, 'rô phi -> wage 20');
  ok(walletManager.getBalance() - before === 20, 'ví +20 qua walletManager.earn (job_fishing)');

  const eng2 = makeEngine();
  eng2.tierKey = 'cavang';
  eng2.tier = FISHING_CONFIG.tiers.cavang;
  const before2 = walletManager.getBalance();
  eng2.onCaught();
  ok(eng2.lastCatch.wage === 50, 'cá vàng hiếm -> wage 50 (rare)');
  ok(walletManager.getBalance() - before2 === 50, 'ví +50 cho cá hiếm');
}

// ---------- render smoke (bắt typo đường vẽ) ----------
{
  const eng = makeEngine();
  for (const s of ['idle', 'casting', 'waiting', 'hooked', 'minigame', 'caught', 'escaped']) {
    eng.state = s;
    if (s === 'casting') eng.charging = true;
    if (s === 'minigame') { eng.tierKey = 'cachep'; eng.tier = FISHING_CONFIG.tiers.cachep; }
    if (s === 'caught') eng.lastCatch = { tierName: 'Cá chép', wage: 20 };
    if (s === 'hooked') { eng.bobber.x = 300; eng.bobber.y = 220; }
    try {
      eng.render();
      ok(true, `render() không lỗi ở state ${s}`);
    } catch (e) {
      ok(false, `render() lỗi ở state ${s}: ${e.message}`);
    }
    eng.charging = false;
  }
}

// ---------- 7. Barista: mechanics không đổi, payout đấu nối qua wallet ----------
{
  const engineSrc = readFileSync('src/ui/minigames/sports/BaristaSimulatorEngine.js', 'utf8');
  ok(!engineSrc.includes('walletManager'), 'BaristaSimulatorEngine KHÔNG import wallet (mechanics nguyên vẹn)');
  ok(!engineSrc.includes('job_barista'), 'BaristaSimulatorEngine không chứa logic job');
  const arcadeSrc = readFileSync('src/ui/minigames/SportsArcade.js', 'utf8');
  ok(arcadeSrc.includes("walletManager.earn(BARISTA_WAGE, 'job_barista')"), 'SportsArcade: payout barista qua walletManager.earn(25, job_barista)');
  ok(arcadeSrc.includes("from '../../config/fishingConfig.js'"), 'SportsArcade đọc BARISTA_WAGE từ config (không hardcode)');
  const sportsPatch = readFileSync('src/ui/gameplay/InteractiveModal.sports.js', 'utf8');
  ok(sportsPatch.includes("classList.toggle('sport-barista'"), 'toggle class sport-barista cho reskin');
  const css = readFileSync('src/styles/jobs-cyberglass.css', 'utf8');
  ok(css.includes('#interactive-modal.sport-barista'), 'CSS reskin cyber-glass cho barista tồn tại');
  ok(css.includes('--graal-cyan') || css.includes('#38bdf8'), 'reskin dùng palette graal (cyan #38bdf8)');
}

// ---------- 8. Zone câu cá trong main_hall ----------
{
  const room = MAPS_CONFIG.main_hall;
  const findZone = (list) => (list || []).find((z) => z.id === 'zone_main_fishing');
  const zTop = findZone(room.zones);
  const zFloor = findZone(room.floors?.[0]?.zones);
  ok(!!zTop && !!zFloor, 'zone_main_fishing tồn tại ở cả 2 danh sách zone main_hall');
  for (const z of [zTop, zFloor]) {
    ok(z.type === 'job_fishing', 'zone type = job_fishing');
    // Hybrid painted map: zone dùng tọa độ pixel (430,450) — bờ cỏ cạnh hồ V2
    ok(z.x === 430 && z.y === 450, 'zone tại pixel (430,450) — bờ cỏ cạnh hồ (painted map)');
    const pb = room.paintedBackground || room.floors?.[0]?.paintedBackground;
    ok(!!pb, 'main_hall có paintedBackground');
    const inside = pb.collisionRects.some(r => z.x >= r.x && z.x <= r.x + r.w && z.y >= r.y && z.y <= r.y + r.h);
    ok(!inside, 'zone không nằm trong collision rect painted (đi được)');
  }
  const baseSrc = readFileSync('src/ui/gameplay/InteractiveModal.base.js', 'utf8');
  ok(baseSrc.includes("case 'job_fishing'"), 'InteractiveModal.base dispatch case job_fishing');
  ok(baseSrc.includes('FishingJob'), 'base lazy-load FishingJob');
}

// ---------- 9. House rules ----------
{
  ok(DAY_NIGHT_CYCLE_ENABLED === false, 'DAY_NIGHT_CYCLE_ENABLED=false giữ nguyên');
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
  for (const f of [
    'src/ui/minigames/sports/FishingEngine.js',
    'src/ui/jobs/FishingJob.js',
    'src/config/fishingConfig.js',
    'src/styles/jobs-cyberglass.css',
  ]) {
    const src = readFileSync(f, 'utf8');
    ok(!emojiRe.test(src), `không emoji trong ${f}`);
  }
  const engineSrc = readFileSync('src/ui/minigames/sports/FishingEngine.js', 'utf8');
  ok(engineSrc.includes('Tilt Neon') && engineSrc.includes('Be Vietnam Pro'), 'engine dùng font Tilt Neon / Be Vietnam Pro');
}

console.log(`\n[SUMMARY] ${passed} passed, ${failed} failed`);
