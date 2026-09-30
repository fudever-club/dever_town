/**
 * DEVER TOWN - PAC-MAN 3.0 TEST SUITE
 * Kiểm thử toàn diện động cơ Cyber Pac-Man (PacmanEngine.js):
 * 1. Khởi tạo mê cung 28x21, đếm hạt năng lượng, 4 Super D-Coin và 3 mạng.
 * 2. Di chuyển Pac-Buggy, chống xuyên tường, bẻ lái ngã rẽ và cổng Warp Tunnel.
 * 3. Cơ chế ăn hạt (+10đ), ăn Super D-Coin (+50đ, kích hoạt Frightened Mode).
 * 4. Thuật toán AI 4 Con Ma (Blinky, Pinky, Inky, Clyde) ở các chế độ Chase/Scatter/Frightened/Eaten.
 * 5. Tương tác va chạm: Pac-Man săn ma khi Overdrive (+200đ -> +1600đ), ma bắt Pac-Man mất mạng.
 * 6. Quả thưởng Tech Fruit (+300đ) và chu trình hồi sinh / Game Over.
 */

import { PACMAN_CONFIG } from '../src/config/minigamesConfig.js';
import { PacmanEngine } from '../src/ui/minigames/retro/PacmanEngine.js';

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

function createMockCanvas(w = 640, h = 360) {
  return {
    width: w,
    height: h,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      roundRect: () => {},
      stroke: () => {},
      fill: () => {},
      translate: () => {},
      rotate: () => {},
      measureText: () => ({ width: 40 }),
      fillText: () => {}
    }),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w, height: h })
  };
}

const mockJuiceFX = {
  shake: () => {},
  spawnSparkles: () => {},
  spawnFloatingText: () => {},
  spawnConfetti: () => {},
  spawnDust: () => {}
};

console.log('--- BẮT ĐẦU KIỂM THỬ CYBER PAC-MAN 3.0 ---');

const canvas = createMockCanvas(640, 360);
let lastReportedScore = 0;
const engine = new PacmanEngine(canvas, mockJuiceFX, {
  onScoreUpdate: (score) => { lastReportedScore = score; }
});

// 1. Kiểm tra Khởi tạo Mê cung & Thực thể
assert(engine.cols === 28, 'Mê cung chuẩn 28 cột');
assert(engine.rows === 21, 'Mê cung chuẩn 21 hàng');
assert(engine.totalPellets > 120, `Tổng số hạt năng lượng sinh đầy đủ: ${engine.totalPellets} hạt`);
assert(engine.lives === 3, 'Khởi đầu với 3 mạng sống');
assert(engine.state === 'ready', 'Trạng thái ban đầu là ready');
assert(engine.ghosts.length === 4, 'Khởi tạo đầy đủ 4 Cyber Virus Ma');

// Đếm số lượng Super D-Coin (tile 3)
let powerCount = 0;
for (let r = 0; r < engine.rows; r++) {
  for (let c = 0; c < engine.cols; c++) {
    if (engine.maze[r][c] === 3) powerCount++;
  }
}
assert(powerCount === 4, 'Bàn cờ có chính xác 4 Super D-Coin tại 4 góc chiến lược');

// 2. Kiểm tra Di chuyển & Chặn Tường
engine.setDirection(-1, 0); // Bấm sang trái
assert(engine.state === 'playing', 'Bấm phím chuyển sang trạng thái playing');
assert(engine.pacman.nextDirX === -1, 'Ghi nhận hướng rẽ tiếp theo sang trái');

// Kiểm tra hàm isWall
assert(engine.isWall(0, 0) === true, 'Góc (0,0) là tường');
assert(engine.isWall(1, 1) === false, 'Ô (1,1) là đường đi hợp lệ');

// 3. Kiểm tra Ăn Hạt & Tính Điểm
const initialScore = engine.score;
const remainingBefore = engine.pelletsRemaining;
// Đặt Pac-Man đè lên 1 ô có hạt thường (tile 2)
engine.maze[16][13] = 2;
engine.pacman.x = engine.startX + 13.5 * engine.tileSize;
engine.pacman.y = engine.startY + 16.5 * engine.tileSize;
engine.updatePacman(0.016);

assert(engine.score === initialScore + 10, 'Ăn hạt thường ghi được 10 điểm');
assert(engine.pelletsRemaining === remainingBefore - 1, 'Số lượng hạt còn lại giảm đi 1');
assert(engine.maze[16][13] === 0, 'Ô hạt đã ăn biến thành đường trống (0)');

// 4. Kiểm tra Ăn Super D-Coin & Kích Hoạt Frightened Mode
engine.maze[16][13] = 3;
engine.updatePacman(0.016);
assert(engine.score === initialScore + 60, 'Ăn Super D-Coin ghi được 50 điểm (+60 tổng)');
assert(engine.frightenedTimer > 0, `Kích hoạt Chế độ Sợ Hãi Frightened (${engine.frightenedTimer}s)`);
assert(engine.ghosts.every(g => g.state === 'frightened'), 'Toàn bộ 4 ma đồng loạt chuyển sang frightened');

// 5. Kiểm tra Thuật Toán AI 4 Con Ma
const pacTileX = Math.floor((engine.pacman.x - engine.startX) / engine.tileSize);
const pacTileY = Math.floor((engine.pacman.y - engine.startY) / engine.tileSize);

