import { test, expect } from '@playwright/test';

test.describe('Phase 2 - Transition & Weather visual check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Tester Phase2');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2500);
  });

  test('portal transition shows pixel-dissolve mid-way', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    // Kích hoạt transition thủ công qua scene, poll tới giữa dissolve
    const mid = await page.evaluate(async () => {
      const game = window.__DEVER_GAME__;
      const scene = game.scene.getScenes(true).find(s => s.scene.key === 'WorldScene') || game.scene.getScenes(true)[0];
      if (!scene || !scene.transitionManager) return { ok: false };
      const tm = scene.transitionManager;
      const promise = tm.transition(async () => {});
      // Poll tới khi dissolve đang ở giữa chừng (threshold (0,1)), timeout 8s
      // vì headless frame đầu chậm có thể delay timer của game loop
      const t0 = performance.now();
      let threshold = 0;
      let visible = false;
      while (performance.now() - t0 < 8000) {
        threshold = tm.threshold;
        visible = tm.overlay.visible;
        if (threshold > 0.1 && threshold < 1 && visible) break;
        await new Promise(r => setTimeout(r, 100));
      }
      const captured = { threshold, visible };
      await promise;
      return { ok: true, ...captured, transitioning: tm.isTransitioning };
    });

    expect(mid.ok).toBe(true);
    expect(mid.threshold).toBeGreaterThan(0.1);
    expect(mid.threshold).toBeLessThan(1);
    expect(mid.visible).toBe(true);
    expect(mid.transitioning).toBe(false);
    expect(errors).toEqual([]);
  });

  test('rain starts with streaks + tint, then stops cleanly', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const result = await page.evaluate(async () => {
      const game = window.__DEVER_GAME__;
      const scene = game.scene.getScenes(true).find(s => s.scene.key === 'WorldScene') || game.scene.getScenes(true)[0];
      const am = scene.ambientManager;
      am.startRain(0.7);
      await new Promise(r => setTimeout(r, 1200));
      const during = {
        weather: am.weather,
        hasEmitter: !!am.rainEmitter,
        tintAlpha: am.rainTint ? am.rainTint.alpha : null,
      };
      am.stopRain();
      await new Promise(r => setTimeout(r, 2300));
      const after = { weather: am.weather, hasEmitter: !!am.rainEmitter };
      return { during, after, room: am.currentRoomId };
    });

    expect(result.during.weather).toBe('rain');
    expect(result.during.hasEmitter).toBe(true);
    expect(result.during.tintAlpha).toBeGreaterThan(0);
    expect(result.after.weather).toBe('clear');
    expect(result.after.hasEmitter).toBe(false);
    expect(errors).toEqual([]);
  });

  test('clouds drift in outdoor room', async ({ page }) => {
    const result = await page.evaluate(() => {
      const game = window.__DEVER_GAME__;
      const scene = game.scene.getScenes(true).find(s => s.scene.key === 'WorldScene') || game.scene.getScenes(true)[0];
      const am = scene.ambientManager;
      return {
        room: am.currentRoomId,
        cloudCount: am.cloudSprites.length,
        allActive: am.cloudSprites.every(c => c.active),
      };
    });
    // main_hall là phòng ngoài trời -> phải có mây
    expect(result.room).toBe('main_hall');
    expect(result.cloudCount).toBeGreaterThan(0);
    expect(result.allActive).toBe(true);
  });
});
