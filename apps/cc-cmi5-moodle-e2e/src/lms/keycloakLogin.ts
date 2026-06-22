import { expect, type Page } from '@playwright/test';
import { moodleEnv } from '../moodle/env';

/**
 * Establishes a Keycloak browser SSO SESSION (the KEYCLOAK_SESSION cookie) for
 * the e2e bot, so that when the team-scenario player later does
 * `onLoad: 'login-required'`, Keycloak finds the session and returns a token
 * SILENTLY — no login page rendered inside the Moodle launch.php iframe.
 *
 * Why this is needed: a team scenario (teamSSOEnabled) requires interactive
 * Keycloak SSO. Launched manually it "just works" because the human already has
 * a Keycloak session cookie; in a fresh Playwright context there is none, so
 * `login-required` tries to render the Keycloak login FORM inside the iframe →
 * Keycloak refuses to be framed → "refused to connect". Logging in here first
 * (top-level, not iframed) sets the cookie and makes the later in-iframe auth
 * silent — matching the manual experience.
 *
 * We drive a real login at Keycloak's account console (a Keycloak-protected
 * page that forces the login form), as the same bot used for deploy.
 */
export async function loginToKeycloak(page: Page): Promise<void> {
  const accountUrl = `${moodleEnv.keycloakUrl.replace(/\/$/, '')}/realms/${encodeURIComponent(
    moodleEnv.keycloakRealm,
  )}/account`;

  await page.goto(accountUrl);
  await page.waitForLoadState('domcontentloaded');

  // If a session already exists, Keycloak goes straight to the account console
  // (no login form). Only fill creds if the login form is present.
  const usernameField = page.locator('#username');
  if (await usernameField.isVisible().catch(() => false)) {
    // Use the username exactly as provided (KEYCLOAK_BOT_USER). The password
    // grant proved e2e-rc5-bot@bylight.com is valid; the login form expects
    // the same. (Override KEYCLOAK_LOGIN_USERNAME if the form needs a
    // different form than the grant.)
    const formUsername =
      process.env['KEYCLOAK_LOGIN_USERNAME']?.trim() ||
      moodleEnv.keycloakBotUser;
    await usernameField.fill(formUsername);
    await page.locator('#password').fill(moodleEnv.keycloakBotPass);
    await page.locator('#kc-login, input[type="submit"], button[type="submit"]')
      .first()
      .click();
    await page.waitForLoadState('domcontentloaded');

    // A Keycloak login error re-renders the form with an alert.
    const kcError = page.locator('#input-error, .alert-error, .kc-feedback-text');
    if (await kcError.isVisible().catch(() => false)) {
      throw new Error(
        `Keycloak login failed for KEYCLOAK_BOT_USER — check creds / role. ` +
          `Message: ${await kcError.innerText().catch(() => '(unreadable)')}`,
      );
    }
  }

  // Sanity: we should now have a Keycloak session cookie for the realm host.
  const cookies = await page.context().cookies();
  const hasSession = cookies.some((c) =>
    /KEYCLOAK_SESSION|KEYCLOAK_IDENTITY|AUTH_SESSION/i.test(c.name),
  );
  expect(
    hasSession,
    'expected a Keycloak session cookie after login (team SSO needs it)',
  ).toBeTruthy();
}
