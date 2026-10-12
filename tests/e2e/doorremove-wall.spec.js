import { test, expect } from '@playwright/test';

const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function login(page, name = 'DoorRemove Tester') {
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
    return s && s.currentRoomId === r;
  }, roomId, { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function movePlayer(page, x, y, snapCamera = false) {
  await page.evaluate(([px, py, snap]) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    s.player.setPosition(px, py);
    s.player.body.reset(px, py);
    s.player.body.setVelocity(0, 0);
    if (snap) s.cameras.main.centerOn(px, py);
  }, [x, y, snapCamera]);
  await page.waitForTimeout(400);
}

async function waitTeleportReady(page) {
  await page.waitForFunction(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return performance.now() > s.teleportGraceUntil;
  }, { timeout: 15000 });
}

test.describe('doorremove: door fully removed, wall + rug only', () => {
  test('wall close-up screenshots (1x + 2x)', async ({ page }) => {
    test.setTimeout(90000);
    await login(page);
    await gotoRoom(page, 'alpha_interior');
    await waitTeleportReady(page);
    await movePlayer(page, 690, 620, true);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${IMG_DIR}/doorremove-wall-closeup-1x.png` });
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.cameras.main.setZoom(s.cameras.main.zoom * 1.7);
      s.cameras.main.centerOn(690, 665);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${IMG_DIR}/doorremove-wall-closeup-2x.png` });
  });

  test('walk onto rug -> exits to courtyard', async ({ page }) => {
    test.setTimeout(90000);
    await login(page);
    await gotoRoom(page, 'alpha_interior');
    await waitTeleportReady(page);
    // walk down onto the rug / exit portal pad (680,676)
    await movePlayer(page, 680, 640);
    await page.keyboard.down('ArrowDown');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'main_hall';
    }, { timeout: 12000 });
    await page.keyboard.up('ArrowDown');
    await page.waitForTimeout(1200);
    // full lobby view with removed door for the report
    await gotoRoom(page, 'alpha_interior');
    await waitTeleportReady(page);
    await movePlayer(page, 690, 560, true);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${IMG_DIR}/doorremove-lobby-overview.png` });
  });
});
