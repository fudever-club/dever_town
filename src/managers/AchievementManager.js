import { audioManager } from '../utils/AudioManager.js';

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
    if (typeof document === 'undefined') return;
    let toastContainer = document.getElementById('achievement-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'achievement-toast-container';
      toastContainer.className = 'achievement-toast-container';
      document.body.appendChild(toastContainer);
    }
    this.container = toastContainer;
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
    this.showBanner(ach);

    return true;
  }

  awardPoints(points) {
    if (typeof document === 'undefined') return;
    const ptsDisplay = document.getElementById('header-points-display');
    if (ptsDisplay) {
      const current = parseInt(ptsDisplay.textContent || '0', 10) || 0;
      const updated = current + points;
      ptsDisplay.textContent = updated;

      if (this.juiceManager) {
        this.juiceManager.pulseDOM('#header-quests-btn');
      }
    }
  }

  showBanner(ach) {
    if (!this.container) return;

    const banner = document.createElement('div');
    banner.className = 'achievement-toast-banner';
    banner.innerHTML = `
      <div class="achievement-toast-icon">${ach.icon}</div>
      <div class="achievement-toast-content">
        <span class="achievement-toast-tag">DANH HIỆU MỚI MỞ KHÓA</span>
        <h4 class="achievement-toast-title">${ach.title}</h4>
        <p class="achievement-toast-desc">${ach.desc}</p>
      </div>
      <div class="achievement-toast-reward">
        <span>+${ach.rewardPoints}</span>
        <small>ĐIỂM</small>
      </div>
    `;

    this.container.appendChild(banner);

    // Tự động xóa sau 5.2s
    setTimeout(() => {
      banner.classList.add('hide');
      setTimeout(() => {
        if (banner.parentElement) {
          banner.parentElement.removeChild(banner);
        }
      }, 400);
    }, 5200);
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
