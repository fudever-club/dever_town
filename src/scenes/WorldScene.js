import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
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
    this.remotePlayers = new Map();
  }

  create() {
    // 1. Giới hạn vật lý bản đồ
    this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);

    // 2. Tạo bản đồ Tilemap & Obstacle Group
    this.createMap();

    // 3. Khởi tạo Local Player từ Auth Service hoặc Guest
    const user = authService.getUser();
    const spawnX = 10 * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2; // 336
    const spawnY = 8 * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;  // 272

    const initialName = user ? (user.display_name || user.displayName) : (localStorage.getItem('dever_nickname') || 'Dever Member');
    const initialAvatar = user ? (user.avatar_id || user.avatarId) : 'dev_hoodie';
    const initialRole = user ? user.role : (authService.isLoggedIn() ? 'dev' : 'guest');

    this.player = new Player(this, spawnX, spawnY, {
      name: initialName,
      avatarId: initialAvatar,
      role: initialRole,
      isCurrentPlayer: true
    });

    // 4. Va chạm với vật cản
    this.physics.add.collider(this.player, this.obstacleGroup);

    // 5. Camera bám theo Player
    const camera = this.cameras.main;
    camera.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.setRoundPixels(true);

    // 6. Bộ điều khiển phím
    this.inputController = new InputController(this);

    // 7. HUD
    this.createHUD();

    // 8. Tích hợp Network Socket.io
    this.socketManager = new SocketManager(this);
    this.socketManager.connect();

    // 9. Khởi tạo UI (Chat Box, Auth Modal, Header User Widget)
    this.initUI();
  }

  createMap() {
    const cols = GAME_CONFIG.MAP_WIDTH_TILES;
    const rows = GAME_CONFIG.MAP_HEIGHT_TILES;
    const tileSize = GAME_CONFIG.TILE_SIZE;

    this.obstacleGroup = this.physics.add.staticGroup();

    const mapLayout = [
      [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 7, 0 ],
      [ 2, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 2, 0, 5, 0, 0 ],
      [ 2, 1, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 1, 1, 1, 2, 0, 5, 0, 7 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 5, 5, 5 ],
      [ 2, 1, 4, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 4, 1, 2, 0, 0, 0, 5 ],
      [ 2, 1, 4, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 4, 1, 2, 7, 0, 0, 5 ],
      [ 2, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 5, 5, 5, 5 ],
      [ 2, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 5, 0, 0, 0 ],
      [ 2, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 2, 7, 0, 7, 0 ],
      [ 2, 1, 4, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 4, 1, 2, 0, 0, 0, 0 ],
      [ 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 5, 5, 5 ],
      [ 2, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 2, 0, 5, 0, 7 ],
      [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 5, 0, 0 ],
      [ 0, 0, 7, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0 ],
      [ 0, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 7, 0 ]
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileType = mapLayout[r][c];
        const posX = c * tileSize + tileSize / 2;
        const posY = r * tileSize + tileSize / 2;

        const tileSprite = this.add.image(posX, posY, 'town_tileset', tileType);
        tileSprite.setDepth(0);

        if (tileType === 2 || tileType === 3 || tileType === 4) {
          const obstacle = this.obstacleGroup.create(posX, posY, 'town_tileset', tileType);
          obstacle.setVisible(false);
          obstacle.refreshBody();
        }
      }
    }
  }

  createHUD() {
    this.hudText = this.add.text(12, 12, 'DEVER TOWN | Phòng Sinh Hoạt CLB', {
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

        // Cập nhật Player Entity
        if (this.player) {
          this.player.updateProfile({ name, avatarId, role });
        }

        // Cập nhật giao diện Header Profile
        this.updateHeaderProfile(user);

        // Kết nối lại Socket với token mới
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

    // Cập nhật trạng thái Header ban đầu
    const currentUser = authService.getUser();
    this.updateHeaderProfile(currentUser);

    // Nếu chưa từng có session đăng nhập hoặc guest, mở modal gợi ý
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
    if (this.player && this.inputController) {
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
