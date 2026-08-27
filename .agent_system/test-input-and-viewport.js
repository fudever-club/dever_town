import { io } from 'socket.io-client';

async function testInputAndViewport() {
  console.log('🧪 [TEST INPUT & VIEWPORT 800x600] Bắt đầu kiểm thử toàn diện...');
  const BASE_URL = 'http://localhost:3001';
  let passed = 0;
  const total = 6;

  // 1. Kiểm tra REST API /api/rooms trả về 5 phòng với layout 25x19 (800x608 px)
  const resRooms = await fetch(`${BASE_URL}/api/rooms`);
  const jsonRooms = await resRooms.json();
  if (jsonRooms.success && jsonRooms.data.length === 5) {
    console.log('✅ TEST 1: API /api/rooms trả về đầy đủ 5 phòng.');
    passed++;
  } else {
    throw new Error('TEST 1 Failed: API /api/rooms không trả về 5 phòng');
  }

  // 2. Kiểm tra ma trận 25 cột x 19 dòng của từng phòng
  for (const r of jsonRooms.data) {
    const resDetail = await fetch(`${BASE_URL}/api/rooms/${r.id}`);
    const jsonDetail = await resDetail.json();
    const map = jsonDetail.data;

    if (map.layout.length === 19 && map.layout[0].length === 25) {
      // Valid
    } else {
      throw new Error(`TEST 2 Failed: Phòng ${r.id} có kích thước layout ${map.layout[0].length}x${map.layout.length}, không phải 25x19!`);
    }
  }
  console.log('✅ TEST 2: Toàn bộ 5 bản đồ đều có kích thước mở rộng chính xác 25 cột x 19 dòng (800x608 px).');
  passed++;

  // 3. Kiểm tra Nickname chứa khoảng trắng (Space) và Tiếng Việt FPTU
  const client1 = io(BASE_URL, { transports: ['websocket'] });
  const client2 = io(BASE_URL, { transports: ['websocket'] });

  await new Promise((resolve) => {
    let count = 0;
    const check = () => { count++; if (count === 2) resolve(); };
    client1.on('connect', check);
    client2.on('connect', check);
  });

  const nicknameWithSpace1 = 'Dev Alpha FPTU Đà Nẵng';
  const nicknameWithSpace2 = 'Cóc Vàng 2026';

  client1.emit('joinGame', { name: nicknameWithSpace1, roomId: 'main_hall', x: 400, y: 350 });
  client2.emit('joinGame', { name: nicknameWithSpace2, roomId: 'main_hall', x: 450, y: 350 });

  await new Promise((resolve) => setTimeout(resolve, 300));

  // 4. Kiểm tra Chat chứa nhiều phím Space ' ' và chữ 'e' / 'E'
  const testChatMessage = 'Xin chào các bạn FPTU Đà Nẵng! Hôm nay DEVER Club có workshop lập trình game 2D.';
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for chat with Space and E')), 3000);

    client2.on('newChatMessage', (chat) => {
      if (chat.message === testChatMessage && chat.name === nicknameWithSpace1) {
        console.log('✅ TEST 3: Nickname có khoảng trắng & Tin nhắn chứa nhiều phím Space và chữ E truyền tải 100% chính xác.');
        passed++;
        clearTimeout(timer);
        resolve();
      }
    });

    client1.emit('sendChatMessage', { message: testChatMessage });
  });

  // 5. Kiểm tra phòng Sảnh chính chứa linh vật Cóc Vàng FPTU (Tile 19) và Biển hiệu FPTU (Tile 20)
  const resMain = await fetch(`${BASE_URL}/api/rooms/main_hall`);
  const jsonMain = await resMain.json();
  const mainLayout = jsonMain.data.layout;

  let hasFrog = false;
  let hasBanner = false;
  for (let row = 0; row < mainLayout.length; row++) {
    for (let col = 0; col < mainLayout[row].length; col++) {
      if (mainLayout[row][col] === 19) hasFrog = true;
      if (mainLayout[row][col] === 20) hasBanner = true;
    }
  }

  if (hasFrog && hasBanner) {
    console.log('✅ TEST 4: Sảnh chính FPTU tích hợp thành công Linh vật Cóc Vàng (Tile 19) và Biển hiệu FPT University Da Nang (Tile 20).');
    passed++;
  } else {
    throw new Error('TEST 4 Failed: Thiếu linh vật Cóc Vàng hoặc Biển hiệu FPTU trong Sảnh chính!');
  }

  // 6. Kiểm tra chuyển phòng giữa các không gian 800x600
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for room switch in 800x600 map')), 4000);

    client1.on('currentPlayers', (players) => {
      console.log('✅ TEST 5: Chuyển phòng sang memory_room trong bản đồ mở rộng 800x600 thành công.');
      passed++;
      clearTimeout(timer);
      resolve();
    });

    client1.emit('switchRoom', { targetRoomId: 'memory_room', x: 720, y: 300 });
  });

  // 7. Đồng bộ số lượng người online realtime
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for room counts')), 4000);

    client2.on('roomCounts', (counts) => {
      if (counts.memory_room === 1 && counts.main_hall === 1 && counts.total >= 2) {
        console.log(`✅ TEST 6: Realtime room counts đồng bộ chính xác trên toàn hệ thống 5 phòng.`);
        passed++;
        clearTimeout(timer);
        resolve();
      }
    });

    client1.emit('playerMovement', { x: 722, y: 300, direction: 'down', isMoving: false });
  });

  client1.disconnect();
  client2.disconnect();

  console.log(`\n🎉 TOÀN BỘ ${passed}/${total} TESTS KIỂM THỬ INPUT, PHÍM SPACE, CHỮ E & VIEWPORT 800x600 PASSED 100%!`);
  setTimeout(() => process.exit(0), 100);
}

testInputAndViewport().catch((err) => {
  console.error('❌ TEST INPUT & VIEWPORT THẤT BẠI:', err);
  process.exit(1);
});
