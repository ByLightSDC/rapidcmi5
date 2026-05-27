import { test, expect } from '@playwright/test';

/**
 * Player infrastructure smoke test.
 *
 * Proves the Playwright wiring against the player dev server works
 * end-to-end without depending on any fixture upload. Just:
 *   - dev server responding on :4201
 *   - player bundle loads
 *   - player renders *something* — whatever's currently in
 *     apps/cc-cmi5-player/src/test/config.json
 *
 * **Layer (L3) discipline:** this is a wiring sanity check, not a
 * content assertion. Once we start uploading per-test fixtures, the
 * directive-specific specs will assert on actual rendered content.
 *
 * Launch params (`endpoint`, `fetch`, `actor`, `activityId`,
 * `registration`) mirror what Moodle's CMI5 plugin would supply. Stubbed
 * to "test" so the player accepts them but doesn't try to reach a real
 * LRS during the smoke.
 */

const LAUNCH_PARAMS =
  '?endpoint=test&fetch=test&actor=test&activityId=test&registration=test';

test.describe('player smoke', () => {
  test('player serves and renders content with synthetic CMI5 launch params', async ({
    page,
  }) => {
    await page.goto(`/${LAUNCH_PARAMS}`);
    await page.waitForLoadState('domcontentloaded');

    // Verify the page actually loaded (not blank, not an error page).
    await expect(page.locator('body')).toBeVisible();

    // The player's title isn't strict, but it should be non-empty.
    const title = await page.title();
    expect(title).toBeTruthy();

    // Sanity: a player root element should exist. The player's main.tsx
    // mounts into #root (standard React entry).
    const root = page.locator('#root');
    await expect(root).toBeAttached();

    // Smoke for actual rendering: the root should contain *something*
    // (any text or any child element). If the bundle crashed on load,
    // #root would be empty.
    const childCount = await root.locator('*').count();
    expect(childCount).toBeGreaterThan(0);
  });
});
