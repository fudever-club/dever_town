/**
 * InteractiveModal.meeting — Phòng họp + voice engine (mic/cam/screen, giơ tay, spotlight, moderation, quiz).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { questManager } from '../../managers/QuestManager.js';
import { audioManager } from '../../utils/AudioManager.js';
import { authService } from '../../services/AuthService.js';
import { voiceService } from '../../services/VoiceService.js';
import { QuizMultiplayerModal } from '../minigames/QuizMultiplayerModal.js';
import { escapeHtml } from '../../utils/sanitize.js';

InteractiveModal.prototype.handleMediaErrorNotification = function(err, type = 'audio') {
  if (!err) return;
  const isAudio = type === 'audio';
  const deviceName = isAudio ? 'Microphone' : 'Webcam / Camera';
  if (err.name === 'NotFoundError') {
    alert(`Quyền trình duyệt đã được cấp, nhưng máy tính không tìm thấy thiết bị ${deviceName} phần cứng. Bạn hãy cắm tai nghe có mic hoặc webcam vào máy tính rồi bấm thử lại.`);
  } else if (err.name === 'NotAllowedError') {
    alert(`Quyền ${deviceName} đang bị chặn trên trình duyệt. Bạn hãy bật quyền trong biểu tượng Cài đặt bên cạnh URL và tải lại trang.`);
  } else {
    alert(`Không thể kích hoạt ${deviceName} (${err.name || err.message}). Vui lòng kiểm tra lại thiết bị.`);
  }
}

InteractiveModal.prototype.initVoiceEngine = function() {
  // 1. Phím tắt M để toggle Mute nhanh
  window.addEventListener('keydown', async (e) => {
    if (e.key === 'm' || e.key === 'M') {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (this.isOpen() && this.voiceService?.isJoined) {
        const res = await this.voiceService.toggleMic();
        const isMuted = typeof res === 'object' ? res.isMuted : res;
        this.updateVoiceControlUI({ micMuted: isMuted });
        if (!isMuted) {
          document.getElementById('voice-listen-notice')?.classList.add('hidden');
        } else if (res?.error) {
          this.handleMediaErrorNotification(res.error, 'audio');
        }
        audioManager.playClick();
      }
    }
  });

  // 2. Nút Tham gia Voice từ Lobby
  const joinBtn = document.getElementById('btn-join-voice');
  if (joinBtn && !joinBtn.dataset.initialized) {
    joinBtn.dataset.initialized = 'true';
    joinBtn.addEventListener('click', () => this.handleJoinVoiceRoom());
  }

  // 3. Nút Toggle Micro
  const micBtn = document.getElementById('btn-toggle-mic');
  if (micBtn && !micBtn.dataset.initialized) {
    micBtn.dataset.initialized = 'true';
    micBtn.addEventListener('click', async () => {
      const res = await this.voiceService.toggleMic();
      const isMuted = typeof res === 'object' ? res.isMuted : res;
      this.updateVoiceControlUI({ micMuted: isMuted });
      if (!isMuted) {
        document.getElementById('voice-listen-notice')?.classList.add('hidden');
      } else if (res?.error) {
        this.handleMediaErrorNotification(res.error, 'audio');
      }
      audioManager.playClick();
    });
  }

  // 4. Nút Toggle Camera
  const camBtn = document.getElementById('btn-toggle-cam');
  if (camBtn && !camBtn.dataset.initialized) {
    camBtn.dataset.initialized = 'true';
    camBtn.addEventListener('click', async () => {
      const res = await this.voiceService.toggleCamera();
      const isVideoMuted = typeof res === 'object' ? res.isVideoMuted : res;
      this.updateVoiceControlUI({ videoMuted: isVideoMuted });
      this.updateLocalVideoDisplay();
      if (!isVideoMuted) {
        document.getElementById('voice-listen-notice')?.classList.add('hidden');
      } else if (res?.error) {
        this.handleMediaErrorNotification(res.error, 'video');
      }
      audioManager.playClick();
    });
  }

  // 5. Nút Toggle Screen Share
  const screenBtn = document.getElementById('btn-toggle-screen');
  if (screenBtn && !screenBtn.dataset.initialized) {
    screenBtn.dataset.initialized = 'true';
    screenBtn.addEventListener('click', async () => {
      const isSharing = await this.voiceService.toggleScreenShare();
      this.updateVoiceControlUI({ screenSharing: isSharing });
      this.updateLocalVideoDisplay();
      audioManager.playClick();
    });
  }

  // 6. Nút Rời Voice Room
  const leaveBtn = document.getElementById('btn-leave-voice');
  if (leaveBtn && !leaveBtn.dataset.initialized) {
    leaveBtn.dataset.initialized = 'true';
    leaveBtn.addEventListener('click', () => {
      this.voiceService.leave();
      const lobby = document.getElementById('voice-lobby');
      if (lobby) lobby.classList.remove('hidden');
      const active = document.getElementById('voice-active-room');
      if (active) active.classList.add('hidden');
      audioManager.playClick();
    });
  }

  // 7. Phase 1d: Nút Giơ Tay / Hạ Tay
  const handBtn = document.getElementById('btn-raise-hand');
  if (handBtn && !handBtn.dataset.initialized) {
    handBtn.dataset.initialized = 'true';
    handBtn.addEventListener('click', () => {
      const vs = this.voiceService;
      if (!vs.isJoined) return;
      vs.raiseHand(!vs.handRaised);
      this.updateHandButton(vs.handRaised);
      audioManager.playClick();
    });
  }
}

/**
 * Phase 1d: Cập nhật trạng thái nút giơ tay.
 */
