import type { FrameLocator, Page } from '@playwright/test';
import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Progress bar tests — the player chrome, not slide content.
 *
 * WHY THIS FILE EXISTS: a hardcoded `value={80} //{auProgress}` debug stub
 * slipped through. Tests passed.
 *
 * ⚠️ PROGRESS IS STICKY ACROSS RUNS. global-setup calls
 * `mod_cmi5_reset_registration_state`, which clears the Moodle registration
 * but NOT the xAPI State document the player reads on launch
 * (`getCourseAUProgressFromLRS`). A completed AU therefore restores at 100%
 * even right after a reset, and stays that way for every later run. That is
 * why the "fresh registration at 0%" test is fixme'd below — assert progress
 * REACHES a value, never that it STARTS at one.
 *
 * ⚠️ NOT ALL SLIDES AUTO-COMPLETE. AuManager gates progress per slide
 * (AuManager.tsx ~line 471): a slide whose content contains `:::quiz`,
 * `:::ctf`, `:::codeRunner`, `:::consoles` or `:::scenario` is launched with
 * `makeProgress = false` and stays incomplete until the ACTIVITY reports to
 * the LRS. Only activity-free content slides complete on view. So:
 *   - Components:Basic / Media:Basic → navigation alone reaches 100%
 *   - Quiz:Basic / Scenario:* → 100% requires completing the activity
 * Any progress test must pick its AU accordingly.
 *
 * ⚠️ THE EXIT TAB IS THE SETTLE POINT. Navigating to Exit does not itself
 * record progress (AuManager returns early when activeTab === slides.length),
 * but arriving there means every content slide has been left, which is when
 * their completion has flushed. Confirmed manually: Components:Basic shows
 * 100% on the Exit slide.
 */

/** Reads the machine-readable progress value off the chrome. */
async function readProgress(player: FrameLocator | Page): Promise<number> {
  const raw = await player
    .getByTestId('player-progress-bar')
    .getAttribute('data-progress');
  return Number(raw ?? NaN);
}

test.describe('player progress bar @chrome', () => {
  test.use({ auName: 'Components:Basic' });

  test('renders with an accessible determinate bar', async ({ player }) => {
    const bar = player.getByTestId('player-progress-bar');
    await expect(bar).toBeVisible({ timeout: 15_000 });

    // MUI maps `value` onto aria-valuenow for variant="determinate".
    const inner = player.getByLabel('Course Progress');
    await expect(inner).toHaveAttribute('aria-valuenow', /^\d+$/);
  });

  /**
   * DISABLED — cannot be made reliable with the current reset mechanism.
   *
   * `mod_cmi5_reset_registration_state` clears the Moodle-side registration
   * (sessions/au_status/statements) but does NOT clear the **xAPI State
   * document** in the LRS. `getCourseAUProgressFromLRS` reads that State doc
   * on launch, so a completed AU restores as `auProgress: 100` even
   * immediately after a reset.
   *
   * Observed: globalSetup reset at 16:05:55, player restored
   * `auProgress: 100` at 16:05:56 from a State doc written 16:02:57.
   *
   * Worse, this test can only be honest as the FIRST launch of a never-
   * completed AU — but every other test in this file completes that same AU,
   * and the State doc persists across runs. So it passes once and then fails
   * forever after.
   *
   * To re-enable, one of:
   *   1. clear the State doc directly (xAPI DELETE on the activity/agent
   *      state) in global-setup, alongside the registration reset; or
   *   2. point this test at an AU no other test touches.
   *
   * Tracked with the progress-contract notes.
   */
  test.fixme('starts a fresh registration at 0%', async ({ player }) => {
    await expect(player.getByTestId('player-progress-bar')).toHaveAttribute(
      'data-progress',
      '0',
      { timeout: 20_000 },
    );
    await expect(player.getByTestId('player-progress-label')).toHaveText('0%');
  });

  test('label and bar value stay in sync', async ({ player }) => {
    await expect(player.getByTestId('player-progress-bar')).toBeVisible({
      timeout: 15_000,
    });

    const value = await readProgress(player);
    expect(Number.isNaN(value)).toBe(false);
    await expect(player.getByTestId('player-progress-label')).toHaveText(
      `${value}%`,
    );
  });

  /**
   * Progress contract, derived from source (CourseAUProgressHelpers.ts):
   *   auProgress = (passedSlides + activitiesMeetingCriteria)
   *                / totalProgressSteps * 100
   *   totalProgressSteps = slides.length + gradableActivities
   * and for a slide with NO activities (getSlideChangedStatus):
   *   slideStatus.passed = slideStatus.viewed   ← viewing IS completing
   *
   * So on a content-only AU, viewing every slide must reach exactly 100%.
   *
   * NOTE ON AU CHOICE: this walks the slide NAV, which contains a trailing
   * "Exit" tab that is NOT a slide (Components:Basic logs totalSlides:1 but
   * renders 2 tabs). Clicking Exit navigates to "Ready to Leave?" and records
   * nothing, so the nav count must NOT be used as the slide count — filter it
   * out, or a 1-slide AU looks like a 2-slide AU stuck at 0%.
   */
  /**
   * Mirrors the manual flow that is known-good: visit every content slide,
   * then navigate to Exit. Exit records nothing itself, but landing on it
   * means every content slide has been left and flushed.
   *
   * Components:Basic is activity-free, so navigation alone must reach 100%.
   */
  test('reaches 100% after viewing every content slide', async ({ player }) => {
    await expect(player.getByTestId('player-progress-bar')).toBeVisible({
      timeout: 15_000,
    });

    const tabs = player.getByTestId('player-slide-nav').getByRole('tab');
    const total = await tabs.count();
    expect(total, 'nav exposed no tabs').toBeGreaterThan(0);

    // Identify the Exit tab by name; everything else is a content slide.
    const names: string[] = [];
    for (let i = 0; i < total; i++) {
      names.push(((await tabs.nth(i).textContent()) ?? '').trim());
    }
    const exitIdx = names.findIndex((n) => n.toLowerCase() === 'exit');
    const contentIdx = names.map((_, i) => i).filter((i) => i !== exitIdx);

    expect(contentIdx.length, 'AU exposed no content slides').toBeGreaterThan(
      0,
    );

    // Visit each content slide. The slide the player LAUNCHED on is already
    // active, so clicking it dispatches an unchanged activeTab and does not
    // re-run the progress effect — that slide is credited by the launch
    // itself, once AuManager's readiness flags flip true.
    for (const i of contentIdx) {
      await tabs.nth(i).click();
      await expect(player.getByTestId('player-slide-content')).toBeVisible();
    }

    // Land on Exit to settle, exactly as the manual repro does.
    if (exitIdx !== -1) {
      await tabs.nth(exitIdx).click();
    }

    await expect
      .poll(() => readProgress(player), { timeout: 30_000 })
      .toBe(100);
  });

  test('launches without console errors or uncaught exceptions', async ({
    player,
    playerErrors,
  }) => {
    await expect(player.getByTestId('player-slide-content')).toBeVisible({
      timeout: 20_000,
    });
    playerErrors.assertClean();
  });
});
