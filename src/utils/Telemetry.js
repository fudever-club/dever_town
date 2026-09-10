export class Telemetry {
  constructor() {
    this.queueKey = 'dever_telemetry_queue';
    this.maxQueueSize = 200;
    this.flushIntervalMs = 60000;
    this.isGuest = true;
    this.whitelist = ['room_id', 'quest_id', 'minigame_type', 'score', 'is_guest', 'action_type'];
    
    this.queue = this.loadQueue();
    this.timer = null;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.track('session_end');
          this.flush();
        }
      });
      window.addEventListener('unload', () => {
        this.track('session_end');
        this.flush();
      });
    }
  }

  init({ isGuest }) {
    this.isGuest = isGuest;
    this.startTimer();
  }

  loadQueue() {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.queueKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveQueue() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(this.queue));
    } catch (e) {}
  }

  track(eventName, payload = {}) {
    const event = {
      event_name: eventName,
      timestamp: new Date().toISOString(),
      is_guest: this.isGuest
    };

    // Filter payload by whitelist
    for (const key of Object.keys(payload)) {
      if (this.whitelist.includes(key)) {
        event[key] = payload[key];
      }
    }

    this.queue.push(event);

    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift(); // Drop oldest
    }

    this.saveQueue();

    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    if (typeof window !== 'undefined') {
      this.timer = setInterval(() => this.flush(), this.flushIntervalMs);
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];
    this.saveQueue();

    try {
      const response = await fetch('/api/telemetry/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch })
      });

      if (!response.ok) {
        throw new Error('Flush failed');
      }
    } catch (error) {
      // Best-effort, no retry. If failed, events are lost.
      // But if we want to retain on offline, we could put them back. 
      // The requirement says: "Nếu offline, giữ local đến max 200 events rồi drop oldest".
      // Wait, "Nếu offline, giữ local... " implies we should check `navigator.onLine` or catch fetch error.
      // Let's re-add to queue up to maxQueueSize.
      const combined = [...batch, ...this.queue];
      if (combined.length > this.maxQueueSize) {
        this.queue = combined.slice(combined.length - this.maxQueueSize);
      } else {
        this.queue = combined;
      }
      this.saveQueue();
    }
  }
}

export const telemetry = new Telemetry();
