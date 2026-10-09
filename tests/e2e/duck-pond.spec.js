import { test, expect } from '@playwright/test';

const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-approved-batch-2026-10-09';

test.describe('DEVER TOWN - Duck Pond & Thinker Statue (Alpha Courtyard)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('dever_onboarded_v1', '1');
      localStorage.setItem('dever_chat_hint_seen', '1');
    });
    await page.goto('/');
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Pond Tester');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
    // Tắt onboarding guide nếu hiện để thấy canvas (kẻo che screenshot)
    const startBtn = page.locator('button:has-text("Bắt Đầu Chơi Ngay"), button:has-text("Đã Hiểu")').first();
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(500);
    }
    // Đảm bảo đang ở main_hall tầng 1
    await page.locator('#room-selector').selectOption('main_hall');
    await page.waitForTimeout(1200);
  });

  test('01. Ducks spawn and animate in the pond', async ({ page }) => {
    const duckInfo = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      if (!scene || !scene.duckWander) return null;
      const d0 = scene.duckWander.ducks.map(d => ({ x: Math.round(d.x), y: Math.round(d.y) }));
      return { count: scene.duckWander.getDuckCount(), active: scene.duckWander.active, d0 };
    });
    expect(duckInfo).not.toBeNull();
    expect(duckInfo.count).toBe(3);
    expect(duckInfo.active).toBe(true);

    // Vịt phải di chuyển sau vài giây (wander AI hoạt động)
    await page.waitForTimeout(4000);
    const moved = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return scene.duckWander.ducks.map(d => ({ x: Math.round(d.x), y: Math.round(d.y) }));
    });
    const totalMove = moved.reduce((s, p, i) =>
      s + Math.abs(p.x - duckInfo.d0[i].x) + Math.abs(p.y - duckInfo.d0[i].y), 0);
    expect(totalMove).toBeGreaterThan(10);

    // Vịt vẫn trong bounds hồ (không bơi lên cỏ)
    const inBounds = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const b = { x0: 48, y0: 528, x1: 176, y1: 592 };
      return scene.duckWander.ducks.every(d =>
        d.x >= b.x0 - 4 && d.x <= b.x1 + 4 && d.y >= b.y0 - 6 && d.y <= b.y1 + 6);
    });
    expect(inBounds).toBe(true);
  });

  test('02. Pond tiles are solid + statue spawned', async ({ page }) => {
    const statics = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return {
        decorCount: scene.decorationSprites.length,
        decorTex: scene.decorationSprites.map(d => d.texture.key),
        textures: {
          duck: scene.textures.exists('duck'),
          statue: scene.textures.exists('thinker_statue'),
        },
      };
    });
    expect(statics.decorCount).toBe(1);
    expect(statics.decorTex).toEqual(['thinker_statue']);
    expect(statics.textures.duck).toBe(true);
    expect(statics.textures.statue).toBe(true);

    // Đẩy nhân vật vào hồ: phải bị chặn ở mép nước (không đi xuyên)
    const blocked = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene.player.setPosition(112, 470); // cỏ phía bắc hồ (tile 3,15)
      scene.player.body.reset(112, 470);
      return { x: scene.player.x, y: scene.player.y };
    });
    expect(blocked.y).toBeLessThan(490);
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(900);
    await page.keyboard.up('ArrowDown');
    const after = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return { x: Math.round(scene.player.x), y: Math.round(scene.player.y) };
    });
    // Mép hồ y=512: nhân vật phải dừng trước khi chạm nước
    expect(after.y).toBeLessThan(508);
    expect(after.y).toBeGreaterThan(470);
    expect(Math.abs(after.x - 112)).toBeLessThan(12);
  });

  test('03. Map regression guard: portals/spawns/other rooms untouched', async ({ page }) => {
    const guard = await page.evaluate(async () => {
      const { MAPS_CONFIG } = await import('/src/config/maps.js');
      const mh = MAPS_CONFIG.main_hall;
      const f0 = mh.floors[0];
      const sports = MAPS_CONFIG.sports_complex;
      const flatSports = sports.layout.flat();
      return {
        topPond: mh.layout.flat().filter(t => t === 42).length,
        f0Pond: f0.layout.flat().filter(t => t === 42).length,
        portals: f0.portals.length,
        zones: f0.zones.length,
        spawn: f0.spawnPoint,
        floors: mh.floors.length,
        sportsHas42: flatSports.includes(42),
        sportsPool28: flatSports.filter(t => t === 28).length,
        rooms: Object.keys(MAPS_CONFIG).length,
      };
    });
    expect(guard.topPond).toBe(15);   // 5x3 hồ ở cả 2 layout
    expect(guard.f0Pond).toBe(15);
    expect(guard.portals).toBe(9);    // portal nguyên vẹn
    expect(guard.zones).toBe(6);      // zone nguyên vẹn
    expect(guard.spawn).toEqual({ x: 400, y: 350 });
    expect(guard.floors).toBe(3);
    expect(guard.sportsHas42).toBe(false); // sports_complex không bị đụng
    expect(guard.sportsPool28).toBe(28);   // hồ bơi 7x4 nguyên vẹn
    expect(guard.rooms).toBe(11);
  });

  test('04. Screenshots: wide courtyard + duck close-up + statue close-up', async ({ page }) => {
    // Ẩn mọi overlay DOM để canvas sạch cho screenshot (chỉ trong test)
    await page.evaluate(() => {
      document.querySelectorAll('#app > :not(#main-content)')
        .forEach(el => { el.style.display = 'none'; });
      document.querySelectorAll('#main-content > :not(#game-container)')
        .forEach(el => { el.style.display = 'none'; });
      // HUD nổi gắn ở body: radar, zoom controls, daily goal, toast, banner mạng
      ['#minimap-overlay', '.dever-zoom-controls', '#daily-goal-hud',
       '.achievement-toast-banner', '#lag-spinner-overlay', '#network-banner',
       '.server-status-banner', '#toast-container', '.toast-stack'
      ].forEach(sel => document.querySelectorAll(sel)
        .forEach(el => { el.style.display = 'none'; }));
    });

    const setZoom = (z) => page.evaluate((zz) => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene.applyZoomImmediate(zz); // API zoom chuẩn của game (giữ _userZoom)
    }, z);
    const movePlayer = (x, y) => page.evaluate(([px, py]) => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene.player.setPosition(px, py);
      scene.player.body.reset(px, py);
    }, [x, y]);

    // 1. Wide: toàn sân cỏ phía nam (hồ + tượng + cột cờ)
    await movePlayer(208, 560);
    await setZoom(1.4);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-wide.png` });

    // 2. Close-up vịt: đứng sát mép hồ, zoom lớn (camera follow nhân vật)
    await movePlayer(112, 496);
    await setZoom(2.5);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-ducks-closeup.png` });

    // 3. Close-up tượng (tile 1,15 -> world 48,496): đứng cạnh tượng
    await movePlayer(128, 496);
    await setZoom(2.5);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-statue-closeup.png` });

    // Khôi phục camera
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene._userZoom = null;
      scene._zoomIsAuto = true;
      scene.updateCameraZoom();
    });
  });
});
