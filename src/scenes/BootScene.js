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

    // 2. Preload bộ Spritesheet Chibi Gather.town mới (48x64 px frames)
    // 2A. Phôi thân cơ bản (Modular Bases)
    this.load.spritesheet('char_base_male', 'assets/characters/bases/base_male.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_base_female', 'assets/characters/bases/base_female.png', { frameWidth: 48, frameHeight: 64 });

    // 2B. Bộ Trang phục Đời Thường (Standard & Extended Outfits)
    this.load.spritesheet('char_hoodie_fuda', 'assets/characters/outfits/full_hoodie_fuda.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_aodai_white', 'assets/characters/outfits/full_aodai_white.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_hoodie_dever', 'assets/characters/outfits/full_hoodie_dever.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_tee_dev_black', 'assets/characters/outfits/full_tee_dev_black.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_polo_dever', 'assets/characters/outfits/full_polo_dever.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_polo_fuda', 'assets/characters/outfits/full_polo_fuda.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_aodai_fuda', 'assets/characters/outfits/full_aodai_fuda.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_suit_formal', 'assets/characters/outfits/full_suit_formal.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_hoodie_gaming', 'assets/characters/outfits/full_hoodie_gaming.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_jersey_sport', 'assets/characters/outfits/full_jersey_sport.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_hoodie_terminal', 'assets/characters/outfits/full_hoodie_terminal.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_apron_barista', 'assets/characters/outfits/full_apron_barista.png', { frameWidth: 48, frameHeight: 64 });

    // 2C. Bộ Trang Phục Đặc Biệt (Special Outfits)
    this.load.spritesheet('char_frog_mascot', 'assets/characters/special_outfits/special_frog_mascot.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_buggy_mascot', 'assets/characters/special_outfits/special_buggy_mascot.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_mecha_suit', 'assets/characters/special_outfits/special_mecha_suit.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_wizard_robe', 'assets/characters/special_outfits/special_wizard_robe.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_vovinam_suit', 'assets/characters/special_outfits/special_vovinam_suit.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_leather_biker', 'assets/characters/special_outfits/special_leather_biker.png', { frameWidth: 48, frameHeight: 64 });

    // 2D. Toàn bộ 11 NPC Ban Quản Trị & Cố Vấn CLB FU-DEVER
    this.load.spritesheet('char_npc_chunhiem_nhat', 'assets/characters/npcs/npc_chunhiem_nhat.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_pho_hung', 'assets/characters/npcs/npc_pho_hung.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_thuky_anh', 'assets/characters/npcs/npc_thuky_anh.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_barista_an', 'assets/characters/npcs/npc_barista_an.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_hocthu_kiet', 'assets/characters/npcs/npc_hocthu_kiet.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_game_lead_thanh', 'assets/characters/npcs/npc_game_lead_thanh.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_sukien_thang', 'assets/characters/npcs/npc_sukien_thang.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_media_hai', 'assets/characters/npcs/npc_media_hai.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_historian_duc', 'assets/characters/npcs/npc_historian_duc.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_backend_khoa', 'assets/characters/npcs/npc_backend_khoa.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_npc_algo_truyen', 'assets/characters/npcs/npc_algo_truyen.png', { frameWidth: 48, frameHeight: 64 });

    // 2E. 6 Mẫu Nhân Vật Gather.town Cải Tiến (Samples v2 Polish)
    this.load.spritesheet('char_sample_dev_dever', 'assets/characters/samples_v2/sample_dev_dever.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_sample_fptu_female', 'assets/characters/samples_v2/sample_fptu_female.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_sample_cyber_hacker', 'assets/characters/samples_v2/sample_cyber_hacker.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_sample_wizard_sorceress', 'assets/characters/samples_v2/sample_wizard_sorceress.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_sample_biker_rocker', 'assets/characters/samples_v2/sample_biker_rocker.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('char_sample_barista_an', 'assets/characters/samples_v2/sample_barista_an.png', { frameWidth: 48, frameHeight: 64 });

    // 2F. Ảnh Chân Dung Chất Lượng Cao cho 11 NPC (Bust Portraits)
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
      'sample_wizard_sorceress', 'sample_biker_rocker', 'sample_barista_an'
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
