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
  initialFocusSelector?: string | string[];
  /** Called when Escape is pressed while focus is inside the drawer. */
  onClose: () => void;
  /** Keep Tab navigation inside the drawer while it is open. */
  /**Animation library drawer opts in */
  trapFocus?: boolean;
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
  trapFocus = false,
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
        /**Choose the drawer's preferred initial focus target, selector can be string or array of strings */
        const initialFocusSelectors = initialFocusSelector
          ? Array.isArray(initialFocusSelector)
            ? initialFocusSelector
            : [initialFocusSelector]
          : [];
        const selectedTarget = initialFocusSelectors
          .flatMap((selector) =>
            Array.from(currentRoot.querySelectorAll<HTMLElement>(selector)),
          )
          .find(
            (target) =>
              !target.matches(':disabled') &&
              target.getClientRects().length > 0,
          );
        const firstControl = Array.from(
          currentRoot.querySelectorAll<HTMLElement>(focusableSelector),
        ).find(
          (control) =>
            !control.matches(':disabled') &&
            !control.closest('[data-drawer-utility="true"]'),
        );
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
  /**Listener while a drawer is open, and has trapFocus. If focus slips a key event won't bubble
   * up through drawers own onKeyDown. Essentially  a fallback for focus that escapes drawer.
   */
  useEffect(() => {
    // Do nothing unless focus trapping enabled, check drawer is active
    if (!open || !trapFocus) return;

    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      const root = rootRef.current;
      if (!root || activeDrawerFocusId !== drawerFocusId.current) return;

      const target = event.target;
      const focusIsInside = target instanceof Node && root.contains(target);
      if (event.key === 'Escape' && !event.defaultPrevented && !focusIsInside) {
        event.preventDefault();
        onClose();
        return;
      }
      //If Tab was pressed outside the drawer, find its visible, enabled controls.
      // Tab sends focus to the first one. Shift+Tab sends it to the last one.
      if (event.key === 'Tab' && !focusIsInside) {
        const controls = Array.from(
          root.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter(
          (control) =>
            !control.matches(':disabled') &&
            control.getClientRects().length > 0 &&
            !control.closest('[aria-hidden="true"], [inert]'),
        );
        const destination = event.shiftKey
          ? controls[controls.length - 1]
          : controls[0];
        if (destination) {
          event.preventDefault();
          destination.focus();
        }
      }
    };

    // Bubble phase lets nested menus handle Escape before the drawer does.
    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => document.removeEventListener('keydown', handleDocumentKeyDown);
  }, [onClose, open, trapFocus]);

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
        return;
      }
      // Handle tab and escape in drawers when focus is inside
      if (event.key !== 'Tab' || !trapFocus) return;
      // Retrieve container and its visible/enabled controls
      const root = rootRef.current;
      if (!root) return;
      const controls = Array.from(
        root.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (control) =>
          !control.matches(':disabled') &&
          control.getClientRects().length > 0 &&
          !control.closest('[aria-hidden="true"], [inert]'),
      );
      // If no controls, keep focus on drawer. Set it to -1 tab index to focus without adding to tab order
      if (controls.length === 0) {
        event.preventDefault();
        if (!root.hasAttribute('tabindex')) root.tabIndex = -1;
        root.focus();
        return;
      }

      const activeIndex = controls.indexOf(
        document.activeElement as HTMLElement,
      );
      if (
        (event.shiftKey && activeIndex <= 0) ||
        (!event.shiftKey && activeIndex === controls.length - 1)
      ) {
        event.preventDefault();
        const destination = event.shiftKey
          ? controls[controls.length - 1]
          : controls[0];
        destination.focus();
      }
    },
    [onClose, trapFocus],
  );

  return { rootRef, onFocusCapture, onKeyDown };
}
