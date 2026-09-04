import Phaser from 'phaser';
import { ITEMS_DATABASE, PICKUP_SPOTS } from '../config/items.js';
import { audioManager } from '../utils/AudioManager.js';
import { authService } from '../services/AuthService.js';

export class InventoryManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} options
   * @param {Function} options.onInventoryChange
   * @param {Function} options.onEquipChange
   */
  constructor(scene, { onInventoryChange, onEquipChange } = {}) {
    this.scene = scene;
    this.onInventoryChange = onInventoryChange;
    this.onEquipChange = onEquipChange;

    this.items = {}; // { itemId: count }
    this.equippedItemId = null;
    this.pickupSprites = [];

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('dever_inventory_items');
      if (saved) {
        this.items = JSON.parse(saved);
      } else {
        // Mặc định tặng người chơi mới Móc khóa FPTU & Cốc Cà Phê
        this.items = {
          fptu_keychain: 1,
          thermos_coffee: 1
        };
        this.saveToStorage();
      }

      this.equippedItemId = localStorage.getItem('dever_equipped_item') || null;
    } catch (err) {
      console.warn('Lỗi nạp Inventory từ LocalStorage:', err);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('dever_inventory_items', JSON.stringify(this.items));
      if (this.equippedItemId) {
        localStorage.setItem('dever_equipped_item', this.equippedItemId);
      } else {
        localStorage.removeItem('dever_equipped_item');
      }
    } catch (err) {
      console.warn('Lỗi lưu Inventory vào LocalStorage:', err);
    }
  }

  getItems() {
    return this.items;
  }

  getEquippedItem() {
    return this.equippedItemId ? ITEMS_DATABASE[this.equippedItemId] : null;
  }

  addItem(itemId, amount = 1) {
    if (!ITEMS_DATABASE[itemId]) return;
    this.items[itemId] = (this.items[itemId] || 0) + amount;
    this.saveToStorage();
    this.syncToServer();

    if (this.onInventoryChange) {
      this.onInventoryChange(this.items);
    }

    audioManager.playPickup();
    this.showToast(`+${amount} ${ITEMS_DATABASE[itemId].name} ${ITEMS_DATABASE[itemId].icon}`);
  }

  equipItem(itemId) {
    if (itemId && (!this.items[itemId] || this.items[itemId] <= 0)) {
      return false;
    }

    this.equippedItemId = itemId;
    this.saveToStorage();

    if (this.onEquipChange) {
      this.onEquipChange(this.getEquippedItem());
    }

    if (this.scene.player) {
      this.scene.player.setEquippedItem(itemId);
    }

    if (this.scene.socketManager) {
      this.scene.socketManager.socket?.emit('equipItem', { itemId });
    }

    this.syncToServer(itemId);
    return true;
  }

  unequipItem() {
    this.equippedItemId = null;
    this.saveToStorage();

    if (this.onEquipChange) {
      this.onEquipChange(null);
    }

    if (this.scene.player) {
      this.scene.player.setEquippedItem(null);
    }

    if (this.scene.socketManager) {
      this.scene.socketManager.socket?.emit('equipItem', { itemId: null });
    }

    this.syncToServer(null);
    return true;
  }

  async syncToServer(equippedItemId = this.equippedItemId) {
    try {
      if (authService && authService.isLoggedIn()) {
        return await authService.syncFullProfile({
          inventoryItems: this.items,
          equippedItemId: equippedItemId
        });
      }
    } catch (e) {
      // LocalStorage fallback
    }
    return null;
  }

  /**
   * Khởi tạo các điểm nhặt đồ trên bản đồ hiện tại
   */
  loadPickupsForRoom(roomId) {
    this.clearPickups();

    const spots = PICKUP_SPOTS.filter(s => s.roomId === roomId);
    const tileSize = 32;

    spots.forEach(spot => {
      const item = ITEMS_DATABASE[spot.itemId];
      if (!item) return;

      const posX = spot.tileX * tileSize + tileSize / 2;
      const posY = spot.tileY * tileSize + tileSize / 2;

      const pickupContainer = this.scene.add.container(posX, posY);
      pickupContainer.setDepth(10);

      // Vòng tròn phát sáng nhỏ
      const halo = this.scene.add.graphics();
      halo.fillStyle(0xf26f21, 0.35);
      halo.fillCircle(0, 0, 12);
      halo.lineStyle(1.5, 0xfbbf24, 0.8);
      halo.strokeCircle(0, 0, 12);

      // Icon Emoji
      const iconText = this.scene.add.text(0, 0, item.icon, {
        fontSize: '14px'
      }).setOrigin(0.5, 0.5);

      pickupContainer.add([halo, iconText]);

      // Tween bồng bềnh
      const tween = this.scene.tweens.add({
        targets: pickupContainer,
        y: posY - 6,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.pickupSprites.push({
        container: pickupContainer,
        tween,
        spot,
        posX,
        posY,
        isCollected: false
      });
    });
  }

  clearPickups() {
    this.pickupSprites.forEach(p => {
      if (p.tween) p.tween.stop();
      p.container.destroy();
    });
    this.pickupSprites = [];
  }

  update(player) {
    if (!player || !this.pickupSprites.length) return;

    // Throttling: Kiểm tra nhặt đồ mỗi 75ms để tiết kiệm CPU
    const now = performance.now();
    if (now - (this.lastCheckTime || 0) < 75) return;
    this.lastCheckTime = now;

    const thresholdSq = 26 * 26; // 676

    // Kiểm tra nhặt đồ khi người chơi bước lại gần (bán kính 26px)
    for (let i = 0; i < this.pickupSprites.length; i++) {
      const pickup = this.pickupSprites[i];
      if (pickup.isCollected) continue;

      const dx = player.x - pickup.posX;
      const dy = player.y - pickup.posY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= thresholdSq) {
        pickup.isCollected = true;
        this.addItem(pickup.spot.itemId, 1);

        // Hiệu ứng biến mất
        this.scene.tweens.add({
          targets: pickup.container,
          alpha: 0,
          scaleX: 1.6,
          scaleY: 1.6,
          y: pickup.posY - 20,
          duration: 350,
          onComplete: () => {
            pickup.container.setVisible(false);
          }
        });
      }
    }
  }

  showToast(message) {
    let toast = document.getElementById('dever-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dever-toast';
      toast.className = 'dever-toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}
