/**
 * DEVER TOWN - DAY & NIGHT LIGHTING CONFIG
 * Tham số cấu hình Chu kỳ Ngày & Đêm, Khí quyển và Nguồn sáng (Point Lights)
 * Tuân thủ Notion Superpowers Framework: Tách rời tham số cân bằng và cấu hình thế giới.
 */

export const DAY_NIGHT_PERIODS = {
  DAWN: {
    id: 'dawn',
    label: 'Bình Minh',
    startHour: 5.0,
    endHour: 7.5,
    ambientColor: 0xfbcfe8, // Hồng đào ấm áp ban mai
    darknessAlpha: 0.18,
    lampGlowAlpha: 0.35,
    streetLightsOn: true,
    fireflies: false,
    sunPosition: { x: 0.15, y: 0.7 }
  },
  DAY: {
    id: 'day',
    label: 'Ban Ngày',
    startHour: 7.5,
    endHour: 16.5,
    ambientColor: 0xffffff, // Trong trẻo tự nhiên
    darknessAlpha: 0.0,
    lampGlowAlpha: 0.0,
    streetLightsOn: false,
    fireflies: false,
    sunPosition: { x: 0.5, y: 0.2 }
  },
  SUNSET: {
    id: 'sunset',
    label: 'Hoàng Hôn',
    startHour: 16.5,
    endHour: 18.75,
    ambientColor: 0xf97316, // Cam hổ phách rực rỡ FPTU
    darknessAlpha: 0.32,
    lampGlowAlpha: 0.65,
    streetLightsOn: true,
    fireflies: false,
    sunPosition: { x: 0.85, y: 0.7 }
  },
  NIGHT: {
    id: 'night',
    label: 'Ban Đêm',
    startHour: 18.75,
    endHour: 23.5,
    ambientColor: 0x090e24, // Xanh tím thẫm lung linh
    darknessAlpha: 0.68,
    lampGlowAlpha: 0.95,
    streetLightsOn: true,
    fireflies: true,
    sunPosition: { x: 0.5, y: 0.8 }
  },
  MIDNIGHT: {
    id: 'midnight',
    label: 'Đêm Khuya',
    startHour: 23.5,
    endHour: 5.0,
    ambientColor: 0x040612, // Đêm lạnh sâu thẳm
    darknessAlpha: 0.76,
    lampGlowAlpha: 0.9,
    streetLightsOn: true,
    fireflies: true,
    sunPosition: { x: 0.2, y: 0.8 }
  }
};

/**
 * Cấu hình đặc tính ánh sáng theo từng phòng
 */
