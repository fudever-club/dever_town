/**
 * InteractiveModal.arcade — Retro arcade games (tab sync, badges).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { audioManager } from '../../utils/AudioManager.js';
import { RetroArcade } from '../minigames/RetroArcade.js';

InteractiveModal.prototype.setupArcadeGamesView = function(zoneData) {
  const pane = document.getElementById('pane-arcade-games');
  if (!pane) return;
  pane.classList.remove('hidden');

  const canvas = document.getElementById('retro-arcade-canvas');
  if (canvas && !this.retroArcade) {
    this.retroArcade = new RetroArcade(canvas, {
      onScoreUpdate: ({ game, score, high }) => {
        this.syncArcadeBadges(game, score, high);
      }
    });
  }

  const defaultGame = (zoneData && zoneData.defaultGame) || 'snake';
  if (this.retroArcade) {
    this.retroArcade.setGame(defaultGame);
    this.retroArcade.start();
  }

  const navTabs = document.getElementById('arcade-nav-tabs');
  if (navTabs) {
    navTabs.querySelectorAll('.arcade-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.game === defaultGame);
    });
    if (!navTabs.dataset.initialized) {
      navTabs.dataset.initialized = 'true';
      navTabs.querySelectorAll('.arcade-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          navTabs.querySelectorAll('.arcade-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const game = tab.dataset.game;
          if (this.retroArcade) {
            this.retroArcade.setGame(game);
          }
          this.syncArcadeTabUI(game);
          audioManager.playClick();
        });
      });
    }
  }

  // Touch controls for arcade games
  const btnUp = document.getElementById('arcade-btn-up');
  const btnDown = document.getElementById('arcade-btn-down');
  const btnLeft = document.getElementById('arcade-btn-left');
  const btnRight = document.getElementById('arcade-btn-right');
  const btnAction = document.getElementById('arcade-btn-action');
  const btnUndo = document.getElementById('arcade-btn-undo');

  if (btnUp && !btnUp.dataset.initialized) {
    btnUp.dataset.initialized = 'true';
    btnUp.addEventListener('click', () => this.retroArcade?.moveUp());
  }
  if (btnDown && !btnDown.dataset.initialized) {
    btnDown.dataset.initialized = 'true';
    btnDown.addEventListener('click', () => this.retroArcade?.moveDown());
  }
  if (btnLeft && !btnLeft.dataset.initialized) {
    btnLeft.dataset.initialized = 'true';
    btnLeft.addEventListener('click', () => this.retroArcade?.moveLeft());
  }
  if (btnRight && !btnRight.dataset.initialized) {
    btnRight.dataset.initialized = 'true';
    btnRight.addEventListener('click', () => this.retroArcade?.moveRight());
  }
  if (btnAction && !btnAction.dataset.initialized) {
    btnAction.dataset.initialized = 'true';
    btnAction.addEventListener('click', () => this.retroArcade?.triggerAction());
  }
  if (btnUndo && !btnUndo.dataset.initialized) {
    btnUndo.dataset.initialized = 'true';
    btnUndo.addEventListener('click', () => this.retroArcade?.undo());
  }

  this.syncArcadeTabUI(defaultGame);
}

InteractiveModal.prototype.syncArcadeTabUI = function(game) {
  const typeBadge = document.getElementById('arcade-type-badge');
  const descEl = document.getElementById('arcade-game-desc');
  const btnUndo = document.getElementById('arcade-btn-undo');

  if (game === 'snake') {
    if (typeBadge) typeBadge.textContent = 'CYBER SNAKE 60FPS';
    if (descEl) descEl.textContent = 'Dùng phím mũi tên hoặc W/A/S/D để điều khiển rắn ăn táo và né va chạm. Phím SPACE để bứt tốc.';
    if (btnUndo) btnUndo.classList.add('hidden');
  } else if (game === 'sokoban') {
    if (typeBadge) typeBadge.textContent = 'BUGGY SOKOBAN';
    if (descEl) descEl.textContent = 'Dùng W/A/S/D để đẩy các khối linh kiện vào vị trí mục tiêu. Phím U để hoàn tác nước đi.';
    if (btnUndo) btnUndo.classList.remove('hidden');
  } else if (game === 'goldminer') {
    if (typeBadge) typeBadge.textContent = 'FPTU GOLD MINER';
    if (descEl) descEl.textContent = 'Canh móc tời xoay đúng hướng và bấm SPACE để thả móc kéo vàng, kim cương và quà bí ẩn!';
    if (btnUndo) btnUndo.classList.add('hidden');
  } else if (game === 'flappybug') {
    if (typeBadge) typeBadge.textContent = 'FLAPPY BUGGY';
    if (descEl) descEl.textContent = 'Bấm SPACE / Mũi Tên Lên / Click Chuột để Buggy vỗ cánh bay qua các cột Server FPTU!';
    if (btnUndo) btnUndo.classList.add('hidden');
  } else if (game === 'geometrydash') {
    if (typeBadge) typeBadge.textContent = 'DEVER DASH 3.0';
    if (descEl) descEl.textContent = 'Bấm SPACE / Mũi Tên Lên / Click Chuột để nhảy qua bẫy gai neon, đệm nhún và cổng đảo trọng lực!';
    if (btnUndo) btnUndo.classList.add('hidden');
  } else if (game === 'match3') {
    if (typeBadge) typeBadge.textContent = 'CYBER CANDY MATCH';
    if (descEl) descEl.textContent = 'Hoán đổi các viên ngọc lân cận (Click/Kéo thả) để tạo chuỗi 3 trở lên, tạo Kẹo Sọc, Kẹo Bọc và Cầu Vồng!';
    if (btnUndo) btnUndo.classList.add('hidden');
  } else if (game === 'pacman') {
    if (typeBadge) typeBadge.textContent = 'CYBER PAC-MAN';
    if (descEl) descEl.textContent = 'Dùng W/A/S/D hoặc Mũi Tên để điều khiển Pac-Buggy ăn hạt năng lượng, né ma và săn ma khi ăn Super D-Coin!';
    if (btnUndo) btnUndo.classList.add('hidden');
  }

  if (this.retroArcade && this.retroArcade.scores) {
    const s = this.retroArcade.scores;
    if (game === 'snake') this.syncArcadeBadges(game, s.snakeScore, s.snakeHigh);
    else if (game === 'sokoban') this.syncArcadeBadges(game, s.sokobanLevel, s.sokobanLevel);
    else if (game === 'goldminer') this.syncArcadeBadges(game, s.goldminerScore, s.goldminerHigh);
    else if (game === 'flappybug') this.syncArcadeBadges(game, s.flappyScore, s.flappyHigh);
    else if (game === 'geometrydash') this.syncArcadeBadges(game, s.dashPercent, s.dashHighPercent);
    else if (game === 'match3') this.syncArcadeBadges(game, s.match3Score, s.match3High);
    else if (game === 'pacman') this.syncArcadeBadges(game, s.pacmanScore, s.pacmanHigh);
  }
}

InteractiveModal.prototype.syncArcadeBadges = function(game, score, high) {
  const scoreBadge = document.getElementById('arcade-score-badge');
  const highBadge = document.getElementById('arcade-high-badge');
  if (scoreBadge && score !== undefined) {
    if (game === 'sokoban') scoreBadge.textContent = `Màn: ${score}`;
    else if (game === 'geometrydash') scoreBadge.textContent = `Tiến độ: ${score}%`;
    else scoreBadge.textContent = `Điểm: ${score}`;
  }
  if (highBadge && high !== undefined) {
    if (game === 'sokoban') highBadge.textContent = `Kỷ lục Màn: ${high}`;
    else if (game === 'geometrydash') highBadge.textContent = `Kỷ lục: ${high}%`;
    else highBadge.textContent = `Kỷ lục: ${high}`;
  }
}
