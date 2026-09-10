import { MAPS_CONFIG } from '../config/maps.js';

/**
 * FloorManager: Quản lý Hệ thống Đa Tầng (Multi-Floor Architecture) phong cách Stardew Valley cho DEVER TOWN.
 * - Cho phép 1 phòng (như Tòa Alpha) có nhiều tầng độc lập (Tầng 1, Tầng 2, Tầng 3...)
 * - Tự động nạp layout, vật thể, vùng tương tác (zones) và điểm xuất hiện tương ứng từng tầng.
 * - Hiệu ứng chuyển tầng mượt mà: Pokemon GBA Flash (70ms) + Black Fade (180ms) + Floor Badge Notification.
 * - 100% tương thích ngược với các phòng đơn tầng hiện hữu.
 */
export class FloorManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentFloor = 0; // Mặc định tầng 1 (index 0)
    this.isTransitioning = false;
  }

  /**
   * Lấy dữ liệu cấu hình bản đồ của tầng hiện tại
   * @param {string} roomId
   * @returns {Object}
   */
  getCurrentFloorData(roomId) {
    const roomConfig = MAPS_CONFIG[roomId];
    if (!roomConfig) return null;

    if (roomConfig.floors && Array.isArray(roomConfig.floors) && roomConfig.floors.length > 0) {
      const idx = Math.max(0, Math.min(this.currentFloor, roomConfig.floors.length - 1));
      return roomConfig.floors[idx] || roomConfig.floors[0];
    }

    return roomConfig;
  }

  /**
   * Đếm tổng số tầng của một phòng
   * @param {string} roomId
   * @returns {number}
   */
  getFloorCount(roomId) {
    const roomConfig = MAPS_CONFIG[roomId];
    return roomConfig?.floors?.length || 1;
  }

  /**
   * Chuyển đổi tầng trong tòa nhà với hiệu ứng chuyển cảnh
   * @param {number} targetFloor
   * @param {Object} stairInfo
   */
  async transitionToFloor(targetFloor, stairInfo = {}) {
    if (this.isTransitioning) return;

    const currentRoomId = this.scene.currentRoomId;
    const roomConfig = MAPS_CONFIG[currentRoomId];
    if (!roomConfig?.floors || !roomConfig.floors[targetFloor]) return;

    this.isTransitioning = true;

    // 1. Âm thanh bước lên bậc thang gỗ
    if (this.scene.audioManager) {
      this.scene.audioManager.playFootstep('wood');
    }

    // 2. Pokemon GBA flash + fade out
    this.scene.cameras.main.flash(70, 255, 255, 255, false);
    await new Promise(r => setTimeout(r, 70));
    this.scene.cameras.main.fadeOut(180, 11, 15, 25);
    await new Promise(r => setTimeout(r, 180));

    // 3. Thiết lập tầng đích
    this.currentFloor = targetFloor;
    const floorData = roomConfig.floors[targetFloor];

    const spawnX = stairInfo.spawnX !== undefined ? stairInfo.spawnX : (floorData.spawnPoint?.x || 400);
    const spawnY = stairInfo.spawnY !== undefined ? stairInfo.spawnY : (floorData.spawnPoint?.y || 350);

    // 4. Tái nạp lại phòng theo dữ liệu của tầng mới
    this.scene.loadRoom(currentRoomId, spawnX, spawnY, false);

    // 5. Fade in màn hình
    this.scene.cameras.main.fadeIn(250, 11, 15, 25);
    await new Promise(r => setTimeout(r, 250));

    // 6. Hiển thị thông báo tầng (Floor Badge)
    this.showFloorBadge(floorData.name || `Tòa Alpha — Tầng ${targetFloor + 1}`);

    this.isTransitioning = false;
  }

  /**
   * Hiển thị thông báo Floor Badge nổi
   * @param {string} floorName
   */
  showFloorBadge(floorName) {
    if (this.scene?.juiceManager) {
      const px = this.scene.player?.x || 400;
      const py = (this.scene.player?.y || 350) - 24;
      this.scene.juiceManager.showFloatingText(px, py, floorName, {
        color: '#fbbf24',
        fontSize: '13px',
        strokeColor: '#0f172a',
        strokeThickness: 3,
        playSound: true
      });
    }
  }

  /**
   * Đặt lại tầng về trệt (tầng 1) khi dịch chuyển sang phòng khác
   */
  resetFloor() {
    this.currentFloor = 0;
    this.isTransitioning = false;
  }
}
