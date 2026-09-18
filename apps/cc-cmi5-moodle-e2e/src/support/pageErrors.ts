import type { Page } from '@playwright/test';

/**
 * Collects uncaught exceptions and console errors from the player.
 *
 * WHY: the suite asserts "element X is visible" and nothing else, so a React
 * render that throws inside an error boundary — or a component that logs a
 * TypeError and bails — can leave the asserted element on screen and still be
 * a broken player. Nothing in the suite reads the console today, so those
 * failures pass silently.
 *
 * The player runs inside the launch.php IFRAME, so listeners must be attached
 * to the owning PAGE ('pageerror'/'console' fire for all frames of that page).
 *
 * Attach BEFORE the launch to catch boot-time errors.
 */

/** Errors that are pre-existing/environmental and must not fail a run. */
const IGNORED = [
  // Known intermittent launch crash tracked in the README known-issues note.
  /A is not a function/,
  // Moodle/browser noise unrelated to the player.
  /favicon/i,
  /ResizeObserver loop/i,
  /Failed to load resource/i,
];

function isIgnored(text: string): boolean {
  return IGNORED.some((re) => re.test(text));
}

export interface ErrorCollector {
  /** Everything captured so far, newest last. */
  errors: string[];
  /** Throws with the collected messages if anything was captured. */
  assertClean(): void;
}

export function collectPageErrors(page: Page): ErrorCollector {
  const errors: string[] = [];

  // Uncaught exceptions — what an error-boundary'd React crash emits.
  page.on('pageerror', (err) => {
    const text = `[pageerror] ${err.message}`;
    if (!isIgnored(text)) errors.push(text);
  });

  // console.error — components that catch-and-log instead of throwing.
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = `[console.error] ${msg.text()}`;
    if (!isIgnored(text)) errors.push(text);
  });

  return {
    errors,
    assertClean(): void {
      if (errors.length === 0) return;
      throw new Error(
        `Player reported ${errors.length} error(s):\n  ${errors.join('\n  ')}`,
      );
    },
  };
}
