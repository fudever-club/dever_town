/**
 * DEVER TOWN - CLAN + FORT TEST EVENT VERIFICATION SUITE (Phase E)
 * Kiểm định:
 *  1. Config: 4 bang chính thức (định danh, màu hex, base room tồn tại trong
 *     maps.js), FORT_EVENT_CONFIG (rect pháo đài nằm trong sports_complex,
 *     quỹ thưởng 300, FSM 5 states).
 *  2. ClanManager: join/leave/idempotent, clanId sai ném lỗi, roster local,
 *     persistence qua localStorage, sự kiện onChange.
 *  3. FortEventManager: FSM idle→countdown→active→ended→payout, scoring
 *     king-of-the-hill theo presence, payout participation-based (tổng đúng
 *     bằng prizePool, lọc ngưỡng minParticipationSec), computePayoutShares
 *     thuần túy, chuyển trạng thái sai ném lỗi.
 */

import { CLANS, CLAN_IDS, getClanById, isValidClanId } from '../src/config/clansConfig.js';
import { FORT_EVENT_CONFIG, FORT_EVENT_STATES } from '../src/config/combatConfig.js';
import { MAPS_CONFIG } from '../src/config/maps.js';
import { ClanManager, clanManager } from '../src/managers/ClanManager.js';
import { FortEventManager, fortEventManager } from '../src/managers/FortEventManager.js';
import { walletManager } from '../src/managers/WalletManager.js';

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

// Mock localStorage trước khi các singleton đọc (theo mẫu verify_wallet.js).
const memoryStore = {};
global.localStorage = {
  getItem: (k) => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; }
};

console.log('--- BẮT ĐẦU KIỂM THỬ CLANS + FORT TEST EVENTS (Phase E) ---');

// ==================================================================
// 1. CONFIG BANG HỘI
// ==================================================================
console.log('\n[1] Config bang hội');
assert(CLAN_IDS.length === 4, 'Có đúng 4 bang chính thức');
assert(new Set(CLAN_IDS).size === 4, 'ID 4 bang là duy nhất');
assert(CLAN_IDS.includes('web_builders') && CLAN_IDS.includes('ai_core')
  && CLAN_IDS.includes('mobile_masters') && CLAN_IDS.includes('game_devs'),
  '4 bang: web_builders, ai_core, mobile_masters, game_devs');

