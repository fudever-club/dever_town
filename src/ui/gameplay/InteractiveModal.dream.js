/**
 * Dream patch for InteractiveModal — adds sheep-counting dream mini-game.
 * Separated from InteractiveModal.js (127KB, exceeds API push limit).
 * Patches the prototype at import time.
 */
import { InteractiveModal } from './InteractiveModal.js';
import { SheepDreamEngine } from '../minigames/dream/SheepDreamEngine.js';

/**
 * Bắt đầu mini-game "Đếm Cừu Trong Mơ" khi người chơi ngủ.
 * Hiển thị canvas dream, chạy SheepDreamEngine.
 */
InteractiveModal.prototype.startSheepDream = function() {
  const workspace = document.querySelector('#pane-rest .rest-workspace');
  const dreamWorkspace = document.getElementById('dream-workspace');
  const canvas = document.getElementById('sheep-dream-canvas');
  const resultEl = document.getElementById('dream-result');
  const closeBtn = document.getElementById('dream-close-btn');

  if (!canvas || !dreamWorkspace) return;

  // Ẩn UI nghỉ ngơi, hiện canvas mơ
  if (workspace) workspace.classList.add('hidden');
  dreamWorkspace.classList.remove('hidden');
  if (resultEl) resultEl.textContent = '';
  if (closeBtn) closeBtn.classList.add('hidden');

  // Dọn dẹp engine cũ nếu có
  if (this.sheepDream) {
    try { this.sheepDream.destroy(); } catch (e) {}
    this.sheepDream = null;
  }

  // Thông báo multiplayer: đang mơ
  try {
    window.__DEVER_GAME__?.scene?.keys?.WorldScene?.player?.setActivity?.('dreaming');
  } catch (e) {}

  this.sheepDream = new SheepDreamEngine(canvas, {
    onCount: (counted, score) => {
      if (resultEl) resultEl.textContent = `Đã đếm: ${counted} con cừu`;
    },
    onComplete: (result) => {
      const msg = result.perfect
        ? `Hoàn hảo! Đếm đủ ${result.counted} con, không sót con nào! +${result.dcoin} D-Coin`
        : `Đã đếm ${result.counted} con cừu! +${result.dcoin} D-Coin`;
      if (resultEl) resultEl.textContent = msg;
      // Thưởng D-Coin và achievement
      try {
        const ws = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        ws?.achievementManager?.unlock('sheep_dreamer');
        if (ws?.player?.addDCoin) ws.player.addDCoin(result.dcoin);
      } catch (e) {}
    },
    onWake: () => {
      if (closeBtn) closeBtn.classList.remove('hidden');
      try {
        window.__DEVER_GAME__?.scene?.keys?.WorldScene?.player?.setActivity?.(null);
      } catch (e) {}
    },
  });

  this.sheepDream.start();
  this.sheepDream.run();

  if (closeBtn && !closeBtn.dataset.initialized) {
    closeBtn.dataset.initialized = 'true';
    closeBtn.onclick = () => this.closeSheepDream();
  }
};

/**
 * Đóng giấc mơ, quay lại UI nghỉ ngơi.
 */
InteractiveModal.prototype.closeSheepDream = function() {
  if (this.sheepDream) {
    try { this.sheepDream.destroy(); } catch (e) {}
    this.sheepDream = null;
  }
  const workspace = document.querySelector('#pane-rest .rest-workspace');
  const dreamWorkspace = document.getElementById('dream-workspace');
  if (workspace) workspace.classList.remove('hidden');
  if (dreamWorkspace) dreamWorkspace.classList.add('hidden');
  try {
    window.__DEVER_GAME__?.scene?.keys?.WorldScene?.player?.setActivity?.(null);
  } catch (e) {}
};

// Wire the dream button after setupRestView runs.
const _origSetupRestView = InteractiveModal.prototype.setupRestView;
InteractiveModal.prototype.setupRestView = function(zoneData) {
  const result = _origSetupRestView.call(this, zoneData);
  // Nút vào giấc mơ đếm cừu
  const dreamBtn = document.getElementById('dream-btn');
  if (dreamBtn && !dreamBtn.dataset.initialized) {
    dreamBtn.dataset.initialized = 'true';
    dreamBtn.onclick = () => this.startSheepDream();
  }
  return result;
};
