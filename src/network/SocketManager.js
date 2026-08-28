import { io } from 'socket.io-client';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { authService } from '../services/AuthService.js';
import { DeviceApprovalModal } from '../ui/DeviceApprovalModal.js';

export class SocketManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.socket = null;
    this.isConnected = false;
    this.lastSentTime = 0;
    this.lastPosition = { x: 0, y: 0, direction: 'down', isMoving: false };

    // Khởi tạo Modal Xác nhận Thiết Bị Mới
    this.approvalModal = new DeviceApprovalModal({
      onDecision: ({ requestId, approved }) => {
        if (this.socket && this.isConnected) {
          this.socket.emit('respondDeviceApproval', { requestId, approved });
        }
      }
    });
  }

  connect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = authService.getToken();
    console.log(`🔌 Kết nối tới Socket Server: ${GAME_CONFIG.NETWORK.SERVER_URL}`);

    this.socket = io(GAME_CONFIG.NETWORK.SERVER_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: token || null
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    this.setupListeners();
  }

  reconnectWithAuth() {
    console.log('🔄 Đang kết nối lại Socket với danh tính mới...');
    this.connect();
  }

  setupListeners() {
    if (this.scene.networkStatusOverlay) {
      this.scene.networkStatusOverlay.bindSocketEvents(this.socket);
    }

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`✅ [Socket] Đã kết nối với ID: ${this.socket.id}`);
      this.updateConnectionStatus(true);

      if (this.scene.networkStatusOverlay) {
        this.scene.networkStatusOverlay.updateStatus(true, 35);
        this.scene.networkStatusOverlay.hideLagSpinner();
      }

      if (this.scene.player) {
        const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
        let wardrobeConfig = null;
        if (savedWardrobeRaw) {
          try { wardrobeConfig = JSON.parse(savedWardrobeRaw); } catch (e) {}
        }

        this.join({
          name: this.scene.player.name,
          avatarId: this.scene.player.avatarId,
          role: this.scene.player.role,
          equippedItemId: this.scene.player.equippedItemId,
          wardrobeConfig: wardrobeConfig,
          roomId: this.scene.currentRoomId || 'main_hall',
          x: this.scene.player.x,
          y: this.scene.player.y
        });
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.warn('⚠️ [Socket] Mất kết nối tới máy chủ');
      this.updateConnectionStatus(false);
    });

    // 1. Danh sách người chơi trong phòng
    this.socket.on('currentPlayers', (players) => {
      this.scene.handleCurrentPlayers(players, this.socket.id);
    });

    // 2. Người chơi mới
    this.socket.on('newPlayer', (playerData) => {
      this.scene.handleNewPlayer(playerData);
    });

    // 3. Người chơi khác di chuyển
    this.socket.on('playerMoved', (movementData) => {
      this.scene.handleRemoteMovement(movementData);
    });

    // 4. Người chơi khác đổi profile
    this.socket.on('playerUpdated', (updateData) => {
      this.scene.handlePlayerUpdated(updateData);
    });

    // 5. Người chơi khác rời phòng hoặc disconnect
    this.socket.on('playerDisconnected', (socketId) => {
      this.scene.handlePlayerDisconnected(socketId);
    });

    // 6. Tin nhắn chat mới trong phòng
    this.socket.on('newChatMessage', (chatData) => {
      this.scene.handleNewChatMessage(chatData);
    });

    // 7. Thống kê số lượng người online theo phòng
    this.socket.on('roomCounts', (counts) => {
      this.updateRoomCountsUI(counts);
    });

    // 8. BẢO VỆ PHIÊN ĐĂNG NHẬP: Bị chặn do vượt quá 4 thiết bị đồng thời
    this.socket.on('sessionLimitExceeded', (data) => {
      console.warn('⚠️ [Device Limit] Vượt quá giới hạn 4 thiết bị:', data);
      alert(data.message || 'Tài khoản của bạn đã đạt giới hạn tối đa 4 thiết bị đang hoạt động cùng lúc. Vui lòng đăng xuất ở một trong các thiết bị trước đó!');
      authService.logout();
      window.location.reload();
    });

    // 9. CẢNH BÁO BẢO MẬT: Nhận thông báo khi có thiết bị mới đăng nhập hoặc bị chặn
    this.socket.on('securityAlert', (data) => {
      console.info('🛡️ [Security Alert]:', data.message);
      if (this.scene && this.scene.chatBox) {
        this.scene.chatBox.addMessage({
          senderName: 'Hệ Thống Bảo Mật',
          message: data.message,
          role: 'admin',
          timestamp: Date.now()
        });
      }
    });

    // 10. REAL-TIME DEVICE APPROVAL: Nhận yêu cầu xác nhận khi thiết bị mới muốn đăng nhập
    this.socket.on('deviceTransferPrompt', (data) => {
      console.log('🛡️ [Device Transfer Prompt]:', data);
      if (this.approvalModal) {
        this.approvalModal.show(data);
      }
    });

    // 11. THIẾT BỊ MỚI: Hiển thị màn hình chờ khi đang đợi máy cũ phê duyệt
    this.socket.on('waitingForApproval', (data) => {
      console.log('⏳ [Waiting For Approval]:', data);
      if (this.approvalModal) {
        this.approvalModal.showWaitingNotice(data.message);
      }
    });

    // 12. THIẾT BỊ MỚI: Đã được phê duyệt vào game thành công
    this.socket.on('deviceTransferApproved', () => {
      console.log('🎉 [Device Transfer Approved]');
      if (this.approvalModal) {
        this.approvalModal.hideWaitingNotice();
      }
    });

    // 13. THIẾT BỊ MỚI: Bị từ chối bởi máy cũ
    this.socket.on('deviceTransferDenied', (data) => {
      console.warn('🚫 [Device Transfer Denied]:', data);
      if (this.approvalModal) {
        this.approvalModal.hideWaitingNotice();
      }
      alert(data.message || 'Yêu cầu chuyển phiên chơi đã bị từ chối!');
      authService.logout();
      window.location.reload();
    });

    // 14. THIẾT BỊ CŨ: Đã chuyển giao phiên chơi thành công sang máy mới
    this.socket.on('sessionHandoffSuccess', (data) => {
      console.info('🚪 [Session Handoff Success]:', data);
      alert(data.message || 'Phiên chơi của bạn đã được chuyển thành công sang thiết bị mới!');
      authService.logout();
      window.location.reload();
    });
  }

  join(options = {}) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('joinGame', {
      name: options.name || 'Dever Member',
      avatarId: options.avatarId || 'dev_hoodie',
      role: options.role || 'guest',
      equippedItemId: options.equippedItemId || null,
      wardrobeConfig: options.wardrobeConfig || null,
      roomId: options.roomId || 'main_hall',
      x: Math.round(options.x || 320),
      y: Math.round(options.y || 280),
      direction: 'down'
    });
  }

  switchRoom(targetRoomId, x, y) {
    if (!this.socket || !this.isConnected) return;
    console.log(`📡 [Socket Emit] switchRoom ➔ ${targetRoomId} at (${x}, ${y})`);
    this.socket.emit('switchRoom', {
      targetRoomId,
      x: Math.round(x),
      y: Math.round(y)
    });
  }

  sendMovement(x, y, direction, isMoving) {
    if (!this.socket || !this.isConnected) return;

    const now = performance.now();
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    const hasPositionChanged = Math.abs(roundedX - this.lastPosition.x) > 0.5 ||
                               Math.abs(roundedY - this.lastPosition.y) > 0.5;
    const hasStateChanged = direction !== this.lastPosition.direction ||
                            isMoving !== this.lastPosition.isMoving;

    if (!hasPositionChanged && !hasStateChanged) return;

    const isStopEvent = !isMoving && this.lastPosition.isMoving;
    if (!isStopEvent && now - this.lastSentTime < GAME_CONFIG.NETWORK.TICK_INTERVAL_MS) {
      return;
    }

    this.lastSentTime = now;
    this.lastPosition = { x: roundedX, y: roundedY, direction, isMoving };

    this.socket.emit('playerMovement', {
      x: roundedX,
      y: roundedY,
      direction,
      isMoving
    });
  }

  sendChatMessage(message) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('sendChatMessage', { message });
  }

  updateProfile({ name, avatarId }) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('updateProfile', { name, avatarId });
  }

  updateConnectionStatus(online) {
    const statusText = document.querySelector('.status-text');
    const dot = document.querySelector('.dot');
    if (statusText && dot) {
      if (online) {
        statusText.textContent = 'Online';
        dot.className = 'dot online';
      } else {
        statusText.textContent = 'Mất kết nối...';
        dot.className = 'dot offline';
      }
    }
  }

  updateRoomCountsUI(counts) {
    // Cập nhật tổng online
    const onlineEl = document.getElementById('online-count-badge');
    if (onlineEl && counts.total !== undefined) {
      onlineEl.textContent = `${counts.total} Online`;
    }

    // Cập nhật số lượng 8 phòng
    const optMain = document.getElementById('opt-main_hall');
    const optLab = document.getElementById('opt-dever_lab');
    const optLib = document.getElementById('opt-library_lounge');
    const optMem = document.getElementById('opt-memory_room');
    const optWeb = document.getElementById('opt-web_room');
    const optMedia = document.getElementById('opt-media_hub');
    const optSports = document.getElementById('opt-sports_complex');
    const optCafe = document.getElementById('opt-canteen_cafe');

    if (optMain) optMain.textContent = `Sảnh Alpha (${counts.main_hall || 0})`;
    if (optLab) optLab.textContent = `Tech Lab (${counts.dever_lab || 0})`;
    if (optLib) optLib.textContent = `Thư Viện FUDA (${counts.library_lounge || 0})`;
    if (optMem) optMem.textContent = `Phòng Kỷ Niệm (${counts.memory_room || 0})`;
    if (optWeb) optWeb.textContent = `Không Gian Web (${counts.web_room || 0})`;
    if (optMedia) optMedia.textContent = `Media & MXH (${counts.media_hub || 0})`;
    if (optSports) optSports.textContent = `Khu Thể Thao (${counts.sports_complex || 0})`;
    if (optCafe) optCafe.textContent = `Căn Tin & Cafe (${counts.canteen_cafe || 0})`;
  }
}
