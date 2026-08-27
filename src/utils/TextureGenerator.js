/**
 * TextureGenerator: Sinh bộ Texture Pixel Art trực tiếp trên Canvas trong bộ nhớ.
 * Giúp game chạy độc lập 100% không bao giờ gặp lỗi 404 hoặc đường dẫn file hỏng.
 */
export class TextureGenerator {
  /**
   * Tạo Canvas Tileset 32x32
   * @param {Phaser.Scene} scene
   * @param {string} key
   */
  static generateTileset(scene, key = 'town_tileset') {
    if (scene.textures.exists(key)) return;

    const tileSize = 32;
    const cols = 8;
    const rows = 2;
    const canvas = document.createElement('canvas');
    canvas.width = cols * tileSize; // 256
    canvas.height = rows * tileSize; // 64
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Hàm vẽ helper
    const drawTile = (col, row, drawFn) => {
      ctx.save();
      ctx.translate(col * tileSize, row * tileSize);
      drawFn(ctx, tileSize);
      ctx.restore();
    };

    // 1. Tile 1 (Index 0): Cỏ xanh công viên (Grass)
    drawTile(0, 0, (c, s) => {
      c.fillStyle = '#4ade80';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#22c55e';
      // Đốm cỏ pixel
      c.fillRect(4, 6, 2, 4);
      c.fillRect(6, 4, 4, 2);
      c.fillRect(18, 12, 4, 2);
      c.fillRect(20, 14, 2, 4);
      c.fillRect(10, 24, 4, 2);
      c.fillRect(26, 22, 2, 4);
      c.fillStyle = '#15803d';
      c.fillRect(6, 6, 2, 2);
      c.fillRect(20, 12, 2, 2);
    });

    // 2. Tile 2 (Index 1): Sàn gỗ CLB (Wood Parquet Floor)
    drawTile(1, 0, (c, s) => {
      c.fillStyle = '#d97706';
      c.fillRect(0, 0, s, s);
      // Vân gỗ và rãnh ghép
      c.fillStyle = '#b45309';
      c.fillRect(0, 0, s, 1);
      c.fillRect(0, 16, s, 1);
      c.fillRect(16, 0, 1, 16);
      c.fillRect(8, 16, 1, 16);
      c.fillRect(24, 16, 1, 16);
      c.fillStyle = '#f59e0b';
      c.fillRect(2, 2, 12, 2);
      c.fillRect(18, 18, 12, 2);
    });

    // 3. Tile 3 (Index 2): Tường gạch CLB (Brick Wall)
    drawTile(2, 0, (c, s) => {
      c.fillStyle = '#475569';
      c.fillRect(0, 0, s, s);
      // Gạch
      c.fillStyle = '#64748b';
      c.fillRect(2, 2, 12, 6);
      c.fillRect(16, 2, 14, 6);
      c.fillRect(2, 10, 28, 2);
      c.fillRect(2, 14, 28, 6);
      c.fillRect(2, 22, 13, 6);
      c.fillRect(17, 22, 13, 6);
      // Shadow dưới
      c.fillStyle = '#334155';
      c.fillRect(0, s - 4, s, 4);
      // Viền trên
      c.fillStyle = '#94a3b8';
      c.fillRect(0, 0, s, 2);
    });

    // 4. Tile 4 (Index 3): Kệ sách tri thức (Bookshelf)
    drawTile(3, 0, (c, s) => {
      // Nền gỗ kệ
      c.fillStyle = '#78350f';
      c.fillRect(0, 0, s, s);
      // Các tầng sách
      c.fillStyle = '#451a03';
      c.fillRect(2, 2, 28, 12);
      c.fillRect(2, 16, 28, 12);
      // Sách màu sắc
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      for (let i = 0; i < 5; i++) {
        c.fillStyle = colors[i % colors.length];
        c.fillRect(4 + i * 5, 4, 4, 10);
      }
      for (let i = 0; i < 5; i++) {
        c.fillStyle = colors[(i + 2) % colors.length];
        c.fillRect(4 + i * 5, 18, 4, 10);
      }
      // Nẹp gỗ
      c.fillStyle = '#92400e';
      c.fillRect(0, 14, s, 2);
      c.fillRect(0, 28, s, 4);
    });

    // 5. Tile 5 (Index 4): Bàn làm việc Developer (Work Desk + Laptop)
    drawTile(4, 0, (c, s) => {
      // Mặt bàn gỗ bóng
      c.fillStyle = '#854d0e';
      c.fillRect(2, 4, 28, 24);
      c.fillStyle = '#ca8a04';
      c.fillRect(4, 6, 24, 20);
      // Laptop
      c.fillStyle = '#0f172a';
      c.fillRect(10, 10, 12, 8);
      c.fillStyle = '#38bdf8'; // Màn hình sáng
      c.fillRect(11, 11, 10, 6);
      c.fillStyle = '#94a3b8'; // Bàn phím
      c.fillRect(10, 19, 12, 4);
      // Cốc cà phê
      c.fillStyle = '#ef4444';
      c.fillRect(24, 12, 3, 4);
    });

    // 6. Tile 6 (Index 5): Đường đá cuội (Stone Path)
    drawTile(5, 0, (c, s) => {
      c.fillStyle = '#334155';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#64748b';
      // Các phiến đá
      c.fillRect(3, 3, 10, 10);
      c.fillRect(16, 4, 12, 8);
      c.fillRect(4, 17, 12, 11);
      c.fillRect(19, 15, 9, 13);
      c.fillStyle = '#94a3b8';
      c.fillRect(5, 5, 4, 4);
      c.fillRect(18, 6, 5, 3);
      c.fillRect(6, 19, 5, 4);
    });

    // 7. Tile 7 (Index 6): Thảm hội trường DEVER (Club Carpet)
    drawTile(6, 0, (c, s) => {
      c.fillStyle = '#1e3a8a';
      c.fillRect(0, 0, s, s);
      c.fillStyle = '#3b82f6';
      c.fillRect(2, 2, 28, 28);
      c.fillStyle = '#60a5fa';
      c.fillRect(6, 6, 20, 20);
      c.fillStyle = '#93c5fd';
      c.fillRect(12, 12, 8, 8);
    });

    // 8. Tile 8 (Index 7): Vườn hoa CLB (Flower Grass)
    drawTile(7, 0, (c, s) => {
      c.fillStyle = '#22c55e';
      c.fillRect(0, 0, s, s);
      // Hoa vàng
      c.fillStyle = '#facc15';
      c.fillRect(6, 8, 4, 4);
      c.fillRect(22, 18, 4, 4);
      // Hoa hồng
      c.fillStyle = '#f43f5e';
      c.fillRect(18, 6, 4, 4);
      c.fillRect(8, 20, 4, 4);
      // Nhụy hoa
      c.fillStyle = '#ffffff';
      c.fillRect(7, 9, 2, 2);
      c.fillRect(23, 19, 2, 2);
      c.fillRect(19, 7, 2, 2);
      c.fillRect(9, 21, 2, 2);
    });

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: tileSize,
      frameHeight: tileSize
    });
  }

  /**
   * Tạo Spritesheet Nhân vật Chibi 32x32 với 4 hướng x 3 frame animation
   * @param {Phaser.Scene} scene
   * @param {string} key
   */
  static generateCharacterSpritesheet(scene, key = 'player_sprites') {
    if (scene.textures.exists(key)) return;

    const frameW = 32;
    const frameH = 32;
    const cols = 3; // Frame 0 (Walk L), Frame 1 (Idle), Frame 2 (Walk R)
    const rows = 4; // 0: Down, 1: Left, 2: Right, 3: Up

    const canvas = document.createElement('canvas');
    canvas.width = cols * frameW; // 96
    canvas.height = rows * frameH; // 128
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Bảng màu nhân vật Developer năng động
    const skin = '#fcd34d';      // Da vàng ấm
    const hair = '#1e1b4b';      // Tóc tím than
    const shirt = '#2563eb';     // Áo hoodie xanh dương
    const pants = '#1e293b';     // Quần jeans sẫm
    const shoes = '#f87171';     // Giày sneaker đỏ
    const backpack = '#f59e0b';  // Balo cam

    const drawChibiFrame = (col, row, dir, walkPhase) => {
      ctx.save();
      ctx.translate(col * frameW, row * frameH);

      const legOffsetL = walkPhase === -1 ? 2 : walkPhase === 1 ? -2 : 0;
      const legOffsetR = walkPhase === 1 ? 2 : walkPhase === -1 ? -2 : 0;
      const armSwing = walkPhase !== 0 ? walkPhase * 2 : 0;

      if (dir === 'down') {
        // Hướng nhìn thẳng xuống (Mặt trước)
        // 1. Chân & Giày
        ctx.fillStyle = pants;
        ctx.fillRect(10, 20, 5, 6 + legOffsetL);
        ctx.fillRect(17, 20, 5, 6 + legOffsetR);
        ctx.fillStyle = shoes;
        ctx.fillRect(9, 25 + legOffsetL, 6, 4);
        ctx.fillRect(17, 25 + legOffsetR, 6, 4);

        // 2. Thân & Áo Hoodie
        ctx.fillStyle = shirt;
        ctx.fillRect(9, 13, 14, 8);
        // Logo DEVER trên áo
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(13, 15, 6, 3);

        // 3. Tay áo
        ctx.fillStyle = shirt;
        ctx.fillRect(6, 14 + armSwing, 3, 6);
        ctx.fillRect(23, 14 - armSwing, 3, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(6, 19 + armSwing, 3, 3);
        ctx.fillRect(23, 19 - armSwing, 3, 3);

        // 4. Đầu & Mặt
        ctx.fillStyle = skin;
        ctx.fillRect(8, 4, 16, 10);
        // Mắt
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(11, 8, 3, 3);
        ctx.fillRect(18, 8, 3, 3);
        // Ánh sáng mắt
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 8, 1, 1);
        ctx.fillRect(18, 8, 1, 1);
        // Má hồng
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(9, 11, 2, 2);
        ctx.fillRect(21, 11, 2, 2);
        // Tóc
        ctx.fillStyle = hair;
        ctx.fillRect(7, 2, 18, 5);
        ctx.fillRect(6, 5, 3, 5);
        ctx.fillRect(23, 5, 3, 5);
        ctx.fillRect(10, 6, 4, 2);
        ctx.fillRect(18, 6, 4, 2);
      } else if (dir === 'up') {
        // Hướng nhìn lên (Lưng)
        // 1. Chân & Giày
        ctx.fillStyle = pants;
        ctx.fillRect(10, 20, 5, 6 + legOffsetL);
        ctx.fillRect(17, 20, 5, 6 + legOffsetR);
        ctx.fillStyle = shoes;
        ctx.fillRect(10, 25 + legOffsetL, 5, 4);
        ctx.fillRect(17, 25 + legOffsetR, 5, 4);

        // 2. Thân & Balo sau lưng
        ctx.fillStyle = shirt;
        ctx.fillRect(9, 13, 14, 8);
        ctx.fillStyle = backpack;
        ctx.fillRect(11, 14, 10, 7);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(13, 16, 6, 3);

        // 3. Tay áo
        ctx.fillStyle = shirt;
        ctx.fillRect(6, 14 - armSwing, 3, 6);
        ctx.fillRect(23, 14 + armSwing, 3, 6);

        // 4. Đầu & Tóc sau gáy
        ctx.fillStyle = hair;
        ctx.fillRect(7, 2, 18, 12);
        ctx.fillRect(6, 5, 20, 8);
      } else if (dir === 'left') {
        // Hướng nhìn sang trái
        // 1. Chân & Giày
        ctx.fillStyle = pants;
        ctx.fillRect(12 + legOffsetL, 20, 6, 6);
        ctx.fillStyle = shoes;
        ctx.fillRect(10 + legOffsetL, 25, 7, 4);

        // 2. Thân & Balo
        ctx.fillStyle = shirt;
        ctx.fillRect(11, 13, 11, 8);
        ctx.fillStyle = backpack;
        ctx.fillRect(20, 14, 4, 6);

        // 3. Tay áo
        ctx.fillStyle = shirt;
        ctx.fillRect(13, 14 + armSwing, 4, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(13, 19 + armSwing, 3, 3);

        // 4. Đầu & Mặt
        ctx.fillStyle = skin;
        ctx.fillRect(9, 4, 14, 10);
        // Mắt trái
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(11, 8, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(11, 8, 1, 1);
        // Tóc
        ctx.fillStyle = hair;
        ctx.fillRect(8, 2, 16, 5);
        ctx.fillRect(16, 5, 8, 8);
        ctx.fillRect(9, 6, 4, 2);
      } else if (dir === 'right') {
        // Hướng nhìn sang phải
        // 1. Chân & Giày
        ctx.fillStyle = pants;
        ctx.fillRect(14 - legOffsetL, 20, 6, 6);
        ctx.fillStyle = shoes;
        ctx.fillRect(15 - legOffsetL, 25, 7, 4);

        // 2. Thân & Balo
        ctx.fillStyle = shirt;
        ctx.fillRect(10, 13, 11, 8);
        ctx.fillStyle = backpack;
        ctx.fillRect(8, 14, 4, 6);

        // 3. Tay áo
        ctx.fillStyle = shirt;
        ctx.fillRect(15, 14 - armSwing, 4, 6);
        ctx.fillStyle = skin;
        ctx.fillRect(16, 19 - armSwing, 3, 3);

        // 4. Đầu & Mặt
        ctx.fillStyle = skin;
        ctx.fillRect(9, 4, 14, 10);
        // Mắt phải
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(18, 8, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(18, 8, 1, 1);
        // Tóc
        ctx.fillStyle = hair;
        ctx.fillRect(8, 2, 16, 5);
        ctx.fillRect(8, 5, 8, 8);
        ctx.fillRect(19, 6, 4, 2);
      }

      ctx.restore();
    };

    // Vẽ toàn bộ 12 frames (4 hàng x 3 cột)
    const dirs = ['down', 'left', 'right', 'up'];
    const walkPhases = [-1, 0, 1]; // Left-step, Idle, Right-step

    dirs.forEach((dir, rowIndex) => {
      walkPhases.forEach((phase, colIndex) => {
        drawChibiFrame(colIndex, rowIndex, dir, phase);
      });
    });

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });
  }
}
