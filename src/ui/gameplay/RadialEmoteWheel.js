/**
 * DEVER TOWN - RADIAL EMOTE WHEEL (DELVERIUM INSPIRED)
 * Vòng xoay 8 biểu cảm nhanh mượt mà (Giữ Tab hoặc nút Mobile để mở)
 * Làm chậm chuyển động tạm thời (bullet-time feel) để chọn biểu cảm
 */

import { audioManager } from '../../utils/AudioManager.js';

export const RADIAL_EMOTES = [
  { id: 'wave', label: 'Vẫy Chào', icon: '👋', angle: 0 },
  { id: 'heart', label: 'Thả Tim', icon: '💖', angle: 45 },
  { id: 'fireworks', label: 'Pháo Hoa', icon: '🎉', angle: 90 },
  { id: 'dance', label: 'Nhảy Múa', icon: '💃', angle: 135 },
  { id: 'buggy', label: 'Linh Vật Buggy', icon: '🐞', angle: 180 },
  { id: 'fire', label: 'Cháy Quá', icon: '🔥', angle: 225 },
  { id: 'clap', label: 'Vỗ Tay', icon: '👏', angle: 270 },
  { id: 'question', label: 'Thắc Mắc', icon: '❓', angle: 315 }
];

export class RadialEmoteWheel {
  /**
   * @param {Object} options
   * @param {import('../../scenes/WorldScene.js').WorldScene} options.scene
   * @param {Function} options.onSelectEmote
   */
  constructor({ scene, onSelectEmote } = {}) {
    this.scene = scene;
    this.onSelectEmote = onSelectEmote;
    this.isOpen = false;
    this.hoveredEmote = null;
    this.radius = 100; // Khoảng cách từ tâm đến các nút

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'radial-emote-overlay';
    this.overlay.className = 'radial-emote-overlay hidden';

    // Tạo bánh xe radial 8 phân đoạn
    const wheel = document.createElement('div');
    wheel.className = 'radial-wheel-container';

    // Tâm bánh xe hiển thị thông tin emote đang trỏ
    this.centerEl = document.createElement('div');
    this.centerEl.className = 'radial-wheel-center';
    this.centerEl.innerHTML = `
      <span class="center-icon">🐞</span>
      <span class="center-label">CHỌN BIỂU CẢM</span>
    `;
    wheel.appendChild(this.centerEl);

    // 8 Nút tròn phân bổ đều theo góc
    this.sliceButtons = [];
    RADIAL_EMOTES.forEach((emote, index) => {
      // Tính tọa độ x, y theo góc
      const rad = (emote.angle - 90) * (Math.PI / 180);
      const x = Math.round(Math.cos(rad) * this.radius);
      const y = Math.round(Math.sin(rad) * this.radius);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'radial-slice-btn';
      btn.dataset.emoteId = emote.id;
      btn.dataset.index = index;
      btn.style.left = `calc(50% + ${x}px - 27px)`;
      btn.style.top = `calc(50% + ${y}px - 27px)`;
      btn.innerHTML = `<span class="radial-slice-icon">${emote.icon}</span>`;

      btn.addEventListener('mouseenter', () => this.highlightEmote(emote));
      btn.addEventListener('mouseleave', () => this.unhighlightEmote(emote));
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectEmote(emote.id);
      });

      wheel.appendChild(btn);
      this.sliceButtons.push(btn);
    });

    this.overlay.appendChild(wheel);
    document.body.appendChild(this.overlay);
  }

  bindEvents() {
    // 1. Giữ phím Tab để mở vòng xoay (bullet-time feel), nhả Tab để kích hoạt
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        if (!this.isOpen) {
          this.show();
        }
      } else if (e.code === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.hide(false);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        if (this.isOpen) {
          if (this.hoveredEmote) {
            this.selectEmote(this.hoveredEmote.id);
          } else {
            this.hide(false);
          }
        }
      }
    });

    // 2. Di chuyển chuột trên overlay để tự động chọn phân đoạn gần nhất
    this.overlay.addEventListener('pointermove', (e) => {
      if (!this.isOpen) return;
      const rect = this.centerEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      // Nếu chuột quá gần tâm (< 28px) thì chưa chọn
      if (dist < 28) {
        this.clearHighlight();
        return;
      }

      // Tính góc từ -180 đến 180 độ, đổi sang 0 - 360 độ bắt đầu từ đỉnh (12h)
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;

      // Tìm emote gần góc nhất (mỗi phân đoạn 45 độ)
      let closest = null;
      let minDiff = Infinity;
      RADIAL_EMOTES.forEach(em => {
        let diff = Math.abs(deg - em.angle);
        if (diff > 180) diff = 360 - diff;
        if (diff < minDiff) {
          minDiff = diff;
          closest = em;
        }
      });

      if (closest && closest !== this.hoveredEmote) {
        this.highlightEmote(closest);
      }
    });

    // Click ra ngoài overlay đóng lại
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide(false);
      }
    });
  }

  highlightEmote(emote) {
    this.hoveredEmote = emote;
    this.sliceButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.emoteId === emote.id);
    });

    if (this.centerEl) {
      this.centerEl.innerHTML = `
        <span class="center-icon">${emote.icon}</span>
        <span class="center-label">${emote.label}</span>
      `;
    }
  }

  unhighlightEmote(emote) {
    if (this.hoveredEmote === emote) {
      this.clearHighlight();
    }
  }

  clearHighlight() {
    this.hoveredEmote = null;
    this.sliceButtons.forEach(b => b.classList.remove('active'));
    if (this.centerEl) {
      this.centerEl.innerHTML = `
        <span class="center-icon">🐞</span>
        <span class="center-label">CHỌN BIỂU CẢM</span>
      `;
    }
  }

  show() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.overlay.classList.remove('hidden');
    this.clearHighlight();

    // Hiệu ứng làm chậm nhẹ thời gian (Bullet-time) phong cách Delverium
    if (this.scene?.player) {
      this.scene.player.speedMultiplier = 0.35;
    }

    audioManager.playClick();
  }

  hide(triggerSelected = true) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.classList.add('hidden');

    // Khôi phục tốc độ di chuyển bình thường
    if (this.scene?.player) {
      this.scene.player.speedMultiplier = 1.0;
    }

    if (triggerSelected && this.hoveredEmote) {
      this.selectEmote(this.hoveredEmote.id);
    }
  }

  selectEmote(emoteId) {
    audioManager.playChime?.() || audioManager.playClick();
    this.hide(false);
    if (this.onSelectEmote) {
      this.onSelectEmote(emoteId);
    }
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
