import { WARDROBE_CONFIG } from '../config/wardrobe.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class WardrobeModal {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene
   * @param {Function} options.onApply
   */
  constructor({ scene, onApply } = {}) {
    this.scene = scene;
    this.onApply = onApply;
    this.modalEl = document.getElementById('wardrobe-modal');

    this.currentConfig = {
      hoodieColor: '#f26f21',
      hairColor: '#0f172a',
      accessory: 'none'
    };

    this.loadFromStorage();
    this.initEvents();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('dever_wardrobe_config');
      if (saved) {
        this.currentConfig = { ...this.currentConfig, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Lỗi nạp Wardrobe từ Storage:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('dever_wardrobe_config', JSON.stringify(this.currentConfig));
    } catch (e) {
      console.warn('Lỗi lưu Wardrobe vào Storage:', e);
    }
  }

  initEvents() {
    if (!this.modalEl) return;

    // Nút đóng modal
    const closeBtn = document.getElementById('wardrobe-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Click backdrop
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    // Phím Escape đóng modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });

    // Nút Lưu & Áp Dụng
    const applyBtn = document.getElementById('wardrobe-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.handleApply());
    }
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  show() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.render();
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
  }

  render() {
    this.renderHoodieOptions();
    this.renderHairColorOptions();
    this.renderAccessoryOptions();
    this.updatePreviewCanvas();
  }

  renderHoodieOptions() {
    const container = document.getElementById('wardrobe-hoodie-list');
    if (!container) return;

    container.innerHTML = '';
    WARDROBE_CONFIG.hoodies.forEach(h => {
      const btn = document.createElement('div');
      const isSelected = this.currentConfig.hoodieColor === h.color;
      btn.className = `wardrobe-color-chip ${isSelected ? 'selected' : ''}`;
      btn.style.backgroundColor = h.color;
      btn.title = `${h.name} - ${h.desc}`;

      btn.addEventListener('click', () => {
        this.currentConfig.hoodieColor = h.color;
        this.render();
      });

      container.appendChild(btn);
    });
  }

  renderHairColorOptions() {
    const container = document.getElementById('wardrobe-hair-list');
    if (!container) return;

    container.innerHTML = '';
    WARDROBE_CONFIG.hairColors.forEach(hair => {
      const btn = document.createElement('div');
      const isSelected = this.currentConfig.hairColor === hair.color;
      btn.className = `wardrobe-color-chip ${isSelected ? 'selected' : ''}`;
      btn.style.backgroundColor = hair.color;
      btn.title = hair.name;

      btn.addEventListener('click', () => {
        this.currentConfig.hairColor = hair.color;
        this.render();
      });

      container.appendChild(btn);
    });
  }

  renderAccessoryOptions() {
    const container = document.getElementById('wardrobe-acc-list');
    if (!container) return;

    container.innerHTML = '';
    WARDROBE_CONFIG.accessories.forEach(acc => {
      const btn = document.createElement('div');
      const isSelected = this.currentConfig.accessory === acc.id;
      btn.className = `wardrobe-acc-card ${isSelected ? 'selected' : ''}`;
      btn.innerHTML = `<span class="acc-icon">${acc.icon}</span><span class="acc-name">${acc.name}</span>`;
      btn.title = acc.desc;

      btn.addEventListener('click', () => {
        this.currentConfig.accessory = acc.id;
        this.render();
      });

      container.appendChild(btn);
    });
  }

  updatePreviewCanvas() {
    const canvas = document.getElementById('wardrobe-preview-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ nền preview
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f26f21';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Tạo canvas nhân vật tạm thời
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 32;
    tempCanvas.height = 32;
    const tempCtx = tempCanvas.getContext('2d');

    const config = {
      hair: this.currentConfig.hairColor,
      skin: '#fcd34d',
      shirt: this.currentConfig.hoodieColor,
      pants: '#1e293b',
      accessory: this.currentConfig.accessory
    };

    TextureGenerator.drawCharacterFrame(tempCtx, 0, 0, 'down', 1, config);

    // Scale lên canvas preview to rõ (4x = 128x128)
    ctx.drawImage(tempCanvas, 0, 0, 32, 32, (canvas.width - 128) / 2, (canvas.height - 128) / 2 + 10, 128, 128);
  }

  handleApply() {
    this.saveToStorage();
    const customKey = 'custom_wardrobe';

    if (this.scene) {
      TextureGenerator.generateCustomAvatar(this.scene, this.currentConfig, `char_${customKey}`);

      if (this.scene.player) {
        this.scene.player.setCustomWardrobe(customKey, this.currentConfig);
      }

      if (this.scene.socketManager) {
        this.scene.socketManager.socket?.emit('updateWardrobe', {
          wardrobeConfig: this.currentConfig
        });
      }
    }

    if (this.onApply) {
      this.onApply(this.currentConfig);
    }

    this.hide();
  }
}
