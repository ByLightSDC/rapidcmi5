import { createContext, useEffect, useState } from 'react';
const narrowWidthBoundary = 900;

/**
 * @interface iSizingContext
 * @property {number} windowWidth Current window width
 * @property {number} windowHeight Current window height
 * @property {boolean} isNarrowWidth Whether window width is less than the narrowWidthBoundary
 */
interface iSizingContext {
  windowWidth: number;
  windowHeight: number;
  isNarrowWidth: boolean;
}
/** @constant
 * Context for Tracking Window resizing
 *  @type {React.Context<iSizingContext>}
 */
export const SizingContext = createContext<iSizingContext>(
  {} as iSizingContext,
);
/**
 * @interface tProviderProps
 * @property {*} [children] Children
 */
interface tProviderProps {
  children?: any;
}
/**
 * React context for Window Resizing
 * Tracks when window is resized
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const SizingContextProvider: any = (props: tProviderProps) => {
  const { children } = props;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  // handle resizing the browser window to hide column(s) if narrow
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  return (
    <SizingContext.Provider
      value={{
        windowWidth: windowWidth,
        windowHeight: windowHeight,
        isNarrowWidth: windowWidth < narrowWidthBoundary,
      }}
    >
      {children}
    </SizingContext.Provider>
  );
};
