# Test info

- Name: Components page >> can be navigated to from main navigation
- Location: /home/runner/work/sandroid_dreams_astro/sandroid_dreams_astro/tests/components.spec.ts:26:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Components page', () => {
   4 |   test('loads and displays components list', async ({ page }) => {
   5 |     await page.goto('/components');
   6 |     
   7 |     // Check page title
   8 |     await expect(page).toHaveTitle('Components');
   9 |     
  10 |     // Check main heading
  11 |     await expect(page.getByRole('heading', { name: 'Components', level: 1 })).toBeVisible();
  12 |     
  13 |     // Check that the total count is displayed
  14 |     await expect(page.getByText('45 components')).toBeVisible();
  15 |     
  16 |     // Check that both component type sections are present
  17 |     await expect(page.getByRole('heading', { name: /Astro Components/, level: 2 })).toBeVisible();
  18 |     await expect(page.getByRole('heading', { name: /React \(TSX\) Components/, level: 2 })).toBeVisible();
  19 |     
  20 |     // Check specific components are listed
  21 |     await expect(page.getByRole('heading', { name: 'DummyComponent', level: 3 })).toBeVisible();
  22 |     await expect(page.getByRole('heading', { name: 'Navigator', level: 3 })).toBeVisible();
  23 |     await expect(page.getByRole('heading', { name: 'Title', level: 3 })).toBeVisible();
  24 |   });
  25 |
> 26 |   test('can be navigated to from main navigation', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  27 |     // Start from home page (redirects to photography)
  28 |     await page.goto('/');
  29 |     
  30 |     // Click Components link in navigation
  31 |     await page.getByRole('link', { name: 'Components' }).click();
  32 |     
  33 |     // Verify we're on the components page
  34 |     await expect(page).toHaveURL('/components');
  35 |     await expect(page.getByRole('heading', { name: 'Components', level: 1 })).toBeVisible();
  36 |   });
  37 | });
```