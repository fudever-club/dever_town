import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const LOCAL_OUT = path.resolve('public/screenshots');

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\This PC\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });

  await page.goto('http://localhost:3030/', { waitUntil: 'domcontentloaded' });
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('DeverHung');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }
  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Close guide
  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.count() && await closeGuide.first().isVisible()) {
    await closeGuide.first().click().catch(() => {});
  }

  // Switch to dever_lab and walk to the chair of Beta team (809, 515)
  console.log('Teleporting near chair Beta at (809, 515) in dever_lab...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene) {
      scene.loadRoom('dever_lab', 809, 515, false);
      const sel = document.getElementById('room-selector');
      if (sel) sel.value = 'dever_lab';
    }
  });
  await page.waitForTimeout(2500);

  // Press E to sit on the chair
  console.log('Pressing [E] to sit down on chair...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1200);

  // Capture sitting screenshot
  const shotName = 'ingame_sitting_at_desk.png';
  const localFile = path.join(LOCAL_OUT, shotName);
  const artifactFile = path.join(ARTIFACT_DIR, shotName);
  await page.screenshot({ path: localFile });
  fs.copyFileSync(localFile, artifactFile);
  console.log('Saved sitting screenshot to:', artifactFile);

  await browser.close();
}

run().catch(console.error);
