import { chromium } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const ROOMS = [
  { id: 'canteen_cafe', spawnX: 290, spawnY: 650, avatar: 'stardew_fptu_polo', name: 'Căn Tin & Cafe Sạch' },
  { id: 'library_lounge', spawnX: 790, spawnY: 650, avatar: 'stardew_aodai', name: 'Thư Viện Sạch' },
  { id: 'game_arcade', spawnX: 380, spawnY: 650, avatar: 'stardew_cyber', name: 'Arcade Gaming' },
  { id: 'sports_complex', spawnX: 680, spawnY: 650, avatar: 'stardew_fptu_polo', name: 'Khu Thể Thao' },
  { id: 'meeting_room', spawnX: 680, spawnY: 650, avatar: 'stardew_wizard', name: 'Phòng Họp CLB' }
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
    localStorage.setItem('dever_wardrobe_config', JSON.stringify({ characterId: 'stardew_fptu_polo' }));
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
    console.log(`Testing room: ${r.id} with avatar: ${r.avatar}...`);
    await page.evaluate(({ roomId, x, y, avatarId }) => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene) {
        scene.loadRoom(roomId, x, y, false);
        if (scene.player) {
          scene.player.setTexture(`char_${avatarId}`);
          scene.player.avatarId = avatarId;
          scene.player.play(`idle_down_${avatarId}`, true);
        }
      }
      const sel = document.getElementById('room-selector');
      if (sel) sel.value = roomId;
    }, { roomId: r.id, x: r.spawnX, y: r.spawnY, avatarId: r.avatar });

    await page.waitForTimeout(2500);

    const shotName = `live_clean_${r.id}_${r.avatar}.png`;
    const shotPath = path.join(ARTIFACT_DIR, shotName);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    const pubPath = path.join('public', 'screenshots', shotName);
    await page.screenshot({ path: pubPath });
  }

  await browser.close();
  console.log('All clean room captures completed successfully!');
}

run().catch(console.error);
