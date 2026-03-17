import { Cell } from '@mdxeditor/gurx';

// Drawer Types
export enum DRAWER_TYPE {
  ANIMATION = 'animation',
  BLOCK = 'block',
  STYLES = 'styles',
  NONE = 'none',
}

/**
 * Whether block library is open or not
 */
export const drawerMode$ = Cell<DRAWER_TYPE>(DRAWER_TYPE.NONE);

/**
 * Per-panel show-request counters. Each increments independently when its
 * toolbar button is clicked, so drawers never trigger each other's re-show.
 */
export const blockShowSeq$ = Cell<number>(0);
export const stylesShowSeq$ = Cell<number>(0);
export const animationShowSeq$ = Cell<number>(0);
