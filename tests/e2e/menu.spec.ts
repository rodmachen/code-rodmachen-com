import { test, expect } from '@playwright/test';

test.describe('menu bar dropdowns', () => {
  test('Special menu is absent from DOM', async ({ page }) => {
    await page.goto('/');
    const specialMenu = page.locator('[data-menu="Special"], button:has-text("Special")');
    await expect(specialMenu).toHaveCount(0);
  });

  test('clicking File menu opens dropdown containing Home', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="File"]').click();
    const dropdown = page.locator('[data-dropdown="File"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('a[href="/"]')).toBeVisible();
  });

  test('clicking Edit menu opens dropdown with disabled Edit Posts', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="Edit"]').click();
    const dropdown = page.locator('[data-dropdown="Edit"]');
    await expect(dropdown).toBeVisible();
    const editPosts = dropdown.locator('[aria-disabled="true"]');
    await expect(editPosts).toBeVisible();
    await expect(editPosts).toContainText('Edit Posts');
  });

  test('disabled item cannot be clicked to trigger navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="Edit"]').click();
    const editPosts = page.locator('[data-dropdown="Edit"] [aria-disabled="true"]');
    // Clicking disabled item should not navigate
    const urlBefore = page.url();
    await editPosts.click({ force: true });
    await page.waitForTimeout(100);
    expect(page.url()).toBe(urlBefore);
  });

  test('View menu has Full Width and Normal items', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="View"]').click();
    const dropdown = page.locator('[data-dropdown="View"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('button:has-text("Full Width")')).toBeVisible();
    await expect(dropdown.locator('button:has-text("Normal")')).toBeVisible();
  });

  test('View Full Width adds maximized class to main window', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    await expect(win).not.toHaveClass(/maximized/);
    await page.locator('[data-menu="View"]').click();
    await page.locator('[data-dropdown="View"] button:has-text("Full Width")').click();
    await expect(win).toHaveClass(/maximized/);
  });

  test('View Normal removes maximized class from main window', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    // First maximize via zoom button
    await page.locator('#btn-zoom').click();
    await expect(win).toHaveClass(/maximized/);
    // Then use View > Normal
    await page.locator('[data-menu="View"]').click();
    await page.locator('[data-dropdown="View"] button:has-text("Normal")').click();
    await expect(win).not.toHaveClass(/maximized/);
  });

  test('View Full Width shows checkmark when maximized', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="View"]').click();
    const fullWidth = page.locator('[data-dropdown="View"] button:has-text("Full Width")');
    // Not checked initially
    await expect(fullWidth).not.toHaveClass(/checked/);
    await fullWidth.click();
    // Reopen menu to see check state
    await page.locator('[data-menu="View"]').click();
    const fullWidthAfter = page.locator('[data-dropdown="View"] button:has-text("Full Width")');
    await expect(fullWidthAfter).toHaveClass(/checked/);
  });

  test('Help menu has Help me item linking to google.com in new tab', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="Help"]').click();
    const helpItem = page.locator('[data-dropdown="Help"] a[href="https://www.google.com"]');
    await expect(helpItem).toBeVisible();
    await expect(helpItem).toHaveAttribute('target', '_blank');
  });

  test('only one dropdown is open at a time', async ({ page }) => {
    await page.goto('/');
    const fileBtn = page.locator('[data-menu="File"]');
    const editBtn = page.locator('[data-menu="Edit"]');
    await fileBtn.click();
    await expect(page.locator('[data-dropdown="File"]')).toBeVisible();
    // Scroll-safe click for fixed menu bar buttons
    await editBtn.scrollIntoViewIfNeeded();
    await editBtn.click({ position: { x: 5, y: 12 } });
    await expect(page.locator('[data-dropdown="File"]')).not.toBeVisible();
    await expect(page.locator('[data-dropdown="Edit"]')).toBeVisible();
  });

  test('clicking outside closes open dropdown', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="File"]').click();
    await expect(page.locator('[data-dropdown="File"]')).toBeVisible();
    // Click somewhere outside the menu bar
    await page.click('#main-window');
    await expect(page.locator('[data-dropdown="File"]')).not.toBeVisible();
  });

  test('Escape key closes open dropdown', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="File"]').click();
    await expect(page.locator('[data-dropdown="File"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-dropdown="File"]')).not.toBeVisible();
  });

  test('Apple menu opens dropdown with About this site', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu="Apple"]').click();
    const dropdown = page.locator('[data-dropdown="Apple"]');
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('button:has-text("About this site")')).toBeVisible();
  });

  test('active menu title has inverse highlight', async ({ page }) => {
    await page.goto('/');
    const fileMenu = page.locator('[data-menu="File"]');
    await fileMenu.click();
    // Active item should have a class indicating it's open
    await expect(fileMenu).toHaveClass(/active/);
  });
});