export const ROOM_LIGHT_PROPERTIES = {
  main_hall: {
    isOutdoor: true,
    indoorBaseDarkness: 0.0,
    allowWeather: true
  },
  sports_complex: {
    isOutdoor: true,
    indoorBaseDarkness: 0.0,
    allowWeather: true
  },
  tea_garden: {
    isOutdoor: true,
    indoorBaseDarkness: 0.0,
    allowWeather: true
  },
  campus_hall: {
    isOutdoor: true,
    indoorBaseDarkness: 0.0,
    allowWeather: true
  },
  dever_lab: {
    isOutdoor: false,
    indoorBaseDarkness: 0.30,
    indoorAmbientColor: 0x090d16,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x0f172a,
    allowWeather: false
  },
  canteen_cafe: {
    isOutdoor: false,
    indoorBaseDarkness: 0.15,
    indoorAmbientColor: 0x0f172a,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x1e1b2e,
    allowWeather: false
  },
  library_lounge: {
    isOutdoor: false,
    indoorBaseDarkness: 0.18,
    indoorAmbientColor: 0x17120a,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x1c1917,
    allowWeather: false
  },
  server_dungeon: {
    isOutdoor: false,
    indoorBaseDarkness: 0.75,
    indoorAmbientColor: 0x030712,
    nightIndoorLightsOn: false,
    allowWeather: false
  },
  dorm_room: {
    isOutdoor: false,
    indoorBaseDarkness: 0.12,
    indoorAmbientColor: 0x1a1410,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x241a12,
    allowWeather: false
  },
  meeting_room: {
    isOutdoor: false,
    indoorBaseDarkness: 0.08,
    indoorAmbientColor: 0x141821,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x1e2433,
    allowWeather: false
  },
  memory_room: {
    isOutdoor: false,
    indoorBaseDarkness: 0.25,
    indoorAmbientColor: 0x110b29,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x1a1236,
    allowWeather: false
  },
  game_arcade: {
    isOutdoor: false,
    indoorBaseDarkness: 0.35,
    indoorAmbientColor: 0x1e0b36,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x250e42,
    allowWeather: false
  },
  web_room: {
    isOutdoor: false,
    indoorBaseDarkness: 0.20,
    indoorAmbientColor: 0x0a101f,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x0e1b33,
    allowWeather: false
  },
  academic_hub: {
    isOutdoor: false,
    indoorBaseDarkness: 0.15,
    indoorAmbientColor: 0x0c0e1a,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x101626,
    allowWeather: false
  },
  hall_of_fame: {
    isOutdoor: false,
    indoorBaseDarkness: 0.20,
    indoorAmbientColor: 0x181005,
    nightIndoorLightsOn: true,
    nightIndoorAmbientColor: 0x241708,
    allowWeather: false
  }
};

/**
 * Cấu hình quầng sáng đèn đường — Sprite-based Soft Glow
 * Dùng texture radial gradient vẽ sẵn một lần + blend ADD để:
 *  - Ánh sáng mượt tuyệt đối (GPU nội suy gradient, không còn viền gãy/banding của 28 lớp ellipse)
 *  - Hòa lẫn vào môi trường (ADD làm sáng xuyên qua lớp bóng tối, chi tiết map vẫn thấy được)
 *  - Màu ấm dịu, tự pha theo buổi (bình minh ngả hồng, hoàng hôn ngả cam)
 * Tuân thủ Notion Superpowers Framework: mọi thông số tuning nằm ở config, không hardcode trong update/render.
 */
export const LAMP_GLOW_CONFIG = {
  textures: {
    warmGlowKey: 'dever_glow_warm', // radial gradient: lõi trắng ấm -> giữa hổ phách -> rìa trong suốt
    beamKey: 'dever_glow_beam',     // gradient dọc: sáng ở đầu đèn, mờ dần xuống đất + mềm 2 biên ngang
    size: 256
  },
  // Vũng sáng trên mặt đất dưới chân cột đèn.
  // Kiểu Stardew Valley: HÌNH TRÒN mềm mại, chỉ "sáng lên" nhẹ nhàng chứ không bóp oval.
  groundPool: {
    radiusScale: 1.05,  // nhân với light.radius -> bán kính hình tròn
    baseAlpha: 0.42,     // alpha = min(maxAlpha, baseAlpha * intensity + floor)
    maxAlpha: 0.6,
    alphaFloor: 0.05
  },
  // Hào quang ngay tại bóng đèn (điểm phát sáng mà mắt người nhận ra "đây là cái đèn")
  headHalo: {
    radius: 36,         // bán kính cơ sở (px), co giãn nhẹ theo flicker
    squashY: 0.85,       // bóp nhẹ theo trục Y cho giống bầu đèn
    baseAlpha: 0.62,
    maxAlpha: 0.9,
    alphaFloor: 0.08,
    coreTint: 0xfffbeb   // lõi gần như trắng ấm
  },
  // Chùm sáng từ bóng đèn rọi xuống đất
  beam: {
    widthScale: 0.95,   // nhân với light.radius
    minWidth: 24,
    height: 56,
    baseAlpha: 0.3,
    maxAlpha: 0.48
  },
  // Màu đèn hài hòa theo buổi: lerp(màu đèn gốc, màu ambient hiện tại, blendToAmbient)
  tintByPeriod: {
    dawn:     { color: 0xffd9a0, blendToAmbient: 0.38 }, // bình minh: ngả hồng hòa vào trời hồng
    day:      { color: 0xffd9a0, blendToAmbient: 0.0 },
    sunset:   { color: 0xffd9a0, blendToAmbient: 0.25 }, // hoàng hôn: ngả cam
    night:    { color: 0xffd9a0, blendToAmbient: 0.12 }, // đêm: hổ phách ấm dịu
    midnight: { color: 0xffd2a0, blendToAmbient: 0.15 }
  },
  spriteDepth: 999991 // nằm trên lightmap bóng tối (999990)
};

