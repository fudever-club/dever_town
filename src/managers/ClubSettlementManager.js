/**
 * DEVER TOWN - CLUB SETTLEMENT MANAGER (HỆ THỐNG ĐỊNH CƯ CLB DELVERIUM)
 * Quản lý việc chiêu mộ và định cư NPC/sinh viên tài năng về 25 CLB FPTU:
 * 1. Phân bổ nhân vật về đúng sở trường CLB (Affinity matching).
 * 2. Tích lũy Danh vọng CLB (Club Reputation) và cấp độ Booth (Club Level).
 * 3. Sinh sản lượng D-Coin thụ động theo thời gian thực (Passive D-Coin Yield).
 * 4. Thu hoạch D-Coin tập trung (Claim Passive Income).
 */

import { FPTU_CLUBS } from '../config/fptuClubs.js';
import { audioManager } from '../utils/AudioManager.js';

const STORAGE_KEY = 'dever_club_settlements';
const MAX_MEMBERS_PER_CLUB = 3;

// Danh sách các NPC tài năng có thể chiêu mộ và định cư
export const TALENT_ROSTER_DEF = [
  {
    id: 'coder_cuong',
    name: 'Trần Quốc Cường',
    role: 'Fullstack Builder',
    title: 'Junior React / Node Coder',
    avatarKey: 'char_dev_gen10',
    affinities: ['itsc', 'src', 'fudever'],
    desc: 'Lập trình viên nhiệt huyết, đam mê cấu trúc dữ liệu và web realtime.',
    baseYieldPerMin: 0.5
  },
  {
    id: 'hacker_my',
    name: 'Hoàng Thảo My',
    role: 'Cyber Specialist',
    title: 'White-Hat CTF Hunter',
    avatarKey: 'char_cyber_pro',
    affinities: ['src', 'itsc'],
    desc: 'Chuyên gia bảo mật mạng, săn tìm lỗ hổng và rà soát firewall.',
    baseYieldPerMin: 0.6
  },
  {
    id: 'dancer_khoi',
    name: 'Đỗ Nguyên Khởi',
    role: 'Lead Performer',
    title: 'Vũ Công Street-Dance',
    avatarKey: 'char_biker_pro',
    affinities: ['fstyle', 'fuda_music'],
    desc: 'Nghệ sĩ nhảy đường phố với vũ đạo bùng nổ, khuấy động các đêm nhạc.',
    baseYieldPerMin: 0.5
  },
  {
    id: 'vovinam_bao',
    name: 'Võ Sĩ Gia Bảo',
    role: 'Martial Master',
    title: 'Hoàng Đai Vovinam FPTU',
    avatarKey: 'char_vovinam_pro',
    affinities: ['vovinam', 'sports'],
    desc: 'Võ sinh tinh thần thượng võ, rèn luyện thể chất và kỷ luật thép.',
    baseYieldPerMin: 0.5
  },
  {
    id: 'barista_nga',
    name: 'Nguyễn Quỳnh Nga',
    role: 'Barista Expert',
    title: 'Nghệ Nhân Cà Phê Muối',
    avatarKey: 'char_barista_pro',
    affinities: ['canteen', 'event', 'dever_lab'],
    desc: 'Bậc thầy pha chế cà phê muối béo ngậy và trà ủ lạnh thơm nồng.',
    baseYieldPerMin: 0.5
  },
  {
    id: 'artist_linh',
    name: 'Phạm Diệu Linh',
    role: 'Creative Artist',
    title: 'UI/UX & Pixel Concept Artist',
    avatarKey: 'char_aodai_pro',
    affinities: ['fudever', 'itsc', 'web_room'],
    desc: 'Nhà thiết kế giao diện tinh tế, thổi hồn vào các sản phẩm số.',
    baseYieldPerMin: 0.6
  },
  {
    id: 'mascot_froggy',
    name: 'Cóc Vàng FPTU',
    role: 'Campus Lucky Charm',
    title: 'Linh Vật May Mắn FPTU',
    avatarKey: 'char_frog_pro',
    affinities: ['fudever', 'itsc', 'src', 'vovinam'],
    desc: 'Biểu tượng linh vật may mắn mang đến điểm A+ và năng lượng tích cực.',
    baseYieldPerMin: 0.8
  },
  {
    id: 'mascot_buggy',
    name: 'Bọ Cam Buggy Pro',
    role: 'Club Ambassador',
    title: 'Linh Vật Chính Thức FU-DEVER',
    avatarKey: 'char_buggy_pro',
    affinities: ['fudever', 'itsc'],
    desc: 'Chú bọ thông minh diệt sạch bug phần mềm và lan tỏa tình yêu code.',
    baseYieldPerMin: 0.8
  }
];

