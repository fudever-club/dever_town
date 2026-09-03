/**
 * EmoteBar: Thanh phản ứng & biểu cảm nhanh (HotKey [G] hoặc Chạm trên Mobile)
 * Hỗ trợ 6 biểu cảm hoạt ảnh: Vẫy tay, Thả tim, Cháy quá, Vỗ tay, Nhảy múa và Thắc mắc.
 */
import { audioManager } from '../../utils/AudioManager.js';

export const EMOTE_DEFINITIONS = [
  { id: 'wave', label: 'Vẫy Chào', icon: '👋', hotkey: '1' },
  { id: 'heart', label: 'Thả Tim', icon: '❤️', hotkey: '2' },
  { id: 'fire', label: 'Cháy Quá', icon: '🔥', hotkey: '3' },
  { id: 'clap', label: 'Vỗ Tay', icon: '👏', hotkey: '4' },
  { id: 'dance', label: 'Nhảy Múa', icon: '🕺', hotkey: '5' },
  { id: 'question', label: 'Thắc Mắc', icon: '❓', hotkey: '6' }
];

export class EmoteBar {
  /**
   * @param {Object} options
   * @param {Function} options.onSelectEmote
   */
  constructor({ onSelectEmote } = {}) {
    this.onSelectEmote = onSelectEmote;
    this.isOpen = false;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'emote-bar';
    this.container.className = 'emote-bar-container hidden';

    const itemsHtml = EMOTE_DEFINITIONS.map(item => `
      <button type="button" class="emote-item-btn" data-emote="${item.id}" title="${item.label} [${item.hotkey}]">
        <span class="emote-icon">${item.icon}</span>
        <span class="emote-label">${item.label}</span>
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="emote-bar-card">
        <div class="emote-bar-header">
          <span class="emote-bar-title">BIỂU CẢM NHANH [G]</span>
          <button type="button" class="emote-close-btn" id="emote-close-btn">✕</button>
        </div>
        <div class="emote-list">
          ${itemsHtml}
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.closeBtn = this.container.querySelector('#emote-close-btn');
    this.buttons = this.container.querySelectorAll('.emote-item-btn');
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    this.buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoteId = btn.getAttribute('data-emote');
        if (emoteId) {
          this.triggerEmote(emoteId);
        }
      });
    });

    // Lắng nghe phím tắt G & 1-6 khi đang mở
    window.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'KeyG') {
        e.preventDefault();
        this.toggle();
        return;
      }

      if (this.isOpen && ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) {
        e.preventDefault();
        const index = parseInt(e.code.replace('Digit', ''), 10) - 1;
        const emote = EMOTE_DEFINITIONS[index];
        if (emote) {
          this.triggerEmote(emote.id);
        }
        return;
      }

      if (this.isOpen && e.code === 'Escape') {
        this.hide();
      }
    });

    // Click outside to close
    document.addEventListener('pointerdown', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        const openBtn = document.getElementById('header-emote-btn');
        if (openBtn && openBtn.contains(e.target)) return;
        this.hide();
      }
    });
  }

  triggerEmote(emoteId) {
    audioManager.playEmoteSound(emoteId);
    if (this.onSelectEmote) {
      this.onSelectEmote(emoteId);
    }
    this.hide();
  }

  show() {
    this.isOpen = true;
    this.container.classList.remove('hidden');
    void this.container.offsetWidth;
    this.container.classList.add('visible');
  }

  hide() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    setTimeout(() => {
      if (!this.isOpen) {
        this.container.classList.add('hidden');
      }
    }, 200);
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
