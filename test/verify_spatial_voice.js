/**
 * test/verify_spatial_voice.js
 * Phase 1b: kiểm chứng logic spatial voice (pure functions, chạy được trên Node)
 */
import { SPATIAL_VOICE_CONFIG, PRIVATE_AREAS, findPrivateArea, computeSpatialVolume } from '../src/config/audioZones.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL:', msg); } };
const approx = (a, b) => Math.abs(a - b) < 1e-6;

// 1. Config hợp lệ
ok(SPATIAL_VOICE_CONFIG.enabled === true, 'spatial voice bật mặc định');
ok(SPATIAL_VOICE_CONFIG.fullVolumeRadius < SPATIAL_VOICE_CONFIG.fadeDistance, 'bán kính full < fade');
ok(SPATIAL_VOICE_CONFIG.updateIntervalMs >= 100, 'update interval không quá nhanh');

// 2. Private areas cho 2 phòng mới
ok(Array.isArray(PRIVATE_AREAS.meeting_room) && PRIVATE_AREAS.meeting_room.length >= 1, 'meeting_room có private area');

// 3. findPrivateArea
const meetArea = PRIVATE_AREAS.meeting_room[0];
const inside = findPrivateArea('meeting_room', (meetArea.x1 + meetArea.x2) / 2, (meetArea.y1 + meetArea.y2) / 2);
ok(inside && inside.id === meetArea.id, 'điểm giữa vùng kín được nhận diện');
ok(findPrivateArea('meeting_room', 10, 10) === null, 'điểm ngoài vùng kín trả null');
ok(findPrivateArea('main_hall', 400, 300) === null, 'phòng không có private area trả null');

// 4. Volume theo khoảng cách (ngoài vùng kín)
const v1 = computeSpatialVolume({ x: 0, y: 0 }, { x: 100, y: 0 }, 'main_hall');
ok(approx(v1, 1), 'trong fullVolumeRadius -> volume 1');
const v2 = computeSpatialVolume({ x: 0, y: 0 }, { x: 1000, y: 0 }, 'main_hall');
ok(approx(v2, 0), 'ngoài fadeDistance -> volume 0');
const mid = (SPATIAL_VOICE_CONFIG.fullVolumeRadius + SPATIAL_VOICE_CONFIG.fadeDistance) / 2;
const v3 = computeSpatialVolume({ x: 0, y: 0 }, { x: mid, y: 0 }, 'main_hall');
ok(approx(v3, 0.5), 'giữa vùng fade -> volume ~0.5');

// 5. Private area isolation
const cx = (meetArea.x1 + meetArea.x2) / 2, cy = (meetArea.y1 + meetArea.y2) / 2;
const vIn = computeSpatialVolume({ x: cx, y: cy }, { x: cx + 50, y: cy }, 'meeting_room');
ok(vIn > 0, 'cùng vùng kín -> nghe được');
const vOut = computeSpatialVolume({ x: cx, y: cy }, { x: 700, y: 500 }, 'meeting_room');
ok(approx(vOut, 0), 'trong vùng kín, peer ngoài -> câm');
const vOut2 = computeSpatialVolume({ x: 700, y: 500 }, { x: cx, y: cy }, 'meeting_room');
ok(approx(vOut2, 0), 'ngoài vùng kín, peer trong -> câm');

// 6. VoiceService có methods spatial
import { readFileSync } from 'fs';
const vsSrc = readFileSync('src/services/VoiceService.js', 'utf8');
ok(/setPositionProvider\(provider\)/.test(vsSrc), 'VoiceService có setPositionProvider');
ok(/startSpatialAudio\(\)/.test(vsSrc), 'VoiceService có startSpatialAudio');
ok(/stopSpatialAudio\(\)/.test(vsSrc), 'VoiceService có stopSpatialAudio');
ok(/updateSpatialVolumes\(\)/.test(vsSrc), 'VoiceService có updateSpatialVolumes');
ok(/this\.stopSpatialAudio\(\);/.test(vsSrc), 'leave() dừng spatial audio');

console.log(`\nverify_spatial_voice: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
