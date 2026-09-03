import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('audit_gameplay');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAutonomousGameplayAudit() {
  console.log('🎮 [Autonomous Game Agent] Bắt đầu phiên chơi game thực tế...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      errors.push(text);
      console.error('❌ [Browser Console Error]:', text);
    } else if (type === 'warn') {
      warnings.push(text);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('🚨 [Page Crash/Error]:', err.message);
  });

  const report = {
    timestamp: new Date().toISOString(),
    phases: [],
    flawsFound: [],
    errors,
    warnings
  };

  try {
    // =========================================================================
    // 1. WELCOME GATE PHẦN MỞ ĐẦU
    // =========================================================================
    console.log('🚪 [Phase 1] Tải Welcome Gate...');
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_welcome_gate.png') });

    const nicknameInput = page.locator('#gate-guest-name');
    const enterBtn = page.locator('#gate-form-guest button[type="submit"]');

    await nicknameInput.fill('DeverTester');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_welcome_gate_filled.png') });

    await enterBtn.click();
    console.log('🚀 [Phase 1] Đã click Vào Thị Trấn, chờ Phaser Scene nạp...');

    // =========================================================================
    // 2. PHASER SCENE & DISMISS ONBOARDING GUIDE
    // =========================================================================
    await page.waitForSelector('#game-container canvas', { timeout: 15000 });
    await page.waitForTimeout(2000); // Chờ worldScene create và onboarding guide
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_main_hall_spawn.png') });

    // Đóng Onboarding Guide nếu có
    const onboardingCloseBtn = page.locator('#onboarding-close-btn');
    if (await onboardingCloseBtn.isVisible()) {
      console.log('📖 [Phase 2] Phát hiện Onboarding Guide, click đóng để bắt đầu chơi...');
      await onboardingCloseBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04_main_hall_onboarding_dismissed.png') });
    }

    // Thu thập trạng thái game
    const gameState = await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (!scene) return { loaded: false };
      return {
        loaded: true,
        currentRoom: scene.currentRoomId,
        playerPos: scene.player ? { x: Math.round(scene.player.x), y: Math.round(scene.player.y) } : null,
        particlesActive: scene.ambientManager ? !!scene.ambientManager.currentEmitter : false,
        achievementsCount: scene.achievementManager ? scene.achievementManager.unlockedIds.size : 0,
        hasJuice: !!scene.juiceManager,
        hasTicker: !!scene.campusTicker
      };
    });

    console.log('📊 [Game State]', gameState);
    report.phases.push({ phase: 'Main Hall Spawn', state: gameState });

    // =========================================================================
    // 3. DI CHUYỂN & VẬT LÝ BƯỚC CHÂN
    // =========================================================================
    console.log('🚶 [Phase 3] Thử nghiệm di chuyển nhân vật...');
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(800);
    await page.keyboard.up('ArrowDown');

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(600);
    await page.keyboard.up('ArrowRight');

    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_main_hall_after_move.png') });

    // =========================================================================
    // 4. TƯƠNG TÁC CÓC VÀNG TÂM LINH [E]
    // =========================================================================
    console.log('🐸 [Phase 4] Tương tác với Cóc Vàng Tâm Linh (Tile 11, 6)...');
    await page.evaluate(() => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene && scene.player) {
        scene.player.setPosition(368, 240); // Đặt nhân vật ngay trước tượng Cóc Vàng
      }
    });
    await page.waitForTimeout(600);

    // Bấm phím E để tương tác
    await page.keyboard.press('e');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_modal_golden_frog.png') });

    const modalVisible = await page.locator('#interactive-modal').isVisible();
    const modalTitle = await page.locator('#modal-title').textContent().catch(() => '');
    console.log(`🐸 [Modal Status] Hiển thị: ${modalVisible}, Tiêu đề: "${modalTitle}"`);

    if (modalVisible) {
      // Đóng modal bằng phím Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      report.flawsFound.push({
        phase: 'Interaction',
        severity: 'Major',
        desc: 'Bấm E tại tượng Cóc Vàng không mở modal tương tác'
      });
    }

    // =========================================================================
    // 5. TÚI ĐỒ & TRANG BỊ VẬT PHẨM [I]
    // =========================================================================
    console.log('🎒 [Phase 5] Mở túi đồ và trang bị vật phẩm...');
    await page.keyboard.press('i');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_modal_inventory.png') });

    const inventoryItem = page.locator('.inventory-slot-filled, .inventory-item-card').first();
    if (await inventoryItem.isVisible()) {
      await inventoryItem.click();
      await page.waitForTimeout(500);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // =========================================================================
    // 6. THANH BIỂU CẢM & NHẢY MÚA [G]
    // =========================================================================
    console.log('✨ [Phase 6] Mở thanh biểu cảm và nhảy múa...');
    await page.keyboard.press('g');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_emote_bar_open.png') });

    const danceBtn = page.locator('.emote-item-btn[data-emote="dance"], button:has-text("Nhảy"), button:has-text("Dance")').first();
    if (await danceBtn.isVisible()) {
      await danceBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '09_dancing_animation.png') });
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // =========================================================================
    // 7. ĐẤU TRÍ LẬP TRÌNH SIÊU TỐC [Z Hotkey]
    // =========================================================================
    console.log('⚡ [Phase 7] Thử nghiệm mở Speed Code Duel qua phím tắt [Z]...');
    await page.keyboard.press('z');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '10_speed_duel_modal.png') });

    const duelModalVisible = await page.locator('#speed-code-duel-modal').isVisible();
    console.log(`⚡ [Speed Duel] Mở thành công bằng phím Z: ${duelModalVisible}`);

    if (duelModalVisible) {
      const startDuelBtn = page.locator('#duel-btn-start, button:has-text("Bắt Đầu Trận Đấu"), .btn-start-match').first();
      if (await startDuelBtn.isVisible()) {
        await startDuelBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(OUTPUT_DIR, '11_speed_duel_question.png') });

        const answerBtn = page.locator('.duel-option-btn').first();
        if (await answerBtn.isVisible()) {
          await answerBtn.click();
          await page.waitForTimeout(800);
          await page.screenshot({ path: path.join(OUTPUT_DIR, '12_speed_duel_answered.png') });
        }
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } else {
      report.flawsFound.push({
        phase: 'Hotkeys',
        severity: 'Major',
        desc: 'Bấm phím Z không mở được Speed Code Duel'
      });
    }

    // =========================================================================
    // 8. ĐI QUA TỪNG PHÒNG ĐỂ KIỂM TRA HIỆU ỨNG VÀ TRẢI NGHIỆM
    // =========================================================================
    const roomsToTest = [
      { id: 'dever_lab', name: 'Tòa Gamma - Tech & AI Lab' },
      { id: 'canteen_cafe', name: 'Căn Tin & The High Deli' },
      { id: 'sports_complex', name: 'Khu Phức Hợp Thể Thao' },
      { id: 'game_arcade', name: 'Arcade & Robot Studio' },
      { id: 'library_lounge', name: 'Thư Viện Tri Thức' },
      { id: 'memory_room', name: 'Phòng Truyền Thống' },
      { id: 'web_room', name: 'Không Gian Web & IT Helpdesk' },
      { id: 'media_hub', name: 'Media Hub & Sự Kiện' }
    ];

    for (const room of roomsToTest) {
      console.log(`🚪 [Phase 8] Chuyển phòng sang: ${room.name} (${room.id})...`);
      
      // Chuyển phòng qua dropdown thực tế
      await page.locator('#room-selector').selectOption(room.id);

      await page.waitForTimeout(1800); // Chờ room transition và banner
      await page.screenshot({ path: path.join(OUTPUT_DIR, `13_room_${room.id}.png`) });

      const roomBanner = await page.locator('#room-banner-title').textContent().catch(() => '');
      const roomParticles = await page.evaluate(() => {
        const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
        return scene?.ambientManager ? !!scene.ambientManager.currentEmitter : false;
      });
      console.log(`   ➔ Banner phòng: "${roomBanner.trim()}"`);
      console.log(`   ➔ Hạt môi trường hoạt động: ${roomParticles}`);
    }

    // =========================================================================
    // 9. QUAN SÁT CÁC LỖI GIAO DIỆN (UI GLITCHES & OVERLAPS)
    // =========================================================================
    console.log('🔍 [Phase 9] Rà soát các vấn đề layout, font chữ, alignment...');
    
    // Kiểm tra Radar HUD có đè lên footer không
    const overlapAudit = await page.evaluate(() => {
      const radar = document.querySelector('.minimap-container');
      const footer = document.querySelector('#main-footer');
      if (!radar || !footer) return { overlap: false };

      const rRect = radar.getBoundingClientRect();
      const fRect = footer.getBoundingClientRect();

      const isOverlapping = !(
        rRect.right < fRect.left ||
        rRect.left > fRect.right ||
        rRect.bottom < fRect.top ||
        rRect.top > fRect.bottom
      );

      return {
        overlap: isOverlapping,
        radarBottom: rRect.bottom,
        footerTop: fRect.top
      };
    });

    console.log('📐 [Radar HUD vs Footer Overlap]:', overlapAudit);
    if (overlapAudit.overlap) {
      report.flawsFound.push({
        phase: 'HUD Layout',
        severity: 'Major',
        desc: `Radar HUD đang bị đè trực tiếp lên thanh Footer (bottom: ${overlapAudit.radarBottom}px >= footerTop: ${overlapAudit.footerTop}px), che mất chữ bản quyền và hướng dẫn điều khiển!`
      });
    }

    // Kiểm tra Emote Bar căn giữa theo Game Container hay toàn Window
    const emoteBarPosition = await page.evaluate(() => {
      const emote = document.querySelector('.emote-bar-container');
      const gameContainer = document.querySelector('#game-container');
      if (!emote || !gameContainer) return null;
      const eRect = emote.getBoundingClientRect();
      const gRect = gameContainer.getBoundingClientRect();
      return {
        emoteCenterX: eRect.left + eRect.width / 2,
        gameCenterX: gRect.left + gRect.width / 2,
        diff: Math.abs((eRect.left + eRect.width / 2) - (gRect.left + gRect.width / 2))
      };
    });
    console.log('🎯 [Emote Bar Alignment]:', emoteBarPosition);

    console.log('✅ [Autonomous Game Agent] Phiên chơi game hoàn tất thành công!');
  } catch (err) {
    console.error('❌ [Play Session Error]:', err);
    report.flawsFound.push({
      phase: 'Runtime Exception',
      severity: 'Critical',
      desc: err.message
    });
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUTPUT_DIR, 'gameplay_audit_report.json'), JSON.stringify(report, null, 2));
    console.log(`📁 Báo cáo và ảnh chụp đã được lưu vào: ${OUTPUT_DIR}`);
  }
}

runAutonomousGameplayAudit();
