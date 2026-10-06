/**
 * test/verify_quiz_engine.js
 * Phase 1c: kiểm chứng FSM + scoring của QuizEngine (client, không cần server)
 */
import { QUIZ_CONFIG, computeQuizScore } from '../src/config/quizConfig.js';
import { QuizEngine } from '../src/minigames/QuizEngine.js';
import { readFileSync } from 'fs';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL:', msg); } };

// 1. Scoring
ok(computeQuizScore(0, 15000, 0) === 200, 'trả lời tức thì combo 0 -> 200 điểm');
const slow = computeQuizScore(15000, 15000, 0);
ok(slow === 100, 'trả lời hết giờ -> 100 điểm base');
const combo2 = computeQuizScore(0, 15000, 2);
ok(combo2 === Math.round(200 * 1.5), 'combo 2 -> x1.5');
const comboMax = computeQuizScore(0, 15000, 20);
ok(comboMax === Math.round(200 * 3), 'combo cap x3');

// 2. FSM hợp lệ với fake socket
const emitted = [];
const fakeSocket = {
  id: 'sock1',
  connected: true,
  handlers: {},
  on(ev, fn) { this.handlers[ev] = fn; },
  emit(ev, data) { emitted.push({ ev, data }); },
};
const engine = new QuizEngine({ socket: fakeSocket });
const states = [];
engine.onStateChange = (s) => states.push(s);

engine.create({ roomId: 'meeting_room', questionCount: 5, category: 'mixed' });
ok(emitted.some(e => e.ev === 'quiz:create'), 'create emit quiz:create');
// Server phản hồi quiz:created
fakeSocket.handlers['quiz:created']({ quizId: 'quiz_abc' });
ok(engine.state === 'lobby', 'sau quiz:created -> LOBBY');
ok(engine.isHost === true, 'người tạo là host');

// Không cho answer khi chưa vào QUESTION
engine.answer(0);
ok(!emitted.some(e => e.ev === 'quiz:answer'), 'không emit answer ngoài QUESTION');

// Lobby update
fakeSocket.handlers['quiz:lobby']({ players: [{ socketId: 'sock1', name: 'A' }], hostId: 'sock1' });
ok(engine.players.length === 1, 'lobby nhận player list');

// Countdown -> question
fakeSocket.handlers['quiz:countdown']({ seconds: 3 });
ok(engine.state === 'countdown', '-> COUNTDOWN');
fakeSocket.handlers['quiz:question']({ index: 0, total: 5, question: 'Q?', options: ['a','b','c','d'], endsAt: Date.now() + 15000 });
ok(engine.state === 'question', '-> QUESTION');
engine.answer(1);
ok(emitted.some(e => e.ev === 'quiz:answer' && e.data.optionIndex === 1), 'answer emit đúng option');
engine.answer(2);
ok(emitted.filter(e => e.ev === 'quiz:answer').length === 1, 'chỉ 1 đáp án mỗi câu');

// Reveal -> finished
fakeSocket.handlers['quiz:reveal']({ index: 0, correctIndex: 1, scores: [] });
ok(engine.state === 'reveal', '-> REVEAL');
fakeSocket.handlers['quiz:finished']({ scores: [{ name: 'A', score: 200 }], winner: { name: 'A', score: 200 } });
ok(engine.state === 'finished', '-> FINISHED');
ok(engine.finalResult.winner.name === 'A', 'lưu kết quả cuối');

// 3. Transition bất hợp lệ bị chặn
const bad = engine._setState('question');
ok(bad === false && engine.state === 'finished', 'finished -> question bị chặn');

// 4. Server handler tồn tại và đăng ký đúng events
const srvSrc = readFileSync('server/socket/quizHandler.js', 'utf8');
for (const ev of ['quiz:create', 'quiz:join', 'quiz:start', 'quiz:answer', 'quiz:leave']) {
  ok(srvSrc.includes(`'${ev}'`), `server xử lý ${ev}`);
}
// Server gửi quiz:joined kèm quizId cho guest
ok(srvSrc.includes(`'quiz:joined'`), 'server gửi quiz:joined cho guest');
// Client nhận quiz:joined -> set quizId
const engine2 = new QuizEngine({ socket: fakeSocket });
engine2.join('quiz_xyz');
ok(emitted.some(e => e.ev === 'quiz:join' && e.data.quizId === 'quiz_xyz'), 'join emit quiz:join kèm quizId');
ok(engine2.quizId === null, 'trước khi server xác nhận, quizId vẫn null');
fakeSocket.handlers['quiz:joined']({ quizId: 'quiz_xyz' });
ok(engine2.quizId === 'quiz_xyz', 'sau quiz:joined -> engine.quizId được gán');
ok(engine2.state === 'lobby', 'sau quiz:joined -> LOBBY');
// leave() khi đã có quizId thì emit quiz:leave
engine2.leave();
ok(emitted.some(e => e.ev === 'quiz:leave'), 'leave emit quiz:leave khi có quizId');
const handlerSrc = readFileSync('server/socket/socketHandler.js', 'utf8');
ok(handlerSrc.includes('setupQuizHandler'), 'socketHandler đăng ký setupQuizHandler');

// 5. Server import được question bank (ESM)
const q = await import('../src/config/quizQuestions.js');
ok(Array.isArray(q.QUIZ_QUESTIONS) && q.QUIZ_QUESTIONS.length > 0, 'QUIZ_QUESTIONS load được');

// 6. Guard khi socket disconnected / null
const deadEmitted = [];
const deadSocket = {
  id: 'sockX',
  connected: false,
  handlers: {},
  on(ev, fn) { this.handlers[ev] = fn; },
  emit(ev, data) { deadEmitted.push({ ev, data }); },
};
const errEngine = new QuizEngine({ socket: deadSocket });
const errMsgs = [];
errEngine.onEvent = (ev, data) => { if (ev === 'error') errMsgs.push(data.message); };

errEngine.create({ roomId: 'main_hall' });
ok(deadEmitted.length === 0, 'create khi socket disconnected -> không emit');
ok(errMsgs.length === 1 && errMsgs[0].includes('không thể tạo phòng'), 'create khi socket disconnected -> toast lỗi tiếng Việt');
ok(errEngine.state === QUIZ_CONFIG.states.IDLE, 'create bị chặn -> state giữ IDLE');

errEngine.join('quiz_x');
ok(!deadEmitted.some(e => e.ev === 'quiz:join'), 'join khi socket disconnected -> không emit');
ok(errMsgs.length === 2 && errMsgs[1].includes('không thể tham gia phòng'), 'join khi socket disconnected -> toast lỗi tiếng Việt');

const noEmoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
ok(!noEmoji.test(errMsgs.join(' ')), 'toast lỗi không chứa emoji (AGENTS.md)');

// Socket null hoàn toàn cũng không throw
const nullEngine = new QuizEngine({ socket: null });
const nullErrs = [];
nullEngine.onEvent = (ev, data) => { if (ev === 'error') nullErrs.push(data.message); };
let threw = false;
try { nullEngine.create({ roomId: 'main_hall' }); nullEngine.join('quiz_x'); }
catch { threw = true; }
ok(!threw && nullErrs.length === 2, 'socket null -> không throw, có toast lỗi');

console.log(`\nverify_quiz_engine: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
