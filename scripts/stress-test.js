import { io } from 'socket.io-client';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const found = args.find(a => a.startsWith('--' + name + '='));
  return found ? found.split('=')[1] : fallback;
};

const TARGET_BOTS = parseInt(getArg('bots', '100'), 10);
const DURATION_SEC = parseInt(getArg('duration', '30'), 10);
const SERVER_URL = getArg('url', 'http://localhost:3001');
const SPAWN_INTERVAL_MS = parseInt(getArg('spawnRate', '30'), 10);
const ROOMS = [
  'main_hall',
  'dever_lab',
  'game_arcade',
  'library_lounge',
  'memory_room',
  'web_room',
  'media_hub',
  'sports_complex',
  'canteen_cafe'
];
const AVATARS = ['dev_hoodie', 'designer_hoodie', 'tester_hoodie', 'fuda_student'];

console.clear();
console.log('='.repeat(68));
console.log('DEVER TOWN - MULTIPLAYER STRESS TEST BENCHMARK');
console.log('='.repeat(68));
console.log('Server Target:  ' + SERVER_URL);
console.log('Target Bots:    ' + TARGET_BOTS + ' Concurrent Players');
console.log('Duration:       ' + DURATION_SEC + ' seconds');
console.log('Spawn Interval: ' + SPAWN_INTERVAL_MS + 'ms per bot');
console.log('='.repeat(68));
console.log('Connecting simulated bots...');

const stats = {
  connected: 0,
  disconnected: 0,
  errors: 0,
  movementsSent: 0,
  movementsReceived: 0,
  chatsSent: 0,
  chatsReceived: 0,
  latencies: [],
  startTime: Date.now()
};
const bots = [];
let shuttingDown = false;
let finished = false;

function createBot(index) {
  const roomId = ROOMS[index % ROOMS.length];
  const avatarId = AVATARS[index % AVATARS.length];
  let posX = 300 + (index % 10) * 20;
  let posY = 300 + Math.floor(index / 10) * 20;
  const socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: false,
    timeout: 8000
  });
  let moveInterval = null;
  let pingInterval = null;
  let chatInterval = null;

  socket.on('connect', () => {
    stats.connected++;
    socket.emit('joinGame', {
      name: 'Tester Bot #' + (index + 1),
      avatarId,
      role: 'guest',
      roomId,
      x: posX,
      y: posY
    });

    const dirs = ['down', 'left', 'right', 'up'];
    moveInterval = setInterval(() => {
      if (!socket.connected) return;

      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      if (dir === 'left') posX = Math.max(100, posX - 4);
      if (dir === 'right') posX = Math.min(700, posX + 4);
      if (dir === 'up') posY = Math.max(100, posY - 4);
      if (dir === 'down') posY = Math.min(500, posY + 4);
      socket.emit('playerMovement', {
        x: posX,
        y: posY,
        direction: dir,
        isMoving: true
      });
      stats.movementsSent++;
    }, 100);

    pingInterval = setInterval(() => {
      if (!socket.connected) return;
      socket.emit('pingCheck', Date.now());
    }, 2500);

    chatInterval = setInterval(() => {
      if (!socket.connected) return;
      if (Math.random() < 0.1) {
        socket.emit('sendChatMessage', { message: 'Hello from Bot #' + (index + 1) });
        stats.chatsSent++;
      }
    }, 5000);
  });

  socket.on('pongCheck', (clientTs) => {
    const lat = Date.now() - clientTs;
    stats.latencies.push(lat);
    if (stats.latencies.length > 500) stats.latencies.shift();
  });

  socket.on('playerMoved', () => {
    stats.movementsReceived++;
  });

  socket.on('newChatMessage', () => {
    stats.chatsReceived++;
  });

  socket.on('disconnect', () => {
    stats.connected = Math.max(0, stats.connected - 1);
    if (!shuttingDown) stats.disconnected++;
    clearInterval(moveInterval);
    clearInterval(pingInterval);
    clearInterval(chatInterval);
  });

  socket.on('connect_error', () => {
    stats.errors++;
  });

  bots.push({ socket, moveInterval, pingInterval, chatInterval });
}

let spawned = 0;
const spawnTimer = setInterval(() => {
  if (spawned < TARGET_BOTS) {
    createBot(spawned);
    spawned++;
  } else {
    clearInterval(spawnTimer);
  }
}, SPAWN_INTERVAL_MS);

const dashboardTimer = setInterval(() => {
  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
  const avgPing = stats.latencies.length
    ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
    : 0;
  const maxPing = stats.latencies.length ? Math.max(...stats.latencies) : 0;
  const minPing = stats.latencies.length ? Math.min(...stats.latencies) : 0;

  process.stdout.write(
    '\r[' + elapsed + 's/' + DURATION_SEC + 's] | Bots Online: ' + stats.connected + '/' +
    TARGET_BOTS + ' | Ping: ' + avgPing + 'ms (Min: ' + minPing + 'ms, Max: ' +
    maxPing + 'ms) | Sent: ' + stats.movementsSent + ' | Errors: ' + stats.errors + ' '
  );

  if (elapsed >= DURATION_SEC) {
    clearInterval(dashboardTimer);
    finishTest();
  }
}, 1000);

function finishTest() {
  if (finished) return;
  finished = true;
  shuttingDown = true;
  clearInterval(spawnTimer);

  console.log('\n\n' + '='.repeat(68));
  console.log('DEVER TOWN MULTIPLAYER LOAD TEST RESULTS');
  console.log('='.repeat(68));

  // Snapshot the observed test state before the intentional teardown emits
  // disconnect events and takes the live connection count back to zero.
  const connectedAtFinish = stats.connected;
  const spawnedAtFinish = spawned;
  bots.forEach(b => {
    clearInterval(b.moveInterval);
    clearInterval(b.pingInterval);
    clearInterval(b.chatInterval);
    b.socket.disconnect();
  });

  const avgPing = stats.latencies.length
    ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
    : 0;
  const maxPing = stats.latencies.length ? Math.max(...stats.latencies) : 0;

  console.log('Spawned Bots:     ' + spawnedAtFinish + ' / ' + TARGET_BOTS);
  console.log('Connected Bots:   ' + connectedAtFinish + ' / ' + TARGET_BOTS);
  console.log('Connection Errors:' + stats.errors);
  console.log('Unexpected Drops: ' + stats.disconnected);
  console.log('Packets Sent:     ' + stats.movementsSent);
  console.log('Packets Received: ' + stats.movementsReceived);
  console.log('Avg Latency:      ' + avgPing + ' ms');
  console.log('Max Latency:      ' + maxPing + ' ms');
  console.log('='.repeat(68));

  const passed = spawnedAtFinish === TARGET_BOTS &&
    connectedAtFinish === TARGET_BOTS &&
    stats.errors === 0 &&
    stats.disconnected === 0;
  process.exit(passed ? 0 : 1);
}
