/**
 * verify_emote_animations.js — kiểm tra static cho hệ thống emote body-animation.
 */
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', msg); }
};

const TG = readFileSync('src/utils/TextureGenerator.js', 'utf8');
const EA = readFileSync('src/utils/emoteAnimations.js', 'utf8');
const P = readFileSync('src/entities/Player.js', 'utf8');
const RP = readFileSync('src/entities/RemotePlayer.js', 'utf8');
const EB = readFileSync('src/ui/common/EmoteBar.js', 'utf8');
const BS = readFileSync('src/scenes/BootScene.js', 'utf8');

// 1. TextureGenerator sinh overlay
ok(TG.includes('generateEmoteOverlays'), 'TextureGenerator có generateEmoteOverlays');
ok(TG.includes("'emote_arm_wave'"), 'có texture emote_arm_wave');
ok(TG.includes("'emote_arms_power'"), 'có texture emote_arms_power');

// 2. Module emoteAnimations
ok(existsSync('src/utils/emoteAnimations.js'), 'tồn tại src/utils/emoteAnimations.js');
for (const id of ['wave', 'nod', 'power', 'dance']) {
  ok(EA.includes(`emoteId === '${id}'`), `playBodyEmote xử lý '${id}'`);
}
ok(EA.includes('syncEmoteOverlays'), 'có syncEmoteOverlays');
ok(EA.includes('clearEmoteOverlays'), 'có clearEmoteOverlays');
ok(EA.includes("y: '-=10'"), 'dance dùng tween tương đối (an toàn physics)');

// 3. Player + RemotePlayer hook
for (const [src, name] of [[P, 'Player'], [RP, 'RemotePlayer']]) {
  ok(src.includes('emoteAnimations.js'), `${name} import emoteAnimations`);
  ok(src.includes('playBodyEmote(this.scene, this, emoteId)'), `${name}.showEmote gọi playBodyEmote`);
  ok(src.includes('syncEmoteOverlays(this)'), `${name}.update gọi syncEmoteOverlays`);
  ok(src.includes("nod: '👍'") && src.includes("power: '💪'"), `${name} có icon nod/power`);
}

// 4. EmoteBar có 8 emotes + hotkey 7/8
ok(EB.includes("id: 'nod'") && EB.includes("id: 'power'"), 'EmoteBar có nod + power');
ok((EB.match(/hotkey: '/g) || []).length === 8, 'EmoteBar có đủ 8 hotkey');
ok(EB.includes('Digit7') && EB.includes('Digit8'), 'EmoteBar lắng nghe Digit7/Digit8');

// 5. BootScene sinh overlay
ok(BS.includes('generateEmoteOverlays(this)'), 'BootScene.create gọi generateEmoteOverlays');

// 6. Không còn wiggle dance cũ (đã thay bằng playBodyEmote)
ok(!P.includes('angle: { from: -8, to: 8 }'), 'Player không còn wiggle dance cũ');
ok(!RP.includes('angle: { from: -8, to: 8 }'), 'RemotePlayer không còn wiggle dance cũ');

// 7. Build import được module
try {
  execSync(`node --input-type=module -e "import('./src/utils/emoteAnimations.js').then(m => { if (!m.playBodyEmote || !m.syncEmoteOverlays || !m.clearEmoteOverlays || !m.isBodyEmote) throw new Error('missing'); console.log('exports ok'); })"`, { stdio: 'pipe' });
  ok(true, 'emoteAnimations import được');
} catch (e) { ok(false, 'emoteAnimations import lỗi'); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
