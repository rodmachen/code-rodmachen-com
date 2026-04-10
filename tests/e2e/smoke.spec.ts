import { test, expect } from '@playwright/test';

test('smoke test - page loads and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page.locator('body')).toContainText('Hello, Classicy');
  expect(errors).toHaveLength(0);
});
