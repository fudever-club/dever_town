import { test, expect } from '@playwright/test';

const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function login(page) {
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });
  await page.goto('/');
  await page.locator('#gate-guest-name').fill('MapV2 Tester');
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  const startBtn = page.locator('button:has-text("Bắt Đầu Chơi Ngay"), button:has-text("Đã Hiểu")').first();
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    // Click JS trực tiếp: tránh bị HUD dock đè lên (viewport nhỏ)
    await page.evaluate(() => document.querySelector('#onboarding-close-btn')?.click());
    await page.waitForTimeout(500);
  }
  await page.locator('#room-selector').selectOption('main_hall');
  await page.waitForFunction(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s && s.currentRoomId === 'main_hall' && (s.floorManager ? s.floorManager.currentFloor : 0) === 0;
  }, { timeout: 15000 });
  await page.waitForTimeout(1500);
}

function sceneOf(page) {
  return page.evaluate(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    if (!s) return null;
    return {
      room: s.currentRoomId,
      floor: s.floorManager ? s.floorManager.currentFloor : 0,
      px: Math.round(s.player.x), py: Math.round(s.player.y),
      paintedBg: !!s._paintedBg,
      mapV2Tex: s.textures.exists('map_alpha_v2'),
      bgScaleX: s._paintedBg ? +s._paintedBg.scaleX.toFixed(3) : null,
      bgDW: s._paintedBg ? s._paintedBg.displayWidth : null,
      bgDH: s._paintedBg ? s._paintedBg.displayHeight : null,
      bgX: s._paintedBg ? Math.round(s._paintedBg.x) : null,
      bgY: s._paintedBg ? Math.round(s._paintedBg.y) : null,
      roomSize: s._getRoomPixelSize ? s._getRoomPixelSize() : null,
      zoomRange: s.getZoomRange ? { min: +s.getZoomRange().min.toFixed(2), max: s.getZoomRange().max } : null,
      activeZone: s.interactionManager?.currentActiveZone?.id || null,
    };
  });
}

async function movePlayer(page, x, y, snapCamera = false) {
  await page.evaluate(([px, py, snap]) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    s.player.setPosition(px, py);
    s.player.body.reset(px, py);
    s.player.body.setVelocity(0, 0);
    if (snap) s.cameras.main.centerOn(px, py); // screenshot: bỏ lerp camera
  }, [x, y, snapCamera]);
  await page.waitForTimeout(300);
}

async function setZoom(page, z) {
  await page.evaluate((zz) => {
    window.__DEVER_GAME__?.scene?.keys?.WorldScene?.applyZoomImmediate(zz);
  }, z);
  await page.waitForTimeout(600);
}

async function cleanOverlays(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#app > :not(#main-content)')
      .forEach(el => { el.style.display = 'none'; });
    document.querySelectorAll('#main-content > :not(#game-container)')
      .forEach(el => { el.style.display = 'none'; });
    ['#minimap-overlay', '.dever-zoom-controls', '#daily-goal-hud',
     '.achievement-toast-banner', '#lag-spinner-overlay', '#network-banner',
     '.server-status-banner', '#toast-container', '.toast-stack'
    ].forEach(sel => document.querySelectorAll(sel)
      .forEach(el => { el.style.display = 'none'; }));
  });
}

