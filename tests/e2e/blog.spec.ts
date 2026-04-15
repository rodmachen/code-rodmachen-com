import { test, expect, Page } from '@playwright/test';

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!/audio sprite|No audio support|Failed to load resource/i.test(text)) {
        errors.push(text);
      }
    }
  });
  return errors;
}

test('desktop shows Hard Drive icon near top-right', async ({ page }) => {
  await page.goto('/');
  // Find the desktop icon whose label is "Hard Drive"
  const hardDriveLabel = page.locator('.classicyDesktopIcon p', { hasText: 'Hard Drive' });
  await expect(hardDriveLabel).toBeVisible();
});

test('home page renders post listings window', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  const listingsWindow = page.getByTestId('post-listings-window');
  await expect(listingsWindow).toBeVisible();

  // At least one post row should be visible
  await expect(page.getByTestId('post-listing-hello-classicy')).toBeVisible();

  expect(errors).toEqual([]);
});

test('direct navigation to /posts/typography-test shows that post', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/posts/typography-test');

  await expect(page.getByTestId('post-body')).toContainText(
    'Typography is a critical aspect of design',
  );

  expect(errors).toEqual([]);
});

test('reader window position persists across reloads', async ({ page }) => {
  await page.goto('/posts/hello-classicy');

  // Classicy applies inline left/top on each window. Grab the reader window
  // and its title bar (drag handle).
  const readerWindow = page.locator('#blog_blog\\.reader\\.hello-classicy');
  await expect(readerWindow).toBeVisible();

  const initialBox = await readerWindow.boundingBox();
  if (!initialBox) throw new Error('reader window has no bounding box');

  const titleBar = readerWindow.locator('.classicyWindowTitleBar').first();

  // Drag the window 100px to the right.
  const startX = initialBox.x + initialBox.width / 2;
  const startY = initialBox.y + 10;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 100, startY, { steps: 10 });
  await page.mouse.up();
  // placate linter; titleBar locator is the semantic drag target even
  // though we drive via mouse coords for stability in Classicy's DOM.
  void titleBar;

  const draggedBox = await readerWindow.boundingBox();
  if (!draggedBox) throw new Error('reader window has no bounding box after drag');
  expect(draggedBox.x).toBeGreaterThan(initialBox.x + 50);

  // Classicy debounces persistence by 500ms — wait longer than that.
  await page.waitForTimeout(800);
  await page.reload();

  await expect(readerWindow).toBeVisible();
  const reloadedBox = await readerWindow.boundingBox();
  if (!reloadedBox) throw new Error('reader window has no bounding box after reload');
  // Position should be near the dragged position, not the initial position.
  expect(Math.abs(reloadedBox.x - draggedBox.x)).toBeLessThan(10);
});

// URL contract and persistence tests (Step 12)

test('URL contract: / shows listings window focused', async ({ page }) => {
  await page.goto('/');
  // Classicy marks the focused window with classicyWindowActive class.
  const activeListings = page.locator(
    '#blog_blog\\.listings.classicyWindowActive',
  );
  await expect(activeListings).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});

test('URL contract: /posts/<slug> shows that post window focused', async ({
  page,
}) => {
  await page.goto('/posts/typography-test');
  const activeReader = page.locator(
    '#blog_blog\\.reader\\.typography-test.classicyWindowActive',
  );
  await expect(activeReader).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/posts/typography-test');
});

test('clicking a post updates URL and focuses reader; back button returns to listings', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('post-listing-hello-classicy')).toBeVisible();

  // Click the post row.
  await page.getByTestId('post-listing-hello-classicy').click();

  // URL should change to /posts/hello-classicy and reader window should be focused.
  await expect(page).toHaveURL('/posts/hello-classicy');
  await expect(
    page.locator('#blog_blog\\.reader\\.hello-classicy.classicyWindowActive'),
  ).toBeVisible();

  // Browser back button.
  await page.goBack();
  // Wait for Next.js SPA navigation to settle and hook to dispatch focus.
  await page.waitForURL('/');

  // Listings should regain focus.
  await expect(
    page.locator('#blog_blog\\.listings.classicyWindowActive'),
  ).toBeVisible();
});

test('reload on post URL focuses post window while preserving dragged positions', async ({
  page,
}) => {
  // Navigate to a post.
  await page.goto('/posts/hello-classicy');
  const readerWindow = page.locator(
    '#blog_blog\\.reader\\.hello-classicy',
  );
  await expect(readerWindow).toBeVisible();

  // Drag the reader window.
  const box = await readerWindow.boundingBox();
  if (!box) throw new Error('no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + 10, { steps: 8 });
  await page.mouse.up();
  const draggedBox = await readerWindow.boundingBox();
  if (!draggedBox) throw new Error('no bounding box after drag');

  // Wait for Classicy persistence debounce (500ms), then reload.
  await page.waitForTimeout(800);
  await page.reload();

  // After reload: post window focused (URL contract respected).
  await expect(
    page.locator('#blog_blog\\.reader\\.hello-classicy.classicyWindowActive'),
  ).toBeVisible();

  // Position preserved (persistence working).
  const reloadedBox = await readerWindow.boundingBox();
  if (!reloadedBox) throw new Error('no bounding box after reload');
  expect(Math.abs(reloadedBox.x - draggedBox.x)).toBeLessThan(10);
});

test('customizations reapply cleanly after localStorage is cleared', async ({
  page,
}) => {
  // First visit populates localStorage with persisted Classicy state.
  await page.goto('/');
  await expect(page.getByTestId('post-listings-window')).toBeVisible();
  await page.waitForTimeout(800);

  // Clear persisted state and reload — customizations must reapply.
  await page.evaluate(() => localStorage.removeItem('classicyDesktopState'));
  await page.reload();

  // Hard Drive icon label still correct.
  await expect(
    page.locator('.classicyDesktopIcon p', { hasText: 'Hard Drive' }),
  ).toBeVisible();

  // Clock customization: no seconds (displaySeconds: false) means format is
  // "H:MM AM/PM" (e.g. "3:05 PM"), not "H:MM:SS AM/PM".
  const clock = page.locator('.classicyDesktopMenuTime').first();
  await expect(clock).toBeVisible();
  const clockText = (await clock.innerText()).trim();
  expect(clockText).toMatch(/^\d{1,2}:\d{2}\s?(AM|PM)$/i);
});
