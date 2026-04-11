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

test('home page renders blog window with both post titles in the sidebar', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  const window = page.getByTestId('blog-window');
  await expect(window).toBeVisible();

  await expect(window.getByTestId('post-link-hello-classicy')).toBeVisible();
  await expect(window.getByTestId('post-link-typography-test')).toBeVisible();

  // Most-recent post is selected by default (hello-classicy: 2026-04-10)
  await expect(
    window.getByTestId('post-link-hello-classicy'),
  ).toHaveAttribute('data-active', 'true');

  const body = page.getByTestId('post-body');
  await expect(body).toContainText('Welcome to the new rebuild');

  expect(errors).toEqual([]);
});

test('clicking the second post in the sidebar updates URL and reading pane', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  await page.getByTestId('post-link-typography-test').click();

  await expect(page).toHaveURL(/\/posts\/typography-test$/);
  await expect(
    page.getByTestId('post-link-typography-test'),
  ).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('post-body')).toContainText(
    'longer paragraph to test how the line height',
  );

  expect(errors).toEqual([]);
});

test('direct navigation to /posts/typography-test lands with that post selected', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/posts/typography-test');

  await expect(
    page.getByTestId('post-link-typography-test'),
  ).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('post-body')).toContainText(
    'Typography is a critical aspect of design',
  );

  expect(errors).toEqual([]);
});

test('browser back button restores the previous selection', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  await expect(
    page.getByTestId('post-link-hello-classicy'),
  ).toHaveAttribute('data-active', 'true');

  await page.getByTestId('post-link-typography-test').click();
  await expect(page).toHaveURL(/\/posts\/typography-test$/);
  await expect(
    page.getByTestId('post-link-typography-test'),
  ).toHaveAttribute('data-active', 'true');

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByTestId('post-link-hello-classicy'),
  ).toHaveAttribute('data-active', 'true');

  expect(errors).toEqual([]);
});
