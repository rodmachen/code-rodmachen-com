import { test, expect } from '@playwright/test';

test('homepage loads with correct title and window', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/code\.rodmachen\.com/i);

  const mainWindow = page.locator('#main-window');
  await expect(mainWindow).toBeVisible();
});
