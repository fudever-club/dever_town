/**
 * DEVER TOWN - ASEPRITE 2D PIXEL PIPELINE VERIFICATION SUITE
 * Kiểm định toàn diện bộ asset và cơ chế diễn hoạt nhân vật Aseprite 60FPS:
 * 1. File PNG Spritesheet và JSON Atlas tồn tại, đúng định dạng và kích thước chuẩn (384x448 px, 54 frames).
 * 2. 9 Animation Tags chuẩn Aseprite (idle 4 hướng, walk 8 frames 4 hướng, cheer 6 frames).
 * 3. TextureGenerator.createAnimationsFromAseprite đăng ký chính xác hoạt ảnh vào Phaser Scene.
 * 4. Tương thích hoạt ảnh idle_breathe cho Player.js và đồng bộ danh mục Tủ Đồ.
 */

import fs from 'fs';
import path from 'path';
import { TextureGenerator } from '../src/utils/TextureGenerator.js';
import { CHARACTER_PRESETS } from '../src/config/wardrobe.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

console.log('--- BẮT ĐẦU KIỂM THỬ ASEPRITE 2D PIXEL ART & ANIMATION PIPELINE ---');

// 1. Kiểm tra toàn bộ 47 file asset PNG và JSON Aseprite tồn tại
const asepriteIds = [
  // 10 Pro Nhân vật Đặc quyền
  'char_dev_gen10', 'char_buggy_pro', 'char_frog_pro', 'char_vovinam_pro',
  'char_mecha_pro', 'char_wizard_pro', 'char_biker_pro', 'char_aodai_pro',
  'char_cyber_pro', 'char_barista_pro',
  // 11 NPCs trong trường và quán Cóc
  'char_npc_chunhiem_nhat', 'char_npc_pho_hung', 'char_npc_thuky_anh', 'char_npc_barista_an',
  'char_npc_hocthu_kiet', 'char_npc_game_lead_thanh', 'char_npc_sukien_thang', 'char_npc_media_hai',
  'char_npc_historian_duc', 'char_npc_backend_khoa', 'char_npc_algo_truyen',
  // 12 Trang phục Sinh viên FPTU & Dev
  'char_hoodie_fuda', 'char_polo_fuda', 'char_aodai_white', 'char_aodai_fuda',
  'char_hoodie_dever', 'char_polo_dever', 'char_suit_formal', 'char_jersey_sport',
  'char_hoodie_gaming', 'char_hoodie_terminal', 'char_apron_barista', 'char_tee_dev_black',
  // 6 Trang phục Đặc biệt / Cosplay
  'char_frog_mascot', 'char_buggy_mascot', 'char_mecha_suit', 'char_wizard_robe',
  'char_vovinam_suit', 'char_leather_biker',
  // 2 Nhân vật Gốc (Bases)
  'char_base_male', 'char_base_female',
  // 6 Mẫu Thế hệ V2
  'char_sample_dev_dever', 'char_sample_fptu_female', 'char_sample_cyber_hacker',
  'char_sample_wizard_sorceress', 'char_sample_biker_rocker', 'char_sample_barista_an'
];

asepriteIds.forEach(id => {
  const pngPath = path.resolve(`public/assets/characters/aseprite/${id}.png`);
  const jsonPath = path.resolve(`public/assets/characters/aseprite/${id}.json`);
  assert(fs.existsSync(pngPath), `File ${id}.png tồn tại`);
  assert(fs.existsSync(jsonPath), `File ${id}.json tồn tại`);
});

// 2. Kiểm tra cấu trúc JSON Atlas Aseprite mẫu
const devJsonPath = path.resolve('public/assets/characters/aseprite/char_dev_gen10.json');
const devJson = JSON.parse(fs.readFileSync(devJsonPath, 'utf-8'));
assert(devJson.meta && devJson.meta.app.includes('aseprite'), 'Metadata định danh chuẩn Aseprite');
assert(devJson.meta.size.w === 384 && devJson.meta.size.h === 448, 'Kích thước sheet chuẩn 384x448 px');
assert(devJson.meta.frameTags && devJson.meta.frameTags.length === 9, 'Đầy đủ 9 Animation Tags Aseprite');

