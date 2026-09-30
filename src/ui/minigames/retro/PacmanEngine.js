/**
 * DEVER TOWN - CYBER PAC-MAN / PAC-BUGGY 3.0 (RETRO ARCADE)
 * Trò chơi Mê Cung Cổ Điển phong cách Cyberpunk CLB FU-DEVER:
 * 1. Chú bọ Pac-Buggy di chuyển mượt mà, hỗ trợ Pre-turn Buffer tại các ngã rẽ.
 * 2. 4 Cyber Virus Ma Máy mang 4 thuật toán AI truy đuổi chuẩn mực:
 *    - Blinky (Virus Đỏ): Đuổi trực diện vị trí Pac-Man.
 *    - Pinky (Virus Hồng): Đón đầu 4 ô trước mặt Pac-Man.
 *    - Inky (Virus Xanh Cyan): Phối hợp gọng kìm dựa trên vector Blinky.
 *    - Clyde (Virus Vàng Cam): Đuổi khi ở xa, tự động tản về góc khi cách < 8 ô.
 * 3. Chế độ Overdrive (Frightened Mode) khi ăn Super D-Coin:
 *    - Ma chuyển sang trạng thái sợ hãi, giảm tốc độ.
 *    - Săn ma nhận chuỗi điểm thưởng combo: 200 -> 400 -> 800 -> 1600đ.
 *    - Mắt ma (Eaten) tốc độ cao quay về nhà ma hồi sinh.
 * 4. Vật phẩm Quả Thưởng (Tech Fruit) xuất hiện giữa màn chơi.
 * 5. Tỷ lệ 16:9 (640x360), tường Neon dạ quang và âm thanh Arcade sống động.
 */

import { PACMAN_CONFIG } from '../../../config/minigamesConfig.js';
import { audioManager } from '../../../utils/AudioManager.js';

export class PacmanEngine {
  constructor(canvas, juiceFX, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.juiceFX = juiceFX;
    this.callbacks = callbacks;

    this.cfg = PACMAN_CONFIG;
    this.w = canvas.width;
    this.h = canvas.height;

    this.tileSize = this.cfg.grid.tileSize || 16;
    this.cols = this.cfg.grid.cols || 28;
    this.rows = this.cfg.grid.rows || 21;
    this.startX = this.cfg.grid.startX || 96;
    this.startY = this.cfg.grid.startY || 12;

    this.state = 'ready'; // 'ready', 'playing', 'pacman_dying', 'level_clear', 'game_over'
    const savedHigh = typeof localStorage !== 'undefined' ? localStorage.getItem('dever_pacman_high') : null;
    this.highScore = parseInt(savedHigh || '0', 10);
    this.score = 0;
    this.lives = this.cfg.lives || 3;
    this.level = 1;

    this.hitStop = 0;
    this.animTimer = 0;
    this.modeTimer = 0;
    this.globalMode = 'scatter'; // 'scatter' or 'chase'
    this.frightenedTimer = 0;
    this.ghostsEatenCombo = 0;

    // Fruit
    this.fruit = null;
    this.fruitTimer = 0;

    this.initMaze();
    this.initEntities();
  }

