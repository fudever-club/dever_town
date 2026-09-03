import { playerManager } from './playerManager.js';
import { verifySocketToken } from '../middleware/authMiddleware.js';
import { mailService } from '../services/mailService.js';

// Theo dõi số kết nối Socket từ mỗi IP (Chống socket DDoS / bot flood)
const ipConnectionCounts = new Map();
const MAX_SOCKETS_PER_IP = 12;

// Danh sách các yêu cầu xác thực thiết bị mới đang chờ duyệt
const pendingApprovals = new Map();

export function setupSocketHandler(io) {
  io.use(async (socket, next) => {
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '127.0.0.1';
    const currentCount = ipConnectionCounts.get(clientIp) || 0;
    if (currentCount >= MAX_SOCKETS_PER_IP) {
      console.warn(`🛑 [Socket Block] IP ${clientIp} vượt quá giới hạn ${MAX_SOCKETS_PER_IP} kết nối đồng thời.`);
      return next(new Error('Quá nhiều kết nối đồng thời từ IP của bạn!'));
    }
    ipConnectionCounts.set(clientIp, currentCount + 1);

    const token = socket.handshake.auth?.token;
    if (token) {
      const user = await verifySocketToken(token);
      if (user) {
        socket.authUser = {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          avatarId: user.avatar_id,
          role: user.role,
          wardrobeConfig: user.wardrobe_config,
          equippedItemId: user.equipped_item_id
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
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '127.0.0.1';
    const userAgent = socket.handshake.headers['user-agent'] || 'Web Browser';
    console.log(`🔌 [Socket.io] Client connected: ${socket.id} (User: ${socket.authUser ? socket.authUser.displayName : 'Guest'}) [IP: ${clientIp}]`);

    /**
     * 1. Tham gia thế giới (Join Game) - Chế độ 1 Nhân Vật Duy Nhất / Tự Động Thu Hồi Phiên Cũ (Single Active Session)
     */
    socket.on('joinGame', async (clientData = {}) => {
      const currentDeviceId = clientData.deviceId || socket.handshake.auth?.deviceId || 'device_default';

      // 1. Kiểm tra tài khoản đã đăng nhập
      if (socket.authUser && socket.authUser.id) {
        const activeSessions = playerManager.getPlayersByUserId(socket.authUser.id);
        const otherSessions = activeSessions.filter(p => p.id !== socket.id);

        if (otherSessions.length > 0) {
          const isSameDevice = otherSessions.some(p => p.deviceId && p.deviceId === currentDeviceId);

          // Thu hồi và ngắt kết nối các session cũ của tài khoản này
          otherSessions.forEach(oldPlayer => {
            const oldSocket = io.sockets.sockets.get(oldPlayer.id);
            if (oldSocket) {
              oldSocket.emit('sessionReplaced', {
                message: isSameDevice
                  ? 'Phiên chơi đã được kết nối ở một cửa sổ khác.'
                  : 'Tài khoản của bạn vừa được đăng nhập trên một thiết bị khác.'
              });
              oldSocket.disconnect(true);
            }
            const removed = playerManager.removePlayer(oldPlayer.id);
            if (removed) {
              socket.to(removed.roomId).emit('playerDisconnected', oldPlayer.id);
            }
          });

          // Chỉ gửi email bảo mật khi thực sự là thiết bị khác (khác deviceId)
          if (!isSameDevice && socket.authUser.email) {
            const timeStr = new Date().toLocaleTimeString('vi-VN');
            const deviceTypeStr = userAgent.includes('Mobile') ? 'Điện Thoại / Mobile' : 'Máy Tính / PC';
            mailService.sendNewDeviceAlert(socket.authUser.email, {
              displayName: socket.authUser.displayName,
              ip: clientIp,
              userAgent: deviceTypeStr,
              time: timeStr,
              activeDevicesCount: 1
            }).catch(err => console.warn('Lỗi gửi mail thông báo thiết bị mới:', err.message));
          }

          console.log(`🔄 [Session Takeover] Tài khoản [${socket.authUser.displayName}] chuyển phiên kết nối sang socket ${socket.id} (Same Device: ${isSameDevice})`);
        }
      } else {
        // Khách vãng lai: Đảm bảo không trùng tên với người đang online trong Map
        const allPlayers = Array.from(playerManager.players.values());
        const cleanName = (clientData.name || '').trim().toLowerCase();
        const isDuplicate = allPlayers.some(p => p.id !== socket.id && (p.name || '').toLowerCase() === cleanName);
        if (isDuplicate) {
          clientData.name = `${clientData.name || 'Khách'} #${Math.floor(1000 + Math.random() * 9000)}`;
        }
      }

      // Đính kèm deviceId vào clientData khi thêm player
      clientData.deviceId = currentDeviceId;

      // Spawn nhân vật duy nhất vào Game
      const player = playerManager.addPlayer(socket.id, clientData, socket.authUser);
      const roomId = player.roomId || 'main_hall';

      socket.join(roomId);
      console.log(`👤 [Join Room: ${roomId}] ${player.name} [${player.role}] (${player.avatarId}) [Device: ${currentDeviceId.slice(0, 10)}]`);

      const roomPlayers = playerManager.getAllPlayers(roomId);
      socket.emit('currentPlayers', roomPlayers);
      socket.to(roomId).emit('newPlayer', player);
      io.emit('roomCounts', playerManager.getRoomCounts());
    });

    /**
     * 1b. Tương thích ngược phản hồi chuyển thiết bị (nếu có client cũ gọi)
     */
    socket.on('respondDeviceApproval', ({ requestId, approved }) => {
      const pending = pendingApprovals.get(requestId);
      if (!pending) return;
      pendingApprovals.delete(requestId);
    });

    /**
     * 2. Chuyển phòng Realtime (Switch Room)
     */
    socket.on('switchRoom', ({ targetRoomId, x, y }) => {
      const result = playerManager.switchRoom(socket.id, targetRoomId, x, y);
      if (!result) return;

      const { player, oldRoomId, newRoomId } = result;
      console.log(`🚪 [Switch Room] ${player.name} chuyển từ [${oldRoomId}] ➔ [${newRoomId}]`);

      socket.leave(oldRoomId);
      socket.to(oldRoomId).emit('playerDisconnected', socket.id);

      socket.join(newRoomId);

      const newRoomPlayers = playerManager.getAllPlayers(newRoomId);
      socket.emit('currentPlayers', newRoomPlayers);
      socket.to(newRoomId).emit('newPlayer', player);
      io.emit('roomCounts', playerManager.getRoomCounts());
    });

    /**
     * 3. Đồng bộ di chuyển Realtime (Có Rate Throttling chống move spam)
     */
    socket.on('playerMovement', (movementData) => {
      const now = Date.now();
      if (!socket._movePackets) socket._movePackets = [];
      socket._movePackets = socket._movePackets.filter(ts => now - ts < 1000);
      if (socket._movePackets.length > 35) return; // Tối đa 35 gói tin di chuyển / giây
      socket._movePackets.push(now);

      const updated = playerManager.updateMovement(socket.id, movementData);
      if (updated) {
        socket.volatile.to(updated.roomId).emit('playerMoved', {
          id: socket.id,
          x: updated.x,
          y: updated.y,
          direction: updated.direction,
          isMoving: updated.isMoving
        });
      }
    });

    /**
     * 3b. Heartbeat Ping/Pong để đo độ trễ Latency
     */
    socket.on('pingCheck', (clientTs) => {
      socket.emit('pongCheck', clientTs);
    });

    /**
     * 4. Xử lý Chat Realtime (Có Anti-Spam Throttle)
     */
    socket.on('sendChatMessage', (data) => {
      const player = playerManager.getPlayer(socket.id);
      if (!player) return;

      // Anti-spam cooldown (tối thiểu 400ms giữa 2 tin nhắn liên tiếp)
      const now = Date.now();
      if (socket._lastChatTime && (now - socket._lastChatTime < 400)) {
        return;
      }
      socket._lastChatTime = now;

      const rawMsg = data?.message || '';
      const cleanMsg = Array.from(rawMsg.normalize('NFC').trim()).slice(0, 150).join('');
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
      io.to(player.roomId).emit('newChatMessage', chatPayload);
    });

    /**
     * 5. Trang bị / Cầm tay vật phẩm
     */
    socket.on('equipItem', ({ itemId }) => {
      const updated = playerManager.equipItem(socket.id, itemId);
      if (updated) {
        io.to(updated.roomId).emit('playerUpdated', {
          id: socket.id,
          equippedItemId: updated.equippedItemId
        });
      }
    });

    /**
     * 6. Cập nhật Tủ đồ / Wardrobe
     */
    socket.on('updateWardrobe', ({ wardrobeConfig }) => {
      const updated = playerManager.updateWardrobe(socket.id, wardrobeConfig);
      if (updated) {
        io.to(updated.roomId).emit('playerUpdated', {
          id: socket.id,
          avatarId: updated.avatarId,
          wardrobeConfig: updated.wardrobeConfig
        });
      }
    });

    /**
     * 7. Cập nhật Profile
     */
    socket.on('updateProfile', (data) => {
      const updated = playerManager.updateProfile(socket.id, data);
      if (updated) {
        io.to(updated.roomId).emit('playerUpdated', {
          id: socket.id,
          name: updated.name,
          avatarId: updated.avatarId,
          role: updated.role,
          equippedItemId: updated.equippedItemId
        });
      }
    });

    /**
     * 8. Ngắt kết nối
     */
    socket.on('disconnect', () => {
      // Giảm bộ đếm kết nối IP khi client ngắt kết nối
      const current = ipConnectionCounts.get(clientIp) || 1;
      if (current <= 1) ipConnectionCounts.delete(clientIp);
      else ipConnectionCounts.set(clientIp, current - 1);

      const removed = playerManager.removePlayer(socket.id);
      if (removed) {
        console.log(`❌ [Disconnect] ${removed.name} (${socket.id}) đã rời khỏi [${removed.roomId}].`);
        socket.to(removed.roomId).emit('playerDisconnected', socket.id);
        io.emit('roomCounts', playerManager.getRoomCounts());
      }
    });
  });
}
