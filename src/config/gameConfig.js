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
    TICK_RATE: 30, // 30 FPS network throttling
    TICK_INTERVAL_MS: 1000 / 30
  }
};
