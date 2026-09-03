import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ROOMS = [
  'main_hall',
  'dever_lab',
  'game_arcade',
  'library_lounge',
  'memory_room',
  'web_room',
  'media_hub',
  'sports_complex',
  'canteen_cafe'
];

async function runVisionAudit() {
  const auditDir = path.resolve('C:/Users/ADMIN/.gemini/antigravity-ide/brain/1fba7ee8-938b-4eb4-a46c-938f7d55ab9f/vision_audit');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('--- STARTING VISION AUDIT ACROSS ALL 9 MAPS ---');
  await page.goto('http://localhost:3030/');

  const nameInput = page.locator('#gate-guest-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('Vision Auditor');
    await page.locator('#gate-form-guest button[type="submit"]').click();
  }

  await page.waitForSelector('#welcome-gate', { state: 'hidden', timeout: 15000 });
  await page.waitForSelector('#game-loading-screen', { state: 'hidden', timeout: 15000 });
  await page.waitForTimeout(1500);

  const closeGuide = page.locator('#onboarding-close-btn');
  if (await closeGuide.isVisible()) {
    await closeGuide.click();
    await page.waitForTimeout(500);
  }

  const findings = [];

  for (const roomId of ROOMS) {
    console.log(`Auditing room: ${roomId}...`);
    // Chuyển phòng qua dropdown hoặc qua evaluate trực tiếp
    await page.evaluate((rId) => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene) {
        scene.loadRoom(rId, 400, 350, false);
      }
    }, roomId);
    await page.waitForTimeout(800);

    // 1. Chụp tổng thể phòng
    const roomOverviewPath = path.join(auditDir, `${roomId}_01_overview.png`);
    await page.screenshot({ path: roomOverviewPath });

    // 2. Di chuyển các hướng và chụp
    // Phím W (Lên)
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(auditDir, `${roomId}_02_move_up.png`) });
    await page.keyboard.up('KeyW');
    await page.waitForTimeout(100);

    // Phím D (Phải)
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(auditDir, `${roomId}_03_move_right.png`) });
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(100);

    // Phím S (Xuống)
    await page.keyboard.down('KeyS');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(auditDir, `${roomId}_04_move_down.png`) });
    await page.keyboard.up('KeyS');
    await page.waitForTimeout(100);

    // Phím A (Trái)
    await page.keyboard.down('KeyA');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(auditDir, `${roomId}_05_move_left.png`) });
    await page.keyboard.up('KeyA');
    await page.waitForTimeout(100);

    // 3. Kiểm tra text overflow / bounding box trên DOM
    const overflowReport = await page.evaluate((rId) => {
      const issues = [];
      // Kiểm tra các phần tử text chính
      const elementsToCheck = document.querySelectorAll('#main-header, #chat-wrapper, .room-banner-container, #interactive-modal, #hud-overlay');
      elementsToCheck.forEach(el => {
        if (!el.classList.contains('hidden') && el.offsetParent !== null) {
          if (el.scrollWidth > el.clientWidth + 2) {
            issues.push({ id: el.id || el.className, issue: 'Horizontal overflow', scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
          }
        }
      });
      return issues;
    }, roomId);

    if (overflowReport.length > 0) {
      findings.push({ roomId, overflows: overflowReport });
    }
  }

  // 4. Audit các Modal Tương Tác chính
  console.log('Auditing key Interactive Modals for text overflow...');
  const modalTypes = [
    { type: 'whiteboard_slides', name: 'Slide Trình Chiếu', id: 'zone_main_slides' },
    { type: 'meeting_stage', name: 'Họp Video Livestream', id: 'zone_main_meeting' },
    { type: 'code_editor', name: 'Code Sandbox Editor', id: 'zone_lab_code_a' },
    { type: 'coffee_lofi', name: 'Lofi Music & Pomodoro', id: 'zone_main_coffee' },
    { type: 'gallery_memory', name: 'Phòng Truyền Thống Kỷ Niệm', id: 'zone_gallery' },
    { type: 'fptu_student_portal', name: 'Cổng Học Vụ FPTU', id: 'zone_portal' },
    { type: 'canteen_menus', name: 'Thực Đơn Căn Tin FUDA', id: 'zone_canteen' },
    { type: 'campus_map', name: 'Bản Đồ Campus FUDA', id: 'zone_campus' },
    { type: 'dever_charter', name: 'Quy Chế Hoạt Động CLB', id: 'zone_charter' },
    { type: 'arcade_games', name: 'Arcade Retro Games', id: 'zone_arcade_snake', defaultGame: 'snake' },
    { type: 'robot_showcase', name: 'Robot AI Showcase', id: 'zone_robot' }
  ];

  for (const modal of modalTypes) {
    console.log(`Auditing modal: ${modal.type}...`);
    await page.evaluate((m) => {
      const scene = window.__DEVER_GAME__?.scene?.getScene('WorldScene');
      if (scene && scene.interactiveModal) {
        scene.interactiveModal.show({
          id: m.id,
          type: m.type,
          name: m.name,
          defaultGame: m.defaultGame
        });
      }
    }, modal);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(auditDir, `modal_${modal.type}.png`) });

    // Kiểm tra overflow trong modal card
    const modalCheck = await page.evaluate((mType) => {
      const card = document.querySelector('#interactive-modal .modal-card');
      if (!card) return null;
      return {
        type: mType,
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth,
        scrollHeight: card.scrollHeight,
        clientHeight: card.clientHeight,
        hasHorizontalOverflow: card.scrollWidth > card.clientWidth + 2
      };
    }, modal.type);

    if (modalCheck && modalCheck.hasHorizontalOverflow) {
      findings.push({ modalType: modal.type, issue: 'Modal card horizontal overflow', details: modalCheck });
    }

    await page.locator('#interactive-modal-close').click();
    await page.waitForTimeout(300);
  }

  // Ghi báo cáo JSON
  fs.writeFileSync(path.join(auditDir, 'audit_report.json'), JSON.stringify(findings, null, 2));
  console.log(`Vision audit complete! Results saved in ${auditDir}`);
  await browser.close();
}

runVisionAudit().catch(console.error);
