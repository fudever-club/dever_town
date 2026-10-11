/**
 * Cấu hình toàn cục cho DEVER TOWN Game Client (Chuẩn Viewport Mở Rộng 800x600)
 */
export const GAME_CONFIG = {
  // Bản đồ mở rộng chuẩn 25x19 ô (800x608 px)
  TILE_SIZE: 32,
  MAP_WIDTH_TILES: 25,
  MAP_HEIGHT_TILES: 19,
  MAP_WIDTH: 800,
  MAP_HEIGHT: 608,

  // Thông số nhân vật
  PLAYER: {
    SPEED: 160,
    INITIAL_SPAWN: { x: 400, y: 350 }
  },

  // Cấu hình mạng realtime Socket.io
  NETWORK: {
    SERVER_URL: (() => {
      // 1. Kiểm tra biến môi trường build
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVER_URL) {
        return import.meta.env.VITE_SERVER_URL;
      }
      // 2. Kiểm tra cấu hình tùy chỉnh trong localStorage
      try {
        const customUrl = localStorage.getItem('dever_server_url');
        if (customUrl) return customUrl;
      } catch (e) {}
      // 3. Môi trường phát triển nội bộ
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      // 4. Môi trường Vercel hoặc static host không có socket server chuyên biệt -> Standalone Campus Mode
      return null;
    })(),
    TICK_RATE: 20, // Phase 0: khớp server cap 20 gói/s — gửi 30/s chỉ làm server drop thừa ~1/3 gói
    TICK_INTERVAL_MS: 1000 / 20
  }
};

/**
 * Nhãn portal theo ngữ cảnh (contextual labels) — chống "text wallpaper".
 * Nhãn chỉ hiện đầy đủ khi người chơi ở gần; ở xa chỉ còn chấm marker tím.
 * (Critique 2026-10-09 item #1: portal label de-clutter)
 */
export const PORTAL_LABEL_CONFIG = {
  UPDATE_MS: 150,   // throttle cập nhật fade (ms) — cùng nhịp với tile culling
  NEAR_PX: 240,      // trong phạm vi này: nhãn hiện đầy đủ (alpha 1, scale 1)
  FAR_PX: 520,       // ngoài phạm vi này: ẩn nhãn, chỉ hiện chấm marker
  MIN_ALPHA: 0.12,   // alpha tối thiểu của nhãn ở vùng chuyển tiếp
  DOT_ALPHA: 0.75,   // alpha chấm marker khi ở xa
  DOT_RADIUS: 5,     // bán kính chấm marker (px, world)
  DEOVERLAP_PAD: 6,  // padding khi đẩy nhãn chồng nhau
};
