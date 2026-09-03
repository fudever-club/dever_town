import { chromium, devices } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3030';
const auditDir = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/1fba7ee8-938b-4eb4-a46c-938f7d55ab9f/mobile_audit');

if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

const mobileDevices = [
  {
    name: 'iphone_14',
    title: 'iPhone 14 (390x844)',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  },
  {
    name: 'iphone_se',
    title: 'iPhone SE (375x667)',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  },
  {
    name: 'galaxy_s20',
    title: 'Samsung Galaxy S20 (412x915)',
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
    hasTouch: true,
    isMobile: true
  },
  {
    name: 'ipad_mini',
    title: 'iPad Mini (768x1024)',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  }
];

async function runMobileAudit() {
  console.log('--- STARTING MOBILE COMPATIBILITY & ERGONOMICS VISION AUDIT ---');
  const browser = await chromium.launch({ headless: true });
  const auditReport = [];

  for (const dev of mobileDevices) {
    console.log(`\nAuditing on device: ${dev.title}...`);
    const context = await browser.newContext({
      viewport: dev.viewport,
      userAgent: dev.userAgent,
      hasTouch: dev.hasTouch,
      isMobile: dev.isMobile,
      deviceScaleFactor: 2
    });

    const page = await context.newPage();

    // 1. Audit Welcome Gate
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(auditDir, `${dev.name}_01_welcome_gate.png`) });

    // 2. Login as Guest
    const guestInput = page.locator('#gate-guest-name');
    if (await guestInput.isVisible()) {
      await guestInput.fill('Mobile Dev');
      await page.click('#gate-form-guest button[type="submit"]');
    }

    // Wait for world scene
    await page.waitForSelector('#welcome-gate.hidden', { state: 'attached', timeout: 12000 });
    await page.waitForSelector('#game-loading-screen.hidden', { state: 'attached', timeout: 15000 });
    await page.waitForFunction(() => window.__DEVER_GAME__?.isBooted === true, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Đóng Onboarding Guide nếu có
    const onboardingBtn = page.locator('#onboarding-close-btn');
    if (await onboardingBtn.isVisible()) {
      await onboardingBtn.click();
      await page.waitForTimeout(600);
    }

    // 3. Screenshot Main Game View on Mobile (HUD + Canvas + D-Pad + Radar)
    await page.screenshot({ path: path.join(auditDir, `${dev.name}_02_ingame_overview.png`) });

    // 4. Test Touch D-Pad interaction (simulated tap on D-Pad buttons)
    const btnUp = page.locator('#touch-btn-up, .touch-dpad-up, [data-dir="up"]');
    const btnRight = page.locator('#touch-btn-right, .touch-dpad-right, [data-dir="right"]');
    const btnDown = page.locator('#touch-btn-down, .touch-dpad-down, [data-dir="down"]');
    const btnLeft = page.locator('#touch-btn-left, .touch-dpad-left, [data-dir="left"]');

    if (await btnRight.count() > 0) {
      await btnRight.first().dispatchEvent('touchstart');
      await page.waitForTimeout(300);
      await btnRight.first().dispatchEvent('touchend');
    }
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(auditDir, `${dev.name}_03_after_touch_move.png`) });

    // 5. Open & Audit Mobile Modals
    // A. Inventory Modal
    await page.evaluate(() => {
      const inv = document.getElementById('inventory-modal');
      if (inv) inv.classList.remove('hidden');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(auditDir, `${dev.name}_04_modal_inventory.png`) });
    await page.evaluate(() => {
      const inv = document.getElementById('inventory-modal');
      if (inv) inv.classList.add('hidden');
    });

    // B. Speed Code Duel Modal
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene?.speedCodeDuel) scene.speedCodeDuel.show();
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(auditDir, `${dev.name}_05_modal_speed_duel.png`) });
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene?.speedCodeDuel) scene.speedCodeDuel.hide();
    });

    // C. Campus Map Modal
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene?.interactiveModal) {
        scene.interactiveModal.show({ id: 'zone_campus', type: 'campus_map', name: 'Bản Đồ FPTU' });
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(auditDir, `${dev.name}_06_modal_campus_map.png`) });
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene?.interactiveModal) scene.interactiveModal.hide();
    });

    // 6. Check layout bounding box & overflow on DOM elements
    const elementMetrics = await page.evaluate(() => {
      const results = {};
      const targets = [
        '#main-header',
        '#game-container',
        '#touch-controls',
        '.minimap-container',
        '#chat-panel',
        '.header-actions'
      ];
      targets.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) {
          const rect = el.getBoundingClientRect();
          results[sel] = {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            overflows: el.scrollWidth > el.clientWidth + 1
          };
        }
      });
      return results;
    });

    auditReport.push({
      device: dev.title,
      viewport: dev.viewport,
      metrics: elementMetrics
    });

    await context.close();
  }

  fs.writeFileSync(path.join(auditDir, 'mobile_audit_report.json'), JSON.stringify(auditReport, null, 2), 'utf-8');
  await browser.close();
  console.log('\n--- MOBILE AUDIT COMPLETED SUCCESSFULLY! Check mobile_audit/ ---');
}

runMobileAudit().catch(err => {
  console.error('Error running mobile audit:', err);
  process.exit(1);
});