export class ClubSettlementManager {
  constructor() {
    this.settlements = {}; // { [clubId]: { memberIds: [], reputation: 0, level: 1 } }
    this.availableTalents = []; // [talentId]
    this.lastClaimTimestamp = Date.now();
    this.cachedPoints = 0;

    this.loadState();
  }

  loadState() {
    try {
      if (typeof localStorage === 'undefined') {
        this.settlements = {};
        this.availableTalents = ['coder_cuong', 'artist_linh', 'barista_nga'];
        this.lastClaimTimestamp = Date.now();
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settlements = parsed.settlements || {};
        this.availableTalents = parsed.availableTalents || [];
        this.lastClaimTimestamp = parsed.lastClaimTimestamp || Date.now();
      } else {
        // Khởi tạo mặc định: người chơi có sẵn 3 tài năng đầu tiên để trải nghiệm
        this.settlements = {};
        this.availableTalents = ['coder_cuong', 'artist_linh', 'barista_nga'];
        this.lastClaimTimestamp = Date.now();
        this.saveState();
      }
    } catch (e) {
      console.warn('Lỗi tải dữ liệu ClubSettlementManager:', e);
      this.settlements = {};
      this.availableTalents = ['coder_cuong', 'artist_linh'];
      this.lastClaimTimestamp = Date.now();
    }
  }

