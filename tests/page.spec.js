const { test, expect } = require('@playwright/test');

test('public page exposes only comparison titles and rollout videos', async ({ page }) => {
  const badResponses = [];
  const localOrigin = new URL(
    process.env.PROJECT_PAGE_BASE_URL || 'http://127.0.0.1:8765',
  ).origin;
  page.on('response', (response) => {
    const url = response.url();
    if (new URL(url).origin === localOrigin && response.status() >= 400) {
      badResponses.push(`${response.status()} ${url}`);
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/AX Challenge/);

  await expect(page.locator('nav, header.hero, .site-footer')).toHaveCount(0);
  await expect(page.locator('#overview, #position, #rotation, #touch')).toHaveCount(0);
  await expect(page.locator('#comparison')).toBeVisible();
  await expect(page.locator('#comparison h2')).toHaveText('VTA vs VA');
  await expect(page.locator('#comparison h3')).toHaveText([
    'Vision-only UMI',
    'Vision + Tactile',
  ]);
  await expect(page.locator('#comparison video')).toHaveCount(2);
  await expect(page.locator('.protocol-grid, .comparison-card footer, .video-placeholder')).toHaveCount(0);

  const visibleText = (await page.locator('body').innerText())
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  expect(visibleText).toEqual(['VTA vs VA', 'Vision-only UMI', 'Vision + Tactile']);
  expect(badResponses).toEqual([]);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('both comparison videos decode and advance', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const videos = page.locator('#comparison video');
  await expect(videos).toHaveCount(2);

  for (let index = 0; index < 2; index += 1) {
    const video = videos.nth(index);
    await video.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await expect.poll(() => video.evaluate((element) => element.currentTime), {
      timeout: 10_000,
    }).toBeGreaterThan(0.1);
    expect(await video.evaluate((element) => element.error?.message || null)).toBeNull();
    await video.evaluate((element) => element.pause());
  }
});

test('minimal comparison page has no mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#comparison')).toBeVisible();
  await expect(page.locator('#comparison video')).toHaveCount(2);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
