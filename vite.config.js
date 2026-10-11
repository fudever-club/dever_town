import { defineConfig } from 'vite';

export default defineConfig({
  // base tương đối: asset URL dạng ./assets/... để app chạy được cả dưới
  // file:// (Electron loadFile) lẫn khi serve từ root (Vercel).
  base: './',
  server: {
    port: 3030,
    open: false,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/*.md', '**/.git/**', '**/server/data/**']
    }
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          socket: ['socket.io-client']
        }
      }
    },
    chunkSizeWarningLimit: 1600
  }
});
