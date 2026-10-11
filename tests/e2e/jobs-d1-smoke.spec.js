import { test, expect } from '@playwright/test';

/**
 * Phase D1 smoke: dock button [2] opens Jobs modal; 5 job cards render;
 * cleaner job starts in main_hall and spawns litter sprites.
 */
test.describe('Jobs D1 smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('dever_onboarded_v1', '1');
      localStorage.setItem('dever_chat_hint_seen', '1');
    });
  });

  async function enterWorld(page, name) {
    await page.goto('/');
    await page.locator('#gate-guest-name').fill(name);
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(
      () => !!window.__DEVER_GAME__?.scene?.keys?.WorldScene?.jobsModal,
      null, { timeout: 15000 }
    );
  }

  test('dock [2] opens Jobs modal with 5 job cards', async ({ page }) => {
    await enterWorld(page, 'JobsTester');
    // Mở qua nút dock (data-dock-action="jobs").
    await page.locator('.dock-action-btn[data-dock-action="jobs"]').click();
    const modal = page.locator('#jobs-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(modal.locator('.jobs-card')).toHaveCount(5);
    await expect(modal).toContainText('Lao Công Campus');
    await expect(modal).toContainText('Giao Hàng KTX');
    await expect(modal).toContainText('Săn Bọ Đêm');
    // Không emoji trong modal.
    const text = await modal.innerText();
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    // Đóng bằng Escape.
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);
  });

  test('hotkey 2 toggles Jobs modal', async ({ page }) => {
    await enterWorld(page, 'JobsHotkey');
    await page.keyboard.press('Digit2');
    await expect(page.locator('#jobs-modal')).not.toHaveClass(/hidden/);
    await page.keyboard.press('Digit2');
    await expect(page.locator('#jobs-modal')).toHaveClass(/hidden/);
  });

  test('cleaner job starts and spawns litter in main_hall', async ({ page }) => {
    await enterWorld(page, 'CleanerRunner');
    const started = await page.evaluate(() => {
      const ws = window.__DEVER_GAME__.scene.keys.WorldScene;
      ws.jobsModal.open();
      const btn = document.querySelector('#jobs-grid .jobs-start-btn[data-job="cleaner"]');
      btn.click();
      const inst = ws.jobsModal._jobs.cleaner;
      return {
        active: ws.jobsModal.activeJob?.id,
        state: inst?.getState(),
        litter: inst?.getRemainingCount(),
        bins: inst?.bins?.length,
      };
    });
    expect(started.active).toBe('cleaner');
    expect(started.state).toBe('active');
    expect(started.litter).toBe(8);
    expect(started.bins).toBe(2);
    // Status pill hiển thị.
    await expect(page.locator('#jobs-status-pill')).not.toHaveClass(/hidden/);
    await expect(page.locator('#jobs-status-pill')).toContainText('Lao công');
  });
});
