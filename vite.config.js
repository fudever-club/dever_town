import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
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
    assetsInlineLimit: 0
  }
});
