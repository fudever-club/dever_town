import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ASSETS_DIR = '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters';
const NPCS_DIR = path.join(ASSETS_DIR, 'npcs');
const OUTFITS_DIR = path.join(ASSETS_DIR, 'outfits');
const HAIR_DIR = path.join(ASSETS_DIR, 'hair');
const ACC_DIR = path.join(ASSETS_DIR, 'accessories');

fs.mkdirSync(HAIR_DIR, { recursive: true });
fs.mkdirSync(ACC_DIR, { recursive: true });

function readPng(p) { return PNG.sync.read(fs.readFileSync(p)); }
function writePng(p, png) { fs.writeFileSync(p, PNG.sync.write(png)); console.log(`[HAIR/ACC SAVED] ${path.basename(p)}`); }

function extractHair(srcPng, hairColorCheck) {
  const out = new PNG({ width: 192, height: 256 });
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const ox = c * 48;
      const oy = r * 64;
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 48; x++) {
          const idx = ((oy + y) * 192 + (ox + x)) * 4;
          const a = srcPng.data[idx + 3];
          if (a === 0) continue;
          const red = srcPng.data[idx];
          const green = srcPng.data[idx + 1];
          const blue = srcPng.data[idx + 2];

          // Hair is in head zone y < 35
          if (y < 35) {
            if (hairColorCheck(red, green, blue, x, y, r)) {
              out.data[idx] = red;
              out.data[idx + 1] = green;
              out.data[idx + 2] = blue;
              out.data[idx + 3] = a;
            }
          }
        }
      }
    }
  }
  return out;
}

// 1. hair_pompadour_black (Chủ nhiệm)
const chunhiem = readPng(path.join(NPCS_DIR, 'npc_chunhiem_nhat.png'));
const hairPompadour = extractHair(chunhiem, (r, g, b, x, y, row) => {
  const isDark = (r < 70 && g < 70 && b < 85);
  return isDark && (y < 21 || (row === 3 && y < 30) || x < 14 || x > 34);
});
writePng(path.join(HAIR_DIR, 'hair_pompadour_black.png'), hairPompadour);

// 2. hair_messy_black (Phó Chủ nhiệm Hưng)
const hung = readPng(path.join(NPCS_DIR, 'npc_pho_hung.png'));
const hairMessy = extractHair(hung, (r, g, b, x, y, row) => {
  const isDark = (r < 75 && g < 75 && b < 90);
  return isDark && (y < 22 || (row === 3 && y < 30) || x < 14 || x > 34);
});
writePng(path.join(HAIR_DIR, 'hair_messy_black.png'), hairMessy);

// 3. hair_ponytail_brown (Barista An)
const an = readPng(path.join(NPCS_DIR, 'npc_barista_an.png'));
const hairPonytail = extractHair(an, (r, g, b, x, y, row) => {
  // Brown hair: r > 70, g between 40 and 110, b < 90
  const isBrown = (r > 60 && r < 140 && g > 35 && g < 100 && b < 80);
  return isBrown && (y < 35);
});
writePng(path.join(HAIR_DIR, 'hair_ponytail_brown.png'), hairPonytail);

// 4. hair_buzzcut_black (Sự kiện Thắng)
const thang = readPng(path.join(NPCS_DIR, 'npc_sukien_thang.png'));
const hairBuzzcut = extractHair(thang, (r, g, b, x, y, row) => {
  const isDark = (r < 70 && g < 70 && b < 80);
  return isDark && (y < 19 || (row === 3 && y < 27) || x < 15 || x > 33);
});
writePng(path.join(HAIR_DIR, 'hair_buzzcut_black.png'), hairBuzzcut);

// 5. hair_wolfcut_dark (Game lead Thành)
const thanh = readPng(path.join(NPCS_DIR, 'npc_game_lead_thanh.png'));
const hairWolfcut = extractHair(thanh, (r, g, b, x, y, row) => {
  const isDark = (r < 80 && g < 80 && b < 95);
  return isDark && (y < 23 || (row === 3 && y < 31) || x < 14 || x > 34);
});
writePng(path.join(HAIR_DIR, 'hair_wolfcut_dark.png'), hairWolfcut);

// 6. hair_twintails_black (Áo dài nữ)
const aodai = readPng(path.join(OUTFITS_DIR, 'full_aodai_white.png'));
const hairTwintails = extractHair(aodai, (r, g, b, x, y, row) => {
  const isDark = (r < 75 && g < 75 && b < 90);
  return isDark && y < 35;
});
writePng(path.join(HAIR_DIR, 'hair_twintails_black.png'), hairTwintails);

// --- PHỤ KIỆN (ACCESSORIES) ---
// 1. acc_glasses_dark (Chủ nhiệm Nhật)
const accGlassesDark = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 4; r++) {
  if (r === 3) continue; // Mặt sau không có kính
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    for (let y = 17; y <= 27; y++) {
      for (let x = 12; x <= 36; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const red = chunhiem.data[idx];
        const green = chunhiem.data[idx + 1];
        const blue = chunhiem.data[idx + 2];
        const a = chunhiem.data[idx + 3];
        // Glasses frames are dark pixels in eye zone
        if (a > 0 && red < 50 && green < 50 && blue < 60) {
          accGlassesDark.data[idx] = red;
          accGlassesDark.data[idx + 1] = green;
          accGlassesDark.data[idx + 2] = blue;
          accGlassesDark.data[idx + 3] = a;
        }
      }
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_glasses_dark.png'), accGlassesDark);

// 2. acc_headphones_rgb (Game lead Thành)
const accHeadphones = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    for (let y = 24; y <= 36; y++) {
      for (let x = 10; x <= 38; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const red = thanh.data[idx];
        const green = thanh.data[idx + 1];
        const blue = thanh.data[idx + 2];
        const a = thanh.data[idx + 3];
        // Detect RGB headphone accents (green/cyan/orange glow in neck zone)
        const isRgbGlow = (green > red + 30 && green > blue) || (blue > red + 25 && green > 100);
        const isDarkBand = (red < 50 && green < 50 && blue < 50 && y >= 25 && y <= 35 && (x < 17 || x > 31));
        if (a > 0 && (isRgbGlow || isDarkBand)) {
          accHeadphones.data[idx] = red;
          accHeadphones.data[idx + 1] = green;
          accHeadphones.data[idx + 2] = blue;
          accHeadphones.data[idx + 3] = a;
        }
      }
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_headphones_rgb.png'), accHeadphones);

console.log('--- ALL HAIR AND ACCESSORIES EXTRACTED ---');
