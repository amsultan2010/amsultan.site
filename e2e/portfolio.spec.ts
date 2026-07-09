import { test, expect } from '@playwright/test';

test('homepage loads voltage frame with brand and work', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('button', { name: /skip/i });
  if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skip.click();
  }
  await expect(page.getByRole('heading', { name: /abdullah/i }).first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.js-terrain-canvas')).toBeAttached();
  await expect(page.getByRole('heading', { name: /^work$/i }).first()).toBeVisible();
  await expect(page.getByText(/tutoringbyabdullah/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /^proof$/i }).first()).toBeVisible();
});

test('projects archive renders list', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: /projects/i }).first()).toBeVisible();
  await expect(page.getByText(/tutoringbyabdullah/i).first()).toBeVisible();
  await expect(page.getByText(/the downforce blog/i).first()).toBeVisible();
});

test('lab page still loads', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.getByRole('heading', { name: /the lab/i })).toBeVisible();
});

test('desktop redirects to lab', async ({ page }) => {
  await page.goto('/desktop');
  await expect(page).toHaveURL(/\/lab\/?$/);
});

test('contrast toggle works on homepage', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('button', { name: /skip/i });
  if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skip.click();
  }
  const toggle = page.getByRole('button', { name: /toggle contrast|contrast/i });
  await toggle.click();
  await expect(page.locator('html.theme-contrasted')).toBeVisible({ timeout: 5000 });
});

test('nav is section-only on homepage', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('button', { name: /skip/i });
  if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skip.click();
  }
  const nav = page.getByRole('navigation', { name: /primary/i });
  await expect(nav.getByRole('link', { name: /^about$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /^work$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /^proof$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /^contact$/i })).toBeVisible();
  await expect(nav.getByRole('link', { name: /lab/i })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: /archive/i })).toHaveCount(0);
});
