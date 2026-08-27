import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { WorldScene } from './scenes/WorldScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.MAP_WIDTH,
  height: GAME_CONFIG.MAP_HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0f172a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false // Đặt true nếu muốn thấy khung hitbox xanh lá để debug
    }
  },
  scene: [BootScene, WorldScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(config);
  window.__DEVER_GAME__ = game; // Giúp QA Verifier và test scripts có thể truy cập
});
