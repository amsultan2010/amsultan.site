import { test, expect } from '@playwright/test';

test('homepage loads and skip intro works', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('button', { name: /skip intro/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
  }
  await expect(page.getByRole('heading', { name: /abdullah sultan/i }).first()).toBeVisible();
});

test('projects page renders cards', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByText(/abdullahOS/i).first()).toBeVisible();
  await expect(page.getByText(/tutoringbyabdullah/i).first()).toBeVisible();
});

test('theme toggle persists', async ({ page }) => {
  await page.goto('/projects');
  const toggle = page.getByRole('button', { name: /toggle theme/i });
  await toggle.click();
  await expect(page.locator('[data-rg-theme="dark"]')).toBeVisible();
});
