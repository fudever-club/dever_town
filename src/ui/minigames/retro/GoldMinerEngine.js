/**
 * DEVER TOWN - GOLD MINER 3.0 (CYBER GOLD RUSH & MINER SHOP OVERHAUL)
 * Kế thừa tinh hoa từ game Vua Đào Vàng kinh điển & Notion Superpowers:
 * 1. Chu trình Day Cycle hoàn chỉnh: Khai khoáng (60s) -> Đạt mốc ngày -> Cửa hàng Thợ Mỏ (Shop) -> Mua sắm trang bị -> Sang ngày mới.
 * 2. Cửa hàng Thợ Mỏ (Intermission Shop): Mua Thuốc Nổ Dynamite, Nước Tăng Lực, Sách Đánh Bóng Kim Cương, Cỏ 4 Lá May Mắn, Kính Ngắm Laser.
 * 3. Chuột chũi ngậm Kim cương (Diamond Mole) đào hầm chạy ngang màn hình.
 * 4. Nổ dây chuyền thùng thuốc nổ TNT (Chain Reaction Blast) với sóng xung kích bán kính 105px.
 * 5. Đồ họa Procedural siêu nét: Thỏi vàng đa giác óng ánh, Kim cương lấp lánh giác cắt, Móc kẹp kim loại đóng mở cơ khí, Đèn pin quét nón sáng.
 * 6. Hỗ trợ thao tác toàn diện: Phím Space / Phím số 1-5 / Chuột & Cảm ứng chạm mượt mà.
 */

