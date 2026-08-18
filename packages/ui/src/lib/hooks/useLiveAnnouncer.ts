import { useCallback, useRef } from 'react';

/**
 * Drives an ARIA live region (paired with `LiveStatusRegion`) for announcing
 * text to screen readers. Writes directly to the DOM node rather than through
 * React state so that announcing the same message twice in a row still
 * triggers a fresh announcement — screen readers otherwise dedupe live-region
 * content that hasn't changed.
 */
export const useLiveAnnouncer = () => {
  const ref = useRef<HTMLSpanElement>(null);

  const announce = useCallback((message: string) => {
    const node = ref.current;
    if (!node) {
      return;
    }
    node.textContent = '';
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.textContent = message;
      }
    });
  }, []);

  return { ref, announce };
};
