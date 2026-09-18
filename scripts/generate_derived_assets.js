import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ASSETS_DIR = '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters';
const NPCS_DIR = path.join(ASSETS_DIR, 'npcs');
const OUTFITS_DIR = path.join(ASSETS_DIR, 'outfits');
const SPECIAL_DIR = path.join(ASSETS_DIR, 'special_outfits');
const HAIR_DIR = path.join(ASSETS_DIR, 'hair');
const ACC_DIR = path.join(ASSETS_DIR, 'accessories');

fs.mkdirSync(HAIR_DIR, { recursive: true });
fs.mkdirSync(ACC_DIR, { recursive: true });

function readPng(p) {
  return PNG.sync.read(fs.readFileSync(p));
}
function writePng(p, png) {
  fs.writeFileSync(p, PNG.sync.write(png));
  console.log(`[SAVED] ${p} (${png.width}x${png.height})`);
}
function clonePng(src) {
  const c = new PNG({ width: src.width, height: src.height });
  src.data.copy(c.data);
  return c;
}

// 1. Tạo full_polo_dever.png (Chủ nhiệm mặc polo xanh FU-DEVER)
const chunhiem = readPng(path.join(NPCS_DIR, 'npc_chunhiem_nhat.png'));
writePng(path.join(OUTFITS_DIR, 'full_polo_dever.png'), clonePng(chunhiem));

// 2. Tạo full_polo_fuda.png (Chuyển polo xanh thành Polo Cam FPT)
const poloFuda = clonePng(chunhiem);
for (let i = 0; i < poloFuda.data.length; i += 4) {
  const r = poloFuda.data[i];
  const g = poloFuda.data[i + 1];
  const b = poloFuda.data[i + 2];
  const a = poloFuda.data[i + 3];
  if (a > 0) {
    // Detect blue polo colors: b is noticeably higher than r & g
    if (b > r + 30 && b > g + 10) {
      const brightness = (r + g + b) / 3 / 255;
      // FPT Orange palette: shadow #c2410c, base #ea580c, highlight #fb923c
      poloFuda.data[i] = Math.min(255, Math.round(234 * (0.6 + brightness * 0.5)));
      poloFuda.data[i + 1] = Math.min(255, Math.round(88 * (0.6 + brightness * 0.6)));
      poloFuda.data[i + 2] = Math.min(255, Math.round(12 * (0.6 + brightness * 0.5)));
    }
  }
}
writePng(path.join(OUTFITS_DIR, 'full_polo_fuda.png'), poloFuda);

// 3. Tạo full_aodai_fuda.png (Áo dài cam FPTU từ aodai_white)
const aodaiWhite = readPng(path.join(OUTFITS_DIR, 'full_aodai_white.png'));
const aodaiFuda = clonePng(aodaiWhite);
for (let i = 0; i < aodaiFuda.data.length; i += 4) {
  const r = aodaiFuda.data[i];
  const g = aodaiFuda.data[i + 1];
  const b = aodaiFuda.data[i + 2];
  const a = aodaiFuda.data[i + 3];
  if (a > 0) {
    // Detect white/light cyan fabric (high brightness, r,g,b all > 170)
    // Avoid hair (dark) and skin
    const isSkin = (r > 200 && g > 140 && b > 110 && r > g && g > b);
    const isHair = (r < 60 && g < 60 && b < 70);
    if (!isSkin && !isHair && r > 150 && g > 170 && b > 180) {
      const lum = (r + g + b) / 3 / 255;
      aodaiFuda.data[i] = Math.min(255, Math.round(242 * (0.7 + lum * 0.4)));
      aodaiFuda.data[i + 1] = Math.min(255, Math.round(111 * (0.7 + lum * 0.5)));
      aodaiFuda.data[i + 2] = Math.min(255, Math.round(33 * (0.7 + lum * 0.5)));
    }
  }
}
writePng(path.join(OUTFITS_DIR, 'full_aodai_fuda.png'), aodaiFuda);

