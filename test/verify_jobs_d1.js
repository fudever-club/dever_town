/**
 * DEVER TOWN - JOBS PHASE D1 VERIFICATION SUITE
 * Kiểm định việc làm campus (Cleaner + Delivery + Bug Hunter + infra chung):
 * 1. JOBS_CONFIG.wages: cleaner 15, barista 25, delivery 35, bugHunter 40,
 *    fishing { common: 20, rare: 50 } — khóa sibling giữ nguyên.
 * 2. delivery.timeLimitSec = 60; litter/bins/bounds nằm trong config.
 * 3. JOBS_LIST: 5 việc, id + wageText + description đầy đủ.
 * 4. CleanerJob FSM: idle → active → picking/carrying → sorting → done;
 *    nhặt rác, phân loại đúng +15/wrong-bin không coin.
 * 5. DeliveryJob FSM: idle → pickup → en_route → delivered | failed;
 *    timeout 60s → fail không coin.
 * 6. BugHunterJob FSM: idle → hunting → quiz → caught | escaped;
 *    quiz đúng +40, sai = trốn thoát không coin.
 * 7. Tích hợp ví: mọi khoản thưởng đi qua wallet.earn với source job_*.
 *
 * Scene/toast được mock — không cần DOM hay Phaser thật.
 */
import { JOBS_CONFIG, JOBS_LIST } from '../src/config/jobsConfig.js';
import { CleanerJob, CLEANER_STATES } from '../src/ui/jobs/CleanerJob.js';
import { DeliveryJob, DELIVERY_STATES } from '../src/ui/jobs/DeliveryJob.js';
import { BugHunterJob, BUG_HUNTER_STATES } from '../src/ui/jobs/BugHunterJob.js';
import { WalletManager } from '../src/managers/WalletManager.js';

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

// ------------------------------------------------------------ mocks
function makeSpriteStub() {
  const s = {
    x: 0, y: 0, destroyed: false,
    destroy() { this.destroyed = true; },
    setDepth() { return this; },
    setVisible() { return this; },
    setPosition(x, y) { this.x = x; this.y = y; return this; },
    setScale() { return this; },
    setAlpha() { return this; },
    setFlipX() { return this; },
    setAngle() { return this; },
    setText() { return this; },
  };
  return s;
}

function makeScene(roomId) {
  const handlers = {};
  return {
    currentRoomId: roomId,
    player: { x: 400, y: 350 },
    interactionManager: { canInteract: () => true },
    spawned: [],
    input: {
      keyboard: {
        on(ev, fn) { handlers[ev] = fn; },
        off(ev) { delete handlers[ev]; },
        handlers,
      },
    },
    add: {
      image(x, y) { const s = makeSpriteStub(); s.x = x; s.y = y; return s; },
      sprite(x, y) { const s = makeSpriteStub(); s.x = x; s.y = y; return s; },
      text() { const s = makeSpriteStub(); return s; },
    },
    tweens: { add() {} },
  };
}

function pressE(scene) {
  const fn = scene.input.keyboard.handlers['keydown-E'];
  if (fn) fn();
}

/** Nhấn E bỏ qua debounce 200ms (test chạy đồng bộ). */
function pressEJob(job, scene) {
  job._lastEAt = 0;
  pressE(scene);
}

// ------------------------------------------------------------ 1+2+3 config
assert(JOBS_CONFIG.wages.cleaner === 15, 'wage cleaner = 15');
assert(JOBS_CONFIG.wages.barista === 25, 'wage barista = 25 (khóa sibling giữ nguyên)');
assert(JOBS_CONFIG.wages.delivery === 35, 'wage delivery = 35');
assert(JOBS_CONFIG.wages.bugHunter === 40, 'wage bugHunter = 40');
assert(JOBS_CONFIG.wages.fishing.common === 20 && JOBS_CONFIG.wages.fishing.rare === 50,
  'wages.fishing = { common: 20, rare: 50 } (khóa sibling giữ nguyên)');
