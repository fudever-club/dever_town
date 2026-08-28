import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { WelcomeGate } from './ui/WelcomeGate.js';
import { TextureGenerator } from './utils/TextureGenerator.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#070a12',
  fps: {
    target: 60,
    min: 30,
    smoothStep: true,
    forceSetTimeOut: false
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
    powerPreference: 'high-performance',
    batchSize: 4096,
    desynchronized: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
      fps: 60,
      fixedStep: true
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
        let wardrobeConfig = user?.wardrobe_config || null;
        const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
        if (!wardrobeConfig && savedWardrobeRaw) {
          try { wardrobeConfig = JSON.parse(savedWardrobeRaw); } catch (e) {}
        } else if (wardrobeConfig) {
          try { localStorage.setItem('dever_wardrobe_config', JSON.stringify(wardrobeConfig)); } catch (e) {}
        }

        const avatarId = wardrobeConfig ? 'custom_wardrobe' : (user.avatar_id || user.avatarId || 'dev_hoodie');

        scene.player.updateProfile({
          name: user.display_name || user.displayName,
          avatarId: avatarId,
          role: user.role || (isGuest ? 'guest' : 'dev'),
          wardrobeConfig: wardrobeConfig
        });

        if (wardrobeConfig) {
          TextureGenerator.generateCustomAvatar(scene, wardrobeConfig, 'char_custom_wardrobe');
          scene.player.setCustomWardrobe('custom_wardrobe', wardrobeConfig);
        }

        const equippedItem = user.equipped_item_id || localStorage.getItem('dever_equipped_item');
        if (equippedItem && scene.player.setEquippedItem) {
          scene.player.setEquippedItem(equippedItem);
        }

        scene.updateHeaderProfile(user);
        if (scene.socketManager) {
          scene.socketManager.reconnectWithAuth();
        }
      }
    }
  });

  window.__WELCOME_GATE__ = welcomeGate;
});
