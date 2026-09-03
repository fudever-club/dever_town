import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/1fba7ee8-938b-4eb4-a46c-938f7d55ab9f/audit_visuals';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runVisualAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:3030...');
  await page.goto('http://localhost:3030', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_welcome_gate.png') });
  console.log('Saved 01_welcome_gate.png');

  console.log('2. Entering as guest...');
  await page.locator('#gate-guest-name').fill('Senior Auditor');
  await page.locator('#gate-form-guest button[type="submit"]').click();
  await page.waitForSelector('#game-container canvas', { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow room to load
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_main_hall.png') });
  console.log('Saved 02_main_hall.png');

  console.log('3. Opening Emote Bar...');
  await page.keyboard.press('KeyG');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_emote_bar.png') });
  console.log('Saved 03_emote_bar.png');

  console.log('4. Triggering Emote Dance...');
  const danceBtn = page.locator('.emote-item-btn[data-emote="dance"]');
  if (await danceBtn.isVisible()) {
    await danceBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_emote_reaction.png') });
    console.log('Saved 04_emote_reaction.png');
  }

  console.log('5. Opening Speed Code Duel...');
  const duelBtn = page.locator('#header-speed-duel-btn');
  if (await duelBtn.isVisible()) {
    await duelBtn.click();
    await page.waitForTimeout(500);
    const startBtn = page.locator('#duel-start-btn');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05_speed_duel_gameplay.png') });
      console.log('Saved 05_speed_duel_gameplay.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
  }

  console.log('6. Switching to Tech Lab...');
  const roomSelector = page.locator('#room-selector');
  await roomSelector.selectOption('dever_lab');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_tech_lab.png') });
  console.log('Saved 06_tech_lab.png');

  console.log('7. Switching to Canteen & Cafe...');
  await roomSelector.selectOption('canteen_cafe');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_canteen_cafe.png') });
  console.log('Saved 07_canteen_cafe.png');

  await browser.close();
  console.log('Visual audit capture complete!');
}

runVisualAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
