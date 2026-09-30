/**
 * Test Suite: Verify Geometry Dash 3.0 (Dever Dash)
 * Tests physics, rotation, spike collisions, blocks, jump pads, rings, gravity portals, and progress.
 */

import { GeometryDashEngine } from '../src/ui/minigames/retro/GeometryDashEngine.js';
import { GEOMETRY_DASH_CONFIG } from '../src/config/minigamesConfig.js';

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

console.log('--- BẮT ĐẦU KIỂM THỬ GEOMETRY DASH 3.0 ---');

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
let lastPct = 0;
const dashEngine = new GeometryDashEngine(canvas, mockJuiceFX, {
  onScoreUpdate: (pct) => { lastPct = pct; }
});

// 1. Initial State
assert(dashEngine.state === 'ready', 'Khởi tạo ở trạng thái ready');
assert(dashEngine.cube.isGrounded === true, 'Cube khởi đầu trên mặt đất');
assert(dashEngine.elements.length > 30, 'Màn chơi sinh đầy đủ hơn 30 chướng ngại vật & cơ chế');

// 2. Start Run & Jump
dashEngine.jump();
assert(dashEngine.state === 'running', 'Nhấn nhảy chuyển sang trạng thái running');
assert(dashEngine.cube.vy < 0, `Lực nhảy đẩy vận tốc âm (vy = ${dashEngine.cube.vy})`);
assert(dashEngine.cube.isGrounded === false, 'Cube rời khỏi mặt đất');

// 3. Rotation during Jump
const angleBefore = dashEngine.cube.angle;
dashEngine.update(0.05);
assert(dashEngine.cube.angle !== angleBefore, 'Cube xoay tròn góc khi đang bay trên không');

// 4. Fall & Landing
// Run updates until cube lands on ground
for (let i = 0; i < 35; i++) {
  dashEngine.update(0.02);
}
assert(dashEngine.cube.isGrounded === true, 'Cube tiếp đất an toàn sau cú nhảy');
assert(dashEngine.cameraX > 0, 'Camera tự động cuộn về phía trước');

// 5. Jump Ring (Orb) Interaction
const ringEl = dashEngine.elements.find(el => el.type === 'ring');
assert(ringEl !== undefined, 'Tồn tại Vòng Nhảy (Jump Ring) trong màn chơi');
// Position cube right on the ring
dashEngine.cameraX = ringEl.x - dashEngine.screenX - dashEngine.size / 2;
dashEngine.cube.y = ringEl.y - dashEngine.size / 2;
dashEngine.cube.isGrounded = false;
dashEngine.jump();
assert(ringEl.triggered === true, 'Kích hoạt thành công Vòng Nhảy trên không');
assert(dashEngine.cube.vy < 0, 'Vòng Nhảy đẩy Cube vọt lên trên');

// 6. Jump Pad (Spring Bounce)
const padEl = dashEngine.elements.find(el => el.type === 'pad' && el.color === 'yellow');
assert(padEl !== undefined, 'Tồn tại Đệm Nhún (Jump Pad) trong màn chơi');
dashEngine.cameraX = padEl.x - dashEngine.screenX + 5;
dashEngine.cube.y = padEl.y - dashEngine.size;
dashEngine.cube.vy = 20; // Falling onto pad
dashEngine.update(0.016);
assert(dashEngine.cube.vy <= GEOMETRY_DASH_CONFIG.physics.jumpPadImpulse, 'Đệm Nhún tự động nảy cực đại mà không cần bấm phím');

// 7. Gravity Portal (Inverted Gravity)
const portalUp = dashEngine.elements.find(el => el.type === 'portal' && el.portalType === 'gravity_up');
assert(portalUp !== undefined, 'Tồn tại Cổng Đảo Trọng Lực (Gravity Portal) trong màn chơi');
dashEngine.cameraX = portalUp.x - dashEngine.screenX;
dashEngine.update(0.016);
assert(dashEngine.cube.gravityDir === -1, 'Trọng lực được đảo ngược lên trần nhà (gravityDir = -1)');

// 8. Block Collision (Landing on top)
const blockEl = dashEngine.elements.find(el => el.type === 'block');
assert(blockEl !== undefined, 'Tồn tại Khối Hộp (Block) trong màn chơi');
dashEngine.cube.gravityDir = 1; // Normal gravity
dashEngine.cameraX = blockEl.x - dashEngine.screenX + 4;
dashEngine.cube.y = blockEl.y - dashEngine.size;
dashEngine.cube.vy = 20;
dashEngine.update(0.016);
assert(dashEngine.cube.isGrounded === true, 'Tiếp đất thành công trên nóc khối hộp');

// 9. Spike Collision & Instant Death
const spikeEl = dashEngine.elements.find(el => el.type === 'spike' && el.dir === 1);
assert(spikeEl !== undefined, 'Tồn tại Gai Nhọn (Spike) trong màn chơi');
dashEngine.cameraX = spikeEl.x - dashEngine.screenX;
dashEngine.cube.y = spikeEl.y - dashEngine.size + 4; // Overlap spike
dashEngine.update(0.016);
assert(dashEngine.state === 'dead', 'Va chạm vào gai nhọn kích hoạt trạng thái dead');
assert(dashEngine.respawnTimer > 0, 'Kích hoạt bộ đếm hồi sinh siêu tốc (0.28s)');

// 10. Instant Respawn
const attemptsBefore = dashEngine.attempts;
dashEngine.update(0.35); // Exceed respawn delay
assert(dashEngine.state === 'ready', 'Hồi sinh tự động đưa người chơi về trạng thái ready');
assert(dashEngine.attempts === attemptsBefore + 1, 'Bộ đếm số lần thử (Attempts) tự động tăng lên');

// 11. Progress Percentage
dashEngine.cameraX = dashEngine.finishX * 0.45;
dashEngine.state = 'running';
dashEngine.update(0.01);
assert(dashEngine.currentPercent >= 45, `Cập nhật chính xác tiến trình màn chơi: ${dashEngine.currentPercent}%`);

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================`);
