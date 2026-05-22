import { test } from '../../fixtures/sandbox-fixtures';

/**
 * Recorder stub. Not a real test — it's a hook for Playwright Codegen
 * pre-loaded with our Keycloak bypass + Sandbox launch.
 *
 * Run with:
 *
 *   npm run nxe:e2e:record
 *
 * Playwright will launch a real Chromium window already sitting inside
 * the Visual Designer with the sandbox course mounted. The inspector
 * opens beside it with a Record button. Click Record, do actions in the
 * browser, copy the generated code, paste it into a real `.spec.ts`
 * file under `e2e/web/sandbox/`.
 *
 * Tagged `@recording` so it never runs in default `e2e:chromium` runs —
 * see project.json `grepInvert`.
 *
 * Filename starts with `_` so it sorts to the top of the directory
 * listing and obviously isn't a real spec.
 */
test('recording stub @recording', async ({ page }) => {
  await page.pause();
});
