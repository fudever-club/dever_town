// Tạo build/icon.ico từ public/android-chrome-512x512.png cho electron-builder.
// ICO chứa 1 entry PNG 256x256 (PNG-compressed, hợp lệ từ Windows Vista+).
// Chạy: node scripts/make-windows-icon.cjs
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SRC = path.join(__dirname, '../public/android-chrome-512x512.png');
const DEST = path.join(__dirname, '../build/icon.ico');
const SIZE = 256;

function downscaleBilinear(src, size) {
  const dst = new PNG({ width: size, height: size });
  const sx = src.width / size;
  const sy = src.height / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x + 0.5) * sx - 0.5;
      const gy = (y + 0.5) * sy - 0.5;
      const x0 = Math.max(0, Math.floor(gx));
      const y0 = Math.max(0, Math.floor(gy));
      const x1 = Math.min(src.width - 1, x0 + 1);
      const y1 = Math.min(src.height - 1, y0 + 1);
      const fx = Math.min(1, Math.max(0, gx - x0));
      const fy = Math.min(1, Math.max(0, gy - y0));
      const di = (y * size + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = src.data[(y0 * src.width + x0) * 4 + c];
        const p10 = src.data[(y0 * src.width + x1) * 4 + c];
        const p01 = src.data[(y1 * src.width + x0) * 4 + c];
        const p11 = src.data[(y1 * src.width + x1) * 4 + c];
        dst.data[di + c] = Math.round(
          p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) +
          p01 * (1 - fx) * fy + p11 * fx * fy
        );
      }
    }
  }
  return dst;
}

const src = PNG.sync.read(fs.readFileSync(SRC));
console.log(`[Info] Source icon: ${src.width}x${src.height}`);
const small = downscaleBilinear(src, SIZE);
const pngData = PNG.sync.write(small);

// ICONDIR + 1 ICONDIRENTRY (width/height = 0 nghĩa là 256)
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: ICO
header.writeUInt16LE(1, 4); // count
header.writeUInt8(0, 6); // width = 256
header.writeUInt8(0, 7); // height = 256
header.writeUInt8(0, 8); // color count
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(32, 10); // planes (PNG: bỏ qua nhưng giữ hợp lệ)
header.writeUInt16LE(32, 12); // bit count
header.writeUInt32LE(pngData.length, 14); // size
header.writeUInt32LE(6 + 16, 18); // offset

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, Buffer.concat([header, pngData]));
console.log(`[Info] Wrote ${DEST} (${fs.statSync(DEST).size} bytes, 256x256 PNG-compressed ICO)`);
