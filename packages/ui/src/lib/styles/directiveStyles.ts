import { Theme } from '@mui/material';

/**
 * Returns a subtle drop shadow for directive block containers (tabs, accordion, etc.)
 * appropriate for the current MUI theme mode.
 *
 * Note: this shadow is only visible when no full-width background color is applied.
 * When using the box-shadow + clip-path full-width technique, clip-path erases all
 * box-shadow paint, so the drop shadow cannot be combined with a background color.
 */
export function getDirectiveBlockShadow(theme: Theme): string {
  return theme.palette.mode === 'dark'
    ? '0 2px 6px rgba(0,0,0,0.5)'
    : '0 2px 4px rgba(0,0,0,0.2)';
}
