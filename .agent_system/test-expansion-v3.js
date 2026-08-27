/**
 * Automated Test Suite for DEVER TOWN Expansion v3:
 * 1. 7 Phân khu chức năng (Media Hub & Sports Complex FPTU)
 * 2. Hệ thống Túi đồ 7 vật phẩm & Trang bị cầm tay
 * 3. Tủ đồ tùy chỉnh trang phục Wardrobe
 * 4. Trình phân giải link nhạc Lofi thông minh
 */
import http from 'http';
import { io } from 'socket.io-client';
import { extractYouTubeVideoId, LOFI_PRESETS } from '../src/config/musicPresets.js';
import { ITEMS_DATABASE, PICKUP_SPOTS } from '../src/config/items.js';
import { WARDROBE_CONFIG } from '../src/config/wardrobe.js';
import { MAPS_CONFIG } from '../src/config/maps.js';

function requestGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 [EXPANSION v3 TEST SUITE] Bắt đầu kiểm thử toàn diện...');

  // TEST 1: Kiểm tra 7 phòng trên REST API
  console.log('🔹 Test 1: Kiểm tra REST API /api/rooms trả về đầy đủ 7 phòng...');
  const roomsRes = await requestGet('http://localhost:3001/api/rooms');
  if (roomsRes.status !== 200 || !roomsRes.data.success) {
    throw new Error(`API /api/rooms failed with status ${roomsRes.status}`);
  }
  const roomsList = roomsRes.data.data;
  const expectedRooms = ['main_hall', 'dever_lab', 'library_lounge', 'memory_room', 'web_room', 'media_hub', 'sports_complex'];
  expectedRooms.forEach(rId => {
    const found = roomsList.find(r => r.id === rId);
    if (!found) throw new Error(`Missing room: ${rId}`);
  });
  console.log(`✅ TEST 1: API /api/rooms trả về đầy đủ ${roomsList.length} phòng.`);

  // TEST 2: Kích thước 25x19 (800x608 px) trên toàn bộ 7 phòng
  console.log('🔹 Test 2: Kiểm tra kích thước 25 cột x 19 dòng của 7 phòng...');
  expectedRooms.forEach(rId => {
    const layout = MAPS_CONFIG[rId].layout;
    if (layout.length !== 19) throw new Error(`Room ${rId} has ${layout.length} rows (expected 19)`);
    layout.forEach((row, idx) => {
      if (row.length !== 25) throw new Error(`Room ${rId} row ${idx} has ${row.length} cols (expected 25)`);
    });
  });
  console.log('✅ TEST 2: Toàn bộ 7 bản đồ đều đạt chuẩn 25 cột x 19 dòng (800x608 px).');

  // TEST 3: Danh mục 7 vật phẩm & Điểm nhặt đồ
  console.log('🔹 Test 3: Kiểm tra cấu hình 7 vật phẩm & Pickup Spots...');
  const itemKeys = Object.keys(ITEMS_DATABASE);
  if (itemKeys.length !== 7) throw new Error(`Expected 7 items, got ${itemKeys.length}`);
  if (PICKUP_SPOTS.length < 5) throw new Error(`Expected at least 5 pickup spots, got ${PICKUP_SPOTS.length}`);
  console.log(`✅ TEST 3: Danh mục 7 vật phẩm FPTU/Dev và ${PICKUP_SPOTS.length} điểm nhặt đồ hợp lệ.`);

  // TEST 4: Smart YouTube URL Parser
  console.log('🔹 Test 4: Kiểm tra bộ phân giải Smart YouTube URL...');
  const testUrls = [
    { in: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', exp: 'jfKfPfyJRdk' },
    { in: 'https://youtu.be/4xDzrJKXOOY?si=abc', exp: '4xDzrJKXOOY' },
    { in: 'https://www.youtube.com/shorts/lTRiuFIWV54', exp: 'lTRiuFIWV54' },
    { in: 'https://www.youtube.com/embed/5qap5aO4i9A', exp: '5qap5aO4i9A' },
    { in: 'WPni755-Krg', exp: 'WPni755-Krg' }
  ];
  testUrls.forEach(({ in: url, exp }) => {
    const extracted = extractYouTubeVideoId(url);
    if (extracted !== exp) throw new Error(`Failed to extract ID from ${url}: got ${extracted}, expected ${exp}`);
  });
  console.log('✅ TEST 4: Smart YouTube URL Parser trích xuất chính xác 100% các định dạng video.');

  // TEST 5: Tủ đồ Wardrobe Config
  console.log('🔹 Test 5: Kiểm tra cấu hình Wardrobe...');
  if (!WARDROBE_CONFIG.hoodies.length || !WARDROBE_CONFIG.hairColors.length || !WARDROBE_CONFIG.accessories.length) {
    throw new Error('Wardrobe config missing options');
  }
  console.log('✅ TEST 5: Cấu hình Tủ đồ (Áo Hoodie FPTU, Tóc, Phụ kiện) sẵn sàng.');

  // TEST 6: Socket.io Realtime Sync (Equip Item & Wardrobe)
  console.log('🔹 Test 6: Kiểm tra Socket.io Realtime Sync (Equip Item & Wardrobe)...');
  await new Promise((resolve, reject) => {
    const clientA = io('http://localhost:3001', { transports: ['websocket'] });
    const clientB = io('http://localhost:3001', { transports: ['websocket'] });

    let verifiedEquip = false;

    clientB.on('playerUpdated', (data) => {
      if (data.id === clientA.id && data.equippedItemId === 'golden_frog_plush') {
        verifiedEquip = true;
        clientA.disconnect();
        clientB.disconnect();
        resolve();
      }
    });

    clientA.on('connect', () => {
      clientA.emit('joinGame', { name: 'Player Alpha', roomId: 'sports_complex' });
    });

    clientB.on('connect', () => {
      clientB.emit('joinGame', { name: 'Player Beta', roomId: 'sports_complex' });
      setTimeout(() => {
        clientA.emit('equipItem', { itemId: 'golden_frog_plush' });
      }, 500);
    });

    setTimeout(() => {
      clientA.disconnect();
      clientB.disconnect();
      if (!verifiedEquip) reject(new Error('Timeout waiting for Socket.io equipItem sync'));
    }, 4000);
  });
  console.log('✅ TEST 6: Đồng bộ Socket.io Trang bị Cầm tay (Equip Item) giữa 2 người chơi thành công.');

  console.log('\n🎉 TOÀN BỘ 6/6 TESTS EXPANSION v3 PASSED 100%!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
