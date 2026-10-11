/**
 * verify_pose_sync.js — kiểm tra đồng bộ tư thế ngồi/đứng multiplayer.
 *
 * Luồng: Player.setPose() -> emit 'playerActivity' {activity, pose}
 *      -> server/socketHandler.js validate + broadcast {id, activity, pose}
 *      -> SocketManager 'playerActivity' -> WorldScene.handleRemoteActivity
 *      -> RemotePlayer.setPose() -> animation ngồi (hoặc fallback idle)
 *
 * Gồm: (A) kiểm tra static các hook, (B) runtime test handler server,
 * (C) runtime test logic setPose/_getSitAnimKey + update() của RemotePlayer
 *     (load class thật, stub Phaser vì Phaser cần browser).
 */
import { readFileSync } from 'fs';
import { EventEmitter } from 'events';
import { Script, createContext } from 'vm';

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', msg); }
};

// ---------------------------------------------------------------- A. Static
const P = readFileSync('src/entities/Player.js', 'utf8');
const RP = readFileSync('src/entities/RemotePlayer.js', 'utf8');
const WS = readFileSync('src/scenes/WorldScene.js', 'utf8');
const SH = readFileSync('server/socket/socketHandler.js', 'utf8');

// 1. Player: có setPose, emit playerActivity kèm pose; setActivity cũng gửi pose
ok(P.includes('setPose(pose)'), 'Player có setPose(pose)');
ok(P.includes("sm.socket.emit('playerActivity', { activity: this.activity ?? null, pose: this.pose })"),
  'Player.setPose emit playerActivity kèm pose');
ok(P.includes("sm.socket.emit('playerActivity', { activity, pose: this.pose || POSE.STAND })"),
  'Player.setActivity emit kèm pose hiện tại');
