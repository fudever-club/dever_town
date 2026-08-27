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
    SERVER_URL: window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin,
    TICK_RATE: 30, // 30 FPS network throttling
    TICK_INTERVAL_MS: 1000 / 30
  }
};
