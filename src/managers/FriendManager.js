/**
 * FriendManager: Quản lý danh sách bạn bè, thời gian kết bạn, chuỗi Bestie Streak và thú cưng Buggy đồng hành
 * Tích hợp lưu trữ Local-First bền vững & tự động đồng bộ tài khoản thành viên
 */
import { authService } from '../services/AuthService.js';
import { questManager } from './QuestManager.js';

class FriendManager {
  constructor() {
    this.friends = new Map(); // key: friendId, value: FriendData
    this.pendingRequests = new Set(); // key: friendId or name
    this.listeners = new Set();
    this.loadState();
  }

  isPending(idOrName) {
    if (!idOrName) return false;
    return this.pendingRequests.has(idOrName);
  }

  setPending(idOrName) {
    if (!idOrName) return;
    this.pendingRequests.add(idOrName);
    this.notifyListeners();
  }

  clearPending(idOrName) {
    if (!idOrName) return;
    this.pendingRequests.delete(idOrName);
    this.notifyListeners();
  }

  loadState() {
    try {
      const stored = localStorage.getItem('dever_friends_data');
      if (stored) {
        const list = JSON.parse(stored);
        this.friends.clear();
        if (Array.isArray(list)) {
          list.forEach(f => {
            if (f && (f.id || f.name)) {
              this.friends.set(f.id || f.name, f);
            }
          });
        }
      }
    } catch (e) {
      console.warn('⚠️ [FriendManager] Lỗi đọc dữ liệu bạn bè:', e);
      this.friends.clear();
    }
  }

