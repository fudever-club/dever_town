import { test, expect } from '@playwright/test';

const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function login(page) {
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });
  await page.goto('/');
  await page.locator('#gate-guest-name').fill('Alpha Interior Tester');
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
  await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  const startBtn = page.locator('button:has-text("Bắt Đầu Chơi Ngay"), button:has-text("Đã Hiểu")').first();
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.evaluate(() => document.querySelector('#onboarding-close-btn')?.click());
    await page.waitForTimeout(500);
  }
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
      interiorTex: s.textures.exists('map_alpha_interior'),
      bgDW: s._paintedBg ? s._paintedBg.displayWidth : null,
      bgDH: s._paintedBg ? s._paintedBg.displayHeight : null,
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
    if (snap) s.cameras.main.centerOn(px, py);
  }, [x, y, snapCamera]);
  await page.waitForTimeout(300);
}

async function gotoRoom(page, roomId) {
  await page.locator('#room-selector').selectOption(roomId);
  await page.waitForFunction((r) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s && s.currentRoomId === r && (s.floorManager ? s.floorManager.currentFloor : 0) === 0;
  }, roomId, { timeout: 15000 });
  await page.waitForTimeout(1500);
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

test.describe('alpha_interior functional (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.beforeEach(async ({ page }) => { await login(page); });

  test('01. painted interior bg active, spawn at lobby door', async ({ page }) => {
    await gotoRoom(page, 'alpha_interior');
    const info = await sceneOf(page);
    expect(info.room).toBe('alpha_interior');
    expect(info.floor).toBe(0);
    expect(info.interiorTex).toBe(true);
    expect(info.paintedBg).toBe(true);
    expect(info.bgDW).toBe(1376);
    expect(info.bgDH).toBe(768);
    expect(info.px).toBe(680);
    expect(info.py).toBe(610);
  });

  test('02. collision: desk/wing/stairs solid, floor free', async ({ page }) => {
    await gotoRoom(page, 'alpha_interior');
    const setSpeed = (m) => page.evaluate((mm) => {
      window.__DEVER_GAME__.scene.keys.WorldScene.player.speedMultiplier = mm;
    }, m);
    await setSpeed(10);

    // FREE: đi dọc sảnh — không kẹt tường vô hình
    await movePlayer(page, 900, 600);
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(1500);
    await page.keyboard.up('ArrowLeft');
    const free = await sceneOf(page);
    expect(free.px).toBeLessThan(850);

    // SOLID: quầy lễ tân (x600-768, y378-503) — từ (680,600) đi lên phải dừng ở y≈503
    await movePlayer(page, 680, 600);
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowUp');
    const desk = await sceneOf(page);
    expect(desk.py).toBeGreaterThan(480);
    expect(desk.py).toBeLessThan(560);

    // SOLID: quầy lễ tân cạnh phải (x=768) — từ (860,400) đi trái phải dừng ở x≈780
    await movePlayer(page, 860, 400);
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowLeft');
    const deskSide = await sceneOf(page);
    expect(deskSide.px).toBeGreaterThan(750);
    expect(deskSide.px).toBeLessThan(830);

    // SOLID: cánh lab trái (x18-353) — từ (500,400) đi trái phải dừng ở x≈365
    await movePlayer(page, 500, 400);
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(2000);
    await page.keyboard.up('ArrowLeft');
    const wing = await sceneOf(page);
    expect(wing.px).toBeGreaterThan(340);
    expect(wing.px).toBeLessThan(395);

    await setSpeed(1);
  });

  test('03. courtyard <-> interior bidirectional', async ({ page }, testInfo) => {
    testInfo.setTimeout(90000);
    await gotoRoom(page, 'main_hall');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return performance.now() > s.teleportGraceUntil;
    }, { timeout: 10000 });
    // Sân -> sảnh trong (cổng 746,290)
    await movePlayer(page, 746, 360);
    await page.keyboard.down('ArrowUp');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'alpha_interior';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowUp');
    expect((await sceneOf(page)).room).toBe('alpha_interior');
    // Sảnh trong -> sân (cửa 680,672)
    await page.waitForTimeout(3000);
    await movePlayer(page, 680, 600);
    await page.keyboard.down('ArrowDown');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'main_hall';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowDown');
    const back = await sceneOf(page);
    expect(back.room).toBe('main_hall');
    expect(back.px).toBe(746);
    expect(back.py).toBe(330);
  });

  test('04. interior lab portal -> dever_lab', async ({ page }) => {
    await gotoRoom(page, 'alpha_interior');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return performance.now() > s.teleportGraceUntil;
    }, { timeout: 10000 });
    // Hitbox chân (y+30) phải đè lên pad portal (445,255): đi ở y=225
    await movePlayer(page, 560, 225);
    await page.keyboard.down('ArrowLeft');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'dever_lab';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowLeft');
    const info = await sceneOf(page);
    expect(info.room).toBe('dever_lab');
    expect(info.px).toBe(400);
    expect(info.py).toBe(190);
  });

  test('05. stair up/down between floors (E)', async ({ page }) => {
    await gotoRoom(page, 'alpha_interior');
    // Lên tầng 2
    await movePlayer(page, 1055, 350);
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s?.interactionManager?.currentActiveZone?.id === 'zone_alpha_stair_up';
    }, { timeout: 5000 });
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.floorManager.currentFloor === 1;
    }, { timeout: 8000 });
    const f2 = await sceneOf(page);
    expect(f2.floor).toBe(1);
    expect(f2.paintedBg).toBe(false); // tầng 2 dùng tile layout
    // Xuống sảnh
    await movePlayer(page, 400, 528);
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s?.interactionManager?.currentActiveZone?.id === 'zone_alpha_stair_down';
    }, { timeout: 5000 });
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.floorManager.currentFloor === 0;
    }, { timeout: 8000 });
    const f0 = await sceneOf(page);
    expect(f0.floor).toBe(0);
    expect(f0.paintedBg).toBe(true);
  });

  test('06. zones trigger E prompts (reception, notice, lofi)', async ({ page }) => {
    await gotoRoom(page, 'alpha_interior');
    const checks = [
      ['zone_alpha_reception', 585, 440, 'Lễ Tân'],
      ['zone_alpha_notice', 548, 260, 'Bảng Tin'],
      ['zone_alpha_lofi', 1105, 430, 'Thư Giãn'],
    ];
    for (const [zoneId, x, y, labelPart] of checks) {
      await movePlayer(page, x, y);
      await page.waitForFunction((z) => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s?.interactionManager?.currentActiveZone?.id === z;
      }, zoneId, { timeout: 5000 });
      const hud = await page.evaluate(() => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return {
          visible: s.interactionManager.hudContainer.visible,
          text: s.interactionManager.tooltipText.text,
        };
      });
      expect(hud.visible).toBe(true);
      expect(hud.text).toContain(labelPart);
    }
  });

  test('07a. courtyard -> sports (existing portal)', async ({ page }, testInfo) => {
    testInfo.setTimeout(60000);
    await gotoRoom(page, 'main_hall');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return performance.now() > s.teleportGraceUntil;
    }, { timeout: 10000 });
    // -> sports (1336,550): đi ở y=535 để hitbox chân đè lên pad
    await movePlayer(page, 1280, 535);
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'sports_complex';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowRight');
    expect((await sceneOf(page)).room).toBe('sports_complex');
  });

  test('07b. courtyard -> canteen (existing portal)', async ({ page }, testInfo) => {
    testInfo.setTimeout(60000);
    await gotoRoom(page, 'main_hall');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return performance.now() > s.teleportGraceUntil;
    }, { timeout: 10000 });
    // -> canteen (600,735)
    await movePlayer(page, 600, 560);
    await page.keyboard.down('ArrowDown');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'canteen_cafe';
    }, { timeout: 10000 });
    await page.keyboard.up('ArrowDown');
    expect((await sceneOf(page)).room).toBe('canteen_cafe');
  });
});

