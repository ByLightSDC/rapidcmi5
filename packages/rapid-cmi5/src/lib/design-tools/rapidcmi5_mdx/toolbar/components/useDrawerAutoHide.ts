import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY_PREFIX = 'rc5_drawer_autohide_';

/**
 * Manages auto-hide behaviour for a side panel.
 *
 * When autoHide is OFF (default): the panel is fully controlled by `isActivated` —
 * the user must press X to close it.
 *
 * When autoHide is ON: the panel slides closed on mouse-leave and re-opens on
 * mouse-enter. Whenever `isActivated` goes true OR `showSeq` increments (toolbar
 * button clicked again while already active), the panel always shows immediately.
 *
 * @param panelKey     Short unique key used for localStorage (e.g. "animation")
 * @param isActivated  Whether the panel is currently activated (open) by the caller
 * @param showSeq      Incrementing counter from toolbar button — re-shows panel
 *                     even when isActivated was already true
 */
export function useDrawerAutoHide(panelKey: string, isActivated: boolean, showSeq = 0) {
  const storageKey = `${STORAGE_KEY_PREFIX}${panelKey}`;

  const [autoHide, setAutoHideState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  // Tracks whether the mouse is currently inside the drawer area.
  const [hoverVisible, setHoverVisible] = useState(false);

  // Track previous values to detect genuine changes
  const prevActivatedRef = useRef(isActivated);
  const prevShowSeqRef = useRef(showSeq);

  // Show the panel immediately when:
  // - isActivated transitions false → true (panel first opened), OR
  // - showSeq genuinely increases (toolbar re-clicked while already active)
  // Do NOT show when showSeq drops back to 0 (another panel's button was clicked).
  useEffect(() => {
    const justActivated = isActivated && !prevActivatedRef.current;
    const seqIncreased = showSeq > prevShowSeqRef.current;
    prevActivatedRef.current = isActivated;
    prevShowSeqRef.current = showSeq;

    console.log(`[useDrawerAutoHide:${panelKey}] effect — isActivated=${isActivated} showSeq=${showSeq} justActivated=${justActivated} seqIncreased=${seqIncreased}`);
    if (justActivated || (isActivated && seqIncreased)) {
      console.log(`[useDrawerAutoHide:${panelKey}] → setHoverVisible(true)`);
      setHoverVisible(true);
    }
  }, [isActivated, showSeq]);

  // Timer ref to debounce mouse-leave slightly (prevents flicker on inner elements)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleAutoHide = useCallback(() => {
    setAutoHideState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore
      }
      // Keep panel visible regardless of direction — let mouse-leave close it naturally
      setHoverVisible(true);
      return next;
    });
  }, [storageKey]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHoverVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setHoverVisible(false);
    }, 300);
  }, []);

  // The effective open state: activated + (autohide off OR mouse inside)
  const effectiveOpen = isActivated && (!autoHide || hoverVisible);

  /**
   * sx props to spread onto the Drawer `sx` prop.
   * When effectively closed, suppress Paper pointer events so the off-screen
   * Paper can't be accidentally hovered.
   */
  const getDrawerSx = useCallback(
    (baseSx: Record<string, unknown> = {}) => {
      if (effectiveOpen) return baseSx;
      return {
        ...baseSx,
        '& .MuiDrawer-paper': {
          ...((baseSx['& .MuiDrawer-paper'] as Record<string, unknown>) ?? {}),
          pointerEvents: 'none',
        },
      };
    },
    [effectiveOpen],
  );

  return {
    autoHide,
    toggleAutoHide,
    hoverVisible,
    effectiveOpen,
    handleMouseEnter,
    handleMouseLeave,
    getDrawerSx,
  };
}
