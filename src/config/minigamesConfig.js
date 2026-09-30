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
    { x: 215, y: 108, r: 14, pts: 250, name: 'Góc Chữ A Trái' },
    { x: 425, y: 108, r: 14, pts: 250, name: 'Góc Chữ A Phải' },
    { x: 320, y: 100, r: 12, pts: 180, name: 'Xà Ngang Tâm' }
  ],
  // ==========================================
  // GOLAZO DUEL 3.0 ADVANCED PARAMETERS
  // ==========================================
  theGolazo: {
    stadium: {
      skyColorTop: '#05081c',
      skyColorBottom: '#0d173b',
      floodlightIntensity: 0.18,
      ledText: 'FU-DEVER • WORK HARD - PLAY HARD • FPT UNIVERSITY DA NANG',
      crowdFlashCount: 45
    },
    pitch: {
      grassStripe1: '#15803d',
      grassStripe2: '#166534',
      lineColor: 'rgba(255, 255, 255, 0.88)'
    },
    striker: {
      jerseyColor: '#f26f21',
      shortsColor: '#0f172a',
      socksColor: '#f26f21',
      hairColor: '#1e1b4b',
      number: '10',
      runupOffsetX: 32,
      runupOffsetY: 30,
      runupDuration: 0.22
    },
    goalkeeper: {
      jerseyColor: '#eab308',
      shortsColor: '#1e293b',
      glovesColor: '#ef4444',
      idleBobSpeed: 4.5,
      diveSpeed: 3.2,
      reachRadius: 48
    },
    wall: {
      enabledAfterStreak: 2,
      count: 3,
      jerseyColor: '#4338ca',
      jumpMax: 28,
      jumpSpeed: 5.2,
      width: 58,
      height: 38
    },
    ball: {
      radius: 8.5,
      maxCurve: 75,
      knuckleJitter: 12,
      regularDuration: 0.62,
      panenkaDuration: 1.15,
      hitStopDuration: 40
    },
    technicalScoring: {
      topCorner: 250,
      inOffPost: 200,
      curvedGolazo: 180,
      panenka: 160,
      regularGoal: 100,
      gkSave: 150
    }
  }
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
  },
  // ==========================================
  // CƠ CHẾ STREETBALL ARCADE SHOOTER 3.0
  // ==========================================
  theShooter: {
    // Điều khiển kéo thả Slingshot
    dragMaxDist: 110,
    minSpeed: 10.5,
    maxSpeed: 20.5,
    minAngleDeg: 25,
    maxAngleDeg: 85,
    defaultAngleDeg: 55,
    defaultPower: 0.65,
    
    // Tọa độ cầu thủ & bóng lúc nhồi bóng
    player: {
      x: 100,
      floorY: 260
    },
    
    // Lưới rổ vật lý đàn hồi lò xo
    net: {
      cols: 6,
      rows: 5,
      springStiffness: 0.18,
      damping: 0.88,
      depth: 38
    },
    
    // Điểm số kỹ thuật chi tiết
    scoring: {
      normalBasket: 2,
      bankShotBonus: 2, // Đập bảng mica vào rổ (+4đ)
      swishBonus: 3,    // Xé lưới không chạm vành (+5đ)
      onFireTier1: 3,   // 3 quả: Lửa cam x2
      onFireTier2: 6    // 6 quả: Lửa xanh neon x3
    },
    
    // Màu sắc sân bãi Streetball
    court: {
      floorColor: '#ea580c',
      paintZoneColor: '#0284c7',
      lineColor: 'rgba(255, 255, 255, 0.75)',
      threePointRadius: 280
    }
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
  },
  // Tham so phat bong (tach roi tu Engine)
  serve: {
    playerVx: 5.8,
    playerVy: -9.2,
    playerJumpVy: -5.5,
    botVx: -5.8,
    botVy: -9.2,
    botJumpVy: -5.5
  },
  // Tham so va cham luoi (giam luc nay, triet tieu nang luong)
  netBounce: {
    restitutionX: 0.35,
    restitutionY: 0.40,
    extraVx: 0.5,
    extraVy: 1.0
  },
  // Tham so va cham dau
  headBounce: {
    basePower: 7.6,
    verticalPower: 8.8,
    jumpBoost: 2.2,
    extraVy: 2.2
  },
  // ==========================================
  // CƠ CHẾ THE SPIKE (ARCADE VOLLEYBALL OVERHAUL)
  // ==========================================
  theSpike: {
    // Vùng hồng tâm và căn nhịp
    sweetSpotRadius: 56,
    perfectTimingWindow: 0.10, // Giây sai số cho cú Boom Spike
    hitStopDuration: 0.045,    // 45ms đóng băng khung hình va chạm
    
    // Tốc độ đập các cấp độ (Tính toán động đảm bảo qua lưới)
    boomSpikeSpeed: { vx: 12.8, vy: -2.8 },
    goodSpikeSpeed: { vx: 10.4, vy: -2.0 },
    tipSpikeSpeed: { vx: 5.8, vy: -4.5 },
    
    // Cứu bóng trượt sàn (Slide / Dive)
    slideSpeed: 6.8,
    slideDuration: 0.28,
    slideCooldown: 0.75,
    
    // Game Feel: Jump Buffer & Coyote Time & Apex Hang
    coyoteTime: 0.15,
    jumpBufferTime: 0.20,
    apexThreshold: 4.5,
    apexGravityMultiplier: 0.5,
    
    // Giao diện sân bãi & Màu sắc
    court: {
      woodColor: '#d97706',
      woodPlankDark: '#b45309',
      lineColor: 'rgba(255, 255, 255, 0.85)',
      attackLineX: 200,      // Vạch 3m sân người chơi
      botAttackLineX: 440,   // Vạch 3m sân Bot
      antennaHeight: 35
    }
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
      isHot: false,
      hasEspressoExtraction: true,
      layers: [
        { name: 'Sữa Đặc', color: '#fef08a', targetPct: 20, targetMl: 40 },
        { name: 'Cốt Cà Phê Phin', color: '#451a03', targetPct: 50, targetMl: 100 },
        { name: 'Kem Béo Muối Hồng', color: '#fdf2f8', targetPct: 30, targetMl: 60 }
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
      isHot: false,
      hasEspressoExtraction: false,
      layers: [
        { name: 'Sữa Đặc', color: '#fef08a', targetPct: 25, targetMl: 50 },
        { name: 'Sữa Tươi Thanh Trùng', color: '#f8fafc', targetPct: 45, targetMl: 90 },
        { name: 'Bọt Cafe Bồng Bềnh', color: '#78350f', targetPct: 30, targetMl: 60 }
      ],
      topping: 'Không Topping',
      tipBase: 130
    },
    cafe_trung: {
      id: 'cafe_trung',
      name: 'Cà Phê Trứng Hà Nội',
      dialogue: '1 ly Cà Phê Trứng vàng óng béo ngậy cho giảng viên chấm đồ án SE cả ngày không mỏi!',
      customer: 'Thầy Trưởng Bộ Môn',
      avatarColor: '#eab308',
      patienceSec: 48,
      targetIce: 0,
      isHot: true,
      hasEspressoExtraction: true,
      layers: [
        { name: 'Cốt Espresso Nóng Đậm', color: '#3d1c06', targetPct: 40, targetMl: 80 },
        { name: 'Kem Trứng Bông Mịn', color: '#fef08a', targetPct: 60, targetMl: 120 }
      ],
      topping: 'Bột Quế Thơm',
      tipBase: 165
    },
    matcha_latte: {
      id: 'matcha_latte',
      name: 'Matcha Kem Cheese FPTU',
      dialogue: '1 ly Matcha Latte xanh mướt phủ kem cheese mặn mặn tiếp sức chạy sự kiện!',
      customer: 'Chủ Tịch CLB Sự Kiện',
      avatarColor: '#10b981',
      patienceSec: 42,
      targetIce: 3,
      isHot: false,
      hasEspressoExtraction: false,
      layers: [
        { name: 'Siro Đường Mía', color: '#fde047', targetPct: 15, targetMl: 30 },
        { name: 'Sữa Tươi Tiệt Trùng', color: '#f8fafc', targetPct: 45, targetMl: 90 },
        { name: 'Cốt Matcha Nhật Bản', color: '#15803d', targetPct: 25, targetMl: 50 },
        { name: 'Kem Cheese Mặn', color: '#fef9c3', targetPct: 15, targetMl: 30 }
      ],
      topping: 'Bột Matcha Xanh',
      tipBase: 155
    },
    tra_dao_cam_sa: {
      id: 'tra_dao_cam_sa',
      name: 'Trà Đào Cam Sả Mát Lạnh',
      dialogue: '1 ly Trà Đào Cam Sả thanh mát, chuẩn bị năng lượng pitching dự án khởi nghiệp!',
      customer: 'Founder Sinh Viên',
      avatarColor: '#fbbf24',
      patienceSec: 38,
      targetIce: 4,
      isHot: false,
      hasEspressoExtraction: false,
      layers: [
        { name: 'Siro Đào Vàng', color: '#fb923c', targetPct: 25, targetMl: 50 },
        { name: 'Cốt Trà Đen Cam Sả', color: '#b45309', targetPct: 65, targetMl: 130 },
        { name: 'Lớp Nước Cam Tươi', color: '#fdba74', targetPct: 10, targetMl: 20 }
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
      isHot: false,
      hasEspressoExtraction: false,
      layers: [
        { name: 'Trân Châu Hoàng Kim', color: '#78350f', targetPct: 25, targetMl: 50 },
        { name: 'Trà Sữa Oolong', color: '#d97706', targetPct: 55, targetMl: 110 },
        { name: 'Váng Sữa Macchiato', color: '#fffbeb', targetPct: 20, targetMl: 40 }
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
  },
  craft3: {
    barTheme: {
      woodTop: '#5a2d0c',
      woodFront: '#3d1c06',
      woodTrim: '#854d0e',
      edisonWarmth: 'rgba(251, 191, 36, 0.18)',
      machineSteel: '#94a3b8',
      machineDark: '#334155',
      gaugeGold: '#fbbf24'
    },
    tamping: {
      minGoodForce: 14,
      maxGoodForce: 22,
      perfectForce: 18,
      fillRate: 18,
      extractionDuration: 2.2
    },
    layering: {
      pourSpeedPctPerSec: 55,
      waveFrequency: 8.5,
      waveDamping: 0.92,
      tolerancePct: 6
    },
    steaming: {
      minGoodTemp: 58,
      maxGoodTemp: 68,
      targetTemp: 63,
      tempRate: 12.0,
      minGoodTexture: 72,
      maxGoodTexture: 90,
      targetTexture: 82,
      textureRate: 18.0
    },
    rating: {
      perfectStarBonus: 1.5,
      goodStarBonus: 1.2,
      standardBonus: 1.0
    }
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
    startY: 52,
    swingSpeed: 0.024,
    maxAngle: Math.PI * 0.74,
    shootSpeed: 8.2,
    pullBaseSpeed: 6.6,
    baseLength: 26
  },
  minerals: {
    gold_s: { name: 'Vàng Nhỏ', r: 12, val: 50, weight: 1.0, color: '#facc15', shine: '#fef08a' },
    gold_m: { name: 'Vàng Vừa', r: 20, val: 160, weight: 2.2, color: '#eab308', shine: '#fef9c3' },
    gold_l: { name: 'Vàng Đại', r: 30, val: 500, weight: 4.8, color: '#ca8a04', shine: '#ffffff' },
    diamond: { name: 'Kim Cương', r: 9, val: 600, polishedVal: 900, weight: 0.6, color: '#38bdf8', shine: '#ffffff' },
    rock_s: { name: 'Đá Nhỏ', r: 15, val: 12, weight: 3.0, color: '#78716c', shine: '#a8a29e' },
    rock_l: { name: 'Đá Tảng', r: 25, val: 25, weight: 5.5, color: '#57534e', shine: '#78716c' },
    tnt: { name: 'Thùng TNT', r: 17, val: 0, isBomb: true, blastRadius: 105, color: '#ef4444' },
    mystery: { name: 'Túi Bí Ẩn', r: 15, isMystery: true, color: '#a855f7' }
  },
  mole: {
    r: 12,
    speed: 1.4,
    valWithoutDiamond: 2,
    valWithDiamond: 602,
    color: '#78350f',
    diamondChance: 0.55
  },
  shopItems: {
    dynamite: { id: 'dynamite', name: 'Thuốc Nổ Dynamite', price: 150, maxHold: 5, desc: 'Bấm Space / Nút Nổ để phá hủy vật nặng khi đang kéo', icon: '🧨' },
    strength_drink: { id: 'strength', name: 'Nước Tăng Lực', price: 200, desc: 'Kéo vật nặng nhanh gấp 2.5 lần trong ngày tiếp theo', icon: '⚡' },
    diamond_polish: { id: 'polish', name: 'Đánh Bóng Kim Cương', price: 180, desc: 'Tăng giá trị Kim Cương từ $600 lên $900', icon: '💎' },
    lucky_clover: { id: 'clover', name: 'Cỏ 4 Lá May Mắn', price: 120, desc: 'Túi bí ẩn luôn mở ra phần thưởng xịn ($400 - $800)', icon: '🍀' },
    laser_sight: { id: 'laser', name: 'Kính Ngắm Laser', price: 160, desc: 'Chiếu tia laser định hướng góc bắn móc chuẩn xác', icon: '🎯' }
  },
  levels: [
    { day: 1, targetCash: 650, timeSec: 60 },
    { day: 2, targetCash: 1600, timeSec: 60 },
    { day: 3, targetCash: 2800, timeSec: 60 },
    { day: 4, targetCash: 4200, timeSec: 60 },
    { day: 5, targetCash: 5800, timeSec: 60 }
  ]
};
