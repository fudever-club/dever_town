import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/This PC/.gemini/antigravity-ide/brain/f4243eb1-3b00-4f93-aaec-327220655ce0';
const LOCAL_OUT = path.resolve('public/screenshots');

if (!fs.existsSync(LOCAL_OUT)) {
  fs.mkdirSync(LOCAL_OUT, { recursive: true });
}

async function capture() {
  console.log('🚀 Launching Chromium from local ms-playwright...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Users\\This PC\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  // Disable onboarding tour & hints
  await page.addInitScript(() => {
    localStorage.setItem('dever_onboarded_v1', '1');
    localStorage.setItem('dever_chat_hint_seen', '1');
  });

  console.log('🌐 Opening http://localhost:3030/ ...');
  await page.goto('http://localhost:3030/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Fill guest name
  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    console.log('👤 Logging in as guest "DeverHung"...');
    await nameInput.fill('DeverHung');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }

  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForSelector('#game-container canvas', { timeout: 15000 });
  console.log('🎮 Canvas loaded, waiting for world scene to settle...');
  await page.waitForTimeout(3000);

  // Dismiss newbie guide if visible
  const guideBtn = page.locator('button:has-text("Đã Hiểu, Bắt Đầu Chơi Ngay")');
  if (await guideBtn.count() && await guideBtn.first().isVisible()) {
    await guideBtn.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }
  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.count() && await closeGuide.first().isVisible()) {
    await closeGuide.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Remove any overlapping toasts
  await page.evaluate(() => {
    document.querySelectorAll('.achievement-toast, .toast-item, [class*="toast"]').forEach((t) => t.remove());
  });
  await page.waitForTimeout(1500);

  // 1. CAPTURE MAP 1: main_hall (Sân Alpha V2)
  console.log('📸 Capturing Map 1: main_hall (Sân Alpha V2) with Mẫu 1A Oak & Brass dock...');
  const shot1Name = 'map1_main_hall_courtyard_dock_1a.png';
  const shot1Local = path.join(LOCAL_OUT, shot1Name);
  const shot1Artifact = path.join(ARTIFACT_DIR, shot1Name);
  await page.screenshot({ path: shot1Local });
  fs.copyFileSync(shot1Local, shot1Artifact);
  console.log('✅ Saved shot 1:', shot1Artifact);

  // Zoom dock on main_hall
  const dock = page.locator('.graal-dock');
  if (await dock.count() && await dock.first().isVisible()) {
    const dockZoomName = 'dock_1a_oak_brass_zoom.png';
    const dockLocal = path.join(LOCAL_OUT, dockZoomName);
    const dockArtifact = path.join(ARTIFACT_DIR, dockZoomName);
    await dock.first().screenshot({ path: dockLocal });
    fs.copyFileSync(dockLocal, dockArtifact);
    console.log('✅ Saved dock zoom:', dockArtifact);
  }

  // 2. SWITCH TO MAP 2: alpha_interior (Sảnh Alpha V3)
  console.log('🔄 Switching to alpha_interior (Sảnh Tòa Alpha)...');
  await page.evaluate(() => {
    const roomSelector = document.getElementById('room-selector');
    if (roomSelector) {
      roomSelector.value = 'alpha_interior';
      roomSelector.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Wait for new room to load completely
  await page.waitForTimeout(3000);

  // Remove toasts again if any appeared on room switch
  await page.evaluate(() => {
    document.querySelectorAll('.achievement-toast, .toast-item, [class*="toast"]').forEach((t) => t.remove());
  });
  await page.waitForTimeout(1000);

  // 3. CAPTURE MAP 2: alpha_interior (Sảnh Tòa Alpha)
  console.log('📸 Capturing Map 2: alpha_interior (Sảnh Tòa Alpha) with leadership NPCs and Mẫu 1A dock...');
  const shot2Name = 'map2_alpha_interior_lobby_dock_1a.png';
  const shot2Local = path.join(LOCAL_OUT, shot2Name);
  const shot2Artifact = path.join(ARTIFACT_DIR, shot2Name);
  await page.screenshot({ path: shot2Local });
  fs.copyFileSync(shot2Local, shot2Artifact);
  console.log('✅ Saved shot 2:', shot2Artifact);

  // Move character slightly north towards reception desk and capture another view
  console.log('🚶 Moving character towards reception desk...');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(600);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(1000);

  const shot3Name = 'map2_alpha_interior_reception_view.png';
  const shot3Local = path.join(LOCAL_OUT, shot3Name);
  const shot3Artifact = path.join(ARTIFACT_DIR, shot3Name);
  await page.screenshot({ path: shot3Local });
  fs.copyFileSync(shot3Local, shot3Artifact);
  console.log('✅ Saved shot 3:', shot3Artifact);

  await browser.close();
  console.log('🎉 All in-game screenshots captured and saved to artifact directory!');
}

capture().catch((err) => {
  console.error('❌ Capture failed:', err);
  process.exit(1);
});
