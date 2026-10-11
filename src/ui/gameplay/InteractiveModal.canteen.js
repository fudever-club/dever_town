/**
 * InteractiveModal.canteen — Canteen menu view.
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

InteractiveModal.prototype.setupCanteenMenuView = function(zoneData) {
  const pane = document.getElementById('pane-canteen-menu');
  if (!pane) return;
  pane.classList.remove('hidden');

  const canteenDef = INTERACTION_PRESETS.canteen_menus;
  const tabsBar = document.getElementById('canteen-tabs-bar');
  const imgEl = document.getElementById('canteen-menu-img');
  const fullBtn = document.getElementById('canteen-img-full-btn');
  const titleEl = document.getElementById('canteen-tab-title');
  const descEl = document.getElementById('canteen-tab-desc');
  const highlightsList = document.getElementById('canteen-highlights-list');

  const selectTab = (tab) => {
    if (imgEl) imgEl.src = tab.image;
    if (fullBtn) fullBtn.href = tab.image;
    if (titleEl) titleEl.textContent = tab.name;
    if (descEl) descEl.textContent = tab.desc;

    if (highlightsList) {
      highlightsList.innerHTML = '';
      tab.highlights.forEach(h => {
        const item = document.createElement('div');
        item.className = 'canteen-highlight-item';
        item.textContent = h;
        highlightsList.appendChild(item);
      });
    }

    if (tabsBar) {
      tabsBar.querySelectorAll('.canteen-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tabId === tab.id);
      });
    }
  };

  if (tabsBar) {
    tabsBar.innerHTML = '';
    canteenDef.tabs.forEach((tab, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.tabId = tab.id;
      btn.className = `canteen-tab-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = tab.name;
      btn.addEventListener('click', () => {
        audioManager.playClick();
        selectTab(tab);
      });
      tabsBar.appendChild(btn);
    });
  }

  if (canteenDef.tabs.length > 0) {
    selectTab(canteenDef.tabs[0]);
  }
}
