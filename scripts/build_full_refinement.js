import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ASSETS_DIR = '/mnt/d/THStudy/DeverClub/DEVER_TOWN/public/assets/characters';
const SPECIAL_DIR = path.join(ASSETS_DIR, 'special_outfits');
const NPCS_DIR = path.join(ASSETS_DIR, 'npcs');
const OUTFITS_DIR = path.join(ASSETS_DIR, 'outfits');
const BASES_DIR = path.join(ASSETS_DIR, 'bases');
const HAIR_DIR = path.join(ASSETS_DIR, 'hair');
const ACC_DIR = path.join(ASSETS_DIR, 'accessories');

function readPng(p) { return PNG.sync.read(fs.readFileSync(p)); }
function writePng(p, png) { fs.writeFileSync(p, PNG.sync.write(png)); console.log(`[DONE] ${path.basename(p)}`); }
function clonePng(src) { const c = new PNG({ width: src.width, height: src.height }); src.data.copy(c.data); return c; }

function setPixel(png, ox, oy, x, y, col, a = 255) {
  if (x < 0 || x >= 48 || y < 0 || y >= 64) return;
  const idx = ((oy + y) * 192 + (ox + x)) * 4;
  png.data[idx] = col[0];
  png.data[idx + 1] = col[1];
  png.data[idx + 2] = col[2];
  png.data[idx + 3] = a;
}

// ==========================================================================
// 1. REFINED VOVINAM VIỆT VÕ ĐẠO (special_vovinam_suit.png)
// ==========================================================================
console.log('--- 1. Refining Vovinam Uniform ---');
const thang = readPng(path.join(NPCS_DIR, 'npc_sukien_thang.png'));
const chunhiem = readPng(path.join(NPCS_DIR, 'npc_chunhiem_nhat.png'));
const vovinam = clonePng(thang);

