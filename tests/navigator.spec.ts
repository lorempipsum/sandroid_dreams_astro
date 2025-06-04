import { test, expect } from '@playwright/test';

test.describe('Navigator page', () => {
  test('shows input and buttons', async ({ page }) => {
    await page.goto('/experiments/navigator');
    await expect(page.getByPlaceholder('lat,lng')).toBeVisible();
    await expect(page.getByRole('button', { name: 'GO' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Enable Compass' })
    ).toBeVisible();
  });
});
