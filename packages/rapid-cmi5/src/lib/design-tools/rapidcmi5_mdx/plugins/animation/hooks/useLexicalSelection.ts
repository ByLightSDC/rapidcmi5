import { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_NORMAL } from 'lexical';
import { usePublisher, useCellValue } from '@mdxeditor/gurx';
import {
  selectedElement$,
  slideAnimations$,
  setAnimations$,
  selectedAnimation$,
} from '../state/animationCells';
import {
  getSelectedElementInfo,
  isNodeAnimatable,
  SelectedElementInfo,
} from '../utils/lexicalSelection';
import { setupAnimationIdRefresh } from '../utils/lexicalDomBridge';
import { highlightAnimatedElement } from '../utils/updateAnimationIndicators';
import { cleanupOrphanedAnimations } from '../utils/cleanupOrphanedAnimations';
import { debugLog } from '@rapid-cmi5/ui';

/**
 * Hook to track Lexical editor selection and publish to Gurx state
 */
export function useLexicalSelection() {
  const [editor] = useLexicalComposerContext();
  const publishSelectedElement = usePublisher(selectedElement$);
  const setAnimations = usePublisher(setAnimations$);
  const setSelectedAnimation = usePublisher(selectedAnimation$);
  const currentAnimations = useCellValue(slideAnimations$);
  const [selectedInfo, setSelectedInfo] = useState<SelectedElementInfo | null>(
    null,
  );
  const [isAnimatable, setIsAnimatable] = useState(false);
  const currentAnimationsRef = useRef(currentAnimations);

  // Keep a ref of the latest animations so we don't re-run effects unnecessarily
  useEffect(() => {
    currentAnimationsRef.current = currentAnimations;
  }, [currentAnimations]);

  useEffect(() => {
    debugLog('🔧 useLexicalSelection hook initializing', undefined, undefined, 'selection');

    // Set up automatic animation ID tagging
    const cleanupIdRefresh = setupAnimationIdRefresh(editor);

    // Periodically check for orphaned animations (elements were deleted)
    const cleanupInterval = setInterval(() => {
      const cleaned = cleanupOrphanedAnimations(
        editor,
        currentAnimationsRef.current,
      );
      if (cleaned.length < currentAnimationsRef.current.length) {
        // Silently update animations (logging happens in cleanupOrphanedAnimations)
        setAnimations(cleaned);
      }
    }, 2000); // Check every 2 seconds

    // Listen for selection changes
    debugLog('📋 Registering SELECTION_CHANGE_COMMAND handler', undefined, undefined, 'selection');
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        debugLog('🎯 SELECTION_CHANGE_COMMAND fired!', undefined, undefined, 'selection');

        // Get info about selected element
        const info = getSelectedElementInfo(editor);
        setSelectedInfo(info);

        debugLog('selectedInfo', info ?? 'null', undefined, 'selection');
        const animatable = isNodeAnimatable(info);
        setIsAnimatable(animatable);
        debugLog('animatable', animatable, undefined, 'selection');

        // Publish to Gurx state
        if (info && animatable) {
          const matchingAnimations = currentAnimationsRef.current.filter(
            (anim) => anim.targetNodeKey === info.nodeKey,
          );

          publishSelectedElement(info.nodeKey);
          setSelectedAnimation(matchingAnimations[0]?.id ?? null);
          debugLog('Selected element:', info);

          // Highlight the selected element (turns badge orange if it has animations)
          highlightAnimatedElement(info.nodeKey);
        } else {
          publishSelectedElement(null);
          setSelectedAnimation(null);

          // Clear highlights when selecting non-animatable element
          highlightAnimatedElement(null);

          if (info) {
            debugLog('Selected non-animatable element:', info);
          }
        }

        return false; // Don't prevent other handlers
      },
      COMMAND_PRIORITY_NORMAL,
    );

    return () => {
      cleanupIdRefresh();
      clearInterval(cleanupInterval);
      unregister();
    };
  }, [editor, publishSelectedElement, setAnimations, setSelectedAnimation]);

  return {
    selectedInfo,
    isAnimatable,
  };
}
