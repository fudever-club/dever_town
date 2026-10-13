import { chromium } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const ROOMS = ['dever_lab', 'canteen_cafe', 'library_lounge', 'game_arcade', 'sports_complex'];

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
  await page.goto('http://localhost:3030/');
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('DeverTester');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }
  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Close guide
  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.count() && await closeGuide.first().isVisible()) {
    await closeGuide.first().click().catch(() => {});
  }

  for (const r of ROOMS) {
    await page.evaluate((roomId) => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene) scene.loadRoom(roomId, 400, 350, false);
      const sel = document.getElementById('room-selector');
      if (sel) sel.value = roomId;
    }, r);
    await page.waitForTimeout(1000);
    const shotPath = path.join(ARTIFACT_DIR, 'current_room_' + r + '.png');
    await page.screenshot({ path: shotPath });
    console.log('Saved:', shotPath);
  }
  await browser.close();
}

run().catch(console.error);
