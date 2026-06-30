import { LinearProgress, LinearProgressProps } from '@mui/material';

/**
 * A thin wrapper around MUI's LinearProgress that forces `pointerEvents: 'none'`.
 *
 * This prevents NVDA from announcing the progress bar as "clickable", a false
 * positive caused by React's event delegation listener on the root element for pointer events.
 *
 * Accepts all standard LinearProgressProps. Caller `sx` props are merged and
 * preserved; `pointerEvents` is the only forced override.
 */
export const RC5LinearProgress = (props: LinearProgressProps) => {
  return (
    <LinearProgress {...props} sx={{ pointerEvents: 'none', ...props.sx }} />
  );
};
