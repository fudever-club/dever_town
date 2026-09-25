/**
 * DEVER TOWN - MINIGAMES MVP VERIFICATION SUITE
 * Kiểm tra toàn diện chất lượng, logic gameplay, cấu trúc DOM và chuẩn Emoji
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function runVerification() {
  console.log('--- 1. KIỂM TRA TẬP TIN CẤU HÌNH MINIGAMES ---');
  const { FOOTBALL_CONFIG, BASKETBALL_CONFIG, VOLLEYBALL_CONFIG, BARISTA_CONFIG, SNAKE_CONFIG, GOLD_MINER_CONFIG } = await import('../src/config/minigamesConfig.js');
  
  assert(FOOTBALL_CONFIG && FOOTBALL_CONFIG.pitch && FOOTBALL_CONFIG.goalkeeper, 'FOOTBALL_CONFIG hợp lệ');
  assert(BASKETBALL_CONFIG && BASKETBALL_CONFIG.ball && BASKETBALL_CONFIG.rim, 'BASKETBALL_CONFIG hợp lệ');
  assert(VOLLEYBALL_CONFIG && VOLLEYBALL_CONFIG.floorY && VOLLEYBALL_CONFIG.serve, 'VOLLEYBALL_CONFIG hợp lệ');
  assert(BARISTA_CONFIG && BARISTA_CONFIG.drinks && Object.keys(BARISTA_CONFIG.drinks).length >= 4, 'BARISTA_CONFIG có ít nhất 4 công thức pha chế');
  assert(SNAKE_CONFIG && SNAKE_CONFIG.gridSize > 0, 'SNAKE_CONFIG hợp lệ');
  assert(GOLD_MINER_CONFIG && GOLD_MINER_CONFIG.minerals && Object.keys(GOLD_MINER_CONFIG.minerals).length >= 6, 'GOLD_MINER_CONFIG có khoáng sản phong phú');

  const { SOKOBAN_LEVELS } = await import('../src/config/sokobanLevels.js');
  assert(Array.isArray(SOKOBAN_LEVELS) && SOKOBAN_LEVELS.length >= 10, `SOKOBAN_LEVELS có ${SOKOBAN_LEVELS.length} màn chơi chuẩn Microban`);

  console.log('\n--- 2. KIỂM TRA LOGIC & TIẾN TRÌNH SUB-ENGINES ---');
  const { PenaltyShootoutEngine } = await import('../src/ui/minigames/sports/PenaltyShootoutEngine.js');
  const { BasketballShootoutEngine } = await import('../src/ui/minigames/sports/BasketballShootoutEngine.js');
  const { VolleyballRallyEngine } = await import('../src/ui/minigames/sports/VolleyballRallyEngine.js');
  const { BaristaSimulatorEngine } = await import('../src/ui/minigames/sports/BaristaSimulatorEngine.js');
  const { CanvasJuiceFX } = await import('../src/ui/minigames/common/CanvasJuiceFX.js');

  const mockCanvas = {
    width: 640,
    height: 360,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      translate: () => {},
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      ellipse: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      measureText: () => ({ width: 50 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} })
    })
  };
  const juiceFX = new CanvasJuiceFX();

  // Test Penalty
  let scoredGoals = 0;
  const penalty = new PenaltyShootoutEngine(mockCanvas, juiceFX, {
    onScoreUpdate: () => { scoredGoals++; }
  });
  assert(penalty.role === 'striker' && penalty.state === 'aiming', 'Penalty bắt đầu ở vị trí Striker ngắm bắn');
  penalty.triggerShoot();
  assert(penalty.state === 'shooting', 'Penalty triggerShoot kích hoạt trạng thái sút bóng');

  // Test Basketball
  const basketball = new BasketballShootoutEngine(mockCanvas, juiceFX);
  assert(basketball.state === 'aiming' && basketball.ball.radius > 0, 'Basketball khởi tạo thành công');
  basketball.shoot();
  assert(basketball.state === 'flying' && basketball.ball.vx !== 0, 'Basketball ném bóng bay theo quỹ đạo xiên');

  // Test Volleyball
  const volleyball = new VolleyballRallyEngine(mockCanvas, juiceFX);
  assert(volleyball.state === 'serving_player' && volleyball.player.isGrounded, 'Volleyball khởi tạo thành công');
  volleyball.onActionTrigger();
  assert(volleyball.state === 'rally' && !volleyball.player.isGrounded, 'Volleyball phát bóng bổng vào trận đấu');

  // Test Barista
  const barista = new BaristaSimulatorEngine(mockCanvas, juiceFX);
  assert(barista.station === 'order' && barista.recipe, 'Barista khởi tạo ở Order Station với công thức chuẩn');
  barista.actionCooldownUntil = 0;
  barista.onActionTrigger();
  assert(barista.station === 'layering', 'Barista chuyển sang Layering Station khi xác nhận order');

  // Test Retro Engines
  const { SnakeEngine } = await import('../src/ui/minigames/retro/SnakeEngine.js');
  const { SokobanEngine } = await import('../src/ui/minigames/retro/SokobanEngine.js');
  const { GoldMinerEngine } = await import('../src/ui/minigames/retro/GoldMinerEngine.js');

  const snake = new SnakeEngine(mockCanvas, juiceFX);
  assert(snake.snake.length === 3 && snake.foods.length >= 2, 'SnakeEngine khởi tạo thân rắn và thức ăn phong phú');
  snake.setDirection(0, 1);
  assert(snake.nextDir.y === 1, 'SnakeEngine cập nhật hướng di chuyển');

  const sokoban = new SokobanEngine(mockCanvas, juiceFX);
  assert(sokoban.map && sokoban.player && sokoban.history.length === 0, 'SokobanEngine nạp map và vị trí người chơi');
  const initPos = { ...sokoban.player };
  sokoban.move(1, 0);
  assert(sokoban.history.length > 0 || sokoban.player.x !== initPos.x || sokoban.map[initPos.y][initPos.x + 1] === 1, 'Sokoban xử lý di chuyển và ghi nhận lịch sử undo');

  const goldMiner = new GoldMinerEngine(mockCanvas, juiceFX);
  assert(goldMiner.hook.state === 'swing' && goldMiner.minerals.length >= 8, 'GoldMinerEngine khởi tạo tời xoay và bãi khoáng sản');
  goldMiner.shootHook();
  assert(goldMiner.hook.state === 'shoot', 'GoldMinerEngine phóng móc tời');

  console.log('\n--- 2b. KIỂM TRA TÍNH NĂNG NÂNG CẤP DELVERIUM (PHASE 4) ---');
  const { RADIAL_EMOTES, RadialEmoteWheel } = await import('../src/ui/gameplay/RadialEmoteWheel.js');
  assert(Array.isArray(RADIAL_EMOTES) && RADIAL_EMOTES.length === 8, 'RadialEmoteWheel có đủ 8 biểu cảm nhanh (Vẫy tay, Thả tim, Pháo hoa, Nhảy, Buggy, Cháy, Vỗ tay, Thắc mắc)');
  assert(typeof RadialEmoteWheel === 'function', 'Class RadialEmoteWheel được xuất bản thành công');

  const { ROOM_LIGHTING_PROFILES, LightingManager } = await import('../src/managers/LightingManager.js');
  assert(ROOM_LIGHTING_PROFILES.server_dungeon && ROOM_LIGHTING_PROFILES.server_dungeon.darknessAlpha > 0.7, 'LightingManager cấu hình hồ sơ phòng tối server_dungeon chính xác');
  assert(typeof LightingManager === 'function', 'Class LightingManager được xuất bản thành công');

  const npcSource = fs.readFileSync(path.join(rootDir, 'src/entities/NPC.js'), 'utf8');
  assert(npcSource.includes('lookAtPlayer(playerX, playerY)') && npcSource.includes('this.initialDirection'), 'NPC có cơ chế Smart Proximity lookAtPlayer 4 hướng và nhớ hướng ban đầu');

  console.log('\n--- 3. KIỂM TRA ĐỒNG BỘ DOM VÀ GIAO DIỆN (INDEX.HTML) ---');
  const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Kiểm tra DOM IDs
  const requiredIds = [
    'sports-arcade-canvas',
    'sports-action-btn',
    'sports-nav-tabs',
    'sports-type-badge',
    'sports-streak-badge',
    'sports-high-badge',
    'sports-touch-controls',
    'sports-btn-left',
    'sports-btn-jump',
    'sports-btn-right',
    'retro-arcade-canvas',
    'arcade-nav-tabs',
    'arcade-type-badge',
    'arcade-score-badge',
    'arcade-high-badge',
    'arcade-game-desc',
    'arcade-touch-controls',
    'arcade-btn-up',
    'arcade-btn-down',
    'arcade-btn-left',
    'arcade-btn-right',
    'arcade-btn-action',
    'arcade-btn-undo'
  ];

  for (const id of requiredIds) {
    assert(htmlContent.includes(`id="${id}"`), `DOM element #${id} hiện diện trong index.html`);
  }

  console.log('\n--- 4. KIỂM TRA QUY CHUẨN EMOJI CONTROL (STRICT EMOJI PROTOCOL) ---');
  // Trích xuất các nút bấm trong pane-sports và pane-arcade-games
  const sportsPaneRegex = /<div id="pane-sports"[\s\S]*?<!-- View Arcade/i;
  const arcadePaneRegex = /<div id="pane-arcade-games"[\s\S]*?<!-- View Robot/i;
  const sportsHtml = htmlContent.match(sportsPaneRegex)?.[0] || '';
  const arcadeHtml = htmlContent.match(arcadePaneRegex)?.[0] || '';

  const buttonTextRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  let btnMatch;
  let buttonsWithEmoji = 0;

  const combinedPaneHtml = sportsHtml + '\n' + arcadeHtml;
  while ((btnMatch = buttonTextRegex.exec(combinedPaneHtml)) !== null) {
    const btnInner = btnMatch[1].trim();
    if (emojiRegex.test(btnInner)) {
      buttonsWithEmoji++;
      console.error(`  [VIOLATION] Nút có chứa emoji: "${btnInner}"`);
    }
  }
  assert(buttonsWithEmoji === 0, '100% nút bấm và tab trong Sports & Arcade tuân thủ nghiêm ngặt Zero-Emoji Rule');

  console.log('\n--- 5. KIỂM TRA THẨM MỸ CSS (MAIN.CSS) ---');
  const cssContent = fs.readFileSync(path.join(rootDir, 'src/styles/main.css'), 'utf8');
  assert(cssContent.includes('#sports-arcade-canvas'), 'CSS có bộ chọn #sports-arcade-canvas');
  assert(cssContent.includes('image-rendering: auto'), 'Canvas thể thao sử dụng image-rendering: auto (không vỡ răng cưa vector)');
  assert(cssContent.includes('.sports-canvas-wrapper'), 'CSS có .sports-canvas-wrapper viền neon');
  assert(cssContent.includes('.arcade-canvas-wrapper'), 'CSS có .arcade-canvas-wrapper bảo vệ canvas cổ điển');
  assert(cssContent.includes('#retro-arcade-canvas'), 'CSS định dạng #retro-arcade-canvas responsive');
  assert(cssContent.includes('.arcade-touch-controls'), 'CSS có .arcade-touch-controls');
  assert(cssContent.includes('.arcade-dpad'), 'CSS có bố cục .arcade-dpad 4 hướng');

  console.log('\n======================================================');
  console.log(`KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS ĐẠT (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests > 0) {
    console.error(`CÓ ${failedTests} KIỂM THỬ THẤT BẠI!`);
    process.exit(1);
  } else {
    console.log('TẤT CẢ KIỂM THỬ ĐỀU ĐẠT CHUẨN XÁC MINH (VERIFIED)!');
  }
}

runVerification().catch(err => {
  console.error('Lỗi thực thi kiểm thử:', err);
  process.exit(1);
});
