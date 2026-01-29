import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $getNodeByKey,
} from 'lexical';
import { $isImageNode } from '../../../plugins/image/ImageNode';
import { $isAudioNode } from '../../../plugins/audio/AudioNode';
import { $isVideoNode } from '../../../plugins/video/VideoNode';
import { debugLog } from '@rapid-cmi5/ui';

export interface SelectedElementInfo {
  nodeKey: string;
  nodeType: string;
  label: string;
  isEmpty: boolean;
  /** The actual selected text (for inline selections) */
  selectedText?: string;
  /** Selection type: 'block' for full elements, 'inline' for partial text */
  selectionType?: 'block' | 'inline';
}

/**
 * Get information about the currently selected element in the Lexical editor
 */
export function getSelectedElementInfo(
  editor: LexicalEditor,
): SelectedElementInfo | null {
  let selectedInfo: SelectedElementInfo | null = null;

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    debugLog('🔍 getSelectedElementInfo - selection:', selection, undefined, 'selection');

    // If no selection exists, return null
    if (!selection) {
      debugLog('⚠️ No selection found, returning null', undefined, undefined, 'selection');
      return;
    }

    debugLog('🔍 Selection type:', selection.constructor.name, undefined, 'selection');
    debugLog('🔍 Is RangeSelection?', $isRangeSelection(selection), undefined, 'selection');
    if ($isRangeSelection(selection)) {
      debugLog('🔍 Is collapsed?', selection.isCollapsed(), undefined, 'selection');
      debugLog(`🔍 Anchor offset: ${selection.anchor.offset}, Focus offset: ${selection.focus.offset}`, undefined, undefined, 'selection');
    }

    // Handle NodeSelection (for images, videos, etc. - decorator nodes)
    if ($isNodeSelection(selection)) {
      debugLog('📦 NodeSelection detected', undefined, undefined, 'selection');
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        const targetNode = nodes[0]; // Use first selected node
        const nodeKey = targetNode.getKey();
        const nodeType = targetNode.getType();

        let label = '';
        let isEmpty = false;

        try {
          // Check for special node types
          if ($isImageNode(targetNode)) {
            const src = targetNode.getSrc();
            const filename = src.split('/').pop() || src;
            label = `Image: ${filename}`;
            debugLog('✅ Image node selected:', { nodeKey, nodeType, label });
          } else if ($isAudioNode(targetNode)) {
            const src = targetNode.getSrc();
            const filename = src.split('/').pop() || src;
            label = `Audio: ${filename}`;
          } else if ($isVideoNode(targetNode)) {
            const src = targetNode.getSrc();
            const filename = src.split('/').pop() || src;
            label = `Video: ${filename}`;
          } else {
            const textContent = targetNode.getTextContent().trim();
            isEmpty = !textContent;
            label = isEmpty
              ? `Empty ${formatNodeType(nodeType)}`
              : `${formatNodeType(nodeType)}: ${textContent}`;
          }

          selectedInfo = {
            nodeKey,
            nodeType,
            label,
            isEmpty,
          };
        } catch (error) {
          console.error('Error getting node selection info:', error);
        }
      }
      return;
    }

    // Handle RangeSelection (for text)
    if (!$isRangeSelection(selection)) {
      debugLog('⚠️ Not a RangeSelection, returning null', undefined, undefined, 'selection');
      return;
    }

    // If the range is collapsed (caret only), check if browser has actual selection
    if (selection.isCollapsed()) {
      // Check if the browser actually has a text selection (double-click case)
      const domSelection = window.getSelection();
      const hasTextSelected = domSelection && !domSelection.isCollapsed && domSelection.toString().trim().length > 0;

      debugLog('⚠️ Lexical selection is collapsed, checking browser selection...', undefined, undefined, 'selection');
      debugLog('   Browser has selection?', hasTextSelected, undefined, 'selection');
      debugLog('   Selected text:', domSelection?.toString(), undefined, 'selection');

      if (!hasTextSelected) {
        debugLog('⚠️ No browser selection either, returning null', undefined, undefined, 'selection');
        return;
      }

      debugLog('✅ Browser has selection despite Lexical being collapsed, continuing...', undefined, undefined, 'selection');
      // Continue processing - the selection is real even though Lexical thinks it's collapsed
    }

    // Check for stale Lexical selection cache:
    // If DOM says nothing is selected but Lexical thinks something is,
    // the Lexical selection is stale (cached from previous selection)
    const domSelection = window.getSelection();
    const domSelectedText = domSelection?.isCollapsed
      ? ''
      : (domSelection?.toString().trim() ?? '');
    const lexicalSelectedText = selection.getTextContent().trim();

    if (!domSelectedText && lexicalSelectedText) {
      debugLog(
        '⚠️ Stale Lexical cache detected - DOM empty but Lexical has text, returning null',
        { domSelectedText, lexicalSelectedText },
        undefined,
        'selection',
      );
      return;
    }

    debugLog('✅ Valid RangeSelection with actual range, proceeding...', undefined, undefined, 'selection');

    // Get the anchor node (where selection starts/cursor is)
    const anchorNode = selection.anchor.getNode();

    // Walk up to find the top-level block element
    let targetNode = anchorNode;
    let parentNode = anchorNode.getParent();

    // Find the highest block-level node that's not the root
    while (parentNode !== null && !parentNode.getType().includes('root')) {
      targetNode = parentNode;
      parentNode = parentNode.getParent();
    }

    const nodeKey = targetNode.getKey();
    const nodeType = targetNode.getType();

    // Generate a human-readable label
    let label = '';
    let isEmpty = false;

    try {
      // Check for special node types first
      if ($isImageNode(targetNode)) {
        const src = targetNode.getSrc();
        const filename = src.split('/').pop() || src;
        label = `Image: ${filename}`;
      } else if ($isAudioNode(targetNode)) {
        const src = targetNode.getSrc();
        const filename = src.split('/').pop() || src;
        label = `Audio: ${filename}`;
      } else if ($isVideoNode(targetNode)) {
        const src = targetNode.getSrc();
        const filename = src.split('/').pop() || src;
        label = `Video: ${filename}`;
      } else {
        // For text nodes, get the text content
        const textContent = targetNode.getTextContent().trim();

        if (!textContent) {
          isEmpty = true;
          label = `Empty ${formatNodeType(nodeType)}`;
        } else {
          // Truncate long text
          const truncated =
            textContent.length > 50
              ? `${textContent.substring(0, 47)}...`
              : textContent;
          label = `${formatNodeType(nodeType)}: ${truncated}`;
        }
      }

      // Get the actual selected text (for inline selections)
      // Use DOM selection as source of truth since Lexical can be stale
      const actualSelectedText = domSelectedText || lexicalSelectedText;

      selectedInfo = {
        nodeKey,
        nodeType,
        label,
        isEmpty,
        selectedText: actualSelectedText || undefined,
      };
    } catch (error) {
      console.error('Error getting element info:', error);
    }
  });

  return selectedInfo;
}

