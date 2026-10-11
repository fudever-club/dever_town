/**
 * InteractiveModal.rest — Giường nghỉ ngơi KTX + dream mini-game hooks.
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { INTERACTION_PRESETS } from '../../config/interactions.js';
import { questManager } from '../../managers/QuestManager.js';
import { SheepDreamEngine } from '../minigames/dream/SheepDreamEngine.js';

/**
 * Thiết lập giao diện Giường Nghỉ Ngơi KTX (Gather.town style rest spot)
 * @param {Object} zoneData
 */
InteractiveModal.prototype.setupRestView = function(zoneData) {
  const pane = document.getElementById('pane-rest');
  if (!pane) return;
  pane.classList.remove('hidden');

  const def = INTERACTION_PRESETS.rest_bed || {};
  const titleEl = document.getElementById('rest-title');
  const descEl = document.getElementById('rest-desc');
  const statusEl = document.getElementById('rest-status');
  const tipsEl = document.getElementById('rest-tips');
  const btn = document.getElementById('rest-btn');

  if (titleEl) titleEl.textContent = def.title || zoneData.name || 'Giường Nghỉ Ngơi';
  if (descEl) descEl.textContent = def.description || '';
  if (statusEl) statusEl.textContent = '';
  if (tipsEl) {
    tipsEl.innerHTML = (def.tips || []).map(t => `
      <div style="display:flex;gap:10px;background:rgba(255,255,255,0.04);border-radius:8px;padding:8px 12px">
        <span style="font-size:16px">💡</span>
        <span style="color:#94a3b8;font-size:0.82rem">${t}</span>
      </div>
    `).join('');
  }

  if (btn) {
    btn.onclick = () => {
      if (statusEl) {
        const messages = [
          'Đang nghỉ ngơi... Zzz...',
          'Năng lượng +50! Sẵn sàng code tiếp!',
          'Tinh thần phấn chấn! Deadline không còn đáng sợ!'
        ];
        statusEl.textContent = messages[Math.floor(Math.random() * messages.length)];
      }
      // Thưởng điểm nghỉ ngơi qua achievementManager nếu có
      try {
        window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('rested');
      } catch (e) { /* bỏ qua */ }
    };
  }

  // Nút vào giấc mơ đếm cừu
  const dreamBtn = document.getElementById('dream-btn');
  if (dreamBtn && !dreamBtn.dataset.initialized) {
    dreamBtn.dataset.initialized = 'true';
    dreamBtn.onclick = () => this.startSheepDream();
  }
}

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
        // Cộng D-Coin qua questManager hoặc trực tiếp
        if (ws?.player?.addDCoin) ws.player.addDCoin(result.dcoin);
      } catch (e) {}
    },
    onWake: () => {
      if (closeBtn) closeBtn.classList.remove('hidden');
      // Xóa trạng thái dreaming
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
}

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
  // Xóa trạng thái dreaming
  try {
    window.__DEVER_GAME__?.scene?.keys?.WorldScene?.player?.setActivity?.(null);
  } catch (e) {}
}
