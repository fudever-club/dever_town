import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator.js';
import { generateEmoteIcons } from '../utils/emoteIcons.js';

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

    // 2. Preload toàn bộ Spritesheets & JSON Atlas Aseprite 2D Pixel 60FPS (8-Frame Walk & 4-Frame Breathing)
    const allAsepriteCharacters = [
      // 2A. Phôi thân cơ bản (Modular Bases)
      'char_base_male', 'char_base_female',

      // 2B. Bộ Trang phục Đời Thường & Sinh Viên FPTU (12 trang phục)
      'char_hoodie_fuda', 'char_polo_fuda', 'char_aodai_white', 'char_aodai_fuda',
      'char_hoodie_dever', 'char_polo_dever', 'char_suit_formal', 'char_jersey_sport',
      'char_hoodie_gaming', 'char_hoodie_terminal', 'char_apron_barista', 'char_tee_dev_black',

      // 2C. Bộ Trang Phục Đặc Biệt & Mascot (6 trang phục)
      'char_frog_mascot', 'char_buggy_mascot', 'char_mecha_suit', 'char_wizard_robe',
      'char_vovinam_suit', 'char_leather_biker',

      // 2D. Toàn bộ 11 NPC Ban Quản Trị & Cố Vấn CLB FU-DEVER
      'char_npc_chunhiem_nhat', 'char_npc_pho_hung', 'char_npc_thuky_anh', 'char_npc_barista_an',
      'char_npc_hocthu_kiet', 'char_npc_game_lead_thanh', 'char_npc_sukien_thang', 'char_npc_media_hai',
      'char_npc_historian_duc', 'char_npc_backend_khoa', 'char_npc_algo_truyen',

      // 2E. 6 Mẫu Gather.town v2 Polish
      'char_sample_dev_dever', 'char_sample_fptu_female', 'char_sample_cyber_hacker',
      'char_sample_wizard_sorceress', 'char_sample_biker_rocker', 'char_sample_barista_an',

      // 2F. 10 Mẫu Pro Aseprite Độc Quyền
      'char_dev_gen10', 'char_buggy_pro', 'char_frog_pro', 'char_vovinam_pro',
      'char_mecha_pro', 'char_wizard_pro', 'char_biker_pro', 'char_aodai_pro',
      'char_cyber_pro', 'char_barista_pro'
    ];

    allAsepriteCharacters.forEach(key => {
      this.load.aseprite(key, `assets/characters/aseprite/${key}.png`, `assets/characters/aseprite/${key}.json`);
    });

    // 2G. Ảnh Chân Dung Chất Lượng Cao cho 11 NPC (Bust Portraits)
    const npcsList = [
      'npc_chunhiem_nhat', 'npc_pho_hung', 'npc_thuky_anh', 'npc_barista_an',
      'npc_hocthu_kiet', 'npc_game_lead_thanh', 'npc_sukien_thang', 'npc_media_hai',
      'npc_historian_duc', 'npc_backend_khoa', 'npc_algo_truyen'
    ];
    npcsList.forEach(id => {
      this.load.image(`portrait_${id}`, `assets/characters/portraits/${id}.png?v=0.4.2`);
    });

    // 3. Sinh các bộ Spritesheet Avatar Pixel Art cũ làm fallback
    TextureGenerator.generateAllCharacterSpritesheets(this);

  }

  create() {
    // Overlay cánh tay cho emote body-animation (wave / power / dance)
    TextureGenerator.generateEmoteOverlays(this);
    TextureGenerator.generateItemIcons(this);
    TextureGenerator.generateBadgeIcons(this);
    generateEmoteIcons(this);

    // Đăng ký chuỗi hoạt ảnh (animations) cho toàn bộ spritesheet Gather.town mới
    const newAvatars = [
      // Bases
      'base_male', 'base_female',
      // Standard & Extended Outfits
      'hoodie_fuda', 'aodai_white', 'hoodie_dever', 'tee_dev_black',
      'polo_dever', 'polo_fuda', 'aodai_fuda', 'suit_formal',
      'hoodie_gaming', 'jersey_sport', 'hoodie_terminal', 'apron_barista',
      // Special Outfits
      'frog_mascot', 'buggy_mascot', 'mecha_suit', 'wizard_robe', 'vovinam_suit', 'leather_biker',
      // 11 NPCs CLB
      'npc_chunhiem_nhat', 'npc_pho_hung', 'npc_thuky_anh', 'npc_barista_an', 'npc_hocthu_kiet',
      'npc_game_lead_thanh', 'npc_sukien_thang', 'npc_media_hai',
      'npc_historian_duc', 'npc_backend_khoa', 'npc_algo_truyen',
      // 6 Mẫu Mới Gather.town v2 Polish
      'sample_dev_dever', 'sample_fptu_female', 'sample_cyber_hacker',
      'sample_wizard_sorceress', 'sample_biker_rocker', 'sample_barista_an',
      // Aseprite 2D Pixel 60FPS (10 Nhân vật)
      'dev_gen10', 'buggy_pro', 'frog_pro', 'vovinam_pro',
      'mecha_pro', 'wizard_pro', 'biker_pro', 'aodai_pro',
      'cyber_pro', 'barista_pro'
    ];
    newAvatars.forEach(id => {
      TextureGenerator.createCharacterAnimations(this, id);
    });

    // Tự động sinh sẵn bộ Spritesheet tùy chỉnh custom_wardrobe ngay tại BootScene khi toàn bộ spritesheet gốc đã nạp xong
    const savedWardrobeRaw = localStorage.getItem('dever_wardrobe_config');
    if (savedWardrobeRaw) {
      try {
        const wardrobeConfig = JSON.parse(savedWardrobeRaw);
        if (wardrobeConfig && typeof wardrobeConfig === 'object') {
          TextureGenerator.generateCustomAvatar(this, wardrobeConfig, 'char_custom_wardrobe');
        }
      } catch (e) {}
    }

    this.scene.start('WorldScene');
  }
}
