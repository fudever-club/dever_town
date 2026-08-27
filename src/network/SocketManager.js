import { io } from 'socket.io-client';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { authService } from '../services/AuthService.js';

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
        this.join({
          name: this.scene.player.name,
          avatarId: this.scene.player.avatarId,
          role: this.scene.player.role,
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
  }

  join(options = {}) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('joinGame', {
      name: options.name || 'Dever Member',
      avatarId: options.avatarId || 'dev_hoodie',
      role: options.role || 'guest',
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
