import { test, expect } from '@playwright/test';

async function enterFreshGuest(page, name = 'Retention Tester') {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('retention-test-initialized')) {
      localStorage.clear();
      sessionStorage.setItem('retention-test-initialized', 'true');
    }
  });
  await page.goto('/');
  await page.locator('#gate-guest-name').fill(name);
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
  await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
  const onboardingBtn = page.locator('#onboarding-close-btn');
  await onboardingBtn.waitFor({ state: 'visible', timeout: 1500 }).then(() => onboardingBtn.click()).catch(() => {});
}

test.describe('DEVER TOWN - Retention Progress Loop', () => {
  test('first session exposes a claimable goal and keeps progress UI authoritative', async ({ page }) => {
    await enterFreshGuest(page);

    const goalHud = page.locator('#daily-goal-hud');
    await expect(goalHud).toBeVisible();
    await expect(goalHud).toHaveAttribute('data-goal-kind', 'claim');
    await expect(page.locator('#daily-goal-title')).toContainText('Điểm Danh Mỗi Ngày');
    await expect(page.locator('#daily-goal-sync-status')).toHaveText('Đã lưu trên thiết bị');

    const goalAction = page.locator('#daily-goal-action');
    await goalAction.click();

    const questModal = page.locator('#quest-modal');
    await expect(questModal).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('#quest-modal-close')).toBeFocused();
    await expect(page.locator('#quest-prog-text')).toContainText('1 / 7');
    await expect(questModal).not.toContainText('/ 6');

    await page.locator('[data-quest-id="daily_login"]').click();
    await expect(page.locator('#header-points-display')).toHaveText('40');
    await expect(goalHud).toHaveAttribute('data-goal-kind', 'progress');
    await expect(page.locator('#daily-goal-title')).toContainText('Nhà Thám Hiểm FUDA');

    const stored = await page.evaluate(() => ({
      points: localStorage.getItem('dever_points'),
      quests: JSON.parse(localStorage.getItem('dever_quests_state'))
    }));
    expect(stored.points).toBe('40');
    expect(stored.quests.daily_login.claimed).toBe(true);
    expect(stored.quests.explorer_rooms.progress).toBe(1);
    expect(stored.quests.explorer_rooms.visitedRoomIds).toEqual(['main_hall']);

    await page.locator('#quest-modal-close').click();
    await expect(goalAction).toBeFocused();
  });

  test('achievement points and room progress survive reload without regression', async ({ page }) => {
    await enterFreshGuest(page, 'Return Session Tester');

    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene?.achievementManager?.unlock('stage_dancer');
    });
    await expect(page.locator('#header-points-display')).toHaveText('45');

    await page.locator('#room-selector').selectOption('dever_lab');
    await expect.poll(async () => page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('dever_quests_state'));
      return state.explorer_rooms.progress;
    })).toBe(2);

    await page.reload();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/, { timeout: 10000 });
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#header-points-display')).toHaveText('45');

    const persisted = await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('dever_quests_state'));
      return {
        progress: state.explorer_rooms.progress,
        rooms: state.explorer_rooms.visitedRoomIds,
        points: localStorage.getItem('dever_points')
      };
    });
    expect(persisted.progress).toBe(2);
    expect(persisted.rooms).toEqual(expect.arrayContaining(['main_hall', 'dever_lab']));
    expect(persisted.points).toBe('45');
  });

  test('authenticated state hydrates before mutation and failed sync can be retried', async ({ page }) => {
    const today = new Date().toDateString();
    let failSync = false;
    const syncPayloads = [];
    const serverUser = {
      id: 'user_retention_1',
      email: 'retention@fuda.test',
      display_name: 'Retention Member',
      avatar_id: 'dev_hoodie',
      role: 'dev',
      dever_points: 120,
      quests_state: {
        daily_login: { progress: 0, completed: false, claimed: false },
        explorer_rooms: { progress: 2, completed: false, claimed: false, visitedRoomIds: ['main_hall', 'dever_lab'] }
      },
      quest_date: today,
      quest_milestone: false
    };

    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('dever_points', '5');
      localStorage.setItem('dever_quest_date', new Date().toDateString());
    });
    await page.route('**/api/auth/login', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, token: 'retention-token', user: serverUser })
    }));
    await page.route('**/api/auth/sync-profile', async route => {
      const patch = route.request().postDataJSON();
      syncPayloads.push(patch);
      const shouldFail = failSync;
      await new Promise(resolve => setTimeout(resolve, 650));
      if (shouldFail) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Tạm thời mất kết nối' })
        });
        return;
      }
      Object.assign(serverUser, {
        dever_points: patch.deverPoints ?? serverUser.dever_points,
        quests_state: patch.questsState ?? serverUser.quests_state,
        quest_date: patch.questDate ?? serverUser.quest_date,
        quest_milestone: patch.questMilestone ?? serverUser.quest_milestone
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: serverUser })
      });
    });

    await page.goto('/');
    await page.locator('.gate-tab-btn[data-tab="login"]').click();
    await page.locator('#gate-login-email').fill('retention@fuda.test');
    await page.locator('#gate-login-password').fill('secret123');
    await page.locator('#gate-form-login button[type="submit"]').click();
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    const onboardingBtn = page.locator('#onboarding-close-btn');
    await onboardingBtn.waitFor({ state: 'visible', timeout: 1500 }).then(() => onboardingBtn.click()).catch(() => {});

    // 120 server points + 20 for the newly unlocked first-arrival achievement.
    await expect(page.locator('#header-points-display')).toHaveText('140');
    await expect(page.locator('#daily-goal-sync-status')).toHaveText('Đã đồng bộ tài khoản', { timeout: 5000 });
    expect(syncPayloads.at(-1).deverPoints).toBe(140);
    expect(syncPayloads.at(-1).questsState.explorer_rooms.progress).toBe(2);

    const syncCountBeforeFailure = syncPayloads.length;
    failSync = true;
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene?.achievementManager?.unlock('golden_frog');
    });
    await expect(page.locator('#daily-goal-sync-status')).toContainText('Đang đồng bộ');
    // Queue a newer total while the first failed batch is still in flight.
    // Retry must keep 195, not restore the older 170-point payload.
    await page.waitForTimeout(450);
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene?.achievementManager?.unlock('stage_dancer');
    });
    await expect.poll(() => syncPayloads.length).toBeGreaterThanOrEqual(syncCountBeforeFailure + 2);
    await page.waitForTimeout(700);
    await expect(page.locator('#daily-goal-retry')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#daily-goal-sync-status')).toContainText('tiến trình vẫn an toàn');

    failSync = false;
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene?.networkStatusOverlay?.showLagSpinner('Mạng chậm', 'Tiến trình vẫn được lưu cục bộ.');
    });
    await expect(page.locator('#lag-spinner-overlay')).toBeVisible();
    await page.locator('#daily-goal-retry').click();
    await expect(page.locator('#daily-goal-sync-status')).toHaveText('Đã đồng bộ tài khoản', { timeout: 5000 });
    expect(syncPayloads.at(-1).deverPoints).toBe(195);
  });

  test('confirmed achievement trigger references are wired to real scene and item IDs', async ({ page }) => {
    await enterFreshGuest(page, 'Achievement Wiring Tester');

    const result = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene.inventoryManager.items.macbook_dev = 1;
      scene.inventoryManager.equipItem('macbook_dev');

      const duel = scene.speedCodeDuel;
      duel.questions = new Array(10).fill({});
      duel.correctCount = 10;
      duel.score = 2500;
      duel.maxStreak = 10;
      duel.finishMatch();

      scene.interactiveModal.setupSportsView({ metadata: { sport: 'football' } });
      const arcade = scene.interactiveModal.sportsArcade;
      arcade.stop();
      arcade.scores.footballStreak = 2;
      arcade.football.state = 'shooting';
      arcade.football.ball.progress = 0.99;
      arcade.football.ball.startX = 320;
      arcade.football.ball.startY = 305;
      arcade.football.ball.targetX = 200;
      arcade.football.ball.targetY = 130;
      arcade.football.gk.targetX = 450;
      arcade.football.gk.diveProgress = 1;
      arcade.updateFootball(1);

      const questState = JSON.parse(localStorage.getItem('dever_quests_state'));

      return {
        tech: scene.achievementManager.isUnlocked('tech_pro'),
        speed: scene.achievementManager.isUnlocked('speed_coder'),
        striker: scene.achievementManager.isUnlocked('striker'),
        focusProgress: questState.focus_lofi_pomo.progress
      };
    });

    expect(result).toEqual({ tech: true, speed: true, striker: true, focusProgress: 0 });
  });

  test('serialized sync recovers a failed full batch before a newer partial batch', async ({ page }) => {
    const today = new Date().toDateString();
    const payloads = [];
    let failNextRequest = false;
    let activeRequests = 0;
    let maxConcurrentRequests = 0;
    const serverUser = {
      id: 'user_serial_sync',
      email: 'serial@fuda.test',
      display_name: 'Serial Sync Member',
      avatar_id: 'dev_hoodie',
      role: 'dev',
      dever_points: 80,
      quests_state: {},
      quest_date: today,
      quest_milestone: false,
      inventory_items: { fptu_keychain: 1 }
    };

    await page.addInitScript(() => localStorage.clear());
    await page.route('**/api/auth/login', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, token: 'serial-token', user: serverUser })
    }));
    await page.route('**/api/auth/sync-profile', async route => {
      const payload = route.request().postDataJSON();
      const shouldFail = failNextRequest;
      if (shouldFail) failNextRequest = false;
      payloads.push(payload);
      activeRequests += 1;
      maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests);
      await new Promise(resolve => setTimeout(resolve, shouldFail ? 800 : 120));
      activeRequests -= 1;

      if (shouldFail) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Full batch failed' })
        });
        return;
      }

      Object.assign(serverUser, {
        dever_points: payload.deverPoints ?? serverUser.dever_points,
        quests_state: payload.questsState ?? serverUser.quests_state,
        quest_date: payload.questDate ?? serverUser.quest_date,
        quest_milestone: payload.questMilestone ?? serverUser.quest_milestone,
        inventory_items: payload.inventoryItems ?? serverUser.inventory_items,
        equipped_item_id: payload.equippedItemId ?? serverUser.equipped_item_id
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: serverUser })
      });
    });

    await page.goto('/');
    await page.locator('.gate-tab-btn[data-tab="login"]').click();
    await page.locator('#gate-login-email').fill('serial@fuda.test');
    await page.locator('#gate-login-password').fill('secret123');
    await page.locator('#gate-form-login button[type="submit"]').click();
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 15000 });
    await expect(page.locator('#daily-goal-sync-status')).toHaveText('Đã đồng bộ tài khoản', { timeout: 5000 });

    const baselineRequestCount = payloads.length;
    failNextRequest = true;
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene?.achievementManager?.unlock('golden_frog');
    });

    // Wait until full progression batch A is definitely in flight.
    await expect.poll(() => payloads.length).toBe(baselineRequestCount + 1);

    // Queue partial inventory batch B while A is still awaiting its failure.
    const partialCallerResult = await page.evaluate(async () => {
      const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
      scene.inventoryManager.items.fptu_keychain = 2;
      const syncedUser = await scene.inventoryManager.syncToServer('fptu_keychain');
      return syncedUser?.id || null;
    });

    await expect.poll(() => payloads.length).toBe(baselineRequestCount + 2);
    const recoveredPayload = payloads.at(-1);
    expect(maxConcurrentRequests).toBe(1);
    expect(partialCallerResult).toBe('user_serial_sync');
    expect(recoveredPayload.deverPoints).toBe(130);
    expect(recoveredPayload.questsState).toBeDefined();
    expect(recoveredPayload.questDate).toBe(today);
    expect(recoveredPayload.inventoryItems.fptu_keychain).toBe(2);
    expect(recoveredPayload.equippedItemId).toBe('fptu_keychain');
    await expect(page.locator('#daily-goal-sync-status')).toHaveText('Đã đồng bộ tài khoản');
    await expect(page.locator('#daily-goal-retry')).toBeHidden();
  });

  test('mobile Daily Goal HUD stays inside the viewport and above thumb controls', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile geometry only');
    await enterFreshGuest(page, 'Mobile Retention Tester');

    const geometry = await page.evaluate(() => {
      const hud = document.getElementById('daily-goal-hud').getBoundingClientRect();
      const interact = document.getElementById('touch-btn-interact').getBoundingClientRect();
      return {
        hud: { left: hud.left, right: hud.right, top: hud.top, bottom: hud.bottom },
        interactTop: interact.top,
        viewportWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    expect(geometry.hud.left).toBeGreaterThanOrEqual(0);
    expect(geometry.hud.right).toBeLessThanOrEqual(geometry.viewportWidth);
    expect(geometry.hud.top).toBeGreaterThanOrEqual(44);
    expect(geometry.hud.bottom).toBeLessThan(geometry.interactTop);
    expect(geometry.overflow).toBe(false);
  });
});
