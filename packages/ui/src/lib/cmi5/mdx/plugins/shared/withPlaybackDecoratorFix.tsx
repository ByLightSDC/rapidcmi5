import React, { useRef } from 'react';
import { usePlaybackDecoratorFix } from './usePlaybackDecoratorFix';

/**
 * Wraps a DirectiveDescriptor's Editor with the NVDA playback-decorator fix,
 * so individual directive editors don't need to call usePlaybackDecoratorFix
 * themselves. Apply once where directiveDescriptors are assembled, e.g.
 * `directiveDescriptors: [...].map(withPlaybackDecoratorFix)` or wrap a single entry.
 */
export function withPlaybackDecoratorFix<T extends { Editor: React.ComponentType<any> }>(
  descriptor: T,
): T {
  const OriginalEditor = descriptor.Editor;
  const WrappedEditor: React.ComponentType<any> = (props) => {
    const ref = useRef<HTMLDivElement>(null);
    usePlaybackDecoratorFix(ref);
    return (
      <div ref={ref} style={{ display: 'contents' }}>
        <OriginalEditor {...props} />
      </div>
    );
  };
  return { ...descriptor, Editor: WrappedEditor };
}
