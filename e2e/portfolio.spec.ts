import { test, expect } from '@playwright/test';

test('homepage loads with brand and work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /abdullah/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /grab coffee/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^work$/i })).toBeVisible();
});

test('projects page renders archive list', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByText(/tutoringbyabdullah/i).first()).toBeVisible();
  await expect(page.getByText(/the downforce blog/i).first()).toBeVisible();
});

test('lab page loads toys', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.getByRole('heading', { name: /the lab/i })).toBeVisible();
  await expect(page.getByLabel(/lab terminal/i)).toBeVisible();
});

test('desktop redirects to lab', async ({ page }) => {
  await page.goto('/desktop');
  await expect(page).toHaveURL(/\/lab\/?$/);
});

test('theme toggle persists', async ({ page }) => {
  await page.goto('/projects');
  const toggle = page.getByRole('button', { name: /toggle theme/i });
  await toggle.click();
  await expect(page.locator('[data-rg-theme="light"]')).toBeVisible();
});