assert(JOBS_CONFIG.delivery.timeLimitSec === 60, 'delivery timeLimitSec = 60');
assert(JOBS_CONFIG.cleaner.litterCount === 8, 'cleaner litterCount = 8');
assert(JOBS_CONFIG.cleaner.litterTiles.length === JOBS_CONFIG.cleaner.litterCount,
  'số ô rác = litterCount');
assert(JOBS_CONFIG.cleaner.litterTiles.every((t) => t.tileX >= 8),
  'litter né zone câu cá sibling tại (6,17): mọi ô rác có tileX >= 8');
assert(Object.keys(JOBS_CONFIG.cleaner.bins).length === 2, 'cleaner có 2 thùng phân loại');
assert(JOBS_CONFIG.bugHunter.bugCount === 4, 'bugHunter bugCount = 4');
assert(JOBS_CONFIG.interactRadius === 56, 'interactRadius = 56');
assert(JOBS_LIST.length === 5, 'JOBS_LIST có 5 việc');
assert(JOBS_LIST.every((j) => j.id && j.name && j.wageText && j.description),
  'mọi job trong JOBS_LIST có id/name/wageText/description');
assert(JOBS_LIST.map((j) => j.id).join(',') === 'cleaner,barista,delivery,bugHunter,fishing',
  'thứ tự 5 việc đúng masterplan');

// ------------------------------------------------------------ 4 CleanerJob
{
  const scene = makeScene('main_hall');
  const wallet = new WalletManager();
  const toasts = [];
  const job = new CleanerJob({ scene, wallet, toast: { toast: (m) => toasts.push(m) }, setStatus: () => {} });

  assert(job.getState() === CLEANER_STATES.IDLE, 'cleaner khởi đầu IDLE');
  assert(job.start() === true, 'cleaner start() ở main_hall trả về true');
  assert(job.getState() === CLEANER_STATES.ACTIVE, 'cleaner sau start: ACTIVE');
  assert(job.getRemainingCount() === JOBS_CONFIG.cleaner.litterCount, 'spawn đủ 8 rác');

  // Nhặt rác đầu tiên (đứng sát nó).
  const first = job.litter[0];
  scene.player.x = first.x; scene.player.y = first.y;
  pressEJob(job, scene);
  assert(job.getState() === CLEANER_STATES.CARRYING, 'sau E nhặt: CARRYING');
  assert(job.getBagCount() === 1, 'túi rác = 1');
  assert(job.getRemainingCount() === 7, 'còn 7 rác trên sân');
  const pickedKind = job.bag[0];
  const rightBinKind = JOBS_CONFIG.cleaner.kindToBin[pickedKind];
  const wrongBin = job.bins.find((b) => b.binKind !== rightBinKind);
  const rightBin = job.bins.find((b) => b.binKind === rightBinKind);

  // Phân loại SAI thùng → không coin.
  const balBefore = wallet.getBalance ? wallet.getBalance() : wallet.balance;
  scene.player.x = wrongBin.x; scene.player.y = wrongBin.y;
  pressEJob(job, scene);
  assert(wallet.balance === balBefore, 'thùng sai: không cộng coin');
  assert(job.getBagCount() === 0, 'túi rỗng sau khi phân loại');

  // Nhặt 6/7 rác còn lại (để lại 1 món để ca chưa kết thúc giữa chừng).
  while (job.litter.length > 1) {
    const l = job.litter[0];
    scene.player.x = l.x; scene.player.y = l.y;
    pressEJob(job, scene);
  }
  assert(job.getBagCount() === 6, 'đã nhặt 6 rác vào túi, còn 1 trên sân');
  // Phân loại ĐÚNG từng nhóm thùng (2 lần E).
  const byBin = { inorganic: [], organic: [] };
  for (const kind of job.bag) byBin[JOBS_CONFIG.cleaner.kindToBin[kind]].push(kind);
  job.bag = [...byBin.inorganic];
  const binI = job.bins.find((b) => b.binKind === 'inorganic');
  scene.player.x = binI.x; scene.player.y = binI.y;
  pressEJob(job, scene);
  assert(job.getState() === CLEANER_STATES.CARRYING, 'còn rác trên sân: vẫn CARRYING sau sort');
  job.bag = [...byBin.organic];
  const binO = job.bins.find((b) => b.binKind === 'organic');
  scene.player.x = binO.x; scene.player.y = binO.y;
  pressEJob(job, scene);
  // Nhặt + phân loại món cuối cùng.
  const last = job.litter[0];
  scene.player.x = last.x; scene.player.y = last.y;
  pressEJob(job, scene);
  const lastBinKind = JOBS_CONFIG.cleaner.kindToBin[last.kind];
  const lastBin = job.bins.find((b) => b.binKind === lastBinKind);
  scene.player.x = lastBin.x; scene.player.y = lastBin.y;
  pressEJob(job, scene);
  const correctTotal = byBin.inorganic.length + byBin.organic.length + 1;
  const expectBal = balBefore + correctTotal * JOBS_CONFIG.wages.cleaner;
  assert(wallet.balance === expectBal, `phân loại đúng ${correctTotal} món: +${correctTotal * 15} coin (ví=${wallet.balance})`);
  assert(job.getState() === CLEANER_STATES.IDLE, 'xong ca: stop() đưa về IDLE (done nội bộ)');
  assert(toasts.some((t) => /Hoàn thành ca lao công/.test(t)), 'toast hoàn thành ca lao công');
}

