import fs from 'fs';
import path from 'path';
import { processSpritesheet } from './process_spritesheet.js';

const BRAIN = '/home/acc3/.gemini/antigravity-cli/brain/c13aa1c5-3692-40a6-adb7-e7f2f3692134';
const NPCS_DIR = '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/npcs';
const SPECIAL_DIR = '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters/special_outfits';

const npcs = [
  { raw: 'npc_barista_an_1789710808800.jpg', out: 'npc_barista_an.png' },
  { raw: 'npc_hocthu_kiet_1789710823688.jpg', out: 'npc_hocthu_kiet.png' },
  { raw: 'npc_game_lead_thanh_1789710835426.jpg', out: 'npc_game_lead_thanh.png' },
  { raw: 'npc_sukien_thang_1789710848034.jpg', out: 'npc_sukien_thang.png' },
  { raw: 'npc_media_hai_1789710878367.jpg', out: 'npc_media_hai.png' },
  { raw: 'npc_historian_duc_1789710890695.jpg', out: 'npc_historian_duc.png' },
  { raw: 'npc_backend_khoa_1789710905734.jpg', out: 'npc_backend_khoa.png' },
  { raw: 'npc_algo_truyen_1789710929807.jpg', out: 'npc_algo_truyen.png' },
];

const specials = [
  { raw: 'special_frog_mascot_1789711386398.jpg', out: 'special_frog_mascot.png' },
  { raw: 'special_mecha_suit_1789711399449.jpg', out: 'special_mecha_suit.png' },
];

console.log('--- Processing NPCs ---');
for (const item of npcs) {
  const inPath = path.join(BRAIN, item.raw);
  const outPath = path.join(NPCS_DIR, item.out);
  if (fs.existsSync(inPath)) {
    processSpritesheet(inPath, outPath, 60);
  } else {
    console.warn(`File not found: ${inPath}`);
  }
}

console.log('--- Processing Special Outfits ---');
for (const item of specials) {
  const inPath = path.join(BRAIN, item.raw);
  const outPath = path.join(SPECIAL_DIR, item.out);
  if (fs.existsSync(inPath)) {
    processSpritesheet(inPath, outPath, 60);
  } else {
    console.warn(`File not found: ${inPath}`);
  }
}

// Clean up temporary test file
const testClean = path.join(NPCS_DIR, 'npc_barista_an_clean.png');
if (fs.existsSync(testClean)) fs.unlinkSync(testClean);

console.log('--- DONE BATCH PROCESSING ---');
