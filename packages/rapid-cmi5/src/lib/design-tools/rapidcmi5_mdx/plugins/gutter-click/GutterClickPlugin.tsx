import { useContext, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getRoot,
  $isElementNode,
  DecoratorNode,
} from 'lexical';
import { realmPlugin, addComposerChild$ } from '@mdxeditor/editor';
import { CoursePresentationContext } from '@rapid-cmi5/ui';
import { resolveLessonThemeCSS } from '@rapid-cmi5/ui';

function getContentColumnBounds(
  editorRoot: HTMLElement,
  maxWidthCss: string | null,
): { left: number; right: number } {
  const rect = editorRoot.getBoundingClientRect();
  if (!maxWidthCss) {
    return { left: rect.left, right: rect.right };
  }

  let contentWidth: number;
  if (maxWidthCss.endsWith('%')) {
    const pct = parseFloat(maxWidthCss) / 100;
    contentWidth = rect.width * pct;
  } else if (maxWidthCss.endsWith('px')) {
    contentWidth = parseFloat(maxWidthCss);
  } else {
    return { left: rect.left, right: rect.right };
  }

  const centerX = rect.left + rect.width / 2;
  return {
    left: centerX - contentWidth / 2,
    right: centerX + contentWidth / 2,
  };
}

function getKeyForTopLevelBlock(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  blockEl: HTMLElement,
): string | null {
  let found: string | null = null;
  editor.getEditorState().read(() => {
    const root = $getRoot();
    for (const child of root.getChildren()) {
      const key = child.getKey();
      if (editor.getElementByKey(key) === blockEl) {
        found = key;
        return;
      }
    }
  });
  return found;
}

function getNearestBlock(
  editorRoot: HTMLElement,
  clientY: number,
): { el: HTMLElement; isAboveMidpoint: boolean } | null {
  const children = Array.from(editorRoot.children) as HTMLElement[];
  if (children.length === 0) return null;

  let nearest: HTMLElement | null = null;
  let nearestDist = Infinity;
  let nearestIsAbove = false;

  for (const child of children) {
    const rect = child.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const dist = Math.abs(clientY - midY);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = child;
      nearestIsAbove = clientY < midY;
    }
  }

  return nearest ? { el: nearest, isAboveMidpoint: nearestIsAbove } : null;
}

function GutterClickHandler() {
  const [editor] = useLexicalComposerContext();
  const { theme } = useContext(CoursePresentationContext);
  const editorRoot = editor.getRootElement();

  if (!editorRoot) return;

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const css = resolveLessonThemeCSS(theme);
      const maxWidthCss = css?.maxWidth ?? null;
      const { left: contentLeft, right: contentRight } = getContentColumnBounds(
        editorRoot,
        maxWidthCss,
      );

      const inGutter = e.clientX < contentLeft || e.clientX > contentRight;
      if (!inGutter) return;

      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, [role="button"]'))
        return;

      e.preventDefault();

      const nearest = getNearestBlock(editorRoot, e.clientY);
      if (!nearest) return;

      const key = getKeyForTopLevelBlock(editor, nearest.el);
      if (!key) return;

      editor.update(
        () => {
          const node = $getRoot()
            .getChildren()
            .find((c) => c.getKey() === key);
          if (!node) return;

          // A node can host a visible caret only if it's an ElementNode with at least
          // one non-decorator child (or is empty). A paragraph whose sole child is a
          // DecoratorNode (table, audio, etc.) cannot show a cursor.
          const nodeCanHostCaret = (
            n: Parameters<typeof $isElementNode>[0],
          ): boolean => {
            if (!$isElementNode(n)) return false;
            const children = n.getChildren();
            if (children.length === 0) return true;
            return children.some((c) => !(c instanceof DecoratorNode));
          };

          const canHostCaret = nodeCanHostCaret(node);
          const siblingCanHostCaret = (
            sibling: ReturnType<typeof node.getNextSibling>,
          ): boolean => !!sibling && nodeCanHostCaret(sibling);

          if (!canHostCaret) {
            if (nearest.isAboveMidpoint) {
              const prev = node.getPreviousSibling();
              if (siblingCanHostCaret(prev)) {
                prev!.selectEnd();
              } else {
                const para = $createParagraphNode();
                node.insertBefore(para);
                para.select();
              }
            } else {
              const next = node.getNextSibling();
              if (siblingCanHostCaret(next)) {
                next!.selectStart();
              } else {
                const para = $createParagraphNode();
                node.insertAfter(para);
                para.select();
              }
            }
          } else {
            if (nearest.isAboveMidpoint) {
              node.selectStart();
            } else {
              node.selectEnd();
            }
          }
        },
        {
          onUpdate: () => editor.focus(),
        },
      );
    };

    editorRoot.addEventListener('mousedown', handleMouseDown, true);
    return () =>
      editorRoot.removeEventListener('mousedown', handleMouseDown, true);
  }, [editor, theme]);

  return null;
}

export const gutterClickPlugin = realmPlugin({
  init(realm) {
    realm.pub(addComposerChild$, GutterClickHandler);
  },
});