  saveState() {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        settlements: this.settlements,
        availableTalents: this.availableTalents,
        lastClaimTimestamp: this.lastClaimTimestamp
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Lỗi lưu ClubSettlementManager:', e);
    }
  }

  /**
   * Lấy thông tin định cư của một CLB
   * @param {string} clubId
   */
  getClubSettlement(clubId) {
    if (!this.settlements[clubId]) {
      this.settlements[clubId] = {
        memberIds: [],
        reputation: 0,
        level: 1
      };
    }
    const data = this.settlements[clubId];
    const members = (data.memberIds || [])
      .map(id => TALENT_ROSTER_DEF.find(t => t.id === id))
      .filter(Boolean);

    return {
      clubId,
      members,
      reputation: data.reputation || 0,
      level: this.computeLevel(data.reputation || 0),
      maxSlots: MAX_MEMBERS_PER_CLUB,
      yieldPerMin: this.computeClubYield(clubId, members, data.reputation || 0)
    };
  }

  computeLevel(reputation) {
    if (reputation >= 500) return 3; // Huyền Thoại
    if (reputation >= 200) return 2; // Tinh Hoa
    return 1; // Khởi Sắc
  }

  computeClubYield(clubId, members, reputation) {
    let rate = 0;
    const level = this.computeLevel(reputation);
    const levelMultiplier = level === 3 ? 1.5 : (level === 2 ? 1.25 : 1.0);

    members.forEach(m => {
      let mRate = m.baseYieldPerMin || 0.5;
      if (m.affinities && m.affinities.includes(clubId)) {
        mRate *= 2.0; // Đúng chuyên môn: x2 sản lượng D-Coin
      }
      rate += mRate;
    });

    return rate * levelMultiplier;
  }

  /**
   * Định cư một nhân vật vào CLB
   * @param {string} talentId
   * @param {string} clubId
   */
  stationTalent(talentId, clubId) {
    const talentIndex = this.availableTalents.indexOf(talentId);
    if (talentIndex === -1) {
      return { success: false, message: 'Nhân vật không có sẵn trong danh sách chờ.' };
    }

    if (!this.settlements[clubId]) {
      this.settlements[clubId] = { memberIds: [], reputation: 0, level: 1 };
    }

    const clubData = this.settlements[clubId];
    if (clubData.memberIds.length >= MAX_MEMBERS_PER_CLUB) {
      return { success: false, message: `Gian hàng CLB đã đầy (${MAX_MEMBERS_PER_CLUB}/${MAX_MEMBERS_PER_CLUB} thành viên).` };
    }

    // Rút khỏi danh sách chờ và đưa vào CLB
    this.availableTalents.splice(talentIndex, 1);
    clubData.memberIds.push(talentId);

    // Tính điểm danh vọng
    const talentDef = TALENT_ROSTER_DEF.find(t => t.id === talentId);
    const isAffinity = talentDef?.affinities?.includes(clubId);
    const repGain = isAffinity ? 150 : 100;
    clubData.reputation = (clubData.reputation || 0) + repGain;
    clubData.level = this.computeLevel(clubData.reputation);

    this.saveState();

    if (audioManager) {
      audioManager.playSuccess?.();
    }

    return {
      success: true,
      message: `Đã định cư ${talentDef?.name} về CLB thành công! (+${repGain} Danh Vọng)`,
      isAffinity,
      repGain
    };
  }

  /**
   * Rút nhân vật khỏi CLB về danh sách chờ
   * @param {string} talentId
   * @param {string} clubId
   */
  unstationTalent(talentId, clubId) {
    const clubData = this.settlements[clubId];
    if (!clubData) return { success: false, message: 'CLB chưa có dữ liệu định cư.' };

    const idx = clubData.memberIds.indexOf(talentId);
    if (idx === -1) return { success: false, message: 'Thành viên không thuộc CLB này.' };

    clubData.memberIds.splice(idx, 1);
    if (!this.availableTalents.includes(talentId)) {
      this.availableTalents.push(talentId);
    }

    this.saveState();
    return { success: true, message: 'Đã rút thành viên về danh sách chiêu mộ.' };
  }

  /**
   * Giải cứu hoặc mở khóa một tài năng mới (ví dụ từ Bug Dungeon)
   * @param {string} talentId
   */
  unlockTalent(talentId) {
    const talent = TALENT_ROSTER_DEF.find(t => t.id === talentId);
    if (!talent) return false;

    // Kiểm tra xem đã định cư ở CLB nào chưa
    for (const cId in this.settlements) {
      if (this.settlements[cId].memberIds?.includes(talentId)) {
        return false; // Đã sở hữu
      }
    }

    if (!this.availableTalents.includes(talentId)) {
      this.availableTalents.push(talentId);
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Lấy danh sách các tài năng đang chờ định cư
   */
  getAvailableTalents() {
    return this.availableTalents
      .map(id => TALENT_ROSTER_DEF.find(t => t.id === id))
      .filter(Boolean);
  }

  /**
   * Tổng sản lượng D-Coin / phút của toàn bộ thế giới ảo
   */
  getTotalYieldPerMinute() {
    let total = 0;
    for (const clubId in this.settlements) {
      const data = this.settlements[clubId];
      if (data && data.memberIds?.length > 0) {
        const members = data.memberIds
          .map(id => TALENT_ROSTER_DEF.find(t => t.id === id))
          .filter(Boolean);
        total += this.computeClubYield(clubId, members, data.reputation || 0);
      }
    }
    return total;
  }

  /**
   * Tính toán lượng D-Coin thụ động tích lũy từ lần claim trước
   */
  getAccumulatedCoins() {
    const elapsedMs = Math.max(0, Date.now() - this.lastClaimTimestamp);
    const elapsedMinutes = elapsedMs / 60000;
    const ratePerMin = this.getTotalYieldPerMinute();
    return Math.floor(elapsedMinutes * ratePerMin);
  }

  /**
   * Thu hoạch toàn bộ D-Coin thụ động
   */
  claimPassiveCoins() {
    const amount = this.getAccumulatedCoins();
    if (amount <= 0) {
      return { success: false, amount: 0, message: 'Chưa có D-Coin tích lũy để thu hoạch.' };
    }

    this.lastClaimTimestamp = Date.now();
    this.saveState();

    // Thưởng trực tiếp vào số dư ví của người chơi
    try {
      const currentPts = parseInt(localStorage.getItem('dever_points') || '1250', 10);
      const newPts = currentPts + amount;
      localStorage.setItem('dever_points', newPts.toString());

      const coinEl = document.getElementById('wardrobe-dcoins-val');
      if (coinEl) coinEl.textContent = newPts.toLocaleString('vi-VN');

      if (audioManager) {
        audioManager.playCoinDrop?.();
      }

      return {
        success: true,
        amount,
        newBalance: newPts,
        message: `Thu hoạch thành công +${amount.toLocaleString('vi-VN')} D-Coin thụ động!`
      };
    } catch (e) {
      console.warn('Lỗi khi ghi nhận D-Coin:', e);
      return { success: true, amount, message: `Thu hoạch thành công +${amount} D-Coin.` };
    }
  }
}

export const clubSettlementManager = new ClubSettlementManager();
