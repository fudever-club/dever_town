import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { WelcomeGate, SettingsModal } from './ui/index.js';
import { TextureGenerator } from './utils/TextureGenerator.js';

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

function initGame() {
  if (window.__DEVER_INITIALIZED__) return;
  window.__DEVER_INITIALIZED__ = true;

  // 1. Khởi tạo Settings Modal toàn cục (cho cả Welcome Gate và trong Game)
  const settingsModal = new SettingsModal();
  window.__SETTINGS_MODAL__ = settingsModal;

  // 2. Khởi động Game Phaser ngay lập tức
  const game = new Phaser.Game(config);
  window.__DEVER_GAME__ = game;

  // 3. Khởi tạo Welcome Gate & Loading Overlay
  const welcomeGate = new WelcomeGate({
    onEnterGame: ({ user, isGuest }) => {
      const scene = game.scene.getScene('WorldScene');
      if (scene && scene.player) {
        scene.activatePlayerSession();
        let wardrobeConfig = user?.wardrobe_config || null;
        const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
        if (!wardrobeConfig && savedWardrobeRaw) {
          try {
            const parsed = JSON.parse(savedWardrobeRaw);
            if (parsed && typeof parsed === 'object') wardrobeConfig = parsed;
          } catch (e) {}
        } else if (wardrobeConfig && typeof wardrobeConfig === 'object') {
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
