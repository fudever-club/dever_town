// Capacitor config for DEVER TOWN (Phaser 3 + Socket.io + Vite).
// NOTE: webDir 'dist' is the Vite build output — always run `npm run build`
// then `npx cap sync` before opening in Android Studio.
// Docs: https://capacitorjs.com/docs/config
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'club.fudever.devertown',
  appName: 'DEVER TOWN',
  webDir: 'dist',
  // Match the game's canvas background so the WebView never flashes white
  // during load/room transitions (see src/main.js backgroundColor).
  backgroundColor: '#070a12',
  android: {
    // Keep the WebView background in sync with the game canvas.
    backgroundColor: '#070a12',
    // Phaser renders the full viewport; avoid automatic overscroll glow.
    allowMixedContent: false,
  },
  plugins: {
    // Phaser game UI must stay pixel-aligned with the canvas.
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
};

export default config;
