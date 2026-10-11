/**
 * EmoteBar: Thanh phản ứng & biểu cảm nhanh (HotKey [G] hoặc Chạm trên Mobile)
 * Hỗ trợ 8 biểu cảm: Vẫy tay (tay vẫy động), Thả tim, Cháy quá, Vỗ tay,
 * Nhảy múa (dance step), Gật đầu, Power pose và Thắc mắc.
 */
import { audioManager } from '../../utils/AudioManager.js';
import { getEmoteIconURL } from '../../utils/emoteIcons.js';

export const EMOTE_DEFINITIONS = [
  { id: 'wave', label: 'Vẫy Chào', hotkey: '1' },
  { id: 'heart', label: 'Thả Tim', hotkey: '2' },
  { id: 'fire', label: 'Cháy Quá', hotkey: '3' },
  { id: 'clap', label: 'Vỗ Tay', hotkey: '4' },
  { id: 'dance', label: 'Nhảy Múa', hotkey: '5' },
  { id: 'question', label: 'Thắc Mắc', hotkey: '6' },
  { id: 'nod', label: 'Gật Đầu', hotkey: '7' },
  { id: 'power', label: 'Power Pose', hotkey: '8' }
];

export class EmoteBar {
  /**
   * @param {Object} options
   * @param {Object} options.scene - Phaser scene (để lấy pixel emote icons)
   * @param {Function} options.onSelectEmote
   */
  constructor({ scene, onSelectEmote } = {}) {
    this.scene = scene || null;
    this.onSelectEmote = onSelectEmote;
    this.isOpen = false;

    this.initDOM();
    this.bindEvents();
  }

  /** Icon hiển thị: pixel icon 16x16, fallback ô trống (không dùng emoji). */
  getEmoteIconHTML(item) {
    const url = this.scene
      ? getEmoteIconURL(this.scene, item.id)
      : null;
    if (url) {
      return `<img class="emote-icon-img" src="${url}" alt="${item.label}" width="32" height="32" style="image-rendering: pixelated;" />`;
    }
    return `<span class="emote-icon-fallback" aria-hidden="true"></span>`;
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.id = 'emote-bar';
    this.container.className = 'emote-bar-container hidden';

    const itemsHtml = EMOTE_DEFINITIONS.map(item => `
      <button type="button" class="emote-item-btn" data-emote="${item.id}" title="${item.label} [${item.hotkey}]">
        ${this.getEmoteIconHTML(item)}
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

      if (this.isOpen && ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'].includes(e.code)) {
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
