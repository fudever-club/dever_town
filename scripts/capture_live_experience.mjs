import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const LOCAL_OUT = path.resolve('public/screenshots');

async function run() {
  console.log('Launching browser...');
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

  console.log('Navigating to http://localhost:3030/?room=dever_lab ...');
  await page.goto('http://localhost:3030/?room=dever_lab', { waitUntil: 'domcontentloaded' });
  
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('DeverHung');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }
  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(3000);

  // Close guide if visible
  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.count() && await closeGuide.first().isVisible()) {
    await closeGuide.first().click().catch(() => {});
  }

  // 1. Capture Overview Screenshot in dever_lab
  console.log('Capturing Screenshot 1: dever_lab overview...');
  const shot1 = 'dever_lab_live_overview.png';
  await page.screenshot({ path: path.join(LOCAL_OUT, shot1) });
  fs.copyFileSync(path.join(LOCAL_OUT, shot1), path.join(ARTIFACT_DIR, shot1));
  console.log('Saved:', shot1);

  // 2. Walk to Hackathon Alpha 1 chair at (425, 440) and sit down
  console.log('Moving player to Hackathon chair Alpha 1 at (425, 440)...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene && scene.player) {
      scene.player.setPosition(425, 440);
    }
  });
  await page.waitForTimeout(1000);

  console.log('Pressing [E] to sit down at Hackathon desk...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1500);

  const shot2 = 'dever_lab_player_sitting_desk.png';
  await page.screenshot({ path: path.join(LOCAL_OUT, shot2) });
  fs.copyFileSync(path.join(LOCAL_OUT, shot2), path.join(ARTIFACT_DIR, shot2));
  console.log('Saved:', shot2);

  // 3. Stand up and move to Sofa Lounge (1140, 195)
  console.log('Pressing [E] to stand up...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(800);

  console.log('Moving player to Sofa Lounge at (1140, 195)...');
  await page.evaluate(() => {
    const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
    if (scene && scene.player) {
      scene.player.setPosition(1140, 195);
    }
  });
  await page.waitForTimeout(1000);

  console.log('Pressing [E] to sit down on Sofa...');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1500);

  const shot3 = 'dever_lab_player_sitting_sofa.png';
  await page.screenshot({ path: path.join(LOCAL_OUT, shot3) });
  fs.copyFileSync(path.join(LOCAL_OUT, shot3), path.join(ARTIFACT_DIR, shot3));
  console.log('Saved:', shot3);

  console.log('All live captures complete!');
  await browser.close();
}

run().catch(console.error);
