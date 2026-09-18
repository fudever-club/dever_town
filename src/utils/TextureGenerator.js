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
    // 1. Gỗ sồi tự nhiên ấm áp (không còn màu cam cháy nhức mắt)
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(x, y, size, size);

    // 2. Từng thanh ván sàn với vân gỗ mộc mạc
    const plankH = 8;
    for (let i = 0; i < size; i += plankH) {
      ctx.fillStyle = (i % 16 === 0) ? '#784d28' : '#714825';
      ctx.fillRect(x, y + i, size, plankH - 1);

      // Rãnh giữa các thanh ván sàn
      ctx.fillStyle = '#4a2e16';
      ctx.fillRect(x, y + i + plankH - 1, size, 1);
    }

    // Mối ghép so le giữa các thanh gỗ
    ctx.fillStyle = '#4a2e16';
    ctx.fillRect(x + 10, y, 1, 8);
    ctx.fillRect(x + 24, y + 8, 1, 8);
    ctx.fillRect(x + 6, y + 16, 1, 8);
    ctx.fillRect(x + 20, y + 24, 1, 8);

    // Ánh bóng bề mặt nhẹ tự nhiên
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x + 2, y + 1, size - 4, 1);
  }

  static drawWall(ctx, x, y, size) {
    // Oblique 2.5D Wall (Cabinet Projection)
    // 1. Top face (mặt trên tường nhìn nghiêng từ trên xuống - 10px)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, size, 10);
    // Gờ mép đỉnh sáng highlight
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, size, 2);
    // Rãnh bóng đổ ngăn cách mặt đỉnh và mặt đứng
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + 9, size, 1);

    // 2. Front face (mặt đứng chính diện - 22px)
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y + 10, size, size - 10);

    // Họa tiết khối gạch slate 3D tinh xảo
    ctx.fillStyle = '#334155';
    for (let row = 10; row < size; row += 7) {
      ctx.fillRect(x, y + row, size, 1);
      const offset = (Math.floor(row / 7) % 2 === 0) ? 0 : 8;
      for (let col = offset; col < size; col += 16) {
        ctx.fillRect(x + col, y + row, 1, 7);
      }
    }

    // 3. Chân tường (Baseboard / Skirting)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y + size - 2, size, 2);
  }

  static drawBookshelf(ctx, x, y, size) {
    // Oblique 2.5D Bookshelf
    // 1. Nóc kệ sách (Top face)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 1, y + 2, size - 2, 6);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 1, y + 2, size - 2, 2); // Highlight viền đỉnh

    // 2. Thân tủ và sườn bên (bóng cạnh phải)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 1, y + 8, size - 2, size - 10);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + size - 3, y + 8, 2, size - 10); // Cạnh sườn đổ bóng

    // 3. Ba ngăn kệ khoét sâu vào trong
    const shelfY = [9, 17, 25];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    shelfY.forEach((sy, sIdx) => {
      // Hốc kệ tối màu tạo chiều sâu
      ctx.fillStyle = '#291102';
      ctx.fillRect(x + 3, y + sy, size - 7, 7);

      // Các cuốn sách xếp ngay ngắn
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = colors[(sIdx * 3 + b) % colors.length];
        ctx.fillRect(x + 4 + b * 5, y + sy + 1, 4, 6);
        // Gáy sách phản quang highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x + 5 + b * 5, y + sy + 2, 2, 1);
      }

      // Thanh đợt gỗ đỡ kệ
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x + 2, y + sy + 6, size - 5, 1);
    });

    // Chân kệ sách chạm sàn
    ctx.fillStyle = '#291102';
    ctx.fillRect(x + 2, y + size - 2, 4, 2);
    ctx.fillRect(x + size - 6, y + size - 2, 4, 2);
  }

  static drawDeskWithLaptop(ctx, x, y, size) {
    // Oblique 2.5D Desk with Laptop
    // 1. Mặt trên bàn làm việc (Top surface - góc nhìn chếch 2.5D)
    ctx.fillStyle = '#a16207';
    ctx.fillRect(x + 2, y + 4, size - 4, 12);
    // Vệt highlight vân gỗ sáng trên mặt bàn
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 3, y + 5, size - 6, 2);

    // 2. Mặt trước gờ bàn (Front edge)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 2, y + 16, size - 4, 10);
    // Bóng cạnh phải bàn
    ctx.fillStyle = '#3d1a08';
    ctx.fillRect(x + size - 4, y + 16, 2, 10);

    // 3. Chân bàn gỗ 2.5D
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 4, y + 26, 3, 5);
    ctx.fillRect(x + size - 7, y + 26, 3, 5);

    // 4. Laptop trên mặt bàn (2.5D)
    // Màn hình mở
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 10, y + 6, 12, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 11, y + 7, 10, 4);
    // Bàn phím gập
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 9, y + 12, 14, 3);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 13, y + 13, 6, 1);

    // 5. Cốc cà phê DEVER
    ctx.fillStyle = '#f87171';
    ctx.fillRect(x + 24, y + 7, 4, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 25, y + 8, 2, 2);
    // Quai cốc
    ctx.fillStyle = '#f87171';
    ctx.fillRect(x + 28, y + 8, 1, 3);
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
    // Oblique 2.5D Server Rack
    // 1. Nóc server rack (Top face nghiêng)
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 2, y + 2, size - 4, 6);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y + 2, size - 4, 2);

    // 2. Thân rack (Front face)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 2, y + 8, size - 4, size - 10);
    // Rãnh sườn bên phải đổ bóng
    ctx.fillStyle = '#020617';
    ctx.fillRect(x + size - 4, y + 8, 2, size - 10);

    // 3. Khay máy chủ 1U - 4U
    for (let u = 0; u < 4; u++) {
      const uy = y + 9 + u * 5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 4, uy, size - 9, 4);

      // Đèn tín hiệu nháy LED
      ctx.fillStyle = (u % 2 === 0) ? '#22c55e' : '#38bdf8';
      ctx.fillRect(x + 6, uy + 1, 2, 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 10, uy + 1, 2, 2);

      // Khe tản nhiệt
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 14, uy + 1, 9, 1);
      ctx.fillRect(x + 14, uy + 2, 9, 1);
    }
  }

  static drawCyberFloor(ctx, x, y, size) {
    // Tấm kim loại slate đen mờ hiện đại
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    // Rãnh viền kỹ thuật mỏng tinh tế
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);

    // Điểm tiếp xúc vi mạch xanh neon nhẹ 4 góc
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 4, y + 4, 2, 2);
    ctx.fillRect(x + size - 6, y + 4, 2, 2);
    ctx.fillRect(x + 4, y + size - 6, 2, 2);
    ctx.fillRect(x + size - 6, y + size - 6, 2, 2);
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
    // Oblique 2.5D Whiteboard
    // 1. Khung nhôm đỉnh nghiêng
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 3, y + 2, size - 6, 3);

    // 2. Mặt bảng viết melamine trắng
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 3, y + 5, size - 6, 18);
    // Bóng đổ gờ khung trên
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 4, y + 5, size - 8, 2);

    // Nét vẽ / sơ đồ trên bảng
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 6, y + 9, 8, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 16, y + 9, 7, 2);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + 6, y + 14, 15, 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(x + 8, y + 18, 6, 2);

    // 3. Khay đựng bút nhôm chìa ra trước
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 2, y + 23, size - 4, 2);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 6, y + 22, 3, 1);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 11, y + 22, 3, 1);

    // 4. Chân đế chữ A kim loại 2.5D
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 5, y + 25, 2, 6);
    ctx.fillRect(x + size - 7, y + 25, 2, 6);
    ctx.fillRect(x + 3, y + size - 2, 6, 2);
    ctx.fillRect(x + size - 9, y + size - 2, 6, 2);
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
    // Oblique 2.5D Coffee Bar Counter
    // 1. Mặt quầy đá cẩm thạch (Countertop - góc nhìn nghiêng)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 1, y + 4, size - 2, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 2, y + 5, size - 4, 2); // Highlight bóng mặt đá

    // 2. Thân quầy bar ốp nan gỗ xẻ sọc dọc sang trọng
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 1, y + 14, size - 2, size - 15);
    // Nan gỗ dọc
    ctx.fillStyle = '#451a03';
    for (let gx = 3; gx < size - 3; gx += 4) {
      ctx.fillRect(x + gx, y + 14, 1, size - 15);
    }
    // Gờ nẹp chân quầy
    ctx.fillStyle = '#291102';
    ctx.fillRect(x + 1, y + size - 2, size - 2, 2);

    // 3. Máy pha cafe Espresso kim loại trên mặt bàn
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 5, y + 5, 10, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 6, y + 6, 8, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 7, y + 7, 2, 2);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 11, y + 7, 2, 2);

    // 4. Cốc cafe takeaway & ly thủy tinh
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 20, y + 8, 4, 6);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(x + 20, y + 10, 4, 2); // Logo xanh FUDA
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 25, y + 7, 3, 7);
  }

  static drawGlassWall(ctx, x, y, size) {
    // 1. Nền tối sâu thẳm
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(x, y, size, size);

    // 2. Kính mờ phản quang công nghệ cao (frosted glass)
    ctx.fillStyle = 'rgba(30, 58, 138, 0.45)';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

    // 3. Lõi phát quang nhẹ xanh neon
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);

    // 4. Khung viền kim loại bo tinh xảo (không còn đường gạch chéo thô!)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2.5, y + 2.5, size - 5, size - 5);

    // 5. Điểm nhấn tán xạ ánh sáng cạnh trên và góc
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(x + 4, y + 3, size - 8, 1);
    ctx.fillRect(x + 3, y + 4, 1, 3);
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

  // 28: Mặt nước hồ bơi FPTU (Swimming Pool - Crystal Aqua Water)
  static drawSwimmingPool(ctx, x, y, size) {
    // Nền nước xanh biển sâu & ngọc bích
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, y, size, size);

    // Lớp nước bề mặt trong trẻo
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

    // Hiệu ứng phản chiếu ánh sáng mặt nước (Caustic Glistening)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + size, y + size - 4);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x + size - 8, y + size);
    ctx.stroke();

    // Gợn sóng bọt nước trắng lấp lánh (Gentle Shimmer)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x + 5, y + 6, 6, 1.5);
    ctx.fillRect(x + 18, y + 14, 8, 1.5);
    ctx.fillRect(x + 8, y + 22, 5, 1.5);

    // Điểm sáng phản quang
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(x + 7, y + 5, 2, 2);
    ctx.fillRect(x + 22, y + 13, 2, 2);
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
      { id: 'dev_hoodie', hair: '#1e293b', skin: '#fbd1a2', shirt: '#2563eb', pants: '#1e293b', accessory: 'glasses_smart', name: 'Dev Alpha' },
      { id: 'cyberpunk_pink', hair: '#ec4899', skin: '#fcd3b0', shirt: '#9333ea', pants: '#06b6d4', accessory: 'sunglasses_cool', name: 'Cyber Neon' },
      { id: 'red_gamer', hair: '#7f1d1d', skin: '#fce7d2', shirt: '#ef4444', pants: '#18181b', accessory: 'headphones_rgb', name: 'Gamer Pro' },
      { id: 'green_coder', hair: '#064e3b', skin: '#fbd1a2', shirt: '#10b981', pants: '#334155', accessory: 'frog_crown', name: 'Code Master' }
    ];

    avatarConfigs.forEach(cfg => {
      this.generateCharacterSpritesheet(scene, cfg);
    });
  }

  static generateCharacterSpritesheet(scene, config) {
    const frameW = 48;
    const frameH = 64;
    const cols = 4;
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

  static generateCustomAvatar(scene, wardrobeConfig, textureKey) {
    if (!wardrobeConfig || typeof wardrobeConfig !== 'object') return null;

    const frameW = 48;
    const frameH = 64;
    const cols = 4;
    const rows = 4;

    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');

    const config = {
      gender: wardrobeConfig.gender || 'male',
      hairstyle: wardrobeConfig.hairstyle || (wardrobeConfig.gender === 'female' ? 'long' : 'short'),
      hair: wardrobeConfig.hairColor || '#0f172a',
      skin: wardrobeConfig.skinColor || wardrobeConfig.skin || '#fbd1a2',
      skinTone: wardrobeConfig.skinTone || 'skin_natural',
      facialHair: wardrobeConfig.facialHair || 'none',
      expression: wardrobeConfig.expression || 'expr_focus',
      outfitType: wardrobeConfig.outfitType || 'hoodie',
      shirt: wardrobeConfig.hoodieColor || wardrobeConfig.outfitColor || '#f26f21',
      collarColor: wardrobeConfig.collarColor || '#002147',
      pants: wardrobeConfig.pantsColor || (wardrobeConfig.outfitType === 'aodai' ? '#ffffff' : (wardrobeConfig.outfitType === 'dress' || wardrobeConfig.outfitType === 'sailor' ? '#38bdf8' : '#1e293b')),
      accessory: wardrobeConfig.accessory || 'none',
      inHandItem: wardrobeConfig.inHandItem || wardrobeConfig.equippedItemId || null
    };

    // 1. Kiểm tra xem outfit/character được chọn có tương ứng với Spritesheet Gather.town HD đã preload không
    const outfitId = wardrobeConfig.characterId || wardrobeConfig.outfitId || 'hoodie_dever';
    const normalizedOutfitId = outfitId === 'barista_apron' ? 'apron_barista' : outfitId;
    const prebakedKey = normalizedOutfitId ? (normalizedOutfitId.startsWith('char_') ? normalizedOutfitId : `char_${normalizedOutfitId}`) : null;

    let usedPrebaked = false;
    if (prebakedKey && scene && scene.textures && scene.textures.exists(prebakedKey)) {
      try {
        const srcTex = scene.textures.get(prebakedKey);
        const srcImg = srcTex.getSourceImage();
        if (srcImg) {
          ctx.drawImage(srcImg, 0, 0, canvas.width, canvas.height);
          usedPrebaked = true;

          // Vẽ vật phẩm cầm tay (in-hand equipment) lên trên bộ Chibi spritesheet đã preload
          if (config.inHandItem && config.inHandItem !== 'none') {
            const directions = ['down', 'left', 'right', 'up'];
            for (let r = 0; r < rows; r++) {
              const dir = directions[r];
              for (let c = 0; c < cols; c++) {
                this.drawInHandEquipment(ctx, c * frameW, r * frameH, dir, c, config.inHandItem);
              }
            }
          }
        }
      } catch (e) {}
    }

    // 2. Fallback sinh Canvas từng frame nếu không có spritesheet pre-baked
    if (!usedPrebaked) {
      const directions = ['down', 'left', 'right', 'up'];
      for (let r = 0; r < rows; r++) {
        const dir = directions[r];
        for (let c = 0; c < cols; c++) {
          this.drawCharacterFrame(ctx, c * frameW, r * frameH, dir, c, config);
        }
      }
    }

    const actualKey = scene.textures.exists(textureKey)
      ? `${textureKey}_v${Date.now()}`
      : textureKey;

    scene.textures.addSpriteSheet(actualKey, canvas, {
      frameWidth: frameW,
      frameHeight: frameH
    });

    this.createCharacterAnimations(scene, actualKey.replace('char_', ''));

    if (!TextureGenerator._keyRegistry) TextureGenerator._keyRegistry = {};
    TextureGenerator._keyRegistry[textureKey] = actualKey;

    return actualKey;
  }

  static getActualKey(logicalKey) {
    if (TextureGenerator._keyRegistry && TextureGenerator._keyRegistry[logicalKey]) {
      return TextureGenerator._keyRegistry[logicalKey];
    }
    return logicalKey;
  }

  static cleanupOldKey(scene, logicalKey, oldKey) {
    if (oldKey && oldKey !== logicalKey && scene.textures.exists(oldKey)) {
      scene.textures.remove(oldKey);
    }
  }

  static drawCharacterFrame(ctx, x, y, direction, frameIndex, config = {}) {
    const gender = config.gender || 'male';
    const hairstyle = config.hairstyle || (gender === 'female' ? 'long' : 'short');
    const hair = config.hair || config.hairColor || '#0f172a';
    const skin = config.skin || config.skinColor || '#fbd1a2';
    const skinTone = config.skinTone || 'skin_natural';
    const facialHair = config.facialHair || 'none';
    const expression = config.expression || 'expr_focus';
    const outfitType = config.outfitType || 'hoodie';
    const shirt = config.shirt || config.hoodieColor || config.outfitColor || '#f26f21';
    const collarColor = config.collarColor || '#002147';
    const pants = config.pants || config.pantsColor || '#1e293b';
    const accessory = config.accessory || 'none';
    const inHandItem = config.inHandItem || config.equippedItemId || null;

    const skinMap = {
      skin_fair: { base: '#fed7aa', highlight: '#ffedd5', shadow: '#fdba74' },
      skin_natural: { base: '#fbd1a2', highlight: '#fde68a', shadow: '#f59e0b' },
      skin_tan: { base: '#d97706', highlight: '#f59e0b', shadow: '#b45309' },
      skin_deep: { base: '#92400e', highlight: '#b45309', shadow: '#78350f' },
      skin_ebony: { base: '#573016', highlight: '#78350f', shadow: '#3b1d08' },
      skin_cyber: { base: '#bae6fd', highlight: '#e0f2fe', shadow: '#7dd3fc' }
    };
    const activeSkin = skinMap[skinTone] || { base: skin, highlight: skin, shadow: skin };

    ctx.clearRect(x, y, 48, 64);

    // 1. Shadow ellipse (x+24, y+60, rx=16, ry=5)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 24, y + 60, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leg offset logic for walk animation
    // Frame 0: idle
    // Frame 1: left leg fwd, right leg back -> diff logic
    // Frame 2: idle
    // Frame 3: right leg fwd, left leg back
    let leftLegOffset = 0;
    let rightLegOffset = 0;
    
    if (direction === 'left' || direction === 'right') {
        if (frameIndex === 1) { leftLegOffset = -4; rightLegOffset = 4; }
        else if (frameIndex === 3) { leftLegOffset = 4; rightLegOffset = -4; }
    } else {
        if (frameIndex === 1) { leftLegOffset = -2; rightLegOffset = 2; }
        else if (frameIndex === 3) { leftLegOffset = 2; rightLegOffset = -2; }
    }

    // --- LEGS & SHOES ---
    // Legs: 2 separate legs 6px wide each, y+45 to y+58
    // Shoes: y+58 to y+64
    
    // Draw legs
    if (outfitType === 'aodai') {
        ctx.fillStyle = '#ffffff';
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -3 : 0), y + 45, 6, 13);
        } else {
            ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
            ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
        }
    } else if (outfitType === 'croptop' || outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
        ctx.fillStyle = skin;
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -2 : 0), y + 45, 6, 13);
        } else {
            ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
            ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
        }
    } else {
        ctx.fillStyle = pants;
        if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -3 : 0), y + 45, 6, 13);
        } else {
            ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
            ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
        }
    }

    // Draw shoes (y+58 to y+64, 2-tone)
    ctx.fillStyle = '#0f172a';
    ctx.fillStyle = (outfitType === 'aodai' || outfitType === 'suit') ? '#000000' : '#1e293b';
    const soleColor = '#475569';
    if (direction === 'left' || direction === 'right') {
        let lx = x + 21 + (frameIndex % 2 === 1 ? -3 : 0);
        ctx.fillRect(lx, y + 58, 8, 4);
        ctx.fillStyle = soleColor;
        ctx.fillRect(lx, y + 62, 8, 2);
    } else {
        ctx.fillRect(x + 15, y + 58 + leftLegOffset, 8, 4);
        ctx.fillRect(x + 25, y + 58 + rightLegOffset, 8, 4);
        ctx.fillStyle = soleColor;
        ctx.fillRect(x + 15, y + 62 + leftLegOffset, 8, 2);
        ctx.fillRect(x + 25, y + 62 + rightLegOffset, 8, 2);
    }

    // --- LOWER BODY / OUTFIT SKIRT (if applicable) ---
    if (outfitType === 'aodai') {
        ctx.fillStyle = shirt;
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(x + 13, y + 27, 22, 22);
            // Xẻ tà
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x + 23, y + 35, 2, 14);
        } else if (direction === 'left' || direction === 'right') {
            ctx.fillRect(x + 16, y + 27, 16, 22);
        }
    } else if (outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
        ctx.fillStyle = shirt;
        ctx.fillRect(x + 13, y + 36, 22, 12);
        if (outfitType === 'sailor') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 13, y + 45, 22, 2);
        } else if (outfitType === 'yukata') {
            ctx.fillStyle = collarColor;
            ctx.fillRect(x + 13, y + 36, 22, 4);
        }
    } else if (outfitType === 'wizard' || outfitType === 'cardigan' || outfitType === 'martial') {
        ctx.fillStyle = shirt;
        ctx.fillRect(x + 13, y + 36, 22, 12);
        if (outfitType === 'martial') {
            ctx.fillStyle = collarColor;
            ctx.fillRect(x + 13, y + 38, 22, 3);
        }
    } else if (outfitType === 'croptop') {
        ctx.fillStyle = pants;
        ctx.fillRect(x + 15, y + 40, 18, 6);
    } else {
        ctx.fillStyle = pants;
        ctx.fillRect(x + 15, y + 42, 18, 5);
    }

    // --- TORSO / SHIRT ---
    // y+27 to y+44 (18px)
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 14, y + 27, 20, 15);
    if (outfitType === 'croptop') {
        ctx.fillStyle = activeSkin.base;
        ctx.fillRect(x + 15, y + 36, 18, 4);
    }

    // Details on Torso
    if (outfitType === 'polo') {
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 21, y + 27, 6, 4);
        ctx.fillRect(x + 23, y + 31, 2, 4);
    } else if (outfitType === 'sailor') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 27, 16, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 22, y + 30, 4, 4);
    } else if (outfitType === 'suit') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 21, y + 27, 6, 8);
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 23, y + 28, 2, 7);
    } else if (outfitType === 'jersey') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 20, y + 30, 8, 8);
        ctx.fillStyle = shirt;
        ctx.fillRect(x + 22, y + 32, 4, 4);
    } else if (outfitType === 'bomber' || outfitType === 'biker') {
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 23, y + 27, 2, 15);
    } else if (outfitType === 'barista') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 16, y + 28, 16, 14);
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 21, y + 31, 6, 4);
    } else if (outfitType === 'mecha') {
        ctx.fillStyle = collarColor;
        ctx.fillRect(x + 20, y + 30, 8, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 22, y + 32, 4, 2);
    } else if (outfitType === 'frog') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 18, y + 30, 12, 10);
    }

    // --- ARMS WITH SWING LOGIC ---
    // ARM SWING LOGIC:
    // direction === 'down' || 'up':
    // Frame 0: left arm x+8, y+28; right arm x+32, y+28 (both thả dọc)
    // Frame 1: left arm x+6, y+26; right arm x+34, y+30 (right arm fwd)
    // Frame 2: same as frame 0
    // Frame 3: left arm x+6, y+30; right arm x+34, y+26 (left arm fwd)
    const isShortSleeve = ['tee', 'dress', 'croptop', 'polo'].includes(outfitType);
    let lArmX, lArmY, rArmX, rArmY;
    let lArmW = 6, lArmH = 16, rArmW = 6, rArmH = 16;
    
    if (direction === 'down' || direction === 'up') {
        if (frameIndex === 0 || frameIndex === 2) {
            lArmX = x + 8; lArmY = y + 28;
            rArmX = x + 34; rArmY = y + 28;
        } else if (frameIndex === 1) {
            lArmX = x + 6; lArmY = y + 26; lArmH = 18;
            rArmX = x + 36; rArmY = y + 30; rArmH = 14;
        } else if (frameIndex === 3) {
            lArmX = x + 6; lArmY = y + 30; lArmH = 14;
            rArmX = x + 36; rArmY = y + 26; rArmH = 18;
        }
    } else if (direction === 'left') {
        if (frameIndex === 0 || frameIndex === 2) {
            lArmX = x + 20; lArmY = y + 28; lArmW = 8; lArmH = 16;
        } else if (frameIndex === 1) {
            lArmX = x + 16; lArmY = y + 26; lArmW = 10; lArmH = 18;
        } else if (frameIndex === 3) {
            lArmX = x + 22; lArmY = y + 30; lArmW = 8; lArmH = 14;
        }
    } else if (direction === 'right') {
        if (frameIndex === 0 || frameIndex === 2) {
            rArmX = x + 20; rArmY = y + 28; rArmW = 8; rArmH = 16;
        } else if (frameIndex === 1) {
            rArmX = x + 22; rArmY = y + 30; rArmW = 8; rArmH = 14;
        } else if (frameIndex === 3) {
            rArmX = x + 16; rArmY = y + 26; rArmW = 10; rArmH = 18;
        }
    }

    const drawArm = (ax, ay, aw, ah, side) => {
        if (!ax) return;
        ctx.fillStyle = shirt;
        if (isShortSleeve) {
            ctx.fillRect(ax, ay, aw, ah/2);
            ctx.fillStyle = activeSkin.base;
            ctx.fillRect(ax, ay + ah/2, aw, ah/2);
        } else {
            ctx.fillRect(ax, ay, aw, ah);
            // hand
            ctx.fillStyle = activeSkin.base;
            ctx.fillRect(ax + 1, ay + ah, aw - 2, 4);
        }
    };

    // Xác định loại grip để không vẽ arm swing khi đang cầm vật phẩm 2 tay
    const isBothHandsItem = inHandItem && ['macbook_dev', 'golden_frog_plush'].includes(inHandItem);
    const isOneHandItem = inHandItem && !isBothHandsItem && inHandItem !== 'none';

    if (isBothHandsItem) {
        // Không vẽ arm swing — drawInHandEquipment sẽ vẽ tay ôm đồ phù hợp
    } else if (isOneHandItem) {
        // Vật phẩm 1 tay: vẽ tay không cầm đồ vung bình thường
        if (direction === 'left') {
            // Nhìn trái: vật cầm tay trái (phía trước), vẽ tay phải (phía sau) bình thường — nhưng tay phải ẩn khi nhìn trái
        } else if (direction === 'right') {
            // Nhìn phải: vật cầm tay phải (phía trước), vẽ tay trái (phía sau) bình thường — nhưng tay trái ẩn khi nhìn phải
        } else {
            // Hướng down/up: chỉ cần vẽ tay không cầm đồ vung bình thường
            drawArm(lArmX, lArmY, lArmW, lArmH, 'left');
            // Tay phải sẽ được vẽ bởi drawInHandEquipment
        }
    } else {
        // Không cầm gì — vung cả 2 tay bình thường
        if (direction !== 'left') drawArm(rArmX, rArmY, rArmW, rArmH, 'right');
        if (direction !== 'right') drawArm(lArmX, lArmY, lArmW, lArmH, 'left');
    }

    // --- HEAD SKIN BASE ---
    // y+6 to y+20, 14px wide centered at x+24 (x+17 to x+31)
    ctx.fillStyle = activeSkin.base;
    ctx.fillRect(x + 17, y + 6, 14, 14);
    ctx.fillStyle = activeSkin.shadow;
    ctx.fillRect(x + 17, y + 18, 14, 2); // jaw shadow

    // --- FACE FEATURES ---
    // Eyes: 3x2, Catchlight: 1x1, Mouth: 4x1, Nose: 1x1
    ctx.fillStyle = '#0f172a';
    if (direction === 'down') {
        if (expression === 'expr_smile') {
            ctx.fillRect(x + 19, y + 11, 3, 1);
            ctx.fillRect(x + 26, y + 11, 3, 1);
            ctx.fillRect(x + 18, y + 12, 1, 1);
            ctx.fillRect(x + 22, y + 12, 1, 1);
            ctx.fillRect(x + 25, y + 12, 1, 1);
            ctx.fillRect(x + 29, y + 12, 1, 1);
        } else if (expression === 'expr_cool') {
            ctx.fillRect(x + 19, y + 11, 3, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 19, y + 11, 1, 1);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + 26, y + 11, 3, 1);
        } else if (expression === 'expr_shock') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 18, y + 10, 4, 4);
            ctx.fillRect(x + 26, y + 10, 4, 4);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x + 19, y + 11, 2, 2);
            ctx.fillRect(x + 27, y + 11, 2, 2);
        } else if (expression === 'expr_chill') {
            ctx.fillRect(x + 19, y + 12, 3, 1);
            ctx.fillRect(x + 26, y + 12, 3, 1);
        } else {
            ctx.fillRect(x + 19, y + 11, 3, 2);
            ctx.fillRect(x + 26, y + 11, 3, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 19, y + 11, 1, 1);
            ctx.fillRect(x + 26, y + 11, 1, 1);
        }
        
        // Nose dot
        ctx.fillStyle = activeSkin.shadow;
        ctx.fillRect(x + 23, y + 14, 1, 1);

        // Mouth
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 22, y + 16, 4, 1);

        if (gender === 'female') {
            ctx.fillStyle = '#f472b6';
            ctx.fillRect(x + 17, y + 13, 2, 2);
            ctx.fillRect(x + 29, y + 13, 2, 2);
        }
    } else if (direction === 'left') {
        ctx.fillRect(x + 17, y + 11, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 17, y + 11, 1, 1);
        ctx.fillStyle = activeSkin.shadow;
        ctx.fillRect(x + 16, y + 14, 1, 1);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 16, y + 16, 2, 1);
    } else if (direction === 'right') {
        ctx.fillRect(x + 28, y + 11, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 30, y + 11, 1, 1);
        ctx.fillStyle = activeSkin.shadow;
        ctx.fillRect(x + 31, y + 14, 1, 1);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 30, y + 16, 2, 1);
    }

    // --- FACIAL HAIR ---
    if (facialHair && facialHair !== 'none' && direction !== 'up') {
        const beardColor = facialHair === 'grey_beard' ? '#94a3b8' : hair;
        ctx.fillStyle = beardColor;
        if (facialHair === 'full_beard' || facialHair === 'grey_beard') {
            if (direction === 'down') {
                ctx.fillRect(x + 17, y + 13, 2, 5);
                ctx.fillRect(x + 29, y + 13, 2, 5);
                ctx.fillRect(x + 19, y + 17, 10, 3);
            } else if (direction === 'left') {
                ctx.fillRect(x + 16, y + 13, 4, 5);
                ctx.fillRect(x + 18, y + 17, 6, 3);
            } else if (direction === 'right') {
                ctx.fillRect(x + 28, y + 13, 4, 5);
                ctx.fillRect(x + 24, y + 17, 6, 3);
            }
        } else if (facialHair === 'mustache') {
            if (direction === 'down') {
                ctx.fillRect(x + 20, y + 15, 8, 1);
            } else if (direction === 'left') {
                ctx.fillRect(x + 16, y + 15, 4, 1);
            } else if (direction === 'right') {
                ctx.fillRect(x + 28, y + 15, 4, 1);
            }
        } else if (facialHair === 'goatee') {
            if (direction === 'down') {
                ctx.fillRect(x + 22, y + 17, 4, 2);
            } else if (direction === 'left') {
                ctx.fillRect(x + 17, y + 17, 3, 2);
            } else if (direction === 'right') {
                ctx.fillRect(x + 28, y + 17, 3, 2);
            }
        } else if (facialHair === 'stubble') {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
            if (direction === 'down') {
                ctx.fillRect(x + 18, y + 16, 12, 3);
            } else if (direction === 'left') {
                ctx.fillRect(x + 17, y + 16, 6, 3);
            } else if (direction === 'right') {
                ctx.fillRect(x + 25, y + 16, 6, 3);
            }
        }
    }

    // --- HAIRSTYLES ---
    ctx.fillStyle = hair;
    // Scale hair from 32x32 to 48x64. (approx * 1.5 in width, and * 1.5-2 in height)
    // Let's implement generic scaling for hair to fit x+14 to x+34, y+2 to y+24
    if (hairstyle === 'long') {
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 14, y + 8, 4, 18);
            ctx.fillRect(x + 30, y + 8, 4, 18);
        } else if (direction === 'up') {
            ctx.fillRect(x + 14, y + 4, 20, 22);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 25, y + 7, 7, 19);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 16, y + 7, 7, 19);
        }
    } else if (hairstyle === 'ponytail') {
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 15, y + 8, 3, 6);
            ctx.fillRect(x + 30, y + 8, 3, 6);
            ctx.fillRect(x + 32, y + 4, 5, 10);
        } else if (direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 12);
            ctx.fillRect(x + 22, y + 1, 4, 10);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 31, y + 6, 6, 9);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 11, y + 6, 6, 9);
        }
    } else if (hairstyle === 'twintails') {
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            if (direction === 'up') ctx.fillRect(x + 14, y + 4, 20, 12);
            ctx.fillRect(x + 10, y + 6, 5, 14);
            ctx.fillRect(x + 33, y + 6, 5, 14);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 29, y + 6, 6, 14);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 13, y + 6, 6, 14);
        }
    } else if (hairstyle === 'bob') {
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 14, y + 8, 4, 10);
            ctx.fillRect(x + 30, y + 8, 4, 10);
        } else if (direction === 'up') {
            ctx.fillRect(x + 14, y + 4, 20, 14);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 24, y + 8, 7, 10);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 17, y + 8, 7, 10);
        }
    } else if (hairstyle === 'space_buns') {
        if (direction === 'down' || direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 12, y + 1, 6, 6);
            ctx.fillRect(x + 30, y + 1, 6, 6);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 27, y + 1, 6, 6);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 15, y + 1, 6, 6);
        }
    } else if (hairstyle === 'bald_professor') {
        if (direction === 'down') {
            ctx.fillRect(x + 14, y + 8, 4, 9);
            ctx.fillRect(x + 30, y + 8, 4, 9);
            ctx.fillRect(x + 13, y + 11, 3, 6);
            ctx.fillRect(x + 32, y + 11, 3, 6);
        } else if (direction === 'up') {
            ctx.fillRect(x + 14, y + 8, 20, 12);
            ctx.fillStyle = activeSkin.base;
            ctx.fillRect(x + 18, y + 6, 12, 6);
            ctx.fillStyle = hair;
        } else if (direction === 'left') {
            ctx.fillRect(x + 24, y + 7, 8, 12);
            ctx.fillRect(x + 21, y + 11, 6, 7);
        } else if (direction === 'right') {
            ctx.fillRect(x + 16, y + 7, 8, 12);
            ctx.fillRect(x + 21, y + 11, 6, 7);
        }
    } else {
        // Default short crop
        if (direction === 'down') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 15, y + 8, 3, 5);
            ctx.fillRect(x + 30, y + 8, 3, 5);
        } else if (direction === 'up') {
            ctx.fillRect(x + 15, y + 4, 18, 14);
        } else if (direction === 'left') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 25, y + 8, 6, 7);
        } else if (direction === 'right') {
            ctx.fillRect(x + 15, y + 4, 18, 6);
            ctx.fillRect(x + 17, y + 8, 6, 7);
        }
    }

    // --- ACCESSORIES ---
    if (accessory === 'glasses_smart' && direction !== 'up') {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 18, y + 10, 5, 4);
        ctx.strokeRect(x + 25, y + 10, 5, 4);
        ctx.fillRect(x + 23, y + 11, 2, 1);
    } else if (accessory === 'sunglasses_cool' && direction !== 'up') {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(x + 18, y + 10, 6, 4);
        ctx.fillRect(x + 24, y + 10, 6, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 20, y + 10, 2, 2);
        ctx.fillRect(x + 26, y + 10, 2, 2);
    } else if (accessory === 'headphones_rgb') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + 14, y + 10, 3, 7);
        ctx.fillRect(x + 31, y + 10, 3, 7);
        ctx.fillRect(x + 15, y + 3, 18, 3);
    } else if (accessory === 'cat_ears') {
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(x + 15, y + 1, 4, 4);
        ctx.fillRect(x + 29, y + 1, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 16, y + 2, 2, 2);
        ctx.fillRect(x + 30, y + 2, 2, 2);
    } else if (accessory === 'frog_crown') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(x + 18, y + 1, 12, 4);
        ctx.fillRect(x + 17, y + 1, 3, 3);
        ctx.fillRect(x + 28, y + 1, 3, 3);
        ctx.fillRect(x + 23, y + 0, 3, 3);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 23, y + 3, 3, 2);
    }

    // --- IN-HAND ITEMS ---
    if (inHandItem && inHandItem !== 'none') {
        this.drawInHandEquipment(ctx, x, y, direction, frameIndex, inHandItem, leftLegOffset);
    }
  }

  static drawInHandEquipment(ctx, x, y, direction, frameIndex, itemId, legOffset = 0) {
    if (!itemId || itemId === 'none') return;

    ctx.save();
    // Phù hợp với tỷ lệ Chibi 48x64 px (Tay ở khoảng y + 40..46, x + 10..14 và x + 33..38)
    if (itemId === 'macbook_dev') {
      if (direction === 'down') {
        // Laptop mở nằm ngang trước bụng/ngực
        ctx.fillStyle = '#94a3b8'; // Vỏ nhôm MacBook
        ctx.fillRect(x + 16, y + 40, 16, 9);
        ctx.fillStyle = '#38bdf8'; // Màn hình Retina phát sáng
        ctx.fillRect(x + 17, y + 41, 14, 6);
        ctx.fillStyle = '#ffffff'; // Logo táo khuyết
        ctx.fillRect(x + 23, y + 43, 2, 2);
        // Bàn tay giữ 2 cạnh máy
        ctx.fillStyle = '#fbd1a2';
        ctx.fillRect(x + 15, y + 43, 2, 3);
        ctx.fillRect(x + 31, y + 43, 2, 3);
      } else if (direction === 'left') {
        // Laptop kẹp bên hông/cầm ngang
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 13, y + 40, 6, 11);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 12, y + 41, 2, 8);
        ctx.fillStyle = '#fbd1a2';
        ctx.fillRect(x + 15, y + 44, 3, 3);
      } else if (direction === 'right') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 29, y + 40, 6, 11);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 34, y + 41, 2, 8);
        ctx.fillStyle = '#fbd1a2';
        ctx.fillRect(x + 30, y + 44, 3, 3);
      } else if (direction === 'up') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 16, y + 40, 16, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 23, y + 43, 2, 2);
      }
    } else if (itemId === 'danang_salt_coffee' || itemId === 'thermos_coffee') {
      const isLeft = direction === 'left';
      const isRight = direction === 'right';
      const cupX = isLeft ? x + 13 : (isRight ? x + 29 : x + 33);
      const cupY = y + 40;

      // Thân ly cà phê nâu đậm
      ctx.fillStyle = itemId === 'danang_salt_coffee' ? '#78350f' : '#f59e0b';
      ctx.fillRect(cupX, cupY, 7, 9);
      // Lớp bọt kem muối trắng mịn bồng bềnh
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(cupX - 1, cupY - 2, 9, 3);
      // Nắp & ống hút xanh
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cupX + 2, cupY - 5, 2, 4);
      // Làn khói / hương thơm cà phê nhẹ
      if (direction !== 'up') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(cupX + 1, cupY - 8, 2, 2);
        ctx.fillRect(cupX + 4, cupY - 10, 2, 2);
      }
      // Ngón tay cầm ly
      ctx.fillStyle = '#fbd1a2';
      ctx.fillRect(cupX + 4, cupY + 3, 3, 3);
    } else if (itemId === 'golden_frog_plush') {
      if (direction !== 'up') {
        const frogX = direction === 'left' ? x + 14 : (direction === 'right' ? x + 26 : x + 20);
        const frogY = y + 39;
        // Thân cóc vàng
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(frogX + 4, frogY + 4, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Khăn quàng đỏ may mắn
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(frogX + 1, frogY + 3, 7, 2);
        // Mắt cóc
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(frogX + 2, frogY + 1, 2, 2);
        ctx.fillRect(frogX + 5, frogY + 1, 2, 2);
        // Tay người chơi ôm cóc
        ctx.fillStyle = '#fbd1a2';
        ctx.fillRect(frogX - 1, frogY + 4, 2, 2);
        ctx.fillRect(frogX + 8, frogY + 4, 2, 2);
      }
    } else if (itemId === 'football_ball' || itemId === 'basketball_ball') {
      const isLeft = direction === 'left';
      const isRight = direction === 'right';
      const ballX = isLeft ? x + 12 : (isRight ? x + 31 : x + 33);
      const ballY = y + 43;

      ctx.fillStyle = itemId === 'basketball_ball' ? '#ea580c' : '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX + 4, ballY + 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (itemId === 'basketball_ball') {
        // Rãnh bóng rổ
        ctx.strokeStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(ballX + 4, ballY - 1);
        ctx.lineTo(ballX + 4, ballY + 9);
        ctx.stroke();
      } else {
        // Họa tiết bóng đá
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ballX + 3, ballY + 3, 2, 2);
      }
      // Bàn tay kẹp bóng
      ctx.fillStyle = '#fbd1a2';
      ctx.fillRect(ballX + 2, ballY + 1, 3, 2);
    } else if (itemId === 'dever_flag') {
      const isLeft = direction === 'left';
      const flagX = isLeft ? x + 12 : x + 33;
      // Cán cờ gỗ dài vững chãi
      ctx.fillStyle = '#78350f';
      ctx.fillRect(flagX, y + 16, 2, 32);
      // Lá cờ FU-DEVER xanh rực rỡ
      ctx.fillStyle = '#0066CC';
      const flagDir = isLeft ? -13 : 2;
      ctx.fillRect(flagX + flagDir, y + 16, 13, 9);
      // Viền cam FPTU
      ctx.fillStyle = '#f26f21';
      ctx.fillRect(flagX + flagDir, y + 23, 13, 2);
      // Tay cầm cán cờ
      ctx.fillStyle = '#fbd1a2';
      ctx.fillRect(flagX - 1, y + 43, 4, 3);
    }
    ctx.restore();
  }

  static createCharacterAnimations(scene, avatarId) {
    if (!scene || !scene.anims) return;
    const key = `char_${avatarId}`;
    const dirs = [
      { name: 'down', row: 0 },
      { name: 'left', row: 1 },
      { name: 'right', row: 2 },
      { name: 'up', row: 3 }
    ];

    dirs.forEach(({ name, row }) => {
      const baseFrame = row * 4;

      const walkKey = `walk_${name}_${avatarId}`;
      if (scene.anims.exists(walkKey)) scene.anims.remove(walkKey);
      scene.anims.create({
        key: walkKey,
        frames: scene.anims.generateFrameNumbers(key, {
          frames: [baseFrame, baseFrame + 1, baseFrame + 2, baseFrame + 3]
        }),
        frameRate: 8,
        repeat: -1
      });

      const idleKey = `idle_${name}_${avatarId}`;
      if (scene.anims.exists(idleKey)) scene.anims.remove(idleKey);
      scene.anims.create({
        key: idleKey,
        frames: [{ key, frame: baseFrame }],
        frameRate: 1
      });
      
      const breatheKey = `idle_breathe_${name}_${avatarId}`;
      if (scene.anims.exists(breatheKey)) scene.anims.remove(breatheKey);
      scene.anims.create({
        key: breatheKey,
        frames: [{ key, frame: baseFrame }, { key, frame: baseFrame + 2 }],
        frameRate: 0.8,
        repeat: -1
      });
    });
  }

  static generateNPCPortrait(scene, npcConfig, key) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 1. Nền Gradient thẻ bài Chibi Metaverse
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 96);
    bgGrad.addColorStop(0, '#0b1329');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 80, 96);

    // Vầng sáng spotlight sau lưng
    const radial = ctx.createRadialGradient(40, 48, 4, 40, 48, 40);
    radial.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    radial.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 80, 96);

    // Viền khung neon sắc nét
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 1, 78, 94);

    // Kiểm tra xem texture Chibi Gather.town có sẵn không
    const charKey = key ? key.replace('npc_portrait_', 'char_') : (npcConfig?.id ? `char_${npcConfig.id}` : null);
    if (charKey && scene && scene.textures && scene.textures.exists(charKey)) {
      try {
        const srcTex = scene.textures.get(charKey);
        const srcImg = srcTex.getSourceImage();
        if (srcImg) {
          // Lấy frame 0 (mặt trước 48x64), vẽ căn giữa tỉ lệ đẹp vào khung 80x96
          ctx.drawImage(srcImg, 0, 0, 48, 64, 7, 6, 66, 88);
          scene.textures.addCanvas(key, canvas);
          return canvas;
        }
      } catch (e) {}
    }

    const shirt = npcConfig.shirt || npcConfig.hoodieColor || npcConfig.outfitColor || '#2563eb';
    const collar = npcConfig.collarColor || '#1d4ed8';
    const hair = npcConfig.hair || npcConfig.hairColor || '#1e293b';
    const skinTone = npcConfig.skinTone || 'skin_natural';
    const skinMap = {
      skin_fair: { base: '#fed7aa', shadow: '#fdba74' },
      skin_natural: { base: '#fbd1a2', shadow: '#f59e0b' },
      skin_tan: { base: '#d97706', shadow: '#b45309' },
      skin_deep: { base: '#92400e', shadow: '#78350f' },
      skin_ebony: { base: '#573016', shadow: '#3b1d08' },
      skin_cyber: { base: '#bae6fd', shadow: '#7dd3fc' }
    };
    const skin = skinMap[skinTone] || { base: npcConfig.skin || '#fbd1a2', shadow: '#f59e0b' };

    // Fallback: Thân & Áo (Torso & Shoulders)
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.moveTo(8, 96);
    ctx.lineTo(8, 62);
    ctx.quadraticCurveTo(18, 52, 32, 50);
    ctx.lineTo(48, 50);
    ctx.quadraticCurveTo(62, 52, 72, 62);
    ctx.lineTo(72, 96);
    ctx.closePath();
    ctx.fill();

    // Cổ áo (Collar)
    ctx.fillStyle = collar;
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.lineTo(40, 62);
    ctx.lineTo(50, 50);
    ctx.closePath();
    ctx.fill();

    // 3. Cổ (Neck)
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(34, 42, 12, 10);

    // 4. Khuôn mặt (Face & Head)
    ctx.fillStyle = skin.base;
    ctx.beginPath();
    ctx.roundRect(24, 16, 32, 30, [8, 8, 12, 12]);
    ctx.fill();

    // Má hồng nhẹ
    ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.fillRect(26, 34, 5, 3);
    ctx.fillRect(49, 34, 5, 3);

    // 5. Đôi mắt & Lông mày (Eyes & Eyebrows)
    ctx.fillStyle = '#0f172a';
    // Lông mày
    ctx.fillRect(30, 26, 6, 2);
    ctx.fillRect(44, 26, 6, 2);
    // Mắt
    ctx.fillRect(31, 30, 5, 5);
    ctx.fillRect(44, 30, 5, 5);
    // Điểm sáng Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(32, 31, 2, 2);
    ctx.fillRect(45, 31, 2, 2);

    // Mũi & Miệng
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(39, 36, 2, 2);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(38, 40, 4, 1.5);

    // 6. Mái tóc (Hair)
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.roundRect(22, 10, 36, 16, [10, 10, 2, 2]);
    ctx.fill();
    // Mái tóc trước trán
    ctx.beginPath();
    ctx.moveTo(24, 18);
    ctx.lineTo(36, 22);
    ctx.lineTo(44, 18);
    ctx.lineTo(52, 23);
    ctx.lineTo(56, 18);
    ctx.lineTo(54, 12);
    ctx.lineTo(26, 12);
    ctx.closePath();
    ctx.fill();

    // Tóc 2 bên mai
    ctx.fillRect(21, 20, 4, 14);
    ctx.fillRect(55, 20, 4, 14);

    // 7. Phụ kiện Kính (nếu có)
    if (npcConfig.accessory === 'glasses_smart' || npcConfig.accessory === 'glasses') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(29, 29, 9, 7);
      ctx.strokeRect(42, 29, 9, 7);
      ctx.beginPath();
      ctx.moveTo(38, 32);
      ctx.lineTo(42, 32);
      ctx.stroke();
    }

    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addCanvas(key, canvas);
    return key;
  }
}
