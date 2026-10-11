// Client-side rendering performance tunables.
// Phase-0 audit follow-up: cull render work for RemotePlayers outside the camera view.
// IMPORTANT: this only affects rendering visibility. Network, interpolation and all
// state-update logic keep running untouched.

export const PERF_CONFIG = {
  /** Master switch for off-camera RemotePlayer render culling. */
  REMOTE_PLAYER_CULL_ENABLED: true,
  /**
   * Pixel margin added around the camera world view before a RemotePlayer is
   * hidden. Players drifting at the screen edge don't visibly pop in/out.
   */
  REMOTE_PLAYER_CULL_MARGIN: 64,

  /** Master switch for camera frustum culling of map tile sprites. */
  TILE_CULL_ENABLED: true,
  /**
   * Pixel margin added around the camera world view before a tile is hidden.
   * Tiles at the screen edge stay rendered so panning/zooming never shows
   * visible pop-in. Mirrors the RemotePlayer margin for consistent behavior.
   */
  TILE_CULL_MARGIN: 64,
  /**
   * Throttle interval (ms) between tile culling re-evaluations. The camera
   * moves continuously while following the player, so culling re-runs on this
   * cadence against camera.worldView (RESIZE-aware, dynamic viewport).
   */
  TILE_CULL_INTERVAL_MS: 200,
};
