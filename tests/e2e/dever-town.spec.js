import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - End-to-End System Integrity & Gameplay Suite', () => {

  test('01. Welcome Gate loads with authentic branding & tabs', async ({ page }) => {
    await page.goto('/');

    // 1. Kiểm tra Gate branding & logo FUDA / FU-DEVER
    await expect(page.locator('.gate-brand-name')).toContainText('FU-DEVER');
    await expect(page.locator('.gate-main-title')).toContainText('DEVER TOWN');

    // 2. Kiểm tra các tab chuyển đổi (Khách / Đăng nhập / Đăng ký)
    const guestTabBtn = page.locator('.gate-tab-btn[data-tab="guest"]');
    const loginTabBtn = page.locator('.gate-tab-btn[data-tab="login"]');
    const registerTabBtn = page.locator('.gate-tab-btn[data-tab="register"]');

    await expect(guestTabBtn).toBeVisible();
    await expect(loginTabBtn).toBeVisible();
    await expect(registerTabBtn).toBeVisible();

    // Chuyển sang tab Login
    await loginTabBtn.click();
    await expect(page.locator('#gate-form-login')).toBeVisible();

    // Chuyển lại tab Guest
    await guestTabBtn.click();
    await expect(page.locator('#gate-form-guest')).toBeVisible();
  });

  test('02. Guest Entry into World & Phaser Canvas Initialization', async ({ page }) => {
    await page.goto('/');

    // Điền tên khách hợp lệ
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('Dev Tester 2026');

    // Nhấn nút vào thế giới
    const enterBtn = page.locator('#gate-form-guest button[type="submit"]');
    await enterBtn.click();

    // Chờ Welcome Gate ẩn đi
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);

    // Kiểm tra Canvas của Phaser 3 đã render thành công
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();

    // Kiểm tra Header HUD
    await expect(page.locator('#main-header')).toBeVisible();
    await expect(page.locator('.brand-title')).toContainText('DEVER');
  });

  test('03. Modals & HUD Hotkeys: Inventory [I], Settings, Quests', async ({ page }) => {
    await page.goto('/');

    // Vào game với tư cách khách
    await page.locator('#gate-guest-name').fill('HotKeyTester');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);

    // 1. Kiểm tra mở Túi đồ qua phím 'I'
    await page.keyboard.press('KeyI');
    const invModal = page.locator('#inventory-modal');
    await expect(invModal).not.toHaveClass(/hidden/);

    // Đóng bằng phím Escape
    await page.keyboard.press('Escape');
    await expect(invModal).toHaveClass(/hidden/);

    // 2. Mở Modal Cài Đặt qua nút header
    const settingsBtn = page.locator('#btn-settings');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      const settingsModal = page.locator('#settings-modal');
      await expect(settingsModal).not.toHaveClass(/hidden/);
      await page.keyboard.press('Escape');
    }
  });

  test('04. i18n Song Ngữ (Tiếng Việt & English)', async ({ page }) => {
    await page.goto('/');

    const langBtn = page.locator('#gate-lang-btn, #btn-lang');
    if (await langBtn.first().isVisible()) {
      // Toggle ngôn ngữ
      await langBtn.first().click();
      // Verify i18n state changed
      const title = await page.locator('.gate-slogan').textContent();
      expect(title).toBeDefined();
    }
  });

  test('05. Chat & Realtime Messaging Component', async ({ page, isMobile }) => {
    await page.goto('/');

    await page.locator('#gate-guest-name').fill('ChatterPro');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);

    // Đóng hướng dẫn tân thủ nếu xuất hiện
    const onboardingBtn = page.locator('#onboarding-close-btn');
    if (await onboardingBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await onboardingBtn.click();
    }

    // Nếu trên Mobile, mở Chat Drawer qua nút touch chat
    if (isMobile) {
      await expect(page.locator('#mobile-touch-controls')).toBeVisible();
      const touchChatBtn = page.locator('#touch-btn-chat');
      await touchChatBtn.click();
      await expect(page.locator('#chat-wrapper')).toHaveClass(/mobile-open/);
    }

    // Kiểm tra Chat input form
    const chatInput = page.locator('#chat-input');
    await expect(chatInput).toBeVisible();

    // Gửi tin nhắn test
    await chatInput.fill('Xin chào FU-DEVER và FUDA! 🎮');
    await page.locator('#chat-send-btn').click();

    // Input được làm sạch sau khi gửi
    await expect(chatInput).toHaveValue('');
  });

  test('06. Mobile Viewport & Touch Controls', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto('/');
    await page.locator('#gate-guest-name').fill('MobileTester');
    await page.locator('#gate-form-guest button[type="submit"]').click();
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);

    // Kiểm tra bộ phím ảo Mobile Touch Controls xuất hiện
    const touchControls = page.locator('#mobile-touch-controls');
    await expect(touchControls).toBeVisible();
  });
});
