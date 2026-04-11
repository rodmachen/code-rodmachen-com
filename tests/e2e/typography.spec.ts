import { test, expect } from '@playwright/test';

test.describe('Typography and Styling', () => {
  test('typography-test post renders with correct styles and unsmoothed Chicago headings', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!/audio sprite|No audio support|Failed to load resource/i.test(text)) {
          errors.push(text);
        }
      }
    });

    await page.goto('/posts/typography-test');

    // Wait for the post to load and the PostBody to be present
    const postBody = page.locator('.blogPostBody');
    await expect(postBody).toBeVisible();

    // Assert elements are present inside the post body
    await expect(postBody.locator('h1').first()).toBeVisible();
    await expect(postBody.locator('h2').first()).toBeVisible();
    await expect(postBody.locator('pre').first()).toBeVisible();
    await expect(postBody.locator('code').first()).toBeVisible();
    await expect(postBody.locator('table').first()).toBeVisible();

    // The blockquote isn't in typography-test, but is in hello-classicy
    // We can just assert the ones that are in typography-test.md
    await expect(postBody.locator('ul').first()).toBeVisible();
    await expect(postBody.locator('ol').first()).toBeVisible();

    // Evaluate computed styles on the first H1
    const h1Styles = await postBody.locator('h1').first().evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        webkitFontSmoothing: computed.getPropertyValue('-webkit-font-smoothing'),
        fontSize: computed.fontSize,
      };
    });

    // Assert the H1 uses Chicago
    expect(h1Styles.fontFamily).toContain('ChicagoFLF');

    // Assert the H1 is rendered unsmoothed
    expect(h1Styles.webkitFontSmoothing).toBe('none');

    // Assert the H1 font-size is an integer pixel value
    const fontSizeVal = parseFloat(h1Styles.fontSize);
    expect(Number.isInteger(fontSizeVal)).toBe(true);
    expect(h1Styles.fontSize).toBe('24px'); // Ensure it matches our exact CSS

    // Assert ChicagoFLF is actually loaded (not just declared, then falling
    // back to serif). This guards against the false-green where the @font-face
    // src 404s but getComputedStyle still reports "ChicagoFLF" because it
    // returns the declared family, not the resolved one.
    await page.evaluate(() => document.fonts.ready);
    const chicagoLoaded = await page.evaluate(() =>
      document.fonts.check('24px ChicagoFLF'),
    );
    expect(chicagoLoaded).toBe(true);

    // Sanity: an h1 rendered in ChicagoFLF must be visibly wider than the
    // same text in a generic serif at the same size. This catches silent
    // fallback that document.fonts.check might miss.
    const chicagoVsSerifWidth = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const sample = 'Heading Width Sample';
      ctx.font = '24px ChicagoFLF, serif';
      const chicagoWidth = ctx.measureText(sample).width;
      ctx.font = '24px serif';
      const serifWidth = ctx.measureText(sample).width;
      return { chicagoWidth, serifWidth };
    });
    expect(chicagoVsSerifWidth.chicagoWidth).not.toBeCloseTo(
      chicagoVsSerifWidth.serifWidth,
      0,
    );

    // Assert at least one <pre> has inline color styles from Shiki
    const firstPreHTML = await postBody.locator('pre').first().innerHTML();
    expect(firstPreHTML).toContain('style="color:');

    // Assert no horizontal overflow on the reading pane
    const hasOverflow = await postBody.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // Assert zero console errors during load
    expect(errors).toHaveLength(0);
  });
});
