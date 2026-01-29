/**
 * Selection Validator
 *
 * Validates whether selected content can be wrapped with an animation directive.
 * Supports single and multiple element selection.
 *
 * Rules:
 * - Supports multiple element selection (header + paragraph, etc.)
 * - Each selected element must be fully selected (no partial)
 * - All elements must be supported types
 * - Cannot wrap already-animated content
 */

import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $isElementNode,
  $isRootNode,
  type LexicalEditor,
  type LexicalNode,
  type ElementNode,
  type RangeSelection,
} from 'lexical';
import type { ValidationResult } from './types/Selection.types';
import { debugLog } from '@rapid-cmi5/ui';

// Allowed node types for animation wrapping
const ALLOWED_NODE_TYPES_MVP = [
  'paragraph',
  'heading',
  'toc-heading', // Custom TOCHeadingNode used in this codebase
  'image',
  'video',
  'audio',
  'list', // Ordered and unordered lists
] as const;

export class SelectionValidator {
  /**
   * Validate whether current selection can be wrapped
   *
   * Rules:
   * - Only validate when drawer is open (performance)
   * - Must be a valid range or node selection
   * - Must have content selected
   * - Supports single or multiple elements
   * - All elements must be supported node types
   * - Must not be inside existing directive
   * - Must be full element selection (no partial for single, auto-accept for multi)
   */
  static validateForWrapping(
    editor: LexicalEditor,
    animationDrawerOpen: boolean,
  ): ValidationResult {
    // PERFORMANCE GATE: Only validate if drawer is open
    if (!animationDrawerOpen) {
      return {
        isValid: false,
        reason: 'Animation drawer not open',
      };
    }

    return editor.getEditorState().read(() => {
      // ----------------------------------------
      // Check 1: Valid selection?
      const selection = $getSelection();
      if (!selection) {
        return {
          isValid: false,
          reason: 'No valid selection',
          suggestion: 'Select content in the editor first',
        };
      }

      // ----------------------------------------
      // Branch: Decorator nodes (images/video/audio) use NodeSelection
      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();

        // Allow multiple nodes - validate each individually
        for (const node of nodes) {
          const nodeType = node.getType();

          if (!this.isNodeTypeSupported(nodeType)) {
            return {
              isValid: false,
              reason: `"${nodeType}" elements not yet supported`,
              suggestion:
                'Animation supports: paragraphs, headings, lists, images, videos, and audio',
            };
          }

          if (this.isInsideAnimationDirective(node)) {
            return {
              isValid: false,
              reason:
                'One or more elements already inside an animation directive',
              suggestion:
                'Cannot nest animation directives. Unwrap the outer directive first.',
            };
          }
        }

        // All nodes validated - NodeSelection is considered full selection
        return { isValid: true };
      }

      // ----------------------------------------
      // Branch: Text/content uses RangeSelection
      if (!$isRangeSelection(selection)) {
        return {
          isValid: false,
          reason: 'No valid selection',
          suggestion: 'Select content in the editor first',
        };
      }

      debugLog(
        '[SelectionValidator] Range selection snapshot',
        {
          isCollapsed: selection.isCollapsed(),
          selectedTextLength: selection.getTextContent().trim().length,
          nodeCount: selection.getNodes().length,
        },
        undefined,
        'selection',
      );

      // Check 2: Anything selected?
      const domSelection = window.getSelection();
      const domSelectedText = domSelection?.isCollapsed
        ? ''
        : (domSelection?.toString().trim() ?? '');

      // Check for stale Lexical selection cache:
      // If DOM says nothing is selected but Lexical thinks something is,
      // the Lexical selection is stale (cached from previous selection)
      const lexicalSelectedText = selection.getTextContent().trim();
      if (!domSelectedText && lexicalSelectedText) {
        debugLog(
          '[SelectionValidator] Rejecting stale cached selection',
          {
            domSelectedText,
            lexicalSelectedText,
            note: 'DOM and Lexical selection mismatch - Lexical cache is stale',
          },
          undefined,
          'selection',
        );
        return {
          isValid: false,
          reason: 'Nothing selected',
          suggestion: 'Select a heading, paragraph, list, or image to animate',
        };
      }

      if (selection.isCollapsed() && !domSelectedText) {
        debugLog(
          '[SelectionValidator] Rejecting collapsed selection',
          undefined,
          undefined,
          'selection',
        );
        return {
          isValid: false,
          reason: 'Nothing selected',
          suggestion: 'Select a heading, paragraph, list, or image to animate',
        };
      }

      // Check 3: Get selected nodes
      const nodes = selection.getNodes();
      const nodesFallback =
        nodes.length === 0 && selection.isCollapsed()
          ? this.getTopLevelElementFromSelection(selection)
          : null;
      if (nodes.length === 0 && !nodesFallback) {
        return {
          isValid: false,
          reason: 'No nodes selected',
          suggestion: 'Select content to animate',
        };
      }

      const topLevelNodes = nodesFallback
        ? [nodesFallback]
        : this.getTopLevelElements(nodes);
      debugLog(
        '[SelectionValidator] Top-level nodes',
        topLevelNodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
        undefined,
        'selection',
      );

      // Allow multiple nodes - validate each individually
      if (topLevelNodes.length === 0) {
        return {
          isValid: false,
          reason: 'Could not determine top-level elements',
          suggestion: 'Select complete paragraphs or headings',
        };
      }

      // Validate each top-level node
      for (const topLevelNode of topLevelNodes) {
        // Check 5: Supported node type?
        const nodeType = topLevelNode.getType();
        if (!this.isNodeTypeSupported(nodeType)) {
          return {
            isValid: false,
            reason: `"${nodeType}" elements not yet supported`,
            suggestion:
              'Animation supports: paragraphs, headings, lists, images, videos, and audio',
          };
        }

        // Check 6: Not inside existing directive?
        if (this.isInsideAnimationDirective(topLevelNode)) {
          return {
            isValid: false,
            reason:
              'One or more elements already inside an animation directive',
            suggestion:
              'Cannot nest animation directives. Unwrap the outer directive first.',
          };
        }
      }

      // Check 7: Selection type detection (block vs inline)
      // For multi-select, we validate against the first and last nodes
      const firstNode = topLevelNodes[0];

      // Determine selection type
      const selectionType = this.getSelectionType(
        selection,
        topLevelNodes,
        domSelectedText,
      );

      debugLog(
        '[SelectionValidator] Selection type detected',
        { selectionType, nodeCount: topLevelNodes.length },
        undefined,
        'selection',
      );

      // If single node, check if it's inline or block
      if (topLevelNodes.length === 1) {
        if (selectionType === 'inline') {
          // Inline selection is valid!
          const selectedText =
            domSelectedText ?? selection.getTextContent().trim();
          debugLog(
            '[SelectionValidator] Accepting inline selection',
            {
              nodeType: firstNode.getType(),
              selectedTextLength: selectedText.length,
              elementTextLength: firstNode.getTextContent().trim().length,
              usedDomSelection: !!domSelectedText,
            },
            undefined,
            'selection',
          );
          return {
            isValid: true,
            selectionType: 'inline',
          };
        } else if (selectionType === 'invalid') {
          // Invalid partial selection (e.g., media node)
          return {
            isValid: false,
            reason: 'Partial selection not supported for this element type',
            suggestion:
              'Select the entire element or select text within a paragraph/heading',
          };
        }
        // selectionType === 'block' - continue to existing validation below
      } else {
        // Multiple nodes selected
        // For multi-select, we accept the selection as-is (user selected complete elements)
        // The wrapping logic will handle extracting and wrapping all top-level nodes
        debugLog(
          '[SelectionValidator] Multi-node selection accepted',
          {
            nodeCount: topLevelNodes.length,
            types: topLevelNodes.map((n) => n.getType()),
          },
          undefined,
          'selection',
        );
      }

      // All checks passed! ✅
      return {
        isValid: true,
      };
    });
  }

  /**
   * Check if node type is supported for wrapping
   */
  private static isNodeTypeSupported(nodeType: string): boolean {
    return (ALLOWED_NODE_TYPES_MVP as readonly string[]).includes(nodeType);
  }

  /**
   * Check if node is already inside an animation directive
   */
  private static isInsideAnimationDirective(node: LexicalNode): boolean {
    let current: LexicalNode | null = node;

    while (current) {
      // Check if this node is a directive node
      // We need to check the type and then access mdast if it's a directive
      if (current.getType() === 'directive') {
        // Try to get mdast node (directive nodes have this method)
        const mdastNode = (
          current as unknown as {
            getMdastNode?: () => { name?: string } | null;
          }
        ).getMdastNode?.();
        if (mdastNode && mdastNode.name === 'anim') {
          return true; // Inside an anim directive
        }
      }

      current = current.getParent();
    }

    return false;
  }

  /**
   * Get top-level elements (children of root) from selected nodes
   */
  private static getTopLevelElements(nodes: LexicalNode[]): ElementNode[] {
    const topLevel = new Set<ElementNode>();

    for (const node of nodes) {
      let current: LexicalNode | null = node;

      // Walk up to find top-level parent (direct child of root)
      while (current) {
        const parent: LexicalNode | null = current.getParent();
        if (!parent || $isRootNode(parent)) {
          if ($isElementNode(current)) {
            topLevel.add(current);
          }
          break;
        }
        current = parent;
      }
    }

    return Array.from(topLevel);
  }

  /**
   * When the RangeSelection is collapsed but the browser selection has text,
   * derive the top-level element from the anchor node.
   */
  private static getTopLevelElementFromSelection(
    selection: RangeSelection,
  ): ElementNode | null {
    let current: LexicalNode | null = selection.anchor.getNode();

    while (current) {
      const parent: LexicalNode | null = current.getParent();
      if (!parent || $isRootNode(parent)) {
        return $isElementNode(current) ? current : null;
      }
      current = parent;
    }

    return null;
  }

  /**
   * Check if entire element is selected (not partial)
   *
   * For text nodes: selection must match full content
   * For media nodes: always considered full (can't partially select an image)
   */
  private static isFullElementSelected(
    selection: RangeSelection,
    element: ElementNode,
    domSelectedText?: string,
  ): boolean {
    const nodeType = element.getType();

    // For media nodes (image/video/audio): Always considered fully selected
    // You can't partially select an image
    if (['image', 'video', 'audio'].includes(nodeType)) {
      return true;
    }

    const selectedTextRaw = domSelectedText ?? selection.getTextContent();
    const selectedText = selectedTextRaw.trim();

    // Get the selected nodes - should only include this element or its children
    const selectedNodes = selection.getNodes();

    // Simple heuristic: if we have the right number of child nodes selected,
    // and the selection isn't empty, consider it a full selection
    // This is more lenient than text comparison but works better with formatting
    const elementChildren = element.getChildren();

    // If element has no children (empty), reject
    if (elementChildren.length === 0) {
      return false;
    }

    // Check if selection includes all children by comparing node count
    // For a paragraph with mixed formatting, we should get all text nodes
    const allChildrenSelected = selectedNodes.some((node) => {
      let current: LexicalNode | null = node;
      while (current) {
        if (current === element) {
          return true;
        }
        current = current.getParent();
      }
      return false;
    });

    // Also check text content as a fallback
    const elementText = element.getTextContent();

    debugLog(
      'isFullElementSelected',
      {
        nodeType,
        elementTextLength: elementText.trim().length,
        selectedTextLength: selectedText.length,
        allChildrenSelected,
        elementTextPreview: elementText.trim().slice(0, 50),
        selectedTextPreview: selectedText.slice(0, 50),
      },
      undefined,
      'selection',
    );

    const lengthMatch =
      selectedText === elementText.trim() ||
      selectedText.length >= elementText.trim().length * 0.95;

    // If we came from DOM selection with no Lexical nodes, use length heuristic
    // as a stand-in for child coverage.
    if (!allChildrenSelected && selectedNodes.length === 0) {
      return lengthMatch;
    }

    // Consider it fully selected if text matches OR if we have good node coverage
    return (
      allChildrenSelected && lengthMatch // 95% threshold
    );
  }

  /**
   * Determine selection type: 'block', 'inline', or 'invalid'
   *
   * Support inline selections for text elements
   *
   * - 'block': Full element selected OR media node
   * - 'inline': Partial text within single text element (paragraph/heading)
   * - 'invalid': Multi-element or unsupported partial selection
   */
  private static getSelectionType(
    selection: RangeSelection,
    topLevelNodes: ElementNode[],
    domSelectedText?: string,
  ): 'block' | 'inline' | 'invalid' {
    // Multi-element selection is always block-level
    if (topLevelNodes.length > 1) {
      return 'block';
    }

    if (topLevelNodes.length === 0) {
      return 'invalid';
    }

    const element = topLevelNodes[0];
    const nodeType = element.getType();

    // Media nodes are always block-level (can't partially select)
    if (['image', 'video', 'audio'].includes(nodeType)) {
      return 'block';
    }

    // Check if this is a text-containing element
    const isTextElement = ['paragraph', 'heading', 'toc-heading'].includes(
      nodeType,
    );
    if (!isTextElement) {
      // Non-text elements (lists, etc.) must be fully selected
      return this.isFullElementSelected(selection, element, domSelectedText)
        ? 'block'
        : 'invalid';
    }

    // For text elements, check if it's a partial selection
    const isFullSelection = this.isFullElementSelected(
      selection,
      element,
      domSelectedText,
    );

    if (isFullSelection) {
      return 'block'; // Full element selected
    }

    // Partial text selection within a single element - this is inline!
    if (this.isInlineSelection(selection, element, domSelectedText)) {
      return 'inline';
    }

    return 'invalid';
  }

  /**
   * Check if selection is a valid inline selection
   *
   * An inline selection is:
   * - Within a single paragraph/heading
   * - Does NOT span full element text
   * - Has actual text content selected
   */
  private static isInlineSelection(
    selection: RangeSelection,
    element: ElementNode,
    domSelectedText?: string,
  ): boolean {
    const nodeType = element.getType();

    // Only text elements support inline selections
    if (!['paragraph', 'heading', 'toc-heading'].includes(nodeType)) {
      return false;
    }

    // Must have text selected (check both Lexical and DOM selections)
    const selectedText = domSelectedText ?? selection.getTextContent().trim();
    debugLog(
      '[SelectionValidator] isInlineSelection check',
      {
        nodeType,
        domSelectedText,
        lexicalSelectedText: selection.getTextContent().trim(),
        finalSelectedText: selectedText,
      },
      undefined,
      'selection',
    );
    if (!selectedText) {
      return false;
    }

    // Selection must be within this single element
    const selectedNodes = selection.getNodes();
    const allNodesInElement = selectedNodes.every((node) => {
      let current: LexicalNode | null = node;
      while (current) {
        if (current === element) {
          return true;
        }
        current = current.getParent();
      }
      return false;
    });

    if (!allNodesInElement) {
      return false; // Selection spans multiple elements
    }

    // It's a valid inline selection!
    return true;
  }
}
