/**
 * Shared layout constants for directive editor components (Tabs, Accordion, etc.)
 * that use the flex-row gutter button pattern.
 */

/** CSS custom property name for the computed left/right content margin width.
 *  Set on the lesson theme scoped class; inherited by all directive editors. */
export const DIRECTIVE_CONTENT_MARGIN_VAR = '--content-margin';

/** Gap between the directive content box and the gutter button group */
export const DIRECTIVE_GUTTER_GAP = '10px';

/** Right padding on the outer flex box to keep gutter buttons from touching the viewport edge */
export const DIRECTIVE_GUTTER_PADDING_RIGHT = '20px';

/** MUI elevation for the inner content box when a background color is set */
export const DIRECTIVE_INNER_BOX_SHADOW = 6;

/** Default min-height for tab content nested editors so empty tabs have visible click area */
export const TAB_CONTENT_MIN_HEIGHT = '180px';
