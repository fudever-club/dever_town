/**
 * DEVER TOWN - DAY & NIGHT LIGHTING MANAGER
 * Hệ thống Quản Lý Ánh Sáng Chu Kỳ Ngày & Đêm & Nguồn Sáng Điểm (Point Lights):
 * 1. Chu kỳ 5 giai đoạn: Bình Minh (Dawn), Ban Ngày (Day), Hoàng Hôn (Sunset), Ban Đêm (Night), Đêm Khuya (Midnight).
 * 2. Nội suy màu sắc mượt mà (Color Lerp 60 FPS) cho bầu trời và bóng tối.
 * 3. Điểm sáng động (Player Foot Aura / Lantern) & Điểm sáng tĩnh (Streetlights, Neon, Cóc Vàng, Quầy Barista).
 * 4. Hỗ trợ 3 chế độ thời gian: Đồng bộ giờ thực tế (Real-time), Vòng lặp nhanh (Fast Cycle: 12 phút/ngày), Thủ công (Manual).
 * 5. Tự động tương tác với AmbientEnvironmentManager để kích hoạt Đom Đóm Đêm (Fireflies).
 */

import {
  DAY_NIGHT_PERIODS,
  ROOM_LIGHT_PROPERTIES,
  STATIC_LIGHT_SOURCES
} from '../config/lightingConfig.js';

export { DAY_NIGHT_PERIODS, ROOM_LIGHT_PROPERTIES, STATIC_LIGHT_SOURCES };

export class LightingManager {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentRoom = 'main_hall';

    // Chế độ thời gian: 'realtime' | 'fast_cycle' | 'manual'
    this.timeMode = (typeof localStorage !== 'undefined' && localStorage.getItem('dever_time_mode')) || 'realtime';
    
    // Giờ thủ công hoặc ban đầu (0.00 đến 23.99)
    const now = new Date();
    this.currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    this.manualHour = this.currentHour;
    
    // Tốc độ Fast Cycle: 1 chu kỳ 24h game = 720 giây thực tế (12 phút)
    // 24 / 720 = 1 / 30 giờ game mỗi giây thực
    this.fastCycleHoursPerSecond = 24 / 720;

    // Graphics cho lớp bóng tối và quầng sáng
    this.lightGraphics = null;
    this.flickerTimer = 0;

    // Cờ trạng thái
    this.isNight = false;
    this.currentAtmosphere = null;
    this.timeListeners = new Set();
    this.lastFirefliesState = null;

