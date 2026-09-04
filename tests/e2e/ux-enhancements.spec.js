import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - UX Enhancements, Radar HUD & Speed Code Duel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Nhập tên và đăng nhập với tư cách khách
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Tester Alpha');
    await page.locator('#gate-form-guest button[type="submit"]').click();

    // Chờ màn hình đón tiếp ẩn đi và canvas hiển thị
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
  });

  test('01. Minimap / Radar HUD is present, renders canvas and toggles via [M] and button', async ({ page }) => {
    const minimap = page.locator('#minimap-overlay');
    await expect(minimap).toBeVisible();

    const toggleBtn = page.locator('#minimap-toggle-btn');
    await expect(toggleBtn).toBeVisible();

    // Nếu khởi tạo ở trạng thái collapsed (trên mobile), mở rộng ra để kiểm tra canvas
    const isCollapsed = await minimap.evaluate(el => el.classList.contains('collapsed'));
    if (isCollapsed) {
      await toggleBtn.click();
    }

    const canvas = page.locator('#minimap-canvas');
    await expect(canvas).toBeVisible();

    // Click toggle button để thu gọn
    await toggleBtn.click();
    await expect(minimap).toHaveClass(/collapsed/);

    // Click lại để mở rộng
    await toggleBtn.click();
    await expect(minimap).not.toHaveClass(/collapsed/);

    // Bấm phím M để toggle
    await page.keyboard.press('KeyM');
    await expect(minimap).toHaveClass(/collapsed/);

    await page.keyboard.press('KeyM');
    await expect(minimap).not.toHaveClass(/collapsed/);
  });

  test('02. Room Banner displays cinematic arrival on room switch', async ({ page }) => {
    const banner = page.locator('#room-banner');
    await expect(banner).toBeAttached();

    // Chuyển sang phòng Tech Lab bằng dropdown
    const roomSelector = page.locator('#room-selector');
    await roomSelector.selectOption('dever_lab');

    // Chờ banner hiển thị
    await expect(banner).toHaveClass(/visible/, { timeout: 5000 });
    const title = page.locator('#room-banner-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText(/Lab|Tech/);
  });

  test('03. Emote Bar opens via [G] or Header button and triggers reaction', async ({ page }) => {
    const emoteBar = page.locator('#emote-bar');
    await expect(emoteBar).toHaveClass(/hidden/);

    // Mở bằng nút Header hoặc nút Touch Controls nếu trên mobile
    const headerEmoteBtn = page.locator('#header-emote-btn');
    if (await headerEmoteBtn.isVisible()) {
      await headerEmoteBtn.click();
    } else {
      const touchEmote = page.locator('#touch-btn-emote');
      await touchEmote.dispatchEvent('pointerdown');
      await touchEmote.dispatchEvent('pointerup');
    }
    await expect(emoteBar).toHaveClass(/visible/);

    // Đóng bằng phím G
    await page.keyboard.press('KeyG');
    await expect(emoteBar).not.toHaveClass(/visible/);

    // Mở lại bằng phím G
    await page.keyboard.press('KeyG');
    await expect(emoteBar).toHaveClass(/visible/);

    // Chọn biểu cảm Vẫy Chào [1]
    const waveBtn = page.locator('.emote-item-btn[data-emote="wave"]');
    await waveBtn.click();

    // Thanh biểu cảm tự động đóng lại
    await expect(emoteBar).not.toHaveClass(/visible/);
  });

  test('04. Speed Code Duel opens, starts sprint, answers question and scores', async ({ page }) => {
    const duelModal = page.locator('#speed-code-duel-modal');
    await expect(duelModal).toHaveClass(/hidden/);

    // Mở minigame qua nút Header hoặc nút Touch Controls nếu trên mobile
    const duelBtn = page.locator('#header-speed-duel-btn');
    if (await duelBtn.isVisible()) {
      await duelBtn.click();
    } else {
      const touchDuel = page.locator('#touch-btn-speed-duel');
      await touchDuel.dispatchEvent('pointerdown');
      await touchDuel.dispatchEvent('pointerup');
    }
    await expect(duelModal).not.toHaveClass(/hidden/);

    // Màn hình mở đầu (Intro)
    const introPane = page.locator('#duel-pane-intro');
    await expect(introPane).toBeVisible();

    // Bắt đầu trận đấu
    const startBtn = page.locator('#duel-start-btn');
    await startBtn.click();

    // Chuyển sang màn hình thi đấu
    const gameplayPane = page.locator('#duel-pane-gameplay');
    await expect(gameplayPane).toBeVisible();

    // Kiểm tra câu hỏi hiển thị
    const qText = page.locator('#duel-question-text');
    await expect(qText).not.toBeEmpty();

    // Kiểm tra 4 lựa chọn đáp án
    const answers = page.locator('.duel-ans-btn');
    await expect(answers).toHaveCount(4);

    // Bấm phím 1 để trả lời
    await page.keyboard.press('Digit1');

    // Nút phản hồi hoặc toast xuất hiện
    const toast = page.locator('#duel-feedback-toast');
    await expect(toast).not.toHaveClass(/hidden/);

    // Đóng modal bằng phím Escape
    await page.keyboard.press('Escape');
    await expect(duelModal).toHaveClass(/hidden/);
  });

  test('05. Chiptune 8-Bit BGM button toggles state', async ({ page }) => {
    const bgmBtn = page.locator('#header-bgm-btn');
    await expect(bgmBtn).toBeVisible();

    // Bật nhạc nền
    await bgmBtn.click();
    await expect(bgmBtn).toHaveClass(/active/);

    // Tắt nhạc nền
    await bgmBtn.click();
    await expect(bgmBtn).not.toHaveClass(/active/);
  });

  test('06. Interactive [E] in Game Arcade opens arcade games and robot studio', async ({ page }) => {
    // Chuyển sang phòng game_arcade
    await page.locator('#room-selector').selectOption('game_arcade');
    await page.waitForTimeout(1000);

    // Di chuyển tới máy Cyber Snake tại tile (4, 4)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      scene.player.setPosition(4 * 32 + 16, 5 * 32 + 16);
      scene.interactionManager.update(scene.player);
    });
    await page.waitForTimeout(200);

    // Bấm phím E
    await page.keyboard.press('KeyE');
    const modal = page.locator('#interactive-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-arcade-games')).not.toHaveClass(/hidden/);
    await expect(page.locator('#retro-arcade-canvas')).toBeVisible();

    // Đóng modal bằng phím Escape
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);
  });

  test('07. Interactive [E] in Sports Complex opens sports minigames, switches tabs, and handles action triggers without error', async ({ page }) => {
    // Lắng nghe uncaught errors trên page
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    // Chuyển sang phòng sports_complex
    await page.locator('#room-selector').selectOption('sports_complex');
    await page.waitForTimeout(1200);

    // Di chuyển tới Sân bóng đá tại tile (5, 4)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(5 * 32 + 16, 4 * 32 + 16);
      scene.player.body?.reset(5 * 32 + 16, 4 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    await page.waitForTimeout(300);

    // Bấm phím E
    await page.keyboard.press('KeyE');
    const modal = page.locator('#interactive-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-sports')).not.toHaveClass(/hidden/);
    await expect(page.locator('#sports-arcade-canvas')).toBeVisible();

    // Click nút Hành Động Sút bóng / Nhảy
    const actionBtn = page.locator('#sports-action-btn');
    await expect(actionBtn).toBeVisible();
    await actionBtn.click();
    await page.waitForTimeout(100);

    // Thử phím Space để sút bóng
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Chuyển tab sang Basketball
    const basketballTab = page.locator('.sports-nav-tab[data-sport="basketball"]');
    if (await basketballTab.isVisible()) {
      await basketballTab.click();
      await page.waitForTimeout(100);
      await actionBtn.click();
    }

    // Chuyển tab sang Volleyball
    const volleyballTab = page.locator('.sports-nav-tab[data-sport="volleyball"]');
    if (await volleyballTab.isVisible()) {
      await volleyballTab.click();
      await page.waitForTimeout(100);
      await actionBtn.click();
    }

    // Đóng modal bằng phím Escape
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);

    // Đảm bảo không có uncaught exception nào xảy ra
    expect(pageErrors).toHaveLength(0);
  });

  test('08. Logged-in user interacts with Sports and Barista Coffee without authService.syncFullProfile error', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    // Giả lập trạng thái logged in trong AuthService
    await page.evaluate(async () => {
      localStorage.setItem('dever_token', 'mock_jwt_token_test');
      localStorage.setItem('dever_user', JSON.stringify({
        id: 'test_user_logged_in',
        display_name: 'Member Pro',
        role: 'dev'
      }));
      const { authService } = await import('/src/services/AuthService.js');
      authService.token = 'mock_jwt_token_test';
      authService.user = { id: 'test_user_logged_in', display_name: 'Member Pro', role: 'dev' };
    });

    // Chuyển sang canteen_cafe để kiểm tra quầy Barista
    await page.locator('#room-selector').selectOption('canteen_cafe');
    await page.waitForTimeout(1200);

    // Di chuyển tới Quầy Barista tại tile (19, 3) sát quầy (tile 19, 2)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(19 * 32 + 16, 3 * 32 + 16);
      scene.player.body?.reset(19 * 32 + 16, 3 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    await page.waitForTimeout(300);

    // Bấm phím E mở Barista
    await page.keyboard.press('KeyE');
    const modal = page.locator('#interactive-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-sports')).not.toHaveClass(/hidden/);

    // Click nút Hành Động Pha Chế
    const actionBtn = page.locator('#sports-action-btn');
    await expect(actionBtn).toBeVisible();
    await actionBtn.click();
    await page.waitForTimeout(100);

    // Đóng modal
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);

    // Chuyển sang sports_complex kiểm tra sân bóng đá khi logged in
    await page.locator('#room-selector').selectOption('sports_complex');
    await page.waitForTimeout(1200);

    // Di chuyển vào sân bóng đá tại tile (5, 4)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(5 * 32 + 16, 4 * 32 + 16);
      scene.player.body?.reset(5 * 32 + 16, 4 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    await page.waitForTimeout(300);

    // Bấm phím E mở Sút bóng
    await page.keyboard.press('KeyE');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-sports')).not.toHaveClass(/hidden/);

    // Đóng modal
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);

    // Xác nhận không có bất kỳ ngoại lệ nào
    expect(pageErrors).toHaveLength(0);
  });

});


