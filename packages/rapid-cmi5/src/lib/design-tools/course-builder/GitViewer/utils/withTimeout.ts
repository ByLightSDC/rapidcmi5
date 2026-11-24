/**
 * Browser storage APIs (IndexedDB, File System Access) can stall without ever
 * resolving or rejecting — e.g. after a Chrome update changes handle semantics.
 * Without a bound, a stalled call leaves the UI behind a permanent spinner and
 * nothing in the console. These helpers turn a stall into a named error and
 * warn about slow steps so the culprit is identifiable from the console.
 */

export class StepTimeoutError extends Error {
  constructor(
    public readonly step: string,
    public readonly ms: number,
  ) {
    super(`Timed out after ${Math.round(ms / 1000)}s waiting for: ${step}`);
    this.name = 'StepTimeoutError';
  }
}

const SLOW_STEP_WARN_MS = 2000;

/**
 * Rejects with StepTimeoutError if `promise` has not settled within `ms`.
 * The underlying work is not cancelled (browser storage calls can't be).
 * Never wrap anything that waits on the user (pickers, permission prompts).
 */
export function withTimeout<T>(
  step: string,
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  const started = performance.now();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      console.warn(`[rc5] stalled: "${step}" did not finish within ${ms}ms`);
      reject(new StepTimeoutError(step, ms));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
    const elapsed = performance.now() - started;
    if (elapsed >= SLOW_STEP_WARN_MS && elapsed < ms) {
      console.warn(`[rc5] slow: "${step}" took ${Math.round(elapsed)}ms`);
    }
  });
}

/** Like withTimeout, but resolves to `fallback` instead of rejecting. */
export async function withTimeoutOr<T>(
  step: string,
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  try {
    return await withTimeout(step, promise, ms);
  } catch (error) {
    if (error instanceof StepTimeoutError) return fallback;
    throw error;
  }
}
