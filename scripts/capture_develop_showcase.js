import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function captureShowcase() {
  const outputDir = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/1fba7ee8-938b-4eb4-a46c-938f7d55ab9f/audit_visuals');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to game...');
  await page.goto('http://localhost:3030/');
  await page.waitForTimeout(1000);

  // Login as guest
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('Senior Dev FUDA');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }

  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForSelector('#game-loading-screen', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Close onboarding guide if visible
  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.isVisible()) {
    await closeGuide.click();
    await page.waitForTimeout(500);
  }

  // 1. Sảnh chính Tòa Alpha với đồ họa mới, header 1 dòng và radar HUD
  await page.screenshot({ path: path.join(outputDir, '10_develop_main_hall_overhaul.png') });
  console.log('Saved 10_develop_main_hall_overhaul.png');

  // 2. Mở Cóc Vàng Tâm Linh Bói Quẻ
  await page.evaluate(() => {
    const worldScene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (worldScene && worldScene.interactiveModal) {
      worldScene.interactiveModal.show({
        id: 'zone_main_frog',
        type: 'golden_frog_fortune',
        name: 'Linh Vật Cóc Vàng FUDA',
        label: 'Bái Cóc Vàng'
      });
    }
  });
  await page.waitForTimeout(600);
  // Bấm rút quẻ
  const drawBtn = page.locator('#btn-draw-fortune');
  if (await drawBtn.isVisible()) {
    await drawBtn.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(outputDir, '11_develop_golden_frog_fortune.png') });
  console.log('Saved 11_develop_golden_frog_fortune.png');

  // Đóng modal
  await page.locator('#interactive-modal-close').click();
  await page.waitForTimeout(500);

  // 3. Chuyển sang Tech Lab kiểm tra kính mờ (kính không còn sọc chéo CAD)
  const roomSelector = page.locator('#room-selector');
  await roomSelector.selectOption('dever_lab');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, '12_develop_tech_lab_frosted_glass.png') });
  console.log('Saved 12_develop_tech_lab_frosted_glass.png');

  await browser.close();
  console.log('All showcase screenshots captured successfully!');
}

captureShowcase().catch(console.error);