// 4. Tạo full_suit_formal.png (Vest đen lịch sự từ Tuấn Kiệt)
const kiet = readPng(path.join(NPCS_DIR, 'npc_hocthu_kiet.png'));
const suitFormal = clonePng(kiet);
for (let i = 0; i < suitFormal.data.length; i += 4) {
  const r = suitFormal.data[i];
  const g = suitFormal.data[i + 1];
  const b = suitFormal.data[i + 2];
  const a = suitFormal.data[i + 3];
  if (a > 0) {
    // Detect purple suit: r and b are high, g is lower
    if (r > g + 15 && b > g + 20 && r > 70 && b > 80) {
      const lum = (r + g + b) / 3 / 255;
      // Charcoal black suit
      const darkVal = Math.round(25 + lum * 45);
      suitFormal.data[i] = darkVal;
      suitFormal.data[i + 1] = darkVal + 2;
      suitFormal.data[i + 2] = darkVal + 5;
    }
  }
}
writePng(path.join(OUTFITS_DIR, 'full_suit_formal.png'), suitFormal);

// 5. Thêm các full outfit khác từ NPC đã duyệt
writePng(path.join(OUTFITS_DIR, 'full_hoodie_gaming.png'), clonePng(readPng(path.join(NPCS_DIR, 'npc_game_lead_thanh.png'))));
writePng(path.join(OUTFITS_DIR, 'full_jersey_sport.png'), clonePng(readPng(path.join(NPCS_DIR, 'npc_sukien_thang.png'))));
writePng(path.join(OUTFITS_DIR, 'full_hoodie_terminal.png'), clonePng(readPng(path.join(NPCS_DIR, 'npc_backend_khoa.png'))));
writePng(path.join(OUTFITS_DIR, 'full_apron_barista.png'), clonePng(readPng(path.join(NPCS_DIR, 'npc_barista_an.png'))));

// 6. Tạo 3 Special Outfits dựa trên các sprite đã duyệt để bù cho 3 file bị xóa:
// 6A. special_vovinam_suit.png: Từ sukien_thang (jersey) đổi thành võ phục Vovinam xanh dương + đai vàng
const vovinam = clonePng(readPng(path.join(NPCS_DIR, 'npc_sukien_thang.png')));
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    // Đai vàng ở eo (y: 43-45)
    for (let dy = 43; dy <= 45; dy++) {
      for (let dx = 16; dx <= 32; dx++) {
        const idx = ((oy + dy) * 192 + (ox + dx)) * 4;
        if (vovinam.data[idx + 3] > 0) {
          // Yellow belt #facc15
          vovinam.data[idx] = 250;
          vovinam.data[idx + 1] = 204;
          vovinam.data[idx + 2] = 21;
        }
      }
    }
  }
}
writePng(path.join(SPECIAL_DIR, 'special_vovinam_suit.png'), vovinam);

// 6B. special_wizard_robe.png: Từ Kiệt (suit tím) thêm hiệu ứng viền vàng huyền bí
const wizard = clonePng(kiet);
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    // Điểm nhấn vàng ma thuật ở cổ áo và vai
    for (let dy = 32; dy <= 34; dy++) {
      for (let dx = 18; dx <= 30; dx++) {
        const idx = ((oy + dy) * 192 + (ox + dx)) * 4;
        if (wizard.data[idx + 3] > 0) {
          wizard.data[idx] = 251;
          wizard.data[idx + 1] = 191;
          wizard.data[idx + 2] = 36;
        }
      }
    }
  }
}
writePng(path.join(SPECIAL_DIR, 'special_wizard_robe.png'), wizard);

// 6C. special_leather_biker.png: Từ media_hai đổi sang áo khoác da biker đen bóng
const biker = clonePng(readPng(path.join(NPCS_DIR, 'npc_media_hai.png')));
for (let i = 0; i < biker.data.length; i += 4) {
  const r = biker.data[i];
  const g = biker.data[i + 1];
  const b = biker.data[i + 2];
  const a = biker.data[i + 3];
  if (a > 0) {
    // Polo dark blue to leather black with silver studs
    if (r < 70 && g < 70 && b < 100 && (r + g + b) > 60) {
      biker.data[i] = 20;
      biker.data[i + 1] = 20;
      biker.data[i + 2] = 25;
    }
  }
}
writePng(path.join(SPECIAL_DIR, 'special_leather_biker.png'), biker);

console.log('--- ALL DERIVED OUTFITS CREATED SUCCESSFULLY ---');
