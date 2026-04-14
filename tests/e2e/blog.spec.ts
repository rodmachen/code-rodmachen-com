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
