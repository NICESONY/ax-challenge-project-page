const { test, expect } = require('@playwright/test');

const sections = ['overview', 'position', 'rotation', 'touch', 'comparison'];

test('desktop page renders every research section and local asset', async ({ page }) => {
  const badResponses = [];
  page.on('response', (response) => {
    const url = response.url();
    if (response.status() >= 400) badResponses.push(`${response.status()} ${url}`);
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/AX Challenge/);

  for (const id of sections) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  await expect(page.locator('.hero-gallery')).toHaveCount(0);
  const heroLayout = await page.locator('.hero-copy').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      centerOffset: Math.abs((bounds.left + bounds.right) / 2 - window.innerWidth / 2),
      textAlign: getComputedStyle(element).textAlign,
    };
  });
  expect(heroLayout.centerOffset).toBeLessThanOrEqual(1);
  expect(heroLayout.textAlign).toBe('center');
  await expect(page.locator('#retarget')).toHaveCount(0);
  await expect(page.locator('#limits')).toHaveCount(0);
  await expect(page.getByText('DEPLOYMENT MISMATCH', { exact: true })).toHaveCount(0);
  await expect(page.locator('.contents-card')).toHaveCount(4);
  await expect(page.locator('#overview h2')).toContainText('UMI Handheld 데이터 수집부터');
  await expect(page.locator('#position h2')).toContainText('실제 움직임에 없는 가짜 경로를 제거함');
  await expect(page.locator('#rotation h2')).toContainText('방향만 179.96° 뒤집히는 문제');
  await expect(page.locator('#rotation h3')).toContainText('보정 전·후 영상 비교');
  await expect(page.locator('#touch h2')).toContainText('좌·우 두 개의 힘 신호로 바꿈');
  await expect(page.getByText(/vision-only 단일 rollout 1개를 먼저 추가했습니다/)).toHaveCount(0);
  await expect(page.locator('#comparison h2')).toHaveText('VTA vs VA');
  await expect(page.locator('.comparison-card.ours h3')).toHaveText('Vision + Tactile');
  await expect(page.getByText('Vision + Bilateral Tactile', { exact: true })).toHaveCount(0);
  await expect(page.getByText('의도한 0-label의 한계')).toHaveCount(0);
  await expect(page.locator('img[src$="forced_zero_conflict.png"]')).toHaveCount(0);
  await expect(page.getByText(/우리 모델과 촉각 없는 모델을/)).toHaveCount(0);

  const brokenImages = await page.locator('img[src]').evaluateAll((images) => images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.getAttribute('src')));
  expect(brokenImages).toEqual([]);
  expect(badResponses).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.locator('#comparison').screenshot({ path: 'test-results/comparison-section.png' });
});

test('mobile page has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.locator('#comparison').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('.comparison-card')).toHaveCount(2);
});

test('included research videos decode and advance', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const videos = page.locator('.diagnostic-videos video, .force-videos video');
  await expect(videos).toHaveCount(4);

  for (let index = 0; index < 4; index += 1) {
    const video = videos.nth(index);
    await video.scrollIntoViewIfNeeded();
    await video.evaluate(async (element) => {
      element.muted = true;
      await element.play();
    });
    await expect.poll(() => video.evaluate((element) => ({
      currentTime: element.currentTime,
      error: element.error?.message || null,
      readyState: element.readyState,
    }))).toMatchObject({ error: null, readyState: 4 });
    await expect.poll(() => video.evaluate((element) => element.currentTime), {
      timeout: 10_000,
    }).toBeGreaterThan(0.1);
    await video.evaluate((element) => element.pause());
  }
});

test('both robot rollout videos replace their placeholders and play', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const baseline = page.locator('.comparison-card.baseline');
  const tactile = page.locator('.comparison-card.ours');
  await baseline.scrollIntoViewIfNeeded();
  await expect(baseline).toHaveClass(/has-video/);
  await expect(tactile).toHaveClass(/has-video/);

  for (const card of [tactile, baseline]) {
    const video = card.locator('video');
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

test('AX edition full-page visual snapshots render', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/ax-desktop-full.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/ax-mobile-full.png', fullPage: true });
});