ok(/sit\(type\)\s*\{[\s\S]{0,600}this\.setPose\(targetPose\)/.test(P),
  'sit() gọi setPose -> emit pose');
ok(/standUp\(\)\s*\{[\s\S]{0,600}this\.setPose\(POSE\.STAND\)/.test(P),
  'standUp() gọi setPose -> emit pose');
ok(P.includes('canTransitionPose(this.pose, targetPose)'), 'sit() giữ nguyên FSM validation');

// 2. Server: validate pose, broadcast kèm pose
ok(SH.includes("socket.on('playerActivity', ({ activity, pose })"), 'server nhận pose từ playerActivity');
ok(SH.includes('validPoses'), 'server whitelist pose');
ok(SH.includes('pose: pose || POSE.STAND'), 'server broadcast pose (default stand)');

// 3. WorldScene: route pose tới RemotePlayer
ok(WS.includes('handleRemoteActivity({ id, activity, pose })'), 'handleRemoteActivity nhận pose');
ok(WS.includes('remote.setPose(pose ||'), 'handleRemoteActivity gọi remote.setPose');

// 4. RemotePlayer: setPose + fallback khi thiếu sit frames
ok(RP.includes('setPose(pose)'), 'RemotePlayer có setPose');
ok(RP.includes('_getSitAnimKey()'), 'RemotePlayer có _getSitAnimKey');
ok(RP.includes('isSitPose(this.pose)'), 'dùng isSitPose từ poseConfig');
ok(RP.includes('const sitAnimKey = this._getSitAnimKey();'), 'update() ưu tiên sit anim');
ok(RP.includes('this.pose = POSE.STAND;'), 'constructor khởi tạo pose = stand');

// ------------------------------------------------- B. Runtime: server handler
const { setupSocketHandler } = await import('../server/socket/socketHandler.js');
const { playerManager } = await import('../server/socket/playerManager.js');
const { POSE } = await import('../src/config/poseConfig.js');

const broadcasts = [];
const ioHandlers = {};
const mockIo = {
  use: () => {},
  on: (ev, cb) => { ioHandlers[ev] = cb; },
  to: (roomId) => ({ emit: (ev, data) => broadcasts.push({ roomId, ev, data }) }),
};
setupSocketHandler(mockIo);

const sock = new EventEmitter();
sock.id = 'sock_pose_1';
sock.handshake = { auth: {}, headers: {} };
ioHandlers['connection'](sock);
const activityHandler = sock.listeners('playerActivity')[0];
ok(typeof activityHandler === 'function', 'server đăng ký handler playerActivity');

playerManager.addPlayer('sock_pose_1', { roomId: 'main_hall', name: 'Tester' });

// pose hợp lệ -> broadcast kèm pose
broadcasts.length = 0;
activityHandler({ activity: 'dreaming', pose: POSE.SIT_UPRIGHT });
ok(broadcasts.length === 1, 'server broadcast 1 lần cho pose hợp lệ');
ok(broadcasts[0]?.data?.pose === 'sit_upright', 'broadcast giữ pose sit_upright');
ok(broadcasts[0]?.data?.activity === 'dreaming', 'broadcast giữ activity dreaming');
ok(broadcasts[0]?.data?.id === 'sock_pose_1', 'broadcast gắn id người gửi');
ok(broadcasts[0]?.roomId === 'main_hall', 'broadcast đúng room');

// pose không hợp lệ -> không broadcast
broadcasts.length = 0;
activityHandler({ activity: null, pose: 'hacked_pose' });
ok(broadcasts.length === 0, 'server chặn pose không hợp lệ');

// không gửi pose -> default 'stand'
broadcasts.length = 0;
activityHandler({ activity: null });
ok(broadcasts.length === 1 && broadcasts[0].data.pose === 'stand',
  'thiếu pose -> broadcast pose stand mặc định');

// activity không hợp lệ -> không broadcast dù pose đúng
broadcasts.length = 0;
activityHandler({ activity: 'flying', pose: POSE.SIT_LEANBACK });
ok(broadcasts.length === 0, 'server vẫn chặn activity không hợp lệ');

// ------------------------------------ C. Runtime: RemotePlayer (stub Phaser)
const { isSitPose } = await import('../src/config/poseConfig.js');
let rpSrc = readFileSync('src/entities/RemotePlayer.js', 'utf8');
rpSrc = rpSrc.replace(/^import .*$/gm, '');                 // bỏ mọi import
rpSrc = rpSrc.replace(/^export class RemotePlayer/m, 'class RemotePlayer');
rpSrc += '\nthis.RemotePlayer = RemotePlayer;';

const playedAnims = [];
const sandbox = {
  Phaser: {
    GameObjects: { Sprite: class {} },
    Math: { Clamp: (v, a, b) => Math.min(b, Math.max(a, v)), Linear: (a, b, t) => a + (b - a) * t },
  },
  ITEMS_DATABASE: {}, PERF_CONFIG: { REMOTE_PLAYER_CULL_ENABLED: false },
  POSE, isSitPose,
  playBodyEmote: () => {}, syncEmoteOverlays: () => {}, isBodyEmote: () => false,
  console,
};
createContext(sandbox);
new Script(rpSrc, { filename: 'RemotePlayer.stub.js' }).runInContext(sandbox);
const RPClass = sandbox.RemotePlayer;
ok(typeof RPClass === 'function', 'load được class RemotePlayer (stub Phaser)');

function makeRemote(avatarId, existingAnims) {
  const rp = Object.create(RPClass.prototype);
  rp.avatarId = avatarId;
  rp.pose = POSE.STAND;
  rp.scene = { anims: { exists: (k) => existingAnims.includes(k) } };
  rp.anims = { play: (k, ig) => playedAnims.push(k), timeScale: 1, getProgress: () => 0 };
  rp.currentDirection = 'down';
  rp.targetX = 100; rp.targetY = 100; rp.x = 100; rp.y = 100;
  rp.targetDirection = 'down'; rp.targetMoving = false;
  rp.lastX = rp.x; rp.lastY = rp.y;
  rp.setDepth = () => {};
  return rp;
}

// Hoodie DEVER có sit frames -> setPose phát đúng anim
playedAnims.length = 0;
const rpHoodie = makeRemote('hoodie_dever', ['sit_upright_hoodie_dever', 'sit_leanback_hoodie_dever']);
rpHoodie.setPose('sit_upright');
ok(rpHoodie.pose === 'sit_upright', 'RemotePlayer.pose = sit_upright');
ok(playedAnims.includes('sit_upright_hoodie_dever'), 'phát anim sit_upright_hoodie_dever');

// Avatar không có sit frames -> KHÔNG crash, không phát anim lạ
playedAnims.length = 0;
const rpOther = makeRemote('dev_hoodie', []);
rpOther.setPose('sit_leanback');
ok(rpOther.pose === 'sit_leanback', 'pose vẫn được set dù avatar thiếu frames');
ok(playedAnims.length === 0, 'không phát anim khi thiếu sit frames (không crash)');

// update() ưu tiên sit anim thay vì idle/walk khi đang ngồi
playedAnims.length = 0;
rpHoodie.setPose('sit_leanback');
playedAnims.length = 0;
rpHoodie.update(0, 16.67);
ok(playedAnims[playedAnims.length - 1] === 'sit_leanback_hoodie_dever',
  'update() giữ sit anim thay vì ghi đè bằng idle');

// stand -> quay lại logic idle/walk bình thường
playedAnims.length = 0;
rpHoodie.scene.anims.exists = (k) => k === 'idle_down_hoodie_dever';
rpHoodie.setPose('stand');
rpHoodie.update(0, 16.67);
ok(rpHoodie.pose === 'stand', 'setPose(stand) reset pose');
ok(playedAnims.includes('idle_down_hoodie_dever'), 'stand -> phát idle bình thường');

// pose không hợp lệ -> fallback stand, không crash
playedAnims.length = 0;
rpOther.setPose('hacked');
ok(rpOther.pose === 'stand', 'pose lạ -> fallback stand');

console.log(`\npose_sync: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
