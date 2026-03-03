import { Cell } from '@mdxeditor/gurx';

// Drawer Types
export enum DRAWER_TYPE {
  ANIMATION = 'animation',
  BLOCK = 'block',
  STYLES = 'styles',
  NONE = 'none',
}

/**
 * Whether block lirary is open or not
 */
export const drawerMode$ = Cell<DRAWER_TYPE>(DRAWER_TYPE.NONE);
