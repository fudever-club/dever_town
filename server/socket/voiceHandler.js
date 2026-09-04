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
  socket.on('voice:join', ({ meetingId, micMuted = false, videoMuted = true }) => {
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
      isSpeaking: false,
      screenSharing: false,
      joinedAt: Date.now()
    };

    roomPeers.set(socket.id, peerInfo);

    // Gửi danh sách các thành viên hiện tại cho người mới
    const existingPeers = Array.from(roomPeers.values()).filter(p => p.socketId !== socket.id);
    socket.emit('voice:room_users', {
      meetingId,
      users: existingPeers
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
  socket.on('voice:state_change', ({ meetingId, micMuted, videoMuted, isSpeaking, screenSharing }) => {
    const targetMeeting = meetingId || socket._currentVoiceMeeting;
    if (!targetMeeting || !voiceRooms.has(targetMeeting)) return;

    const roomPeers = voiceRooms.get(targetMeeting);
    const peer = roomPeers.get(socket.id);
    if (!peer) return;

    if (typeof micMuted === 'boolean') peer.micMuted = micMuted;
    if (typeof videoMuted === 'boolean') peer.videoMuted = videoMuted;
    if (typeof isSpeaking === 'boolean') peer.isSpeaking = isSpeaking;
    if (typeof screenSharing === 'boolean') peer.screenSharing = screenSharing;

    socket.to(`voice_${targetMeeting}`).emit('voice:state_change', {
      meetingId: targetMeeting,
      socketId: socket.id,
      micMuted: peer.micMuted,
      videoMuted: peer.videoMuted,
      isSpeaking: peer.isSpeaking,
      screenSharing: peer.screenSharing
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
      roomPeers.delete(socket.id);
      if (roomPeers.size === 0) {
        voiceRooms.delete(targetMeeting);
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

  return {
    handleVoiceLeave
  };
}
