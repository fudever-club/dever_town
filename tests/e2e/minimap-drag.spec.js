import { test, expect } from '@playwright/test';

/**
 * Minimap drag (draggable RADAR HUD) — mouse + touch, persistence, reset.
 */

async function enterGame(page, name = 'DragTester') {
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarding_seen', 'true');
  });
  await page.goto('/');
  const nameInput = page.locator('#gate-guest-name');
  await nameInput.fill(name);
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
  await expect(page.locator('.minimap-container')).toBeVisible({ timeout: 10000 });
}

async function minimapPos(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.minimap-container');
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
  });
}

test.describe('Minimap drag — Desktop (mouse)', () => {
  test.beforeEach(async ({ page }) => {
    await enterGame(page);
  });

  test('01. Mouse drag on header moves the minimap', async ({ page }) => {
    const before = await minimapPos(page);
    const header = page.locator('.minimap-header');
    const box = await header.boundingBox();

    // Drag header by (+120, +80)
    await page.mouse.move(box.x + 30, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 30 + 120, box.y + 10 + 80, { steps: 10 });
    await page.mouse.up();

    const after = await minimapPos(page);
    expect(after.left).toBeGreaterThan(before.left + 50);
    expect(after.top).toBeGreaterThan(before.top + 30);
  });

  test('02. Position persists across reload via localStorage', async ({ page }) => {
    const header = page.locator('.minimap-header');
    const box = await header.boundingBox();
    await page.mouse.move(box.x + 30, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + 120, { steps: 10 });
    await page.mouse.up();

    const afterDrag = await minimapPos(page);
    const saved = await page.evaluate(() => localStorage.getItem('dever_minimap_pos_v1'));
    expect(saved).not.toBeNull();

    await page.reload();
    await expect(page.locator('.minimap-container')).toBeVisible({ timeout: 10000 });
    // Đợi game load xong hoàn toàn (loading screen ẩn) rồi mới đo vị trí
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await page.waitForTimeout(500); // đợi layout ổn định
    const afterReload = await minimapPos(page);
    expect(Math.abs(afterReload.left - afterDrag.left)).toBeLessThanOrEqual(2);
    expect(Math.abs(afterReload.top - afterDrag.top)).toBeLessThanOrEqual(2);
  });

  test('03. Double-click header resets to default position', async ({ page }) => {
    const before = await minimapPos(page);
    const header = page.locator('.minimap-header');
    const box = await header.boundingBox();
    await page.mouse.move(box.x + 30, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 250, box.y + 200, { steps: 10 });
    await page.mouse.up();

    const moved = await minimapPos(page);
    expect(moved.left).not.toBe(before.left);

    await header.dblclick();
    const reset = await minimapPos(page);
    expect(Math.abs(reset.left - before.left)).toBeLessThanOrEqual(2);
    expect(Math.abs(reset.top - before.top)).toBeLessThanOrEqual(2);
    const saved = await page.evaluate(() => localStorage.getItem('dever_minimap_pos_v1'));
    expect(saved).toBeNull();
  });

  test('04. Drag is clamped inside viewport (cannot go off-screen)', async ({ page }) => {
    const header = page.locator('.minimap-header');
    const box = await header.boundingBox();
    await page.mouse.move(box.x + 30, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(-500, -500, { steps: 10 });
    await page.mouse.up();

    const pos = await minimapPos(page);
    expect(pos.left).toBeGreaterThanOrEqual(0);
    expect(pos.top).toBeGreaterThanOrEqual(0);
  });

  test('05. Collapse toggle still works after drag', async ({ page }) => {
    const header = page.locator('.minimap-header');
    const box = await header.boundingBox();
    await page.mouse.move(box.x + 30, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y + 60, { steps: 8 });
    await page.mouse.up();

    const minimap = page.locator('.minimap-container');
    const toggleBtn = page.locator('#minimap-toggle-btn');
    await toggleBtn.click();
    await expect(minimap).toHaveClass(/collapsed/);
    await toggleBtn.click();
    await expect(minimap).not.toHaveClass(/collapsed/);

    // Canvas still renders after drag + toggle cycle
    const canvasVisible = await page.locator('#minimap-canvas').isVisible();
    expect(canvasVisible).toBe(true);
  });

  test('06. Clicking toggle button does NOT start a drag', async ({ page }) => {
    const before = await minimapPos(page);
    await page.locator('#minimap-toggle-btn').click();
    const after = await minimapPos(page);
    expect(after.left).toBe(before.left);
    expect(after.top).toBe(before.top);
  });
});

test.describe('Minimap drag — Mobile (touch)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Touch test chỉ chạy trên Mobile project (Desktop Chromium không có touchscreen)
    test.skip(testInfo.project.name !== 'Mobile Chrome (FUDA Touch)',
      'Touch drag tests only run on mobile project');
    await page.setViewportSize({ width: 375, height: 667 });
    await enterGame(page, 'TouchDragTester');
  });

  test('07. Touch drag on header moves the minimap', async ({ page }) => {
    const before = await minimapPos(page);
    const header = page.locator('.minimap-header');
    const box = await header.boundingBox();

    // Playwright touchscreen không có drag; dùng synthetic PointerEvents (touch)
    await page.evaluate(({ sx, sy, dx, dy }) => {
      const el = document.querySelector('.minimap-header');
      const opts = (x, y) => ({
        bubbles: true, cancelable: true, composed: true,
        clientX: x, clientY: y, pointerId: 7, pointerType: 'touch', isPrimary: true,
      });
      el.dispatchEvent(new PointerEvent('pointerdown', opts(sx, sy)));
      for (let i = 1; i <= 10; i++) {
        el.dispatchEvent(new PointerEvent('pointermove', opts(sx + (dx * i) / 10, sy + (dy * i) / 10)));
      }
      el.dispatchEvent(new PointerEvent('pointerup', opts(sx + dx, sy + dy)));
    }, { sx: box.x + 20, sy: box.y + 8, dx: 100, dy: 90 });

    const after = await minimapPos(page);
    expect(after.left).toBeGreaterThan(before.left + 40);
    expect(after.top).toBeGreaterThan(before.top + 40);
  });
});

