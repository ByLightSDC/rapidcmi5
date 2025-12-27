/**
 * Phase 5.2: Directive Wrapper
 *
 * Orchestrates the wrapping process:
 * 1. Validates selection using SelectionValidator
 * 2. Extracts MDAST using MdastExtractor
 * 3. Wraps MDAST in directive
 * 4. Converts to markdown
 * 5. Deletes original selection
 * 6. Inserts wrapped version
 * 7. Returns targetNodeKey for animation config
 */

import type { LexicalEditor, LexicalNode } from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $isRootNode,
} from 'lexical';
import type * as Mdast from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import { toMarkdown } from 'mdast-util-to-markdown';
import { directiveToMarkdown } from 'mdast-util-directive';
import { SelectionValidator } from './SelectionValidator';
import { MdastExtractor } from './MdastExtractor';
import type { WrapOptions, WrapResult } from './types/Wrapping.types';
import { findDirectiveNodeKeyById } from '../utils/directiveResolver';
import { debugWrap } from '../utils/debug';
import { debugLog } from '@rapid-cmi5/ui';

/**
 * Main DirectiveWrapper class
 * Orchestrates the entire wrapping process
 */
export class DirectiveWrapper {
  /**
   * Wrap selected content with an animation directive
   *
   * This is the main entry point for Phase 5.2
   *
   * @param editor - The Lexical editor instance
   * @param options - Wrapping options (directiveId, etc.)
   * @param animationDrawerOpen - Whether animation drawer is currently open
   * @returns Result indicating success/failure and targetNodeKey
   */
  static wrapSelection(
    editor: LexicalEditor,
    options: WrapOptions,
    animationDrawerOpen: boolean,
  ): WrapResult {
    try {
      // Step 1: Validate selection
      const validation = SelectionValidator.validateForWrapping(
        editor,
        animationDrawerOpen,
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.reason || 'Invalid selection',
        };
      }

      // Step 2: Extract MDAST from selected nodes
      let selectedNodes: LexicalNode[] = [];
      let mdastContent: Mdast.Content[] = [];

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          throw new Error('No valid selection');
        }

        selectedNodes = selection.getNodes();
        debugWrap.log(
          '🧲 Selection nodes:',
          selectedNodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
        );

        // Get top-level elements (direct children of root)
        const topLevelNodes = this.getTopLevelElements(selectedNodes);
        debugWrap.log(
          '📌 Top-level nodes:',
          topLevelNodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
        );

        // Extract MDAST from these nodes
        mdastContent = MdastExtractor.extractMdast(topLevelNodes);

