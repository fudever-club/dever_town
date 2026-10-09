/**
 * InteractiveModal.sports — Sports arcade (select screen + slim gameplay topbar).
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
import { SportsArcade } from '../minigames/SportsArcade.js';

// Pixel-art style SVG icons (40x40) — one per sport, no emoji.
const SPORTS_ICONS = {
  football: '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="14" fill="#f8fafc"/><circle cx="20" cy="20" r="14" fill="none" stroke="#1e293b" stroke-width="2"/><polygon points="20,14 25,18 23,24 17,24 15,18" fill="#1e293b"/><path d="M20 6v8M8 13l7 5M32 13l-7 5M12 32l5-8M28 32l-5-8" stroke="#1e293b" stroke-width="1.5"/></svg>',
  basketball: '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="14" fill="#f97316"/><circle cx="20" cy="20" r="14" fill="none" stroke="#7c2d12" stroke-width="2"/><path d="M6 20h28M20 6v28M10 10c6 6 6 14 0 20M30 10c-6 6-6 14 0 20" stroke="#7c2d12" stroke-width="1.5" fill="none"/></svg>',
  volleyball: '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="14" fill="#f8fafc"/><circle cx="20" cy="20" r="14" fill="none" stroke="#1e293b" stroke-width="2"/><path d="M20 6c-4 6-4 10 0 14M20 34c4-6 4-10 0-14M6 20c6-4 10-4 14 0M34 20c-6 4-10 4-14 0" stroke="#3b82f6" stroke-width="2" fill="none"/></svg>',
  barista: '<svg viewBox="0 0 40 40" width="40" height="40"><rect x="10" y="14" width="16" height="18" rx="2" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/><path d="M26 17h4a4 4 0 0 1 0 8h-4" fill="none" stroke="#1e293b" stroke-width="2"/><rect x="10" y="14" width="16" height="6" fill="#a16207"/><ellipse cx="18" cy="11" rx="3" ry="4" fill="#e2e8f0" opacity="0.7"/></svg>'
};

const SPORTS_GAMES = [
  { id: 'football', name: 'Sút Phạt Đền 11M', badge: 'SÚT PHẠT ĐỀN 11M', controls: 'Space: sút bóng', highKey: 'footballHigh', highFmt: (v) => `${v}` },
  { id: 'basketball', name: 'Bóng Rổ Flappy', badge: 'BÓNG RỔ FLAPPY DUNK', controls: 'Space / Click: nhấp bóng', highKey: 'basketballHigh', highFmt: (v) => `${v}đ` },
  { id: 'volleyball', name: 'Bóng Chuyền Spike', badge: 'BÓNG CHUYỀN SPIKE RALLY', controls: 'A/D: di chuyển • Space: đập', highKey: 'volleyballHigh', highFmt: (v) => `${v}` },
  { id: 'barista', name: 'Quầy Barista', badge: 'QUẦY BARISTA DEVER', controls: 'Space: pha chế', highKey: 'baristaScore', highFmt: (v) => `${v}đ` }
];

InteractiveModal.prototype.initSportsEngine = function() {
  this.sportsGameType = 'football';
  this.sportsDirection = 'center';
  this.sportsPower = 50;
  this.sportsPowerDir = 1;
  this.sportsAnimId = null;
  this.penaltyStreak = parseInt(localStorage.getItem('dever_penalty_streak') || '0', 10);
  this.penaltyHighScore = parseInt(localStorage.getItem('dever_penalty_high') || '0', 10);
  this.basketballShots = [];
  this.basketballHighScore = parseInt(localStorage.getItem('dever_bball_high') || '0', 10);

  const dirBtns = document.querySelectorAll('.sports-dir-btn');
  dirBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dirBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.sportsDirection = btn.dataset.dir || 'center';
      audioManager.playClick();
    });
  });
}

InteractiveModal.prototype.setupSportsView = function(zoneData) {
  const pane = document.getElementById('pane-sports');
  if (!pane) return;
  pane.classList.remove('hidden');

  const canvas = document.getElementById('sports-arcade-canvas');
  if (canvas && !this.sportsArcade) {
    this.sportsArcade = new SportsArcade(canvas, {
      onScoreUpdate: ({ game, scores }) => {
        this.updateSportsBadges(game, scores);
      },
      onAchievement: (achievementId) => this.onAchievement?.(achievementId)
    });
  }

  // Action button
  const actionBtn = document.getElementById('sports-action-btn');
  if (actionBtn && !actionBtn.dataset.initialized) {
    actionBtn.dataset.initialized = 'true';
    actionBtn.addEventListener('click', () => {
      if (this.sportsArcade) this.sportsArcade.onActionTrigger();
    });
  }

  // Touch controls for mobile / directional
  const btnLeft = document.getElementById('sports-btn-left');
  const btnRight = document.getElementById('sports-btn-right');
  const btnJump = document.getElementById('sports-btn-jump');

  if (btnLeft && !btnLeft.dataset.initialized) {
    btnLeft.dataset.initialized = 'true';
    btnLeft.addEventListener('pointerdown', () => { if (this.sportsArcade) this.sportsArcade.keys.left = true; });
    btnLeft.addEventListener('pointerup', () => { if (this.sportsArcade) this.sportsArcade.keys.left = false; });
  }
  if (btnRight && !btnRight.dataset.initialized) {
    btnRight.dataset.initialized = 'true';
    btnRight.addEventListener('pointerdown', () => { if (this.sportsArcade) this.sportsArcade.keys.right = true; });
    btnRight.addEventListener('pointerup', () => { if (this.sportsArcade) this.sportsArcade.keys.right = false; });
  }
  if (btnJump && !btnJump.dataset.initialized) {
    btnJump.dataset.initialized = 'true';
    btnJump.addEventListener('click', () => { if (this.sportsArcade) this.sportsArcade.onActionTrigger(); });
  }

  // Back button -> select screen
  const backBtn = document.getElementById('sports-back-btn');
  if (backBtn && !backBtn.dataset.initialized) {
    backBtn.dataset.initialized = 'true';
    backBtn.addEventListener('click', () => {
      audioManager.playClick();
      this.backToSportsSelect();
    });
  }

  // Vào sân nào chơi môn đó luôn (2026-10-09): mỗi zone sports có metadata.sport riêng.
  // Select screen chỉ hiện khi bấm back (đổi môn).
  const meta2 = zoneData.metadata || {};
  const initialSport = meta2.sport || 'football';
  if (SPORTS_GAMES.some(g => g.id === initialSport)) {
    this.playSportsGame(initialSport);
  } else {
    this.showSportsSelect();
  }
};

InteractiveModal.prototype.buildSportsCards = function() {
  const grid = document.getElementById('sports-game-grid');
  if (!grid || grid.dataset.built) return;
  grid.dataset.built = 'true';

  const scores = this.sportsArcade?.scores || {};
  SPORTS_GAMES.forEach(g => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-card';
    card.dataset.sport = g.id;

    card.innerHTML =
      `<span class="game-card-icon">${SPORTS_ICONS[g.id] || ''}</span>` +
      `<span class="game-card-name"></span>` +
      `<span class="game-card-high"></span>` +
      `<span class="game-card-controls"></span>`;
    card.querySelector('.game-card-name').textContent = g.name;
    card.querySelector('.game-card-high').textContent = `Kỷ lục: ${g.highFmt(scores[g.highKey] ?? 0)}`;
    card.querySelector('.game-card-controls').textContent = g.controls;

    card.addEventListener('click', () => {
      audioManager.playClick();
      this.playSportsGame(g.id);
    });
    grid.appendChild(card);
  });
};

InteractiveModal.prototype.refreshSportsCardHighs = function() {
  const grid = document.getElementById('sports-game-grid');
  if (!grid) return;
  const scores = this.sportsArcade?.scores || {};
  SPORTS_GAMES.forEach(g => {
    const el = grid.querySelector(`.game-card[data-sport="${g.id}"] .game-card-high`);
    if (el) el.textContent = `Kỷ lục: ${g.highFmt(scores[g.highKey] ?? 0)}`;
  });
};

InteractiveModal.prototype.showSportsSelect = function() {
  if (this.sportsArcade?.running) this.sportsArcade.stop();
  const sel = document.getElementById('sports-select-screen');
  const play = document.getElementById('sports-play-screen');
  if (sel) sel.classList.remove('hidden');
  if (play) play.classList.add('hidden');
  this.buildSportsCards();
  this.refreshSportsCardHighs();
};

InteractiveModal.prototype.backToSportsSelect = function() {
  this.showSportsSelect();
};

InteractiveModal.prototype.playSportsGame = function(sportId) {
  const sel = document.getElementById('sports-select-screen');
  const play = document.getElementById('sports-play-screen');
  if (sel) sel.classList.add('hidden');
  if (play) play.classList.remove('hidden');

  if (this.sportsArcade) {
    this.sportsArcade.setGame(sportId);
    this.sportsArcade.start();
  }
  this.syncSportsPlayUI(sportId);
};

InteractiveModal.prototype.getSportsGameMeta = function(sportId) {
  return SPORTS_GAMES.find(g => g.id === sportId) || SPORTS_GAMES[0];
};

InteractiveModal.prototype.syncSportsPlayUI = function(sport) {
  const meta = this.getSportsGameMeta(sport);
  const typeBadge = document.getElementById('sports-type-badge');
  const actionBtn = document.getElementById('sports-action-btn');
  const touchControls = document.getElementById('sports-touch-controls');

  if (typeBadge) typeBadge.textContent = meta.badge;
  if (touchControls) {
    touchControls.classList.toggle('hidden', sport !== 'volleyball');
  }

  if (actionBtn) {
    if (sport === 'football') actionBtn.textContent = 'SÚT BÓNG NGAY (SPACE)';
    else if (sport === 'basketball') actionBtn.textContent = 'NHẢY BÓNG (SPACE)';
    else if (sport === 'volleyball') actionBtn.textContent = 'NHẢY & ĐẬP BÓNG (SPACE)';
    else if (sport === 'barista') actionBtn.textContent = 'PHA CHẾ ĐỒ UỐNG';
  }

  if (this.sportsArcade) {
    this.updateSportsBadges(sport, this.sportsArcade.scores);
  }
};

// Back-compat alias (old tab-based callers)
InteractiveModal.prototype.syncSportsTabUI = function(sport) {
  this.syncSportsPlayUI(sport);
};

InteractiveModal.prototype.updateSportsBadges = function(sport, scores) {
  const streakBadge = document.getElementById('sports-streak-badge');
  const highBadge = document.getElementById('sports-high-badge');

  if (sport === 'football') {
    if (streakBadge) {
      streakBadge.classList.remove('hidden');
      streakBadge.textContent = `Chuỗi: ${scores.footballStreak || 0}`;
    }
    if (highBadge) highBadge.textContent = `Kỷ lục: ${scores.footballHigh || 0}`;
  } else if (sport === 'basketball') {
    if (streakBadge) {
      streakBadge.classList.remove('hidden');
      streakBadge.textContent = `Điểm: ${scores.basketballScore || 0}`;
    }
    if (highBadge) highBadge.textContent = `Kỷ lục: ${scores.basketballHigh || 0}đ`;
  } else if (sport === 'volleyball') {
    if (streakBadge) {
      streakBadge.classList.remove('hidden');
      streakBadge.textContent = `Rally: ${scores.volleyballRally || 0}`;
    }
    if (highBadge) highBadge.textContent = `Kỷ lục: ${scores.volleyballHigh || 0}`;
  } else if (sport === 'barista') {
    if (streakBadge) streakBadge.classList.add('hidden');
    if (highBadge) highBadge.textContent = `Điểm Barista: ${scores.baristaScore || 0}đ`;
  }
}

InteractiveModal.prototype.stopPowerLoop = function() {
  if (this.sportsArcade) {
    this.sportsArcade.stop();
  }
}

InteractiveModal.prototype.syncScoreToServer = async function(gameType, score, streak) {
  try {
    const token = localStorage.getItem('dever_token');
    const userRaw = localStorage.getItem('dever_user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    await fetch('/api/game/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        gameType,
        score,
        streak,
        userId: user ? user.id : undefined,
        playerName: user ? (user.display_name || user.displayName) : 'Khách FUDA'
      })
    });
  } catch (e) {
    // Offline fallback
  }
}