  initMaze() {
    this.maze = this.cfg.maze.map(row => [...row]);
    this.totalPellets = 0;
    this.pelletsRemaining = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.maze[r][c];
        if (val === 2 || val === 3) {
          this.totalPellets++;
          this.pelletsRemaining++;
        }
      }
    }
  }

  initEntities() {
    // Pac-Man khởi đầu tại ô (13.5, 16)
    this.pacman = {
      x: this.startX + 13.5 * this.tileSize,
      y: this.startY + 16.5 * this.tileSize,
      dirX: 0,
      dirY: 0,
      nextDirX: 0,
      nextDirY: 0,
      speed: this.cfg.speeds.pacman || 128,
      mouthAngle: 0.25,
      mouthOpening: true,
      angle: 0,
      dyingTimer: 0
    };

    // 4 Con Ma
    this.ghosts = [
      this.createGhost('blinky', 13.5, 7.5, 0, -1, 0),    // Blinky ở ngay ngoài cửa
      this.createGhost('pinky',  13.5, 10.0, 0, -1, 1.8), // Pinky ra sau 1.8s
      this.createGhost('inky',   11.5, 10.0, 0, -1, 4.0), // Inky ra sau 4.0s
      this.createGhost('clyde',  15.5, 10.0, 0, -1, 6.5)  // Clyde ra sau 6.5s
    ];

    this.globalMode = 'scatter';
    this.modeTimer = this.cfg.timings.scatterDurationSec || 7.0;
  }

  createGhost(id, tileX, tileY, dirX, dirY, releaseDelay) {
    const info = this.cfg.ghosts[id];
    return {
      id,
      name: info.name,
      color: info.color,
      glow: info.glow,
      scatterTile: { ...info.scatterTile },
      x: this.startX + tileX * this.tileSize,
      y: this.startY + tileY * this.tileSize,
      dirX,
      dirY,
      state: 'scatter', // 'scatter', 'chase', 'frightened', 'eaten'
      inHouse: releaseDelay > 0,
      releaseTimer: releaseDelay,
      homeX: this.startX + tileX * this.tileSize,
      homeY: this.startY + tileY * this.tileSize,
      animFrame: 0
    };
  }

  resetRound() {
    this.pacman.x = this.startX + 13.5 * this.tileSize;
    this.pacman.y = this.startY + 16.5 * this.tileSize;
    this.pacman.dirX = 0;
    this.pacman.dirY = 0;
    this.pacman.nextDirX = 0;
    this.pacman.nextDirY = 0;
    this.pacman.angle = 0;
    this.pacman.dyingTimer = 0;

    this.ghosts = [
      this.createGhost('blinky', 13.5, 7.5, 0, -1, 0),
      this.createGhost('pinky',  13.5, 10.0, 0, -1, 1.8),
      this.createGhost('inky',   11.5, 10.0, 0, -1, 4.0),
      this.createGhost('clyde',  15.5, 10.0, 0, -1, 6.5)
    ];

    this.globalMode = 'scatter';
    this.modeTimer = this.cfg.timings.scatterDurationSec || 7.0;
    this.frightenedTimer = 0;
    this.ghostsEatenCombo = 0;
  }

  reset() {
    this.score = 0;
    this.lives = this.cfg.lives || 3;
    this.level = 1;
    this.state = 'ready';
    this.fruit = null;
    this.fruitTimer = 0;
    this.initMaze();
    this.initEntities();
    this.callbacks.onScoreUpdate?.(0);
  }

  setDirection(dx, dy) {
    if (this.state === 'ready') {
      this.state = 'playing';
    }
    if (this.state !== 'playing') return;

    this.pacman.nextDirX = dx;
    this.pacman.nextDirY = dy;

    // Đảo hướng 180 độ ngay lập tức
    if (this.pacman.dirX + dx === 0 && this.pacman.dirY + dy === 0) {
      this.pacman.dirX = dx;
      this.pacman.dirY = dy;
      this.updatePacmanAngle();
    }
  }

  onActionTrigger() {
    if (this.state === 'ready' || this.state === 'game_over' || this.state === 'level_clear') {
      if (this.state === 'game_over' || this.state === 'level_clear') {
        this.reset();
      }
      this.state = 'playing';
    }
  }

  handleKeyDown(e) {
    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (code === 'KeyW' || code === 'ArrowUp' || key === 'w') this.setDirection(0, -1);
    else if (code === 'KeyS' || code === 'ArrowDown' || key === 's') this.setDirection(0, 1);
    else if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a') this.setDirection(-1, 0);
    else if (code === 'KeyD' || code === 'ArrowRight' || key === 'd') this.setDirection(1, 0);
    else if (code === 'KeyR' || key === 'r') this.reset();
    else if (code === 'Space' || code === 'KeyE' || key === 'enter' || code === 'Enter') {
      this.onActionTrigger();
    }
  }

  handlePointerClick(x, y) {
    if (this.state === 'ready' || this.state === 'game_over' || this.state === 'level_clear') {
      this.onActionTrigger();
      return;
    }

    const pac = this.pacman;
    const dx = x - pac.x;
    const dy = y - pac.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setDirection(dx > 0 ? 1 : -1, 0);
    } else {
      this.setDirection(0, dy > 0 ? 1 : -1);
    }
  }

  update(dt) {
    this.animTimer += dt;

    if (this.hitStop > 0) {
      this.hitStop -= dt;
      if (this.hitStop > 0) return;
    }

    if (this.state === 'ready' || this.state === 'game_over' || this.state === 'level_clear') {
      return;
    }

    if (this.state === 'pacman_dying') {
      this.pacman.dyingTimer += dt;
      if (this.pacman.dyingTimer >= 1.2) {
        if (this.lives > 0) {
          this.resetRound();
          this.state = 'playing';
        } else {
          this.state = 'game_over';
        }
      }
      return;
    }

    // 1. Cập nhật chu kỳ Scatter / Chase hoặc Frightened
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= dt;
      if (this.frightenedTimer <= 0) {
        this.frightenedTimer = 0;
        this.ghostsEatenCombo = 0;
        // Đưa các ma chưa bị ăn trở lại trạng thái toàn cục
        for (const g of this.ghosts) {
          if (g.state === 'frightened') {
            g.state = this.globalMode;
          }
        }
      }
    } else {
      this.modeTimer -= dt;
      if (this.modeTimer <= 0) {
        if (this.globalMode === 'scatter') {
          this.globalMode = 'chase';
          this.modeTimer = this.cfg.timings.chaseDurationSec || 20.0;
        } else {
          this.globalMode = 'scatter';
          this.modeTimer = this.cfg.timings.scatterDurationSec || 7.0;
        }
        for (const g of this.ghosts) {
          if (g.state !== 'eaten') {
            g.state = this.globalMode;
            // Đảo hướng khi đổi mode
            g.dirX = -g.dirX;
            g.dirY = -g.dirY;
          }
        }
      }
    }

    // 2. Cập nhật Fruit xuất hiện
    if (this.fruit) {
      this.fruitTimer -= dt;
      if (this.fruitTimer <= 0) {
        this.fruit = null;
      }
    }

    // 3. Di chuyển Pac-Man
    this.updatePacman(dt);

    // 4. Di chuyển 4 Con Ma
    this.updateGhosts(dt);

    // 5. Kiểm tra va chạm giữa Pac-Man và Ma
    this.checkGhostCollisions();
  }

  updatePacman(dt) {
    const pac = this.pacman;
    const ts = this.tileSize;

    // Chomp animation
    if (pac.dirX !== 0 || pac.dirY !== 0) {
      const mouthSpeed = 14;
      if (pac.mouthOpening) {
        pac.mouthAngle += mouthSpeed * dt;
        if (pac.mouthAngle >= 0.28) pac.mouthOpening = false;
      } else {
        pac.mouthAngle -= mouthSpeed * dt;
        if (pac.mouthAngle <= 0.02) pac.mouthOpening = true;
      }
    }

    // Tọa độ ô lưới tương đối
    const gridRelX = pac.x - this.startX;
    const gridRelY = pac.y - this.startY;
    const curTileX = Math.floor(gridRelX / ts);
    const curTileY = Math.floor(gridRelY / ts);
    const centerTileX = (curTileX + 0.5) * ts;
    const centerTileY = (curTileY + 0.5) * ts;

    // Thử đổi sang hướng mới (Pre-turn cornering buffer)
    if (pac.nextDirX !== 0 || pac.nextDirY !== 0) {
      const nextTileX = curTileX + pac.nextDirX;
      const nextTileY = curTileY + pac.nextDirY;

      if (!this.isWall(nextTileX, nextTileY)) {
        // Kiểm tra xem đã gần tâm ô để bẻ lái chưa (khoảng cách <= 5px)
        const distToCenter = Math.hypot(gridRelX - centerTileX, gridRelY - centerTileY);
        if (distToCenter <= 5.5) {
          pac.x = this.startX + centerTileX;
          pac.y = this.startY + centerTileY;
          pac.dirX = pac.nextDirX;
          pac.dirY = pac.nextDirY;
          pac.nextDirX = 0;
          pac.nextDirY = 0;
          this.updatePacmanAngle();
        }
      }
    }

    // Di chuyển tiếp theo hướng hiện tại
    if (pac.dirX !== 0 || pac.dirY !== 0) {
      const moveDist = pac.speed * dt;
      const targetTileX = curTileX + pac.dirX;
      const targetTileY = curTileY + pac.dirY;

      // Nếu sắp đâm tường
      if (this.isWall(targetTileX, targetTileY)) {
        // Dừng lại ngay tâm ô
        if (pac.dirX > 0 && gridRelX + moveDist >= centerTileX) {
          pac.x = this.startX + centerTileX;
          pac.dirX = 0;
        } else if (pac.dirX < 0 && gridRelX - moveDist <= centerTileX) {
          pac.x = this.startX + centerTileX;
          pac.dirX = 0;
        } else if (pac.dirY > 0 && gridRelY + moveDist >= centerTileY) {
          pac.y = this.startY + centerTileY;
          pac.dirY = 0;
        } else if (pac.dirY < 0 && gridRelY - moveDist <= centerTileY) {
          pac.y = this.startY + centerTileY;
          pac.dirY = 0;
        } else {
          pac.x += pac.dirX * moveDist;
          pac.y += pac.dirY * moveDist;
        }
      } else {
        pac.x += pac.dirX * moveDist;
        pac.y += pac.dirY * moveDist;
      }

      // Warp Tunnel (Hàng 10, Cột 0 <-> Cột 27)
      const mazeWidth = this.cols * ts;
      if (pac.x < this.startX - ts / 2) {
        pac.x = this.startX + mazeWidth - ts / 2;
      } else if (pac.x > this.startX + mazeWidth - ts / 2) {
        pac.x = this.startX - ts / 2;
      }
    }

    // Kiểm tra ăn Pellet / Power Pellet
    const eatTileX = Math.floor((pac.x - this.startX) / ts);
    const eatTileY = Math.floor((pac.y - this.startY) / ts);

    if (eatTileX >= 0 && eatTileX < this.cols && eatTileY >= 0 && eatTileY < this.rows) {
      const tileVal = this.maze[eatTileY][eatTileX];
      if (tileVal === 2) {
        // Ăn hạt thường
        this.maze[eatTileY][eatTileX] = 0;
        this.score += this.cfg.scoring.pellet || 10;
        this.pelletsRemaining--;
        audioManager.playPickup();
        this.juiceFX.spawnSparkles(pac.x, pac.y, 2, '#fef08a');
        this.onPelletEaten();
      } else if (tileVal === 3) {
        // Ăn Super D-Coin (Power Pellet)
        this.maze[eatTileY][eatTileX] = 0;
        this.score += this.cfg.scoring.powerPellet || 50;
        this.pelletsRemaining--;
        this.frightenedTimer = this.cfg.timings.frightenedDurationSec || 7.5;
        this.ghostsEatenCombo = 0;

        for (const g of this.ghosts) {
          if (g.state !== 'eaten') {
            g.state = 'frightened';
            g.dirX = -g.dirX;
            g.dirY = -g.dirY;
          }
        }

        audioManager.playScorePopup();
        this.juiceFX.shake(4, 0.15);
        this.juiceFX.spawnSparkles(pac.x, pac.y, 14, '#f59e0b');
        this.juiceFX.spawnFloatingText('OVERDRIVE BUGGY!', pac.x, pac.y - 16, { color: '#f59e0b', size: 14 });
        this.onPelletEaten();
      }

      // Ăn Quả Thưởng (Tech Fruit)
      if (this.fruit && eatTileX === this.fruit.tileX && eatTileY === this.fruit.tileY) {
        const pts = this.cfg.scoring.fruit || 300;
        this.score += pts;
        this.fruit = null;
        audioManager.playPickup();
        this.juiceFX.spawnSparkles(pac.x, pac.y, 16, '#ec4899');
        this.juiceFX.spawnFloatingText(`+${pts} TECH CORE!`, pac.x, pac.y - 18, { color: '#ec4899', size: 16 });
      }
    }
  }

  onPelletEaten() {
    this.updateHighScore();
    this.callbacks.onScoreUpdate?.(this.score);

    // Xuất hiện Fruit tại các mốc 70 và 170 hạt đã ăn
    const eatenCount = this.totalPellets - this.pelletsRemaining;
    if (eatenCount === 70 || eatenCount === 170) {
      this.spawnFruit();
    }

    // Hoàn thành màn chơi (Ăn sạch toàn bộ mê cung)
    if (this.pelletsRemaining <= 0) {
      this.state = 'level_clear';
      audioManager.playVictory();
      this.juiceFX.shake(8, 0.3);
      this.juiceFX.spawnConfetti(this.w / 2, this.h / 2, 50);
      this.juiceFX.spawnFloatingText('BẢN ĐỒ HOÀN THÀNH!', this.w / 2, 120, { color: '#38bdf8', size: 22 });
      setTimeout(() => {
        this.level++;
        this.initMaze();
        this.resetRound();
        this.state = 'playing';
      }, 2200);
    }
  }

  spawnFruit() {
    this.fruit = {
      tileX: 13,
      tileY: 12,
      x: this.startX + 13.5 * this.tileSize,
      y: this.startY + 12.5 * this.tileSize,
      type: 'tech_core'
    };
    this.fruitTimer = this.cfg.timings.fruitDurationSec || 10.0;
  }

  updatePacmanAngle() {
    const pac = this.pacman;
    if (pac.dirX === 1) pac.angle = 0;
    else if (pac.dirX === -1) pac.angle = Math.PI;
    else if (pac.dirY === 1) pac.angle = Math.PI / 2;
    else if (pac.dirY === -1) pac.angle = -Math.PI / 2;
  }

  updateGhosts(dt) {
    const ts = this.tileSize;

    for (const g of this.ghosts) {
      // 1. Kiểm tra xuất xưởng (Ghost House release)
      if (g.inHouse) {
        g.releaseTimer -= dt;
        if (g.releaseTimer <= 0) {
          // Di chuyển lên cửa nhà ma (ô 13.5, 7.5)
          const doorX = this.startX + 13.5 * ts;
          const doorY = this.startY + 7.5 * ts;
          g.x += (doorX - g.x) * 4 * dt;
          g.y += (doorY - g.y) * 4 * dt;

          if (Math.hypot(g.x - doorX, g.y - doorY) < 3) {
            g.x = doorX;
            g.y = doorY;
            g.inHouse = false;
            g.dirX = -1;
            g.dirY = 0;
          }
        }
        continue;
      }

      // 2. Xác định tốc độ
      let speed = this.cfg.speeds.ghostNormal || 114;
      if (g.state === 'eaten') {
        speed = this.cfg.speeds.ghostEaten || 240;
      } else if (g.state === 'frightened') {
        speed = this.cfg.speeds.ghostFrightened || 68;
      }

      // 3. Tọa độ ô hiện tại
      const gridRelX = g.x - this.startX;
      const gridRelY = g.y - this.startY;
      const curTileX = Math.floor(gridRelX / ts);
      const curTileY = Math.floor(gridRelY / ts);
      const centerTileX = (curTileX + 0.5) * ts;
      const centerTileY = (curTileY + 0.5) * ts;

      // 4. Kiểm tra tới gần tâm ô để quyết định rẽ hướng
      const distToCenter = Math.hypot(gridRelX - centerTileX, gridRelY - centerTileY);
      if (distToCenter <= speed * dt * 0.95 || (g.dirX === 0 && g.dirY === 0)) {
        g.x = this.startX + centerTileX;
        g.y = this.startY + centerTileY;

        // Chọn hướng đi tiếp theo
        const nextDir = this.chooseGhostDirection(g, curTileX, curTileY);
        g.dirX = nextDir.x;
        g.dirY = nextDir.y;
      }

      // 5. Di chuyển ma
      g.x += g.dirX * speed * dt;
      g.y += g.dirY * speed * dt;

      // Warp tunnel cho ma
      const mazeWidth = this.cols * ts;
      if (g.x < this.startX - ts / 2) {
        g.x = this.startX + mazeWidth - ts / 2;
      } else if (g.x > this.startX + mazeWidth - ts / 2) {
        g.x = this.startX - ts / 2;
      }

      // Hồi sinh ma khi mắt ma về tới Ghost House
      if (g.state === 'eaten') {
        const houseX = this.startX + 13.5 * ts;
        const houseY = this.startY + 10.0 * ts;
        if (Math.hypot(g.x - houseX, g.y - houseY) < 14) {
          g.state = this.globalMode;
          g.inHouse = false;
          audioManager.playIceClink();
          this.juiceFX.spawnSparkles(g.x, g.y, 10, g.color);
        }
      }
    }
  }

  chooseGhostDirection(g, curTileX, curTileY) {
    // 4 hướng có thể rẽ
    const dirs = [
      { x: 0, y: -1 }, // Lên
      { x: -1, y: 0 }, // Trái
      { x: 0, y: 1 },  // Xuống
      { x: 1, y: 0 }   // Phải
    ];

    // Lọc các hướng hợp lệ (không đâm tường, không quay đầu 180 độ)
    const validDirs = dirs.filter(d => {
      // Không được quay ngược đầu 180 độ
      if (d.x + g.dirX === 0 && d.y + g.dirY === 0 && (g.dirX !== 0 || g.dirY !== 0)) {
        return false;
      }
      const nx = curTileX + d.x;
      const ny = curTileY + d.y;

      // Ma ở trạng thái eaten được phép đi qua cửa ghost house (tile 4)
      if (g.state === 'eaten' && this.isGhostDoor(nx, ny)) return true;

      return !this.isWall(nx, ny) && !this.isGhostDoor(nx, ny);
    });

    if (validDirs.length === 0) {
      return { x: -g.dirX, y: -g.dirY };
    }

    // Ma Frightened: Chọn ngẫu nhiên hướng hợp lệ
    if (g.state === 'frightened') {
      return validDirs[Math.floor(Math.random() * validDirs.length)];
    }

    // Tính tọa độ ô mục tiêu (Target Tile) theo thuật toán AI từng con ma
    const target = this.getGhostTargetTile(g);

    // Chọn hướng có khoảng cách Euclid tới mục tiêu nhỏ nhất
    let bestDir = validDirs[0];
    let bestDist = Infinity;

    for (const d of validDirs) {
      const nx = curTileX + d.x;
      const ny = curTileY + d.y;
      const dist = Math.hypot(nx - target.x, ny - target.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = d;
      }
    }

    return bestDir;
  }

  getGhostTargetTile(g) {
    const pac = this.pacman;
    const pacTileX = Math.floor((pac.x - this.startX) / this.tileSize);
    const pacTileY = Math.floor((pac.y - this.startY) / this.tileSize);

    // Khi ma đã bị ăn: mục tiêu là cửa Ghost House
    if (g.state === 'eaten') {
      return { x: 13.5, y: 10 };
    }

    // Chế độ Scatter: quay về góc nhà riêng
    if (g.state === 'scatter') {
      return g.scatterTile;
    }

    // Chế độ Chase: AI từng con
    switch (g.id) {
      case 'blinky':
        // Blinky (Đỏ): Đuổi trực diện Pac-Man
        return { x: pacTileX, y: pacTileY };

      case 'pinky':
        // Pinky (Hồng): Đón đầu 4 ô trước mặt Pac-Man
        return {
          x: pacTileX + pac.dirX * 4,
          y: pacTileY + pac.dirY * 4
        };

      case 'inky': {
        // Inky (Cyan): Gọng kìm phối hợp giữa Blinky và điểm trước mặt Pac-Man
        const blinky = this.ghosts.find(ghost => ghost.id === 'blinky');
        const bTileX = blinky ? Math.floor((blinky.x - this.startX) / this.tileSize) : 13;
        const bTileY = blinky ? Math.floor((blinky.y - this.startY) / this.tileSize) : 10;
        const pivotX = pacTileX + pac.dirX * 2;
        const pivotY = pacTileY + pac.dirY * 2;
        return {
          x: bTileX + (pivotX - bTileX) * 2,
          y: bTileY + (pivotY - bTileY) * 2
        };
      }

      case 'clyde': {
        // Clyde (Vàng): Đuổi khi ở xa, tản về góc khi cách < 8 ô
        const gTileX = Math.floor((g.x - this.startX) / this.tileSize);
        const gTileY = Math.floor((g.y - this.startY) / this.tileSize);
        const dist = Math.hypot(gTileX - pacTileX, gTileY - pacTileY);
        if (dist >= 8) {
          return { x: pacTileX, y: pacTileY };
        } else {
          return g.scatterTile;
        }
      }

      default:
        return { x: pacTileX, y: pacTileY };
    }
  }

  checkGhostCollisions() {
    const pac = this.pacman;
    const hitRadius = 11; // Bán kính nhận diện va chạm

    for (const g of this.ghosts) {
      const dist = Math.hypot(pac.x - g.x, pac.y - g.y);
      if (dist <= hitRadius) {
        if (g.state === 'frightened') {
          // Pac-Man ăn Ma!
          g.state = 'eaten';
          const ptsIndex = Math.min(3, this.ghostsEatenCombo);
          const pts = this.cfg.scoring.ghosts[ptsIndex] || 200;
          this.ghostsEatenCombo++;
          this.score += pts;
          this.updateHighScore();
          this.callbacks.onScoreUpdate?.(this.score);

          this.hitStop = 0.16; // Hit-stop hưng phấn
          audioManager.playComboChime(ptsIndex + 1);
          this.juiceFX.shake(5, 0.18);
          this.juiceFX.spawnSparkles(g.x, g.y, 20, '#38bdf8');
          this.juiceFX.spawnFloatingText(`+${pts}!`, g.x, g.y - 18, { color: '#38bdf8', size: 16 });
        } else if (g.state === 'chase' || g.state === 'scatter') {
          // Pac-Man bị ma bắt!
          this.triggerPacmanDeath();
          return;
        }
      }
    }
  }

  triggerPacmanDeath() {
    this.state = 'pacman_dying';
    this.pacman.dyingTimer = 0;
    this.lives--;

    audioManager.playExplosion();
    this.juiceFX.shake(9, 0.25);
    this.juiceFX.spawnConfetti(this.pacman.x, this.pacman.y, 35);
  }

  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dever_pacman_high', this.highScore.toString());
      }
    }
  }

  isWall(tileX, tileY) {
    if (tileX < 0 || tileX >= this.cols || tileY < 0 || tileY >= this.rows) return false;
    return this.maze[tileY][tileX] === 1;
  }

  isGhostDoor(tileX, tileY) {
    if (tileX < 0 || tileX >= this.cols || tileY < 0 || tileY >= this.rows) return false;
    return this.maze[tileY][tileX] === 4;
  }

  render() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;

    // 1. Nền Cyber Grid tối
    ctx.fillStyle = this.cfg.colors?.bg || '#05070e';
    ctx.fillRect(0, 0, w, h);

    // 2. Vẽ Mê Cung Neon
    this.renderMaze(ctx);

    // 3. Vẽ Quả Thưởng (Tech Fruit) nếu có
    if (this.fruit) {
      this.renderFruit(ctx);
    }

    // 4. Vẽ 4 Con Ma
    for (const g of this.ghosts) {
      this.renderGhost(ctx, g);
    }

    // 5. Vẽ Pac-Buggy
    this.renderPacman(ctx);

    // 6. Vẽ Giao diện HUD (Điểm, Mạng, Level)
    this.renderHUD(ctx);
  }

  renderMaze(ctx) {
    const ts = this.tileSize;
    const sx = this.startX;
    const sy = this.startY;

    ctx.save();

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.maze[r][c];
        const px = sx + c * ts;
        const py = sy + r * ts;

        if (val === 1) {
          // Tường Mê Cung Neon Cyber Cyan
          ctx.fillStyle = this.cfg.colors?.wallFill || '#0c1829';
          ctx.fillRect(px, py, ts, ts);

          ctx.strokeStyle = this.cfg.colors?.wallBorder || '#06b6d4';
          ctx.shadowColor = this.cfg.colors?.wallGlow || '#0891b2';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);
          ctx.shadowBlur = 0;
        } else if (val === 4) {
          // Cửa Ghost House (Hồng Neon)
          ctx.strokeStyle = this.cfg.colors?.door || '#f43f5e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px, py + ts / 2);
          ctx.lineTo(px + ts, py + ts / 2);
          ctx.stroke();
        } else if (val === 2) {
          // Hạt Năng Lượng (Pellet)
          ctx.fillStyle = this.cfg.colors?.pellet || '#fef08a';
          ctx.beginPath();
          ctx.arc(px + ts / 2, py + ts / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (val === 3) {
          // Super D-Coin (Power Pellet) lấp lánh
          const pulse = Math.sin(this.animTimer * 8) * 1.2;
          ctx.fillStyle = this.cfg.colors?.powerPellet || '#f59e0b';
          ctx.shadowColor = this.cfg.colors?.powerPelletGlow || '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px + ts / 2, py + ts / 2, 5.5 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px + ts / 2 - 1.5, py + ts / 2 - 1.5, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    ctx.restore();
  }

  renderFruit(ctx) {
    const f = this.fruit;
    ctx.save();
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.fillRect(f.x - 1.5, f.y - 8, 3, 3);
    ctx.restore();
  }

  renderPacman(ctx) {
    const pac = this.pacman;
    if (this.state === 'pacman_dying') {
      // Hoạt ảnh tiêu biến khi chết
      const ratio = Math.min(1.0, pac.dyingTimer / 1.0);
      const mouth = 0.28 + ratio * (Math.PI - 0.28);
      ctx.save();
      ctx.translate(pac.x, pac.y);
      ctx.rotate(pac.angle);
      ctx.fillStyle = this.cfg.colors?.pacman || '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, 7.5 * (1 - ratio * 0.8)), mouth, Math.PI * 2 - mouth);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(pac.x, pac.y);
    ctx.rotate(pac.angle);

    // Thân Pac-Buggy tròn vàng neon
    ctx.fillStyle = this.cfg.colors?.pacman || '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;

    const angle = pac.mouthAngle * Math.PI;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, angle, Math.PI * 2 - angle);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Mắt LED Cyber màu đen
    ctx.fillStyle = '#0f172a';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(1, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 2 Ăng-ten chú bọ Buggy
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -6);
    ctx.lineTo(-4, -10);
    ctx.moveTo(2, -6);
    ctx.lineTo(4, -10);
    ctx.stroke();

    ctx.restore();
  }

  renderGhost(ctx, g) {
    ctx.save();
    ctx.translate(g.x, g.y);

    if (g.state === 'eaten') {
      // Chỉ vẽ cặp mắt đang lao về nhà
      this.renderGhostEyes(ctx, g.dirX, g.dirY);
      ctx.restore();
      return;
    }

    // Xác định màu ma
    let bodyColor = g.color;
    let glowColor = g.glow;

    if (g.state === 'frightened') {
      // Nhấp nháy trắng/xanh trong 2s cuối
      if (this.frightenedTimer <= (this.cfg.timings.frightenedFlashSec || 2.2) && Math.floor(this.frightenedTimer * 6) % 2 === 0) {
        bodyColor = this.cfg.colors?.frightenedFlash || '#ffffff';
        glowColor = '#ffffff';
      } else {
        bodyColor = this.cfg.colors?.frightenedGhost || '#3b82f6';
        glowColor = '#60a5fa';
      }
    }

    ctx.fillStyle = bodyColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;

    // Vẽ đầu tròn vòm
    const r = 7;
    ctx.beginPath();
    ctx.arc(0, -2, r, Math.PI, 0, false);
    ctx.lineTo(r, 6);

    // Chân ma lượn sóng
    const wave = Math.sin(this.animTimer * 12) * 1.5;
    ctx.lineTo(r - 3.5, 4 + wave);
    ctx.lineTo(0, 6 - wave);
    ctx.lineTo(-r + 3.5, 4 + wave);
    ctx.lineTo(-r, 6);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Vẽ Mắt Ma
    if (g.state === 'frightened') {
      // Mắt ma sợ hãi (2 chấm trắng tròn)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -4, 2.5, 3);
      ctx.fillRect(1.5, -4, 2.5, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -2, 1.5, 1.5);
      ctx.fillRect(2.5, -2, 1.5, 1.5);
    } else {
      this.renderGhostEyes(ctx, g.dirX, g.dirY);
    }

    ctx.restore();
  }

  renderGhostEyes(ctx, dirX, dirY) {
    const eyeOffsetX = dirX * 1.8;
    const eyeOffsetY = dirY * 1.8;

    // Tròng trắng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-3.5 + eyeOffsetX * 0.5, -3, 2.8, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(3.5 + eyeOffsetX * 0.5, -3, 2.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Con ngươi xanh đen liếc theo hướng đi
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(-3.5 + eyeOffsetX, -3 + eyeOffsetY, 1.6, 0, Math.PI * 2);
    ctx.arc(3.5 + eyeOffsetX, -3 + eyeOffsetY, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  renderHUD(ctx) {
    ctx.save();
    ctx.fillStyle = this.cfg.colors?.hudText || '#f8fafc';
    ctx.font = '700 13px Outfit, sans-serif';

    // HUD Bên Trái
    ctx.textAlign = 'left';
    ctx.fillText('ĐIỂM SỐ', 12, 35);
    ctx.font = '900 18px Outfit, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(this.score.toString(), 12, 58);

    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KỶ LỤC', 12, 88);
    ctx.font = '900 14px Outfit, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText(this.highScore.toString(), 12, 106);

    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('MÀN CHƠI', 12, 136);
    ctx.font = '900 14px Outfit, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`CẤP ${this.level}`, 12, 154);

    // Mạng sống (3 Chú Bọ)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillText('MẠNG SỐNG', 12, 186);

    for (let i = 0; i < this.lives; i++) {
      ctx.save();
      ctx.translate(20 + i * 22, 206);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0.25 * Math.PI, 1.75 * Math.PI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // HUD Bên Phải
    const rightX = 556;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillText('TRẠNG THÁI', rightX, 35);

    let modeText = 'SCATTER';
    let modeColor = '#10b981';
    if (this.frightenedTimer > 0) {
      modeText = 'OVERDRIVE';
      modeColor = '#f59e0b';
    } else if (this.globalMode === 'chase') {
      modeText = 'CHASE';
      modeColor = '#ef4444';
    }

    ctx.font = '900 14px Outfit, sans-serif';
    ctx.fillStyle = modeColor;
    ctx.fillText(modeText, rightX, 55);

    // Còn lại bao nhiêu viên năng lượng
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillText('CÒN LẠI', rightX, 88);
    ctx.font = '900 14px Outfit, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${this.pelletsRemaining}/${this.totalPellets}`, rightX, 106);

    // Phím bấm gợi ý
    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px Outfit, sans-serif';
    ctx.fillText('W / A / S / D', rightX, 290);
    ctx.fillText('MŨI TÊN DI CHUYỂN', rightX, 306);
    ctx.fillText('R: CHƠI LẠI', rightX, 322);

    // Overlay Game Over hoặc Ready
    if (this.state === 'ready') {
      this.renderCenterBanner(ctx, 'CYBER PAC-MAN', 'Nhấn W/A/S/D hoặc Click để Bắt Đầu', '#38bdf8');
    } else if (this.state === 'game_over') {
      this.renderCenterBanner(ctx, 'GAME OVER', 'Nhấn Space hoặc Click để Thử Lại', '#ef4444');
    }

    ctx.restore();
  }

  renderCenterBanner(ctx, title, sub, color) {
    const cx = this.w / 2;
    const cy = this.h / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.roundRect(cx - 150, cy - 38, 300, 76, 10);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = '900 20px Outfit, sans-serif';
    ctx.fillText(title, cx, cy - 8);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 12px Outfit, sans-serif';
    ctx.fillText(sub, cx, cy + 18);

    ctx.restore();
  }
}
