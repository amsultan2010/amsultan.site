import { test, expect, type Page } from '@playwright/test';

async function dismissIntro(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Always force-complete — intro wipe can race under parallel workers
  await page.waitForFunction(() => !!document.querySelector('.js-site-wrapper'), null, {
    timeout: 15000,
  });
  const skip = page.getByRole('button', { name: /skip/i });
  if (await skip.isVisible({ timeout: 800 }).catch(() => false)) {
    await skip.click({ force: true }).catch(() => undefined);
  }
  await page.evaluate(() => {
    const intro = document.querySelector('.js-intro');
    const wrapper = document.querySelector<HTMLElement>('.js-site-wrapper');
    if (wrapper) wrapper.style.opacity = '1';
    intro?.remove();
    document.documentElement.classList.remove('is-scroll-blocked');
    sessionStorage.setItem('vf-intro-seen', '1');
  });
  await expect(page.locator('.js-site-wrapper')).toBeVisible({ timeout: 5000 });
}

test('homepage loads voltage frame with brand and work', async ({ page }) => {
  await page.goto('/');
  await dismissIntro(page);
  await expect(page.getByRole('heading', { name: /abdullah/i }).first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.js-terrain-canvas')).toBeAttached();
  await expect(page.locator('#work')).toBeVisible();
  await expect(page.locator('.js-stretch').filter({ hasText: /work/i }).first()).toBeAttached();
  await expect(page.getByText(/tutoringbyabdullah/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /building from riyadh/i })).toBeVisible();
  await expect(page.locator('#proof')).toBeVisible();
  await expect(page.locator('.js-contact-go')).toBeVisible();
  await expect(page.locator('.s-margin__pre')).toContainText(/B{10,}/);
  await expect(page.getByRole('link', { name: /visit the lab/i })).toHaveCount(0);
});

test('projects archive renders list', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: /projects/i }).first()).toBeVisible();
  await expect(page.getByText(/tutoringbyabdullah/i).first()).toBeVisible();
  await expect(page.getByText(/the downforce blog/i).first()).toBeVisible();
  await expect(page.getByText(/the lab/i)).toHaveCount(0);
});

test('lab and desktop redirect home', async ({ page }) => {
  await page.goto('/lab');
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/desktop');
  await expect(page).toHaveURL(/\/$/);
});

test('contrast toggle works on homepage', async ({ page }) => {
  await page.goto('/');
  await dismissIntro(page);
  const toggle = page.getByRole('button', { name: /toggle contrast|contrast/i });
  await toggle.click();
  await expect(page.locator('html.theme-contrasted')).toBeVisible({ timeout: 5000 });
});

test('nav is section-only on homepage', async ({ page }) => {
  await page.goto('/');
  await dismissIntro(page);
  const nav = page.getByRole('navigation', { name: /primary/i });
  await expect(nav.getByRole('link', { name: /^about$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /^work$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /^proof$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /^contact$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /lab/i })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: /archive/i })).toHaveCount(0);
});
