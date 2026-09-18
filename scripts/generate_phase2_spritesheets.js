import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

/**
 * MiniCanvas: Giả lập CanvasRenderingContext2D tối giản nhưng chuẩn xác 
 * cho môi trường Node.js thuần, ghi trực tiếp lên buffer RGBA của pngjs.
 */
class MiniCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.png = new PNG({ width, height });
    // Khởi tạo buffer trong suốt (alpha = 0)
    this.png.data.fill(0);

    this._fillStyle = { r: 0, g: 0, b: 0, a: 255 };
    this._strokeStyle = { r: 0, g: 0, b: 0, a: 255 };
    this.lineWidth = 1;
    this._stack = [];
  }

  set fillStyle(val) {
    this._fillStyle = this._parseColor(val);
  }

  get fillStyle() {
    return this._fillStyle;
  }

  set strokeStyle(val) {
    this._strokeStyle = this._parseColor(val);
  }

  get strokeStyle() {
    return this._strokeStyle;
  }

  _parseColor(c) {
    if (!c) return { r: 0, g: 0, b: 0, a: 255 };
    if (typeof c === 'object' && 'r' in c) return c;

    c = c.trim();
    if (c.startsWith('#')) {
      let hex = c.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.slice(0, 2), 16) || 0;
      const g = parseInt(hex.slice(2, 4), 16) || 0;
      const b = parseInt(hex.slice(4, 6), 16) || 0;
      const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) : 255;
      return { r, g, b, a };
    }

    if (c.startsWith('rgba')) {
      const match = c.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
          a: Math.round(parseFloat(match[4]) * 255)
        };
      }
    }

    if (c.startsWith('rgb')) {
      const match = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
          a: 255
        };
      }
    }

    return { r: 0, g: 0, b: 0, a: 255 };
  }

  _setPixel(x, y, color) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const idx = (y * this.width + x) * 4;
    const srcA = color.a / 255;
    const dstA = this.png.data[idx + 3] / 255;

    if (srcA >= 0.99) {
      this.png.data[idx] = color.r;
      this.png.data[idx + 1] = color.g;
      this.png.data[idx + 2] = color.b;
      this.png.data[idx + 3] = 255;
    } else if (srcA > 0) {
      const outA = srcA + dstA * (1 - srcA);
      this.png.data[idx] = Math.round((color.r * srcA + this.png.data[idx] * dstA * (1 - srcA)) / outA);
      this.png.data[idx + 1] = Math.round((color.g * srcA + this.png.data[idx + 1] * dstA * (1 - srcA)) / outA);
      this.png.data[idx + 2] = Math.round((color.b * srcA + this.png.data[idx + 2] * dstA * (1 - srcA)) / outA);
      this.png.data[idx + 3] = Math.round(outA * 255);
    }
  }

  fillRect(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    const x0 = Math.max(0, x);
    const x1 = Math.min(this.width, x + w);
    const y0 = Math.max(0, y);
    const y1 = Math.min(this.height, y + h);

    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        this._setPixel(px, py, this._fillStyle);
      }
    }
  }

  strokeRect(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    const oldFill = this._fillStyle;
    this._fillStyle = this._strokeStyle;
    this.fillRect(x, y, w, 1);
    this.fillRect(x, y + h - 1, w, 1);
    this.fillRect(x, y, 1, h);
    this.fillRect(x + w - 1, y, 1, h);
    this._fillStyle = oldFill;
  }

  clearRect(x, y, w, h) {
    x = Math.max(0, Math.round(x));
    y = Math.max(0, Math.round(y));
    const x1 = Math.min(this.width, x + Math.round(w));
    const y1 = Math.min(this.height, y + Math.round(h));

    for (let py = y; py < y1; py++) {
      for (let px = x; px < x1; px++) {
        const idx = (py * this.width + px) * 4;
        this.png.data[idx] = 0;
        this.png.data[idx + 1] = 0;
        this.png.data[idx + 2] = 0;
        this.png.data[idx + 3] = 0;
      }
    }
  }

  beginPath() {
    this._path = [];
  }

  closePath() {
    // no-op
  }

  ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle) {
    this._ellipseParams = { cx: Math.round(cx), cy: Math.round(cy), rx: Math.round(rx), ry: Math.round(ry) };
  }

  arc(cx, cy, r, startAngle, endAngle) {
    this._ellipseParams = { cx: Math.round(cx), cy: Math.round(cy), rx: Math.round(r), ry: Math.round(r) };
  }

  fill() {
    if (this._ellipseParams) {
      const { cx, cy, rx, ry } = this._ellipseParams;
      for (let dy = -ry; dy <= ry; dy++) {
        for (let dx = -rx; dx <= rx; dx++) {
          if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) {
            this._setPixel(cx + dx, cy + dy, this._fillStyle);
          }
        }
      }
      this._ellipseParams = null;
    }
  }

  stroke() {
    if (this._ellipseParams) {
      const { cx, cy, rx, ry } = this._ellipseParams;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        const px = cx + Math.round(rx * Math.cos(angle));
        const py = cy + Math.round(ry * Math.sin(angle));
        this._setPixel(px, py, this._strokeStyle);
      }
      this._ellipseParams = null;
    }
  }

  save() {
    this._stack.push({
      fillStyle: { ...this._fillStyle },
      strokeStyle: { ...this._strokeStyle },
      lineWidth: this.lineWidth
    });
  }

  restore() {
    if (this._stack.length > 0) {
      const s = this._stack.pop();
      this._fillStyle = s.fillStyle;
      this._strokeStyle = s.strokeStyle;
      this.lineWidth = s.lineWidth;
    }
  }

  toBuffer() {
    return PNG.sync.write(this.png);
  }
}

