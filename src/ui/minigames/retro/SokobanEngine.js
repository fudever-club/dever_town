/**
 * DEVER TOWN - SOKOBAN WAREHOUSE MASTER 3.0 (RETRO ARCADE)
 * Động cơ Đẩy Hộp Trí Tuệ thế hệ mới:
 * 1. Nhân vật Thủ Kho Chibi FPTU với 4 hướng nhìn và tư thế vươn tay đẩy hộp sinh động.
 * 2. Chuyển động trượt mượt mà (Smooth Lerp Slide 120ms) cho cả nhân vật và thùng hàng.
 * 3. Đồ họa khối hộp 3D Beveled: Thùng hàng kim loại gắn lõi năng lượng phát sáng khi vào điểm đích.
 * 4. Sàn băng trượt quán tính (Ice Floor) trôi mượt kèm hiệu ứng bụi băng và âm thanh clink.
 * 5. Bảng điều khiển tương tác trực tiếp (Hoàn tác U, Chơi lại R, Modal chọn 15 màn chơi L).
 */

import { SOKOBAN_LEVELS } from '../../../config/sokobanLevels.js';
import { SOKOBAN_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';
import { isTouchDevice } from '../common/touchHints.js';

export class SokobanEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;
    // Hint điều khiển in-canvas phải đúng thiết bị (2026-10-09, yêu cầu của Hưng).
    this.isTouch = isTouchDevice();

    this.tileSize = SOKOBAN_CONFIG.tileSize || 38;
    this.currentLevelIndex = 0;
    this.animTimer = 0;

    // Trạng thái trượt mượt mà (Lerp)
    this.playerVisual = { x: 0, y: 0 };
    this.isSliding = false;
    this.pushTimer = 0;
    this.facingDir = { dx: 0, dy: 1 }; // Hướng nhìn: mặc định quay xuống dưới

    // Danh sách các hộp đang trượt animation
    this.movingBoxes = [];

    // Modal chọn màn chơi
    this.showLevelSelect = false;

    this.loadLevel(0);
  }

  loadLevel(index) {
    this.currentLevelIndex = (index + SOKOBAN_LEVELS.length) % SOKOBAN_LEVELS.length;
    this.levelData = SOKOBAN_LEVELS[this.currentLevelIndex];

    // Bản đồ logic
    this.map = this.levelData.map.map(row => [...row]);
    this.rows = this.map.length;
    this.cols = this.map[0].length;

    this.player = { x: 0, y: 0 };
    this.moves = 0;
    this.history = []; // Undo stack
    this.won = false;
    this.deadlockedBoxes = [];
    this.movingBoxes = [];
    this.showLevelSelect = false;

    // Tìm tọa độ nhân vật
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 5 || this.map[r][c] === 6) {
          this.player = { x: c, y: r };
        }
      }
    }

    this.playerVisual = { x: this.player.x, y: this.player.y };
    this.facingDir = { dx: 0, dy: 1 };

    // Căn giữa canvas
    this.offsetX = Math.floor((this.canvas.width - this.cols * this.tileSize) / 2);
    this.offsetY = Math.floor((this.canvas.height - this.rows * this.tileSize) / 2) + 12;

    this.checkDeadlocks();
    this.callbacks.onScoreUpdate?.(this.currentLevelIndex + 1);
  }

  restartLevel() {
    this.loadLevel(this.currentLevelIndex);
    audioManager.playClick();
    this.juiceFX.spawnFloatingText('CHƠI LẠI MÀN', this.canvas.width / 2, 90, { color: '#f59e0b', size: 14 });
  }

  toggleLevelSelect() {
    this.showLevelSelect = !this.showLevelSelect;
    audioManager.playClick();
  }

  onActionTrigger() {
    if (this.won) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.undo();
    }
  }

  handleKeyDown(e) {
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (this.showLevelSelect) {
      if (code === 'Escape' || key === 'escape' || key === 'l') {
        this.showLevelSelect = false;
        return;
      }
      if (key >= '1' && key <= '9') {
        const lvl = parseInt(key, 10) - 1;
        if (lvl < SOKOBAN_LEVELS.length) {
          this.loadLevel(lvl);
          return;
        }
      }
    }

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') this.move(0, -1);
    else if (code === 'KeyS' || code === 'ArrowDown' || key === 's') this.move(0, 1);
    else if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') this.move(-1, 0);
    else if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') this.move(1, 0);
    else if (key === 'u' || code === 'KeyU' || key === 'z' || code === 'KeyZ' || code === 'Backspace') this.undo();
    else if (code === 'KeyR' || key === 'r') this.restartLevel();
    else if (code === 'KeyL' || key === 'l') this.toggleLevelSelect();
    else if (code === 'Space' || code === 'KeyE' || key === 'enter' || code === 'Enter') {
      this.onActionTrigger();
    }
  }

  handlePointerClick(x, y) {
    // 1. Nếu đang mở modal chọn màn
    if (this.showLevelSelect) {
      const modalW = 440;
      const modalH = 260;
      const mx = (this.canvas.width - modalW) / 2;
      const my = (this.canvas.height - modalH) / 2;

      // Click ra ngoài modal: đóng modal
      if (x < mx || x > mx + modalW || y < my || y > my + modalH) {
        this.showLevelSelect = false;
        return;
      }

      // Nút đóng (X)
      if (x >= mx + modalW - 32 && x <= mx + modalW - 10 && y >= my + 10 && y <= my + 32) {
        this.showLevelSelect = false;
        return;
      }

      // Bảng lưới 15 nút chọn màn (5 cột x 3 dòng)
      const startGridX = mx + 25;
      const startGridY = my + 55;
      const btnW = 68;
      const btnH = 50;
      const gapX = 12;
      const gapY = 12;

      for (let i = 0; i < SOKOBAN_LEVELS.length; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const bx = startGridX + col * (btnW + gapX);
        const by = startGridY + row * (btnH + gapY);

        if (x >= bx && x <= bx + btnW && y >= by && y <= by + btnH) {
          audioManager.playClick();
          this.loadLevel(i);
          return;
        }
      }
      return;
    }

    // 2. Các nút điều khiển trên thanh HUD
    // Nút Hoàn Tác [U] (x: 430, y: 15, w: 85, h: 26)
    if (x >= 420 && x <= 505 && y >= 12 && y <= 40) {
      this.undo();
      return;
    }
    // Nút Chơi Lại [R] (x: 515, y: 15, w: 85, h: 26)
    if (x >= 510 && x <= 585 && y >= 12 && y <= 40) {
      this.restartLevel();
      return;
    }
    // Nút Chọn Màn [L] (x: 590, y: 15, w: 40, h: 26)
    if (x >= 590 && x <= 630 && y >= 12 && y <= 40) {
      this.toggleLevelSelect();
      return;
    }

    // 3. Nếu màn hình Thắng: click bất kỳ đâu để sang màn tiếp theo
    if (this.won) {
      this.loadLevel(this.currentLevelIndex + 1);
      return;
    }

    // 4. Click điều hướng nhân vật theo tọa độ tương đối
    const pxCenter = this.offsetX + (this.player.x + 0.5) * this.tileSize;
    const pyCenter = this.offsetY + (this.player.y + 0.5) * this.tileSize;
    const dx = x - pxCenter;
    const dy = y - pyCenter;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.move(dx > 0 ? 1 : -1, 0);
    } else {
      this.move(0, dy > 0 ? 1 : -1);
    }
  }

  undo() {
    if (this.history.length === 0) return;
    const prev = this.history.pop();
    this.map = prev.map.map(r => [...r]);
    this.player = { ...prev.player };
    this.playerVisual = { x: this.player.x, y: this.player.y };
    this.moves = prev.moves;
    this.movingBoxes = [];
    this.won = false;

    audioManager.playUndo();
    this.checkDeadlocks();
    this.juiceFX.spawnFloatingText('HOÀN TÁC (UNDO)', this.canvas.width / 2, 90, { color: '#38bdf8', size: 14 });
  }

  move(dx, dy) {
    if (this.won) return;

    this.facingDir = { dx, dy };

    const px = this.player.x;
    const py = this.player.y;
    const nx = px + dx;
    const ny = py + dy;

    // Chặn ngoài biên hoặc là tường (tile 1)
    if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) return;
    if (this.map[ny][nx] === 1) return;

    const targetTile = this.map[ny][nx];
    const isBox = targetTile === 3 || targetTile === 4;

    if (isBox) {
      let nnx = nx + dx;
      let nny = ny + dy;
      if (nnx < 0 || nnx >= this.cols || nny < 0 || nny >= this.rows) return;

      // Không thể đẩy 2 hộp liền nhau hoặc đẩy vào tường
      const nextNextTile = this.map[nny][nnx];
      if (nextNextTile === 1 || nextNextTile === 3 || nextNextTile === 4) return;

      // Lưu lịch sử để Undo
      this.history.push({
        map: this.map.map(r => [...r]),
        player: { ...this.player },
        moves: this.moves
      });

      // Lưu tọa độ ban đầu của hộp phục vụ animation
      const boxOriginX = nx;
      const boxOriginY = ny;

      // Cơ chế Sàn Băng Trơn (Ice Floor - tile 7): Trượt theo quán tính
      let slidePath = [{ x: nnx, y: nny }];
      while (
        this.map[nny][nnx] === 7 &&
        nnx + dx >= 0 &&
        nnx + dx < this.cols &&
        nny + dy >= 0 &&
        nny + dy < this.rows &&
        ![1, 3, 4].includes(this.map[nny + dy][nnx + dx])
      ) {
        nnx += dx;
        nny += dy;
        slidePath.push({ x: nnx, y: nny });
      }

      // Cập nhật vị trí logic của hộp
      this.map[ny][nx] = targetTile === 4 ? 2 : 0;
      const destTile = this.map[nny][nnx];
      const isDestinationTarget = destTile === 2;
      this.map[nny][nnx] = isDestinationTarget ? 4 : 3;

      // Kích hoạt trạng thái đẩy và animation trượt
      this.pushTimer = 0.16;
      this.movingBoxes.push({
        fromX: boxOriginX,
        fromY: boxOriginY,
        toX: nnx,
        toY: nny,
        progress: 0,
        isTarget: isDestinationTarget
      });

      audioManager.playSokobanSlide();
      if (slidePath.length > 1) {
        audioManager.playIceClink();
      }

      const worldDestX = this.offsetX + (nnx + 0.5) * this.tileSize;
      const worldDestY = this.offsetY + (nny + 0.5) * this.tileSize;

      if (isDestinationTarget) {
        audioManager.playCorrectChime?.(1);
        this.juiceFX.spawnSparkles(worldDestX, worldDestY, 12, '#22c55e');
        this.juiceFX.spawnFloatingText('KHỚP ĐÍCH!', worldDestX, worldDestY - 14, { color: '#4ade80', size: 14 });
      } else {
        this.juiceFX.spawnSparkles(worldDestX, worldDestY, 4, '#f59e0b');
      }
    } else {
      // Di chuyển bình thường
      this.history.push({
        map: this.map.map(r => [...r]),
        player: { ...this.player },
        moves: this.moves
      });
    }

    // Di chuyển nhân vật
    const currTile = this.map[py][px];
    this.map[py][px] = currTile === 6 ? 2 : 0;
    this.map[ny][nx] = this.map[ny][nx] === 2 ? 6 : 5;
    this.player = { x: nx, y: ny };
    this.moves++;

    audioManager.playFootstep('stone');
    this.checkDeadlocks();
    this.checkWinCondition();
  }

  checkDeadlocks() {
    this.deadlockedBoxes = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // Hộp chưa vào đích (tile 3)
        if (this.map[r][c] === 3) {
          const wallUp = r === 0 || this.map[r - 1][c] === 1;
          const wallDown = r === this.rows - 1 || this.map[r + 1][c] === 1;
          const wallLeft = c === 0 || this.map[r][c - 1] === 1;
          const wallRight = c === this.cols - 1 || this.map[r][c + 1] === 1;

          if ((wallUp && wallLeft) || (wallUp && wallRight) || (wallDown && wallLeft) || (wallDown && wallRight)) {
            this.deadlockedBoxes.push({ x: c, y: r });
          }
        }
      }
    }
  }

  checkWinCondition() {
    let remainingBoxes = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.map[r][c] === 3) remainingBoxes++;
      }
    }

    if (remainingBoxes === 0) {
      this.won = true;
      audioManager.playGoalFanfare();
      this.juiceFX.shake(6, 0.2);
      this.juiceFX.spawnConfetti(this.canvas.width / 2, this.canvas.height / 2, 45);

      const stars = this.moves <= this.levelData.parMoves ? 3 : this.moves <= this.levelData.parMoves * 1.5 ? 2 : 1;
      this.juiceFX.spawnFloatingText(`HOÀN THÀNH MÀN CHƠI! ${'★'.repeat(stars)}`, this.canvas.width / 2, 115, { color: '#fbbf24', size: 22 });
      this.callbacks.onScoreUpdate?.(stars * 100);
    }
  }

  update(dt) {
    this.animTimer += dt;

    if (this.pushTimer > 0) {
      this.pushTimer -= dt;
    }

    // Cập nhật vị trí mượt mà của nhân vật (Lerp visual)
    const lerpSpeed = 16 * dt;
    this.playerVisual.x += (this.player.x - this.playerVisual.x) * Math.min(1.0, lerpSpeed);
    this.playerVisual.y += (this.player.y - this.playerVisual.y) * Math.min(1.0, lerpSpeed);

    // Cập nhật các hộp đang trượt animation
    for (let i = this.movingBoxes.length - 1; i >= 0; i--) {
      const mb = this.movingBoxes[i];
      mb.progress += dt / (SOKOBAN_CONFIG.slideDurationMs ? SOKOBAN_CONFIG.slideDurationMs / 1000 : 0.12);
      if (mb.progress >= 1.0) {
        this.movingBoxes.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ts = this.tileSize;

    // 1. Nền phòng kho vi mạch công nghệ cao
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.bg || '#0b1120';
    ctx.fillRect(0, 0, w, h);

    // 2. Vẽ Lớp Sàn, Tường và Điểm Đích Socket
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetX + c * ts;
        const y = this.offsetY + r * ts;
        const tile = this.map[r][c];

        ctx.save();
        if (tile === 1) {
          // Tường kim loại / đá phiến 3D nổi khối
          this.renderWallTile(ctx, x, y, ts);
        } else if (tile === 7) {
          // Sàn băng trơn bóng
          this.renderIceTile(ctx, x, y, ts);
        } else {
          // Sàn đi lại bình thường
          this.renderFloorTile(ctx, x, y, ts);
        }

        // Điểm đích Socket vi mạch (tile 2 hoặc 4 hoặc 6)
        if (tile === 2 || tile === 4 || tile === 6) {
          this.renderTargetSocket(ctx, x, y, ts);
        }
        ctx.restore();
      }
    }

    // 3. Vẽ các Hộp Kim Loại (Box)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = this.map[r][c];
        if (tile === 3 || tile === 4) {
          // Nếu hộp này đang có animation di chuyển thì vẽ theo tọa độ lerp
          const moving = this.movingBoxes.find(b => b.toX === c && b.toY === r);
          if (moving) {
            const bx = moving.fromX + (moving.toX - moving.fromX) * Math.min(1.0, moving.progress);
            const by = moving.fromY + (moving.toY - moving.fromY) * Math.min(1.0, moving.progress);
            this.renderBox(ctx, this.offsetX + bx * ts, this.offsetY + by * ts, ts, moving.isTarget);
          } else {
            this.renderBox(ctx, this.offsetX + c * ts, this.offsetY + r * ts, ts, tile === 4);
          }
        }
      }
    }

    // 4. Vẽ Nhân Vật Thủ Kho Chibi FPTU
    const playerRenderX = this.offsetX + this.playerVisual.x * ts;
    const playerRenderY = this.offsetY + this.playerVisual.y * ts;
    this.renderChibiPlayer(ctx, playerRenderX, playerRenderY, ts);

    // 5. Cảnh báo kẹt góc Deadlock
    for (const d of this.deadlockedBoxes) {
      const x = this.offsetX + (d.x + 0.5) * ts;
      const y = this.offsetY + (d.y + 0.5) * ts;
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      ctx.font = '900 16px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y);
      ctx.restore();
    }

    // 6. HUD Thanh Trạng Thái & Nút Điều Khiển
    this.renderHUD(ctx);

    // 7. Modal Chọn Màn Chơi (Nếu mở)
    if (this.showLevelSelect) {
      this.renderLevelSelectModal(ctx);
    }
  }

  renderFloorTile(ctx, x, y, ts) {
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.floor || '#1e293b';
    ctx.fillRect(x, y, ts, ts);

    // Viền nhẹ
    ctx.strokeStyle = SOKOBAN_CONFIG.colors?.floorGrid || 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, ts, ts);
  }

  renderIceTile(ctx, x, y, ts) {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, y, ts, ts);

    // Lớp băng phản quang
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);

    // Vệt sáng chéo trên bề mặt băng
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + ts - 4, y + ts - 4);
    ctx.stroke();

    ctx.strokeStyle = SOKOBAN_CONFIG.colors?.iceBorder || '#7dd3fc';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, ts, ts);
  }

  renderWallTile(ctx, x, y, ts) {
    // Đổ bóng chân tường
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.wallShadow || 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x, y + ts - 4, ts, 6);

    // Thân tường kim loại xám
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.wallFront || '#334155';
    ctx.fillRect(x, y + 6, ts, ts - 6);

    // Mặt trên nổi khối sáng hơn
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.wallTop || '#475569';
    ctx.fillRect(x, y, ts, 6);

    // Đường viền góc vát
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, ts, ts);
  }

  renderTargetSocket(ctx, x, y, ts) {
    const cx = x + ts / 2;
    const cy = y + ts / 2;
    const pulse = Math.sin(this.animTimer * 5) * 1.5;

    // Vành phát quang nhấp nháy
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.targetRing || 'rgba(34, 197, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, 11 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Lõi cắm vi mạch
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.targetSocket || '#22c55e';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Chữ thập định vị
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();
  }

  renderBox(ctx, x, y, ts, isOnTarget) {
    const pad = 4;
    const size = ts - pad * 2;

    ctx.save();
    // Đổ bóng hộp
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + pad + 2, y + pad + 3, size, size);

    // Thân khối hộp
    const fillColor = isOnTarget
      ? (SOKOBAN_CONFIG.colors?.boxTarget || '#16a34a')
      : (SOKOBAN_CONFIG.colors?.boxNormal || '#f59e0b');
    const borderColor = isOnTarget
      ? (SOKOBAN_CONFIG.colors?.boxBorderTarget || '#4ade80')
      : (SOKOBAN_CONFIG.colors?.boxBorderNormal || '#fbbf24');

    ctx.fillStyle = fillColor;
    if (isOnTarget) {
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.roundRect(x + pad, y + pad, size, size, 4);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lõi năng lượng ở giữa hộp
    const cx = x + ts / 2;
    const cy = y + ts / 2;

    ctx.fillStyle = isOnTarget ? '#bbf7d0' : '#fef08a';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Nẹp góc kim loại bảo vệ
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + pad + 3, y + pad + 3, size - 6, size - 6);

    ctx.restore();
  }

  renderChibiPlayer(ctx, x, y, ts) {
    const cx = x + ts / 2;
    const cy = y + ts / 2;
    const isPushing = this.pushTimer > 0;
    const fdx = this.facingDir.dx;
    const fdy = this.facingDir.dy;

    ctx.save();

    // Đổ bóng dưới chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 12, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Thân áo Hoodie FPT Cam
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.playerHoodie || '#f97316';
    ctx.beginPath();
    ctx.roundRect(cx - 8, cy - 2, 16, 12, 3);
    ctx.fill();

    // Quần công nhân xám đen
    ctx.fillStyle = SOKOBAN_CONFIG.colors?.playerPants || '#1e293b';
    ctx.fillRect(cx - 6, cy + 8, 4, 6);
    ctx.fillRect(cx + 2, cy + 8, 4, 6);

    // 2. Hai cánh tay (Vươn dài khi đẩy hộp)
    ctx.fillStyle = '#f97316';
    if (isPushing) {
      // Tư thế vươn hai tay về hướng đẩy
      const armReach = 7;
      ctx.fillRect(cx - 7 + fdx * armReach, cy + fdy * armReach, 4, 4);
      ctx.fillRect(cx + 3 + fdx * armReach, cy + fdy * armReach, 4, 4);
    } else {
      ctx.fillRect(cx - 9, cy, 3, 7);
      ctx.fillRect(cx + 6, cy, 3, 7);
    }

    // 3. Đầu Chibi & Nón bảo hộ FPT
    ctx.fillStyle = '#ffedd5'; // Mặt da sáng
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // Nón lưỡi trai cam FPT
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 8.5, Math.PI, Math.PI * 2);
    ctx.fill();
    // Vành nón chìa theo hướng nhìn
    ctx.fillRect(cx - 8 + fdx * 3, cy - 8 + fdy * 2, 16, 2.5);

    // Mắt Chibi nhìn theo hướng
    ctx.fillStyle = '#0f172a';
    const eyeOffsetX = fdx * 2.2;
    const eyeOffsetY = fdy * 1.5;
    ctx.beginPath();
    ctx.arc(cx - 3 + eyeOffsetX, cy - 6 + eyeOffsetY, 1.2, 0, Math.PI * 2);
    ctx.arc(cx + 3 + eyeOffsetX, cy - 6 + eyeOffsetY, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderHUD(ctx) {
    const w = this.canvas.width;

    ctx.save();
    // Thông tin Màn chơi
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 15px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.levelData.name} (${this.currentLevelIndex + 1}/15)`, 18, 26);

    ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Số Bước: ${this.moves} · Chuẩn Par: ${this.levelData.parMoves}`, 18, 44);

    // Nút [Hoàn Tác (U)]
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(420, 12, 85, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isTouch ? 'Hoàn Tác' : 'Hoàn Tác (U)', 462, 29);

    // Nút [Chơi Lại (R)]
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(512, 12, 72, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(this.isTouch ? 'Chơi Lại' : 'Chơi Lại (R)', 548, 29);

    // Nút [Màn (L)]
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(590, 12, 38, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.stroke();
    ctx.fillStyle = '#a855f7';
    ctx.fillText(this.isTouch ? 'Màn' : 'Màn (L)', 609, 29);

    // Cảnh báo Deadlock góc chết
    if (this.deadlockedBoxes.length > 0 && !this.won) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ef4444';
      ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
      ctx.fillText(this.isTouch ? 'CẢNH BÁO: Có hộp bị kẹt góc chết! Bấm nút Hoàn Tác' : 'CẢNH BÁO: Có hộp bị kẹt góc chết! Bấm Hoàn Tác (U)', 18, 62);
    }

    // Gợi ý điều khiển phía dưới
    ctx.textAlign = 'center';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    if (this.won) {
      ctx.fillStyle = '#4ade80';
      ctx.fillText(this.isTouch ? 'CHIẾN THẮNG! Chạm để sang Màn Tiếp Theo' : 'CHIẾN THẮNG! Bấm Phím Cách (Space) hoặc Click để sang Màn Tiếp Theo', w / 2, this.canvas.height - 12);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.fillText(this.isTouch ? 'Chạm để di chuyển • nút trên màn hình để hoàn tác' : 'Dùng WASD / Mũi Tên: Di chuyển · U: Hoàn tác · R: Chơi lại · L: Chọn màn', w / 2, this.canvas.height - 12);
    }

    ctx.restore();
  }

  renderLevelSelectModal(ctx) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const modalW = 440;
    const modalH = 260;
    const mx = (w - modalW) / 2;
    const my = (h - modalH) / 2;

    ctx.save();
    // Backdrop mờ
    ctx.fillStyle = 'rgba(11, 17, 32, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // Khung modal
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(mx, my, modalW, modalH, 8);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tiêu đề modal
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 16px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CHỌN MÀN CHƠI SOKOBAN (15 MÀN)', mx + 24, my + 32);

    // Nút đóng [X]
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 16px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('✕', mx + modalW - 20, my + 32);

    // Bảng 15 nút chọn màn
    const startGridX = mx + 25;
    const startGridY = my + 55;
    const btnW = 68;
    const btnH = 50;
    const gapX = 12;
    const gapY = 12;

    for (let i = 0; i < SOKOBAN_LEVELS.length; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const bx = startGridX + col * (btnW + gapX);
      const by = startGridY + row * (btnH + gapY);
      const isCur = i === this.currentLevelIndex;

      ctx.fillStyle = isCur ? '#0284c7' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bx, by, btnW, btnH, 5);
      ctx.fill();

      ctx.strokeStyle = isCur ? '#38bdf8' : '#334155';
      ctx.lineWidth = isCur ? 2 : 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = isCur ? '#ffffff' : '#f1f5f9';
      ctx.font = '800 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Màn ${i + 1}`, bx + btnW / 2, by + 22);

      ctx.fillStyle = isCur ? '#bae6fd' : '#94a3b8';
      ctx.font = '600 10px "Be Vietnam Pro", sans-serif';
      ctx.fillText(`Par: ${SOKOBAN_LEVELS[i].parMoves}`, bx + btnW / 2, by + 38);
    }

    ctx.restore();
  }
}
