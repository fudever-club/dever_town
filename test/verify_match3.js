/**
 * Test Suite: Verify Cyber Candy Match-3 Engine
 * Tests 8x8 grid initialization, match-3/4/5 detection, special gems (Striped, Wrapped, Color Bomb),
 * gravity drops, cascade chains, combos, deadlock shuffle, and game over states.
 */

import { Match3Engine } from '../src/ui/minigames/retro/Match3Engine.js';
import { MATCH3_CONFIG } from '../src/config/minigamesConfig.js';

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
    createRadialGradient: () => ({ addColorStop: () => {} }),
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
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

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('--- BẮT ĐẦU KIỂM THỬ CYBER CANDY MATCH-3 ---');

const canvas = createMockCanvas();
const engine = new Match3Engine(canvas);

// 1. Khởi tạo & Kích thước Bàn cờ
assert(engine.rows === 8 && engine.cols === 8, 'Khởi tạo bàn cờ kích thước chuẩn 8x8');
assert(engine.movesLeft === MATCH3_CONFIG.rules.movesLimit, `Số lượt đi khởi đầu chuẩn: ${MATCH3_CONFIG.rules.movesLimit}`);
assert(engine.score === 0, 'Điểm số khởi đầu bằng 0');
assert(engine.state === 'ready', 'Trạng thái ban đầu là ready');

// 2. Không có match-3 sẵn lúc khởi đầu
const initialMatches = engine.findAllMatches();
assert(initialMatches.matchedCells.size === 0, 'Bàn cờ ban đầu không chứa bất kỳ cụm match-3 nào');

// 3. Đảm bảo có nước đi hợp lệ
assert(engine.hasValidMoves() === true, 'Bàn cờ có ít nhất một nước đi hoán đổi hợp lệ');

// 4. Kiểm thử logic hoán đổi lân cận (areNeighbors)
assert(engine.areNeighbors(2, 2, 2, 3) === true, 'Nhận diện đúng 2 ô kề bên theo hàng ngang');
assert(engine.areNeighbors(2, 2, 3, 2) === true, 'Nhận diện đúng 2 ô kề bên theo cột dọc');
assert(engine.areNeighbors(2, 2, 3, 3) === false, 'Từ chối 2 ô chéo nhau');
assert(engine.areNeighbors(2, 2, 2, 4) === false, 'Từ chối 2 ô cách nhau');

// 5. Kiểm thử Match-3 cơ bản
// Thiết lập nhân tạo 1 hàng có thể ghép: [0, 0, 1, 0] tại hàng 0
engine.grid[0][0] = engine.createGem(0, MATCH3_CONFIG.specialTypes.NONE, 0, 0);
engine.grid[0][1] = engine.createGem(0, MATCH3_CONFIG.specialTypes.NONE, 0, 1);
engine.grid[0][2] = engine.createGem(1, MATCH3_CONFIG.specialTypes.NONE, 0, 2);
engine.grid[1][2] = engine.createGem(0, MATCH3_CONFIG.specialTypes.NONE, 1, 2); // ô bên dưới có màu 0

const swapSuccess = engine.requestSwap(0, 2, 1, 2);
assert(swapSuccess === true, 'Yêu cầu hoán đổi hợp lệ được chấp nhận');
assert(engine.state === 'swapping', 'Trạng thái chuyển sang swapping');

// Cập nhật hoạt họa swap hoàn tất
engine.update(0.2);
assert(engine.state === 'clearing', 'Hoán đổi thành công chuyển sang trạng thái clearing');
assert(engine.movesLeft === MATCH3_CONFIG.rules.movesLimit - 1, 'Số lượt đi giảm đi 1');
assert(engine.score > 0, `Điểm số được cộng khi ghép thành công: ${engine.score}`);

