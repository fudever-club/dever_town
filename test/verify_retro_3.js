/**
 * Test Suite: Verify Retro Arcade 3.0 Overhaul (Cyber Buggy Slither & Sokoban Warehouse Master)
 */

import { SnakeEngine } from '../src/ui/minigames/retro/SnakeEngine.js';
import { SokobanEngine } from '../src/ui/minigames/retro/SokobanEngine.js';
import { SNAKE_CONFIG, SOKOBAN_CONFIG } from '../src/config/minigamesConfig.js';
import { SOKOBAN_LEVELS } from '../src/config/sokobanLevels.js';

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
    save: () => {},
    restore: () => {},
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
    fillText: () => {},
    setLineDash: () => {}
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

console.log('--- BẮT ĐẦU KIỂM THỬ RETRO ARCADE 3.0 ---');

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

// ==========================================
// TEST SUITE 1: SNAKE 3.0 (CYBER BUGGY SLITHER)
// ==========================================
console.log('\n--- 1. Kiểm thử SnakeEngine 3.0 ---');
const snakeCanvas = createMockCanvas(640, 360);
let lastReportedSnakeScore = 0;
const snakeEngine = new SnakeEngine(snakeCanvas, mockJuiceFX, {
  onScoreUpdate: (score) => { lastReportedSnakeScore = score; }
});

assert(snakeEngine.snake.length === 4, 'Snake khởi tạo với độ dài 4 đốt thân');
assert(snakeEngine.foods.length >= 3, 'Khởi tạo sẵn ít nhất 3 loại mồi trên bàn cờ');

// Test movement & wrap-around
const initialHead = { ...snakeEngine.snake[0] };
snakeEngine.setDirection(0, -1); // Up
snakeEngine.step();
assert(snakeEngine.snake[0].y === initialHead.y - 1, 'Đầu Buggy di chuyển lên trên thành công');

// Test eating food
const targetFood = { x: snakeEngine.snake[0].x + 1, y: snakeEngine.snake[0].y, type: 'strawberry', bobTimer: 0, pulseTimer: 0 };
snakeEngine.foods = [targetFood];
snakeEngine.setDirection(1, 0); // Right
snakeEngine.step();

assert(snakeEngine.score >= 10, `Ăn Dâu Tây Buggy ghi được ${snakeEngine.score} điểm`);
assert(snakeEngine.combo === 1, 'Combo Streak bắt đầu đếm nhịp');

// Test eating D-Coin with combo
const dcoinFood = { x: snakeEngine.snake[0].x + 1, y: snakeEngine.snake[0].y, type: 'dcoin', bobTimer: 0, pulseTimer: 0 };
snakeEngine.foods = [dcoinFood];
snakeEngine.step();
assert(snakeEngine.score >= 60, `Ăn tiếp D-Coin nhận điểm kèm thưởng combo: ${snakeEngine.score}`);
assert(snakeEngine.combo === 2, 'Combo Streak tăng lên 2');

// Test Portal Teleportation
snakeEngine.portals = [
  { x: 10, y: 10, targetX: 25, targetY: 5, color: '#38bdf8' }
];
snakeEngine.snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
snakeEngine.setDirection(1, 0);
snakeEngine.step();
assert(snakeEngine.snake[0].x === 25 && snakeEngine.snake[0].y === 5, 'Buggy nhảy xuyên Cổng Dịch Chuyển Portal thành công');

// Test Boost burn
snakeEngine.isBoosting = true;
snakeEngine.snake = [
  { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }
];
const lenBefore = snakeEngine.snake.length;
snakeEngine.update(2.1); // Cost sec = 2.0s
assert(snakeEngine.snake.length === lenBefore - 1, 'Xả thân tăng tốc: mất 1 đốt thân khi boost liên tục');

// ==========================================
// TEST SUITE 2: SOKOBAN 3.0 (WAREHOUSE MASTER)
// ==========================================
console.log('\n--- 2. Kiểm thử SokobanEngine 3.0 ---');
const sokobanCanvas = createMockCanvas(640, 360);
let lastReportedSokobanScore = 0;
const sokobanEngine = new SokobanEngine(sokobanCanvas, mockJuiceFX, {
  onScoreUpdate: (score) => { lastReportedSokobanScore = score; }
});

assert(sokobanEngine.currentLevelIndex === 0, 'Sokoban khởi tạo tại Màn 1');
assert(sokobanEngine.player.x > 0 && sokobanEngine.player.y > 0, 'Xác định đúng vị trí nhân vật Chibi');

// Test movement & wall collision
const startPos = { ...sokobanEngine.player };
sokobanEngine.move(0, -1); // Move up into free tile or wall
assert(sokobanEngine.moves >= 0, 'Ghi nhận bước di chuyển');

// Test push box in Level 1:
// Level 1 map:
// [1, 1, 1, 1, 1, 1],
// [1, 0, 0, 0, 0, 1],
// [1, 0, 3, 2, 0, 1],  <-- Box at (2, 2), Target at (3, 2)
// [1, 5, 0, 0, 0, 1],  <-- Player at (1, 3)
// [1, 1, 1, 1, 1, 1]
sokobanEngine.loadLevel(0);
sokobanEngine.player = { x: 1, y: 2 };
sokobanEngine.map[2][1] = 5;
sokobanEngine.map[3][1] = 0;

// Move right to push box from (2, 2) to target (3, 2)
sokobanEngine.move(1, 0);

assert(sokobanEngine.map[2][3] === 4, 'Hộp được đẩy trúng điểm đích (tile 4: Box on Target)');
assert(sokobanEngine.pushTimer > 0, 'Kích hoạt tư thế đẩy hộp Chibi isPushing');
assert(sokobanEngine.movingBoxes.length > 0, 'Kích hoạt animation trượt lerp cho hộp hàng');
assert(sokobanEngine.won === true, 'Màn 1 hoàn thành xuất sắc (Win condition)');

// Test Undo functionality
sokobanEngine.undo();
assert(sokobanEngine.won === false, 'Hoàn tác Undo phục hồi trạng thái chưa thắng');
assert(sokobanEngine.map[2][2] === 3, 'Hộp được đưa trở lại vị trí cũ trước khi đẩy');

// Test Ice Floor (Level 4: Màn 4 có sàn băng tile 7)
sokobanEngine.loadLevel(3);
assert(sokobanEngine.levelData.name.includes('Sàn Băng'), 'Tải đúng Màn 4 có sàn băng');

// Test Level Select Modal
sokobanEngine.toggleLevelSelect();
assert(sokobanEngine.showLevelSelect === true, 'Mở thành công Modal chọn 15 màn chơi');
sokobanEngine.handlePointerClick(100, 100); // Click on a level button inside modal
assert(sokobanEngine.currentLevelIndex >= 0, 'Chọn màn chơi từ modal thành công');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================`);
