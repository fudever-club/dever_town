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
  // 1. Khởi động Game Phaser ngay lập tức
  const game = new Phaser.Game(config);
  window.__DEVER_GAME__ = game;

  // 2. Khởi tạo Welcome Gate & Loading Overlay
  const welcomeGate = new WelcomeGate({
    onEnterGame: ({ user, isGuest }) => {
      const scene = game.scene.getScene('WorldScene');
      if (scene && scene.player) {
        scene.player.updateProfile({
          name: user.display_name || user.displayName,
          avatarId: user.avatar_id || user.avatarId || 'dev_hoodie',
          role: user.role || (isGuest ? 'guest' : 'dev')
        });
        scene.updateHeaderProfile(user);
        if (scene.socketManager) {
          scene.socketManager.reconnectWithAuth();
        }
      }
    }
  });

  window.__WELCOME_GATE__ = welcomeGate;
});