/**
 * Đầy đủ logic vẽ Frame Chibi 48x64 px theo chuẩn TextureGenerator.js
 */
function drawCharacterFrame(ctx, x, y, direction, frameIndex, config = {}) {
  const gender = config.gender || 'male';
  const hairstyle = config.hairstyle || (gender === 'female' ? 'long' : 'short');
  const hair = config.hair || config.hairColor || '#0f172a';
  const skin = config.skin || config.skinColor || '#fbd1a2';
  const skinTone = config.skinTone || 'skin_natural';
  const facialHair = config.facialHair || 'none';
  const expression = config.expression || 'expr_focus';
  const outfitType = config.outfitType || 'hoodie';
  const shirt = config.shirt || config.hoodieColor || config.outfitColor || '#f26f21';
  const collarColor = config.collarColor || '#002147';
  const pants = config.pants || config.pantsColor || '#1e293b';
  const accessory = config.accessory || 'none';
  const inHandItem = config.inHandItem || config.equippedItemId || null;

  const skinMap = {
    skin_fair: { base: '#fed7aa', highlight: '#ffedd5', shadow: '#fdba74' },
    skin_natural: { base: '#fbd1a2', highlight: '#fde68a', shadow: '#f59e0b' },
    skin_tan: { base: '#d97706', highlight: '#f59e0b', shadow: '#b45309' },
    skin_deep: { base: '#92400e', highlight: '#b45309', shadow: '#78350f' },
    skin_ebony: { base: '#573016', highlight: '#78350f', shadow: '#3b1d08' },
    skin_cyber: { base: '#bae6fd', highlight: '#e0f2fe', shadow: '#7dd3fc' }
  };
  const activeSkin = skinMap[skinTone] || { base: skin, highlight: skin, shadow: skin };

  ctx.clearRect(x, y, 48, 64);

  // 1. Shadow ellipse (x+24, y+60, rx=16, ry=5)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 24, y + 60, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  let leftLegOffset = 0;
  let rightLegOffset = 0;
  
  if (direction === 'left' || direction === 'right') {
    if (frameIndex === 1) { leftLegOffset = -4; rightLegOffset = 4; }
    else if (frameIndex === 3) { leftLegOffset = 4; rightLegOffset = -4; }
  } else {
    if (frameIndex === 1) { leftLegOffset = -2; rightLegOffset = 2; }
    else if (frameIndex === 3) { leftLegOffset = 2; rightLegOffset = -2; }
  }

  // --- LEGS & SHOES ---
  if (outfitType === 'aodai') {
    ctx.fillStyle = '#ffffff';
    if (direction === 'left' || direction === 'right') {
      ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -3 : 0), y + 45, 6, 13);
    } else {
      ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
      ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
    }
  } else if (outfitType === 'croptop' || outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
    ctx.fillStyle = activeSkin.base;
    if (direction === 'left' || direction === 'right') {
      ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -2 : 0), y + 45, 6, 13);
    } else {
      ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
      ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
    }
  } else {
    ctx.fillStyle = pants;
    if (direction === 'left' || direction === 'right') {
      ctx.fillRect(x + 21 + (frameIndex % 2 === 1 ? -3 : 0), y + 45, 6, 13);
    } else {
      ctx.fillRect(x + 16, y + 45 + leftLegOffset, 6, 13);
      ctx.fillRect(x + 26, y + 45 + rightLegOffset, 6, 13);
    }
  }

  // Draw shoes (y+58 to y+64)
  ctx.fillStyle = (outfitType === 'aodai' || outfitType === 'suit') ? '#000000' : '#1e293b';
  const soleColor = '#475569';
  if (direction === 'left' || direction === 'right') {
    let lx = x + 21 + (frameIndex % 2 === 1 ? -3 : 0);
    ctx.fillRect(lx, y + 58, 8, 4);
    ctx.fillStyle = soleColor;
    ctx.fillRect(lx, y + 62, 8, 2);
  } else {
    ctx.fillRect(x + 15, y + 58 + leftLegOffset, 8, 4);
    ctx.fillRect(x + 25, y + 58 + rightLegOffset, 8, 4);
    ctx.fillStyle = soleColor;
    ctx.fillRect(x + 15, y + 62 + leftLegOffset, 8, 2);
    ctx.fillRect(x + 25, y + 62 + rightLegOffset, 8, 2);
  }

  // --- LOWER BODY / OUTFIT SKIRT ---
  if (outfitType === 'aodai') {
    ctx.fillStyle = shirt;
    if (direction === 'down' || direction === 'up') {
      ctx.fillRect(x + 13, y + 27, 22, 22);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x + 23, y + 35, 2, 14);
    } else if (direction === 'left' || direction === 'right') {
      ctx.fillRect(x + 16, y + 27, 16, 22);
    }
  } else if (outfitType === 'dress' || outfitType === 'sailor' || outfitType === 'yukata') {
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 13, y + 36, 22, 12);
    if (outfitType === 'sailor') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 13, y + 45, 22, 2);
    } else if (outfitType === 'yukata') {
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 13, y + 36, 22, 4);
    }
  } else if (outfitType === 'wizard' || outfitType === 'cardigan' || outfitType === 'martial') {
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 13, y + 36, 22, 12);
    if (outfitType === 'martial') {
      ctx.fillStyle = collarColor;
      ctx.fillRect(x + 13, y + 38, 22, 3);
    }
  } else if (outfitType === 'croptop') {
    ctx.fillStyle = pants;
    ctx.fillRect(x + 15, y + 40, 18, 6);
  } else {
    ctx.fillStyle = pants;
    ctx.fillRect(x + 15, y + 42, 18, 5);
  }

  // --- TORSO / SHIRT ---
  ctx.fillStyle = shirt;
  ctx.fillRect(x + 14, y + 27, 20, 15);
  if (outfitType === 'croptop') {
    ctx.fillStyle = activeSkin.base;
    ctx.fillRect(x + 15, y + 36, 18, 4);
  }

  // Torso Details
  if (outfitType === 'polo') {
    ctx.fillStyle = collarColor;
    ctx.fillRect(x + 21, y + 27, 6, 4);
    ctx.fillRect(x + 23, y + 31, 2, 4);
  } else if (outfitType === 'sailor') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 16, y + 27, 16, 3);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 22, y + 30, 4, 4);
  } else if (outfitType === 'suit') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 21, y + 27, 6, 8);
    ctx.fillStyle = collarColor;
    ctx.fillRect(x + 23, y + 28, 2, 7);
  } else if (outfitType === 'jersey') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 20, y + 30, 8, 8);
    ctx.fillStyle = shirt;
    ctx.fillRect(x + 22, y + 32, 4, 4);
  } else if (outfitType === 'bomber' || outfitType === 'biker') {
    ctx.fillStyle = collarColor;
    ctx.fillRect(x + 23, y + 27, 2, 15);
  } else if (outfitType === 'barista') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 16, y + 28, 16, 14);
    ctx.fillStyle = collarColor;
    ctx.fillRect(x + 21, y + 31, 6, 4);
  } else if (outfitType === 'mecha') {
    ctx.fillStyle = collarColor;
    ctx.fillRect(x + 20, y + 30, 8, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 22, y + 32, 4, 2);
  } else if (outfitType === 'frog') {
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 18, y + 30, 12, 10);
  }

  // --- ARMS WITH SWING LOGIC ---
  const isShortSleeve = ['tee', 'dress', 'croptop', 'polo'].includes(outfitType);
  let lArmX, lArmY, rArmX, rArmY;
  let lArmW = 6, lArmH = 16, rArmW = 6, rArmH = 16;
  
  if (direction === 'down' || direction === 'up') {
    if (frameIndex === 0 || frameIndex === 2) {
      lArmX = x + 8; lArmY = y + 28;
      rArmX = x + 34; rArmY = y + 28;
    } else if (frameIndex === 1) {
      lArmX = x + 6; lArmY = y + 26; lArmH = 18;
      rArmX = x + 36; rArmY = y + 30; rArmH = 14;
    } else if (frameIndex === 3) {
      lArmX = x + 6; lArmY = y + 30; lArmH = 14;
      rArmX = x + 36; rArmY = y + 26; rArmH = 18;
    }
  } else if (direction === 'left') {
    if (frameIndex === 0 || frameIndex === 2) {
      lArmX = x + 20; lArmY = y + 28; lArmW = 8; lArmH = 16;
    } else if (frameIndex === 1) {
      lArmX = x + 16; lArmY = y + 26; lArmW = 10; lArmH = 18;
    } else if (frameIndex === 3) {
      lArmX = x + 22; lArmY = y + 30; lArmW = 8; lArmH = 14;
    }
  } else if (direction === 'right') {
    if (frameIndex === 0 || frameIndex === 2) {
      rArmX = x + 20; rArmY = y + 28; rArmW = 8; rArmH = 16;
    } else if (frameIndex === 1) {
      rArmX = x + 22; rArmY = y + 30; rArmW = 8; rArmH = 14;
    } else if (frameIndex === 3) {
      rArmX = x + 16; rArmY = y + 26; rArmW = 10; rArmH = 18;
    }
  }

  const drawArm = (ax, ay, aw, ah) => {
    if (!ax) return;
    ctx.fillStyle = shirt;
    if (isShortSleeve) {
      ctx.fillRect(ax, ay, aw, ah / 2);
      ctx.fillStyle = activeSkin.base;
      ctx.fillRect(ax, ay + ah / 2, aw, ah / 2);
    } else {
      ctx.fillRect(ax, ay, aw, ah);
      ctx.fillStyle = activeSkin.base;
      ctx.fillRect(ax + 1, ay + ah, aw - 2, 4);
    }
  };

  const isBothHandsItem = inHandItem && ['macbook_dev', 'golden_frog_plush'].includes(inHandItem);
  const isOneHandItem = inHandItem && !isBothHandsItem && inHandItem !== 'none';

  if (!isBothHandsItem) {
    if (isOneHandItem) {
      if (direction === 'down' || direction === 'up') {
        drawArm(lArmX, lArmY, lArmW, lArmH);
      }
    } else {
      if (direction !== 'left') drawArm(rArmX, rArmY, rArmW, rArmH);
      if (direction !== 'right') drawArm(lArmX, lArmY, lArmW, lArmH);
    }
  }

  // --- HEAD SKIN BASE ---
  ctx.fillStyle = activeSkin.base;
  ctx.fillRect(x + 17, y + 6, 14, 14);
  ctx.fillStyle = activeSkin.shadow;
  ctx.fillRect(x + 17, y + 18, 14, 2);

  // --- FACE FEATURES ---
  ctx.fillStyle = '#0f172a';
  if (direction === 'down') {
    if (expression === 'expr_smile') {
      ctx.fillRect(x + 19, y + 11, 3, 1);
      ctx.fillRect(x + 26, y + 11, 3, 1);
      ctx.fillRect(x + 18, y + 12, 1, 1);
      ctx.fillRect(x + 22, y + 12, 1, 1);
      ctx.fillRect(x + 25, y + 12, 1, 1);
      ctx.fillRect(x + 29, y + 12, 1, 1);
    } else if (expression === 'expr_cool') {
      ctx.fillRect(x + 19, y + 11, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 19, y + 11, 1, 1);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 26, y + 11, 3, 1);
    } else if (expression === 'expr_shock') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 18, y + 10, 4, 4);
      ctx.fillRect(x + 26, y + 10, 4, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 19, y + 11, 2, 2);
      ctx.fillRect(x + 27, y + 11, 2, 2);
    } else if (expression === 'expr_chill') {
      ctx.fillRect(x + 19, y + 12, 3, 1);
      ctx.fillRect(x + 26, y + 12, 3, 1);
    } else {
      ctx.fillRect(x + 19, y + 11, 3, 2);
      ctx.fillRect(x + 26, y + 11, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 19, y + 11, 1, 1);
      ctx.fillRect(x + 26, y + 11, 1, 1);
    }
    
    // Nose dot
    ctx.fillStyle = activeSkin.shadow;
    ctx.fillRect(x + 23, y + 14, 1, 1);

    // Mouth
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 22, y + 16, 4, 1);

    if (gender === 'female') {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 17, y + 13, 2, 2);
      ctx.fillRect(x + 29, y + 13, 2, 2);
    }
  } else if (direction === 'left') {
    ctx.fillRect(x + 17, y + 11, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 17, y + 11, 1, 1);
    ctx.fillStyle = activeSkin.shadow;
    ctx.fillRect(x + 16, y + 14, 1, 1);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 16, y + 16, 2, 1);
  } else if (direction === 'right') {
    ctx.fillRect(x + 28, y + 11, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 30, y + 11, 1, 1);
    ctx.fillStyle = activeSkin.shadow;
    ctx.fillRect(x + 31, y + 14, 1, 1);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 30, y + 16, 2, 1);
  }

  // --- FACIAL HAIR ---
  if (facialHair && facialHair !== 'none' && direction !== 'up') {
    const beardColor = facialHair === 'grey_beard' ? '#94a3b8' : hair;
    ctx.fillStyle = beardColor;
    if (facialHair === 'full_beard' || facialHair === 'grey_beard') {
      if (direction === 'down') {
        ctx.fillRect(x + 17, y + 13, 2, 5);
        ctx.fillRect(x + 29, y + 13, 2, 5);
        ctx.fillRect(x + 19, y + 17, 10, 3);
      } else if (direction === 'left') {
        ctx.fillRect(x + 16, y + 13, 4, 5);
        ctx.fillRect(x + 18, y + 17, 6, 3);
      } else if (direction === 'right') {
        ctx.fillRect(x + 28, y + 13, 4, 5);
        ctx.fillRect(x + 24, y + 17, 6, 3);
      }
    } else if (facialHair === 'mustache') {
      if (direction === 'down') {
        ctx.fillRect(x + 20, y + 15, 8, 1);
      } else if (direction === 'left') {
        ctx.fillRect(x + 16, y + 15, 4, 1);
      } else if (direction === 'right') {
        ctx.fillRect(x + 28, y + 15, 4, 1);
      }
    } else if (facialHair === 'goatee') {
      if (direction === 'down') {
        ctx.fillRect(x + 22, y + 17, 4, 2);
      } else if (direction === 'left') {
        ctx.fillRect(x + 17, y + 17, 3, 2);
      } else if (direction === 'right') {
        ctx.fillRect(x + 28, y + 17, 3, 2);
      }
    } else if (facialHair === 'stubble') {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
      if (direction === 'down') {
        ctx.fillRect(x + 18, y + 16, 12, 3);
      } else if (direction === 'left') {
        ctx.fillRect(x + 17, y + 16, 6, 3);
      } else if (direction === 'right') {
        ctx.fillRect(x + 25, y + 16, 6, 3);
      }
    }
  }

  // --- HAIRSTYLES ---
  ctx.fillStyle = hair;
  if (hairstyle === 'long') {
    if (direction === 'down') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 14, y + 8, 4, 18);
      ctx.fillRect(x + 30, y + 8, 4, 18);
    } else if (direction === 'up') {
      ctx.fillRect(x + 14, y + 4, 20, 22);
    } else if (direction === 'left') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 25, y + 7, 7, 19);
    } else if (direction === 'right') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 16, y + 7, 7, 19);
    }
  } else if (hairstyle === 'ponytail') {
    if (direction === 'down') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 15, y + 8, 3, 6);
      ctx.fillRect(x + 30, y + 8, 3, 6);
      ctx.fillRect(x + 32, y + 4, 5, 10);
    } else if (direction === 'up') {
      ctx.fillRect(x + 15, y + 4, 18, 12);
      ctx.fillRect(x + 22, y + 1, 4, 10);
    } else if (direction === 'left') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 31, y + 6, 6, 9);
    } else if (direction === 'right') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 11, y + 6, 6, 9);
    }
  } else if (hairstyle === 'twintails') {
    if (direction === 'down' || direction === 'up') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      if (direction === 'up') ctx.fillRect(x + 14, y + 4, 20, 12);
      ctx.fillRect(x + 10, y + 6, 5, 14);
      ctx.fillRect(x + 33, y + 6, 5, 14);
    } else if (direction === 'left') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 29, y + 6, 6, 14);
    } else if (direction === 'right') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 13, y + 6, 6, 14);
    }
  } else if (hairstyle === 'wolf_cut') {
    if (direction === 'down') {
      ctx.fillRect(x + 14, y + 3, 20, 7);
      ctx.fillRect(x + 13, y + 8, 4, 12);
      ctx.fillRect(x + 31, y + 8, 4, 12);
      ctx.fillRect(x + 18, y + 9, 3, 4);
      ctx.fillRect(x + 27, y + 9, 3, 4);
    } else if (direction === 'up') {
      ctx.fillRect(x + 13, y + 3, 22, 18);
    } else if (direction === 'left') {
      ctx.fillRect(x + 14, y + 3, 20, 7);
      ctx.fillRect(x + 25, y + 7, 8, 14);
    } else if (direction === 'right') {
      ctx.fillRect(x + 14, y + 3, 20, 7);
      ctx.fillRect(x + 15, y + 7, 8, 14);
    }
  } else if (hairstyle === 'undercut') {
    if (direction === 'down') {
      ctx.fillRect(x + 15, y + 2, 18, 8);
      ctx.fillRect(x + 14, y + 8, 2, 6);
      ctx.fillRect(x + 32, y + 8, 2, 6);
    } else if (direction === 'up') {
      ctx.fillRect(x + 15, y + 2, 18, 10);
      ctx.fillRect(x + 16, y + 12, 16, 4);
    } else if (direction === 'left') {
      ctx.fillRect(x + 16, y + 2, 18, 8);
      ctx.fillRect(x + 28, y + 8, 4, 6);
    } else if (direction === 'right') {
      ctx.fillRect(x + 14, y + 2, 18, 8);
      ctx.fillRect(x + 16, y + 8, 4, 6);
    }
  } else if (hairstyle === 'buzz_cut') {
    if (direction === 'down' || direction === 'up') {
      ctx.fillRect(x + 16, y + 4, 16, 4);
      ctx.fillRect(x + 15, y + 7, 2, 4);
      ctx.fillRect(x + 31, y + 7, 2, 4);
    } else if (direction === 'left') {
      ctx.fillRect(x + 16, y + 4, 16, 4);
      ctx.fillRect(x + 28, y + 7, 3, 5);
    } else if (direction === 'right') {
      ctx.fillRect(x + 16, y + 4, 16, 4);
      ctx.fillRect(x + 17, y + 7, 3, 5);
    }
  } else if (hairstyle === 'bald_professor') {
    if (direction === 'down') {
      ctx.fillRect(x + 14, y + 8, 4, 9);
      ctx.fillRect(x + 30, y + 8, 4, 9);
      ctx.fillRect(x + 13, y + 11, 3, 6);
      ctx.fillRect(x + 32, y + 11, 3, 6);
    } else if (direction === 'up') {
      ctx.fillRect(x + 14, y + 8, 20, 12);
      ctx.fillStyle = activeSkin.base;
      ctx.fillRect(x + 18, y + 6, 12, 6);
      ctx.fillStyle = hair;
    } else if (direction === 'left') {
      ctx.fillRect(x + 24, y + 7, 8, 12);
      ctx.fillRect(x + 21, y + 11, 6, 7);
    } else if (direction === 'right') {
      ctx.fillRect(x + 16, y + 7, 8, 12);
      ctx.fillRect(x + 21, y + 11, 6, 7);
    }
  } else {
    // Default short crop
    if (direction === 'down') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 15, y + 8, 3, 5);
      ctx.fillRect(x + 30, y + 8, 3, 5);
    } else if (direction === 'up') {
      ctx.fillRect(x + 15, y + 4, 18, 14);
    } else if (direction === 'left') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 25, y + 8, 6, 7);
    } else if (direction === 'right') {
      ctx.fillRect(x + 15, y + 4, 18, 6);
      ctx.fillRect(x + 17, y + 8, 6, 7);
    }
  }

  // --- ACCESSORIES ---
  if (accessory === 'glasses_smart' && direction !== 'up') {
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 18, y + 10, 5, 4);
    ctx.strokeRect(x + 25, y + 10, 5, 4);
    ctx.fillRect(x + 23, y + 11, 2, 1);
  } else if (accessory === 'sunglasses_cool' && direction !== 'up') {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x + 18, y + 10, 6, 4);
    ctx.fillRect(x + 24, y + 10, 6, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 20, y + 10, 2, 2);
    ctx.fillRect(x + 26, y + 10, 2, 2);
  } else if (accessory === 'headphones_rgb') {
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x + 14, y + 10, 3, 7);
    ctx.fillRect(x + 31, y + 10, 3, 7);
    ctx.fillRect(x + 15, y + 3, 18, 3);
  } else if (accessory === 'frog_crown') {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 18, y + 1, 12, 4);
    ctx.fillRect(x + 17, y + 1, 3, 3);
    ctx.fillRect(x + 28, y + 1, 3, 3);
    ctx.fillRect(x + 23, y + 0, 3, 3);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 23, y + 3, 3, 2);
  }

  // --- IN-HAND ITEMS ---
  if (inHandItem && inHandItem !== 'none') {
    if (inHandItem === 'macbook_dev') {
      if (direction === 'down') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 15, y + 30, 18, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 16, y + 31, 16, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 23, y + 33, 2, 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 10, y + 28, 6, 10);
        ctx.fillStyle = activeSkin.base;
        ctx.fillRect(x + 12, y + 38, 4, 3);
        ctx.fillRect(x + 32, y + 38, 4, 3);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 32, y + 28, 6, 10);
      }
    }
  }
}

