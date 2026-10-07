/**
 * InteractiveModal.coffee — Góc cà phê + nhạc lofi (music genres, YouTube presets).
 *
 * Prototype patch module, following the established pattern from
 * InteractiveModal.dream.js: methods are attached to
 * InteractiveModal.prototype at import time. The class itself lives in
 * InteractiveModal.base.js; this file must be imported (via
 * InteractiveModal.js) before any instance is created.
 */
import { InteractiveModal } from './InteractiveModal.base.js';
import { MUSIC_GENRES, LOFI_PRESETS, extractYouTubeVideoId } from '../../config/musicPresets.js';
import { questManager } from '../../managers/QuestManager.js';

InteractiveModal.prototype.setupCoffeeView = function(zoneData) {
  const pane = document.getElementById('pane-coffee');
  if (!pane) return;
  pane.classList.remove('hidden');

  questManager.incrementProgress('focus_lofi_pomo', 1);

  this.activeMusicGenre = this.activeMusicGenre || 'all';
  this.renderMusicGenreTabs();
  this.renderLofiPresets();

  // Khôi phục bài hát cá nhân của riêng người chơi nếu có lưu trước đó
  const personalLofi = localStorage.getItem('dever_personal_lofi_url');
  if (personalLofi) {
    const input = document.getElementById('lofi-url-input');
    if (input) input.value = personalLofi;
    const videoId = extractYouTubeVideoId(personalLofi);
    if (videoId) {
      this.loadLofiVideo(videoId);
      return;
    }
  }

  const firstPreset = LOFI_PRESETS[0];
  const initialId = firstPreset ? firstPreset.videoId : 'm7Wya6Z-QdM';
  this.loadLofiVideo(initialId);
}

InteractiveModal.prototype.renderMusicGenreTabs = function() {
  const nav = document.getElementById('lofi-genres-nav');
  if (!nav) return;

  nav.innerHTML = '';
  MUSIC_GENRES.forEach(g => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `lofi-genre-pill ${this.activeMusicGenre === g.id ? 'active' : ''}`;
    btn.textContent = g.name;
    btn.addEventListener('click', () => {
      this.activeMusicGenre = g.id;
      this.renderMusicGenreTabs();
      this.renderLofiPresets();
    });
    nav.appendChild(btn);
  });
}

InteractiveModal.prototype.renderLofiPresets = function() {
  const selectEl = document.getElementById('lofi-preset-select');
  if (!selectEl) return;

  const filtered = this.activeMusicGenre === 'all'
    ? LOFI_PRESETS
    : LOFI_PRESETS.filter(p => p.genre === this.activeMusicGenre);

  selectEl.innerHTML = `<option value="">Chọn bài hát gợi ý có sẵn (${filtered.length} bài)...</option>`;

  filtered.forEach(preset => {
    const opt = document.createElement('option');
    opt.value = preset.videoId;
    opt.textContent = preset.name;
    selectEl.appendChild(opt);
  });

  if (!selectEl.dataset.bound) {
    selectEl.dataset.bound = 'true';
    selectEl.addEventListener('change', () => {
      const vid = selectEl.value;
      if (vid) {
        const input = document.getElementById('lofi-url-input');
        if (input) input.value = `https://youtu.be/${vid}`;
        this.loadLofiVideo(vid);
      }
    });
  }
}

InteractiveModal.prototype.loadLofiVideo = function(videoId) {
  const lofiIframe = document.getElementById('lofi-iframe');
  if (lofiIframe) {
    lofiIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1`;
  }
}
