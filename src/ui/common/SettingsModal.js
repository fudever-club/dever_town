import { audioManager } from '../../utils/AudioManager.js';
import { i18n } from '../../config/i18n.js';

export class SettingsModal {
  constructor({ scene } = {}) {
    this.scene = scene;
    this.modalEl = document.getElementById('settings-modal');
    this.initEvents();
  }

  initEvents() {
    if (!this.modalEl) return;

    const closeBtn = document.getElementById('settings-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.hide();
      });
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.hide();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });

    // Language Buttons
    const langViBtn = document.getElementById('setting-lang-vi');
    const langEnBtn = document.getElementById('setting-lang-en');

    if (langViBtn && langEnBtn) {
      langViBtn.addEventListener('click', () => {
        audioManager.playClick();
        i18n.setLanguage('vi');
        this.updateUI();
      });

      langEnBtn.addEventListener('click', () => {
        audioManager.playClick();
        i18n.setLanguage('en');
        this.updateUI();
      });
    }

    // Audio Controls
    const muteToggle = document.getElementById('setting-audio-mute');
    if (muteToggle) {
      muteToggle.addEventListener('change', (e) => {
        audioManager.setMuted(e.target.checked);
        audioManager.playClick();
      });
    }

    const volumeSlider = document.getElementById('setting-audio-volume');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audioManager.setMasterVolume(val);
        const label = document.getElementById('setting-volume-val');
        if (label) label.textContent = `${Math.round(val * 100)}%`;
      });
    }

    const footstepsToggle = document.getElementById('setting-audio-footsteps');
    if (footstepsToggle) {
      footstepsToggle.addEventListener('change', (e) => {
        audioManager.setFootstepsEnabled(e.target.checked);
        audioManager.playClick();
      });
    }

    const sfxToggle = document.getElementById('setting-audio-sfx');
    if (sfxToggle) {
      sfxToggle.addEventListener('change', (e) => {
        audioManager.setSfxEnabled(e.target.checked);
        audioManager.playClick();
      });
    }

    // Chế độ di chuyển mobile: D-pad | Analog
    const dpadBtn = document.getElementById('setting-move-dpad');
    const analogBtn = document.getElementById('setting-move-analog');
    const analogVisibleRow = document.getElementById('setting-analog-visible-row');
    const analogVisibleToggle = document.getElementById('setting-analog-visible');

    const getTouchControls = () => this.scene?.touchControls || null;

    if (dpadBtn && analogBtn) {
      dpadBtn.addEventListener('click', () => {
        audioManager.playClick();
        getTouchControls()?.setMoveMode('dpad');
        this.updateMoveModeUI();
      });
      analogBtn.addEventListener('click', () => {
        audioManager.playClick();
        getTouchControls()?.setMoveMode('analog');
        this.updateMoveModeUI();
      });
    }

    if (analogVisibleToggle) {
      analogVisibleToggle.addEventListener('change', (e) => {
        audioManager.playClick();
        getTouchControls()?.setAnalogVisible(e.target.checked);
      });
    }

    // Đồng bộ khi TouchControls đổi chế độ từ nơi khác.
    window.addEventListener('dever:move-mode-changed', () => this.updateMoveModeUI());

    // Header & Welcome Gate Settings Triggers
    const headerSettingsBtn = document.getElementById('header-settings-btn');    if (headerSettingsBtn) {
      headerSettingsBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.show();
      });
    }

    const gateSettingsBtn = document.getElementById('gate-settings-btn');
    if (gateSettingsBtn) {
      gateSettingsBtn.addEventListener('click', () => {
        audioManager.playClick();
        this.show();
      });
    }
  }

  isOpen() {
    return this.modalEl && !this.modalEl.classList.contains('hidden');
  }

  show() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.updateUI();
  }

  hide() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
    if (this.scene?.inputController) {
      this.scene.inputController.enableInput();
    }
  }

  updateUI() {
    // Sync Language Buttons
    const langViBtn = document.getElementById('setting-lang-vi');
    const langEnBtn = document.getElementById('setting-lang-en');

    if (langViBtn && langEnBtn) {
      if (i18n.currentLang === 'vi') {
        langViBtn.classList.add('active');
        langEnBtn.classList.remove('active');
      } else {
        langViBtn.classList.remove('active');
        langEnBtn.classList.add('active');
      }
    }

    // Sync Audio Controls
    const muteToggle = document.getElementById('setting-audio-mute');
    if (muteToggle) muteToggle.checked = audioManager.isMuted;

    const volumeSlider = document.getElementById('setting-audio-volume');
    if (volumeSlider) {
      volumeSlider.value = audioManager.masterVolume;
      const label = document.getElementById('setting-volume-val');
      if (label) label.textContent = `${Math.round(audioManager.masterVolume * 100)}%`;
    }

    const footstepsToggle = document.getElementById('setting-audio-footsteps');
    if (footstepsToggle) footstepsToggle.checked = audioManager.footstepsEnabled;

    const sfxToggle = document.getElementById('setting-audio-sfx');
    if (sfxToggle) sfxToggle.checked = audioManager.sfxEnabled;

    this.updateMoveModeUI();
  }

  updateMoveModeUI() {
    const tc = this.scene?.touchControls || null;
    const mode = tc ? tc.getMoveMode() : 'dpad';

    const dpadBtn = document.getElementById('setting-move-dpad');
    const analogBtn = document.getElementById('setting-move-analog');
    if (dpadBtn && analogBtn) {
      dpadBtn.classList.toggle('active', mode === 'dpad');
      analogBtn.classList.toggle('active', mode === 'analog');
    }

    const analogVisibleRow = document.getElementById('setting-analog-visible-row');
    const analogVisibleToggle = document.getElementById('setting-analog-visible');
    if (analogVisibleRow) {
      // Chỉ hiện toggle "hiện cần" khi đang ở chế độ analog.
      analogVisibleRow.style.display = mode === 'analog' ? '' : 'none';
    }
    if (analogVisibleToggle) {
      analogVisibleToggle.checked = tc ? tc.isAnalogVisible() : true;
    }
  }
}
