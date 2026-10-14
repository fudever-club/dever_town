import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const LOCAL_OUT = path.resolve('public/screenshots');

async function run() {
  console.log('Launching browser for live dever_lab experience...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\This PC\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
    localStorage.setItem('dever_nickname', 'DeverHung');
  });

  console.log('Loading http://localhost:3030/ ...');
  await page.goto('http://localhost:3030/', { waitUntil: 'domcontentloaded' });

  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('DeverHung');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }
  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Close guide if visible
  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.count() && await closeGuide.first().isVisible()) {
    await closeGuide.first().click().catch(() => {});
  }

  // Switch to dever_lab
  console.log('Switching room to dever_lab...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene) {
      scene.loadRoom('dever_lab', 650, 680, false);
      const sel = document.getElementById('room-selector');
      if (sel) sel.value = 'dever_lab';
    }
  });
  await page.waitForTimeout(3000);

  // Clean toasts & modals
  await page.evaluate(() => {
    document.querySelectorAll('.achievement-toast, .toast-item, [class*="toast"]').forEach(t => t.remove());
  });
  await page.waitForTimeout(1000);

  // 1. Capture Full Map View of dever_lab
  console.log('Capturing Image 1: dever_lab full room overview...');
  const shot1 = 'live_dever_lab_overview.png';
  await page.screenshot({ path: path.join(LOCAL_OUT, shot1) });
  fs.copyFileSync(path.join(LOCAL_OUT, shot1), path.join(ARTIFACT_DIR, shot1));
  console.log('Saved:', shot1);

  // 2. Walk to Hackathon Alpha 1 chair (x: 425, y: 440)
  console.log('Moving player to Hackathon chair Alpha 1 at (425, 440)...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene && scene.player) {
      scene.player.setPosition(425, 455);
    }
  });
  await page.waitForTimeout(1000);

  // Press E to interact and sit
  console.log('Pressing [E] to sit down at Hackathon desk...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1500);

  const shot2 = 'live_dever_lab_player_hackathon.png';
  await page.screenshot({ path: path.join(LOCAL_OUT, shot2) });
  fs.copyFileSync(path.join(LOCAL_OUT, shot2), path.join(ARTIFACT_DIR, shot2));
  console.log('Saved:', shot2);

  // 3. Stand up and walk to Sofa Lounge
  console.log('Pressing [E] to stand up...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(800);

  console.log('Moving player to Sofa Lounge at (1140, 210)...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene && scene.player) {
      scene.player.setPosition(1140, 210);
    }
  });
  await page.waitForTimeout(1000);

  console.log('Pressing [E] to sit down on Sofa...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1500);

  const shot3 = 'live_dever_lab_player_sofa.png';
  await page.screenshot({ path: path.join(LOCAL_OUT, shot3) });
  fs.copyFileSync(path.join(LOCAL_OUT, shot3), path.join(ARTIFACT_DIR, shot3));
  console.log('Saved:', shot3);

  console.log('All live game captures successful!');
  await browser.close();
}

run().catch(console.error);
