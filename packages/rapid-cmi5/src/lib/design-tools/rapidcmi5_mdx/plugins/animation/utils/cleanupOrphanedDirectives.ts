/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import { LexicalEditor } from 'lexical';
import { getAllDirectiveIds } from './directiveResolver';
import { debugLog } from '@rapid-cmi5/ui';
import { AnimationConfig } from '../types/Animation.types';


/**
 * Clean up animations that reference directive IDs that no longer exist
 * This is the V2 equivalent of cleanupOrphanedAnimations
 *
 * Returns a filtered list of animations that have valid directive references
 */
export function cleanupOrphanedDirectiveAnimations(
  editor: LexicalEditor,
  animations: AnimationConfig[],
): AnimationConfig[] {
  debugLog('🧹 Cleaning up orphaned directive animations...');

  // Get all valid directive IDs currently in the editor
  const validDirectiveIds = getAllDirectiveIds(editor);

  // Filter animations
  const cleanedAnimations = animations.filter((anim) => {
    // V2: If animation has a directiveId, check if it exists
    if (anim.directiveId) {
      const isValid = validDirectiveIds.has(anim.directiveId);
      if (!isValid) {
        console.warn(
          `🗑️ Removing orphaned animation ${anim.id} - directive "${anim.directiveId}" not found`,
        );
      }
      return isValid;
    }

    // V1: Keep animations without directiveId (they use stableId instead)
    // These will be cleaned up by cleanupOrphanedAnimations from cleanupOrphanedAnimations.ts
    return true;
  });

  const removedCount = animations.length - cleanedAnimations.length;
  if (removedCount > 0) {
    debugLog(`✅ Removed ${removedCount} orphaned directive animation(s)`);
  } else {
    debugLog('✅ No orphaned directive animations found');
  }

  return cleanedAnimations;
}

/**
 * Find animations that reference a specific directive ID
 */
export function findAnimationsByDirectiveId(
  animations: AnimationConfig[],
  directiveId: string,
): AnimationConfig[] {
  return animations.filter((anim) => anim.directiveId === directiveId);
}

/**
 * Check if any animations reference a specific directive ID
 */
export function hasAnimationsForDirective(
  animations: AnimationConfig[],
  directiveId: string,
): boolean {
  return animations.some((anim) => anim.directiveId === directiveId);
}

/**
 * Get a list of directive IDs that have no corresponding animations
 * These are directives that exist in the markdown but have no animation config
 */
export function getUnusedDirectiveIds(
  editor: LexicalEditor,
  animations: AnimationConfig[],
): string[] {
  const allDirectiveIds = getAllDirectiveIds(editor);
  const usedDirectiveIds = new Set(
    animations.filter((a) => a.directiveId).map((a) => a.directiveId!),
  );

  const unusedIds = Array.from(allDirectiveIds).filter(
    (id) => !usedDirectiveIds.has(id),
  );

  if (unusedIds.length > 0) {
    debugLog(`⚠️ Found ${unusedIds.length} unused directive(s):`, unusedIds);
  }

  return unusedIds;
}
