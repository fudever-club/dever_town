/**
 * DEVER TOWN - BARISTA COFFEE CRAFT 3.0 (SUPERPOWERS FRAMEWORK)
 * Trải nghiệm mô phỏng Barista nghệ thuật & ASMR hàng đầu:
 * 1. Order Station: Phiếu Order kẹp lò xo, Chibi khách hàng FPTU với lời thoại sinh viên.
 * 2. Tamping & Crema Station: Nhấn giữ đầm cà phê Tamper đo lực nén 14-22kg -> Chiết xuất dòng chảy Crema bốc khói ấm.
 * 3. Fluid Layering & Ice: Thả đá viên 3D lách cách, nhấn giữ rót chất lỏng Free Pour theo vạch dung tích ml kèm sóng sánh Meniscus.
 * 4. Microfoam Steaming: Kiểm soát đồng thời Nhiệt độ (58°C - 68°C) và Độ sánh mịn Velvet Microfoam (72% - 90%).
 * 5. Latte Art & Topping: Nghiêng ca rót Inox Milk Pitcher vẽ hình tự do, loang bọt mềm mại, rắc bột Cacao/Quế/Matcha.
 * 6. Quầy Bar Gỗ Sồi 2.5D ấm cúng với ánh đèn Edison, máy pha Espresso thép không gỉ sáng bóng và Chibi Barista FPTU.
 */

import { BARISTA_CONFIG } from '../../../config/minigamesConfig.js';
import { LatteArtRecognizer } from '../common/LatteArtRecognizer.js';
import { audioManager } from '../../../utils/AudioManager.js';
import { isTouchDevice } from '../common/touchHints.js';

