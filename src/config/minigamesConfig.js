/**
 * DEVER TOWN - MINIGAMES BALANCING & PHYSICS CONFIGURATION
 * Tài liệu tham chiếu: Notion Superpowers Framework & Clean Architecture
 * Toàn bộ hằng số vật lý, điểm số, thông số cân bằng, công thức pha chế
 * và danh mục vật phẩm được tách biệt hoàn toàn khỏi logic render và game loops.
 */

// ==========================================
// 1. ⚽ FOOTBALL CONFIGURATION
// ==========================================
export const FOOTBALL_CONFIG = {
  canvas: { width: 640, height: 360 },
  pitch: {
    topY: 85,
    groundY: 175,
    goalLeft: 190,
    goalRight: 450,
    crossbarY: 90,
    penaltySpotX: 320,
    penaltySpotY: 305
  },
  ball: {
    radius: 7.5,
    curveFactor: 0.0018,
    spinDrag: 0.985,
    speed: 3.2
  },
  wall: {
    enabledAfterStreak: 2,
    count: 3,
    x: 320,
    y: 220,
    playerWidth: 16,
    playerHeight: 38,
    jumpMax: 26,
    jumpSpeed: 5.5
  },
  goalkeeper: {
    startX: 320,
    startY: 155,
    width: 26,
    height: 36,
    reachRadius: 46,
    reactionDelayMs: 130,
    diveLerpSpeed: 2.6
  },
  scoring: {
    goal: 100,
    swishTopCorner: 180,
    savePenalty: 120,
    streakBonus: 40
  },
  bullseyes: [
    { x: 215, y: 108, r: 14, pts: 150, name: 'Góc Chữ A Trái' },
    { x: 425, y: 108, r: 14, pts: 150, name: 'Góc Chữ A Phải' },
    { x: 320, y: 100, r: 12, pts: 120, name: 'Xà Ngang Tâm' }
  ]
};

// ==========================================
// 2. 🏀 BASKETBALL CONFIGURATION
// ==========================================
export const BASKETBALL_CONFIG = {
  canvas: { width: 640, height: 360 },
  physics: {
    gravity: 0.36,
    airResistance: 0.992,
    restitutionFloor: 0.62,
    restitutionBackboard: 0.68,
    restitutionRim: 0.54
  },
  backboard: {
    x: 510,
    y: 75,
    width: 10,
    height: 90,
    color: 'rgba(255, 255, 255, 0.85)'
  },
  rim: {
    x: 445,
    y: 138,
    width: 60,
    height: 10,
    pegRadius: 4.5,
    netDepth: 34
  },
  ball: {
    radius: 12,
    startX: 110,
    startY: 220,
    color: '#ea580c'
  },
  scoring: {
    normalBasket: 2,
    swishBonus: 3,
    onFireThreshold: 3,
    onFireMultiplier: 2
  },
  movingHoop: {
    startScore: 8,
    speedY: 1.4,
    minY: 60,
    maxY: 160
  }
};

// ==========================================
// 3. 🏐 VOLLEYBALL CONFIGURATION
// ==========================================
export const VOLLEYBALL_CONFIG = {
  canvas: { width: 640, height: 360 },
  floorY: 285,
  gravity: 0.33,
  net: {
    x: 320,
    y: 185,
    width: 12,
    height: 100
  },
  player: {
    startX: 120,
    moveSpeed: 3.8,
    jumpPower: -8.4,
    spikePower: -10.2,
    headRadius: 15
  },
  botTiers: {
    easy: {
      moveSpeed: 2.8,
      canSpike: false,
      canBlock: false,
      reactionMs: 220
    },
    medium: {
      moveSpeed: 3.4,
      canSpike: true,
      canBlock: false,
      reactionMs: 150
    },
    pro: {
      moveSpeed: 4.1,
      canSpike: true,
      canBlock: true,
      reactionMs: 90,
      spikeProbability: 0.7
    }
  },
  ball: {
    radius: 11,
    restitution: 0.86,
    spikeSpeedMultiplier: 2.2
  }
};