InteractiveModal.prototype.updateHandButton = function(raised) {
  const handBtn = document.getElementById('btn-raise-hand');
  const handText = document.getElementById('hand-text');
  if (handBtn) handBtn.classList.toggle('active', !!raised);
  if (handText) handText.textContent = raised ? 'Hạ Tay' : 'Giơ Tay';
  const localTile = document.getElementById('voice-tile-local');
  if (localTile) localTile.classList.toggle('hand-raised', !!raised);
}

/**
 * Phase 1d: Có người giơ/hạ tay — cập nhật badge trên tile.
 */
InteractiveModal.prototype.handleHandChanged = function(socketId, raised) {
  const vs = this.voiceService;
  const isLocal = vs.socket && socketId === vs.socket.id;
  const tileId = isLocal ? 'voice-tile-local' : `voice-tile-${socketId}`;
  const tile = document.getElementById(tileId);
  if (tile) {
    tile.classList.toggle('hand-raised', !!raised);
    let badge = tile.querySelector('.tile-hand-badge');
    if (raised && !badge) {
      badge = document.createElement('span');
      badge.className = 'tile-hand-badge';
      badge.title = 'Đang giơ tay xin phát biểu';
      badge.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`;
      tile.appendChild(badge);
    } else if (!raised && badge) {
      badge.remove();
    }
  }
  if (isLocal) this.updateHandButton(raised);
}

/**
 * Phase 1d: Spotlight thay đổi — phóng to tile người được ghim.
 */
InteractiveModal.prototype.handleSpotlightChanged = function(spotlightedId) {
  document.querySelectorAll('.voice-tile.spotlighted').forEach(t => t.classList.remove('spotlighted'));
  if (spotlightedId) {
    const vs = this.voiceService;
    const isLocal = vs.socket && spotlightedId === vs.socket.id;
    const tile = document.getElementById(isLocal ? 'voice-tile-local' : `voice-tile-${spotlightedId}`);
    if (tile) tile.classList.add('spotlighted');
  }
}

/**
 * Phase 1d: Bị host moderate.
 */
InteractiveModal.prototype.handleModeration = function(kind, reason) {
  if (kind === 'muted_by_host') {
    this.updateVoiceControlUI({ micMuted: true });
  } else if (kind === 'kicked') {
    const lobby = document.getElementById('voice-lobby');
    if (lobby) lobby.classList.remove('hidden');
    const active = document.getElementById('voice-active-room');
    if (active) active.classList.add('hidden');
  }
}

InteractiveModal.prototype.setupMeetingView = function(zoneData) {
  const pane = document.getElementById('pane-meeting');
  if (!pane) return;
  pane.classList.remove('hidden');

  const titleEl = document.getElementById('voice-room-title');
  if (titleEl) {
    titleEl.textContent = `Sync Lounge • ${zoneData.name || 'Kênh Đàm Thoại'}`;
  }

  // Lấy socket hiện tại từ WorldScene
  const currentScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
  const socket = currentScene?.socketManager?.socket;

  if (socket && !this.voiceInitialized) {
    this.voiceInitialized = true;
    this.voiceService.init(socket, {
      onPeersUpdated: (peers) => this.renderRemotePeerTiles(peers),
      onTrackReceived: (socketId, stream, kind) => {
        if (kind === 'video') {
          const vid = document.getElementById(`video-${socketId}`);
          if (vid) {
            vid.srcObject = stream;
            vid.classList.remove('hidden');
            const avatarWrap = document.getElementById(`avatar-wrap-${socketId}`);
            if (avatarWrap) avatarWrap.classList.add('hidden');
          }
        }
      },
      onSpeakingChanged: (id, isSpeaking) => {
        if (id === 'local') {
          const localTile = document.getElementById('voice-tile-local');
          if (localTile) localTile.classList.toggle('is-speaking', isSpeaking);
        } else {
          const peerTile = document.getElementById(`voice-tile-${id}`);
          if (peerTile) peerTile.classList.toggle('is-speaking', isSpeaking);
        }
      },
      onStatusChanged: (status, count) => {
        const badge = document.getElementById('voice-conn-status');
        const label = document.getElementById('voice-conn-label');
        const counter = document.getElementById('voice-peer-counter');

        if (counter) counter.textContent = `${count || 1} người`;

        if (badge && label) {
          badge.className = `voice-conn-badge ${status}`;
          if (status === 'connected') {
            label.textContent = `Đã kết nối (${count} người)`;
          } else if (status === 'connecting') {
            label.textContent = 'Đang kết nối tín hiệu...';
          } else {
            label.textContent = 'Chưa tham gia';
          }
        }
      },
      onMediaUpgraded: ({ micMuted, videoMuted }) => {
        const notice = document.getElementById('voice-listen-notice');
        if (notice) notice.classList.add('hidden');
        this.updateVoiceControlUI({ micMuted, videoMuted });
        this.updateLocalVideoDisplay();
      },
      // Phase 1d: raise-hand / spotlight / moderation / host
      onHandChanged: (socketId, raised) => this.handleHandChanged(socketId, raised),
      onSpotlightChanged: (spotlightedId) => this.handleSpotlightChanged(spotlightedId),
      onModeration: (kind, reason) => this.handleModeration(kind, reason),
      onHostChanged: () => this.renderRemotePeerTiles(Array.from(this.voiceService.peers.values())),
    });
  }

  // Hiển thị trạng thái phù hợp (Đang ở trong phòng hay đang ở Lobby)
  const lobby = document.getElementById('voice-lobby');
  const active = document.getElementById('voice-active-room');
  if (this.voiceService.isJoined) {
    if (lobby) lobby.classList.add('hidden');
    if (active) active.classList.remove('hidden');
    if (!this.voiceService.isListenOnly) {
      const notice = document.getElementById('voice-listen-notice');
      if (notice) notice.classList.add('hidden');
    }
    this.updateVoiceControlUI({
      micMuted: this.voiceService.micMuted,
      videoMuted: this.voiceService.videoMuted,
      screenSharing: this.voiceService.isScreenSharing
    });
    this.updateLocalVideoDisplay();
  } else {
    if (lobby) lobby.classList.remove('hidden');
    if (active) active.classList.add('hidden');
  }

  const localName = document.getElementById('local-tile-name');
  if (localName) {
    const pName = currentScene?.player?.name || authService.getUser()?.displayName || 'Bạn';
    localName.textContent = pName;
  }
  const localAvatar = document.getElementById('local-tile-avatar');
  if (localAvatar) {
    const pName = currentScene?.player?.name || authService.getUser()?.displayName || 'Bạn';
    localAvatar.innerHTML = `<span class="avatar-initials">${this.getAvatarInitials(pName)}</span>`;
  }

  // Phase 1c: nút mở Quiz multiplayer từ phòng họp
  const quizBtn = document.getElementById('quiz-open-btn');
  if (quizBtn && !quizBtn.dataset.bound) {
    quizBtn.dataset.bound = '1';
    quizBtn.addEventListener('click', () => {
      this.openQuizModal();
    });
  }
}

/**
 * Phase 1c: Mở modal Quiz multiplayer (host tại phòng hiện tại).
 */
InteractiveModal.prototype.openQuizModal = function() {
  if (!this.quizModal) {
    const currentScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    const socket = currentScene?.socketManager?.socket;
    if (!socket) {
      console.warn('[Quiz] Chua ket noi server, khong mo duoc Quiz.');
      return;
    }
    this.quizModal = new QuizMultiplayerModal({ socket });
  }
  this.quizModal.openAsHost(this.currentRoomId || 'meeting_room');
}

InteractiveModal.prototype.handleJoinVoiceRoom = async function() {
  const micCheck = document.getElementById('voice-lobby-mic');
  const camCheck = document.getElementById('voice-lobby-cam');
  const enableAudio = micCheck ? micCheck.checked : true;
  const enableVideo = camCheck ? camCheck.checked : false;

  const currentScene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
  const meetingId = `${this.currentRoomId || 'main_hall'}_${this.currentZone?.id || 'meeting'}`;

  try {
    const res = await this.voiceService.join({
      meetingId,
      enableAudio,
      enableVideo
    });

    // Ẩn lobby card và hiển thị phòng đàm thoại ngay lập tức
    const lobby = document.getElementById('voice-lobby');
    if (lobby) lobby.classList.add('hidden');
    const active = document.getElementById('voice-active-room');
    if (active) active.classList.remove('hidden');

    // Hiển thị thanh thông báo Thính giả nếu chưa có micro / quyền bị chặn
    if (res) {
      this.updateListenOnlyNotice(res.isListenOnly, res.reason);
    }

    this.updateVoiceControlUI({
      micMuted: this.voiceService.micMuted,
      videoMuted: this.voiceService.videoMuted,
      screenSharing: false
    });
    this.updateLocalVideoDisplay();

    // Phase 1b: đăng ký nguồn vị trí cho spatial voice
    this.voiceService.setPositionProvider(() => {
      const ws = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!ws || !ws.player) return { local: null, remotes: new Map() };
      const remotes = new Map();
      if (ws.remotePlayers) {
        ws.remotePlayers.forEach((rp, socketId) => {
          remotes.set(socketId, { x: rp.x, y: rp.y });
        });
      }
      return {
        local: { x: ws.player.x, y: ws.player.y, roomId: ws.currentRoomId },
        remotes
      };
    });

    try {
      if (typeof audioManager.playSuccess === 'function') {
        audioManager.playSuccess();
      } else {
        audioManager.playClick?.();
      }
    } catch (audioErr) {}

    questManager.incrementProgress('meeting_connect', 1);
  } catch (err) {
    console.warn('Lỗi kết nối phòng đàm thoại:', err);
    const lobby = document.getElementById('voice-lobby');
    if (lobby) lobby.classList.add('hidden');
    const active = document.getElementById('voice-active-room');
    if (active) active.classList.remove('hidden');
    this.updateListenOnlyNotice(true, err?.name || 'Error');
  }
}

InteractiveModal.prototype.updateListenOnlyNotice = function(isListenOnly, reason = '') {
  const notice = document.getElementById('voice-listen-notice');
  if (!notice) return;

  if (!isListenOnly) {
    notice.classList.add('hidden');
    return;
  }

  notice.classList.remove('hidden');
  const titleEl = document.getElementById('voice-notice-title');
  const descEl = document.getElementById('voice-notice-desc');
  const retryBtn = document.getElementById('btn-retry-media');

  if (reason === 'NotAllowedError') {
    if (titleEl) titleEl.textContent = 'Chế độ Thính giả (Quyền Micro đang bị chặn)';
    if (descEl) descEl.textContent = 'Trình duyệt đang chặn Micro. Bạn hãy bật quyền trong biểu tượng Cài đặt bên cạnh URL rồi nhấn [Cấp quyền Micro] (hoặc tải lại F5).';
    if (retryBtn) retryBtn.textContent = 'Cấp quyền Micro';
  } else if (reason === 'NotFoundError') {
    if (titleEl) titleEl.textContent = 'Chế độ Thính giả (Không tìm thấy Microphone)';
    if (descEl) descEl.textContent = 'Trình duyệt đã được cấp quyền, nhưng máy tính chưa có Microphone phần cứng. Bạn hãy cắm tai nghe có mic vào máy tính để nói chuyện, hoặc tiếp tục lắng nghe mọi người và chia sẻ màn hình.';
    if (retryBtn) retryBtn.textContent = 'Kiểm tra lại thiết bị';
  } else {
    if (titleEl) titleEl.textContent = 'Chế độ Thính giả (Chỉ nghe)';
    if (descEl) descEl.textContent = 'Chưa thể kết nối Microphone. Bạn vẫn có thể lắng nghe mọi người trong phòng và chia sẻ màn hình.';
    if (retryBtn) retryBtn.textContent = 'Thử kết nối lại';
  }

  if (retryBtn && !retryBtn.dataset.initialized) {
    retryBtn.dataset.initialized = 'true';
    retryBtn.addEventListener('click', async () => {
      try {
        await this.voiceService.requestMediaAccess({ audio: true, video: false });
        notice.classList.add('hidden');
        this.updateVoiceControlUI({
          micMuted: false,
          videoMuted: this.voiceService.videoMuted
        });
        audioManager.playSuccess();
      } catch (e) {
        console.warn('Cấp quyền lại chưa thành công:', e);
        this.handleMediaErrorNotification(e, 'audio');
      }
    });
  }
}

InteractiveModal.prototype.updateVoiceControlUI = function({ micMuted, videoMuted, screenSharing } = {}) {
  const SVG_MIC_ON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
  const SVG_MIC_OFF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
  const SVG_CAM_ON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;
  const SVG_CAM_OFF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L23 7v10"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z"/></svg>`;

  if (typeof micMuted === 'boolean') {
    const micBtn = document.getElementById('btn-toggle-mic');
    const micIcon = document.getElementById('mic-icon');
    const micText = document.getElementById('mic-text');
    const localMicStatus = document.getElementById('local-tile-mic-status');

    if (micBtn) micBtn.classList.toggle('off', micMuted);
    if (micIcon) micIcon.innerHTML = micMuted ? SVG_MIC_OFF : SVG_MIC_ON;
    if (micText) micText.textContent = micMuted ? 'Bật Mic' : 'Tắt Mic';
    if (localMicStatus) localMicStatus.innerHTML = micMuted ? SVG_MIC_OFF : SVG_MIC_ON;
  }

  if (typeof videoMuted === 'boolean') {
    const camBtn = document.getElementById('btn-toggle-cam');
    const camIcon = document.getElementById('cam-icon');
    const camText = document.getElementById('cam-text');

    if (camBtn) camBtn.classList.toggle('off', videoMuted);
    if (camIcon) camIcon.innerHTML = videoMuted ? SVG_CAM_OFF : SVG_CAM_ON;
    if (camText) camText.textContent = videoMuted ? 'Bật Cam' : 'Tắt Cam';
  }

  if (typeof screenSharing === 'boolean') {
    const screenBtn = document.getElementById('btn-toggle-screen');
    if (screenBtn) screenBtn.classList.toggle('off', !screenSharing);
  }
}

InteractiveModal.prototype.updateLocalVideoDisplay = function() {
  const localVideo = document.getElementById('voice-video-local');
  const localAvatarWrap = document.getElementById('local-avatar-wrap');

  const hasVideo = (this.voiceService.isScreenSharing && this.voiceService.screenStream) ||
                   (!this.voiceService.videoMuted && this.voiceService.localStream?.getVideoTracks()?.length > 0);

  if (hasVideo) {
    if (localVideo) {
      localVideo.srcObject = this.voiceService.isScreenSharing
        ? this.voiceService.screenStream
        : this.voiceService.localStream;
      localVideo.classList.remove('hidden');
    }
    if (localAvatarWrap) localAvatarWrap.classList.add('hidden');
  } else {
    if (localVideo) {
      localVideo.srcObject = null;
      localVideo.classList.add('hidden');
    }
    if (localAvatarWrap) localAvatarWrap.classList.remove('hidden');
  }
}

InteractiveModal.prototype.renderRemotePeerTiles = function(peers = []) {
  const container = document.getElementById('voice-remote-tiles');
  const grid = document.getElementById('voice-tiles-grid');
  if (!container || !grid) return;

  const SVG_MIC_ON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
  const SVG_MIC_OFF = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;

  // Cập nhật class số lượng ô
  const totalCount = peers.length + 1;
  if (totalCount === 1) grid.className = 'voice-tiles-grid count-1';
  else if (totalCount === 2) grid.className = 'voice-tiles-grid count-2';
  else grid.className = 'voice-tiles-grid count-many';

  container.innerHTML = '';

  peers.forEach(peer => {
    const tile = document.createElement('div');
    tile.className = 'voice-tile';
    tile.id = `voice-tile-${peer.socketId}`;
    // Phase 1d: trạng thái giơ tay / spotlight
    if (peer.handRaised) tile.classList.add('hand-raised');
    if (this.voiceService.spotlightedId === peer.socketId) tile.classList.add('spotlighted');

    const initials = this.getAvatarInitials(peer.name);
    const micSvg = peer.micMuted ? SVG_MIC_OFF : SVG_MIC_ON;
    const handBadge = peer.handRaised
      ? `<span class="tile-hand-badge" title="Đang giơ tay xin phát biểu"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></span>`
      : '';

    // Phase 1d: nút moderation cho host (tắt mic / mời ra)
    const isHost = this.voiceService.isVoiceHost();
    const modBtns = isHost ? `
      <div class="tile-mod-actions">
        <button type="button" class="tile-mod-btn" data-action="mute" data-sid="${peer.socketId}" title="Tắt mic người này">Tắt Mic</button>
        <button type="button" class="tile-mod-btn danger" data-action="kick" data-sid="${peer.socketId}" title="Mời ra khỏi phòng thoại">Mời Ra</button>
      </div>` : '';

    tile.innerHTML = `
      <div class="tile-video-wrap">
        <video id="video-${peer.socketId}" autoplay playsinline class="tile-video ${peer.videoMuted ? 'hidden' : ''}"></video>
        <div class="tile-avatar-fallback ${peer.videoMuted ? '' : 'hidden'}" id="avatar-wrap-${peer.socketId}">
          <div class="tile-avatar-circle"><span class="avatar-initials">${initials}</span></div>
        </div>
      </div>
      ${handBadge}
      <div class="tile-overlay-bar">
        <div class="tile-name-group">
          <span class="tile-mic-icon" id="mic-${peer.socketId}">${micSvg}</span>
          <span class="tile-user-name">${escapeHtml(peer.name)}</span>
          <span class="tile-role-pill">${escapeHtml((peer.role || 'member').toUpperCase())}</span>
        </div>
      </div>
      ${modBtns}
    `;

    container.appendChild(tile);

    // Phase 1d: host bấm vào tile để spotlight / bỏ spotlight
    if (isHost) {
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', (e) => {
        if (e.target.closest('.tile-mod-btn')) return; // không trigger khi bấm nút mod
        const cur = this.voiceService.spotlightedId;
        this.voiceService.setSpotlight(cur === peer.socketId ? null : peer.socketId);
      });
    }

    // Nếu đã có video stream từ trước, gắn lại srcObject
    const existingStream = this.voiceService.remoteStreams.get(peer.socketId);
    if (existingStream && existingStream.getVideoTracks().length > 0) {
      const vid = tile.querySelector('video');
      if (vid) {
        vid.srcObject = existingStream;
        vid.classList.remove('hidden');
        const wrap = tile.querySelector('.tile-avatar-fallback');
        if (wrap) wrap.classList.add('hidden');
      }
    }
  });

  // Phase 1d: gắn sự kiện cho nút moderation
  container.querySelectorAll('.tile-mod-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sid = btn.dataset.sid;
      const action = btn.dataset.action;
      if (action === 'kick' && !confirm('Mời người này ra khỏi phòng thoại?')) return;
      this.voiceService.moderatePeer(sid, action);
    });
  });
}

InteractiveModal.prototype.getAvatarInitials = function(name = '') {
  if (!name) return 'DE';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
