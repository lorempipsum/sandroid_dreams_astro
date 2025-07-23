# Test info

- Name: Navigator page >> shows input and buttons
- Location: /home/runner/work/sandroid_dreams_astro/sandroid_dreams_astro/tests/navigator.spec.ts:4:3

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
   3 | test.describe('Navigator page', () => {
>  4 |   test('shows input and buttons', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
   5 |     await page.goto('/experiments/navigator');
   6 |     await expect(page.getByPlaceholder('lat,lng')).toBeVisible();
   7 |     await expect(page.getByRole('button', { name: 'GO' })).toBeVisible();
   8 |     await expect(
   9 |       page.getByRole('button', { name: 'Enable Compass' })
  10 |     ).toBeVisible();
  11 |   });
  12 | });
  13 |
```