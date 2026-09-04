import { audioManager } from '../../utils/AudioManager.js';

export class RetroArcade {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.currentGame = 'snake'; // 'snake', 'sokoban', 'goldminer'
    this.isRunning = false;
    this.animationId = null;

    // Common input state
    this.keys = {};

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.lastTime = 0;

    // Game specific states
    this.initSnake();
    this.initSokoban();
    this.initGoldMiner();
  }

  setGame(gameId) {
    this.currentGame = gameId;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.activationGraceUntil = Date.now() + 250;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousedown', this.handleClick);
    this.canvas.addEventListener('touchstart', this.handleClick);

    // reset current game
    if (this.currentGame === 'snake') this.resetSnake();
    else if (this.currentGame === 'sokoban') this.resetSokoban();
    else if (this.currentGame === 'goldminer') this.resetGoldMiner();

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousedown', this.handleClick);
    this.canvas.removeEventListener('touchstart', this.handleClick);
  }

  handleKeyDown(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    this.keys[e.key] = true;
    
    // Prevent default scrolling for game keys
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ', 'Space', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyE', 'Enter'].includes(e.code) || ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      e.preventDefault();
    }

    const key = (e.key || '').toLowerCase();
    const code = e.code || '';

    if (this.currentGame === 'snake') {
      if ((key === 'w' || code === 'ArrowUp' || key === 'arrowup' || code === 'KeyW') && this.snake.dy === 0) { this.snake.dx = 0; this.snake.dy = -1; }
      else if ((key === 's' || code === 'ArrowDown' || key === 'arrowdown' || code === 'KeyS') && this.snake.dy === 0) { this.snake.dx = 0; this.snake.dy = 1; }
      else if ((key === 'a' || code === 'ArrowLeft' || key === 'arrowleft' || code === 'KeyA') && this.snake.dx === 0) { this.snake.dx = -1; this.snake.dy = 0; }
      else if ((key === 'd' || code === 'ArrowRight' || key === 'arrowright' || code === 'KeyD') && this.snake.dx === 0) { this.snake.dx = 1; this.snake.dy = 0; }
      else if ((code === 'Space' || code === 'KeyE' || key === 'e' || key === 'enter' || code === 'Enter') && this.snake.gameOver) { this.resetSnake(); }
    } else if (this.currentGame === 'sokoban') {
      if (key === 'w' || code === 'ArrowUp' || key === 'arrowup' || code === 'KeyW') this.moveSokoban(0, -1);
      else if (key === 's' || code === 'ArrowDown' || key === 'arrowdown' || code === 'KeyS') this.moveSokoban(0, 1);
      else if (key === 'a' || code === 'ArrowLeft' || key === 'arrowleft' || code === 'KeyA') this.moveSokoban(-1, 0);
      else if (key === 'd' || code === 'ArrowRight' || key === 'arrowright' || code === 'KeyD') this.moveSokoban(1, 0);
      else if (key === 'u' || code === 'KeyU') this.undoSokoban();
      else if ((code === 'KeyR' || key === 'r') || ((code === 'Space' || code === 'KeyE' || key === 'e' || key === 'enter' || code === 'Enter') && this.sokoban.won)) { this.resetSokoban(); }
    } else if (this.currentGame === 'goldminer') {
      if (code === 'Space' || key === ' ' || code === 'Enter' || key === 'enter' || code === 'KeyE' || key === 'e' || code === 'ArrowDown' || key === 'arrowdown' || code === 'KeyS' || key === 's') {
        this.shootMiner();
      }
    }
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;
  }

  handleClick(e) {
    if (!this.isRunning || Date.now() < this.activationGraceUntil) return;
    if (this.currentGame === 'goldminer') {
      this.shootMiner();
    } else if (this.currentGame === 'snake' && this.snake.gameOver) {
      this.resetSnake();
    } else if (this.currentGame === 'sokoban' && this.sokoban.won) {
      this.resetSokoban();
    }
  }

  loop(timestamp) {
    if (!this.isRunning) return;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentGame === 'snake') {
      this.updateSnake(dt);
      this.drawSnake();
    } else if (this.currentGame === 'sokoban') {
      this.drawSokoban();
    } else if (this.currentGame === 'goldminer') {
      this.updateGoldMiner(dt);
      this.drawGoldMiner();
    }

    this.animationId = requestAnimationFrame((ts) => this.loop(ts));
  }

  // ============================================
  // SNAKE GAME
  // ============================================
  initSnake() {
    this.snake = { grid: 20, count: 0, speed: 6 };
  }

  resetSnake() {
    this.snake.x = 160;
    this.snake.y = 160;
    this.snake.cells = [];
    this.snake.maxCells = 4;
    this.snake.dx = 1;
    this.snake.dy = 0;
    this.snake.score = 0;
    this.snake.highScore = parseInt(localStorage.getItem('dever_snake_high') || '0', 10);
    this.snake.food = this.getRandomApple();
    this.snake.gameOver = false;
  }

  getRandomApple() {
    return {
      x: Math.floor(Math.random() * (this.width / this.snake.grid)) * this.snake.grid,
      y: Math.floor(Math.random() * (this.height / this.snake.grid)) * this.snake.grid
    };
  }

  updateSnake(dt) {
    if (this.snake.gameOver) return;

    if (++this.snake.count < this.snake.speed) return;
    this.snake.count = 0;

    this.snake.x += this.snake.dx * this.snake.grid;
    this.snake.y += this.snake.dy * this.snake.grid;

    // wrap around
    if (this.snake.x < 0) this.snake.x = this.width - this.snake.grid;
    else if (this.snake.x >= this.width) this.snake.x = 0;

    if (this.snake.y < 0) this.snake.y = this.height - this.snake.grid;
    else if (this.snake.y >= this.height) this.snake.y = 0;

    this.snake.cells.unshift({x: this.snake.x, y: this.snake.y});
    if (this.snake.cells.length > this.snake.maxCells) {
      this.snake.cells.pop();
    }

    // food collision
    if (this.snake.x === this.snake.food.x && this.snake.y === this.snake.food.y) {
      this.snake.maxCells++;
      this.snake.score += 10;
      if (this.snake.score > this.snake.highScore) {
        this.snake.highScore = this.snake.score;
        localStorage.setItem('dever_snake_high', this.snake.highScore);
      }
      this.snake.food = this.getRandomApple();
      audioManager.playClick();
    }

    // body collision
    for (let i = 1; i < this.snake.cells.length; i++) {
      if (this.snake.x === this.snake.cells[i].x && this.snake.y === this.snake.cells[i].y) {
        this.snake.gameOver = true;
      }
    }
  }

  drawSnake() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (this.snake.gameOver) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = '30px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("GAME OVER", this.width/2, this.height/2);
      this.ctx.font = '15px "Press Start 2P", monospace';
      this.ctx.fillText("Click to Restart", this.width/2, this.height/2 + 30);
      
      if (this.keys[' ']) {
        this.resetSnake();
      }
      return;
    }

    // Draw food
    this.ctx.fillStyle = '#f26f21';
    this.ctx.fillRect(this.snake.food.x, this.snake.food.y, this.snake.grid-1, this.snake.grid-1);

    // Draw snake
    this.ctx.fillStyle = '#10b981';
    this.snake.cells.forEach((cell, index) => {
      this.ctx.fillRect(cell.x, cell.y, this.snake.grid-1, this.snake.grid-1);
    });

    // Score
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px "Outfit", sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.snake.score}  High: ${this.snake.highScore}`, 10, 25);
  }

  // ============================================
  // SOKOBAN GAME
  // ============================================
  initSokoban() {
    // 0: floor, 1: wall, 2: target, 3: box, 4: box on target, 5: player, 6: player on target
    this.sokobanLevels = [
      [
        [1,1,1,1,1,1],
        [1,0,0,0,1,1],
        [1,0,3,2,0,1],
        [1,5,0,0,0,1],
        [1,1,1,1,1,1]
      ]
    ];
    this.sokoban = { level: 0, map: [], player: {x:0, y:0}, moves: 0, history: [] };
  }

  resetSokoban() {
    this.loadSokobanLevel(this.sokoban.level);
  }

  loadSokobanLevel(idx) {
    if (idx >= this.sokobanLevels.length) idx = 0;
    this.sokoban.level = idx;
    this.sokoban.map = JSON.parse(JSON.stringify(this.sokobanLevels[idx]));
    this.sokoban.moves = 0;
    this.sokoban.history = [];
    
    for(let y=0; y<this.sokoban.map.length; y++) {
      for(let x=0; x<this.sokoban.map[y].length; x++) {
        if(this.sokoban.map[y][x] === 5 || this.sokoban.map[y][x] === 6) {
          this.sokoban.player = {x,y};
        }
      }
    }
  }

  moveSokoban(dx, dy) {
    let {x, y} = this.sokoban.player;
    let nx = x + dx;
    let ny = y + dy;
    let map = this.sokoban.map;
    
    if(map[ny][nx] === 1) return; // wall
    
    let isBox = map[ny][nx] === 3 || map[ny][nx] === 4;
    if (isBox) {
      let nnx = nx + dx;
      let nny = ny + dy;
      if (map[nny][nnx] === 1 || map[nny][nnx] === 3 || map[nny][nnx] === 4) return;
      
      // save history
      this.sokoban.history.push(JSON.parse(JSON.stringify(map)));
      
      // move box
      map[ny][nx] -= 3;
      map[nny][nnx] += 3;
    } else {
      this.sokoban.history.push(JSON.parse(JSON.stringify(map)));
    }
    
    // move player
    map[y][x] -= 5;
    map[ny][nx] += 5;
    this.sokoban.player = {x: nx, y: ny};
    this.sokoban.moves++;
    audioManager.playClick();
  }

  undoSokoban() {
    if(this.sokoban.history.length === 0) return;
    this.sokoban.map = this.sokoban.history.pop();
    for(let y=0; y<this.sokoban.map.length; y++) {
      for(let x=0; x<this.sokoban.map[y].length; x++) {
        if(this.sokoban.map[y][x] === 5 || this.sokoban.map[y][x] === 6) {
          this.sokoban.player = {x,y};
        }
      }
    }
    this.sokoban.moves--;
  }

  drawSokoban() {
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    let tileSize = 40;
    let offsetX = (this.width - this.sokoban.map[0].length * tileSize) / 2;
    let offsetY = (this.height - this.sokoban.map.length * tileSize) / 2;
    
    let targets = 0;
    let filled = 0;

    for(let y=0; y<this.sokoban.map.length; y++) {
      for(let x=0; x<this.sokoban.map[y].length; x++) {
        let val = this.sokoban.map[y][x];
        let px = offsetX + x * tileSize;
        let py = offsetY + y * tileSize;
        
        if (val === 2 || val === 4 || val === 6) targets++;
        if (val === 4) filled++;

        // draw floor
        this.ctx.fillStyle = '#334155';
        this.ctx.fillRect(px, py, tileSize, tileSize);
        
        if (val === 1) { // wall
          this.ctx.fillStyle = '#475569';
          this.ctx.fillRect(px, py, tileSize, tileSize);
        }
        if (val === 2 || val === 4 || val === 6) { // target
          this.ctx.fillStyle = '#f26f21';
          this.ctx.beginPath();
          this.ctx.arc(px + tileSize/2, py + tileSize/2, 5, 0, Math.PI*2);
          this.ctx.fill();
        }
        if (val === 3 || val === 4) { // box
          this.ctx.fillStyle = val === 4 ? '#10b981' : '#fbbf24';
          this.ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
        }
        if (val === 5 || val === 6) { // player
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.beginPath();
          this.ctx.arc(px + tileSize/2, py + tileSize/2, 12, 0, Math.PI*2);
          this.ctx.fill();
        }
      }
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px "Outfit", sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Moves: ${this.sokoban.moves} | Undo (U)`, 10, 25);

    if (targets > 0 && targets === filled) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0,0,this.width, this.height);
      this.ctx.fillStyle = '#10b981';
      this.ctx.font = '30px "Outfit", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("YOU WIN!", this.width/2, this.height/2);
    }
  }

  // ============================================
  // GOLD MINER GAME
  // ============================================
  initGoldMiner() {
    this.miner = { hook: {}, items: [] };
  }

  resetGoldMiner() {
    this.miner.hook = {
      x: this.width/2, y: 50,
      angle: -Math.PI/2 + 0.1,
      dir: 1,
      length: 20,
      state: 'swing', // swing, shoot, pull
      speed: 0.03,
      grabbed: null
    };
    this.miner.score = 0;
    this.miner.timeLeft = 60;
    this.miner.items = [];
    for(let i=0; i<8; i++) {
      this.miner.items.push({
        x: Math.random() * (this.width - 60) + 30,
        y: Math.random() * (this.height - 150) + 120,
        r: Math.random() > 0.5 ? 20 : 10,
        val: Math.random() > 0.5 ? 50 : 200,
        color: Math.random() > 0.5 ? '#fbbf24' : '#a3e635'
      });
    }
  }

  shootMiner() {
    if (this.miner.hook.state === 'swing') {
      this.miner.hook.state = 'shoot';
      audioManager.playClick();
    }
  }

  updateGoldMiner(dt) {
    let hook = this.miner.hook;
    
    if (hook.state === 'swing') {
      hook.angle += hook.speed * hook.dir;
      if (hook.angle > -0.2 || hook.angle < -Math.PI + 0.2) {
        hook.dir *= -1;
      }
    } else if (hook.state === 'shoot') {
      hook.length += 5;
      let hx = hook.x + Math.cos(hook.angle) * hook.length;
      let hy = hook.y - Math.sin(hook.angle) * hook.length;
      
      if (hx < 0 || hx > this.width || hy > this.height) {
        hook.state = 'pull';
      }
      
      for(let i=0; i<this.miner.items.length; i++) {
        let it = this.miner.items[i];
        let d = Math.hypot(hx - it.x, hy - it.y);
        if (d < it.r) {
          hook.grabbed = it;
          this.miner.items.splice(i, 1);
          hook.state = 'pull';
          break;
        }
      }
    } else if (hook.state === 'pull') {
      let pullSpeed = hook.grabbed ? (hook.grabbed.r > 15 ? 1 : 3) : 5;
      hook.length -= pullSpeed;
      if (hook.length <= 20) {
        if (hook.grabbed) {
          this.miner.score += hook.grabbed.val;
          hook.grabbed = null;
        }
        hook.length = 20;
        hook.state = 'swing';
      }
    }
  }

  drawGoldMiner() {
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(0, 0, this.width, 50);

    let hook = this.miner.hook;
    let hx = hook.x + Math.cos(hook.angle) * hook.length;
    let hy = hook.y - Math.sin(hook.angle) * hook.length;

    // line
    this.ctx.beginPath();
    this.ctx.moveTo(hook.x, hook.y);
    this.ctx.lineTo(hx, hy);
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // hook head
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.arc(hx, hy, 5, 0, Math.PI*2);
    this.ctx.fill();

    if (hook.grabbed) {
      this.ctx.fillStyle = hook.grabbed.color;
      this.ctx.beginPath();
      this.ctx.arc(hx, hy, hook.grabbed.r, 0, Math.PI*2);
      this.ctx.fill();
    }

    // items
    this.miner.items.forEach(it => {
      this.ctx.fillStyle = it.color;
      this.ctx.beginPath();
      this.ctx.arc(it.x, it.y, it.r, 0, Math.PI*2);
      this.ctx.fill();
    });

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px "Outfit", sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.miner.score}`, 10, 25);
  }
}
