import { test, expect } from '@playwright/test';

const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function login(page, name = 'ZoneLayout Auditor') {
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });
  await page.goto('/');
  await page.locator('#gate-guest-name').fill(name);
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

async function gotoRoom(page, roomId) {
  await page.locator('#room-selector').selectOption(roomId);
  await page.waitForFunction((r) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s && s.currentRoomId === r && (s.floorManager ? s.floorManager.currentFloor : 0) === 0;
  }, roomId, { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function movePlayer(page, x, y, snapCamera = false) {
  await page.evaluate(([px, py, snap]) => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    s.player.setPosition(px, py);
    s.player.body.reset(px, py);
    s.player.body.setVelocity(0, 0);
    if (snap) s.cameras.main.centerOn(px, py);
  }, [x, y, snapCamera]);
  await page.waitForTimeout(400);
}

async function waitTeleportReady(page) {
  await page.waitForFunction(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return performance.now() > s.teleportGraceUntil;
  }, { timeout: 15000 });
}

async function activeZoneId(page) {
  return page.evaluate(() => window.__DEVER_GAME__?.scene?.keys?.WorldScene?.interactionManager?.currentActiveZone?.id || null);
}

async function hudLabel(page) {
  return page.evaluate(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s?.interactionManager?.tooltipText?.text || '';
  });
}

async function pressEAndExpectModal(page, zoneId) {
  await page.keyboard.press('KeyE');
  if (zoneId === 'zone_main_fishing') {
    // job_fishing mở FishingJob overlay riêng, không dùng interactiveModal
    await expect(page.locator('#fishing-job-title')).toBeVisible({ timeout: 10000 });
    await page.locator('.graal-job-close').first().click();
    await expect(page.locator('#fishing-job-title')).toBeHidden({ timeout: 8000 });
    return;
  }
  await page.waitForFunction(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s?.interactiveModal?.isOpen?.() === true;
  }, { timeout: 8000 });
  // Đóng modal để check tiếp
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    return s?.interactiveModal?.isOpen?.() !== true;
  }, { timeout: 8000 });
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

async function fitZoom(page) {
  await page.evaluate(() => {
    const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
    const r = s.getZoomRange();
    s.applyZoomImmediate(r.min);
    s.cameras.main.centerOn(688, 384);
  });
  await page.waitForTimeout(800);
}

// ---------- main_hall: 5 moved zones ----------
const MH_ZONES = [
  { id: 'zone_main_frog', x: 750, y: 495, label: 'Cóc Vàng' },
  { id: 'zone_main_campus_map', x: 680, y: 560, label: 'Bản Đồ' },
  { id: 'zone_main_meeting', x: 650, y: 420, label: 'Sân Khấu' },
  { id: 'zone_main_fishing', x: 448, y: 465, label: 'Câu Cá' },
];
// ---------- main_hall: 6 moved portals [walk-from, key, expected room] ----------
const MH_PORTALS = [
  { from: [880, 270], key: 'ArrowRight', room: 'library_lounge', label: 'Sang Thư Viện' },
  { from: [220, 585], key: 'ArrowLeft', room: 'dorm_room', label: 'Ký Túc Xá' },
  { from: [1140, 585], key: 'ArrowRight', room: 'meeting_room', label: 'Phòng Họp CLB' },
  { from: [420, 585], key: 'ArrowLeft', room: 'memory_room', label: 'Phòng Kỷ Niệm' },
  { from: [600, 560], key: 'ArrowDown', room: 'canteen_cafe', label: 'Căn Tin & Cafe (1)' },
  { from: [776, 630], key: 'ArrowDown', room: 'canteen_cafe', label: 'Căn Tin & Cafe (2)' },
];
// ---------- alpha_interior: 2 moved modal zones (stair tested separately) ----------
const AI_ZONES = [
  { id: 'zone_alpha_reception', x: 585, y: 440, label: 'Lễ Tân' },
  { id: 'zone_alpha_notice', x: 548, y: 260, label: 'Bảng Tin' },
];

