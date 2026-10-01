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
  STATIC_LIGHT_SOURCES,
  LAMP_GLOW_CONFIG
} from '../config/lightingConfig.js';

export { DAY_NIGHT_PERIODS, ROOM_LIGHT_PROPERTIES, STATIC_LIGHT_SOURCES, LAMP_GLOW_CONFIG };

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

    // Quầng sáng chân nhân vật (Foot Aura / Lantern) - Mặc định TẮT theo phản hồi người dùng
    this.enableFootAura = false;

    // Pool sprite quầng sáng đèn đường (sprite-based soft glow).
    // Mỗi đèn đường có 3 sprite: vũng sáng mặt đất (pool), hào quang đầu đèn (halo), chùm sáng (beam).
    // Nếu môi trường không hỗ trợ (unit test mock), pool rỗng và code tự fallback sang vẽ graphics cũ.
    this.glowTexturesReady = false;
    this.lampGlowEntries = [];
    this.lampSpritesBuiltForRoom = null;

    this.init();
  }

  init() {
    if (!this.scene || !this.scene.add) return;

    this.lightGraphics = this.scene.add.graphics();
    this.lightGraphics.setDepth(999990); // Nằm trên bản đồ & nhân vật, dưới HUD UI

    // Lớp Bloom / Phát quang thứ cấp (Additive Luminous Layer) tạo hiệu ứng hào quang thực
    if (this.scene.add.graphics) {
      try {
        this.bloomGraphics = this.scene.add.graphics();
        this.bloomGraphics.setDepth(999992);
        if (this.bloomGraphics.setBlendMode) {
          this.bloomGraphics.setBlendMode('ADD');
        }
      } catch (e) {}
    }

    this.scene.scale?.on?.('resize', this.handleResize, this);
  }

  handleResize() {
    if (this.lightGraphics) {
      this.lightGraphics.clear();
    }
    if (this.bloomGraphics) {
      this.bloomGraphics.clear();
    }
  }

  /**
   * Vẽ sẵn (pre-render) 1 lần duy nhất 2 texture gradient cho hệ đèn đường:
   *  - dever_glow_warm: radial gradient mượt (lõi trắng ấm -> hổ phách -> trong suốt ở rìa)
   *  - dever_glow_beam: gradient dọc cho chùm sáng (sáng ở đầu đèn, mờ dần xuống đất)
   * Dùng Canvas 2D API nên gradient mượt tuyệt đối, GPU chỉ việc nội suy khi scale.
   * @returns {boolean} true nếu texture sẵn sàng
   */
  ensureGlowTextures() {
    if (this.glowTexturesReady) return true;
    try {
      const texManager = this.scene?.textures;
      if (!texManager || typeof texManager.createCanvas !== 'function' || typeof texManager.exists !== 'function') {
        return false;
      }
      const cfg = LAMP_GLOW_CONFIG.textures;

      // 1. Radial glow ấm
      if (!texManager.exists(cfg.warmGlowKey)) {
        const S = cfg.size;
        const canvasTex = texManager.createCanvas(cfg.warmGlowKey, S, S);
        if (!canvasTex) return false;
        const ctx = (typeof canvasTex.getContext === 'function') ? canvasTex.getContext() : canvasTex.context;
        if (!ctx) return false;
        ctx.clearRect(0, 0, S, S);
        const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
        g.addColorStop(0.0, 'rgba(255,250,235,0.95)');
        g.addColorStop(0.18, 'rgba(255,236,180,0.55)');
        g.addColorStop(0.45, 'rgba(255,220,150,0.22)');
        g.addColorStop(0.75, 'rgba(255,210,140,0.07)');
        g.addColorStop(1.0, 'rgba(255,205,135,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, S, S);
        if (typeof canvasTex.refresh === 'function') canvasTex.refresh();
      }

      // 2. Beam dọc (sáng trên -> mờ dưới) + mềm 2 biên ngang
      if (!texManager.exists(cfg.beamKey)) {
        const W = 128, H = 256;
        const canvasTex = texManager.createCanvas(cfg.beamKey, W, H);
        if (!canvasTex) return false;
        const ctx = (typeof canvasTex.getContext === 'function') ? canvasTex.getContext() : canvasTex.context;
        if (!ctx) return false;
        ctx.clearRect(0, 0, W, H);
        const vg = ctx.createLinearGradient(0, 0, 0, H);
        vg.addColorStop(0, 'rgba(255,244,214,0.55)');
        vg.addColorStop(0.6, 'rgba(255,236,190,0.18)');
        vg.addColorStop(1, 'rgba(255,230,180,0)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
        // Làm mềm biên trái/phải để chùm sáng không có cạnh cứng
        ctx.globalCompositeOperation = 'destination-in';
        const hg = ctx.createLinearGradient(0, 0, W, 0);
        hg.addColorStop(0, 'rgba(0,0,0,0)');
        hg.addColorStop(0.25, 'rgba(0,0,0,1)');
        hg.addColorStop(0.75, 'rgba(0,0,0,1)');
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hg;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        if (typeof canvasTex.refresh === 'function') canvasTex.refresh();
      }

      this.glowTexturesReady = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Dựng lại pool sprite cho đèn đường của phòng hiện tại.
   * Gọi khi đổi phòng; lần đầu gọi lazy trong renderLighting khi scene đã sẵn sàng.
   */
  rebuildLampSprites() {
    for (const e of this.lampGlowEntries) {
      try { e.pool?.destroy(); } catch (_) {}
      try { e.halo?.destroy(); } catch (_) {}
      try { e.beam?.destroy(); } catch (_) {}
    }
    this.lampGlowEntries = [];
    this.lampSpritesBuiltForRoom = this.currentRoom;

    if (!this.ensureGlowTextures()) return;
    const add = this.scene?.add;
    if (!add || typeof add.image !== 'function') return;

    const cfg = LAMP_GLOW_CONFIG;
    const staticLights = STATIC_LIGHT_SOURCES[this.currentRoom] || [];
    for (const light of staticLights) {
      if (light.type !== 'street_lamp') continue;
      try {
        const pool = add.image(light.x, light.y + 26, cfg.textures.warmGlowKey);
        const halo = add.image(light.x, light.y - 22, cfg.textures.warmGlowKey);
        const beam = add.image(light.x, light.y - 22, cfg.textures.beamKey);
        beam.setOrigin(0.5, 0); // chùm sáng tỏa từ đầu đèn xuống
        for (const img of [pool, halo, beam]) {
          img.setDepth(cfg.spriteDepth);
          if (typeof img.setBlendMode === 'function') img.setBlendMode('ADD');
          img.setVisible(false);
        }
        this.lampGlowEntries.push({ light, pool, halo, beam });
      } catch (e) {
        // Đèn lỗi thì bỏ qua sprite, renderLighting sẽ fallback sang graphics
      }
    }
  }

  setLampSpritesVisible(v) {
    for (const e of this.lampGlowEntries) {
      try {
        e.pool?.setVisible(v);
        e.halo?.setVisible(v);
        e.beam?.setVisible(v);
      } catch (_) {}
    }
  }

  /**
   * Màu đèn hài hòa theo buổi: pha màu đèn gốc về phía màu ambient hiện tại
   * (bình minh ngả hồng, hoàng hôn ngả cam) để ánh đèn "thuộc về" môi trường.
   */
  getLampTint() {
    const tintCfg = LAMP_GLOW_CONFIG.tintByPeriod;
    const periodId = this.currentAtmosphere?.period?.id || 'night';
    const t = tintCfg[periodId] || tintCfg.night;
    const ambient = (this.currentAtmosphere && typeof this.currentAtmosphere.ambientColor === 'number')
      ? this.currentAtmosphere.ambientColor
      : 0x090e24;
    return this.lerpColor(t.color, ambient, t.blendToAmbient);
  }

  /**
   * Cập nhật sprite quầng sáng đèn đường mỗi frame: alpha/scale/tint theo flicker
   * hữu cơ (mỗi đèn lệch pha nhau) và cường độ theo giờ trong ngày.
   */
  updateLampGlowSprites({ streetLightsOn, isOutdoor, lampGlowAlpha, darknessAlpha }) {
    if (this.lampGlowEntries.length === 0) return;
    const cfg = LAMP_GLOW_CONFIG;
    const tint = this.getLampTint();

    for (const entry of this.lampGlowEntries) {
      const { light, pool, halo, beam } = entry;
      const on = streetLightsOn || !isOutdoor;
      const visible = on && darknessAlpha > 0.01 && lampGlowAlpha > 0.02;
      if (!visible) {
        if (pool.visible) {
          pool.setVisible(false);
          halo.setVisible(false);
          beam.setVisible(false);
        }
        continue;
      }
      if (!pool.visible) {
        pool.setVisible(true);
        halo.setVisible(true);
        beam.setVisible(true);
      }

      // Flicker hữu cơ: mỗi đèn lệch pha theo vị trí, không nhấp nháy đồng bộ
      const flick = 1 + Math.sin(this.flickerTimer * 3.2 + light.x * 0.63 + light.y * 0.41) * (light.flicker ?? 0.02);
      const intensity = Math.max(0, light.intensity * lampGlowAlpha * flick);

      // 1. Vũng sáng mặt đất: lớn, mềm, ADD xuyên qua lớp tối -> chi tiết map vẫn thấy
      const poolW = light.radius * 2 * cfg.groundPool.radiusScaleX * flick;
      const poolH = light.radius * 2 * cfg.groundPool.radiusScaleY * flick;
      pool.setDisplaySize(poolW, poolH);
      pool.setAlpha(Math.min(cfg.groundPool.maxAlpha, cfg.groundPool.baseAlpha * intensity + cfg.groundPool.alphaFloor));
      pool.setTint(tint);

      // 2. Hào quang đầu đèn: lõi gần trắng ấm, là điểm mắt người nhận ra "cái đèn đang sáng"
      const haloD = cfg.headHalo.radius * 2 * flick;
      halo.setDisplaySize(haloD, haloD * cfg.headHalo.squashY);
      halo.setAlpha(Math.min(cfg.headHalo.maxAlpha, cfg.headHalo.baseAlpha * intensity + cfg.headHalo.alphaFloor));
      halo.setTint(cfg.headHalo.coreTint);

      // 3. Chùm sáng: trụ mềm từ bóng đèn xuống đất
      const beamW = Math.max(cfg.beam.minWidth, light.radius * cfg.beam.widthScale);
      beam.setDisplaySize(beamW, cfg.beam.height);
      beam.setAlpha(Math.min(cfg.beam.maxAlpha, cfg.beam.baseAlpha * intensity));
      beam.setTint(tint);
    }
  }

  /**
   * Thiết lập phòng hiện tại
   * @param {string} roomId
   */
  setRoom(roomId) {
    this.currentRoom = roomId;
    this.updateAtmosphere();
    this.rebuildLampSprites();
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
      const nightIndoorLights = roomProp.nightIndoorLightsOn !== false;
      const indoorColor = (isNightNow && nightIndoorLights && roomProp.nightIndoorAmbientColor)
        ? roomProp.nightIndoorAmbientColor
        : (roomProp.indoorAmbientColor || 0x090d16);
      finalColor = indoorColor;
      
      // Ban đêm trong nhà: Nếu bật hệ thống đèn phòng ban đêm (nightIndoorLightsOn), không gian ấm cúng và sáng sủa
      if (isNightNow && nightIndoorLights) {
        finalDarkness = Math.min(0.28, roomProp.indoorBaseDarkness);
      } else {
        const nightBonus = isNightNow ? 0.12 : 0.0;
        finalDarkness = Math.min(0.85, roomProp.indoorBaseDarkness + nightBonus);
      }
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
      streetLightsOn: isNightNow || (curPeriod.streetLightsOn && lampGlowAlpha > 0.15),
      nightIndoorLightsOn: isNightNow && (!roomProp.isOutdoor) && (roomProp.nightIndoorLightsOn !== false)
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
      if (this.bloomGraphics && this.bloomGraphics.visible) {
        this.bloomGraphics.clear();
        this.bloomGraphics.setVisible(false);
      }
      this.setLampSpritesVisible(false);
      return;
    }

    // Lazy-build pool sprite đèn đường khi scene đã sẵn sàng (bỏ qua trong unit test mock)
    if (this.lampSpritesBuiltForRoom !== this.currentRoom) {
      this.rebuildLampSprites();
    }

    if (!this.lightGraphics.visible) {
      this.lightGraphics.setVisible(true);
    }
    if (this.bloomGraphics && !this.bloomGraphics.visible) {
      this.bloomGraphics.setVisible(true);
    }

    const cam = this.scene.cameras?.main;
    const player = this.scene?.player;
    if (!cam) return;

    // Hiệu ứng bập bùng hữu cơ (Flicker nhịp thở)
    this.flickerTimer += (delta || 16.6) * 0.003;
    const generalFlicker = Math.sin(this.flickerTimer * 3.5) * 0.03;

    this.lightGraphics.clear();
    if (this.bloomGraphics) {
      this.bloomGraphics.clear();
    }

    // 1. Phủ màn đêm / bóng tối toàn màn hình theo viewport camera
    const viewLeft = cam.scrollX - 60;
    const viewTop = cam.scrollY - 60;
    const viewWidth = (cam.width / (cam.zoom || 1)) + 120;
    const viewHeight = (cam.height / (cam.zoom || 1)) + 120;

    this.lightGraphics.fillStyle(ambientColor, darknessAlpha);
    this.lightGraphics.fillRect(viewLeft, viewTop, viewWidth, viewHeight);

    // 2. Vẽ các nguồn sáng tĩnh (Static Light Sources) của phòng hiện tại
    // Đèn đường dùng sprite soft-glow khi pool sẵn sàng, các loại khác giữ nguyên graphics.
    const useLampSprites = this.lampGlowEntries.length > 0 && this.lampSpritesBuiltForRoom === this.currentRoom;
    const staticLights = STATIC_LIGHT_SOURCES[this.currentRoom] || [];
    staticLights.forEach(light => {
      // Chỉ bật đèn đường khi trời tối hoặc trong phòng tối
      if (light.type === 'street_lamp' && !streetLightsOn && isOutdoor) return;
      if (light.type === 'street_lamp' && useLampSprites) return; // sprite lo phần này

      const lightFlicker = Math.sin(this.flickerTimer * 4 + light.x) * (light.flicker || 0.02);
      const rad = light.radius * (1 + lightFlicker);
      
      let intensityFactor = 1.0;
      if (light.type === 'street_lamp') {
        intensityFactor = lampGlowAlpha;
      } else if (light.type === 'ceiling_light') {
        intensityFactor = this.isNight ? 1.0 : 0.75;
      }
      const intensity = light.intensity * intensityFactor;

      switch (light.type) {
        case 'street_lamp':
          this.renderStreetLamp(light, rad, intensity);
          break;
        case 'neon':
          this.renderNeonLight(light, rad, intensity);
          break;
        case 'statue':
          this.renderStatueLight(light, rad, intensity);
          break;
        case 'desk_lamp':
          this.renderDeskLamp(light, rad, intensity);
          break;
        case 'ceiling_light':
          this.renderCeilingLight(light, rad, intensity);
          break;
        default:
          this.drawSoftLightCone(light.x, light.y, rad, light.color, intensity);
          break;
      }
    });

    // 2b. Cập nhật sprite quầng sáng đèn đường (mượt + hòa môi trường), nếu pool sẵn sàng
    if (useLampSprites) {
      this.updateLampGlowSprites({ streetLightsOn, isOutdoor, lampGlowAlpha, darknessAlpha });
    }

    // 3. Quầng sáng theo chân nhân vật (Foot Aura) - Mặc định TẮT theo phản hồi người dùng
    // Chỉ kích hoạt nếu enableFootAura được bật rõ ràng (ví dụ người chơi nhặt được đèn bão/đuốc)
    if (this.enableFootAura) {
      if (player && player.active) {
        const px = player.x;
        const py = player.y + 16;
        const playerRadius = 90 * (1 + generalFlicker);
        const playerLightColor = (player.role === 'admin' || player.role === 'leader') ? 0xfef08a : 0xffedd5;
        this.drawSoftLightCone(px, py, playerRadius, playerLightColor, 0.85);
      }

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
  }

  /**
   * Helper tương thích chéo: Vẽ Elip nếu có, fallback vẽ Circle nếu chạy trong unit test mock
   */
  drawEllipseOrCircleOn(targetGraphics, cx, cy, rx, ry) {
    if (!targetGraphics) return;
    if (targetGraphics.fillEllipse) {
      targetGraphics.fillEllipse(cx, cy, rx * 2, ry * 2);
    } else {
      targetGraphics.fillCircle(cx, cy, rx);
    }
  }

  /**
   * Vẽ quầng sáng Elip mềm mại đa tầng (28 micro-steps) với đường cong Hermite mượt mà,
   * triệt tiêu hoàn toàn viền gãy (Zero Banding), tạo cảm giác ánh sáng khói sương tự nhiên như Sea of Stars & Delverium.
   */
  drawSoftLightEllipse(cx, cy, radiusX, radiusY, colorHex, intensity = 1.0) {
    const steps = 28;
    for (let i = steps; i >= 1; i--) {
      const t = i / steps;
      const rx = radiusX * t;
      const ry = radiusY * t;

      // Hermite Falloff: f(t) = (1 - t^2)^2 (mượt mà, triệt tiêu viền cứng ở mép)
      const factor = Math.max(0, 1 - t * t);
      const smoothFactor = factor * factor;
      const stepAlpha = (0.016 * smoothFactor) * intensity;

      this.lightGraphics.fillStyle(colorHex, stepAlpha);
      this.drawEllipseOrCircleOn(this.lightGraphics, cx, cy, rx, ry);
    }

    // Core Hotspot (lõi sáng ấm áp ở tâm)
    const coreAlpha = Math.min(0.35, 0.14 * intensity);
    this.lightGraphics.fillStyle(0xffffff, coreAlpha);
    this.drawEllipseOrCircleOn(this.lightGraphics, cx, cy, radiusX * 0.22, radiusY * 0.22);
  }

  /**
   * Tương thích ngược: Vẽ quầng sáng mềm mại với góc nhìn 2.5D nghiêng (Aspect 1.5 : 1)
   */
  drawSoftLightCone(cx, cy, maxRadius, colorHex, intensity = 1.0) {
    const aspectY = 0.65;
    this.drawSoftLightEllipse(cx, cy, maxRadius, maxRadius * aspectY, colorHex, intensity);
  }

  /**
   * Đèn đường / Cột đèn (Streetlamp):
   * 1. Chùm sáng hình nón (Volumetric Light Beam) từ bóng đèn đỉnh cột rọi xuống.
   * 2. Vũng sáng Elip 2.5D trên mặt đất dưới chân cột (Ground Light Pool).
   * 3. Vầng hào quang phát sáng (Corona & Hotspot) ngay tại bóng đèn trên đỉnh cột.
   */
  renderStreetLamp(light, rad, intensity) {
    const fixtureY = light.y - 22; // Vị trí bóng đèn trên đỉnh cột
    const groundY = light.y + 26;  // Vị trí vũng sáng rọi xuống mặt đất
    const color = light.color || 0xfef08a;

    // 1. Chùm sáng hình nón từ đèn xuống đất (Volumetric Downward Light Beam)
    if (this.lightGraphics.fillPoints) {
      const beamSteps = 6;
      for (let b = 1; b <= beamSteps; b++) {
        const spread = b / beamSteps;
        const topW = 4 + 4 * spread;
        const botW = (rad * 0.72) * spread;
        const beamAlpha = (0.015 * (1 - spread * 0.55)) * intensity;

        this.lightGraphics.fillStyle(color, beamAlpha);
        this.lightGraphics.fillPoints([
          { x: light.x - topW, y: fixtureY },
          { x: light.x + topW, y: fixtureY },
          { x: light.x + botW, y: groundY },
          { x: light.x - botW, y: groundY }
        ]);
      }
    }

    // 2. Vũng sáng Elip 2.5D trên mặt đất (Ground Light Pool)
    const groundRadiusX = rad * 1.05;
    const groundRadiusY = rad * 0.62;
    this.drawSoftLightEllipse(light.x, groundY, groundRadiusX, groundRadiusY, color, intensity);

    // 3. Vầng hào quang (Corona & Hotspot) ngay tại bóng đèn trên đỉnh cột
    const coronaAlpha = Math.min(0.45, 0.22 * intensity);
    this.lightGraphics.fillStyle(color, coronaAlpha);
    this.drawEllipseOrCircleOn(this.lightGraphics, light.x, fixtureY, 18, 14);

    this.lightGraphics.fillStyle(0xfffbeb, Math.min(0.75, 0.45 * intensity));
    this.drawEllipseOrCircleOn(this.lightGraphics, light.x, fixtureY, 7, 5);

    // 4. Lớp Bloom phát quang (Additive)
    if (this.bloomGraphics) {
      this.bloomGraphics.fillStyle(color, 0.22 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, fixtureY, 20, 16);
      this.bloomGraphics.fillStyle(0xfffbeb, 0.4 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, fixtureY, 8, 6);
    }
  }

  /**
   * Biển hiệu Neon (DEVER Club Neon, Server Rack, Máy Arcade):
   * Tỏa ánh sáng dạng thanh ngang / capsule với độ rực Cyber rực rỡ và tia phát quang.
   */
  renderNeonLight(light, rad, intensity) {
    const color = light.color || 0x38bdf8;
    const spanW = rad * 1.3;
    const spanH = rad * 0.65;

    // Vầng sáng ngang đa tầng
    this.drawSoftLightEllipse(light.x, light.y, spanW, spanH, color, intensity);

    // Lõi đèn Neon ống phát quang rực rỡ
    const coreW = Math.min(spanW * 0.7, 70);
    const coreH = Math.min(spanH * 0.4, 18);
    const coreAlpha = Math.min(0.55, 0.28 * intensity);

    if (this.lightGraphics.fillRoundedRect) {
      this.lightGraphics.fillStyle(0xe0f2fe, coreAlpha);
      this.lightGraphics.fillRoundedRect(light.x - coreW / 2, light.y - coreH / 2, coreW, coreH, 8);
    } else {
      this.lightGraphics.fillStyle(0xe0f2fe, coreAlpha);
      this.drawEllipseOrCircleOn(this.lightGraphics, light.x, light.y, coreW / 2, coreH / 2);
    }

    if (this.bloomGraphics) {
      this.bloomGraphics.fillStyle(color, 0.28 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, light.y, spanW * 0.8, spanH * 0.8);
      this.bloomGraphics.fillStyle(0xe0f2fe, 0.45 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, light.y, coreW * 0.4, coreH * 0.5);
    }
  }

  /**
   * Tượng linh vật Cóc Vàng FUDA:
   * Vầng hào quang vàng kim linh thiêng, lan tỏa ánh sáng quý phái trên quảng trường.
   */
  renderStatueLight(light, rad, intensity) {
    const goldColor = light.color || 0xfbbf24;
    const poolRx = rad * 1.15;
    const poolRy = rad * 0.75;

    // Vũng sáng vàng kim trên nền gạch
    this.drawSoftLightEllipse(light.x, light.y + 12, poolRx, poolRy, goldColor, intensity * 0.95);

    // Hào quang tâm tượng
    this.lightGraphics.fillStyle(0xfef08a, Math.min(0.5, 0.25 * intensity));
    this.drawEllipseOrCircleOn(this.lightGraphics, light.x, light.y - 6, 24, 18);

    if (this.bloomGraphics) {
      this.bloomGraphics.fillStyle(0xfbbf24, 0.25 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, light.y, poolRx * 0.6, poolRy * 0.6);
      this.bloomGraphics.fillStyle(0xfef08a, 0.38 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, light.y - 6, 16, 12);
    }
  }

  /**
   * Đèn bàn / Quầy Barista Căn tin & Quầy Bánh:
   * Ánh sáng vàng mật ong ấm cúng, trải đều trên mặt quầy gỗ.
   */
  renderDeskLamp(light, rad, intensity) {
    const warmColor = light.color || 0xfde68a;
    const poolRx = rad * 1.1;
    const poolRy = rad * 0.7;

    this.drawSoftLightEllipse(light.x, light.y + 8, poolRx, poolRy, warmColor, intensity);

    this.lightGraphics.fillStyle(0xfffbeb, Math.min(0.4, 0.18 * intensity));
    this.drawEllipseOrCircleOn(this.lightGraphics, light.x, light.y, 16, 10);

    if (this.bloomGraphics) {
      this.bloomGraphics.fillStyle(warmColor, 0.2 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, light.y + 8, poolRx * 0.5, poolRy * 0.5);
    }
  }

  /**
   * Đèn trần phòng học / Phòng Lab:
   * Ánh sáng phủ rộng, dịu mắt, xua tan bóng tối phòng trong nhà.
   */
  renderCeilingLight(light, rad, intensity) {
    const techColor = light.color || 0xf1f5f9;
    const poolRx = rad * 1.12;
    const poolRy = rad * 0.8;

    this.drawSoftLightEllipse(light.x, light.y, poolRx, poolRy, techColor, intensity * 0.85);

    if (this.bloomGraphics) {
      this.bloomGraphics.fillStyle(techColor, 0.12 * intensity);
      this.drawEllipseOrCircleOn(this.bloomGraphics, light.x, light.y, poolRx * 0.45, poolRy * 0.45);
    }
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
    for (const e of this.lampGlowEntries) {
      try { e.pool?.destroy(); } catch (_) {}
      try { e.halo?.destroy(); } catch (_) {}
      try { e.beam?.destroy(); } catch (_) {}
    }
    this.lampGlowEntries = [];
    this.lampSpritesBuiltForRoom = null;
    if (this.lightGraphics) {
      this.lightGraphics.destroy();
      this.lightGraphics = null;
    }
    if (this.bloomGraphics) {
      this.bloomGraphics.destroy();
      this.bloomGraphics = null;
    }
    this.timeListeners.clear();
  }
}