/**
 * Format node type for display
 */
function formatNodeType(nodeType: string): string {
  // Convert camelCase/PascalCase to readable format
  const formatted = nodeType
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  // Handle common node types
  const typeMap: Record<string, string> = {
    paragraph: 'Paragraph',
    heading: 'Heading',
    quote: 'Quote',
    list: 'List',
    listitem: 'List Item',
    code: 'Code Block',
    image: 'Image',
    audio: 'Audio',
    video: 'Video',
    table: 'Table',
    tablerow: 'Table Row',
    tablecell: 'Table Cell',
  };

  return typeMap[nodeType.toLowerCase()] || formatted;
}

/**
 * Check if a node is animatable (not empty, not root)
 */
export function isNodeAnimatable(info: SelectedElementInfo | null): boolean {
  if (!info) return false;

  // Don't allow animating empty elements
  if (info.isEmpty) return false;

  // Don't allow animating root or certain structural elements
  const nonAnimatableTypes = ['root', 'tablecell', 'tablerow'];
  if (nonAnimatableTypes.includes(info.nodeType.toLowerCase())) {
    return false;
  }

  return true;
}

/**
 * Get a user-friendly description of why an element can't be animated
 */
export function getNotAnimatableReason(
  info: SelectedElementInfo | null,
): string {
  if (!info) return 'No element selected';
  if (info.isEmpty) return 'Cannot animate empty elements';
  if (info.nodeType.toLowerCase() === 'root')
    return 'Cannot animate the root element';
  if (['tablecell', 'tablerow'].includes(info.nodeType.toLowerCase())) {
    return 'Cannot animate table cells directly';
  }
  return 'This element cannot be animated';
}
