import { test, expect } from '@playwright/test';

// Ảnh phân cấp cổng cho review: prefix hierarchy-, desktop 1280x800.
const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function login(page, name = 'Hierarchy Review') {
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });
  await page.goto('/');
  await page.locator('#gate-guest-name').fill(name);
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  const startBtn = page.locator('button:has-text("Bắt Đầu Chơi Ngay"), button:has-text("Đã Hiểu")').first();
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.evaluate(() => document.querySelector('#onboarding-close-btn')?.click());
    await page.waitForTimeout(500);
  }
}

async function gotoRoom(page, roomId) {
  await page.locator('#room-selector').selectOption(roomId);
  await page.waitForFunction((r) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s && s.currentRoomId === r && (s.floorManager ? s.floorManager.currentFloor : 0) === 0;
  }, roomId, { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function cleanOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#app > :not(#main-content)')
      .forEach(el => { el.style.display = 'none'; });
    document.querySelectorAll('#main-content > :not(#game-container)')
      .forEach(el => { el.style.display = 'none'; });
    ['#minimap-overlay', '.dever-zoom-controls', '#daily-goal-hud',
     '.achievement-toast-banner', '#lag-spinner-overlay', '#network-banner',
     '.server-status-banner', '#toast-container', '.toast-stack'
    ].forEach(sel => document.querySelectorAll(sel)
      .forEach(el => { el.style.display = 'none'; }));
  });
}

async function fitZoom(page, cx = 688, cy = 384) {
  await page.evaluate(([x, y]) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    const r = s.getZoomRange();
    s.applyZoomImmediate(r.min);
    s.cameras.main.centerOn(x, y);
  }, [cx, cy]);
  await page.waitForTimeout(800);
}

async function zoomShot(page, name, x, y, z) {
  await page.evaluate(([px, py, zz]) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    // đứng gần để nhãn portal hiện rõ (không bị fade theo khoảng cách)
    s.player.setPosition(px, py + 60);
    s.player.body.reset(px, py + 60);
    s.player.body.setVelocity(0, 0);
    s.applyZoomImmediate(zz);
    s.cameras.main.centerOn(px, py);
  }, [x, y, z]);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${IMG_DIR}/${name}.png` });
}

test.describe('hierarchy screenshots — desktop 1280x800', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.beforeEach(async ({ page }) => { await login(page); });

  test('courtyard overview + interior lobby + walkthrough', async ({ page }, testInfo) => {
    testInfo.setTimeout(180000);
    // 1. Sân: chỉ còn cổng ngoài trời
    await gotoRoom(page, 'main_hall');
    await cleanOverlays(page);
    await fitZoom(page);
    await page.screenshot({ path: `${IMG_DIR}/hierarchy-courtyard-overview.png` });
    // 2. Sảnh Alpha: 4 cổng mới hiển thị
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.loadRoom('alpha_interior', 680, 580, false);
    });
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s && s.currentRoomId === 'alpha_interior';
    }, { timeout: 15000 });
    await page.waitForTimeout(1500);
    await cleanOverlays(page);
    await fitZoom(page, 688, 384);
    await page.screenshot({ path: `${IMG_DIR}/hierarchy-interior-lobby.png` });
    // 3. Close-up pixel-check các cổng mới
    await zoomShot(page, 'hierarchy-zoom-library-memory', 825, 280, 2.2);
    await zoomShot(page, 'hierarchy-zoom-meeting', 1000, 520, 2.2);
    await zoomShot(page, 'hierarchy-zoom-booth', 1200, 350, 2.2);
    // 4. Walkthrough: sảnh -> cổng thư viện -> trong thư viện
    await fitZoom(page, 688, 384);
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.player.setPosition(700, 240);
      s.player.body.reset(700, 240);
      s.player.body.setVelocity(0, 0);
    });
    await page.waitForTimeout(400);
    await page.keyboard.down('ArrowDown');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'library_lounge';
    }, { timeout: 15000 });
    await page.keyboard.up('ArrowDown');
    await page.waitForTimeout(1500);
    await cleanOverlays(page);
    await fitZoom(page, 400, 350);
    await page.screenshot({ path: `${IMG_DIR}/hierarchy-walkthrough-library.png` });
    // 5. Walkthrough: thư viện -> cổng trả -> sảnh Alpha
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return performance.now() > s.teleportGraceUntil;
    }, { timeout: 15000 });
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.player.setPosition(384, 400);
      s.player.body.reset(384, 400);
      s.player.body.setVelocity(0, 0);
    });
    await page.keyboard.down('ArrowDown');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'alpha_interior';
    }, { timeout: 12000 });
    await page.keyboard.up('ArrowDown');
    const back = await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return { x: Math.round(s.player.x), y: Math.round(s.player.y) };
    });
    console.log('RETURN-SPAWN', JSON.stringify(back));
    await page.waitForTimeout(1000);
    await cleanOverlays(page);
    await fitZoom(page, 688, 384);
    await page.screenshot({ path: `${IMG_DIR}/hierarchy-walkthrough-return.png` });
  });
});
