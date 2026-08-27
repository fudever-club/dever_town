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
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#60a5fa'
    }).setOrigin(0.5, 0.5);

    // 1. Sinh Tileset bản đồ
    TextureGenerator.generateTileset(this, 'town_tileset');

    // 2. Sinh toàn bộ 4 bộ Spritesheet Avatar Pixel Art
    TextureGenerator.generateAllAvatars(this);
  }

  create() {
    this.scene.start('WorldScene');
  }
}
