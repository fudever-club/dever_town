/**
 * TextureGenerator: Tự sinh toàn bộ Tileset 32x32 (38 ô) và Spritesheets Nhân vật trên HTML Canvas.
 * Tích hợp nhận diện thương hiệu FPT University Đà Nẵng, CLB FU-DEVER, Khu Thể Thao & Tùy chỉnh Tủ Đồ.
 */
export class TextureGenerator {
  /**
   * Tạo Tileset hoàn chỉnh (30 ô 32x32)
   */
  static generateTileset(scene) {
    const tileSize = 32;
    const numTiles = 42; // 0-41: bao gồm ghế ngồi (40) và sofa (41)
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

    // 32-37: Nội thất Gather.town — Ký túc xá, Lớp học, Phòng PC
    this.drawBed(ctx, 32 * tileSize, 0, tileSize); // 32: Giường Ngủ KTX (Obstacle)
    this.drawDesktopPC(ctx, 33 * tileSize, 0, tileSize); // 33: PC Để Bàn Gaming/Dev (Obstacle)
    this.drawClassroomDesk(ctx, 34 * tileSize, 0, tileSize); // 34: Bàn Ghế Học Sinh (Obstacle)
    this.drawChalkboard(ctx, 35 * tileSize, 0, tileSize); // 35: Bảng Đen Lớp Học (Obstacle)
    this.drawSofa(ctx, 36 * tileSize, 0, tileSize); // 36: Sofa Phòng Sinh Hoạt (Obstacle)
    this.drawWardrobe(ctx, 37 * tileSize, 0, tileSize); // 37: Tủ Quần Áo KTX (Obstacle)

    // 38-39: Nội thất phòng họp Gather.town — Phòng Họp CLB & Lab Code
    this.drawConferenceTable(ctx, 38 * tileSize, 0, tileSize); // 38: Bàn Họp Hội Nghị Chữ U (Obstacle)
    this.drawProjectorScreen(ctx, 39 * tileSize, 0, tileSize); // 39: Màn Chiếu Projector (Obstacle)

    // 40-41: Ghế ngồi (walkable — dùng cho sit zones, nhân vật ngồi lên)
    this.drawSitChair(ctx, 40 * tileSize, 0, tileSize); // 40: Ghế gỗ ngồi học (Walkable)
    this.drawSitSofa(ctx, 41 * tileSize, 0, tileSize); // 41: Nệm sofa ngồi thư giãn (Walkable)

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

  // 32: Giường Ngủ KTX FUDA (Obstacle) — nhìn từ trên xuống
  static drawBed(ctx, x, y, size) {
    // Sàn gỗ phòng ngủ
    this.drawWoodFloor(ctx, x, y, size);

    // Khung giường gỗ
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 3, y + 2, size - 6, size - 4);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 4, y + 3, size - 8, size - 6);

    // Nệm trắng kem
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(x + 5, y + 8, size - 10, size - 14);

