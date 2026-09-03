import { test, expect } from '@playwright/test';

test.describe('DEVER TOWN - Session Persistence & Zero-Deadlock Reload Suite', () => {

  test('01. Reloading page retains deviceId and enters world directly', async ({ page }) => {
    await page.goto('/');

    // 1. Vào game với tư cách khách
    const nameInput = page.locator('#gate-guest-name');
    await nameInput.fill('ReloadTester');

    const enterBtn = page.locator('#gate-form-guest button[type="submit"]');
    await enterBtn.click();

    // 2. Chờ vào game thành công
    await expect(page.locator('#welcome-gate')).toHaveClass(/hidden/);
    const canvas = page.locator('#game-container canvas');
    await expect(canvas).toBeVisible();

    // 3. Kiểm tra deviceId đã được sinh ra trong localStorage
    const deviceId = await page.evaluate(() => localStorage.getItem('dever_device_id'));
    expect(deviceId).toBeTruthy();
    expect(deviceId).toContain('dev_');

    // 4. Reload trang (F5)
    await page.reload();

    // 5. Đảm bảo KHÔNG có modal Chờ xác nhận thiết bị
    const waitingOverlay = page.locator('#device-waiting-overlay');
    await expect(waitingOverlay).toBeHidden();

    // 6. Đảm bảo deviceId vẫn được giữ nguyên
    const reloadedDeviceId = await page.evaluate(() => localStorage.getItem('dever_device_id'));
    expect(reloadedDeviceId).toBe(deviceId);
  });

});
