import { io } from 'socket.io-client';

async function runMultiplayerTest() {
  console.log('🧪 [TEST] Khởi chạy kiểm thử tự động Socket.io Multiplayer...');

  const SERVER_URL = 'http://localhost:3001';
  let passedTests = 0;
  const totalTests = 5;

  // 1. Kết nối Client 1 (Alice)
  const client1 = io(SERVER_URL, { transports: ['websocket', 'polling'] });
  // 2. Kết nối Client 2 (Bob)
  const client2 = io(SERVER_URL, { transports: ['websocket', 'polling'] });

  await new Promise((resolve) => {
    let connected = 0;
    const onConnect = () => {
      connected++;
      if (connected === 2) resolve();
    };
    client1.on('connect', onConnect);
    client2.on('connect', onConnect);
  });

  console.log('✅ TEST 1: Kết nối cả 2 Client thành công.');
  passedTests++;

  // 2. Test Join Game
  await new Promise((resolve) => {
    client2.on('newPlayer', (player) => {
      if (player.name === 'Alice Tester') {
        console.log('✅ TEST 2: Client 2 nhận được thông báo newPlayer của Alice.');
        passedTests++;
        resolve();
      }
    });

    client1.emit('joinGame', { name: 'Alice Tester', x: 300, y: 250 });
  });

  client2.emit('joinGame', { name: 'Bob Tester', x: 350, y: 250 });

  // 3. Test Movement Sync
  await new Promise((resolve) => {
    client2.on('playerMoved', (data) => {
      if (data.x === 320 && data.y === 260) {
        console.log('✅ TEST 3: Client 2 nhận được tọa độ di chuyển chính xác từ Client 1.');
        passedTests++;
        resolve();
      }
    });

    client1.emit('playerMovement', { x: 320, y: 260, direction: 'right', isMoving: true });
  });

  // 4. Test Chat Broadcast
  await new Promise((resolve) => {
    client2.on('newChatMessage', (chat) => {
      if (chat.message === 'Xin chao Bob!' && chat.name === 'Alice Tester') {
        console.log('✅ TEST 4: Client 2 nhận được tin nhắn chat realtime của Alice.');
        passedTests++;
        resolve();
      }
    });

    client1.emit('sendChatMessage', { message: 'Xin chao Bob!' });
  });

  // 5. Test Disconnect Sync
  await new Promise((resolve) => {
    client2.on('playerDisconnected', (id) => {
      if (id === client1.id) {
        console.log('✅ TEST 5: Client 2 nhận được sự kiện playerDisconnected khi Alice ngắt kết nối.');
        passedTests++;
        resolve();
      }
    });

    client1.disconnect();
  });

  client2.disconnect();

  console.log(`\n🎉 KẾT QUẢ KIỂM THỬ: ${passedTests}/${totalTests} TESTS PASSED 100%!`);
  process.exit(0);
}

runMultiplayerTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
