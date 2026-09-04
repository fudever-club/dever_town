import Phaser from 'phaser';
import { i18n } from '../config/i18n.js';

export class InteractionManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} options
   * @param {Function} options.onInteract
   */
  constructor(scene, { onInteract } = {}) {
    this.scene = scene;
    this.onInteract = onInteract;
    this.zones = [];
    this.currentActiveZone = null;
    this.beacons = [];
    this.badges = [];

    // Bán kính Hysteresis
    this.RADIUS_IN = 52;
    this.RADIUS_OUT = 70;

    this.createHUD();
    this.bindEvents();
  }

  createHUD() {
    this.hudContainer = this.scene.add.container(0, 0);
    this.hudContainer.setDepth(999999);
    this.hudContainer.setVisible(false);

    // Nền Tooltip Glassmorphism
    this.bgGraphics = this.scene.add.graphics();
    this.hudContainer.add(this.bgGraphics);

    // Text Tooltip
    this.tooltipText = this.scene.add.text(0, 0, '[E] Tương tác', {
      fontFamily: "'Outfit', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
      fontSize: '12px',
      fontWeight: '700',
      color: '#ffffff',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setOrigin(0.5, 0.5);

    this.hudContainer.add(this.tooltipText);
  }

  bindEvents() {
    // 1. Lắng nghe phím E qua Phaser Keyboard
    if (this.scene?.input?.keyboard) {
      this.scene.input.keyboard.on('keydown-E', () => {
        this.interactCurrentZone();
      });
    }

    // 2. Fallback toàn cục trên Window cho phím E (hỗ trợ cả khi iframe/touch blur canvas)
    this.handleWindowKeyDown = (e) => {
      if ((e.code === 'KeyE' || e.key === 'e' || e.key === 'E') && !e.repeat) {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
          return;
        }
        if (this.canInteract()) {
          this.interactCurrentZone();
        }
      }
    };
    window.addEventListener('keydown', this.handleWindowKeyDown);
  }

  interactCurrentZone() {
    if (!this.canInteract()) return false;

    // 1. Nếu đã có active zone trong tầm
    if (this.currentActiveZone) {
      this.triggerInteraction(this.currentActiveZone);
      return true;
    }

    // 2. Tìm zone gần nhất trong phạm vi tương tác (tối đa 72px)
    const player = this.scene?.player;
    if (!player) return false;

    const tileSize = 32;
    let closest = null;
    let minDistSq = 72 * 72;

    for (const zone of this.zones) {
      const zx = zone.tileX * tileSize + tileSize / 2;
      const zy = zone.tileY * tileSize + tileSize / 2;
      const dx = player.x - zx;
      const dy = player.y - zy;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        closest = { ...zone, worldX: zx, worldY: zy };
      }
    }

    if (closest) {
      this.triggerInteraction(closest);
      return true;
    }
    return false;
  }

  canInteract() {
    const activeModal = document.querySelector('.modal-backdrop:not(.hidden)');
    if (activeModal) {
      return false;
    }
    return true;
  }

  setZones(zoneConfigs) {
    this.clearVisualMarkers();
    this.zones = zoneConfigs || [];
    this.currentActiveZone = null;
    this.hideHUD();

    // Tạo visual markers & beacons cho từng zone
    this.createVisualMarkers();
  }

  clearVisualMarkers() {
    this.beacons.forEach(b => {
      if (b.tween) b.tween.stop();
      b.graphics.destroy();
    });
    this.beacons = [];

    this.badges.forEach(b => {
      if (b.tween) b.tween.stop();
      b.container.destroy();
    });
    this.badges = [];
  }

  createVisualMarkers() {
    const tileSize = 32;

    this.zones.forEach(zone => {
      const posX = zone.tileX * tileSize + tileSize / 2;
      const posY = zone.tileY * tileSize + tileSize / 2;

      // 1. Màu nhận diện theo loại zone
      let color = 0x38bdf8; // Default Cyan
      let icon = '⚡';

      switch (zone.type) {
        case 'whiteboard_slides':
          color = 0x3b82f6; // Blue
          icon = '📊';
          break;
        case 'meeting_stage':
          color = 0x10b981; // Emerald
          icon = '🎤';
          break;
        case 'code_editor':
          color = 0x8b5cf6; // Purple
          icon = '💻';
          break;
        case 'coffee_lofi':
          color = 0xf26f21; // FPT Orange
          icon = '☕';
          break;
        case 'gallery_memory':
          color = 0xfbbf24; // Gold
          icon = '🖼️';
          break;
        case 'club_website':
          color = 0x06b6d4; // Cyan Neon
          icon = '🌐';
          break;
        case 'sports_activity':
          color = 0x22c55e; // Green
          icon = '⚽';
          break;
        default:
          break;
      }

      // 2. Pulsing Floor Beacon (Vòng tròn phát sáng nhấp nháy dưới sàn)
      const beaconGfx = this.scene.add.graphics();
      beaconGfx.fillStyle(color, 0.3);
      beaconGfx.fillCircle(0, 0, 16);
      beaconGfx.lineStyle(2, color, 0.8);
      beaconGfx.strokeCircle(0, 0, 16);
      beaconGfx.setPosition(posX, posY + 4);
      beaconGfx.setDepth(1);

      const beaconTween = this.scene.tweens.add({
        targets: beaconGfx,
        scaleX: 1.35,
        scaleY: 1.35,
        alpha: 0.4,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.beacons.push({ graphics: beaconGfx, tween: beaconTween });

      // 3. Floating Event Badge (Thẻ lơ lửng trên đầu vật thể, so le Y thông minh chống đè chữ)
      const isStaggered = (zone.tileX + zone.tileY) % 2 === 1;
      const baseBadgeY = zone.tileY <= 1 ? (posY + 26) : (isStaggered ? (posY - 32) : (posY - 16));
      const zoneName = i18n.get(`zones.${zone.id}`) || zone.label || 'Tương tác';
      const badgeText = this.scene.add.text(0, 0, `${icon} ${zoneName}`, {
        fontFamily: "'Outfit', sans-serif",
        fontSize: '9px',
        fontWeight: '700',
        color: '#ffffff'
      }).setOrigin(0.5, 0.5);

      const fullText = `${icon} ${zoneName}`;
      const estTextWidth = Math.max(badgeText.width || 0, fullText.length * 8 + 14);
      const badgeWidth = Math.max(72, Math.round(estTextWidth + 16));
      const halfW = badgeWidth / 2;
      const safeX = Phaser.Math.Clamp(posX, halfW + 12, 800 - halfW - 12);

      const badgeContainer = this.scene.add.container(safeX, baseBadgeY);
      badgeContainer.setDepth(9999);

      const badgeBg = this.scene.add.graphics();
      badgeBg.fillStyle(0x0f172a, 0.88);
      badgeBg.fillRoundedRect(-halfW, -10, badgeWidth, 20, 6);
      badgeBg.lineStyle(1.5, color, 0.9);
      badgeBg.strokeRoundedRect(-halfW, -10, badgeWidth, 20, 6);

      badgeContainer.add([badgeBg, badgeText]);

      const badgeTween = this.scene.tweens.add({
        targets: badgeContainer,
        y: baseBadgeY - 4,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.badges.push({ container: badgeContainer, tween: badgeTween, zoneId: zone.id });
    });
  }

  update(player) {
    if (!player || !this.zones.length) {
      this.hideHUD();
      this.currentActiveZone = null;
      return;
    }

    // Throttling: Kiểm tra khoảng cách mỗi 40ms để tối ưu hóa CPU và mượt mà
    const now = performance.now();
    if (now - (this.lastCheckTime || 0) < 40) {
      if (this.currentActiveZone) {
        this.updateHUDPosition(this.currentActiveZone);
      }
      return;
    }
    this.lastCheckTime = now;

    const tileSize = 32;
    let closestZone = null;
    let minDistanceSq = Infinity;

    // Tìm zone gần nhất bằng square distance
    for (const zone of this.zones) {
      const zoneWorldX = zone.tileX * tileSize + tileSize / 2;
      const zoneWorldY = zone.tileY * tileSize + tileSize / 2;

      const dx = player.x - zoneWorldX;
      const dy = player.y - zoneWorldY;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestZone = { ...zone, worldX: zoneWorldX, worldY: zoneWorldY, distanceSq: distSq };
      }
    }

    const radiusInSq = this.RADIUS_IN * this.RADIUS_IN;
    const radiusOutSq = this.RADIUS_OUT * this.RADIUS_OUT;

    // 1. Nếu đang có active zone
    if (this.currentActiveZone) {
      const currentDx = player.x - this.currentActiveZone.worldX;
      const currentDy = player.y - this.currentActiveZone.worldY;
      const currentDistSq = currentDx * currentDx + currentDy * currentDy;

      // A. Nếu có zone khác gần hơn và nằm trong tầm kích hoạt -> Chuyển ngay sang zone mới
      if (closestZone && closestZone.id !== this.currentActiveZone.id && minDistanceSq < currentDistSq && minDistanceSq <= radiusInSq) {
        this.currentActiveZone = closestZone;
        this.showHUD(closestZone);
      }
      // B. Nếu đã đi ra ngoài phạm vi thoát của zone hiện tại
      else if (currentDistSq > radiusOutSq) {
        if (closestZone && minDistanceSq <= radiusInSq) {
          this.currentActiveZone = closestZone;
          this.showHUD(closestZone);
        } else {
          this.currentActiveZone = null;
          this.hideHUD();
        }
      }
      // C. Vẫn đứng trong tầm của zone hiện tại -> Cập nhật vị trí tooltip
      else {
        this.updateHUDPosition(this.currentActiveZone);
      }
    }
    // 2. Chưa có active zone nào
    else {
      if (closestZone && minDistanceSq <= radiusInSq) {
        this.currentActiveZone = closestZone;
        this.showHUD(closestZone);
      }
    }
  }

  showHUD(zone) {
    if (!zone) return;
    const zoneName = i18n.get(`zones.${zone.id}`) || zone.label || zone.name || 'Tương tác';
    const label = `[E] ${zoneName}`;
    this.tooltipText.setText(label);

    const paddingX = 14;
    const paddingY = 6;
    const w = this.tooltipText.width + paddingX * 2;
    const h = this.tooltipText.height + paddingY * 2;

    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(0x0f172a, 0.95);
    this.bgGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.bgGraphics.lineStyle(2, 0xf26f21, 1); // FPT Orange Glow
    this.bgGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    // Ẩn badge gốc của zone này để loại bỏ hiện tượng đè chữ
    this.badges.forEach(b => {
      if (b.container) {
        b.container.setVisible(b.zoneId !== zone.id);
      }
    });

    this.updateHUDPosition(zone);
    this.hudContainer.setVisible(true);
  }

  updateHUDPosition(zone) {
    if (!zone) return;
    // Nếu zone nằm ở hàng trên cùng (worldY <= 48), đẩy HUD xuống dưới để không bị kẹp trần canvas
    const hudY = zone.worldY <= 48 ? (zone.worldY + 36) : Math.max(zone.worldY - 38, 22);
    const hudX = Phaser.Math.Clamp(zone.worldX, 90, 800 - 90);
    this.hudContainer.setPosition(hudX, hudY);
  }

  hideHUD() {
    this.hudContainer.setVisible(false);
    // Khôi phục hiển thị toàn bộ badge khi người chơi rời khỏi zone
    this.badges.forEach(b => {
      if (b.container) b.container.setVisible(true);
    });
  }

  triggerInteraction(zone) {
    if (this.onInteract) {
      this.onInteract(zone);
    }
  }

  destroy() {
    this.clearVisualMarkers();
    if (this.handleWindowKeyDown) {
      window.removeEventListener('keydown', this.handleWindowKeyDown);
    }
    if (this.hudContainer) {
      this.hudContainer.destroy();
    }
  }
}
