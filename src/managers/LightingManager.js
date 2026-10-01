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

    // Lightmap kiểu Stardew: 1 canvas duy nhất phủ màn hình.
    // Mỗi frame: tô lớp tối -> destination-out "khoét lỗ" quanh đèn -> phủ tint ấm nhẹ.
    this.lightmapKey = 'dever_lightmap';
    this.lightmapW = 480;
    this.lightmapH = 270;
    this.lightmapTex = null;
    this.lightmapCtx = null;
    this.lightmapImg = null;
    this.lightmapReady = false;
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

    // Lightmap kiểu Stardew: 1 canvas duy nhất, vẽ lớp tối rồi "khoét lỗ"
    // bằng destination-out quanh các nguồn sáng. Không còn vẽ ellipse additive
    // chồng lên màn đêm (cách cũ tạo vệt màu loang).
    // Giữ field lightGraphics = null để tương thích với test/dọn dẹp cũ.
    this.lightGraphics = null;
    this.bloomGraphics = null;

    this.scene.scale?.on?.('resize', this.handleResize, this);
  }

  handleResize() {
    // Lightmap là Image phủ toàn màn hình (scrollFactor 0) nên tự co giãn;
    // cập nhật kích thước hiển thị cho chắc chắn khi canvas đổi size.
    const sw = this.scene?.scale?.width;
    const sh = this.scene?.scale?.height;
    if (this.lightmapImg && sw && sh) {
      this.lightmapImg.setDisplaySize(sw, sh);
    }
  }

  /**
   * Tạo (lười - lazy) lightmap canvas + Image phủ màn hình.
   * Trả về false khi scene không hỗ trợ textures (ví dụ mock trong unit test).
   * @returns {boolean}
   */
  ensureLightmap() {
    if (this.lightmapReady) return true;
    const texMgr = this.scene?.textures;
    if (!texMgr || typeof texMgr.createCanvas !== 'function') return false;

    const sw = this.scene.scale?.width || 1280;
    const sh = this.scene.scale?.height || 720;
    this.lightmapW = 480;
    this.lightmapH = Math.max(2, Math.round(480 * sh / sw));

    if (!texMgr.exists(this.lightmapKey)) {
      texMgr.createCanvas(this.lightmapKey, this.lightmapW, this.lightmapH);
    }
    const tex = texMgr.get(this.lightmapKey);
    if (!tex || !tex.context || !tex.canvas) return false;
    this.lightmapTex = tex;
    this.lightmapCtx = tex.context;

    this.lightmapImg = this.scene.add.image(0, 0, this.lightmapKey);
    this.lightmapImg.setOrigin(0, 0);
    this.lightmapImg.setScrollFactor(0);
    this.lightmapImg.setDepth(999990); // trên map & nhân vật, dưới sprite glow đèn (999991)
    this.lightmapImg.setDisplaySize(sw, sh);
    this.lightmapImg.setVisible(false);

    this.lightmapReady = true;
    return true;
  }

  /**
   * Đổi hex number (0x0b1026) sang chuỗi CSS '#0b1026'.
   */
  cssColor(hex) {
    return '#' + (hex >>> 0).toString(16).padStart(6, '0');
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
        // Đèn lỗi thì bỏ qua sprite, lightmap vẫn khoét lỗ sáng cho đèn đó
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

      // 1. Vũng sáng mặt đất: HÌNH TRÒN mềm kiểu Stardew, ADD xuyên qua lớp tối
      const poolD = light.radius * 2 * cfg.groundPool.radiusScale * flick;
      pool.setDisplaySize(poolD, poolD);
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
    if (!this.currentAtmosphere) return;

    const { darknessAlpha, ambientColor, lampGlowAlpha, isOutdoor, streetLightsOn } = this.currentAtmosphere;

    // Lazy-build pool sprite đèn đường khi scene đã sẵn sàng (bỏ qua trong unit test mock)
    if (this.lampSpritesBuiltForRoom !== this.currentRoom) {
      this.rebuildLampSprites();
    }

    // Hiệu ứng bập bùng hữu cơ (Flicker nhịp thở)
    this.flickerTimer += (delta || 16.6) * 0.003;

    // Trời sáng / không bóng tối: ẩn lightmap + sprite đèn để tối ưu
    if (darknessAlpha <= 0.01) {
      if (this.lightmapImg && this.lightmapImg.visible) {
        this.lightmapImg.setVisible(false);
      }
      this.setLampSpritesVisible(false);
      return;
    }

    // Lightmap kiểu Stardew: 1 canvas duy nhất
    //  1. Tô lớp tối toàn màn hình
    //  2. destination-out: "khoét lỗ" radial gradient quanh mỗi nguồn sáng
    //     -> vũng sáng tròn mềm, KHÔNG còn vệt ellipse màu loang như cách cũ
    //  3. Phủ tint màu đèn rất nhẹ quanh lỗ sáng cho cảm giác "ánh đèn"
    if (!this.ensureLightmap()) {
      // Môi trường không hỗ trợ canvas texture (unit test mock):
      // vẫn cập nhật sprite đèn nếu pool đã dựng được.
      const useLampSprites = this.lampGlowEntries.length > 0 && this.lampSpritesBuiltForRoom === this.currentRoom;
      if (useLampSprites) {
        this.updateLampGlowSprites({ streetLightsOn, isOutdoor, lampGlowAlpha, darknessAlpha });
      }
      return;
    }

    const cam = this.scene.cameras?.main;
    if (!cam) return;
    const zoom = cam.zoom || 1;
    const sw = this.scene.scale?.width || 1280;
    const sh = this.scene.scale?.height || 720;
    const camX = cam.x || 0;
    const camY = cam.y || 0;

    const ctx = this.lightmapCtx;
    const W = this.lightmapW;
    const H = this.lightmapH;

    // 1. Lớp tối
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.cssColor(ambientColor);
    ctx.globalAlpha = darknessAlpha;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // 2. Khoét lỗ sáng
    const staticLights = STATIC_LIGHT_SOURCES[this.currentRoom] || [];
    const holes = [];
    ctx.globalCompositeOperation = 'destination-out';
    for (const light of staticLights) {
      // Chỉ bật đèn đường khi trời tối hoặc trong phòng tối
      if (light.type === 'street_lamp' && !streetLightsOn && isOutdoor) continue;

      const sx = ((light.x - cam.scrollX) * zoom + camX) / sw * W;
      const sy = ((light.y - cam.scrollY) * zoom + camY) / sh * H;
      const sr = (light.radius * zoom) / sw * W;
      if (sr <= 0 || sx < -sr || sx > W + sr || sy < -sr || sy > H + sr) continue;

      const lightFlicker = Math.sin(this.flickerTimer * 4 + light.x) * (light.flicker || 0.02);
      const r = Math.max(1, sr * (1 + lightFlicker));

      let intensityFactor = 1.0;
      if (light.type === 'street_lamp') {
        intensityFactor = lampGlowAlpha;
      } else if (light.type === 'ceiling_light') {
        intensityFactor = this.isNight ? 1.0 : 0.75;
      }
      const eraseA = Math.min(1, Math.max(0, light.intensity * intensityFactor));
      if (eraseA <= 0.01) continue;

      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      g.addColorStop(0, 'rgba(0,0,0,' + eraseA.toFixed(3) + ')');
      g.addColorStop(0.55, 'rgba(0,0,0,' + (eraseA * 0.55).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      holes.push({ sx, sy, r, color: light.color, a: eraseA });
    }

    // 3. Tint màu đèn rất nhẹ (giữ cảm giác ấm/lạnh của từng loại đèn)
    ctx.globalCompositeOperation = 'source-over';
    for (const h of holes) {
      const tintA = Math.min(0.22, 0.14 * h.a);
      if (tintA <= 0.005) continue;
      const g = ctx.createRadialGradient(h.sx, h.sy, 0, h.sx, h.sy, h.r);
      g.addColorStop(0, this.hexToRgba(h.color, tintA));
      g.addColorStop(1, this.hexToRgba(h.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(h.sx, h.sy, h.r, 0, Math.PI * 2);
      ctx.fill();
    }

    this.lightmapTex.refresh();
    if (!this.lightmapImg.visible) {
      this.lightmapImg.setVisible(true);
    }

    // 4. Sprite glow đèn đường (ADD, depth 999991) nằm trên lightmap, tạo lõi sáng rực
    const useLampSprites = this.lampGlowEntries.length > 0 && this.lampSpritesBuiltForRoom === this.currentRoom;
    if (useLampSprites) {
      this.updateLampGlowSprites({ streetLightsOn, isOutdoor, lampGlowAlpha, darknessAlpha });
    } else {
      this.setLampSpritesVisible(false);
    }
  }

  /**
   * Đổi hex number + alpha sang chuỗi CSS rgba().
   */
  hexToRgba(hex, alpha) {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(0, Math.min(1, alpha)).toFixed(3) + ')';
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
    this.lightGraphics = null;
    this.bloomGraphics = null;
    if (this.lightmapImg) {
      try { this.lightmapImg.destroy(); } catch (_) {}
      this.lightmapImg = null;
    }
    if (this.lightmapTex && this.scene?.textures?.exists(this.lightmapKey)) {
      try { this.scene.textures.remove(this.lightmapKey); } catch (_) {}
    }
    this.lightmapTex = null;
    this.lightmapCtx = null;
    this.lightmapReady = false;
    this.timeListeners.clear();
  }
}