// Sai phòng → không start.
{
  const scene = makeScene('canteen_cafe');
  const toasts = [];
  const job = new CleanerJob({ scene, wallet: new WalletManager(), toast: { toast: (m) => toasts.push(m) } });
  assert(job.start() === false, 'cleaner start() ngoài main_hall trả về false');
  assert(job.getState() === CLEANER_STATES.IDLE, 'cleaner vẫn IDLE khi sai phòng');
}

// ------------------------------------------------------------ 5 DeliveryJob
{
  // Sai phòng.
  const scene0 = makeScene('main_hall');
  const job0 = new DeliveryJob({ scene: scene0, wallet: new WalletManager(), toast: { toast: () => {} } });
  assert(job0.start() === false, 'delivery start() ngoài canteen trả về false');

  // Luồng timeout.
  const scene = makeScene('canteen_cafe');
  const wallet = new WalletManager();
  const toasts = [];
  const job = new DeliveryJob({ scene, wallet, toast: { toast: (m) => toasts.push(m) }, setStatus: () => {} });
  assert(job.start() === true, 'delivery start() ở canteen: true');
  assert(job.getState() === DELIVERY_STATES.PICKUP, 'delivery sau start: PICKUP');
  const pp = { x: JOBS_CONFIG.delivery.pickup.tileX * 32 + 16, y: JOBS_CONFIG.delivery.pickup.tileY * 32 + 16 };
  scene.player.x = pp.x; scene.player.y = pp.y;
  pressEJob(job, scene);
  assert(job.getState() === DELIVERY_STATES.EN_ROUTE, 'sau E nhận đơn: EN_ROUTE');
  assert(job.getTimeLeft() === 60, 'đồng hồ = 60s khi nhận đơn');
  job.update(0, 61000);
  assert(job.getState() === DELIVERY_STATES.IDLE, 'hết 60s: FAILED → stop về IDLE');
  assert(wallet.balance === 0, 'timeout: không cộng coin');
  assert(toasts.some((t) => /Hết giờ/.test(t)), 'toast hết giờ giao hàng');

  // Luồng giao thành công.
  const scene2 = makeScene('canteen_cafe');
  const wallet2 = new WalletManager();
  const toasts2 = [];
  const job2 = new DeliveryJob({ scene: scene2, wallet: wallet2, toast: { toast: (m) => toasts2.push(m) }, setStatus: () => {} });
  job2.start();
  scene2.player.x = pp.x; scene2.player.y = pp.y;
  pressEJob(job2, scene2);
  // "Chạy" đến KTX: đổi phòng + đứng tại điểm giao.
  scene2.currentRoomId = JOBS_CONFIG.delivery.target.roomId;
  const tp = { x: JOBS_CONFIG.delivery.target.tileX * 32 + 16, y: JOBS_CONFIG.delivery.target.tileY * 32 + 16 };
  scene2.player.x = tp.x; scene2.player.y = tp.y;
  job2.update(0, 10000); // 10s sau khi nhận
  assert(wallet2.balance === JOBS_CONFIG.wages.delivery, `giao đúng giờ: +35 D-Coin (ví=${wallet2.balance})`);
  assert(toasts2.some((t) => /thành công/.test(t)), 'toast giao hàng thành công');
}

