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
};