    // Gối đầu giường
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + 4, size - 12, 6);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 4, size - 12, 6);

    // Chăn đắp màu cam FPT
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 5, y + 16, size - 10, size - 22);
    ctx.fillStyle = '#fb923c';
    ctx.fillRect(x + 5, y + 16, size - 10, 2);
    // Họa tiết chăn
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + 9, y + 20, 4, 4);
    ctx.fillRect(x + 19, y + 20, 4, 4);
  }

  // 33: PC Để Bàn Dev/Gaming (Obstacle) — bàn + màn hình + case
  static drawDesktopPC(ctx, x, y, size) {
    // Mặt bàn gỗ tối
    ctx.fillStyle = '#44403c';
    ctx.fillRect(x + 1, y + 14, size - 2, size - 15);
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x + 1, y + 14, size - 2, 2);

    // Case PC đứng bên phải (đèn RGB)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 24, y + 4, 6, 12);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x + 25, y + 5, 4, 2);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(x + 25, y + 8, 4, 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(x + 25, y + 11, 4, 2);

    // Chân đế màn hình
    ctx.fillStyle = '#292524';
    ctx.fillRect(x + 11, y + 12, 6, 3);

    // Màn hình (viền đen + nền code xanh)
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(x + 6, y + 2, 16, 11);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 7, y + 3, 14, 9);
    // Dòng code phát sáng
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 8, y + 4, 8, 1);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 8, y + 6, 10, 1);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 8, y + 8, 6, 1);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 8, y + 10, 9, 1);

    // Bàn phím
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 7, y + 17, 14, 4);
    ctx.fillStyle = '#44403c';
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 8 + i * 3, y + 18, 2, 2);

    // Chuột
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x + 23, y + 17, 4, 5);
  }

  // 34: Bàn Ghế Học Sinh (Obstacle)
  static drawClassroomDesk(ctx, x, y, size) {
    // Sàn lớp học
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(x, y, size, size);

    // Ghế (phía dưới)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 10, y + 24, 12, 6);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(x + 10, y + 24, 12, 2);

    // Mặt bàn gỗ sáng
    ctx.fillStyle = '#d6a05c';
    ctx.fillRect(x + 4, y + 10, size - 8, 10);
    ctx.fillStyle = '#e8b96f';
    ctx.fillRect(x + 4, y + 10, size - 8, 2);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 4, y + 10, size - 8, 10);

    // Sách vở trên bàn
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 7, y + 12, 6, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 7, y + 12, 6, 1);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 16, y + 13, 5, 3);

    // Bút chì
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 18, y + 17, 6, 1);
  }

  // 35: Bảng Đen Lớp Học (Obstacle)
  static drawChalkboard(ctx, x, y, size) {
    // Tường phía sau
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x, y, size, size);

    // Khung gỗ bảng
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 2, y + 6, size - 4, 18);
    // Mặt bảng xanh đen
    ctx.fillStyle = '#1e3a2f';
    ctx.fillRect(x + 4, y + 8, size - 8, 14);

    // Chữ phấn trắng (công thức/code)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(x + 7, y + 10, 10, 1);
    ctx.fillRect(x + 7, y + 12, 14, 1);
    ctx.fillRect(x + 7, y + 14, 8, 1);
    ctx.fillStyle = 'rgba(252,211,77,0.9)';
    ctx.fillRect(x + 18, y + 16, 7, 1);
    ctx.fillRect(x + 7, y + 18, 12, 1);

    // Khay đựng phấn & khăn lau
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 4, y + 24, size - 8, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 23, 4, 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 20, y + 23, 5, 2);
  }

  // 36: Sofa Phòng Sinh Hoạt (Obstacle)
  static drawSofa(ctx, x, y, size) {
    // Sàn
    this.drawWoodFloor(ctx, x, y, size);

    // Thân sofa xanh navy
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 3, y + 10, size - 6, 14);
    // Tựa lưng
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(x + 3, y + 6, size - 6, 8);
    // Tay vịn 2 bên
    ctx.fillStyle = '#172554';
    ctx.fillRect(x + 3, y + 10, 5, 14);
    ctx.fillRect(x + size - 8, y + 10, 5, 14);

    // Đệm ngồi
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 9, y + 14, 7, 8);
    ctx.fillRect(x + 16, y + 14, 7, 8);
    // Gối tựa màu cam FPT
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 10, y + 8, 5, 5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 18, y + 8, 5, 5);
  }

  // 37: Tủ Quần Áo KTX (Obstacle)
  static drawWardrobe(ctx, x, y, size) {
    // Sàn gỗ
    this.drawWoodFloor(ctx, x, y, size);

    // Thân tủ gỗ nâu
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + 2, size - 8, size - 4);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 5, y + 3, size - 10, size - 6);

    // 2 cánh tủ
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 5, 9, size - 12);
    ctx.strokeRect(x + 17, y + 5, 9, size - 12);

    // Tay nắm cửa kim loại
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 13, y + 14, 2, 4);
    ctx.fillRect(x + 17, y + 14, 2, 4);

    // Họa tiết vân gỗ
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + 8, y + 8, 5, 1);
    ctx.fillRect(x + 19, y + 20, 5, 1);
  }

  // 40: Ghế gỗ ngồi học (Walkable) — nhìn từ trên, dùng cho sit zones
  // Thiết kế lại: silhouette mạnh + shadow + chi tiết để đọc rõ là "ghế"
  static drawSitChair(ctx, x, y, size) {
    // Sàn gỗ
    this.drawWoodFloor(ctx, x, y, size);

    // Bóng đổ (offset xuống-phải, mờ)
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + 10, y + 9, 17, 19);

    // 4 chân ghế (ô vuông tối ở 4 góc, ló ra ngoài mặt ghế)
    ctx.fillStyle = '#292524';
    ctx.fillRect(x + 6, y + 11, 3, 3);
    ctx.fillRect(x + 23, y + 11, 3, 3);
    ctx.fillRect(x + 6, y + 22, 3, 3);
    ctx.fillRect(x + 23, y + 22, 3, 3);

    // Mặt ghế: hình thang rộng dần về phía trước (phối cảnh)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 8, y + 12, 16, 10);   // thân ghế
    ctx.fillRect(x + 7, y + 20, 18, 3);    // mép trước rộng hơn
    // Highlight mép trước
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 7, y + 22, 18, 1);
    // Highlight mặt ghế (trên)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 9, y + 13, 14, 1);
    // Vân gỗ
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 10, y + 15, 12, 1);
    ctx.fillRect(x + 10, y + 17, 12, 1);
    ctx.fillRect(x + 10, y + 20, 12, 1);

    // Tựa lưng (phía bắc, hướng về bàn học): thanh ngang + 4 nan dọc
    // Nền tối giữa các nan
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 8, y + 5, 16, 7);
    // Thanh ngang trên
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 8, y + 5, 16, 3);
    ctx.fillStyle = '#b45309';  // highlight thanh ngang
    ctx.fillRect(x + 8, y + 5, 16, 1);
    // 4 nan dọc (mỗi nan 2px, cách nhau 2px)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 9, y + 8, 2, 4);
    ctx.fillRect(x + 13, y + 8, 2, 4);
    ctx.fillRect(x + 17, y + 8, 2, 4);
    ctx.fillRect(x + 21, y + 8, 2, 4);
    // Bóng nan (cạnh trái tối)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 9, y + 8, 1, 4);
    ctx.fillRect(x + 13, y + 8, 1, 4);
    ctx.fillRect(x + 17, y + 8, 1, 4);
    ctx.fillRect(x + 21, y + 8, 1, 4);
  }

  // 41: Nệm sofa ngồi thư giãn (Walkable) — dùng cho sit zones
  // Thiết kế lại: đệm dày + piping + nút bấm + tay vịn + gối rõ ràng
  static drawSitSofa(ctx, x, y, size) {
    // Sàn
    this.drawWoodFloor(ctx, x, y, size);

    // Bóng đổ
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + 6, y + 12, 24, 17);

    // Đế nệm xanh navy dày
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(x + 4, y + 10, 24, 16);
    // Piping (viền sáng quanh mép đệm)
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x + 4, y + 10, 24, 1);
    ctx.fillRect(x + 4, y + 25, 24, 1);
    ctx.fillRect(x + 4, y + 10, 1, 16);
    ctx.fillRect(x + 27, y + 10, 1, 16);

    // Tay vịn 2 bên (nhô cao)
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(x + 4, y + 10, 5, 16);
    ctx.fillRect(x + 23, y + 10, 5, 16);
    // Highlight tay vịn
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 5, y + 11, 1, 14);
    ctx.fillRect(x + 25, y + 11, 1, 14);

    // Mặt đệm ngồi
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 9, y + 13, 14, 10);
    // Bóng dưới đệm
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x + 9, y + 20, 14, 3);

    // Nút bấm đệm (4 nút lưới 2x2)
    ctx.fillStyle = '#172554';
    ctx.fillRect(x + 12, y + 15, 2, 2);
    ctx.fillRect(x + 18, y + 15, 2, 2);
    ctx.fillRect(x + 12, y + 19, 2, 2);
    ctx.fillRect(x + 18, y + 19, 2, 2);

    // Gối cam ở tựa lưng (rõ là gối: nếp gấp + highlight)
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 11, y + 5, 10, 6);
    // Nếp gấp gối
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(x + 11, y + 9, 10, 2);
    ctx.fillRect(x + 15, y + 5, 1, 6);
    // Highlight gối
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(x + 12, y + 6, 8, 1);
  }

  // 38: Bàn Họp Hội Nghị (Obstacle) — nhìn từ trên xuống, bàn gỗ dài + ghế
  static drawConferenceTable(ctx, x, y, size) {
    // Sàn gỗ
    this.drawWoodFloor(ctx, x, y, size);

    // Mặt bàn gỗ dài (ngang)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 4, y + 10, size - 8, 12);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 5, y + 11, size - 10, 10);
    // Vân gỗ + điểm nhấn giữa (khay tài liệu)
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 8, y + 14, size - 16, 1);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + size / 2 - 3, y + 13, 6, 6); // tập tài liệu trắng

    // Ghế 2 bên (4 ghế)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, y + 4, 6, 5);
    ctx.fillRect(x + size - 12, y + 4, 6, 5);
    ctx.fillRect(x + 6, y + 23, 6, 5);
    ctx.fillRect(x + size - 12, y + 23, 6, 5);
    // Tựa ghế
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 6, y + 2, 6, 2);
    ctx.fillRect(x + size - 12, y + 2, 6, 2);
    ctx.fillRect(x + 6, y + 28, 6, 2);
    ctx.fillRect(x + size - 12, y + 28, 6, 2);
  }

  // 39: Màn Chiếu Projector (Obstacle) — màn chiếu + chân đứng, có slide
  static drawProjectorScreen(ctx, x, y, size) {
    // Sàn
    this.drawWoodFloor(ctx, x, y, size);

    // Chân đứng 2 bên
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 5, y + 6, 2, size - 10);
    ctx.fillRect(x + size - 7, y + 6, 2, size - 10);

    // Màn chiếu trắng
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x + 7, y + 6, size - 14, 16);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 7, y + 6, size - 14, 16);

    // Slide đang chiếu: tiêu đề + biểu đồ cột pixel
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x + 10, y + 9, 10, 2); // dòng tiêu đề
    ctx.fillStyle = '#f26f21';
    ctx.fillRect(x + 10, y + 13, 3, 6);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 14, y + 15, 3, 4);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 18, y + 12, 3, 7);

    // Đèn projector phía dưới
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + size / 2 - 4, y + 26, 8, 4);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + size / 2 - 2, y + 27, 4, 2); // tia sáng
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

    // 1. Kiểm tra xem outfit/character được chọn có tương ứng với Spritesheet Aseprite/Gather.town HD đã preload không
    const outfitId = wardrobeConfig.characterId || wardrobeConfig.outfitId || 'hoodie_dever';
    const normalizedOutfitId = outfitId === 'barista_apron' ? 'apron_barista' : outfitId;
    const prebakedKey = normalizedOutfitId ? (normalizedOutfitId.startsWith('char_') ? normalizedOutfitId : `char_${normalizedOutfitId}`) : null;

    let srcImg = null;
    let isAseprite = false;
    if (prebakedKey && scene && scene.textures && scene.textures.exists(prebakedKey)) {
      try {
        const srcTex = scene.textures.get(prebakedKey);
        srcImg = srcTex.getSourceImage();
        if (srcImg && srcImg.width === 384) {
          isAseprite = true;
        }
      } catch (e) {}
    }

    const cols = isAseprite ? 8 : 4;
    const rows = isAseprite ? 7 : 4;

    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let usedPrebaked = false;
    if (srcImg) {
      try {
        ctx.drawImage(srcImg, 0, 0);
        usedPrebaked = true;

        // Vẽ vật phẩm cầm tay (in-hand equipment) lên trên bộ Chibi spritesheet đã preload
        if (config.inHandItem && config.inHandItem !== 'none') {
          if (isAseprite) {
            // Row 0: idle_down (0-3), idle_up (4-7)
            for (let c = 0; c < 4; c++) this.drawInHandEquipment(ctx, c * frameW, 0, 'down', c, config.inHandItem);
            for (let c = 4; c < 8; c++) this.drawInHandEquipment(ctx, c * frameW, 0, 'up', c - 4, config.inHandItem);
            // Row 1: idle_left (0-3), idle_right (4-7)
            for (let c = 0; c < 4; c++) this.drawInHandEquipment(ctx, c * frameW, frameH, 'left', c, config.inHandItem);
            for (let c = 4; c < 8; c++) this.drawInHandEquipment(ctx, c * frameW, frameH, 'right', c - 4, config.inHandItem);
            // Row 2: walk_down (0-7)
            for (let c = 0; c < 8; c++) this.drawInHandEquipment(ctx, c * frameW, 2 * frameH, 'down', c % 4, config.inHandItem);
            // Row 3: walk_left (0-7)
            for (let c = 0; c < 8; c++) this.drawInHandEquipment(ctx, c * frameW, 3 * frameH, 'left', c % 4, config.inHandItem);
            // Row 4: walk_right (0-7)
            for (let c = 0; c < 8; c++) this.drawInHandEquipment(ctx, c * frameW, 4 * frameH, 'right', c % 4, config.inHandItem);
            // Row 5: walk_up (0-7)
            for (let c = 0; c < 8; c++) this.drawInHandEquipment(ctx, c * frameW, 5 * frameH, 'up', c % 4, config.inHandItem);
            // Row 6: cheer (0-5)
            for (let c = 0; c < 6; c++) this.drawInHandEquipment(ctx, c * frameW, 6 * frameH, 'down', 0, config.inHandItem);
          } else {
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

    if (isAseprite) {
      const baseAtlasJson = scene.cache?.json?.get?.(prebakedKey);
      if (baseAtlasJson) {
        if (scene.cache?.json) {
          scene.cache.json.add(actualKey, baseAtlasJson);
        }
        scene.textures.addAtlas(actualKey, canvas, baseAtlasJson);
      } else {
        scene.textures.addSpriteSheet(actualKey, canvas, {
          frameWidth: frameW,
          frameHeight: frameH
        });
      }
    } else {
      scene.textures.addSpriteSheet(actualKey, canvas, {
        frameWidth: frameW,
        frameHeight: frameH
      });
    }

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

    // === BẢNG MÀU CHUNG (palette discipline: da + shadow) ===
    const SKIN = '#fbd1a2';   // Da tay
    const SKIN_D = '#e8a06f'; // Da vùng tối (dưới/phải)
    const SHADOW = 'rgba(2,6,23,0.22)'; // Bóng tiếp xúc mềm

    const R = (rx, ry, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); };
    const ellipse = (cx, cy, rx, ry, c) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(x + cx, y + cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    // Bàn tay mitten đơn giản có rãnh ngón
    const hand = (hx, hy, w = 3, h = 4) => {
      R(hx, hy, w, h, SKIN);
      R(hx, hy + h - 1, w, 1, SKIN_D); // tối dưới
      R(hx + 1, hy + 1, 1, h - 2, SKIN_D); // rãnh ngón
    };
    // Bóng mềm dưới vật phẩm cho cảm giác "cầm" thật
    const contactShadow = (cx, cy, rx, ry = 2) => ellipse(cx, cy, rx, ry, SHADOW);

    ctx.save();

    /* ============ MACBOOK DEV (laptop) — ôm 2 tay ============ */
    if (itemId === 'macbook_dev') {
      if (direction === 'down') {
        contactShadow(24, 50, 9);
        // Viền bezel
        R(18, 40, 12, 6, '#1e293b');
        // Màn hình phát sáng (sáng từ trên)
        R(19, 41, 10, 1, '#7dd3fc');
        R(19, 42, 10, 1, '#38bdf8');
        R(19, 43, 10, 1, '#0284c7');
        R(19, 44, 10, 1, '#0369a1');
        // Dòng code
        R(20, 42, 4, 1, '#e0f2fe');
        R(22, 44, 5, 1, '#bae6fd');
        // Đế nhôm
        R(17, 46, 14, 1, '#e2e8f0');
        R(17, 47, 14, 1, '#94a3b8');
        // 2 tay giữ cạnh máy
        hand(14, 43); hand(31, 43);
      } else if (direction === 'left' || direction === 'right') {
        const lx = direction === 'left' ? 12 : 31;
        contactShadow(lx + 3, 50, 5);
        // Nhìn nghiêng: nắp + mép màn hình
        R(lx, 40, 5, 9, '#94a3b8');
        R(lx, 40, 5, 1, '#e2e8f0'); // highlight trên
        R(lx + (direction === 'left' ? 0 : 4), 41, 1, 7, '#38bdf8'); // mép màn hình
        R(lx, 48, 5, 1, '#64748b'); // sel-out dưới
        R(lx + 1, 49, 4, 2, '#cbd5e1'); // đế
        hand(lx + 1, 43, 3, 4);
      } else {
        contactShadow(24, 49, 8);
        // Lưng nắp máy
        R(18, 40, 12, 7, '#cbd5e1');
        R(18, 40, 12, 1, '#f1f5f9'); // highlight
        R(18, 46, 12, 1, '#94a3b8'); // sel-out dưới
        R(18, 40, 1, 7, '#94a3b8'); R(29, 40, 1, 7, '#94a3b8'); // sel-out 2 bên
        R(23, 42, 2, 2, '#64748b'); // logo
      }
    }

    /* ============ KEYCHRON (bàn phím cơ) — ôm 2 tay ============ */
    else if (itemId === 'keychron_kb') {
      if (direction === 'down') {
        contactShadow(24, 50, 9);
        R(18, 43, 12, 4, '#1e293b'); // khung
        // 2 hàng phím (5 phím/hàng), sáng từ trên
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 5; c++) {
            const kx = 19 + c * 2, ky = 44 + r * 1;
            R(kx, ky, 2, 1, r === 0 ? '#c084fc' : '#a855f7');
          }
        }
        R(18, 46, 12, 1, '#4c1d95'); // sel-out dưới
        R(21, 45, 6, 1, '#7c3aed'); // spacebar
        hand(14, 43); hand(31, 43);
      } else if (direction === 'left' || direction === 'right') {
        const lx = direction === 'left' ? 13 : 30;
        contactShadow(lx + 2, 50, 5);
        R(lx, 43, 5, 4, '#1e293b');
        R(lx + 1, 44, 3, 1, '#c084fc');
        R(lx + 1, 45, 3, 1, '#a855f7');
        R(lx, 46, 5, 1, '#4c1d95');
        hand(lx + 1, 42, 3, 3);
      } else {
        contactShadow(24, 49, 8);
        R(18, 43, 12, 4, '#312e81');
        R(18, 43, 12, 1, '#4c1d95');
        R(18, 46, 12, 1, '#1e1b4b');
      }
    }

    /* ============ CHUỘT GAMING — tay phải ============ */
    else if (itemId === 'gaming_mouse') {
      const mx = direction === 'left' ? 11 : 32;
      const my = 41;
      if (direction !== 'up') {
        contactShadow(mx + 3, 50, 5);
        // Thân chuột bo (vẽ theo hàng)
        R(mx + 1, my, 4, 1, '#6ee7b7');     // highlight trên
        R(mx, my + 1, 6, 2, '#10b981');
        R(mx, my + 3, 6, 2, '#0d9488');
        R(mx, my + 5, 6, 1, '#047857');     // sel-out dưới
        R(mx + 5, my + 1, 1, 4, '#065f46'); // tối phải
        R(mx + 2, my + 1, 1, 2, '#065f46'); // con lăn
        R(mx + 2, my, 1, 1, '#047857');     // rãnh nút
        // Ngón tay phủ lên
        R(mx - 1, my - 2, 7, 2, SKIN);
        R(mx - 1, my - 1, 7, 1, SKIN_D);
        R(mx + 1, my - 2, 1, 2, SKIN_D); R(mx + 4, my - 2, 1, 2, SKIN_D);
      } else {
        R(mx + 1, my + 1, 4, 4, '#0d9488');
        R(mx + 1, my + 1, 4, 1, '#6ee7b7');
      }
    }

    /* ============ CÓC VÀNG BÔNG — ôm 2 tay ============ */
    else if (itemId === 'golden_frog_plush') {
      if (direction !== 'up') {
        const fx = direction === 'left' ? 13 : (direction === 'right' ? 25 : 19);
        const fy = 39;
        contactShadow(fx + 6, fy + 10, 7);
        // Thân cóc (bo tròn theo hàng, sel-out #a16207 dưới/phải)
        const rows = [[2, 8], [1, 10], [0, 12], [0, 12], [1, 10], [2, 8]];
        rows.forEach(([ox, w], i) => {
          const shade = i === 0 ? '#fde047' : (i >= 4 ? '#ca8a04' : '#eab308');
          R(fx + ox, fy + i, w, 1, shade);
        });
        R(fx + 11, fy + 1, 1, 4, '#a16207'); // sel-out phải
        // Bụng
        R(fx + 4, fy + 2, 4, 3, '#fef3c7');
        // Khăn đỏ may mắn
        R(fx + 1, fy + 3, 10, 1, '#dc2626');
        R(fx + 7, fy + 4, 3, 2, '#b91c1c'); // nút thắt
        // Mắt kawaii: trắng + con ngươi + sparkle
        R(fx + 2, fy - 1, 3, 2, '#ffffff'); R(fx + 7, fy - 1, 3, 2, '#ffffff');
        R(fx + 3, fy - 1, 1, 2, '#0f172a'); R(fx + 8, fy - 1, 1, 2, '#0f172a');
        R(fx + 2, fy - 1, 1, 1, '#ffffff'); R(fx + 7, fy - 1, 1, 1, '#ffffff');
        // Má hồng
        R(fx + 1, fy + 2, 1, 1, '#f9a8d4'); R(fx + 10, fy + 2, 1, 1, '#f9a8d4');
        // 2 tay ôm
        hand(fx - 2, fy + 4); hand(fx + 11, fy + 4);
      } else {
        R(20, 40, 10, 6, '#eab308');
        R(20, 40, 10, 1, '#fde047');
        R(20, 45, 10, 1, '#a16207');
      }
    }

    /* ============ MÓC KHÓA THẺ SV — tay phải ============ */
    else if (itemId === 'fptu_keychain') {
      const kx = direction === 'left' ? 12 : 32;
      if (direction !== 'up') {
        // Nắm tay
        R(kx, 40, 5, 4, SKIN);
        R(kx, 43, 5, 1, SKIN_D);
        R(kx + 2, 40, 1, 4, SKIN_D);
        // Dây đeo cam
        R(kx + 2, 44, 2, 5, '#f26f21');
        R(kx + 3, 44, 1, 5, '#c2410c');
        // Thẻ sinh viên
        R(kx - 1, 49, 8, 6, '#f8fafc');
        R(kx - 1, 49, 8, 2, '#f26f21'); // header cam FPT
        R(kx, 52, 2, 2, '#94a3b8');     // ảnh thẻ
        R(kx + 3, 52, 3, 1, '#cbd5e1'); // dòng chữ
        R(kx + 3, 54, 4, 1, '#e2e8f0');
        R(kx - 1, 54, 8, 1, '#7c2d12'); // sel-out dưới
        R(kx + 6, 49, 1, 6, '#7c2d12'); // sel-out phải
      } else {
        R(kx + 2, 44, 2, 5, '#f26f21');
        R(kx - 1, 49, 8, 5, '#f8fafc');
      }
    }

    /* ============ CÀ PHÊ (thermos / cà phê muối) — tay phải ============ */
    else if (itemId === 'danang_salt_coffee' || itemId === 'thermos_coffee') {
      const cx = direction === 'left' ? 12 : 32;
      const cy = 41;
      const isSalt = itemId === 'danang_salt_coffee';
      if (direction !== 'up') {
        contactShadow(cx + 3, cy + 10, 5);
        if (isSalt) {
          // Ly nhựa: highlight trái, tối phải
          R(cx + 1, cy, 5, 8, '#78350f');
          R(cx + 1, cy, 1, 8, '#a16207'); // sáng trái
          R(cx + 5, cy, 1, 8, '#451a03'); // tối phải (sel-out)
          // Lớp kem muối bồng bềnh
          R(cx, cy - 2, 7, 2, '#fff7ed');
          R(cx + 1, cy - 3, 5, 1, '#ffffff');
          // Ống hút xanh (bậc thang)
          R(cx + 4, cy - 6, 1, 4, '#0284c7');
          R(cx + 3, cy - 6, 1, 1, '#0369a1');
          // Logo giọt cà phê
          R(cx + 3, cy + 3, 1, 2, '#fcd34d');
        } else {
          // Thermos kim loại
          R(cx + 1, cy, 5, 8, '#f59e0b');
          R(cx + 1, cy, 1, 8, '#fcd34d'); // highlight trái
          R(cx + 5, cy, 1, 8, '#b45309'); // tối phải
          R(cx + 1, cy + 4, 5, 1, '#1e293b'); // đai
          R(cx, cy - 2, 7, 2, '#1e293b');   // nắp
          R(cx, cy - 2, 7, 1, '#475569');   // highlight nắp
        }
        // Hơi nóng
        R(cx + 2, cy - 6, 1, 2, 'rgba(255,255,255,0.55)');
        R(cx + 4, cy - 8, 1, 2, 'rgba(255,255,255,0.35)');
        // Ngón tay ôm ly
        R(cx + 5, cy + 2, 2, 4, SKIN);
        R(cx + 5, cy + 5, 2, 1, SKIN_D);
      } else {
        R(cx + 1, cy, 5, 7, isSalt ? '#78350f' : '#f59e0b');
        R(cx, cy - 2, 7, 2, isSalt ? '#fff7ed' : '#1e293b');
      }
    }

    /* ============ BÓNG ĐÁ / BÓNG RỔ — tay phải ============ */
    else if (itemId === 'football_ball' || itemId === 'basketball_ball') {
      const bx = direction === 'left' ? 11 : 31;
      const by = 42;
      const isBasket = itemId === 'basketball_ball';
      if (direction !== 'up') {
        contactShadow(bx + 4, by + 9, 6);
        // Hình tròn 8x8 theo hàng (sel-out tối dưới/phải)
        const rows = [[2, 4], [1, 6], [0, 8], [0, 8], [0, 8], [0, 8], [1, 6], [2, 4]];
        rows.forEach(([ox, w], i) => {
          let c = isBasket ? '#ea580c' : '#f8fafc';
          if (i === 0) c = isBasket ? '#fdba74' : '#ffffff'; // highlight trên
          if (i >= 6) c = isBasket ? '#9a3412' : '#94a3b8';  // sel-out dưới
          R(bx + ox, by + i, w, 1, c);
        });
        if (isBasket) {
          R(bx + 3, by + 1, 1, 6, '#7c2d12'); // rãnh dọc
          R(bx + 1, by + 4, 6, 1, '#7c2d12'); // rãnh ngang
        } else {
          R(bx + 3, by + 3, 2, 2, '#0f172a'); // ngũ giác giữa
          R(bx + 1, by + 1, 1, 1, '#0f172a'); R(bx + 6, by + 5, 1, 1, '#0f172a');
        }
        // Bàn tay đặt lên bóng
        R(bx + 1, by - 2, 6, 2, SKIN);
        R(bx + 1, by - 1, 6, 1, SKIN_D);
      } else {
        R(bx + 2, by + 1, 4, 5, isBasket ? '#ea580c' : '#f8fafc');
      }
    }

    /* ============ CỜ FU-DEVER ============ */
    else if (itemId === 'dever_flag') {
      const px = direction === 'left' ? 12 : 33;
      if (direction !== 'up') {
        // Cán cờ gỗ (highlight trái)
        R(px, 16, 2, 30, '#78350f');
        R(px, 16, 1, 30, '#a16207');
        // Lá cờ tung bay (mép dưới bậc thang tạo sóng)
        const fdx = direction === 'left' ? -12 : 2;
        R(px + fdx, 16, 12, 6, '#0066CC');
        R(px + fdx, 16, 12, 1, '#3385d6'); // highlight trên
        R(px + fdx, 20, 12, 2, '#f26f21');  // sọc cam FPTU
        R(px + fdx, 21, 12, 1, '#c2410c'); // sel-out dưới sọc
        // Ngôi sao trắng
        R(px + fdx + 5, 17, 1, 3, '#ffffff');
        R(px + fdx + 4, 18, 3, 1, '#ffffff');
        // Tay nắm cán
        R(px - 1, 42, 4, 4, SKIN);
        R(px - 1, 45, 4, 1, SKIN_D);
        contactShadow(px + 1, 50, 4);
      } else {
        R(px, 16, 2, 30, '#78350f');
        R(px - 8, 16, 8, 6, '#0066CC');
        R(px - 8, 20, 8, 2, '#f26f21');
      }
    }

    ctx.restore();
  }

  static createAnimationsFromAseprite(scene, avatarId, atlasJson) {
    if (!scene || !scene.anims || !atlasJson?.meta?.frameTags) return;
    const key = `char_${avatarId}`;
    const frameKeys = Object.keys(atlasJson.frames || {});

    atlasJson.meta.frameTags.forEach(tag => {
      const tagFrames = [];
      for (let idx = tag.from; idx <= tag.to; idx++) {
        if (frameKeys[idx]) {
          tagFrames.push({ key, frame: frameKeys[idx] });
        }
      }

      if (tagFrames.length === 0) return;

      const animKey = `${tag.name}_${avatarId}`;
      if (scene.anims.exists(animKey)) scene.anims.remove(animKey);

      let frameRate = 10;
      if (tag.name.startsWith('walk')) frameRate = 12; // 8-frame Walk Cycle mượt mà
      else if (tag.name.startsWith('idle')) frameRate = 2; // Nhịp thở thư thái
      else if (tag.name === 'cheer') frameRate = 8; // Ăn mừng

      scene.anims.create({
        key: animKey,
        frames: tagFrames,
        frameRate,
        repeat: -1
      });

      // Đăng ký tương thích cho Player.js
      if (tag.name.startsWith('idle_')) {
        const dir = tag.name.replace('idle_', '');
        const breatheKey = `idle_breathe_${dir}_${avatarId}`;
        if (scene.anims.exists(breatheKey)) scene.anims.remove(breatheKey);
        scene.anims.create({
          key: breatheKey,
          frames: tagFrames,
          frameRate: 2,
          repeat: -1
        });
      }
    });
  }

  static createCharacterAnimations(scene, avatarId) {
    if (!scene || !scene.anims) return;
    const key = `char_${avatarId}`;

    // Kiểm tra xem texture có nạp từ file Aseprite JSON Atlas không
    const atlasJson = scene.cache?.json?.get?.(key);
    if (atlasJson && atlasJson.meta && atlasJson.meta.frameTags) {
      this.createAnimationsFromAseprite(scene, avatarId, atlasJson);
      return;
    }

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
        frameRate: 9,
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

  /**
   * Sinh overlay cánh tay cho emote body-animation (vẫy tay, power pose, dance).
   * Palette: da #fbd1a2/#e8a06f, tay áo khoác DEVER #1d4ed8/#3b82f6, sáng từ trên-trái.
   * Origin xoay quanh vai: (0.5, 0.875).
   */
  static generateEmoteOverlays(scene) {
    const SKIN = '#fbd1a2', SKIN_D = '#e8a06f', SKIN_L = '#ffe3c2';
    const SLEEVE = '#1d4ed8', SLEEVE_L = '#3b82f6', SLEEVE_D = '#1e3a8a';

    const makeTex = (key, w, h, drawFn) => {
      if (scene.textures.exists(key)) scene.textures.remove(key);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      drawFn(ctx);
      scene.textures.addCanvas(key, canvas);
    };

    // Vẽ 1 cánh tay giơ lên trong khung w×h, gốc vai tại (ox, oy)
    const drawArm = (ctx, ox, oy) => {
      // Bàn tay mở (8×8)
      ctx.fillStyle = SKIN;
      ctx.fillRect(ox - 4, oy - 23, 8, 8);
      ctx.fillStyle = SKIN_L; // highlight trên
      ctx.fillRect(ox - 4, oy - 23, 8, 1);
      // Rãnh ngón tay
      ctx.fillStyle = SKIN_D;
      for (let fx = ox - 2; fx <= ox + 3; fx += 2) ctx.fillRect(fx, oy - 22, 1, 4);
      // Cổ tay
      ctx.fillStyle = SKIN;
      ctx.fillRect(ox - 2, oy - 15, 4, 3);
      ctx.fillStyle = SKIN_D;
      ctx.fillRect(ox - 2, oy - 13, 4, 1);
      // Tay áo khoác DEVER (10×12)
      ctx.fillStyle = SLEEVE;
      ctx.fillRect(ox - 5, oy - 12, 10, 12);
      ctx.fillStyle = SLEEVE_L; // sáng trái
      ctx.fillRect(ox - 5, oy - 12, 2, 12);
      ctx.fillStyle = SLEEVE_D; // tối phải (sel-out)
      ctx.fillRect(ox + 3, oy - 12, 2, 12);
      ctx.fillRect(ox - 5, oy - 1, 10, 1);
    };

    // 1 tay vẫy: 16×24, vai tại (8, 21)
    makeTex('emote_arm_wave', 16, 24, (ctx) => drawArm(ctx, 8, 21));

    // 2 tay chữ V (power pose): 32×24, giữa 2 vai tại (16, 21)
    makeTex('emote_arms_power', 32, 24, (ctx) => {
      drawArm(ctx, 8, 21);
      drawArm(ctx, 24, 21);
    });
  }

  /**
   * Ve hang loat icon 16x16 tu drawers -> texture '<prefix>_<id>'.
   */
  static _paintIcons(scene, prefix, drawers) {
    const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    for (const [id, draw] of Object.entries(drawers)) {
      const key = `${prefix}_${id}`;
      if (scene.textures.exists(key)) scene.textures.remove(key);
      const canvas = document.createElement('canvas');
      canvas.width = 16; canvas.height = 16;
      draw(canvas.getContext('2d'), R);
      scene.textures.addCanvas(key, canvas);
    }
  }

  static _iconURLCache = new Map();
  /**
   * Lay dataURL cua icon '<prefix>_<id>' cho DOM <img>. Null neu chua sinh.
   */
  static _getIconURL(scene, prefix, id) {
    if (!scene || !id) return null;
    const cacheKey = `${prefix}_${id}`;
    const cached = TextureGenerator._iconURLCache.get(cacheKey);
    if (cached) return cached;
    if (!scene.textures.exists(cacheKey)) return null;
    try {
      const url = scene.textures.get(cacheKey).getSourceImage().toDataURL();
      TextureGenerator._iconURLCache.set(cacheKey, url);
      return url;
    } catch (e) { return null; }
  }

  /**
   * Sinh pixel icons 16x16 cho items (dung trong InventoryModal thay emoji tho).
   * Key: 'itemicon_<itemId>'. Palette nhat quan voi in-hand equipment.
   */
  static generateItemIcons(scene) {
    const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    const drawers = {
      // Laptop mo: man hinh phat sang + dong code
      macbook_dev(ctx) {
        R(ctx, 3, 2, 10, 8, '#1e293b');
        R(ctx, 4, 3, 8, 2, '#7dd3fc');
        R(ctx, 4, 5, 8, 2, '#38bdf8');
        R(ctx, 4, 7, 8, 2, '#0284c7');
        R(ctx, 5, 4, 3, 1, '#e0f2fe');
        R(ctx, 6, 6, 4, 1, '#bae6fd');
        R(ctx, 2, 10, 12, 1, '#e2e8f0');
        R(ctx, 2, 11, 12, 1, '#94a3b8');
      },
      // Ban phim co tim
      keychron_kb(ctx) {
        R(ctx, 2, 5, 12, 6, '#1e293b');
        for (let r = 0; r < 2; r++)
          for (let c = 0; c < 4; c++)
            R(ctx, 2 + c * 3, 6 + r * 2, 2, 2, r === 0 ? '#c084fc' : '#a855f7');
        R(ctx, 5, 10, 6, 1, '#7c3aed');
        R(ctx, 2, 11, 12, 1, '#4c1d95');
      },
      // Chuot gaming xanh
      gaming_mouse(ctx) {
        R(ctx, 5, 2, 6, 1, '#6ee7b7');
        R(ctx, 4, 3, 8, 4, '#10b981');
        R(ctx, 4, 7, 8, 4, '#0d9488');
        R(ctx, 4, 11, 8, 1, '#047857');
        R(ctx, 11, 3, 1, 8, '#065f46');
        R(ctx, 7, 3, 2, 3, '#065f46');
        R(ctx, 7, 2, 1, 1, '#047857');
      },
      // Coc vang kawaii
      golden_frog_plush(ctx) {
        R(ctx, 3, 4, 10, 8, '#eab308');
        R(ctx, 3, 4, 10, 1, '#fde047');
        R(ctx, 3, 11, 10, 1, '#a16207');
        R(ctx, 3, 4, 1, 8, '#ca8a04');
        R(ctx, 12, 4, 1, 8, '#a16207');
        R(ctx, 4, 2, 3, 3, '#ffffff');
        R(ctx, 9, 2, 3, 3, '#ffffff');
        R(ctx, 5, 3, 1, 2, '#0f172a');
        R(ctx, 10, 3, 1, 2, '#0f172a');
        R(ctx, 3, 9, 10, 2, '#dc2626');
        R(ctx, 3, 7, 1, 1, '#f9a8d4');
        R(ctx, 12, 7, 1, 1, '#f9a8d4');
      },
      // Moc khoa the SV
      fptu_keychain(ctx) {
        R(ctx, 7, 1, 2, 5, '#f26f21');
        R(ctx, 8, 1, 1, 5, '#c2410c');
        R(ctx, 4, 6, 8, 9, '#f8fafc');
        R(ctx, 4, 6, 8, 3, '#f26f21');
        R(ctx, 5, 10, 3, 3, '#94a3b8');
        R(ctx, 9, 10, 2, 1, '#cbd5e1');
        R(ctx, 9, 12, 2, 1, '#e2e8f0');
        R(ctx, 4, 14, 8, 1, '#7c2d12');
        R(ctx, 11, 6, 1, 9, '#7c2d12');
      },
      // Thermos cam
      thermos_coffee(ctx) {
        R(ctx, 4, 1, 8, 3, '#1e293b');
        R(ctx, 4, 1, 8, 1, '#475569');
        R(ctx, 5, 4, 1, 10, '#fcd34d');
        R(ctx, 6, 4, 4, 10, '#f59e0b');
        R(ctx, 10, 4, 1, 10, '#b45309');
        R(ctx, 5, 8, 6, 2, '#1e293b');
        R(ctx, 5, 13, 6, 1, '#b45309');
      },
      // Ca phe muoi Da Nang
      danang_salt_coffee(ctx) {
        R(ctx, 10, 1, 2, 4, '#0284c7');
        R(ctx, 10, 1, 1, 4, '#0369a1');
        R(ctx, 3, 4, 10, 3, '#fff7ed');
        R(ctx, 4, 3, 8, 1, '#ffffff');
        R(ctx, 4, 7, 1, 7, '#a16207');
        R(ctx, 5, 7, 6, 7, '#78350f');
        R(ctx, 11, 7, 1, 7, '#451a03');
        R(ctx, 6, 9, 2, 2, '#fcd34d');
      },
      // Banh mi cha canteen
      fuda_banh_mi(ctx) {
        R(ctx, 3, 6, 10, 4, '#fbbf24');
        R(ctx, 3, 6, 10, 1, '#fde68a');
        R(ctx, 3, 9, 10, 1, '#b45309');
        R(ctx, 2, 7, 1, 2, '#f59e0b');
        R(ctx, 13, 7, 1, 2, '#b45309');
        R(ctx, 5, 7, 2, 1, '#16a34a');
        R(ctx, 8, 7, 2, 1, '#dc2626');
        R(ctx, 11, 7, 1, 1, '#f8fafc');
      },
      // Cup vo dich hackathon
      hackathon_trophy(ctx) {
        R(ctx, 5, 2, 6, 1, '#fde047');
        R(ctx, 6, 3, 4, 4, '#eab308');
        R(ctx, 6, 3, 1, 4, '#fde047');
        R(ctx, 9, 3, 1, 4, '#a16207');
        R(ctx, 4, 3, 2, 1, '#eab308');
        R(ctx, 10, 3, 2, 1, '#eab308');
        R(ctx, 4, 4, 1, 2, '#ca8a04');
        R(ctx, 11, 4, 1, 2, '#ca8a04');
        R(ctx, 7, 7, 2, 3, '#a16207');
        R(ctx, 5, 10, 6, 1, '#ca8a04');
        R(ctx, 4, 11, 8, 2, '#eab308');
      },
      // Bong da
      football_ball(ctx) {
        R(ctx, 4, 3, 8, 10, '#f8fafc');
        R(ctx, 6, 2, 4, 1, '#e2e8f0');
        R(ctx, 6, 13, 4, 1, '#cbd5e1');
        R(ctx, 3, 4, 1, 8, '#e2e8f0');
        R(ctx, 12, 4, 1, 8, '#cbd5e1');
        R(ctx, 7, 6, 2, 2, '#1e293b');
        R(ctx, 5, 9, 1, 1, '#1e293b');
        R(ctx, 10, 9, 1, 1, '#1e293b');
        R(ctx, 7, 11, 2, 1, '#1e293b');
      },
      // Bong ro
      basketball_ball(ctx) {
        R(ctx, 4, 3, 8, 10, '#f97316');
        R(ctx, 6, 2, 4, 1, '#fdba74');
        R(ctx, 6, 13, 4, 1, '#c2410c');
        R(ctx, 3, 4, 1, 8, '#fdba74');
        R(ctx, 12, 4, 1, 8, '#c2410c');
        R(ctx, 7, 3, 1, 10, '#7c2d12');
        R(ctx, 4, 7, 8, 1, '#7c2d12');
        R(ctx, 5, 4, 3, 2, '#7c2d12');
        R(ctx, 8, 10, 3, 2, '#7c2d12');
      },
      // Co hieu CLB
      dever_flag(ctx) {
        R(ctx, 3, 2, 1, 12, '#94a3b8');
        R(ctx, 4, 3, 8, 5, '#1e40af');
        R(ctx, 4, 3, 8, 1, '#3b82f6');
        R(ctx, 4, 7, 8, 1, '#f26f21');
        R(ctx, 6, 4, 2, 2, '#fbbf24');
      }
    };

    TextureGenerator._paintIcons(scene, 'itemicon', drawers);
  }

  /**
   * Lay dataURL cua item icon cho DOM <img>. Tra ve null neu texture chua sinh.
   */
  static getItemIconURL(scene, itemId) {
    return TextureGenerator._getIconURL(scene, 'itemicon', itemId);
  }

  /**
   * Lay dataURL cua badge icon cho DOM <img>. Tra ve null neu texture chua sinh.
   */
  static getBadgeIconURL(scene, achievementId) {
    return TextureGenerator._getIconURL(scene, 'badge', achievementId);
  }

  /**
   * Sinh pixel badge icons 16x16 cho achievements (dung trong banner/toast thay emoji).
   * Key: 'badge_<achievementId>'.
   */
  static generateBadgeIcons(scene) {
    const drawers = {
      // Sao vang: buoc chan dau tien
      first_arrival(ctx, R) {
        R(ctx, 7, 1, 2, 2, '#fef08a');
        R(ctx, 5, 3, 6, 2, '#facc15');
        R(ctx, 3, 5, 10, 2, '#facc15');
        R(ctx, 6, 7, 4, 2, '#eab308');
        R(ctx, 5, 9, 2, 2, '#eab308');
        R(ctx, 9, 9, 2, 2, '#eab308');
        R(ctx, 5, 11, 2, 1, '#a16207');
        R(ctx, 9, 11, 2, 1, '#a16207');
      },
      // Tia set: toc do code
      speed_coder(ctx, R) {
        R(ctx, 9, 1, 3, 4, '#fde047');
        R(ctx, 7, 4, 5, 3, '#facc15');
        R(ctx, 8, 7, 4, 3, '#facc15');
        R(ctx, 6, 10, 3, 4, '#eab308');
        R(ctx, 9, 1, 1, 4, '#fef9c3');
        R(ctx, 7, 4, 1, 3, '#fef9c3');
      },
      // Ly ca phe muoi
      coffee_salt(ctx, R) {
        R(ctx, 4, 4, 8, 3, '#fff7ed');
        R(ctx, 5, 3, 6, 1, '#ffffff');
        R(ctx, 5, 7, 1, 6, '#a16207');
        R(ctx, 6, 7, 4, 6, '#78350f');
        R(ctx, 10, 7, 1, 6, '#451a03');
        R(ctx, 7, 8, 2, 2, '#fcd34d');
      },
      // Coc vang may man
      golden_frog(ctx, R) {
        R(ctx, 3, 5, 10, 7, '#eab308');
        R(ctx, 3, 5, 10, 1, '#fde047');
        R(ctx, 3, 11, 10, 1, '#a16207');
        R(ctx, 4, 3, 3, 3, '#ffffff');
        R(ctx, 9, 3, 3, 3, '#ffffff');
        R(ctx, 5, 4, 1, 2, '#0f172a');
        R(ctx, 10, 4, 1, 2, '#0f172a');
        R(ctx, 3, 9, 10, 2, '#dc2626');
      },
      // Bong da: vua pha luoi
      striker(ctx, R) {
        R(ctx, 4, 3, 8, 10, '#f8fafc');
        R(ctx, 6, 2, 4, 1, '#e2e8f0');
        R(ctx, 6, 13, 4, 1, '#cbd5e1');
        R(ctx, 3, 4, 1, 8, '#e2e8f0');
        R(ctx, 12, 4, 1, 8, '#cbd5e1');
        R(ctx, 7, 7, 2, 2, '#1e293b');
        R(ctx, 7, 4, 2, 1, '#1e293b');
        R(ctx, 7, 11, 2, 1, '#1e293b');
        R(ctx, 4, 7, 1, 2, '#1e293b');
        R(ctx, 11, 7, 1, 2, '#1e293b');
      },
      // Ba lo cong nghe
      tech_pro(ctx, R) {
        R(ctx, 4, 2, 2, 5, '#7c2d12');
        R(ctx, 10, 2, 2, 5, '#7c2d12');
        R(ctx, 5, 4, 6, 8, '#f26f21');
        R(ctx, 5, 4, 6, 1, '#fdba74');
        R(ctx, 5, 11, 6, 1, '#7c2d12');
        R(ctx, 6, 7, 4, 3, '#c2410c');
        R(ctx, 6, 7, 4, 1, '#fdba74');
      },
      // Not nhac: vu cong san khau
      stage_dancer(ctx, R) {
        R(ctx, 3, 10, 4, 3, '#e2e8f0');
        R(ctx, 3, 10, 4, 1, '#f8fafc');
        R(ctx, 10, 2, 2, 9, '#e2e8f0');
        R(ctx, 10, 2, 5, 2, '#f8fafc');
        R(ctx, 10, 4, 5, 1, '#cbd5e1');
        R(ctx, 12, 5, 2, 2, '#cbd5e1');
      },
      // Giang duong: hoc gia campus
      campus_scholar(ctx, R) {
        R(ctx, 3, 4, 10, 2, '#475569');
        R(ctx, 2, 6, 12, 1, '#64748b');
        R(ctx, 4, 7, 8, 6, '#94a3b8');
        R(ctx, 5, 8, 1, 3, '#475569');
        R(ctx, 7, 8, 2, 5, '#1e293b');
        R(ctx, 10, 8, 1, 3, '#475569');
        R(ctx, 4, 13, 8, 1, '#475569');
      },
      // Ngon lua: chuoi bestie
      bestie_streak_3(ctx, R) {
        R(ctx, 7, 2, 2, 4, '#f97316');
        R(ctx, 5, 6, 6, 7, '#f97316');
        R(ctx, 5, 6, 2, 7, '#fdba74');
        R(ctx, 9, 6, 2, 7, '#c2410c');
        R(ctx, 6, 8, 4, 4, '#fbbf24');
        R(ctx, 7, 10, 2, 2, '#fef3c7');
      },
      // Hai nguoi ban metaverse
      metaverse_friends_3(ctx, R) {
        R(ctx, 3, 2, 4, 4, '#fcd34d');
        R(ctx, 9, 2, 4, 4, '#fca5a5');
        R(ctx, 2, 7, 6, 6, '#38bdf8');
        R(ctx, 8, 7, 6, 6, '#f472b6');
        R(ctx, 2, 7, 6, 1, '#7dd3fc');
        R(ctx, 8, 7, 6, 1, '#f9a8d4');
        R(ctx, 2, 12, 6, 1, '#0369a1');
        R(ctx, 8, 12, 6, 1, '#be185d');
      }
    };
    TextureGenerator._paintIcons(scene, 'badge', drawers);
  }
}
