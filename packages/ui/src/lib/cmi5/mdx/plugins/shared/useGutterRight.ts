import { useEffect, useRef, useState } from 'react';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';

type ResolvedThemeCSS = ReturnType<typeof resolveLessonThemeCSS>;

/**
 * Measures the gutter button group width and computes the right offset so
 * buttons sit in the gutter when content width is constrained, or fall back
 * to right:0 when the directive fills the full editor width or the window is
 * too narrow to fit the buttons outside the block.
 *
 * Uses a ResizeObserver on the parent container so the offset stays correct
 * when the window is resized (fixes Medium/Small lesson width edge case where
 * the gutter shrinks below the button group width at narrow viewports).
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

  // Keep a ref so the ResizeObserver closure always sees the latest maxWidth
  // without needing to re-register the observer on every render.
  const maxWidthRef = useRef(resolvedThemeCSS?.maxWidth);
  maxWidthRef.current = resolvedThemeCSS?.maxWidth;

  useEffect(() => {
    const el = gutterRef.current;
    if (!el) return;

    const measure = () => {
      const buttonWidth = el.offsetWidth;
      const parent = el.parentElement;
      if (!parent) {
        setGutterRight(`-${buttonWidth + 15}px`);
        return;
      }

      // Available gutter = space to the right of the constrained content block.
      // parent is the outer Box (full decorator width); the inner content box is
      // centered, so gutter on each side = (parentWidth - contentWidth) / 2.
      // maxWidth is a percentage string like '75%' or '55%'.
      const parentWidth = parent.offsetWidth;
      const mw = maxWidthRef.current;
      const contentFraction = mw && mw.endsWith('%') ? parseFloat(mw) / 100 : 1;
      const availableGutter = (parentWidth * (1 - contentFraction)) / 2;

      if (availableGutter >= buttonWidth + 10) {
        setGutterRight(`-${buttonWidth + 15}px`);
      } else {
        setGutterRight('0px');
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.parentElement!);
    return () => ro.disconnect();
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
