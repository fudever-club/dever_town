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
    this.bgmEnabled = false;
    this.lastFootstepTime = 0;
    this.bgmTimer = null;
    this.bgmStep = 0;

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
        this.bgmEnabled = parsed.bgmEnabled ?? false;
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
        footstepsEnabled: this.footstepsEnabled,
        bgmEnabled: this.bgmEnabled
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

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (err) {}
      };

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

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (err) {}
      };

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

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (err) {}
      };

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

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (err) {}
        };

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

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (err) {}
        };

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  /**
   * Alias cho playVictory
   */
  playWin() {
    this.playVictory();
  }

  /**
   * Âm thanh hoàn thành tác vụ thành công
   */
  playSuccess() {
    this.playVictory();
  }

  /**
   * Fanfare hợp âm rực rỡ khi mở khóa Thành Tựu Mới (C5 -> E5 -> G5 -> C6 -> E6)
   */
  playAchievementFanfare() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i === notes.length - 1 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        const vol = this.masterVolume * 0.28;
        gain.gain.setValueAtTime(vol, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (err) {}
        };

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.35);
      });
    } catch (e) {}
  }

  /**
   * Tiếng chuông thăng hoa theo cấp độ Combo (1 -> 5+)
   */
  playComboChime(comboLevel = 1) {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const baseFreq = 440 + Math.min(comboLevel * 120, 960);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

      const vol = this.masterVolume * 0.25;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (err) {}
      };

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  /**
   * Tiếng blip nhẹ khi có điểm số bay Bouncing Text
   */
  playScorePopup() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      const vol = this.masterVolume * 0.15;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (err) {}
      };

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  /**
   * Khởi động nhạc nền Chiptune 8-bit vui tươi (Web Audio Synthesizer)
   */
  startBgm() {
    if (this.bgmTimer) return;
    this.bgmEnabled = true;
    this.saveSettings();

    // Chuỗi nốt giai điệu vui tươi Retro Chiptune (C major / Pentatonic bouncy)
    const melody = [
      523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
      880.00, 783.99, 659.25, 587.33,  // A5, G5, E5, D5
      523.25, 587.33, 659.25, 783.99,  // C5, D5, E5, G5
      659.25, 587.33, 523.25, 0        // E5, D5, C5, rest
    ];

    const bass = [
      130.81, 130.81, 164.81, 164.81, // C3, C3, E3, E3
      174.61, 174.61, 196.00, 196.00  // F3, F3, G3, G3
    ];

    this.bgmStep = 0;
    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.bgmEnabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const noteFreq = melody[this.bgmStep % melody.length];
        const bassFreq = bass[Math.floor(this.bgmStep / 2) % bass.length];

        // 1. Giai điệu chính (Lead)
        if (noteFreq > 0) {
          const oscLead = ctx.createOscillator();
          const gainLead = ctx.createGain();
          oscLead.type = 'square';
          oscLead.frequency.setValueAtTime(noteFreq, now);

          const volLead = this.masterVolume * 0.045; // Nhẹ nhàng, không làm phiền
          gainLead.gain.setValueAtTime(volLead, now);
          gainLead.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

          oscLead.connect(gainLead);
          gainLead.connect(ctx.destination);

          oscLead.start(now);
          oscLead.stop(now + 0.13);
        }

        // 2. Tiếng bass đệm (Triangle Bass)
        if (this.bgmStep % 2 === 0 && bassFreq > 0) {
          const oscBass = ctx.createOscillator();
          const gainBass = ctx.createGain();
          oscBass.type = 'triangle';
          oscBass.frequency.setValueAtTime(bassFreq, now);

          const volBass = this.masterVolume * 0.055;
          gainBass.gain.setValueAtTime(volBass, now);
          gainBass.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

          oscBass.connect(gainBass);
          gainBass.connect(ctx.destination);

          oscBass.start(now);
          oscBass.stop(now + 0.19);
        }

        this.bgmStep++;
      } catch (e) {}
    }, 180);
  }

  /**
   * Dừng nhạc nền BGM
   */
  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmEnabled = false;
    this.saveSettings();
  }

  /**
   * Bật / Tắt BGM
   */
  toggleBgm() {
    if (this.bgmEnabled && this.bgmTimer) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  /**
   * Âm thanh trả lời đúng trong Speed Code Duel (Cao độ tăng theo Combo)
   */
  playCorrectChime(streak = 1) {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Tần số gốc C5, tăng dần nếu có streak cao
      const baseFreq = 523.25 * (1 + Math.min(streak * 0.05, 0.4));
      const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Arpeggio sáng rực rỡ

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const vol = this.masterVolume * 0.28;
        gain.gain.setValueAtTime(vol, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.16);
      });
    } catch (e) {}
  }

  /**
   * Âm thanh trả lời sai (Boop nhẹ nhàng, vui nhộn)
   */
  playWrongBoop() {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      const vol = this.masterVolume * 0.2;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  /**
   * Âm thanh biểu cảm Emotes
   */
  playEmoteSound(emoteId = 'wave') {
    if (this.isMuted || !this.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (emoteId === 'wave') {
        // Double chirp
        [600, 800].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(this.masterVolume * 0.25, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.08);
        });
      } else if (emoteId === 'heart') {
        // Sweet chord
        [523.25, 659.25].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        });
      } else if (emoteId === 'fire' || emoteId === 'dance') {
        // Fast cheerful arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(this.masterVolume * 0.16, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.09);
        });
      } else {
        // Generic pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }
}

export const audioManager = new AudioManager();
