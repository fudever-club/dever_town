import { ITEMS_DATABASE } from '../../config/items.js';

export class InventoryModal {
  /**
   * @param {Object} options
   * @param {Object} options.inventoryManager
   */
  constructor({ inventoryManager } = {}) {
    this.inventoryManager = inventoryManager;
    this.modalEl = document.getElementById('inventory-modal');
    this.selectedItemId = null;

    this.initEvents();
  }

  initEvents() {
    if (!this.modalEl) return;

    // Nút đóng modal
    const closeBtn = document.getElementById('inventory-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Click backdrop
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    // Phím Escape đóng modal, phím I mở/đóng túi đồ
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      } else if ((e.key === 'i' || e.key === 'I') && !this.isInputFocused()) {
        e.preventDefault();
        this.toggle();
      }
    });

    // Nút Trang bị / Tháo bỏ
    const equipBtn = document.getElementById('inventory-equip-btn');
    if (equipBtn) {
      equipBtn.addEventListener('click', () => {
        if (!this.selectedItemId) return;
        const equipped = this.inventoryManager.getEquippedItem();

        if (equipped && equipped.id === this.selectedItemId) {
          this.inventoryManager.unequipItem();
        } else {
          this.inventoryManager.equipItem(this.selectedItemId);
        }
        this.render();
      });
    }
  }

  isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  toggle() {
    if (this.isOpen()) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');

    const items = this.inventoryManager.getItems();
    const itemKeys = Object.keys(items);
    if (!this.selectedItemId || !items[this.selectedItemId]) {
      this.selectedItemId = itemKeys.length > 0 ? itemKeys[0] : 'fptu_keychain';
    }

    this.render();
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
  }

  render() {
    const gridEl = document.getElementById('inventory-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';
    const userItems = this.inventoryManager.getItems();
    const equipped = this.inventoryManager.getEquippedItem();

    Object.values(ITEMS_DATABASE).forEach(item => {
      const count = userItems[item.id] || 0;
      const isSelected = item.id === this.selectedItemId;
      const isEquipped = equipped && equipped.id === item.id;

      const card = document.createElement('div');
      card.className = `inventory-item-card ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''} ${count === 0 ? 'empty' : ''}`;
      card.style.borderColor = isSelected ? item.accentColor : 'rgba(255, 255, 255, 0.1)';

      card.innerHTML = `
        <div class="item-icon-wrapper" style="background: ${count > 0 ? 'rgba(15, 23, 42, 0.8)' : 'rgba(0, 0, 0, 0.4)'}">
          <span class="item-icon">${item.icon}</span>
          ${count > 1 ? `<span class="item-count">${count}</span>` : ''}
          ${isEquipped ? `<span class="equipped-badge">Đang Cầm</span>` : ''}
        </div>
        <span class="item-card-name">${item.name}</span>
      `;

      card.addEventListener('click', () => {
        this.selectedItemId = item.id;
        this.render();
      });

      gridEl.appendChild(card);
    });

    this.renderDetails();
  }

  renderDetails() {
    const item = ITEMS_DATABASE[this.selectedItemId];
    if (!item) return;

    const userItems = this.inventoryManager.getItems();
    const count = userItems[item.id] || 0;
    const equipped = this.inventoryManager.getEquippedItem();
    const isEquipped = equipped && equipped.id === item.id;

    const nameEl = document.getElementById('inv-detail-name');
    const tagEl = document.getElementById('inv-detail-tag');
    const rarityEl = document.getElementById('inv-detail-rarity');
    const descEl = document.getElementById('inv-detail-desc');
    const countEl = document.getElementById('inv-detail-count');
    const iconBigEl = document.getElementById('inv-detail-icon-big');
    const equipBtn = document.getElementById('inventory-equip-btn');

    if (nameEl) nameEl.textContent = item.name;
    if (tagEl) tagEl.textContent = item.tag;
    if (rarityEl) {
      rarityEl.textContent = item.rarity.toUpperCase();
      rarityEl.className = `rarity-badge ${item.rarity}`;
    }
    if (descEl) descEl.textContent = item.desc;
    if (countEl) countEl.textContent = `Số lượng sở hữu: ${count}`;
    if (iconBigEl) iconBigEl.textContent = item.icon;

    if (equipBtn) {
      if (count === 0) {
        equipBtn.disabled = true;
        equipBtn.textContent = 'Chưa sở hữu (Hãy tìm nhặt trên bản đồ)';
        equipBtn.className = 'btn-equip disabled';
      } else if (isEquipped) {
        equipBtn.disabled = false;
        equipBtn.textContent = 'Tháo Bỏ Khỏi Tay';
        equipBtn.className = 'btn-equip unequip';
      } else {
        equipBtn.disabled = false;
        equipBtn.textContent = 'Trang Bị Cầm Tay ✨';
        equipBtn.className = 'btn-equip equip';
      }
    }
  }
}
