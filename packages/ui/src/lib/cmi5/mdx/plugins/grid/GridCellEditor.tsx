import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ContainerDirective } from 'mdast-util-directive';
import { GridCellDirectiveNode } from './types';
import { Box, useTheme } from '@mui/material';
import { editorInPlayback$ } from '../../state/vars';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';

/**
 * Grid Cell Editor for the Grid Layout plugin.
 * Renders a single cell within a grid container with a nested editor.
 * Cells automatically fill equal-width columns in the parent grid.
 */
export const GridCellEditor: React.FC<
  DirectiveEditorProps<GridCellDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [cellIndex, setCellIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const muiTheme = useTheme();
  const updateMdastNode = useMdastNodeUpdater();
  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);

  const textAlign = mdastNode.attributes?.textAlign ?? 'left';

  // Map text-align values to flex justify-content values
  const justifyContent =
    textAlign === 'center'
      ? 'center'
      : textAlign === 'right'
        ? 'flex-end'
        : 'flex-start';

  // Scoped CSS class unique to this cell instance
  const scopedClass = useRef(
    `grid-cell-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  /**
   * Determine cell index for accessibility labels
   */
  useMemo(() => {
    parentEditor.update(() => {
      let myCellIndex = -1;
      const parentKeys = lexicalNode.getParent()?.getChildrenKeys();
      if (parentKeys) {
        myCellIndex = parentKeys?.indexOf(lexicalNode.getKey());
        setCellIndex(myCellIndex);
      }
    });
  }, [lexicalNode, parentEditor]);

  /**
   * Track focus state for showing/hiding the alignment toolbar
   */
  useEffect(() => {
    const div = contentRef.current;
    if (!div) return;

    const handleFocusIn = () => setIsFocused(true);
    const handleFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget;
      if (!(next instanceof Node) || !div.contains(next)) {
        setIsFocused(false);
      }
    };

    div.addEventListener('focusin', handleFocusIn);
    div.addEventListener('focusout', handleFocusOut);

    return () => {
      div.removeEventListener('focusin', handleFocusIn);
      div.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const handleAlignmentChange = (value: 'left' | 'center' | 'right') => {
    updateMdastNode({
      ...mdastNode,
      attributes: {
        ...mdastNode.attributes,
        textAlign: value === 'left' ? undefined : value,
      },
    });
  };

  return (
    <Box
      ref={contentRef}
      sx={{
        position: 'relative',
        minHeight: '60px',
        border: '1px dashed',
        borderColor: isFocused ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 1,
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
      role="gridcell"
      aria-label={`Grid cell ${cellIndex + 1}`}
    >
      {/* Scoped flex layout CSS — only applied when alignment is non-default */}
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

          /* Full-row block elements with mapped text-align */
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

          /* Reset default list padding so items center properly */
          .${scopedClass} ul,
          .${scopedClass} ol {
            padding-inline-start: 0;
          }

          /* Checkbox list items: center text, keep ::before click target intact */
          .${scopedClass} li[role="checkbox"] {
            text-align: ${textAlign};
            margin-inline-start: 0;
          }

          /* Decorator nodes (nested directives) tile side-by-side */
          .${scopedClass} [data-lexical-decorator="true"] {
            flex: 0 0 auto;
            min-width: auto;
          }
        `}</style>
      )}

      {isFocused && !isPlayback && (
        <Box
          sx={{
            position: 'absolute',
            top: -32,
            right: 0,
            zIndex: 10,
            display: 'flex',
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            borderRadius: 1,
          }}
        >
          <AlignmentToolbarControls
            currentAlignment={textAlign}
            onAlignmentChange={handleAlignmentChange}
            disabled={readOnly}
          />
        </Box>
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
        }}
      />
    </Box>
  );
};
