/**
 * InteractiveModal.charter — Charter / điều lệ CLB guide view.
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

InteractiveModal.prototype.setupCharterGuideView = function(zoneData) {
  const pane = document.getElementById('pane-charter-guide');
  if (!pane) return;
  pane.classList.remove('hidden');

  const charterTabBtn = document.getElementById('tab-btn-charter');
  const sweTabBtn = document.getElementById('tab-btn-swe');
  const contentBox = document.getElementById('charter-content-box');

  const renderCharter = () => {
    if (charterTabBtn) charterTabBtn.classList.add('active');
    if (sweTabBtn) sweTabBtn.classList.remove('active');
    const def = INTERACTION_PRESETS.dever_charter;

    if (contentBox) {
      contentBox.innerHTML = `
        <div class="charter-doc-card">
          <h3 class="charter-doc-title">${def.title}</h3>
          <p class="charter-doc-sub">${def.description}</p>
          <div class="charter-info-grid">
            <div class="charter-stat"><strong>Sứ Mệnh:</strong> ${def.mission}</div>
            <div class="charter-stat"><strong>Tầm Nhìn:</strong> ${def.vision}</div>
            <div class="charter-stat"><strong>Lệ Phí Hoạt Động:</strong> ${def.fee}</div>
          </div>
          <h4 class="charter-sec-heading">Cơ Cấu Ban Chủ Nhiệm (BCN) CLB</h4>
          <div class="charter-roles-list">
            ${def.roles.map(r => `
              <div class="charter-role-item">
                <strong>${r.title}:</strong> <span>${r.desc}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  };

  const renderSWE = () => {
    if (charterTabBtn) charterTabBtn.classList.remove('active');
    if (sweTabBtn) sweTabBtn.classList.add('active');
    const def = INTERACTION_PRESETS.swe201c_guide;

    if (contentBox) {
      contentBox.innerHTML = `
        <div class="charter-doc-card">
          <h3 class="charter-doc-title">${def.title}</h3>
          <p class="charter-doc-sub">${def.description}</p>
          <div class="swe-authors-tag">Tác giả: <strong>${def.authors}</strong> (FU-DEVER Special Edition)</div>
          <h4 class="charter-sec-heading">5 Chủ Đề Trọng Tâm Đề Thi PE SWE201c Thực Tế</h4>
          <div class="swe-topics-list">
            ${def.topics.map(t => `
              <div class="swe-topic-item">
                <h5 class="swe-topic-name">${t.name}</h5>
                <p class="swe-topic-desc">${t.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  };

  if (charterTabBtn) {
    charterTabBtn.onclick = () => {
      audioManager.playClick();
      renderCharter();
    };
  }
  if (sweTabBtn) {
    sweTabBtn.onclick = () => {
      audioManager.playClick();
      renderSWE();
    };
  }

  if (zoneData.type === 'swe201c_guide') {
    renderSWE();
  } else {
    renderCharter();
  }
}
