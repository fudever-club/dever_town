/**
 * Workstream 3 — Text rendering fix verification (2026-10-12)
 * Chụp mọi loại label map/HUD ở deviceScaleFactor 2 để chứng minh chữ sắc nét:
 * portal label, zone badge, E prompt (cyber-glass + key cap), NPC tag,
 * player tag, room title HUD, room banner DOM.
 * Đồng thời kiểm tra document.fonts: Be Vietnam Pro 700 đã load thật.
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const OUT = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';
fs.mkdirSync(OUT, { recursive: true });

test.use({ deviceScaleFactor: 2 });
test.setTimeout(120000);

test.describe('Workstream 3 — textfix screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('dever_onboarded_v1', '1');
      localStorage.setItem('dever_chat_hint_seen', '1');
    });
    await page.goto('/');
    await page.locator('#gate-guest-name').fill('Text Tester');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 20000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 20000 });
    const startBtn = page.locator('button:has-text("Đã Hiểu, Bắt Đầu Chơi Ngay")');
    if (await startBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(600);
    }
    await page.waitForTimeout(6000);
    await page.evaluate(() => {
      document.querySelectorAll('.achievement-toast, .dever-toast').forEach(el => el.remove());
    });
    const fontOk = await page.evaluate(() =>
      document.fonts ? document.fonts.check('700 11px "Be Vietnam Pro"') : false);
    console.log('FONT Be Vietnam Pro 700 loaded:', fontOk);
    expect(fontOk, 'Be Vietnam Pro 700 phải được load (document.fonts.check)').toBe(true);
  });

  // Đưa player tới (wx,wy), chờ camera settle hẳn, chụp ngay tại vị trí đọc 1 lần
  // (đúng mapping world→screen có nhân camera zoom).
  async function settleAndShot(page, wx, wy, w, h, name) {
    const box = await page.evaluate(([x, y, bw, bh]) => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene?.player) return null;
      scene.player.setPosition(x, y);
      return new Promise((resolve) => {
        let last = null, stable = 0;
        const iv = setInterval(() => {
          const cam = scene.cameras.main;
          const key = Math.round(cam.scrollX) + ':' + Math.round(cam.scrollY);
          if (key === last) { stable++; } else { stable = 0; last = key; }
          if (stable >= 6) {
            clearInterval(iv);
            const r = document.querySelector('#game-container canvas').getBoundingClientRect();
            const sx = r.left + (x - cam.scrollX) * cam.zoom;
            const sy = r.top + (y - cam.scrollY) * cam.zoom;
            resolve({ x: Math.max(0, sx - bw / 2), y: Math.max(0, sy - bh / 2), w: bw, h: bh });
          }
        }, 120);
        setTimeout(() => { clearInterval(iv); resolve(null); }, 12000);
      });
    }, [wx, wy, w, h]);
    expect(box, `camera settle cho ${name}`).toBeTruthy();
    await page.screenshot({
      path: path.join(OUT, `textfix-${name}.png`),
      clip: { x: box.x, y: box.y, width: box.w, height: box.h },
    });
  }

  test('portal label crisp @2x', async ({ page }) => {
    const portal = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const lbl = scene?.portalLabels?.[0];
      return lbl ? { x: lbl.getData('portalX'), y: lbl.getData('portalY'), txt: lbl.getData('txt')?.text } : null;
    });
    expect(portal, 'có portal label').toBeTruthy();
    console.log('PORTAL:', portal.txt);
    // Đứng cách portal 150px (< NEAR_PX 240): nhãn hiện đầy đủ tự nhiên
    await settleAndShot(page, portal.x, portal.y + 150, 620, 200, 'portal-label');
  });

  test('zone badge crisp @2x', async ({ page }) => {
    const badge = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const bd = scene?.interactionManager?.badges?.find(b => b.container?.visible);
      return bd ? { x: bd.container.x, y: bd.container.y } : null;
    });
    expect(badge, 'có zone badge').toBeTruthy();
    await settleAndShot(page, badge.x, badge.y + 100, 560, 190, 'zone-badge');
  });

  test('E prompt cyber-glass + key cap @2x', async ({ page }) => {
    const ep = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const im = scene?.interactionManager;
      const z = im?.zones?.[0];
      if (!z) return null;
      return { id: z.id, zx: z.worldX ?? z.x, zy: z.worldY ?? z.y };
    });
    expect(ep, 'có zone').toBeTruthy();
    console.log('E ZONE:', ep.id);
    // Đứng ngay tâm zone: update loop tự gọi showHUD (đúng production path)
    await settleAndShot(page, ep.zx, ep.zy, 640, 200, 'e-prompt');
    const hud = await page.evaluate(() => {
      const im = window.__DEVER_GAME__.scene.keys.WorldScene.interactionManager;
      return {
        vis: im.hudContainer.visible,
        keycap: im.keycapText?.text,
        tip: im.tooltipText?.text,
      };
    });
    expect(hud.vis, 'E prompt hiển thị').toBe(true);
    expect(hud.keycap, 'key cap "E" render').toBe('E');
    console.log('E PROMPT:', JSON.stringify(hud));
  });

  test('NPC tag + player name tag @2x', async ({ page }) => {
    const pos = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const npc = scene?.npcGroup?.[0];
      const p = scene?.player;
      return {
        npc: npc ? { x: npc.x, y: npc.y } : null,
        player: p ? { x: p.x, y: p.y } : null,
      };
    });
    expect(pos.npc, 'có NPC').toBeTruthy();
    await settleAndShot(page, pos.npc.x, pos.npc.y + 60, 480, 200, 'npc-tag');
    await settleAndShot(page, pos.player.x, pos.player.y, 480, 200, 'player-tag');
  });

  test('room title HUD + room banner DOM @2x', async ({ page }) => {
    const r = await page.evaluate(() => {
      const q = document.querySelector('#game-container canvas').getBoundingClientRect();
      return { l: q.left, t: q.top };
    });
    await page.screenshot({
      path: path.join(OUT, 'textfix-room-title.png'),
      clip: { x: r.l, y: r.t, width: 400, height: 110 },
    });
    await page.evaluate(() => {
      window.__DEVER_GAME__?.scene?.keys?.WorldScene?.roomBanner?.show('main_hall', 3);
    });
    await page.waitForTimeout(900);
    const banner = page.locator('#room-banner.visible');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await banner.screenshot({ path: path.join(OUT, 'textfix-room-banner.png') });
    // House rule: không emoji trong UI
    const iconText = await page.evaluate(() =>
      document.querySelector('#room-banner-icon')?.textContent ?? null);
    expect(iconText, 'room banner không còn emoji').toBe('');
  });
});
