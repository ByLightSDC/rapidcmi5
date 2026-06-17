import { expect, type FrameLocator, type Page } from '@playwright/test';
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
 * Clicks Launch for the AU at `auIndex` (0-based row in the Assignable
 * Units table) and resolves to a handle on the player.
 *
 * Detects iframe vs popup by racing a popup event against the appearance
 * of a player iframe. The spike's job is to confirm which path real Moodle
 * takes; both are wired so the test passes either way and logs the shape.
 */
export async function launchAu(
  page: Page,
  auIndex = 0,
): Promise<LaunchedPlayer> {
  // `exact: true` — see gotoActivity: a substring match would also hit the
  // nav's "Toggle workplace launcher" link and open the apps grid instead.
  const launchButton = page
    .getByRole('link', { name: 'Launch', exact: true })
    .nth(auIndex);
  await expect(launchButton).toBeVisible();

  const urlBefore = page.url();

  // The cmi5 launch link opens with target=_blank, which the browser
  // realizes as a NEW PAGE on the context — not always surfaced as a
  // page-scoped 'popup' event. Listen at the context level so we catch
  // it regardless. (A prior attempt using page.waitForEvent('popup')
  // missed the tab even though it visibly opened.)
  const newPagePromise = page
    .context()
    .waitForEvent('page', { timeout: 15_000 })
    .catch(() => null);

  await launchButton.click();

  // (1) New tab / popup on the context.
  const popup = await newPagePromise;
  if (popup) {
    await popup.waitForLoadState('domcontentloaded');
    console.log(`[launchAu] new tab opened at: ${popup.url()}`);
    return { shape: 'newTab', page: popup, content: () => popup };
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