for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    const isFront = (r === 0);
    const isSide  = (r === 1 || r === 2);

    // 1A. Chân quần dài Vovinam từ chunhiem (xanh lam võ phục)
    for (let y = 46; y < 64; y++) {
      for (let x = 0; x < 48; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const cA = chunhiem.data[idx + 3];
        if (cA > 50) {
          const cr = chunhiem.data[idx];
          const cg = chunhiem.data[idx + 1];
          const cb = chunhiem.data[idx + 2];
          if (y <= 58) {
            if (cr < 60 && cg < 60 && cb < 80) {
              const lum = (cr + cg + cb) / 3 / 60;
              vovinam.data[idx] = Math.round(2 + lum * 25);
              vovinam.data[idx + 1] = Math.round(85 + lum * 55);
              vovinam.data[idx + 2] = Math.round(160 + lum * 55);
              vovinam.data[idx + 3] = cA;
            }
          }
        } else {
          vovinam.data[idx + 3] = 0;
        }
      }
    }

    // 1B. Thân áo võ phục xanh lam nguyên khối (xóa sọc trắng)
    for (let y = 35; y <= 46; y++) {
      for (let x = 12; x <= 36; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const aVal = vovinam.data[idx + 3];
        if (aVal > 50) {
          const rV = vovinam.data[idx];
          const gV = vovinam.data[idx + 1];
          const bV = vovinam.data[idx + 2];
          if (rV > 150 && gV > 150 && bV > 150) {
            vovinam.data[idx] = 2;
            vovinam.data[idx + 1] = 132;
            vovinam.data[idx + 2] = 199;
          }
        }
      }
    }

    // 1C. Cổ chữ V vạt chéo + Phù hiệu hình khiên (chỉ mặt trước)
    if (isFront) {
      for (let cy = 35; cy <= 38; cy++) {
        const spread = (cy - 35);
        for (let cx = 24 - spread; cx <= 24 + spread; cx++) {
          const idx = ((oy + cy) * 192 + (ox + cx)) * 4;
          vovinam.data[idx] = 251; vovinam.data[idx + 1] = 191; vovinam.data[idx + 2] = 136;
        }
      }
      for (let vy = 36; vy <= 43; vy++) {
        const vx = Math.round(24 + (vy - 36) * 0.45);
        const idx = ((oy + vy) * 192 + (ox + vx)) * 4;
        vovinam.data[idx] = 7; vovinam.data[idx + 1] = 89; vovinam.data[idx + 2] = 133;
      }
      const p1 = ((oy + 38) * 192 + (ox + 19)) * 4;
      vovinam.data[p1] = 250; vovinam.data[p1+1] = 204; vovinam.data[p1+2] = 21;
      const p2 = ((oy + 39) * 192 + (ox + 18)) * 4;
      vovinam.data[p2] = 239; vovinam.data[p2+1] = 68; vovinam.data[p2+2] = 68;
      const p3 = ((oy + 39) * 192 + (ox + 19)) * 4;
      vovinam.data[p3] = 250; vovinam.data[p3+1] = 204; vovinam.data[p3+2] = 21;
      const p4 = ((oy + 40) * 192 + (ox + 19)) * 4;
      vovinam.data[p4] = 234; vovinam.data[p4+1] = 179; vovinam.data[p4+2] = 8;
    }

    // 1D. Đai vàng Hoàng Đai FPTU (Chỉ vẽ trên thân người, không đè lên tay)
    for (let by = 43; by <= 45; by++) {
      const minX = isSide ? 20 : 17;
      const maxX = isSide ? 28 : 31;
      for (let bx = minX; bx <= maxX; bx++) {
        const bIdx = ((oy + by) * 192 + (ox + bx)) * 4;
        const isArmSkin = (vovinam.data[bIdx] > 200 && vovinam.data[bIdx+1] > 140 && vovinam.data[bIdx+2] > 100);
        if (vovinam.data[bIdx + 3] > 50 && !isArmSkin) {
          const isShad = (by === 45);
          vovinam.data[bIdx] = isShad ? 180 : 250;
          vovinam.data[bIdx + 1] = isShad ? 83 : 204;
          vovinam.data[bIdx + 2] = isShad ? 9 : 21;
        }
      }
    }

    // 1E. Nút thắt đai & 2 dải đai buông thõng (Mặt trước)
    if (isFront) {
      const knotIdx = ((oy + 44) * 192 + (ox + 24)) * 4;
      vovinam.data[knotIdx] = 254; vovinam.data[knotIdx+1] = 240; vovinam.data[knotIdx+2] = 138;
      const knotIdx2 = ((oy + 45) * 192 + (ox + 24)) * 4;
      vovinam.data[knotIdx2] = 202; vovinam.data[knotIdx2+1] = 138; vovinam.data[knotIdx2+2] = 4;

      const sway = (c === 1) ? -1 : (c === 3 ? 1 : 0);
      for (let dy = 46; dy <= 52; dy++) {
        const lx = 23 + sway;
        const rx = 25 + sway;
        const lIdx = ((oy + dy) * 192 + (ox + lx)) * 4;
        vovinam.data[lIdx] = 250; vovinam.data[lIdx+1] = 204; vovinam.data[lIdx+2] = 21; vovinam.data[lIdx+3] = 255;
        const rIdx = ((oy + dy) * 192 + (ox + rx)) * 4;
        vovinam.data[rIdx] = (dy === 52) ? 180 : 234;
        vovinam.data[rIdx+1] = (dy === 52) ? 83 : 179;
        vovinam.data[rIdx+2] = (dy === 52) ? 9 : 8;
        vovinam.data[rIdx+3] = 255;
      }
    }
  }
}
writePng(path.join(SPECIAL_DIR, 'special_vovinam_suit.png'), vovinam);

// ==========================================================================
// 2. REFINED WIZARD ROBE (special_wizard_robe.png)
// ==========================================================================
console.log('--- 2. Refining Wizard Robe ---');
const aodai = readPng(path.join(OUTFITS_DIR, 'full_aodai_white.png'));
const wizard = clonePng(aodai);

