/*
 *   Copyright (c) 2025 By Light Professional IT Services LLC
 *   All rights reserved.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  usePublisher,
  useCellValue,
  Cell,
  Signal,
  useRealm,
} from '@mdxeditor/gurx';
import { markdown$ } from '@mdxeditor/editor';
import { debugLog } from '@rapid-cmi5/ui';

/**
 * Animation Directive Registry
 *
 * Pattern inspired by FootnoteRegistry.tsx
 *
 * Purpose:
 * - Maintains a registry of anim directive nodes
 * - Publishes state for AnimDirectiveDescriptor to consume
 *
 * Architecture:
 * - Lives in @rangeos-nx/ui/branded (shared library)
 * - Does NOT depend on app-specific animation state
 * - Only tracks directive structure in editor
 * - Animation configs live in app layer (frontmatter)
 *
 * This solves the cross-package dependency problem by:
 * 1. Registry tracks directives (content layer)
 * 2. App tracks animation configs (metadata layer)
 * 3. They communicate via directiveId (loose coupling)
 */

// Gurx cells for publishing directive state (presence only; no doc-order tracking)
export const animDirectiveIds$ = Cell<string[]>([]);
/**
 * Request a rescan (used for debugging or explicit "known change" events).
 * This does NOT imply a full Lexical tree walk; we derive IDs from markdown for efficiency.
 */
export const updateAnimDirectives$ = Signal<{ reason?: string }>();

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

/**
 * Extract anim directive IDs from markdown.
 *
 * Supports both:
 * - :::anim{id="anim_header"}
 * - :::anim{#anim_header}
 */
function extractAnimDirectiveIdsFromMarkdown(markdown: string): string[] {
  if (!markdown) return [];

  const ids: string[] = [];
  const openRe = /^:::anim\{([^}]*)\}/gm;
  let match: RegExpExecArray | null;
  while ((match = openRe.exec(markdown)) !== null) {
    const attrs = match[1] || '';
    const idEq = attrs.match(/\bid\s*=\s*"([^"]+)"/);
    if (idEq?.[1]) {
      ids.push(idEq[1]);
      continue;
    }
    const idHash = attrs.match(/#([A-Za-z0-9_-]+)/);
    if (idHash?.[1]) {
      ids.push(idHash[1]);
    }
  }
  return uniqueSorted(ids);
}

export default function AnimationDirectiveRegistry() {
  const [editor] = useLexicalComposerContext();
  const realm = useRealm();

  // Local ref for last published ids (to avoid noisy publishes)
  const lastIdsRef = useRef<string[]>([]);
  const lastLogRef = useRef<{ t: number; reason: string | undefined } | null>(
    null,
  );
  const seqRef = useRef(0);

  // Publishers for sharing state
  const publishIds = usePublisher(animDirectiveIds$);

  /**
   * Update registry from markdown (no Lexical tree scanning)
   */
  const updateDirectiveRegistryFromMarkdown = useCallback(
    (markdown: string, reason?: string) => {
      const ids = extractAnimDirectiveIdsFromMarkdown(markdown);
      const prev = lastIdsRef.current;
      const changed =
        ids.length !== prev.length || ids.some((id, i) => id !== prev[i]);

      const now = Date.now();
      const last = lastLogRef.current;
      if (last && now - last.t < 250) {
        debugLog(
          '🟨 [AnimDirectiveRegistry] rapid trigger',
          {
            prevReason: last.reason,
            reason,
            deltaMs: now - last.t,
          },
          undefined,
          'mdast',
        );
      }
      lastLogRef.current = { t: now, reason };

      seqRef.current += 1;
      debugLog(
        '🔍 [AnimDirectiveRegistry] update',
        {
          seq: seqRef.current,
          reason: reason ?? 'markdown$',
          changed,
          count: ids.length,
          ids,
        },
        undefined,
        'mdast',
      );

      if (!changed) return;

      lastIdsRef.current = ids;
      publishIds(ids);
    },
    [publishIds],
  );

  /**
   * Triggers:
   * - On mount (initial)
   * - When markdown$ changes (covers setMarkdown/import and insertMarkdown fragment insertion)
   * - When updateAnimDirectives$ is explicitly published (debug / explicit known events)
   */
  useEffect(() => {
    debugLog(
      '🎬 AnimationDirectiveRegistry mounted!',
      undefined,
      undefined,
      'mdast',
    );

    // Initial scan using the current markdown value
    updateDirectiveRegistryFromMarkdown(realm.getValue(markdown$), 'mount');

    const unsubMarkdown = realm.sub(markdown$, (md) => {
      updateDirectiveRegistryFromMarkdown(md, 'markdown$');
    });

    const unsubExplicit = realm.sub(updateAnimDirectives$, (payload) => {
      updateDirectiveRegistryFromMarkdown(
        realm.getValue(markdown$),
        payload?.reason ? `explicit:${payload.reason}` : 'explicit',
      );
    });

    return () => {
      debugLog(
        '🎬 AnimationDirectiveRegistry unmounted',
        undefined,
        undefined,
        'mdast',
      );
      unsubMarkdown();
      unsubExplicit();
    };
  }, [editor, realm, updateDirectiveRegistryFromMarkdown]);

  // This component doesn't render anything (like FootnoteRegistry)
  return null;
}

/**
 * Hook to check if a directive ID exists in the document
 */
export function useHasAnimDirective(directiveId: string): boolean {
  // NOTE: we intentionally avoid doc-order tracking; this is presence only.
  // Consumers that need timeline order should use data-animation-order set by the app layer.
  const ids = useCellValue(animDirectiveIds$);
  return ids.includes(directiveId);
}
