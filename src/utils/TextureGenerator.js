/**
 * TextureGenerator: Tự sinh toàn bộ Tileset 32x32 và 4 Spritesheets Nhân vật trên HTML Canvas.
 * Hoạt động 100% trong bộ nhớ, loại bỏ hoàn toàn rủi ro lỗi 404 hình ảnh ngoài.
 */
export class TextureGenerator {
  /**
   * Tạo Tileset hoàn chỉnh (19 ô 32x32)
   */
  static generateTileset(scene) {
    const tileSize = 32;
    const numTiles = 19;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * numTiles;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');

    // 0: Cỏ xanh (Grass)
    this.drawGrass(ctx, 0 * tileSize, 0, tileSize);

    // 1: Sàn gỗ (Wood Floor)
    this.drawWoodFloor(ctx, 1 * tileSize, 0, tileSize);

    // 2: Tường gạch hiện đại (Brick Wall - Obstacle)
    this.drawWall(ctx, 2 * tileSize, 0, tileSize);

    // 3: Kệ sách công nghệ (Bookshelf - Obstacle)
    this.drawBookshelf(ctx, 3 * tileSize, 0, tileSize);

    // 4: Bàn làm việc & Laptop (Desk with Laptop - Obstacle)
    this.drawDeskWithLaptop(ctx, 4 * tileSize, 0, tileSize);

    // 5: Đá cuội sân vườn (Cobblestone)
    this.drawCobblestone(ctx, 5 * tileSize, 0, tileSize);

    // 6: Thảm xanh công nghệ (Tech Carpet)
    this.drawTechCarpet(ctx, 6 * tileSize, 0, tileSize);

    // 7: Bụi hoa trang trí (Flower Bush)
    this.drawFlowerBush(ctx, 7 * tileSize, 0, tileSize);

    // 8: Server Rack máy chủ CLB (Obstacle)
    this.drawServerRack(ctx, 8 * tileSize, 0, tileSize);

    // 9: Sàn gạch Cyan Cyberpunk
    this.drawCyberFloor(ctx, 9 * tileSize, 0, tileSize);

    // 10: Cổng ma thuật dịch chuyển Portal
    this.drawPortalTile(ctx, 10 * tileSize, 0, tileSize);

    // 11: Thảm đỏ Lounge VIP
    this.drawRedCarpet(ctx, 11 * tileSize, 0, tileSize);

    // 12: Bảng trắng thuyết trình Whiteboard (Obstacle)
    this.drawWhiteboard(ctx, 12 * tileSize, 0, tileSize);

    // 13: Cây cảnh trong chậu
    this.drawPottedPlant(ctx, 13 * tileSize, 0, tileSize);

    // 14: Quầy Cà phê Dever Coffee Bar (Obstacle)
    this.drawCoffeeBar(ctx, 14 * tileSize, 0, tileSize);

    // 15: Vách kính công nghệ cao Glass Wall (Obstacle)
    this.drawGlassWall(ctx, 15 * tileSize, 0, tileSize);

    // 16: Khung tranh mạ vàng kỷ niệm Art Frame Gold (Obstacle)
    this.drawArtFrameGold(ctx, 16 * tileSize, 0, tileSize);

    // 17: Bục trưng bày cúp vàng kỷ niệm Trophy Pedestal (Obstacle)
    this.drawTrophyPedestal(ctx, 17 * tileSize, 0, tileSize);

    // 18: Sàn lưới Cyber Web Grid
    this.drawCyberWebGrid(ctx, 18 * tileSize, 0, tileSize);

    if (scene.textures.exists('town_tileset')) {
      scene.textures.remove('town_tileset');
    }

    scene.textures.addSpriteSheet('town_tileset', canvas, {
      frameWidth: tileSize,
      frameHeight: tileSize
    });
  }

