import { audioManager } from '../utils/AudioManager.js';
import { authService } from '../services/AuthService.js';

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
    this.sessionActive = false;

    // Chỉ đọc snapshot để UI có thể khởi tạo. Không ghi tiến trình trước khi
    // WelcomeGate xác định người chơi hiện tại (guest hay tài khoản).
    this.loadState({ persistReset: false });
  }

  loadState({ persistReset = this.sessionActive } = {}) {
    try {
      if (typeof localStorage === 'undefined') {
        this.resetDailyQuests(new Date().toDateString(), { persist: false });
        return;
      }
      const parsedPoints = parseInt(localStorage.getItem('dever_points') || '0', 10);
      this.points = Number.isFinite(parsedPoints) ? parsedPoints : 0;
      const savedDate = localStorage.getItem('dever_quest_date');
      const today = new Date().toDateString();

      if (savedDate === today) {
        const savedQuests = localStorage.getItem('dever_quests_state');
        if (savedQuests) {
          try {
            this.quests = JSON.parse(savedQuests) || {};
          } catch (e) {
            this.quests = {};
          }
        }
        this.milestoneClaimed = localStorage.getItem('dever_quest_milestone') === 'true';
      } else {
        this.resetDailyQuests(today, { persist: persistReset });
      }

      // Tự động đồng bộ và nạp tất cả nhiệm vụ mới nếu chưa có trong LocalStorage
      DAILY_QUESTS_DEF.forEach(def => {
        if (!this.quests[def.id]) {
          this.quests[def.id] = {
            progress: 0,
            completed: false,
            claimed: false
          };
        }
      });

      const visitedRoomIds = this.quests.explorer_rooms?.visitedRoomIds;
      this.visitedRooms = new Set(Array.isArray(visitedRoomIds) ? visitedRoomIds : []);
    } catch (e) {
      this.resetDailyQuests(new Date().toDateString(), { persist: persistReset });
    }
  }

  startSession({ currentRoomId = null } = {}) {
    this.sessionActive = true;
    this.loadState({ persistReset: false });
    this.checkDailyReset({ persist: false });
    this.incrementProgress('daily_login', 1, { save: false, silent: true });
    this.recordRoomVisit(currentRoomId, { save: false });
    this.saveState();
  }

  resetDailyQuests(dateStr, { persist = this.sessionActive } = {}) {
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
    if (persist && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dever_quest_date', dateStr);
        localStorage.setItem('dever_quest_milestone', 'false');
      } catch (e) {}
    }
    if (persist) this.saveState();
  }

  checkDailyReset({ persist = this.sessionActive } = {}) {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedDate = localStorage.getItem('dever_quest_date');
      const today = new Date().toDateString();
      if (savedDate !== today) {
        this.resetDailyQuests(today, { persist });
      }
    } catch (e) {}
  }

  saveState() {
    if (typeof localStorage === 'undefined') return;
    try {
      if (this.quests.explorer_rooms) {
        this.quests.explorer_rooms.visitedRoomIds = Array.from(this.visitedRooms);
      }
      localStorage.setItem('dever_points', this.points.toString());
      localStorage.setItem('dever_quests_state', JSON.stringify(this.quests));
      localStorage.setItem('dever_quest_milestone', this.milestoneClaimed.toString());
      localStorage.setItem('dever_quest_date', new Date().toDateString());

      // Tự động đồng bộ lên Database máy chủ khi đăng nhập
      if (authService && authService.isLoggedIn()) {
        authService.syncFullProfile({
          deverPoints: this.points,
          questsState: this.quests,
          questDate: localStorage.getItem('dever_quest_date') || new Date().toDateString(),
          questMilestone: this.milestoneClaimed
        });
      }
    } catch (e) {}
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
    const questsList = DAILY_QUESTS_DEF.map(def => {
      const q = this.quests[def.id] || { progress: 0, completed: false, claimed: false };
      const completed = q.progress >= def.target || q.completed;
      return {
        ...def,
        progress: q.progress,
        completed: completed,
        claimed: q.claimed
      };
    });

    const completedCount = questsList.filter(q => q.completed).length;

    return {
      sessionActive: this.sessionActive,
      points: this.points,
      rank: this.getRankInfo(),
      quests: questsList,
      completedCount: completedCount,
      totalCount: DAILY_QUESTS_DEF.length,
      milestoneClaimed: this.milestoneClaimed,
      milestoneReward: 50,
      claimableCount: questsList.filter(q => q.completed && !q.claimed).length,
      nextGoal: this.getNextGoal(questsList, completedCount)
    };
  }

  getNextGoal(questsList = null, completedCount = null) {
    if (!questsList) {
      questsList = DAILY_QUESTS_DEF.map(def => {
        const quest = this.quests[def.id] || { progress: 0, completed: false, claimed: false };
        return {
          ...def,
          progress: quest.progress,
          completed: quest.progress >= def.target || quest.completed,
          claimed: quest.claimed
        };
      });
    }
    const doneCount = completedCount ?? questsList.filter(q => q.completed).length;
    const claimable = questsList.find(q => q.completed && !q.claimed);
    if (claimable) {
      return {
        kind: 'claim',
        questId: claimable.id,
        title: claimable.title,
        description: `Phần thưởng +${claimable.points} điểm đã sẵn sàng.`,
        actionLabel: 'Xem và nhận',
        progress: claimable.target,
        target: claimable.target
      };
    }

    if (doneCount >= 4 && !this.milestoneClaimed) {
      return {
        kind: 'milestone',
        title: 'Rương thưởng ngày',
        description: 'Bạn đã đủ điều kiện nhận thêm 50 điểm.',
        actionLabel: 'Mở rương',
        progress: doneCount,
        target: 4
      };
    }

    const priority = [
      'daily_login',
      'explorer_rooms',
      'chat_connect',
      'focus_lofi_pomo',
      'penalty_goal',
      'basketball_shoot',
      'barista_coffee'
    ];
    const nextQuest = priority
      .map(id => questsList.find(q => q.id === id))
      .find(q => q && !q.completed);

    if (nextQuest) {
      return {
        kind: 'progress',
        questId: nextQuest.id,
        title: nextQuest.title,
        description: nextQuest.desc,
        actionLabel: 'Xem nhiệm vụ',
        progress: nextQuest.progress,
        target: nextQuest.target
      };
    }

    return {
      kind: 'complete',
      title: 'Hoàn tất mục tiêu hôm nay',
      description: 'Tất cả phần thưởng nhiệm vụ đã được nhận.',
      actionLabel: 'Xem thành tích',
      progress: questsList.length,
      target: questsList.length
    };
  }

  getRankInfo() {
    if (this.points >= 500) return { title: '👑 Huyền Thoại FUDA', color: '#c084fc' };
    if (this.points >= 250) return { title: '⭐ Thợ Săn Code Master', color: '#f26f21' };
    if (this.points >= 100) return { title: '💻 Dev Tinh Anh', color: '#38bdf8' };
    return { title: '🌱 Tân Binh FU-DEVER', color: '#4ade80' };
  }

  incrementProgress(questId, amount = 1, { save = true, silent = false } = {}) {
    if (!this.sessionActive) return false;
    this.checkDailyReset();
    const def = DAILY_QUESTS_DEF.find(q => q.id === questId);
    if (!def) return false;

    if (!this.quests[questId]) {
      this.quests[questId] = { progress: 0, completed: false, claimed: false };
    }

    const q = this.quests[questId];
    if (q.completed) return false;

    q.progress = Math.min(def.target, q.progress + amount);
    if (q.progress >= def.target && !q.completed) {
      q.completed = true;
      if (!silent) {
        audioManager.playVictory();
        this.showToast(`Nhiệm vụ hoàn thành: ${def.title}`);
      }
    }

    if (save) this.saveState();
    return true;
  }

  recordRoomVisit(roomId, { save = true } = {}) {
    if (!this.sessionActive || !roomId || this.visitedRooms.has(roomId)) return false;
    this.visitedRooms.add(roomId);
    const currentProgress = this.quests.explorer_rooms?.progress || 0;
    const positiveDelta = Math.max(0, this.visitedRooms.size - currentProgress);
    if (positiveDelta > 0) {
      this.incrementProgress('explorer_rooms', positiveDelta, { save, silent: false });
    } else if (save) {
      this.saveState();
    }
    return true;
  }

  claimQuestReward(questId) {
    this.checkDailyReset();
    const def = DAILY_QUESTS_DEF.find(q => q.id === questId);
    const q = this.quests[questId];

    if (!def || !q || !q.completed || q.claimed) return false;

    q.claimed = true;
    this.points += def.points;
    audioManager.playVictory();
    this.showToast(`+${def.points} Dever Points`);
    this.saveState();
    return true;
  }

  claimMilestone() {
    const completedCount = Object.values(this.quests).filter(q => q.completed).length;
    if (completedCount < 4 || this.milestoneClaimed) return false;

    this.milestoneClaimed = true;
    this.points += 50;
    audioManager.playVictory();
    this.showToast('Mở rương thưởng ngày: +50 Dever Points');
    this.saveState();
    return true;
  }

  addPoints(amount, reason = '') {
    this.points += amount;
    if (reason) {
      this.showToast(`+${amount} Điểm (${reason})`);
    }
    this.saveState();
  }

  showToast(message) {
    if (typeof document === 'undefined') return;
    const toast = document.createElement('div');
    toast.className = 'quest-toast-banner';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  async syncPointsToServer() {
    if (!authService?.isLoggedIn()) return null;
    return authService.syncFullProfile({ deverPoints: this.points });
  }
}

export const questManager = new QuestManager();
