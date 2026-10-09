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
// 5. 🐍 SNAKE 3.0 (CYBER BUGGY SLITHER) CONFIGURATION
// ==========================================
export const SNAKE_CONFIG = {
  canvas: { width: 640, height: 360 },
  gridSize: 20,
  baseTickMs: 105,
  boostTickMs: 48,
  boostBurnCostSec: 2.0,
  comboWindowSec: 3.5,
  maxFoods: 4,
  items: {
    strawberry: { id: 'strawberry', name: 'Dâu Tây Buggy', pts: 10, grow: 1, color: '#f43f5e', icon: 'strawberry' },
    apple: { id: 'apple', name: 'Táo Đỏ', pts: 10, grow: 1, color: '#ef4444', icon: 'apple' },
    dcoin: { id: 'dcoin', name: 'Đồng D-Coin', pts: 50, grow: 1, color: '#facc15', icon: 'dcoin', isRare: true },
    chili: { id: 'chili', name: 'Ớt Lửa Nitro', pts: 30, durationSec: 5.5, speedMultiplier: 1.8, color: '#ea580c', icon: 'speed' },
    ice: { id: 'ice', name: 'Đồng Hồ Băng', pts: 15, durationSec: 6.0, slowFactor: 1.6, color: '#38bdf8', icon: 'slow' },
    ice_cream: { id: 'ice_cream', name: 'Đồng Hồ Băng', pts: 15, durationSec: 6.0, slowFactor: 1.6, color: '#38bdf8', icon: 'slow' },
    magnet: { id: 'magnet', name: 'Nam Châm Siêu Dẫn', pts: 25, durationSec: 7.0, radiusGrid: 4.5, color: '#eab308', icon: 'magnet' }
  },
  theme: {
    bg: '#090d16',
    gridLine: 'rgba(56, 189, 248, 0.05)',
    wallGlow: 'rgba(239, 68, 68, 0.5)',
    headColor: '#10b981',
    headBoostColor: '#f97316',
    antennaColor: '#34d399',
    eyeColor: '#ffffff',
    pupilColor: '#0f172a',
    bodyGradient: ['#10b981', '#059669', '#047857', '#065f46']
  }
};

// ==========================================
// 6. 📦 SOKOBAN 3.0 (WAREHOUSE MASTER) CONFIGURATION
// ==========================================
export const SOKOBAN_CONFIG = {
  canvas: { width: 640, height: 360 },
  tileSize: 38,
  slideDurationMs: 120,
  iceSlideDelayMs: 70,
  colors: {
    bg: '#0b1120',
    floor: '#1e293b',
    floorGrid: 'rgba(255, 255, 255, 0.04)',
    wallTop: '#475569',
    wallFront: '#334155',
    wallShadow: 'rgba(0, 0, 0, 0.35)',
    iceFloor: '#38bdf8',
    iceBorder: '#7dd3fc',
    boxNormal: '#f59e0b',
    boxTarget: '#16a34a',
    boxBorderNormal: '#fbbf24',
    boxBorderTarget: '#4ade80',
    targetSocket: '#22c55e',
    targetRing: 'rgba(34, 197, 94, 0.35)',
    playerHoodie: '#f97316',
    playerPants: '#1e293b'
  }
};

// ==========================================
// 7. ⛏️ GOLD MINER 3.0 CONFIGURATION
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

// ==========================================
// 8. 🪲 FLAPPY BUG CONFIGURATION
// ==========================================
export const FLAPPY_BUG_CONFIG = {
  canvas: { width: 640, height: 360 },
  physics: {
    gravity: 920,
    flapForce: -310,
    maxDropSpeed: 440,
    pipeSpeed: 140,
    pipeIntervalSec: 1.85,
    pipeWidth: 54,
    pipeGap: 116,
    groundHeight: 44
  },
  buggy: {
    startX: 120,
    startY: 160,
    radius: 14
  },
  // Cột pipe trên màn hình dọc (portrait): biên trên tối đa của khe hở được
  // tính theo chiều cao mới, giữ khoảng trống tối thiểu này phía trên mặt đất.
  // (2026-10-09, orientation-aware layout)
  portraitPipeTopMargin: 80,
  medals: {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100
  },
  colors: {
    skyTop: '#090d16',
    skyBottom: '#1e1b4b',
    ground: '#0f172a',
    groundGrid: '#38bdf8',
    pipeBody: '#1e293b',
    pipeBorder: '#334155',
    pipeGlow: '#06b6d4',
    buggyShell: '#10b981',
    buggySpots: '#fde047',
    buggyWing: 'rgba(255, 255, 255, 0.65)'
  }
};

