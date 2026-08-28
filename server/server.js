import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandler } from './socket/socketHandler.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import { initDatabase, getDB } from './db/index.js';
import { createRateLimiter } from './middleware/rateLimiter.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

// 1. Cấu hình CORS & Middlewares Bảo Vệ
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Giới hạn kích thước payload JSON tối đa 100KB (Chống payload overflow / DoS)
app.use(express.json({ limit: '100kb' }));

// Security Headers (Chống MIME-type sniffing, Clickjacking, XSS)
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Global API Rate Limiter (Tối đa 120 requests / 1 phút / IP)
const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'Quá nhiều yêu cầu từ IP của bạn. Vui lòng thử lại sau 1 phút!'
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

// 3. REST API Routes (Được bảo vệ bởi Global Limiter)
app.use('/api/auth', globalApiLimiter, authRoutes);
app.use('/api/rooms', globalApiLimiter, roomRoutes);
app.use('/api/game', globalApiLimiter, gameRoutes);

// 4. Cấu hình Socket.io với Giới hạn Buffer & Timeout chống DDoS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e5, // 100KB max payload
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
