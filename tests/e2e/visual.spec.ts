import { test, expect } from '@playwright/test';

// Visual regression tests — run `npx playwright test visual --update-snapshots`
// to regenerate baselines after intentional visual changes.

test.describe('visual regression', () => {
  test('homepage default state', async ({ page }) => {
    await page.goto('/');
    // Wait for fonts and layout to settle
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-default.png', {
      fullPage: false,
      // Mask the clock to avoid false diffs
      mask: [page.locator('#menu-clock')],
    });
  });

  test('window maximized state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#btn-zoom').click();
    await expect(page.locator('#main-window')).toHaveScreenshot('window-maximized.png');
  });

  test('File dropdown open state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-menu="File"]').click();
    await expect(page.locator('.classic-menu-bar')).toHaveScreenshot('menu-file-open.png');
  });

  test('About-this-site modal open state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-menu="Apple"]').click();
    await page.locator('[data-dropdown="Apple"] [data-modal="modal-about-site"]').click();
    await expect(page).toHaveScreenshot('modal-about-site-open.png', {
      fullPage: false,
      mask: [page.locator('#menu-clock')],
    });
  });
});
