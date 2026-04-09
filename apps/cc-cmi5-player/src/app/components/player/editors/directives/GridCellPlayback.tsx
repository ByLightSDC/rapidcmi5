import { DirectiveEditorProps, NestedLexicalEditor } from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import React, { useRef } from 'react';

type TextAlign = 'left' | 'center' | 'right';

interface GridCellPlaybackProps
  extends DirectiveEditorProps<ContainerDirective> {
  /**
   * ARIA role for the outer cell div.
   *
   * Defaults to "cell" (CCUI-2828): in player/playback mode, NVDA announced
   * every gridcell as "clickable", which was misleading. Switching to "cell"
   * removes that announcement while preserving the same visual behaviour.
   *
   * Pass role="gridcell" when this component is used inside a true interactive
   * grid (e.g. the visual editor's GridCellEditorDescriptor) where the
   * gridcell semantics are correct.
   */
  role?: string;
}

export const GridCellPlayback: React.FC<GridCellPlaybackProps> = ({
  mdastNode,
  role = 'cell',
}) => {
  const rawTextAlign = mdastNode.attributes?.textAlign as TextAlign | undefined;
  const textAlign: TextAlign =
    rawTextAlign === 'center' || rawTextAlign === 'right'
      ? rawTextAlign
      : 'left';
  const justifyContent =
    textAlign === 'center'
      ? 'center'
      : textAlign === 'right'
        ? 'flex-end'
        : 'flex-start';

  const scopedClass = useRef(
    `grid-cell-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  return (
    // CCUI-2828: default role is "cell" so NVDA does not announce "clickable"
    // in player/playback mode. Pass role="gridcell" when used in the visual
    // editor where the gridcell semantics are intentional.
    <div role={role}>
      {textAlign !== 'left' && (
        <style>{`
          .${scopedClass} {
            display: flex;
            flex-direction: row;
            justify-content: ${justifyContent};
            flex-wrap: wrap;
            gap: 0;
            list-style-position: inside;
          }

          .${scopedClass} p,
          .${scopedClass} [data-lexical-paragraph="true"],
          .${scopedClass} ul,
          .${scopedClass} ol,
          .${scopedClass} blockquote,
          .${scopedClass} h1,
          .${scopedClass} h2,
          .${scopedClass} h3,
          .${scopedClass} h4,
          .${scopedClass} h5,
          .${scopedClass} h6 {
            flex: 0 0 100%;
            min-width: 100%;
            text-align: ${textAlign};
          }

          .${scopedClass} ul,
          .${scopedClass} ol {
            padding-inline-start: 0;
          }

          .${scopedClass} li[role="checkbox"] {
            text-align: ${textAlign};
            margin-inline-start: 0;
          }

          .${scopedClass} [data-lexical-decorator="true"] {
            flex: 0 0 auto;
            min-width: auto;
          }
        `}</style>
      )}

      <NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => ({
          ...node,
          children,
        })}
        contentEditableProps={{
          className: scopedClass,
          role: 'none',
        }}
      />
    </div>
  );
};
