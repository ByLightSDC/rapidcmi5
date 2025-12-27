/**
 * Phase 5.1: Selection Validator
 *
 * Validates whether selected content can be wrapped with an animation directive.
 * Uses RESTRICTIVE validation rules for MVP - only allow simple, single elements.
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

// Phase 5.1 MVP: Only allow these node types
const ALLOWED_NODE_TYPES_MVP = [
  'paragraph',
  'heading',
  'toc-heading', // Custom TOCHeadingNode used in this codebase
  'image',
  'video',
  'audio',
] as const;

export class SelectionValidator {
  /**
   * Validate whether current selection can be wrapped
   *
   * Phase 5.1 MVP Rules (RESTRICTIVE):
   * - Only validate when drawer is open (performance)
   * - Must be a valid range selection
   * - Must have content selected
   * - Must be single element only (no multi-select)
   * - Must be supported node type
   * - Must not be inside existing directive
   * - Must be full element selection (no partial)
   */
  static validateForWrapping(
    editor: LexicalEditor,
    animationDrawerOpen: boolean
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
        if (nodes.length !== 1) {
          return {
            isValid: false,
            reason: 'Multiple elements selected',
            suggestion:
              'Phase 5.1: Select only one element at a time. Multi-select coming in Phase 5.2!',
          };
        }

        const node = nodes[0];
        const nodeType = node.getType();

        if (!this.isNodeTypeSupported(nodeType)) {
          return {
            isValid: false,
            reason: `"${nodeType}" elements not yet supported`,
            suggestion:
              'Phase 5.1 supports: paragraphs, headings, images, videos, and audio',
          };
        }

        if (this.isInsideAnimationDirective(node)) {
          return {
            isValid: false,
            reason: 'Already inside an animation directive',
            suggestion:
              'Cannot nest animation directives. Unwrap the outer directive first.',
          };
        }

        // NodeSelection of supported media is considered a full selection
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

      // Check 2: Anything selected?
      if (selection.isCollapsed()) {
        return {
          isValid: false,
          reason: 'Nothing selected',
          suggestion: 'Select a heading, paragraph, or image to animate',
        };
      }

      // Check 3: Get selected nodes
      const nodes = selection.getNodes();
      if (nodes.length === 0) {
        return {
          isValid: false,
          reason: 'No nodes selected',
          suggestion: 'Select content to animate',
        };
      }

      // Check 4: MVP - Single element only
      // Phase 5.2 will relax this restriction
      const topLevelNodes = this.getTopLevelElements(nodes);
      if (topLevelNodes.length > 1) {
        return {
          isValid: false,
          reason: 'Multiple elements selected',
          suggestion:
            'Phase 5.1: Select only one element at a time. Multi-select coming in Phase 5.2!',
        };
      }

      const topLevelNode = topLevelNodes[0];
      if (!topLevelNode) {
        return {
          isValid: false,
          reason: 'Could not determine top-level element',
          suggestion: 'Select a complete paragraph or heading',
        };
      }

      // Check 5: Supported node type?
      const nodeType = topLevelNode.getType();
      if (!this.isNodeTypeSupported(nodeType)) {
        return {
          isValid: false,
          reason: `"${nodeType}" elements not yet supported`,
          suggestion:
            'Phase 5.1 supports: paragraphs, headings, images, videos, and audio',
        };
      }

      // Check 6: Not inside existing directive?
      if (this.isInsideAnimationDirective(topLevelNode)) {
        return {
          isValid: false,
          reason: 'Already inside an animation directive',
          suggestion: 'Cannot nest animation directives. Unwrap the outer directive first.',
        };
      }

      // Check 7: Full element selected? (MVP - no partial selections)
      // Phase 5.4 will add partial selection support
      if (!this.isFullElementSelected(selection, topLevelNode)) {
        return {
          isValid: false,
          reason: 'Partial selection detected',
          suggestion:
            'Select the entire element (not just part of it). Partial selections coming in Phase 5.4!',
        };
      }

      // All checks passed! ✅
      return {
        isValid: true,
      };
    });
  }

  /**
   * Check if node type is supported for wrapping (Phase 5.1 MVP)
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
        const mdastNode = (current as any).getMdastNode?.();
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
   * Check if entire element is selected (not partial)
   *
   * For text nodes: selection must match full content
   * For media nodes: always considered full (can't partially select an image)
   */
  private static isFullElementSelected(
    selection: RangeSelection,
    element: ElementNode
  ): boolean {
    const nodeType = element.getType();

    // For media nodes (image/video/audio): Always considered fully selected
    // You can't partially select an image
    if (['image', 'video', 'audio'].includes(nodeType)) {
      return true;
    }

    // For text-containing nodes: Check if selection spans the entire element
    // More robust than comparing text content (which can have formatting issues)
    const anchor = selection.anchor;
    const focus = selection.focus;

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
    const allChildrenSelected = selectedNodes.some(node => {
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
    const selectedText = selection.getTextContent();

    // Consider it fully selected if text matches OR if we have good node coverage
    return (
      allChildrenSelected &&
      (selectedText.trim() === elementText.trim() ||
       selectedText.trim().length >= elementText.trim().length * 0.95) // 95% threshold
    );
  }
}
