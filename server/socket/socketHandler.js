import { playerManager } from './playerManager.js';
import { verifySocketToken } from '../middleware/authMiddleware.js';

export function setupSocketHandler(io) {
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
     * 1. Tham gia thế giới (Join Game) theo Room
     */
    socket.on('joinGame', (clientData = {}) => {
      const player = playerManager.addPlayer(socket.id, clientData, socket.authUser);
      const roomId = player.roomId || 'main_hall';

      // Tham gia Socket.io room channel
      socket.join(roomId);
      console.log(`👤 [Join Room: ${roomId}] ${player.name} [${player.role}] (${player.avatarId})`);

      // Gửi danh sách người chơi trong cùng phòng này cho người mới vào
      const roomPlayers = playerManager.getAllPlayers(roomId);
      socket.emit('currentPlayers', roomPlayers);

      // Thông báo cho các người chơi khác trong cùng phòng
      socket.to(roomId).emit('newPlayer', player);

      // Phát thống kê số lượng từng phòng cho toàn bộ server
      io.emit('roomCounts', playerManager.getRoomCounts());
    });

    /**
     * 2. Chuyển phòng Realtime (Switch Room)
     */
    socket.on('switchRoom', ({ targetRoomId, x, y }) => {
      const result = playerManager.switchRoom(socket.id, targetRoomId, x, y);
      if (!result) return;

      const { player, oldRoomId, newRoomId } = result;
      console.log(`🚪 [Switch Room] ${player.name} chuyển từ [${oldRoomId}] ➔ [${newRoomId}]`);

      // Rời kênh phòng cũ & báo cho các client trong phòng cũ xóa sprite
      socket.leave(oldRoomId);
      socket.to(oldRoomId).emit('playerDisconnected', socket.id);

      // Vào kênh phòng mới
      socket.join(newRoomId);

      // Gửi danh sách người chơi trong phòng mới cho client
      const newRoomPlayers = playerManager.getAllPlayers(newRoomId);
      socket.emit('currentPlayers', newRoomPlayers);

      // Báo cho các client trong phòng mới về sự xuất hiện của người chơi
      socket.to(newRoomId).emit('newPlayer', player);

      // Cập nhật thống kê số lượng phòng
      io.emit('roomCounts', playerManager.getRoomCounts());
    });

    /**
     * 3. Đồng bộ di chuyển Realtime (Phân lập theo Room)
     */
    socket.on('playerMovement', (movementData) => {
      const updated = playerManager.updateMovement(socket.id, movementData);
      if (updated) {
        socket.to(updated.roomId).emit('playerMoved', {
          id: socket.id,
          x: updated.x,
          y: updated.y,
          direction: updated.direction,
          isMoving: updated.isMoving
        });
      }
    });

    /**
     * 4. Xử lý Chat Realtime (Phân lập theo Room)
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
        roomId: player.roomId,
        message: cleanMsg,
        timestamp: Date.now()
      };

      console.log(`💬 [Chat:${player.roomId}] [${player.role.toUpperCase()}] ${player.name}: ${cleanMsg}`);
      // Phát tin nhắn cho mọi người trong cùng phòng (bao gồm người gửi)
      io.to(player.roomId).emit('newChatMessage', chatPayload);
    });

    /**
     * 5. Cập nhật Profile
     */
    socket.on('updateProfile', (data) => {
      const updated = playerManager.updateProfile(socket.id, data);
      if (updated) {
        io.to(updated.roomId).emit('playerUpdated', {
          id: socket.id,
          name: updated.name,
          avatarId: updated.avatarId,
          role: updated.role
        });
      }
    });

    /**
     * 6. Ngắt kết nối
     */
    socket.on('disconnect', () => {
      const removed = playerManager.removePlayer(socket.id);
      if (removed) {
        console.log(`❌ [Disconnect] ${removed.name} (${socket.id}) đã rời khỏi [${removed.roomId}].`);
        socket.to(removed.roomId).emit('playerDisconnected', socket.id);
        io.emit('roomCounts', playerManager.getRoomCounts());
      }
    });
  });
}
