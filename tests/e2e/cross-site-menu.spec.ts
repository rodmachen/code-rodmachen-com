import { test, expect } from '@playwright/test'

test('Apple menu contains cross-site navigation entries', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('post-listings-window')).toBeVisible()

  await page.locator('.clasicyDesktopMenuAppleMenu').click()

  await expect(page.locator('#ext-rodmachen')).toBeVisible()
  await expect(page.locator('#ext-edition')).toBeVisible()
  await expect(page.locator('#ext-photo')).toBeVisible()
})

test('Apple menu entry labels contain correct site names', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('post-listings-window')).toBeVisible()

  await page.locator('.clasicyDesktopMenuAppleMenu').click()

  await expect(page.locator('#ext-rodmachen')).toContainText('rodmachen.com')
  await expect(page.locator('#ext-edition')).toContainText('Edition')
  await expect(page.locator('#ext-photo')).toContainText('Photo')
})

test('Apple menu rodmachen.com entry calls window.open with _blank', async ({ page }) => {
  const openedCalls: string[] = []
  await page.exposeFunction('__trackWindowOpen', (url: string) => {
    openedCalls.push(url)
  })

  await page.goto('/')
  await expect(page.getByTestId('post-listings-window')).toBeVisible()

  await page.evaluate(() => {
    window.open = (url) => {
      void (window as any).__trackWindowOpen(String(url ?? ''))
      return null
    }
  })

  await page.locator('.clasicyDesktopMenuAppleMenu').click()
  await expect(page.locator('#ext-rodmachen')).toBeVisible()
  await page.locator('#ext-rodmachen').click()

  await expect.poll(() => openedCalls).toContain('https://rodmachen.com')
})
