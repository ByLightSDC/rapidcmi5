export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const body = (error as { body?: unknown }).body;
    if (typeof body === 'string') return body;
    if (body && typeof body === 'object') {
      const message = (body as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') return `Request failed (status ${status}).`;
  }
  return 'An unexpected error occurred.';
}
