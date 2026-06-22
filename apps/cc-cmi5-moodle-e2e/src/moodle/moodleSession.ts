import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';
import { moodleEnv } from './env';

/**
 * Drives a real Moodle browser session: log in as the bot, open a cmi5
 * activity, and launch an AU. Selectors here target stock Moodle 4.x/5.x
 * markup; if the theme (RangeOS) overrides them, adjust in one place.
 *
 * The launch shape (iframe vs popup) is confirmed by the spike — see
 * `launchAu`, which handles both and reports which it found.
 */

/** Logs in via Moodle's standard `/login/index.php` form. */
export async function login(page: Page): Promise<void> {
  await page.goto('/login/index.php');
  await page.waitForLoadState('domcontentloaded');

  // Stock Moodle login form field ids.
  await page.locator('#username').fill(moodleEnv.botUser);
  await page.locator('#password').fill(moodleEnv.botPass);
  await page.locator('#loginbtn').click();

  await page.waitForLoadState('domcontentloaded');

  // If login failed Moodle re-renders the form with an error banner.
  const loginError = page.locator('#loginerrormessage');
  if (await loginError.isVisible().catch(() => false)) {
    throw new Error(
      `Moodle login failed for MOODLE_BOT_USER — check credentials. ` +
        `Banner: ${await loginError.innerText().catch(() => '(unreadable)')}`,
    );
  }

  // Authenticated pages expose a "User menu" button (the avatar dropdown)
  // and the Dashboard/My courses menubar. These role/name-based locators
  // are theme-resilient — confirmed against the RangeOS theme's snapshot,
  // where the button is labeled "User menu" and carries the bot's avatar.
  await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible({
    timeout: 15_000,
  });
}

/** Navigates to the cmi5 activity page (`mod/cmi5/view.php?id=`). */
export async function gotoActivity(
  page: Page,
  activityId: string = moodleEnv.activityId,
): Promise<void> {
  await page.goto(`/mod/cmi5/view.php?id=${encodeURIComponent(activityId)}`);
  await page.waitForLoadState('domcontentloaded');

  // The Assignable Units table renders each AU's launch as a *link*
  // (role=link, text "Launch", href=.../mod/cmi5/launch.php?id=..&auid=..),
  // not a button. Its presence confirms a real cmi5 activity page.
  // NOTE: `exact: true` is essential — without it, getByRole name-matches
  // by substring and also picks up the nav's "Toggle workplace launcher"
  // link (contains "launch"), which steals the click and opens the apps grid.
  await expect(page.getByRole('link', { name: 'Launch', exact: true }).first())
    .toBeVisible({ timeout: 15_000 });
}

/**
 * Result of a launch: a unified handle to the player, regardless of how
 * Moodle surfaced it.
 *
 * Observed shape (RangeOS Moodle, spike): the Launch link navigates the
 * SAME tab to `mod/cmi5/launch.php`, which renders the player in that tab
 * (`shape: 'sameTab'`). The iframe and new-tab branches remain wired in
 * case other launch configs differ.
 *
 * `content()` returns the locator scope to query the player with — player
 * locators resolve inside it unchanged whether it's a Page or a FrameLocator.
 */
export interface LaunchedPlayer {
  shape: 'iframe' | 'newTab' | 'sameTab';
  frame?: FrameLocator;
  /** The player Page (same-tab nav or new tab). */
  page?: Page;
  content(): FrameLocator | Page;
}

/**
 * Clicks Launch for the AU whose name matches `auName` in the Assignable
 * Units table and resolves to a handle on the player.
 *
 * The e2e course has multiple AUs (Media:Basic / Scenario:Individual /
 * Scenario:Class / Components:Basic / Quiz:Basic), each a row in the table
 * with its own Launch link. We target by NAME (the AU's row) rather than by
 * index so test intent is explicit and order-independent.
 */
export async function launchAu(
  page: Page,
  auName: string,
): Promise<LaunchedPlayer> {
  // Scope to the table row containing the AU name, then its Launch link.
  // `exact: true` on "Launch" — a substring match would also hit the nav's
  // "Toggle workplace launcher" link and open the apps grid instead.
  const row = page.getByRole('row', { name: new RegExp(escapeRegExp(auName)) });
  const launchButton = row.getByRole('link', { name: 'Launch', exact: true });
  await expect(launchButton).toBeVisible({ timeout: 15_000 });

  return clickAndResolvePlayer(page, launchButton);
}

/** Escapes a string for safe use inside a RegExp (AU names contain ':'). */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Clicks a Launch link and resolves the launched player, handling the three
 * shapes Moodle may use (new tab / same-tab nav to launch.php with an iframe /
 * injected iframe). Confirmed shape for RangeOS Moodle: sameTab + iframe.
 */
async function clickAndResolvePlayer(
  page: Page,
  launchButton: Locator,
): Promise<LaunchedPlayer> {
  const urlBefore = page.url();

  // The cmi5 launch link opens with target=_blank, which the browser
  // realizes as a NEW PAGE on the context — not always surfaced as a
  // page-scoped 'popup' event. Listen at the context level so we catch
  // it regardless. (A prior attempt using page.waitForEvent('popup')
  // missed the tab even though it visibly opened.)
  const newPagePromise = page
    .context()
    .waitForEvent('page', { timeout: 8_000 })
    .catch(() => null);

  await launchButton.click();

  // (1) New tab / popup on the context.
  const popup = await newPagePromise;
  if (popup) {
    await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
    console.log(`[launchAu] new tab opened at: ${popup.url()}`);
    // A team-SSO launch may briefly open a Keycloak auth popup that then closes
    // / redirects; that's NOT the player. Only treat a popup as the player if
    // it's the cmi5 launch (launch.php). Otherwise fall through to same-tab.
    if (/mod\/cmi5\/launch\.php/i.test(popup.url())) {
      return { shape: 'newTab', page: popup, content: () => popup };
    }
    console.log(
      `[launchAu] popup is not the player (${popup.url()}); using same-tab/iframe`,
    );
  }

  // (2) Same-tab navigation — RangeOS Moodle's actual behavior: the tab
  //     navigates to launch.php, which then EMBEDS the player in an
  //     <iframe>. So the player content is one frame down — content() must
  //     return the FrameLocator, not the top page (querying the page finds
  //     only Moodle chrome, never the player's tabs).
  await page
    .waitForURL((url) => url.href !== urlBefore, { timeout: 5_000 })
    .catch(() => undefined);
  if (page.url() !== urlBefore) {
    await page.waitForLoadState('domcontentloaded');
    console.log(`[launchAu] same-tab navigation to: ${page.url()}`);

    const iframeEl = page.locator('iframe').first();
    await expect(iframeEl).toBeVisible({ timeout: 15_000 });
    const frame = page.frameLocator('iframe');
    console.log('[launchAu] player is embedded in an iframe on launch.php');
    return { shape: 'sameTab', page, frame, content: () => frame };
  }

  // (3) Iframe injected into the current page without navigation.
  const iframeCount = await page.locator('iframe').count();
  console.log(
    `[launchAu] no popup, no navigation; iframes on page: ${iframeCount}`,
  );
  const iframeEl = page.locator('iframe').first();
  await expect(iframeEl).toBeVisible({ timeout: 15_000 });
  const frame = page.frameLocator('iframe');
  return { shape: 'iframe', frame, content: () => frame };
}