  static drawGrass(ctx, x, y, size) {
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 4, y + 6, 2, 4);
    ctx.fillRect(x + 18, y + 14, 2, 5);
    ctx.fillRect(x + 24, y + 4, 3, 3);
    ctx.fillRect(x + 8, y + 22, 3, 4);
    ctx.fillRect(x + 16, y + 24, 2, 3);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(x + 12, y + 10, 2, 2);
    ctx.fillRect(x + 22, y + 20, 2, 2);
  }

  static drawWoodFloor(ctx, x, y, size) {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#b45309';
    for (let i = 0; i < size; i += 8) {
      ctx.fillRect(x, y + i, size, 1);
    }
    ctx.fillRect(x + 12, y, 1, 8);
    ctx.fillRect(x + 24, y + 8, 1, 8);
    ctx.fillRect(x + 8, y + 16, 1, 8);
    ctx.fillRect(x + 20, y + 24, 1, 8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 2, y + 2, size - 4, 1);
  }

  static drawWall(ctx, x, y, size) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#334155';
    for (let row = 0; row < size; row += 8) {
      ctx.fillRect(x, y + row, size, 1);
      const offset = (row / 8) % 2 === 0 ? 0 : 8;
      for (let col = offset; col < size; col += 16) {
        ctx.fillRect(x + col, y + row, 1, 8);
      }
    }
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, size, 2);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + size - 2, size, 2);
  }

  static drawBookshelf(ctx, x, y, size) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 2, y + 2, size - 4, 8);
    ctx.fillRect(x + 2, y + 12, size - 4, 8);
    ctx.fillRect(x + 2, y + 22, size - 4, 8);

    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    for (let shelf = 0; shelf < 3; shelf++) {
      const sy = y + 2 + shelf * 10;
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = colors[(shelf * 3 + b) % colors.length];
        ctx.fillRect(x + 4 + b * 5, sy + 1, 4, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5 + b * 5, sy + 3, 2, 1);
      }
    }
  }

  static drawDeskWithLaptop(ctx, x, y, size) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);

    // Laptop
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 10, y + 8, 12, 10);
    ctx.fillStyle = '#38bdf8'; // Màn hình sáng Cyan
    ctx.fillRect(x + 11, y + 9, 10, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 13, y + 11, 4, 1);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 8, y + 19, 16, 4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 12, y + 20, 8, 2);

    // Cốc cà phê
    ctx.fillStyle = '#f87171';
    ctx.fillRect(x + 24, y + 8, 4, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 25, y + 9, 2, 3);
  }

  static drawCobblestone(ctx, x, y, size) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 2, y + 2, 12, 12);
    ctx.fillRect(x + 16, y + 2, 14, 10);
    ctx.fillRect(x + 2, y + 16, 13, 14);
    ctx.fillRect(x + 17, y + 14, 13, 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 3, y + 3, 10, 2);
    ctx.fillRect(x + 17, y + 3, 12, 2);
    ctx.fillRect(x + 3, y + 17, 11, 2);
    ctx.fillRect(x + 18, y + 15, 11, 2);
  }

  static drawTechCarpet(ctx, x, y, size) {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4.5, y + 4.5, size - 9, size - 9);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(x + 14, y + 14, 4, 4);
  }

  static drawFlowerBush(ctx, x, y, size) {
    this.drawGrass(ctx, x, y, size);
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + 14, y + 14, 9, 0, Math.PI * 2);
    ctx.fill();

    const flowerColors = ['#f43f5e', '#fbbf24', '#c084fc', '#ffffff'];
    const positions = [[10, 12], [20, 10], [12, 20], [20, 20]];
    positions.forEach(([fx, fy], idx) => {
      ctx.fillStyle = flowerColors[idx];
      ctx.fillRect(x + fx, y + fy, 3, 3);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + fx + 1, y + fy + 1, 1, 1);
    });
  }

  static drawServerRack(ctx, x, y, size) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    for (let u = 0; u < 4; u++) {
      const uy = y + 4 + u * 6;
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 4, uy, size - 8, 4);
      ctx.fillStyle = u % 2 === 0 ? '#22c55e' : '#38bdf8';
      ctx.fillRect(x + 6, uy + 1, 2, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 10, uy + 1, 2, 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + 14, uy + 1, 10, 1);
    }
  }

  static drawCyberFloor(ctx, x, y, size) {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 8, y + 8, 2, 2);
    ctx.fillRect(x + 22, y + 8, 2, 2);
    ctx.fillRect(x + 8, y + 22, 2, 2);
    ctx.fillRect(x + 22, y + 22, 2, 2);
  }

  static drawPortalTile(ctx, x, y, size) {
    ctx.fillStyle = '#581c87';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#7e22ce';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e9d5ff';
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 15, y + 4, 2, 4);
    ctx.fillRect(x + 15, y + 24, 2, 4);
    ctx.fillRect(x + 4, y + 15, 4, 2);
    ctx.fillRect(x + 24, y + 15, 4, 2);
  }

  static drawRedCarpet(ctx, x, y, size) {
    ctx.fillStyle = '#881337';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#be123c';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 3, y + 3, size - 6, 1);
    ctx.fillRect(x + 3, y + size - 4, size - 6, 1);
  }

  static drawWhiteboard(ctx, x, y, size) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 4, y + 4, size - 8, 1);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 4, y + 8, 10, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 16, y + 8, 8, 2);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + 4, y + 14, 18, 2);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 2, y + size - 4, size - 4, 2);
  }

  static drawPottedPlant(ctx, x, y, size) {
    this.drawWoodFloor(ctx, x, y, size);
    // Chậu
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(x + 8, y + 16, 16, 12);
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(x + 6, y + 14, 20, 4);
    // Cây
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(x + 16, y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + 14, y + 8, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  static drawCoffeeBar(ctx, x, y, size) {
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    // Máy pha espresso
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 6, y + 6, 12, 14);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 8, y + 8, 2, 2);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 12, y + 8, 2, 2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 14, 12, 4);
    // Ly takeaway
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 22, y + 12, 5, 8);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + 22, y + 15, 5, 3);
  }

  static drawGlassWall(ctx, x, y, size) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2.5, y + 2.5, size - 5, size - 5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + size - 6);
    ctx.lineTo(x + size - 6, y + 6);
    ctx.stroke();
  }

  static drawArtFrameGold(ctx, x, y, size) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, size, size);
    // Khung vàng
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    // Tranh phong cảnh pixel bên trong
    ctx.fillStyle = '#0284c7'; // Bầu trời
    ctx.fillRect(x + 6, y + 6, size - 12, 10);
    ctx.fillStyle = '#fbbf24'; // Mặt trời
    ctx.fillRect(x + 8, y + 8, 3, 3);
    ctx.fillStyle = '#16a34a'; // Núi cỏ
    ctx.fillRect(x + 6, y + 14, size - 12, 8);
    ctx.fillStyle = '#ffffff'; // Mây
    ctx.fillRect(x + 16, y + 8, 6, 2);
  }

  static drawTrophyPedestal(ctx, x, y, size) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, size, size);
    // Bục đá hoa cương
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 16, 20, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 4, y + 14, 24, 4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 8, y + 18, 16, 2);
    // Cúp vàng
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 11, y + 4, 10, 6);
    ctx.fillRect(x + 13, y + 10, 6, 3);
    ctx.fillRect(x + 14, y + 13, 4, 2);
    // Quai cúp
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 9, y + 5, 2, 4);
    ctx.fillRect(x + 21, y + 5, 2, 4);
    // Ánh sáng kim cương
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 13, y + 5, 2, 2);
  }

  static drawCyberWebGrid(ctx, x, y, size) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(x + 14, y + 14, 4, 4);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x + 15, y + 15, 2, 2);
  }

  /**
   * Tạo 4 bộ Spritesheets cho 4 phong cách Avatar
   */
  static generateAllAvatars(scene) {
    return this.generateAllCharacterSpritesheets(scene);
  }

  static generateAllCharacterSpritesheets(scene) {
    const avatarConfigs = [
      { id: 'dev_hoodie', hair: '#1e293b', skin: '#fcd34d', shirt: '#2563eb', pants: '#1e293b', name: 'Dev Alpha' },
      { id: 'cyberpunk_pink', hair: '#ec4899', skin: '#fde047', shirt: '#9333ea', pants: '#06b6d4', name: 'Cyber Neon' },
      { id: 'red_gamer', hair: '#7f1d1d', skin: '#fbcfe8', shirt: '#ef4444', pants: '#18181b', name: 'Gamer Pro' },
      { id: 'green_coder', hair: '#064e3b', skin: '#fed7aa', shirt: '#10b981', pants: '#334155', name: 'Code Master' }
    ];

    avatarConfigs.forEach(cfg => {
      this.generateCharacterSpritesheet(scene, cfg);
    });
  }

  static generateCharacterSpritesheet(scene, config) {
    const frameW = 32;
    const frameH = 32;
    const cols = 3; // 3 frames: [Walk1, Idle, Walk2]
    const rows = 4; // 4 hướng: [Down, Left, Right, Up]

    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');

    const directions = ['down', 'left', 'right', 'up'];

    for (let r = 0; r < rows; r++) {
      const dir = directions[r];
      for (let c = 0; c < cols; c++) {
        const frameX = c * frameW;
        const frameY = r * frameH;
        this.drawCharacterFrame(ctx, frameX, frameY, dir, c, config);
      }
    }

    const key = `char_${config.id}`;
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    scene.textures.addSpriteSheet(key, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });

    this.createCharacterAnimations(scene, config.id);
  }

  static drawCharacterFrame(ctx, x, y, direction, frameIndex, config) {
    const { hair, skin, shirt, pants } = config;
    ctx.clearRect(x, y, 32, 32);

    // Bóng đổ mờ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 29, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = frameIndex === 0 ? -2 : (frameIndex === 2 ? 2 : 0);

    // Chân & Quần
    ctx.fillStyle = pants;
    if (direction === 'left' || direction === 'right') {
      ctx.fillRect(x + 13 + legOffset, y + 22, 6, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 13 + legOffset, y + 28, 7, 3);
    } else {
      ctx.fillRect(x + 11, y + 22 + (legOffset > 0 ? 1 : 0), 4, 7);
      ctx.fillRect(x + 17, y + 22 + (legOffset < 0 ? 1 : 0), 4, 7);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 10, y + 28, 5, 3);
      ctx.fillRect(x + 17, y + 28, 5, 3);
    }

    // Thân áo
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 10, y + 14, 12, 9);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + 10, y + 21, 12, 2);

    // Cánh tay
    ctx.fillStyle = skin;
    if (direction === 'down') {
      ctx.fillRect(x + 8, y + 15 - legOffset, 2, 6);
      ctx.fillRect(x + 22, y + 15 + legOffset, 2, 6);
    } else if (direction === 'up') {
      ctx.fillRect(x + 8, y + 15 + legOffset, 2, 6);
      ctx.fillRect(x + 22, y + 15 - legOffset, 2, 6);
    } else if (direction === 'left') {
      ctx.fillRect(x + 14 - legOffset, y + 16, 4, 5);
    } else if (direction === 'right') {
      ctx.fillRect(x + 14 + legOffset, y + 16, 4, 5);
    }

    // Đầu & Mặt
    ctx.fillStyle = skin;
    ctx.fillRect(x + 11, y + 6, 10, 9);

    // Mắt
    ctx.fillStyle = '#0f172a';
    if (direction === 'down') {
      ctx.fillRect(x + 13, y + 10, 2, 2);
      ctx.fillRect(x + 17, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 13, y + 10, 1, 1);
      ctx.fillRect(x + 17, y + 10, 1, 1);
    } else if (direction === 'left') {
      ctx.fillRect(x + 11, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, y + 10, 1, 1);
    } else if (direction === 'right') {
      ctx.fillRect(x + 19, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 20, y + 10, 1, 1);
    }

    // Tóc
    ctx.fillStyle = hair;
    if (direction === 'down') {
      ctx.fillRect(x + 10, y + 4, 12, 4);
      ctx.fillRect(x + 10, y + 6, 2, 4);
      ctx.fillRect(x + 20, y + 6, 2, 4);
    } else if (direction === 'up') {
      ctx.fillRect(x + 10, y + 4, 12, 9);
    } else if (direction === 'left') {
      ctx.fillRect(x + 10, y + 4, 12, 4);
      ctx.fillRect(x + 18, y + 6, 4, 6);
    } else if (direction === 'right') {
      ctx.fillRect(x + 10, y + 4, 12, 4);
      ctx.fillRect(x + 10, y + 6, 4, 6);
    }
  }

  static createCharacterAnimations(scene, avatarId) {
    const key = `char_${avatarId}`;
    const dirs = [
      { name: 'down', row: 0 },
      { name: 'left', row: 1 },
      { name: 'right', row: 2 },
      { name: 'up', row: 3 }
    ];

    dirs.forEach(({ name, row }) => {
      const baseFrame = row * 3;

      // Walk Animation
      const walkKey = `walk_${name}_${avatarId}`;
      if (!scene.anims.exists(walkKey)) {
        scene.anims.create({
          key: walkKey,
          frames: scene.anims.generateFrameNumbers(key, {
            frames: [baseFrame, baseFrame + 1, baseFrame + 2, baseFrame + 1]
          }),
          frameRate: 8,
          repeat: -1
        });
      }

      // Idle Animation
      const idleKey = `idle_${name}_${avatarId}`;
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: [{ key, frame: baseFrame + 1 }],
          frameRate: 1
        });
      }
    });
  }
}
