import React from 'react';

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
      className="visually-hidden"
    />
  );
}

export default LiveStatusRegion;
