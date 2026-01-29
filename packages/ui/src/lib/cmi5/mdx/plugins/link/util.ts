import { RectData } from '@mdxeditor/editor';

/**
 * Virtual element for positioning MUI Popper
 */
export const getVirtualElement = (theRect: RectData) => {
  return {
    getBoundingClientRect: (): DOMRect => ({
      top: theRect.top + 20,
      left: theRect.left,
      bottom: theRect.top + 100,
      right: theRect.left + 400,
      width: 0,
      height: 0,
      x: theRect.left,
      y: theRect.top,
      toJSON: () => {
        return false;
      },
    }),
  };
};
