/**
 * DEVER TOWN - SCENE TRANSITION + WEATHER TEST SUITE (Phase 2)
 * Kiểm thử:
 * 1. TRANSITION_CONFIG có đủ tham số dissolve.
 * 2. SceneTransitionManager: Bayer dithering vẽ đúng (threshold 0 = trong suốt,
 *    threshold 1 = phủ kín), overlay NEAREST không mờ, transition() gọi swap
 *    ở giữa và reset isTransitioning.
 * 3. WEATHER_CONFIG: phòng ngoài trời, xác suất, thời lượng hợp lệ.
 * 4. AmbientEnvironmentManager: startRain/stopRain quản lý emitter + tint +
 *    tiếng mưa; clearWeather dọn sạch; phòng trong nhà không bật weather.
 * 5. AudioManager: startRainSound/setRainIntensity/stopRainSound tồn tại và
 *    tôn trọng isMuted.
 * 6. WorldScene + FloorManager đã đấu nối transitionManager (static check).
 */

import { readFileSync } from 'fs';
import { TRANSITION_CONFIG } from '../src/config/transitionConfig.js';
import { WEATHER_CONFIG } from '../src/config/weatherConfig.js';
import { SceneTransitionManager } from '../src/managers/SceneTransitionManager.js';

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

/* ---------- 1. TRANSITION_CONFIG ---------- */
assert(TRANSITION_CONFIG.dissolveWidth === 160, 'Transition: dissolveWidth = 160 (low-res cho hạt pixel to)');
assert(TRANSITION_CONFIG.dissolveHeight === 90, 'Transition: dissolveHeight = 90');
assert(TRANSITION_CONFIG.dissolveOutMs > 0 && TRANSITION_CONFIG.dissolveInMs > 0, 'Transition: thời gian dissolve ra/vào > 0');
assert(TRANSITION_CONFIG.flashMs === 70, 'Transition: flash trắng 70ms kiểu Pokémon GBA');
assert(TRANSITION_CONFIG.dissolveColor && TRANSITION_CONFIG.dissolveColor.r === 11, 'Transition: màu dissolve đen xanh đêm');

/* ---------- 2. SceneTransitionManager với mock scene ---------- */
function createMockScene() {
  const drawn = [];
  const ctx = {
    clearRect: () => drawn.push('clear'),
    fillRect: (x, y) => drawn.push([x, y]),
    fillStyle: '',
  };
  const canvasTexture = {
    getContext: () => ctx,
    refresh: () => drawn.push('refresh'),
    setFilter: () => {},
  };
  const overlay = {
    active: true,
    setOrigin: () => overlay,
    setDisplaySize: () => overlay,
    setScale: () => overlay,
    setScrollFactor: () => overlay,
    setDepth: () => overlay,
    setVisible: (v) => { overlay.visible = v; return overlay; },
    texture: canvasTexture,
    destroy: () => { overlay.active = false; },
  };
  const cameras = { main: { width: 800, height: 608, flash: () => {} } };
  const delayedCalls = [];
  return {
    drawn, overlay, canvasTexture, delayedCalls,
    textures: { exists: () => true, get: () => canvasTexture },
    add: { image: () => overlay },
    cameras,
    time: { delayedCall: (ms, fn) => { delayedCalls.push({ ms, fn }); return { remove: () => {} }; } },
    scale: { on: () => {} },
  };
}

const mockScene = createMockScene();
const tm = new SceneTransitionManager(mockScene);
assert(tm.ensureOverlay() === true, 'TransitionManager: ensureOverlay() tạo overlay thành công');
assert(tm.overlay.setScrollFactor !== undefined, 'TransitionManager: overlay tồn tại');

tm.setThreshold(0);
const drawsAt0 = mockScene.drawn.filter(d => Array.isArray(d)).length;
assert(drawsAt0 === 0, `TransitionManager: threshold 0 không vẽ pixel nào (được ${drawsAt0})`);

mockScene.drawn.length = 0;
tm.setThreshold(1);
const drawsAt1 = mockScene.drawn.filter(d => Array.isArray(d)).length;
const total = 160 * 90;
assert(drawsAt1 === total, `TransitionManager: threshold 1 phủ kín ${total} pixel (được ${drawsAt1})`);

