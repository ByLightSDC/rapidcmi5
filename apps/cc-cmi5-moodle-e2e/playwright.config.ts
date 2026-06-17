import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { config as loadEnv } from 'dotenv';
import { workspaceRoot } from '@nx/devkit';
import { join } from 'node:path';

// Load repo-root env files. dotenv@10 never overwrites a var already in
// process.env, so load `.env.local` (gitignored, line 8) FIRST to give it
// precedence over `.env`, matching the convention used in this workspace.
loadEnv({ path: join(workspaceRoot, '.env.local') });
loadEnv({ path: join(workspaceRoot, '.env') });

/**
 * Moodle-launched player suite. Unlike `cc-cmi5-player-e2e`, this config
 * has **no `webServer`** — Moodle is a remote, already-running site. We
 * point Playwright at it via `MOODLE_BASE_URL` and authenticate as the
 * e2e bot account inside the browser session.
 *
 * See docs/moodle-player-e2e-strategy.md.
 */
const baseURL =
  process.env['MOODLE_BASE_URL'] ||
  'https://moodle5.develop-cp.rangeos.engineering';

const HTML_REPORT_DIR =
  '../../dist/.playwright/apps/cc-cmi5-moodle-e2e/playwright-report';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src/e2e' }),
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { open: 'never', outputFolder: HTML_REPORT_DIR }],
  ],
  // Tests share one remote Moodle course; serialize to avoid cross-test
  // interference on launch/completion state until we prove parallelism safe.
  workers: 1,
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: !!process.env.CI, // headed locally for debugging the launch flow
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
