import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  useCellValue,
} from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import React, { useRef } from 'react';
import { editorInPlayback$ } from '@rapid-cmi5/ui';

type TextAlign = 'left' | 'center' | 'right';

export const GridCellPlayback: React.FC<
  DirectiveEditorProps<ContainerDirective>
> = ({ mdastNode }) => {
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

  // CCUI-2828: use "cell" in playback mode so NVDA does not announce "clickable"
  // on every grid cell. In edit mode, "gridcell" is semantically correct.
  const isPlayback = useCellValue(editorInPlayback$);

  return (
    <div role={isPlayback ? 'cell' : 'gridcell'}>
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
