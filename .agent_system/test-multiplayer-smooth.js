import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 BẮT ĐẦU KIỂM THỬ TỐI ƯU MULTIPLAYER & HOẠT ẢNH SPINNER BÁO LAG...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, extraInfo = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${extraInfo}`);
  }
}

async function runTests() {
  // Test 1: File NetworkStatusOverlay.js tồn tại
  assert(fs.existsSync(path.join(rootDir, 'src', 'ui', 'NetworkStatusOverlay.js')), 'Tồn tại file NetworkStatusOverlay.js');

  // Test 2: RemotePlayer.js có delta-time interpolation
  const remotePlayerCode = fs.readFileSync(path.join(rootDir, 'src', 'entities', 'RemotePlayer.js'), 'utf-8');
  assert(remotePlayerCode.includes('update(time, delta'), 'RemotePlayer.js hỗ trợ delta-time frame-rate independent update');
  assert(remotePlayerCode.includes('Phaser.Math.Linear'), 'RemotePlayer.js sử dụng Linear interpolation mượt mà');
  assert(remotePlayerCode.includes('distSq > 10000'), 'RemotePlayer.js xử lý teleport snap chống glitch');

  // Test 3: Server socketHandler.js có volatile emit và pingCheck
  const socketHandlerCode = fs.readFileSync(path.join(rootDir, 'server', 'socket', 'socketHandler.js'), 'utf-8');
  assert(socketHandlerCode.includes('socket.volatile.to'), 'socketHandler.js sử dụng volatile.emit chống tích luỹ giật lag');
  assert(socketHandlerCode.includes('pingCheck') && socketHandlerCode.includes('pongCheck'), 'socketHandler.js có cơ chế Heartbeat Ping/Pong');

  // Test 4: index.html chứa lag-spinner-overlay và network-ping-badge
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  assert(indexHtml.includes('lag-spinner-overlay'), 'index.html chứa container lag-spinner-overlay');
  assert(indexHtml.includes('network-ping-badge'), 'index.html chứa badge network-ping-badge');
  assert(indexHtml.includes('spinner-ring outer'), 'index.html chứa cấu trúc hoạt ảnh spinner xoay vòng');

  // Test 5: main.css chứa styles cho spinner animation
  const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf-8');
  assert(mainCss.includes('.lag-spinner-overlay'), 'main.css chứa CSS .lag-spinner-overlay');
  assert(mainCss.includes('@keyframes spin360'), 'main.css chứa keyframes hoạt ảnh spin360');
  assert(mainCss.includes('.network-ping-badge.good'), 'main.css chứa styles màu cho network ping');

  // Test 6: Zero-Regression 8 phòng
  const { MAPS_CONFIG } = await import('../src/config/maps.js');
  assert(Object.keys(MAPS_CONFIG).length === 8, 'Bảo toàn tuyệt đối 8 phòng trong MAPS_CONFIG');

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ KIỂM THỬ MULTIPLAYER SMOOTH & LAG SPINNER: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`========================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
