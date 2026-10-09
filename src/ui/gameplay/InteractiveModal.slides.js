/**
 * InteractiveModal.slides — Slide / bài giảng CLB (Google Slides presets + inline viewer).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { ROOM_SLIDE_PRESETS } from '../../config/interactions.js';
import { audioManager } from '../../utils/AudioManager.js';
import { authService } from '../../services/AuthService.js';

InteractiveModal.prototype.setupSlidesView = function(zoneData) {
  const pane = document.getElementById('pane-slides');
  if (!pane) return;
  pane.classList.remove('hidden');

  // Bảo mật: Chỉ Admin mới thấy thanh chỉnh sửa URL slide bên ngoài
  const addressBar = pane.querySelector('.slide-address-bar');
  if (addressBar) {
    if (authService.isAdmin()) {
      addressBar.style.display = 'flex';
    } else {
      addressBar.style.display = 'none';
    }
  }

  this.renderSlidePresets(zoneData);

  // Chọn slide phù hợp với phòng hiện tại
  const roomSlide = ROOM_SLIDE_PRESETS.find(s => s.room === this.currentRoomId)
    || ROOM_SLIDE_PRESETS.find(s => s.id === zoneData.id)
    || ROOM_SLIDE_PRESETS[0];

  this.loadSlideEntry(roomSlide);
}

InteractiveModal.prototype.renderSlidePresets = function(zoneData) {
  const pillsContainer = document.getElementById('slide-presets-pills');
  if (!pillsContainer) return;

  pillsContainer.innerHTML = '';
  ROOM_SLIDE_PRESETS.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `slide-pill-btn ${idx === 0 ? 'active' : ''}`;
    btn.innerHTML = `<span class="pill-room">[${item.roomName}]</span> ${item.title}`;
    btn.title = item.desc;

    btn.addEventListener('click', () => {
      pillsContainer.querySelectorAll('.slide-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.loadSlideEntry(item);
      audioManager.playClick();
    });

    pillsContainer.appendChild(btn);
  });
}

InteractiveModal.prototype.loadSlideEntry = function(item) {
  if (!item) return;
  const input = document.getElementById('slide-url-input');
  if (input) input.value = item.url || '';

  if (item.slides && item.slides.length > 0) {
    // Mode: HTML Slide nội bộ
    this.currentSlideSet = item.slides;
    this.currentSlideIndex = 0;
    this.renderInlineSlide();
  } else if (item.url) {
    // Mode: Iframe
    this.currentSlideSet = null;
    this.loadSlideIframe(item.url);
    this.showSlideIframe();
  }
}

InteractiveModal.prototype.renderInlineSlide = function() {
  const slideSet = this.currentSlideSet;
  if (!slideSet || slideSet.length === 0) return;

  const iframe = document.getElementById('slide-iframe');
  if (iframe) iframe.classList.add('hidden');

  // Tìm hoặc tạo container inline
  let inlineView = document.getElementById('slide-inline-view');
  if (!inlineView) {
    const pane = document.getElementById('pane-slides');
    inlineView = document.createElement('div');
    inlineView.id = 'slide-inline-view';
    inlineView.style.cssText = 'position:relative;width:100%;height:420px;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;';
    if (iframe) iframe.parentNode.insertBefore(inlineView, iframe);
    else pane.appendChild(inlineView);
  }
  inlineView.style.display = 'flex';

  const slide = slideSet[this.currentSlideIndex];
  const total = slideSet.length;
  const idx = this.currentSlideIndex;

  inlineView.innerHTML = `
    <div style="flex:1;background:${slide.bg || '#0f172a'};padding:24px 28px;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;">
      <div style="color:#e2e8f0;font-family:'Be Vietnam Pro',sans-serif;line-height:1.6;">${slide.content}</div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.7);padding:10px 18px;flex-shrink:0;">
      <button id="slide-prev-btn" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.85rem;" ${idx === 0 ? 'disabled style="opacity:0.4;cursor:default;background:rgba(255,255,255,0.1);border:none;color:#fff;padding:6px 14px;border-radius:8px;"' : ''}>&#8592; Trước</button>
      <div style="display:flex;gap:6px;align-items:center;">
        ${slideSet.map((_,i) => `<span style="width:8px;height:8px;border-radius:50%;background:${i===idx?'#f26f21':'rgba(255,255,255,0.3)'};display:inline-block;"></span>`).join('')}
        <span style="color:#64748b;font-size:0.78rem;margin-left:6px;">${idx+1}/${total}</span>
      </div>
      <button id="slide-next-btn" style="background:rgba(242,111,33,0.8);border:none;color:#fff;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.85rem;" ${idx === total-1 ? 'disabled style="opacity:0.4;cursor:default;background:rgba(242,111,33,0.4);border:none;color:#fff;padding:6px 14px;border-radius:8px;"' : ''}>Tiếp &#8594;</button>
    </div>
  `;

  const prevBtn = document.getElementById('slide-prev-btn');
  const nextBtn = document.getElementById('slide-next-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (this.currentSlideIndex > 0) { this.currentSlideIndex--; this.renderInlineSlide(); audioManager.playClick(); }
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (this.currentSlideIndex < slideSet.length - 1) { this.currentSlideIndex++; this.renderInlineSlide(); audioManager.playClick(); }
  });
}

InteractiveModal.prototype.showSlideIframe = function() {
  const iframe = document.getElementById('slide-iframe');
  if (iframe) iframe.classList.remove('hidden');
  const inlineView = document.getElementById('slide-inline-view');
  if (inlineView) inlineView.style.display = 'none';
}

InteractiveModal.prototype.loadSlideIframe = function(rawUrl) {
  const iframe = document.getElementById('slide-iframe');
  if (!iframe) return;

  let targetUrl = rawUrl;
  if (targetUrl.includes('docs.google.com/presentation') && targetUrl.includes('/edit')) {
    targetUrl = targetUrl.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000');
  }
  iframe.src = targetUrl;
}