// ------------------------------------------------------------ 6 BugHunterJob
{
  const scene = makeScene('main_hall');
  const wallet = new WalletManager();
  const toasts = [];
  const job = new BugHunterJob({ scene, wallet, toast: { toast: (m) => toasts.push(m) }, setStatus: () => {} });
  assert(job.getState() === BUG_HUNTER_STATES.IDLE, 'bug hunter khởi đầu IDLE');
  assert(job.start() === true, 'bug hunter start() ở main_hall: true');
  assert(job.getState() === BUG_HUNTER_STATES.HUNTING, 'sau start: HUNTING');
  assert(job.getBugCount() === JOBS_CONFIG.bugHunter.bugCount, 'spawn đủ 4 bọ');

  // Vợt 1 con (không DOM → _openQuiz auto-correct trong test).
  const bug = job.bugs[0];
  scene.player.x = bug.x; scene.player.y = bug.y;
  pressEJob(job, scene);
  assert(job.getCaughtCount() === 1, 'quiz đúng: caught = 1');
  assert(wallet.balance === JOBS_CONFIG.wages.bugHunter, `quiz đúng: +40 D-Coin (ví=${wallet.balance})`);
  assert(job.getState() === BUG_HUNTER_STATES.HUNTING, 'sau bắt đúng: về HUNTING');

  // Trả lời sai → bọ trốn, không coin, sinh lại 1 con.
  // (Gọi _answerQuiz(false) trực tiếp — _swingAt trong môi trường no-DOM
  // tự auto-correct nên không dùng để mô phỏng trả lời sai. Mô phỏng việc
  // _swingAt đã gỡ 1 con bọ khỏi sân trước khi mở quiz.)
  const bugsBefore = job.getBugCount();
  const caughtBefore = job.getCaughtCount();
  job.bugs.shift(); // _swingAt gỡ bọ khỏi sân
  job._answerQuiz(false);
  assert(job.getCaughtCount() === caughtBefore, 'trả lời sai: không tăng số bọ đã bắt');
  assert(job.getState() === BUG_HUNTER_STATES.HUNTING, 'sau trả lời sai: về HUNTING');
  assert(wallet.balance === JOBS_CONFIG.wages.bugHunter, 'trả lời sai: không cộng thêm coin');
  assert(job.getBugCount() === bugsBefore, 'bọ trốn → sinh lại 1 con, số bọ giữ nguyên');
  assert(toasts.some((t) => /trốn thoát/.test(t)), 'toast bọ trốn thoát');

  // Wander update không crash và giữ bọ trong bounds.
  job.update(0, 5000);
  const b = JOBS_CONFIG.bugHunter.bounds;
  assert(job.bugs.every((x) => x.x >= b.x0 && x.x <= b.x1 && x.y >= b.y0 && x.y <= b.y1),
    'wander 5s: bọ vẫn trong bounds vườn hoa');
}

// Sai phòng.
{
  const scene = makeScene('dorm_room');
  const job = new BugHunterJob({ scene, wallet: new WalletManager(), toast: { toast: () => {} } });
  assert(job.start() === false, 'bug hunter start() ngoài main_hall: false');
}

// ------------------------------------------------------------ tổng kết
console.log(`\n[SUMMARY] ${passedTests}/${totalTests} assertions passed.`);
if (process.exitCode) {
  console.error('[SUMMARY] CÓ TEST FAIL.');
} else {
  console.log('[SUMMARY] TẤT CẢ PASS.');
}
