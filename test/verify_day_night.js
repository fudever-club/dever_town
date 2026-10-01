/**
 * DEVER TOWN - DAY & NIGHT LIGHTING SYSTEM TEST SUITE
 * Kiểm thử toàn diện Động Cơ Ánh Sáng Ngày & Đêm & Nguồn Sáng Điểm:
 * 1. Phân loại 5 khung giờ (Bình Minh, Ban Ngày, Hoàng Hôn, Ban Đêm, Đêm Khuya).
 * 2. Tính toán nội suy màu sắc và độ tối (Color Lerping & Darkness Alpha).
 * 3. Bật/tắt đèn đường và đom đóm (Streetlights & Fireflies) theo thời gian và đặc tính phòng.
 * 4. Nguồn sáng tĩnh (Static Point Lights) trên các bản đồ FPTU.
 * 5. Các chế độ thời gian: Real-time, Fast Cycle, Manual Picker.
 */

import {
  DAY_NIGHT_PERIODS,
  ROOM_LIGHT_PROPERTIES,
  STATIC_LIGHT_SOURCES,
  LightingManager
} from '../src/managers/LightingManager.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

function createMockScene() {
  const graphicsCalls = [];
  const mockGraphics = {
    setDepth: () => mockGraphics,
    clear: () => { graphicsCalls.push('clear'); return mockGraphics; },
    fillStyle: (color, alpha) => { graphicsCalls.push({ type: 'fillStyle', color, alpha }); return mockGraphics; },
    fillRect: (x, y, w, h) => { graphicsCalls.push({ type: 'fillRect', x, y, w, h }); return mockGraphics; },
    fillCircle: (cx, cy, r) => { graphicsCalls.push({ type: 'fillCircle', cx, cy, r }); return mockGraphics; },
    setVisible: (v) => { mockGraphics.visible = v; return mockGraphics; },
    destroy: () => {},
    visible: true
  };

  let firefliesEnabled = false;

  return {
    add: {
      graphics: () => mockGraphics
    },
    scale: {
      width: 1280,
      height: 720,
      on: () => {},
      off: () => {}
    },
    cameras: {
      main: {
        scrollX: 0,
        scrollY: 0,
        width: 800,
        height: 608,
        zoom: 1
      }
    },
    player: {
      x: 400,
      y: 350,
      active: true,
      role: 'dev'
    },
    npcGroup: [
      { x: 380, y: 340, active: true, visible: true }
    ],
    remotePlayers: new Map(),
    ambientManager: {
      setFirefliesEnabled: (enabled) => {
        firefliesEnabled = enabled;
      },
      getFirefliesState: () => firefliesEnabled
    },
    _graphics: mockGraphics,
    _calls: graphicsCalls
  };
}

console.log('--- BẮT ĐẦU KIỂM THỬ HỆ THỐNG ÁNH SÁNG NGÀY & ĐÊM ---');

const mockScene = createMockScene();
const lighting = new LightingManager(mockScene);

// 1. Kiểm tra cấu hình Period
assert(DAY_NIGHT_PERIODS.DAWN.id === 'dawn', 'Định nghĩa chuẩn xác khung giờ Bình Minh');
assert(DAY_NIGHT_PERIODS.DAY.id === 'day', 'Định nghĩa chuẩn xác khung giờ Ban Ngày');
assert(DAY_NIGHT_PERIODS.SUNSET.id === 'sunset', 'Định nghĩa chuẩn xác khung giờ Hoàng Hôn');
assert(DAY_NIGHT_PERIODS.NIGHT.id === 'night', 'Định nghĩa chuẩn xác khung giờ Ban Đêm');
assert(DAY_NIGHT_PERIODS.MIDNIGHT.id === 'midnight', 'Định nghĩa chuẩn xác khung giờ Đêm Khuya');

// 2. Kiểm tra hàm lấy period theo giờ
const periodDawn = lighting.getPeriodForHour(6.5);
assert(periodDawn.id === 'dawn', '6:30 sáng được phân vào khung Bình Minh');

const periodDay = lighting.getPeriodForHour(12.0);
assert(periodDay.id === 'day', '12:00 trưa được phân vào khung Ban Ngày');

