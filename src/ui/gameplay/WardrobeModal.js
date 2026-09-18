import { WARDROBE_CONFIG, CHARACTER_PRESETS } from '../../config/wardrobe.js';
import { TextureGenerator } from '../../utils/TextureGenerator.js';
import { authService } from '../../services/AuthService.js';

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

    this.currentTab = 'all'; // 'all' | 'male' | 'female'

    this.currentConfig = {
      characterId: 'hoodie_dever',
      outfitId: 'hoodie_dever',
      inHandItem: 'none',
      gender: 'male'
    };

    this.previewDirections = ['down', 'left', 'up', 'right'];
    this.currentDirIndex = 0;

    this.loadFromStorage();
    this.initEvents();
  }

  loadFromStorage() {
    try {
      const user = authService?.getUser();
      if (user && user.wardrobe_config) {
        this.currentConfig = { ...this.currentConfig, ...user.wardrobe_config };
        return;
      }
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

    // Tab buttons (Chung, Nam, Nữ)
    const tabsContainer = document.getElementById('wardrobe-tabs-container');
    if (tabsContainer) {
      const tabBtns = tabsContainer.querySelectorAll('.wardrobe-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetTab = btn.getAttribute('data-tab') || 'all';
          this.currentTab = targetTab;
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderCharacterOptions();
        });
      });
    }

    // Nút Lưu & Áp Dụng
    const applyBtn = document.getElementById('wardrobe-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.handleApply());
    }

    // Nút Xoay 360 độ Preview
    const rotLeft = document.getElementById('wardrobe-rotate-left');
    if (rotLeft) {
      rotLeft.addEventListener('click', () => {
        this.currentDirIndex = (this.currentDirIndex - 1 + this.previewDirections.length) % this.previewDirections.length;
        this.updatePreviewCanvas();
      });
    }

    const rotRight = document.getElementById('wardrobe-rotate-right');
    if (rotRight) {
      rotRight.addEventListener('click', () => {
        this.currentDirIndex = (this.currentDirIndex + 1) % this.previewDirections.length;
        this.updatePreviewCanvas();
      });
    }
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  show() {
    if (!this.modalEl) return;
    this.loadFromStorage();
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
    this.renderCharacterOptions();
    this.renderInHandOptions();
    this.updatePreviewCanvas();
  }

  renderCharacterOptions() {
    const container = document.getElementById('wardrobe-character-list');
    if (!container) return;

    container.innerHTML = '';

    // Lọc danh sách nhân vật theo tab hiện tại (all | male | female)
    const filteredChars = (CHARACTER_PRESETS || []).filter(char => {
      if (this.currentTab === 'all') return true;
      if (this.currentTab === 'male') return char.gender === 'male' || char.gender === 'unisex';
      if (this.currentTab === 'female') return char.gender === 'female' || char.gender === 'unisex';
      return true;
    });

    const activeCharId = this.currentConfig.characterId || this.currentConfig.outfitId || 'hoodie_dever';

    filteredChars.forEach(char => {
      const card = document.createElement('div');
      const isSelected = activeCharId === char.id;
      card.className = `wardrobe-character-card ${isSelected ? 'selected' : ''}`;

      // Thumbnail Canvas Chibi mini
      const thumbBox = document.createElement('div');
      thumbBox.className = 'character-card-thumb';
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 48;
      thumbCanvas.height = 64;
      const thumbCtx = thumbCanvas.getContext('2d');
      thumbCtx.imageSmoothingEnabled = false;

      // Vẽ frame 0 mặt trước của spritesheet
      const texKey = char.spriteKey || `char_${char.id}`;
      if (this.scene?.textures?.exists(texKey)) {
        try {
          const srcImg = this.scene.textures.get(texKey).getSourceImage();
          if (srcImg) {
            thumbCtx.drawImage(srcImg, 0, 0, 48, 64, 0, 0, 48, 64);
          }
        } catch (e) {}
      }
      thumbBox.appendChild(thumbCanvas);

      // Thẻ thông tin nhân vật
      const infoBox = document.createElement('div');
      infoBox.className = 'character-card-info';

      const nameEl = document.createElement('div');
      nameEl.className = 'character-card-name';
      nameEl.textContent = char.name;

      const roleEl = document.createElement('div');
      roleEl.className = 'character-card-role';
      roleEl.textContent = char.role || '';

      const descEl = document.createElement('div');
      descEl.className = 'character-card-desc';
      descEl.textContent = char.desc || '';

      const tagsEl = document.createElement('div');
      tagsEl.className = 'character-card-tags';
      (char.tags || []).forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'character-tag';
        tagSpan.textContent = tag;
        tagsEl.appendChild(tagSpan);
      });

      infoBox.appendChild(nameEl);
      infoBox.appendChild(roleEl);
      infoBox.appendChild(descEl);
      infoBox.appendChild(tagsEl);

      card.appendChild(thumbBox);
      card.appendChild(infoBox);

      card.addEventListener('click', () => {
        this.currentConfig.characterId = char.id;
        this.currentConfig.outfitId = char.id;
        this.currentConfig.gender = char.gender || 'male';
        this.renderCharacterOptions();
        this.updatePreviewCanvas();
      });

      container.appendChild(card);
    });
  }

  renderInHandOptions() {
    const container = document.getElementById('wardrobe-inhand-list');
    if (!container) return;

    container.innerHTML = '';
    (WARDROBE_CONFIG.inHandEquipments || []).forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = (this.currentConfig.inHandItem || 'none') === item.id;
      btn.className = `wardrobe-chip-btn ${isSelected ? 'selected' : ''}`;
      btn.textContent = item.name;
      btn.title = item.desc || '';

      btn.addEventListener('click', () => {
        this.currentConfig.inHandItem = item.id;
        this.currentConfig.equippedItemId = item.id;
        this.renderInHandOptions();
        this.updatePreviewCanvas();
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
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vầng sáng spotlight sau lưng
    const radial = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 8, canvas.width / 2, canvas.height / 2, 70);
    radial.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    radial.addColorStop(1, 'rgba(11, 19, 41, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Viền khung neon sắc nét
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Tạo canvas nhân vật tạm thời (48x64 khớp với kích thước frame sprite)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 48;
    tempCanvas.height = 64;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    const currentDir = this.previewDirections[this.currentDirIndex] || 'down';
    const charId = this.currentConfig.characterId || this.currentConfig.outfitId || 'hoodie_dever';
    const normalizedCharId = charId === 'barista_apron' ? 'apron_barista' : charId;
    const prebakedKey = `char_${normalizedCharId}`;

    let rendered = false;
    if (this.scene?.textures?.exists(prebakedKey)) {
      try {
        const srcTex = this.scene.textures.get(prebakedKey);
        const srcImg = srcTex.getSourceImage();
        if (srcImg) {
          const dirRow = { 'down': 0, 'left': 1, 'right': 2, 'up': 3 }[currentDir] ?? 0;
          tempCtx.drawImage(srcImg, 0, dirRow * 64, 48, 64, 0, 0, 48, 64);
          rendered = true;

          // Vẽ vật phẩm cầm tay (in-hand equipment) đè lên tay
          if (this.currentConfig.inHandItem && this.currentConfig.inHandItem !== 'none') {
            TextureGenerator.drawInHandEquipment(tempCtx, 0, 0, currentDir, 0, this.currentConfig.inHandItem);
          }
        }
      } catch (e) {}
    }

    if (!rendered) {
      // Fallback vẽ frame tĩnh cơ bản nếu texture chưa sẵn sàng
      const fallbackConfig = {
        gender: this.currentConfig.gender || 'male',
        skinTone: 'skin_natural',
        hair: '#0f172a',
        shirt: '#2563eb',
        pants: '#1e293b'
      };
      TextureGenerator.drawCharacterFrame(tempCtx, 0, 0, currentDir, 0, fallbackConfig);
    }

    // Scale lên canvas preview (2.3x = ~110x147, vừa vặn khung 160x160)
    const scaledW = 110;
    const scaledH = 147;
    ctx.drawImage(
      tempCanvas,
      0, 0, 48, 64,
      Math.floor((canvas.width - scaledW) / 2),
      Math.floor((canvas.height - scaledH) / 2) + 4,
      scaledW, scaledH
    );
  }

  handleApply() {
    this.saveToStorage();
    const charId = this.currentConfig.characterId || this.currentConfig.outfitId || 'hoodie_dever';

    if (this.scene) {
      if (this.scene.player) {
        this.scene.player.setCustomWardrobe(charId, this.currentConfig);
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
        const equippedItemId = this.currentConfig.inHandItem || localStorage.getItem('dever_equipped_item') || null;
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
