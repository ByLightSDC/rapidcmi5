import type { FrameLocator, Page } from '@playwright/test';

/**
 * Dismisses the "Unit passed" / "Unit complete" modal.
 */
export async function dismissUnitResultDialog(
  player: FrameLocator | Page,
  choice: 'review' | 'exit' = 'review',
  timeout = 3_000,
): Promise<boolean> {
  const dialog = player.getByTestId('unit-result-dialog');

  try {
    await dialog.waitFor({ state: 'visible', timeout });
  } catch {
    return false; // not shown — nothing to dismiss
  }

  const label = choice === 'exit' ? 'Continue to exit' : 'Keep reviewing';
  await dialog.getByRole('button', { name: label }).click();
  await dialog.waitFor({ state: 'hidden', timeout: 5_000 });
  return true;
}

/**
 * True if the unit-result modal is currently covering the player.
 *
 * Useful as a guard in specs that must not be interrupted, without paying the
 * wait that `dismissUnitResultDialog` does.
 */
export async function isUnitResultDialogOpen(
  player: FrameLocator | Page,
): Promise<boolean> {
  return player
    .getByTestId('unit-result-dialog')
    .isVisible()
    .catch(() => false);
}