// Đưa về chế độ Chase để kiểm tra mục tiêu từng ma
engine.frightenedTimer = 0;
engine.globalMode = 'chase';
for (const g of engine.ghosts) g.state = 'chase';

const blinky = engine.ghosts.find(g => g.id === 'blinky');
const blinkyTarget = engine.getGhostTargetTile(blinky);
assert(blinkyTarget.x === pacTileX && blinkyTarget.y === pacTileY, 'Blinky (Đỏ) nhắm thẳng vào tọa độ Pac-Man');

const pinky = engine.ghosts.find(g => g.id === 'pinky');
engine.pacman.dirX = 1;
engine.pacman.dirY = 0;
const pinkyTarget = engine.getGhostTargetTile(pinky);
assert(pinkyTarget.x === pacTileX + 4 && pinkyTarget.y === pacTileY, 'Pinky (Hồng) đón đầu 4 ô phía trước Pac-Man');

const clyde = engine.ghosts.find(g => g.id === 'clyde');
// Đặt Clyde ở rất xa Pac-Man
clyde.x = engine.startX + 2 * engine.tileSize;
clyde.y = engine.startY + 2 * engine.tileSize;
const clydeTargetFar = engine.getGhostTargetTile(clyde);
assert(clydeTargetFar.x === pacTileX && clydeTargetFar.y === pacTileY, 'Clyde (Vàng) đuổi theo Pac-Man khi ở xa');

// Đặt Clyde sát cạnh Pac-Man (< 8 ô)
clyde.x = engine.pacman.x + 2 * engine.tileSize;
clyde.y = engine.pacman.y;
const clydeTargetNear = engine.getGhostTargetTile(clyde);
assert(clydeTargetNear.x === clyde.scatterTile.x && clydeTargetNear.y === clyde.scatterTile.y, 'Clyde tản về góc khi lại gần Pac-Man');

// 6. Kiểm tra Pac-Man Săn Ma (Frightened Ghost Collision)
blinky.state = 'frightened';
blinky.x = engine.pacman.x;
blinky.y = engine.pacman.y;
const scoreBeforeEat = engine.score;
engine.checkGhostCollisions();

assert(blinky.state === 'eaten', 'Ma bị Pac-Man ăn chuyển sang trạng thái eaten (chỉ còn mắt)');
assert(engine.score === scoreBeforeEat + 200, 'Ăn ma đầu tiên ghi được 200 điểm');
assert(engine.hitStop > 0, 'Kích hoạt hit-stop tạo cảm giác ăn giòn giã');

// Ăn tiếp ma thứ 2 nhận combo 400đ
pinky.state = 'frightened';
pinky.x = engine.pacman.x;
pinky.y = engine.pacman.y;
engine.checkGhostCollisions();
assert(pinky.state === 'eaten', 'Ma thứ 2 bị ăn chuyển sang eaten');
assert(engine.score === scoreBeforeEat + 600, 'Ăn ma thứ 2 nhận điểm combo x2 (+400đ)');

// 7. Kiểm tra Ma Bắt Pac-Man (Mất Mạng)
const inky = engine.ghosts.find(g => g.id === 'inky');
inky.state = 'chase';
inky.x = engine.pacman.x;
inky.y = engine.pacman.y;
const livesBefore = engine.lives;
engine.checkGhostCollisions();

assert(engine.state === 'pacman_dying', 'Bị ma chạm trúng chuyển sang trạng thái pacman_dying');
assert(engine.lives === livesBefore - 1, 'Mạng sống giảm đi 1');

// 8. Kiểm tra Quả Thưởng Tech Fruit
engine.spawnFruit();
assert(engine.fruit !== null, 'Sinh thành công Quả Thưởng Tech Core');
assert(engine.fruit.tileX === 13 && engine.fruit.tileY === 12, 'Quả Thưởng nằm đúng vị trí trung tâm');
// Cho Pac-Man ăn quả
engine.pacman.x = engine.fruit.x;
engine.pacman.y = engine.fruit.y;
const scoreBeforeFruit = engine.score;
engine.updatePacman(0.016);
assert(engine.fruit === null, 'Quả Thưởng biến mất sau khi ăn');
assert(engine.score === scoreBeforeFruit + 300, 'Ăn Quả Thưởng ghi được 300 điểm');

// 9. Kiểm tra Cổng Warp Tunnel
const ts = engine.tileSize;
engine.pacman.dirX = 1;
engine.pacman.x = engine.startX + engine.cols * ts + 10;
engine.updatePacman(0.016);
assert(engine.pacman.x <= engine.startX, 'Đi xuyên qua mép phải tự động warp sang mép trái');

// 10. Kiểm tra Reset & Game Over
engine.lives = 0;
engine.state = 'pacman_dying';
engine.update(1.5);
assert(engine.state === 'game_over', 'Hết mạng chuyển sang trạng thái game_over');

engine.reset();
assert(engine.lives === 3, 'Reset khôi phục lại 3 mạng sống');
assert(engine.score === 0, 'Reset đưa điểm số về 0');
assert(engine.state === 'ready', 'Reset đưa trạng thái về ready');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================`);
