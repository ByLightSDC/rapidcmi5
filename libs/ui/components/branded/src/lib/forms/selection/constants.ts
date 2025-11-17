/** @constant
 * Default number of rows per page
 * @type {number}
 * @default
 */
export const rowsPerPageDefault = 100;

/** @constant
 * Default options for number of rows to display per page
 * @type {any[]}
 * @default
 */
export const rowsPerPageOptionsDefault = [
  100,
  500,
  1000,
  { value: -1, label: 'All' },
];

/** @constant
 * Special case "button action" to force adding bookmark
 */
export const addBookmarkButtonId = 100;
