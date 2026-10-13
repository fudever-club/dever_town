/**
 * Verification test for dever_lab Hybrid Painted Map V1
 */
import { readFileSync, existsSync } from 'fs';
import { MAPS_CONFIG } from '../src/config/maps.js';
import { NPC_CONFIG } from '../src/config/npcs.js';

let passed = 0, failed = 0;
const ok = (cond, msg) => {
  if (cond) { passed++; console.log(`[PASS] ${msg}`); }
  else { failed++; console.error(`[FAIL] ${msg}`); process.exitCode = 1; }
};

const lab = MAPS_CONFIG.dever_lab;
ok(!!lab, 'dever_lab exists in MAPS_CONFIG');
ok(lab?.zone === 'safe', 'dever_lab zone is safe');
ok(!!lab?.paintedBackground, 'dever_lab has paintedBackground');

// 1. File asset check
const artPath = 'public/devertown_tech_lab_v1.jpg';
ok(existsSync(artPath), `${artPath} exists on disk`);
const pb = lab.paintedBackground;
ok(pb.imageKey === 'map_dever_lab', 'imageKey is map_dever_lab');
ok(pb.width === 1376 && pb.height === 768, 'dimensions are 1376x768');

// 2. BootScene preload check
const bootSrc = readFileSync('src/scenes/BootScene.js', 'utf-8');
ok(bootSrc.includes("this.load.image('map_dever_lab', 'devertown_tech_lab_v1.jpg')"), 'BootScene preloads map_dever_lab');

// 3. Collision rect helpers
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const padOf = (p) => ({ x: p.x - 16, y: p.y - 16, w: 32, h: 32 });

const rects = pb.collisionRects;
ok(Array.isArray(rects) && rects.length >= 10, `has ${rects.length} collision rects`);

// 4. Spawn point not in collision
ok(!rects.some(r => inRect(pb.spawnPoint.x, pb.spawnPoint.y, r)), `spawn point (${pb.spawnPoint.x}, ${pb.spawnPoint.y}) is walkable`);

// 5. Portals not in collision
for (const p of lab.portals) {
  if (p.x != null && p.y != null) {
    const pad = padOf(p);
    const hit = rects.some(r => rectsOverlap(pad, r));
    ok(!hit, `portal ${p.label} at (${p.x}, ${p.y}) does not collide with furniture`);
  }
}

// 6. NPC Pham Duc Truyen placement
const truyen = NPC_CONFIG.dever_lab?.find(n => n.id === 'npc_algo_truyen');
ok(!!truyen, 'npc_algo_truyen exists in dever_lab');
ok(truyen.x === 1080 && truyen.y === 350, `npc_algo_truyen pixel coords (1080, 350) near whiteboard`);
ok(!rects.some(r => inRect(truyen.x, truyen.y, r)), 'npc_algo_truyen is standing on walkable floor');

// 7. Emoji check
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
const labels = [...lab.portals.map(p => p.label), ...lab.zones.map(z => z.label + ' ' + z.name), lab.name];
ok(labels.every(l => !EMOJI_RE.test(l)), 'no emojis in dever_lab labels');

console.log(`\n========================================\nKẾT QUẢ: ${passed} PASSED, ${failed} FAILED\n========================================`);
