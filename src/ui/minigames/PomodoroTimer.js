/**
 * PomodoroTimer: Bộ đếm thời gian học tập 25/5 phút kèm âm thanh chuông Web Audio API tự sinh.
 */
export class PomodoroTimer {
  constructor({ onTick, onComplete }) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.mode = 'work'; // 'work' (25m) hoặc 'break' (5m)
    this.timeLeft = 25 * 60; // Giây
    this.timerId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        if (this.onTick) this.onTick(this.getFormattedTime(), this.mode);
      } else {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  reset(mode = 'work') {
    this.pause();
    this.mode = mode;
    this.timeLeft = mode === 'work' ? 25 * 60 : 5 * 60;
    if (this.onTick) this.onTick(this.getFormattedTime(), this.mode);
  }

  complete() {
    this.pause();
    this.playChime();
    if (this.onComplete) this.onComplete(this.mode);
    // Tự động chuyển mode
    this.reset(this.mode === 'work' ? 'break' : 'work');
  }

  getFormattedTime() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Phát âm thanh chuông kết thúc bằng Web Audio API
   */
  playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.6);
      });
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  }
}
