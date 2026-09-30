/**
 * DEVER TOWN - CYBER BUGGY SLITHER 3.0 (RETRO ARCADE)
 * Động cơ Rắn Săn Mồi thế hệ mới mô phỏng linh thú chú bọ Buggy của CLB FU-DEVER:
 * 1. Tạo hình linh thú Buggy: Đầu bọ kim loại, 2 ăng-ten rung rinh, mắt biểu cảm hướng theo đường đi.
 * 2. Thân uốn lượn mượt mà (Smooth Interpolated Spine) với các đốt vỏ bọ vi mạch phát sáng neon.
 * 3. 6 loại mồi & vật phẩm: Dâu tây Buggy, Đồng D-Coin, Ớt Lửa Nitro, Đồng Hồ Băng, Nam Châm Siêu Dẫn, Cổng Dịch Chuyển Portal.
 * 4. Hệ thống Combo Streak nhân điểm (x1 -> x4) trong cửa sổ 3.5s.
 * 5. Cơ chế Xả Thân Tăng Tốc (Boost-Burn) và hiệu ứng Hit-stop, Rung chấn Camera khi va chạm.
 */

import { SNAKE_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class SnakeEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.grid = SNAKE_CONFIG.gridSize || 20;
    this.cols = Math.floor(canvas.width / this.grid);
    this.rows = Math.floor(canvas.height / this.grid);

    this.animTimer = 0;
    this.hitStop = 0;

    this.reset();
  }

  reset() {
    const startX = Math.floor(this.cols / 3);
    const startY = Math.floor(this.rows / 2);

    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
      { x: startX - 3, y: startY }
    ];

    // Lịch sử tọa độ mượt cho animation uốn lượn
    this.prevSnake = this.snake.map(s => ({ ...s }));

    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.isBoosting = false;

    this.tickTimer = 0;
    this.lerpProgress = 0;
    this.boostBurnTimer = 0;
    this.inputQueue = [];

    // Combo Streak
    this.combo = 0;
    this.comboTimer = 0;
    this.comboMultiplier = 1;

    // Buffs
    this.speedBuffTimer = 0;
    this.slowBuffTimer = 0;
    this.magnetBuffTimer = 0;

    // Danh sách thức ăn
    this.foods = [];
    this.portals = [];

    // Sinh các loại mồi ban đầu
    this.spawnFood('strawberry');
    this.spawnFood('strawberry');
    this.spawnFood('dcoin');
    this.spawnFood('chili');

    this.callbacks.onScoreUpdate?.(0);
  }

  spawnFood(preferredType = null) {
    if (this.foods.length >= (SNAKE_CONFIG.maxFoods || 4)) return;

    let type = preferredType;
    if (!type) {
      const rand = Math.random();
      if (rand < 0.50) type = 'strawberry';
      else if (rand < 0.70) type = 'dcoin';
      else if (rand < 0.82) type = 'chili';
      else if (rand < 0.92) type = 'ice';
      else type = 'magnet';
    }

    let attempts = 0;
    while (attempts < 60) {
      const x = Math.floor(Math.random() * (this.cols - 2)) + 1;
      const y = Math.floor(Math.random() * (this.rows - 2)) + 1;
      const occupiedBySnake = this.snake.some(s => s.x === x && s.y === y);
      const occupiedByFood = this.foods.some(f => Math.round(f.x) === x && Math.round(f.y) === y);
      const occupiedByPortal = this.portals.some(p => p.x === x && p.y === y);

      if (!occupiedBySnake && !occupiedByFood && !occupiedByPortal) {
        this.foods.push({
          x,
          y,
          type,
          bobTimer: Math.random() * Math.PI * 2,
          pulseTimer: Math.random() * Math.PI * 2
        });
        break;
      }
      attempts++;
    }
  }

  spawnPortals() {
    this.portals = [
      { x: 2, y: Math.floor(this.rows / 2), targetX: this.cols - 3, targetY: Math.floor(this.rows / 2), color: '#38bdf8' },
      { x: this.cols - 3, y: Math.floor(this.rows / 2), targetX: 2, targetY: Math.floor(this.rows / 2), color: '#f97316' }
    ];
    this.juiceFX.spawnFloatingText('CỔNG DỊCH CHUYỂN!', this.canvas.width / 2, 70, { color: '#38bdf8', size: 16 });
  }

  setDirection(dx, dy) {
    if (this.gameOver) return;
    const lastDir = this.inputQueue.length > 0 ? this.inputQueue[this.inputQueue.length - 1] : this.dir;
    // Không thể quay ngược đầu 180 độ
    if (lastDir.x + dx === 0 && lastDir.y + dy === 0) return;
    // Không thêm hướng trùng lặp liên tiếp
    if (lastDir.x === dx && lastDir.y === dy) return;
    if (this.inputQueue.length < 2) {
      this.inputQueue.push({ x: dx, y: dy });
    }
  }

  setBoosting(boosting) {
    this.isBoosting = boosting;
  }

  onActionTrigger() {
    if (this.gameOver) {
      this.reset();
    } else {
      this.isBoosting = !this.isBoosting;
    }
  }

  handleKeyDown(e) {
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') this.setDirection(0, -1);
    else if (code === 'KeyS' || code === 'ArrowDown' || key === 's') this.setDirection(0, 1);
    else if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') this.setDirection(-1, 0);
    else if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') this.setDirection(1, 0);
    else if (code === 'ShiftLeft' || code === 'ShiftRight') this.setBoosting(true);
    else if (code === 'KeyR' || key === 'r') this.reset();
    else if (code === 'Space' || code === 'KeyE' || key === 'enter' || code === 'Enter') {
      this.onActionTrigger();
    }
  }

  handleKeyUp(e) {
    const code = e.code || '';
    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      this.setBoosting(false);
    }
  }

  handlePointerClick(x, y) {
    if (this.gameOver) {
      this.reset();
      return;
    }

    // Điều khiển chuyển hướng theo góc click tương đối với đầu Buggy
    const headPxX = (this.snake[0].x + 0.5) * this.grid;
    const headPxY = (this.snake[0].y + 0.5) * this.grid;
    const dx = x - headPxX;
    const dy = y - headPxY;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setDirection(dx > 0 ? 1 : -1, 0);
    } else {
      this.setDirection(0, dy > 0 ? 1 : -1);
    }
  }

  update(dt) {
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    this.animTimer += dt;

    if (this.gameOver) return;

    // Cập nhật Combo window
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboMultiplier = 1;
      }
    }

    // Cập nhật Buffs
    if (this.speedBuffTimer > 0) this.speedBuffTimer -= dt;
    if (this.slowBuffTimer > 0) this.slowBuffTimer -= dt;
    if (this.magnetBuffTimer > 0) {
      this.magnetBuffTimer -= dt;
      this.applyMagnet();
    }

    // Tính chu kỳ tick
    let interval = SNAKE_CONFIG.baseTickMs;
    if (this.isBoosting || this.speedBuffTimer > 0) {
      interval = SNAKE_CONFIG.boostTickMs;
    }
    if (this.slowBuffTimer > 0) {
      interval *= 1.6;
    }

    this.tickTimer += dt * 1000;
    if (this.tickTimer >= interval) {
      this.tickTimer %= interval;
      this.step();
    }
    this.lerpProgress = Math.min(1.0, Math.max(0.0, this.tickTimer / interval));

    // Xả thân tăng tốc: hao hụt 1 đốt thân mỗi 2 giây khi chủ động boost
    if (this.isBoosting && this.snake.length > 4) {
      this.boostBurnTimer += dt;
      if (this.boostBurnTimer >= SNAKE_CONFIG.boostBurnCostSec) {
        this.boostBurnTimer = 0;
        const dropped = this.snake.pop();
        this.prevSnake.pop();
        this.foods.push({
          x: dropped.x,
          y: dropped.y,
          type: 'strawberry',
          bobTimer: 0,
          pulseTimer: 0
        });
        this.juiceFX.spawnSparkles(
          (dropped.x + 0.5) * this.grid,
          (dropped.y + 0.5) * this.grid,
          4,
          '#ea580c'
        );
      }
    }

    // Bụi & tia lửa sau đuôi khi tăng tốc
    if ((this.isBoosting || this.speedBuffTimer > 0) && Math.random() < 0.45) {
      const tail = this.snake[this.snake.length - 1];
      this.juiceFX.spawnSparkles(
        (tail.x + 0.5) * this.grid,
        (tail.y + 0.5) * this.grid,
        2,
        '#f97316'
      );
    }
  }

  applyMagnet() {
    const head = this.snake[0];
    const radius = SNAKE_CONFIG.items.magnet.radiusGrid || 4.5;

    for (const f of this.foods) {
      const dx = head.x - f.x;
      const dy = head.y - f.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= radius && dist > 0.1) {
        // Hút mồi dần về đầu rắn
        f.x += (dx / dist) * Math.min(0.22, dist);
        f.y += (dy / dist) * Math.min(0.22, dist);

        if (dist < 0.6) {
          f.x = head.x;
          f.y = head.y;
        }
      }
    }
  }

  step() {
    // Lưu tọa độ trước để Lerp uốn lượn
    this.prevSnake = this.snake.map(s => ({ ...s }));

    if (this.inputQueue.length > 0) {
      this.nextDir = this.inputQueue.shift();
    }
    this.dir = { ...this.nextDir };
    let newHeadX = this.snake[0].x + this.dir.x;
    let newHeadY = this.snake[0].y + this.dir.y;

    // Vòng lặp biên bản đồ (Wrap-around)
    if (newHeadX < 0) newHeadX = this.cols - 1;
    if (newHeadX >= this.cols) newHeadX = 0;
    if (newHeadY < 0) newHeadY = this.rows - 1;
    if (newHeadY >= this.rows) newHeadY = 0;

    // Kiểm tra Cổng Dịch Chuyển (Portal)
    for (const portal of this.portals) {
      if (newHeadX === portal.x && newHeadY === portal.y) {
        newHeadX = portal.targetX;
        newHeadY = portal.targetY;
        audioManager.playTeleport();
        this.juiceFX.spawnSparkles((newHeadX + 0.5) * this.grid, (newHeadY + 0.5) * this.grid, 12, portal.color);
        break;
      }
    }

    // Kiểm tra tự cắn đuôi (Self collision)
    // Bỏ qua đuôi cuối nếu đuôi đó sẽ dịch chuyển
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === newHeadX && this.snake[i].y === newHeadY) {
        this.endGame();
        return;
      }
    }

    // Thêm đầu mới
    this.snake.unshift({ x: newHeadX, y: newHeadY });

    // Kiểm tra ăn thức ăn
    let ateIndex = -1;
    for (let i = 0; i < this.foods.length; i++) {
      const f = this.foods[i];
      if (Math.round(f.x) === newHeadX && Math.round(f.y) === newHeadY) {
        ateIndex = i;
        break;
      }
    }

    if (ateIndex !== -1) {
      const food = this.foods.splice(ateIndex, 1)[0];
      this.handleEat(food);
      this.spawnFood();
      if (this.prevSnake.length < this.snake.length) {
        this.prevSnake.push({ ...this.snake[this.snake.length - 1] });
      }
    } else {
      // Không ăn mồi: bỏ đốt cuối
      this.snake.pop();
    }
  }

  handleEat(food) {
    const headPxX = (this.snake[0].x + 0.5) * this.grid;
    const headPxY = (this.snake[0].y + 0.5) * this.grid;

    // Cập nhật Combo Streak
    if (this.comboTimer > 0) {
      this.combo++;
      this.comboMultiplier = Math.min(4, Math.floor(this.combo / 2) + 1);
    } else {
      this.combo = 1;
      this.comboMultiplier = 1;
    }
    this.comboTimer = SNAKE_CONFIG.comboWindowSec || 3.5;

    let pts = 10;
    let text = '+10';
    let textColor = '#22c55e';

    switch (food.type) {
      case 'strawberry':
      case 'apple':
        pts = 10;
        text = this.comboMultiplier > 1 ? `+10 COMBO x${this.comboMultiplier}!` : '+10';
        textColor = '#f43f5e';
        audioManager.playPickup();
        this.juiceFX.spawnSparkles(headPxX, headPxY, 6, '#f43f5e');
        break;

      case 'dcoin':
        pts = 50;
        text = this.comboMultiplier > 1 ? `🪙 D-COIN +50 (x${this.comboMultiplier})!` : '🪙 D-COIN +50!';
        textColor = '#facc15';
        audioManager.playScorePopup();
        this.juiceFX.spawnSparkles(headPxX, headPxY, 14, '#facc15');
        this.juiceFX.shake(3, 0.1);
        break;

      case 'chili':
        pts = 30;
        this.speedBuffTimer = 5.5;
        text = '🌶️ NITRO BỨT TỐC!';
        textColor = '#ea580c';
        audioManager.playOnFire();
        this.juiceFX.spawnSparkles(headPxX, headPxY, 12, '#ea580c');
        this.juiceFX.shake(4, 0.15);
        break;

      case 'ice':
      case 'ice_cream':
        pts = 15;
        this.slowBuffTimer = 6.0;
        text = '❄️ ĐỒNG HỒ BĂNG CHẬM LẠI!';
        textColor = '#38bdf8';
        audioManager.playIceClink();
        this.juiceFX.spawnSparkles(headPxX, headPxY, 8, '#38bdf8');
        break;

      case 'magnet':
        pts = 25;
        this.magnetBuffTimer = 7.0;
        text = '🧲 NAM CHÂM SIÊU DẪN!';
        textColor = '#eab308';
        audioManager.playPostClang();
        this.juiceFX.spawnSparkles(headPxX, headPxY, 10, '#eab308');
        break;
    }

    const earned = pts * this.comboMultiplier;
    this.score += earned;

    audioManager.playComboChime(Math.min(4, this.comboMultiplier));
    this.juiceFX.spawnFloatingText(text, headPxX, headPxY - 14, { color: textColor, size: 15 });

    // Mở cổng dịch chuyển ở mốc 120 điểm
    if (this.score >= 120 && this.portals.length === 0) {
      this.spawnPortals();
    }

    this.callbacks.onScoreUpdate?.(this.score);
  }

  endGame() {
    this.gameOver = true;
    this.hitStop = 0.08;
    audioManager.playExplosion();

    const headPxX = (this.snake[0].x + 0.5) * this.grid;
    const headPxY = (this.snake[0].y + 0.5) * this.grid;

    this.juiceFX.shake(9, 0.25);
    this.juiceFX.spawnConfetti(headPxX, headPxY, 35);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Nền Cyber Grid tối
    ctx.fillStyle = SNAKE_CONFIG.theme?.bg || '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Lưới vi mạch nhẹ
    ctx.strokeStyle = SNAKE_CONFIG.theme?.gridLine || 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += this.grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += this.grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Cổng dịch chuyển Portals (nếu có)
    for (const portal of this.portals) {
      const px = (portal.x + 0.5) * this.grid;
      const py = (portal.y + 0.5) * this.grid;
      const radius = this.grid * 0.7 + Math.sin(this.animTimer * 6) * 2;

      ctx.save();
      ctx.strokeStyle = portal.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = portal.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Vẽ mồi & vật phẩm
    for (const food of this.foods) {
      this.renderFoodItem(ctx, food);
    }

    // 4. Viền cảnh báo Danger Glow khi đầu sát biên (nếu có chế độ va chạm tường)
    const head = this.snake[0];
    if (head.x <= 1 || head.x >= this.cols - 2 || head.y <= 1 || head.y >= this.rows - 2) {
      ctx.save();
      ctx.strokeStyle = SNAKE_CONFIG.theme?.wallGlow || 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, w - 4, h - 4);
      ctx.restore();
    }

    // 5. Thân & Đầu linh thú Buggy
    this.renderBuggySnake(ctx);

    // 6. HUD Điểm số, Combo & Game Over
    this.renderHUD(ctx);
  }

  renderFoodItem(ctx, food) {
    const fx = (food.x + 0.5) * this.grid;
    const fy = (food.y + 0.5) * this.grid + Math.sin(this.animTimer * 4 + food.bobTimer) * 2.5;

    ctx.save();
    switch (food.type) {
      case 'strawberry':
      case 'apple':
        // Dâu Tây Buggy
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(fx, fy + 1, this.grid / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        // Hạt dâu
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(fx - 2, fy, 1.5, 1.5);
        ctx.fillRect(fx + 2, fy + 2, 1.5, 1.5);
        // Cuống lá xanh
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(fx, fy - this.grid / 2 + 3, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'dcoin':
        // Đồng tiền số D-Coin vàng
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(fx, fy, this.grid / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.font = '900 11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('D', fx, fy + 0.5);
        break;

      case 'chili':
        // Ớt Lửa Nitro
        ctx.fillStyle = '#ea580c';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 8, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(fx - 5, fy - 5, 2.5, 2.5);
        break;

      case 'ice':
      case 'ice_cream':
        // Đồng hồ băng cyan
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Kim đồng hồ
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx, fy - 4);
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + 3, fy);
        ctx.stroke();
        break;

      case 'magnet':
        // Nam Châm
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(fx - 6, fy - 5, 4, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(fx + 2, fy - 5, 4, 10);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(fx - 6, fy + 3, 12, 3);
        break;
    }
    ctx.restore();
  }

  renderBuggySnake(ctx) {
    if (this.snake.length === 0) return;

    const t = this.lerpProgress;
    const bodyColors = SNAKE_CONFIG.theme?.bodyGradient || ['#10b981', '#059669', '#047857'];

    // 1. Tính tọa độ pixel nội suy mượt mà của tất cả các đốt
    const pts = [];
    for (let i = 0; i < this.snake.length; i++) {
      const cur = this.snake[i];
      const prev = this.prevSnake[i] || cur;
      let px = prev.x + (cur.x - prev.x) * t;
      let py = prev.y + (cur.y - prev.y) * t;
      if (Math.abs(cur.x - prev.x) > 1) px = cur.x;
      if (Math.abs(cur.y - prev.y) > 1) py = cur.y;
      pts.push({
        x: (px + 0.5) * this.grid,
        y: (py + 0.5) * this.grid
      });
    }

    // 2. Vẽ thân uốn lượn liền khối (Capsule Spine Connections)
    for (let i = this.snake.length - 1; i >= 1; i--) {
      const p1 = pts[i];
      const p0 = pts[i - 1];
      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      if (dist <= this.grid * 1.5) {
        const segRatio = (this.snake.length - i) / this.snake.length;
        const radius = (this.grid / 2 - 1) * (0.55 + 0.45 * segRatio);
        ctx.save();
        ctx.strokeStyle = bodyColors[i % bodyColors.length];
        ctx.lineWidth = radius * 1.9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (this.speedBuffTimer > 0 || this.isBoosting) {
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p0.x, p0.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Vẽ các đốt thân hình cầu bo tròn và vi mạch
    for (let i = this.snake.length - 1; i >= 1; i--) {
      const p = pts[i];
      const segRatio = (this.snake.length - i) / this.snake.length;
      const radius = (this.grid / 2 - 1) * (0.55 + 0.45 * segRatio);
      const color = bodyColors[i % bodyColors.length];

      ctx.save();
      ctx.fillStyle = color;
      if (this.speedBuffTimer > 0 || this.isBoosting) {
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(3, radius), 0, Math.PI * 2);
      ctx.fill();

      // Hoa văn vi mạch ánh sáng trên lưng đốt thân
      if (i % 2 === 0) {
        ctx.fillStyle = '#a7f3d0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, radius * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Vẽ Đầu Linh Thú Buggy (Segment 0)
    const headPxX = pts[0].x;
    const headPxY = pts[0].y;

    ctx.save();

    // Hào quang Buggy
    const headColor = (this.speedBuffTimer > 0 || this.isBoosting)
      ? (SNAKE_CONFIG.theme?.headBoostColor || '#f97316')
      : (SNAKE_CONFIG.theme?.headColor || '#10b981');

    ctx.fillStyle = headColor;
    ctx.shadowColor = headColor;
    ctx.shadowBlur = 12;

    // Vỏ bọ bo tròn
    ctx.beginPath();
    ctx.arc(headPxX, headPxY, this.grid / 2 + 1, 0, Math.PI * 2);
    ctx.fill();

    // 2 Ăng-ten chú bọ Buggy rung rinh
    const sway = Math.sin(this.animTimer * 10) * 0.25;
    const antLen = 9;
    const dirAngle = Math.atan2(this.dir.y, this.dir.x);

    ctx.strokeStyle = SNAKE_CONFIG.theme?.antennaColor || '#34d399';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Ăng-ten trái
    const antLeftAngle = dirAngle - 0.45 + sway;
    ctx.beginPath();
    ctx.moveTo(headPxX, headPxY);
    ctx.lineTo(headPxX + Math.cos(antLeftAngle) * antLen, headPxY + Math.sin(antLeftAngle) * antLen);
    ctx.stroke();

    // Ăng-ten phải
    const antRightAngle = dirAngle + 0.45 - sway;
    ctx.beginPath();
    ctx.moveTo(headPxX, headPxY);
    ctx.lineTo(headPxX + Math.cos(antRightAngle) * antLen, headPxY + Math.sin(antRightAngle) * antLen);
    ctx.stroke();

    // Đôi mắt Buggy to tròn & có tròng nhìn theo hướng
    const eyeSpread = 4.2;
    const eyeDist = 4.5;
    const perpAngle = dirAngle + Math.PI / 2;

    const eye1X = headPxX + Math.cos(dirAngle) * eyeDist + Math.cos(perpAngle) * eyeSpread;
    const eye1Y = headPxY + Math.sin(dirAngle) * eyeDist + Math.sin(perpAngle) * eyeSpread;

    const eye2X = headPxX + Math.cos(dirAngle) * eyeDist - Math.cos(perpAngle) * eyeSpread;
    const eye2Y = headPxY + Math.sin(dirAngle) * eyeDist - Math.sin(perpAngle) * eyeSpread;

    // Tròng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, 3, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Con ngươi đen liếc theo hướng
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(eye1X + this.dir.x * 1.2, eye1Y + this.dir.y * 1.2, 1.4, 0, Math.PI * 2);
    ctx.arc(eye2X + this.dir.x * 1.2, eye2Y + this.dir.y * 1.2, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Vành từ trường nam châm xung quanh đầu (nếu có buff)
    if (this.magnetBuffTimer > 0) {
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(headPxX, headPxY, this.grid * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  renderHUD(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    // Điểm số chính
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 17px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Điểm Số: ${this.score}`, 18, 28);

    // Chuỗi Combo Streak
    if (this.comboTimer > 0 && this.comboMultiplier > 1) {
      ctx.fillStyle = '#facc15';
      ctx.font = '900 14px Outfit, sans-serif';
      const pct = Math.max(0, this.comboTimer / (SNAKE_CONFIG.comboWindowSec || 3.5));
      ctx.fillText(`COMBO x${this.comboMultiplier} (${pct.toFixed(1)}s)`, 18, 48);

      // Thanh đếm ngược combo
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.fillRect(18, 53, 110, 3);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(18, 53, 110 * pct, 3);
    }

    // Các buff thời gian đang kích hoạt
    let badgeY = 72;
    if (this.speedBuffTimer > 0) {
      ctx.fillStyle = '#ea580c';
      ctx.font = '700 12px Outfit, sans-serif';
      ctx.fillText(`ỚT NITRO: ${this.speedBuffTimer.toFixed(1)}s`, 18, badgeY);
      badgeY += 18;
    }
    if (this.slowBuffTimer > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 12px Outfit, sans-serif';
      ctx.fillText(`ĐỒNG HỒ BĂNG: ${this.slowBuffTimer.toFixed(1)}s`, 18, badgeY);
      badgeY += 18;
    }
    if (this.magnetBuffTimer > 0) {
      ctx.fillStyle = '#eab308';
      ctx.font = '700 12px Outfit, sans-serif';
      ctx.fillText(`NAM CHÂM: ${this.magnetBuffTimer.toFixed(1)}s`, 18, badgeY);
    }

    // Nút gợi ý điều khiển
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px Outfit, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('WASD / Mũi Tên: Lái Buggy · Shift: Bứt Tốc · R: Chơi Lại', w - 18, 28);

    // Màn hình Game Over
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(11, 17, 32, 0.90)';
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 32px Outfit, sans-serif';
      ctx.fillText('BUGGY ĐÃ BỊ KẸT!', w / 2, 145);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.fillText(`Điểm Số Cuối Cùng: ${this.score}`, w / 2, 185);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillText('Bấm Phím Cách (Space) hoặc R hoặc Click Chuột để chơi lại', w / 2, 225);
    }

    ctx.restore();
  }
}
