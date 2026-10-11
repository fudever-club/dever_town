import { test, expect } from '@playwright/test';

/**
 * Phase E smoke: dock button [3] + hotkey 3 opens Clan modal; 4 clan cards;
 * join clan shows header clan tag; fort test event FSM runs (countdown →
 * active → payout) with timer pill + leader pill visible; no emoji.
 *
 * Screenshots → ~/workspace/dever-leader/reviews/img/ui-graal-2026-10-12/
 * (phaseE-* prefix) for the leader review.
 */
const IMG_DIR = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

test.describe('Clans + Fort test events (Phase E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('dever_onboarded_v1', '1');
      localStorage.setItem('dever_onboarding_seen', 'true');
      localStorage.setItem('dever_chat_hint_seen', '1');
    });
  });

  async function enterWorld(page, name) {
    await page.goto('/');
    await page.locator('#gate-guest-name').fill(name);
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 20000 });
    await page.waitForFunction(
      () => !!window.__DEVER_GAME__?.scene?.keys?.WorldScene?.clanModal,
      null, { timeout: 20000 }
    );
    // Boot overlay (#game-loading-screen) phải ẩn hẳn — scene object tồn
    // tại sớm hơn khi texture generation chưa xong (headless chậm).
    await expect(page.locator('#game-loading-screen')).toHaveClass(/hidden/, { timeout: 60000 });
  }

  async function fortState(page) {
    return page.evaluate(() => window.__DEVER_GAME__.scene.keys.WorldScene.fortEventManager.getState());
  }

  test('dock [3] opens Clan modal with 4 clan cards', async ({ page }, testInfo) => {
    await enterWorld(page, 'ClanTester');
    await page.locator('.dock-action-btn[data-dock-action="guild"]').click();
    const modal = page.locator('#clan-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(modal.locator('.clan-card')).toHaveCount(4);
    await expect(modal).toContainText('Web Builders');
    await expect(modal).toContainText('AI Core');
    await expect(modal).toContainText('Mobile Masters');
    await expect(modal).toContainText('Game Devs');
    await expect(modal).toContainText('Tham gia');
    await expect(modal).toContainText('Tổ chức test event');
    const text = await modal.innerText();
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    const tag = testInfo.project.name.includes('Mobile') ? 'mobile' : 'desktop';
    await page.screenshot({ path: `${IMG_DIR}/phaseE-clan-modal-${tag}.png` });
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);
  });

  test('hotkey 3 toggles Clan modal', async ({ page }) => {
    await enterWorld(page, 'ClanHotkey');
    await page.keyboard.press('Digit3');
    await expect(page.locator('#clan-modal')).not.toHaveClass(/hidden/);
    await page.keyboard.press('Digit3');
    await expect(page.locator('#clan-modal')).toHaveClass(/hidden/);
  });

  test('join clan shows header clan tag pill', async ({ page }) => {
    await enterWorld(page, 'ClanJoiner');
    await page.locator('.dock-action-btn[data-dock-action="guild"]').click();
    await page.locator('.clan-join-btn', { hasText: 'Tham gia' }).first().click();
    const tag = page.locator('#clan-tag-pill');
    await expect(tag).not.toHaveClass(/hidden/);
    await expect(tag).toHaveText('WEB');
    const color = await tag.evaluate((el) => el.style.getPropertyValue('--clan-color'));
    expect(color).toBe('#38bdf8');
    // Membership persists in localStorage.
    const stored = await page.evaluate(() => localStorage.getItem('devertown_clan_membership_v1'));
    expect(JSON.parse(stored).clanId).toBe('web_builders');
    // Modal shows current clan state.
    await expect(page.locator('#clan-modal')).toContainText('Đang ở đây');
    // Leave clan hides the tag again.
    await page.locator('.clan-leave-btn').click();
    await expect(tag).toHaveClass(/hidden/);
  });

  test('fort test event: countdown → active (timer pill) → payout', async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await enterWorld(page, 'FortTester');
    // Join a clan first so local presence counts.
    await page.evaluate(() => {
      const ws = window.__DEVER_GAME__.scene.keys.WorldScene;
      ws.clanModal.open();
      document.querySelector('.clan-join-btn:not(:disabled)').click();
      ws.clanModal.close();
    });
    // Start a short test event; drive the FSM manually because headless
    // rAF runs the game loop ~10x slower than wall time (timing itself is
    // covered deterministically by test/verify_clans.js).
    await page.evaluate(() => {
      const f = window.__DEVER_GAME__.scene.keys.WorldScene.fortEventManager;
      f.startTestEvent({ countdownSec: 2, durationSec: 12, testBotCount: 6 });
      f.update(2000); // hết countdown → active
      for (let i = 0; i < 5; i++) f.update(1000); // 5 ticks scoring
    });
    expect(await fortState(page)).toBe('active');
    const pill = page.locator('#fort-event-pill');
    await expect(pill).not.toHaveClass(/hidden/);
    const timerText = await page.locator('#fort-pill-timer').innerText();
    expect(timerText).toMatch(/^\d{2}:\d{2}$/);
    const leaderVisible = await page.locator('#fort-pill-leader:not(.hidden)').count();
    expect(leaderVisible).toBe(1);
    // Đợi toast (join bang / achievement) tự tắt để pill timer thấy rõ.
    await page.waitForTimeout(6000);
    const tag = testInfo.project.name.includes('Mobile') ? 'mobile' : 'desktop';
    await page.screenshot({ path: `${IMG_DIR}/phaseE-fort-event-${tag}.png` });
    // Advance to payout: duration 12s < ngưỡng 30s → 0 participant đủ điều
    // kiện, quỹ giữ lại (luật participation-based, đường honest).
    await page.evaluate(() => {
      const f = window.__DEVER_GAME__.scene.keys.WorldScene.fortEventManager;
      for (let i = 0; i < 8; i++) f.update(1000);
    });
    expect(await fortState(page)).toBe('payout');
    await expect(pill).toHaveClass(/hidden/);
    const report = await page.evaluate(() =>
      window.__DEVER_GAME__.scene.keys.WorldScene.fortEventManager.getLastReport());
    expect(report).not.toBeNull();
    expect(report.prizePool).toBe(300);
    expect(report.distributed).toBe(0);
    expect(report.participantCount).toBe(0);
  });

  test('modal "Tổ chức test event" button starts a real event', async ({ page }) => {
    await enterWorld(page, 'FortButton');
    await page.locator('.dock-action-btn[data-dock-action="guild"]').click();
    await page.locator('#clan-start-event-btn').click();
    expect(await fortState(page)).toBe('countdown');
    await expect(page.locator('#fort-event-pill')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await page.evaluate(() =>
      window.__DEVER_GAME__.scene.keys.WorldScene.fortEventManager.cancelEvent());
    expect(await fortState(page)).toBe('idle');
  });
});
