// Font audit screenshots: portal label, E prompt, name tag side by side.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto('http://localhost:3030/');
await page.locator('#gate-guest-name').fill('Font Audit');
await page.locator('#gate-form-guest button[type="submit"]').click();
await page.waitForSelector('#game-container canvas', { timeout: 20000 });
// Dismiss onboarding overlay if present (may appear after game boots)
async function dismissOnboarding() {
  for (let i = 0; i < 3; i++) {
    const btn = page.locator('#onboarding-close-btn:visible, button:has-text("Đã Hiểu"):visible').first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(600);
    } else break;
  }
}
await dismissOnboarding();
await page.waitForTimeout(3000); // let BootScene finish font preload + WorldScene boot
await dismissOnboarding();

const info = await page.evaluate(() => {
  const scene = window.__DEVER_GAME__?.scene?.keys?.WorldScene;
  if (!scene || !scene.player) return { error: 'no scene' };
  const fonts = {
    beVN: document.fonts.check('700 11px "Be Vietnam Pro"'),
    tiltNeon: document.fonts.check('400 16px "Tilt Neon"'),
  };
  const portals = (scene.portalLabels || []).map((lbl) => {
    const t = lbl.getData ? lbl.getData('txt') : lbl;
    return { x: Math.round(lbl.x), y: Math.round(lbl.y), text: t?.text, fontFamily: t?.style?.fontFamily, fontSize: t?.style?.fontSize, color: t?.style?.color };
  });
  const badges = (scene.interactionManager?.badges || []).slice(0, 3).map((b) => {
    const kids = b.container?.list || [];
    const t = kids.find((k) => k.type === 'Text');
    return { zoneId: b.zoneId, text: t?.text, fontFamily: t?.style?.fontFamily, fontSize: t?.style?.fontSize };
  });
  const zones = (scene.interactionManager?.zones || []).slice(0, 3).map((z) => ({ id: z.id, worldX: z.worldX, worldY: z.worldY }));
  const nameTag = scene.player?.nameTagContainer?.list?.[0];
  return {
    fonts, portals, badges, zones,
    nameTag: nameTag ? { text: nameTag.text, fontFamily: nameTag.style?.fontFamily, fontSize: nameTag.style?.fontSize } : null,
    prompt: (() => {
      const t = scene.interactionManager?.tooltipText;
      return t ? { fontFamily: t.style?.fontFamily, fontSize: t.style?.fontSize, color: t.style?.color } : null;
    })(),
    player: { x: Math.round(scene.player.x), y: Math.round(scene.player.y) },
  };
});
console.log(JSON.stringify(info, null, 1));

// Shot 1: stand near first portal -> portal label + name tag
await page.evaluate(() => {
  const scene = window.__DEVER_GAME__.scene.keys.WorldScene;
  const lbl = scene.portalLabels?.[0];
  if (lbl && scene.player) {
    scene.player.setPosition(lbl.x, lbl.y + 70);
    scene.cameras.main.centerOn(lbl.x, lbl.y + 20);
  }
});
await page.waitForTimeout(1200);
await dismissOnboarding();
await page.screenshot({ path: '/tmp/font-portal-label.png' });

// Shot 2: walk into first interaction zone -> E prompt tooltip
await page.evaluate(() => {
  const scene = window.__DEVER_GAME__.scene.keys.WorldScene;
  const z = scene.interactionManager?.zones?.[0];
  if (z && scene.player) {
    const wx = z.tileX * 32 + 16, wy = z.tileY * 32 + 16;
    scene.player.setPosition(wx, wy);
    scene.cameras.main.centerOn(wx, wy - 10);
  }
});
await page.waitForTimeout(1500);
const promptVisible = await page.evaluate(() => {
  const im = window.__DEVER_GAME__.scene.keys.WorldScene.interactionManager;
  return { hudVisible: im?.hudContainer?.visible, text: im?.tooltipText?.text };
});
console.log('PROMPT:', JSON.stringify(promptVisible));
await dismissOnboarding();
await page.screenshot({ path: '/tmp/font-e-prompt.png' });

// Shot 3: zone badges overview (no E active)
await page.evaluate(() => {
  const scene = window.__DEVER_GAME__.scene.keys.WorldScene;
  scene.interactionManager?.hideHUD?.();
  const b = scene.interactionManager?.badges?.[0];
  if (b && scene.player) {
    scene.player.setPosition(b.container.x, b.container.y + 90);
    scene.cameras.main.centerOn(b.container.x, b.container.y);
  }
});
await page.waitForTimeout(1000);
await dismissOnboarding();
await page.screenshot({ path: '/tmp/font-zone-badge.png' });

console.log('ERRORS:', errors.length ? errors.slice(0, 5) : 'none');
await browser.close();
