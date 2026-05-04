import { useContext, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getRoot,
  DecoratorNode,
} from 'lexical';
import { realmPlugin, addComposerChild$ } from '@mdxeditor/editor';
import { LessonThemeContext } from '@rapid-cmi5/ui';
import { resolveLessonThemeCSS } from '@rapid-cmi5/ui';

/**
 * Given the editor root and the lesson theme's maxWidth CSS string (e.g. "75%"),
 * returns the pixel left/right boundaries of the content column.
 * Falls back to the full editor root rect when maxWidth is null (no constraint).
 */
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

  // Content is centered within the editor root
  const centerX = rect.left + rect.width / 2;
  return {
    left: centerX - contentWidth / 2,
    right: centerX + contentWidth / 2,
  };
}

/**
 * Given a DOM element that is a direct child of the editor root, find the
 * corresponding top-level Lexical node key by comparing DOM elements.
 */
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

/**
 * Finds the vertically nearest top-level block to the given clientY,
 * and whether the click was above or below its midpoint.
 */
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
  const { lessonTheme } = useContext(LessonThemeContext);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const editorRoot = editor.getRootElement();
      if (!editorRoot) return;

      const css = resolveLessonThemeCSS(lessonTheme);
      const maxWidthCss = css?.maxWidth ?? null;
      const { left: contentLeft, right: contentRight } = getContentColumnBounds(editorRoot, maxWidthCss);

      const inGutter = e.clientX < contentLeft || e.clientX > contentRight;
      console.log('[GutterClick] mousedown clientX:', e.clientX, '| contentLeft:', contentLeft, 'contentRight:', contentRight, '| maxWidth:', maxWidthCss, '| in gutter:', inGutter);

      if (!inGutter) return;

      // Don't steal clicks on interactive UI (buttons, inputs, etc.)
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, [role="button"]')) return;

      e.preventDefault();

      const nearest = getNearestBlock(editorRoot, e.clientY);
      if (!nearest) return;

      const key = getKeyForTopLevelBlock(editor, nearest.el);
      if (!key) return;

      editor.update(() => {
        const node = $getRoot()
          .getChildren()
          .find((c) => c.getKey() === key);
        if (!node) return;

        const isDecorator = node instanceof DecoratorNode;
        console.log('[GutterClick] nearest node type:', node.getType(), '| isDecorator:', isDecorator, '| isAboveMidpoint:', nearest.isAboveMidpoint);

        if (isDecorator) {
          // DecoratorNodes (tabs, accordion, admonitions, etc.) don't support
          // selectStart/selectEnd — place cursor in an adjacent paragraph instead.
          if (nearest.isAboveMidpoint) {
            const prev = node.getPreviousSibling();
            if (prev) {
              console.log('[GutterClick] selecting end of previous sibling:', prev.getType());
              prev.selectEnd();
            } else {
              console.log('[GutterClick] no previous sibling — inserting paragraph before decorator');
              const para = $createParagraphNode();
              node.insertBefore(para);
              para.select();
            }
          } else {
            const next = node.getNextSibling();
            if (next) {
              console.log('[GutterClick] selecting start of next sibling:', next.getType());
              next.selectStart();
            } else {
              console.log('[GutterClick] no next sibling — inserting paragraph after decorator');
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
      });
    };

    // Use capture so we get the event before Lexical's own handlers
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
  }, [editor, lessonTheme]);

  return null;
}

export const gutterClickPlugin = realmPlugin({
  init(realm) {
    realm.pub(addComposerChild$, GutterClickHandler);
  },
});
