#!/usr/bin/env node
/**
 * FU-DEVER Spritesheet Post-Processing Pipeline (Node.js pure JS)
 * Uses pngjs & jpeg-js for zero-native-dependency image processing.
 * Chroma-keying (Magenta #FF00FF -> Alpha 0), defringing, 4x4 grid slicing,
 * and nearest-neighbor normalization to 48x64px frames (192x256px total).
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const CHROMA_MAGENTA = { r: 255, g: 0, b: 255 };
const DEFAULT_FRAME_W = 48;
const DEFAULT_FRAME_H = 64;
const DEFAULT_COLS = 4;
const DEFAULT_ROWS = 4;

/**
 * Đọc file ảnh đầu vào (PNG hoặc JPG) và trả về đối tượng { width, height, data (RGBA buffer) }
 */
function loadImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === '.jpg' || ext === '.jpeg') {
    const raw = jpeg.decode(fileBuffer, { useTArray: true });
    return {
      width: raw.width,
      height: raw.height,
      data: Buffer.from(raw.data)
    };
  } else {
    const png = PNG.sync.read(fileBuffer);
    return {
      width: png.width,
      height: png.height,
      data: png.data
    };
  }
}

/**
 * Tách nền Magenta #FF00FF thành Alpha trong suốt
 */
function removeChromaBackground(img, tolerance = 60) {
  const { width, height, data } = img;
  const tolSq = tolerance * tolerance;
  const softTol = tolerance + 40;
  const softTolSq = softTol * softTol;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // Khoảng cách Euclid tới Magenta (255, 0, 255)
    const distSq = (r - CHROMA_MAGENTA.r) ** 2 +
                   (g - CHROMA_MAGENTA.g) ** 2 +
                   (b - CHROMA_MAGENTA.b) ** 2;

    if (distSq <= tolSq) {
      data[i + 3] = 0; // Trong suốt tuyệt đối
    } else if (distSq < softTolSq) {
      const factor = (Math.sqrt(distSq) - tolerance) / 40.0;
      data[i + 3] = Math.floor(a * factor);
      // Defringe triệt để viền tím
      if (r > g && b > g) {
        data[i] = g;
        data[i + 2] = g;
      }
    } else {
      // Khử viền tím lẹm vào outline pixel tối
      if (r > g + 35 && b > g + 35 && (r + g + b) / 3 < 160) {
        const darkVal = Math.min(r, g, b);
        data[i] = darkVal;
        data[i + 2] = darkVal;
      }
    }
  }

  return img;
}

/**
 * Cắt lưới 4x4 và scale Nearest-Neighbor về 48x64 px (Tổng: 192x256 px)
 */
function sliceAndNormalize(img, rows = DEFAULT_ROWS, srcCols = DEFAULT_COLS,
                           frameW = DEFAULT_FRAME_W, frameH = DEFAULT_FRAME_H,
                           selectedCols = null) {
  const targetCols = selectedCols ? selectedCols.length : DEFAULT_COLS;
  const targetW = targetCols * frameW;
  const targetH = rows * frameH;
  const outPng = new PNG({ width: targetW, height: targetH });

  const cellW = img.width / srcCols;
  const cellH = img.height / rows;

  for (let r = 0; r < rows; r++) {
    for (let outC = 0; outC < targetCols; outC++) {
      const srcC = selectedCols ? selectedCols[outC] : outC;
      const cellStartX = srcC * cellW;
      const cellStartY = r * cellH;
      const outStartX = outC * frameW;
      const outStartY = r * frameH;

      for (let y = 0; y < frameH; y++) {
        const srcY = Math.floor(cellStartY + (y / frameH) * cellH);
        for (let x = 0; x < frameW; x++) {
          const srcX = Math.floor(cellStartX + (x / frameW) * cellW);

          const srcIdx = (srcY * img.width + srcX) * 4;
          const outIdx = ((outStartY + y) * targetW + (outStartX + x)) * 4;

          outPng.data[outIdx] = img.data[srcIdx];
          outPng.data[outIdx + 1] = img.data[srcIdx + 1];
          outPng.data[outIdx + 2] = img.data[srcIdx + 2];
          outPng.data[outIdx + 3] = img.data[srcIdx + 3];
        }
      }
    }
  }

  return outPng;
}

