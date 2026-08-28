/**
 * TextureGenerator: Tự sinh toàn bộ Tileset 32x32 (30 ô) và Spritesheets Nhân vật trên HTML Canvas.
 * Tích hợp nhận diện thương hiệu FPT University Đà Nẵng, CLB FU-DEVER, Khu Thể Thao & Tùy chỉnh Tủ Đồ.
 */
export class TextureGenerator {
  /**
   * Tạo Tileset hoàn chỉnh (30 ô 32x32)
   */
  static generateTileset(scene) {
    const tileSize = 32;
    const numTiles = 32;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * numTiles;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');

    // 0-18: Các tile hiện hữu
    this.drawGrass(ctx, 0 * tileSize, 0, tileSize);
    this.drawWoodFloor(ctx, 1 * tileSize, 0, tileSize);
    this.drawWall(ctx, 2 * tileSize, 0, tileSize);
    this.drawBookshelf(ctx, 3 * tileSize, 0, tileSize);
    this.drawDeskWithLaptop(ctx, 4 * tileSize, 0, tileSize);
    this.drawCobblestone(ctx, 5 * tileSize, 0, tileSize);
    this.drawTechCarpet(ctx, 6 * tileSize, 0, tileSize);
    this.drawFlowerBush(ctx, 7 * tileSize, 0, tileSize);
    this.drawServerRack(ctx, 8 * tileSize, 0, tileSize);
    this.drawCyberFloor(ctx, 9 * tileSize, 0, tileSize);
    this.drawPortalTile(ctx, 10 * tileSize, 0, tileSize);
    this.drawRedCarpet(ctx, 11 * tileSize, 0, tileSize);
    this.drawWhiteboard(ctx, 12 * tileSize, 0, tileSize);
    this.drawPottedPlant(ctx, 13 * tileSize, 0, tileSize);
    this.drawCoffeeBar(ctx, 14 * tileSize, 0, tileSize);
    this.drawGlassWall(ctx, 15 * tileSize, 0, tileSize);
    this.drawArtFrameGold(ctx, 16 * tileSize, 0, tileSize);
    this.drawTrophyPedestal(ctx, 17 * tileSize, 0, tileSize);
    this.drawCyberWebGrid(ctx, 18 * tileSize, 0, tileSize);

    // 19-23: Nhận diện FPTU Đà Nẵng & DEVER
    this.drawFptGoldenFrog(ctx, 19 * tileSize, 0, tileSize);
    this.drawFptUniBanner(ctx, 20 * tileSize, 0, tileSize);
    this.drawDeverNeonSign(ctx, 21 * tileSize, 0, tileSize);
    this.drawFptFlagpole(ctx, 22 * tileSize, 0, tileSize);
    this.drawFptAlphaFloor(ctx, 23 * tileSize, 0, tileSize);

    // 24-29: Phân khu Thể thao & Media Hub
    this.drawFootballTurf(ctx, 24 * tileSize, 0, tileSize); // 24: Cỏ sân bóng & Vạch vôi
    this.drawFootballGoal(ctx, 25 * tileSize, 0, tileSize); // 25: Khung thành bóng đá (Obstacle)
    this.drawBasketballHoop(ctx, 26 * tileSize, 0, tileSize); // 26: Cột rổ bóng rổ (Obstacle)
    this.drawVolleyballNet(ctx, 27 * tileSize, 0, tileSize); // 27: Lưới bóng chuyền / cầu lông (Obstacle)
    this.drawSwimmingPool(ctx, 28 * tileSize, 0, tileSize); // 28: Mặt nước hồ bơi FPTU
    this.drawMediaLedScreen(ctx, 29 * tileSize, 0, tileSize); // 29: Màn hình LED Media Hub (Obstacle)

    // 30-31: Căn Tin & Quán Cà Phê FUDA
    this.drawCanteenCounter(ctx, 30 * tileSize, 0, tileSize); // 30: Quầy Cơm Sinh Viên & Bánh Mì FUDA
    this.drawCafeDiningTable(ctx, 31 * tileSize, 0, tileSize); // 31: Bàn Cà Phê Gỗ & Khăn Trải Bàn Chill

    if (scene.textures.exists('town_tileset')) {
      scene.textures.remove('town_tileset');
    }

    scene.textures.addSpriteSheet('town_tileset', canvas, {
      frameWidth: tileSize,
      frameHeight: tileSize
    });
  }