test.describe('Minimap drag — Mobile landscape screenshots', () => {
  test('08. Landscape: drag minimap away from D-pad area', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await enterGame(page, 'LandscapeDrag');

    const header = page.locator('.minimap-header');
    const before = await minimapPos(page);
    await page.screenshot({ path: 'test-results/landscape-minimap-before.png' });

    const box = await header.boundingBox();
    // Drag minimap to top-right corner, away from D-pad (bottom-left)
    const targetX = 667 - before.width - 8;
    const targetY = 60;
    await page.evaluate(({ sx, sy, tx, ty }) => {
      const el = document.querySelector('.minimap-header');
      const opts = (x, y) => ({
        bubbles: true, cancelable: true, composed: true,
        clientX: x, clientY: y, pointerId: 9, pointerType: 'touch', isPrimary: true,
      });
      el.dispatchEvent(new PointerEvent('pointerdown', opts(sx, sy)));
      for (let i = 1; i <= 12; i++) {
        el.dispatchEvent(new PointerEvent('pointermove', opts(sx + ((tx - sx) * i) / 12, sy + ((ty - sy) * i) / 12)));
      }
      el.dispatchEvent(new PointerEvent('pointerup', opts(tx, ty)));
    }, { sx: box.x + 20, sy: box.y + 8, tx: targetX + 20, ty: targetY + 8 });

    const after = await minimapPos(page);
    await page.screenshot({ path: 'test-results/landscape-minimap-after.png' });

    // Should be near top-right now
    expect(after.left).toBeGreaterThan(400);
    expect(after.top).toBeLessThan(120);
  });
});
