import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { setupSocketHandler } from './socket/socketHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Health check API
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'DEVER TOWN Multiplayer Server',
    timestamp: new Date().toISOString()
  });
});

// Tạo HTTP Server & Socket.io instance
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

// Đăng ký toàn bộ socket events
setupSocketHandler(io);

// Khởi chạy server
server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 [DEVER TOWN SERVER] Running at http://localhost:${PORT}`);
  console.log(`🔌 [Socket.io] Realtime Engine Sẵn Sàng`);
  console.log(`=============================================`);
});
