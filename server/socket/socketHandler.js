import { playerManager } from './playerManager.js';
import { verifySocketToken } from '../middleware/authMiddleware.js';
import { mailService } from '../services/mailService.js';
import { setupVoiceHandler } from './voiceHandler.js';
import { createSocketRateLimiter, createCooldownLimiter } from '../utils/rateLimiter.js';

// Theo dõi số kết nối Socket từ mỗi IP (Chống socket DDoS / bot flood)
const ipConnectionCounts = new Map();
const MAX_SOCKETS_PER_IP = 12;

// Danh sách các yêu cầu xác thực thiết bị mới đang chờ duyệt
const pendingApprovals = new Map();

// Rate limiters cho từng event
const friendReqLimiter    = createSocketRateLimiter(5, 60000);  // 5 lời mời/phút
const emoteLimiter        = createCooldownLimiter(2000);        // 1 emote / 2 giây
const wardrobeLimiter     = createCooldownLimiter(5000);        // 1 update / 5 giây
const privateMsgLimiter   = createCooldownLimiter(400);         // 1 DM / 400ms

// Cleanup pendingApprovals hết hạn mỗi 30 giây (ngăn memory leak)
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [reqId, pending] of pendingApprovals.entries()) {
    if (now - pending.createdAt > 60000) { // 60 giây
      clearTimeout(pending.timeoutHandle);
      pendingApprovals.delete(reqId);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[Cleanup] Đã xóa ${cleaned} pendingApprovals hết hạn`);
  }
}, 30000);

/**
 * Helper: Kiểm tra socket đã xác thực chưa
 * @returns {boolean} - false nếu chưa auth (đã emit error cho client)
 */
function requireAuth(socket) {
  if (!socket.authUser?.id) {
    socket.emit('error', { message: 'Yêu cầu đăng nhập để thực hiện hành động này.' });
    return false;
  }
  return true;
}

/**
 * Helper: Lấy IP client an toàn, tránh spoof
 */
function getClientIp(socket) {
  const forwarded = socket.handshake.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return socket.handshake.address || '127.0.0.1';
}



export function setupSocketHandler(io) {
  io.use(async (socket, next) => {
    const clientIp = getClientIp(socket);
    const currentCount = ipConnectionCounts.get(clientIp) || 0;
    if (currentCount >= MAX_SOCKETS_PER_IP) {
      console.warn(`[Socket Block] IP ${clientIp} vượt quá giới hạn ${MAX_SOCKETS_PER_IP} kết nối đồng thời.`);
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
    const clientIp = getClientIp(socket);
    const userAgent = socket.handshake.headers['user-agent'] || 'Web Browser';
    console.log(`[Socket.io] Client connected: ${socket.id} (User: ${socket.authUser ? socket.authUser.displayName : 'Guest'}) [IP: ${clientIp}]`);

    // Khởi tạo Voice/Video Signaling cho socket
    const { handleVoiceLeave } = setupVoiceHandler(io, socket);


    /**
     * 1. Tham gia thế giới (Join Game) - Chế độ 1 Nhân Vật Duy Nhất & Xác Nhận Thiết Bị Mới Thông Minh
     */
    socket.on('joinGame', async (clientData = {}) => {
      const currentDeviceId = clientData.deviceId || socket.handshake.auth?.deviceId || 'device_default';

      // Sanitize player name ngay từ đầu — strip HTML/JS injection chars
      const rawName = String(clientData.name || '').trim();
      clientData.name = rawName
        .replace(/[<>"'`&]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 30) || 'Dever Member';

      // 1. Kiểm tra tài khoản đã đăng nhập
      if (socket.authUser && socket.authUser.id) {
        const activeSessions = playerManager.getPlayersByUserId(socket.authUser.id);
        const otherSessions = activeSessions.filter(p => p.id !== socket.id);

        if (otherSessions.length > 0) {
          const isSameDevice = otherSessions.some(p => p.deviceId && p.deviceId === currentDeviceId);

          if (isSameDevice) {
            // Trường hợp 1: CÙNG THIẾT BỊ (F5 reload / Mở tab mới trên cùng máy)
            // Lập tức thu hồi session cũ và vào game ngay lập tức (Zero Deadlock)
            otherSessions.forEach(oldPlayer => {
              const oldSocket = io.sockets.sockets.get(oldPlayer.id);
              if (oldSocket) {
                oldSocket.emit('sessionReplaced', {
                  message: 'Phiên chơi đã được làm mới ở một cửa sổ khác.'
                });
                oldSocket.disconnect(true);
              }
              const removed = playerManager.removePlayer(oldPlayer.id);
              if (removed) {
                socket.to(removed.roomId).emit('playerDisconnected', oldPlayer.id);
              }
            });
            console.log(`🔄 [Same-Device Reconnect] Tài khoản [${socket.authUser.displayName}] làm mới phiên chơi trên socket ${socket.id}`);
          } else {
            // Trường hợp 2: KHÁC THIẾT BỊ (Ví dụ: PC đang chơi, mở trên Điện Thoại)
            // Kiểm tra xem socket trên thiết bị cũ có đang online không
            const liveOldSockets = otherSessions
              .map(p => io.sockets.sockets.get(p.id))
              .filter(s => s && s.connected);

            if (liveOldSockets.length > 0) {
              const reqId = `handoff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
              const timeStr = new Date().toLocaleTimeString('vi-VN');
              const deviceTypeStr = userAgent.includes('Mobile') ? 'Điện Thoại / Mobile' : 'Máy Tính / PC';

              console.log(`🛡️ [Multi-Device Alert] Yêu cầu chuyển phiên chơi cho [${socket.authUser.displayName}] từ thiết bị [${deviceTypeStr}] (IP: ${clientIp})`);

              // Lưu yêu cầu phê duyệt kèm timeout 35 giây
              const timeoutHandle = setTimeout(() => {
                const pending = pendingApprovals.get(reqId);
                if (pending) {
                  pendingApprovals.delete(reqId);
                  const newSock = io.sockets.sockets.get(pending.newSocketId);
                  if (newSock && newSock.connected) {
                    newSock.emit('deviceTransferDenied', {
                      message: 'Hết thời gian chờ xác nhận từ thiết bị đang hoạt động. Vui lòng thử lại sau!'
                    });
                    newSock.disconnect(true);
                  }
                }
              }, 35000);

              pendingApprovals.set(reqId, {
                requestId: reqId,
                oldSocketIds: liveOldSockets.map(s => s.id),
                newSocketId: socket.id,
                userId: socket.authUser.id,
                userEmail: socket.authUser.email,
                clientData,
                authUser: socket.authUser,
                clientIp,
                timeoutHandle,
                createdAt: Date.now()
              });

              // Gửi Email thông báo bảo mật
              if (socket.authUser.email) {
                mailService.sendNewDeviceAlert(socket.authUser.email, {
                  displayName: socket.authUser.displayName,
                  ip: clientIp,
                  userAgent: deviceTypeStr,
                  time: timeStr,
                  activeDevicesCount: 1
                }).catch(err => console.warn('Lỗi gửi mail thông báo thiết bị mới:', err.message));
              }

              // Gửi thông báo chờ cho thiết bị mới (Điện thoại)
              socket.emit('waitingForApproval', {
                message: 'Tài khoản của bạn đang mở trên thiết bị khác. Vui lòng bấm Xác nhận trên thiết bị đó để chuyển sang máy này.'
              });

              // Hiện Popup Xác nhận trên thiết bị đang chơi (PC)
              liveOldSockets.forEach(s => {
                s.emit('deviceTransferPrompt', {
                  requestId: reqId,
                  ip: clientIp,
                  time: timeStr,
                  deviceType: deviceTypeStr
                });
              });

              return; // DỪNG LẠI: Đợi máy đang chơi bấm Xác nhận!
            } else {
              // Socket cũ đã chết -> Thu dọn sạch sẽ và cho vào game
              otherSessions.forEach(oldPlayer => {
                const removed = playerManager.removePlayer(oldPlayer.id);
                if (removed) {
                  socket.to(removed.roomId).emit('playerDisconnected', oldPlayer.id);
                }
              });
            }
          }
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
     * 1b. Phản hồi Phê Duyệt Chuyển Phiên Chơi sang Thiết Bị Mới
     */
    socket.on('respondDeviceApproval', ({ requestId, approved }) => {
      const pending = pendingApprovals.get(requestId);
      if (!pending) return;

      if (pending.timeoutHandle) clearTimeout(pending.timeoutHandle);
      pendingApprovals.delete(requestId);

      const newSocket = io.sockets.sockets.get(pending.newSocketId);

      if (approved) {
        console.log(`✅ [Handoff Approved] Người dùng đồng ý chuyển phiên [${pending.authUser.displayName}] sang thiết bị mới`);

        // 1. Ngắt kết nối các thiết bị cũ & gỡ nhân vật cũ khỏi Map
        pending.oldSocketIds.forEach(oldId => {
          const oldSocket = io.sockets.sockets.get(oldId);
          if (oldSocket) {
            oldSocket.emit('sessionHandoffSuccess', {
              message: 'Phiên chơi đã được chuyển sang thiết bị mới thành công.'
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
        console.log(`❌ [Handoff Denied] Người dùng từ chối chuyển phiên [${pending.authUser.displayName}]`);
        if (newSocket && newSocket.connected) {
          newSocket.emit('deviceTransferDenied', {
            message: 'Yêu cầu đăng nhập trên thiết bị mới đã bị từ chối bởi thiết bị đang hoạt động.'
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

      if (handleVoiceLeave) handleVoiceLeave();

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
      if (socket._movePackets.length > 20) return; // Tối ưu: tối đa 20 gói tin / giây
      socket._movePackets.push(now);

      // Delta compression: Nếu đứng yên và vị trí hầu như không đổi (< 1.5px) thì không phát tán lại
      const lp = socket._lastBroadcastPos;
      if (lp && !movementData.isMoving && !lp.isMoving) {
        const dx = Math.abs((movementData.x || 0) - lp.x);
        const dy = Math.abs((movementData.y || 0) - lp.y);
        if (dx < 1.5 && dy < 1.5 && movementData.direction === lp.direction) return;
      }
      socket._lastBroadcastPos = {
        x: movementData.x,
        y: movementData.y,
        direction: movementData.direction,
        isMoving: movementData.isMoving
      };

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
     * 4b. Xử lý Chat Riêng 1-1 Bạn Bè (Direct Private Message — rate limit: 1/400ms)
     */
    socket.on('sendPrivateMessage', ({ targetSocketId, targetName, message }) => {
      const sender = playerManager.getPlayer(socket.id);
      if (!sender) return;
      if (!privateMsgLimiter(socket, 'sendPrivateMessage')) return;

      const rawMsg = message || '';
      const cleanMsg = Array.from(rawMsg.normalize('NFC').trim()).slice(0, 150).join('');
      if (!cleanMsg) return;


      let targetPlayer = null;
      let targetSocket = null;

      if (targetSocketId) {
        targetSocket = io.sockets.sockets.get(targetSocketId);
        targetPlayer = playerManager.getPlayer(targetSocketId);
      }

      if (!targetSocket && targetName) {
        targetPlayer = playerManager.findPlayerByName(targetName);
        if (targetPlayer) {
          targetSocket = io.sockets.sockets.get(targetPlayer.id);
        }
      }

      const timestamp = Date.now();
      const privatePayload = {
        senderId: socket.id,
        senderName: sender.name,
        senderRole: sender.role,
        senderAvatarId: sender.avatarId,
        targetId: targetPlayer ? targetPlayer.id : targetSocketId,
        targetName: targetPlayer ? targetPlayer.name : targetName,
        message: cleanMsg,
        timestamp
      };

      if (targetSocket && targetSocket.connected) {
        console.log(`🔒 [PrivateChat] ${sender.name} ➔ ${targetPlayer.name}: ${cleanMsg}`);
        targetSocket.emit('newPrivateMessage', privatePayload);
        socket.emit('privateMessageSent', privatePayload);
      } else {
        socket.emit('privateMessageFailed', {
          targetName: targetName || (targetPlayer ? targetPlayer.name : 'Người chơi'),
          message: 'Người chơi hiện không trực tuyến hoặc đã rời thế giới.'
        });
      }
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
     * 6. Cập nhật Tủ đồ / Wardrobe (auth required + rate limit + schema validation)
     */
    socket.on('updateWardrobe', ({ wardrobeConfig }) => {
      if (!requireAuth(socket)) return;
      if (!wardrobeLimiter(socket, 'updateWardrobe')) return;

      // Schema validation — chỉ cho phép các field đã biết, giới hạn kích thước
      const ALLOWED_WARDROBE_KEYS = [
        'gender', 'hairstyle', 'hairColor', 'outfitType',
        'hoodieColor', 'collarColor', 'pantsColor', 'accessory'
      ];
      const configStr = JSON.stringify(wardrobeConfig || {});
      if (configStr.length > 2048) {
        return socket.emit('error', { message: 'Dữ liệu trang phục vượt quá giới hạn cho phép.' });
      }
      const sanitizedConfig = {};
      ALLOWED_WARDROBE_KEYS.forEach(k => {
        if (wardrobeConfig?.[k] !== undefined) {
          sanitizedConfig[k] = String(wardrobeConfig[k]).slice(0, 50);
        }
      });

      const updated = playerManager.updateWardrobe(socket.id, sanitizedConfig);
      if (updated) {
        io.to(updated.roomId).emit('playerUpdated', {
          id: socket.id,
          avatarId: updated.avatarId,
          wardrobeConfig: updated.wardrobeConfig
        });
      }
    });

    /**
     * 7. Cập nhật Profile (auth required)
     */
    socket.on('updateProfile', (data) => {
      if (!requireAuth(socket)) return;
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
     * 7b. Phát Biểu Cảm / Emote Realtime (rate limit: 1 emote / 2 giây)
     */
    socket.on('playerEmote', ({ emoteId }) => {
      const player = playerManager.getPlayer(socket.id);
      if (!player) return;
      if (!emoteLimiter(socket, 'playerEmote')) return;

      const validEmotes = new Set(['wave', 'heart', 'fire', 'clap', 'dance', 'question']);
      if (!validEmotes.has(emoteId)) return;

      io.to(player.roomId).emit('playerEmote', {
        id: socket.id,
        emoteId
      });
    });

    /**
     * 7c. Gửi Lời Mời Kết Bạn Realtime (auth required + rate limit: 5/phút)
     */
    socket.on('sendFriendRequest', ({ targetSocketId, targetName }) => {
      if (!requireAuth(socket)) return;
      if (!friendReqLimiter(socket, 'sendFriendRequest')) {
        return socket.emit('friendRequestFailed', { message: 'Bạn đang gửi lời mời quá nhanh. Vui lòng thử lại sau.' });
      }

      const sender = playerManager.getPlayer(socket.id);
      if (!sender) return;

      let targetPlayer = null;
      let targetSocket = null;

      if (targetSocketId) {
        targetSocket = io.sockets.sockets.get(targetSocketId);
        targetPlayer = playerManager.getPlayer(targetSocketId);
      }

      if (!targetSocket && targetName) {
        targetPlayer = playerManager.findPlayerByName(targetName);
        if (targetPlayer) {
          targetSocket = io.sockets.sockets.get(targetPlayer.id);
        }
      }

      if (targetSocket && targetSocket.connected && targetPlayer) {
        if (targetSocket.id === socket.id) {
          socket.emit('friendRequestFailed', { message: 'Bạn không thể tự kết bạn với chính mình!' });
          return;
        }

        console.log(`[Friend Request] ${sender.name} (${socket.id}) -> ${targetPlayer.name} (${targetSocket.id})`);
        targetSocket.emit('friendRequestReceived', {
          fromSocketId: socket.id,
          fromUserId: sender.userId || null,
          fromName: sender.name,
          fromAvatarId: sender.avatarId,
          fromRole: sender.role
        });


        socket.emit('friendRequestSent', {
          targetSocketId: targetSocket.id,
          targetName: targetPlayer.name
        });
      } else {
        socket.emit('friendRequestFailed', {
          message: 'Người chơi hiện không trực tuyến hoặc đã rời thế giới.'
        });
      }
    });

    /**
     * 7d. Phản Hồi Lời Mời Kết Bạn (Đồng Ý / Từ Chối)
     */
    socket.on('respondFriendRequest', ({ fromSocketId, accepted }) => {
      const responder = playerManager.getPlayer(socket.id);
      if (!responder) return;

      const requesterSocket = io.sockets.sockets.get(fromSocketId);
      const requester = playerManager.getPlayer(fromSocketId);

      console.log(`🤝 [Friend Request Response] ${responder.name} đã ${accepted ? 'ĐỒNG Ý' : 'TỪ CHỐI'} lời mời của ${requester ? requester.name : fromSocketId}`);

      if (requesterSocket && requesterSocket.connected) {
        requesterSocket.emit('friendRequestResponse', {
          fromSocketId: socket.id,
          fromUserId: responder.userId || null,
          fromName: responder.name,
          fromAvatarId: responder.avatarId,
          fromRole: responder.role,
          accepted: !!accepted
        });
      }
    });

    /**
     * 8. Ngắt kết nối
     */
    socket.on('disconnect', () => {
      if (handleVoiceLeave) handleVoiceLeave();

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