    this.init();
  }

  init() {
    if (!this.scene || !this.scene.add) return;

    this.lightGraphics = this.scene.add.graphics();
    this.lightGraphics.setDepth(999990); // Nằm trên bản đồ & nhân vật, dưới HUD UI

    this.scene.scale?.on?.('resize', this.handleResize, this);
  }

  handleResize() {
    if (this.lightGraphics) {
      this.lightGraphics.clear();
    }
  }

  /**
   * Thiết lập phòng hiện tại
   * @param {string} roomId
   */
  setRoom(roomId) {
    this.currentRoom = roomId;
    this.updateAtmosphere();
  }

  /**
   * Đổi chế độ thời gian
   * @param {'realtime'|'fast_cycle'|'manual'} mode
   */
  setTimeMode(mode) {
    if (['realtime', 'fast_cycle', 'manual'].includes(mode)) {
      this.timeMode = mode;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dever_time_mode', mode);
      }
      this.notifyTimeChange();
    }
  }

  /**
   * Đặt giờ thủ công (Manual mode)
   * @param {number} hour (0 - 23)
   * @param {number} minute (0 - 59)
   */
  setTime(hour, minute = 0) {
    this.manualHour = Math.max(0, Math.min(23.99, hour + minute / 60));
    this.timeMode = 'manual';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dever_time_mode', 'manual');
    }
    this.currentHour = this.manualHour;
    this.updateAtmosphere();
    this.notifyTimeChange();
  }

  /**
   * Lấy period theo giờ
   * @param {number} hour
   */
  getPeriodForHour(hour) {
    if (hour >= DAY_NIGHT_PERIODS.DAWN.startHour && hour < DAY_NIGHT_PERIODS.DAWN.endHour) {
      return DAY_NIGHT_PERIODS.DAWN;
    }
    if (hour >= DAY_NIGHT_PERIODS.DAY.startHour && hour < DAY_NIGHT_PERIODS.DAY.endHour) {
      return DAY_NIGHT_PERIODS.DAY;
    }
    if (hour >= DAY_NIGHT_PERIODS.SUNSET.startHour && hour < DAY_NIGHT_PERIODS.SUNSET.endHour) {
      return DAY_NIGHT_PERIODS.SUNSET;
    }
    if (hour >= DAY_NIGHT_PERIODS.NIGHT.startHour && hour < DAY_NIGHT_PERIODS.NIGHT.endHour) {
      return DAY_NIGHT_PERIODS.NIGHT;
    }
    return DAY_NIGHT_PERIODS.MIDNIGHT;
  }

  /**
   * Trả về period kế tiếp để phục vụ nội suy chuyển sắc
   */
  getNextPeriod(period) {
    switch (period.id) {
      case 'dawn': return DAY_NIGHT_PERIODS.DAY;
      case 'day': return DAY_NIGHT_PERIODS.SUNSET;
      case 'sunset': return DAY_NIGHT_PERIODS.NIGHT;
      case 'night': return DAY_NIGHT_PERIODS.MIDNIGHT;
      case 'midnight': return DAY_NIGHT_PERIODS.DAWN;
      default: return DAY_NIGHT_PERIODS.DAY;
    }
  }

  /**
   * Nội suy màu sắc RGB giữa 2 giá trị Hex (0xRRGGBB)
   */
  lerpColor(colorA, colorB, t) {
    const rA = (colorA >> 16) & 0xff;
    const gA = (colorA >> 8) & 0xff;
    const bA = colorA & 0xff;

    const rB = (colorB >> 16) & 0xff;
    const gB = (colorB >> 8) & 0xff;
    const bB = colorB & 0xff;

    const r = Math.round(rA + (rB - rA) * t);
    const g = Math.round(gA + (gB - gA) * t);
    const b = Math.round(bA + (bB - bA) * t);

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Tính toán khí quyển ánh sáng hiện tại dựa trên giờ và đặc tính phòng
   */
  computeAtmosphere(hour) {
    const curPeriod = this.getPeriodForHour(hour);
    const nextPeriod = this.getNextPeriod(curPeriod);

    // Tính tiến trình t (0 -> 1) trong khung giờ hiện tại
    let duration = curPeriod.endHour - curPeriod.startHour;
    if (duration < 0) duration += 24; // Qua nửa đêm

    let elapsed = hour - curPeriod.startHour;
    if (elapsed < 0) elapsed += 24;
    const t = Math.max(0, Math.min(1, elapsed / duration));

    // Nội suy mượt mà
    let skyAmbientColor = this.lerpColor(curPeriod.ambientColor, nextPeriod.ambientColor, t);
    let skyDarknessAlpha = curPeriod.darknessAlpha + (nextPeriod.darknessAlpha - curPeriod.darknessAlpha) * t;
    let lampGlowAlpha = curPeriod.lampGlowAlpha + (nextPeriod.lampGlowAlpha - curPeriod.lampGlowAlpha) * t;

    // Giữ ban ngày hoàn toàn sáng trong trẻo từ 8:00 đến 15:30
    if (hour >= 8.0 && hour <= 15.5) {
      skyDarknessAlpha = 0.0;
      lampGlowAlpha = 0.0;
      skyAmbientColor = 0xffffff;
    } else if (hour > 15.5 && hour < 16.5) {
      // 15:30 -> 16:30: Chuyển tiếp nhẹ sang hoàng hôn
      const transT = (hour - 15.5) / 1.0;
      skyDarknessAlpha = DAY_NIGHT_PERIODS.DAY.darknessAlpha * (1 - transT) + DAY_NIGHT_PERIODS.SUNSET.darknessAlpha * transT * 0.5;
      lampGlowAlpha = DAY_NIGHT_PERIODS.SUNSET.lampGlowAlpha * transT * 0.3;
      skyAmbientColor = this.lerpColor(0xffffff, DAY_NIGHT_PERIODS.SUNSET.ambientColor, transT * 0.4);
    }

    const isNightNow = (hour >= 18.75 || hour < 5.0);

    // Xét phòng ngoài trời hay trong nhà
    const roomProp = ROOM_LIGHT_PROPERTIES[this.currentRoom] || { isOutdoor: true, indoorBaseDarkness: 0.0 };
    
    let finalColor = skyAmbientColor;
    let finalDarkness = skyDarknessAlpha;

    if (!roomProp.isOutdoor) {
      // Phòng trong nhà: Kết hợp độ tối cơ bản trong phòng và sắc thái bên ngoài
      const indoorColor = roomProp.indoorAmbientColor || 0x090d16;
      finalColor = indoorColor;
      
      // Ban đêm trong nhà có thể tối hơn một chút nếu tắt bớt đèn, nhưng có đèn huỳnh quang duy trì
      const nightBonus = isNightNow ? 0.12 : 0.0;
      finalDarkness = Math.min(0.85, roomProp.indoorBaseDarkness + nightBonus);
    }

    return {
      period: curPeriod,
      nextPeriod: nextPeriod,
      hour: hour,
      ambientColor: finalColor,
      darknessAlpha: finalDarkness,
      lampGlowAlpha: lampGlowAlpha,
      isNight: isNightNow,
      isOutdoor: roomProp.isOutdoor,
      streetLightsOn: isNightNow || (curPeriod.streetLightsOn && lampGlowAlpha > 0.4)
    };
  }

  /**
   * Cập nhật thời gian và trạng thái khí quyển mỗi khung hình
   */
  update(time, delta) {
    const dtSeconds = (delta || 16.6) / 1000;

    // 1. Cập nhật dòng thời gian
    if (this.timeMode === 'realtime') {
      const d = new Date();
      this.currentHour = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    } else if (this.timeMode === 'fast_cycle') {
      this.currentHour += this.fastCycleHoursPerSecond * dtSeconds;
      if (this.currentHour >= 24) this.currentHour -= 24;
    } else {
      this.currentHour = this.manualHour;
    }

    this.updateAtmosphere();

    // 2. Render ánh sáng lên màn hình
    this.renderLighting(delta);
  }

  updateAtmosphere() {
    this.currentAtmosphere = this.computeAtmosphere(this.currentHour);
    this.isNight = this.currentAtmosphere.isNight;

    // Tự động kích hoạt đom đóm nếu là ban đêm ở ngoài trời
    const shouldEnableFireflies = this.currentAtmosphere.isOutdoor && this.isNight;
    if (this.lastFirefliesState !== shouldEnableFireflies) {
      this.lastFirefliesState = shouldEnableFireflies;
      if (this.scene?.ambientManager?.setFirefliesEnabled) {
        this.scene.ambientManager.setFirefliesEnabled(shouldEnableFireflies);
      }
    }
  }

  renderLighting(delta) {
    if (!this.lightGraphics || !this.currentAtmosphere) return;

    const { darknessAlpha, ambientColor, lampGlowAlpha, isOutdoor, streetLightsOn } = this.currentAtmosphere;

    // Nếu trời sáng ban ngày và không có bóng tối trong nhà, ẩn graphics để tối ưu hiệu năng
    if (darknessAlpha <= 0.01) {
      if (this.lightGraphics.visible) {
        this.lightGraphics.clear();
        this.lightGraphics.setVisible(false);
      }
      return;
    }

    if (!this.lightGraphics.visible) {
      this.lightGraphics.setVisible(true);
    }

    const cam = this.scene.cameras?.main;
    const player = this.scene?.player;
    if (!cam) return;

    // Hiệu ứng bập bùng hữu cơ (Flicker nhịp thở)
    this.flickerTimer += (delta || 16.6) * 0.003;
    const generalFlicker = Math.sin(this.flickerTimer * 3.5) * 0.03;

    this.lightGraphics.clear();

    // 1. Phủ màn đêm / bóng tối toàn màn hình theo viewport camera
    const viewLeft = cam.scrollX - 60;
    const viewTop = cam.scrollY - 60;
    const viewWidth = (cam.width / (cam.zoom || 1)) + 120;
    const viewHeight = (cam.height / (cam.zoom || 1)) + 120;

    this.lightGraphics.fillStyle(ambientColor, darknessAlpha);
    this.lightGraphics.fillRect(viewLeft, viewTop, viewWidth, viewHeight);

    // 2. Vẽ các nguồn sáng tĩnh (Static Light Sources) của phòng hiện tại
    const staticLights = STATIC_LIGHT_SOURCES[this.currentRoom] || [];
    staticLights.forEach(light => {
      // Chỉ bật đèn đường khi trời tối hoặc trong phòng tối
      if (light.type === 'street_lamp' && !streetLightsOn && isOutdoor) return;

      const lightFlicker = Math.sin(this.flickerTimer * 4 + light.x) * (light.flicker || 0.02);
      const rad = light.radius * (1 + lightFlicker);
      const intensity = light.intensity * (light.type === 'street_lamp' ? lampGlowAlpha : 1.0);

      this.drawSoftLightCone(light.x, light.y, rad, light.color, intensity);
    });

    // 3. Vầng sáng ngọn đèn lồng / aura ấm theo chân người chơi (Player Aura)
    if (player && player.active) {
      const px = player.x;
      const py = player.y + 16; // Ngay dưới chân
      const playerRadius = 90 * (1 + generalFlicker);
      
      // Màu ánh sáng của người chơi (vàng ấm dịu hoặc xanh công nghệ)
      const playerLightColor = (player.role === 'admin' || player.role === 'leader') ? 0xfef08a : 0xffedd5;
      this.drawSoftLightCone(px, py, playerRadius, playerLightColor, 0.85);
    }

    // 4. Vầng sáng dưới chân các NPC xung quanh (nếu người chơi ở gần)
    if (this.scene.npcGroup && player) {
      this.scene.npcGroup.forEach(npc => {
        if (npc.active && npc.visible) {
          const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
          if (dist < 380) {
            this.drawSoftLightCone(npc.x, npc.y + 16, 68, 0xfef08a, 0.65);
          }
        }
      });
    }

    // 5. Vầng sáng dưới chân Remote Players (Multiplayer)
    if (this.scene.remotePlayers && player) {
      for (const remote of this.scene.remotePlayers.values()) {
        if (remote.active && remote.visible) {
          const dist = Math.hypot(player.x - remote.x, player.y - remote.y);
          if (dist < 380) {
            this.drawSoftLightCone(remote.x, remote.y + 16, 65, 0x67e8f9, 0.6);
          }
        }
      }
    }
  }

  /**
   * Vẽ quầng sáng mềm mại đa tầng (Multi-ring Falloff), xua tan bóng tối tự nhiên
   * @param {number} cx Tọa độ tâm X
   * @param {number} cy Tọa độ tâm Y
   * @param {number} maxRadius Bán kính cực đại
   * @param {number} colorHex Màu ánh sáng
   * @param {number} intensity Cường độ sáng (0.0 - 1.0)
   */
  drawSoftLightCone(cx, cy, maxRadius, colorHex, intensity = 1.0) {
    const steps = 7;
    for (let i = steps; i >= 1; i--) {
      const stepRadius = (maxRadius / steps) * i;
      // Công thức falloff lũy thừa mềm mại (Inverse Square approximation)
      const factor = (steps - i + 1) / steps;
      const stepAlpha = (0.24 * Math.pow(factor, 1.4)) * intensity;

      this.lightGraphics.fillStyle(colorHex, stepAlpha);
      this.lightGraphics.fillCircle(cx, cy, stepRadius);
    }

    // Điểm nhấn lõi sáng rực ở tâm (Core Hotspot)
    this.lightGraphics.fillStyle(0xffffff, 0.18 * intensity);
    this.lightGraphics.fillCircle(cx, cy, maxRadius * 0.18);
  }

  /**
   * Lấy trạng thái thời gian hiện tại cho UI / HUD
   */
  getTimeState() {
    const totalMinutes = Math.floor(this.currentHour * 60);
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    const hourStr = String(hour).padStart(2, '0');
    const minStr = String(minute).padStart(2, '0');

    const atmosphere = this.currentAtmosphere || this.computeAtmosphere(this.currentHour);

    return {
      hour,
      minute,
      timeString: `${hourStr}:${minStr}`,
      period: atmosphere.period,
      isNight: atmosphere.isNight,
      mode: this.timeMode,
      currentHour: this.currentHour
    };
  }

  /**
   * Đăng ký lắng nghe thay đổi thời gian
   */
  addTimeListener(cb) {
    if (typeof cb === 'function') {
      this.timeListeners.add(cb);
    }
  }

  removeTimeListener(cb) {
    this.timeListeners.delete(cb);
  }

  notifyTimeChange() {
    const state = this.getTimeState();
    this.timeListeners.forEach(cb => {
      try { cb(state); } catch (e) {}
    });
  }

  destroy() {
    if (this.scene?.scale) {
      this.scene.scale.off('resize', this.handleResize, this);
    }
    if (this.lightGraphics) {
      this.lightGraphics.destroy();
      this.lightGraphics = null;
    }
    this.timeListeners.clear();
  }
}
