import { audioManager } from '../utils/AudioManager.js';
import { questManager } from './QuestManager.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';
import { toastManager } from '../ui/common/ToastManager.js';

export const ACHIEVEMENTS_DEFINITIONS = {
  first_arrival: {
    id: 'first_arrival',
    title: 'Tân Thủ DEVER',
    desc: 'Đặt chân vào Sảnh Alpha lần đầu tiên và bắt đầu hành trình',
    icon: '🌟',
    rewardPoints: 20
  },
  speed_coder: {
    id: 'speed_coder',
    title: 'Coder Thần Tốc',
    desc: 'Đạt điểm tuyệt đối 10/10 trong thử thách Đấu Trí Lập Trình',
    icon: '⚡',
    rewardPoints: 50
  },
  coffee_salt: {
    id: 'coffee_salt',
    title: 'Cà Phê Muối Đà Nẵng',
    desc: 'Thưởng thức âm nhạc Lo-Fi thư giãn tại Căn Tin & Cafe',
    icon: '☕',
    rewardPoints: 25
  },
  golden_frog: {
    id: 'golden_frog',
    title: 'Lộc Cóc Vàng',
    desc: 'Rút quẻ bói may mắn từ Linh Vật Cóc Vàng FUDA',
    icon: '🐸',
    rewardPoints: 30
  },
  striker: {
    id: 'striker',
    title: 'Tiền Đạo FUDA',
    desc: 'Sút thành công 3 quả phạt đền liên tiếp tại Sân bóng',
    icon: '⚽',
    rewardPoints: 35
  },
  tech_pro: {
    id: 'tech_pro',
    title: 'Tín Đồ Công Nghệ',
    desc: 'Trang bị MacBook Pro M3 hoặc Bàn Phím Cơ trên tay',
    icon: '🎒',
    rewardPoints: 25
  },
  stage_dancer: {
    id: 'stage_dancer',
    title: 'Vũ Công Sàn Diễn',
    desc: 'Thực hiện điệu nhảy sôi động cùng các thành viên CLB',
    icon: '🕺',
    rewardPoints: 25
  },
  campus_scholar: {
    id: 'campus_scholar',
    title: 'Sinh Viên Gương Mẫu',
    desc: 'Khám phá Bản Đồ Campus hoặc Cổng Học Vụ & Phần Mềm Thi FPTU',
    icon: '🏛️',
    rewardPoints: 25
  },
  bestie_streak_3: {
    id: 'bestie_streak_3',
    title: 'Lửa Tình Bạn 🔥',
    desc: 'Đạt chuỗi Streak 3 ngày liên tiếp với bạn bè và ấp nở thú cưng',
    icon: '🔥',
    rewardPoints: 40
  },
  metaverse_friends_3: {
    id: 'metaverse_friends_3',
    title: 'Cộng Đồng Gắn Kết 🤝',
    desc: 'Kết bạn với ít nhất 3 thành viên trong DEVER TOWN',
    icon: '🤝',
    rewardPoints: 35
  }
};

/**
 * AchievementManager: Quản lý Hệ Thống Danh Hiệu & Kỷ Lục DEVER
 * Lưu trữ bền vững trong localStorage, tự động hiển thị Golden Banner và phát Fanfare ăn mừng
 */
export class AchievementManager {
  /**
   * @param {Object} options
   * @param {Phaser.Scene} options.scene
   * @param {import('./JuiceManager.js').JuiceManager} options.juiceManager
   */
  constructor({ scene, juiceManager } = {}) {
    this.scene = scene;
    this.juiceManager = juiceManager;
    this.unlockedIds = new Set();
    this.container = null;

    this.loadState();
    this.initDOM();
  }

  loadState() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('dever_unlocked_achievements');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.unlockedIds = new Set(parsed);
        }
      }
    } catch (e) {
      console.warn('Lỗi nạp danh hiệu:', e);
    }
  }

  saveState() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('dever_unlocked_achievements', JSON.stringify(Array.from(this.unlockedIds)));
    } catch (e) {
      console.warn('Lỗi lưu danh hiệu:', e);
    }
  }

  initDOM() {
    // Toasts are rendered by the global ToastManager queue now
    // (max 2 visible, FIFO) — no dedicated container needed.
    if (typeof document === 'undefined') return;
    this.container = null;
  }

  /**
   * Mở khóa một thành tựu
   * @param {string} achievementId
   * @returns {boolean} True nếu thành tựu vừa được mở khóa mới
   */
  unlock(achievementId) {
    if (!ACHIEVEMENTS_DEFINITIONS[achievementId]) return false;
    if (this.unlockedIds.has(achievementId)) return false;

    this.unlockedIds.add(achievementId);
    this.saveState();

    const ach = ACHIEVEMENTS_DEFINITIONS[achievementId];

    // Phát âm thanh Fanfare
    audioManager.playAchievementFanfare();

    // Bắn pháo hoa Confetti tại vị trí nhân vật nếu có scene
    if (this.scene && this.scene.player && this.juiceManager) {
      this.juiceManager.celebrationConfetti(this.scene.player.x, this.scene.player.y, 42);
      this.juiceManager.showFloatingText(
        this.scene.player.x,
        this.scene.player.y,
        `🏆 ${ach.title} (+${ach.rewardPoints} ĐIỂM)`,
        { color: '#facc15', fontSize: '14px', strokeColor: '#78350f', strokeThickness: 4 }
      );
    }

    // Tặng điểm thưởng vào Header
    this.awardPoints(ach.rewardPoints);

    // Hiển thị Golden Banner Toast
    this.showBanner(achievementId, ach);

    return true;
  }

  awardPoints(points) {
    questManager.addPoints(points);
    if (this.juiceManager) {
      this.juiceManager.pulseDOM('#header-quests-btn');
    }
  }

  showBanner(achievementId, ach) {
    // Routed through the global ToastManager queue (max 2 visible, FIFO).
    // Keeps the .achievement-toast-banner class so existing styles/tests apply.
    // Note: ach.icon may be an emoji badge (game content, allowed); the tag and
    // titles stay text-only per the no-emoji-in-toasts rule.
    const badgeURL = TextureGenerator.getBadgeIconURL(this.scene, achievementId);
    // Build icon HTML only when there's real content — an empty icon box
    // looks broken (reported 2026-10-09). ToastManager hides the icon div
    // when iconHTML is empty.
    let iconHTML = '';
    if (badgeURL) {
      iconHTML = `<img src="${badgeURL}" alt="" width="40" height="40" style="image-rendering: pixelated;" />`;
    } else if (ach.icon && ach.icon.trim()) {
      iconHTML = `<span class="achievement-toast-emoji">${ach.icon}</span>`;
    }
    toastManager.achievementToast({
      iconHTML,
      title: ach.title,
      desc: ach.desc,
      rewardHTML: `<span>+${ach.rewardPoints}</span><small>ĐIỂM</small>`,
    });
  }

  isUnlocked(achievementId) {
    return this.unlockedIds.has(achievementId);
  }

  getAll() {
    return Object.values(ACHIEVEMENTS_DEFINITIONS).map(ach => ({
      ...ach,
      isUnlocked: this.unlockedIds.has(ach.id)
    }));
  }
}
