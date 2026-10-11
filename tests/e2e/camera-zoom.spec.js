import { test, expect } from '@playwright/test';

/**
 * Camera zoom e2e (Task C):
 * 1. wheel trên canvas đổi zoom trong [min, max]
 * 2. zoom persist qua localStorage khi reload
 * 3. occluder tile mờ (alpha giảm) khi player đứng sau tường
 * 4. follow giữ player ở tâm màn hình ở zoom 1.0 / 1.32 / 2.0
 * 5. cụm nút +/− và pill % hiển thị
 */

async function bootGame(page, name) {
  await page.goto('/');
  // Sau reload, session còn trong localStorage → gate có thể bị bỏ qua
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible({ timeout: 8000 }).catch(() => false)) {
    await nameInput.fill(name);
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  await expect.poll(async () => page.evaluate(() => !!window.__WORLD_SCENE__), { timeout: 15000 }).toBe(true);
  // Chờ loading screen ẩn/hết tương tác (kẻo che nút zoom)
  await expect.poll(async () => page.evaluate(() => {
    const el = document.getElementById('game-loading-screen');
    return !el || el.classList.contains('hidden') || el.classList.contains('fade-out');
  }), { timeout: 20000 }).toBe(true);
  // Tắt onboarding guide nếu hiện để thấy canvas
  const startBtn = page.locator('button:has-text("Bắt Đầu Chơi Ngay"), button:has-text("Đã Hiểu")').first();
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(500);
  }
}

async function getCam(page) {
  return page.evaluate(() => {
    const scene = window.__WORLD_SCENE__;
    const cam = scene.cameras.main;
    const range = scene.getZoomRange();
    return {
      zoom: cam.zoom,
      scrollX: cam.scrollX,
      scrollY: cam.scrollY,
      userZoom: scene.getCurrentZoom(),
      px: scene.player.x,
      py: scene.player.y,
      min: range.min,
      max: range.max,
    };
  });
}

/** Bắn WheelEvent thật lên canvas (đi qua listener passive:false + preventDefault). */
async function wheelOnCanvas(page, deltaY) {
  await page.evaluate((dy) => {
    const scene = window.__WORLD_SCENE__;
    const canvas = scene.game.canvas;
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new WheelEvent('wheel', {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      deltaY: dy,
      deltaMode: 0,
      bubbles: true,
      cancelable: true,
    }));
  }, deltaY);
  await page.waitForTimeout(400); // smoothing 150ms + biên headless
}

