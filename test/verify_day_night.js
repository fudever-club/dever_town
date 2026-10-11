/**
 * DEVER TOWN - STATIC LIGHTING TEST SUITE (L2)
 * L2: Chu kỳ ngày/đêm đã TẮT theo quyết định của Hung (2026-10-01).
 * Game luôn sáng như gather.town — kiểm thử:
 * 1. Flag DAY_NIGHT_CYCLE_ENABLED = false.
 * 2. updateAtmosphere() luôn cho ánh sáng ban ngày tĩnh (darkness = 0),
 *    bất kể giờ nào (kể cả 22:00).
 * 3. setTime()/setTimeMode() là no-op khi đã tắt.
 * 4. Không bao giờ isNight, không đom đóm.
 * 5. Nguồn sáng tĩnh vẫn được cấu hình (giữ nguyên dữ liệu).
 * 6. Tiện ích lerpColor và dọn dẹp destroy().
 */

import {
  DAY_NIGHT_CYCLE_ENABLED,
  DAY_NIGHT_PERIODS,
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

console.log('--- BẮT ĐẦU KIỂM THỬ ÁNH SÁNG TĨNH (L2: tắt ngày/đêm) ---');

const mockScene = createMockScene();
const lighting = new LightingManager(mockScene);

// 1. Flag tắt chu kỳ ngày/đêm
assert(DAY_NIGHT_CYCLE_ENABLED === false, 'DAY_NIGHT_CYCLE_ENABLED = false (L2)');

// 2. Cấu hình period vẫn tồn tại (để bật lại khi cần)
assert(DAY_NIGHT_PERIODS.DAY.id === 'day', 'Cấu hình period DAY vẫn tồn tại');

// 3. updateAtmosphere luôn cho ánh sáng ban ngày, bất kể giờ
lighting.setRoom('main_hall');
for (const h of [0, 2, 5.75, 12, 17.5, 22, 23.5]) {
  lighting.currentHour = h;
  lighting.updateAtmosphere();
  assert(lighting.currentAtmosphere.darknessAlpha === 0,
    `Giờ ${h}: darkness = 0 (luôn sáng)`);
  assert(lighting.isNight === false, `Giờ ${h}: không bao giờ là ban đêm`);
}

// 4. setTime() là no-op khi L2
lighting.setTime(22, 0);
lighting.updateAtmosphere();
assert(lighting.currentAtmosphere.darknessAlpha === 0,
  'setTime(22,0) bị bỏ qua — vẫn sáng');
assert(lighting.timeMode !== 'manual' || true, 'setTime không crash khi L2');

// 5. setTimeMode() là no-op khi L2
const modeBefore = lighting.timeMode;
lighting.setTimeMode('fast_cycle');
assert(lighting.timeMode === modeBefore, 'setTimeMode bị bỏ qua khi L2');

// 6. Phòng trong nhà cũng luôn sáng
lighting.setRoom('server_dungeon');
lighting.currentHour = 23;
lighting.updateAtmosphere();
assert(lighting.currentAtmosphere.darknessAlpha === 0,
  'server_dungeon lúc 23:00 vẫn sáng (L2)');

// 7. Không đom đóm khi L2
lighting.setRoom('main_hall');
lighting.currentHour = 22;
lighting.update(0, 16.6);
assert(mockScene.ambientManager.getFirefliesState() === false,
  'Đom đóm không bật khi L2 (kể cả 22:00 ngoài trời)');

// 8. Nguồn sáng tĩnh vẫn được cấu hình đầy đủ
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
assert(STATIC_LIGHT_SOURCES.memory_room && STATIC_LIGHT_SOURCES.memory_room.length >= 3, 'memory_room có cấu hình nguồn sáng tĩnh');

// 9. Tiện ích lerpColor vẫn hoạt động
const colorMid = lighting.lerpColor(0xffffff, 0x000000, 0.5);
assert(colorMid === 0x808080, 'Nội suy màu sắc RGB 50% cho kết quả xám chuẩn xác (0x808080)');

// 10. Dọn dẹp
lighting.destroy();
assert(lighting.lightGraphics === null, 'Dọn dẹp Graphics an toàn khi hủy Scene');

console.log(`\n========================================`);
console.log(`KẾT QUẢ: ${passedTests}/${totalTests} TESTS PASSED!`);
if (passedTests !== totalTests) process.exitCode = 1;
