/**
 * DEVER TOWN - BARISTA FPTU SIMULATOR 2.0
 * Mô phỏng quy trình Barista chuyên nghiệp 4 trạm tương tác:
 * 1. Order Station: Khách hàng FPTU đối thoại, thanh kiên nhẫn
 * 2. Layering Station: Thả đá + rót phân tầng chất lỏng theo tỷ trọng
 * 3. Whisking Station: Đánh bọt kem vi mô đo độ sánh mịn
 * 4. Latte Art Station: Rót bọt sữa tự do + chấm điểm nghệ thuật 1-5 sao
 */

import { BARISTA_CONFIG } from '../../../config/minigamesConfig.js';
import { LatteArtRecognizer } from '../common/LatteArtRecognizer.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class BaristaSimulatorEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks; // { onScoreUpdate, onAchievement }

    this.recognizer = new LatteArtRecognizer();

    // Danh sách đồ uống
    this.drinkKeys = Object.keys(BARISTA_CONFIG.drinks);
    this.currentDrinkIndex = 0;

    this.reset();
  }

  reset() {
    const drinkKey = this.drinkKeys[this.currentDrinkIndex % this.drinkKeys.length];
    this.recipe = BARISTA_CONFIG.drinks[drinkKey];

    // Trạng thái trạm: 'order' | 'layering' | 'whisking' | 'latte_art' | 'result'
    this.station = 'order';
    this.actionCooldownUntil = 0;

    // Trạm 1: Order
    this.patience = this.recipe.patienceSec;
    this.maxPatience = this.recipe.patienceSec;

    // Trạm 2: Layering
    this.currentIce = 0;
    this.iceCubes = [];
    this.layerProgress = [0, 0, 0]; // 3 lớp chất lỏng
    this.activeLayerIndex = 0;
    this.isPouringLiquid = false;

    // Trạm 3: Whisking
    this.whiskTexture = 25; // 0 - 100
    this.whiskDirection = 1;

    // Trạm 4: Latte Art
    this.recognizer.reset();
    this.isPouringMilk = false;
    this.lattePours = [];

    // Kết quả
    this.evaluation = null;
    this.totalTips = 0;
  }

  nextDrink() {
    this.currentDrinkIndex = (this.currentDrinkIndex + 1) % this.drinkKeys.length;
    this.reset();
  }

  onActionTrigger() {
    const now = Date.now();
    if (now < this.actionCooldownUntil) return;

    if (this.station === 'order') {
      this.station = 'layering';
      this.actionCooldownUntil = now + 450;
      audioManager.playClick();
      this.juiceFX.spawnFloatingText('Bắt Đầu Pha Chế!', 320, 180, { color: '#38bdf8' });
    } else if (this.station === 'layering') {
      // 1. Thả đá từng viên một có âm thanh và nhịp điệu
      if (this.currentIce < this.recipe.targetIce) {
        this.addIceCube();
        this.actionCooldownUntil = now + 320;
      } else {
        // 2. Rót từng nấc chất lỏng (+34% mỗi lần bấm)
        this.actionCooldownUntil = now + 300;
        this.layerProgress[this.activeLayerIndex] = (this.layerProgress[this.activeLayerIndex] || 0) + 34;
        audioManager.playLiquidPour();
        const layerName = this.recipe.layers[this.activeLayerIndex]?.name || 'Lớp';
        
        if (this.layerProgress[this.activeLayerIndex] >= 100) {
          this.layerProgress[this.activeLayerIndex] = 100;
          this.juiceFX.spawnFloatingText(`Đầy Lớp: ${layerName}!`, 320, 200, { color: '#fbbf24', size: 14 });
          this.activeLayerIndex++;

          if (this.activeLayerIndex >= this.recipe.layers.length) {
            this.station = 'whisking';
            this.actionCooldownUntil = now + 500;
            this.juiceFX.spawnFloatingText('Chuyển Sang Đánh Bọt Kem!', 320, 150, { color: '#f472b6' });
          }
        } else {
          this.juiceFX.spawnFloatingText(`Rót ${layerName}...`, 320, 200, { color: '#e0f2fe', size: 13 });
        }
      }
    } else if (this.station === 'whisking') {
      this.actionCooldownUntil = now + 160;
      // Mỗi lần bấm tăng thêm độ sánh
      this.whiskTexture = Math.min(100, this.whiskTexture + 8);
      audioManager.playWhisking();
      this.juiceFX.spawnSparkles(320, 190, 4, '#fdf2f8');

      // Nếu đã ở trong Vùng Xanh (68% - 90%) và người chơi xác nhận
      if (this.whiskTexture >= BARISTA_CONFIG.whisking.minGoodTexture && this.whiskTexture <= BARISTA_CONFIG.whisking.maxGoodTexture) {
        this.station = 'latte_art';
        this.actionCooldownUntil = now + 600;
        audioManager.playVictory();
        this.juiceFX.spawnFloatingText('Bọt Kem Sánh Mịn Chuẩn Chỉ!', 320, 160, { color: '#22c55e' });
      }
    } else if (this.station === 'latte_art') {
      this.actionCooldownUntil = now + 400;
      // Nếu người chơi chưa rê chuột vẽ bọt sữa thì tự động vẽ một hình nghệ thuật đẹp mắt
      if (this.lattePours.length === 0) {
        this.autoPourLatteArt();
      } else {
        this.finishDrink();
      }
    } else if (this.station === 'result') {
      this.actionCooldownUntil = now + 600;
      this.nextDrink();
    }
  }

  autoPourLatteArt() {
    audioManager.playWhisking();
    // Vẽ hình trái tim bọt sữa đối xứng mẫu
    const cx = this.recognizer.cupCenterX;
    const cy = this.recognizer.cupCenterY;
    const heartOffsets = [
      { dx: 0, dy: 15 }, { dx: -12, dy: 5 }, { dx: 12, dy: 5 },
      { dx: -20, dy: -8 }, { dx: 20, dy: -8 }, { dx: -12, dy: -22 },
      { dx: 12, dy: -22 }, { dx: 0, dy: -12 }, { dx: 0, dy: 2 }
    ];
    for (const off of heartOffsets) {
      this.recognizer.addPourPoint(cx + off.dx, cy + off.dy, 9);
      this.lattePours.push({ x: cx + off.dx, y: cy + off.dy, r: 10 });
    }
    this.juiceFX.spawnSparkles(cx, cy, 10, '#ffffff');
    this.juiceFX.spawnFloatingText('Vẽ Trái Tim Nghệ Thuật! Bấm nút để Hoàn Tất', 320, 100, { color: '#fbbf24', size: 14 });
  }

  addIceCube() {
    this.currentIce++;
    audioManager.playIceClink();
    this.iceCubes.push({
      x: 300 + (Math.random() - 0.5) * 40,
      y: 160,
      targetY: 265 - this.iceCubes.length * 16,
      rotation: Math.random() * Math.PI,
      size: 16
    });
    this.juiceFX.spawnFloatingText(`+1 Đá Viên (${this.currentIce}/${this.recipe.targetIce})`, 320, 140, { color: '#e0f2fe', size: 13 });
  }

  handlePointerDown(x, y) {
    if (this.station === 'latte_art') {
      this.isPouringMilk = true;
      this.handlePointerMove(x, y);
    }
  }

  handlePointerMove(x, y) {
    if (this.station === 'latte_art' && this.isPouringMilk) {
      if (this.recognizer.addPourPoint(x, y, 7)) {
        this.lattePours.push({ x, y, r: 7 + Math.random() * 3 });
        audioManager.playWhisking();
        this.juiceFX.spawnSteam(x, y, 1);
      }
    }
  }

  handlePointerUp() {
    this.isPouringMilk = false;
  }

  finishDrink() {
    this.evaluation = this.recognizer.evaluate();
    this.station = 'result';

    const earnedTip = Math.round(this.recipe.tipBase * this.evaluation.tipMultiplier * (this.patience / this.maxPatience));
    this.totalTips += earnedTip;

    audioManager.playGoalFanfare();
    this.juiceFX.shake(5, 0.2);
    this.juiceFX.spawnConfetti(320, 180, 40);
    this.juiceFX.spawnFloatingText(`+${earnedTip} Điểm Thưởng!`, 320, 120, { color: '#fbbf24', size: 24 });

    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate(earnedTip);
    }
  }

  update(dt) {
    // Giảm kiên nhẫn của khách hàng
    if (this.station !== 'result') {
      this.patience = Math.max(0, this.patience - dt);
    }

    // Hiệu ứng rơi đá viên
    for (const ice of this.iceCubes) {
      if (ice.y < ice.targetY) {
        ice.y += 180 * dt;
        if (ice.y > ice.targetY) ice.y = ice.targetY;
      }
    }

    // Trạm đánh kem: Giảm dần độ mịn nếu không đánh
    if (this.station === 'whisking') {
      this.whiskTexture = Math.max(10, this.whiskTexture - dt * 6);
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Nền quầy bar gỗ ấm Oblique 2.5D
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, w, h);

    // Mặt bàn cafe gỗ sồi
    const grad = ctx.createLinearGradient(0, 180, 0, h);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 190, w, h - 190);

    // Gờ nẹp bàn bóng loáng
    ctx.fillStyle = '#92400e';
    ctx.fillRect(0, 188, w, 4);

    if (this.station === 'order') {
      this.renderOrderStation(ctx);
    } else if (this.station === 'layering') {
      this.renderLayeringStation(ctx);
    } else if (this.station === 'whisking') {
      this.renderWhiskingStation(ctx);
    } else if (this.station === 'latte_art') {
      this.renderLatteArtStation(ctx);
    } else if (this.station === 'result') {
      this.renderResultStation(ctx);
    }

    // HUD kiên nhẫn ở đầu màn hình
    this.renderTopHUD(ctx);
  }

  renderTopHUD(ctx) {
    ctx.save();
    // Tiêu đề món
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 16px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Món Đang Pha: ${this.recipe.name}`, 20, 28);

    // Thanh kiên nhẫn
    const pPct = Math.max(0, this.patience / this.maxPatience);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(420, 14, 200, 18);
    ctx.fillStyle = pPct > 0.4 ? '#22c55e' : pPct > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(422, 16, 196 * pPct, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Thời Gian: ${Math.ceil(this.patience)}s`, 520, 28);
    ctx.restore();
  }

  renderOrderStation(ctx) {
    ctx.save();
    // Khung Order Dialog
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 60, 480, 120, 12);
    ctx.fill();
    ctx.stroke();

    // Avatar khách
    ctx.fillStyle = this.recipe.avatarColor;
    ctx.beginPath();
    ctx.arc(130, 120, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Khách Hàng: ${this.recipe.customer}`, 180, 95);

    ctx.font = '500 13px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`"${this.recipe.dialogue}"`, 180, 122);

    ctx.font = '700 12px Outfit, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Yêu cầu: ${this.recipe.targetIce} Viên Đá · Phân Tầng Chuẩn · Decor ${this.recipe.topping}`, 180, 148);

    // Gợi ý
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.fillText('Bấm nút Hành Động hoặc Click để bắt đầu pha chế!', 320, 240);
    ctx.restore();
  }

  renderLayeringStation(ctx) {
    ctx.save();
    const cupX = 320;
    const cupY = 160;
    const cupW = 80;
    const cupH = 120;

    // Vẽ ly thủy tinh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(cupX - cupW / 2, cupY, cupW, cupH, [0, 0, 12, 12]);
    ctx.fill();
    ctx.stroke();

    // Vẽ các lớp chất lỏng phân tầng
    let currentY = cupY + cupH;
    for (let i = 0; i < this.recipe.layers.length; i++) {
      const layer = this.recipe.layers[i];
      const targetLayerH = (cupH * layer.targetPct) / 100;
      const progress = this.layerProgress[i] || 0;
      const currentLayerH = (targetLayerH * progress) / 100;

      if (currentLayerH > 0) {
        ctx.fillStyle = layer.color;
        ctx.fillRect(cupX - cupW / 2 + 2, currentY - currentLayerH, cupW - 4, currentLayerH);
        currentY -= currentLayerH;
      }
    }

    // Vẽ đá viên
    ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (const ice of this.iceCubes) {
      ctx.save();
      ctx.translate(ice.x, ice.y);
      ctx.rotate(ice.rotation);
      ctx.fillRect(-ice.size / 2, -ice.size / 2, ice.size, ice.size);
      ctx.strokeRect(-ice.size / 2, -ice.size / 2, ice.size, ice.size);
      ctx.restore();
    }

    // Hướng dẫn
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    if (this.currentIce < this.recipe.targetIce) {
      ctx.fillText(`Bấm nút để THÊM ĐÁ VIÊN (${this.currentIce}/${this.recipe.targetIce})`, 320, 315);
    } else {
      const layerName = this.recipe.layers[this.activeLayerIndex]?.name || 'Hoàn tất';
      ctx.fillText(`Bấm nút để RÓT LỚP: ${layerName}`, 320, 315);
    }
    ctx.restore();
  }

  renderWhiskingStation(ctx) {
    ctx.save();
    // Bát đánh kem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(320, 190, 65, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Bọt kem bên trong
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.arc(320, 190, 60, 0, Math.PI);
    ctx.fill();

    // Thanh áp kế độ sánh mịn
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(160, 75, 320, 24);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(160, 75, 320, 24);

    // Vùng xanh hoàn hảo (68% - 90%)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.fillRect(160 + 320 * 0.68, 75, 320 * 0.22, 24);

    // Con trỏ bọt kem
    const curX = 160 + (320 * this.whiskTexture) / 100;
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(curX - 4, 68, 8, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bấm nút liên tục để ĐÁNH BỌT KEM vào VÙNG XANH HOÀN HẢO!', 320, 130);
    ctx.restore();
  }

  renderLatteArtStation(ctx) {
    ctx.save();
    const cupX = 320;
    const cupY = 220;
    const cupR = this.recognizer.cupRadius;

    // Miệng cốc tròn nhìn từ trên xuống
    ctx.fillStyle = '#451a03'; // Cốt cafe nâu đậm
    ctx.beginPath();
    ctx.arc(cupX, cupY, cupR, 0, Math.PI * 2);
    ctx.fill();

    // Quai cốc
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cupX, cupY, cupR + 10, -Math.PI / 4, Math.PI / 4);
    ctx.stroke();

    // Bọt sữa người chơi đã vẽ
    ctx.fillStyle = '#ffffff';
    for (const p of this.lattePours) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rê chuột / Chạm vào miệng cốc để RÓT BỌT SỮA VẼ LATTE ART!', 320, 80);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px Outfit, sans-serif';
    ctx.fillText('Bấm nút Hành Động khi đã vẽ xong để hoàn tất món', 320, 105);
    ctx.restore();
  }

  renderResultStation(ctx) {
    ctx.save();
    if (!this.evaluation) return;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(100, 60, 440, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Tác Phẩm: ${this.evaluation.title}`, 320, 105);

    // Sao đánh giá
    const starStr = '★'.repeat(this.evaluation.stars) + '☆'.repeat(5 - this.evaluation.stars);
    ctx.font = '800 24px Outfit, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(starStr, 320, 142);

    ctx.font = '500 13px Outfit, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`"${this.evaluation.comment}"`, 320, 175);

    ctx.font = '700 14px Outfit, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Điểm Nghệ Thuật: ${this.evaluation.score}/100`, 320, 205);

    ctx.font = '600 12px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Bấm nút Hành Động để nhận đơn hàng tiếp theo', 320, 245);
    ctx.restore();
  }
}
