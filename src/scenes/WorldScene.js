import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { InputController } from '../config/controls.js';
import { Player } from '../entities/Player.js';
import { RemotePlayer } from '../entities/RemotePlayer.js';
import { SocketManager } from '../network/SocketManager.js';
import { ChatBox } from '../ui/ChatBox.js';
import { NicknameModal } from '../ui/NicknameModal.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
    this.remotePlayers = new Map(); // key: socketId, value: RemotePlayer
  }

  create() {
    // 1. Giới hạn vật lý bản đồ (640x480)
    this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);

    // 2. Tạo bản đồ Tilemap & Obstacle Group
    this.createMap();

    // 3. Khởi tạo Local Player
    const spawnX = 10 * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2; // 336
    const spawnY = 8 * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;  // 272
    const initialName = localStorage.getItem('dever_nickname') || 'Dever Member';

    this.player = new Player(this, spawnX, spawnY, initialName, true);

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

    // 9. Khởi tạo UI Chat Box & Nickname Modal
    this.initUI();
  }

  createMap() {
    const cols = GAME_CONFIG.MAP_WIDTH_TILES; // 20
    const rows = GAME_CONFIG.MAP_HEIGHT_TILES; // 15
    const tileSize = GAME_CONFIG.TILE_SIZE;    // 32

    this.obstacleGroup = this.physics.add.staticGroup();

    /**
     * Map Layout:
     * 0: Grass, 1: Wood Floor, 2: Wall, 3: Bookshelf, 4: Desk, 5: Stone Path, 6: Carpet, 7: Flower
     */
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

    // 2. Nickname Modal
    this.nicknameModal = new NicknameModal({
      onConfirm: (newName) => {
        if (this.player) {
          this.player.updateName(newName);
        }
        if (this.socketManager) {
          this.socketManager.updateNickname(newName);
        }
      }
    });

    // Nếu chưa từng đặt tên, tự hiện popup modal
    if (!localStorage.getItem('dever_nickname')) {
      this.nicknameModal.show();
    }
  }

  /**
   * --- SOCKET EVENT HANDLERS ---
   */

  handleCurrentPlayers(players, myId) {
    for (const [id, pData] of Object.entries(players)) {
      if (id !== myId && !this.remotePlayers.has(id)) {
        const remote = new RemotePlayer(this, pData.x, pData.y, pData.name, id);
        this.remotePlayers.set(id, remote);
      }
    }
  }

  handleNewPlayer(pData) {
    if (!this.remotePlayers.has(pData.id)) {
      const remote = new RemotePlayer(this, pData.x, pData.y, pData.name, pData.id);
      this.remotePlayers.set(pData.id, remote);
    }
  }

  handleRemoteMovement({ id, x, y, direction, isMoving }) {
    const remote = this.remotePlayers.get(id);
    if (remote) {
      remote.setTargetPosition(x, y, direction, isMoving);
    }
  }

  handlePlayerUpdated({ id, name }) {
    const remote = this.remotePlayers.get(id);
    if (remote) {
      remote.updateName(name);
    }
  }

  handlePlayerDisconnected(socketId) {
    const remote = this.remotePlayers.get(socketId);
    if (remote) {
      remote.destroy();
      this.remotePlayers.delete(socketId);
    }
  }

  handleNewChatMessage({ id, name, message, timestamp }) {
    const isSelf = this.socketManager.socket?.id === id;

    // 1. Thêm vào khung Chat UI
    if (this.chatBox) {
      this.chatBox.addMessage({ name, message, isSelf, timestamp });
    }

    // 2. Hiển thị Bong bóng hội thoại (Speech Bubble) trên đầu nhân vật
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
    // 1. Cập nhật Local Player
    if (this.player && this.inputController) {
      const inputData = this.inputController.getMovementVector();
      this.player.update(inputData);

      // Gửi vị trí qua Socket (đã throttle 30 FPS)
      if (this.socketManager) {
        this.socketManager.sendMovement(
          this.player.x,
          this.player.y,
          this.player.currentDirection,
          inputData.isMoving
        );
      }
    }

    // 2. Cập nhật nội suy cho toàn bộ Remote Players
    for (const remote of this.remotePlayers.values()) {
      remote.update();
    }
  }
}
