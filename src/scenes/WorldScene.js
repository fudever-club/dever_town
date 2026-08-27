import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { MAPS_CONFIG } from '../config/maps.js';
import { InputController } from '../config/controls.js';
import { Player } from '../entities/Player.js';
import { RemotePlayer } from '../entities/RemotePlayer.js';
import { SocketManager } from '../network/SocketManager.js';
import { ChatBox } from '../ui/ChatBox.js';
import { AuthModal } from '../ui/AuthModal.js';
import { authService } from '../services/AuthService.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.currentRoomId = 'main_hall';
    this.remotePlayers = new Map();
    this.isTeleporting = false;
    this.lastTeleportTime = 0;
    this.tileSprites = [];
    this.portalLabels = [];
  }

  create() {
    // 1. Giới hạn vật lý bản đồ (640x480)
    this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);

    // 2. Khởi tạo Local Player
    const user = authService.getUser();
    const mapData = MAPS_CONFIG[this.currentRoomId] || MAPS_CONFIG.main_hall;
    const spawnX = mapData.spawnPoint.x;
    const spawnY = mapData.spawnPoint.y;

    const initialName = user ? (user.display_name || user.displayName) : (localStorage.getItem('dever_nickname') || 'Dever Member');
    const initialAvatar = user ? (user.avatar_id || user.avatarId) : 'dev_hoodie';
    const initialRole = user ? user.role : (authService.isLoggedIn() ? 'dev' : 'guest');

    this.player = new Player(this, spawnX, spawnY, {
      name: initialName,
      avatarId: initialAvatar,
      role: initialRole,
      isCurrentPlayer: true
    });

    // 3. Xây dựng bản đồ phòng hiện tại
    this.loadRoom(this.currentRoomId, spawnX, spawnY, false);

    // 4. Camera bám theo Player
    const camera = this.cameras.main;
    camera.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.setRoundPixels(true);

    // 5. Bộ điều khiển phím
    this.inputController = new InputController(this);

    // 6. HUD
    this.createHUD();

    // 7. Tích hợp Network Socket.io
    this.socketManager = new SocketManager(this);
    this.socketManager.connect();

    // 8. Khởi tạo UI
    this.initUI();
  }

  /**
   * Nạp cấu trúc bản đồ động theo Room ID (Sảnh, Tech Lab, Thư viện)
   */
  loadRoom(roomId, spawnX, spawnY, notifySocket = true) {
    const mapData = MAPS_CONFIG[roomId];
    if (!mapData) return;

    this.currentRoomId = roomId;

    // 1. Dọn dẹp các đối tượng tile và chướng ngại vật cũ
    if (this.tileSprites && this.tileSprites.length > 0) {
      this.tileSprites.forEach(t => t.destroy());
      this.tileSprites = [];
    }
    if (this.portalLabels && this.portalLabels.length > 0) {
      this.portalLabels.forEach(lbl => lbl.destroy());
      this.portalLabels = [];
    }
    if (this.obstacleGroup) {
      this.obstacleGroup.clear(true, true);
    }
    if (this.portalGroup) {
      this.portalGroup.clear(true, true);
    }

    // 2. Xóa sạch Remote Players của phòng cũ
    for (const remote of this.remotePlayers.values()) {
      remote.destroy();
    }
    this.remotePlayers.clear();

    // 3. Khởi tạo Groups vật lý mới
    this.obstacleGroup = this.physics.add.staticGroup();
    this.portalGroup = this.physics.add.staticGroup();

    const cols = GAME_CONFIG.MAP_WIDTH_TILES;
    const rows = GAME_CONFIG.MAP_HEIGHT_TILES;
    const tileSize = GAME_CONFIG.TILE_SIZE;

    // Các loại tile là vật cản cứng: 2 (Tường), 3 (Kệ sách), 4 (Bàn), 8 (Server Rack), 12 (Bảng), 14 (Quầy cà phê), 15 (Vách kính)
    const solidTiles = new Set([2, 3, 4, 8, 12, 14, 15]);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileType = mapData.layout[r][c];
        const posX = c * tileSize + tileSize / 2;
        const posY = r * tileSize + tileSize / 2;

        const tileSprite = this.add.image(posX, posY, 'town_tileset', tileType);
        tileSprite.setDepth(0);
        this.tileSprites.push(tileSprite);

        if (solidTiles.has(tileType)) {
          const obstacle = this.obstacleGroup.create(posX, posY, 'town_tileset', tileType);
          obstacle.setVisible(false);
          obstacle.refreshBody();
        }
      }
    }

    // 4. Tạo các cổng dịch chuyển (Portals)
    if (mapData.portals) {
      mapData.portals.forEach(p => {
        const posX = p.tileX * tileSize + tileSize / 2;
        const posY = p.tileY * tileSize + tileSize / 2;

        const portalObj = this.portalGroup.create(posX, posY, null);
        portalObj.setSize(tileSize, tileSize);
        portalObj.setVisible(false);
        portalObj.portalData = p;

        // Nhãn chỉ dẫn lơ lửng phía trên cổng
        const label = this.add.text(posX, posY - 18, p.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '10px',
          fontWeight: '700',
          color: '#c084fc',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: { x: 4, y: 2 }
        }).setOrigin(0.5, 0.5).setDepth(99999);
        this.portalLabels.push(label);
      });
    }

    // 5. Cập nhật va chạm
    if (this.playerCollider) {
      this.playerCollider.destroy();
    }
    this.playerCollider = this.physics.add.collider(this.player, this.obstacleGroup);

    if (this.portalOverlap) {
      this.portalOverlap.destroy();
    }
    this.portalOverlap = this.physics.add.overlap(
      this.player,
      this.portalGroup,
      (player, portal) => this.handlePortalOverlap(portal.portalData)
    );

    // 6. Đặt lại vị trí Local Player
    if (spawnX !== undefined && spawnY !== undefined) {
      this.player.setPosition(spawnX, spawnY);
      this.player.body.reset(spawnX, spawnY);
    }

    // 7. Cập nhật HUD & UI Header Dropdown
    if (this.hudText) {
      this.hudText.setText(`DEVER TOWN | ${mapData.name}`);
    }

    const roomSelector = document.getElementById('room-selector');
    if (roomSelector && roomSelector.value !== roomId) {
      roomSelector.value = roomId;
    }

    // 8. Thông báo Socket nếu đổi phòng chủ động
    if (notifySocket && this.socketManager) {
      this.socketManager.switchRoom(roomId, spawnX, spawnY);
    }
  }

  /**
   * Xử lý khi nhân vật bước vào Cổng dịch chuyển
   */
  handlePortalOverlap(portalData) {
    if (this.isTeleporting) return;

    const now = performance.now();
    if (now - this.lastTeleportTime < 1500) return; // Cooldown 1.5s

    this.isTeleporting = true;
    this.lastTeleportTime = now;

    console.log(`🌀 [Portal] Kích hoạt cổng chuyển sang: ${portalData.targetRoomId}`);

    // Hiệu ứng Camera Fade Out
    this.cameras.main.fadeOut(200, 11, 15, 25);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.loadRoom(
        portalData.targetRoomId,
        portalData.targetSpawn.x,
        portalData.targetSpawn.y,
        true
      );
      this.cameras.main.fadeIn(250, 11, 15, 25);
      this.cameras.main.once('camerafadeincomplete', () => {
        this.isTeleporting = false;
      });
    });
  }

  createHUD() {
    this.hudText = this.add.text(12, 12, 'DEVER TOWN | 🏛️ Sảnh Chính Dever Town', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontWeight: '600',
      color: '#38bdf8',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 8, y: 4 }
    });
    this.hudText.setScrollFactor(0);
    this.hudText.setDepth(1000000);
  }

  initUI() {
    // 1. Chat Box
    this.chatBox = new ChatBox({
      onSendMessage: (message) => {
        this.socketManager.sendChatMessage(message);
      }
    });

    // 2. Auth Modal
    this.authModal = new AuthModal({
      onAuthSuccess: ({ user, isGuest }) => {
        const name = user.display_name || user.displayName;
        const avatarId = user.avatar_id || user.avatarId || 'dev_hoodie';
        const role = user.role || (isGuest ? 'guest' : 'dev');

        if (this.player) {
          this.player.updateProfile({ name, avatarId, role });
        }

        this.updateHeaderProfile(user);

        if (this.socketManager) {
          this.socketManager.reconnectWithAuth();
        }
      }
    });

    // 3. Header Action Buttons
    const authBtn = document.getElementById('header-auth-btn');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        if (authService.isLoggedIn()) {
          this.authModal.show('profile');
        } else {
          this.authModal.show('login');
        }
      });
    }

    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authService.logout();
        this.player.updateProfile({
          name: `Khách #${Math.floor(1000 + Math.random() * 9000)}`,
          avatarId: 'dev_hoodie',
          role: 'guest'
        });
        this.updateHeaderProfile(null);
        this.socketManager.reconnectWithAuth();
      });
    }

    // 4. Quick Room Selector Dropdown
    const roomSelector = document.getElementById('room-selector');
    if (roomSelector) {
      roomSelector.addEventListener('change', (e) => {
        const targetRoom = e.target.value;
        if (targetRoom && targetRoom !== this.currentRoomId) {
          const mapData = MAPS_CONFIG[targetRoom];
          if (mapData) {
            this.handlePortalOverlap({
              targetRoomId: targetRoom,
              targetSpawn: mapData.spawnPoint
            });
          }
        }
      });
    }

    const currentUser = authService.getUser();
    this.updateHeaderProfile(currentUser);

    if (!currentUser && !localStorage.getItem('dever_nickname')) {
      this.authModal.show('login');
    }
  }

  updateHeaderProfile(user) {
    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const authBtn = document.getElementById('header-auth-btn');
    const logoutBtn = document.getElementById('header-logout-btn');

    if (user && user.display_name) {
      if (nameEl) nameEl.textContent = user.display_name;
      if (roleEl) {
        roleEl.className = `role-tag ${user.role || 'dev'}`;
        roleEl.textContent = user.role === 'admin' ? '👑 Admin' :
                             user.role === 'leader' ? '⭐ Leader' :
                             user.role === 'dev' ? '💻 Dev' : '👤 Khách';
      }
      if (authBtn) authBtn.textContent = '👤 Hồ Sơ';
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if (nameEl) nameEl.textContent = 'Khách vãng lai';
      if (roleEl) {
        roleEl.className = 'role-tag guest';
        roleEl.textContent = '👤 Khách';
      }
      if (authBtn) authBtn.textContent = '🔑 Đăng Nhập / Đăng Ký';
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  }

  /**
   * --- SOCKET EVENT HANDLERS ---
   */

  handleCurrentPlayers(players, myId) {
    for (const [id, pData] of Object.entries(players)) {
      if (id !== myId && !this.remotePlayers.has(id)) {
        const remote = new RemotePlayer(this, pData.x, pData.y, {
          name: pData.name,
          avatarId: pData.avatarId || 'dev_hoodie',
          role: pData.role || 'dev',
          id
        });
        this.remotePlayers.set(id, remote);
      }
    }
  }

  handleNewPlayer(pData) {
    if (!this.remotePlayers.has(pData.id)) {
      const remote = new RemotePlayer(this, pData.x, pData.y, {
        name: pData.name,
        avatarId: pData.avatarId || 'dev_hoodie',
        role: pData.role || 'dev',
        id: pData.id
      });
      this.remotePlayers.set(pData.id, remote);
    }
  }

  handleRemoteMovement({ id, x, y, direction, isMoving }) {
    const remote = this.remotePlayers.get(id);
    if (remote) {
      remote.setTargetPosition(x, y, direction, isMoving);
    }
  }

  handlePlayerUpdated({ id, name, avatarId, role }) {
    const remote = this.remotePlayers.get(id);
    if (remote) {
      remote.updateProfile({ name, avatarId, role });
    }
  }

  handlePlayerDisconnected(socketId) {
    const remote = this.remotePlayers.get(socketId);
    if (remote) {
      remote.destroy();
      this.remotePlayers.delete(socketId);
    }
  }

  handleNewChatMessage({ id, name, role, avatarId, message, timestamp }) {
    const isSelf = this.socketManager.socket?.id === id;

    if (this.chatBox) {
      this.chatBox.addMessage({ name, role, avatarId, message, isSelf, timestamp });
    }

    if (isSelf && this.player) {
      this.player.showSpeechBubble(message);
    } else {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.showSpeechBubble(message);
      }
    }
  }

  update() {
    if (this.player && this.inputController && !this.isTeleporting) {
      const inputData = this.inputController.getMovementVector();
      this.player.update(inputData);

      if (this.socketManager) {
        this.socketManager.sendMovement(
          this.player.x,
          this.player.y,
          this.player.currentDirection,
          inputData.isMoving
        );
      }
    }

    for (const remote of this.remotePlayers.values()) {
      remote.update();
    }
  }
}