import { GOLD_MINER_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';
import { isTouchDevice } from '../common/touchHints.js';

export class GoldMinerEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;
    // Hint điều khiển in-canvas phải đúng thiết bị (2026-10-09, yêu cầu của Hưng).
    this.isTouch = isTouchDevice();

    this.cash = 0;
    this.day = 1;
    this.dynamiteCount = 2;

    // Các buff hiệu ứng mua từ Shop
    this.hasStrengthDrink = false;
    this.hasDiamondPolish = false;
    this.hasLuckyClover = false;
    this.hasLaserSight = false;

    // Quản lý cửa hàng
    this.purchasedToday = new Set();
    this.shopButtons = []; // Lưu tọa độ nút để click

    this.animTime = 0;
    this.winchRotation = 0;

    this.resetDay();
  }

  getTargetCashForDay(day) {
    const levels = GOLD_MINER_CONFIG.levels;
    if (levels && levels[day - 1]) {
      return levels[day - 1].targetCash;
    }
    return 650 + (day - 1) * 1400;
  }

  resetDay() {
    this.state = 'playing'; // 'playing' | 'day_clear' | 'shop' | 'game_over'
    this.targetCash = this.getTargetCashForDay(this.day);
    this.timeLeft = 60;
    this.dayStartCash = this.cash;
    this.purchasedToday.clear();

    const cfg = GOLD_MINER_CONFIG.hook;
    this.hook = {
      x: cfg.startX,
      y: cfg.startY,
      angle: 0,
      dir: 1,
      length: cfg.baseLength,
      state: 'swing', // 'swing' | 'shoot' | 'pull'
      grabbed: null
    };

    // 1. Tạo ngẫu nhiên khoáng sản phong phú
    this.minerals = [];
    const pool = [
      'gold_s', 'gold_s', 'gold_s',
      'gold_m', 'gold_m', 'gold_m',
      'gold_l', 'gold_l',
      'diamond', 'diamond',
      'rock_s', 'rock_s', 'rock_l', 'rock_l',
      'tnt', 'tnt',
      'mystery', 'mystery'
    ];

    for (const key of pool) {
      const def = GOLD_MINER_CONFIG.minerals[key];
      if (!def) continue;

      let attempts = 0;
      let mx, my;
      do {
        mx = 55 + Math.random() * (this.canvas.width - 110);
        my = 115 + Math.random() * (this.canvas.height - 155);
        attempts++;
      } while (
        attempts < 25 &&
        this.minerals.some(m => Math.hypot(m.x - mx, m.y - my) < m.r + def.r + 14)
      );

      // Tạo đa giác góc cạnh tự nhiên cho quặng vàng & đá
      const vertices = this.generatePolygonVertices(def.r, key.startsWith('gold') ? 6 : key.startsWith('rock') ? 7 : 8);

      this.minerals.push({
        id: Math.random().toString(36).substring(2, 9),
        type: key,
        name: def.name,
        x: mx,
        y: my,
        r: def.r,
        val: def.val,
        polishedVal: def.polishedVal || def.val,
        weight: def.weight || 1.0,
        color: def.color,
        shine: def.shine || '#ffffff',
        isBomb: def.isBomb || false,
        blastRadius: def.blastRadius || 105,
        isMystery: def.isMystery || false,
        vertices: vertices,
        rotation: Math.random() * Math.PI * 2
      });
    }

    // 2. Tạo Chuột chũi ngậm kim cương (Diamond Mole)
    this.moles = [];
    const moleCfg = GOLD_MINER_CONFIG.mole;
    const numMoles = this.day >= 2 ? (Math.random() < 0.65 ? 2 : 1) : 1;
    for (let i = 0; i < numMoles; i++) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      const startX = dir > 0 ? 30 : this.canvas.width - 30;
      const y = 145 + i * 85 + Math.random() * 40;
      const hasDiamond = Math.random() < moleCfg.diamondChance;

      this.moles.push({
        id: `mole_${i}`,
        type: 'mole',
        name: hasDiamond ? 'Chuột Chũi Kim Cương' : 'Chuột Chũi',
        x: startX,
        y: y,
        r: moleCfg.r,
        dir: dir,
        vx: moleCfg.speed * dir,
        hasDiamond: hasDiamond,
        val: hasDiamond ? moleCfg.valWithDiamond : moleCfg.valWithoutDiamond,
        weight: 0.8,
        color: moleCfg.color,
        walkAnim: 0
      });
    }
  }

  generatePolygonVertices(radius, sides) {
    const pts = [];
    const step = (Math.PI * 2) / sides;
    for (let i = 0; i < sides; i++) {
      const angle = i * step;
      // Độ biến thiên bán kính tạo hình dáng quặng tự nhiên
      const r = radius * (0.8 + Math.random() * 0.35);
      pts.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r
      });
    }
    return pts;
  }

  startNextDay() {
    this.day++;
    // Tẩy các buff dùng 1 ngày (nước tăng lực, cỏ may mắn, kính ngắm, đánh bóng)
    this.hasStrengthDrink = false;
    this.hasDiamondPolish = false;
    this.hasLuckyClover = false;
    this.hasLaserSight = false;

    // Áp dụng các buff vừa mua trong shop cho ngày mới
    for (const itemId of this.purchasedToday) {
      if (itemId === 'strength') this.hasStrengthDrink = true;
      if (itemId === 'polish') this.hasDiamondPolish = true;
      if (itemId === 'clover') this.hasLuckyClover = true;
      if (itemId === 'laser') this.hasLaserSight = true;
    }

    this.resetDay();
    audioManager.playVictory();
    this.juiceFX?.spawnFloatingText(`NGÀY ${this.day} — MỤC TIÊU: $${this.targetCash}`, 320, 150, {
      color: '#fbbf24',
      size: 20,
      fontWeight: '900'
    });
  }

  restartGame() {
    this.cash = 0;
    this.day = 1;
    this.dynamiteCount = 2;
    this.hasStrengthDrink = false;
    this.hasDiamondPolish = false;
    this.hasLuckyClover = false;
    this.hasLaserSight = false;
    this.purchasedToday.clear();
    this.resetDay();
  }

  onActionTrigger() {
    if (this.state === 'playing') {
      if (this.hook.state === 'swing') {
        this.shootHook();
      } else if (this.hook.state === 'pull' && this.hook.grabbed) {
        this.useDynamite();
      }
    } else if (this.state === 'day_clear') {
      // Chuyển sang Cửa Hàng Thợ Mỏ
      this.state = 'shop';
      audioManager.playClick();
    } else if (this.state === 'shop') {
      // Tiếp tục ngày mới
      this.startNextDay();
    } else if (this.state === 'game_over') {
      this.restartGame();
    }
  }

  handleKeyDown(e) {
    const code = e.code;
    const key = e.key;

    if (this.state === 'shop') {
      // Phím số 1..5 để mua đồ nhanh trong cửa hàng
      const shopKeys = ['dynamite', 'strength_drink', 'diamond_polish', 'lucky_clover', 'laser_sight'];
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', '1', '2', '3', '4', '5'].includes(code) || ['1', '2', '3', '4', '5'].includes(key)) {
        const index = parseInt(key || code.replace('Digit', ''), 10) - 1;
        if (shopKeys[index]) {
          this.buyShopItem(shopKeys[index]);
          return;
        }
      }
      if (code === 'Space' || code === 'Enter' || key === ' ' || key === 'Enter') {
        this.startNextDay();
        return;
      }
    }

    if (this.state === 'playing') {
      if (
        code === 'Space' || key === ' ' ||
        code === 'Enter' || key === 'Enter' ||
        code === 'ArrowDown' || key === 'ArrowDown' ||
        code === 'KeyS' || key === 's'
      ) {
        if (this.hook.state === 'swing') {
          this.shootHook();
        } else if (this.hook.state === 'pull' && this.hook.grabbed) {
          this.useDynamite();
        }
      }
    } else if (this.state === 'day_clear') {
      if (code === 'Space' || code === 'Enter' || key === ' ' || key === 'Enter') {
        this.state = 'shop';
        audioManager.playClick();
      }
    } else if (this.state === 'game_over') {
      if (code === 'Space' || code === 'Enter' || key === ' ' || key === 'Enter') {
        this.restartGame();
      }
    }
  }

  handlePointerClick(x, y) {
    if (this.state === 'shop') {
      // Kiểm tra click vào các thẻ vật phẩm trong Shop
      for (const btn of this.shopButtons) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          if (btn.type === 'buy') {
            this.buyShopItem(btn.itemId);
          } else if (btn.type === 'next_day') {
            this.startNextDay();
          }
          return;
        }
      }
      return;
    }

    if (this.state === 'playing') {
      // Kiểm tra click vào icon Dynamite trên HUD góc phải
      const dynIconX = this.canvas.width - 85;
      const dynIconY = 16;
      if (Math.hypot(x - dynIconX, y - dynIconY) < 26) {
        if (this.hook.state === 'pull' && this.hook.grabbed) {
          this.useDynamite();
          return;
        }
      }
      this.onActionTrigger();
    } else {
      this.onActionTrigger();
    }
  }

  buyShopItem(itemKey) {
    const item = GOLD_MINER_CONFIG.shopItems[itemKey];
    if (!item) return;

    // Kiểm tra xem đã sở hữu tối đa chưa
    if (item.id === 'dynamite') {
      if (this.dynamiteCount >= (item.maxHold || 5)) {
        this.juiceFX?.spawnFloatingText('Đã Đầy Thuốc Nổ (Tối Đa 5 Quả)!', 320, 290, { color: '#f59e0b', size: 14 });
        audioManager.playWrongBoop();
        return;
      }
    } else {
      if (this.purchasedToday.has(item.id)) {
        this.juiceFX?.spawnFloatingText('Bạn Đã Mua Vật Phẩm Này Rồi!', 320, 290, { color: '#f59e0b', size: 14 });
        audioManager.playWrongBoop();
        return;
      }
    }

    // Kiểm tra số dư tiền
    if (this.cash < item.price) {
      this.juiceFX?.spawnFloatingText(`Không Đủ Tiền! Cần $${item.price}`, 320, 290, { color: '#ef4444', size: 15 });
      audioManager.playWrongBoop();
      return;
    }

    // Thực hiện giao dịch mua
    this.cash -= item.price;
    audioManager.playIceClink();
    this.callbacks.onScoreUpdate?.(this.cash);

    if (item.id === 'dynamite') {
      this.dynamiteCount = Math.min(5, this.dynamiteCount + 1);
      this.juiceFX?.spawnFloatingText(`+1 Thuốc Nổ Dynamite! (Hiện có: ${this.dynamiteCount})`, 320, 285, { color: '#22c55e', size: 15 });
    } else {
      this.purchasedToday.add(item.id);
      this.juiceFX?.spawnFloatingText(`Trang Bị: ${item.name}!`, 320, 285, { color: '#22c55e', size: 15 });
    }
    this.juiceFX?.spawnConfetti(320, 180, 18);
  }

  shootHook() {
    this.hook.state = 'shoot';
    audioManager.playWinchCrank();
  }

  useDynamite() {
    if (this.dynamiteCount <= 0 || !this.hook.grabbed) return;
    this.dynamiteCount--;
    audioManager.playExplosion();
    this.juiceFX.shake(9, 0.25);

    const hx = this.hook.x + Math.sin(this.hook.angle) * this.hook.length;
    const hy = this.hook.y + Math.cos(this.hook.angle) * this.hook.length;
    this.juiceFX.spawnConfetti(hx, hy, 28);
    this.juiceFX.spawnFloatingText('NỔ DYNAMITE! 🧨', hx, hy - 20, { color: '#ef4444', size: 18, fontWeight: '900' });

    // Hủy vật thể đang kéo và thu móc về nhanh chóng
    this.hook.grabbed = null;
  }

  update(dt) {
    this.animTime += dt;

    if (this.state !== 'playing') return;

    // Cập nhật vị trí chuột chũi đào hầm
    for (const mole of this.moles) {
      mole.x += mole.vx;
      mole.walkAnim += dt * 8;
      if (mole.x <= 25) {
        mole.x = 25;
        mole.dir = 1;
        mole.vx = Math.abs(mole.vx);
      } else if (mole.x >= this.canvas.width - 25) {
        mole.x = this.canvas.width - 25;
        mole.dir = -1;
        mole.vx = -Math.abs(mole.vx);
      }
    }

    // Đếm ngược thời gian khai mỏ
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      if (this.cash >= this.targetCash) {
        this.state = 'day_clear';
        audioManager.playGoalFanfare();
        this.juiceFX.shake(6, 0.2);
        this.juiceFX.spawnConfetti(320, 150, 45);
      } else {
        this.state = 'game_over';
        audioManager.playExplosion();
        this.juiceFX.shake(8, 0.3);
      }
      return;
    }

    const h = this.hook;
    const cfg = GOLD_MINER_CONFIG.hook;

    if (h.state === 'swing') {
      h.angle += cfg.swingSpeed * h.dir;
      if (h.angle > cfg.maxAngle || h.angle < -cfg.maxAngle) {
        h.dir *= -1;
      }
    } else if (h.state === 'shoot') {
      h.length += cfg.shootSpeed;
      this.winchRotation += 0.25;

      const hx = h.x + Math.sin(h.angle) * h.length;
      const hy = h.y + Math.cos(h.angle) * h.length;

      // 1. Va chạm biên bản đồ
      if (hx < 8 || hx > this.canvas.width - 8 || hy > this.canvas.height - 8) {
        h.state = 'pull';
      }

      // 2. Va chạm Chuột chũi ngậm ngọc
      if (h.state === 'shoot') {
        for (let i = 0; i < this.moles.length; i++) {
          const mole = this.moles[i];
          if (Math.hypot(hx - mole.x, hy - mole.y) <= mole.r + 6) {
            h.grabbed = mole;
            this.moles.splice(i, 1);
            h.state = 'pull';
            audioManager.playPostClang();
            this.juiceFX.shake(3, 0.1);
            this.juiceFX.spawnSparkles(hx, hy, 12, mole.hasDiamond ? '#38bdf8' : '#78350f');
            this.juiceFX.spawnFloatingText(mole.name, hx, hy - 20, {
              color: mole.hasDiamond ? '#38bdf8' : '#fed7aa',
              size: 14,
              fontWeight: '800'
            });
            break;
          }
        }
      }

      // 3. Va chạm khoáng sản
      if (h.state === 'shoot') {
        for (let i = 0; i < this.minerals.length; i++) {
          const m = this.minerals[i];
          if (Math.hypot(hx - m.x, hy - m.y) <= m.r + 6) {
            if (m.isBomb) {
              // Kích nổ thùng TNT và chuỗi phản ứng dây chuyền
              this.detonateTNT(m.x, m.y);
              h.state = 'pull';
            } else {
              h.grabbed = m;
              this.minerals.splice(i, 1);
              h.state = 'pull';
              audioManager.playPostClang();
              this.juiceFX.shake(4, 0.12);
              this.juiceFX.spawnSparkles(hx, hy, 12, m.color);
              this.juiceFX.spawnFloatingText(m.name, hx, hy - 20, {
                color: m.color,
                size: 14,
                fontWeight: '700'
              });
            }
            break;
          }
        }
      }
    } else if (h.state === 'pull') {
      let speed = cfg.pullBaseSpeed;
      if (h.grabbed) {
        speed = Math.max(1.3, speed / (h.grabbed.weight || 1));
        // Buff Nước Tăng Lực: kéo nhẹ nhàng x2.5
        if (this.hasStrengthDrink) speed *= 2.5;
      }
      h.length -= speed;
      this.winchRotation -= 0.25;

      if (h.length <= cfg.baseLength) {
        h.length = cfg.baseLength;
        h.state = 'swing';

        if (h.grabbed) {
          this.resolveLoot(h.grabbed);
          h.grabbed = null;
        }
      }
    }
  }

  detonateTNT(bx, by) {
    audioManager.playExplosion();
    this.juiceFX.shake(12, 0.35);
    this.juiceFX.spawnConfetti(bx, by, 35);
    this.juiceFX.spawnSparkles(bx, by, 25, '#ef4444');
    this.juiceFX.spawnDust(bx, by, 18, 'rgba(239, 68, 68, 0.8)');
    this.juiceFX.spawnFloatingText('BOOM! THÙNG TNT PHÁT NỔ!', bx, by - 25, {
      color: '#ef4444',
      size: 20,
      fontWeight: '900'
    });

    const radius = 105;
    const chainTNTs = [];

    // Phá hủy toàn bộ khoáng sản trong vùng nổ
    for (let i = this.minerals.length - 1; i >= 0; i--) {
      const m = this.minerals[i];
      if (Math.hypot(m.x - bx, m.y - by) <= radius) {
        if (m.isBomb) {
          chainTNTs.push({ x: m.x, y: m.y });
        }
        this.minerals.splice(i, 1);
      }
    }

    // Nổ dây chuyền cho các thùng TNT lân cận
    if (chainTNTs.length > 0) {
      setTimeout(() => {
        for (const t of chainTNTs) {
          this.detonateTNT(t.x, t.y);
        }
      }, 90);
    }
  }

  resolveLoot(m) {
    let earned = m.val;

    if (m.type === 'diamond') {
      if (this.hasDiamondPolish) {
        earned = m.polishedVal || 900;
        this.juiceFX.spawnFloatingText(`KIM CƯƠNG ĐÁNH BÓNG: +$${earned}`, 320, 110, {
          color: '#38bdf8',
          size: 19,
          fontWeight: '900'
        });
      } else {
        this.juiceFX.spawnFloatingText(`KIM CƯƠNG: +$${earned}`, 320, 110, {
          color: '#38bdf8',
          size: 17,
          fontWeight: '800'
        });
      }
    } else if (m.type === 'mole') {
      if (m.hasDiamond) {
        const dVal = this.hasDiamondPolish ? 900 : 600;
        earned = dVal + 2;
        this.juiceFX.spawnFloatingText(`CHUỘT CHŨI KIM CƯƠNG: +$${earned}!`, 320, 110, {
          color: '#38bdf8',
          size: 19,
          fontWeight: '900'
        });
      } else {
        earned = 2;
        this.juiceFX.spawnFloatingText('CHUỘT CHŨI: +$2', 320, 110, {
          color: '#fed7aa',
          size: 14,
          fontWeight: '700'
        });
      }
    } else if (m.isMystery) {
      if (this.hasLuckyClover) {
        // Cỏ 4 lá: Quà giá trị cao ($450 - $800) hoặc tặng luôn Dynamite
        const isFreeDynamite = Math.random() < 0.35 && this.dynamiteCount < 5;
        if (isFreeDynamite) {
          this.dynamiteCount++;
          earned = 300;
          this.juiceFX.spawnFloatingText('CỎ 4 LÁ: TẶNG +1 DYNAMITE & $300!', 320, 110, {
            color: '#22c55e',
            size: 18,
            fontWeight: '900'
          });
        } else {
          earned = Math.round(450 + Math.random() * 350);
          this.juiceFX.spawnFloatingText(`CỎ 4 LÁ MAY MẮN: +$${earned}!`, 320, 110, {
            color: '#22c55e',
            size: 20,
            fontWeight: '900'
          });
        }
      } else {
        earned = Math.round(50 + Math.random() * 650);
        this.juiceFX.spawnFloatingText(`TÚI BÍ ẨN: +$${earned}`, 320, 110, {
          color: '#a855f7',
          size: 18,
          fontWeight: '800'
        });
      }
    } else {
      this.juiceFX.spawnFloatingText(`+$${earned}`, 320, 110, {
        color: m.color || '#fbbf24',
        size: 18,
        fontWeight: '800'
      });
    }

    this.cash += earned;
    audioManager.playIceClink();
    this.callbacks.onScoreUpdate?.(this.cash);
  }

  // ==========================================
  // RENDERING ENGINE
  // ==========================================

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Render cảnh hầm mỏ khai thác
    this.renderMiningScene(ctx, w, h);

    // 2. Render các lớp giao diện FSM (Shop, Day Clear, Game Over)
    if (this.state === 'day_clear') {
      this.renderDayClearOverlay(ctx, w, h);
    } else if (this.state === 'shop') {
      this.renderShopScreen(ctx, w, h);
    } else if (this.state === 'game_over') {
      this.renderGameOverOverlay(ctx, w, h);
    }
  }

  renderMiningScene(ctx, w, h) {
    // A. Bầu trời hoàng hôn & Bề mặt công trường khai thác (y: 0 - 65)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 65);
    skyGrad.addColorStop(0, '#1e1b4b');
    skyGrad.addColorStop(0.5, '#431407');
    skyGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, 65);

    // Bề mặt đất nén & vạch cảnh báo an toàn mỏ
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 58, w, 7);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 63, w, 2);

    // B. Lòng đất 3 tầng địa chất (y: 65 - 360)
    // Tầng 1: Đất bazan (65 - 160)
    const soilGrad1 = ctx.createLinearGradient(0, 65, 0, 165);
    soilGrad1.addColorStop(0, '#592911');
    soilGrad1.addColorStop(1, '#3b1809');
    ctx.fillStyle = soilGrad1;
    ctx.fillRect(0, 65, w, 100);

    // Tầng 2: Đá phiến trầm tích (165 - 265)
    const soilGrad2 = ctx.createLinearGradient(0, 165, 0, 265);
    soilGrad2.addColorStop(0, '#2e1910');
    soilGrad2.addColorStop(1, '#1c1917');
    ctx.fillStyle = soilGrad2;
    ctx.fillRect(0, 165, w, 100);

    // Tầng 3: Macma hắc diện thạch sâu thẳm (265 - 360)
    const soilGrad3 = ctx.createLinearGradient(0, 265, 0, h);
    soilGrad3.addColorStop(0, '#1c1917');
    soilGrad3.addColorStop(1, '#0c0a09');
    ctx.fillStyle = soilGrad3;
    ctx.fillRect(0, 265, w, h - 265);

    // Vẽ các sỏi đá & rễ cây chìm trong lòng đất
    this.drawSubterraneanDetails(ctx, w, h);

    // C. Luồng sáng đèn pin & Kính ngắm Laser
    this.drawFlashlightAndLaser(ctx);

    // D. Vẽ Khoáng sản & Thùng TNT
    for (const m of this.minerals) {
      this.drawMineral(ctx, m);
    }

    // E. Vẽ Chuột chũi ngậm kim cương
    for (const mole of this.moles) {
      this.drawMole(ctx, mole);
    }

    // F. Dây cáp xích sắt & Móc kẹp cơ khí
    this.drawHookAndChain(ctx);

    // G. Giàn tời gỗ & Chibi Thợ Mỏ Buggy
    this.drawMinerAndScaffold(ctx);

    // H. HUD Điểm, Thời gian & Trang bị
    this.renderHUD(ctx);
  }

  drawSubterraneanDetails(ctx, w, h) {
    ctx.save();
    // Đốm sỏi chìm
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const seeds = [
      { x: 80, y: 120, r: 4 }, { x: 190, y: 180, r: 6 },
      { x: 380, y: 140, r: 5 }, { x: 520, y: 210, r: 7 },
      { x: 130, y: 280, r: 5 }, { x: 440, y: 310, r: 6 }
    ];
    for (const s of seeds) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawFlashlightAndLaser(ctx) {
    const hook = this.hook;
    const hx = hook.x + Math.sin(hook.angle) * 320;
    const hy = hook.y + Math.cos(hook.angle) * 320;

    ctx.save();
    // 1. Luồng sáng hình nón của đèn pin thợ mỏ
    const coneAngle = 0.22;
    const p1x = hook.x + Math.sin(hook.angle - coneAngle) * 260;
    const p1y = hook.y + Math.cos(hook.angle - coneAngle) * 260;
    const p2x = hook.x + Math.sin(hook.angle + coneAngle) * 260;
    const p2y = hook.y + Math.cos(hook.angle + coneAngle) * 260;

    const flashGrad = ctx.createRadialGradient(hook.x, hook.y, 20, hook.x, hook.y, 260);
    flashGrad.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
    flashGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.06)');
    flashGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.moveTo(hook.x, hook.y);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.closePath();
    ctx.fill();

    // 2. Kính Ngắm Laser (Nếu đã mua trong Shop)
    if (this.hasLaserSight && hook.state === 'swing') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -this.animTime * 20;
      ctx.beginPath();
      ctx.moveTo(hook.x, hook.y);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      // Điểm hội tụ hồng ngoại
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMineral(ctx, m) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rotation);

    if (m.type === 'diamond') {
      // Kim Cương Bát Giác Lấp Lánh
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;

      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < m.vertices.length; i++) {
        const pt = m.vertices[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Giác phản chiếu ánh sáng bên trong
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.moveTo(-m.r * 0.4, -m.r * 0.4);
      ctx.lineTo(m.r * 0.3, -m.r * 0.5);
      ctx.lineTo(0, m.r * 0.4);
      ctx.closePath();
      ctx.fill();

      // Tia sáng sao nhấp nháy 4 cánh
      const starScale = 0.8 + Math.sin(this.animTime * 6 + m.x) * 0.3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -m.r * 1.3 * starScale);
      ctx.lineTo(0, m.r * 1.3 * starScale);
      ctx.moveTo(-m.r * 1.3 * starScale, 0);
      ctx.lineTo(m.r * 1.3 * starScale, 0);
      ctx.stroke();
    } else if (m.isBomb) {
      // Thùng Thuốc Nổ TNT
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-m.r, -m.r, m.r * 2, m.r * 2, 4);
      ctx.fill();
      ctx.stroke();

      // Vành đai thép đen
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-m.r, -m.r + 4, m.r * 2, 4);
      ctx.fillRect(-m.r, m.r - 8, m.r * 2, 4);

      // Chữ TNT màu vàng
      ctx.fillStyle = '#fde047';
      ctx.font = '900 11px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TNT', 0, 4);

      // Kíp nổ trên nắp
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -m.r);
      ctx.lineTo(3, -m.r - 6);
      ctx.stroke();
      // Đốm lửa kíp nổ nhấp nháy
      ctx.fillStyle = Math.random() < 0.5 ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(3, -m.r - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (m.isMystery) {
      // Túi Bí Ẩn
      ctx.fillStyle = '#7e22ce';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 3, m.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cổ túi thắt nơ
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-m.r * 0.6, -m.r - 2, m.r * 1.2, 5);

      // Dấu hỏi chấm vàng
      ctx.fillStyle = '#fde047';
      ctx.font = '900 13px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', 0, 8);
    } else {
      // Quặng Vàng / Đá Cuội Đa Giác Nổi Khối
      ctx.fillStyle = m.color;
      ctx.strokeStyle = m.shine;
      ctx.lineWidth = m.type.startsWith('gold') ? 2 : 1.5;
      if (m.type.startsWith('gold')) {
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = m.type === 'gold_l' ? 12 : 6;
      }

      ctx.beginPath();
      for (let i = 0; i < m.vertices.length; i++) {
        const pt = m.vertices[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Giác phản chiếu ánh kim
      if (m.type.startsWith('gold')) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.moveTo(m.vertices[0].x * 0.6, m.vertices[0].y * 0.6);
        ctx.lineTo(m.vertices[1].x * 0.6, m.vertices[1].y * 0.6);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawMole(ctx, mole) {
    ctx.save();
    ctx.translate(mole.x, mole.y);
    if (mole.dir < 0) ctx.scale(-1, 1);

    // Thân chuột chũi lông nâu
    ctx.fillStyle = mole.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, mole.r * 1.2, mole.r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mũi hồng
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(mole.r * 1.1, -1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mắt đen tròn
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(mole.r * 0.7, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Chân cào bới
    ctx.fillStyle = '#92400e';
    const legOffset = Math.sin(mole.walkAnim) * 3;
    ctx.fillRect(-mole.r * 0.6 + legOffset, mole.r * 0.6, 5, 4);
    ctx.fillRect(mole.r * 0.4 - legOffset, mole.r * 0.6, 5, 4);

    // Viên Kim cương ngậm trên miệng
    if (mole.hasDiamond) {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(mole.r * 1.3, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawHookAndChain(ctx) {
    const hook = this.hook;
    const hx = hook.x + Math.sin(hook.angle) * hook.length;
    const hy = hook.y + Math.cos(hook.angle) * hook.length;

    // 1. Vẽ mắt xích sắt cơ học liên kết
    const dist = hook.length;
    const linkSpacing = 8;
    const numLinks = Math.floor(dist / linkSpacing);

    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < numLinks; i++) {
      const lx = hook.x + Math.sin(hook.angle) * (i * linkSpacing);
      const ly = hook.y + Math.cos(hook.angle) * (i * linkSpacing);
      ctx.strokeRect(lx - 2, ly - 2, 4, 4);
    }
    ctx.restore();

    // 2. Móc kẹp kim loại 2 càng (Mechanical Claw)
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-hook.angle);

    // Khớp xoay kim loại
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Góc mở của 2 càng kẹp
    // Mở rộng khi đang bắn xuống (shoot), khép lại khi kẹp đồ (pull)
    const isOpen = hook.state === 'shoot' || (!hook.grabbed && hook.state === 'swing');
    const clawAngle = isOpen ? 0.45 : 0.15;

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Càng trái
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.lineTo(-12 * Math.cos(clawAngle), 14 * Math.sin(clawAngle + 0.8));
    ctx.lineTo(-4, 18);
    ctx.stroke();

    // Càng phải
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.lineTo(12 * Math.cos(clawAngle), 14 * Math.sin(clawAngle + 0.8));
    ctx.lineTo(4, 18);
    ctx.stroke();

    // Nếu đang kẹp vật phẩm
    if (hook.grabbed) {
      ctx.save();
      ctx.translate(0, 18);
      if (hook.grabbed.type === 'mole') {
        this.drawMole(ctx, { ...hook.grabbed, x: 0, y: 0 });
      } else {
        this.drawMineral(ctx, { ...hook.grabbed, x: 0, y: 0, rotation: 0 });
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawMinerAndScaffold(ctx) {
    const hook = this.hook;

    ctx.save();
    // 1. Giàn tời gỗ công trường
    ctx.fillStyle = '#78350f';
    ctx.fillRect(hook.x - 28, hook.y - 28, 56, 8); // Dầm ngang
    ctx.fillRect(hook.x - 24, hook.y - 20, 6, 24); // Chân trái
    ctx.fillRect(hook.x + 18, hook.y - 20, 6, 24); // Chân phải

    // Bánh xe ròng rọc cơ khí xoay tròn
    ctx.save();
    ctx.translate(hook.x, hook.y);
    ctx.rotate(this.winchRotation);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Nan hoa ròng rọc
    ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
    ctx.moveTo(0, -9); ctx.lineTo(0, 9);
    ctx.stroke();
    ctx.restore();

    // 2. Chibi Buggy Thợ Mỏ
    // Thân bọ Buggy xanh công nghệ
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(hook.x - 12, hook.y - 42, 24, 18, 5);
    ctx.fill();

    // Nón bảo hộ cam FPTU
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(hook.x, hook.y - 42, 11, Math.PI, 0);
    ctx.fill();
    // Vành nón
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(hook.x - 14, hook.y - 42, 28, 3.5);

    // Đèn pin trên mũ bảo hộ phát sáng
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.fillRect(hook.x - 3.5, hook.y - 47, 7, 5);
    ctx.shadowColor = 'transparent';

    // Mắt kính dev
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(hook.x - 4, -36 + hook.y, 2.5, 0, Math.PI * 2);
    ctx.arc(hook.x + 4, -36 + hook.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderHUD(ctx) {
    ctx.save();
    // Thanh HUD nền tối mờ phía trên
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(12, 8, this.canvas.width - 24, 42, 8);
    ctx.fill();
    ctx.stroke();

    // Tiền hiện tại & Mục tiêu ngày
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 15px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`TIỀN: $${this.cash}`, 24, 27);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Mục Tiêu: $${this.targetCash}`, 24, 42);

    // Ngày chơi & Thời gian đếm ngược
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`NGÀY ${this.day}`, 320, 26);

    const timeRatio = Math.max(0, this.timeLeft / 60);
    ctx.fillStyle = timeRatio > 0.35 ? '#22c55e' : '#ef4444';
    ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`⏱️ ${Math.ceil(this.timeLeft)}s`, 320, 42);

    // Dynamite & Buffs góc phải
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ef4444';
    ctx.font = '800 13.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`🧨 x${this.dynamiteCount}`, this.canvas.width - 26, 27);

    // Huy hiệu Buff đang kích hoạt
    const activeBuffs = [];
    if (this.hasStrengthDrink) activeBuffs.push('⚡');
    if (this.hasDiamondPolish) activeBuffs.push('💎');
    if (this.hasLuckyClover) activeBuffs.push('🍀');
    if (this.hasLaserSight) activeBuffs.push('🎯');

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(activeBuffs.length > 0 ? activeBuffs.join(' ') : 'Chưa có buff', this.canvas.width - 26, 42);

    // Dòng hướng dẫn phím ở đáy màn hình
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 12.5px "Be Vietnam Pro", sans-serif';
    if (this.hook.state === 'pull' && this.hook.grabbed && this.dynamiteCount > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText(this.isTouch ? 'CHẠM VÀO ICON DYNAMITE ĐỂ KÍCH NỔ HỦY ĐÁ!' : 'BẤM PHÍM [Space / S / Nút Nổ] ĐỂ KÍCH NỔ DYNAMITE HỦY ĐÁ!', 320, 348);
    } else {
      ctx.fillText(this.isTouch ? 'Chạm để PHÓNG MÓC · Chạm icon Dynamite khi kéo đá để HỦY ĐÁ' : 'Bấm [Space / Chuột] để PHÓNG MÓC · Bấm [Space] khi kéo đá để DÙNG DYNAMITE', 320, 348);
    }
    ctx.restore();
  }

  // ==========================================
  // SCREEN 2: DAY CLEAR CELEBRATION
  // ==========================================

  renderDayClearOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 0, w, h);

    // Khung bảng vinh quang vàng
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(140, 50, 360, 245, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 22px "Be Vietnam Pro", sans-serif';
    ctx.fillText('🎉 HOÀN THÀNH NGÀY!', 320, 95);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 15px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Tổng Tiền Thu Nhập: $${this.cash}`, 320, 135);

    ctx.fillStyle = '#22c55e';
    ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Đã Vượt Mức Mục Tiêu: +$${this.cash - this.targetCash}`, 320, 165);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Ghé Cửa Hàng Thợ Mỏ để sắm thuốc nổ & đồ nghề cho Ngày mới!', 320, 205);

    // Nút CTA vào Shop
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(200, 230, 240, 42, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.isTouch ? 'CHẠM ĐỂ VÀO CỬA HÀNG THỢ MỎ' : 'VÀO CỬA HÀNG THỢ MỎ [Space]', 320, 256);
    ctx.restore();
  }

  // ==========================================
  // SCREEN 3: INTERMISSION MINER SHOP
  // ==========================================

  renderShopScreen(ctx, w, h) {
    this.shopButtons = [];

    ctx.save();
    // Nền quầy hàng gỗ ấm cúng
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, w, h);

    // Vầng sáng đèn măng-sông
    const glow = ctx.createRadialGradient(320, 40, 10, 320, 140, 280);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Tiêu đề Cửa Hàng
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 20px "Be Vietnam Pro", sans-serif';
    ctx.fillText('🏪 CỬA HÀNG THỢ MỎ (MINER SHOP)', 320, 32);

    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Số Dư Tiền: $${this.cash} · Sắm đồ nghề chuẩn bị cho Ngày ${this.day + 1}`, 320, 52);

    // 5 Thẻ vật phẩm hàng hóa (Card layout)
    const items = [
      GOLD_MINER_CONFIG.shopItems.dynamite,
      GOLD_MINER_CONFIG.shopItems.strength_drink,
      GOLD_MINER_CONFIG.shopItems.diamond_polish,
      GOLD_MINER_CONFIG.shopItems.lucky_clover,
      GOLD_MINER_CONFIG.shopItems.laser_sight
    ];

    const cardW = 112;
    const cardH = 175;
    const startX = 28;
    const cardY = 70;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const cx = startX + i * (cardW + 10);

      // Nền thẻ hàng
      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      // Phím tắt mua nhanh [1..5]
      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 11px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`[${i + 1}]`, cx + 8, cardY + 16);

      // Icon vật phẩm lớn
      ctx.textAlign = 'center';
      ctx.font = '28px "Be Vietnam Pro", sans-serif';
      ctx.fillText(it.icon || '📦', cx + cardW / 2, cardY + 50);

      // Tên vật phẩm
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 11px "Be Vietnam Pro", sans-serif';
      ctx.fillText(it.name, cx + cardW / 2, cardY + 76);

      // Mô tả công dụng
      ctx.fillStyle = '#a8a29e';
      ctx.font = '500 9.5px "Be Vietnam Pro", sans-serif';
      this.drawWrappedText(ctx, it.desc, cx + cardW / 2, cardY + 94, cardW - 12, 12);

      // Giá niêm yết
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`$${it.price}`, cx + cardW / 2, cardY + 138);

      // Nút MUA
      const btnX = cx + 8;
      const btnY = cardY + 146;
      const btnW = cardW - 16;
      const btnH = 22;

      let isPurchased = false;
      let isFull = false;

      if (it.id === 'dynamite') {
        isFull = this.dynamiteCount >= 5;
      } else {
        isPurchased = this.purchasedToday.has(it.id);
      }

      if (isPurchased || isFull) {
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 4);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 10.5px "Be Vietnam Pro", sans-serif';
        ctx.fillText(isFull ? 'ĐÃ ĐẦY' : 'ĐÃ MUA', cx + cardW / 2, btnY + 15);
      } else {
        const canAfford = this.cash >= it.price;
        ctx.fillStyle = canAfford ? '#16a34a' : '#7f1d1d';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10.5px "Be Vietnam Pro", sans-serif';
        ctx.fillText(canAfford ? 'MUA' : 'THIẾU TIỀN', cx + cardW / 2, btnY + 15);

        // Đăng ký vùng nút để click
        this.shopButtons.push({
          type: 'buy',
          itemId: it.id,
          x: btnX,
          y: btnY,
          w: btnW,
          h: btnH
        });
      }
    }

    // Nút Bắt Đầu Ngày Mới CTA
    const nextBtnX = 220;
    const nextBtnY = 270;
    const nextBtnW = 200;
    const nextBtnH = 38;

    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(nextBtnX, nextBtnY, nextBtnW, nextBtnH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isTouch ? 'CHẠM ĐỂ BẮT ĐẦU NGÀY MỚI' : 'BẮT ĐẦU NGÀY MỚI [Space]', 320, nextBtnY + 24);

    this.shopButtons.push({
      type: 'next_day',
      x: nextBtnX,
      y: nextBtnY,
      w: nextBtnW,
      h: nextBtnH
    });

    // Dòng ghi chú
    ctx.fillStyle = '#78716c';
    ctx.font = '500 11px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.isTouch ? 'Chạm để MUA · Chạm nút để Bắt Đầu' : 'Bấm phím [1 - 5] hoặc click để MUA · Bấm [Space] hoặc click nút để Bắt Đầu', 320, 328);
    ctx.restore();
  }

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
  }

  // ==========================================
  // SCREEN 4: GAME OVER OVERLAY
  // ==========================================

  renderGameOverOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(140, 50, 360, 240, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 24px "Be Vietnam Pro", sans-serif';
    ctx.fillText('HẾT THỜI GIAN KHAI MỎ!', 320, 95);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 15px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Tổng Tiền Thu Nhập: $${this.cash}`, 320, 135);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Chưa Đạt Mục Tiêu Ngày: $${this.targetCash}`, 320, 165);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`Bạn Đã Khai Thác Đến Ngày ${this.day}. Hãy Cố Gắng Lần Sau!`, 320, 195);

    // Nút Thử Lại
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(220, 225, 200, 38, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "Be Vietnam Pro", sans-serif';
    ctx.fillText(this.isTouch ? 'CHẠM ĐỂ THỬ LẠI TỪ NGÀY 1' : 'THỬ LẠI TỪ NGÀY 1 [Space]', 320, 249);
    ctx.restore();
  }
}
