import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { InputController } from '../config/controls.js';
import { Player } from '../entities/Player.js';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  create() {
    // 1. Cấu hình giới hạn Vật lý thế giới (World Physics Bounds)
    this.physics.world.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);

    // 2. Xây dựng bản đồ Tilemap (20 x 15 tiles)
    this.createMap();

    // 3. Tạo nhân vật chính (Player) tại trung tâm phòng CLB
    const spawnX = 10 * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2; // Tọa độ x = 336
    const spawnY = 8 * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;  // Tọa độ y = 272

    this.player = new Player(this, spawnX, spawnY, 'Dever Member', true);

    // 4. Kích hoạt va chạm giữa Player và nhóm Vật cản (Walls, Desks, Bookshelves)
    this.physics.add.collider(this.player, this.obstacleGroup);

    // 5. Cấu hình Camera bám theo nhân vật mượt mà
    const camera = this.cameras.main;
    camera.setBounds(0, 0, GAME_CONFIG.MAP_WIDTH, GAME_CONFIG.MAP_HEIGHT);
    camera.startFollow(this.player, true, 0.1, 0.1);
    camera.setRoundPixels(true);

    // 6. Khởi tạo bộ điều khiển phím
    this.inputController = new InputController(this);

    // 7. Tạo UI HUD thông tin vị trí trong game
    this.createHUD();
  }

  createMap() {
    const cols = GAME_CONFIG.MAP_WIDTH_TILES; // 20
    const rows = GAME_CONFIG.MAP_HEIGHT_TILES; // 15
    const tileSize = GAME_CONFIG.TILE_SIZE;    // 32

    this.obstacleGroup = this.physics.add.staticGroup();

    /**
     * Ma trận Tilemap đại diện cho DEVER TOWN:
     * 0: Grass (Cỏ sân ngoài)
     * 1: Wood Floor (Sàn gỗ CLB)
     * 2: Brick Wall (Tường gạch - Cản trở)
     * 3: Bookshelf (Kệ sách - Cản trở)
     * 4: Work Desk (Bàn làm việc - Cản trở)
     * 5: Stone Path (Đường đá ngoài sân)
     * 6: Carpet (Thảm họp trung tâm)
     * 7: Flower Garden (Bụi hoa sân ngoài)
     */
    const mapLayout = [
      // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
      [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 7, 0 ], // Row 0
      [ 2, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 2, 0, 5, 0, 0 ], // Row 1
      [ 2, 1, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 1, 1, 1, 2, 0, 5, 0, 7 ], // Row 2
      [ 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 5, 5, 5 ], // Row 3
      [ 2, 1, 4, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 4, 1, 2, 0, 0, 0, 5 ], // Row 4
      [ 2, 1, 4, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 4, 1, 2, 7, 0, 0, 5 ], // Row 5
      [ 2, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 5, 5, 5, 5 ], // Row 6 (Cửa ra vào ở col 15)
      [ 2, 1, 1, 1, 1, 6, 6, 6, 6, 6, 6, 1, 1, 1, 1, 1, 5, 0, 0, 0 ], // Row 7 (Cửa ra vào ở col 15)
      [ 2, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 2, 7, 0, 7, 0 ], // Row 8
      [ 2, 1, 4, 1, 1, 4, 4, 1, 1, 4, 4, 1, 1, 4, 1, 2, 0, 0, 0, 0 ], // Row 9
      [ 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 5, 5, 5 ], // Row 10
      [ 2, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 2, 0, 5, 0, 7 ], // Row 11
      [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 5, 0, 0 ], // Row 12
      [ 0, 0, 7, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0 ], // Row 13
      [ 0, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 7, 0 ]  // Row 14
    ];

    // Vẽ từng ô tile và thêm vật lý cho các ô chướng ngại vật
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileType = mapLayout[r][c];
        const posX = c * tileSize + tileSize / 2;
        const posY = r * tileSize + tileSize / 2;

        // Nếu là vật cản (Tường gạch: 2, Kệ sách: 3, Bàn làm việc: 4)
        if (tileType === 2 || tileType === 3 || tileType === 4) {
          const obstacle = this.obstacleGroup.create(posX, posY, 'town_tileset', tileType);
          obstacle.setDepth(0);
          obstacle.refreshBody();
        } else {
          // Vẽ ảnh nền của Tile sàn / đường đi / cỏ
          const tileSprite = this.add.image(posX, posY, 'town_tileset', tileType);
          tileSprite.setDepth(0);
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
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      padding: { x: 8, y: 4 }
    });
    this.hudText.setScrollFactor(0); // Cố định trên camera
    this.hudText.setDepth(1000000);
  }

  update() {
    if (this.player && this.inputController) {
      const inputData = this.inputController.getMovementVector();
      this.player.update(inputData);
    }
  }
}
