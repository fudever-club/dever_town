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
  }
};