test.describe('mapv2 functional (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => { await login(page); });

  test('01. painted bg active, unstretched, spawn at plaza', async ({ page }) => {
    const info = await sceneOf(page);
    expect(info.room).toBe('main_hall');
    expect(info.floor).toBe(0);
    expect(info.mapV2Tex).toBe(true);
    expect(info.paintedBg).toBe(true);
    // Không kéo giãn: scale 1, đúng 1376x768, tâm (688,384)
    expect(info.bgScaleX).toBe(1);
    expect(info.bgDW).toBe(1376);
    expect(info.bgDH).toBe(768);
    expect(info.bgX).toBe(688);
    expect(info.bgY).toBe(384);
    // Kích thước phòng + zoom range tính theo pb
    expect(info.roomSize).toEqual({ w: 1376, h: 768 });
    // Spawn (746,620) — quảng trường, không trong tường
    expect(info.px).toBe(746);
    expect(info.py).toBe(620);
  });

  test('02. plaza walk is free; pond/building/fountain are solid', async ({ page }) => {
    // Headless render chậm → tăng tốc test (không phải logic game).
    const setSpeed = (m) => page.evaluate((mm) => {
      window.__DEVER_GAME__.scene.keys.WorldScene.player.speedMultiplier = mm;
    }, m);
    await setSpeed(10);

    // FREE: quảng trường — đi xa, không kẹt tường vô hình
    await movePlayer(page, 300, 620);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowRight');
    const free = await sceneOf(page);
    expect(free.px).toBeGreaterThan(450); // đi xa rõ ràng, không kẹt tường vô hình

    // SOLID: đi vào tường phải DỪNG ở mép (không xuyên)
    // - hồ V2 (y311-581): từ (250,150) đi xuống → dừng ở y≈279 (chân chạm mép 311)
    await movePlayer(page, 250, 150);
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowDown');
    const pond = await sceneOf(page);
    expect(pond.py).toBeGreaterThan(270);
    expect(pond.py).toBeLessThan(311);

    // - tòa Alpha (y0-265): từ (500,500) đi lên → dừng ở y≈243 (đầu chạm mép 265)
    await movePlayer(page, 500, 500);
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2500);
    await page.keyboard.up('ArrowUp');
    const bld = await sceneOf(page);
    expect(bld.py).toBeGreaterThan(200);
    expect(bld.py).toBeLessThan(280);

    // - đài phun (y380-472): từ (746,600) đi lên → dừng ở y≈450
    await movePlayer(page, 746, 600);
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowUp');
    const ftn = await sceneOf(page);
    expect(ftn.py).toBeGreaterThan(420);
    expect(ftn.py).toBeLessThan(480);

    await setSpeed(1);
  });

  test('03. fishing zone triggers E prompt at pixel coords', async ({ page }) => {
    await movePlayer(page, 430, 450);
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s?.interactionManager?.currentActiveZone?.id === 'zone_main_fishing';
    }, { timeout: 5000 });
    const hud = await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return {
        visible: s.interactionManager.hudContainer.visible,
        text: s.interactionManager.tooltipText.text,
      };
    });
    expect(hud.visible).toBe(true);
    expect(hud.text).toContain('Câu Cá');
  });

  test('04. portal triggers teleport (alpha_interior)', async ({ page }, testInfo) => {
    testInfo.setTimeout(90000);
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return performance.now() > s.teleportGraceUntil;
    }, { timeout: 10000 });
    // Đi bộ vào portal cửa tòa (hitbox chân +22..+32 phải đè lên vùng portal 32x32)
    // Cổng (746,290) giờ đi vào nội thất Tòa Alpha (alpha_interior)
    await movePlayer(page, 746, 360);
    await page.keyboard.down('ArrowUp');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'alpha_interior';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowUp');
    const info = await sceneOf(page);
    expect(info.room).toBe('alpha_interior');
    expect(info.px).toBe(680);
    expect(info.py).toBe(610);
    // Từ sảnh trong đi tiếp sang dever_lab qua portal lab (480,355)
    await page.waitForTimeout(3000); // hết teleport cooldown 2.5s
    await movePlayer(page, 580, 330);
    await page.keyboard.down('ArrowLeft');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'dever_lab';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowLeft');
    expect((await sceneOf(page)).room).toBe('dever_lab');
    // Quay lại main_hall để trạng thái sạch
    await page.locator('#room-selector').selectOption('main_hall');
    await page.waitForTimeout(1500);
    expect((await sceneOf(page)).room).toBe('main_hall');
  });
});

const VIEWPORTS = [
  { name: 'desktop-1280x800', viewport: { width: 1280, height: 800 }, zoom: { over: null, poi: 2.5 } },
  { name: 'mobile-portrait-375x667', viewport: { width: 375, height: 667 }, zoom: { over: 0.5, poi: 1.5 } },
  { name: 'mobile-landscape-800x375', viewport: { width: 800, height: 375 }, zoom: { over: 0.5, poi: 1.5 } },
];

for (const vp of VIEWPORTS) {
  test.describe(`mapv2 screenshots ${vp.name}`, () => {
    test.use({ viewport: vp.viewport });

    test('screenshots: overview, pond, statue garden, fountain', async ({ page }) => {
      await login(page);
      await cleanOverlays(page);

      const shots = [
        ['mapv2-overview', 688, 620, vp.zoom.over],
        ['mapv2-pond', 450, 450, vp.zoom.poi],
        ['mapv2-statue-garden', 1185, 500, vp.zoom.poi],
        ['mapv2-fountain', 746, 560, vp.zoom.poi],
      ];
      for (const [name, x, y, z] of shots) {
        await movePlayer(page, x, y, true); // snap camera → đúng điểm chụp
        if (z) await setZoom(page, z);
        else {
          // overview: trả về auto-fit
          await page.evaluate(() => {
            const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
            s._userZoom = null; s._zoomIsAuto = true; s.updateCameraZoom();
          });
          await page.waitForTimeout(800);
        }
        await page.screenshot({ path: `${IMG_DIR}/${name}-${vp.name}.png` });
      }
    });
  });
}