// ==========================================
// 4. ☕ BARISTA FPTU SIMULATOR CONFIGURATION
// ==========================================
export const BARISTA_CONFIG = {
  canvas: { width: 640, height: 360 },
  drinks: {
    cafe_muoi: {
      id: 'cafe_muoi',
      name: 'Cà Phê Muối Đà Nẵng',
      dialogue: '1 ly Cà Phê Muối đậm đặc x2 espresso, nhiều kem béo muối hồng để fix bug xuyên đêm!',
      customer: 'Dev IT FPTU',
      avatarColor: '#38bdf8',
      patienceSec: 45,
      targetIce: 3,
      layers: [
        { name: 'Sữa Đặc', color: '#fef08a', targetPct: 20 },
        { name: 'Cốt Cà Phê Phin', color: '#451a03', targetPct: 50 },
        { name: 'Kem Béo Muối Hồng', color: '#fdf2f8', targetPct: 30 }
      ],
      topping: 'Bột Cacao Mịn',
      tipBase: 150
    },
    bac_xiu: {
      id: 'bac_xiu',
      name: 'Bạc Xỉu 3 Tầng Sài Gòn',
      dialogue: '1 ly Bạc Xỉu 3 tầng bồng bềnh, ngọt ngào khởi động ngày mới năng động!',
      customer: 'Nữ Sinh Kinh Tế',
      avatarColor: '#f472b6',
      patienceSec: 40,
      targetIce: 3,
      layers: [
        { name: 'Sữa Đặc', color: '#fef08a', targetPct: 25 },
        { name: 'Sữa Tươi Thanh Trùng', color: '#f8fafc', targetPct: 45 },
        { name: 'Bọt Cafe Bồng Bềnh', color: '#78350f', targetPct: 30 }
      ],
      topping: 'Không Topping',
      tipBase: 130
    },
    tra_dao_cam_sa: {
      id: 'tra_dao_cam_sa',
      name: 'Trà Đào Cam Sả Mát Lạnh',
      dialogue: '1 ly Trà Đào Cam Sả thanh mát, chuẩn bị năng lượng pitching dự án khởi nghiệp!',
      customer: 'Founder Sinh Viên',
      avatarColor: '#fbbf24',
      patienceSec: 38,
      targetIce: 4,
      layers: [
        { name: 'Siro Đào Vàng', color: '#fb923c', targetPct: 25 },
        { name: 'Cốt Trà Đen Cam Sả', color: '#b45309', targetPct: 65 },
        { name: 'Lớp Nước Tươi', color: '#fdba74', targetPct: 10 }
      ],
      topping: 'Lát Đào Tươi',
      tipBase: 140
    },
    tra_sua_oolong: {
      id: 'tra_sua_oolong',
      name: 'Trà Sữa Oolong Nướng',
      dialogue: '1 ly Trà Sữa Oolong trân châu hoàng kim béo ngậy cho cả nhóm chạy deadline!',
      customer: 'Lead Design DEVER',
      avatarColor: '#a78bfa',
      patienceSec: 50,
      targetIce: 3,
      layers: [
        { name: 'Trân Châu Hoàng Kim', color: '#78350f', targetPct: 25 },
        { name: 'Trà Sữa Oolong', color: '#d97706', targetPct: 55 },
        { name: 'Váng Sữa Macchiato', color: '#fffbeb', targetPct: 20 }
      ],
      topping: 'Trân Châu Giòn',
      tipBase: 160
    }
  },
  whisking: {
    minGoodTexture: 68,
    maxGoodTexture: 90,
    overwhiskLimit: 96,
    whiskSpeed: 1.4
  }
};

// ==========================================
// 5. 🐍 SNAKE 2.0 CONFIGURATION
// ==========================================
export const SNAKE_CONFIG = {
  canvas: { width: 640, height: 360 },
  gridSize: 20,
  baseTickMs: 105,
  boostTickMs: 50,
  boostBurnCostSec: 2.0,
  items: {
    apple: { pts: 10, grow: 1, color: '#ef4444', icon: 'apple' },
    chili: { pts: 30, durationSec: 5, color: '#ea580c', icon: 'speed' },
    magnet: { pts: 25, durationSec: 7, radiusGrid: 4, color: '#eab308', icon: 'magnet' },
    ice_cream: { pts: 15, durationSec: 6, slowFactor: 1.6, color: '#38bdf8', icon: 'slow' }
  }
};

// ==========================================
// 6. ⛏️ GOLD MINER 2.0 CONFIGURATION
// ==========================================
export const GOLD_MINER_CONFIG = {
  canvas: { width: 640, height: 360 },
  hook: {
    startX: 320,
    startY: 50,
    swingSpeed: 0.026,
    maxAngle: Math.PI * 0.72,
    shootSpeed: 7.6,
    pullBaseSpeed: 6.2,
    baseLength: 24
  },
  minerals: {
    gold_s: { name: 'Vàng Nhỏ', r: 11, val: 50, weight: 1.0, color: '#fbbf24' },
    gold_m: { name: 'Vàng Vừa', r: 19, val: 160, weight: 2.3, color: '#f59e0b' },
    gold_l: { name: 'Vàng Đại', r: 29, val: 500, weight: 4.9, color: '#d97706' },
    diamond: { name: 'Kim Cương', r: 8, val: 600, weight: 0.7, color: '#38bdf8' },
    rock: { name: 'Đá Cuội', r: 22, val: 15, weight: 4.4, color: '#78716c' },
    tnt: { name: 'Thùng TNT', r: 16, val: 0, isBomb: true, blastRadius: 92, color: '#ef4444' },
    mystery: { name: 'Túi Bí Ẩn', r: 14, isMystery: true, color: '#a855f7' }
  },
  shopItems: {
    strength_drink: { id: 'strength', name: 'Nước Tăng Lực', price: 200, desc: 'Kéo vật nặng nhanh gấp 2.5 lần' },
    dynamite: { id: 'dynamite', name: 'Thuốc Nổ Dynamite', price: 150, desc: 'Nhấn Space để nổ bỏ vật nặng khi đang kéo' },
    diamond_polish: { id: 'polish', name: 'Đánh Bóng Kim Cương', price: 180, desc: 'Tăng giá trị kim cương lên $900' },
    lucky_clover: { id: 'clover', name: 'Cỏ 4 Lá May Mắn', price: 120, desc: 'Túi bí ẩn luôn mở ra phần thưởng xịn' }
  }
};
