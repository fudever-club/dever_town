/**
 * InteractiveModal.gallery — Gallery kỷ niệm CLB (memory slides).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { INTERACTION_PRESETS } from '../../config/interactions.js';

InteractiveModal.prototype.setupGalleryView = function(zoneData) {
  const pane = document.getElementById('pane-gallery');
  if (!pane) return;
  pane.classList.remove('hidden');

  const memories = INTERACTION_PRESETS.gallery_memory.memories;
  const meta = zoneData.metadata;

  let targetIdx = 0;
  if (meta && meta.imgId) {
    const found = memories.findIndex(m => m.id === meta.imgId);
    if (found !== -1) {
      targetIdx = found;
    } else if (meta.imgId === 'hackathon') {
      const hackFound = memories.findIndex(m => m.id.includes('hackathon'));
      if (hackFound !== -1) targetIdx = hackFound;
    }
  }

  this.currentMemoryIndex = targetIdx;
  this.renderMemorySlide(memories[this.currentMemoryIndex]);

  // Đảm bảo nút bấm chuyển kỷ niệm hoạt động tức thì
  const prevBtn = document.getElementById('gallery-prev-btn') || document.getElementById('memory-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn') || document.getElementById('memory-next-btn');

  if (prevBtn) {
    prevBtn.onclick = () => {
      this.currentMemoryIndex = (this.currentMemoryIndex - 1 + memories.length) % memories.length;
      this.renderMemorySlide(memories[this.currentMemoryIndex]);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      this.currentMemoryIndex = (this.currentMemoryIndex + 1) % memories.length;
      this.renderMemorySlide(memories[this.currentMemoryIndex]);
    };
  }
}

InteractiveModal.prototype.renderMemorySlide = function(memory) {
  if (!memory) return;

  const titleEl = document.getElementById('memory-slide-title');
  const dateEl = document.getElementById('memory-date') || document.getElementById('memory-slide-date');
  const tagEl = document.getElementById('memory-tag') || document.getElementById('memory-slide-tag');
  const storyEl = document.getElementById('memory-slide-story');
  const counterEl = document.getElementById('gallery-counter') || document.getElementById('memory-slide-counter');
  const canvasArt = document.getElementById('gallery-canvas') || document.getElementById('memory-art-canvas');

  const memories = INTERACTION_PRESETS.gallery_memory.memories;

  if (titleEl) titleEl.textContent = memory.title;
  if (dateEl) dateEl.textContent = memory.date;
  if (tagEl) {
    tagEl.textContent = memory.tag;
    const accent = memory.accentColor || '#00B2FF';
    tagEl.style.borderColor = accent;
    tagEl.style.color = accent;
    tagEl.style.backgroundColor = `${accent}1f`;
  }
  if (storyEl) storyEl.textContent = memory.story;
  if (counterEl) counterEl.textContent = `${this.currentMemoryIndex + 1} / ${memories.length}`;

  if (canvasArt) {
    const ctx = canvasArt.getContext('2d');
    const w = canvasArt.width;
    const h = canvasArt.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Cyberpunk Dark Gradient Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#060d1b');
    grad.addColorStop(0.5, '#0b162c');
    grad.addColorStop(1, '#050a14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Tech Grid Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 3. Glowing Card Frame with Neon Glow
    const accent = memory.accentColor || '#00B2FF';
    ctx.save();
    ctx.shadowColor = accent;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(16, 16, w - 32, h - 32);
    ctx.restore();

    // Corner tech brackets
    const bLen = 16;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(12, 12 + bLen); ctx.lineTo(12, 12); ctx.lineTo(12 + bLen, 12);
    // Top-right
    ctx.moveTo(w - 12 - bLen, 12); ctx.lineTo(w - 12, 12); ctx.lineTo(w - 12, 12 + bLen);
    // Bottom-left
    ctx.moveTo(12, h - 12 - bLen); ctx.lineTo(12, h - 12); ctx.lineTo(12 + bLen, h - 12);
    // Bottom-right
    ctx.moveTo(w - 12 - bLen, h - 12); ctx.lineTo(w - 12, h - 12); ctx.lineTo(w - 12, h - 12 - bLen);
    ctx.stroke();

    // 4. Large Emblem / Mascot Icon
    const icon = memory.icon || '🏆';
    ctx.font = '54px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, w / 2, h / 2 - 55);

    // 5. Category / Tag Badge Pill
    const tagText = (memory.tag || 'VINH DANH').toUpperCase();
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    const tagWidth = ctx.measureText(tagText).width + 26;
    const tagX = (w - tagWidth) / 2;
    const tagY = h / 2 - 12;

    ctx.fillStyle = `${accent}25`;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(tagX, tagY, tagWidth, 24, 6);
    } else {
      ctx.rect(tagX, tagY, tagWidth, 24);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, w / 2, tagY + 12);

    // 6. Title Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = 'center';
    const displayTitle = memory.title;
    if (displayTitle.length > 36) {
      const mid = displayTitle.lastIndexOf(' ', 34);
      const line1 = mid !== -1 ? displayTitle.substring(0, mid) : displayTitle.substring(0, 34);
      const line2 = mid !== -1 ? displayTitle.substring(mid + 1) : displayTitle.substring(34);
      ctx.fillText(line1, w / 2, h / 2 + 42);
      ctx.fillText(line2, w / 2, h / 2 + 68);
    } else {
      ctx.fillText(displayTitle, w / 2, h / 2 + 52);
    }

    // 7. Footer Branding & Date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`CLB LẬP TRÌNH FU-DEVER • ${memory.date}`, w / 2, h - 34);
  }
}
