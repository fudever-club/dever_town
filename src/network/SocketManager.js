import { io } from 'socket.io-client';
import { GAME_CONFIG } from '../config/gameConfig.js';

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
    if (this.socket) return;

    console.log(`🔌 Kết nối tới Socket Server: ${GAME_CONFIG.NETWORK.SERVER_URL}`);
    this.socket = io(GAME_CONFIG.NETWORK.SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`✅ [Socket] Đã kết nối với ID: ${this.socket.id}`);
      this.updateConnectionStatus(true);

      // Nếu đã có Player trên Scene, gửi sự kiện Join ngay
      if (this.scene.player) {
        this.join(this.scene.player.name, this.scene.player.x, this.scene.player.y);
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.warn('⚠️ [Socket] Mất kết nối tới máy chủ');
      this.updateConnectionStatus(false);
    });

    // 1. Nhận danh sách tất cả người chơi hiện có trong phòng
    this.socket.on('currentPlayers', (players) => {
      this.scene.handleCurrentPlayers(players, this.socket.id);
    });

    // 2. Có người chơi mới tham gia
    this.socket.on('newPlayer', (playerData) => {
      this.scene.handleNewPlayer(playerData);
    });

    // 3. Người chơi khác di chuyển
    this.socket.on('playerMoved', (movementData) => {
      this.scene.handleRemoteMovement(movementData);
    });

    // 4. Người chơi khác đổi tên
    this.socket.on('playerUpdated', (updateData) => {
      this.scene.handlePlayerUpdated(updateData);
    });

    // 5. Người chơi khác ngắt kết nối
    this.socket.on('playerDisconnected', (socketId) => {
      this.scene.handlePlayerDisconnected(socketId);
    });

    // 6. Nhận tin nhắn chat mới
    this.socket.on('newChatMessage', (chatData) => {
      this.scene.handleNewChatMessage(chatData);
    });

    // 7. Đồng bộ số lượng người online
    this.socket.on('onlineCount', (count) => {
      this.updateOnlineCountUI(count);
    });
  }

  join(name, x, y) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('joinGame', {
      name: name || 'Dever Member',
      x: Math.round(x),
      y: Math.round(y),
      direction: 'down'
    });
  }

  /**
   * Gửi tọa độ di chuyển có cơ chế Throttling và Dirty Checking
   */
  sendMovement(x, y, direction, isMoving) {
    if (!this.socket || !this.isConnected) return;

    const now = performance.now();
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);

    // Kiểm tra dirty (vị trí hoặc trạng thái thay đổi)
    const hasPositionChanged = Math.abs(roundedX - this.lastPosition.x) > 0.5 ||
                               Math.abs(roundedY - this.lastPosition.y) > 0.5;
    const hasStateChanged = direction !== this.lastPosition.direction ||
                            isMoving !== this.lastPosition.isMoving;

    if (!hasPositionChanged && !hasStateChanged) return;

    // Throttle theo TICK_INTERVAL_MS trừ trường hợp vừa dừng lại (Stop Snap)
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

  updateNickname(name) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('updateNickname', { name });
  }

  updateConnectionStatus(online) {
    const statusText = document.querySelector('.status-text');
    const dot = document.querySelector('.dot');
    if (statusText && dot) {
      if (online) {
        statusText.textContent = 'Multiplayer Online';
        dot.className = 'dot online';
      } else {
        statusText.textContent = 'Mất kết nối...';
        dot.className = 'dot offline';
      }
    }
  }

  updateOnlineCountUI(count) {
    const onlineEl = document.getElementById('online-count-badge');
    if (onlineEl) {
      onlineEl.textContent = `${count} Online`;
    }
  }
}
