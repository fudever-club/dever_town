import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { WelcomeGate } from './ui/WelcomeGate.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#070a12',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, WorldScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

window.addEventListener('DOMContentLoaded', () => {
  let game = null;

  // Khởi tạo Welcome Gate & Loading transition
  const welcomeGate = new WelcomeGate({
    onEnterGame: ({ user, isGuest }) => {
      if (!game) {
        game = new Phaser.Game(config);
        window.__DEVER_GAME__ = game;
      }
    }
  });

  window.__WELCOME_GATE__ = welcomeGate;
});
