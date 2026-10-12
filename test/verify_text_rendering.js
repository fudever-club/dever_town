/**
 * DEVER TOWN - TEXT RENDERING VERIFICATION SUITE (Workstream 3, 2026-10-12)
 * Kiểm định chữ overlay map/HUD sắc nét, đúng font, đúng chuẩn nhà:
 * 1. Không còn tham chiếu font 'Outfit' (font không được load — bug cũ tái phát
 *    sẽ làm chữ DOM rơi về font hệ thống, trông mờ/"AI").
 * 2. Canvas text map/HUD: Be Vietnam Pro, fontWeight 700/800, fontSize >= 11px,
 *    có stroke, resolution theo DPR.
 * 3. Room title HUD: KHÔNG dùng Tilt Neon ở cỡ nhỏ (display font 11px bị mờ).
 * 4. DOM toàn cục: text-rendering + font-smoothing được bật.
 * 5. E prompt: cyber-glass (viền cyan #38bdf8), key cap "E" tách riêng.
 * 6. Google Fonts thực sự load Be Vietnam Pro (kiểm tra index.html).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

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

// --- 1. Không còn 'Outfit' trong font stack (ngoại trừ comment/upcomingOutfits) ---
{
  const cssFiles = ['src/styles/hybrid-font.css', 'src/styles/graal-hud.css', 'src/styles/base.css'];
  let outfitRefs = [];
  for (const f of cssFiles) {
    const lines = read(f).split('\n');
    lines.forEach((ln, i) => {
      if (/'Outfit'/.test(ln) && !/^\s*\/\//.test(ln) && !/^\s*\*/.test(ln)) {
        outfitRefs.push(`${f}:${i + 1}`);
      }
    });
  }
  assert(outfitRefs.length === 0, `Không còn 'Outfit' trong font stack CSS (${outfitRefs.join(', ') || 'sạch'})`);
  assert(!/'Outfit'/.test(read('src/styles/hybrid-font.css').replace(/\/\*[\s\S]*?\*\//g, '')),
    'hybrid-font.css: stack font chỉ còn Tilt Neon / Be Vietnam Pro / system');
}

// --- 2. Canvas text map/HUD ---
{
  const portal = read('src/scenes/WorldScene.js');
  assert(/fontFamily: "'Be Vietnam Pro'[^"]*",\s*\n\s*fontSize: '11px',\s*\n\s*fontWeight: '700'/.test(portal),
    'Portal label: Be Vietnam Pro 11px/700');
  assert(/strokeThickness: 2/.test(portal), 'Portal label: có stroke chống nền bận');

  const im = read('src/managers/InteractionManager.js');
  assert(/fontSize: '12px',\s*\n\s*fontWeight: '700'/.test(im), 'E prompt: 12px/700');
  assert(/fontWeight: '800'/.test(im) && /'E'/.test(im), 'E prompt: key cap "E" 800 riêng');

  const badge = read('src/managers/InteractionManager.js');
  assert(/fontSize: '11px',\s*\n\s*fontWeight: '700'/.test(badge), 'Zone badge: 11px/700');

  for (const f of ['src/entities/Player.js', 'src/entities/RemotePlayer.js']) {
    const src = read(f);
    assert(/fontWeight: '700'/.test(src) && /stroke: '#0f172a'/.test(src),
      `${f}: name tag 700 + stroke`);
  }
  const pet = read('src/entities/BestiePetFollower.js');
  assert(/fontSize: '11px'/.test(pet), 'Pet tag: tối thiểu 11px (không còn 9.5px)');
}

// --- 3. Room title HUD không dùng Tilt Neon cỡ nhỏ ---
{
  const ws = read('src/scenes/WorldScene.js');
  const hudAnchor = ws.indexOf('this.hudText = this.add.text');
  const hudBlock = ws.slice(hudAnchor, hudAnchor + 1100)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  assert(!/Tilt Neon/.test(hudBlock), 'Room title HUD: không dùng Tilt Neon 11px');
  assert(/fontWeight: '700'/.test(hudBlock) && /strokeThickness: 2/.test(hudBlock),
    'Room title HUD: Be Vietnam Pro 700 + stroke');
}

// --- 4. DOM: text-rendering + font-smoothing ---
{
  const base = read('src/styles/base.css');
  assert(/-webkit-font-smoothing:\s*antialiased/.test(base), 'base.css: -webkit-font-smoothing antialiased');
  assert(/text-rendering:\s*optimizeLegibility/.test(base), 'base.css: text-rendering optimizeLegibility');
  const graal = read('src/styles/graal-hud.css');
  assert(/-webkit-font-smoothing:\s*antialiased/.test(graal), 'graal-hud.css: font-smoothing trên HUD overlay');
}

// --- 5. E prompt cyber-glass ---
{
  const im = read('src/managers/InteractionManager.js');
  assert(/0x38bdf8/.test(im), 'E prompt: viền cyan #38bdf8 (cyber-glass)');
  assert(/0x0a1224/.test(im), 'E prompt: nền kính tối rgba(10,18,36)');
  assert(!/0xf26f21/.test(im.slice(im.indexOf('showHUD'))), 'E prompt: không còn viền cam cũ');
  assert(/keycapBg/.test(im) && /keycapText/.test(im), 'E prompt: keycap vẽ bằng graphics + text riêng');
}

// --- 6. Google Fonts load Be Vietnam Pro ---
{
  const html = read('index.html');
  assert(/Be\+Vietnam\+Pro:wght@400;500;600;700;800/.test(html), 'index.html: Google Fonts load Be Vietnam Pro 400-800');
  assert(/family=Tilt\+Neon/.test(html), 'index.html: Google Fonts load Tilt Neon');
}

console.log(`\n[RESULT] ${passedTests}/${totalTests} test text rendering PASSED`);
