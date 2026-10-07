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
  // DEAD CONFIG - DO NOT "FIX": Phaser 3.90 IGNORES the top-level `resolution`
  // GameConfig property (verified: game.config.resolution === undefined at boot;
  // the string "resolution" never appears in Phaser's config handling code).
  // Canvas backing store is therefore FIXED at 800x600 and CSS-upscaled by
  // Phaser.Scale.FIT. This accident is what keeps fill-rate low on phones.
  // Removing the line changes nothing; RAISING resolution (e.g. a "DPR
  // sharpness fix") would multiply the fill cost up to 4x on DPR-2 devices.
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  render: {
    antialias: false,
    roundPixels: true,
    pixelArt: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, WorldScene],
  scale: {
    // RESIZE: canvas lấp đầy #game-container (kích thước game = kích thước
    // container, cập nhật theo mọi thay đổi viewport). Camera viewport tự mở
    // rộng theo; WorldScene.updateCameraBounds() mở rộng camera bounds tương
    // ứng để player luôn ở giữa và vùng thế giới hiển thị tăng theo màn hình
    // (không chỉ phóng to điểm ảnh). autoCenter vô tác dụng ở chế độ RESIZE.
    mode: Phaser.Scale.RESIZE
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

        const charId = wardrobeConfig?.characterId || wardrobeConfig?.outfitId || user?.avatar_id || 'hoodie_dever';
        const avatarId = wardrobeConfig ? (wardrobeConfig.inHandItem && wardrobeConfig.inHandItem !== 'none' ? 'custom_wardrobe' : charId) : (user?.avatar_id || user?.avatarId || 'hoodie_dever');

        scene.player.updateProfile({
          name: user.display_name || user.displayName,
          avatarId: avatarId,
          role: user.role || (isGuest ? 'guest' : 'dev'),
          wardrobeConfig: wardrobeConfig
        });

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
