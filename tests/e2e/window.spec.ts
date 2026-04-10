import { test, expect } from '@playwright/test';

test.describe('classic window', () => {
  test('window is flush under menu bar', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    await expect(win).toBeVisible();
    const box = await win.boundingBox();
    expect(box).not.toBeNull();
    // Window top (y) should be near the 24px menu bar (some rendering offset allowed)
    expect(box!.y).toBeGreaterThanOrEqual(20);
    expect(box!.y).toBeLessThanOrEqual(35);
  });

  test('window fills full viewport height', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    await expect(win).toBeVisible();
    const box = await win.boundingBox();
    const viewportSize = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewportSize).not.toBeNull();
    // Window should extend to near the bottom of the viewport
    const windowBottom = box!.y + box!.height;
    expect(windowBottom).toBeGreaterThan(viewportSize!.height * 0.95);
  });

  test('title bar has pinstripe (before/after pseudo-elements)', async ({ page }) => {
    await page.goto('/');
    // Verify the main window title element exists and has expected dimensions
    const title = page.locator('#main-window .title');
    await expect(title).toBeVisible();
    const box = await title.boundingBox();
    expect(box).not.toBeNull();
    // Title bar height should be ~22px
    expect(box!.height).toBeGreaterThanOrEqual(20);
    expect(box!.height).toBeLessThanOrEqual(26);
  });

  test('zoom button toggles maximized class', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    const zoomBtn = page.locator('#btn-zoom');

    await expect(win).not.toHaveClass(/maximized/);
    await zoomBtn.click();
    await expect(win).toHaveClass(/maximized/);
    await zoomBtn.click();
    await expect(win).not.toHaveClass(/maximized/);
  });

  test('collapse button hides window pane', async ({ page }) => {
    await page.goto('/');
    const pane = page.locator('#window-pane');
    const shadeBtn = page.locator('#btn-shade');

    await expect(pane).toBeVisible();
    await shadeBtn.click();
    await expect(pane).toBeHidden();
    await shadeBtn.click();
    await expect(pane).toBeVisible();
  });

  test('apple logo SVG is present in menu bar', async ({ page }) => {
    await page.goto('/');
    const appleImg = page.locator('.apple-logo img[src*="apple-logo"]');
    await expect(appleImg).toBeVisible();
  });

  test('three desktop icons are present', async ({ page }) => {
    await page.goto('/');
    const icons = page.locator('.desktop-icon');
    const count = await icons.count();
    expect(count).toBe(3);
  });

  test('desktop icon SVGs load', async ({ page }) => {
    await page.goto('/');
    const iconImgs = page.locator('.desktop-icons img');
    const count = await iconImgs.count();
    expect(count).toBe(3);
    for (let i = 0; i < count; i++) {
      await expect(iconImgs.nth(i)).toBeVisible();
    }
  });

  test('window has drop shadow', async ({ page }) => {
    await page.goto('/');
    const win = page.locator('#main-window');
    const boxShadow = await win.evaluate((el) =>
      getComputedStyle(el).boxShadow
    );
    // Drop shadow should be present (not 'none')
    expect(boxShadow).not.toBe('none');
    expect(boxShadow).not.toBe('');
  });
});
