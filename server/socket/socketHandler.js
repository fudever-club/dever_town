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
     * 1. Tham gia thế giới (Join Game) - Chế độ 1 Nhân Vật Duy Nhất / Handoff Phê Duyệt Thiết Bị Mới
     */
    socket.on('joinGame', async (clientData = {}) => {
      // 1. Kiểm tra tài khoản đã đăng nhập
      if (socket.authUser && socket.authUser.id) {
        const activeSessions = playerManager.getPlayersByUserId(socket.authUser.id);

        // Nếu tài khoản đang có nhân vật online trên một thiết bị khác (Máy A):
        if (activeSessions.length > 0 && !activeSessions.some(p => p.id === socket.id)) {
          const reqId = `handoff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const timeStr = new Date().toLocaleTimeString('vi-VN');
          const deviceTypeStr = userAgent.includes('Mobile') ? 'Điện Thoại / Mobile' : 'Máy Tính / PC';

          console.log(`⏳ [Handoff Pending] Yêu cầu chuyển phiên chơi cho [${socket.authUser.displayName}] từ thiết bị [${deviceTypeStr}] (IP: ${clientIp})`);

          // Lưu thông tin chờ phê duyệt từ thiết bị cũ
          pendingApprovals.set(reqId, {
            requestId: reqId,
            oldSocketIds: activeSessions.map(s => s.id),
            newSocketId: socket.id,
            userId: socket.authUser.id,
            userEmail: socket.authUser.email,
            clientData,
            authUser: socket.authUser,
            clientIp,
            createdAt: Date.now()
          });

          // 1a. Gửi Email thông báo bảo mật
          if (socket.authUser.email) {
            mailService.sendNewDeviceAlert(socket.authUser.email, {
              displayName: socket.authUser.displayName,
              ip: clientIp,
              userAgent: deviceTypeStr,
              time: timeStr,
              activeDevicesCount: 1
            });
          }

          // 1b. Gửi yêu cầu chờ tới thiết bị mới (Máy B)
          socket.emit('waitingForApproval', {
            message: `Tài khoản của bạn đang chơi trên thiết bị khác. Vui lòng bấm [Đồng ý] trên thiết bị đó để chuyển sang máy này!`
          });

          // 1c. Hiện Modal Xác Nhận trên thiết bị đang online (Máy A)
          activeSessions.forEach(p => {
            io.to(p.id).emit('deviceTransferPrompt', {
              requestId: reqId,
              ip: clientIp,
              time: timeStr,
              deviceType: deviceTypeStr
            });
          });

          return; // DỪNG LẠI: Không spawn nhân vật thứ 2 vào Map cho đến khi máy A bấm Cho phép!
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

      // Spawn nhân vật duy nhất vào Game
      const player = playerManager.addPlayer(socket.id, clientData, socket.authUser);
      const roomId = player.roomId || 'main_hall';

      socket.join(roomId);
      console.log(`👤 [Join Room: ${roomId}] ${player.name} [${player.role}] (${player.avatarId})`);

      const roomPlayers = playerManager.getAllPlayers(roomId);
      socket.emit('currentPlayers', roomPlayers);
      socket.to(roomId).emit('newPlayer', player);
      io.emit('roomCounts', playerManager.getRoomCounts());
    });

    /**
     * 1b. Phản hồi Phê Duyệt Chuyển Phiên Chơi sang Thiết Bị Mới
     */
    socket.on('respondDeviceApproval', ({ requestId, approved }) => {
      const pending = pendingApprovals.get(requestId);
      if (!pending) return;

      pendingApprovals.delete(requestId);
      const newSocket = io.sockets.sockets.get(pending.newSocketId);

      if (approved) {
        console.log(`✅ [Handoff Approved] Đã đồng ý chuyển phiên chơi của user [${pending.authUser.displayName}] sang thiết bị mới`);

        // 1. Ngắt kết nối các thiết bị cũ & gỡ nhân vật cũ khỏi Map
        pending.oldSocketIds.forEach(oldId => {
          const oldSocket = io.sockets.sockets.get(oldId);
          if (oldSocket) {
            oldSocket.emit('sessionHandoffSuccess', {
              message: 'Phiên chơi của bạn đã được chuyển thành công sang thiết bị mới!'
            });
            oldSocket.disconnect(true);
          }
          const removed = playerManager.removePlayer(oldId);
          if (removed) {
            socket.to(removed.roomId).emit('playerDisconnected', oldId);
          }
        });

        // 2. Cho phép thiết bị mới vào game và spawn đúng 1 nhân vật duy nhất
        if (newSocket && newSocket.connected) {
          const player = playerManager.addPlayer(pending.newSocketId, pending.clientData, pending.authUser);
          const roomId = player.roomId || 'main_hall';

          newSocket.join(roomId);
          newSocket.emit('deviceTransferApproved', { player });

          const roomPlayers = playerManager.getAllPlayers(roomId);
          newSocket.emit('currentPlayers', roomPlayers);
          newSocket.to(roomId).emit('newPlayer', player);
          io.emit('roomCounts', playerManager.getRoomCounts());
        }
      } else {
        console.log(`❌ [Handoff Denied] Từ chối chuyển phiên chơi của user [${pending.authUser.displayName}]`);
        if (newSocket && newSocket.connected) {
          newSocket.emit('deviceTransferDenied', {
            message: '🚫 Yêu cầu chuyển phiên chơi đã bị TỪ CHỐI bởi thiết bị đang hoạt động!'
          });
          newSocket.disconnect(true);
        }
      }
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
