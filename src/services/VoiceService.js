/**
 * DEVER TOWN - Voice & Video Service (Discord-Style WebRTC P2P Mesh)
 * Kết nối âm thanh & hình ảnh trực tiếp không độ trễ giữa người chơi trong phòng.
 * Không phụ thuộc dịch vụ bên thứ ba (Jitsi/Zoom/8x8), hoạt động 100% tự nhiên.
 */

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export class VoiceService {
  constructor() {
    this.socket = null;
    this.meetingId = null;
    this.localStream = null;
    this.screenStream = null;
    this.peerConnections = new Map(); // socketId -> RTCPeerConnection
    this.remoteStreams = new Map(); // socketId -> MediaStream
    this.peers = new Map(); // socketId -> peerInfo

    this.micMuted = false;
    this.videoMuted = true;
    this.isScreenSharing = false;
    this.isJoined = false;

    // Web Audio Active Speaker Detection
    this.audioContext = null;
    this.analyserNodes = new Map(); // id -> AnalyserNode
    this.checkVolumeInterval = null;
    this.isLocalSpeaking = false;

    // Callbacks
    this.onPeersUpdated = null;
    this.onTrackReceived = null;
    this.onSpeakingChanged = null;
    this.onStatusChanged = null;
  }

  /**
   * Khởi tạo liên kết Socket và các bộ nhận sự kiện
   */
  init(socket, callbacks = {}) {
    this.socket = socket;
    this.onPeersUpdated = callbacks.onPeersUpdated;
    this.onTrackReceived = callbacks.onTrackReceived;
    this.onSpeakingChanged = callbacks.onSpeakingChanged;
    this.onStatusChanged = callbacks.onStatusChanged;

    if (!this.socket) return;

    this.setupSocketListeners();
  }

  setupSocketListeners() {
    if (!this.socket) return;

    // 1. Nhận danh sách các thành viên đang có trong phòng
    this.socket.on('voice:room_users', async ({ meetingId, users }) => {
      if (meetingId !== this.meetingId) return;
      console.log(`🎙️ [VoiceService] Nhận danh sách ${users.length} thành viên trong phòng.`);

      for (const user of users) {
        this.peers.set(user.socketId, user);
        // Mình là người mới gia nhập -> Đóng vai trò Initiator kết nối tới các peer hiện hữu
        await this.createPeerConnection(user.socketId, true);
      }

      if (this.onPeersUpdated) this.onPeersUpdated(Array.from(this.peers.values()));
      if (this.onStatusChanged) this.onStatusChanged('connected', this.peers.size + 1);
    });

    // 2. Có thành viên mới vừa tham gia phòng
    this.socket.on('voice:user_joined', async ({ meetingId, user }) => {
      if (meetingId !== this.meetingId) return;
      console.log(`🎙️ [VoiceService] Thành viên mới gia nhập: ${user.name} (${user.socketId})`);
      this.peers.set(user.socketId, user);

      // Đợi người mới gửi Offer SDP tới
      if (this.onPeersUpdated) this.onPeersUpdated(Array.from(this.peers.values()));
      if (this.onStatusChanged) this.onStatusChanged('connected', this.peers.size + 1);
    });

    // 3. Nhận tín hiệu WebRTC Signaling (Offer, Answer, ICE Candidate)
    this.socket.on('voice:signal', async ({ from, signal }) => {
      try {
        let pc = this.peerConnections.get(from);

        if (signal.type === 'offer') {
          if (!pc) {
            pc = await this.createPeerConnection(from, false);
          }
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          // Thêm các tracks hiện có vào kết nối
          if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
              const senders = pc.getSenders();
              const alreadyAdded = senders.some(s => s.track === track);
              if (!alreadyAdded) pc.addTrack(track, this.localStream);
            });
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          this.socket.emit('voice:signal', {
            to: from,
            signal: { type: 'answer', sdp: answer }
          });
        } else if (signal.type === 'answer') {
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          }
        } else if (signal.type === 'candidate' && signal.candidate) {
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.warn('⚠️ Lỗi xử lý WebRTC Signal:', err);
      }
    });

    // 4. Trạng thái Mic/Cam của thành viên thay đổi
    this.socket.on('voice:state_change', ({ socketId, micMuted, videoMuted, isSpeaking, screenSharing }) => {
      const peer = this.peers.get(socketId);
      if (peer) {
        if (typeof micMuted === 'boolean') peer.micMuted = micMuted;
        if (typeof videoMuted === 'boolean') peer.videoMuted = videoMuted;
        if (typeof isSpeaking === 'boolean') peer.isSpeaking = isSpeaking;
        if (typeof screenSharing === 'boolean') peer.screenSharing = screenSharing;

        if (this.onPeersUpdated) this.onPeersUpdated(Array.from(this.peers.values()));
        if (this.onSpeakingChanged) this.onSpeakingChanged(socketId, isSpeaking);
      }
    });

    // 5. Thành viên rời phòng
    this.socket.on('voice:user_left', ({ socketId }) => {
      console.log(`🔇 [VoiceService] Thành viên rời phòng: ${socketId}`);
      this.closePeerConnection(socketId);
      this.peers.delete(socketId);

      if (this.onPeersUpdated) this.onPeersUpdated(Array.from(this.peers.values()));
      if (this.onStatusChanged) this.onStatusChanged('connected', this.peers.size + 1);
    });
  }

  /**
   * Tạo RTCPeerConnection cho một đối tác (Peer)
   */
  async createPeerConnection(remoteSocketId, isInitiator = false) {
    if (this.peerConnections.has(remoteSocketId)) {
      return this.peerConnections.get(remoteSocketId);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnections.set(remoteSocketId, pc);

    // Gắn local tracks vào kết nối
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Lắng nghe ICE Candidate sinh ra để gửi cho đối phương
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('voice:signal', {
          to: remoteSocketId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Nhận luồng Audio / Video từ remote peer
    pc.ontrack = (event) => {
      console.log(`🎥 [VoiceService] Nhận track từ ${remoteSocketId}: ${event.track.kind}`);
      let stream = this.remoteStreams.get(remoteSocketId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(remoteSocketId, stream);
      }
      stream.addTrack(event.track);

      // Nếu là audio track, kích hoạt Volume Analyser để nhận biết khi họ đang nói
      if (event.track.kind === 'audio') {
        this.setupRemoteAudioAnalyser(remoteSocketId, stream);
      }

      if (this.onTrackReceived) {
        this.onTrackReceived(remoteSocketId, stream, event.track.kind);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.closePeerConnection(remoteSocketId);
      }
    };

    // Nếu là người khởi tạo kết nối (Initiator), tạo Offer SDP
    if (isInitiator) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);

        if (this.socket) {
          this.socket.emit('voice:signal', {
            to: remoteSocketId,
            signal: { type: 'offer', sdp: offer }
          });
        }
      } catch (err) {
        console.warn('Lỗi tạo WebRTC Offer:', err);
      }
    }

    return pc;
  }

  /**
   * Đóng một RTCPeerConnection
   */
  closePeerConnection(socketId) {
    const pc = this.peerConnections.get(socketId);
    if (pc) {
      try { pc.close(); } catch (e) {}
      this.peerConnections.delete(socketId);
    }
    const stream = this.remoteStreams.get(socketId);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      this.remoteStreams.delete(socketId);
    }
    this.analyserNodes.delete(socketId);
  }

  /**
   * Tham gia kênh đàm thoại 1-Click (Discord style)
   */
  async join({ meetingId, enableVideo = false, enableAudio = true }) {
    if (this.isJoined) {
      this.leave();
    }

    this.meetingId = meetingId;
    this.videoMuted = !enableVideo;
    this.micMuted = !enableAudio;

    if (this.onStatusChanged) this.onStatusChanged('connecting', 1);

    try {
      // 1. Yêu cầu quyền Micro & Camera chuẩn Discord
      // Trình duyệt sẽ hiển thị prompt xin quyền rõ ràng, không có tiếng Nhật hay trang trung gian
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: enableVideo ? { width: { ideal: 640 }, height: { ideal: 360 } } : false
      };

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (mediaErr) {
        console.warn('Không thể mở cả camera & mic, thử mở riêng microphone:', mediaErr);
        // Thử chỉ mở microphone nếu camera bận hoặc không có
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.videoMuted = true;
      }

      // Đảm bảo trạng thái mute được thiết lập chính xác
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !this.micMuted;

      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !this.videoMuted;

      // 2. Khởi tạo Web Audio Analyser để phát hiện giọng nói
      this.setupLocalAudioAnalyser();

      // 3. Bắt đầu chu kỳ kiểm tra Volume để highlight viền xanh khi nói
      this.startVolumeMonitoring();

      // 4. Phát tín hiệu gia nhập tới Server
      if (this.socket) {
        this.socket.emit('voice:join', {
          meetingId: this.meetingId,
          micMuted: this.micMuted,
          videoMuted: this.videoMuted
        });
      }

      this.isJoined = true;
      if (this.onStatusChanged) this.onStatusChanged('connected', 1);

      return {
        success: true,
        localStream: this.localStream
      };
    } catch (err) {
      console.error('❌ Lỗi tham gia Voice Channel:', err);
      if (this.onStatusChanged) this.onStatusChanged('error', 0);
      throw err;
    }
  }

  /**
   * Thiết lập Audio Analyser cho Microphone của bản thân
   */
  setupLocalAudioAnalyser() {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtxClass();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      if (this.localStream && this.localStream.getAudioTracks().length > 0) {
        const source = this.audioContext.createMediaStreamSource(this.localStream);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        this.analyserNodes.set('local', analyser);
      }
    } catch (e) {
      console.warn('Web Audio API Analyser không khả dụng:', e);
    }
  }

  /**
   * Thiết lập Audio Analyser cho âm thanh của người khác
   */
  setupRemoteAudioAnalyser(socketId, stream) {
    try {
      if (!this.audioContext) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtxClass();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      this.analyserNodes.set(socketId, analyser);
    } catch (e) {
      console.warn('Lỗi setup remote audio analyser:', e);
    }
  }

  /**
   * Đo âm lượng liên tục để kích hoạt viền xanh Discord
   */
  startVolumeMonitoring() {
    if (this.checkVolumeInterval) clearInterval(this.checkVolumeInterval);

    this.checkVolumeInterval = setInterval(() => {
      this.analyserNodes.forEach((analyser, id) => {
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const isSpeaking = avg > 18; // Ngưỡng nhận diện giọng nói

        if (id === 'local') {
          if (isSpeaking !== this.isLocalSpeaking) {
            this.isLocalSpeaking = isSpeaking;
            if (this.onSpeakingChanged) this.onSpeakingChanged('local', isSpeaking);
            if (this.socket && this.isJoined) {
              this.socket.emit('voice:state_change', {
                meetingId: this.meetingId,
                isSpeaking
              });
            }
          }
        } else {
          if (this.onSpeakingChanged) this.onSpeakingChanged(id, isSpeaking);
        }
      });
    }, 100);
  }

  /**
   * Bật / Tắt Microphone (Mute / Unmute)
   */
  toggleMic() {
    if (!this.localStream) return this.micMuted;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      this.micMuted = !this.micMuted;
      audioTrack.enabled = !this.micMuted;

      if (this.socket && this.isJoined) {
        this.socket.emit('voice:state_change', {
          meetingId: this.meetingId,
          micMuted: this.micMuted
        });
      }
    }
    return this.micMuted;
  }

  /**
   * Bật / Tắt Camera
   */
  async toggleCamera() {
    if (!this.isJoined) return this.videoMuted;

    let videoTrack = this.localStream?.getVideoTracks()[0];

    if (!videoTrack) {
      // Chưa có video track -> Gọi getUserMedia để lấy camera
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 } }
        });
        const newTrack = tempStream.getVideoTracks()[0];
        if (newTrack) {
          if (!this.localStream) this.localStream = new MediaStream();
          this.localStream.addTrack(newTrack);

          // Thêm track này vào tất cả các peer connections hiện có
          this.peerConnections.forEach(pc => {
            pc.addTrack(newTrack, this.localStream);
          });

          this.videoMuted = false;
        }
      } catch (err) {
        console.warn('Không thể bật camera:', err);
        this.videoMuted = true;
      }
    } else {
      this.videoMuted = !this.videoMuted;
      videoTrack.enabled = !this.videoMuted;
    }

    if (this.socket && this.isJoined) {
      this.socket.emit('voice:state_change', {
        meetingId: this.meetingId,
        videoMuted: this.videoMuted
      });
    }

    return this.videoMuted;
  }

  /**
   * Bật / Tắt Chia sẻ Màn hình (Screen Share)
   */
  async toggleScreenShare() {
    if (this.isScreenSharing) {
      // Dừng chia sẻ màn hình
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(t => t.stop());
        this.screenStream = null;
      }
      this.isScreenSharing = false;

      // Revert lại webcam video track (nếu có)
      const camTrack = this.localStream?.getVideoTracks()[0];
      this.peerConnections.forEach(pc => {
        const senders = pc.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender) {
          if (camTrack && !this.videoMuted) {
            videoSender.replaceTrack(camTrack);
          } else {
            videoSender.replaceTrack(null);
          }
        }
      });

      if (this.socket && this.isJoined) {
        this.socket.emit('voice:state_change', {
          meetingId: this.meetingId,
          screenSharing: false
        });
      }

      return false;
    } else {
      // Bắt đầu chia sẻ màn hình
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = this.screenStream.getVideoTracks()[0];

        screenTrack.onended = () => {
          this.toggleScreenShare();
        };

        // Thay thế video sender trong tất cả peer connections
        this.peerConnections.forEach(pc => {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          } else {
            pc.addTrack(screenTrack, this.screenStream);
          }
        });

        this.isScreenSharing = true;

        if (this.socket && this.isJoined) {
          this.socket.emit('voice:state_change', {
            meetingId: this.meetingId,
            screenSharing: true
          });
        }

        return true;
      } catch (err) {
        console.warn('Hủy chia sẻ màn hình:', err);
        this.isScreenSharing = false;
        return false;
      }
    }
  }

  /**
   * Rời kênh & Giải phóng 100% tài nguyên phần cứng (Micro, Camera, WebRTC)
   */
  leave() {
    if (!this.isJoined) return;

    console.log(`🔇 [VoiceService] Rời phòng ${this.meetingId} và dọn dẹp tài nguyên.`);

    if (this.checkVolumeInterval) {
      clearInterval(this.checkVolumeInterval);
      this.checkVolumeInterval = null;
    }

    // Dừng tất cả track Microphone và Camera để tắt đèn LED
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Đóng toàn bộ peer connections
    this.peerConnections.forEach(pc => {
      try { pc.close(); } catch (e) {}
    });
    this.peerConnections.clear();

    this.remoteStreams.forEach(stream => {
      stream.getTracks().forEach(t => t.stop());
    });
    this.remoteStreams.clear();
    this.analyserNodes.clear();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }

    // Thông báo cho Server
    if (this.socket) {
      this.socket.emit('voice:leave', { meetingId: this.meetingId });
    }

    this.peers.clear();
    this.isJoined = false;
    this.meetingId = null;
    this.micMuted = false;
    this.videoMuted = true;
    this.isScreenSharing = false;
    this.isLocalSpeaking = false;

    if (this.onStatusChanged) this.onStatusChanged('idle', 0);
    if (this.onPeersUpdated) this.onPeersUpdated([]);
  }
}

export const voiceService = new VoiceService();
