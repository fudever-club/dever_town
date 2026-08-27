import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandler } from './socket/socketHandler.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import { initDatabase, getDB } from './db/index.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// 1. Cấu hình CORS & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Đảm bảo UTF-8 charset cho tất cả API responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 2. Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'DEVER TOWN',
    version: '0.4.0',
    time: new Date().toISOString()
  });
});

// 3. REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// 4. Cấu hình Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 10000,
  pingInterval: 5000
});

// Khởi chạy Socket Handler
setupSocketHandler(io);

// 5. Khởi động DB và Server
async function startServer() {
  try {
    const db = await initDatabase();
    console.log(`📦 [Database] Khởi tạo thành công: ${db.name}`);

    server.listen(PORT, () => {
      console.log('=============================================');
      console.log(`🚀 [DEVER TOWN SERVER v0.4.0] http://localhost:${PORT}`);
      console.log(`🔐 [Auth API] /api/auth (Register, Login, Me, Profile)`);
      console.log(`🏠 [Rooms API] /api/rooms (Data-Driven Room Engine)`);
      console.log(`🔌 [Socket.io] Realtime Engine Sẵn Sàng`);
      console.log('=============================================');
    });
  } catch (err) {
    console.error('❌ Lỗi khởi động máy chủ:', err);
    process.exit(1);
  }
}

startServer();