mockScene.drawn.length = 0;
tm.setThreshold(0.5);
const drawsAtHalf = mockScene.drawn.filter(d => Array.isArray(d)).length;
assert(drawsAtHalf > total * 0.4 && drawsAtHalf < total * 0.6,
  `TransitionManager: threshold 0.5 phủ ~50% pixel kiểu Bayer (được ${drawsAtHalf}/${total})`);

// transition() full flow: flash -> dissolve ra -> swap -> dissolve vào
let swapped = false;
const p = tm.transition(async () => { swapped = true; });
// Chạy hết các delayedCall đã schedule (mô phỏng time)
function runAll(scene) {
  let guard = 0;
  while (scene.delayedCalls.length > 0 && guard++ < 200) {
    const batch = scene.delayedCalls.splice(0);
    // Sắp xếp: animateThreshold dùng performance.now — cần giả lập thời gian trôi
    batch.forEach(({ fn }) => fn());
  }
}
// Giả lập performance.now tiến triển cho animateThreshold
let fakeNow = 1000;
const origNow = performance.now;
performance.now = () => fakeNow;
const tick = async () => {
  for (let i = 0; i < 60; i++) {
    fakeNow += 50;
    runAll(mockScene);
    await Promise.resolve();
    if (!tm.isTransitioning) break;
  }
};
await tick();
performance.now = origNow;
await p;
assert(swapped === true, 'TransitionManager: swapCallback được gọi ở giữa transition');
assert(tm.isTransitioning === false, 'TransitionManager: isTransitioning reset sau khi xong');
assert(tm.overlay.visible === false, 'TransitionManager: overlay ẩn sau khi transition xong');

// Không cho transition chồng nhau
tm.isTransitioning = true;
let secondSwap = false;
await tm.transition(async () => { secondSwap = true; });
assert(secondSwap === false, 'TransitionManager: từ chối transition chồng khi đang chạy');
tm.isTransitioning = false;

tm.destroy();
assert(tm.overlay === null, 'TransitionManager: destroy() dọn overlay');

/* ---------- 3. WEATHER_CONFIG ---------- */
assert(Array.isArray(WEATHER_CONFIG.outdoorRooms) && WEATHER_CONFIG.outdoorRooms.includes('main_hall'),
  'Weather: main_hall là phòng ngoài trời');
assert(WEATHER_CONFIG.rainChance > 0 && WEATHER_CONFIG.rainChance < 1, 'Weather: rainChance là xác suất hợp lệ');
assert(WEATHER_CONFIG.rainDurationMin < WEATHER_CONFIG.rainDurationMax, 'Weather: khoảng thời lượng mưa hợp lệ');
assert(WEATHER_CONFIG.rainTintAlpha <= 0.15, 'Weather: tint mưa rất nhẹ (<= 0.15), giữ sáng như gather.town');
assert(WEATHER_CONFIG.cloudCount > 0, 'Weather: có mây trôi');
assert(WEATHER_CONFIG.rainFrequencyMs === 35, 'Weather: desktop rainFrequencyMs = 35 (giữ nguyên)');
assert(WEATHER_CONFIG.mobileRainQuantityDivisor >= 2, 'Weather: mobileRainQuantityDivisor >= 2 (chia đôi quantity trên mobile)');
assert(WEATHER_CONFIG.mobileRainFrequencyMs > WEATHER_CONFIG.rainFrequencyMs, 'Weather: mobileRainFrequencyMs > desktop (thưa hạt hơn)');
assert(WEATHER_CONFIG.mobileCloudCount < WEATHER_CONFIG.cloudCount, 'Weather: mobileCloudCount < desktop cloudCount');
assert(WEATHER_CONFIG.mobileCloudAlpha <= WEATHER_CONFIG.cloudAlpha, 'Weather: mobileCloudAlpha <= desktop cloudAlpha');

