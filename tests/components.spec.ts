import { test, expect } from '@playwright/test';

test.describe('Components page', () => {
  test('loads and displays components list', async ({ page }) => {
    await page.goto('/components');
    
    // Check page title
    await expect(page).toHaveTitle('Components');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Components', level: 1 })).toBeVisible();
    
    // Check that the total count is displayed
    await expect(page.getByText('45 components')).toBeVisible();
    
    // Check that both component type sections are present
    await expect(page.getByRole('heading', { name: /Astro Components/, level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: /React \(TSX\) Components/, level: 2 })).toBeVisible();
    
    // Check specific components are listed
    await expect(page.getByRole('heading', { name: 'DummyComponent', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Navigator', level: 3 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Title', level: 3 })).toBeVisible();
  });

  test('can be navigated to from main navigation', async ({ page }) => {
    // Start from home page (redirects to photography)
    await page.goto('/');
    
    // Click Components link in navigation
    await page.getByRole('link', { name: 'Components' }).click();
    
    // Verify we're on the components page
    await expect(page).toHaveURL('/components');
    await expect(page.getByRole('heading', { name: 'Components', level: 1 })).toBeVisible();
  });
});