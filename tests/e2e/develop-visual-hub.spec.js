import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - Develop Branch Visual Polish & Cóc Vàng Shrine Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Nhập tên và đăng nhập với tư cách khách
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Tester Develop');
    await page.locator('#gate-form-guest button[type="submit"]').click();

    // Chờ màn hình đón tiếp và loading screen ẩn đi
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  });

  test('01. Header bar maintains compact single row height (<= 52px) without breaking', async ({ page }) => {
    const header = page.locator('#main-header');
    await expect(header).toBeVisible();

    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    // Header phải luôn luôn nằm gọn trong 1 dòng (chiều cao <= 52px)
    expect(box.height).toBeLessThanOrEqual(52);
  });

  test('02. Minimap Radar HUD is visible and does not collide with chat panel', async ({ page, isMobile }) => {
    const minimap = page.locator('#minimap-overlay');
    await expect(minimap).toBeVisible();

    if (!isMobile) {
      const chat = page.locator('#chat-wrapper');
      await expect(chat).toBeVisible();

      const minimapBox = await minimap.boundingBox();
      const chatBox = await chat.boundingBox();

      expect(minimapBox).not.toBeNull();
      expect(chatBox).not.toBeNull();

      // Minimap ở bên trái, chat ở bên phải -> hoàn toàn không đè lên nhau
      expect(minimapBox.x + minimapBox.width).toBeLessThanOrEqual(chatBox.x);
    }
  });

  test('03. Cóc Vàng Tâm Linh Daily Fortune can be interacted and awards quẻ', async ({ page }) => {
    // Kích hoạt zone Cóc Vàng từ WorldScene qua window.__DEVER_GAME__
    await page.evaluate(() => {
      const worldScene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (worldScene && worldScene.interactiveModal) {
        worldScene.interactiveModal.show({
          id: 'zone_main_frog',
          type: 'golden_frog_fortune',
          name: 'Linh Vật Cóc Vàng FUDA',
          label: 'Bái Cóc Vàng'
        });
      }
    });

    const modal = page.locator('#interactive-modal');
    await expect(modal).toBeVisible();

    const frogPane = page.locator('#pane-golden-frog');
    await expect(frogPane).toBeVisible();

    const drawBtn = page.locator('#btn-draw-fortune');
    await expect(drawBtn).toBeVisible();

    // Bấm bái Cóc Vàng
    await drawBtn.click();

    // Quẻ bói phải cập nhật
    const grade = page.locator('#oracle-grade');
    await expect(grade).not.toHaveText('QUẺ CỦA BẠN');
    const reward = page.locator('#oracle-reward');
    await expect(reward).toContainText(/Dever Points/);
  });
});