const tagNames = devJson.meta.frameTags.map(t => t.name);
const expectedTags = [
  'idle_down', 'idle_up', 'idle_left', 'idle_right',
  'walk_down', 'walk_left', 'walk_right', 'walk_up', 'cheer'
];
expectedTags.forEach(tag => {
  assert(tagNames.includes(tag), `Chứa animation tag: ${tag}`);
});

const frameKeys = Object.keys(devJson.frames);
assert(frameKeys.length === 54, `Tổng cộng đúng 54 frames diễn hoạt (thực tế: ${frameKeys.length})`);

// Kiểm tra chi tiết 8 frames cho walk_down
const walkDownTag = devJson.meta.frameTags.find(t => t.name === 'walk_down');
assert(walkDownTag && (walkDownTag.to - walkDownTag.from + 1) === 8, 'walk_down có chu kỳ 8-frame walk cycle');

// Kiểm tra 4 frames cho idle_down
const idleDownTag = devJson.meta.frameTags.find(t => t.name === 'idle_down');
assert(idleDownTag && (idleDownTag.to - idleDownTag.from + 1) === 4, 'idle_down có chu kỳ 4-frame breathing');

// 3. Kiểm tra TextureGenerator.createAnimationsFromAseprite
const createdAnims = new Map();
const mockScene = {
  anims: {
    exists: (k) => createdAnims.has(k),
    remove: (k) => createdAnims.delete(k),
    create: (config) => {
      createdAnims.set(config.key, config);
      return config;
    }
  },
  cache: {
    json: {
      get: (k) => (k === 'char_dev_gen10' ? devJson : null)
    }
  }
};

TextureGenerator.createAnimationsFromAseprite(mockScene, 'dev_gen10', devJson);

assert(createdAnims.has('walk_down_dev_gen10'), 'Đăng ký thành công walk_down_dev_gen10');
const walkAnim = createdAnims.get('walk_down_dev_gen10');
assert(walkAnim.frames.length === 8, 'Hoạt ảnh bước đi chứa đủ 8 frames');
assert(walkAnim.frameRate === 12, 'Tốc độ diễn hoạt bước đi 12 FPS chuẩn mượt 60 FPS');

assert(createdAnims.has('idle_down_dev_gen10'), 'Đăng ký thành công idle_down_dev_gen10');
const idleAnim = createdAnims.get('idle_down_dev_gen10');
assert(idleAnim.frames.length === 4, 'Hoạt ảnh đứng yên chứa đủ 4 frames thở & chớp mắt');

assert(createdAnims.has('idle_breathe_down_dev_gen10'), 'Đăng ký tương thích ngược idle_breathe_down_dev_gen10 cho Player.js');
assert(createdAnims.has('cheer_dev_gen10'), 'Đăng ký thành công cheer_dev_gen10 (ăn mừng/emote)');
const cheerAnim = createdAnims.get('cheer_dev_gen10');
assert(cheerAnim.frames.length === 6, 'Hoạt ảnh cheer chứa đủ 6 frames');

// 4. Kiểm tra danh mục Tủ Đồ (wardrobe.js) cho cả 10 nhân vật Aseprite
const wardrobeIds = [
  'dev_gen10', 'buggy_pro', 'frog_pro', 'vovinam_pro',
  'mecha_pro', 'wizard_pro', 'biker_pro', 'aodai_pro',
  'cyber_pro', 'barista_pro'
];

wardrobeIds.forEach(id => {
  const preset = CHARACTER_PRESETS.find(p => p.id === id);
  assert(preset !== undefined, `${id} có mặt trong CHARACTER_PRESETS`);
  assert(preset && preset.spriteKey === `char_${id}`, `${id} trỏ đúng spriteKey char_${id}`);
  assert(preset && preset.tags.includes('Aseprite 60FPS'), `${id} có tag chuẩn 'Aseprite 60FPS'`);
});

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);
