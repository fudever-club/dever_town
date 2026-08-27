import { audioManager } from '../utils/AudioManager.js';

export const DAILY_QUESTS_DEF = [
  {
    id: 'daily_login',
    title: 'Điểm Danh Mỗi Ngày 🌅',
    desc: 'Đăng nhập vào thế giới ảo DEVER TOWN',
    icon: '🌅',
    target: 1,
    points: 20
  },
  {
    id: 'penalty_goal',
    title: 'Chân Sút Vàng 11m ⚽',
    desc: 'Ghi ít nhất 1 bàn thắng tại Sân bóng đá FUDA',
    icon: '⚽',
    target: 1,
    points: 30
  },
  {
    id: 'basketball_shoot',
    title: 'Tay Ném 3 Điểm FUDA 🏀',
    desc: 'Hoàn thành 1 phiên ném bóng rổ 10 quả',
    icon: '🏀',
    target: 1,
    points: 30
  },
  {
    id: 'focus_lofi_pomo',
    title: 'Coding Focus Lofi ☕',
    desc: 'Bật bộ đếm Pomodoro hoặc nghe nhạc Lofi 1 lần',
    icon: '☕',
    target: 1,
    points: 20
  },
  {
    id: 'explorer_rooms',
    title: 'Nhà Thám Hiểm FUDA 🗺️',
    desc: 'Khám phá và dịch chuyển qua ít nhất 3 phòng khác nhau',
    icon: '🗺️',
    target: 3,
    points: 25
  },
  {
    id: 'chat_connect',
    title: 'Giao Lưu Kết Nối 💬',
    desc: 'Gửi ít nhất 1 tin nhắn vào kênh chat của phòng',
    icon: '💬',
    target: 1,
    points: 15
  },
  {
    id: 'barista_coffee',
    title: 'Thợ Pha Chế Barista ☕',
    desc: 'Pha thành công 1 ly Cà Phê Muối hoặc Trà Sữa tại Căn Tin & Cafe',
    icon: '☕',
    target: 1,
    points: 25
  }
];

export class QuestManager {
  constructor() {
    this.points = 0;
    this.quests = {};
    this.visitedRooms = new Set();
    this.milestoneClaimed = false;
    this.listeners = [];

    this.loadState();
    this.checkDailyReset();
    // Auto check daily login
    this.incrementProgress('daily_login', 1);
  }

  loadState() {
    try {
      if (typeof localStorage === 'undefined') {
        this.resetDailyQuests(new Date().toDateString());
        return;
      }
      this.points = parseInt(localStorage.getItem('dever_points') || '0', 10);
      const savedDate = localStorage.getItem('dever_quest_date');
      const today = new Date().toDateString();

      if (savedDate === today) {
        const savedQuests = localStorage.getItem('dever_quests_state');
        if (savedQuests) {
          this.quests = JSON.parse(savedQuests);
        }
        this.milestoneClaimed = localStorage.getItem('dever_quest_milestone') === 'true';
      } else {
        this.resetDailyQuests(today);
      }
    } catch (e) {
      this.resetDailyQuests(new Date().toDateString());
    }
  }

  resetDailyQuests(dateStr) {
    this.quests = {};
    DAILY_QUESTS_DEF.forEach(q => {
      this.quests[q.id] = {
        progress: 0,
        completed: false,
        claimed: false
      };
    });
    this.visitedRooms = new Set();
    this.milestoneClaimed = false;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dever_quest_date', dateStr);
      } catch (e) {}
    }
    this.saveState();
  }

  checkDailyReset() {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedDate = localStorage.getItem('dever_quest_date');
      const today = new Date().toDateString();
      if (savedDate !== today) {
        this.resetDailyQuests(today);
      }
    } catch (e) {}
  }

  saveState() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dever_points', this.points.toString());
        localStorage.setItem('dever_quests_state', JSON.stringify(this.quests));
        localStorage.setItem('dever_quest_milestone', this.milestoneClaimed.toString());
      } catch (e) {}
    }
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getState());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  getState() {
    return {
      points: this.points,
      rank: this.getRankInfo(),
      quests: DAILY_QUESTS_DEF.map(def => ({
        ...def,
        progress: this.quests[def.id]?.progress || 0,
        completed: (this.quests[def.id]?.progress || 0) >= def.target,
        claimed: this.quests[def.id]?.claimed || false
      })),
      completedCount: Object.values(this.quests).filter(q => q.completed).length,
      totalCount: DAILY_QUESTS_DEF.length,
      milestoneClaimed: this.milestoneClaimed,
      milestoneReward: 50
    };
  }

  getRankInfo() {
    if (this.points >= 500) return { title: '👑 Huyền Thoại FUDA', color: '#c084fc' };
    if (this.points >= 250) return { title: '⭐ Thợ Săn Code Master', color: '#f26f21' };
    if (this.points >= 100) return { title: '💻 Dev Tinh Anh', color: '#38bdf8' };
    return { title: '🌱 Tân Binh FU-DEVER', color: '#4ade80' };
  }

  incrementProgress(questId, amount = 1) {
    this.checkDailyReset();
    const def = DAILY_QUESTS_DEF.find(q => q.id === questId);
    if (!def) return;

    if (!this.quests[questId]) {
      this.quests[questId] = { progress: 0, completed: false, claimed: false };
    }

    const q = this.quests[questId];
    if (q.completed) return;

    q.progress = Math.min(def.target, q.progress + amount);
    if (q.progress >= def.target && !q.completed) {
      q.completed = true;
      this.showToast(`🎉 Nhiệm vụ hoàn thành: ${def.title}!`);
    }

    this.saveState();
  }

  recordRoomVisit(roomId) {
    if (!roomId) return;
    this.visitedRooms.add(roomId);
    this.incrementProgress('explorer_rooms', this.visitedRooms.size - (this.quests['explorer_rooms']?.progress || 0));
  }

  claimQuestReward(questId) {
    this.checkDailyReset();
    const def = DAILY_QUESTS_DEF.find(q => q.id === questId);
    const q = this.quests[questId];

    if (!def || !q || !q.completed || q.claimed) return false;

    q.claimed = true;
    this.points += def.points;
    audioManager.playVictory();
    this.showToast(`🪙 +${def.points} Dever Points!`);
    this.saveState();
    this.syncPointsToServer();
    return true;
  }

  claimMilestone() {
    const completedCount = Object.values(this.quests).filter(q => q.completed).length;
    if (completedCount < 4 || this.milestoneClaimed) return false;

    this.milestoneClaimed = true;
    this.points += 50;
    audioManager.playVictory();
    this.showToast(`🎁 Nhận thưởng ngày +50 Dever Points!`);
    this.saveState();
    this.syncPointsToServer();
    return true;
  }

  async syncPointsToServer() {
    if (typeof localStorage === 'undefined' || typeof fetch === 'undefined') return;
    try {
      const token = localStorage.getItem('dever_token');
      if (!token) return;

      await fetch('/api/auth/customization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deverPoints: this.points
        })
      });
    } catch (e) {}
  }

  showToast(message) {
    if (typeof document === 'undefined') return;
    const existing = document.querySelector('.quest-toast-banner');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'quest-toast-banner';
    toast.innerHTML = `<span class="toast-icon">✨</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }
}

export const questManager = new QuestManager();