// ==========================================
// 9. 📐 GEOMETRY DASH (DEVER DASH) CONFIGURATION
// ==========================================
export const GEOMETRY_DASH_CONFIG = {
  canvas: { width: 640, height: 360 },
  physics: {
    baseSpeed: 330,
    gravity: 1950,
    jumpImpulse: -560,
    jumpPadImpulse: -740,
    cubeSize: 28,
    groundY: 300,
    ceilingY: 52,
    respawnDelaySec: 0.28
  },
  colors: {
    bgTop: '#050510',
    bgBottom: '#180e29',
    ground: '#0c0f1d',
    groundGrid: '#a855f7',
    cubeBody: '#06b6d4',
    cubeCore: '#facc15',
    cubeBorder: '#ffffff',
    spikeFill: '#ef4444',
    spikeGlow: '#f87171',
    blockBody: '#1e1b4b',
    blockBorder: '#818cf8',
    padYellow: '#facc15',
    padPink: '#f43f5e',
    portalGravity: '#38bdf8',
    portalSpeed: '#a855f7'
  },
  level: {
    lengthPx: 10200
  }
};

// ==========================================
// 10. 🍬 CYBER CANDY MATCH-3 CONFIGURATION
// ==========================================
export const MATCH3_CONFIG = {
  canvas: { width: 640, height: 360 },
  grid: {
    rows: 8,
    cols: 8,
    cellSize: 36,
    cellGap: 2,
    startX: 170,
    startY: 29
  },
  rules: {
    movesLimit: 25,
    targetScores: {
      star1: 1500,
      star2: 3200,
      star3: 5500
    },
    points: {
      match3: 60,
      match4: 150,
      match5_L: 250,
      match5_line: 500,
      comboBonus: 40
    }
  },
  timings: {
    swapDurationMs: 140,
    fallSpeedPxPerSec: 460,
    hintIdleTimeMs: 4500,
    juiceTextDurationMs: 1100
  },
  specialTypes: {
    NONE: 0,
    STRIPED_H: 1,
    STRIPED_V: 2,
    WRAPPED: 3,
    COLOR_BOMB: 4
  },
  gemTypes: [
    { id: 0, name: 'Ruby Core', color: '#ef4444', glow: '#f87171', shape: 'diamond' },
    { id: 1, name: 'Sapphire Chip', color: '#06b6d4', glow: '#67e8f9', shape: 'hexagon' },
    { id: 2, name: 'Emerald Bug', color: '#10b981', glow: '#6ee7b7', shape: 'circle' },
    { id: 3, name: 'Topaz Bit', color: '#f59e0b', glow: '#fcd34d', shape: 'square' },
    { id: 4, name: 'Amethyst Byte', color: '#a855f7', glow: '#c084fc', shape: 'triangle' },
    { id: 5, name: 'Cyber Star', color: '#ec4899', glow: '#f472b6', shape: 'star' }
  ],
  colors: {
    bgTop: '#0a0d1a',
    bgBottom: '#18122B',
    boardBg: 'rgba(15, 23, 42, 0.88)',
    boardBorder: '#475569',
    cellBg: 'rgba(30, 41, 59, 0.65)',
    cellBorder: 'rgba(71, 85, 105, 0.45)',
    selectedBorder: '#facc15',
    hintBorder: '#38bdf8',
    panelBg: 'rgba(15, 23, 42, 0.75)',
    panelBorder: '#334155'
  }
};

// ==========================================
// 8. 👾 CYBER PAC-MAN 3.0 CONFIGURATION
// ==========================================
export const PACMAN_CONFIG = {
  grid: {
    cols: 28,
    rows: 21,
    tileSize: 16,
    startX: 96,
    startY: 12
  },
  speeds: {
    pacman: 128,
    ghostNormal: 114,
    ghostFrightened: 68,
    ghostEaten: 240,
    tunnelGhost: 58
  },
  timings: {
    frightenedDurationSec: 7.5,
    frightenedFlashSec: 2.2,
    scatterDurationSec: 7.0,
    chaseDurationSec: 20.0,
    fruitDurationSec: 10.0,
    respawnDelaySec: 1.2
  },
  scoring: {
    pellet: 10,
    powerPellet: 50,
    ghosts: [200, 400, 800, 1600],
    fruit: 300
  },
  lives: 3,
  colors: {
    bg: '#05070e',
    wallBorder: '#06b6d4',
    wallGlow: '#0891b2',
    wallFill: '#0c1829',
    door: '#f43f5e',
    pellet: '#fef08a',
    pelletGlow: '#facc15',
    powerPellet: '#f59e0b',
    powerPelletGlow: '#fbbf24',
    pacman: '#facc15',
    frightenedGhost: '#3b82f6',
    frightenedFlash: '#ffffff',
    hudText: '#f8fafc'
  },
  ghosts: {
    blinky: { id: 'blinky', name: 'Blinky Red', color: '#ef4444', glow: '#f87171', scatterTile: { x: 26, y: 0 } },
    pinky:  { id: 'pinky',  name: 'Pinky Pink',  color: '#ec4899', glow: '#f472b6', scatterTile: { x: 1, y: 0 } },
    inky:   { id: 'inky',   name: 'Inky Cyan',   color: '#06b6d4', glow: '#67e8f9', scatterTile: { x: 26, y: 20 } },
    clyde:  { id: 'clyde',  name: 'Clyde Gold',  color: '#f59e0b', glow: '#fbbf24', scatterTile: { x: 1, y: 20 } }
  },
  maze: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,4,4,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,5,5,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
};



