import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - Vision & Map Inspection Invariants Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Tester Vision');
    await page.locator('#gate-form-guest button[type="submit"]').click();

    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  });

  test('01. Dropdown Room Selector options are compact and free of truncation', async ({ page }) => {
    const selector = page.locator('#room-selector');
    await expect(selector).toBeVisible();

    const options = await page.$$eval('#room-selector option', opts =>
      opts.map(o => ({ id: o.id, value: o.value, text: o.textContent.trim() }))
    );

    expect(options.length).toBe(9);
    for (const opt of options) {
      // Nhãn ngắn gọn <= 28 ký tự, không bao giờ bị cắt dấu ba chấm
      expect(opt.text.length).toBeLessThanOrEqual(28);
      expect(opt.text).not.toContain('...');
    }

    // Kiểm tra riêng biệt nhãn Arcade & Robot
    const arcadeOpt = options.find(o => o.value === 'game_arcade');
    expect(arcadeOpt).toBeDefined();
    expect(arcadeOpt.text).toContain('Arcade & Robot');
  });

  test('02. Merged portal labels in Main Hall and Library Lounge prevent label collision', async ({ page }) => {
    const portalLabels = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene || !scene.portalLabels) return [];
      return scene.portalLabels.map(l => ({ text: l.text, x: l.x, y: l.y }));
    });

    expect(portalLabels.length).toBeGreaterThan(0);

    // Kiểm tra không có 2 nhãn nào bị trùng hoàn toàn tọa độ
    for (let i = 0; i < portalLabels.length; i++) {
      for (let j = i + 1; j < portalLabels.length; j++) {
        const dx = Math.abs(portalLabels[i].x - portalLabels[j].x);
        const dy = Math.abs(portalLabels[i].y - portalLabels[j].y);
        // Khoảng cách giữa 2 nhãn bất kỳ phải >= 16px
        expect(dx > 16 || dy > 10).toBeTruthy();
      }
    }

    // Kiểm tra toàn bộ nhãn portal được kẹp an toàn trong biên canvas 800x608
    for (const label of portalLabels) {
      expect(label.x).toBeGreaterThanOrEqual(50);
      expect(label.x).toBeLessThanOrEqual(750);
      expect(label.y).toBeGreaterThanOrEqual(16);
      expect(label.y).toBeLessThanOrEqual(592);
    }
  });

  test('03. InteractionManager hides underlying badge on proximity to prevent ghost double text', async ({ page }) => {
    const badgeIntegrity = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const im = scene?.interactionManager;
      if (!im) return null;

      // Giả lập tiếp cận zone đầu tiên
      const firstZone = im.zones[0];
      if (!firstZone) return null;

      im.showHUD(firstZone);
      const activeBadge = im.badges.find(b => b.zoneId === firstZone.id);
      const isBadgeHidden = activeBadge?.container ? !activeBadge.container.visible : false;

      im.hideHUD();
      const isBadgeRestored = activeBadge?.container ? activeBadge.container.visible : false;

      return { isBadgeHidden, isBadgeRestored };
    });

    expect(badgeIntegrity).not.toBeNull();
    expect(badgeIntegrity.isBadgeHidden).toBe(true);
    expect(badgeIntegrity.isBadgeRestored).toBe(true);
  });

  test('04. Campus Map modal displays all 9 locations without truncation', async ({ page }) => {
    // Mở modal Campus Map bằng interactiveModal.show
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene && scene.interactiveModal) {
        scene.interactiveModal.show({
          id: 'zone_campus',
          type: 'campus_map',
          name: 'Bản Đồ Campus FUDA'
        });
      }
    });

    const modal = page.locator('#interactive-modal');
    await expect(modal).toBeVisible();

    const items = page.locator('.campus-loc-item');
    await expect(items).toHaveCount(9);

    // Kiểm tra item số 9 (Sân Bóng Đá & Thể Thao)
    const item9 = items.nth(8);
    await expect(item9).toContainText('Sân Bóng Đá');
  });
});
