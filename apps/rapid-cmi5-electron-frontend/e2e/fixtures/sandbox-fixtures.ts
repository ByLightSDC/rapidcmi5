import { test as baseTest, expect } from './web-fixtures';
import { launchSandbox } from '../e2e-utils';

/**
 * Playwright test fixture that auto-launches the in-app Sandbox before
 * every test. Tests start with the Visual Designer already mounted on
 * the seeded sandbox course — no Production Mode, no filesystem setup,
 * no repo creation.
 *
 * This is the preferred substrate for the bulk of UI / directive /
 * lesson-theme regression tests. It's fast (~1–2s startup per test),
 * deterministic (the sandbox course state is identical every run), and
 * never touches the filesystem.
 *
 * Inherits the Keycloak bypass from `web-fixtures` (so Keycloak never
 * redirects during sandbox launch).
 *
 * To skip the auto-launch — for example, to verify the launch screen
 * itself or to test a Production Mode flow — import the `test` from
 * `web-fixtures` directly.
 *
 * Example:
 * ```ts
 * import { test, expect } from '../../fixtures/sandbox-fixtures';
 *
 * test('directive insertion adds a tabs block', async ({ page }) => {
 *   // page is already on the Visual Designer at intro/Slide 1
 *   await page.getByTestId('insert-tabs').click();
 *   // ...
 * });
 * ```
 */
export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await launchSandbox(page);
    await use(page);
  },
});

export { expect };
