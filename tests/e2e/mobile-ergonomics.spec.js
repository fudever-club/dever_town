import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - Mobile Compatibility & Ergonomics Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Đặt viewport chuẩn mobile (iPhone SE 375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Mobile Tester');
    await page.locator('#gate-form-guest button[type="submit"]').click();

    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });

    // Đóng onboarding guide nếu có
    const onboardingBtn = page.locator('#onboarding-close-btn');
    if (await onboardingBtn.isVisible()) {
      await onboardingBtn.click();
      await page.waitForTimeout(400);
    }
  });

  test('01. Mobile Header fits seamlessly with zero horizontal overflow on 375px', async ({ page }) => {
    const headerMetrics = await page.evaluate(() => {
      const header = document.getElementById('main-header');
      if (!header) return null;
      return {
        clientWidth: header.clientWidth,
        scrollWidth: header.scrollWidth,
        overflows: header.scrollWidth > header.clientWidth
      };
    });

    expect(headerMetrics).not.toBeNull();
    expect(headerMetrics.overflows).toBe(false);
    expect(headerMetrics.scrollWidth).toBeLessThanOrEqual(headerMetrics.clientWidth);
  });

  test('02. Radar HUD auto-collapses on mobile viewport to maximize gameplay space', async ({ page }) => {
    const minimap = page.locator('.minimap-container');
    await expect(minimap).toBeVisible();

    // Trên mobile, Radar HUD phải tự động kích hoạt class collapsed
    await expect(minimap).toHaveClass(/collapsed/);

    // Bấm nút toggle để mở rộng
    const toggleBtn = page.locator('#minimap-toggle-btn');
    await toggleBtn.click();
    await expect(minimap).not.toHaveClass(/collapsed/);

    // Bấm lần nữa để thu gọn lại
    await toggleBtn.click();
    await expect(minimap).toHaveClass(/collapsed/);
  });

  test('03. Mobile Touch Controls cluster provides thumb access to Speed Duel and Emotes', async ({ page }) => {
    const duelBtn = page.locator('#touch-btn-speed-duel');
    const emoteBtn = page.locator('#touch-btn-emote');
    const invBtn = page.locator('#touch-btn-inventory');
    const interactBtn = page.locator('#touch-btn-interact');

    await expect(duelBtn).toBeVisible();
    await expect(emoteBtn).toBeVisible();
    await expect(invBtn).toBeVisible();
    await expect(interactBtn).toBeVisible();

    // Bấm nút Đấu Trí ⚡ -> Mở modal Đấu Trí
    await duelBtn.dispatchEvent('pointerdown');
    await duelBtn.dispatchEvent('pointerup');
    const duelModal = page.locator('#speed-code-duel-modal');
    await expect(duelModal).toBeVisible();
    await expect(duelModal).not.toHaveClass(/hidden/);

    // Đóng modal Đấu Trí
    const closeDuelBtn = page.locator('#duel-close-btn');
    if (await closeDuelBtn.isVisible()) {
      await closeDuelBtn.click();
    }

    // Bấm nút Biểu Cảm ✨ -> Mở thanh Emote Bar
    await emoteBtn.dispatchEvent('pointerdown');
    await emoteBtn.dispatchEvent('pointerup');
    const emoteBar = page.locator('#emote-bar');
    await expect(emoteBar).toBeVisible();
    await expect(emoteBar).not.toHaveClass(/hidden/);
  });

  test('04. Interactive Modal strictly hides inactive panes on mobile viewports', async ({ page }) => {
    // Mở modal Campus Map
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (scene?.interactiveModal) {
        scene.interactiveModal.show({ id: 'zone_campus', type: 'campus_map', name: 'Bản Đồ FPTU' });
      }
    });

    const modal = page.locator('#interactive-modal');
    await expect(modal).toBeVisible();
    await expect(modal).not.toHaveClass(/hidden/);

    // Pane campus map phải hiển thị
    const campusPane = page.locator('#pane-campus-map');
    await expect(campusPane).toBeVisible();
    await expect(campusPane).not.toHaveClass(/hidden/);

    // Kiểm tra các pane khác bị ẩn hoàn toàn (display: none)
    const hiddenPanes = ['#pane-slides', '#pane-meeting', '#pane-code', '#pane-coffee', '#pane-gallery'];
    for (const paneId of hiddenPanes) {
      const isVisible = await page.$eval(paneId, el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none';
      });
      expect(isVisible).toBe(false);
    }

    // Kiểm tra bố cục campus map workspace xếp thành 1 cột trên mobile
    const gridCols = await page.$eval('.campus-map-workspace', el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    // Chỉ có 1 cột (không có khoảng trống phân cách cột dạng '... ...')
    const colCount = gridCols.split(' ').length;
    expect(colCount).toBe(1);
  });
});
