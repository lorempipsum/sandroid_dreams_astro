import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'npm run dev',
    port: 4321,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
