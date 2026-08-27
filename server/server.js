import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { initDatabase } from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import { setupSocketHandler } from './socket/socketHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Health check API
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'DEVER TOWN Multiplayer & Auth Server',
    version: '0.3.0',
    timestamp: new Date().toISOString()
  });
});

// Tạo HTTP Server & Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

// Khởi chạy Database và Server
async function startServer() {
  try {
    await initDatabase();
    setupSocketHandler(io);

    server.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(`🚀 [DEVER TOWN SERVER v0.3.0] http://localhost:${PORT}`);
      console.log(`🔐 [Auth API] /api/auth (Register, Login, Me, Profile)`);
      console.log(`🔌 [Socket.io] Realtime Engine Sẵn Sàng`);
      console.log(`=============================================`);
    });
  } catch (err) {
    console.error(`💥 Lỗi nghiêm trọng khi khởi động server:`, err);
    process.exit(1);
  }
}

startServer();