test.describe('Camera zoom + x-ray', () => {
  test.beforeEach(async ({ page }) => {
    await bootGame(page, 'Tester Zoom');
  });

  test('wheel trên canvas đổi zoom trong [min, max]', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const before = await getCam(page);
    await wheelOnCanvas(page, -240); // cuộn lên = zoom in
    // userZoom (target) set đồng bộ; cam.zoom hội tụ theo tween 150ms
    await expect.poll(async () => (await getCam(page)).userZoom, { timeout: 10000 })
      .toBeGreaterThan(before.userZoom);
    const afterIn = await getCam(page);
    expect(afterIn.userZoom).toBeLessThanOrEqual(afterIn.max + 1e-9);

    await wheelOnCanvas(page, 240); // cuộn xuống = zoom out
    await expect.poll(async () => (await getCam(page)).userZoom, { timeout: 10000 })
      .toBeLessThan(afterIn.userZoom);
    const afterOut = await getCam(page);
    expect(afterOut.userZoom).toBeGreaterThanOrEqual(afterOut.min - 1e-9);

    // Zoom pill hiển thị đúng target zoom
    const pill = page.locator('.dever-zoom-controls .dzc-pill');
    await expect(pill).toBeVisible();
    await expect(pill).toHaveText(`${Math.round(afterOut.userZoom * 100)}%`);

    expect(errors).toEqual([]);
  });

  test('zoom persist qua localStorage khi reload', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.evaluate(() => {
      const scene = window.__WORLD_SCENE__;
      scene.setZoomAt({ x: 400, y: 300 }, 1.5, false);
    });
    const stored = await page.evaluate(() => localStorage.getItem('dever_camera_zoom'));
    expect(stored).toBe('1.5');

    await page.reload();
    await bootGame(page, 'Tester Zoom Reload');
    const after = await getCam(page);
    expect(after.zoom).toBeCloseTo(1.5, 2);
    expect(errors).toEqual([]);
  });

  test('occluder tile mờ khi player đứng sau tường', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const wall = await page.evaluate(() => {
      const scene = window.__WORLD_SCENE__;
      const o = scene.occluderTiles.find((t) => t.type === 2 || t.type === 15);
      return o ? { x: o.x, y: o.y, alpha: o.sprite.alpha, count: scene.occluderTiles.length } : null;
    });
    expect(wall, 'phòng có tile tường trong occluderTiles').not.toBeNull();
    expect(wall.count).toBeGreaterThan(0);

    // Teleport player ra ngay sau bức tường
    await page.evaluate(({ x, y }) => {
      const scene = window.__WORLD_SCENE__;
      scene.player.body.reset(x, y + 40);
      scene.player.setPosition(x, y + 40);
    }, wall);
    // Poll thay vì sleep cố định (headless chậm): throttle 100ms + tween 150ms
    await expect.poll(async () => {
      return page.evaluate(({ x, y }) => {
        const scene = window.__WORLD_SCENE__;
        const o = scene.occluderTiles.find((t) => t.x === x && t.y === y);
        return o ? o.sprite.alpha : null;
      }, wall);
    }, { timeout: 10000 }).toBeLessThan(0.9);

    // Đi ra xa → alpha hồi về 1
    await page.evaluate(() => {
      const scene = window.__WORLD_SCENE__;
      scene.player.body.reset(400, 350);
      scene.player.setPosition(400, 350);
    });
    await expect.poll(async () => {
      return page.evaluate(({ x, y }) => {
        const scene = window.__WORLD_SCENE__;
        const o = scene.occluderTiles.find((t) => t.x === x && t.y === y);
        return o ? o.sprite.alpha : null;
      }, wall);
    }, { timeout: 10000 }).toBeGreaterThan(0.99);
    expect(errors).toEqual([]);
  });

  test('follow giữ player ở tâm ở zoom 1.0 / 1.32 / 2.0 / 2.5', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    for (const z of [1.0, 1.32, 2.0, 2.5]) {
      await page.evaluate((zoom) => {
        window.__WORLD_SCENE__.applyZoomImmediate(zoom);
      }, z);
      // Chiếu ĐÚNG ma trận camera Phaser 3.90 (kiểm chứng qua camera.matrix):
      // screenX = zoom*(worldX − scrollX) + cam.x + (w/2)*(1 − zoom).
      // Mô hình cũ thiếu số hạng (w/2)*(1−zoom) nên tính sai vị trí render, dẫn tới
      // follow-offset "hiệu chỉnh" sai lầm làm view lệch khỏi player (200–600px).
      // Phaser đã tự giữ follow ở tâm với mọi zoom (followOffset = 0).
      // Headless SwiftShader chỉ ~11fps → lerp 0.08/frame hội tụ chậm: poll tới khi tâm.
      // _snapFollowSettle() chốt nốt phần dư stall (floor của roundPixels).
      await expect.poll(async () => {
        const pos = await page.evaluate(() => {
          const scene = window.__WORLD_SCENE__;
          const cam = scene.cameras.main;
          const ox = cam.width / 2, oy = cam.height / 2;
          const sx = (scene.player.x - cam.scrollX) * cam.zoom + cam.x + ox * (1 - cam.zoom);
          const sy = (scene.player.y - cam.scrollY) * cam.zoom + cam.y + oy * (1 - cam.zoom);
          return {
            dx: Math.abs(sx - (cam.x + ox)),
            dy: Math.abs(sy - (cam.y + oy)),
          };
        });
        return pos.dx < 10 && pos.dy < 10;
      }, { timeout: 25000 }).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('cụm nút +/− đổi zoom và pill cập nhật', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const controls = page.locator('.dever-zoom-controls');
    await expect(controls).toBeVisible();
    const before = await getCam(page);

    await controls.locator('button:has-text("+")').click();
    await expect.poll(async () => (await getCam(page)).zoom, { timeout: 10000 })
      .toBeGreaterThan(before.zoom);
    const afterIn = await getCam(page);

    await controls.locator('button:has-text("−")').click();
    await expect.poll(async () => (await getCam(page)).zoom, { timeout: 10000 })
      .toBeLessThan(afterIn.zoom);
    const afterOut = await getCam(page);

    await expect(page.locator('.dever-zoom-controls .dzc-pill'))
      .toHaveText(`${Math.round(afterOut.userZoom * 100)}%`);
    expect(errors).toEqual([]);
  });
});
