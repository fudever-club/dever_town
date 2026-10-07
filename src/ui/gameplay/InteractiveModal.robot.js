/**
 * InteractiveModal.robot — Robot showcase (ROBOT_GAMES).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { audioManager } from '../../utils/AudioManager.js';
import { ROBOT_GAMES } from '../../config/robotGames.js';
import { authService } from '../../services/AuthService.js';

InteractiveModal.prototype.setupRobotShowcaseView = function(zoneData) {
  const pane = document.getElementById('pane-robot-showcase');
  if (!pane) return;
  pane.classList.remove('hidden');

  const grid = document.getElementById('robot-games-grid');
  if (!grid) return;

  const isAdmin = authService.isAdmin();

  grid.innerHTML = '';
  ROBOT_GAMES.forEach(game => {
    const savedLink = localStorage.getItem(`dever_robot_link_${game.id}`) || game.link;
    const card = document.createElement('div');
    card.className = 'robot-card';
    card.innerHTML = `
      <div class="robot-card-img" style="display:flex;align-items:center;justify-content:center;font-size:52px;background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;">${game.icon}</div>
      <h3 class="robot-card-title" style="margin-top:10px;font-size:1.15rem;color:#38bdf8;">${game.name}</h3>
      <p class="robot-card-desc" style="font-size:0.85rem;color:#cbd5e1;line-height:1.5;">${game.desc}</p>
      
      <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px;margin-top:auto;font-size:11.5px;color:#94a3b8;display:grid;gap:4px;">
        <div><strong style="color:#fbbf24;">Gói cài đặt:</strong> ${game.fileName} (${game.fileSize || 'Zip'})</div>
        <div><strong style="color:#10b981;">File chạy:</strong> <code style="color:#34d399;background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px;">${game.exeName || 'Game.exe'}</code></div>
        <div><strong style="color:#38bdf8;">Phím bấm:</strong> ${game.controls}</div>
        <div><strong style="color:#c084fc;">Yêu cầu:</strong> ${game.req}</div>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;">
        <button type="button" class="robot-card-btn" style="flex:1;background:linear-gradient(135deg,#f26f21,#ea580c);color:#fff;font-weight:700;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;" data-game-id="${game.id}">
          <span>Tải Game (.exe)</span>
        </button>
        ${isAdmin ? `
          <button type="button" class="robot-edit-link-btn" title="[Admin] Cập nhật link tải của CLB" style="background:rgba(242,111,33,0.15);border:1px solid rgba(242,111,33,0.4);color:#f26f21;border-radius:8px;padding:0 10px;cursor:pointer;font-size:12px;font-weight:700;" data-game-id="${game.id}">
            Admin
          </button>
        ` : ''}
      </div>
    `;

    const downloadBtn = card.querySelector('.robot-card-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const targetUrl = localStorage.getItem(`dever_robot_link_${game.id}`) || game.link;
        audioManager.playClick();
        window.open(targetUrl, '_blank');
      });
    }

    const editBtn = card.querySelector('.robot-edit-link-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (!authService.isAdmin()) {
          alert('Chỉ Quản trị viên (Admin / Leader) mới có quyền đổi link tải game.');
          return;
        }
        const currentUrl = localStorage.getItem(`dever_robot_link_${game.id}`) || game.link;
        const newUrl = prompt(`[Admin] Nhập link tải Google Drive / GitHub / Mediafire cho game "${game.name}":`, currentUrl);
        if (newUrl !== null && newUrl.trim()) {
          localStorage.setItem(`dever_robot_link_${game.id}`, newUrl.trim());
          alert(`[Admin] Đã cập nhật link tải thành công cho "${game.name}"!`);
        }
      });
    }

    grid.appendChild(card);
  });
}
