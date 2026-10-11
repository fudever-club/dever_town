/**
 * verify_item_icons.js — kiểm tra static cho pixel item icons 16x16.
 */
import { readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL:', msg); }
};

const TG = readFileSync('src/utils/TextureGenerator.js', 'utf8');
const BS = readFileSync('src/scenes/BootScene.js', 'utf8');
const IM = readFileSync('src/ui/gameplay/InventoryModal.js', 'utf8');
const WS = readFileSync('src/scenes/WorldScene.js', 'utf8');
// CSS is modular since 2026-10-07 (main.css @imports modules): scan all stylesheets.
const CSS = readdirSync('src/styles').filter(f => f.endsWith('.css'))
  .map(f => readFileSync(`src/styles/${f}`, 'utf8')).join('\n');

// 1. generateItemIcons tồn tại và đủ 7 items
ok(TG.includes('static generateItemIcons(scene)'), 'có generateItemIcons');
const itemIds = ['macbook_dev', 'keychron_kb', 'gaming_mouse', 'golden_frog_plush',
  'fptu_keychain', 'thermos_coffee', 'danang_salt_coffee',
  'fuda_banh_mi', 'hackathon_trophy', 'football_ball', 'basketball_ball', 'dever_flag'];
for (const id of itemIds) {
  ok(TG.includes(`${id}(ctx)`), `vẽ icon '${id}'`);
}
ok(TG.includes("canvas.width = 16; canvas.height = 16"), 'icon chuẩn 16x16');
ok(TG.includes('static getItemIconURL(scene, itemId)'), 'có getItemIconURL');

// 2. BootScene gọi generateItemIcons
ok(BS.includes('TextureGenerator.generateItemIcons(this)'), 'BootScene sinh item icons');

// 3. InventoryModal dùng pixel icons
ok(IM.includes("import { TextureGenerator }"), 'InventoryModal import TextureGenerator');
ok(IM.includes('getItemIconHTML(item)'), 'InventoryModal có getItemIconHTML');
ok(IM.includes('image-rendering: pixelated'), 'icon render pixelated');
ok(IM.includes('iconBigEl.innerHTML = this.getItemIconHTML(item)'), 'detail icon dùng pixel icon');
ok(IM.includes('item.icon</span>') || IM.includes('${item.icon}'), 'fallback emoji còn giữ');

// 4. WorldScene truyền scene
ok(WS.includes('scene: this') && WS.includes('new InventoryModal'), 'WorldScene truyền scene cho InventoryModal');

// 5. CSS
ok(CSS.includes('.item-icon-img'), 'CSS có .item-icon-img');
ok(CSS.includes('#inv-detail-icon-big .item-icon-img'), 'CSS có detail icon lớn');

// 6. Icons sinh được trong môi trường node (mock)
try {
  execSync(`node --input-type=module -e "
    import('./src/utils/TextureGenerator.js').then(m => {
      const TG = m.TextureGenerator;
      const rects = {};
      global.document = { createElement: () => {
        const c = { width: 0, height: 0, _rects: [],
          getContext: () => ({ _fill: '#000',
            set fillStyle(v){ this._fill = v; }, get fillStyle(){ return this._fill; },
            fillRect(x,y,w,h){ c._rects.push([x,y,w,h]); } }) };
        return c;
      }};
      const scene = { textures: { exists: () => false, remove: () => {}, addCanvas: (k, c) => { rects[k] = c._rects; } } };
      TG.generateItemIcons(scene);
      const keys = Object.keys(rects);
      if (keys.length !== 12) throw new Error('expected 12, got ' + keys.length);
      for (const k of keys) {
        for (const [x,y,w,h] of rects[k]) {
          if (x < 0 || y < 0 || x + w > 16 || y + h > 16) throw new Error(k + ' out of 16x16 bounds');
        }
      }
      console.log('7 icons, all in 16x16 bounds');
    });
  "`, { stdio: 'pipe' });
  ok(true, '12 icons sinh được, nằm trong 16x16');
} catch (e) { ok(false, 'generateItemIcons lỗi: ' + e.message); }


// 7. Badge icons
const AM = readFileSync('src/managers/AchievementManager.js', 'utf8');
ok(TG.includes('static generateBadgeIcons(scene)'), 'có generateBadgeIcons');
const badgeIds = ['first_arrival', 'speed_coder', 'coffee_salt', 'golden_frog',
  'striker', 'tech_pro', 'stage_dancer', 'campus_scholar',
  'bestie_streak_3', 'metaverse_friends_3'];
for (const id of badgeIds) {
  ok(TG.includes(`${id}(ctx, R)`), `vẽ badge '${id}'`);
}
ok(BS.includes('TextureGenerator.generateBadgeIcons(this)'), 'BootScene sinh badge icons');
ok(AM.includes('getBadgeIconURL(this.scene, achievementId)'), 'showBanner dùng badge icon');
ok(AM.includes('showBanner(achievementId, ach)'), 'showBanner nhận achievementId');
ok(CSS.includes('.achievement-toast-icon img'), 'CSS có badge img pixelated');
try {
  execSync(`node --input-type=module -e "
    import('./src/utils/TextureGenerator.js').then(m => {
      const TG = m.TextureGenerator;
      const rects = {};
      global.document = { createElement: () => {
        const c = { width: 0, height: 0, _rects: [],
          getContext: () => ({ _fill: '#000',
            set fillStyle(v){ this._fill = v; }, get fillStyle(){ return this._fill; },
            fillRect(x,y,w,h){ c._rects.push([x,y,w,h]); } }) };
        return c;
      }};
      const scene = { textures: { exists: () => false, remove: () => {}, addCanvas: (k, c) => { rects[k] = c._rects; } } };
      TG.generateBadgeIcons(scene);
      const keys = Object.keys(rects);
      if (keys.length !== 10) throw new Error('expected 10, got ' + keys.length);
      for (const k of keys) for (const [x,y,w,h] of rects[k])
        if (x < 0 || y < 0 || x + w > 16 || y + h > 16) throw new Error(k + ' OOB');
      console.log('10 badges ok');
    });
  "`, { stdio: 'pipe' });
  ok(true, '10 badges sinh được, trong 16x16');
} catch (e) { ok(false, 'generateBadgeIcons lỗi'); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

