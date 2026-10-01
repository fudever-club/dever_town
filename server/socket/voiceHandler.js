import { playerManager } from './playerManager.js';

// Quản lý các phòng Voice/Video đàm thoại: meetingId -> Map(socketId -> peerInfo)
const voiceRooms = new Map();

/**
 * Cấu hình các sự kiện Signaling WebRTC P2P Mesh cho DEVER TOWN
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function setupVoiceHandler(io, socket) {
  /**
   * 1. Tham gia phòng Voice/Video (Join Voice Room)
   */
  socket.on('voice:join', ({ meetingId, micMuted = false, videoMuted = true, isListenOnly = false }) => {
    if (!meetingId) return;

    // Rời phòng cũ nếu đang ở phòng khác
    if (socket._currentVoiceMeeting && socket._currentVoiceMeeting !== meetingId) {
      handleVoiceLeave(socket._currentVoiceMeeting);
    }

    const roomKey = `voice_${meetingId}`;
    socket.join(roomKey);
    socket._currentVoiceMeeting = meetingId;

    if (!voiceRooms.has(meetingId)) {
      voiceRooms.set(meetingId, new Map());
    }
    const roomPeers = voiceRooms.get(meetingId);

    const player = playerManager.getPlayer(socket.id);
    const peerInfo = {
      socketId: socket.id,
      name: player?.name || socket.authUser?.displayName || 'Thành viên',
      avatarId: player?.avatarId || socket.authUser?.avatarId || 'male_1',
      role: player?.role || socket.authUser?.role || 'member',
      micMuted: Boolean(micMuted),
      videoMuted: Boolean(videoMuted),
      isListenOnly: Boolean(isListenOnly),
      isSpeaking: false,
      screenSharing: false,
      handRaised: false,
      handRaisedAt: 0,
      joinedAt: Date.now()
    };

    roomPeers.set(socket.id, peerInfo);

    // Gửi danh sách các thành viên hiện tại cho người mới
    const existingPeers = Array.from(roomPeers.values()).filter(p => p.socketId !== socket.id);
    const hostNow = getVoiceHost(meetingId);
    socket.emit('voice:room_users', {
      meetingId,
      users: existingPeers,
      spotlightedId: roomPeers.spotlightedId || null,
      hostId: hostNow ? hostNow.socketId : null,
    });

    // Thông báo cho các thành viên khác trong phòng biết có người mới gia nhập
    socket.to(roomKey).emit('voice:user_joined', {
      meetingId,
      user: peerInfo
    });

    console.log(`🎙️ [Voice:${meetingId}] ${peerInfo.name} (${socket.id}) đã tham gia phòng. Tổng: ${roomPeers.size} người.`);
  });

  /**
   * 2. Chuyển tiếp tín hiệu WebRTC (SDP Offer/Answer & ICE Candidates)
   */
  socket.on('voice:signal', ({ to, signal }) => {
    if (!to || !signal) return;
    io.to(to).emit('voice:signal', {
      from: socket.id,
      signal
    });
  });

  /**
   * 3. Cập nhật trạng thái thiết bị (Mute Mic, Tắt Camera, Đang nói, Chia sẻ màn hình)
   */
  socket.on('voice:state_change', ({ meetingId, micMuted, videoMuted, isSpeaking, screenSharing, isListenOnly }) => {
    const targetMeeting = meetingId || socket._currentVoiceMeeting;
    if (!targetMeeting || !voiceRooms.has(targetMeeting)) return;

    const roomPeers = voiceRooms.get(targetMeeting);
    const peer = roomPeers.get(socket.id);
    if (!peer) return;

    if (typeof micMuted === 'boolean') peer.micMuted = micMuted;
    if (typeof videoMuted === 'boolean') peer.videoMuted = videoMuted;
    if (typeof isSpeaking === 'boolean') peer.isSpeaking = isSpeaking;
    if (typeof screenSharing === 'boolean') peer.screenSharing = screenSharing;
    if (typeof isListenOnly === 'boolean') peer.isListenOnly = isListenOnly;

    socket.to(`voice_${targetMeeting}`).emit('voice:state_change', {
      meetingId: targetMeeting,
      socketId: socket.id,
      micMuted: peer.micMuted,
      videoMuted: peer.videoMuted,
      isSpeaking: peer.isSpeaking,
      screenSharing: peer.screenSharing,
      isListenOnly: peer.isListenOnly
    });
  });

  /**
   * 4. Rời phòng Voice/Video (Leave Voice Room)
   */
  function handleVoiceLeave(meetingId) {
    const targetMeeting = meetingId || socket._currentVoiceMeeting;
    if (!targetMeeting || !voiceRooms.has(targetMeeting)) {
      socket._currentVoiceMeeting = null;
      return;
    }

    const roomPeers = voiceRooms.get(targetMeeting);
    const peer = roomPeers.get(socket.id);
    if (peer) {
      const wasHost = getVoiceHost(targetMeeting)?.socketId === socket.id;
      roomPeers.delete(socket.id);
      if (roomPeers.size === 0) {
        voiceRooms.delete(targetMeeting);
      } else {
        if (roomPeers.spotlightedId === socket.id) {
          // Người được spotlight rời -> bỏ spotlight cho cả phòng
          roomPeers.spotlightedId = null;
          socket.to(`voice_${targetMeeting}`).emit('voice:spotlight_changed', {
            meetingId: targetMeeting,
            spotlightedId: null,
          });
        }
        if (wasHost) {
          // Host rời -> host mới là người vào sớm nhất còn lại
          const newHost = getVoiceHost(targetMeeting);
          io.to(`voice_${targetMeeting}`).emit('voice:host_changed', {
            meetingId: targetMeeting,
            hostId: newHost ? newHost.socketId : null,
          });
        }
      }
      socket.leave(`voice_${targetMeeting}`);
      socket.to(`voice_${targetMeeting}`).emit('voice:user_left', {
        meetingId: targetMeeting,
        socketId: socket.id,
        userName: peer.name
      });
      console.log(`🔇 [Voice:${targetMeeting}] ${peer.name} (${socket.id}) đã rời phòng.`);
    }

    socket._currentVoiceMeeting = null;
  }

  socket.on('voice:leave', ({ meetingId } = {}) => {
    handleVoiceLeave(meetingId);
  });

  /**
   * Phase 1d: Giơ tay / hạ tay — host thấy ai đang xin phát biểu
   */
  socket.on('voice:raise_hand', ({ meetingId, raised } = {}) => {
    const targetMeeting = meetingId || socket._currentVoiceMeeting;
    if (!targetMeeting || !voiceRooms.has(targetMeeting)) return;
    const roomPeers = voiceRooms.get(targetMeeting);
    const peer = roomPeers.get(socket.id);
    if (!peer) return;
    peer.handRaised = Boolean(raised);
    peer.handRaisedAt = peer.handRaised ? Date.now() : 0;
    io.to(`voice_${targetMeeting}`).emit('voice:hand_changed', {
      meetingId: targetMeeting,
      socketId: socket.id,
      raised: peer.handRaised,
    });
  });

  /**
   * Phase 1d: Xác định host của phòng voice (người vào đầu tiên)
   */
  function getVoiceHost(meetingId) {
    const roomPeers = voiceRooms.get(meetingId);
    if (!roomPeers || roomPeers.size === 0) return null;
    let host = null;
    for (const p of roomPeers.values()) {
      if (!host || p.joinedAt < host.joinedAt) host = p;
    }
    return host;
  }

  /**
   * Phase 1d: Spotlight — host ghim 1 người nói lên màn hình lớn cho cả phòng
   */
  socket.on('voice:spotlight', ({ meetingId, targetSocketId } = {}) => {
    const targetMeeting = meetingId || socket._currentVoiceMeeting;
    if (!targetMeeting || !voiceRooms.has(targetMeeting)) return;
    const host = getVoiceHost(targetMeeting);
    if (!host || host.socketId !== socket.id) {
      socket.emit('voice:error', { message: 'Chỉ host mới spotlight được.' });
      return;
    }
    const roomPeers = voiceRooms.get(targetMeeting);
    // targetSocketId null/'' = bỏ spotlight
    if (targetSocketId && !roomPeers.has(targetSocketId)) return;
    roomPeers.spotlightedId = targetSocketId || null;
    io.to(`voice_${targetMeeting}`).emit('voice:spotlight_changed', {
      meetingId: targetMeeting,
      spotlightedId: roomPeers.spotlightedId,
    });
  });

  /**
   * Phase 1d: Moderation — host tắt mic hoặc mời ra khỏi phòng voice
   */
  socket.on('voice:moderate', ({ meetingId, targetSocketId, action } = {}) => {
    const targetMeeting = meetingId || socket._currentVoiceMeeting;
    if (!targetMeeting || !voiceRooms.has(targetMeeting)) return;
    const host = getVoiceHost(targetMeeting);
    if (!host || host.socketId !== socket.id) return;
    if (!targetSocketId || targetSocketId === socket.id) return;
    const roomPeers = voiceRooms.get(targetMeeting);
    if (!roomPeers.has(targetSocketId)) return;

    if (action === 'mute') {
      io.to(targetSocketId).emit('voice:force_mute', { meetingId: targetMeeting });
      const peer = roomPeers.get(targetSocketId);
      if (peer) peer.micMuted = true;
      socket.to(`voice_${targetMeeting}`).emit('voice:state_change', {
        meetingId: targetMeeting,
        socketId: targetSocketId,
        micMuted: true,
      });
    } else if (action === 'kick') {
      io.to(targetSocketId).emit('voice:kicked', {
        meetingId: targetMeeting,
        reason: 'Host đã mời bạn rời phòng thoại.',
      });
      // Buộc rời phòng ở phía server
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.leave(`voice_${targetMeeting}`);
        targetSocket._currentVoiceMeeting = null;
      }
      roomPeers.delete(targetSocketId);
      socket.to(`voice_${targetMeeting}`).emit('voice:user_left', {
        meetingId: targetMeeting,
        socketId: targetSocketId,
        userName: 'Thành viên',
        kicked: true,
      });
    }
  });

  return {
    handleVoiceLeave
  };
}