for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    const isFront = (r === 0);

    for (let y = 35; y < 64; y++) {
      for (let x = 0; x < 48; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const a = wizard.data[idx + 3];
        if (a > 50) {
          const red = wizard.data[idx];
          const green = wizard.data[idx + 1];
          const blue = wizard.data[idx + 2];
          const isFabric = (red > 120 && green > 130 && blue > 150) || (red > 180 && green > 180);
          if (isFabric) {
            const lum = (red + green + blue) / 3 / 255;
            wizard.data[idx] = Math.round(59 + lum * 75);
            wizard.data[idx + 1] = Math.round(7 + lum * 35);
            wizard.data[idx + 2] = Math.round(100 + lum * 115);

            if (y >= 59) {
              wizard.data[idx] = 250;
              wizard.data[idx + 1] = 204;
              wizard.data[idx + 2] = 21;
            }
          }
        }
      }
    }

    // Nón chóp phù thủy
    for (let x = 8; x <= 40; x++) {
      const idx1 = ((oy + 18) * 192 + (ox + x)) * 4;
      wizard.data[idx1] = 46; wizard.data[idx1+1] = 16; wizard.data[idx1+2] = 101; wizard.data[idx1+3] = 255;
      const idx2 = ((oy + 19) * 192 + (ox + x)) * 4;
      wizard.data[idx2] = (x >= 12 && x <= 36) ? 88 : 46;
      wizard.data[idx2+1] = (x >= 12 && x <= 36) ? 28 : 16;
      wizard.data[idx2+2] = (x >= 12 && x <= 36) ? 135 : 101;
      wizard.data[idx2+3] = 255;
    }
    for (let x = 13; x <= 35; x++) {
      const bIdx = ((oy + 17) * 192 + (ox + x)) * 4;
      wizard.data[bIdx] = 250; wizard.data[bIdx+1] = 204; wizard.data[bIdx+2] = 21; wizard.data[bIdx+3] = 255;
    }
    for (let y = 16; y >= 3; y--) {
      const halfW = Math.max(1, Math.round((y - 3) * 0.7));
      const curve = Math.round((16 - y) * 0.25);
      const cx = 24 + curve;
      for (let x = cx - halfW; x <= cx + halfW; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const isEdge = (x === cx - halfW || x === cx + halfW || y === 3);
        wizard.data[idx] = isEdge ? 46 : (x < cx ? 88 : 126);
        wizard.data[idx+1] = isEdge ? 16 : (x < cx ? 28 : 34);
        wizard.data[idx+2] = isEdge ? 101 : (x < cx ? 135 : 206);
        wizard.data[idx+3] = 255;
      }
    }
    const sIdx = ((oy + 2) * 192 + (ox + 27)) * 4;
    wizard.data[sIdx] = 254; wizard.data[sIdx+1] = 240; wizard.data[sIdx+2] = 138; wizard.data[sIdx+3] = 255;

    if (isFront || r === 2) {
      for (let y = 30; y <= 60; y++) {
        const stIdx = ((oy + y) * 192 + (ox + 39)) * 4;
        wizard.data[stIdx] = 120; wizard.data[stIdx+1] = 53; wizard.data[stIdx+2] = 15; wizard.data[stIdx+3] = 255;
      }
      const orbIdx = ((oy + 28) * 192 + (ox + 39)) * 4;
      wizard.data[orbIdx] = 56; wizard.data[orbIdx+1] = 189; wizard.data[orbIdx+2] = 248; wizard.data[orbIdx+3] = 255;
      const orbCenter = ((oy + 29) * 192 + (ox + 39)) * 4;
      wizard.data[orbCenter] = 224; wizard.data[orbCenter+1] = 242; wizard.data[orbCenter+2] = 254; wizard.data[orbCenter+3] = 255;
    }
  }
}
writePng(path.join(SPECIAL_DIR, 'special_wizard_robe.png'), wizard);

// ==========================================================================
// 3. REFINED BIKER ROCKER LEATHER JACKET (special_leather_biker.png)
// ==========================================================================
console.log('--- 3. Refining Biker Leather Jacket ---');
const hai = readPng(path.join(NPCS_DIR, 'npc_media_hai.png'));
const bikerRefined = clonePng(hai);

for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    const isFront = (r === 0);

    for (let y = 35; y <= 47; y++) {
      for (let x = 11; x <= 37; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        if (bikerRefined.data[idx + 3] > 50) {
          const rV = bikerRefined.data[idx];
          const gV = bikerRefined.data[idx + 1];
          const bV = bikerRefined.data[idx + 2];
          if (rV < 80 && gV < 80 && bV < 110) {
            const isSheen = (y === 35 || y === 36 || x === 14 || x === 33);
            bikerRefined.data[idx] = isSheen ? 71 : 20;
            bikerRefined.data[idx + 1] = isSheen ? 85 : 24;
            bikerRefined.data[idx + 2] = isSheen ? 105 : 35;
          }
        }
      }
    }

    if (isFront) {
      const lapels = [
        [19, 36], [20, 36], [18, 37], [19, 37],
        [28, 36], [29, 36], [29, 37], [30, 37]
      ];
      lapels.forEach(([lx, ly]) => {
        const idx = ((oy + ly) * 192 + (ox + lx)) * 4;
        bikerRefined.data[idx] = 71; bikerRefined.data[idx+1] = 85; bikerRefined.data[idx+2] = 105;
      });

      const studs = [[16, 35], [32, 35], [18, 38], [30, 38]];
      studs.forEach(([sx, sy]) => {
        const idx = ((oy + sy) * 192 + (ox + sx)) * 4;
        bikerRefined.data[idx] = 241; bikerRefined.data[idx+1] = 245; bikerRefined.data[idx+2] = 249;
      });

      for (let y = 38; y <= 45; y++) {
        const zx = Math.round(27 - (y - 38) * 0.45);
        const idx = ((oy + y) * 192 + (ox + zx)) * 4;
        bikerRefined.data[idx] = 203; bikerRefined.data[idx+1] = 213; bikerRefined.data[idx+2] = 225;
      }

      const b1 = ((oy + 46) * 192 + (ox + 24)) * 4;
      bikerRefined.data[b1] = 226; bikerRefined.data[b1+1] = 232; bikerRefined.data[b1+2] = 240;
    }
  }
}
writePng(path.join(SPECIAL_DIR, 'special_leather_biker.png'), bikerRefined);

