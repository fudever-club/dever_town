/**
 * verify_emote_icons.js — kiểm tra static cho pixel emote icons 16x16 (EmoteBar).
 */
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', msg); }
};

// Emote icons được tách ra module riêng (giới hạn ~100KB khi push qua GitHub API)
const EI = readFileSync('src/utils/emoteIcons.js', 'utf8');
const BS = readFileSync('src/scenes/BootScene.js', 'utf8');
const EB = readFileSync('src/ui/common/EmoteBar.js', 'utf8');
const WS = readFileSync('src/scenes/WorldScene.js', 'utf8');
// EmoteBar CSS được tách ra file riêng (giới hạn ~100KB khi push qua GitHub API)
const CSS = readFileSync('src/styles/emote-bar.css', 'utf8');

// 1. generateEmoteIcons tồn tại và đủ 8 emotes + 4 touch icons (mobile buttons)
ok(EI.includes('export function generateEmoteIcons(scene)'), 'có generateEmoteIcons');
const emoteIds = ['wave', 'heart', 'fire', 'clap', 'dance', 'question', 'nod', 'power'];
for (const id of emoteIds) {
  ok(EI.includes(`${id}(ctx)`), `vẽ icon '${id}'`);
}
const touchIds = ['touch_duel', 'touch_emote', 'touch_chat', 'touch_bag'];
for (const id of touchIds) {
  ok(EI.includes(`${id}(ctx)`), `vẽ touch icon '${id}'`);
}
ok(EI.includes("'emoteicon'"), 'prefix emoteicon');
ok(EI.includes('export function getEmoteIconURL(scene, emoteId)'), 'có getEmoteIconURL');

// 2. BootScene gọi generateEmoteIcons
ok(BS.includes("import { generateEmoteIcons }") && BS.includes('generateEmoteIcons(this)'), 'BootScene sinh emote icons');

// 3. EmoteBar dùng pixel icons, không còn emoji
ok(EB.includes("import { getEmoteIconURL }"), 'EmoteBar import getEmoteIconURL');
ok(EB.includes('getEmoteIconHTML(item)'), 'EmoteBar có getEmoteIconHTML');
ok(EB.includes('image-rendering: pixelated'), 'icon render pixelated');
ok(EB.includes('emote-icon-img'), 'dùng class emote-icon-img');
for (const emoji of ['👋', '❤️', '🔥', '👏', '🕺', '❓', '👍', '💪']) {
  ok(!EB.includes(emoji), `không còn emoji ${emoji}`);
}
ok((EB.match(/hotkey: '/g) || []).length === 8, 'EmoteBar giữ đủ 8 emotes + hotkey');
ok(EB.includes('Digit7') && EB.includes('Digit8'), 'EmoteBar lắng nghe Digit7/Digit8');

// 4. WorldScene truyền scene
ok(WS.includes('scene: this') && WS.includes('new EmoteBar'), 'WorldScene truyền scene cho EmoteBar');

// 5. CSS
ok(CSS.includes('.emote-icon-img'), 'CSS có .emote-icon-img');
ok(CSS.includes('image-rendering: pixelated'), 'CSS giữ pixelated cho emote icons');
ok(CSS.includes('.emote-icon-fallback'), 'CSS có .emote-icon-fallback');

// 6. Icons sinh được trong môi trường node (mock), nằm trong 16x16
try {
  execSync(`node --input-type=module -e "
    import('./src/utils/emoteIcons.js').then(m => {
      const generateEmoteIcons = m.generateEmoteIcons;
      const rects = {};
      global.document = { createElement: () => {
        const c = { width: 0, height: 0, _rects: [],
          getContext: () => ({ _fill: '#000',
            set fillStyle(v){ this._fill = v; }, get fillStyle(){ return this._fill; },
            fillRect(x,y,w,h){ c._rects.push([x,y,w,h]); } }) };
        return c;
      }};
      const scene = { textures: { exists: () => false, remove: () => {}, addCanvas: (k, c) => { rects[k] = c._rects; } } };
      generateEmoteIcons(scene);
      const keys = Object.keys(rects);
      if (keys.length !== 12) throw new Error('expected 12, got ' + keys.length);
      for (const k of keys) {
        for (const [x,y,w,h] of rects[k]) {
          if (x < 0 || y < 0 || x + w > 16 || y + h > 16) throw new Error(k + ' out of 16x16 bounds');
        }
      }
      console.log('12 icons (8 emote + 4 touch), all in 16x16 bounds');
    });
  "`, { stdio: 'pipe' });
  ok(true, '12 icons sinh được, nằm trong 16x16');
} catch (e) { ok(false, 'generateEmoteIcons lỗi: ' + e.message); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
