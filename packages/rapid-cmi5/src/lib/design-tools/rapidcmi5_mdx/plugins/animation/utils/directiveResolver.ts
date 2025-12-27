/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import { $getRoot, LexicalEditor } from 'lexical';
import { $isDirectiveNode } from '@mdxeditor/editor';
import { debugWrap } from '../utils/debug';
import { debugLog } from '@rapid-cmi5/ui';
import { AnimationConfig } from '../types/Animation.types';

/**
 * Find a directive node by its id attribute
 * Returns the Lexical node key for the directive wrapper
 */
export function findDirectiveNodeKeyById(
  editor: LexicalEditor,
  directiveId: string,
): string | null {
  let foundKey: string | null = null;
  const seenIds: string[] = [];

  editor.getEditorState().read(() => {
    try {
      const root = $getRoot();
      const allNodes: any[] = [];

      // Recursively collect all nodes
      function collectAllNodes(node: any): void {
        allNodes.push(node);
        if (typeof node.getChildren === 'function') {
          node.getChildren().forEach(collectAllNodes);
        }
      }

      root.getChildren().forEach(collectAllNodes);

      // Find directive node with matching id
      for (const node of allNodes) {
        if ($isDirectiveNode(node)) {
          const mdastNode = node.getMdastNode();
          if (
            mdastNode.name === 'anim' &&
            mdastNode.attributes?.id === directiveId
          ) {
            foundKey = node.getKey();
            debugLog(
              `✅ Found anim directive with id "${directiveId}" → node key ${foundKey}`,
            );
            return;
          }
          if (mdastNode.name === 'anim' && mdastNode.attributes?.id) {
            seenIds.push(mdastNode.attributes.id);
          }
        }
      }

      if (!foundKey) {
        console.warn(
          `❌ Could not find anim directive with id: ${directiveId}`,
        );
        debugWrap.log(
          'ℹ️ Available anim directive ids in document:',
          Array.from(new Set(seenIds)),
        );
      }
    } catch (error) {
      console.error('Error finding directive node by ID:', error);
    }
  });

  return foundKey;
}

/**
 * Resolve animations with directiveId to current node keys
 * This is the V2 equivalent of resolveAnimations from stableIdentifiers.ts
 */
export function resolveDirectiveAnimations(
  editor: LexicalEditor,
  animations: AnimationConfig[],
): AnimationConfig[] {
  debugLog('🔄 Resolving animation directive IDs to current node keys...');

  return animations.map((anim) => {
    // V2: If we have a directive ID, use it to find the current node key
    if (anim.directiveId) {
      const currentKey = findDirectiveNodeKeyById(editor, anim.directiveId);
      if (currentKey) {
        return {
          ...anim,
          targetNodeKey: currentKey, // Update to current key
        };
      } else {
        console.warn(
          `Could not resolve directive animation ${anim.id}, keeping old key ${anim.targetNodeKey}`,
        );
      }
    }

    // V1: Fall back to stable ID resolution (legacy support)
    // This is handled by stableIdentifiers.ts
    return anim;
  });
}

/**
 * Get all directive IDs currently in the editor
 * Useful for cleanup and validation
 */
export function getAllDirectiveIds(editor: LexicalEditor): Set<string> {
  const directiveIds = new Set<string>();

  editor.getEditorState().read(() => {
    try {
      const root = $getRoot();
      const allNodes: any[] = [];

      function collectAllNodes(node: any): void {
        allNodes.push(node);
        if (typeof node.getChildren === 'function') {
          node.getChildren().forEach(collectAllNodes);
        }
      }

      root.getChildren().forEach(collectAllNodes);

      for (const node of allNodes) {
        if ($isDirectiveNode(node)) {
          const mdastNode = node.getMdastNode();
          if (mdastNode.name === 'anim' && mdastNode.attributes?.id) {
            directiveIds.add(mdastNode.attributes.id);
          }
        }
      }

      debugLog(
        `📋 Found ${directiveIds.size} anim directives:`,
        Array.from(directiveIds),
      );
    } catch (error) {
      console.error('Error getting directive IDs:', error);
    }
  });

  return directiveIds;
}

/**
 * Check if a directive ID is already in use
 */
export function isDirectiveIdInUse(
  editor: LexicalEditor,
  directiveId: string,
): boolean {
  const allIds = getAllDirectiveIds(editor);
  return allIds.has(directiveId);
}
