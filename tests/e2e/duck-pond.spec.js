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

    // Vịt vẫn trong bounds hồ V2 (không bơi lên cỏ)
    const inBounds = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      const b = { x0: 150, y0: 350, x1: 350, y1: 550 }; // DUCK_SWIM_BOUNDS (art V2)
      return scene.duckWander.ducks.every(d =>
        d.x >= b.x0 - 4 && d.x <= b.x1 + 4 && d.y >= b.y0 - 6 && d.y <= b.y1 + 6);
    });
    expect(inBounds).toBe(true);
  });

  test('02. Painted map collision: pond/building/fountain block movement, no sprite duplicates', async ({ page }) => {
    const statics = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return {
        decorCount: scene.decorationSprites.length,
        textures: {
          duck: scene.textures.exists('duck'),
          mapV2: scene.textures.exists('map_alpha_v2'),
        },
        paintedBg: !!scene._paintedBg,
        rects: scene.mapData?.paintedBackground?.collisionRects?.length || 0,
      };
    });
    expect(statics.decorCount).toBe(0); // tượng + hoa đã vẽ trong art, không sprite trùng
    expect(statics.textures.duck).toBe(true);
    expect(statics.textures.mapV2).toBe(true);
    expect(statics.paintedBg).toBe(true);
    expect(statics.rects).toBe(16);

    // Đi vào tường phải DỪNG ở mép (không xuyên). Headless chậm → tăng tốc test.
    const setSpeed = (m) => page.evaluate((mm) => {
      window.__DEVER_GAME__.scene.keys.WorldScene.player.speedMultiplier = mm;
    }, m);
    const walk = (x, y, key, ms) => page.evaluate(async ([px, py, k, wait]) => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene.player.setPosition(px, py);
      scene.player.body.reset(px, py);
      scene.player.body.setVelocity(0, 0);
      return true;
    }, [x, y, key, ms]).then(() => page.keyboard.down(key))
      .then(() => page.waitForTimeout(ms)).then(() => page.keyboard.up(key));
    const pos = () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return { x: Math.round(scene.player.x), y: Math.round(scene.player.y) };
    });
    await setSpeed(10);

    // Hồ V2 (y311-581): từ (250,150) đi xuống → dừng ở y≈279
    await walk(250, 150, 'ArrowDown', 2000);
    const pond = await pos();
    expect(pond.y).toBeGreaterThan(270);
    expect(pond.y).toBeLessThan(311);

    // Tòa Alpha (y0-265): từ (500,500) đi lên → dừng ở y≈243
    await walk(500, 500, 'ArrowUp', 2500);
    const bld = await pos();
    expect(bld.y).toBeGreaterThan(200);
    expect(bld.y).toBeLessThan(280);

    // Đài phun (y380-472): từ (746,600) đi lên → dừng ở y≈450
    await walk(746, 600, 'ArrowUp', 2000);
    const ftn = await pos();
    expect(ftn.y).toBeGreaterThan(420);
    expect(ftn.y).toBeLessThan(480);

    await setSpeed(1);
  });

  test('03. Map regression guard: painted config + other rooms untouched', async ({ page }) => {
    const guard = await page.evaluate(async () => {
      const { MAPS_CONFIG } = await import('/src/config/maps.js');
      const mh = MAPS_CONFIG.main_hall;
      const f0 = mh.floors[0];
      const sports = MAPS_CONFIG.sports_complex;
      const flatSports = sports.layout.flat();
      const zFish = (f0.zones || []).find(z => z.id === 'zone_main_fishing');
      return {
        topPond: mh.layout.flat().filter(t => t === 42).length,
        f0Pond: f0.layout.flat().filter(t => t === 42).length,
        portals: f0.portals.length,
        zones: f0.zones.length,
        spawn: f0.spawnPoint,
        floors: mh.floors.length,
        pb: !!f0.paintedBackground,
        pbKey: f0.paintedBackground?.imageKey,
        pbRects: f0.paintedBackground?.collisionRects?.length,
        pbPortalPixel: f0.portals.every(p => typeof p.x === 'number' && typeof p.y === 'number'),
        pbZonePixel: (f0.zones || []).every(z => typeof z.x === 'number' && typeof z.y === 'number'),
        decorEmpty: (f0.decorations || []).length === 0,
        fishXY: zFish ? [zFish.x, zFish.y] : null,
        sportsHas42: flatSports.includes(42),
        sportsPool28: flatSports.filter(t => t === 28).length,
        rooms: Object.keys(MAPS_CONFIG).length,
      };
    });
    expect(guard.topPond).toBe(15);   // layout tile giữ nguyên làm fallback
    expect(guard.f0Pond).toBe(15);
    expect(guard.portals).toBe(9);    // 9 portal (8 đích, canteen 2 cổng)
    expect(guard.zones).toBe(7);
    expect(guard.spawn).toEqual({ x: 746, y: 620 });
    expect(guard.floors).toBe(3);
    expect(guard.pb).toBe(true);
    expect(guard.pbKey).toBe('map_alpha_v2');
    expect(guard.pbRects).toBe(16);
    expect(guard.pbPortalPixel).toBe(true);
    expect(guard.pbZonePixel).toBe(true);
    expect(guard.decorEmpty).toBe(true);
    expect(guard.fishXY).toEqual([430, 450]);
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

    // 1. Wide: quảng trường phía nam (hồ V2 bên trái, đài phun giữa, vườn hoa)
    await movePlayer(688, 620);
    await setZoom(1.0);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-wide.png` });

    // 2. Close-up vịt: đứng sát mép đông hồ V2 (x418), zoom lớn (camera follow nhân vật)
    await movePlayer(450, 450);
    await setZoom(2.5);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-ducks-closeup.png` });

    // 3. Close-up tượng v5 vẽ trong art (bệ x1145-1225/y330-440): đứng phía nam tượng
    await movePlayer(1185, 500);
    await setZoom(2.5);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-statue-closeup.png` });

    // 4. Close-up vườn hoa vẽ trong art (luống x875-981/y543-574)
    await movePlayer(928, 640);
    await setZoom(2.5);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${IMG_DIR}/pond-flowers-closeup.png` });

    // Khôi phục camera
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene._userZoom = null;
      scene._zoomIsAuto = true;
      scene.updateCameraZoom();
    });
  });
});
