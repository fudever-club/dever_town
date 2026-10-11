import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - UX Enhancements, Radar HUD & Speed Code Duel', () => {

  test.beforeEach(async ({ page }) => {
    // Tắt onboarding guide (overlay toàn màn hình, z-index rất cao) để nó không che
    // các nút tương tác trong test khi game khởi tạo chậm.
    await page.addInitScript(() => {
      localStorage.setItem('dever_onboarding_seen', 'true');
      // Tour coach-marks mới (2026-10-09) dùng key riêng — tắt luôn để không che nút test
      localStorage.setItem('dever_onboarded_v1', '1');
      localStorage.setItem('dever_chat_hint_seen', '1');
    });
    await page.goto('/');

    // Nhập tên và đăng nhập với tư cách khách
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Tester Alpha');
    await page.locator('#gate-form-guest button[type="submit"]').click();

    // Chờ màn hình đón tiếp ẩn đi và canvas hiển thị
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);
    await expect(page.locator('#game-container canvas')).toBeVisible({ timeout: 10000 });
    // Chờ WorldScene.create() chạy xong (đăng ký xong listener đổi phòng của #room-selector).
    // Trên mobile game khởi tạo chậm hơn test: nếu selectOption bắn sự kiện change trước khi
    // listener được đăng ký, yêu cầu đổi phòng bị rơi mất và test rớt oan.
    await expect.poll(async () => page.evaluate(() => !!window.__WORLD_SCENE__), { timeout: 15000 }).toBe(true);
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

  test('03. Emote Bar opens via [G] or Header button and triggers reaction', async ({ page }, testInfo) => {
    const emoteBar = page.locator('#emote-bar');
    await expect(emoteBar).toHaveClass(/hidden/);

    // Mở bằng nút Header (đã gom vào overflow menu "⋯" từ 2026-10-09) hoặc nút Touch Controls nếu trên mobile
    const isMobile = testInfo.project.name.toLowerCase().includes('mobile');
    if (isMobile) {
      const touchEmote = page.locator('#touch-btn-emote');
      await touchEmote.dispatchEvent('pointerdown');
      await touchEmote.dispatchEvent('pointerup');
    } else {
      await page.locator('#header-overflow-btn').click();
      await page.locator('#header-emote-btn').click();
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

  test('04. Speed Code Duel opens, starts sprint, answers question and scores', async ({ page }, testInfo) => {
    const duelModal = page.locator('#speed-code-duel-modal');
    await expect(duelModal).toHaveClass(/hidden/);

    // Mở minigame qua nút Header (đã gom vào overflow menu "⋯" từ 2026-10-09) hoặc nút Touch Controls nếu trên mobile
    const isMobile = testInfo.project.name.toLowerCase().includes('mobile');
    if (isMobile) {
      const touchDuel = page.locator('#touch-btn-speed-duel');
      await touchDuel.dispatchEvent('pointerdown');
      await touchDuel.dispatchEvent('pointerup');
    } else {
      await page.locator('#header-overflow-btn').click();
      await page.locator('#header-speed-duel-btn').click();
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
    // Nút đã gom vào overflow menu "⋯" từ 2026-10-09 — mở menu trước
    await page.locator('#header-overflow-btn').click();
    await expect(bgmBtn).toBeVisible();

    // Bật nhạc nền (chọn mục trong menu sẽ tự đóng menu)
    await bgmBtn.click();
    await expect(bgmBtn).toHaveClass(/active/);

    // Tắt nhạc nền (mở lại menu trước)
    await page.locator('#header-overflow-btn').click();
    await bgmBtn.click();
    await expect(bgmBtn).not.toHaveClass(/active/);
  });

  test('06. Interactive [E] in Game Arcade opens arcade games and robot studio', async ({ page }) => {
    // Chuyển sang phòng game_arcade
    await page.locator('#room-selector').selectOption('game_arcade');
    // Đợi WorldScene thực sự chuyển sang game_arcade và đăng ký xong interaction
    // zones (thay waitForTimeout cố định): nối tiếp pattern __WORLD_SCENE__ ở
    // beforeEach — trên mobile chậm, selectOption có thể resolve trước khi change
    // handler chạy xong, khiến E bấm nhầm phòng và modal không mở.
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene && scene.currentRoomId === 'game_arcade'
        && (scene.interactionManager?.zones?.length ?? 0) > 0;
    }), { timeout: 15000 }).toBe(true);

    // Di chuyển tới máy Cyber Snake tại tile (4, 4)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(4 * 32 + 16, 5 * 32 + 16);
      scene.player.body?.reset(4 * 32 + 16, 5 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    // Đợi InteractionManager nhận diện zone trước khi bấm E (thay sleep 200ms).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene?.interactionManager?.currentActiveZone;
    }), { timeout: 5000 }).toBe(true);

    // Bấm phím E
    await page.keyboard.press('KeyE');
    const modal = page.locator('#interactive-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-arcade-games')).not.toHaveClass(/hidden/);
    // Vào máy nào chơi game đó luôn (2026-10-09 redesign) — gameplay hiện thẳng
    await expect(page.locator('#arcade-play-screen')).not.toHaveClass(/hidden/);
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
    // Đợi WorldScene thực sự chuyển sang sports_complex và đăng ký xong interaction
    // zones (thay waitForTimeout cố định): nối tiếp pattern __WORLD_SCENE__ ở
    // beforeEach — trên mobile chậm, selectOption có thể resolve trước khi change
    // handler chạy xong, khiến E bấm nhầm phòng và modal không mở.
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene && scene.currentRoomId === 'sports_complex'
        && (scene.interactionManager?.zones?.length ?? 0) > 0;
    }), { timeout: 15000 }).toBe(true);

    // Di chuyển tới Sân bóng đá tại tile (5, 4)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(5 * 32 + 16, 4 * 32 + 16);
      scene.player.body?.reset(5 * 32 + 16, 4 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    // Đợi InteractionManager nhận diện zone trước khi bấm E (thay sleep 300ms).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene?.interactionManager?.currentActiveZone;
    }), { timeout: 5000 }).toBe(true);

    // Bấm phím E
    await page.keyboard.press('KeyE');
    const modal = page.locator('#interactive-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-sports')).not.toHaveClass(/hidden/);
    // Vào sân nào chơi môn đó luôn (2026-10-09 redesign) — gameplay hiện thẳng
    await expect(page.locator('#sports-play-screen')).not.toHaveClass(/hidden/);
    await expect(page.locator('#sports-arcade-canvas')).toBeVisible();

    // Kích hoạt Hành Động Sút bóng / Nhảy: trên desktop bấm nút, trên mobile
    // (pointer: coarse) nút bị ẩn vì game đã chơi bằng cảm ứng -> gọi trực tiếp
    // cùng code path với nút (SportsArcade.onActionTrigger). Không dùng Space vì
    // handleKeyDown có activation grace 300ms sẽ nuốt phím khi test bấm quá nhanh.
    const actionBtn = page.locator('#sports-action-btn');
    const triggerSportsAction = async () => {
      if (await actionBtn.isVisible()) await actionBtn.click();
      else await page.evaluate(() => {
        window.__DEVER_GAME__?.scene?.getScene('WorldScene')?.interactiveModal?.sportsArcade?.onActionTrigger();
      });
    };
    await triggerSportsAction();
    // Dòng chảy hai lần bấm (two-tap) chuẩn của PenaltyShootoutEngine.onActionTrigger:
    // tap 1: aiming -> power_charging (nạp lực); tap 2: power_charging -> runup/flight
    // (khóa lực và sút). Test bấm lần 1 rồi đợi nạp lực trước khi bấm lần 2.
    const footballState = () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return scene?.interactiveModal?.sportsArcade?.football?.state;
    });
    await expect.poll(footballState, { timeout: 5000 }).toBe('power_charging');
    await triggerSportsAction();

    // Đợi cú sút hoàn tất: runup/flight -> trạng thái kết thúc (thay sleep 200ms).
    await expect.poll(footballState, { timeout: 10000 })
      .toMatch(/^(celebrating|saved|hit_wall|missed)$/);

    // Thử phím Space ở trạng thái kết thúc -> đổi vai thủ môn (resetGoalkeeper).
    await page.keyboard.press('Space');
    await expect.poll(footballState, { timeout: 5000 }).toBe('gk_wait');

    // Đổi game sang Basketball: back về select screen rồi chọn card
    await page.locator('#sports-back-btn').click();
    await expect(page.locator('#sports-select-screen')).not.toHaveClass(/hidden/);
    await page.locator('.game-card[data-sport="basketball"]').click();
    // Đợi game switch thực sự landing
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return scene?.interactiveModal?.sportsArcade?.currentGame;
    }), { timeout: 5000 }).toBe('basketball');
    await triggerSportsAction();

    // Đổi game sang Volleyball: back về select screen rồi chọn card
    await page.locator('#sports-back-btn').click();
    await expect(page.locator('#sports-select-screen')).not.toHaveClass(/hidden/);
    await page.locator('.game-card[data-sport="volleyball"]').click();
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return scene?.interactiveModal?.sportsArcade?.currentGame;
    }), { timeout: 5000 }).toBe('volleyball');
    await triggerSportsAction();

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
    // Đợi WorldScene thực sự chuyển sang canteen_cafe và đăng ký xong interaction
    // zones — cùng pattern __WORLD_SCENE__ đã dùng ở test 06/07 (thay sleep 1200ms).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene && scene.currentRoomId === 'canteen_cafe'
        && (scene.interactionManager?.zones?.length ?? 0) > 0;
    }), { timeout: 15000 }).toBe(true);

    // Di chuyển tới Quầy Barista tại tile (19, 3) sát quầy (tile 19, 2)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(19 * 32 + 16, 3 * 32 + 16);
      scene.player.body?.reset(19 * 32 + 16, 3 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    // Đợi InteractionManager nhận diện zone trước khi bấm E (thay sleep 300ms).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene?.interactionManager?.currentActiveZone;
    }), { timeout: 5000 }).toBe(true);

    // Bấm phím E mở Barista
    await page.keyboard.press('KeyE');
    const modal = page.locator('#interactive-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#pane-sports')).not.toHaveClass(/hidden/);

    // Kích hoạt Hành Động Pha Chế: desktop bấm nút, mobile (nút ẩn) gọi trực tiếp
    // cùng code path với nút (xem chú thích ở test 07 về activation grace).
    const actionBtn = page.locator('#sports-action-btn');
    if (await actionBtn.isVisible()) await actionBtn.click();
    else await page.evaluate(() => {
      window.__DEVER_GAME__?.scene?.getScene('WorldScene')?.interactiveModal?.sportsArcade?.onActionTrigger();
    });
    // Đợi barista engine nhận order: station order -> tamping/layering (thay sleep 100ms).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return scene?.interactiveModal?.sportsArcade?.baristaEngine?.station;
    }), { timeout: 5000 }).toMatch(/^(tamping|layering)$/);

    // Đóng modal
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/hidden/);

    // Chuyển sang sports_complex kiểm tra sân bóng đá khi logged in
    await page.locator('#room-selector').selectOption('sports_complex');
    // Đợi WorldScene thực sự chuyển sang sports_complex và đăng ký xong interaction
    // zones — cùng pattern __WORLD_SCENE__ đã dùng ở test 06/07 (thay sleep 1200ms).
    // Timeout 30s: sports_complex là map nặng, khi chạy parallel nhiều worker có
    // thể load asset chậm (flake đã gặp 2026-10-09).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene && scene.currentRoomId === 'sports_complex'
        && (scene.interactionManager?.zones?.length ?? 0) > 0;
    }), { timeout: 30000 }).toBe(true);

    // Di chuyển vào sân bóng đá tại tile (5, 4)
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return;
      if (scene.interactionManager) scene.interactionManager.lastCheckTime = 0;
      scene.player.setPosition(5 * 32 + 16, 4 * 32 + 16);
      scene.player.body?.reset(5 * 32 + 16, 4 * 32 + 16);
      scene.interactionManager?.update(scene.player);
    });
    // Đợi InteractionManager nhận diện zone trước khi bấm E (thay sleep 300ms).
    await expect.poll(async () => page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      return !!scene?.interactionManager?.currentActiveZone;
    }), { timeout: 5000 }).toBe(true);

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


