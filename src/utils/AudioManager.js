/**
 * Quản lý Hệ thống Âm thanh Game DEVER TOWN bằng Web Audio API Synthesizer
 * Tự động tổng hợp âm thanh 8-bit retro mà không cần tải file MP3 ngoài.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterVolume = 0.7;
    this.sfxEnabled = true;
    this.footstepsEnabled = true;
    this.lastFootstepTime = 0;

    this.loadSettings();
    this.initAudioContextOnUserGesture();
  }

  loadSettings() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem('dever_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.isMuted = parsed.isMuted ?? false;
        this.masterVolume = parsed.masterVolume ?? 0.7;
        this.sfxEnabled = parsed.sfxEnabled ?? true;
        this.footstepsEnabled = parsed.footstepsEnabled ?? true;
      }
    } catch (e) {
      console.warn('Lỗi nạp Audio Settings:', e);
    }
  }

  saveSettings() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('dever_audio_settings', JSON.stringify({
        isMuted: this.isMuted,
        masterVolume: this.masterVolume,
        sfxEnabled: this.sfxEnabled,
        footstepsEnabled: this.footstepsEnabled
      }));
    } catch (e) {
      console.warn('Lỗi lưu Audio Settings:', e);
    }
  }

  initAudioContextOnUserGesture() {
    if (typeof window === 'undefined') return;

    const unlockAudio = () => {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: false });
    window.addEventListener('keydown', unlockAudio, { once: false });
  }

  getAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.isMuted = muted;
    this.saveSettings();
  }

  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  setFootstepsEnabled(enabled) {
    this.footstepsEnabled = enabled;
    this.saveSettings();
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Tiếng bước chân khi di chuyển (gọi định kỳ mỗi ~280ms)
   */
  playFootstep() {
    if (this.isMuted || !this.sfxEnabled || !this.footstepsEnabled) return;

    const now = performance.now();
    if (now - this.lastFootstepTime < 240) return;
    this.lastFootstepTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const freq = 90 + Math.random() * 30;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.06);

      const vol = this.masterVolume * 0.15;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Ignore audio error
    }
  }

  /**
   * Tiếng click nút bấm UI
   */
  playClick() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

      const vol = this.masterVolume * 0.25;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  /**
   * Tiếng qua cổng Teleport Portal
   */
  playTeleport() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      const vol = this.masterVolume * 0.35;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  /**
   * Tiếng nhặt vật phẩm vào túi đồ
   */
  playPickup() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        const vol = this.masterVolume * 0.3;
        gain.gain.setValueAtTime(vol, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.12);
      });
    } catch (e) {}
  }

  /**
   * Tiếng ghi bàn / ném bóng / thành tích thể thao
   */
  playVictory() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        const vol = this.masterVolume * 0.2;
        gain.gain.setValueAtTime(vol, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