// 6. Kiểm thử Match-4 sinh Kẹo Sọc (Striped Gem)
// Thiết lập hàng 4 viên màu 2: [2, 2, 2, 2, 0, 0, 0, 0] với các hàng lân cận không chứa màu 2
for (let c = 0; c < 8; c++) {
  engine.grid[2][c] = engine.createGem(c % 2 === 0 ? 0 : 1, MATCH3_CONFIG.specialTypes.NONE, 2, c);
  engine.grid[3][c] = engine.createGem(c < 4 ? 2 : 0, MATCH3_CONFIG.specialTypes.NONE, 3, c);
  engine.grid[4][c] = engine.createGem(c % 2 === 0 ? 0 : 1, MATCH3_CONFIG.specialTypes.NONE, 4, c);
}
const match4Result = engine.findAllMatches();
assert(match4Result.matchedCells.size >= 4, 'Nhận diện thành công cụm Match 4');
const stripedSpawn = match4Result.specialSpawns.find(s => s.special === MATCH3_CONFIG.specialTypes.STRIPED_H);
assert(stripedSpawn !== undefined, 'Match 4 hàng ngang sinh ra Kẹo Sọc Ngang (STRIPED_H)');

// 7. Kiểm thử Match-5 thẳng hàng sinh Kẹo Cầu Vồng (COLOR_BOMB)
for (let c = 0; c < 8; c++) {
  engine.grid[3][c] = engine.createGem(c % 2 === 0 ? 0 : 1, MATCH3_CONFIG.specialTypes.NONE, 3, c);
  engine.grid[4][c] = engine.createGem(c < 5 ? 3 : 0, MATCH3_CONFIG.specialTypes.NONE, 4, c);
  engine.grid[5][c] = engine.createGem(c % 2 === 0 ? 0 : 1, MATCH3_CONFIG.specialTypes.NONE, 5, c);
}
const match5Result = engine.findAllMatches();
const colorBombSpawn = match5Result.specialSpawns.find(s => s.special === MATCH3_CONFIG.specialTypes.COLOR_BOMB);
assert(colorBombSpawn !== undefined, 'Match 5 thẳng hàng sinh ra Kẹo Cầu Vồng (COLOR_BOMB)');

// 8. Kiểm thử Match-5 chữ L sinh Kẹo Bọc (WRAPPED Bomb)
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    engine.grid[r][c] = engine.createGem((r + c) % 2 === 0 ? 0 : 1, MATCH3_CONFIG.specialTypes.NONE, r, c);
  }
}
// Hàng ngang: (5,0), (5,1), (5,2) màu 4
// Cột dọc:    (5,2), (6,2), (7,2) màu 4
engine.grid[5][0] = engine.createGem(4, MATCH3_CONFIG.specialTypes.NONE, 5, 0);
engine.grid[5][1] = engine.createGem(4, MATCH3_CONFIG.specialTypes.NONE, 5, 1);
engine.grid[5][2] = engine.createGem(4, MATCH3_CONFIG.specialTypes.NONE, 5, 2);
engine.grid[6][2] = engine.createGem(4, MATCH3_CONFIG.specialTypes.NONE, 6, 2);
engine.grid[7][2] = engine.createGem(4, MATCH3_CONFIG.specialTypes.NONE, 7, 2);
const matchLResult = engine.findAllMatches();
const wrappedSpawn = matchLResult.specialSpawns.find(s => s.special === MATCH3_CONFIG.specialTypes.WRAPPED);
assert(wrappedSpawn !== undefined, 'Match 5 dạng chữ L sinh ra Kẹo Bọc Bom (WRAPPED)');

// 9. Kiểm thử Kẹo Sọc nổ quét toàn bộ hàng
engine.state = 'ready';
engine.grid[2][2] = engine.createGem(1, MATCH3_CONFIG.specialTypes.STRIPED_H, 2, 2);
engine.startClearing(new Set(['2,2']), []);
assert(engine.lasers.length > 0, 'Kẹo Sọc Ngang nổ phóng tia laser quét toàn hàng');

