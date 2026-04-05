import { DirectiveEditorProps, NestedLexicalEditor } from '@mdxeditor/editor';
import { ContainerDirective } from 'mdast-util-directive';
import React, { useMemo, useRef } from 'react';
import { parseStyleString, resolveBlockMaxWidth } from '@rapid-cmi5/ui';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';

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

    const bgColor = mdastNode.attributes?.backgroundColor as string | undefined;
    if (bgColor) {
      styles.backgroundColor = bgColor;
      styles.boxShadow = `0 0 0 100vmax ${bgColor}`;
      styles.clipPath = 'inset(0 -100vmax 0)';
    }

    const blockContentWidth = mdastNode.attributes?.contentWidth as ContentWidthEnum | undefined;
    const maxWidth = resolveBlockMaxWidth(blockContentWidth);
    if (maxWidth) {
      styles.maxWidth = maxWidth;
      styles.marginLeft = 'auto';
      styles.marginRight = 'auto';
    }

    return styles;
  }, [mdastNode.attributes?.style, mdastNode.attributes?.backgroundColor, mdastNode.attributes?.contentWidth]);

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
        getUpdatedMdastNode={(node, children) => ({
          ...node,
          children: children as ContainerDirective['children'],
        })}
      />
    </div>
  );
};
