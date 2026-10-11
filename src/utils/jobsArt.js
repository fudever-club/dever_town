/**
 * JobsArt: Pixel-art procedural cho việc làm campus Phase D1 — tách khỏi
 * TextureGenerator.js để giữ file tileset dưới 100KB (giới hạn API push).
 *
 * Gồm:
 *   - 4 sprite rác (trà sữa cup, chai nhựa, vỏ chuối, lõi táo) 16x16
 *   - 2 thùng phân loại (Vô cơ / Hữu cơ) 24x32
 *   - 1 bọ phát sáng 2 frame (20x16) cho Bug Hunter
 *   - 1 cái vợt (net) 24x24 cho animation vợt bọ
 *
 * Cách dùng: JobsArt.generateJobSprites(scene) trong BootScene (như PondArt).
 * Bọ & rác được sinh qua addSpriteSheet 'job_bug' 2 frame để đổi frame đập cánh.
 */
export class JobsArt {
  /**
   * Sinh toàn bộ texture việc làm. Idempotent: bỏ qua key đã tồn tại.
   * @param {Phaser.Scene} scene
   */
  static generateJobSprites(scene) {
    if (!scene?.textures) return;
    this._makeLitter(scene, 'cup', this._drawCup);
    this._makeLitter(scene, 'bottle', this._drawBottle);
    this._makeLitter(scene, 'banana', this._drawBanana);
    this._makeLitter(scene, 'apple', this._drawApple);
    this._makeBin(scene, 'inorganic', '#3b82f6', '#1d4ed8', '#93c5fd');
    this._makeBin(scene, 'organic', '#22c55e', '#15803d', '#86efac');
    this._makeBug(scene);
    this._makeNet(scene);
  }

