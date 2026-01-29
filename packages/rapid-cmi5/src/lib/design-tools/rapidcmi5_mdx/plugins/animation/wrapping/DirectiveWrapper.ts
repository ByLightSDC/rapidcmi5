/**
 * Directive Wrapper (Refactored)
 *
 * NEW ARCHITECTURE: Uses wrapSelectionOrBlock pattern from InsertLayoutBox
 *
 * Orchestrates the wrapping process:
 * 1. Validates selection using SelectionValidator
 * 2. Exports selected nodes to markdown using exportMarkdownFromLexical (MDXEditor's official utility)
 * 3. Re-imports markdown to get MDAST tree
 * 4. Wraps MDAST in animation directive
 * 5. Creates Lexical DirectiveNode using $createDirectiveNode
 * 6. Inserts directive node directly (no markdown round-trip!)
 * 7. Returns targetNodeKey immediately
 *
 * BENEFITS:
 * - No custom MdastExtractor needed (removed 348 lines!)
 * - Leverages MDXEditor's exportMarkdownFromLexical (supports ALL node types automatically)
 * - Direct Lexical node insertion (more reliable, faster)
 * - Single update transaction (better performance, no flicker)
 */

import type { LexicalEditor, LexicalNode } from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $setSelection,
  $getNodeByKey,
} from 'lexical';
import type { ContainerDirective, TextDirective } from 'mdast-util-directive';
import { SelectionValidator } from './SelectionValidator';
import type { WrapOptions, WrapResult } from './types/Wrapping.types';

import { $createDirectiveNode, type DirectiveNode } from '@mdxeditor/editor';
import type { BlockContent, PhrasingContent } from 'mdast';
import type { Options as ToMarkdownOptions } from 'mdast-util-to-markdown';
import { convertMarkdownToMdast, debugLog, defaultToMarkdownExtensions, exportMarkdownFromLexical, placeCaretInsideDirective } from '@rapid-cmi5/ui';

const DEFAULT_MARKDOWN_OPTIONS: ToMarkdownOptions = {
  listItemIndent: 'one',
};

/**
 * Main DirectiveWrapper class
 * Orchestrates the entire wrapping process using the wrapSelectionOrBlock pattern
 */
export class DirectiveWrapper {
  /**
   * Wrap selected content with an animation directive
   *
   * NEW IMPLEMENTATION: Uses wrapSelectionOrBlock pattern from InsertLayoutBox
   *
   * @param editor - The Lexical editor instance
   * @param options - Wrapping options (directiveId, etc.)
   * @param animationDrawerOpen - Whether animation drawer is currently open
   * @param exportVisitors - Export visitors from MDXEditor
   * @param jsxComponentDescriptors - JSX component descriptors
   * @param jsxIsAvailable - Whether JSX is available
   * @param syntaxExtensions - Syntax extensions for markdown parsing
   * @returns Result indicating success/failure and targetNodeKey
   */
  static wrapSelection(
    editor: LexicalEditor,
    options: WrapOptions,
    animationDrawerOpen: boolean,
    exportVisitors: any,
    jsxComponentDescriptors: any,
    jsxIsAvailable: boolean,
    syntaxExtensions: any,
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

      // Route to inline or block wrapping based on selection type
      if (validation.selectionType === 'inline') {
        return this.wrapInlineSelection(
          editor,
          options,
          exportVisitors,
          jsxComponentDescriptors,
          jsxIsAvailable,
          syntaxExtensions,
        );
      }

      // Block wrapping (existing logic)
      let directiveKey: string | null = null;

      // Step 2-7: All in one update transaction
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          throw new Error('No valid selection');
        }

        // Determine which nodes to wrap and whether to replace the block
        const block = $isRangeSelection(selection)
          ? selection.anchor.getNode().getTopLevelElementOrThrow()
          : null;

