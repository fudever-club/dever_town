/**
 * InteractiveModal.website — Website / portal quick links (iframe).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { INTERACTION_PRESETS } from '../../config/interactions.js';

InteractiveModal.prototype.setupWebsiteView = function(zoneData) {
  const pane = document.getElementById('pane-website');
  if (!pane) return;
  pane.classList.remove('hidden');

  const meta = zoneData.metadata || {};
  const url = meta.url || INTERACTION_PRESETS.club_website.defaultUrl;

  const input = document.getElementById('web-url-input');
  if (input) input.value = url;

  this.loadWebsiteIframe(url);
  this.renderPortalQuickLinks();
}

InteractiveModal.prototype.renderPortalQuickLinks = function() {
  const container = document.getElementById('web-portals-container');
  if (!container) return;

  container.innerHTML = '';
  const portals = INTERACTION_PRESETS.club_website.portals;

  portals.forEach(p => {
    const a = document.createElement('a');
    a.className = 'web-quick-link';
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = p.name;
    container.appendChild(a);
  });
}

InteractiveModal.prototype.loadWebsiteIframe = function(url) {
  const iframe = document.getElementById('web-iframe');
  if (iframe) iframe.src = url;

  const openTabBtn = document.getElementById('web-open-tab-btn');
  if (openTabBtn) openTabBtn.href = url;
}
