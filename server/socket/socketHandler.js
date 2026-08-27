import { playerManager } from './playerManager.js';

export function setupSocketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    /**
     * 1. Người chơi gửi yêu cầu tham gia thế giới với Nickname và tọa độ spawn
     */
    socket.on('joinGame', (userData = {}) => {
      const player = playerManager.addPlayer(socket.id, userData);
      console.log(`👤 [Join] ${player.name} (${socket.id}) đã vào thị trấn tại (${player.x}, ${player.y})`);

      // Gửi danh sách toàn bộ người chơi hiện có cho người mới vào
      const allPlayers = playerManager.getAllPlayers();
      socket.emit('currentPlayers', allPlayers);

      // Thông báo cho các người chơi khác về sự xuất hiện của người chơi mới
      socket.broadcast.emit('newPlayer', player);

      // Đồng bộ số lượng người online
      io.emit('onlineCount', playerManager.getOnlineCount());
    });

    /**
     * 2. Đồng bộ vị trí di chuyển Realtime (Throttled từ Client)
     */
    socket.on('playerMovement', (movementData) => {
      const updated = playerManager.updateMovement(socket.id, movementData);
      if (updated) {
        // Broadcast tới tất cả client khác
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
     * 3. Xử lý Chat Realtime & Bong bóng hội thoại
     */
    socket.on('sendChatMessage', (data) => {
      const player = playerManager.getPlayer(socket.id);
      if (!player) return;

      const rawMsg = data?.message || '';
      const cleanMsg = rawMsg.trim().substring(0, 150); // Giới hạn 150 ký tự
      if (!cleanMsg) return;

      const chatPayload = {
        id: socket.id,
        name: player.name,
        message: cleanMsg,
        timestamp: Date.now()
      };

      console.log(`💬 [Chat] ${player.name}: ${cleanMsg}`);

      // Phát cho toàn bộ server (bao gồm cả người gửi để hiển thị vào UI)
      io.emit('newChatMessage', chatPayload);
    });

    /**
     * 4. Cập nhật Nickname
     */
    socket.on('updateNickname', (data) => {
      const newName = data?.name;
      const updated = playerManager.updateNickname(socket.id, newName);
      if (updated) {
        io.emit('playerUpdated', {
          id: socket.id,
          name: updated.name
        });
      }
    });

    /**
     * 5. Xử lý Ngắt kết nối (Disconnect)
     */
    socket.on('disconnect', () => {
      const removed = playerManager.removePlayer(socket.id);
      if (removed) {
        console.log(`❌ [Disconnect] ${removed.name} (${socket.id}) đã rời khỏi thị trấn.`);
        socket.broadcast.emit('playerDisconnected', socket.id);
        io.emit('onlineCount', playerManager.getOnlineCount());
      }
    });
  });
}
