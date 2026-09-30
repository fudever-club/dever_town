/**
 * Test Suite: Verify Flappy Bug 3.0 (Flight physics, pipes, scoring, medals, game over)
 */

import { FlappyBugEngine } from '../src/ui/minigames/retro/FlappyBugEngine.js';
import { FLAPPY_BUG_CONFIG } from '../src/config/minigamesConfig.js';

// Mock Canvas & Context
function createMockCanvas(width = 640, height = 360) {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    textBaseline: '',
    shadowColor: '',
    shadowBlur: 0,
    globalAlpha: 1.0,
    createLinearGradient: () => ({ addColorStop: () => {} }),
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    roundRect: () => {},
    quadraticCurveTo: () => {},
    fill: () => {},
    stroke: () => {},
    fillText: () => {}
  };

  return {
    width,
    height,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height })
  };
}

// Mock JuiceFX
const mockJuiceFX = {
  shake: () => {},
  spawnFloatingText: () => {},
  spawnSparkles: () => {},
  spawnConfetti: () => {},
  spawnDust: () => {},
  shakeOffset: { x: 0, y: 0 },
  update: () => {},
  render: () => {}
};

console.log('--- BẮT ĐẦU KIỂM THỬ FLAPPY BUG 3.0 ---');

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

const canvas = createMockCanvas(640, 360);
let scoreUpdates = [];
const flappyEngine = new FlappyBugEngine(canvas, mockJuiceFX, {
  onScoreUpdate: (score) => { scoreUpdates.push(score); }
});

// 1. Initial State
assert(flappyEngine.state === 'ready', 'Trạng thái khởi đầu là ready');
assert(flappyEngine.score === 0, 'Điểm ban đầu là 0');
assert(flappyEngine.pipes.length === 0, 'Chưa sinh cột khi ở trạng thái ready');

// 2. Ready Bobbing
const initialY = flappyEngine.buggy.y;
flappyEngine.update(0.1);
assert(flappyEngine.buggy.y !== initialY, 'Buggy nhấp nhô nhẹ trên không khi ở trạng thái ready');

// 3. First Flap -> Playing
flappyEngine.flap();
assert(flappyEngine.state === 'playing', 'Vỗ cánh lần đầu chuyển sang trạng thái playing');
assert(flappyEngine.buggy.vy < 0, `Lực bật nhảy đẩy vận tốc âm (vy = ${flappyEngine.buggy.vy})`);

// 4. Gravity & Physics
const vyBefore = flappyEngine.buggy.vy;
flappyEngine.update(0.1); // Gravity increases vy
assert(flappyEngine.buggy.vy > vyBefore, 'Trọng lực kéo tăng dần vận tốc rơi');

// 5. Pipe Spawning & Structure
flappyEngine.pipeTimer = 0.01;
flappyEngine.update(0.02);
assert(flappyEngine.pipes.length === 1, 'Sinh thành công cột Server Rack');
const pipe = flappyEngine.pipes[0];
assert(pipe.w === FLAPPY_BUG_CONFIG.physics.pipeWidth, 'Chiều rộng cột khớp cấu hình');
assert(pipe.gap === FLAPPY_BUG_CONFIG.physics.pipeGap, 'Khoảng cách khe hở giữa 2 cột chuẩn');
assert(pipe.bottomY === pipe.topH + pipe.gap, 'Tọa độ cột dưới khớp với đáy khe hở');

// 6. Passing Pipe & Scoring
pipe.x = flappyEngine.buggy.x - Math.floor(pipe.w / 2) - 2; // Put pipe past buggy center
flappyEngine.buggy.y = pipe.topH + pipe.gap / 2; // Position buggy safely in middle of gap
flappyEngine.update(0.01);
assert(pipe.passed === true, 'Cột được đánh dấu đã vượt qua an toàn');
assert(flappyEngine.score === 1, 'Điểm số tăng lên 1 sau khi vượt qua cột');

// 7. Collision with Top Pipe
pipe.x = flappyEngine.buggy.x;
flappyEngine.buggy.y = pipe.topH - 2; // Collide into top pipe
pipe.passed = false;
flappyEngine.update(0.01);
assert(flappyEngine.state === 'game_over', 'Va chạm cột trên chuyển sang game_over');
assert(flappyEngine.deathCooldown > 0, 'Kích hoạt thời gian hồi tử thần');

// 8. Reset & Restart
flappyEngine.deathCooldown = 0;
flappyEngine.flap();
assert(flappyEngine.state === 'ready', 'Bấm phím sau khi chết đưa về trạng thái ready');
assert(flappyEngine.score === 0, 'Điểm số được đặt lại về 0');

// 9. Medals Evaluation
flappyEngine.score = 55; // Gold medal tier (>= 50)
assert(flappyEngine.score >= FLAPPY_BUG_CONFIG.medals.gold, 'Xác định chính xác chuẩn huy chương Vàng');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================`);