// ==========================================================================
// 4. EXTENDED HAIR LIBRARY WITH PALETTES
// ==========================================================================
console.log('--- 4. Generating Hair Library & Palette Variants ---');
const hairMessy = readPng(path.join(HAIR_DIR, 'hair_messy_black.png'));
const hairPonytail = readPng(path.join(HAIR_DIR, 'hair_ponytail_brown.png'));
const hairWolfcut = readPng(path.join(HAIR_DIR, 'hair_wolfcut_dark.png'));
const hairPompadour = readPng(path.join(HAIR_DIR, 'hair_pompadour_black.png'));
const hairTwintails = readPng(path.join(HAIR_DIR, 'hair_twintails_black.png'));

const PALETTES = {
  blonde: (r, g, b, lum) => [Math.round(210 + lum * 45), Math.round(160 + lum * 60), Math.round(20 + lum * 50)],
  silver: (r, g, b, lum) => [Math.round(180 + lum * 65), Math.round(190 + lum * 60), Math.round(210 + lum * 45)],
  cyan:   (r, g, b, lum) => [Math.round(2 + lum * 50), Math.round(140 + lum * 80), Math.round(200 + lum * 55)],
  red:    (r, g, b, lum) => [Math.round(185 + lum * 65), Math.round(25 + lum * 40), Math.round(35 + lum * 40)],
  purple: (r, g, b, lum) => [Math.round(160 + lum * 60), Math.round(80 + lum * 60), Math.round(220 + lum * 35)],
  brown:  (r, g, b, lum) => [Math.round(120 + lum * 50), Math.round(65 + lum * 40), Math.round(25 + lum * 25)],
};

function applyHairPalette(srcHair, paletteFn) {
  const out = clonePng(srcHair);
  for (let i = 0; i < out.data.length; i += 4) {
    const a = out.data[i + 3];
    if (a > 50) {
      const r = out.data[i];
      const g = out.data[i + 1];
      const b = out.data[i + 2];
      const lum = (r + g + b) / 3 / 255;
      const [newR, newG, newB] = paletteFn(r, g, b, lum);
      out.data[i] = newR;
      out.data[i + 1] = newG;
      out.data[i + 2] = newB;
    }
  }
  return out;
}

writePng(path.join(HAIR_DIR, 'hair_messy_blonde.png'), applyHairPalette(hairMessy, PALETTES.blonde));
writePng(path.join(HAIR_DIR, 'hair_messy_silver.png'), applyHairPalette(hairMessy, PALETTES.silver));
writePng(path.join(HAIR_DIR, 'hair_wolfcut_cyan.png'), applyHairPalette(hairWolfcut, PALETTES.cyan));
writePng(path.join(HAIR_DIR, 'hair_wolfcut_red.png'), applyHairPalette(hairWolfcut, PALETTES.red));
writePng(path.join(HAIR_DIR, 'hair_ponytail_purple.png'), applyHairPalette(hairPonytail, PALETTES.purple));
writePng(path.join(HAIR_DIR, 'hair_twintails_brown.png'), applyHairPalette(hairTwintails, PALETTES.brown));
writePng(path.join(HAIR_DIR, 'hair_pompadour_silver.png'), applyHairPalette(hairPompadour, PALETTES.silver));

// ==========================================================================
// 5. EXTENDED ACCESSORIES LIBRARY
// ==========================================================================
console.log('--- 5. Generating Extended Accessories ---');