/**
 * Xếp chồng layer trang phục lên base body
 */
function compositeLayers(basePath, overlayPath, outputPath) {
  const basePng = PNG.sync.read(fs.readFileSync(basePath));
  const overlayPng = PNG.sync.read(fs.readFileSync(overlayPath));

  if (basePng.width !== overlayPng.width || basePng.height !== overlayPng.height) {
    console.error('Error: Base and Overlay dimensions do not match!');
    process.exit(1);
  }

  const out = new PNG({ width: basePng.width, height: basePng.height });

  for (let i = 0; i < basePng.data.length; i += 4) {
    const br = basePng.data[i];
    const bg = basePng.data[i + 1];
    const bb = basePng.data[i + 2];
    const ba = basePng.data[i + 3] / 255;

    const or = overlayPng.data[i];
    const og = overlayPng.data[i + 1];
    const ob = overlayPng.data[i + 2];
    const oa = overlayPng.data[i + 3] / 255;

    // Alpha blending
    const outA = oa + ba * (1 - oa);
    if (outA > 0) {
      out.data[i] = Math.round((or * oa + br * ba * (1 - oa)) / outA);
      out.data[i + 1] = Math.round((og * oa + bg * ba * (1 - oa)) / outA);
      out.data[i + 2] = Math.round((ob * oa + bb * ba * (1 - oa)) / outA);
      out.data[i + 3] = Math.round(outA * 255);
    } else {
      out.data[i] = 0;
      out.data[i + 1] = 0;
      out.data[i + 2] = 0;
      out.data[i + 3] = 0;
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(out));
  console.log(`[OK] Saved composite to: ${outputPath}`);
}

/**
 * Quy trình xử lý hoàn chỉnh
 */
export function processSpritesheet(inputPath, outputPath, tolerance = 60, srcCols = DEFAULT_COLS, selectedCols = null) {
  console.log(`[1/3] Loading raw AI image: ${inputPath}`);
  const img = loadImage(inputPath);

  console.log(`[2/3] Removing magenta chroma background (tolerance=${tolerance})...`);
  const keyed = removeChromaBackground(img, tolerance);

  console.log(`[3/3] Slicing and normalizing to 4x4 grid (48x64px frames)...`);
  const finalPng = sliceAndNormalize(keyed, DEFAULT_ROWS, srcCols, DEFAULT_FRAME_W, DEFAULT_FRAME_H, selectedCols);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, PNG.sync.write(finalPng));
  console.log(`[SUCCESS] Saved production spritesheet: ${outputPath} (${finalPng.width}x${finalPng.height})`);
}

// CLI Execution
const args = process.argv.slice(2);
if (args.includes('--composite')) {
  const baseIdx = args.indexOf('--base');
  const overlayIdx = args.indexOf('--overlay');
  const outIdx = args.indexOf('--output');
  if (baseIdx !== -1 && overlayIdx !== -1 && outIdx !== -1) {
    compositeLayers(args[baseIdx + 1], args[overlayIdx + 1], args[outIdx + 1]);
  } else {
    console.error('Usage: node process_spritesheet.js --composite --base <base.png> --overlay <overlay.png> --output <out.png>');
  }
} else if (args.includes('--input') && args.includes('--output')) {
  const inIdx = args.indexOf('--input');
  const outIdx = args.indexOf('--output');
  const tolIdx = args.indexOf('--tolerance');
  const srcColsIdx = args.indexOf('--src-cols');
  const selectColsIdx = args.indexOf('--select-cols');

  const tol = tolIdx !== -1 ? parseInt(args[tolIdx + 1], 10) : 60;
  const srcCols = srcColsIdx !== -1 ? parseInt(args[srcColsIdx + 1], 10) : DEFAULT_COLS;
  const selectedCols = selectColsIdx !== -1 ? args[selectColsIdx + 1].split(',').map(Number) : null;

  processSpritesheet(args[inIdx + 1], args[outIdx + 1], tol, srcCols, selectedCols);
} else if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Usage:');
  console.log('  node process_spritesheet.js --input <raw.png> --output <clean.png> [--tolerance 60] [--src-cols 4] [--select-cols 0,1,2,3]');
  console.log('  node process_spritesheet.js --composite --base <base.png> --overlay <overlay.png> --output <out.png>');
}
