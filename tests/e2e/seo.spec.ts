// These tests run against the dev server, where all posts are visible regardless
// of `published` status. If run against a production build, post-level tests
// will fail unless SHOW_DRAFTS=true is set.
import { test, expect } from '@playwright/test'

test('/posts/hello-classicy/ has og:title meta tag', async ({ page }) => {
  await page.goto('/posts/hello-classicy/')
  const ogTitle = page.locator('meta[property="og:title"]')
  await expect(ogTitle).toHaveAttribute('content', 'Hello, Classicy')
})

test('/posts/hello-classicy/ has canonical link', async ({ page }) => {
  await page.goto('/posts/hello-classicy/')
  const canonical = page.locator('link[rel="canonical"]')
  await expect(canonical).toHaveAttribute(
    'href',
    'https://code.rodmachen.com/posts/hello-classicy/',
  )
})

test('/topics/classicy/ has og:title meta tag', async ({ page }) => {
  await page.goto('/topics/classicy/')
  const ogTitle = page.locator('meta[property="og:title"]')
  await expect(ogTitle).toHaveAttribute('content', 'Topic: classicy | code')
})

test('/topics/classicy/ has canonical link', async ({ page }) => {
  await page.goto('/topics/classicy/')
  const canonical = page.locator('link[rel="canonical"]')
  await expect(canonical).toHaveAttribute(
    'href',
    'https://code.rodmachen.com/topics/classicy/',
  )
})

test('/topics/ has canonical link', async ({ page }) => {
  await page.goto('/topics/')
  const canonical = page.locator('link[rel="canonical"]')
  await expect(canonical).toHaveAttribute(
    'href',
    'https://code.rodmachen.com/topics/',
  )
})