test.describe('zonelayout audit — desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.beforeEach(async ({ page }) => { await login(page); });

  test('MH moved zones: E prompt + modal fires', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    await gotoRoom(page, 'main_hall');
    for (const z of MH_ZONES) {
      await movePlayer(page, z.x, z.y);
      await page.waitForFunction((id) => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s?.interactionManager?.currentActiveZone?.id === id;
      }, z.id, { timeout: 8000 });
      const label = await hudLabel(page);
      expect(label).toContain(z.label);
      await pressEAndExpectModal(page, z.id);
    }
    // stair zone -> floor 1
    await movePlayer(page, 1050, 285);
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s?.interactionManager?.currentActiveZone?.id === 'zone_main_stair_f1_f2';
    }, { timeout: 8000 });
    expect(await hudLabel(page)).toContain('Tầng 2');
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.floorManager.currentFloor === 1;
    }, { timeout: 8000 });
  });

  test('MH moved portals: walk in -> correct room', async ({ page }, testInfo) => {
    testInfo.setTimeout(180000);
    for (const p of MH_PORTALS) {
      await gotoRoom(page, 'main_hall');
      await waitTeleportReady(page);
      await movePlayer(page, p.from[0], p.from[1]);
      await page.keyboard.down(p.key);
      await page.waitForFunction((r) => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s.currentRoomId === r;
      }, p.room, { timeout: 12000 });
      await page.keyboard.up(p.key);
      const info = await page.evaluate(() => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return { room: s.currentRoomId, x: Math.round(s.player.x), y: Math.round(s.player.y) };
      });
      expect(info.room).toBe(p.room);
    }
  });

  test('AI moved zones + portals', async ({ page }, testInfo) => {
    testInfo.setTimeout(180000);
    await gotoRoom(page, 'alpha_interior');
    for (const z of AI_ZONES) {
      await movePlayer(page, z.x, z.y);
      await page.waitForFunction((id) => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s?.interactionManager?.currentActiveZone?.id === id;
      }, z.id, { timeout: 8000 });
      expect(await hudLabel(page)).toContain(z.label);
      await pressEAndExpectModal(page, z.id);
    }
    // stair up -> floor 1 (lab), back via selector
    await movePlayer(page, 1055, 350);
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s?.interactionManager?.currentActiveZone?.id === 'zone_alpha_stair_up';
    }, { timeout: 8000 });
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.floorManager.currentFloor === 1;
    }, { timeout: 8000 });
    // về tầng trệt (room selector không reset floor)
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.floorManager.currentFloor = 0;
      s.floorManager.isTransitioning = false;
      s.loadRoom('alpha_interior', 680, 610, false);
    });
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.floorManager.currentFloor === 0;
    }, { timeout: 8000 });
    await page.waitForTimeout(1000);
    // lab portals -> dever_lab (walk left into pads)
    for (const [lx, lz, lname] of [[560, 225, 'Phòng Lab Hóa'], [560, 580, 'Phòng Server']]) {
      await waitTeleportReady(page);
      await movePlayer(page, lx, lz);
      await page.keyboard.down('ArrowLeft');
      await page.waitForFunction(() => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s.currentRoomId === 'dever_lab';
      }, { timeout: 12000 });
      await page.keyboard.up('ArrowLeft');
      // về lại sảnh qua room selector
      await gotoRoom(page, 'alpha_interior');
    }
  });

  test('screenshots: full maps + close-ups', async ({ page }, testInfo) => {
    testInfo.setTimeout(180000);
    await gotoRoom(page, 'main_hall');
    await cleanOverlays(page);
    await fitZoom(page);
    await page.screenshot({ path: `${IMG_DIR}/zonelayout-courtyard-full-desktop.png` });
    const zoomShot = async (name, x, y, z) => {
      await page.evaluate(([px, py, zz]) => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        s.applyZoomImmediate(zz);
        s.cameras.main.centerOn(px, py);
      }, [x, y, z]);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${IMG_DIR}/${name}-desktop.png` });
    };
    await zoomShot('zonelayout-closeup-stairs', 1000, 250, 2);      // cầu thang + portal thư viện
    await zoomShot('zonelayout-closeup-dock', 448, 465, 2.5);        // biển gỗ + câu cá
    await zoomShot('zonelayout-closeup-fountain', 710, 490, 2);      // cóc vàng / họp / bản đồ
    await zoomShot('zonelayout-closeup-bottompath', 480, 640, 1.5); // ký túc / kỷ niệm / căn tin
    // chuyển phòng trực tiếp (cleanOverlays đã ẩn room-selector)
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.loadRoom('alpha_interior', 680, 610, false);
    });
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s && s.currentRoomId === 'alpha_interior';
    }, { timeout: 15000 });
    await page.waitForTimeout(1500);
    await cleanOverlays(page);
    await fitZoom(page);
    await page.screenshot({ path: `${IMG_DIR}/zonelayout-interior-full-desktop.png` });
    await zoomShot('zonelayout-closeup-labdoors', 450, 430, 2);      // 2 portal lab
    await zoomShot('zonelayout-closeup-reception', 640, 520, 2);     // quầy lễ tân + cửa
  });
});

test.describe('zonelayout audit — mobile portrait', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test.beforeEach(async ({ page }) => { await login(page, 'ZoneLayout Mobile'); });

  test('MH moved zones E prompt (touch layout)', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    await gotoRoom(page, 'main_hall');
    for (const z of MH_ZONES) {
      await movePlayer(page, z.x, z.y);
      await page.waitForFunction((id) => {
        const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
        return s?.interactionManager?.currentActiveZone?.id === id;
      }, z.id, { timeout: 8000 });
      expect(await hudLabel(page)).toContain(z.label);
    }
  });

  test('portal teleport + screenshots', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    await gotoRoom(page, 'main_hall');
    await waitTeleportReady(page);
    // memory portal walk-in
    await movePlayer(page, 420, 585);
    await page.keyboard.down('ArrowLeft');
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s.currentRoomId === 'memory_room';
    }, { timeout: 12000 });
    await page.keyboard.up('ArrowLeft');
    // screenshots
    await gotoRoom(page, 'main_hall');
    await cleanOverlays(page);
    await fitZoom(page);
    await page.screenshot({ path: `${IMG_DIR}/zonelayout-courtyard-full-mobile.png` });
    await page.evaluate(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      s.loadRoom('alpha_interior', 680, 610, false);
    });
    await page.waitForFunction(() => {
      const s = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      return s && s.currentRoomId === 'alpha_interior';
    }, { timeout: 15000 });
    await page.waitForTimeout(1500);
    await cleanOverlays(page);
    await fitZoom(page);
    await page.screenshot({ path: `${IMG_DIR}/zonelayout-interior-full-mobile.png` });
  });
});
