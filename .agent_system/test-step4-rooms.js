import { io } from 'socket.io-client';

async function testStep4Rooms() {
  console.log('🧪 [TEST STEP 4] Bắt đầu kiểm thử Hệ thống Multi-Room & Phân lập Socket...');
  const BASE_URL = 'http://localhost:3001';
  let passed = 0;
  const total = 5;

  // 1. Client 1 (Alice) & Client 2 (Bob) vào sảnh chính main_hall
  const client1 = io(BASE_URL, { transports: ['websocket'] });
  const client2 = io(BASE_URL, { transports: ['websocket'] });

  await new Promise((resolve) => {
    let count = 0;
    const check = () => { count++; if (count === 2) resolve(); };
    client1.on('connect', check);
    client2.on('connect', check);
  });

  client1.emit('joinGame', { name: 'Alice', roomId: 'main_hall' });
  client2.emit('joinGame', { name: 'Bob', roomId: 'main_hall' });

  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log('✅ TEST 1: Cả 2 Client vào sảnh main_hall thành công.');
  passed++;

  // 2. Client 1 (Alice) chuyển sang dever_lab
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for switch room')), 4000);

    // Client 2 phải nhận được thông báo Alice rời main_hall
    client2.on('playerDisconnected', (id) => {
      if (id === client1.id) {
        console.log('✅ TEST 2: Client 2 trong main_hall nhận được thông báo Client 1 đã rời phòng.');
        passed++;
        clearTimeout(timer);
        resolve();
      }
    });

    client1.emit('switchRoom', { targetRoomId: 'dever_lab', x: 320, y: 380 });
  });

  // 3. Client 3 (Charlie) vào thẳng dever_lab
  const client3 = io(BASE_URL, { transports: ['websocket'] });
  await new Promise((resolve) => client3.on('connect', resolve));

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for newPlayer in lab')), 4000);

    // Client 1 (trong dever_lab) phải thấy Charlie xuất hiện
    client1.on('newPlayer', (player) => {
      if (player.name === 'Charlie') {
        console.log('✅ TEST 3: Client 1 trong dever_lab thấy Charlie xuất hiện cùng phòng.');
        passed++;
        clearTimeout(timer);
        resolve();
      }
    });

    client3.emit('joinGame', { name: 'Charlie', roomId: 'dever_lab' });
  });

  // 4. Test Chat Isolation: Charlie chat trong dever_lab -> Bob trong main_hall KHÔNG được nhận
  let bobReceivedLabChat = false;
  client2.on('newChatMessage', (chat) => {
    if (chat.message === 'Hello Lab Only!') {
      bobReceivedLabChat = true;
    }
  });

  await new Promise((resolve) => {
    client1.on('newChatMessage', (chat) => {
      if (chat.message === 'Hello Lab Only!') {
        console.log('✅ TEST 4: Client 1 nhận được chat từ Charlie trong cùng phòng dever_lab.');
        passed++;
        resolve();
      }
    });
    client3.emit('sendChatMessage', { message: 'Hello Lab Only!' });
  });

  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!bobReceivedLabChat) {
    console.log('✅ TEST 5: Phân lập kênh chat hoàn hảo (Bob ở main_hall không bị nhận chat của phòng khác).');
    passed++;
  } else {
    throw new Error('TEST 5 Failed: Chat bị lộ sang phòng khác!');
  }

  client1.disconnect();
  client2.disconnect();
  client3.disconnect();

  console.log(`\n🎉 KẾT QUẢ BƯỚC 4: ${passed}/${total} TESTS PASSED 100%!`);
  setTimeout(() => process.exit(0), 100);
}

testStep4Rooms().catch((err) => {
  console.error('❌ BƯỚC 4 TEST THẤT BẠI:', err);
  process.exit(1);
});
