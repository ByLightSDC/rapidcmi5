import { test, expect } from '../../fixtures/sandbox-fixtures';

/**
 * Smoke test for the sandbox substrate.
 *
 * Proves the sandbox-fixtures `beforeEach` (which calls `launchSandbox`)
 * lands the Visual Designer in a usable state. If this test ever fails,
 * every other test that uses the sandbox fixture will also fail — fix
 * this one first.
 */
test.describe('sandbox launch', () => {
  test('Visual Designer is mounted with the seeded course', async ({
    page,
  }) => {
    // The sandbox fixture has already navigated to / and clicked
    // Launch Sandbox in beforeEach. We just verify the post-launch UI
    // surfaces are present.
    await expect(page.getByTestId('visual-designer-drawer')).toBeVisible();

    // The seeded sandbox course has an `intro` lesson with slides. The
    // exact slide count may change, but at least one lesson should be
    // rendered in the drawer.
    await expect(page.getByText('intro', { exact: false })).toBeVisible();
  });
});