  // --- 0-18: TILE CŨ ---
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
    ctx.fillStyle = '#38bdf8';
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
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(x + 8, y + 16, 16, 12);
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(x + 6, y + 14, 20, 4);
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
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 6, y + 6, 12, 14);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 8, y + 8, 2, 2);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 12, y + 8, 2, 2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 14, 12, 4);
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
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 6, y + 6, size - 12, 10);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 8, y + 8, 3, 3);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 6, y + 14, size - 12, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 16, y + 8, 6, 2);
  }

  static drawTrophyPedestal(ctx, x, y, size) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 16, 20, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 4, y + 14, 24, 4);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 8, y + 18, 16, 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 11, y + 4, 10, 6);
    ctx.fillRect(x + 13, y + 10, 6, 3);
    ctx.fillRect(x + 14, y + 13, 4, 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 9, y + 5, 2, 4);
    ctx.fillRect(x + 21, y + 5, 2, 4);
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

  // 19: Linh vật Cóc Vàng FPTU
  static drawFptGoldenFrog(ctx, x, y, size) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(x + 4, y + 20, 24, 10);
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(x + 2, y + 18, 28, 4);
    ctx.fillStyle = '#14b8a6';
    ctx.fillRect(x + 6, y + 20, 20, 2);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 14, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + 11, y + 8, 4, 0, Math.PI * 2);
    ctx.arc(x + 21, y + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 11, y + 7, 2, 2);
    ctx.fillRect(x + 21, y + 7, 2, 2);

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 20: Biển hiệu FUDA
  static drawFptUniBanner(ctx, x, y, size) {
    ctx.fillStyle = '#002147';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#f26f21';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 4, y + 4, 6, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 13, y + 4, 6, 4);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 22, y + 4, 6, 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FUDA', x + 16, y + 18);

    ctx.fillStyle = '#f26f21';
    ctx.font = 'bold 6px "Outfit", sans-serif';
    ctx.fillText('DEVER', x + 16, y + 26);
  }

  // 21: Neon DEVER Club
  static drawDeverNeonSign(ctx, x, y, size) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 5, y + 8, 2, 8);
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 25, y + 8, 2, 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEVER', x + 16, y + 18);
  }

  // 22: Cột cờ FPTU
  static drawFptFlagpole(ctx, x, y, size) {
    this.drawCobblestone(ctx, x, y, size);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 8, y + 2, 2, size - 4);
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 10, y + 3, 18, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 10, y + 7, 18, 4);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(x + 10, y + 11, 18, 4);
  }

  // 23: Sàn gạch Alpha FPTU
  static drawFptAlphaFloor(ctx, x, y, size) {
    ctx.fillStyle = '#002147';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = 'rgba(242, 111, 33, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 3, y + 3, size - 6, size - 6);
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 14, y + 14, 4, 4);
  }

  // 24: Sân bóng cỏ nhân tạo FPTU (Football Turf & Line)
  static drawFootballTurf(ctx, x, y, size) {
    ctx.fillStyle = '#15803d'; // Cỏ xanh thể thao đậm
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#16a34a'; // Kẻ sọc cỏ
    ctx.fillRect(x, y, size, 16);
    // Vạch vôi trắng
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(x, y + 14, size, 2);
  }

  // 25: Khung thành bóng đá FPTU (Football Goal - Obstacle)
  static drawFootballGoal(ctx, x, y, size) {
    this.drawFootballTurf(ctx, x, y, size);
    // Lưới trắng
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    for (let lx = x + 4; lx <= x + size - 4; lx += 4) {
      ctx.beginPath();
      ctx.moveTo(lx, y + 4);
      ctx.lineTo(lx, y + 24);
      ctx.stroke();
    }
    // Cọc xà ngang khung thành
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, y + 4, size - 6, 3);
    ctx.fillRect(x + 3, y + 4, 3, 20);
    ctx.fillRect(x + size - 6, y + 4, 3, 20);
  }

  // 26: Cột rổ bóng rổ FPTU (Basketball Hoop - Obstacle)
  static drawBasketballHoop(ctx, x, y, size) {
    // Sân bóng rổ cam FPT
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#002147';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

    // Cột rổ & Bảng rổ
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 14, y + 14, 4, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + 4, 20, 10);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 10, y + 6, 12, 6);

    // Vành rổ cam & lưới
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + 12, y + 12, 8, 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x + 13, y + 14, 6, 4);
  }

  // 27: Lưới bóng chuyền / cầu lông FPTU (Volleyball Net - Obstacle)
  static drawVolleyballNet(ctx, x, y, size) {
    // Sân sàn gỗ thể thao
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 15, y, 2, size);

    // Lưới trắng giăng ngang
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 10, size - 4, 12);
    for (let i = x + 4; i < x + size - 4; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, y + 10);
      ctx.lineTo(i, y + 22);
      ctx.stroke();
    }
  }

  // 28: Mặt nước hồ bơi FPTU (Swimming Pool)
  static drawSwimmingPool(ctx, x, y, size) {
    // Nước xanh ngọc
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(x, y + 8, size, 8);
    ctx.fillRect(x, y + 24, size, 8);

    // Gợn sóng bọt nước
    ctx.fillStyle = '#a5f3fc';
    ctx.fillRect(x + 4, y + 4, 8, 2);
    ctx.fillRect(x + 20, y + 12, 6, 2);
    ctx.fillRect(x + 8, y + 20, 10, 2);

    // Phao phân làn bơi
    ctx.fillStyle = '#f26f21'; // Phao cam FPT
    ctx.fillRect(x, y + 1, 4, 3);
    ctx.fillRect(x + 14, y + 1, 4, 3);
    ctx.fillRect(x + 28, y + 1, 4, 3);
  }

  // 29: Màn hình LED Media Hub (Obstacle)
  static drawMediaLedScreen(ctx, x, y, size) {
    ctx.fillStyle = '#020617';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#f26f21';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    // Logo FPTU & FU-DEVER
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MEDIA', x + 16, y + 15);
    ctx.fillStyle = '#f26f21';
    ctx.fillText('FPTU', x + 16, y + 23);
  }

  // 30: Quầy Cơm Sinh Viên & Bánh Mì Canteen FUDA (Obstacle)
  static drawCanteenCounter(ctx, x, y, size) {
    // Sàn gạch ấm
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x, y, size, size);

    // Thân quầy gỗ ấm
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 2, y + 8, size - 4, size - 10);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 2, y + 6, size - 4, 3);

    // Khay inox đựng thức ăn nóng & khay cơm
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 4, y + 11, 10, 8);
    ctx.fillRect(x + 18, y + 11, 10, 8);

    // Cơm vàng & thức ăn
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 5, y + 12, 8, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 19, y + 12, 8, 3);

    // Hơi nóng bốc lên
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x + 8, y + 2, 2, 3);
    ctx.fillRect(x + 22, y + 2, 2, 3);
  }

  // 31: Bàn Cà Phê Gỗ & Khăn Trải Bàn Chill (Obstacle)
  static drawCafeDiningTable(ctx, x, y, size) {
    // Sàn gỗ cafe
    this.drawWoodFloor(ctx, x, y, size);

    // Khăn trải bàn tròn / vuông màu kem
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);

    // 2 Ly Cà Phê (Cà phê muối Đà Nẵng / Bạc xỉu)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 8, y + 10, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 8, 6, 2); // Lớp kem muối béo

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 18, y + 12, 6, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 19, y + 6, 2, 6); // Ống hút

    // Lọ hoa nhỏ trên bàn
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(x + 14, y + 16, 4, 4);
  }

  /**
   * Tạo 4 bộ Spritesheets mặc định
   */
  static generateAllAvatars(scene) {
    return this.generateAllCharacterSpritesheets(scene);
  }

  static generateAllCharacterSpritesheets(scene) {
    const avatarConfigs = [
      { id: 'dev_hoodie', hair: '#1e293b', skin: '#fcd34d', shirt: '#2563eb', pants: '#1e293b', accessory: 'glasses_smart', name: 'Dev Alpha' },
      { id: 'cyberpunk_pink', hair: '#ec4899', skin: '#fde047', shirt: '#9333ea', pants: '#06b6d4', accessory: 'sunglasses_cool', name: 'Cyber Neon' },
      { id: 'red_gamer', hair: '#7f1d1d', skin: '#fbcfe8', shirt: '#ef4444', pants: '#18181b', accessory: 'headphones_rgb', name: 'Gamer Pro' },
      { id: 'green_coder', hair: '#064e3b', skin: '#fed7aa', shirt: '#10b981', pants: '#334155', accessory: 'frog_crown', name: 'Code Master' }
    ];

    avatarConfigs.forEach(cfg => {
      this.generateCharacterSpritesheet(scene, cfg);
    });
  }

  static generateCharacterSpritesheet(scene, config) {
    const frameW = 32;
    const frameH = 32;
    const cols = 3;
    const rows = 4;

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

  /**
   * Sinh Spritesheet tùy chỉnh động cho Wardrobe Customizer
   */
  static generateCustomAvatar(scene, wardrobeConfig, textureKey) {
    const frameW = 32;
    const frameH = 32;
    const cols = 3;
    const rows = 4;

    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');

    const config = {
      gender: wardrobeConfig.gender || 'male',
      hairstyle: wardrobeConfig.hairstyle || (wardrobeConfig.gender === 'female' ? 'long' : 'short'),
      hair: wardrobeConfig.hairColor || '#0f172a',
      skin: '#fcd34d',
      outfitType: wardrobeConfig.outfitType || 'hoodie',
      shirt: wardrobeConfig.hoodieColor || wardrobeConfig.outfitColor || '#f26f21',
      collarColor: wardrobeConfig.collarColor || '#002147',
      pants: wardrobeConfig.pantsColor || (wardrobeConfig.outfitType === 'aodai' ? '#ffffff' : (wardrobeConfig.outfitType === 'dress' || wardrobeConfig.outfitType === 'sailor' ? '#38bdf8' : '#1e293b')),
      accessory: wardrobeConfig.accessory || 'none'
    };

    const directions = ['down', 'left', 'right', 'up'];

    for (let r = 0; r < rows; r++) {
      const dir = directions[r];
      for (let c = 0; c < cols; c++) {
        const frameX = c * frameW;
        const frameY = r * frameH;
        this.drawCharacterFrame(ctx, frameX, frameY, dir, c, config);
      }
    }

    if (scene.textures.exists(textureKey)) {
      scene.textures.remove(textureKey);
    }

    scene.textures.addSpriteSheet(textureKey, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });

    this.createCharacterAnimations(scene, textureKey.replace('char_', ''));
    return canvas;
  }

  static drawCharacterFrame(ctx, x, y, direction, frameIndex, config) {
    const {
      gender = 'male',
      hairstyle = (gender === 'female' ? 'long' : 'short'),
      hair = '#0f172a',
      skin = '#fcd34d',
      outfitType = 'hoodie',
      shirt = '#f26f21',
      collarColor = '#002147',
      pants = '#1e293b',
      accessory = 'none'
    } = config;

    ctx.clearRect(x, y, 32, 32);

    // Bóng dưới chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 29, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = frameIndex === 0 ? -2 : (frameIndex === 2 ? 2 : 0);

    // -------------------------------------------------------------
    // 1. PHÂN TẦNG THÂN DƯỚI: CHÂN, QUẦN, VÁY & TÀ ÁO DÀI
    // -------------------------------------------------------------
    if (outfitType === 'aodai') {
      // Quần lụa trắng Áo Dài truyền thống
      ctx.fillStyle = '#ffffff';
      if (direction === 'left' || direction === 'right') {
        ctx.fillRect(x + 13 + legOffset, y + 22, 6, 8);
      } else {
        ctx.fillRect(x + 11, y + 22, 4, 7);
        ctx.fillRect(x + 17, y + 22, 4, 7);
      }
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x + 10, y + 28, 5, 3);
      ctx.fillRect(x + 17, y + 28, 5, 3);

      // Tà Áo Dài mềm mại bay phấp phới
      ctx.fillStyle = shirt;
      if (direction === 'down' || direction === 'up') {
        ctx.fillRect(x + 9, y + 18, 14, 9);
        // Xẻ tà bên hông
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 15, y + 19, 2, 8);
      } else if (direction === 'left') {
        ctx.fillRect(x + 10, y + 18, 11, 9);
      } else if (direction === 'right') {
        ctx.fillRect(x + 11, y + 18, 11, 9);
      }
    } else if (outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
      // Váy nữ sinh / Đầm / Kimono
      ctx.fillStyle = shirt;
      ctx.fillRect(x + 9, y + 19, 14, 6);
      if (outfitType === 'sailor') {
        // Viền sọc trắng chân váy
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 9, y + 23, 14, 1);
      } else if (outfitType === 'yukata') {
        // Đai thắt lưng Obi
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 9, y + 18, 14, 3);
      }
      // Chân
      ctx.fillStyle = skin;
      ctx.fillRect(x + 11, y + 25, 3, 3);
      ctx.fillRect(x + 18, y + 25, 3, 3);
      // Giày
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 10, y + 28, 4, 3);
      ctx.fillRect(x + 18, y + 28, 4, 3);
    } else if (outfitType === 'croptop') {
      // Hở eo & Quần đùi ngắn thể thao / gym / bikini
      ctx.fillStyle = skin;
      ctx.fillRect(x + 11, y + 18, 10, 3);
      ctx.fillStyle = pants;
      ctx.fillRect(x + 10, y + 21, 12, 4);
      // Chân trần & Giày
      ctx.fillStyle = skin;
      ctx.fillRect(x + 11, y + 25, 3, 3);
      ctx.fillRect(x + 18, y + 25, 3, 3);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 10, y + 28, 4, 3);
      ctx.fillRect(x + 18, y + 28, 4, 3);
    } else if (outfitType === 'wizard' || outfitType === 'cardigan' || outfitType === 'martial') {
      // Áo choàng dài / Võ phục Vovinam
      ctx.fillStyle = pants;
      ctx.fillRect(x + 11, y + 22, 4, 7);
      ctx.fillRect(x + 17, y + 22, 4, 7);
      ctx.fillStyle = shirt;
      ctx.fillRect(x + 9, y + 18, 14, 7);
      if (outfitType === 'martial') {
        // Đai vàng Vovinam
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 9, y + 19, 14, 2);
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 10, y + 28, 5, 3);
      ctx.fillRect(x + 17, y + 28, 5, 3);
    } else {
      // Quần dài tiêu chuẩn
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
    }

    // -------------------------------------------------------------
    // 2. THÂN ÁO & CHI TIẾT ĐỒ HỌA THEO PHONG CÁCH
    // -------------------------------------------------------------
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 10, y + 14, 12, 8);

    if (outfitType === 'polo') {
      // Cổ áo Polo chính khóa
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 13, y + 14, 6, 2);
      ctx.fillRect(x + 15, y + 16, 2, 3);
    } else if (outfitType === 'sailor') {
      // Nơ cổ áo thủy thủ Sailor Anime
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, y + 14, 10, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 15, y + 15, 2, 3);
    } else if (outfitType === 'suit') {
      // Áo sơ mi trắng + Cà vạt / Ve áo Blazer
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 14, y + 14, 4, 4);
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 15, y + 15, 2, 5);
    } else if (outfitType === 'jersey') {
      // Sọc áo số thể thao
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 14, y + 15, 4, 4);
      ctx.fillStyle = shirt;
      ctx.fillRect(x + 15, y + 16, 2, 2);
    } else if (outfitType === 'bomber' || outfitType === 'biker') {
      // Đường khóa kéo kim loại Cyber Bomber / Biker
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 15, y + 14, 2, 8);
    } else if (outfitType === 'barista') {
      // Tạp dề nâu Barista chuyên nghiệp
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 11, y + 15, 10, 7);
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 14, y + 17, 4, 3);
    } else if (outfitType === 'mecha') {
      // Lõi năng lượng phát sáng Mecha Suit
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 14, y + 16, 4, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 15, y + 17, 2, 1);
    } else if (outfitType === 'frog') {
      // Yếm bụng tròn Cóc Vàng Mascot
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 12, y + 15, 8, 6);
    } else {
      // Viền gấu áo
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x + 10, y + 21, 12, 1);
    }

    // -------------------------------------------------------------
    // 3. TAY ÁO & TAY NGƯỜI
    // -------------------------------------------------------------
    const isShortSleeve = outfitType === 'tee' || outfitType === 'dress' || outfitType === 'croptop' || outfitType === 'polo';
    ctx.fillStyle = isShortSleeve ? skin : shirt;
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

    // -------------------------------------------------------------
    // 4. KHUÔN MẶT & ĐÔI MẮT
    // -------------------------------------------------------------
    ctx.fillStyle = skin;
    ctx.fillRect(x + 11, y + 6, 10, 8);

    ctx.fillStyle = '#0f172a';
    if (direction === 'down') {
      ctx.fillRect(x + 13, y + 10, 2, 2);
      ctx.fillRect(x + 17, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 13, y + 10, 1, 1);
      ctx.fillRect(x + 17, y + 10, 1, 1);
      if (gender === 'female') {
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(x + 12, y + 12, 2, 1);
        ctx.fillRect(x + 18, y + 12, 2, 1);
      }
    } else if (direction === 'left') {
      ctx.fillRect(x + 11, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, y + 10, 1, 1);
    } else if (direction === 'right') {
      ctx.fillRect(x + 19, y + 10, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 20, y + 10, 1, 1);
    }

    // -------------------------------------------------------------
    // 5. BỘ SƯU TẬP 20 KIỂU TÓC THỜI THƯỢNG (20 HAIRSTYLES)
    // -------------------------------------------------------------
    ctx.fillStyle = hair;

    if (hairstyle === 'long') {
      // 1. Tóc Dài Suôn Mượt Nữ Sinh
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 9, y + 6, 3, 12);
        ctx.fillRect(x + 20, y + 6, 3, 12);
      } else if (direction === 'up') {
        ctx.fillRect(x + 9, y + 3, 14, 15);
      } else if (direction === 'left') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 17, y + 5, 5, 13);
      } else if (direction === 'right') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 10, y + 5, 5, 13);
      }
    } else if (hairstyle === 'ponytail') {
      // 2. Tóc Đuôi Ngựa Năng Động
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 10, y + 6, 2, 4);
        ctx.fillRect(x + 20, y + 6, 2, 4);
        ctx.fillRect(x + 22, y + 3, 3, 7);
      } else if (direction === 'up') {
        ctx.fillRect(x + 10, y + 3, 12, 9);
        ctx.fillRect(x + 15, y + 1, 3, 7);
      } else if (direction === 'left') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 21, y + 4, 4, 6);
      } else if (direction === 'right') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 7, y + 4, 4, 6);
      }
    } else if (hairstyle === 'twintails') {
      // 3. Tóc Hai Chùm Twintails Anime
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 7, y + 4, 3, 9);
        ctx.fillRect(x + 22, y + 4, 3, 9);
      } else if (direction === 'up') {
        ctx.fillRect(x + 9, y + 3, 14, 9);
        ctx.fillRect(x + 7, y + 4, 3, 9);
        ctx.fillRect(x + 22, y + 4, 3, 9);
      } else if (direction === 'left') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 19, y + 4, 4, 9);
      } else if (direction === 'right') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 9, y + 4, 4, 9);
      }
    } else if (hairstyle === 'bob') {
      // 4. Tóc Bob Ngắn Ngang Cằm
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 9, y + 6, 3, 7);
        ctx.fillRect(x + 20, y + 6, 3, 7);
      } else if (direction === 'up') {
        ctx.fillRect(x + 9, y + 4, 14, 9);
      } else if (direction === 'left') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 16, y + 6, 5, 7);
      } else if (direction === 'right') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 11, y + 6, 5, 7);
      }
    } else if (hairstyle === 'wavy_long') {
      // 5. Tóc Uốn Sóng Nước Bồng Bềnh
      if (direction === 'down') {
        ctx.fillRect(x + 9, y + 3, 14, 4);
        ctx.fillRect(x + 8, y + 6, 4, 12);
        ctx.fillRect(x + 20, y + 6, 4, 12);
        ctx.fillRect(x + 7, y + 12, 2, 5);
        ctx.fillRect(x + 23, y + 12, 2, 5);
      } else if (direction === 'up') {
        ctx.fillRect(x + 8, y + 3, 16, 15);
      } else if (direction === 'left') {
        ctx.fillRect(x + 9, y + 3, 14, 4);
        ctx.fillRect(x + 16, y + 5, 6, 14);
      } else if (direction === 'right') {
        ctx.fillRect(x + 9, y + 3, 14, 4);
        ctx.fillRect(x + 10, y + 5, 6, 14);
      }
    } else if (hairstyle === 'space_buns') {
      // 6. Tóc Búi Hai Bên Na Tra / Pucca
      if (direction === 'down' || direction === 'up') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 8, y + 1, 4, 4);
        ctx.fillRect(x + 20, y + 1, 4, 4);
      } else if (direction === 'left') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 18, y + 1, 4, 4);
      } else if (direction === 'right') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 10, y + 1, 4, 4);
      }
    } else if (hairstyle === 'hime_cut') {
      // 7. Tóc Hime Mái Bằng Công Chúa
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 3, 12, 6);
        ctx.fillRect(x + 9, y + 7, 3, 5);
        ctx.fillRect(x + 20, y + 7, 3, 5);
        ctx.fillRect(x + 8, y + 12, 2, 6);
        ctx.fillRect(x + 22, y + 12, 2, 6);
      } else if (direction === 'up') {
        ctx.fillRect(x + 8, y + 3, 16, 15);
      } else {
        ctx.fillRect(x + 10, y + 3, 12, 5);
        ctx.fillRect(x + 16, y + 6, 5, 12);
      }
    } else if (hairstyle === 'braids') {
      // 8. Tóc Tết Bím Hai Bên
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 9, y + 7, 2, 3);
        ctx.fillRect(x + 21, y + 7, 2, 3);
        ctx.fillRect(x + 10, y + 10, 2, 4);
        ctx.fillRect(x + 20, y + 10, 2, 4);
      } else if (direction === 'up') {
        ctx.fillRect(x + 9, y + 3, 14, 9);
        ctx.fillRect(x + 10, y + 11, 3, 5);
        ctx.fillRect(x + 19, y + 11, 3, 5);
      } else {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 16, y + 6, 4, 9);
      }
    } else if (hairstyle === 'pixie_cut') {
      // 9. Tóc Pixie Nữ Ngắn Cá Tính
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 4, 12, 3);
        ctx.fillRect(x + 10, y + 6, 3, 3);
        ctx.fillRect(x + 20, y + 6, 2, 2);
      } else if (direction === 'up') {
        ctx.fillRect(x + 10, y + 4, 12, 7);
      } else {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 17, y + 6, 4, 4);
      }
    } else if (hairstyle === 'afro_curly') {
      // 10. Tóc Xoăn Xù Hippie Bồng Bềnh
      ctx.fillRect(x + 8, y + 1, 16, 8);
      ctx.fillRect(x + 7, y + 4, 18, 6);
    } else if (hairstyle === 'parted') {
      // 11. Tóc Mái 7/3 Lãng Tử Nam
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 10, y + 5, 3, 4);
        ctx.fillRect(x + 19, y + 5, 3, 3);
      } else if (direction === 'up') {
        ctx.fillRect(x + 10, y + 3, 12, 9);
      } else {
        ctx.fillRect(x + 10, y + 3, 12, 4);
        ctx.fillRect(x + 17, y + 5, 4, 5);
      }
    } else if (hairstyle === 'undercut') {
      // 12. Tóc Undercut Vuốt Ngược
      if (direction === 'down') {
        ctx.fillRect(x + 11, y + 2, 10, 4);
        ctx.fillRect(x + 12, y + 6, 8, 2);
      } else if (direction === 'up') {
        ctx.fillRect(x + 11, y + 2, 10, 7);
      } else {
        ctx.fillRect(x + 11, y + 2, 10, 4);
        ctx.fillRect(x + 15, y + 5, 4, 3);
      }
    } else if (hairstyle === 'curly_perm') {
      // 13. Tóc Xoăn Xù Mì Hàn Quốc
      ctx.fillRect(x + 9, y + 2, 14, 5);
      ctx.fillRect(x + 9, y + 6, 3, 4);
      ctx.fillRect(x + 20, y + 6, 3, 4);
    } else if (hairstyle === 'bowl_cut') {
      // 14. Tóc Đầu Nấm Dễ Thương (Bowl Cut)
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 3, 12, 6);
      } else if (direction === 'up') {
        ctx.fillRect(x + 9, y + 3, 14, 9);
      } else {
        ctx.fillRect(x + 10, y + 3, 12, 6);
      }
    } else if (hairstyle === 'man_bun') {
      // 15. Tóc Búi Củ Tỏi Samurai
      if (direction === 'down' || direction === 'up') {
        ctx.fillRect(x + 10, y + 4, 12, 5);
        ctx.fillRect(x + 14, y + 1, 4, 3);
      } else {
        ctx.fillRect(x + 10, y + 4, 12, 5);
        ctx.fillRect(x + 18, y + 2, 3, 3);
      }
    } else if (hairstyle === 'spiky_anime') {
      // 16. Tóc Dựng Anime Gai Nhọn Shonen
      ctx.fillRect(x + 10, y + 4, 12, 4);
      ctx.fillRect(x + 11, y + 1, 3, 3);
      ctx.fillRect(x + 15, y + 0, 3, 4);
      ctx.fillRect(x + 19, y + 1, 3, 3);
    } else if (hairstyle === 'dreadlocks') {
      // 17. Tóc Dreadlocks Hip-Hop
      ctx.fillRect(x + 9, y + 3, 14, 4);
      ctx.fillRect(x + 8, y + 6, 3, 8);
      ctx.fillRect(x + 21, y + 6, 3, 8);
    } else if (hairstyle === 'wolf_cut') {
      // 18. Tóc Wolf Cut Layered Bụi Bặm
      ctx.fillRect(x + 9, y + 3, 14, 4);
      ctx.fillRect(x + 9, y + 6, 3, 6);
      ctx.fillRect(x + 20, y + 6, 3, 6);
      ctx.fillRect(x + 8, y + 10, 2, 4);
      ctx.fillRect(x + 22, y + 10, 2, 4);
    } else if (hairstyle === 'buzz_cut') {
      // 19. Tóc Đầu Đinh Huấn Luyện (Buzz Cut)
      ctx.fillRect(x + 11, y + 5, 10, 2);
    } else {
      // 20. Tóc Ngắn Thể Thao Mặc Định (Short Crop)
      if (direction === 'down') {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 10, y + 6, 2, 3);
        ctx.fillRect(x + 20, y + 6, 2, 3);
      } else if (direction === 'up') {
        ctx.fillRect(x + 10, y + 4, 12, 9);
      } else {
        ctx.fillRect(x + 10, y + 4, 12, 4);
        ctx.fillRect(x + 17, y + 6, 4, 5);
      }
    }

    // -------------------------------------------------------------
    // 6. PHỤ KIỆN ĐẶC SẮC (ACCESSORIES LAYER)
    // -------------------------------------------------------------
    if (accessory === 'glasses_smart' && direction !== 'up') {
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 12, y + 9, 3, 3);
      ctx.strokeRect(x + 17, y + 9, 3, 3);
      ctx.fillRect(x + 15, y + 10, 2, 1);
    } else if (accessory === 'sunglasses_cool' && direction !== 'up') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(x + 12, y + 9, 4, 3);
      ctx.fillRect(x + 16, y + 9, 4, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 13, y + 9, 1, 1);
      ctx.fillRect(x + 17, y + 9, 1, 1);
    } else if (accessory === 'headphones_rgb') {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x + 9, y + 8, 2, 5);
      ctx.fillRect(x + 21, y + 8, 2, 5);
      ctx.fillRect(x + 10, y + 3, 12, 2);
    } else if (accessory === 'ribbon_cute') {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x + 19, y + 2, 4, 3);
      ctx.fillRect(x + 18, y + 3, 2, 2);
      ctx.fillRect(x + 22, y + 3, 2, 2);
    } else if (accessory === 'cat_ears') {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 10, y + 1, 3, 3);
      ctx.fillRect(x + 19, y + 1, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, y + 2, 1, 1);
      ctx.fillRect(x + 20, y + 2, 1, 1);
    } else if (accessory === 'frog_crown') {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 12, y + 1, 8, 3);
      ctx.fillRect(x + 11, y + 1, 2, 2);
      ctx.fillRect(x + 19, y + 1, 2, 2);
      ctx.fillRect(x + 15, y + 0, 2, 2);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 15, y + 2, 2, 1);
    } else if (accessory === 'mask_cyber' && direction !== 'up') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 12, y + 12, 8, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 15, y + 13, 2, 1);
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
