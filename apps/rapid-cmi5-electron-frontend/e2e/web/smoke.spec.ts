import { test, expect } from '@playwright/test';

// Infrastructure smoke test for the chromium e2e project.
//
// Deliberately does NOT call `page.goto('/')` — that triggers the app's
// Keycloak redirect, which fails with "Invalid parameter: redirect_uri"
// against 127.0.0.1:4200 (see e2e.spec.ts FIXME). Instead this probes a
// static asset served directly by webpack-dev-server, proving:
//   - Playwright can launch chromium
//   - The dev server is reachable on the configured baseURL
//   - The reporters / HTML report wiring is functioning end-to-end
//
// Once the Keycloak bypass is in place, this test can stay as a sanity
// check or be removed if e2e.spec.ts covers the same ground.
test.describe('infra smoke', () => {
  test('dev server responds with an HTML page on root', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body.toLowerCase()).toContain('<html');
  });
});
