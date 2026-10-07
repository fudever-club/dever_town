/**
 * InteractiveModal.fptu — FPTU portal view.
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { INTERACTION_PRESETS } from '../../config/interactions.js';
import { audioManager } from '../../utils/AudioManager.js';

InteractiveModal.prototype.setupFptuPortalView = function(zoneData) {
  const pane = document.getElementById('pane-fptu-portal');
  if (!pane) return;
  pane.classList.remove('hidden');

  const portalDef = INTERACTION_PRESETS.fptu_student_portal;
  const systemsGrid = document.getElementById('fptu-systems-grid');
  const examGrid = document.getElementById('fptu-exam-apps-grid');

  if (systemsGrid) {
    systemsGrid.innerHTML = '';
    portalDef.systems.forEach(sys => {
      const card = document.createElement('a');
      card.href = sys.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'fptu-system-card';
      card.innerHTML = `
        <div class="fptu-card-header">
          <span class="fptu-card-badge" style="background: ${sys.color}20; color: ${sys.color}; border: 1px solid ${sys.color}40;">${sys.badge}</span>
          <span class="fptu-card-arrow">↗</span>
        </div>
        <h4 class="fptu-card-name">${sys.name}</h4>
        <p class="fptu-card-desc">${sys.desc}</p>
      `;
      card.addEventListener('click', () => audioManager.playClick());
      systemsGrid.appendChild(card);
    });
  }

  if (examGrid) {
    examGrid.innerHTML = '';
    portalDef.examApps.forEach(app => {
      const card = document.createElement('div');
      card.className = 'fptu-exam-card';
      card.innerHTML = `
        <div class="exam-card-badge">${app.tag}</div>
        <h4 class="exam-card-name">${app.name}</h4>
        <p class="exam-card-purpose">${app.purpose}</p>
        <p class="exam-card-guide">${app.guide}</p>
        <a href="${app.url}" target="_blank" rel="noopener noreferrer" class="exam-card-download-btn">
          Tải Bộ Cài Đặt / Truy Cập
        </a>
      `;
      const btn = card.querySelector('.exam-card-download-btn');
      if (btn) btn.addEventListener('click', () => audioManager.playClick());
      examGrid.appendChild(card);
    });
  }
}
