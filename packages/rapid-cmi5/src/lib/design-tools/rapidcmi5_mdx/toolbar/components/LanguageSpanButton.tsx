import { useCallback, useRef, useState } from 'react';
import { activeEditor$ } from '@mdxeditor/editor';
import { useCellValue } from '@mdxeditor/gurx';
import {
  $createGenericHTMLNode,
  $isGenericHTMLNode,
  GenericHTMLNode,
} from '@mdxeditor/editor';
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  BaseSelection,
  ElementNode,
  LexicalNode,
} from 'lexical';

import LanguageIcon from '@mui/icons-material/Language';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { LanguageSelectionPopover } from '@rapid-cmi5/ui';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';

/**
 * Read the `lang` attribute off a GenericHTMLNode span, if present.
 */
function getLangAttr(node: GenericHTMLNode): string | null {
  if (node.getTag() !== 'span') return null;
  const attr = node.getAttributes().find((a) => a.name === 'lang');
  return typeof attr?.value === 'string' ? attr.value : null;
}

/**
 * Walk up from the given node to find an enclosing `<span lang="...">`
 * GenericHTMLNode, returning the node and its tag if found.
 */
function findEnclosingLangSpan(
  node: LexicalNode | null,
): { span: GenericHTMLNode; tag: string } | null {
  let current: LexicalNode | null = node;
  while (current) {
    if ($isGenericHTMLNode(current)) {
      const tag = getLangAttr(current);
      if (tag) return { span: current, tag };
    }
    current = current.getParent();
  }
  return null;
}

/**
 * Toolbar control for WCAG 2.1 SC 3.1.2 "Language of Parts": wraps the selected
 * inline text in a `<span lang="...">` so screen readers announce the phrase
 * with the correct pronunciation. Rendered as a GenericHTMLNode, which the
 * MDXEditor html plugin round-trips losslessly to `<span lang="fr">…</span>`.
 */
export function LanguageSpanButton() {
  const editor = useCellValue(activeEditor$);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  // Snapshot of the editor selection taken when the picker opens. Opening the
  // popover (and focusing its search field) moves DOM focus out of the editor,
  // which collapses the live selection — so we must restore this snapshot
  // before wrapping.
  const savedSelection = useRef<BaseSelection | null>(null);
  const disabled = !editor;

  const openPicker = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.currentTarget;
      // Detect a language already applied at the caret so the picker can
      // pre-fill and offer removal, and snapshot the selection to restore on
      // apply.
      let tag: string | null = null;
      editor?.getEditorState().read(() => {
        const selection = $getSelection();
        savedSelection.current = selection ? selection.clone() : null;
        if ($isRangeSelection(selection)) {
          const found = findEnclosingLangSpan(selection.anchor.getNode());
          tag = found?.tag ?? null;
        }
      });
      setCurrentTag(tag);
      setAnchorEl(target);
    },
    [editor],
  );

  const closePicker = useCallback(() => setAnchorEl(null), []);

  /**
   * Apply (or update) a language tag on the current selection.
   */
  const applyLanguage = useCallback(
    (tag: string) => {
      if (!editor) return;
      editor.update(() => {
        // Restore the selection captured before the popover stole focus.
        if (savedSelection.current) {
          $setSelection(savedSelection.current.clone());
        }
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // If the caret sits inside an existing lang span, just update its tag
        // rather than nesting a second span.
        const existing = findEnclosingLangSpan(selection.anchor.getNode());
        if (existing) {
          const attrs = existing.span
            .getAttributes()
            .filter((a) => a.name !== 'lang');
          existing.span.updateAttributes([
            ...attrs,
            { type: 'mdxJsxAttribute', name: 'lang', value: tag },
          ]);
          return;
        }

        if (selection.isCollapsed()) return;

        const createSpan = () =>
          $createGenericHTMLNode('span', 'mdxJsxTextElement', [
            { type: 'mdxJsxAttribute', name: 'lang', value: tag },
          ]) as GenericHTMLNode;

        // Phase 1: extract the selected content, then reduce it to the inline
        // leaf nodes we want to wrap. `extract()` splits partially-selected text
        // nodes at the selection edges and can also return block/directive
        // wrappers; we keep only inline nodes whose parent is NOT itself in the
        // selection (i.e. the top of each inline run), so a bold-inside-selection
        // fragment is wrapped once, not twice.
        const extracted = selection.extract();
        const selectedKeys = new Set(extracted.map((n) => n.getKey()));
        const inlineTargets = extracted.filter((node) => {
          if (!node.isAttached()) return false;
          // Block-level elements are containers for other selected nodes; skip.
          if (node instanceof ElementNode && !node.isInline()) return false;
          const parent = node.getParent();
          return !parent || !selectedKeys.has(parent.getKey());
        });

        if (inlineTargets.length === 0) return;

        // Phase 2: group consecutive targets that share a parent AND are direct
        // adjacent siblings into runs, then wrap each run in one span. Grouping
        // up front (before any mutation) avoids the sibling-shifting hazard of
        // wrapping while iterating.
        const runs: LexicalNode[][] = [];
        for (const node of inlineTargets) {
          const last = runs[runs.length - 1];
          const prevInRun = last?.[last.length - 1];
          if (
            prevInRun &&
            prevInRun.getParent()?.is(node.getParent() ?? undefined) &&
            prevInRun.getNextSibling()?.is(node)
          ) {
            last.push(node);
          } else {
            runs.push([node]);
          }
        }

        for (const run of runs) {
          const first = run[0];
          if (!first.isAttached()) continue;
          const span = createSpan();
          first.insertBefore(span);
          run.forEach((n) => span.append(n));
        }
      });
    },
    [editor],
  );

  /**
   * Remove the language wrapping around the caret, hoisting its children back
   * into the parent.
   */
  const clearLanguage = useCallback(() => {
    if (!editor) return;
    editor.update(() => {
      if (savedSelection.current) {
        $setSelection(savedSelection.current.clone());
      }
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const existing = findEnclosingLangSpan(selection.anchor.getNode());
      if (!existing) return;
      const { span } = existing;
      const children = span.getChildren();
      children.forEach((child) => span.insertBefore(child));
      span.remove();
    });
  }, [editor]);

  return (
    <>
      <MUIButtonWithTooltip
        title="Apply Language"
        aria-label="Apply Language"
        onClick={openPicker}
        disabled={disabled}
        sx={{ marginRight: '-6px' }}
      >
        <LanguageIcon fontSize="small" />
      </MUIButtonWithTooltip>

      <MUIButtonWithTooltip
        title="Select Language"
        onClick={openPicker}
        disabled={disabled}
        sx={{
          width: '12px',
          minWidth: 0,
          padding: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          height: '12px',
          marginTop: '10px',
        }}
      >
        <ArrowDropDownIcon fontSize="medium" />
      </MUIButtonWithTooltip>

      <LanguageSelectionPopover
        anchorEl={anchorEl}
        onClose={closePicker}
        currentTag={currentTag}
        onPickLanguage={applyLanguage}
        onClear={clearLanguage}
      />
    </>
  );
}
