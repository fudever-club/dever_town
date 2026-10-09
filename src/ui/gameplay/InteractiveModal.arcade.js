/**
 * InteractiveModal.arcade — Retro arcade games (select screen + slim gameplay topbar).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 *
 * Flow (2026-10-09 redesign): E opens a GAME SELECT grid (no tabs).
 * Clicking a card opens the GAMEPLAY screen: slim topbar
 * (back + title + score + high) and maximum canvas area.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { audioManager } from '../../utils/AudioManager.js';
import { RetroArcade } from '../minigames/RetroArcade.js';

// Pixel-art style SVG icons (40x40) — one per game, no emoji.
const ARCADE_ICONS = {
  snake: '<svg viewBox="0 0 40 40" width="40" height="40"><rect x="6" y="16" width="8" height="8" fill="#22c55e"/><rect x="14" y="16" width="8" height="8" fill="#16a34a"/><rect x="22" y="16" width="8" height="8" fill="#22c55e"/><rect x="22" y="8" width="8" height="8" fill="#16a34a"/><rect x="24" y="10" width="3" height="3" fill="#fff"/></svg>',
  sokoban: '<svg viewBox="0 0 40 40" width="40" height="40"><rect x="8" y="8" width="24" height="24" fill="#a16207"/><rect x="8" y="8" width="24" height="5" fill="#ca8a04"/><rect x="14" y="14" width="12" height="12" fill="none" stroke="#713f12" stroke-width="3"/><path d="M14 14l12 12M26 14L14 26" stroke="#713f12" stroke-width="3"/></svg>',
  goldminer: '<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,6 30,16 24,32 16,32 10,16" fill="#facc15"/><polygon points="20,6 30,16 24,32 20,32" fill="#eab308"/><rect x="18" y="12" width="4" height="4" fill="#fef9c3"/></svg>',
  flappybug: '<svg viewBox="0 0 40 40" width="40" height="40"><ellipse cx="13" cy="18" rx="7" ry="10" fill="#c4b5fd" opacity="0.85"/><ellipse cx="27" cy="18" rx="7" ry="10" fill="#c4b5fd" opacity="0.85"/><ellipse cx="20" cy="22" rx="7" ry="9" fill="#8b5cf6"/><circle cx="17" cy="19" r="2" fill="#fff"/><circle cx="23" cy="19" r="2" fill="#fff"/></svg>',
  geometrydash: '<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,6 34,32 6,32" fill="#22d3ee"/><polygon points="20,14 28,30 12,30" fill="#0e7490"/><rect x="17" y="22" width="6" height="6" fill="#fff"/></svg>',
  match3: '<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="10,8 16,8 16,16 10,16" fill="#f87171"/><polygon points="24,8 30,8 30,16 24,16" fill="#60a5fa"/><polygon points="17,20 23,20 23,28 17,28" fill="#4ade80"/><polygon points="10,8 13,4 16,8" fill="#fecaca"/><polygon points="24,8 27,4 30,8" fill="#bfdbfe"/></svg>',
  pacman: '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 6a14 14 0 1 0 9.9 24L20 20z" fill="#facc15"/><circle cx="20" cy="12" r="2.5" fill="#1e293b"/></svg>'
};

const ARCADE_GAMES = [
  { id: 'snake', name: 'Cyber Snake', badge: 'CYBER SNAKE 60FPS', controls: 'WASD / Mũi tên • Space: bứt tốc', highKey: 'snakeHigh', highFmt: (v) => `${v}` },
  { id: 'sokoban', name: 'Buggy Sokoban', badge: 'BUGGY SOKOBAN', controls: 'WASD: đẩy hộp • U: hoàn tác', highKey: 'sokobanLevel', highFmt: (v) => `Màn ${v}` },
  { id: 'goldminer', name: 'FPTU Gold Miner', badge: 'FPTU GOLD MINER', controls: 'Space: thả móc', highKey: 'goldminerHigh', highFmt: (v) => `${v}` },
  { id: 'flappybug', name: 'Flappy Bug', badge: 'FLAPPY BUGGY', controls: 'Space / Click: vỗ cánh', highKey: 'flappyHigh', highFmt: (v) => `${v}` },
  { id: 'geometrydash', name: 'Dever Dash', badge: 'DEVER DASH 3.0', controls: 'Space / Click: nhảy', highKey: 'dashHighPercent', highFmt: (v) => `${v}%` },
  { id: 'match3', name: 'Cyber Match', badge: 'CYBER CANDY MATCH', controls: 'Click / Kéo: hoán đổi', highKey: 'match3High', highFmt: (v) => `${v}` },
  { id: 'pacman', name: 'Cyber Pac-Man', badge: 'CYBER PAC-MAN', controls: 'WASD: di chuyển', highKey: 'pacmanHigh', highFmt: (v) => `${v}` }
];

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

  // Wire touch controls once
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

  // Back button -> select screen
  const backBtn = document.getElementById('arcade-back-btn');
  if (backBtn && !backBtn.dataset.initialized) {
    backBtn.dataset.initialized = 'true';
    backBtn.addEventListener('click', () => {
      audioManager.playClick();
      this.backToArcadeSelect();
    });
  }

  // Vào máy nào chơi game đó luôn (2026-10-09): mỗi máy arcade có defaultGame riêng.
  // Select screen chỉ hiện khi bấm back (đổi game).
  const defaultGame = (zoneData && zoneData.defaultGame) || 'snake';
  if (ARCADE_GAMES.some(g => g.id === defaultGame)) {
    this.playArcadeGame(defaultGame);
  } else {
    this.showArcadeSelect();
  }
};

InteractiveModal.prototype.buildArcadeCards = function() {
  const grid = document.getElementById('arcade-game-grid');
  if (!grid || grid.dataset.built) return;
  grid.dataset.built = 'true';

  const scores = this.retroArcade?.scores || {};
  ARCADE_GAMES.forEach(g => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-card';
    card.dataset.game = g.id;

    const highRaw = scores[g.highKey] ?? 0;
    const highText = `Kỷ lục: ${g.highFmt(highRaw)}`;

    card.innerHTML =
      `<span class="game-card-icon">${ARCADE_ICONS[g.id] || ''}</span>` +
      `<span class="game-card-name"></span>` +
      `<span class="game-card-high"></span>` +
      `<span class="game-card-controls"></span>`;
    card.querySelector('.game-card-name').textContent = g.name;
    card.querySelector('.game-card-high').textContent = highText;
    card.querySelector('.game-card-controls').textContent = g.controls;

    card.addEventListener('click', () => {
      audioManager.playClick();
      this.playArcadeGame(g.id);
    });
    grid.appendChild(card);
  });
};

InteractiveModal.prototype.refreshArcadeCardHighs = function() {
  const grid = document.getElementById('arcade-game-grid');
  if (!grid) return;
  const scores = this.retroArcade?.scores || {};
  ARCADE_GAMES.forEach(g => {
    const card = grid.querySelector(`.game-card[data-game="${g.id}"] .game-card-high`);
    if (card) card.textContent = `Kỷ lục: ${g.highFmt(scores[g.highKey] ?? 0)}`;
  });
};

InteractiveModal.prototype.showArcadeSelect = function() {
  if (this.retroArcade?.isRunning) this.retroArcade.stop();
  const sel = document.getElementById('arcade-select-screen');
  const play = document.getElementById('arcade-play-screen');
  if (sel) sel.classList.remove('hidden');
  if (play) play.classList.add('hidden');
  this.buildArcadeCards();
  this.refreshArcadeCardHighs();
};

InteractiveModal.prototype.backToArcadeSelect = function() {
  this.showArcadeSelect();
};

InteractiveModal.prototype.playArcadeGame = function(gameId) {
  const sel = document.getElementById('arcade-select-screen');
  const play = document.getElementById('arcade-play-screen');
  if (sel) sel.classList.add('hidden');
  if (play) play.classList.remove('hidden');

  if (this.retroArcade) {
    this.retroArcade.setGame(gameId);
    this.retroArcade.start();
  }
  this.syncArcadePlayUI(gameId);
};

InteractiveModal.prototype.getArcadeGameMeta = function(gameId) {
  return ARCADE_GAMES.find(g => g.id === gameId) || ARCADE_GAMES[0];
};

InteractiveModal.prototype.syncArcadePlayUI = function(game) {
  const meta = this.getArcadeGameMeta(game);
  const typeBadge = document.getElementById('arcade-type-badge');
  const btnUndo = document.getElementById('arcade-btn-undo');

  if (typeBadge) typeBadge.textContent = meta.badge;
  if (btnUndo) btnUndo.classList.toggle('hidden', game !== 'sokoban');

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
};

// Back-compat alias (old tab-based callers)
InteractiveModal.prototype.syncArcadeTabUI = function(game) {
  this.syncArcadePlayUI(game);
};

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
};
