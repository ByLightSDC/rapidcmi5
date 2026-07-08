import { useEffect } from 'react';
import { RefObject } from 'react';
import { useCellValues } from '@mdxeditor/gurx';
import { editorInPlayback$ } from '../../state/vars';

// Custom hook to fix NVDA announcing Lexical decorator React portals as clickable.
// Walks up the DOM from the provided ref to find the Lexical decorator span
// (identified by data-lexical-decorator) and sets role="presentation" on it.
export function usePlaybackDecoratorFix(ref: RefObject<HTMLElement | null>) {
  const [isPlayback] = useCellValues(editorInPlayback$);

  useEffect(() => {
    if (!isPlayback || !ref.current) return;
    let el: HTMLElement | null = ref.current;
    while (el && !el.hasAttribute('data-lexical-decorator')) {
      el = el.parentElement;
    }
    if (el) el.setAttribute('role', 'presentation');
  }, [isPlayback, ref]);
}