const periodSunset = lighting.getPeriodForHour(17.5);
assert(periodSunset.id === 'sunset', '17:30 chiều được phân vào khung Hoàng Hôn');

const periodNight = lighting.getPeriodForHour(21.0);
assert(periodNight.id === 'night', '21:00 tối được phân vào khung Ban Đêm');

const periodMidnight = lighting.getPeriodForHour(2.0);
assert(periodMidnight.id === 'midnight', '02:00 sáng được phân vào khung Đêm Khuya');

// 3. Kiểm tra tính toán khí quyển cho phòng ngoài trời (main_hall)
lighting.setRoom('main_hall');

// Ban Ngày (12:00)
const dayAtmosphere = lighting.computeAtmosphere(12.0);
assert(dayAtmosphere.isNight === false, '12:00 trưa không phải ban đêm');
assert(dayAtmosphere.darknessAlpha === 0.0, 'Ban ngày ngoài trời không có bóng tối');
assert(dayAtmosphere.streetLightsOn === false, 'Ban ngày đèn đường tự động tắt');

// Hoàng Hôn (17:30)
const sunsetAtmosphere = lighting.computeAtmosphere(17.5);
assert(sunsetAtmosphere.isNight === false, '17:30 chưa phải đêm');
assert(sunsetAtmosphere.darknessAlpha > 0.15, 'Hoàng hôn có sắc tố bóng mờ');
assert(sunsetAtmosphere.streetLightsOn === true, 'Hoàng hôn đèn đường bắt đầu bật sáng');

// Ban Đêm (21:00)
const nightAtmosphere = lighting.computeAtmosphere(21.0);
assert(nightAtmosphere.isNight === true, '21:00 là ban đêm');
assert(nightAtmosphere.darknessAlpha >= 0.65, 'Ban đêm màn đêm phủ mờ với độ tối chuẩn (>= 0.65)');
assert(nightAtmosphere.streetLightsOn === true, 'Ban đêm đèn đường bật sáng toàn diện');

// 4. Kiểm tra phòng trong nhà (dever_lab, canteen_cafe, server_dungeon)
lighting.setRoom('dever_lab');
const labAtmosphere = lighting.computeAtmosphere(12.0);
assert(labAtmosphere.isOutdoor === false, 'dever_lab được nhận diện là phòng trong nhà');
assert(labAtmosphere.darknessAlpha >= 0.25, 'dever_lab duy trì độ tối phòng lab công nghệ');

// Ban đêm trong phòng có nightIndoorLightsOn (canteen_cafe, dever_lab)
const labNightAtmosphere = lighting.computeAtmosphere(21.0);
assert(labNightAtmosphere.nightIndoorLightsOn === true, 'Ban đêm dever_lab tự động kích hoạt nightIndoorLightsOn');
assert(labNightAtmosphere.darknessAlpha <= 0.30, 'Ban đêm dever_lab không bị tối mịt nhờ hệ thống đèn trần');

lighting.setRoom('server_dungeon');
const dungeonNightAtmosphere = lighting.computeAtmosphere(21.0);
assert(dungeonNightAtmosphere.nightIndoorLightsOn === false, 'Hầm server_dungeon giữ bóng tối âm u (nightIndoorLightsOn = false)');

// 5. Kiểm tra Nguồn Sáng Tĩnh & Đèn Trần (Static Point Lights & Ceiling Lights)
assert(STATIC_LIGHT_SOURCES.main_hall.length >= 5, 'main_hall có ít nhất 5 điểm sáng tĩnh');
const statueLight = STATIC_LIGHT_SOURCES.main_hall.find(l => l.type === 'statue');
assert(statueLight && statueLight.color === 0xfbbf24, 'Tượng Cóc Vàng phát ánh sáng vàng kim');

const neonLight = STATIC_LIGHT_SOURCES.main_hall.find(l => l.type === 'neon');
assert(neonLight && neonLight.color === 0x38bdf8, 'Biển hiệu Neon DEVER phát ánh sáng xanh Cyber');

