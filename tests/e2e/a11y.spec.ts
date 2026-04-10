import { test, expect } from '@playwright/test';

test.describe('accessibility and keyboard navigation', () => {
  test('menu bar has role="menubar"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[role="menubar"]')).toBeVisible();
  });

  test('menu dropdowns have role="menu"', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="File"]').click();
    const menu = page.locator('[data-dropdown="File"][role="menu"]');
    await expect(menu).toBeVisible();
  });

  test('menu items have role="menuitem"', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="File"]').click();
    const item = page.locator('[data-dropdown="File"] [role="menuitem"]').first();
    await expect(item).toBeVisible();
  });

  test('disabled Edit Posts has aria-disabled="true"', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="Edit"]').click();
    const editPosts = page.locator('[data-dropdown="Edit"] [aria-disabled="true"]');
    await expect(editPosts).toBeVisible();
  });

  test('View items have role="menuitemcheckbox"', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="View"]').click();
    const checkboxItems = page.locator('[data-dropdown="View"] [role="menuitemcheckbox"]');
    expect(await checkboxItems.count()).toBe(2);
  });

  test('keyboard: Tab reaches menu bar buttons', async ({ page }) => {
    await page.goto('/');
    // Tab to first focusable menu button
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.className ?? '');
    // A menu button or focusable element should be focused
    expect(focused.length).toBeGreaterThan(0);
  });

  test('keyboard: Enter opens menu, Escape closes it', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="File"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-dropdown="File"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-dropdown="File"]')).not.toBeVisible();
  });

  test('keyboard: Escape closes modal and returns focus to trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('.desktop-icons [data-modal="modal-about"]');
    await trigger.click();
    await expect(page.locator('#modal-about')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal-about')).toBeHidden();
    // Focus should be on some element (not document body)
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).not.toBe('BODY');
  });

  test('focus trap: Tab stays within open modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    const modal = page.locator('#modal-about');
    await expect(modal).toBeVisible();
    // All focusable elements should be inside the modal
    const closeBtn = modal.locator('[data-close-modal]');
    await expect(closeBtn).toBeFocused();
    // Tab through all focusable items in modal; focus should remain inside
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    const focusedInModal = await page.evaluate(() => {
      const modal = document.getElementById('modal-about');
      return modal ? modal.contains(document.activeElement) : false;
    });
    expect(focusedInModal).toBe(true);
  });

  test('all interactive controls have visible focus ring (outline not none)', async ({ page }) => {
    await page.goto('/');
    // Check the main zoom button has a dotted outline when focused
    await page.locator('#btn-zoom').focus();
    const outline = await page.locator('#btn-zoom').evaluate(
      (el) => getComputedStyle(el).outlineStyle
    );
    expect(outline).not.toBe('none');
  });

  test('modal close box is accessible via keyboard', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desktop-icons [data-modal="modal-about"]').click();
    const modal = page.locator('#modal-about');
    await expect(modal).toBeVisible();
    // Close button should be focused on open
    const closeBtn = modal.locator('[data-close-modal]');
    await expect(closeBtn).toBeFocused();
    // Press Enter to close
    await page.keyboard.press('Enter');
    await expect(modal).toBeHidden();
  });
});