  saveState() {
    try {
      const list = Array.from(this.friends.values());
      localStorage.setItem('dever_friends_data', JSON.stringify(list));

      // Đồng bộ ngầm lên server nếu đã đăng nhập
      if (authService.isLoggedIn()) {
        authService.syncFullProfile({ friendsData: list });
      }

      this.notifyListeners();
    } catch (e) {
      console.warn('⚠️ [FriendManager] Lỗi lưu dữ liệu bạn bè:', e);
    }
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
      listener(this.getFriends());
      return () => this.listeners.delete(listener);
    }
    return () => {};
  }

  notifyListeners() {
    const list = this.getFriends();
    this.listeners.forEach(fn => {
      try { fn(list); } catch (err) { console.warn(err); }
    });
  }

  getFriends() {
    return Array.from(this.friends.values());
  }

  getFriend(identifier) {
    if (!identifier) return null;
    if (this.friends.has(identifier)) return this.friends.get(identifier);
    for (const f of this.friends.values()) {
      if (f.name && f.name.toLowerCase() === identifier.toLowerCase()) {
        return f;
      }
    }
    return null;
  }

  isFriend(identifier) {
    return !!this.getFriend(identifier);
  }

  /**
   * Thêm bạn mới kèm mốc thời gian friendedAt
   */
  addFriend(playerData) {
    if (!playerData || !playerData.name) return null;

    const id = playerData.id || playerData.userId || `friend_${Date.now()}`;
    const today = this.getTodayDateString();

    const newFriend = {
      id,
      userId: playerData.userId || null,
      name: playerData.name,
      avatarId: playerData.avatarId || 'dev_hoodie',
      role: playerData.role || 'dev',
      equippedItemId: playerData.equippedItemId || null,
      friendedAt: Date.now(),
      streak: 1,
      lastStreakDate: today,
      petLevel: 1
    };

    this.friends.set(id, newFriend);
    this.saveState();

    // Cập nhật nhiệm vụ và thành tựu
    questManager.incrementProgress('chat_connect', 1);
    const count = this.friends.size;
    if (count >= 3) {
      window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('metaverse_friends_3');
    }

    return newFriend;
  }

  /**
   * Hủy kết bạn
   */
  removeFriend(identifier) {
    const friend = this.getFriend(identifier);
    if (friend) {
      this.friends.delete(friend.id);
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Tương tác duy trì chuỗi Streak (như TikTok / Snapchat)
   * Tự động cộng chuỗi ngày nếu nhắn tin / tương tác hàng ngày
   */
  recordInteraction(identifier) {
    const friend = this.getFriend(identifier);
    if (!friend) return null;

    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();
    const lastDate = friend.lastStreakDate || '';

    let streakIncreased = false;

    if (lastDate === yesterday) {
      // Hôm qua có nhắn, hôm nay tiếp tục -> Tăng streak
      friend.streak = (friend.streak || 1) + 1;
      friend.lastStreakDate = today;
      streakIncreased = true;
    } else if (lastDate === today) {
      // Hôm nay đã tương tác rồi -> giữ nguyên streak
    } else {
      // Bị đứt chuỗi quá 1 ngày -> Khởi tạo lại chuỗi 1 ngày
      friend.streak = 1;
      friend.lastStreakDate = today;
      streakIncreased = true;
    }

    // Cập nhật cấp bậc Thú Cưng Pet Chibi theo Streak
    friend.petLevel = this.calculatePetLevel(friend.streak);

    this.saveState();

    // Kích hoạt nhiệm vụ ngày & Thành tựu
    questManager.incrementProgress('bestie_streak', 1);
    if (friend.streak >= 3) {
      window.__DEVER_GAME__?.scene?.keys?.WorldScene?.achievementManager?.unlock('bestie_streak_3');
    }

    return {
      friend,
      streakIncreased,
      currentStreak: friend.streak,
      petInfo: this.getPetInfo(friend.streak)
    };
  }

  calculatePetLevel(streak = 1) {
    if (streak >= 14) return 4;
    if (streak >= 7) return 3;
    if (streak >= 3) return 2;
    return 1;
  }

  /**
   * Lấy thông tin Thú Cưng / Linh Vật Pet đồng hành
   */
  getPetInfo(streak = 1) {
    if (streak >= 14) {
      return {
        level: 4,
        icon: '👑',
        name: 'Buggy Hoàng Gia Cầm Cúp',
        badge: 'Cấp Tối Thượng (14+ ngày)',
        desc: 'Đôi Bạn Tri Kỷ Metaverse! Buggy tỏa sáng rực rỡ với vương miện và cúp vô địch.',
        nextStreakNeeded: null
      };
    }
    if (streak >= 7) {
      return {
        level: 3,
        icon: '⚡',
        name: 'Buggy Kỹ Sư Siêu Cấp',
        badge: 'Cấp 3 (7+ ngày)',
        desc: 'Buggy đeo kính tri thức, hỗ trợ fix bug và tăng điểm nhiệm vụ tình bạn!',
        nextStreakNeeded: 14 - streak
      };
    }
    if (streak >= 3) {
      return {
        level: 2,
        icon: '🐞',
        name: 'Buggy Chibi Đồng Hành',
        badge: 'Cấp 2 (3+ ngày)',
        desc: 'Trứng đã nở! Bé Buggy nhỏ nhắn tinh nghịch chạy lon ton theo bước chân hai bạn.',
        nextStreakNeeded: 7 - streak
      };
    }
    return {
      level: 1,
      icon: '🥚',
      name: 'Trứng Buggy Ấp Ủ',
      badge: 'Cấp 1 (Ấp trứng)',
      desc: 'Hãy nhắn tin tương tác cùng bạn bè liên tiếp 3 ngày để ấp trứng nở ra Buggy Chibi!',
      nextStreakNeeded: 3 - streak
    };
  }

  /**
   * Tìm thú cưng cấp cao nhất từ danh sách bạn bè để hiển thị Pet Follower trong game
   */
  getHighestStreakPet() {
    let maxStreak = 0;
    for (const f of this.friends.values()) {
      if ((f.streak || 0) > maxStreak) {
        maxStreak = f.streak;
      }
    }
    if (maxStreak < 3) return null; // Chưa nở trứng
    return this.getPetInfo(maxStreak);
  }

  /**
   * Hiển thị thời gian đã kết bạn được bao lâu
   */
  getFriendshipDurationText(friend) {
    if (!friend || !friend.friendedAt) return 'Bạn mới quen';

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor((Date.now() - friend.friendedAt) / msPerDay);
    const dateStr = new Date(friend.friendedAt).toLocaleDateString('vi-VN');

    if (diffDays <= 0) {
      return `Vừa trở thành bạn bè hôm nay 💕 (Từ ${dateStr})`;
    }
    return `Đã là bạn bè được ${diffDays} ngày 🤝 (Từ ${dateStr})`;
  }

  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getYesterdayDateString() {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export const friendManager = new FriendManager();
