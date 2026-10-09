/**
 * PondArt: Pixel-art procedural cho hồ vườn FUDA (sân Tòa Alpha) — tách khỏi
 * TextureGenerator.js để giữ file tileset dưới 100KB (giới hạn API push).
 * Gồm: tile nước hồ (42), sprite vịt trời 2 frame, tượng "Nhà Tư Tưởng".
 */
export class PondArt {
  // 42: Hồ vườn FUDA — mặt nước tự nhiên xanh rêu (khác hồ bơi tile 28 xanh clo).
  // Tile lặp lại: họa tiết đối xứng nhẹ, không vẽ viền mép (nối liền như hồ bơi).
  static drawPondWater(ctx, x, y, size) {
    // Nước sâu xanh ngọc lục bảo
    ctx.fillStyle = '#0d7a6f';
    ctx.fillRect(x, y, size, size);
    // Lớp mặt nước sáng
    ctx.fillStyle = '#149b8c';
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    // Bóng sâu dưới đáy
    ctx.fillStyle = 'rgba(6, 78, 70, 0.55)';
    ctx.fillRect(x, y + size - 6, size, 6);
    ctx.fillRect(x + size - 5, y, 5, size);

    // Gợn sóng trắng mờ
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(x + 4, y + 7, 7, 1);
    ctx.fillRect(x + 20, y + 20, 6, 1);
    ctx.fillRect(x + 22, y + 9, 4, 1);

    // Lá sen
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(x + 18, y + 16, 9, 5);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 19, y + 17, 6, 2);
    ctx.fillStyle = '#0d7a6f'; // khía lá
    ctx.fillRect(x + 24, y + 16, 2, 3);
    // Nụ sen hồng
    ctx.fillStyle = '#f9a8d4';
    ctx.fillRect(x + 21, y + 13, 3, 3);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(x + 22, y + 14, 1, 2);

