/**
 * Converts a camelCase or kebab-case string to Title Case for display.
 *
 * Example:
 *   freeResponse        → Free Response
 */
export const toTitleCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, ' $1') // split camelCase
    .replace(/-/g, ' ') // split kebab-case
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize each word
    .trim();
