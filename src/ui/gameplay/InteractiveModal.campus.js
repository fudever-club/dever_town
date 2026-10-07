/**
 * InteractiveModal.campus — Campus map view.
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

InteractiveModal.prototype.setupCampusMapView = function(zoneData) {
  const pane = document.getElementById('pane-campus-map');
  if (!pane) return;
  pane.classList.remove('hidden');

  const mapDef = INTERACTION_PRESETS.campus_map;
  const listEl = document.getElementById('campus-locations-list');
  const imgEl = document.getElementById('campus-current-map-img') || pane.querySelector('.campus-map-img');
  const fullBtn = document.getElementById('campus-btn-full');
  const titleEl = document.getElementById('campus-map-section-title');
  const tabNewbie = document.getElementById('tab-btn-map-newbie');
  const tabOverview = document.getElementById('tab-btn-map-overview');

  const maps = mapDef.maps || [
    {
      id: 'newbie_k22',
      tabName: 'Bản Đồ Newbie K22',
      title: mapDef.title,
      subTitle: 'Danh Mục Địa Điểm Newbie K22 Cần Biết',
      image: mapDef.mapImage,
      rawImage: mapDef.mapImage,
      locations: mapDef.locations
    }
  ];

  const renderMap = (index) => {
    const current = maps[index] || maps[0];
    if (imgEl) {
      imgEl.src = current.image;
      imgEl.alt = current.title;
    }
    if (fullBtn) {
      fullBtn.href = current.rawImage || current.image;
    }
    if (titleEl) {
      titleEl.textContent = current.subTitle || current.title;
    }
    if (tabNewbie && tabOverview) {
      if (index === 0) {
        tabNewbie.classList.add('active');
        tabOverview.classList.remove('active');
      } else {
        tabNewbie.classList.remove('active');
        tabOverview.classList.add('active');
      }
    }

    if (listEl) {
      listEl.innerHTML = '';
      (current.locations || []).forEach(loc => {
        const item = document.createElement('div');
        item.className = 'campus-loc-item';
        item.innerHTML = `
          <span class="loc-num">${loc.num}</span>
          <div class="loc-details">
            <h4 class="loc-name">${loc.name}</h4>
            <p class="loc-desc">${loc.desc}</p>
          </div>
        `;
        listEl.appendChild(item);
      });
    }
  };

  if (tabNewbie) {
    tabNewbie.onclick = () => {
      audioManager.playClick();
      renderMap(0);
    };
  }
  if (tabOverview) {
    tabOverview.onclick = () => {
      audioManager.playClick();
      renderMap(1);
    };
  }

  renderMap(0);
}