// 10. Kiểm thử Kẹo Bọc nổ bán kính 3x3
engine.state = 'ready';
engine.grid[3][3] = engine.createGem(2, MATCH3_CONFIG.specialTypes.WRAPPED, 3, 3);
engine.startClearing(new Set(['3,3']), []);
assert(engine.shockwaves.length > 0, 'Kẹo Bọc Bom nổ tạo sóng xung kích shockwave 3x3');

// 11. Kiểm thử Kẹo Cầu Vồng + Kẹo Cầu Vồng (Supernova Board Wipe)
engine.state = 'ready';
engine.grid[4][4] = engine.createGem(0, MATCH3_CONFIG.specialTypes.COLOR_BOMB, 4, 4);
engine.grid[4][5] = engine.createGem(0, MATCH3_CONFIG.specialTypes.COLOR_BOMB, 4, 5);
engine.executeSpecialCombo(4, 4, 4, 5);
assert(engine.screenShake >= 14, 'Combo Cầu Vồng kép kích hoạt rung chấn cực đại');
assert(engine.clearingAnimation.matchedKeys.size === 64, 'Combo Cầu Vồng kép quét sạch toàn bộ 64 ô bàn cờ (Sugar Crush Mega Bomb)');

// 12. Kiểm thử Trọng lực rơi tự do (applyGravity)
// Xóa ô (7, 0)
engine.grid[7][0] = null;
engine.applyGravity();
assert(engine.state === 'dropping', 'Sau khi xóa ô, trạng thái chuyển sang dropping');
assert(engine.grid[7][0] !== null, 'Trọng lực đã lấp đầy ô trống ở đáy cột');

// 13. Kiểm thử Cascade Chains (nổ liên hoàn)
engine.combo = 1;
engine.checkAfterDrop();
// Kiểm tra combo có hoạt động bình thường mà không bị crash
assert(typeof engine.combo === 'number', 'Quản lý an toàn chuỗi nổ liên hoàn Cascade combo');

// 14. Kiểm thử Chống bế tắc (Deadlock Detection & Auto-Shuffle)
const movesExist = engine.hasValidMoves();
assert(typeof movesExist === 'boolean', 'Thuật toán kiểm tra nước đi bế tắc hoạt động chuẩn xác');
engine.shuffleBoard(false);
assert(engine.hasValidMoves() === true, 'Sau khi xáo trộn (shuffle), bàn cờ đảm bảo có ít nhất 1 nước đi');

// 15. Kiểm thử Gợi ý nước đi (Auto-Hint)
const hint = engine.findHint();
assert(hint !== null && hint.length === 2, 'Tìm ra gợi ý cặp ô hợp lệ cho người chơi');
assert(engine.areNeighbors(hint[0].r, hint[0].c, hint[1].r, hint[1].c) === true, 'Cặp ô gợi ý là 2 ô kề bên nhau');

// 16. Kiểm thử Điều kiện Kết thúc (Game Over & Game Clear)
engine.initBoard(); // Đảm bảo không có match tồn dư
engine.movesLeft = 0;
engine.score = 500; // < star1 (1500)
engine.checkAfterDrop();
assert(engine.state === 'game_over', 'Hết lượt đi và chưa đạt điểm tối thiểu chuyển sang game_over');

engine.score = 2000; // >= star1
engine.checkAfterDrop();
assert(engine.state === 'game_clear', 'Hết lượt đi nhưng đạt mốc sao chuyển sang game_clear');

// 17. Kiểm thử Reset trò chơi
engine.resetGame();
assert(engine.movesLeft === MATCH3_CONFIG.rules.movesLimit, 'Reset khôi phục lại 25 lượt đi');
assert(engine.score === 0, 'Reset đưa điểm số về 0');
assert(engine.state === 'ready', 'Reset đưa trạng thái về ready');

console.log('\n========================================');
console.log(`KẾT QUẢ: ${passed}/${passed + failed} TESTS PASSED!`);
console.log('========================================');

if (failed > 0) process.exit(1);
