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
   * v4 (2026-10-09): vẽ lại từ ảnh tham chiếu của Hung — bệ đá CAO (xấp xỉ chiều
   * cao tượng, cột chữ nhật trơn, biển đồng nhỏ giữa mặt trước), tượng đồng đen
   * ngồi trên tảng đá: gối nhô cao, khuỷu tay chống gối, cằm tựa nắm tay, thân
   * gập sâu về trước. Canvas 48x112, mặt hướng trái.
   * Key texture: 'thinker_statue'.
   */
  static generateThinkerStatue(scene) {
    if (scene.textures.exists('thinker_statue')) return;
    const W = 48, H = 112;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    // Bảng màu — đồng đen (ảnh tham chiếu gần như đen):
    const BD = '#1d150e', BM = '#2e2318', BL = '#4a3826', BH = '#6e573a';
    // Đá xám bệ cao:
    const SD = '#5b6675', SM = '#8b95a5', SL = '#c3ccd8';
    // Biển đồng trên bệ:
    const PD = '#6b5320', PM = '#a8843c', PH = '#d4a94e';
    // Tảng đá ngồi:
    const RD = '#3a352f', RM = '#575046';
    const MOSS = '#4d7c0f';
    const GAP = '#0b0805';          // khe tối tách chi tiết

    const SIL = (x, y, w, h) => R(x, y, w, h, BD);

    // ===== BỆ ĐÁ CAO (y 58–112) — cột chữ nhật trơn, cao xấp xỉ tượng =====
    // Nắp bệ
    R(8, 56, 32, 4, SM);
    R(8, 56, 32, 1, SL);            // mặt trên sáng
    R(8, 59, 32, 1, SD);            // gờ dưới nắp
    // Thân trụ trơn
    R(11, 60, 26, 42, SM);
    R(11, 60, 2, 42, SL);           // cạnh trái sáng (sáng từ trái-trên)
    R(35, 60, 2, 42, SD);           // cạnh phải tối
    R(11, 60, 26, 1, SL);
    // Vân đá mờ
    R(16, 66, 6, 1, SD); R(26, 76, 8, 1, SD); R(18, 86, 5, 1, SD); R(24, 94, 6, 1, SD);
    R(30, 68, 4, 1, SL); R(14, 82, 7, 1, SL); R(28, 90, 5, 1, SL);
    // Biển đồng nhỏ giữa mặt trước thân trụ (như ảnh tham chiếu)
    R(19, 74, 10, 9, PD);
    R(20, 75, 8, 7, PM);
    R(20, 75, 8, 1, PH);            // viền sáng trên biển
    R(21, 77, 1, 1, PD); R(27, 77, 1, 1, PD); // đinh tán
    R(21, 80, 6, 1, PD);            // dòng chữ khắc (gợi)
    // Đế bệ
    R(7, 102, 34, 10, SM);
    R(7, 102, 34, 2, SL);
    R(7, 110, 34, 2, SD);
    R(33, 104, 8, 6, 'rgba(0,0,0,0.15)');
    // Rêu phong chân bệ
    R(7, 110, 9, 2, MOSS); R(32, 110, 9, 2, MOSS); R(11, 102, 3, 2, MOSS);

    // ===== TẢNG ĐÁ NGỒI (y 50–58) — lộ rõ giữa tượng và nắp bệ =====
    R(10, 50, 30, 8, RD);
    R(10, 50, 30, 2, RM);           // mặt trên tảng đá bắt sáng
    R(12, 53, 6, 2, RM); R(30, 54, 6, 2, RM); // gờ đá
    R(10, 56, 30, 2, '#211d19');    // chân tảng tối

    // ===== NHÂN VẬT ĐỒNG ĐEN — dáng "Người suy tư", mặt hướng trái =====
    // v4: dựng lại giải phẫu — đầu cúi sâu, cằm đặt TRÊN nắm tay (khe tối tách),
    // khuỷu tay phải chống lên chỏm gối nhô cao, lưng cong dài, bệ cao như ảnh mẫu.

    // --- Silhouette (BD) ---
    // Mông ngồi trên tảng đá
    SIL(28, 42, 12, 10);
    // Lưng: đường cong dài từ mông lên vai
    SIL(30, 32, 11, 12);            // lưng dưới
    SIL(29, 22, 11, 12);            // lưng giữa
    SIL(27, 14, 11, 10);            // lưng trên
    SIL(25, 8, 11, 8);              // ụ vai
    SIL(27, 6, 8, 4);               // đỉnh vai
    // Gáy / thang vai cuộn về trước, nối xuống đầu
    SIL(18, 12, 10, 8);
    SIL(14, 16, 8, 8);
    // Đầu cúi sâu — treo thấp, cằm gần ngang gối (TO, rõ khối)
    SIL(5, 19, 12, 13);
    // Cằm / quai hàm nhô về trước-xuống (y29–33)
    SIL(4, 29, 8, 5);
    // Ngực (mặt trước thân, sau cánh tay)
    SIL(16, 30, 7, 12);
    // Bụng nối xuống hông
    SIL(21, 40, 10, 8);
    // Đùi phải: từ hông vươn tới gối nhô cao
    SIL(10, 45, 20, 7);
    // Chỏm gối phải NHÔ CAO (y43–52, nơi khuỷu tay chống)
    SIL(6, 43, 9, 9);
    // Bắp chân phải xuống
    SIL(8, 51, 6, 6);
    // Bàn chân phải đặt tảng đá
    SIL(5, 56, 12, 2);
    // Tay phải: vai -> bắp tay xuống khuỷu
    SIL(15, 30, 7, 11);
    // Khuỷu tay CHỐNG LÊN chỏm gối (y42–47, đè lên đỉnh gối)
    SIL(10, 42, 7, 6);
    // Cẳng tay dựng lên từ khuỷu tới nắm tay (y36–42) — trụ chéo rõ
    SIL(9, 36, 6, 7);
    // NẮM TAY đỡ cằm (y34–41) — to, ngay dưới khe cằm, điểm sáng nhất
    SIL(5, 34, 9, 7);
    // Tay trái gập ngang thân
    SIL(20, 32, 6, 11);
    // Bàn tay trái đặt gần gối
    SIL(13, 42, 8, 5);
    // Chân trái (xa): đùi + bắp chân + bàn chân thu sau
    SIL(22, 46, 12, 6);
    SIL(26, 51, 7, 6);
    SIL(24, 56, 11, 2);

    // --- Khe tối tách chi tiết (GAP) ---
    R(5, 33, 7, 1, GAP);            // khe cằm / nắm tay — đọc rõ "cằm TỰA LÊN tay"
    R(15, 22, 3, 9, GAP);           // khe đầu / gáy — tách đầu khỏi vai, đầu đọc độc lập
    R(18, 42, 1, 5, GAP);           // khe tay trái / ngực
    R(8, 46, 6, 1, GAP);            // khe khuỷu / gối — khuỷu ĐÈ LÊN gối

    // --- Khắc thịt (BM, lùi 1px khỏi viền) ---
    R(29, 43, 10, 8, BM);           // mông
    R(31, 33, 9, 10, BM);           // lưng dưới
    R(30, 23, 9, 10, BM);           // lưng giữa
    R(28, 15, 9, 8, BM);            // lưng trên
    R(26, 9, 9, 6, BM);             // ụ vai
    R(6, 20, 10, 10, BM);           // đầu (to)
    R(11, 46, 18, 5, BM);           // đùi phải
    R(16, 31, 5, 9, BM);            // bắp tay phải
    R(21, 33, 4, 9, BM);            // tay trái

    // --- Điểm sáng đồng (sáng từ trái-trên) ---
    R(6, 34, 7, 3, BH);             // mu nắm tay — ĐIỂM SÁNG NHẤT (to)
    R(6, 37, 7, 3, BL);             // nắm tay
    R(8, 38, 2, 2, BD);             // kẽ ngón tay
    R(6, 43, 9, 2, BL);             // chỏm gối — mặt trên nơi khuỷu chống
    R(7, 43, 7, 1, BH);             // đỉnh chỏm gối bắt sáng
    R(5, 19, 12, 1, BL);            // đỉnh đầu
    R(4, 29, 8, 1, BL);            // quai hàm
    R(10, 45, 20, 1, BL);           // mặt trên đùi
    R(16, 30, 7, 1, BL);            // ngực
    // Rim-light dọc sống lưng — tách khối lưng khỏi nền tối (2px, mạnh hơn)
    R(39, 32, 2, 12, BL);
    R(38, 22, 2, 10, BL);
    R(36, 14, 2, 8, BL);
    R(34, 8, 2, 6, BL);
    R(41, 34, 1, 10, BH);           // viền sáng mảnh ngoài cùng lưng dưới
    R(40, 24, 1, 8, BH);            // viền sáng mảnh ngoài cùng lưng giữa
    R(40, 44, 2, 6, BM);
    // Cẳng tay: dải sáng tách khỏi thân
    R(10, 37, 2, 5, BL);
    R(9, 37, 1, 5, BH);             // mép sáng cẳng tay
    // Bóng sau đầu
    R(16, 20, 2, 10, BD);

    scene.textures.addCanvas('thinker_statue', canvas);
  }
}
