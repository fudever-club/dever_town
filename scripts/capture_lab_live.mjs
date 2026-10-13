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

  // Switch to dever_lab
  console.log('Switching to dever_lab...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene) scene.loadRoom('dever_lab', 640, 650, false);
    const sel = document.getElementById('room-selector');
    if (sel) sel.value = 'dever_lab';
  });
  await page.waitForTimeout(3000);

  // Clean toasts
  await page.evaluate(() => {
    document.querySelectorAll('.achievement-toast, .toast-item, [class*="toast"]').forEach(t => t.remove());
  });
  await page.waitForTimeout(1000);

  // Move character slightly up towards whiteboard
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(800);

  const shotName = 'ingame_painted_dever_lab.png';
  const localFile = path.join(LOCAL_OUT, shotName);
  const artifactFile = path.join(ARTIFACT_DIR, shotName);
  await page.screenshot({ path: localFile });
  fs.copyFileSync(localFile, artifactFile);
  console.log('Saved painted dever_lab screenshot to:', artifactFile);

  await browser.close();
}

run().catch(console.error);