// 5A. Kính râm đen
const sunglass = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    for (let y = 19; y <= 24; y++) {
      const minX = (r === 0) ? 17 : (r === 1 ? 14 : 28);
      const maxX = (r === 0) ? 31 : (r === 1 ? 20 : 34);
      for (let x = minX; x <= maxX; x++) {
        const idx = ((oy + y) * 192 + (ox + x)) * 4;
        const isRim = (y === 19 || y === 24 || x === minX || x === maxX);
        sunglass.data[idx] = isRim ? 15 : 30;
        sunglass.data[idx + 1] = isRim ? 23 : 41;
        sunglass.data[idx + 2] = isRim ? 42 : 59;
        sunglass.data[idx + 3] = 255;
      }
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_sunglasses_black.png'), sunglass);

// 5B. Kính tròn gọng vàng
const roundGold = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    if (r === 0) {
      for (let x = 18; x <= 22; x++) {
        setPixel(roundGold, ox, oy, x, 19, [250, 204, 21]);
        setPixel(roundGold, ox, oy, x, 24, [250, 204, 21]);
      }
      for (let y = 20; y <= 23; y++) {
        setPixel(roundGold, ox, oy, 17, y, [250, 204, 21]);
        setPixel(roundGold, ox, oy, 23, y, [250, 204, 21]);
      }
      for (let x = 27; x <= 31; x++) {
        setPixel(roundGold, ox, oy, x, 19, [250, 204, 21]);
        setPixel(roundGold, ox, oy, x, 24, [250, 204, 21]);
      }
      for (let y = 20; y <= 23; y++) {
        setPixel(roundGold, ox, oy, 26, y, [250, 204, 21]);
        setPixel(roundGold, ox, oy, 32, y, [250, 204, 21]);
      }
      setPixel(roundGold, ox, oy, 24, 21, [250, 204, 21]);
      setPixel(roundGold, ox, oy, 25, 21, [250, 204, 21]);
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_glasses_round_gold.png'), roundGold);

// 5C. Nón lưỡi trai FPTU Cam
const capFuda = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    for (let y = 8; y <= 16; y++) {
      const w = Math.round((y - 8) * 1.2);
      for (let x = 24 - w; x <= 24 + w; x++) {
        setPixel(capFuda, ox, oy, x, y, (y <= 10) ? [251, 146, 60] : [234, 88, 12]);
      }
    }
    if (r === 0) {
      for (let x = 16; x <= 32; x++) {
        setPixel(capFuda, ox, oy, x, 17, [194, 65, 12]);
      }
      setPixel(capFuda, ox, oy, 24, 13, [255, 255, 255]);
      setPixel(capFuda, ox, oy, 24, 14, [255, 255, 255]);
      setPixel(capFuda, ox, oy, 25, 13, [255, 255, 255]);
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_cap_fuda_orange.png'), capFuda);

// 5D. Khẩu trang đen streetwear
const maskBlack = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    if (r === 0) {
      for (let y = 25; y <= 31; y++) {
        const mw = (y === 25 || y === 31) ? 4 : 6;
        for (let x = 24 - mw; x <= 24 + mw; x++) {
          const idx = ((oy + y) * 192 + (ox + x)) * 4;
          const isEdge = (y === 25 || y === 31 || x === 24 - mw || x === 24 + mw);
          maskBlack.data[idx] = isEdge ? 15 : 30;
          maskBlack.data[idx + 1] = isEdge ? 23 : 41;
          maskBlack.data[idx + 2] = isEdge ? 42 : 59;
          maskBlack.data[idx + 3] = 255;
        }
      }
      setPixel(maskBlack, ox, oy, 16, 26, [51, 65, 85]);
      setPixel(maskBlack, ox, oy, 17, 26, [51, 65, 85]);
      setPixel(maskBlack, ox, oy, 31, 26, [51, 65, 85]);
      setPixel(maskBlack, ox, oy, 32, 26, [51, 65, 85]);
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_mask_streetwear_black.png'), maskBlack);

// 5E. Băng đô thể thao
const headband = new PNG({ width: 192, height: 256 });
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    const ox = c * 48;
    const oy = r * 64;
    for (let y = 14; y <= 16; y++) {
      for (let x = 14; x <= 34; x++) {
        const col = (y === 15 && (x === 23 || x === 24 || x === 25)) ? [255, 255, 255] : [239, 68, 68];
        setPixel(headband, ox, oy, x, y, col);
      }
    }
  }
}
writePng(path.join(ACC_DIR, 'acc_headband_sport.png'), headband);

console.log('--- ALL REFINEMENTS AND EXTENSIONS COMPLETED ---');
