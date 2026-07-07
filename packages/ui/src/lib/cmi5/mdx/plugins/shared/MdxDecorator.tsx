import React, { useRef } from 'react';
import { usePlaybackDecoratorFix } from './usePlaybackDecoratorFix';

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

type MdxDecoratorProps = {
  children: React.ReactElement;
  /** Pass this if the wrapped element already uses its own ref elsewhere (e.g. useGutterRight) */
  existingRef?: React.Ref<HTMLElement>;
};

export function MdxDecorator({ children, existingRef }: MdxDecoratorProps) {
  const internalRef = useRef<HTMLElement>(null);
  usePlaybackDecoratorFix(internalRef);
  const ref = existingRef ? mergeRefs(internalRef, existingRef) : internalRef;
  return React.cloneElement(children, { ref });
}