const VIEWPORTS = [
  { name: 'desktop-1280x800', viewport: { width: 1280, height: 800 } },
  { name: 'mobile-portrait-375x667', viewport: { width: 375, height: 667 } },
];

for (const vp of VIEWPORTS) {
  test.describe(`alpha-interior screenshots ${vp.name}`, () => {
    test.use({ viewport: vp.viewport });

    test('screenshots: overview, door, lab wing, stairs, floor2', async ({ page }, testInfo) => {
      testInfo.setTimeout(120000);
      await login(page);
      await page.locator('#room-selector').selectOption('alpha_interior');
      await page.waitForFunction(() => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s && s.currentRoomId === 'alpha_interior' && s._paintedBg;
      }, { timeout: 15000 });
      await page.waitForTimeout(1500);
      await cleanOverlays(page);

      const shot = async (name, x, y, zoom, floor = 0) => {
        if (floor !== 0) {
          await page.evaluate((f) => {
            const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
            if (s.floorManager.currentFloor !== f) {
              s.floorManager.currentFloor = f;
              s.loadRoom('alpha_interior', 400, 528, false);
            }
          }, floor);
          await page.waitForTimeout(2000);
        }
        await movePlayer(page, x, y, true);
        if (zoom) {
          await page.evaluate((z) => {
            window.__DEVER_GAME__?.scene?.keys?.WorldScene?.applyZoomImmediate(z);
          }, zoom);
          await page.waitForTimeout(600);
        } else {
          await page.evaluate(() => {
            const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
            s._userZoom = null; s._zoomIsAuto = true; s.updateCameraZoom();
          });
          await page.waitForTimeout(800);
        }
        await page.screenshot({ path: `${IMG_DIR}/${name}-${vp.name}.png` });
      };

      await shot('indoor-overview', 688, 420, null);
      await shot('indoor-door', 680, 600, 2);
      await shot('indoor-labwing', 480, 400, 2);
      await shot('indoor-stairs', 1055, 350, 2);
      await shot('indoor-floor2', 400, 320, null, 1);
    });
  });
}
