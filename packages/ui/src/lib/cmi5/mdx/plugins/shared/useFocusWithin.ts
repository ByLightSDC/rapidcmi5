import { useCallback, useRef, useState } from 'react';

export const useFocusWithin = <T extends HTMLElement>() => {
  const [isFocused, setIsFocused] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((node: T | null) => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!node) {
      setIsFocused(false);
      return;
    }

    const handleFocusIn = () => setIsFocused(true);
    const handleFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget;
      if (!(next instanceof Node) || !node.contains(next)) {
        setIsFocused(false);
      }
    };

    node.addEventListener('focusin', handleFocusIn);
    node.addEventListener('focusout', handleFocusOut);

    cleanupRef.current = () => {
      node.removeEventListener('focusin', handleFocusIn);
      node.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { isFocused, ref };
};
