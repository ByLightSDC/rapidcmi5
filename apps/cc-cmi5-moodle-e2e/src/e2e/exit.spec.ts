import { test, expect } from '../fixtures/moodle-course-fixture';

/**
 * Exit-flow tests — ported from cc-cmi5-player-e2e to run against a real
 * Moodle launch. Clicking the synthetic Exit tab swaps in ExitSlide
 * ("Ready to Leave?" + "Exit Course"). Under a real launch this is also
 * where the cmi5 `terminated` xAPI verb is emitted to the live LRS.
 *
 * **L3 scope:** asserts the click → exit-slide transition. (Verifying the
 * real `terminated` statement actually lands in the LRS is a richer
 * real-session test — future work now that we have a real launch.)
 *
 * ⚠️ DO NOT click the "Exit Course" BUTTON here. The `player` fixture reuses
 * one cmi5 registration across all specs (we deferred fresh-per-run
 * registrations). Clicking "Exit Course" emits the cmi5 `terminated` verb,
 * which ends that registration's session — and since specs run alphabetically,
 * every spec after `exit.spec` (launch, slide-navigation, smoke, view-*) would
 * then relaunch a TERMINATED session. We only assert the exit slide RENDERS
 * (incl. that the button is present); we never fire it. If a real-termination
 * test is added later, it needs an isolated registration.
 */

test.describe('exit @navigation', () => {
  test('clicking the Exit tab activates the exit slide', async ({ player }) => {
    // From a real slide, the exit-slide content should not exist yet.
    await player.getByTestId('player-slide-tab-0').click();
    await expect(player.getByTestId('player-exit-slide')).toHaveCount(0);

    await player.getByTestId('player-exit-tab').click();

    const exitSlide = player.getByTestId('player-exit-slide');
    await expect(exitSlide).toBeVisible({ timeout: 10_000 });
    await expect(exitSlide.getByText('Ready to Leave?')).toBeVisible();
    await expect(
      exitSlide.getByRole('button', { name: /Exit Course/ }),
    ).toBeVisible();
  });

  test('Exit tab is reachable from the last real slide', async ({ player }) => {
    // Walk to the last real slide (Goodbye = index 8 in the 9-slide course)
    // then Exit — catches state-leakage bugs where Exit is disabled after
    // navigation.
    await player.getByTestId('player-slide-tab-8').click();
    await expect(player.getByTestId('player-slide-tab-8')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await player.getByTestId('player-exit-tab').click();
    await expect(player.getByTestId('player-exit-slide')).toBeVisible();
  });
});
