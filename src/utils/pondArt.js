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
   * Sinh spritesheet vịt trời 2 frame (32x24/frame): frame 0 cánh hạ, frame 1 cánh nâng.
   * Vịt nhìn sang phải; lật ngang (flipX) khi bơi sang trái. Key texture: 'duck'.
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
      // Đuôi
      R(1, 11, 4, 3, '#eab308');
      // Thân
      R(5, 10, 15, 8, '#facc15');
      R(6, 10, 13, 2, '#fde047');   // highlight lưng
      R(5, 16, 15, 2, '#eab308');   // bóng bụng
      // Đầu
      R(18, 4, 9, 9, '#facc15');
      R(19, 4, 7, 2, '#fde047');
      R(18, 11, 9, 2, '#eab308');
      // Mỏ cam
      R(27, 7, 4, 3, '#f97316');
      R(27, 7, 4, 1, '#fdba74');
      // Mắt
      R(23, 6, 2, 2, '#1e293b');
      // Cánh (2 frame đập)
      if (wingUp) {
        R(8, 8, 7, 3, '#eab308');
        R(8, 10, 7, 1, '#ca8a04');
      } else {
        R(8, 12, 7, 4, '#eab308');
        R(8, 14, 7, 1, '#ca8a04');
      }
      // Vệt nước dưới bụng
      R(4, 19, 22, 1, wingUp ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)');
    };

    drawFrame(0, false);
    drawFrame(W, true);

    scene.textures.addSpriteSheet('duck', canvas, { frameWidth: W, frameHeight: H });
  }

  /**
   * Sinh texture tượng "Nhà Tư Tưởng" (phong cách The Thinker) trên bệ đá.
   * Canvas 48x84: bệ đá xám 3 tầng + nhân vật đồng ngồi, cằm tựa tay, khuỷu tay đặt gối.
   * Key texture: 'thinker_statue'. Nhìn nghiêng sang trái.
   */
  static generateThinkerStatue(scene) {
    if (scene.textures.exists('thinker_statue')) return;
    const W = 48, H = 84;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

    // Bảng màu
    const BD = '#5f4a1e', BM = '#96742f', BL = '#d4a94e'; // đồng: tối / giữa / sáng
    const SD = '#4b586c', SM = '#7c8a9e', SL = '#b9c3d2'; // đá: tối / giữa / sáng
    const MOSS = '#4d7c0f';

    // --- Bệ đá 3 tầng ---
    R(6, 72, 36, 10, SM);            // đế
    R(6, 72, 36, 2, SL);             // gờ sáng đế
    R(6, 80, 36, 2, SD);             // chân đế tối
    R(34, 74, 8, 6, 'rgba(0,0,0,0.15)'); // bóng cạnh phải đế
    R(11, 60, 26, 12, SM);           // thân trụ
    R(11, 60, 26, 2, SL);
    R(11, 70, 26, 2, SD);
    R(31, 62, 6, 8, 'rgba(0,0,0,0.12)'); // bóng cạnh trụ
    R(8, 56, 32, 4, SL);             // nắp bệ
    R(8, 59, 32, 1, SD);
    // Rêu phong góc bệ
    R(8, 78, 10, 2, MOSS);
    R(30, 79, 8, 1, MOSS);
    R(12, 60, 3, 2, MOSS);

    // --- Nhân vật đồng: ngồi trên nắp bệ (y=58), mặt hướng trái ---
    // Vẽ silhouette viền tối trước, khắc chi tiết sau — đảm bảo đọc rõ trên nền cỏ sáng.
    // Dáng "Nhà tư tưởng": cằm tựa nắm tay phải, khuỷu tay phải chống lên gối.
    const SIL = (x, y, w, h) => R(x, y, w, h, BD); // silhouette = viền đồng tối
    const MID = (x, y, w, h) => R(x, y, w, h, BM); // thịt đồng giữa
    const LIT = (x, y, w, h) => R(x, y, w, h, BL); // điểm sáng

    // Silhouette
    SIL(7, 9, 12, 12);    // đầu cúi
    SIL(14, 20, 6, 5);     // cổ
    SIL(16, 25, 11, 19);   // thân ngả về trước
    SIL(7, 43, 20, 7);     // đùi phải ngang
    SIL(6, 43, 5, 9);      // gối phải
    SIL(7, 51, 5, 7);      // bắp chân phải
    SIL(5, 56, 10, 3);     // bàn chân đặt nắp bệ
    SIL(21, 45, 11, 6);    // đùi trái (xa)
    SIL(27, 51, 4, 7);     // bắp chân trái (xa)
    SIL(17, 30, 4, 6);     // bắp tay phải: vai -> khuỷu
    SIL(13, 35, 5, 6);
    SIL(10, 40, 6, 5);     // khuỷu tay chống lên gối
    SIL(10, 26, 4, 15);    // cẳng tay dựng đứng lên cằm
    SIL(9, 20, 8, 7);      // nắm tay đỡ cằm
    SIL(20, 30, 4, 13);    // tay trái buông (tối, phía sau)
    SIL(16, 42, 6, 4);     // bàn tay trái đặt gối

    // Khắc thịt (lùi 1px khỏi viền)
    MID(8, 10, 10, 10);    // đầu
    MID(17, 26, 9, 17);    // thân
    MID(8, 44, 18, 5);     // đùi phải
    MID(8, 52, 3, 5);      // bắp chân phải
    MID(22, 46, 9, 4);     // đùi trái
    MID(11, 27, 2, 13);    // cẳng tay
    MID(18, 31, 2, 8);     // bắp tay

    // Điểm sáng (ánh sáng từ trên-trái)
    LIT(8, 10, 10, 2);     // đỉnh đầu
    LIT(8, 44, 18, 1);     // mặt trên đùi
    LIT(6, 43, 5, 2);      // chỏm gối — nơi khuỷu tay chống
    LIT(11, 27, 2, 3);     // cẳng tay
    R(10, 21, 6, 4, BL); // nắm tay sáng đỡ cằm (điểm sáng nhất)
    R(10, 25, 6, 1, BD); // kẽ ngón tay
    LIT(17, 26, 3, 2);     // vai

    // Chi tiết mặt cúi (nhìn xuống-trái)
    R(8, 14, 10, 1, BD); // chân mày / hốc mắt
    R(6, 17, 3, 2, BM);  // mũi
    R(9, 19, 6, 2, BM);  // cằm chạm nắm tay
    R(16, 10, 2, 10, BD);// bóng sau gáy
    // Viền sáng rim-light cạnh phải thân — tách khỏi nền cỏ
    R(26, 30, 1, 10, BL);

    scene.textures.addCanvas('thinker_statue', canvas);
  }
}
