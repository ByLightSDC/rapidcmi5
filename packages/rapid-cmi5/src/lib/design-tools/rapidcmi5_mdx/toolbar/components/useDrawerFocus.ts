import { useCallback, useEffect, useRef } from 'react';
import type { FocusEvent, KeyboardEvent } from 'react';

const focusableSelector =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let activeDrawerFocusId: symbol | null = null;
let activeDrawerOpener: HTMLElement | null = null;

interface UseDrawerFocusOptions {
  /** Whether the drawer is currently open. */
  open: boolean;
  /**
   * Increment when the drawer should receive focus again while it is already
   * open, such as when its keyboard shortcut is pressed a second time.
   */
  openSequence?: number;
  /**
   * Optional selector for the drawer's selected or preferred initial control.
   * This is used when there is no still-visible control to restore focus to.
   */
  initialFocusSelector?: string;
  /** Called when Escape is pressed while focus is inside the drawer. */
  onClose: () => void;
}

/**
 * Manages keyboard focus for a persistent editor drawer.
 *
 * When opened, focus returns to the last-used control when it is still
 * available. Otherwise, the hook uses `initialFocusSelector`, then the first
 * useful focusable control, and finally the drawer container. When closed,
 * focus returns to the element that opened the drawer. Escape calls `onClose`.
 *
 * An increased `openSequence` requests focus again without requiring the
 * drawer to close first. This supports shortcuts that reopen or refocus an
 * already-open drawer.
 *
 * @param options Drawer state, initial-focus preference, and close callback.
 * @returns A root ref and focus/keyboard handlers to attach to the drawer.
 */
export function useDrawerFocus({
  open,
  openSequence = 0,
  initialFocusSelector,
  onClose,
}: UseDrawerFocusOptions) {
  const rootRef = useRef<HTMLDivElement>(null);
  const drawerFocusId = useRef(Symbol('drawer-focus'));
  const openerRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const previousOpenSequenceRef = useRef(openSequence);

  useEffect(() => {
    let focusFrame: number | undefined;
    let restoreFrame: number | undefined;
    const justOpened = open && !wasOpenRef.current;
    const requestedAgain =
      open && openSequence > previousOpenSequenceRef.current;

    if (justOpened || requestedAgain) {
      const root = rootRef.current;
      const activeElement = document.activeElement;
      const switchingFromAnotherDrawer =
        activeDrawerFocusId !== null &&
        activeDrawerFocusId !== drawerFocusId.current;

      if (
        !switchingFromAnotherDrawer &&
        activeElement instanceof HTMLElement &&
        !root?.contains(activeElement)
      ) {
        openerRef.current = activeElement;
        activeDrawerOpener = activeElement;
      }
      if (switchingFromAnotherDrawer && activeDrawerOpener?.isConnected) {
        openerRef.current = activeDrawerOpener;
      }
      activeDrawerFocusId = drawerFocusId.current;

      /**When a drawer opens, the hook waits one animation frame so the drawer’s content has rendered. It then focuses, in order:
        1. The last focused control, if it still exists and is visible.
        2. The drawer’s selected item, if the drawer supplied a selector for one.
        3. The first enabled, focusable control.
        4. The drawer container itself as a fallback. */
      focusFrame = requestAnimationFrame(() => {
        const currentRoot = rootRef.current;
        if (!currentRoot) return;

        const lastFocused = lastFocusedRef.current;
        const selected = initialFocusSelector
          ? currentRoot.querySelector<HTMLElement>(initialFocusSelector)
          : null;
        const firstControl = Array.from(
          currentRoot.querySelectorAll<HTMLElement>(focusableSelector),
        ).find(
          (control) =>
            !control.matches(':disabled') &&
            !control.closest('[data-drawer-utility="true"]'),
        );
        const selectedTarget =
          selected && !selected.matches(':disabled') ? selected : null;
        const target =
          (lastFocused?.isConnected &&
          currentRoot.contains(lastFocused) &&
          !lastFocused.matches(':disabled') &&
          lastFocused.getClientRects().length > 0
            ? lastFocused
            : null) ??
          selectedTarget ??
          firstControl ??
          currentRoot;

        if (target === currentRoot && !currentRoot.hasAttribute('tabindex')) {
          currentRoot.tabIndex = -1;
        }
        target.focus();
      });

      wasOpenRef.current = open;
      previousOpenSequenceRef.current = openSequence;
    } else if (!open && wasOpenRef.current) {
      const opener = openerRef.current;
      if (activeDrawerFocusId === drawerFocusId.current) {
        activeDrawerFocusId = null;
        const restoreTarget = activeDrawerOpener?.isConnected
          ? activeDrawerOpener
          : opener;
        activeDrawerOpener = null;
        if (restoreTarget?.isConnected) {
          restoreFrame = requestAnimationFrame(() => {
            if (activeDrawerFocusId === null) restoreTarget.focus();
          });
        }
      }
    }

    wasOpenRef.current = open;
    previousOpenSequenceRef.current = openSequence;
    return () => {
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame);
      if (restoreFrame !== undefined) cancelAnimationFrame(restoreFrame);
    };
  }, [initialFocusSelector, open, openSequence]);

  const onFocusCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      !target.closest('[data-drawer-utility="true"]')
    ) {
      lastFocusedRef.current = target;
    }
  }, []);

  // Escape key closes
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  return { rootRef, onFocusCapture, onKeyDown };
}