  static _canvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return [canvas, canvas.getContext('2d')];
  }

  static _register(scene, key, canvas, frameConfig) {
    if (scene.textures.exists(key)) return;
    if (frameConfig) {
      scene.textures.addSpriteSheet(key, canvas, frameConfig);
    } else {
      scene.textures.addCanvas(key, canvas);
    }
  }

  // ---------------------------------------------------------- RÁC ------
  static _makeLitter(scene, kind, drawFn) {
    const key = `job_litter_${kind}`;
    if (scene.textures.exists(key)) return;
    const [canvas, ctx] = this._canvas(16, 16);
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    drawFn(R);
    this._register(scene, key, canvas);
  }

  /** Cốc trà sữa nhựa: thân trong, nắp đậy, ống hút hồng, trà sữa nâu. */
  static _drawCup(R) {
    R(5, 5, 6, 1, '#e2e8f0');   // nắp
    R(4, 6, 8, 1, '#f1f5f9');   // mép nắp
    R(9, 2, 2, 4, '#f472b6');   // ống hút
    R(9, 2, 1, 4, '#fbcfe8');
    R(5, 7, 6, 6, 'rgba(210,180,140,0.85)');  // thân trong suốt
    R(5, 9, 6, 4, '#a16207');   // trà sữa
    R(5, 7, 1, 6, '#ffffff');   // phản quang
    R(5, 12, 6, 1, '#94a3b8');  // đáy
  }

  /** Chai nhựa: thân xanh nhạt, nắp xanh đậm, nhãn. */
  static _drawBottle(R) {
    R(7, 2, 2, 2, '#38bdf8');   // cổ chai
    R(6, 1, 4, 2, '#0369a1');   // nắp
    R(6, 1, 4, 1, '#0284c7');
    R(5, 4, 6, 9, 'rgba(186,230,253,0.9)');   // thân
    R(5, 7, 6, 3, '#f8fafc');   // nhãn trắng
    R(5, 8, 6, 1, '#38bdf8');
    R(5, 4, 1, 9, '#ffffff');   // phản quang
    R(5, 12, 6, 1, '#7dd3fc');  // đáy
  }

  /** Vỏ chuối: cong vàng, đầu nâu. */
  static _drawBanana(R) {
    R(7, 10, 2, 2, '#854d0e');  // cuống
    R(6, 8, 4, 3, '#facc15');   // thân vỏ
    R(5, 6, 6, 3, '#fde047');
    R(4, 5, 2, 2, '#facc15');   // múi vỏ xòe trái
    R(10, 5, 2, 2, '#facc15');  // múi vỏ xòe phải
    R(4, 5, 2, 1, '#fef08a');
    R(6, 6, 4, 1, '#fef9c3');   // highlight
    R(7, 11, 2, 1, '#a16207');  // đốm chín
  }

  /** Lõi táo: đỏ, cuống nâu, lá xanh. */
  static _drawApple(R) {
    R(7, 4, 2, 3, '#78350f');   // cuống
    R(10, 4, 3, 2, '#16a34a');  // lá
    R(10, 4, 2, 1, '#4ade80');
    R(5, 6, 6, 6, '#dc2626');   // thân táo
    R(5, 6, 6, 2, '#ef4444');
    R(6, 7, 2, 3, '#fca5a5');   // highlight
    R(5, 11, 6, 1, '#991b1b');  // bóng đáy
    R(6, 12, 4, 1, '#fbbf24');  // hạt rơi
  }

  // --------------------------------------------------- THÙNG RÁC ------
  static _makeBin(scene, kind, body, dark, light) {
    const key = `job_bin_${kind}`;
    if (scene.textures.exists(key)) return;
    const [canvas, ctx] = this._canvas(24, 32);
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    R(7, 2, 10, 3, dark);       // nắp
    R(7, 2, 10, 1, light);
    R(11, 0, 2, 2, dark);       // tay cầm
    R(6, 5, 12, 21, body);      // thân thùng
    R(6, 5, 2, 21, light);      // cạnh sáng
    R(16, 5, 2, 21, dark);      // cạnh tối
    R(6, 24, 12, 2, dark);      // đáy
    // Ký hiệu tái chế: 3 gạch trắng
    R(9, 10, 6, 2, 'rgba(255,255,255,0.9)');
    R(9, 14, 6, 2, 'rgba(255,255,255,0.9)');
    R(9, 18, 6, 2, 'rgba(255,255,255,0.9)');
    R(9, 10, 2, 10, 'rgba(255,255,255,0.55)');
    // Bóng đổ
    R(4, 27, 16, 2, 'rgba(0,0,0,0.25)');
    this._register(scene, key, canvas);
  }

  // ------------------------------------------------------ BỌ ------
  /**
   * Bọ phát sáng 2 frame (20x16): frame 0 cánh khép, frame 1 cánh mở.
   * Vầng sáng vẽ bằng rect vàng mờ quanh thân — không dùng shadowBlur
   * (giữ pixel style + rẻ trên mobile).
   */
  static _makeBug(scene) {
    const key = 'job_bug';
    if (scene.textures.exists(key)) return;
    const [canvas, ctx] = this._canvas(40, 16);
    const drawFrame = (ox, wingsOpen) => {
      const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(ox + x, y, w, h); };
      // Vầng sáng (vẽ trước, dưới thân)
      R(2, 3, 16, 10, 'rgba(253,224,71,0.28)');
      R(4, 5, 12, 6, 'rgba(253,224,71,0.45)');
      // Cánh
      if (wingsOpen) {
        R(4, 2, 5, 4, 'rgba(224,242,254,0.95)');
        R(11, 2, 5, 4, 'rgba(224,242,254,0.95)');
        R(4, 2, 5, 1, '#ffffff');
        R(11, 2, 5, 1, '#ffffff');
      } else {
        R(6, 5, 3, 3, 'rgba(186,230,253,0.9)');
        R(11, 5, 3, 3, 'rgba(186,230,253,0.9)');
      }
      // Thân bọ cánh cứng
      R(6, 6, 8, 6, '#1f2937');
      R(6, 6, 8, 2, '#374151');
      R(9, 6, 2, 6, '#111827');   // rãnh giữa
      // Đầu + râu
      R(8, 3, 4, 3, '#111827');
      R(6, 2, 2, 1, '#4b5563');
      R(12, 2, 2, 1, '#4b5563');
      // Mắt phát sáng
      R(8, 4, 1, 1, '#fde047');
      R(11, 4, 1, 1, '#fde047');
      // Bụng phát sáng (đom đóm)
      R(9, 11, 2, 2, wingsOpen ? '#fef08a' : '#a16207');
    };
    drawFrame(0, false);
    drawFrame(20, true);
    this._register(scene, key, canvas, { frameWidth: 20, frameHeight: 16 });
  }

  // ------------------------------------------------------ VỢT ------
  /** Vợt bắt bọ 24x24: cán gỗ + khung lưới. */
  static _makeNet(scene) {
    const key = 'job_net';
    if (scene.textures.exists(key)) return;
    const [canvas, ctx] = this._canvas(24, 24);
    const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    R(11, 12, 3, 11, '#92400e');  // cán gỗ
    R(11, 12, 1, 11, '#b45309');
    R(5, 2, 14, 10, 'rgba(224,242,254,0.55)');  // lưới
    R(5, 2, 14, 2, '#64748b');    // khung trên
    R(5, 10, 14, 2, '#64748b');   // khung dưới
    R(5, 2, 2, 10, '#64748b');
    R(17, 2, 2, 10, '#64748b');
    R(8, 4, 2, 2, 'rgba(255,255,255,0.5)');  // ô lưới sáng
    R(14, 7, 2, 2, 'rgba(255,255,255,0.5)');
    this._register(scene, key, canvas);
  }
}
