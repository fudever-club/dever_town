import { playerManager } from './playerManager.js';
import { verifySocketToken } from '../middleware/authMiddleware.js';

export function setupSocketHandler(io) {
  /**
   * Socket.io Handshake Middleware: Xác thực JWT Token nếu có
   */
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      const user = await verifySocketToken(token);
      if (user) {
        socket.authUser = {
          id: user.id,
          displayName: user.display_name,
          avatarId: user.avatar_id,
          role: user.role
        };
        console.log(`🔐 [Socket Auth] Xác thực thành công: ${user.display_name} (${user.role})`);
      } else {
        socket.authUser = null;
      }
    } else {
      socket.authUser = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id} (User: ${socket.authUser ? socket.authUser.displayName : 'Guest'})`);

    /**
     * 1. Tham gia thế giới (Join Game)
     */
    socket.on('joinGame', (clientData = {}) => {
      const player = playerManager.addPlayer(socket.id, clientData, socket.authUser);
      console.log(`👤 [Join] ${player.name} [${player.role}] (${player.avatarId}) tại (${player.x}, ${player.y})`);

      // Gửi danh sách người chơi hiện có cho người mới vào
      const allPlayers = playerManager.getAllPlayers();
      socket.emit('currentPlayers', allPlayers);

      // Thông báo cho mọi người về sự xuất hiện của người chơi mới
      socket.broadcast.emit('newPlayer', player);

      // Đồng bộ số lượng online
      io.emit('onlineCount', playerManager.getOnlineCount());
    });

    /**
     * 2. Đồng bộ di chuyển Realtime (30 FPS Throttled)
     */
    socket.on('playerMovement', (movementData) => {
      const updated = playerManager.updateMovement(socket.id, movementData);
      if (updated) {
        socket.broadcast.emit('playerMoved', {
          id: socket.id,
          x: updated.x,
          y: updated.y,
          direction: updated.direction,
          isMoving: updated.isMoving
        });
      }
    });

    /**
     * 3. Xử lý Chat Realtime kèm Role Badge & Avatar
     */
    socket.on('sendChatMessage', (data) => {
      const player = playerManager.getPlayer(socket.id);
      if (!player) return;

      const rawMsg = data?.message || '';
      const cleanMsg = rawMsg.trim().substring(0, 150);
      if (!cleanMsg) return;

      const chatPayload = {
        id: socket.id,
        name: player.name,
        role: player.role,
        avatarId: player.avatarId,
        message: cleanMsg,
        timestamp: Date.now()
      };

      console.log(`💬 [Chat] [${player.role.toUpperCase()}] ${player.name}: ${cleanMsg}`);
      io.emit('newChatMessage', chatPayload);
    });

    /**
     * 4. Cập nhật Profile (Tên hoặc Avatar)
     */
    socket.on('updateProfile', (data) => {
      const updated = playerManager.updateProfile(socket.id, data);
      if (updated) {
        io.emit('playerUpdated', {
          id: socket.id,
          name: updated.name,
          avatarId: updated.avatarId,
          role: updated.role
        });
      }
    });

    /**
     * 5. Ngắt kết nối
     */
    socket.on('disconnect', () => {
      const removed = playerManager.removePlayer(socket.id);
      if (removed) {
        console.log(`❌ [Disconnect] ${removed.name} (${socket.id}) đã rời.`);
        socket.broadcast.emit('playerDisconnected', socket.id);
        io.emit('onlineCount', playerManager.getOnlineCount());
      }
    });
  });
}
