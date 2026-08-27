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
    console.log(`🔌 Kết nối tới Socket Server: ${GAME_CONFIG.NETWORK.SERVER_URL} (Token: ${token ? 'Có' : 'Không'})`);

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
    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`✅ [Socket] Đã kết nối với ID: ${this.socket.id}`);
      this.updateConnectionStatus(true);

      // Nếu đã có Player, gửi sự kiện Join
      if (this.scene.player) {
        this.join({
          name: this.scene.player.name,
          avatarId: this.scene.player.avatarId,
          role: this.scene.player.role,
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

    this.socket.on('currentPlayers', (players) => {
      this.scene.handleCurrentPlayers(players, this.socket.id);
    });

    this.socket.on('newPlayer', (playerData) => {
      this.scene.handleNewPlayer(playerData);
    });

    this.socket.on('playerMoved', (movementData) => {
      this.scene.handleRemoteMovement(movementData);
    });

    this.socket.on('playerUpdated', (updateData) => {
      this.scene.handlePlayerUpdated(updateData);
    });

    this.socket.on('playerDisconnected', (socketId) => {
      this.scene.handlePlayerDisconnected(socketId);
    });

    this.socket.on('newChatMessage', (chatData) => {
      this.scene.handleNewChatMessage(chatData);
    });

    this.socket.on('onlineCount', (count) => {
      this.updateOnlineCountUI(count);
    });
  }

  join(options = {}) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('joinGame', {
      name: options.name || 'Dever Member',
      avatarId: options.avatarId || 'dev_hoodie',
      role: options.role || 'guest',
      x: Math.round(options.x || 336),
      y: Math.round(options.y || 272),
      direction: 'down'
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

  updateOnlineCountUI(count) {
    const onlineEl = document.getElementById('online-count-badge');
    if (onlineEl) {
      onlineEl.textContent = `${count} Online`;
    }
  }
}