export class BaristaSimulatorEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks; // { onScoreUpdate, onAchievement }
    // Hint điều khiển in-canvas phải đúng thiết bị (2026-10-09, yêu cầu của Hưng).
    this.isTouch = isTouchDevice();

    // Tap tracking cho cảm ứng (2026-10-09): chạm nhanh = xác nhận (giống nút
    // Hành Động / Space), giữ lâu hoặc kéo = thao tác giữ. Ngưỡng theo px
    // canvas 640x360.
    this._tapDownTime = 0;
    this._tapDownX = 0;
    this._tapDownY = 0;
    this.TAP_MAX_MS = 350;
    this.TAP_MAX_DIST = 14;

    this.recognizer = new LatteArtRecognizer();
    this.drinkKeys = Object.keys(BARISTA_CONFIG.drinks);
    this.currentDrinkIndex = 0;

    // Keys state
    this.keys = { space: false };
    this.isHoldingAction = false;
    this.mousePos = { x: 320, y: 220 };

    this.reset();
  }

  reset() {
    const drinkKey = this.drinkKeys[this.currentDrinkIndex % this.drinkKeys.length];
    this.recipe = BARISTA_CONFIG.drinks[drinkKey];
    this.cfg = BARISTA_CONFIG.craft3;

    // FSM Trạm: 'order' | 'tamping' | 'layering' | 'steaming' | 'latte_art' | 'result'
    this.station = 'order';
    this.actionCooldownUntil = 0;
    this.animTime = 0;

    // Trạm 1: Order
    this.patience = this.recipe.patienceSec;
    this.maxPatience = this.recipe.patienceSec;
    this.ticketSway = 0;

    // Trạm 2: Tamping & Espresso Extraction
    this.tampingForce = 0;
    this.isTamping = false;
    this.tampingLocked = false;
    this.extractionProgress = 0;
    this.isExtracting = false;
    this.tampingGrade = null; // 'perfect' | 'good' | 'loose' | 'hard'

    // Trạm 3: Fluid Layering & Ice
    this.currentIce = 0;
    this.iceCubes = [];
    this.activeLayerIndex = 0;
    this.layerProgress = this.recipe.layers.map(() => 0); // 0 - 100%
    this.isPouringLiquid = false;
    this.liquidWavePhase = 0;
    this.liquidWaveAmp = 0;

    // Trạm 4: Steaming Microfoam
    this.steamTemp = 28; // Bắt đầu ở nhiệt độ phòng (28°C)
    this.steamTexture = 15; // Bắt đầu 15%
    this.isSteaming = false;

    // Trạm 5: Latte Art & Topping
    this.recognizer.reset();
    this.isPouringMilk = false;
    this.lattePours = [];
    this.hasTopping = false;
    this.toppingParticles = [];

    // Kết quả
    this.evaluation = null;
    this.totalTips = 0;
    this.layerScores = [];
  }

  nextDrink() {
    this.currentDrinkIndex = (this.currentDrinkIndex + 1) % this.drinkKeys.length;
    this.reset();
  }

  // ==========================================
  // INPUT & GESTURE HANDLING
  // ==========================================

  acceptOrder() {
    const now = Date.now();
    this.station = this.recipe.hasEspressoExtraction ? 'tamping' : 'layering';
    this.actionCooldownUntil = now + 400;
    this.isTamping = false;
    this.isPouringLiquid = false;
    this.isSteaming = false;
    this.isHoldingAction = false;
    audioManager.playClick();
    this.juiceFX?.spawnFloatingText('Bắt Đầu Đơn Hàng!', 320, 160, { color: '#38bdf8' });
  }

  onActionTrigger() {
    const now = Date.now();
    if (now < this.actionCooldownUntil) return;

    if (this.station === 'order') {
      this.acceptOrder();
    } else if (this.station === 'layering') {
      // Nếu chưa đủ đá thì bấm nút sẽ thả thêm đá
      if (this.currentIce < this.recipe.targetIce) {
        this.addIceCube();
        this.actionCooldownUntil = now + 250;
      }
    } else if (this.station === 'steaming') {
      // Xác nhận kết thúc đánh bọt sữa nếu đã đạt chuẩn
      const s = this.cfg.steaming;
      const isGood = this.steamTemp >= s.minGoodTemp && this.steamTexture >= s.minGoodTexture;
      if (isGood) {
        this.station = 'latte_art';
        this.actionCooldownUntil = now + 500;
        this.isSteaming = false;
        this.isHoldingAction = false;
        audioManager.playVictory();
        this.juiceFX?.spawnFloatingText('Bọt Kem Sánh Mịn Đạt Chuẩn!', 320, 140, { color: '#22c55e' });
      }
    } else if (this.station === 'latte_art') {
      // Nếu chưa vẽ thì tự động vẽ mẫu hình trái tim
      if (this.lattePours.length === 0) {
        this.autoPourLatteArt();
        this.actionCooldownUntil = now + 350;
      } else if (!this.hasTopping && this.recipe.topping !== 'Không Topping') {
        this.applyTopping();
        this.actionCooldownUntil = now + 350;
      } else {
        this.finishDrink();
      }
    } else if (this.station === 'result') {
      this.actionCooldownUntil = now + 500;
      this.nextDrink();
    }
  }

  handleKeyDown(e) {
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'Enter') {
      const now = Date.now();
      if (now < this.actionCooldownUntil) return;

      if (this.station === 'order') {
        this.acceptOrder();
        return; // Dừng ngay lập tức, không để lọt xuống tamping/layering của cùng một lần nhấn!
      }

      if (this.station === 'result') {
        this.actionCooldownUntil = now + 400;
        this.nextDrink();
        return;
      }

      this.isHoldingAction = true;
      if (this.station === 'tamping' && !this.tampingLocked && !this.isExtracting) {
        this.isTamping = true;
      } else if (this.station === 'layering') {
        if (this.currentIce < this.recipe.targetIce) {
          this.addIceCube();
          this.actionCooldownUntil = now + 250;
        } else {
          this.isPouringLiquid = true;
        }
      } else if (this.station === 'steaming') {
        this.isSteaming = true;
      } else if (this.station === 'latte_art') {
        if (this.lattePours.length === 0) {
          this.autoPourLatteArt();
          this.actionCooldownUntil = now + 350;
        } else if (!this.hasTopping && this.recipe.topping !== 'Không Topping') {
          this.applyTopping();
          this.actionCooldownUntil = now + 350;
        } else {
          this.finishDrink();
        }
      }
    }
  }

  handleKeyUp(e) {
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'Enter') {
      this.isHoldingAction = false;
      if (this.station === 'tamping' && this.isTamping) {
        this.lockTampingAndExtract();
      } else if (this.station === 'layering' && this.isPouringLiquid) {
        this.stopPouringLiquid();
      } else if (this.station === 'steaming' && this.isSteaming) {
        this.isSteaming = false;
      }
    }
  }

  handlePointerDown(x, y) {
    this.mousePos = { x, y };
    // Ghi nhận điểm chạm để phân biệt tap nhanh vs giữ/kéo trên cảm ứng.
    this._tapDownTime = Date.now();
    this._tapDownX = x;
    this._tapDownY = y;
    const now = Date.now();
    if (now < this.actionCooldownUntil) return;

    if (this.station === 'order') {
      this.acceptOrder();
      return;
    } else if (this.station === 'tamping') {
      if (!this.tampingLocked && !this.isExtracting) {
        this.isTamping = true;
      }
    } else if (this.station === 'layering') {
      if (this.currentIce < this.recipe.targetIce) {
        this.addIceCube();
        this.actionCooldownUntil = now + 250;
      } else {
        this.isPouringLiquid = true;
      }
    } else if (this.station === 'steaming') {
      this.isSteaming = true;
    } else if (this.station === 'latte_art') {
      this.isPouringMilk = true;
      // Desktop giữ hành vi cũ (chấm điểm ngay khi nhấn); cảm ứng chỉ vẽ khi rê
      // thật để một cú chạm nhanh không để lại vệt mực lạc trước khi xác nhận.
      if (!this.isTouch) this.handlePointerMove(x, y);
    } else if (this.station === 'result') {
      this.nextDrink();
    }
  }

  handlePointerMove(x, y) {
    this.mousePos = { x, y };
    if (this.station === 'latte_art' && this.isPouringMilk) {
      if (this.recognizer.addPourPoint(x, y, 7.5)) {
        this.lattePours.push({ x, y, r: 7.5 + Math.random() * 3.5 });
        audioManager.playWhisking();
        this.juiceFX?.spawnSteam?.(x, y, 1);
      }
    }
  }

  handlePointerUp() {
    if (this.station === 'tamping' && this.isTamping) {
      this.lockTampingAndExtract();
    } else if (this.station === 'layering' && this.isPouringLiquid) {
      this.stopPouringLiquid();
    } else if (this.station === 'steaming' && this.isSteaming) {
      this.isSteaming = false;
    } else if (this.station === 'latte_art') {
      this.isPouringMilk = false;
    }

    // Tap-to-advance trên cảm ứng (2026-10-09): chạm nhanh ở trạm steaming /
    // latte_art gọi đúng code path của nút Hành Động / Space (onActionTrigger),
    // vì nút DOM bị ẩn trên cảm ứng khiến flow bị kẹt ở hai trạm này.
    if (this.isTouch && this._tapDownTime) {
      const tapMs = Date.now() - this._tapDownTime;
      const tapDist = Math.hypot(this.mousePos.x - this._tapDownX, this.mousePos.y - this._tapDownY);
      this._tapDownTime = 0;
      if (tapMs < this.TAP_MAX_MS && tapDist < this.TAP_MAX_DIST &&
          (this.station === 'steaming' || this.station === 'latte_art')) {
        this.onActionTrigger();
      }
    }
  }

  // ==========================================
  // MECHANICS ACTIONS
  // ==========================================

  lockTampingAndExtract() {
    this.isTamping = false;
    this.tampingLocked = true;
    const tCfg = this.cfg.tamping;
    const f = this.tampingForce;

    if (Math.abs(f - tCfg.perfectForce) <= 2.2) {
      this.tampingGrade = 'perfect';
      this.juiceFX?.spawnFloatingText('NÉN TAMPER HOÀN HẢO! 18KG', 320, 150, { color: '#fbbf24', size: 16 });
      audioManager.playGoalFanfare();
    } else if (f >= tCfg.minGoodForce && f <= tCfg.maxGoodForce) {
      this.tampingGrade = 'good';
      this.juiceFX?.spawnFloatingText('Lực Nén Tốt!', 320, 150, { color: '#22c55e', size: 14 });
    } else if (f < tCfg.minGoodForce) {
      this.tampingGrade = 'loose';
      this.juiceFX?.spawnFloatingText('Lực Nén Hơi Lỏng!', 320, 150, { color: '#94a3b8', size: 13 });
    } else {
      this.tampingGrade = 'hard';
      this.juiceFX?.spawnFloatingText('Lực Nén Quá Chặt!', 320, 150, { color: '#ef4444', size: 13 });
    }

    // Bắt đầu chiết xuất Crema
    this.isExtracting = true;
    this.extractionProgress = 0;
    audioManager.playLiquidPour();
  }

  stopPouringLiquid() {
    this.isPouringLiquid = false;
    this.liquidWaveAmp = 8.5; // Tạo sóng sánh mặt nước khi dừng rót
    const curLayer = this.recipe.layers[this.activeLayerIndex];
    const curProg = this.layerProgress[this.activeLayerIndex] || 0;

    // Đánh giá lớp
    if (curProg >= 92 && curProg <= 108) {
      this.juiceFX?.spawnFloatingText(`Lớp ${curLayer.name}: HOÀN HẢO!`, 320, 180, { color: '#fbbf24', size: 15 });
      this.layerScores.push(100);
      audioManager.playVictory();
    } else if (curProg >= 80 && curProg <= 120) {
      this.juiceFX?.spawnFloatingText(`Lớp ${curLayer.name}: Tốt!`, 320, 180, { color: '#22c55e', size: 14 });
      this.layerScores.push(80);
    } else {
      this.juiceFX?.spawnFloatingText(`Lớp ${curLayer.name}: Lệch Dung Tích!`, 320, 180, { color: '#ef4444', size: 13 });
      this.layerScores.push(50);
    }

    // Chuyển sang lớp tiếp theo hoặc chuyển trạm
    this.activeLayerIndex++;
    if (this.activeLayerIndex >= this.recipe.layers.length) {
      // Đã rót xong toàn bộ các lớp
      this.station = 'steaming';
      this.actionCooldownUntil = Date.now() + 500;
      this.juiceFX?.spawnFloatingText('Chuyển Sang Đánh Bọt Sữa & Kem!', 320, 140, { color: '#f472b6', size: 16 });
    }
  }

  addIceCube() {
    this.currentIce++;
    audioManager.playIceClink();
    this.iceCubes.push({
      x: 300 + (Math.random() - 0.5) * 36,
      y: 150,
      targetY: 268 - this.iceCubes.length * 15,
      rotation: (Math.random() - 0.5) * 0.8,
      size: 17
    });
    this.juiceFX?.spawnDust?.(320, 270, 6, 'rgba(224, 242, 254, 0.8)');
    this.juiceFX?.spawnFloatingText(`+1 Đá Viên (${this.currentIce}/${this.recipe.targetIce})`, 320, 130, { color: '#e0f2fe', size: 13 });
  }

  applyTopping() {
    this.hasTopping = true;
    audioManager.playWhisking();
    const cx = this.recognizer.cupCenterX;
    const cy = this.recognizer.cupCenterY;

    // Rắc hạt bột mịn trang trí
    const color = this.recipe.topping.includes('Matcha') ? '#15803d' : this.recipe.topping.includes('Quế') ? '#b45309' : '#451a03';
    for (let i = 0; i < 28; i++) {
      this.toppingParticles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        r: 1 + Math.random() * 2,
        color
      });
    }
    this.juiceFX?.spawnFloatingText(`Phủ Topping: ${this.recipe.topping}!`, 320, 110, { color: '#fbbf24', size: 15 });
  }

  autoPourLatteArt() {
    audioManager.playWhisking();
    const cx = this.recognizer.cupCenterX;
    const cy = this.recognizer.cupCenterY;
    const heartOffsets = [
      { dx: 0, dy: 16 }, { dx: -12, dy: 6 }, { dx: 12, dy: 6 },
      { dx: -22, dy: -8 }, { dx: 22, dy: -8 }, { dx: -14, dy: -24 },
      { dx: 14, dy: -24 }, { dx: 0, dy: -12 }, { dx: 0, dy: 2 },
      { dx: -6, dy: -6 }, { dx: 6, dy: -6 }
    ];
    for (const off of heartOffsets) {
      this.recognizer.addPourPoint(cx + off.dx, cy + off.dy, 9.5);
      this.lattePours.push({ x: cx + off.dx, y: cy + off.dy, r: 10 });
    }
    this.juiceFX?.spawnSparkles(cx, cy, 14, '#ffffff');
    this.juiceFX?.spawnFloatingText('Trái Tim Nghệ Thuật Đã Rót!', 320, 95, { color: '#fbbf24', size: 15 });
  }

  finishDrink() {
    this.evaluation = this.recognizer.evaluate();
    this.station = 'result';

    // Tính điểm tổng hợp: Tamping + Layering + Steaming + Latte Art
    const avgLayerScore = this.layerScores.length > 0
      ? this.layerScores.reduce((a, b) => a + b, 0) / this.layerScores.length
      : 80;
    const steamScore = Math.min(100, Math.round((this.steamTexture / 85) * 50 + (this.steamTemp / 63) * 50));
    const finalScore = Math.round((avgLayerScore * 0.35) + (steamScore * 0.25) + (this.evaluation.score * 0.40));

    // Tính tiền tip
    const speedRatio = Math.max(0.2, this.patience / this.maxPatience);
    const earnedTip = Math.round(this.recipe.tipBase * this.evaluation.tipMultiplier * speedRatio * (finalScore / 100));
    this.totalTips += earnedTip;

    audioManager.playGoalFanfare();
    this.juiceFX?.shake(6, 0.22);
    this.juiceFX?.spawnConfetti(320, 180, 45);
    this.juiceFX?.spawnFloatingText(`+${earnedTip} TIỀN TIP! ☕`, 320, 115, { color: '#fbbf24', size: 24 });

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate(earnedTip);
    }
  }

  // ==========================================
  // UPDATE LOOP & LOGIC
  // ==========================================

  update(dt) {
    this.animTime += dt;

    // Giảm kiên nhẫn
    if (this.station !== 'result') {
      this.patience = Math.max(0, this.patience - dt);
    }

    // Đu đưa phiếu order ticket
    this.ticketSway = Math.sin(this.animTime * 2.8) * 0.04;

    // 1. Cập nhật Trạm Tamping
    if (this.station === 'tamping') {
      const tCfg = this.cfg.tamping;
      if (this.isTamping) {
        this.tampingForce = Math.min(30, this.tampingForce + dt * tCfg.fillRate);
      }

      if (this.isExtracting) {
        this.extractionProgress += dt / tCfg.extractionDuration;
        if (Math.random() < 0.25) {
          this.juiceFX?.spawnSteam?.(320, 185, 1);
        }
        if (this.extractionProgress >= 1) {
          this.isExtracting = false;
          this.station = 'layering';
          this.actionCooldownUntil = Date.now() + 450;
          this.juiceFX?.spawnFloatingText('Chiết Xuất Xong! Chuyển Sang Rót Tầng', 320, 140, { color: '#38bdf8', size: 15 });
        }
      }
    }

    // 2. Cập nhật Trạm Layering Free Pour
    if (this.station === 'layering') {
      // Đá viên rơi
      for (const ice of this.iceCubes) {
        if (ice.y < ice.targetY) {
          ice.y += 240 * dt;
          if (ice.y > ice.targetY) ice.y = ice.targetY;
        }
      }

      // Rót chất lỏng
      if (this.isPouringLiquid && this.activeLayerIndex < this.recipe.layers.length) {
        const pSpeed = this.cfg.layering.pourSpeedPctPerSec;
        this.layerProgress[this.activeLayerIndex] = (this.layerProgress[this.activeLayerIndex] || 0) + dt * pSpeed;
        this.liquidWaveAmp = Math.min(6, this.liquidWaveAmp + dt * 12);

        // Bọt khí sủi tăm
        if (Math.random() < 0.35) {
          this.juiceFX?.spawnSparkles(320 + (Math.random() - 0.5) * 35, 250, 1, '#ffffff');
        }
      }

      // Giảm chấn sóng mặt nước
      if (this.liquidWaveAmp > 0.05) {
        this.liquidWavePhase += dt * this.cfg.layering.waveFrequency;
        this.liquidWaveAmp *= Math.pow(this.cfg.layering.waveDamping, dt * 60);
      } else {
        this.liquidWaveAmp = 0;
      }
    }

    // 3. Cập nhật Trạm Steaming
    if (this.station === 'steaming') {
      const s = this.cfg.steaming;
      if (this.isSteaming) {
        this.steamTemp = Math.min(85, this.steamTemp + dt * s.tempRate);
        this.steamTexture = Math.min(100, this.steamTexture + dt * s.textureRate);
        if (Math.random() < 0.35) {
          this.juiceFX?.spawnSteam?.(320, 180, 2);
        }
      } else {
        // Nguội dần và xẹp bọt nếu buông tay
        this.steamTemp = Math.max(28, this.steamTemp - dt * 3.5);
        this.steamTexture = Math.max(10, this.steamTexture - dt * 5.0);
      }
    }
  }

  // ==========================================
  // RENDERING ENGINE
  // ==========================================

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const theme = this.cfg.barTheme;

    // 1. Nền tường quán cafe cổ điển ấm cúng
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Kệ gỗ trên cao chứa hũ hạt cà phê
    ctx.fillStyle = '#331f12';
    ctx.fillRect(40, 45, 560, 12);
    ctx.fillStyle = '#1e110a';
    ctx.fillRect(40, 57, 560, 4);

    // 3 hũ hạt cà phê Arabica / Robusta / Cacao
    this.drawCoffeeJars(ctx);

    // Vầng sáng vàng ấm đèn Edison (Warm Glow)
    const edisonGlow = ctx.createRadialGradient(320, 20, 10, 320, 120, 260);
    edisonGlow.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
    edisonGlow.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
    edisonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = edisonGlow;
    ctx.fillRect(0, 0, w, 280);

    // Bóng đèn Edison dây tóc
    this.drawEdisonBulb(ctx, 320, 0);

    // 2. Mặt bàn cà phê gỗ sồi 2.5D
    const woodGrad = ctx.createLinearGradient(0, 175, 0, h);
    woodGrad.addColorStop(0, theme.woodTop);
    woodGrad.addColorStop(0.08, theme.woodTrim);
    woodGrad.addColorStop(0.12, theme.woodFront);
    woodGrad.addColorStop(1, '#1c0c03');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, 175, w, h - 175);

    // Gờ nẹp kim loại đồng thau
    ctx.fillStyle = theme.gaugeGold;
    ctx.fillRect(0, 186, w, 2.5);

    // 3. Render các trạm tương tác chuyên biệt
    if (this.station === 'order') {
      this.renderOrderStation(ctx);
    } else if (this.station === 'tamping') {
      this.renderTampingStation(ctx);
    } else if (this.station === 'layering') {
      this.renderLayeringStation(ctx);
    } else if (this.station === 'steaming') {
      this.renderSteamingStation(ctx);
    } else if (this.station === 'latte_art') {
      this.renderLatteArtStation(ctx);
    } else if (this.station === 'result') {
      this.renderResultStation(ctx);
    }

    // 4. Render thanh HUD tiến độ & kiên nhẫn
    this.renderTopBarHUD(ctx);
  }

  drawEdisonBulb(ctx, x, y) {
    ctx.save();
    // Dây điện
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 25);
    ctx.stroke();

    // Đui đèn đồng
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x - 5, y + 25, 10, 8);

    // Bóng thủy tinh
    ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 42, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dây tóc sáng chói
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 42);
    ctx.lineTo(x, y + 38);
    ctx.lineTo(x + 3, y + 42);
    ctx.stroke();
    ctx.restore();
  }

  drawCoffeeJars(ctx) {
    const jars = [
      { x: 90, label: 'ARABICA', fill: '#451a03' },
      { x: 150, label: 'ROBUSTA', fill: '#2e1002' },
      { x: 490, label: 'CACAO', fill: '#78350f' },
      { x: 550, label: 'MATCHA', fill: '#14532d' }
    ];
    for (const j of jars) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(j.x - 14, 20, 28, 25, 4);
      ctx.fill();
      ctx.stroke();

      // Hạt bên trong
      ctx.fillStyle = j.fill;
      ctx.beginPath();
      ctx.roundRect(j.x - 11, 26, 22, 17, 3);
      ctx.fill();

      // Nắp gỗ
      ctx.fillStyle = '#92400e';
      ctx.fillRect(j.x - 12, 16, 24, 4);
      ctx.restore();
    }
  }

  renderTopBarHUD(ctx) {
    ctx.save();
    // Khung HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 8, 612, 32, 8);
    ctx.fill();
    ctx.stroke();

    // Tên món
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 13px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`☕ ${this.recipe.name}`, 26, 28);

    // Tiền tip
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Tips: ${this.totalTips}đ`, 260, 28);

    // Thanh kiên nhẫn
    const pRatio = Math.max(0, this.patience / this.maxPatience);
    const barW = 140;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(440, 16, barW, 16);

    ctx.fillStyle = pRatio > 0.45 ? '#22c55e' : pRatio > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(442, 18, (barW - 4) * pRatio, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Chờ: ${Math.ceil(this.patience)}s`, 510, 28);
    ctx.restore();
  }

  // ==========================================
  // STATION 1: ORDER TICKET
  // ==========================================

  renderOrderStation(ctx) {
    ctx.save();
    // Chibi Khách hàng FPTU đứng trước quầy bar
    this.drawCustomerChibi(ctx, 150, 195);

    // Phiếu Order kẹp dây lắc lư
    ctx.save();
    ctx.translate(380, 85);
    ctx.rotate(this.ticketSway);

    // Kẹp sắt kẹp phiếu
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-10, -18, 20, 14);

    // Giấy order vàng ngà
    ctx.fillStyle = '#fefce8';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(-120, -4, 240, 135, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Nội dung vé
    ctx.fillStyle = '#1c1917';
    ctx.font = '900 13px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`ORDER #${Math.floor(this.animTime * 10) % 90 + 10} • BÀN VIP`, -105, 18);

    ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText(this.recipe.name.toUpperCase(), -105, 36);

    ctx.font = '500 11px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#44403c';
    ctx.fillText(`"${this.recipe.dialogue}"`, -105, 54, 210);

    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-105, 78);
    ctx.lineTo(105, 78);
    ctx.stroke();

    ctx.font = '600 10.5px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#78716c';
    const iceText = this.recipe.targetIce > 0 ? `${this.recipe.targetIce} Viên Đá` : 'Uống Nóng (0 Đá)';
    ctx.fillText(`Yêu cầu: ${iceText} · Topping: ${this.recipe.topping}`, -105, 96);
    ctx.fillText(`Phần thưởng Tip cơ bản: ${this.recipe.tipBase}đ`, -105, 112);
    ctx.restore();

    // Hướng dẫn
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.isTouch ? 'Chạm để nhận đơn!' : 'Nhấp chuột hoặc Bấm nút [Hành Động / Space] để nhận đơn!', 320, 260);
    ctx.restore();
  }

  drawCustomerChibi(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Thân áo
    ctx.fillStyle = this.recipe.avatarColor;
    ctx.beginPath();
    ctx.roundRect(-20, -32, 40, 34, 6);
    ctx.fill();

    // Đầu Chibi tròn
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -48, 18, 0, Math.PI * 2);
    ctx.fill();

    // Mái tóc
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -52, 18, Math.PI, 0);
    ctx.fill();

    // Mắt
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-6, -48, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -48, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Nụ cười
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -44, 4, 0, Math.PI);
    ctx.stroke();

    // Tên khách hàng
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.recipe.customer, 0, 16);
    ctx.restore();
  }

  // ==========================================
  // STATION 2: TAMPING & ESPRESSO EXTRACTION
  // ==========================================

  renderTampingStation(ctx) {
    ctx.save();
    // Máy pha Espresso Thép Inox
    this.drawEspressoMachine(ctx, 320, 175);

    if (this.isExtracting) {
      // Dòng chảy Crema vàng óng ánh
      const p = this.extractionProgress;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(311, 165, 4, 38 * Math.min(1, p * 2));
      ctx.fillRect(325, 165, 4, 38 * Math.min(1, p * 2));

      // Cốc đong chứa cà phê đang đầy dần
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(305, 195, 30, 36, 4);
      ctx.fill();
      ctx.stroke();

      // Cà phê dâng trong cốc đong
      ctx.fillStyle = '#451a03';
      ctx.fillRect(307, 230 - 32 * p, 26, 32 * p);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Đang Chiết Xuất Crema: ${Math.round(p * 100)}%`, 320, 270);
    } else {
      // Tay cầm nén Tamper
      const tamperY = 135 + (this.tampingForce / 30) * 16;
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(310, tamperY, 20, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Cán gỗ tamper
      ctx.fillStyle = '#78350f';
      ctx.fillRect(316, tamperY - 26, 8, 26);

      // Thước đo áp lực nén (Tamper Force Gauge)
      const tCfg = this.cfg.tamping;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(200, 75, 240, 24);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(200, 75, 240, 24);

      // Vùng hoàn hảo (14 - 22kg)
      const minX = 200 + (240 * tCfg.minGoodForce) / 30;
      const goodW = (240 * (tCfg.maxGoodForce - tCfg.minGoodForce)) / 30;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.55)';
      ctx.fillRect(minX, 75, goodW, 24);

      // Kim lực hiện tại
      const curX = 200 + (240 * this.tampingForce) / 30;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(curX - 3, 68, 6, 38);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`LỰC NÉN TAMPER: ${Math.round(this.tampingForce)} KG / 18 KG LÝ TƯỞNG`, 320, 122);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
      ctx.fillText(this.isTouch ? 'GIỮ tay để nén, THẢ trong vạch xanh để chiết xuất!' : 'GIỮ phím [Space] hoặc Chuột để nén, THẢ TAY trong vạch xanh để chiết xuất!', 320, 270);
    }
    ctx.restore();
  }

  drawEspressoMachine(ctx, cx, cy) {
    ctx.save();
    // Thân máy inox
    const grad = ctx.createLinearGradient(cx - 90, cy - 80, cx + 90, cy);
    grad.addColorStop(0, '#64748b');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#475569');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 85, cy - 80, 170, 75, 8);
    ctx.fill();
    ctx.stroke();

    // Họng pha Portafilter
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 24, cy - 14, 48, 14);

    // Đồng hồ áp suất tròn viền vàng
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 50, cy - 45, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Kim đồng hồ
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 45);
    ctx.lineTo(cx - 42, cy - 52);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // STATION 3: FLUID LAYERING & ICE
  // ==========================================

  renderLayeringStation(ctx) {
    ctx.save();
    const cupX = 320;
    const cupY = 165;
    const cupW = 86;
    const cupH = 135;

    // Vạch đo ml bên cạnh cốc thủy tinh
    this.drawMeasurementMarks(ctx, cupX - cupW / 2 - 18, cupY, cupH);

    // Ly thủy tinh trong suốt
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(cupX - cupW / 2, cupY, cupW, cupH, [0, 0, 14, 14]);
    ctx.fill();
    ctx.stroke();

    // Các lớp chất lỏng phân tầng
    let currentY = cupY + cupH - 2;
    for (let i = 0; i < this.recipe.layers.length; i++) {
      const layer = this.recipe.layers[i];
      const targetLayerH = (cupH * layer.targetPct) / 100;
      const progress = this.layerProgress[i] || 0;
      const currentLayerH = (targetLayerH * progress) / 100;

      if (currentLayerH > 0) {
        ctx.fillStyle = layer.color;
        // Nếu là lớp đang rót và có sóng sánh
        if (i === this.activeLayerIndex && this.liquidWaveAmp > 0) {
          ctx.beginPath();
          ctx.moveTo(cupX - cupW / 2 + 2, currentY);
          ctx.lineTo(cupX + cupW / 2 - 2, currentY);
          ctx.lineTo(cupX + cupW / 2 - 2, currentY - currentLayerH);
          // Đường cong sóng sin
          const wave = Math.sin(this.liquidWavePhase) * this.liquidWaveAmp;
          ctx.quadraticCurveTo(cupX, currentY - currentLayerH + wave, cupX - cupW / 2 + 2, currentY - currentLayerH);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(cupX - cupW / 2 + 2, currentY - currentLayerH, cupW - 4, currentLayerH);
        }
        currentY -= currentLayerH;
      }
    }

    // Dòng chảy rót chất lỏng từ trên xuống
    if (this.isPouringLiquid && this.activeLayerIndex < this.recipe.layers.length) {
      const layer = this.recipe.layers[this.activeLayerIndex];
      ctx.fillStyle = layer.color;
      ctx.fillRect(cupX - 3.5, 95, 7, currentY - 95);
    }

    // Đá viên 3D khúc xạ ánh sáng
    for (const ice of this.iceCubes) {
      ctx.save();
      ctx.translate(ice.x, ice.y);
      ctx.rotate(ice.rotation);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.8)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-ice.size / 2, -ice.size / 2, ice.size, ice.size);
      ctx.strokeRect(-ice.size / 2, -ice.size / 2, ice.size, ice.size);
      ctx.restore();
    }

    // Hướng dẫn
    ctx.textAlign = 'center';
    ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
    if (this.currentIce < this.recipe.targetIce) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(this.isTouch ? `Chạm để THẢ ĐÁ VIÊN (${this.currentIce}/${this.recipe.targetIce})` : `Nhấp chuột / Bấm nút để THẢ ĐÁ VIÊN (${this.currentIce}/${this.recipe.targetIce})`, 320, 325);
    } else if (this.activeLayerIndex < this.recipe.layers.length) {
      const layer = this.recipe.layers[this.activeLayerIndex];
      const prog = Math.round(this.layerProgress[this.activeLayerIndex] || 0);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(this.isTouch ? `GIỮ tay để RÓT ${layer.name.toUpperCase()} (Hiện tại: ${prog}% / Mục tiêu: 100%)` : `GIỮ nút / Chuột để RÓT ${layer.name.toUpperCase()} (Hiện tại: ${prog}% / Mục tiêu: 100%)`, 320, 325);
    }
    ctx.restore();
  }

  drawMeasurementMarks(ctx, x, y, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 9px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 1; i <= 4; i++) {
      const markY = y + h - (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, markY);
      ctx.lineTo(x + 10, markY);
      ctx.stroke();
      ctx.fillText(`${i * 50}ml`, x - 3, markY + 3);
    }
    ctx.restore();
  }

  // ==========================================
  // STATION 4: STEAMING MICROFOAM
  // ==========================================

  renderSteamingStation(ctx) {
    ctx.save();
    const cx = 320;
    const cy = 210;

    // Ca Inox đánh bọt sữa
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 45, cy - 40, 90, 80, [0, 0, 12, 12]);
    ctx.fill();
    ctx.stroke();

    // Bọt sữa dâng tràn trong ca
    const foamH = (this.steamTexture / 100) * 35;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 40, 42, 0, Math.PI * 2);
    ctx.fill();

    // Vòi hơi Steam Wand cắm vào ca
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 65, 110);
    ctx.lineTo(cx + 10, cy - 35);
    ctx.stroke();

    // Đồng hồ đo nhiệt độ (°C) & Đồng hồ đo độ mịn Velvet (%)
    const s = this.cfg.steaming;

    // 1. Áp kế Nhiệt Độ Sữa (Bên Trái)
    this.drawRoundGauge(ctx, 190, 115, 'NHIỆT ĐỘ', `${Math.round(this.steamTemp)}°C`, this.steamTemp, 20, 85, s.minGoodTemp, s.maxGoodTemp, '#38bdf8');

    // 2. Áp kế Độ Mịn Velvet Microfoam (Bên Phải)
    this.drawRoundGauge(ctx, 450, 115, 'ĐỘ MỊN VELVET', `${Math.round(this.steamTexture)}%`, this.steamTexture, 0, 100, s.minGoodTexture, s.maxGoodTexture, '#f472b6');

    // Hướng dẫn
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isTouch ? 'GIỮ tay để SỤC HƠI STEAM WAND!' : 'GIỮ nút [Space] hoặc Chuột để SỤC HƠI STEAM WAND!', 320, 275);
    ctx.fillStyle = '#22c55e';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.isTouch ? 'Khi cả 2 đồng hồ đều ở VÙNG XANH: CHẠM NHANH để chuyển sang Rót Nghệ Thuật!' : 'Khi cả 2 đồng hồ đều ở VÙNG XANH: Bấm nút để chuyển sang Rót Nghệ Thuật!', 320, 295);
    ctx.restore();
  }

  drawRoundGauge(ctx, x, y, title, valText, val, min, max, goodMin, goodMax, color) {
    ctx.save();
    ctx.translate(x, y);

    // Viền kim loại
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Vùng xanh cung tròn
    const startAngle = Math.PI * 0.75;
    const totalAngle = Math.PI * 1.5;
    const goodStart = startAngle + ((goodMin - min) / (max - min)) * totalAngle;
    const goodEnd = startAngle + ((goodMax - min) / (max - min)) * totalAngle;

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.65)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 34, goodStart, goodEnd);
    ctx.stroke();

    // Kim đo
    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const needleAngle = startAngle + ratio * totalAngle;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(needleAngle) * 30, Math.sin(needleAngle) * 30);
    ctx.stroke();

    // Chữ giá trị
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(valText, 0, 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 8.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText(title, 0, 28);
    ctx.restore();
  }

  // ==========================================
  // STATION 5: LATTE ART & TOPPING
  // ==========================================

  renderLatteArtStation(ctx) {
    ctx.save();
    const cx = this.recognizer.cupCenterX;
    const cy = this.recognizer.cupCenterY;
    const cupR = this.recognizer.cupRadius;

    // Quai cốc sứ trắng
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, cupR + 12, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();

    // Miệng cốc sứ trắng nhìn từ trên xuống
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx, cy, cupR + 4, 0, Math.PI * 2);
    ctx.fill();

    // Lớp nền Crema nâu đậm
    const cremaGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, cupR);
    cremaGrad.addColorStop(0, '#5c2c0e');
    cremaGrad.addColorStop(0.85, '#3d1c06');
    cremaGrad.addColorStop(1, '#260e02');
    ctx.fillStyle = cremaGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cupR - 2, 0, Math.PI * 2);
    ctx.fill();

    // Các vệt bọt sữa đã vẽ
    ctx.fillStyle = '#ffffff';
    for (const p of this.lattePours) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Các hạt topping trang trí
    for (const top of this.toppingParticles) {
      ctx.fillStyle = top.color;
      ctx.beginPath();
      ctx.arc(top.x, top.y, top.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ ca rót sữa Inox (Milk Pitcher) nghiêng theo con trỏ chuột
    this.drawMilkPitcher(ctx, this.mousePos.x, this.mousePos.y);

    // Hướng dẫn
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Rê chuột / Chạm vào miệng ly để RÓT BỌT SỮA VẼ LATTE ART!', 320, 68);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.isTouch ? 'Chạm nhanh để TỰ VẼ / RẮC TOPPING / HOÀN TẤT món!' : 'Bấm nút để RẮC TOPPING hoặc HOÀN TẤT MÓN CÀ PHÊ', 320, 88);
    ctx.restore();
  }

  drawMilkPitcher(ctx, x, y) {
    ctx.save();
    ctx.translate(x + 20, y - 25);
    ctx.rotate(0.35); // Nghiêng rót sữa

    // Thân ca inox
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-14, -20, 28, 40, [2, 8, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Mỏ rót nhọn
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(-24, -2);
    ctx.lineTo(-14, 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();

    // Dòng sữa chảy từ mỏ xuống
    if (this.isPouringMilk) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-24, 0, 3, 25);
    }
    ctx.restore();
  }

  // ==========================================
  // STATION 6: RESULT & RATING
  // ==========================================

  renderResultStation(ctx) {
    ctx.save();
    if (!this.evaluation) return;

    // Bảng đánh giá bằng gỗ sang trọng
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(90, 55, 460, 235, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 21px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tác Phẩm: ${this.evaluation.title.toUpperCase()}`, 320, 95);

    // Sao vàng đánh giá
    const starStr = '★'.repeat(this.evaluation.stars) + '☆'.repeat(5 - this.evaluation.stars);
    ctx.font = '800 25px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(starStr, 320, 130);

    ctx.font = '500 13px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`"${this.evaluation.comment}"`, 320, 162);

    ctx.font = '700 13.5px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Điểm Nghệ Thuật: ${this.evaluation.score}/100 • Khách Hàng: ${this.recipe.customer}`, 320, 195);

    ctx.fillStyle = '#22c55e';
    ctx.font = '800 16px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Tổng Tiền Tip Tích Lũy: ${this.totalTips}đ 💰`, 320, 225);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Nhấp chuột hoặc Bấm nút [Hành Động] để nhận đơn tiếp theo!', 320, 265);
    ctx.restore();
  }
}