/* ---------- 4. AmbientEnvironmentManager weather (mock) ---------- */
const ambientSrc = readFileSync(new URL('../src/managers/AmbientEnvironmentManager.js', import.meta.url), 'utf8');
assert(ambientSrc.includes("import { WEATHER_CONFIG } from '../config/weatherConfig.js'"), 'Ambient: import WEATHER_CONFIG');
assert(ambientSrc.includes('particle_rain'), 'Ambient: có texture hạt mưa particle_rain');
assert(ambientSrc.includes('particle_cloud'), 'Ambient: có texture mây particle_cloud');
assert(ambientSrc.includes('setupWeather(roomId)'), 'Ambient: setRoom gọi setupWeather');
assert(ambientSrc.includes('clearWeather()'), 'Ambient: setRoom/destroy gọi clearWeather');
assert(ambientSrc.includes('startRainSound'), 'Ambient: startRain gọi tiếng mưa procedural');
assert(ambientSrc.includes('stopRainSound'), 'Ambient: stopRain/clearWeather dừng tiếng mưa');
assert(ambientSrc.includes("outdoorRooms.includes(roomId)"), 'Ambient: chỉ bật weather cho phòng ngoài trời');
assert(ambientSrc.includes('setDepth(2000)'), 'Ambient: mưa ở tiền cảnh (depth 2000)');
assert(ambientSrc.includes('setDepth(5)'), 'Ambient: mây ở depth thấp (sau nhân vật)');
assert(ambientSrc.includes('_isMobileDevice()'), 'Ambient: có helper _isMobileDevice cho scaling mobile');
assert(ambientSrc.includes('ontouchstart') && ambientSrc.includes('maxTouchPoints'), 'Ambient: _isMobileDevice dùng cùng công thức WorldScene (touch/maxTouchPoints)');
assert(ambientSrc.includes('mobileRainFrequencyMs'), 'Ambient: startRain dùng mobileRainFrequencyMs trên mobile');
assert(ambientSrc.includes('mobileRainQuantityDivisor'), 'Ambient: startRain chia quantity qua mobileRainQuantityDivisor');
assert(ambientSrc.includes('mobileCloudCount'), 'Ambient: spawnClouds dùng mobileCloudCount trên mobile');

/* ---------- 5. AudioManager rain sound ---------- */
const audioSrc = readFileSync(new URL('../src/utils/AudioManager.js', import.meta.url), 'utf8');
assert(audioSrc.includes('startRainSound(intensity'), 'AudioManager: có startRainSound');
assert(audioSrc.includes('stopRainSound()'), 'AudioManager: có stopRainSound');
assert(audioSrc.includes('setRainIntensity'), 'AudioManager: có setRainIntensity');
assert(audioSrc.includes("type = 'lowpass'"), 'AudioManager: tiếng mưa dùng lowpass filter cho noise');
assert(audioSrc.includes('noise.loop = true'), 'AudioManager: noise mưa lặp lại');
assert(audioSrc.includes('if (this._rainNodes) this.setRainIntensity'), 'AudioManager: setMuted/setMasterVolume cập nhật tiếng mưa');

/* ---------- 6. Đấu nối WorldScene + FloorManager ---------- */
const worldSrc = readFileSync(new URL('../src/scenes/WorldScene.js', import.meta.url), 'utf8');
assert(worldSrc.includes("import { SceneTransitionManager } from '../managers/SceneTransitionManager.js'"), 'WorldScene: import SceneTransitionManager');
assert(worldSrc.includes('this.transitionManager = new SceneTransitionManager(this)'), 'WorldScene: khởi tạo transitionManager trong create()');
assert(worldSrc.includes('this.transitionManager.transition(doSwap)'), 'WorldScene: handlePortalOverlap dùng pixel-dissolve');
assert(!worldSrc.includes('camerafadeoutcomplete') || worldSrc.includes('Fallback nếu chưa có transitionManager'),
  'WorldScene: fade cũ chỉ còn là fallback');

const floorSrc = readFileSync(new URL('../src/managers/FloorManager.js', import.meta.url), 'utf8');
assert(floorSrc.includes('this.scene.transitionManager.transition(swapFloor)'), 'FloorManager: đổi tầng dùng chung transitionManager');
assert(floorSrc.includes('targetFloorData'), 'FloorManager: không còn biến floorData scope sai');
assert(floorSrc.includes("playFootstep('wood')"), 'FloorManager: giữ tiếng bước cầu thang gỗ');

console.log(`\n${passedTests}/${totalTests} tests passed`);
