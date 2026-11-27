import { defineConfig } from '@playwright/test';

// Deliberately independent of the Electron suite: no Electron build or launch.
const baseURL = process.env.BASE_URL || 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e/local-fs',
  outputDir: '../../dist/.playwright/local-fs/results',
  reporter: [
    ['list'],
    [
      'html',
      { outputFolder: '../../dist/.playwright/local-fs/report', open: 'never' },
    ],
  ],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: { baseURL, headless: !!process.env.CI },
  webServer: {
    command: 'npx nx serve rapid-cmi5-electron-frontend',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: process.env.LOCAL_FS_CHANNEL || 'chrome' }],
});
