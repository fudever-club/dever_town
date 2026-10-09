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
   * Vẽ lại từ ảnh tham chiếu của Hung (2026-10-09): tượng đồng đen ngồi trên tảng đá,
   * cằm tựa nắm tay phải, khuỷu tay chống gối, thân gập về trước, bệ đá xám cao
   * có biển đồng nhỏ. Canvas 48x96, mặt hướng trái.
   * Key texture: 'thinker_statue'.
   */
  static generateThinkerStatue(scene) {
    if (scene.textures.exists('thinker_statue')) return;
    const W = 48, H = 96;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    // Bảng màu — đồng đen (ảnh tham chiếu gần như đen):
    const BD = '#1d150e', BM = '#33261a', BL = '#57432e', BH = '#7a6142';
    // Đá xám bệ cao:
    const SD = '#5b6675', SM = '#8b95a5', SL = '#c3ccd8';
    // Biển đồng trên bệ:
    const PD = '#6b5320', PM = '#a8843c';
    // Tảng đá ngồi:
    const RD = '#2b2724', RM = '#453f39';
    const MOSS = '#4d7c0f';

    const SIL = (x, y, w, h) => R(x, y, w, h, BD);
    const MID = (x, y, w, h) => R(x, y, w, h, BM);
    const LIT = (x, y, w, h) => R(x, y, w, h, BL);

    // ===== BỆ ĐÁ CAO (y 54–96) =====
    // Nắp bệ
    R(8, 52, 32, 6, SM);
    R(8, 52, 32, 2, SL);            // mặt trên sáng
    R(8, 56, 32, 2, SD);            // gờ dưới nắp
    // Thân trụ
    R(10, 58, 28, 30, SM);
    R(10, 58, 3, 30, SL);           // cạnh trái sáng (sáng từ trái-trên)
    R(35, 58, 3, 30, SD);           // cạnh phải tối
    R(10, 58, 28, 1, SL);
    // Vân đá mờ
    R(16, 64, 6, 1, SD); R(26, 72, 8, 1, SD); R(18, 80, 5, 1, SD);
    R(30, 66, 4, 1, SL); R(14, 76, 7, 1, SL);
    // Biển đồng nhỏ giữa thân trụ
    R(19, 67, 10, 8, PD);
    R(20, 68, 8, 6, PM);
    R(20, 68, 8, 1, '#d4a94e');     // viền sáng trên biển
    R(21, 70, 1, 1, PD); R(27, 70, 1, 1, PD); // đinh tán
    // Đế bệ
    R(6, 88, 36, 8, SM);
    R(6, 88, 36, 2, SL);
    R(6, 94, 36, 2, SD);
    R(34, 90, 8, 4, 'rgba(0,0,0,0.15)');
    // Rêu phong chân bệ
    R(6, 94, 9, 2, MOSS); R(33, 94, 9, 2, MOSS); R(10, 88, 3, 2, MOSS);

    // ===== TẢNG ĐÁ NGỒI (y 44–54) =====
    R(13, 44, 24, 10, RD);
    R(13, 44, 24, 3, RM);           // mặt trên tảng đá
    R(15, 47, 5, 2, RM); R(27, 48, 6, 2, RM); // gờ đá
    R(13, 52, 24, 2, '#1a1714');    // chân tảng tối

    // ===== NHÂN VẬT ĐỒNG ĐEN — dáng "Người suy tư", mặt hướng trái =====
    // v3: gập thân SÂU theo ảnh tham chiếu — đầu treo thấp gần gối, lưng gần như
    // nằm ngang, nắm tay to + sáng rõ dưới cằm, khuỷu đặt trên chỏm gối nhô.

    // --- Silhouette ---
    // Mông ngồi trên tảng đá
    SIL(27, 37, 11, 9);
    // Lưng cong GẬP SÂU: từ mông vút lên-trái gần như nằm ngang rồi cụp xuống gáy
    SIL(21, 31, 13, 8);
    SIL(16, 27, 10, 7);
    SIL(13, 24, 8, 6);              // gáy / vai cuộn về trước
    // Đầu TREO THẤP, cằm gần ngang gối
    SIL(6, 27, 10, 12);
    SIL(5, 34, 5, 4);               // cằm nhô ra trước
    // Tay phải: vai (thấp, trước) -> khuỷu chống gối -> cẳng tay NGẮN dựng -> nắm tay TO đỡ cằm
    SIL(12, 33, 6, 5);              // vai phải
    SIL(10, 37, 6, 6);              // bắp tay xuống khuỷu
    SIL(9, 42, 6, 4);               // khuỷu tay CHỐNG LÊN gối
    SIL(8, 35, 5, 8);               // cẳng tay ngắn dựng đứng
    SIL(6, 30, 8, 7);               // NẮM TAY TO đỡ cằm
    // Đùi phải ngang -> gối NHÔ CAO (nơi khuỷu tay chống)
    SIL(6, 45, 21, 7);
    SIL(5, 44, 8, 8);               // chỏm gối nhô
    // Bắp chân phải xuống bàn chân đặt nắp bệ
    SIL(6, 51, 6, 3);
    SIL(4, 53, 12, 3);              // bàn chân
    // Tay trái buông chéo qua thân, tay đặt gần gối phải
    SIL(17, 35, 5, 10);
    SIL(14, 44, 8, 4);              // bàn tay trái
    // Chân trái (xa): đùi + bắp chân thu sau
    SIL(18, 47, 12, 6);
    SIL(23, 52, 6, 2);
    SIL(21, 53, 11, 2);

    // --- Khắc thịt (lùi 1px khỏi viền silhouette) ---
    MID(28, 38, 9, 7);              // mông
    MID(22, 32, 11, 6);             // lưng dưới
    MID(17, 28, 8, 5);              // lưng trên
    MID(14, 25, 6, 4);              // gáy
    MID(7, 28, 8, 10);              // đầu
    MID(7, 46, 19, 5);              // đùi phải
    MID(11, 38, 4, 4);              // bắp tay
    MID(18, 36, 3, 8);              // tay trái
    // Cẳng tay: dải SÁNG tách khỏi thân
    R(9, 36, 3, 6, BL);
    R(9, 36, 3, 2, BH);

    // --- Điểm sáng đồng (sáng từ trái-trên) ---
    LIT(7, 28, 8, 1);               // đỉnh đầu
    R(6, 30, 8, 2, BH);             // mu nắm tay — ĐIỂM SÁNG NHẤT
    R(7, 32, 6, 4, BL);             // nắm tay
    R(9, 34, 2, 2, BD);             // kẽ ngón tay
    R(5, 44, 8, 2, BL);             // chỏm gối — nơi khuỷu tay chống
    R(7, 46, 19, 1, BL);            // mặt trên đùi
    LIT(14, 25, 5, 1);              // gáy
    // Rim-light dọc sống lưng — tách khối lưng khỏi nền
    R(29, 31, 2, 8, BL);
    R(32, 37, 2, 6, BL);
    R(26, 28, 2, 5, BM);
    // Khe tối tách cẳng tay khỏi ngực
    R(12, 36, 1, 6, BD);
    // Khe tối tách nắm tay khỏi cằm — đọc rõ "cằm TỰA LÊN nắm tay"
    R(7, 33, 6, 1, BD);
    // Chi tiết mặt cúi
    R(6, 32, 7, 1, BD);             // hốc mắt / chân mày
    R(5, 35, 2, 2, BM);             // mũi
    R(12, 27, 5, 11, BD);           // bóng sau đầu

    scene.textures.addCanvas('thinker_statue', canvas);
  }
}
