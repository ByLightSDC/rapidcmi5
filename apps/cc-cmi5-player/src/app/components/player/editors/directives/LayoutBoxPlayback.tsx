import { DirectiveEditorProps, NestedLexicalEditor } from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import React, { useRef } from 'react';

export const LayoutBoxPlayback: React.FC<
  DirectiveEditorProps<ContainerDirective>
> = ({ mdastNode }) => {
  const justifyContent = mdastNode.attributes?.justifyContent || 'flex-start';
  const alignItems = mdastNode.attributes?.alignItems || 'flex-start';

  // map justifyContent to text-align for full-row text blocks
  const textAlign =
    justifyContent === 'center'
      ? 'center'
      : justifyContent === 'flex-end'
        ? 'right'
        : 'left';

  // container (outer wrapper)
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    listStylePosition: 'inside',
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  };

  // add styles that are actually set
  if (mdastNode.attributes?.width)
    containerStyles.width = mdastNode.attributes?.width;
  if (mdastNode.attributes?.height)
    containerStyles.height = mdastNode.attributes?.height;

  // editor (inner contentEditable root)
  const editorStyles: React.CSSProperties = {
    padding: 0,
    backgroundColor: 'inherit',
  };

  // @ts-ignore
  if (mdastNode.attributes?.width)
    editorStyles.width = mdastNode.attributes?.width;
  // @ts-ignore
  if (mdastNode.attributes?.height)
    editorStyles.height = mdastNode.attributes?.height;

  // per-instance unique class
  const ceClass = useRef(
    `layoutbox-ce-root-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  return (
    <div style={containerStyles}>
      {/* Scoped CSS: nested LayoutBoxes tile, text blocks new-line and obey text-align */}
      <style>{`
        .${ceClass} {
          display: flex;
          flex-direction: row;
          justify-content: ${justifyContent};
          align-items: ${alignItems};
          flex-wrap: wrap;
          gap: 0;
          background-color: inherit;
          box-sizing: border-box;
        }

        /* Full-row text blocks */
        .${ceClass} p,
        .${ceClass} [data-lexical-paragraph="true"],
        .${ceClass} ul,
        .${ceClass} ol,
        .${ceClass} blockquote,
        .${ceClass} h1,
        .${ceClass} h2,
        .${ceClass} h3,
        .${ceClass} h4,
        .${ceClass} h5,
        .${ceClass} h6 {
          flex: 0 0 100%;
          min-width: 100%;
          text-align: ${textAlign};
        }

        /* Nested LayoutBoxes (decorator nodes) tile side-by-side */
        .${ceClass} [data-lexical-decorator="true"] {
          flex: 0 0 auto;
          min-width: auto;
        }
      `}</style>

      <NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => ({ ...node, children })}
        contentEditableProps={{
          className: ceClass,
          style: editorStyles,
        }}
      />
    </div>
  );
};
