/**
 * test/verify_voice_moderation.js
 * Phase 1d: kiểm chứng raise-hand / spotlight / moderation (server + client)
 */
import { setupVoiceHandler } from '../server/socket/voiceHandler.js';
import { readFileSync } from 'fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL:', msg); } };

// ---- Mock io/socket ----
function makeSocket(id, name) {
  const handlers = {};
  const emitted = []; // emit tới chính socket này
  return {
    id,
    handlers,
    emitted,
    _currentVoiceMeeting: null,
    authUser: { displayName: name },
    on(ev, fn) { handlers[ev] = fn; },
    emit(ev, data) { emitted.push({ ev, data }); },
    join() {}, leave() {},
    to() { return { emit() {} }; },
  };
}

const roomBroadcasts = [];
const directSends = [];
const io = {
  to(target) {
    return {
      emit(ev, data) {
        if (target.startsWith('voice_')) roomBroadcasts.push({ target, ev, data });
        else directSends.push({ target, ev, data });
      },
    };
  },
  sockets: { sockets: new Map() },
};

// Player manager mock — voiceHandler import playerManager từ './playerManager.js'
// Ta không mock được import trực tiếp, nên chỉ test các hàm không phụ thuộc playerManager.
// Thay vào đó: kiểm tra source có đủ events + logic host.

// 1. Server có đủ handlers Phase 1d
const srvSrc = readFileSync('server/socket/voiceHandler.js', 'utf8');
for (const ev of ['voice:raise_hand', 'voice:spotlight', 'voice:moderate']) {
  ok(srvSrc.includes(`'${ev}'`), `server xử lý ${ev}`);
}
for (const ev of ['voice:hand_changed', 'voice:spotlight_changed', 'voice:force_mute', 'voice:kicked', 'voice:host_changed']) {
  ok(srvSrc.includes(`'${ev}'`), `server emit ${ev}`);
}
// Spotlight dùng voice:error riêng, không dùng nhầm quiz:error
ok(srvSrc.includes(`'voice:error'`), 'server dùng voice:error cho spotlight');
ok(!srvSrc.includes(`'quiz:error'`), 'voiceHandler không dùng nhầm quiz:error');
ok(srvSrc.includes('getVoiceHost'), 'server có hàm xác định host');
ok(srvSrc.includes('host.socketId !== socket.id'), 'spotlight/moderate kiểm tra quyền host');
ok(srvSrc.includes('handRaised: false'), 'peerInfo khởi tạo handRaised');

// 2. Client VoiceService có đủ methods + listeners
const cliSrc = readFileSync('src/services/VoiceService.js', 'utf8');
for (const m of ['raiseHand(', 'setSpotlight(', 'moderatePeer(', 'isVoiceHost(']) {
  ok(cliSrc.includes(m), `VoiceService có ${m}`);
}
for (const ev of ['voice:hand_changed', 'voice:spotlight_changed', 'voice:force_mute', 'voice:kicked', 'voice:host_changed']) {
  ok(cliSrc.includes(`'${ev}'`), `client lắng nghe ${ev}`);
}
ok(cliSrc.includes(`'voice:error'`), 'client lắng nghe voice:error');
ok(cliSrc.includes('onHandChanged = callbacks.onHandChanged'), 'init nhận onHandChanged');
ok(cliSrc.includes('onSpotlightChanged = callbacks.onSpotlightChanged'), 'init nhận onSpotlightChanged');
ok(cliSrc.includes('onModeration = callbacks.onModeration'), 'init nhận onModeration');
ok(cliSrc.includes('onHostChanged = callbacks.onHostChanged'), 'init nhận onHostChanged');

// 3. UI: nút giơ tay + handlers
const uiSrc = readFileSync('src/ui/gameplay/InteractiveModal.js', 'utf8');
ok(uiSrc.includes('btn-raise-hand'), 'có nút Giơ Tay');
ok(uiSrc.includes('handleHandChanged'), 'có handleHandChanged');
ok(uiSrc.includes('handleSpotlightChanged'), 'có handleSpotlightChanged');
ok(uiSrc.includes('handleModeration'), 'có handleModeration');
ok(uiSrc.includes('tile-mod-btn'), 'có nút moderation trên tile');
const htmlSrc = readFileSync('index.html', 'utf8');
ok(htmlSrc.includes('id="btn-raise-hand"'), 'index.html có nút Giơ Tay');
ok(!/>Giơ Tay.*[\u{1F300}-\u{1FAFF}]/u.test(htmlSrc), 'nút Giơ Tay không có emoji');

// 4. CSS cho hand/spotlight/mod
const cssSrc = readFileSync('src/styles/main.css', 'utf8');
ok(cssSrc.includes('.tile-hand-badge'), 'CSS có tile-hand-badge');
ok(cssSrc.includes('.voice-tile.spotlighted'), 'CSS có spotlighted');
ok(cssSrc.includes('.tile-mod-actions'), 'CSS có tile-mod-actions');

console.log(`\nverify_voice_moderation: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
