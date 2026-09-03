import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - Dynamic Ambient Particles, Juice & Achievement Mastery Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Tester Master');
    await page.locator('#gate-form-guest button[type="submit"]').click();

    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });

    // Đóng hướng dẫn tân thủ nếu xuất hiện
    const closeBtn = page.locator('#onboarding-close-btn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('01. Ambient Environment Manager initializes room-specific particle emitters', async ({ page }) => {
    const ambientStatus = await page.evaluate(async () => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene || !scene.ambientManager) return null;

      // Kiểm tra phòng mặc định (main_hall)
      const initialCount = scene.ambientManager.activeEmitters.length;

      // Đổi sang Vườn Trà (tea_garden)
      scene.ambientManager.setRoom('tea_garden');
      const teaGardenCount = scene.ambientManager.activeEmitters.length;

      // Đổi sang Tech Lab (dever_lab)
      scene.ambientManager.setRoom('dever_lab');
      const labCount = scene.ambientManager.activeEmitters.length;

      // Đổi sang Căn Tin (canteen_cafe)
      scene.ambientManager.setRoom('canteen_cafe');
      const cafeCount = scene.ambientManager.activeEmitters.length;

      return {
        initialCount,
        teaGardenCount,
        labCount,
        cafeCount
      };
    });

    expect(ambientStatus).not.toBeNull();
    expect(ambientStatus.initialCount).toBeGreaterThan(0);
    expect(ambientStatus.teaGardenCount).toBeGreaterThan(0);
    expect(ambientStatus.labCount).toBeGreaterThan(0);
    expect(ambientStatus.cafeCount).toBeGreaterThan(0);
  });

  test('02. Juice Manager renders floating text and screen shake cleanly', async ({ page }) => {
    const juiceResult = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene || !scene.juiceManager) return null;

      // Hiển thị chữ số bay thử nghiệm
      scene.juiceManager.showFloatingText(400, 300, '+100 ĐIỂM!', {
        color: '#facc15',
        fontSize: '14px'
      });

      // Kích hoạt micro shake
      scene.juiceManager.screenShake(100, 0.003);

      return true;
    });

    expect(juiceResult).toBe(true);
    await page.waitForTimeout(400);
  });

  test('03. Achievement Manager unlocks achievements and shows Golden Toast Banner', async ({ page }) => {
    // Kích hoạt mở khóa một danh hiệu mới (stage_dancer)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene?.achievementManager?.unlock('stage_dancer');
    });

    const isUnlocked = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return scene?.achievementManager?.isUnlocked('stage_dancer');
    });

    expect(isUnlocked).toBe(true);

    // Kiểm tra Golden Toast Banner hiển thị trong DOM
    const banner = page.locator('.achievement-toast-banner').filter({ hasText: 'Vũ Công Sàn Diễn' });
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText('Vũ Công Sàn Diễn');
    await expect(banner).toContainText('+25');
  });

  test('04. Interacting with Golden Frog unlocks Lộc Cóc Vàng achievement', async ({ page }) => {
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (scene?.interactiveModal) {
        scene.interactiveModal.show({
          id: 'zone_main_frog',
          type: 'golden_frog_fortune',
          name: 'Linh Vật Cóc Vàng FUDA'
        });
      }
    });

    const isFrogUnlocked = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return scene?.achievementManager?.isUnlocked('golden_frog');
    });

    expect(isFrogUnlocked).toBe(true);
  });

  test('05. Campus Ticker is present in footer and displays live rotation text', async ({ page }) => {
    const tickerText = page.locator('#campus-ticker-text');
    // Trên Desktop view, Ticker phải hiển thị
    const isMobile = await page.evaluate(() => window.innerWidth <= 768);
    if (!isMobile) {
      await expect(tickerText).toBeVisible();
      const text = await tickerText.textContent();
      expect(text.length).toBeGreaterThan(10);
    }
  });

  test('06. Unlocked achievements persist reliably in localStorage', async ({ page }) => {
    const stored = await page.evaluate(() => {
      return localStorage.getItem('dever_unlocked_achievements');
    });

    expect(stored).not.toBeNull();
    const list = JSON.parse(stored);
    expect(Array.isArray(list)).toBe(true);
    expect(list).toContain('first_arrival');
  });
});
