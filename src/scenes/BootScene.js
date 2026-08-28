import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 2, 'Đang tải Dever Town...', {
      fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
      fontSize: '16px',
      color: '#60a5fa'
    }).setOrigin(0.5, 0.5);

    // 1. Sinh Tileset bản đồ (19 tiles)
    TextureGenerator.generateTileset(this);

    // 2. Sinh toàn bộ 4 bộ Spritesheet Avatar Pixel Art
    TextureGenerator.generateAllCharacterSpritesheets(this);

    // 3. Tự động sinh sẵn bộ Spritesheet tùy chỉnh custom_wardrobe ngay tại BootScene nếu có lưu trong storage
    const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
    if (savedWardrobeRaw) {
      try {
        const wardrobeConfig = JSON.parse(savedWardrobeRaw);
        // Bảo vệ null (JSON.stringify(null) = "null" là truthy string nhưng parse ra null)
        if (wardrobeConfig && typeof wardrobeConfig === 'object') {
          TextureGenerator.generateCustomAvatar(this, wardrobeConfig, 'char_custom_wardrobe');
        }
      } catch (e) {}
    }
  }

  create() {
    this.scene.start('WorldScene');
  }
}
