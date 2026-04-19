import './styles/draggable-block.css';

import React, { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getRoot, LexicalEditor } from 'lexical';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const HANDLE_WIDTH = 20;
const SCROLL_ZONE = 80;   // px from edge to trigger auto-scroll
const SCROLL_SPEED = 10;  // px per frame

function getTopLevelBlock(
  editorRoot: HTMLElement,
  target: Element | null,
): HTMLElement | null {
  if (!target) return null;
  let el: Element | null = target;
  while (el) {
    if (el.parentElement === editorRoot) return el as HTMLElement;
    el = el.parentElement;
    if (!el || el === editorRoot) return null;
  }
  return null;
}

function findKeyForDOMElement(editor: LexicalEditor, domEl: HTMLElement): string | null {
  let found: string | null = null;
  editor.getEditorState().read(() => {
    const root = $getRoot();
    for (const child of root.getChildren()) {
      const key = child.getKey();
      if (editor.getElementByKey(key) === domEl) {
        found = key;
        return;
      }
    }
  });
  return found;
}

function findScrollableParent(el: HTMLElement): HTMLElement | Window {
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') return parent;
    parent = parent.parentElement;
  }
  return window;
}

function scrollContainer(container: HTMLElement | Window, delta: number) {
  if (container instanceof Window) {
    container.scrollBy(0, delta);
  } else {
    container.scrollTop += delta;
  }
}

export function DraggableBlockHandle() {
  const [editor] = useLexicalComposerContext();
  const handleRef = useRef<HTMLDivElement>(null);
  const dropLineRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const hoveredBlockRef = useRef<HTMLElement | null>(null);
  const hoveredKeyRef = useRef<string | null>(null);
  const draggedKeyRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const lastClientYRef = useRef(0);

  const stopAutoScroll = useCallback(() => {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback((direction: 'up' | 'down') => {
    stopAutoScroll();
    const tick = () => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      scrollContainer(scrollContainerRef.current, direction === 'down' ? SCROLL_SPEED : -SCROLL_SPEED);
      scrollRafRef.current = requestAnimationFrame(tick);
    };
    scrollRafRef.current = requestAnimationFrame(tick);
  }, [stopAutoScroll]);

  const positionHandle = useCallback((blockEl: HTMLElement) => {
    const handle = handleRef.current;
    if (!handle) return;
    const rect = blockEl.getBoundingClientRect();
    handle.style.display = 'flex';
    handle.style.top = `${rect.top}px`;
    handle.style.left = `${rect.left - HANDLE_WIDTH - 6}px`;
    handle.style.height = `${rect.height}px`;
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideHandle = useCallback(() => {
    if (isDraggingRef.current) return;
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      hoveredBlockRef.current = null;
      hoveredKeyRef.current = null;
      if (handleRef.current) handleRef.current.style.display = 'none';
    }, 250);
  }, [cancelHide]);

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
        if (blockEl !== hoveredBlockRef.current) {
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

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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
    scrollContainerRef.current = editorRoot ? findScrollableParent(editorRoot) : window;

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
  }, [editor]);

  const updateDropLine = useCallback((clientX: number, clientY: number) => {
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
  }, [editor]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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
  }, [updateDropLine, startAutoScroll, stopAutoScroll]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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
  }, [editor, cleanupDrag]);

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