assert(STATIC_LIGHT_SOURCES.sports_complex.length >= 4, 'sports_complex có 4 đèn cao áp sân');
assert(STATIC_LIGHT_SOURCES.canteen_cafe.length >= 5, 'canteen_cafe có đầy đủ quầy barista và đèn trần Edison');
assert(STATIC_LIGHT_SOURCES.dever_lab.some(l => l.type === 'ceiling_light'), 'dever_lab có đèn trần huỳnh quang công nghệ');
assert(STATIC_LIGHT_SOURCES.web_room && STATIC_LIGHT_SOURCES.web_room.length >= 3, 'web_room có cấu hình nguồn sáng tĩnh');
assert(!STATIC_LIGHT_SOURCES.media_hub, 'media_hub đã gộp vào web_room, không còn nguồn sáng riêng');
assert(STATIC_LIGHT_SOURCES.academic_hub && STATIC_LIGHT_SOURCES.academic_hub.length >= 3, 'academic_hub có cấu hình nguồn sáng tĩnh');
assert(STATIC_LIGHT_SOURCES.hall_of_fame && STATIC_LIGHT_SOURCES.hall_of_fame.length >= 3, 'hall_of_fame có cấu hình nguồn sáng tĩnh');
assert(STATIC_LIGHT_SOURCES.memory_room && STATIC_LIGHT_SOURCES.memory_room.length >= 3, 'memory_room có cấu hình nguồn sáng tĩnh');

// Kiểm tra loại bỏ Foot Aura dưới chân nhân vật
assert(lighting.enableFootAura === false, 'enableFootAura mặc định là false theo phản hồi người dùng');

// 6. Kiểm tra Chuyển Đổi Chế Độ Thời Gian (Time Modes)
lighting.setTimeMode('manual');
assert(lighting.timeMode === 'manual', 'Chuyển thành công sang chế độ Manual');

lighting.setTime(20, 30);
const stateManual = lighting.getTimeState();
assert(stateManual.hour === 20 && stateManual.minute === 30, 'Đặt chính xác thời gian thủ công 20:30');
assert(stateManual.isNight === true, '20:30 là ban đêm');
assert(stateManual.timeString === '20:30', 'Chuỗi hiển thị đồng hồ định dạng chuẩn 20:30');

lighting.setTime(9, 15);
const stateDay = lighting.getTimeState();
assert(stateDay.timeString === '09:15', 'Đặt chính xác thời gian thủ công 09:15');
assert(stateDay.isNight === false, '09:15 là ban ngày');

// 7. Kiểm tra Tự Động Kích Hoạt Đom Đóm Đêm (Fireflies)
lighting.setRoom('tea_garden');
lighting.setTime(22, 0); // Ban đêm ở Vườn Trà
lighting.update(0, 16.6);
assert(mockScene.ambientManager.getFirefliesState() === true, 'Đom đóm tự động bật tại Vườn Trà vào ban đêm');

// Chuyển sang Ban ngày
lighting.setTime(11, 0);
lighting.update(0, 16.6);
assert(mockScene.ambientManager.getFirefliesState() === false, 'Đom đóm tự động tắt khi trời sáng');

// Ban đêm nhưng ở trong nhà (server_dungeon)
lighting.setRoom('server_dungeon');
lighting.setTime(23, 0);
lighting.update(0, 16.6);
assert(mockScene.ambientManager.getFirefliesState() === false, 'Đom đóm không xuất hiện trong hầm server');

// 8. Kiểm tra Fast Cycle (12 phút/ngày)
lighting.setTimeMode('fast_cycle');
lighting.currentHour = 10.0;
const startHour = lighting.currentHour;
// Giả lập trôi qua 30 giây thực tế -> 1 giờ ảo
lighting.update(0, 30 * 1000);
const hourDiff = lighting.currentHour - startHour;
assert(Math.abs(hourDiff - 1.0) < 0.05, 'Chế độ Fast Cycle thúc đẩy dòng thời gian chính xác (30s thực = 1h game)');

// 9. Kiểm tra Thuật Toán Lerp Màu Sắc
const colorWhite = 0xffffff;
const colorBlack = 0x000000;
const colorMid = lighting.lerpColor(colorWhite, colorBlack, 0.5);
assert(colorMid === 0x808080, 'Nội suy màu sắc RGB 50% cho kết quả xám chuẩn xác (0x808080)');

// 10. Dọn dẹp
lighting.destroy();
assert(lighting.lightGraphics === null, 'Dọn dẹp Graphics an toàn khi hủy Scene');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
console.log(`========================================\n`);
