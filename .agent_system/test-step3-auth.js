import { io } from 'socket.io-client';

async function testStep3Auth() {
  console.log('🧪 [TEST STEP 3] Bắt đầu kiểm thử toàn diện Auth REST API & Socket Handshake...');
  const BASE_URL = 'http://localhost:3001';
  let passed = 0;
  const total = 6;

  // 1. Test Login with seeded Admin
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@devertown.com', password: 'admin123' })
  });
  const adminData = await adminLoginRes.json();
  if (adminData.success && adminData.user.role === 'admin' && adminData.token) {
    console.log('✅ TEST 1: Đăng nhập Admin thành công, nhận JWT Token & Role admin.');
    passed++;
  } else {
    throw new Error('TEST 1 Failed: ' + JSON.stringify(adminData));
  }

  // 2. Test Register new user
  const randomEmail = `dev_${Date.now()}@dever.club`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: randomEmail,
      password: 'password123',
      displayName: 'Nguyen Van Dev',
      avatarId: 'cyberpunk_pink'
    })
  });
  const regData = await regRes.json();
  if (regData.success && regData.user.email === randomEmail && regData.user.avatar_id === 'cyberpunk_pink') {
    console.log('✅ TEST 2: Đăng ký tài khoản mới thành công kèm Avatar cyberpunk_pink.');
    passed++;
  } else {
    throw new Error('TEST 2 Failed: ' + JSON.stringify(regData));
  }

  // 3. Test GET /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${regData.token}` }
  });
  const meData = await meRes.json();
  if (meData.success && meData.user.display_name === 'Nguyen Van Dev') {
    console.log('✅ TEST 3: Xác thực JWT qua GET /api/auth/me trả về đúng thông tin user.');
    passed++;
  } else {
    throw new Error('TEST 3 Failed: ' + JSON.stringify(meData));
  }

  // 4. Test PUT /api/auth/profile
  const updateRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${regData.token}`
    },
    body: JSON.stringify({
      displayName: 'Pro Developer 2026',
      avatarId: 'green_coder'
    })
  });
  const updateData = await updateRes.json();
  if (updateData.success && updateData.user.display_name === 'Pro Developer 2026' && updateData.user.avatar_id === 'green_coder') {
    console.log('✅ TEST 4: Cập nhật hồ sơ & đổi Avatar sang green_coder thành công.');
    passed++;
  } else {
    throw new Error('TEST 4 Failed: ' + JSON.stringify(updateData));
  }

  // 5. Test Socket Handshake with Token (Admin)
  const adminSocket = io(BASE_URL, {
    transports: ['websocket'],
    auth: { token: adminData.token }
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket connect timeout')), 4000);
    adminSocket.on('connect', () => {
      clearTimeout(timer);
      console.log('✅ TEST 5: Socket Handshake với Admin Token thành công.');
      passed++;
      resolve();
    });
  });

  // 6. Test Join Game as Admin and verify role/name
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Join game timeout')), 4000);
    adminSocket.on('currentPlayers', (players) => {
      clearTimeout(timer);
      const myPlayer = players[adminSocket.id];
      if (myPlayer && myPlayer.role === 'admin' && myPlayer.name === 'Dever Admin') {
        console.log('✅ TEST 6: Server gán đúng Role 👑 Admin và Avatar cho Admin Socket.');
        passed++;
        resolve();
      } else {
        reject(new Error('Player data mismatch: ' + JSON.stringify(myPlayer)));
      }
    });

    adminSocket.emit('joinGame', {});
  });

  adminSocket.disconnect();
  console.log(`\n🎉 KẾT QUẢ BƯỚC 3: ${passed}/${total} TESTS PASSED 100%!`);
  process.exit(0);
}

testStep3Auth().catch((err) => {
  console.error('❌ BƯỚC 3 TEST THẤT BẠI:', err);
  process.exit(1);
});
