import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './e2e' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
    headless: !!process.env.CI, // Headed in dev, headless in CI
  },
  webServer: [
    {
      command: 'npx nx serve rapid-cmi5-electron-frontend',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      cwd: workspaceRoot,
    },
    {
      command: 'npx nx build rapid-cmi5-electron',
      timeout: 10000,
      reuseExistingServer: !process.env.CI,
      cwd: workspaceRoot,
    },
  ],
  projects: [
    {
      name: 'electron',
      testDir: './e2e/electron',
      use: {},
    },
    // {
    //   name: 'chromium',
    //   testDir: './e2e/web',
    //   use: { ...devices['Desktop Chrome'], headless: false, },
    // },
  ],
});