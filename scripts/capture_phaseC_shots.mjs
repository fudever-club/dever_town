/**
 * Phase C screenshots: HP bar full (50/50) + VUNG AN TOAN badge in a safe zone.
 * Desktop (1280x800) + Mobile portrait (390x844).
 * Usage: node scripts/capture_phaseC_shots.mjs  (dev server on :3030)
 */
import { chromium } from '@playwright/test';

const OUT = '/home/hatch/workspace/dever-leader/reviews/img/ui-graal-2026-10-12';

async function enterWorld(page) {
  // Disable onboarding tour + chat hint BEFORE first load so they don't cover the HUD
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });
  await page.goto('http://localhost:3030/', { waitUntil: 'domcontentloaded' });
  await page.locator('#gate-guest-name').fill('Phase C Tester');
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await page.locator('#welcome-gate.hidden').waitFor({ state: 'attached', timeout: 15000 });
  await page.locator('#game-container canvas').waitFor({ timeout: 15000 });
  // Wait for GraalHUD vitals to mount
  await page.locator('#graal-hp-value').waitFor({ timeout: 15000 });
  await page.waitForTimeout(2000);
  // Dismiss the newbie guide modal if it appears (fresh guest session)
  const guideBtn = page.locator('button:has-text("Đã Hiểu, Bắt Đầu Chơi Ngay")');
  if (await guideBtn.count()) {
    await guideBtn.first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
  }
  // Dismiss any achievement toast overlapping the vitals cluster
  await page.evaluate(() => {
    document.querySelectorAll('.achievement-toast, .toast-item, [class*="toast"]').forEach((t) => t.remove());
  });
  await page.waitForTimeout(1500); // let world settle bright
}

async function shot(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await enterWorld(page);
  const hp = await page.locator('#graal-hp-value').textContent();
  const badge = await page.locator('#graal-safe-zone').textContent();
  console.log(`[${name}] HP=${hp?.trim()} badge=${badge?.trim()}`);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  // Zoomed crops of the HP card + safe badge for pixel inspection
  await page.locator('#graal-hp-card').screenshot({ path: `${OUT}/${name}-hp-zoom.png` });
  await page.locator('#graal-safe-zone').screenshot({ path: `${OUT}/${name}-badge-zoom.png` });
  await context.close();
}

const browser = await chromium.launch();
await shot(browser, 'phaseC-desktop', { width: 1280, height: 800 });
await shot(browser, 'phaseC-mobile-portrait', { width: 390, height: 844 });
await browser.close();
console.log('DONE');
