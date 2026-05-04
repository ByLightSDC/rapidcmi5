import { useEffect, useRef, useState } from 'react';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';

type ResolvedThemeCSS = ReturnType<typeof resolveLessonThemeCSS>;

/**
 * Measures the gutter button group width after mount and computes the right
 * offset so buttons sit in the gutter when content width is constrained,
 * or overlap at right:0 when the directive fills the full editor width.
 *
 * Pass `blockMaxWidth` to override the lesson-theme maxWidth with a
 * block-level content width (e.g. from a `contentWidth` directive attribute).
 *
 * Usage:
 *   const { gutterRef, gutterRight } = useGutterRight(resolvedThemeCSS, blockMaxWidth);
 *   <Box ref={gutterRef} sx={{ position: 'absolute', right: gutterRight }} />
 */
export const useGutterRight = (
  resolvedThemeCSS: ResolvedThemeCSS,
  blockMaxWidth?: string | null | undefined,
) => {
  const gutterRef = useRef<HTMLDivElement>(null);
  const [gutterRight, setGutterRight] = useState('-100px');

  useEffect(() => {
    if (gutterRef.current) {
      const w = gutterRef.current.offsetWidth;
      setGutterRight(`-${w + 15}px`);
    }
  }, []);

  // When a block-level override is active, the inner box is centered within the
  // outer (full-lesson-width) box — buttons at right:0 of the outer box already
  // sit outside the inner content area, so no negative offset is needed.
  // Only push buttons into the negative gutter when the lesson theme constrains
  // width (i.e. no block override) and there's real whitespace outside the editor.
  const hasLessonGutter =
    blockMaxWidth === undefined &&
    !!resolvedThemeCSS?.maxWidth &&
    resolvedThemeCSS.maxWidth !== '100%';

  return { gutterRef, gutterRight: hasLessonGutter ? gutterRight : '0px' };
};
