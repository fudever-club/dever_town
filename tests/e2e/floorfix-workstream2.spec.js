import { test, expect } from '@playwright/test';

// WORKSTREAM 2 — verify debanded courtyard map renders in main_hall.
const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function login(page) {
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });
  await page.goto('/');
  await page.locator('#gate-guest-name').fill('Floorfix Tester');
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  const startBtn = page.locator('button:has-text("Bắt Đầu Chơi Ngay"), button:has-text("Đã Hiểu")').first();
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.evaluate(() => document.querySelector('#onboarding-close-btn')?.click());
    await page.waitForTimeout(500);
  }
  await page.locator('#room-selector').selectOption('main_hall');
  await page.waitForFunction(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s && s.currentRoomId === 'main_hall' && (s.floorManager ? s.floorManager.currentFloor : 0) === 0;
  }, { timeout: 15000 });
  await page.waitForTimeout(1500);
}

test('debanded courtyard map loads and renders', async ({ page }) => {
  const requested = [];
  page.on('response', (r) => {
    if (r.url().includes('devertown_map')) requested.push(r.url());
  });
  await login(page);

  const state = await page.evaluate(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return {
      room: s.currentRoomId,
      texExists: s.textures.exists('map_alpha_v2'),
      paintedBg: !!s._paintedBg,
      bgVisible: s._paintedBg ? s._paintedBg.visible : null,
    };
  });
  expect(state.room).toBe('main_hall');
  expect(state.texExists).toBe(true);
  expect(state.paintedBg).toBe(true);
  expect(state.bgVisible).toBe(true);
  // debanded file (not the original) must have been requested
  expect(requested.some((u) => u.includes('devertown_map_v2_debanded.jpg'))).toBe(true);
  expect(requested.some((u) => u.includes('devertown_map_clean_alpha_v2.jpg'))).toBe(false);

  // full courtyard shot
  await page.evaluate(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    s.player.setPosition(746, 620); s.player.body.reset(746, 620); s.player.body.setVelocity(0, 0);
    s.cameras.main.centerOn(688, 480);
    document.querySelectorAll('#app > :not(#main-content)').forEach((el) => { el.style.display = 'none'; });
    document.querySelectorAll('#main-content > :not(#game-container)').forEach((el) => { el.style.display = 'none'; });
  });
  await page.waitForTimeout(800);
  await page.locator('#game-container canvas').screenshot({ path: `${IMG_DIR}/floorfix-courtyard-full.png` });

  // zoomed floor region (cobblestone near fountain)
  await page.evaluate(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    s.applyZoomImmediate(s.getZoomRange().max);
    s.cameras.main.centerOn(740, 480);
  });
  await page.waitForTimeout(800);
  await page.locator('#game-container canvas').screenshot({ path: `${IMG_DIR}/floorfix-courtyard-zoom.png` });
});