const requiredFields = ['id', 'name', 'shortName', 'color', 'baseRoomId', 'baseName', 'description'];
for (const clan of CLANS) {
  const okFields = requiredFields.every((f) => typeof clan[f] === 'string' && clan[f].length > 0);
  assert(okFields, `Bang ${clan.id} có đủ trường bắt buộc`);
  assert(/^#[0-9a-fA-F]{6}$/.test(clan.color), `Màu bang ${clan.id} là hex hợp lệ (${clan.color})`);
  assert(MAPS_CONFIG[clan.baseRoomId], `Base room của ${clan.id} tồn tại trong maps.js (${clan.baseRoomId})`);
}
assert(getClanById('ai_core').name === 'AI Core', 'getClanById(ai_core) → AI Core');
assert(getClanById('khong-ton-tai') === null, 'getClanById sai → null');
assert(isValidClanId('game_devs') === true, 'isValidClanId(game_devs) = true');
assert(isValidClanId('hackers') === false, 'isValidClanId(hackers) = false');

// ==================================================================
// 2. CONFIG SỰ KIỆN PHÁO ĐÀI
// ==================================================================
console.log('\n[2] Config sự kiện pháo đài');
const states = Object.values(FORT_EVENT_STATES);
assert(states.length === 5, 'FSM có 5 states');
assert(['idle', 'countdown', 'active', 'ended', 'payout'].every((s) => states.includes(s)),
  'FSM: idle → countdown → active → ended → payout');

const fort = FORT_EVENT_CONFIG.fort;
assert(fort.roomId === 'sports_complex', 'Pháo đài test đặt tại sports_complex');
assert(fort.zone === 'challenge', 'Rect pháo đài được đánh dấu zone challenge trong config');
const room = MAPS_CONFIG[fort.roomId];
const roomW = room.layout[0].length * 32;
const roomH = room.layout.length * 32;
assert(fort.x >= 0 && fort.y >= 0 && fort.x + fort.w <= roomW && fort.y + fort.h <= roomH,
  `Rect pháo đài (${fort.x},${fort.y},${fort.w}x${fort.h}) nằm trong phòng ${roomW}x${roomH}`);
assert(FORT_EVENT_CONFIG.prizePool === 300, 'Quỹ thưởng 300 D-Coin');
assert(FORT_EVENT_CONFIG.durationSec === 180, 'Test event dài 180s (3 phút)');
assert(FORT_EVENT_CONFIG.minParticipationSec === 30, 'Ngưỡng tham gia 30s');
assert(FORT_EVENT_CONFIG.pointsPerTick > 0, 'pointsPerTick > 0');

// ==================================================================
// 3. CLAN MANAGER
// ==================================================================
console.log('\n[3] ClanManager');
localStorage.clear();
let cm = new ClanManager();
assert(cm.getMyClan() === null, 'Chưa join → getMyClan() = null');
assert(cm.getMyClanId() === null, 'Chưa join → getMyClanId() = null');
assert(cm.getMembers('web_builders').length === 0, 'Roster ban đầu rỗng');

cm.setPlayerName('TesterE');
cm.joinClan('web_builders');
assert(cm.getMyClanId() === 'web_builders', 'joinClan(web_builders) → getMyClanId đúng');
assert(cm.getMyClan().name === 'Web Builders', 'getMyClan() trả về định nghĩa đầy đủ');
assert(cm.getMemberCount('web_builders') === 1, 'Roster web_builders có 1 thành viên');
assert(cm.getMembers('web_builders')[0].name === 'TesterE', 'Roster ghi đúng tên người chơi');
assert(localStorage.getItem('devertown_clan_membership_v1') !== null, 'Membership lưu vào localStorage');

// Idempotent: join lại đúng bang không trùng roster, không phát sự kiện thừa.
let joinEvents = 0;
cm.onChange((ev) => { if (ev.type === 'join') joinEvents++; });
cm.joinClan('web_builders');
assert(cm.getMemberCount('web_builders') === 1, 'Join lại bang hiện tại: roster không trùng');
assert(joinEvents === 0, 'Join lại bang hiện tại: không phát sự kiện join thừa');

assertThrows(() => cm.joinClan('hackers'), 'joinClan clanId sai → ném lỗi');
assertThrows(() => cm.getMembers('hackers'), 'getMembers clanId sai → ném lỗi');

// Chuyển bang: rời bang cũ (roster + sự kiện leave), vào bang mới.
const events = [];
cm.onChange((ev) => events.push(ev.type));
cm.joinClan('ai_core');
assert(cm.getMyClanId() === 'ai_core', 'Chuyển sang ai_core thành công');
assert(cm.getMemberCount('web_builders') === 0, 'Rời web_builders → roster cũ trống');
assert(cm.getMemberCount('ai_core') === 1, 'Roster ai_core có 1 thành viên');
assert(events.join(',') === 'leave,join', 'Chuyển bang phát leave rồi join theo thứ tự');

cm.leaveClan();
assert(cm.getMyClan() === null, 'leaveClan → không còn bang');
assert(cm.getMemberCount('ai_core') === 0, 'leaveClan → roster trống');
assert(events[events.length - 1] === 'leave', 'leaveClan phát sự kiện leave');
const noOpLeave = cm.leaveClan();
assert(noOpLeave === null, 'leaveClan khi chưa có bang → no-op, trả về null');

// offChange hủy listener.
let calls = 0;
const listener = () => { calls++; };
cm.onChange(listener);
cm.offChange(listener);
cm.joinClan('game_devs');
assert(calls === 0, 'offChange hủy listener cụ thể');

// Persistence: instance mới đọc lại membership + roster.
const cm2 = new ClanManager();
assert(cm2.getMyClanId() === 'game_devs', 'Instance mới đọc lại membership từ localStorage');
assert(cm2.getMemberCount('game_devs') === 1, 'Instance mới đọc lại roster từ localStorage');

// Dữ liệu hỏng → fallback an toàn.
localStorage.setItem('devertown_clan_membership_v1', 'khong-phai-json');
const cmCorrupt = new ClanManager();
assert(cmCorrupt.getMyClan() === null, 'Membership hỏng → fallback null');
localStorage.setItem('devertown_clan_membership_v1', JSON.stringify({ clanId: 'hackers' }));
const cmBadId = new ClanManager();
assert(cmBadId.getMyClan() === null, 'Membership clanId lạ → fallback null');

assert(clanManager instanceof ClanManager, 'Singleton clanManager dùng chung toàn game');

// ==================================================================
// 4. FORT EVENT MANAGER — FSM
// ==================================================================
console.log('\n[4] FortEventManager — FSM');
const testCfg = {
  countdownSec: 2, durationSec: 6, tickSec: 1, pointsPerTick: 10,
  prizePool: 300, minParticipationSec: 2, testBotCount: 0, botWanderSpeed: 60,
};
let fem = new FortEventManager({ config: testCfg });
assert(fem.getState() === 'idle', 'State khởi đầu là idle');
assert(fortEventManager instanceof FortEventManager, 'Singleton fortEventManager dùng chung');

const seenStates = [];
fem.onChange((ev) => { if (ev.type === 'state') seenStates.push(ev.state); });
fem.startTestEvent();
assert(fem.getState() === 'countdown', 'startTestEvent: idle → countdown');
assertThrows(() => fem.startTestEvent(), 'startTestEvent khi đang countdown → ném lỗi');
assertThrows(() => fem.startTestEvent({ countdownSec: -1 }), 'countdownSec âm → ném lỗi');
assertThrows(() => new FortEventManager({ config: testCfg }).startTestEvent({ durationSec: 0 }),
  'durationSec = 0 → ném lỗi');

fem.update(1000);
assert(fem.getState() === 'countdown', 'Sau 1s countdown vẫn countdown');
fem.update(1000);
assert(fem.getState() === 'active', 'Hết countdown → active');
assert(seenStates.join(',') === 'countdown,active', 'FSM phát state theo thứ tự countdown → active');

assert(fem.cancelEvent() === true, 'cancelEvent từ active → true');
assert(fem.getState() === 'idle', 'cancelEvent → idle');
assert(fem.cancelEvent() === false, 'cancelEvent từ idle → false (no-op)');

// ==================================================================
// 5. SCORING KING-OF-THE-HILL (presence-based)
// ==================================================================
console.log('\n[5] Scoring king-of-the-hill');
localStorage.clear();
clanManager.setPlayerName('FortTester');
clanManager.joinClan('web_builders');

fem = new FortEventManager({ config: testCfg });
const f = FORT_EVENT_CONFIG.fort;
const cx = f.x + f.w / 2;
const cy = f.y + f.h / 2;
fem.setLocalPlayer({ id: 'local', name: 'FortTester' });
fem.setPositionProvider(() => ({ x: cx, y: cy, roomId: f.roomId }));
fem.startTestEvent();
fem.update(2000); // hết countdown
assert(fem.getState() === 'active', 'Event active sau countdown');

fem.update(1000); // 1 tick: local (web_builders) trong fort
let scores = fem.getScores();
assert(scores.web_builders === 10, 'Bang có thành viên trong fort được +10 điểm/tick');
assert(fem.getLeader() === 'web_builders', 'Leader = web_builders');

// Remote presence: 2 thành viên ai_core trong fort → ai_core dẫn.
fem.registerRemotePresence('r1', { name: 'Remote1', clanId: 'ai_core', x: cx, y: cy, roomId: f.roomId });
fem.registerRemotePresence('r2', { name: 'Remote2', clanId: 'ai_core', x: cx, y: cy, roomId: f.roomId });
fem.update(1000);
assert(fem.getLeader() === 'ai_core', 'ai_core đông hơn trong fort → giành leader');
scores = fem.getScores();
assert(scores.ai_core === 10, 'ai_core được cộng điểm khi dẫn đầu');

// Người không ở đúng phòng → không tính.
fem.registerRemotePresence('r3', { name: 'Remote3', clanId: 'mobile_masters', x: cx, y: cy, roomId: 'main_hall' });
fem.update(1000);
scores = fem.getScores();
assert(!scores.mobile_masters, 'Presence sai phòng không được tính điểm');

// Người không có clan → không tính.
fem.registerRemotePresence('r4', { name: 'NoClan', clanId: null, x: cx, y: cy, roomId: f.roomId });
fem.update(1000);
const snap = fem.getSnapshot();
assert(snap.participantCount === 3, 'Chỉ 3 participant có clan (local + r1 + r2)');

assert(fem.isInFort(cx, cy, f.roomId) === true, 'isInFort: điểm giữa fort → true');
assert(fem.isInFort(0, 0, f.roomId) === false, 'isInFort: góc phòng → false');
assert(fem.isInFort(cx, cy, 'main_hall') === false, 'isInFort: sai phòng → false');

// ==================================================================
// 6. PAYOUT PARTICIPATION-BASED (luật Graal 2026)
// ==================================================================
console.log('\n[6] Payout participation-based');
// computePayoutShares thuần túy:
let shares = FortEventManager.computePayoutShares(
  [{ id: 'a', timeSec: 60 }, { id: 'b', timeSec: 30 }, { id: 'c', timeSec: 30 }], 300);
assert(shares.a === 150 && shares.b === 75 && shares.c === 75,
  'Chia tỉ lệ thời gian: 60/30/30 → 150/75/75');

shares = FortEventManager.computePayoutShares(
  [{ id: 'a', timeSec: 1 }, { id: 'b', timeSec: 1 }, { id: 'c', timeSec: 1 }], 100);
const sum100 = shares.a + shares.b + shares.c;
assert(sum100 === 100, `Largest remainder: tổng chia đúng bằng pool (100), được ${sum100}`);

shares = FortEventManager.computePayoutShares([], 300);
assert(Object.keys(shares).length === 0, 'Không participant → không chia');
shares = FortEventManager.computePayoutShares([{ id: 'a', timeSec: 0 }], 300);
assert(Object.keys(shares).length === 0, 'Tổng thời gian 0 → không chia');

// Full event: local 6s trong fort (>= ngưỡng 2s) → nhận thưởng vào ví.
localStorage.clear();
const walletBefore = walletManager.getBalance();
clanManager.setPlayerName('FortTester');
clanManager.joinClan('game_devs');
fem = new FortEventManager({ config: testCfg });
fem.setLocalPlayer({ id: 'local', name: 'FortTester' });
fem.setPositionProvider(() => ({ x: cx, y: cy, roomId: f.roomId }));
let payoutReport = null;
fem.onChange((ev) => { if (ev.type === 'payout') payoutReport = ev.report; });
fem.startTestEvent();
fem.update(2000); // countdown
for (let i = 0; i < 6; i++) fem.update(1000); // active 6s → ended → payout
assert(fem.getState() === 'payout', 'Hết duration: active → ended → payout');
assert(payoutReport !== null, 'Phát sự kiện payout kèm report');
assert(payoutReport.distributed === 300, `Tổng thưởng phân phối đúng 300 (được ${payoutReport.distributed})`);
assert(payoutReport.prizePool === 300, 'Report ghi đúng prizePool');
const localRow = payoutReport.participants.find((p) => p.isLocal);
assert(localRow && localRow.amount === 300, 'Một mình tham gia → nhận trọn 300 (không winner-takes-all vì chỉ có 1 người)');
assert(walletManager.getBalance() === walletBefore + 300,
  `Ví local được cộng 300 D-Coin qua walletManager.earn (số dư ${walletManager.getBalance()})`);
assert(payoutReport.leaderClanId === 'game_devs', 'Report ghi bang dẫn điểm (danh dự)');

// Ngưỡng minParticipationSec: participant dưới ngưỡng bị loại.
fem = new FortEventManager({
  config: { ...testCfg, durationSec: 4, minParticipationSec: 30 },
});
fem.setLocalPlayer({ id: 'local', name: 'FortTester' });
fem.setPositionProvider(() => ({ x: cx, y: cy, roomId: f.roomId }));
let report2 = null;
fem.onChange((ev) => { if (ev.type === 'payout') report2 = ev.report; });
fem.startTestEvent();
fem.update(2000);
for (let i = 0; i < 4; i++) fem.update(1000);
assert(report2.participantCount === 0, 'Dưới ngưỡng 30s → 0 participant đủ điều kiện');
assert(report2.distributed === 0, 'Không ai đủ ngưỡng → quỹ giữ lại, distributed = 0');

// PAYOUT → start lại được (chu kỳ test tiếp theo).
fem.startTestEvent();
assert(fem.getState() === 'countdown', 'Từ payout có thể start test event mới');

// ==================================================================
// 7. TEST BOTS
// ==================================================================
console.log('\n[7] Test bots');
fem = new FortEventManager({ config: { ...testCfg, testBotCount: 4 } });
fem.startTestEvent();
const bots = fem.getTestBots();
assert(bots.length === 4, 'seedTestBots(4) tạo 4 bot');
assert(bots.every((b) => b.isBot), 'Bot gắn nhãn isBot');
assert(new Set(bots.map((b) => b.clanId)).size === 4, 'Bot chia đều 4 bang (round-robin)');
const before = bots.map((b) => `${b.x},${b.y}`).join('|');
fem.update(2000); // countdown + wander
fem.update(1000);
const after = fem.getTestBots().map((b) => `${b.x},${b.y}`).join('|');
assert(before !== after, 'Bot di chuyển trong update (wander)');
fem.cancelEvent();
assert(fem.getTestBots().length === 0, 'cancelEvent dọn bot');

clanManager.leaveClan();
localStorage.clear();

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);
