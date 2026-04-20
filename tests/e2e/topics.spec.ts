import { test, expect } from '@playwright/test';

test('/topics/ renders tag cloud with counts', async ({ page }) => {
  await page.goto('/topics/');

  await expect(page.getByTestId('topics-page')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Topics' })).toBeVisible();

  // Dev-mode drafts are visible, so we expect at least the tags we know ship
  // with the sample content (meta, classicy, test).
  const metaLink = page.getByTestId('topic-link-meta');
  await expect(metaLink).toBeVisible();
  await expect(metaLink).toContainText('meta');
  await expect(metaLink).toContainText('(3)');

  const classicyLink = page.getByTestId('topic-link-classicy');
  await expect(classicyLink).toBeVisible();
  await expect(classicyLink).toContainText('(1)');
});

test('/topics/classicy/ lists hello-classicy only', async ({ page }) => {
  await page.goto('/topics/classicy/');

  await expect(page.getByTestId('topic-page')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Topic: classicy' }),
  ).toBeVisible();

  await expect(page.getByTestId('topic-post-hello-classicy')).toBeVisible();
  // Only hello-classicy has the "classicy" tag, so no other posts should appear.
  const items = page.getByTestId('topic-post-list').locator('li');
  await expect(items).toHaveCount(1);
});

test('clicking a tag link navigates to the tag page', async ({ page }) => {
  await page.goto('/topics/');
  await page.getByTestId('topic-link-classicy').click();
  await expect(page).toHaveURL('/topics/classicy/');
  await expect(
    page.getByRole('heading', { name: 'Topic: classicy' }),
  ).toBeVisible();
});
