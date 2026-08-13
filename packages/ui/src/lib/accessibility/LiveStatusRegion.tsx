import React from 'react';

const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * A visually-hidden `role="status"` live region. Pair with the `ref` returned
 * by `useLiveAnnouncer` (passed here as `announceRef`) to announce text to
 * screen readers without any visible UI.
 */
export function LiveStatusRegion({
  announceRef,
}: {
  announceRef: React.RefObject<HTMLSpanElement>;
}) {
  return (
    <span
      ref={announceRef}
      role="status"
      aria-live="polite"
      style={visuallyHiddenStyle}
    />
  );
}

export default LiveStatusRegion;