        let theNodes: LexicalNode[] = [];
        let replaceBlock = false;

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            theNodes = block ? [block] : [];
            replaceBlock = true;
          } else {
            // Gather selected nodes without removing them (avoid extract tearing out selection)
            const selectedNodes = selection.getNodes();

            debugLog(
              '🧾 Range selection snapshot (pre-wrap)',
              {
                isCollapsed: selection.isCollapsed(),
                anchorKey: selection.anchor.getNode().getKey(),
                focusKey: selection.focus.getNode().getKey(),
                selectedNodes: selectedNodes.map((n) => ({
                  key: n.getKey(),
                  type: n.getType(),
                  hasParent: Boolean(n.getParent()),
                })),
              },
              undefined,
              'wrap',
            );

            // Check if this is a single-block full selection
            // Don't filter yet - just check if selection matches the block text

            // Only use single-block optimization if:
            // 1. Selection text matches the block text exactly
            // 2. AND we're selecting within a single paragraph/heading (not spanning multiple elements)
            if (
              block &&
              selection.getTextContent() === block.getTextContent() &&
              block.getKey() ===
                selection.anchor.getNode().getTopLevelElementOrThrow().getKey()
            ) {
              theNodes = [block];
              replaceBlock = true;
            } else {
              // Use selected nodes as-is; top-level filtering happens later
              theNodes = selectedNodes;
            }
          }
        } else if ($isNodeSelection(selection)) {
          theNodes = selection.getNodes();
        }

        debugLog(
          '🧲 Selected nodes:',
          theNodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
          undefined,
          'wrap',
        );

        // Filter to top-level nodes only
        const selectedKeys = new Set(theNodes.map((node) => node.getKey()));
        let topLevelNodes = theNodes.filter((node) => {
          const parent = node.getParent();
          const parentInSelected = parent
            ? selectedKeys.has(parent.getKey())
            : false;
          const isTopLevel = !parent || !parentInSelected;

          return isTopLevel;
        });

        debugLog(
          '📌 Top-level nodes:',
          topLevelNodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
          undefined,
          'wrap',
        );

        // Guard: if focus is at offset 0 of the next top-level node, trim that tail node
        if ($isRangeSelection(selection) && topLevelNodes.length > 1) {
          const anchorTop = selection.anchor
            .getNode()
            .getTopLevelElementOrThrow();
          const focusTop = selection.focus
            .getNode()
            .getTopLevelElementOrThrow();

          const lastTop = topLevelNodes[topLevelNodes.length - 1];
          const focusIsLastTop = focusTop.getKey() === lastTop.getKey();
          const anchorDiffers = anchorTop.getKey() !== focusTop.getKey();
          const focusAtStart = selection.focus.offset === 0;

          if (focusIsLastTop && anchorDiffers && focusAtStart) {
            debugLog(
              '✂️ Trimming trailing top-level node at focus offset 0',
              {
                trimmedKey: lastTop.getKey(),
                trimmedType: lastTop.getType(),
                anchorKey: anchorTop.getKey(),
                focusKey: focusTop.getKey(),
              },
              undefined,
              'wrap',
            );
            topLevelNodes = topLevelNodes.slice(0, -1);
          }
        }

        // Extra safety/logging: bail early if we detect orphan nodes
        const orphanNodes = topLevelNodes.filter((n) => !n.getParent());
        if (orphanNodes.length > 0) {
          console.error(
            '[DirectiveWrapper] Aborting wrap: orphan top-level nodes',
            {
              orphanNodes: orphanNodes.map((n) => ({
                key: n.getKey(),
                type: n.getType(),
              })),
              selectedSnapshot: theNodes.map((n) => ({
                key: n.getKey(),
                type: n.getType(),
                hasParent: Boolean(n.getParent()),
              })),
            },
          );
          throw new Error('Selection contained orphan nodes');
        }

        // Export markdown from top-level nodes using MDXEditor's official utility
        let theMarkDown = '';
        for (const node of topLevelNodes) {
          const theNewMarkdownValue = exportMarkdownFromLexical({
            root: node,
            visitors: exportVisitors,
            jsxComponentDescriptors,
            toMarkdownExtensions: defaultToMarkdownExtensions,
            toMarkdownOptions: DEFAULT_MARKDOWN_OPTIONS,
            jsxIsAvailable,
          });
          theMarkDown += theNewMarkdownValue;
        }

        debugLog('📝 Exported markdown:', theMarkDown, undefined, 'wrap');

        // Fallback for empty content
        if (!theMarkDown.trim()) {
          throw new Error('No content to wrap');
        }

        // Re-import markdown to get MDAST
        // Use convertMarkdownToMdast helper which includes all necessary extensions (MDX, directives, etc.)
        const theChildMDast = convertMarkdownToMdast(
          theMarkDown,
          syntaxExtensions,
        );

        debugLog('📦 Parsed MDAST:', theChildMDast, undefined, 'wrap');

        // Create directive with MDAST children
        const mdast: ContainerDirective = {
          type: 'containerDirective',
          name: 'anim',
          attributes: {
            id: options.directiveId,
          },
          children: (theChildMDast?.children as BlockContent[]) || [],
        };

        debugLog('🎁 Created directive MDAST:', mdast, undefined, 'wrap');

        // Create Lexical directive node from MDAST

        const dir = $createDirectiveNode(mdast) as DirectiveNode;

        debugLog(
          '🔨 Created Lexical directive node:',
          dir.getKey(),
          undefined,
          'wrap',
        );

        // Insert the directive node
        if (replaceBlock && topLevelNodes.length > 0) {
          // Replace the entire block

          $setSelection(null);
          topLevelNodes[0].replace(dir);

          debugLog(
            '✅ Replaced block with directive',
            undefined,
            undefined,
            'wrap',
          );
        } else {
          // Manual replace of selected top-level nodes to avoid selection.insertNodes
          if (topLevelNodes.length === 0) {
            throw new Error('No top-level nodes to replace');
          }

          const firstParent = topLevelNodes[0].getParent();
          if (!firstParent) {
            throw new Error('First top-level node has no parent');
          }

          // Insert directive before the first selected top-level node
          topLevelNodes[0].insertBefore(dir);

          // Remove all selected top-level nodes (they are now after the directive)
          topLevelNodes.forEach((n) => n.remove());

          debugLog(
            '✅ Inserted directive via manual replace of top-level nodes',
            {
              replacedCount: topLevelNodes.length,
              insertedKey: dir.getKey(),
            },
            undefined,
            'wrap',
          );
        }

        // Get the directive key immediately
        directiveKey = dir.getKey();

        debugLog('🔑 Directive key:', directiveKey, undefined, 'wrap');
      });

      if (!directiveKey) {
        return {
          success: false,
          error: 'Failed to get directive key after insertion',
        };
      }

      // Verify the node exists in the editor state
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(directiveKey!);
      });

      // CRITICAL: Place caret inside the directive to trigger markdown export
      // This performs additional editor.update() calls that trigger the export visitors

      placeCaretInsideDirective(editor, directiveKey);

      return {
        success: true,
        directiveId: options.directiveId,
        targetNodeKey: directiveKey,
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
   * Wrap inline text selection with an animation directive
   *
   * Support for inline animations
   * Creates a textDirective instead of containerDirective
   *
   * CRITICAL FIX: Use getTextContent() instead of extract() to avoid corrupting
   * adjacent formatted nodes. The extract() method can affect nodes outside the
   * selection when dealing with inline formatting.
   *
   * @param editor - The Lexical editor instance
   * @param options - Wrapping options (directiveId, etc.)
   * @param exportVisitors - Export visitors from MDXEditor
   * @param jsxComponentDescriptors - JSX component descriptors
   * @param jsxIsAvailable - Whether JSX is available
   * @param syntaxExtensions - Syntax extensions for markdown parsing
   * @returns Result indicating success/failure and targetNodeKey
   */
  static wrapInlineSelection(
    editor: LexicalEditor,
    options: WrapOptions,
    exportVisitors: any,
    jsxComponentDescriptors: any,
    jsxIsAvailable: boolean,
    syntaxExtensions: any,
  ): WrapResult {
    try {
      let directiveKey: string | null = null;

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          throw new Error('No range selection for inline wrapping');
        }

        // Extract the selected nodes to get their content
        // This removes them from the document and returns them
        const selectedNodes = selection.extract();

        debugLog(
          '🎯 Inline wrapping: extracted nodes',
          selectedNodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
          undefined,
          'wrap',
        );

        // Filter to top-level nodes only (same pattern as FxDirective)
        const selectedKeys = new Set(
          selectedNodes.map((node) => node.getKey()),
        );
        const topLevelNodes = selectedNodes.filter((node) => {
          const parent = node.getParent();
          return !parent || !selectedKeys.has(parent.getKey());
        });

        // Export top-level nodes to markdown to preserve formatting
        let selectedMarkdown = '';
        for (const node of topLevelNodes) {
          const markdown = exportMarkdownFromLexical({
            root: node,
            visitors: exportVisitors,
            jsxComponentDescriptors,
            toMarkdownExtensions: defaultToMarkdownExtensions,
            toMarkdownOptions: DEFAULT_MARKDOWN_OPTIONS,
            jsxIsAvailable,
          });

          // CRITICAL: Remove trailing newlines (same as FxDirective line 196)
          selectedMarkdown += markdown.replace(/[\r\n]+$/, '');
        }

        debugLog('📝 Selected markdown:', selectedMarkdown, undefined, 'wrap');

        if (!selectedMarkdown) {
          throw new Error('No content to wrap inline');
        }

        // Parse the markdown to get MDAST nodes (to preserve formatting)
        // Use the same convertMarkdownToMdast helper as FxDirective
        const contentMDast = convertMarkdownToMdast(
          selectedMarkdown,
          syntaxExtensions,
        );

        debugLog('📦 Content MDAST:', contentMDast, undefined, 'wrap');

        // Create the textDirective MDAST node with MDAST children
        // CRITICAL: Use children directly like FxDirective - do NOT unwrap!
        // FxDirective line 244: children: (theChildMDast?.children as PhrasingContent[])
        const textDirective: TextDirective = {
          type: 'textDirective',
          name: 'anim',
          attributes: {
            id: options.directiveId,
          },
          children: (contentMDast?.children as PhrasingContent[]) || [],
        };

        debugLog(
          '🎁 Created textDirective MDAST:',
          textDirective,
          undefined,
          'wrap',
        );

        // Create Lexical directive node from MDAST
        const dir = $createDirectiveNode(textDirective) as DirectiveNode;

        debugLog(
          '🔨 Created inline Lexical node:',
          dir.getKey(),
          undefined,
          'wrap',
        );

        // Insert at selection (replacing the selected text)
        // This should now preserve adjacent formatting
        selection.insertNodes([dir]);

        debugLog('✅ Inserted inline directive', undefined, undefined, 'wrap');

        // Get the directive key
        directiveKey = dir.getKey();
      });

      if (!directiveKey) {
        return {
          success: false,
          error: 'Failed to get inline directive key after insertion',
        };
      }

      // Verify node exists
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(directiveKey!);
      });

      // Place caret after the inline directive
      placeCaretInsideDirective(editor, directiveKey);

      return {
        success: true,
        directiveId: options.directiveId,
        targetNodeKey: directiveKey,
      };
    } catch (error) {
      console.error('❌ Error wrapping inline selection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