    // Điểm sáng phản quang
    ctx.fillStyle = '#99f6e4';
    ctx.fillRect(x + 6, y + 5, 2, 2);
    ctx.fillRect(x + 26, y + 24, 2, 2);
  }

  /**
   * Sinh spritesheet VỊT TRẮNG 2 frame (32x24/frame): frame 0 cánh hạ, frame 1 cánh nâng.
   * Vịt nhìn sang phải; lật ngang (flipX) khi bơi sang trái. Key texture: 'duck'.
   * Palette: trắng #f8fafc, bóng #dbe3ec/#b9c6d6, mỏ cam #fb9231.
   */
  static generateDuckSprite(scene) {
    if (scene.textures.exists('duck')) return;
    const W = 32, H = 24;
    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const drawFrame = (ox, wingUp) => {
      const R = (rx, ry, rw, rh, c) => { ctx.fillStyle = c; ctx.fillRect(ox + rx, ry, rw, rh); };
      // Đuôi (trái)
      R(1, 11, 4, 3, '#f8fafc');
      R(1, 11, 1, 3, '#dbe3ec');
      R(1, 13, 4, 1, '#dbe3ec');
      // Thân trắng
      R(5, 10, 15, 8, '#f8fafc');
      R(6, 10, 13, 2, '#ffffff');   // highlight lưng
      R(5, 16, 15, 2, '#dbe3ec');   // bóng bụng
      R(5, 10, 1, 8, '#dbe3ec');    // bóng đuôi
      // Đầu
      R(18, 4, 9, 9, '#f8fafc');
      R(19, 4, 7, 2, '#ffffff');
      R(18, 11, 9, 2, '#dbe3ec');
      R(25, 5, 2, 8, '#dbe3ec');    // bóng sau gáy
      R(18, 8, 2, 3, '#ffffff');    // má phồng
      // Mỏ cam
      R(27, 7, 4, 3, '#fb9231');
      R(27, 7, 4, 1, '#fdba74');
      R(27, 9, 4, 1, '#ea7c28');
      // Mắt
      R(23, 6, 2, 2, '#1e293b');
      R(23, 6, 1, 1, '#ffffff');
      // Cánh — 2 frame đập
      if (wingUp) {
        R(8, 6, 7, 4, '#eef2f7');
        R(8, 6, 7, 1, '#ffffff');
        R(8, 9, 7, 1, '#b9c6d6');
      } else {
        R(8, 12, 7, 4, '#e8edf3');
        R(8, 12, 7, 1, '#ffffff');
        R(8, 15, 7, 1, '#b9c6d6');
      }
      // Vệt nước dưới bụng
      R(4, 19, 22, 1, wingUp ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)');
      R(7, 20, 14, 1, 'rgba(219,227,236,0.5)');
    };

    drawFrame(0, false);
    drawFrame(W, true);

    scene.textures.addSpriteSheet('duck', canvas, { frameWidth: W, frameHeight: H });
  }

  /**
   * Sinh texture tượng "Nhà Tư Tưởng" (phong cách The Thinker) trên bệ đá cao.
   * v5 (2026-10-09): Hung yêu cầu dáng "người đàn ông CHỐNG CẰM" phải đọc rõ
   * ngay từ cái nhìn đầu tiên. Dựng lại hoàn toàn: khối lưng gù MỘT khối lớn
   * bên phải, đầu là khối cầu RIÊNG cúi về trước-trái (tách khỏi vai bằng nền),
   * chuỗi dọc đầu → cằm → NẮM TAY (sáng nhất) → cẳng tay trụ → khuỷu → gối
   * nhô cao tạo thành tam giác "suy tư". v5.2: đầu = khối cầu bậc thang NHỎ đưa
   * hẳn về trước-trái, tách khỏi ụ vai bằng khe nền 10px; tam giác nền giữa
   * cẳng tay và ngực. Bệ đá cao + biển đồng giữ nguyên theo ảnh tham chiếu.
   * Canvas 56x120, mặt hướng trái.
   * Key texture: 'thinker_statue'.
   */
  static generateThinkerStatue(scene) {
    if (scene.textures.exists('thinker_statue')) return;
    const W = 56, H = 120;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    // Bảng màu — đồng đen (ảnh tham chiếu gần như đen), mid nâng sáng để tách khối:
    const BD = '#1d150e', BM = '#33261a', BL = '#54402c', BH = '#8a6c42';
    // Đá xám bệ cao:
    const SD = '#5b6675', SM = '#8b95a5', SL = '#c3ccd8';
    // Biển đồng trên bệ:
    const PD = '#6b5320', PM = '#a8843c', PH = '#d4a94e';
    // Tảng đá ngồi:
    const RD = '#3a352f', RM = '#575046';
    const MOSS = '#4d7c0f';
    const GAP = '#0b0805';          // khe tối tách chi tiết

    const M = (x, y, w, h) => R(x, y, w, h, BM);  // khối thịt chính

    // ===== BỆ ĐÁ CAO (y 82–120) — cột chữ nhật trơn, cao như ảnh mẫu =====
    // Nắp bệ
    R(5, 82, 46, 4, SM);
    R(5, 82, 46, 1, SL);            // mặt trên sáng
    R(5, 85, 46, 1, SD);            // gờ dưới nắp
    // Thân trụ trơn
    R(9, 86, 38, 26, SM);
    R(9, 86, 2, 26, SL);            // cạnh trái sáng (sáng từ trái-trên)
    R(45, 86, 2, 26, SD);           // cạnh phải tối
    R(9, 86, 38, 1, SL);
    // Vân đá mờ
    R(14, 92, 6, 1, SD); R(30, 98, 8, 1, SD); R(18, 104, 5, 1, SD);
    R(34, 94, 4, 1, SL); R(16, 100, 7, 1, SL);
    // Biển đồng nhỏ giữa mặt trước thân trụ (như ảnh tham chiếu)
    R(23, 94, 10, 10, PD);
    R(24, 95, 8, 8, PM);
    R(24, 95, 8, 1, PH);            // viền sáng trên biển
    R(25, 96, 1, 1, PD); R(31, 96, 1, 1, PD); // đinh tán
    R(25, 99, 6, 1, PD); R(25, 101, 6, 1, PD); // dòng chữ khắc (gợi)
    // Đế bệ
    R(3, 112, 50, 8, SM);
    R(3, 112, 50, 2, SL);
    R(3, 118, 50, 2, SD);
    R(45, 114, 6, 4, 'rgba(0,0,0,0.15)');
    // Rêu phong chân bệ
    R(3, 118, 8, 2, MOSS); R(45, 118, 8, 2, MOSS); R(10, 112, 3, 2, MOSS);

    // ===== TẢNG ĐÁ NGỒI (y 74–82) — lộ rõ giữa tượng và nắp bệ =====
    R(4, 74, 48, 8, RD);
    R(4, 74, 48, 2, RM);            // mặt trên tảng đá bắt sáng
    R(8, 76, 8, 2, RM); R(36, 77, 8, 2, RM); // gờ đá
    R(4, 80, 48, 2, '#211d19');     // chân tảng tối

    // ===== NHÂN VẬT ĐỒNG ĐEN — "NGƯỜI ĐÀN ÔNG CHỐNG CẰM", mặt hướng trái =====
    // v5.2: đầu = khối cầu bậc thang NHỎ đưa hẳn về trước-trái, tách khỏi vai
    // bằng khe nền 10px; chuỗi dọc đầu → cằm → NẮM TAY (sáng nhất) → cẳng tay
    // trụ → khuỷu → gối nhô cao; tam giác nền giữa cẳng tay và ngực.

    // --- Khối lưng gù (một khối lớn, bên phải) ---
    M(28, 10, 14, 12);             // ụ vai
    M(32, 20, 12, 14);             // lưng trên
    M(32, 32, 12, 12);             // lưng dưới
    M(30, 40, 14, 12);             // mông
    M(28, 50, 14, 8);              // hông
    // --- Thân trước (giữ phải x25 để chừa tam giác nền với cẳng tay) ---
    M(27, 28, 8, 18);
    M(25, 32, 8, 12);

    // --- ĐẦU: khối cầu bậc thang, đưa về trước-trái, tách khỏi vai ---
    R(9, 14, 7, 2, BM);            // đỉnh sọ
    R(7, 16, 11, 8, BM);           // khối sọ
    R(8, 24, 9, 3, BM);            // hàm dưới
    R(5, 25, 8, 4, BM);            // cằm nhô về trước-xuống
    // Cầu gáy thấp nối đầu với thân
    M(14, 27, 7, 5);

    // --- CÁNH TAY (anh hùng): nắm tay → cẳng tay → khuỷu ---
    M(5, 31, 10, 9);               // NẮM TAY đỡ cằm — khối sáng nhất
    M(8, 40, 7, 14);               // cẳng tay: trụ dọc
    M(11, 52, 9, 7);               // khuỷu tay đè lên gối

    // --- Chân: gối nhô cao dưới khuỷu, đùi về hông ---
    M(9, 58, 11, 10);              // chỏm gối nhô cao
    M(18, 60, 15, 8);              // đùi
    M(11, 68, 7, 7);               // bắp chân
    M(7, 73, 14, 3);               // bàn chân đặt tảng đá
    // Tay trái buông dọc thân
    M(29, 34, 6, 12);
    M(27, 46, 8, 6);
    // Chân trái (xa) thu sau
    M(33, 60, 11, 7);
    M(39, 67, 6, 7);
    M(37, 73, 10, 3);

    // --- Bóng sâu (BD): gầm khối + nếp gấp ---
    R(30, 60, 14, 2, BD);          // gầm mông
    R(9, 66, 11, 2, BD);           // bóng dưới gối
    R(32, 42, 12, 2, BD);          // nếp lưng
    R(5, 28, 8, 1, BD);            // bóng dưới quai hàm

    // --- Khe tối tách chi tiết (GAP) ---
    R(5, 29, 10, 2, GAP);          // khe CẰM / NẮM TAY — "cằm tựa lên nắm tay"
    R(11, 57, 9, 1, GAP);          // khe khuỷu / gối — khuỷu ĐÈ LÊN gối

    // --- Điểm sáng đồng (sáng từ trái-trên) ---
    // NẮM TAY — ĐIỂM SÁNG NHẤT toàn tượng
    R(5, 31, 10, 4, BH);
    R(5, 35, 10, 2, BL);
    R(6, 37, 2, 2, BD); R(10, 37, 2, 2, BD); // kẽ ngón tay
    // Đầu: vòm sáng — đọc rõ khối cầu
    R(9, 14, 7, 1, BL);
    R(7, 16, 11, 1, BL);
    R(7, 16, 2, 8, BL);
    R(5, 25, 8, 1, BL);            // quai hàm
    // Cẳng tay: mép sáng dọc — trụ tay nổi bật
    R(8, 40, 2, 14, BL);
    R(8, 40, 1, 14, BH);
    // Chỏm gối + khuỷu
    R(9, 58, 11, 2, BL);
    R(9, 58, 9, 1, BH);
    R(11, 52, 9, 1, BL);
    // Đùi + vai
    R(18, 60, 15, 1, BL);
    R(28, 10, 14, 1, BL);
    // Rim-light dọc sống lưng — tách khối lưng khỏi nền tối
    R(42, 20, 2, 14, BL);
    R(42, 34, 2, 12, BL);
    R(40, 12, 2, 8, BL);
    R(44, 22, 1, 12, BH);
    R(44, 36, 1, 10, BH);

    scene.textures.addCanvas('thinker_statue', canvas);
  }

  /**
   * Sinh texture VƯỜN HOA sân Tòa Alpha: hoa giấy (bougainvillea) + hoa hồng.
   * Mỗi texture 32x32, decor tĩnh solid đặt trên cỏ. Key: 'flower_bougainvillea',
   * 'flower_rose'. Palette: lá xanh game + cụm hoa giấy hồng/magenta giấy,
   * hoa hồng đỏ/hồng với nhụy tối.
   */
  static generateFlowerGarden(scene) {
    const R2 = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    // ---- HOA GIẤY (bougainvillea): bụi rậm, cụm hoa giấy hồng/magenta ----
    if (!scene.textures.exists('flower_bougainvillea')) {
      const c = document.createElement('canvas');
      c.width = 32; c.height = 32;
      const ctx = c.getContext('2d');
      const GD = '#1f4d1f', GM = '#2f7a2f', GL = '#4da64d';
      const M1 = '#e84393', M2 = '#f368a8', M3 = '#c026d3', WC = '#fff7cc';
      // Bóng đất
      R2(ctx, 6, 28, 20, 2, 'rgba(0,0,0,0.25)');
      // Tán lá rậm (bất đối xứng, bụi lan)
      R2(ctx, 8, 16, 16, 10, GM);
      R2(ctx, 6, 18, 4, 8, GM); R2(ctx, 22, 18, 4, 8, GM);
      R2(ctx, 10, 12, 12, 6, GM);
      R2(ctx, 12, 10, 8, 4, GM);
      R2(ctx, 4, 20, 4, 6, GM); R2(ctx, 24, 20, 4, 6, GM);
      R2(ctx, 8, 22, 16, 4, GD);            // chân bụi tối
      R2(ctx, 10, 12, 12, 2, GL);           // đỉnh tán sáng
      R2(ctx, 6, 18, 2, 8, GL);             // mép trái sáng
      // Cụm hoa giấy — mảng hồng/magenta dày ở đỉnh tán
      const clusters = [
        [9, 13, 3, 2, M1], [14, 11, 3, 2, M2], [19, 13, 3, 2, M1],
        [7, 17, 3, 2, M3], [12, 16, 4, 3, M1], [18, 17, 3, 2, M2],
        [23, 16, 3, 2, M1], [10, 21, 3, 2, M2], [16, 21, 4, 3, M1],
        [22, 21, 3, 2, M3], [13, 25, 3, 2, M1], [20, 25, 3, 2, M2],
        [8, 24, 2, 2, M3], [24, 24, 2, 2, M1], [5, 21, 2, 2, M2],
      ];
      for (const [x, y, w, h, col] of clusters) R2(ctx, x, y, w, h, col);
      // Nhụy hoa thật (chấm trắng/vàng li ti giữa cụm)
      R2(ctx, 13, 17, 1, 1, WC); R2(ctx, 20, 14, 1, 1, WC);
      R2(ctx, 17, 22, 1, 1, WC); R2(ctx, 11, 22, 1, 1, WC);
      // Cành rủ
      R2(ctx, 14, 28, 1, 2, GD); R2(ctx, 20, 28, 1, 2, GD);
      scene.textures.addCanvas('flower_bougainvillea', c);
    }

    // ---- HOA HỒNG: bụi hồng với nụ đỏ/hồng ----
    if (!scene.textures.exists('flower_rose')) {
      const c = document.createElement('canvas');
      c.width = 32; c.height = 32;
      const ctx = c.getContext('2d');
      const GD = '#245224', GM = '#357a35', GL = '#55a855';
      // Bóng đất
      R2(ctx, 7, 28, 18, 2, 'rgba(0,0,0,0.25)');
      // Tán bụi
      R2(ctx, 9, 16, 14, 10, GM);
      R2(ctx, 7, 18, 4, 8, GM); R2(ctx, 21, 18, 4, 8, GM);
      R2(ctx, 11, 13, 10, 5, GM);
      R2(ctx, 13, 11, 6, 4, GM);
      R2(ctx, 9, 23, 14, 3, GD);            // chân bụi tối
      R2(ctx, 11, 13, 10, 2, GL);           // đỉnh sáng
      R2(ctx, 7, 18, 2, 6, GL);             // mép trái sáng
      // Hoa hồng: mỗi bông 4x4 — cánh ngoài + nhụy tối + điểm sáng
      const rose = (x, y, petal, heart) => {
        R2(ctx, x, y, 4, 4, petal);
        R2(ctx, x + 1, y + 1, 2, 2, heart);
        R2(ctx, x + 1, y, 2, 1, '#ff8fa3');
      };
      rose(10, 14, '#dc2626', '#991b1b');
      rose(19, 15, '#f43f5e', '#be123c');
      rose(14, 19, '#dc2626', '#991b1b');
      rose(8, 21, '#f43f5e', '#be123c');
      rose(21, 22, '#e11d48', '#9f1239');
      // Nụ hồng
      R2(ctx, 16, 11, 2, 3, '#dc2626');
      R2(ctx, 16, 11, 2, 1, '#f87171');
      // Thân cành
      R2(ctx, 12, 26, 1, 2, GD); R2(ctx, 19, 26, 1, 2, GD);
      scene.textures.addCanvas('flower_rose', c);
    }
  }
}
