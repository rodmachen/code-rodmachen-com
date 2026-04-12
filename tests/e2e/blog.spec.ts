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

test('home page renders post reader with content', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  const window = page.getByTestId('blog-window');
  await expect(window).toBeVisible();

  const body = page.getByTestId('post-body');
  await expect(body).toContainText('Welcome to the new rebuild');

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
