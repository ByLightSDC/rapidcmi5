import './styles/draggable-block.css';

import React, { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getRoot, LexicalEditor } from 'lexical';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  findKeyForDOMElement,
  findScrollableParent,
  getTopLevelBlock,
  scrollContainer,
} from './methods';
import { HANDLE_WIDTH, SCROLL_ZONE, SCROLL_SPEED } from './constants';

/**
 * Floating drag and drop handle component rendered as a composer child over the MDX editor.
 *
 * Responsibilities:
 * - Tracks mouse position to show/hide a grab handle beside the hovered top-level block.
 * - On pointer-down, creates a semi-transparent ghost clone that follows the cursor.
 * - Renders a blue drop-indicator line above or below the target block while dragging.
 * - On pointer-up, commits the reorder by calling `insertBefore` / `insertAfter` on the
 *   corresponding Lexical nodes.
 * - Auto-scrolls the nearest scrollable ancestor when the cursor nears the viewport edge.
 *
 * This component renders two elements:
 * - `.rc5-drag-handle`   — the visible grab icon, positioned with `position: fixed`.
 * - `.rc5-drag-drop-line` — the blue insertion indicator, also `position: fixed`.
 */
export function DraggableBlockHandle() {
  const [editor] = useLexicalComposerContext();
  const handleRef = useRef<HTMLDivElement>(null);
  const dropLineRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const hoveredBlockRef = useRef<HTMLElement | null>(null);
  const hoveredKeyRef = useRef<string | null>(null);
  const hoveredTargetRef = useRef<HTMLElement | null>(null);
  const draggedKeyRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastClientYRef = useRef(0);

  /** Cancels any in-progress auto-scroll RAF loop. */
  const stopAutoScroll = useCallback(() => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  }, []);

  /**
   * Starts a `requestAnimationFrame` loop that scrolls `scrollContainerRef`
   * by `SCROLL_SPEED` px per frame in the given `direction`.
   * Replaces any existing scroll loop.
   */
  const startAutoScroll = useCallback(
    (direction: 'up' | 'down') => {
      stopAutoScroll();
      const tick = () => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        scrollContainer(
          scrollContainerRef.current,
          direction === 'down' ? SCROLL_SPEED : -SCROLL_SPEED,
        );
        scrollRafRef.current = requestAnimationFrame(tick);
      };
      scrollRafRef.current = requestAnimationFrame(tick);
    },
    [stopAutoScroll],
  );

  /**
   * Moves the drag handle to sit just to the left of `blockEl`, sized to match
   * its height, and makes it visible.
   */
  const positionHandle = useCallback((blockEl: HTMLElement) => {
    const handle = handleRef.current;
    if (!handle) return;

    //correct rect for an activity is on the form so adjust target for positioning
    const activityTarget = blockEl.querySelector('.no-paper-form form.form');
    const rect =
      activityTarget !== null
        ? activityTarget.getBoundingClientRect()
        : blockEl.getBoundingClientRect();
    const leftOffset = activityTarget ? 32 : 6;

    handle.style.display = 'flex';
    handle.style.top = `${rect.top}px`;
    handle.style.left = `${rect.left - HANDLE_WIDTH - leftOffset}px`;
    handle.style.height = `${rect.height}px`;
  }, []);

  /** Clears any pending hide timer so the handle stays visible. */
  const cancelHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  /**
   * Schedules the handle to be hidden after 250 ms.
   * No-op while a drag is in progress so the handle doesn't flicker.
   */
  const hideHandle = useCallback(() => {
    if (isDraggingRef.current) return;
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      hoveredBlockRef.current = null;
      hoveredKeyRef.current = null;
      if (handleRef.current) handleRef.current.style.display = 'none';
    }, 250);
  }, [cancelHide]);

  /**
   * Tears down all drag state after a drop or cancellation:
   * - Stops auto-scroll.
   * - Removes the ghost clone from the DOM.
   * - Strips the `rc5-dragging-block` opacity class from the source block.
   * - Hides the handle and drop-line.
   * - Resets all drag-related refs.
   */
  const cleanupDrag = useCallback(() => {
    stopAutoScroll();
    isDraggingRef.current = false;

    if (hoveredBlockRef.current) {
      hoveredBlockRef.current.classList.remove('rc5-dragging-block');
    }
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }

    draggedKeyRef.current = null;
    hoveredBlockRef.current = null;
    hoveredKeyRef.current = null;
    scrollContainerRef.current = null;

    if (handleRef.current) handleRef.current.style.display = 'none';
    if (dropLineRef.current) dropLineRef.current.style.display = 'none';
  }, [stopAutoScroll]);

  // Global mouse tracking for showing the handle
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;

      const editorRoot = editor.getRootElement();
      if (!editorRoot) return;

      const handle = handleRef.current;
      if (handle && handle.matches(':hover')) {
        cancelHide();
        return;
      }

      const blockEl = getTopLevelBlock(editorRoot, e.target as Element);
      if (blockEl) {
        cancelHide();
        if (
          hoveredBlockRef.current === null ||
          blockEl !== hoveredBlockRef.current ||
          hoveredTargetRef.current !== e.target ||
          e.target
        ) {
          hoveredBlockRef.current = blockEl;
          hoveredKeyRef.current = findKeyForDOMElement(editor, blockEl);
          positionHandle(blockEl);
        }
      } else {
        hideHandle();
      }
    };

    const onScroll = () => {
      if (!isDraggingRef.current && hoveredBlockRef.current) {
        positionHandle(hoveredBlockRef.current);
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [editor, positionHandle, hideHandle, cancelHide]);

  /**
   * Initiates a drag operation when the handle is pressed.
   *
   * - Captures the pointer so move/up events keep firing even if the cursor leaves the handle.
   * - Clones the hovered block as a fixed-position ghost that follows the cursor.
   * - Marks the source block with `rc5-dragging-block` to visually indicate it is being moved.
   * - Resolves the nearest scrollable ancestor once so `onPointerMove` can auto-scroll it.
   */
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const blockEl = hoveredBlockRef.current;
      const key = hoveredKeyRef.current;
      if (!blockEl || !key) return;

      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      draggedKeyRef.current = key;
      isDraggingRef.current = true;
      lastClientYRef.current = e.clientY;

      // Resolve scrollable container once at drag start
      const editorRoot = editor.getRootElement();
      scrollContainerRef.current = editorRoot
        ? findScrollableParent(editorRoot)
        : window;

      // Ghost that follows cursor
      const ghost = blockEl.cloneNode(true) as HTMLElement;
      const rect = blockEl.getBoundingClientRect();
      ghost.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      opacity: 0.5;
      pointer-events: none;
      z-index: 9999;
      box-sizing: border-box;
    `;
      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      blockEl.classList.add('rc5-dragging-block');
      if (handleRef.current) handleRef.current.style.display = 'none';
    },
    [editor],
  );

  /**
   * Positions the blue drop-indicator line above or below the block currently under the cursor.
   *
   * Temporarily hides the ghost before calling `elementFromPoint` so the ghost itself
   * doesn't intercept the hit-test. The line is hidden when the cursor is over the
   * block being dragged (no-op reorder).
   *
   * @param clientX - Current cursor X in viewport coordinates.
   * @param clientY - Current cursor Y in viewport coordinates.
   */
  const updateDropLine = useCallback(
    (clientX: number, clientY: number) => {
      const editorRoot = editor.getRootElement();
      if (!editorRoot) return;

      const ghost = ghostRef.current;
      if (ghost) ghost.style.display = 'none';
      const elUnder = document.elementFromPoint(clientX, clientY);
      if (ghost) ghost.style.display = '';

      const blockEl = getTopLevelBlock(editorRoot, elUnder);
      const dropLine = dropLineRef.current;
      if (!blockEl || !dropLine) {
        if (dropLine) dropLine.style.display = 'none';
        return;
      }

      const targetKey = findKeyForDOMElement(editor, blockEl);
      if (targetKey && targetKey === draggedKeyRef.current) {
        dropLine.style.display = 'none';
        return;
      }

      const rect = blockEl.getBoundingClientRect();
      const isAbove = clientY < rect.top + rect.height / 2;
      dropLine.style.display = 'block';
      dropLine.style.top = `${isAbove ? rect.top - 2 : rect.bottom - 1}px`;
      dropLine.style.left = `${rect.left}px`;
      dropLine.style.width = `${rect.width}px`;
    },
    [editor],
  );

  /**
   * Handles pointer movement during a drag.
   *
   * - Moves the ghost clone to follow the cursor.
   * - Updates the drop-indicator line position.
   * - Triggers auto-scroll when the cursor enters the `SCROLL_ZONE` near the viewport edges.
   */
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;

      lastClientYRef.current = e.clientY;

      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.top = `${e.clientY - 12}px`;
        ghost.style.left = `${e.clientX + 16}px`;
      }

      updateDropLine(e.clientX, e.clientY);

      // Auto-scroll when cursor is near viewport edges
      const vh = window.innerHeight;
      if (e.clientY < SCROLL_ZONE) {
        startAutoScroll('up');
      } else if (e.clientY > vh - SCROLL_ZONE) {
        startAutoScroll('down');
      } else {
        stopAutoScroll();
      }
    },
    [updateDropLine, startAutoScroll, stopAutoScroll],
  );

  /**
   * Commits the reorder on drop.
   *
   * Detects the block under the cursor (hiding the ghost first to avoid hit-test
   * interference), then calls `editor.update()` to move the dragged Lexical node
   * before or after the target node depending on which half of the target was hit.
   * Always calls `cleanupDrag` regardless of whether a valid target was found.
   */
  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;

      const editorRoot = editor.getRootElement();
      const draggedKey = draggedKeyRef.current;

      if (editorRoot && draggedKey) {
        const ghost = ghostRef.current;
        if (ghost) ghost.style.display = 'none';
        const elUnder = document.elementFromPoint(e.clientX, e.clientY);
        if (ghost) ghost.style.display = '';

        const blockEl = getTopLevelBlock(editorRoot, elUnder);
        if (blockEl) {
          const targetKey = findKeyForDOMElement(editor, blockEl);
          if (targetKey && targetKey !== draggedKey) {
            const rect = blockEl.getBoundingClientRect();
            const isAbove = e.clientY < rect.top + rect.height / 2;

            editor.update(() => {
              const draggedNode = $getNodeByKey(draggedKey);
              const targetNode = $getNodeByKey(targetKey);
              if (!draggedNode || !targetNode) return;
              if (isAbove) {
                targetNode.insertBefore(draggedNode);
              } else {
                targetNode.insertAfter(draggedNode);
              }
            });
          }
        }
      }

      cleanupDrag();
    },
    [editor, cleanupDrag],
  );

  /** Cancels the drag and cleans up state if the pointer event is interrupted (e.g. focus loss). */
  const onPointerCancel = useCallback(() => {
    cleanupDrag();
  }, [cleanupDrag]);

  return (
    <>
      <div
        ref={handleRef}
        className="rc5-drag-handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        title="Drag to reorder"
        style={{ touchAction: 'none' }}
      >
        <DragIndicatorIcon fontSize="small" />
      </div>
      <div ref={dropLineRef} className="rc5-drag-drop-line" />
    </>
  );
}
