import { test, expect } from '@playwright/test';

test('smoke test - Classicy desktop mounts without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error') {
      errors.push(msg.text());
    } else if (type === 'warning') {
      warnings.push(msg.text());
    }
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} - ${req.failure()?.errorText ?? ''}`);
  });
  page.on('response', (res) => {
    if (res.status() === 404) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto('/');

  await expect(page.locator('#classicyDesktop')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /finder/i }).first()).toBeVisible();

  const unexpectedMisses = failedRequests.filter(
    (r) => !/wallpapers\/default\.png/.test(r),
  );
  expect(unexpectedMisses).toEqual([]);

  const fatalErrors = errors.filter(
    (e) =>
      !/audio sprite|No audio support|Failed to load resource/i.test(e),
  );
  expect(fatalErrors).toEqual([]);

  const hydrationWarnings = warnings.filter((w) =>
    /hydrat|did not match|Text content does not match/i.test(w),
  );
  expect(hydrationWarnings).toEqual([]);
});
