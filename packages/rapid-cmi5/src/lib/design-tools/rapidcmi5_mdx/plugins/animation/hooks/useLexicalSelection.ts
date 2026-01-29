import { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_NORMAL } from 'lexical';
import { usePublisher, useCellValue } from '@mdxeditor/gurx';
import {
  selectedElement$,
  slideAnimations$,
  setAnimations$,
  selectedAnimation$,
  animationDrawerOpen$,
} from '../state/animationCells';
import {
  getSelectedElementInfo,
  isNodeAnimatable,
  SelectedElementInfo,
} from '../utils/lexicalSelection';
import { highlightAnimatedElement } from '../utils/updateAnimationIndicators';
import { SelectionValidator } from '../wrapping/SelectionValidator';
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
  const isDrawerOpen = useCellValue(animationDrawerOpen$);
  const [selectedInfo, setSelectedInfo] = useState<SelectedElementInfo | null>(
    null,
  );
  const [isAnimatable, setIsAnimatable] = useState(false);
  const currentAnimationsRef = useRef(currentAnimations);
  const isDrawerOpenRef = useRef(isDrawerOpen);

  // Keep a ref of the latest animations so we don't re-run effects unnecessarily
  useEffect(() => {
    currentAnimationsRef.current = currentAnimations;
  }, [currentAnimations]);

  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  // Re-run validation when the drawer open state changes, so we don't require
  // the user to jiggle the selection after opening the drawer.
  useEffect(() => {
    let info = getSelectedElementInfo(editor);

    // Only run validation if drawer is open (performance + avoid false negatives)
    let animatable = isNodeAnimatable(info);
    if (animatable && isDrawerOpenRef.current) {
      const validation = SelectionValidator.validateForWrapping(
        editor,
        isDrawerOpenRef.current,
      );
      animatable = validation.isValid;

      // Enrich info with selectionType from validation
      if (info && validation.selectionType) {
        info = {
          ...info,
          selectionType: validation.selectionType,
          // Update label for inline selections
          label:
            validation.selectionType === 'inline' && info.selectedText
              ? `Inline: ${info.selectedText.length > 30 ? info.selectedText.substring(0, 27) + '...' : info.selectedText}`
              : info.label,
        };
      }

      if (!validation.isValid) {
        debugLog(
          '[useLexicalSelection] Validation blocked animatable (drawer toggle)',
          {
            reason: validation.reason,
            selectedLabel: info?.label,
            selectedType: info?.nodeType,
          },
          undefined,
          'selection',
        );
      }
    }

    setSelectedInfo(info);
    setIsAnimatable(animatable);
  }, [editor, isDrawerOpen]);

  useEffect(() => {
    debugLog(
      '🔧 useLexicalSelection hook initializing',
      undefined,
      undefined,
      'selection',
    );

    // Listen for selection changes
    debugLog(
      '📋 Registering SELECTION_CHANGE_COMMAND handler',
      undefined,
      undefined,
      'selection',
    );
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        debugLog(
          '🎯 SELECTION_CHANGE_COMMAND fired!',
          undefined,
          undefined,
          'selection',
        );

        // Get info about selected element
        let info = getSelectedElementInfo(editor);

        debugLog('selectedInfo', info ?? 'null', undefined, 'selection');

        // Only run validation if drawer is open (performance + avoid false negatives)
        let animatable = isNodeAnimatable(info);
        if (animatable && isDrawerOpenRef.current) {
          const validation = SelectionValidator.validateForWrapping(
            editor,
            isDrawerOpenRef.current,
          );
          animatable = validation.isValid;

          // Enrich info with selectionType from validation
          if (info && validation.selectionType) {
            info = {
              ...info,
              selectionType: validation.selectionType,
              // Update label for inline selections
              label:
                validation.selectionType === 'inline' && info.selectedText
                  ? `Inline: ${info.selectedText.length > 30 ? info.selectedText.substring(0, 27) + '...' : info.selectedText}`
                  : info.label,
            };
          }

          if (!validation.isValid) {
            debugLog(
              '[useLexicalSelection] Validation blocked animatable',
              {
                reason: validation.reason,
                selectedLabel: info?.label,
                selectedType: info?.nodeType,
              },
              undefined,
              'selection',
            );
          }
        }

        setSelectedInfo(info);
        setIsAnimatable(animatable);
        debugLog('animatable', animatable, undefined, 'selection');

        // Publish to Gurx state
        if (info && animatable) {
          const matchingAnimations = currentAnimationsRef.current.filter(
            (anim) => anim.targetNodeKey === info.nodeKey,
          );

          publishSelectedElement(info.nodeKey);

          // IMPORTANT: Only update selectedAnimation$ if this element HAS animations.
          // If user clicks on an element without animations (to add one), we should
          // NOT clear the currently active animation in the drawer.
          // selectedAnimation$ is the "active/expanded" animation, set by:
          //   1. Clicking an animation badge in the editor (via onAnimDirectiveClick$)
          //   2. Clicking an AnimationItem in the drawer
          //   3. Adding a new animation
          // This allows the user to have Animation 3 expanded while selecting text
          // elsewhere to add a new animation - common workflow.
          if (matchingAnimations.length > 0) {
            setSelectedAnimation(matchingAnimations[0].id);
            debugLog('Selected element with animation:', {
              nodeKey: info.nodeKey,
              animationId: matchingAnimations[0].id,
            });
          } else {
            debugLog(
              'Selected animatable element (no existing animation):',
              info,
            );
          }

          // Highlight the selected element (turns badge orange if it has animations)
          highlightAnimatedElement(info.nodeKey);
        } else {
          publishSelectedElement(null);
          // NOTE: We intentionally do NOT clear selectedAnimation$ here.
          // See comment above - selectedAnimation$ represents the "active" animation
          // in the drawer, not the editor selection state.
          // The isAnimatable state already controls the "Add Animation" button separately.

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
      // cleanupIdRefresh();
      // clearInterval(cleanupInterval);
      unregister();
    };
  }, [editor, publishSelectedElement, setAnimations, setSelectedAnimation]);

  return {
    selectedInfo,
    isAnimatable,
  };
}
