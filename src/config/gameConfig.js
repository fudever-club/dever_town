export const GAME_CONFIG = {
  TILE_SIZE: 32,
  MAP_WIDTH_TILES: 20,
  MAP_HEIGHT_TILES: 15,
  get MAP_WIDTH() {
    return this.TILE_SIZE * this.MAP_WIDTH_TILES; // 640
  },
  get MAP_HEIGHT() {
    return this.TILE_SIZE * this.MAP_HEIGHT_TILES; // 480
  },
  PLAYER_SPEED: 160,
  SPRITE_WIDTH: 32,
  SPRITE_HEIGHT: 32,
  HITBOX: {
    WIDTH: 18,
    HEIGHT: 14,
    OFFSET_X: 7,
    OFFSET_Y: 18
  },
  NETWORK: {
    // Tự động nhận URL backend Socket.io
    SERVER_URL: import.meta.env.VITE_SOCKET_URL || (
      typeof window !== 'undefined' && window.location.port === '3000'
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
    ),
    TICK_RATE: 30, // 30 FPS sync
    TICK_INTERVAL_MS: 1000 / 30, // ~33.3ms
    LERP_FACTOR: 0.25,
    MAX_SNAP_DISTANCE: 120 // Nếu độ lệch quá lớn (>120px) thì teleport thay vì lerp
  }
};
