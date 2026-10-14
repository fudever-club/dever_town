import { chromium } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const ROOMS = [
  { id: 'canteen_cafe', spawnX: 690, spawnY: 650, name: 'Căn Tin & Cafe' },
  { id: 'library_lounge', spawnX: 692, spawnY: 650, name: 'Thư Viện Tri Thức' },
  { id: 'dorm_room', spawnX: 680, spawnY: 650, name: 'Ký Túc Xá FUDA' }
];

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\This PC\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
    localStorage.setItem('dever_wardrobe_config', JSON.stringify({ characterId: 'stardew_dev_hoodie' }));
  });

  await page.goto('http://localhost:3030/');
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('DeverStardew');
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
    console.log(`Testing room: ${r.id}...`);
    await page.evaluate(({ roomId, x, y }) => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene) {
        scene.loadRoom(roomId, x, y, false);
        if (scene.player) {
          scene.player.setTexture('char_stardew_dev_hoodie');
          scene.player.avatarId = 'stardew_dev_hoodie';
          scene.player.play('idle_down_stardew_dev_hoodie', true);
        }
      }
      const sel = document.getElementById('room-selector');
      if (sel) sel.value = roomId;
    }, { roomId: r.id, x: r.spawnX, y: r.spawnY });

    await page.waitForTimeout(2500);

    const shotName = `live_${r.id}_stardew.png`;
    const shotPath = path.join(ARTIFACT_DIR, shotName);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    // Also copy to public/screenshots for web/user reference
    const pubPath = path.join('public', 'screenshots', shotName);
    await page.screenshot({ path: pubPath });
  }

  await browser.close();
  console.log('All captures completed successfully!');
}

run().catch(console.error);