/**
 * Nguồn sáng tĩnh (Static Point Lights) trên từng bản đồ
 * type: 'street_lamp' | 'neon' | 'statue' | 'desk_lamp' | 'ceiling_light' | 'torch'
 */
export const STATIC_LIGHT_SOURCES = {
  main_hall: [
    // 2 Cột đèn lối đi sân trước
    { x: 192, y: 520, radius: 95, color: 0xfef08a, intensity: 0.9, type: 'street_lamp', flicker: 0.03 },
    { x: 608, y: 520, radius: 95, color: 0xfef08a, intensity: 0.9, type: 'street_lamp', flicker: 0.03 },
    // Cột đèn trung tâm lối vào sảnh
    { x: 400, y: 460, radius: 110, color: 0xfef3c7, intensity: 0.85, type: 'street_lamp', flicker: 0.02 },
    // Tượng Cóc Vàng FUDA tỏa ánh vàng kim linh thiêng
    { x: 384, y: 240, radius: 105, color: 0xfbbf24, intensity: 0.95, type: 'statue', flicker: 0.05 },
    // Bảng Neon DEVER Club rực sáng công nghệ
    { x: 400, y: 24, radius: 115, color: 0x38bdf8, intensity: 0.9, type: 'neon', flicker: 0.04 },
    // Cột cờ FPTU
    { x: 160, y: 490, radius: 75, color: 0xf97316, intensity: 0.75, type: 'street_lamp', flicker: 0.02 },
    { x: 640, y: 490, radius: 75, color: 0xf97316, intensity: 0.75, type: 'street_lamp', flicker: 0.02 }
  ],
  tea_garden: [
    // Đèn lồng sân vườn
    { x: 220, y: 160, radius: 90, color: 0xfef08a, intensity: 0.85, type: 'street_lamp', flicker: 0.04 },
    { x: 580, y: 160, radius: 90, color: 0xfef08a, intensity: 0.85, type: 'street_lamp', flicker: 0.04 },
    { x: 400, y: 380, radius: 100, color: 0xfde047, intensity: 0.9, type: 'street_lamp', flicker: 0.03 },
    { x: 400, y: 200, radius: 80, color: 0x86efac, intensity: 0.7, type: 'statue', flicker: 0.02 }
  ],
  sports_complex: [
    // 4 Cụm đèn cao áp sân vận động
    { x: 120, y: 120, radius: 120, color: 0xf1f5f9, intensity: 0.95, type: 'street_lamp', flicker: 0.01 },
    { x: 680, y: 120, radius: 120, color: 0xf1f5f9, intensity: 0.95, type: 'street_lamp', flicker: 0.01 },
    { x: 120, y: 480, radius: 120, color: 0xf1f5f9, intensity: 0.95, type: 'street_lamp', flicker: 0.01 },
    { x: 680, y: 480, radius: 120, color: 0xf1f5f9, intensity: 0.95, type: 'street_lamp', flicker: 0.01 }
  ],
  campus_hall: [
    // 4 Đèn cột khuôn viên trường FPT
    { x: 180, y: 160, radius: 95, color: 0xfef08a, intensity: 0.9, type: 'street_lamp', flicker: 0.02 },
    { x: 620, y: 160, radius: 95, color: 0xfef08a, intensity: 0.9, type: 'street_lamp', flicker: 0.02 },
    { x: 180, y: 460, radius: 95, color: 0xfef08a, intensity: 0.9, type: 'street_lamp', flicker: 0.02 },
    { x: 620, y: 460, radius: 95, color: 0xfef08a, intensity: 0.9, type: 'street_lamp', flicker: 0.02 }
  ],
  canteen_cafe: [
    // Quầy Barista & Máy pha cà phê
    { x: 400, y: 160, radius: 110, color: 0xfef08a, intensity: 0.9, type: 'desk_lamp', flicker: 0.02 },
    // Quầy bánh ngọt
    { x: 250, y: 180, radius: 85, color: 0xfde68a, intensity: 0.8, type: 'desk_lamp', flicker: 0.02 },
    // Tủ bán hàng tự động
    { x: 620, y: 180, radius: 80, color: 0x38bdf8, intensity: 0.85, type: 'neon', flicker: 0.03 },
    // Hệ thống Đèn trần Edison ấm áp ban đêm
    { x: 280, y: 340, radius: 110, color: 0xfef3c7, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 },
    { x: 520, y: 340, radius: 110, color: 0xfef3c7, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 },
    { x: 400, y: 480, radius: 115, color: 0xfde68a, intensity: 0.88, type: 'ceiling_light', flicker: 0.02 }
  ],
  dever_lab: [
    // Dãy Server Rack chính
    { x: 180, y: 120, radius: 95, color: 0x38bdf8, intensity: 0.9, type: 'neon', flicker: 0.06 },
    { x: 620, y: 120, radius: 95, color: 0xa855f7, intensity: 0.9, type: 'neon', flicker: 0.06 },
    // Bàn Hackathon Đội Alpha
    { x: 400, y: 280, radius: 100, color: 0x67e8f9, intensity: 0.85, type: 'desk_lamp', flicker: 0.03 },
    // Hệ thống Đèn trần huỳnh quang công nghệ ban đêm
    { x: 280, y: 200, radius: 115, color: 0xe0f2fe, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 },
    { x: 520, y: 200, radius: 115, color: 0xe0f2fe, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 },
    { x: 400, y: 440, radius: 120, color: 0x38bdf8, intensity: 0.88, type: 'ceiling_light', flicker: 0.03 }
  ],
  server_dungeon: [
    // Máy chủ trung tâm nhấp nháy
    { x: 400, y: 200, radius: 120, color: 0x38bdf8, intensity: 0.95, type: 'neon', flicker: 0.08 },
    { x: 200, y: 350, radius: 80, color: 0xef4444, intensity: 0.85, type: 'neon', flicker: 0.07 },
    { x: 600, y: 350, radius: 80, color: 0x10b981, intensity: 0.85, type: 'neon', flicker: 0.07 },
    { x: 400, y: 460, radius: 85, color: 0x38bdf8, intensity: 0.75, type: 'neon', flicker: 0.08 }
  ],
  game_arcade: [
    // Máy Game Thùng Pacman & Retro
    { x: 220, y: 150, radius: 90, color: 0xfacc15, intensity: 0.9, type: 'neon', flicker: 0.05 },
    { x: 400, y: 150, radius: 90, color: 0xec4899, intensity: 0.9, type: 'neon', flicker: 0.05 },
    { x: 580, y: 150, radius: 90, color: 0x06b6d4, intensity: 0.9, type: 'neon', flicker: 0.05 },
    // Dãy máy arcade thứ hai & Đèn trần Cyber Arcade
    { x: 220, y: 350, radius: 95, color: 0x38bdf8, intensity: 0.9, type: 'neon', flicker: 0.05 },
    { x: 580, y: 350, radius: 95, color: 0xa855f7, intensity: 0.9, type: 'neon', flicker: 0.05 },
    { x: 400, y: 280, radius: 120, color: 0xf43f5e, intensity: 0.9, type: 'ceiling_light', flicker: 0.03 }
  ],
  library_lounge: [
    // Đèn đọc sách thư viện
    { x: 240, y: 220, radius: 85, color: 0xfef3c7, intensity: 0.85, type: 'desk_lamp', flicker: 0.02 },
    { x: 560, y: 220, radius: 85, color: 0xfef3c7, intensity: 0.85, type: 'desk_lamp', flicker: 0.02 },
    { x: 400, y: 360, radius: 95, color: 0xfde68a, intensity: 0.85, type: 'desk_lamp', flicker: 0.02 },
    // Đèn chùm trung tâm thư viện & Dãy đèn đọc sách ban đêm
    { x: 400, y: 160, radius: 120, color: 0xfef9c3, intensity: 0.9, type: 'ceiling_light', flicker: 0.01 },
    { x: 200, y: 440, radius: 105, color: 0xfef08a, intensity: 0.88, type: 'ceiling_light', flicker: 0.01 },
    { x: 600, y: 440, radius: 105, color: 0xfef08a, intensity: 0.88, type: 'ceiling_light', flicker: 0.01 }
  ],
  web_room: [
    // Không gian Web Development
    { x: 400, y: 160, radius: 120, color: 0x38bdf8, intensity: 0.92, type: 'ceiling_light', flicker: 0.03 },
    { x: 220, y: 280, radius: 95, color: 0x67e8f9, intensity: 0.85, type: 'desk_lamp', flicker: 0.02 },
    { x: 580, y: 280, radius: 95, color: 0x60a5fa, intensity: 0.85, type: 'desk_lamp', flicker: 0.02 },
    { x: 400, y: 440, radius: 110, color: 0x93c5fd, intensity: 0.88, type: 'ceiling_light', flicker: 0.02 }
  ],
  academic_hub: [
    // Hub Học thuật & Đội tuyển ICPC
    { x: 400, y: 160, radius: 120, color: 0xfef08a, intensity: 0.92, type: 'ceiling_light', flicker: 0.02 },
    { x: 220, y: 300, radius: 100, color: 0xfde68a, intensity: 0.88, type: 'desk_lamp', flicker: 0.02 },
    { x: 580, y: 300, radius: 100, color: 0xfde68a, intensity: 0.88, type: 'desk_lamp', flicker: 0.02 },
    { x: 400, y: 450, radius: 115, color: 0xfef9c3, intensity: 0.88, type: 'ceiling_light', flicker: 0.02 }
  ],
  hall_of_fame: [
    // Đại sảnh Vinh danh & Truyền thống
    { x: 400, y: 160, radius: 130, color: 0xfbbf24, intensity: 0.95, type: 'statue', flicker: 0.03 },
    { x: 220, y: 260, radius: 105, color: 0xfde047, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 },
    { x: 580, y: 260, radius: 105, color: 0xfde047, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 },
    { x: 400, y: 440, radius: 115, color: 0xfef08a, intensity: 0.9, type: 'ceiling_light', flicker: 0.02 }
  ],
  memory_room: [
    // Phòng Kỷ niệm & Truyền thống Gen 1-10
    { x: 400, y: 160, radius: 120, color: 0xc084fc, intensity: 0.92, type: 'neon', flicker: 0.04 },
    { x: 240, y: 300, radius: 100, color: 0xf472b6, intensity: 0.88, type: 'ceiling_light', flicker: 0.02 },
    { x: 560, y: 300, radius: 100, color: 0x818cf8, intensity: 0.88, type: 'ceiling_light', flicker: 0.02 },
    { x: 400, y: 450, radius: 110, color: 0xd8b4fe, intensity: 0.88, type: 'ceiling_light', flicker: 0.02 }
  ]
};