/**
 * Sinh 1 spritesheet hoàn chỉnh kích thước 192x256 px (16 frames 48x64 px)
 */
function generateFullSpritesheet(config) {
  const canvas = new MiniCanvas(192, 256);
  const directions = ['down', 'left', 'right', 'up'];
  const cols = 4;
  const rows = 4;

  for (let r = 0; r < rows; r++) {
    const dir = directions[r];
    for (let c = 0; c < cols; c++) {
      drawCharacterFrame(canvas, c * 48, r * 64, dir, c, config);
    }
  }

  return canvas.toBuffer();
}

// ==========================================
// CẤU HÌNH TẤT CẢ TÀI NGUYÊN PHASE 2 CẦN SINH
// ==========================================
const NPC_LIST = [
  {
    filename: 'public/assets/characters/npcs/npc_barista_an.png',
    name: 'Barista An',
    config: {
      gender: 'female',
      hairstyle: 'ponytail',
      hairColor: '#78350f',
      skinTone: 'skin_natural',
      outfitType: 'barista',
      hoodieColor: '#d97706',
      collarColor: '#92400e',
      pantsColor: '#1e293b',
      accessory: 'none',
      expression: 'expr_smile'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_hocthu_kiet.png',
    name: 'Luong Van Tuan Kiet (Tech Lead)',
    config: {
      gender: 'male',
      hairstyle: 'buzz_cut',
      hairColor: '#0f172a',
      skinTone: 'skin_fair',
      outfitType: 'suit',
      hoodieColor: '#7c3aed',
      collarColor: '#6d28d9',
      pantsColor: '#312e81',
      accessory: 'glasses_smart',
      expression: 'expr_focus'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_game_lead_thanh.png',
    name: 'Nguyen Le Dang Thanh (Game Lead)',
    config: {
      gender: 'male',
      hairstyle: 'wolf_cut',
      hairColor: '#7f1d1d',
      skinTone: 'skin_natural',
      outfitType: 'hoodie',
      hoodieColor: '#dc2626',
      collarColor: '#991b1b',
      pantsColor: '#18181b',
      accessory: 'headphones_rgb',
      expression: 'expr_cool'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_sukien_thang.png',
    name: 'Ho Quoc Thang (Event Lead)',
    config: {
      gender: 'male',
      hairstyle: 'buzz_cut',
      hairColor: '#1e293b',
      skinTone: 'skin_tan',
      outfitType: 'jersey',
      hoodieColor: '#16a34a',
      collarColor: '#166534',
      pantsColor: '#1e293b',
      accessory: 'none',
      expression: 'expr_smile'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_media_hai.png',
    name: 'Doan Phuoc Truong Hai (Media Lead)',
    config: {
      gender: 'male',
      hairstyle: 'undercut',
      hairColor: '#92400e',
      skinTone: 'skin_natural',
      outfitType: 'polo',
      hoodieColor: '#1e293b',
      collarColor: '#0f172a',
      pantsColor: '#1e293b',
      accessory: 'none',
      expression: 'expr_smile'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_historian_duc.png',
    name: 'Su Quan Duc (Lich Su CLB)',
    config: {
      gender: 'male',
      hairstyle: 'bald_professor',
      hairColor: '#94a3b8',
      skinTone: 'skin_fair',
      outfitType: 'suit',
      hoodieColor: '#475569',
      collarColor: '#334155',
      pantsColor: '#1e293b',
      facialHair: 'grey_beard',
      accessory: 'glasses_smart',
      expression: 'expr_focus'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_backend_khoa.png',
    name: 'Le Dinh Dang Khoa (Backend Lead)',
    config: {
      gender: 'male',
      hairstyle: 'wolf_cut',
      hairColor: '#334155',
      skinTone: 'skin_natural',
      outfitType: 'hoodie',
      hoodieColor: '#0f172a',
      collarColor: '#1e293b',
      pantsColor: '#0f172a',
      facialHair: 'stubble',
      accessory: 'none',
      expression: 'expr_focus'
    }
  },
  {
    filename: 'public/assets/characters/npcs/npc_algo_truyen.png',
    name: 'Pham Duc Truyen (Algo Lead)',
    config: {
      gender: 'male',
      hairstyle: 'undercut',
      hairColor: '#0284c7',
      skinTone: 'skin_fair',
      outfitType: 'hoodie',
      hoodieColor: '#0369a1',
      collarColor: '#075985',
      pantsColor: '#1e293b',
      accessory: 'glasses_smart',
      expression: 'expr_focus'
    }
  }
];

const SPECIAL_OUTFITS = [
  {
    filename: 'public/assets/characters/special_outfits/special_frog_mascot.png',
    name: 'Mascot Coc Vang FUDA',
    config: {
      gender: 'male',
      skinTone: 'skin_natural',
      outfitType: 'frog',
      hoodieColor: '#eab308',
      collarColor: '#15803d',
      pantsColor: '#ca8a04',
      accessory: 'frog_crown',
      expression: 'expr_smile'
    }
  },
  {
    filename: 'public/assets/characters/special_outfits/special_mecha_suit.png',
    name: 'Giap Mecha Android Tuong Lai',
    config: {
      gender: 'male',
      skinTone: 'skin_cyber',
      outfitType: 'mecha',
      hoodieColor: '#0891b2',
      collarColor: '#22d3ee',
      pantsColor: '#164e63',
      accessory: 'headphones_rgb',
      expression: 'expr_focus'
    }
  },
  {
    filename: 'public/assets/characters/special_outfits/special_wizard_robe.png',
    name: 'Ao Choang Phap Su Huyen Bi',
    config: {
      gender: 'male',
      hairstyle: 'long',
      hairColor: '#e0e7ff',
      skinTone: 'skin_fair',
      outfitType: 'wizard',
      hoodieColor: '#4c1d95',
      collarColor: '#fbbf24',
      pantsColor: '#2e1065',
      accessory: 'glasses_smart',
      expression: 'expr_focus'
    }
  },
  {
    filename: 'public/assets/characters/special_outfits/special_vovinam_suit.png',
    name: 'Vo Phuc Vovinam FPTU Dai Vang',
    config: {
      gender: 'male',
      hairstyle: 'buzz_cut',
      hairColor: '#0f172a',
      skinTone: 'skin_natural',
      outfitType: 'martial',
      hoodieColor: '#0284c7',
      collarColor: '#eab308',
      pantsColor: '#0369a1',
      accessory: 'none',
      expression: 'expr_focus'
    }
  },
  {
    filename: 'public/assets/characters/special_outfits/special_leather_biker.png',
    name: 'Ao Khoac Da Biker Rocker Den',
    config: {
      gender: 'male',
      hairstyle: 'undercut',
      hairColor: '#1e293b',
      skinTone: 'skin_tan',
      outfitType: 'biker',
      hoodieColor: '#18181b',
      collarColor: '#94a3b8',
      pantsColor: '#0f172a',
      accessory: 'sunglasses_cool',
      expression: 'expr_cool'
    }
  }
];

// Tiến hành sinh toàn bộ spritesheet
console.log('=== KHỞI CHẠY SINH SPRITESHEETS PHASE 2 (CHIBI GATHER.TOWN 48x64) ===\n');

// 1. Sinh 8 NPC
console.log('--- 1. SINH 8 BỘ SPRITESHEET NPC BAN CHỦ NHIỆM & CỐ VẤN ---');
NPC_LIST.forEach(({ filename, name, config }) => {
  const fullPath = path.resolve(filename);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const buffer = generateFullSpritesheet(config);
  fs.writeFileSync(fullPath, buffer);
  console.log(`[OK] NPC: ${name} -> ${filename} (192x256 px, 16 frames)`);
});

// 2. Sinh 5 Special Outfits
console.log('\n--- 2. SINH 5 BỘ SPRITESHEET TRANG PHỤC ĐẶC BIỆT (SPECIAL OUTFITS) ---');
SPECIAL_OUTFITS.forEach(({ filename, name, config }) => {
  const fullPath = path.resolve(filename);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const buffer = generateFullSpritesheet(config);
  fs.writeFileSync(fullPath, buffer);
  console.log(`[OK] Special Outfit: ${name} -> ${filename} (192x256 px, 16 frames)`);
});

console.log('\n=== HOÀN TẤT SINH 13 BỘ SPRITESHEET CHUẨN GATHER.TOWN! ===');
