import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// Player dev server runs at 127.0.0.1:4201 — see "Player port convention"
// in docs/moodle-player-e2e-strategy.md. Bound to IPv4 explicitly in the
// player's project.json `serve` target options so this probe matches.
const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4201';

// The Nx preset only registers the html reporter, so terminal output is sparse.
// Layer a text reporter on top so per-test pass/fail prints inline.
// `html` uses `open: 'never'` so it never auto-launches a browser
// (use `npx playwright show-report dist/.playwright/apps/cc-cmi5-player-e2e/playwright-report`
// to view it).
const HTML_REPORT_DIR =
  '../../dist/.playwright/apps/cc-cmi5-player-e2e/playwright-report';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/e2e' }),
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { open: 'never', outputFolder: HTML_REPORT_DIR }],
  ],
  // Player tests share mutable state (apps/cc-cmi5-player/src/test/config.json
  // is overwritten by `/upload-lesson-zip`). Force single-worker locally and
  // in CI until we adopt a per-test config-naming scheme. CI gets headless by
  // default; the `workers: 1` constraint applies regardless.
  workers: 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },
  webServer: {
    command: 'npx nx serve cc-cmi5-player',
    url: 'http://127.0.0.1:4201',
    // Cold webpack build can take several minutes on this monorepo. For
    // fast local iteration, run `npx nx serve cc-cmi5-player` in a separate
    // terminal first; Playwright will reuseExistingServer instantly.
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