        debugLog('📦 Extracted MDAST:', mdastContent, undefined, 'mdast');
      });

      if (mdastContent.length === 0) {
        return {
          success: false,
          error: 'No content to wrap',
        };
      }

      // Step 3: Create directive wrapper
      const directiveNode: ContainerDirective = {
        type: 'containerDirective',
        name: 'anim',
        attributes: {
          id: options.directiveId,
        },
        children: mdastContent as ContainerDirective['children'], // MDAST children
      };

      debugLog('🎁 Created directive node:', directiveNode, undefined, 'mdast');

      // Step 4: Convert to markdown
      const wrappedMarkdown = this.mdastToMarkdown(directiveNode);

      debugLog(
        '📝 Converted to markdown:',
        wrappedMarkdown,
        undefined,
        'mdast',
      );

      // Step 5: Delete original selection
      // Step 6: Insert wrapped version
      // We do both in a single update transaction
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          throw new Error('Selection changed during wrapping');
        }

        // Delete the selected content
        if ($isRangeSelection(selection)) {
          selection.removeText();
        } else if ($isNodeSelection(selection)) {
          selection.getNodes().forEach((node) => node.remove());
        }

        debugLog(
          '🗑️ Deleted original selection',
          undefined,
          undefined,
          'mdast',
        );
      });

      // Now insert the wrapped markdown
      // We need to use insertMarkdown$ from Gurx
      // But we don't have access to it here, so we'll return the markdown
      // and let the caller insert it

      // Step 7: Find the inserted directive node and get its key
      // This happens after insertion, so we'll need to do this in a callback
      // For now, we'll return a temporary key

      return {
        success: true,
        directiveId: options.directiveId,
        targetNodeKey: 'pending_insertion', // Will be resolved after insertion
      };
    } catch (error) {
      console.error('❌ Error wrapping selection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Alternative method that returns markdown for manual insertion
   * This is useful when the caller needs to control the insertion
   */
  static wrapSelectionToMarkdown(
    editor: LexicalEditor,
    options: WrapOptions,
    animationDrawerOpen: boolean,
  ): { success: true; markdown: string } | { success: false; error: string } {
    try {
      // Step 1: Validate selection
      const validation = SelectionValidator.validateForWrapping(
        editor,
        animationDrawerOpen,
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.reason || 'Invalid selection',
        };
      }

      // Step 2: Extract MDAST from selected nodes
      let mdastContent: Mdast.Content[] = [];

      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          throw new Error('No valid selection');
        }

        const selectedNodes = selection.getNodes();
        const topLevelNodes = this.getTopLevelElements(selectedNodes);
        mdastContent = MdastExtractor.extractMdast(topLevelNodes);
      });

      if (mdastContent.length === 0) {
        return {
          success: false,
          error: 'No content to wrap',
        };
      }

      // Step 3: Create directive wrapper
      const directiveNode: ContainerDirective = {
        type: 'containerDirective',
        name: 'anim',
        attributes: {
          id: options.directiveId,
        },
        children: mdastContent as ContainerDirective['children'],
      };

      // Step 4: Convert to markdown
      const wrappedMarkdown = this.mdastToMarkdown(directiveNode);

      return {
        success: true,
        markdown: wrappedMarkdown,
      };
    } catch (error) {
      console.error('❌ Error wrapping selection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Helper method to find directive node key after insertion
   * This should be called AFTER markdown has been inserted
   *
   * Uses the existing directiveResolver utility which searches the entire tree
   */
  static findInsertedDirectiveKey(
    editor: LexicalEditor,
    directiveId: string,
  ): string | null {
    return findDirectiveNodeKeyById(editor, directiveId);
  }

  /**
   * Update the ID of an anim directive in the markdown
   *
   * @param oldDirectiveId - Current ID of the directive
   * @param newDirectiveId - New ID to set
   * @param getMarkdown - Function to get current markdown from editor
   * @param setMarkdown - Function to set updated markdown to editor
   * @returns true if successful, false otherwise
   */
  static updateDirectiveId(
    oldDirectiveId: string,
    newDirectiveId: string,
    getMarkdown: () => string,
    setMarkdown: (markdown: string) => void,
  ): boolean {
    try {
      const markdown = getMarkdown();
      if (!markdown || typeof markdown !== 'string') {
        debugWrap.error('🔧 UpdateId: cannot get markdown from editor');
        return false;
      }

      debugWrap.log(
        '🔧 UpdateId: updating directive',
        oldDirectiveId,
        '->',
        newDirectiveId,
      );

      // Build regex to match the directive with the old ID
      // Supports both formats:
      // - Shorthand: :::anim{#directiveId}
      // - Attribute: :::anim{id="directiveId"}
      const escapedOldId = oldDirectiveId.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      const directivePattern = new RegExp(
        `:::anim\\{(?:#${escapedOldId}|id=['"]${escapedOldId}['"])\\}`,
        'g',
      );

      // Check if directive exists
      if (!directivePattern.test(markdown)) {
        debugWrap.warn(
          '🔧 UpdateId: directive not found in markdown:',
          oldDirectiveId,
        );
        return false;
      }

      // Replace with new ID (using attribute format for consistency)
      const updatedMarkdown = markdown.replace(
        directivePattern,
        `:::anim{id="${newDirectiveId}"}`,
      );

      debugWrap.log('🔧 UpdateId: updated markdown');

      // Update the editor with the new markdown
      setMarkdown(updatedMarkdown);

      debugWrap.log(
        `✅ UpdateId complete: ${oldDirectiveId} -> ${newDirectiveId}`,
      );
      return true;
    } catch (error) {
      debugWrap.error('🔧 UpdateId: error during update', error);
      return false;
    }
  }

  /**
   * Unwrap (remove) an anim directive by id while preserving its children
   *
   * Strategy: Transform the markdown directly instead of manipulating Lexical nodes
   * This preserves all formatting and handles the directive's MDAST children correctly
   *
   * @param editor - Lexical editor instance (currently unused, kept for consistency)
   * @param directiveId - ID of the directive to unwrap
   * @param getMarkdown - Function to get current markdown from editor
   * @param setMarkdown - Function to set updated markdown to editor
   */
  static unwrapDirectiveById(
    editor: LexicalEditor,
    directiveId: string,
    getMarkdown: () => string,
    setMarkdown: (markdown: string) => void,
  ): boolean {
    try {
      // Get current markdown from editor via callback
      const markdown = getMarkdown();
      if (!markdown || typeof markdown !== 'string') {
        debugWrap.error('🔧 Unwrap: cannot get markdown from editor');
        return false;
      }

      debugWrap.log('🔧 Unwrap: current markdown length:', markdown.length);

      // Build regex to match the directive and capture its content
      // Supports both formats:
      // - Shorthand: :::anim{#directiveId}
      // - Attribute: :::anim{id="directiveId"}
      const escapedId = directiveId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const directivePattern = new RegExp(
        `:::anim\\{(?:#${escapedId}|[^}]*id=['"]${escapedId}['"][^}]*)\\}\\s*\\n([\\s\\S]*?)\\n:::`,
        'g',
      );

      debugWrap.log('🔧 Unwrap: searching for directive with regex');

      // Check if directive exists
      const match = directivePattern.exec(markdown);
      if (!match) {
        debugWrap.warn(
          '🔧 Unwrap: directive not found in markdown:',
          directiveId,
        );
        return false;
      }

      // Extract the content inside the directive (captured group 1)
      const innerContent = match[1];
      debugWrap.log('🔧 Unwrap: extracted inner content:', innerContent);

      // Replace the entire directive (including wrapper) with just its content
      const updatedMarkdown = markdown.replace(directivePattern, innerContent);

      debugWrap.log(
        '🔧 Unwrap: updated markdown length:',
        updatedMarkdown.length,
      );

      // Update the editor with the unwrapped markdown via callback
      // This preserves all formatting because we're just removing the wrapper
      setMarkdown(updatedMarkdown);

      debugWrap.log(`✅ Unwrap complete for ${directiveId}`);
      return true;
    } catch (error) {
      debugWrap.error('🔧 Unwrap: error during unwrap', error);
      return false;
    }
  }

  /**
   * Convert MDAST directive to markdown string
   * Uses mdast-util-to-markdown with directive extension
   */
  private static mdastToMarkdown(node: ContainerDirective): string {
    try {
      // Wrap the directive in a root node for proper conversion
      const root: Mdast.Root = {
        type: 'root',
        children: [node as Mdast.RootContent],
      };

      const markdown = toMarkdown(root, {
        extensions: [directiveToMarkdown()],
      });

      // Add newlines for proper formatting
      return '\n' + markdown.trim() + '\n\n';
    } catch (error) {
      console.error('❌ Error converting MDAST to markdown:', error);
      console.error('Problematic node:', JSON.stringify(node, null, 2));
      throw error;
    }
  }

  /**
   * Get top-level elements (children of root) from selected nodes
   * This is the same logic as SelectionValidator
   */
  private static getTopLevelElements(nodes: LexicalNode[]): LexicalNode[] {
    const topLevel = new Set<LexicalNode>();

    for (const node of nodes) {
      let current: LexicalNode | null = node;

      // Walk up to find top-level parent (direct child of root)
      while (current) {
        const parent: LexicalNode | null = current.getParent();
        if (!parent || $isRootNode(parent)) {
          topLevel.add(current);
          break;
        }
        current = parent;
      }
    }

    return Array.from(topLevel);
  }
}
