import { useEffect, useRef, useState } from 'react';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';

type ResolvedThemeCSS = ReturnType<typeof resolveLessonThemeCSS>;

/**
 * Measures the gutter button group width after mount and computes the right
 * offset so buttons sit in the gutter when content width is constrained,
 * or overlap at right:0 when the directive fills the full editor width.
 *
 * Usage:
 *   const { gutterRef, gutterRight } = useGutterRight(resolvedThemeCSS);
 *   <Box ref={gutterRef} sx={{ position: 'absolute', right: gutterRight }} />
 */
export const useGutterRight = (
  resolvedThemeCSS: ResolvedThemeCSS,
) => {
  const gutterRef = useRef<HTMLDivElement>(null);
  const [gutterRight, setGutterRight] = useState('-100px');

  useEffect(() => {
    if (gutterRef.current) {
      const w = gutterRef.current.offsetWidth;
      setGutterRight(`-${w + 15}px`);
    }
  }, []);

  const hasGutter =
    !!resolvedThemeCSS?.maxWidth && resolvedThemeCSS.maxWidth !== '100%';

  return { gutterRef, gutterRight: hasGutter ? gutterRight : '0px' };
};
