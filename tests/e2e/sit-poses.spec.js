import { test, expect } from '@playwright/test';

test.describe('Sitting poses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Sit Tester');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
    // Switch to dorm_room
    await page.locator('#room-selector').selectOption('dorm_room');
    await page.waitForTimeout(2000);
  });

  test('E near desk chair -> sit_upright pose with sit animation', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene || !scene.player) return { error: 'no scene/player' };
      const player = scene.player;
      // Chair zone at tile (8,4) -> world coords (8*32+16, 4*32+16) = (272, 144)
      player.setPosition(272, 144);
      // Check sit animation exists
      const animExists = scene.anims.exists('sit_upright_hoodie_dever');
      // Directly call sit (simulates what E does via onInteract)
      const sitResult = player.sit('upright');
      return {
        pose: player.pose,
        sitResult,
        animExists,
        isSitting: player.isSitting(),
      };
    });

    expect(result.error).toBeUndefined();
    expect(result.animExists).toBe(true);
    expect(result.sitResult).toBe(true);
    expect(result.pose).toBe('sit_upright');
    expect(result.isSitting).toBe(true);

    // Dismiss tutorial modal if visible, then screenshot the sitting character
    const tutorialBtn = page.locator('button:has-text("Đã Hiểu")');
    if (await tutorialBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tutorialBtn.click();
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/sit-upright-test.png' });
  });

  test('E near sofa -> sit_leanback, then E again -> stand up', async ({ page }) => {
    const result = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene || !scene.player) return { error: 'no scene/player' };
      const player = scene.player;
      // Sofa zone at tile (10,6) -> (336, 208)
      player.setPosition(336, 208);
      const animExists = scene.anims.exists('sit_leanback_hoodie_dever');
      player.sit('leanback');
      const poseAfterSit = player.pose;
      player.standUp();
      const poseAfterStand = player.pose;
      return { poseAfterSit, poseAfterStand, animExists, isSitting: player.isSitting() };
    });

    expect(result.error).toBeUndefined();
    expect(result.animExists).toBe(true);
    expect(result.poseAfterSit).toBe('sit_leanback');
    expect(result.poseAfterStand).toBe('stand');
    expect(result.isSitting).toBe(false);
  });
});
