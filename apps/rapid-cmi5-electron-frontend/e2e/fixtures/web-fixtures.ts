import { test as base, expect } from '@playwright/test';

/**
 * Custom Playwright test fixture for the web (chromium) e2e suite.
 *
 * Why this exists: by default the app's auth bootstrap (`keycloak-js`)
 * redirects to the production Keycloak instance on first page load, which
 * rejects the 127.0.0.1:4200 redirect_uri and breaks any test that calls
 * `page.goto('/')`. The env-resolver in
 * packages/ui/src/lib/environments/FrontendEnvironment.env.ts treats
 * `window._env_.NX_PUBLIC_KEYCLOAK_URL = ''` as "SSO disabled," and
 * `AuthContext.tsx` short-circuits Keycloak in that branch.
 *
 * This fixture overrides the base `test` so every test that imports from
 * here gets the bypass automatically — no per-test setup boilerplate.
 *
 * To run a single test without the bypass (e.g. to verify the auth flow
 * itself), import `test` directly from `@playwright/test` instead.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      const existing = (window as unknown as { _env_?: Record<string, unknown> })
        ._env_ ?? {};
      (window as unknown as { _env_: Record<string, unknown> })._env_ = {
        ...existing,
        // Empty string is deliberate: defined-but-empty signals
        // `ssoEnabled: false` to UserConfigContext.tsx.
        NX_PUBLIC_KEYCLOAK_URL: '',
        NX_PUBLIC_KEYCLOAK_REALM: '',
        NX_PUBLIC_KEYCLOAK_CLIENT_ID: '',
        NX_PUBLIC_KEYCLOAK_SCOPE: '',
      };
    });
    await use(page);
  },
});

export { expect };
