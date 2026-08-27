import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Hiển thị loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2, 'Đang tải Dever Town...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#60a5fa'
    }).setOrigin(0.5, 0.5);

    // Tự động sinh Texture & Spritesheet trên Canvas trong bộ nhớ
    TextureGenerator.generateTileset(this, 'town_tileset');
    TextureGenerator.generateCharacterSpritesheet(this, 'player_sprites');
  }

  create() {
    // Chuyển ngay sang WorldScene sau khi khởi tạo tài nguyên hoàn tất
    this.scene.start('WorldScene');
  }
}
