import { test, expect } from '@playwright/test'

test('/rss.xml returns XML content-type', async ({ page }) => {
  const response = await page.request.get('/rss.xml')
  expect(response.status()).toBe(200)
  const contentType = response.headers()['content-type'] ?? ''
  expect(contentType).toContain('xml')
})

test('/rss.xml has valid RSS envelope', async ({ page }) => {
  const response = await page.request.get('/rss.xml')
  const body = await response.text()
  expect(body).toContain('<rss')
  expect(body).toContain('code – Rod Machen')
  expect(body).toContain('</rss>')
})

test('/rss.xml is well-formed with no published posts', async ({ page }) => {
  // In dev mode all posts are shown as drafts, so channel may have items or not —
  // either way the envelope must be present.
  const response = await page.request.get('/rss.xml')
  const body = await response.text()
  expect(body).toContain('<?xml')
  expect(body).toContain('<channel>')
  expect(body).toContain('</channel>')
})
