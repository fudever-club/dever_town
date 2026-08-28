import { WARDROBE_CONFIG } from '../config/wardrobe.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';
import { authService } from '../services/AuthService.js';

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
      gender: 'male',
      outfitId: 'hoodie_fuda',
      outfitType: 'hoodie',
      hoodieColor: '#f26f21',
      collarColor: '#002147',
      hairstyle: 'short',
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
    if (this.scene?.inputController) {
      this.scene.inputController.enableInput();
    }
  }

  render() {
    this.renderGenderOptions();
    this.renderOutfitOptions();
    this.renderHairstyleOptions();
    this.renderHairColorOptions();
    this.renderAccessoryOptions();
    this.updatePreviewCanvas();
  }

  renderGenderOptions() {
    const container = document.getElementById('wardrobe-gender-list');
    if (!container) return;

    container.innerHTML = '';
    WARDROBE_CONFIG.genders.forEach(g => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = this.currentConfig.gender === g.id;
      btn.className = `wardrobe-gender-btn ${isSelected ? 'selected' : ''}`;
      btn.textContent = g.name;

      btn.addEventListener('click', () => {
        this.currentConfig.gender = g.id;
        if (g.id === 'female' && this.currentConfig.hairstyle === 'short') {
          this.currentConfig.hairstyle = 'long';
        } else if (g.id === 'male' && this.currentConfig.hairstyle === 'long') {
          this.currentConfig.hairstyle = 'short';
        }
        this.render();
      });

      container.appendChild(btn);
    });
  }

  renderOutfitOptions() {
    const container = document.getElementById('wardrobe-outfit-list');
    if (!container) return;

    container.innerHTML = '';
    WARDROBE_CONFIG.outfits.forEach(outfit => {
      const card = document.createElement('div');
      const isSelected = this.currentConfig.outfitId === outfit.id;
      card.className = `wardrobe-outfit-card ${isSelected ? 'selected' : ''}`;

      card.innerHTML = `
        <div class="outfit-color-dot" style="background-color: ${outfit.color};"></div>
        <div class="outfit-info">
          <div class="outfit-name">${outfit.name}</div>
          <div class="outfit-desc">${outfit.desc}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.currentConfig.outfitId = outfit.id;
        this.currentConfig.outfitType = outfit.type;
        this.currentConfig.hoodieColor = outfit.color;
        this.currentConfig.collarColor = outfit.collarColor || '#002147';
        this.render();
      });

      container.appendChild(card);
    });
  }

  renderHairstyleOptions() {
    const container = document.getElementById('wardrobe-hairstyle-list');
    if (!container) return;

    container.innerHTML = '';
    WARDROBE_CONFIG.hairstyles.forEach(style => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = this.currentConfig.hairstyle === style.id;
      btn.className = `wardrobe-chip-btn ${isSelected ? 'selected' : ''}`;
      btn.textContent = style.name;

      btn.addEventListener('click', () => {
        this.currentConfig.hairstyle = style.id;
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
      gender: this.currentConfig.gender || 'male',
      hairstyle: this.currentConfig.hairstyle || 'short',
      hair: this.currentConfig.hairColor || '#0f172a',
      skin: '#fcd34d',
      outfitType: this.currentConfig.outfitType || 'hoodie',
      shirt: this.currentConfig.hoodieColor || '#f26f21',
      collarColor: this.currentConfig.collarColor || '#002147',
      pants: (this.currentConfig.outfitType === 'aodai') ? '#ffffff' : ((this.currentConfig.outfitType === 'dress' || this.currentConfig.outfitType === 'sailor') ? '#38bdf8' : '#1e293b'),
      accessory: this.currentConfig.accessory || 'none'
    };

    TextureGenerator.drawCharacterFrame(tempCtx, 0, 0, 'down', 1, config);

    // Scale lên canvas preview (4x = 128x128)
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

    this.syncToServer();
    this.hide();
  }

  async syncToServer() {
    try {
      if (authService && authService.isLoggedIn()) {
        const equippedItemId = localStorage.getItem('dever_equipped_item') || null;
        await authService.syncFullProfile({
          wardrobeConfig: this.currentConfig,
          equippedItemId
        });
      }
    } catch (e) {
      // Local storage fallback
    }
  }
}
