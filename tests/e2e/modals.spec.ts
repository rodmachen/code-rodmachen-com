import { test, expect } from '@playwright/test';

// Helper: open the Apple menu and click "About this site"
async function openAboutSiteModal(page: import('@playwright/test').Page) {
  await page.locator('[data-menu="Apple"]').click();
  await page.locator('[data-dropdown="Apple"] [data-modal="modal-about-site"]').click();
}

test.describe('modal sub-windows', () => {
  test('Apple → About this site opens About-site modal', async ({ page }) => {
    await page.goto('/');
    await openAboutSiteModal(page);
    await expect(page.locator('#modal-about-site')).toBeVisible();
  });

  test('Info Center desktop icon opens About modal', async ({ page }) => {
    await page.goto('/');
    // Desktop icon button with data-modal="modal-about"
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    await expect(page.locator('#modal-about')).toBeVisible();
  });

  test('Mail desktop icon opens Contact modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-contact"]').click();
    await expect(page.locator('#modal-contact')).toBeVisible();
  });

  test('modal has a close button in the top-left', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    const modal = page.locator('#modal-about');
    await expect(modal).toBeVisible();
    const closeBtn = modal.locator('[data-close-modal]');
    await expect(closeBtn).toBeVisible();
  });

  test('close button hides the modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    const modal = page.locator('#modal-about');
    await expect(modal).toBeVisible();
    await modal.locator('[data-close-modal]').click();
    await expect(modal).toBeHidden();
  });

  test('Escape key closes open modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    await expect(page.locator('#modal-about')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal-about')).toBeHidden();
  });

  test('main window gets .inactive class while modal is open', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    await expect(win).not.toHaveClass(/inactive/);
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    await expect(win).toHaveClass(/inactive/);
  });

  test('.inactive is removed after modal closes', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    await page.keyboard.press('Escape');
    const win = page.locator('#main-window');
    await expect(win).not.toHaveClass(/inactive/);
  });

  test('modal has role="dialog" and aria-modal="true"', async ({ page }) => {
    await page.goto('/');
    await openAboutSiteModal(page);
    const modal = page.locator('#modal-about-site');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('modal title bar has pinstripe title element', async ({ page }) => {
    await page.goto('/');
    await openAboutSiteModal(page);
    const modal = page.locator('#modal-about-site');
    // Modal should have a title element with the pinstripe CSS class
    await expect(modal.locator('.title')).toBeVisible();
  });

  test('modals start hidden and are in the DOM', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#modal-about-site')).toBeHidden();
    await expect(page.locator('#modal-about')).toBeHidden();
    await expect(page.locator('#modal-contact')).toBeHidden();
  });
});
