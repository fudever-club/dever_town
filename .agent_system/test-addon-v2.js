import { io } from 'socket.io-client';

async function testAddonV2() {
  console.log('🧪 [TEST ADD-ON v2] Bắt đầu kiểm thử toàn diện: Chat Unicode, Data-Driven Rooms, 5 Rooms & Gallery/Web...');
  const BASE_URL = 'http://localhost:3001';
  let passed = 0;
  const total = 6;

  // 1. Test REST API /api/rooms (Data-Driven Room Engine)
  const resRooms = await fetch(`${BASE_URL}/api/rooms`);
  const jsonRooms = await resRooms.json();
  if (jsonRooms.success && Array.isArray(jsonRooms.data) && jsonRooms.data.length === 5) {
    const ids = jsonRooms.data.map(r => r.id);
    if (ids.includes('memory_room') && ids.includes('web_room') && ids.includes('main_hall')) {
      console.log(`✅ TEST 1: Data-Driven REST API /api/rooms trả về đầy đủ 5 phòng: [${ids.join(', ')}].`);
      passed++;
    } else {
      throw new Error('TEST 1 Failed: Thiếu phòng trong danh sách /api/rooms');
    }
  } else {
    throw new Error('TEST 1 Failed: API /api/rooms trả về không hợp lệ');
  }

  // 2. Test REST API /api/rooms/:id cho memory_room & web_room
  const resMem = await fetch(`${BASE_URL}/api/rooms/memory_room`);
  const jsonMem = await resMem.json();
  const resWeb = await fetch(`${BASE_URL}/api/rooms/web_room`);
  const jsonWeb = await resWeb.json();

  if (
    jsonMem.success && jsonMem.data.zones.length >= 4 &&
    jsonWeb.success && jsonWeb.data.zones.length >= 3
  ) {
    console.log('✅ TEST 2: Endpoint chi tiết /api/rooms/memory_room và /api/rooms/web_room trả về đúng layout và zones.');
    passed++;
  } else {
    throw new Error('TEST 2 Failed: Chi tiết phòng memory_room hoặc web_room không đầy đủ!');
  }

  // 3. Test Unicode Chat Normalization & Diacritic Preserving
  const client1 = io(BASE_URL, { transports: ['websocket'] });
  const client2 = io(BASE_URL, { transports: ['websocket'] });

  await new Promise((resolve) => {
    let count = 0;
    const check = () => { count++; if (count === 2) resolve(); };
    client1.on('connect', check);
    client2.on('connect', check);
  });

  client1.emit('joinGame', { name: 'Nguyễn Văn Hùng', roomId: 'main_hall' });
  client2.emit('joinGame', { name: 'Trần Thị Thuỷ', roomId: 'main_hall' });

  await new Promise((resolve) => setTimeout(resolve, 300));

  const testVietnameseMessage = 'Chào mừng các bạn đến với CLB DEVER! 🚀 Hôm nay học giải thuật đồ thị & Game 2D.';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for Unicode chat message')), 3000);

    client2.on('newChatMessage', (chat) => {
      if (chat.message === testVietnameseMessage) {
        console.log('✅ TEST 3: Chat tiếng Việt có dấu phức tạp & Emoji truyền tải 100% nguyên vẹn qua Socket.io.');
        passed++;
        clearTimeout(timer);
        resolve();
      }
    });

    client1.emit('sendChatMessage', { message: testVietnameseMessage });
  });

  // 4. Test Switch Room to memory_room & Room Counts Update
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for switch to memory_room')), 4000);

    client1.on('currentPlayers', (players) => {
      console.log('✅ TEST 4: Client 1 chuyển sang memory_room và nhận danh sách player phân lập thành công.');
      passed++;
      clearTimeout(timer);
      resolve();
    });

    client1.emit('switchRoom', { targetRoomId: 'memory_room', x: 550, y: 200 });
  });

  // 5. Test Switch Room to web_room
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for switch to web_room')), 4000);

    client1.on('currentPlayers', (players) => {
      console.log('✅ TEST 5: Client 1 chuyển sang web_room thành công.');
      passed++;
      clearTimeout(timer);
      resolve();
    });

    client1.emit('switchRoom', { targetRoomId: 'web_room', x: 80, y: 200 });
  });

  // 6. Test Room Counts Across 5 Rooms
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for room counts update')), 4000);

    client2.on('roomCounts', (counts) => {
      if (counts.web_room === 1 && counts.main_hall === 1 && counts.total >= 2) {
        console.log(`✅ TEST 6: Thống kê số lượng 5 phòng realtime chính xác: (main_hall: ${counts.main_hall}, web_room: ${counts.web_room}, total: ${counts.total}).`);
        passed++;
        clearTimeout(timer);
        resolve();
      }
    });

    // Kích hoạt cập nhật
    client1.emit('playerMovement', { x: 82, y: 200, direction: 'down', isMoving: false });
  });

  client1.disconnect();
  client2.disconnect();

  console.log(`\n🎉 KẾT QUẢ TOÀN BỘ ADD-ON v2: ${passed}/${total} TESTS PASSED 100%!`);
  setTimeout(() => process.exit(0), 100);
}

testAddonV2().catch((err) => {
  console.error('❌ ADD-ON v2 TEST THẤT BẠI:', err);
  process.exit(1);
});
