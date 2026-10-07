/**
 * InteractiveModal.sports — Sports arcade (engine, tab sync, badges, score sync).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { audioManager } from '../../utils/AudioManager.js';
import { SportsArcade } from '../minigames/SportsArcade.js';

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

  const meta = zoneData.metadata || {};
  const initialSport = meta.sport || 'football';

  const canvas = document.getElementById('sports-arcade-canvas');
  if (canvas && !this.sportsArcade) {
    this.sportsArcade = new SportsArcade(canvas, {
      onScoreUpdate: ({ game, scores }) => {
        this.updateSportsBadges(game, scores);
      },
      onAchievement: (achievementId) => this.onAchievement?.(achievementId)
    });
  }

  if (this.sportsArcade) {
    this.sportsArcade.setGame(initialSport);
    this.sportsArcade.start();
  }

  // Tabs navigation
  const navTabs = document.getElementById('sports-nav-tabs');
  if (navTabs && !navTabs.dataset.initialized) {
    navTabs.dataset.initialized = 'true';
    navTabs.querySelectorAll('.sports-nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        navTabs.querySelectorAll('.sports-nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const sport = tab.dataset.sport;
        if (this.sportsArcade) {
          this.sportsArcade.setGame(sport);
        }
        this.syncSportsTabUI(sport);
      });
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

  this.syncSportsTabUI(initialSport);
}

InteractiveModal.prototype.syncSportsTabUI = function(sport) {
  const navTabs = document.getElementById('sports-nav-tabs');
  if (navTabs) {
    navTabs.querySelectorAll('.sports-nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.sport === sport);
    });
  }

  const typeBadge = document.getElementById('sports-type-badge');
  const descEl = document.getElementById('sports-game-desc');
  const actionBtn = document.getElementById('sports-action-btn');
  const touchControls = document.getElementById('sports-touch-controls');

  if (touchControls) {
    touchControls.classList.toggle('hidden', sport !== 'volleyball');
  }

  if (sport === 'football') {
    if (typeBadge) typeBadge.textContent = 'SÚT PHẠT ĐỀN 11M';
    if (descEl) descEl.textContent = 'Canh thanh ngắm qua lại và nhấn nút (hoặc phím SPACE) để sút bóng vào lưới đánh bại thủ môn!';
    if (actionBtn) actionBtn.textContent = 'SÚT BÓNG NGAY (SPACE)';
  } else if (sport === 'basketball') {
    if (typeBadge) typeBadge.textContent = 'BÓNG RỔ FLAPPY DUNK';
    if (descEl) descEl.textContent = 'Bấm phím SPACE hoặc Click để nhấp bóng nảy lên, căn lực rơi lọt qua từng chiếc rổ để ghi điểm!';
    if (actionBtn) actionBtn.textContent = 'NHẢY BÓNG (SPACE)';
  } else if (sport === 'volleyball') {
    if (typeBadge) typeBadge.textContent = 'BÓNG CHUYỀN SPIKE RALLY';
    if (descEl) descEl.textContent = 'Dùng phím A/D (hoặc nút bấm) di chuyển, SPACE để nhảy đập bóng đối đầu với Bot FUDA!';
    if (actionBtn) actionBtn.textContent = 'NHẢY & ĐẬP BÓNG (SPACE)';
  } else if (sport === 'barista') {
    if (typeBadge) typeBadge.textContent = 'QUẦY BARISTA DEVER';
    if (descEl) descEl.textContent = 'Canh con trỏ vào Vùng Xanh và bấm nút để pha chế ly Cà Phê Muối / Trà Sữa béo ngậy!';
    if (actionBtn) actionBtn.textContent = 'PHA CHẾ ĐỒ UỐNG';
  }

  if (this.sportsArcade) {
    this.updateSportsBadges(sport, this.sportsArcade.scores);
  }
}

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
