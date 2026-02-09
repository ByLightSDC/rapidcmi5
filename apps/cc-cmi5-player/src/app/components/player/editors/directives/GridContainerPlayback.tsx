import { DirectiveEditorProps, NestedLexicalEditor } from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import React, { useMemo, useRef } from 'react';
import { parseStyleString } from '@rapid-cmi5/ui';

export const GridContainerPlayback: React.FC<
  DirectiveEditorProps<ContainerDirective>
> = ({ mdastNode }) => {
  const containerClass = useRef(
    `grid-container-${Math.random().toString(36).slice(2, 9)}`,
  ).current;
  const columnCount = Math.max(mdastNode.children?.length ?? 0, 1);

  const containerStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      position: 'relative',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      listStylePosition: 'inside',
    };

    const styleAttr = mdastNode.attributes?.style as string | undefined;
    if (styleAttr) {
      Object.assign(styles, parseStyleString(styleAttr));
    }

    return styles;
  }, [mdastNode.attributes?.style]);

  return (
    <div
      className={containerClass}
      style={containerStyles}
      role="grid"
      aria-label="Grid layout container"
    >
      <style>{`
        .${containerClass} > [data-lexical-editor="true"],
        .${containerClass} > [role="textbox"],
        .${containerClass} > div[class*="nestedEditor"] {
          display: grid;
          grid-template-columns: repeat(${columnCount}, 1fr);
          gap: 16px;
        }
      `}</style>

      <NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => ({
          ...node,
          children,
        })}
      />
    </div>
  );
};
