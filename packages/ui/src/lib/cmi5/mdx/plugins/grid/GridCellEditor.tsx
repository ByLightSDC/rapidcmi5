import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { useMemo, useState } from 'react';
import { ContainerDirective } from 'mdast-util-directive';
import { GridCellDirectiveNode } from './types';
import { Box, useTheme } from '@mui/material';
import { editorInPlayback$ } from '../../state/vars';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
import {
  TextAlign,
  useScopedAlignmentStyles,
} from '../shared/useScopedAlignmentStyles';
import { useFocusWithin } from '../shared/useFocusWithin';

/**
 * Grid Cell Editor for the Grid Layout plugin.
 * Renders a single cell within a grid container with a nested editor.
 * Cells automatically fill equal-width columns in the parent grid.
 */
export const GridCellEditor: React.FC<
  DirectiveEditorProps<GridCellDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [cellIndex, setCellIndex] = useState(-1);
  const { isFocused, ref: contentRef } = useFocusWithin<HTMLDivElement>();
  const muiTheme = useTheme();
  const updateMdastNode = useMdastNodeUpdater();
  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);

  const rawTextAlign = mdastNode.attributes?.textAlign;
  const textAlign: TextAlign =
    rawTextAlign === 'center' || rawTextAlign === 'right'
      ? rawTextAlign
      : 'left';
  const { scopedClass, alignmentStyles } = useScopedAlignmentStyles(
    textAlign,
    'grid-cell',
  );

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
      {/* Scoped flex layout CSS (only when alignment is non-default) */}
      {alignmentStyles}

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
