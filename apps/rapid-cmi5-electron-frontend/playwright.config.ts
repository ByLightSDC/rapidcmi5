import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// The frontend `serve` target binds to 127.0.0.1 (set in project.json) so the
// IPv4 probe below works on Windows, where webpack-dev-server otherwise
// defaults to IPv6-only and Playwright's IPv4 probe misses it.
const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4200';

// PW_PROJECT lets the chromium-only CI job skip the slow electron build step.
// Set `PW_PROJECT=chromium` to start only the frontend dev server.
const skipElectronBuild = process.env.PW_PROJECT === 'chromium';

const webServer = [
  {
    command: 'npx nx serve rapid-cmi5-electron-frontend',
    url: 'http://127.0.0.1:4200',
    // Cold webpack build of this app routinely exceeds Playwright's
    // 60s default (and even 5 min). For fast iteration, run
    // `npm run nxe:serve:frontend` in a separate terminal first;
    // Playwright will then reuseExistingServer instantly. This
    // 10-minute deadline is a safety net for cold CI runs only.
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
  },
  ...(skipElectronBuild
    ? []
    : [
        {
          command: 'npx nx build rapid-cmi5-electron',
          timeout: 10000,
          reuseExistingServer: !process.env.CI,
          cwd: workspaceRoot,
        },
      ]),
];

// The Nx preset only registers the html reporter, so terminal output is sparse.
// Layer a text reporter on top so per-test pass/fail prints inline.
// `html` uses `open: 'never'` so it never auto-launches a browser
// (use `npm run nxe:e2e:report` to view it).
const HTML_REPORT_DIR =
  '../../dist/.playwright/apps/rapid-cmi5-electron-frontend/playwright-report';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './e2e' }),
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { open: 'never', outputFolder: HTML_REPORT_DIR }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: !!process.env.CI, // Headed in dev, headless in CI
  },
  webServer,
  projects: [
    {
      name: 'chromium',
      testDir: './e2e/web',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'electron',
      testDir: './e2e/electron',
      use: {},
    },
  ],
});