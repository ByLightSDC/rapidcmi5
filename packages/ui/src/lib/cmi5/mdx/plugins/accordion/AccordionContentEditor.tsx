import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { useMemo, useState } from 'react';

import { ContainerDirective } from 'mdast-util-directive';
import { AccordionContentDirectiveNode } from './types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  useTheme,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { editorInPlayback$ } from '../../state/vars';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
import {
  TextAlign,
  useScopedAlignmentStyles,
} from '../shared/useScopedAlignmentStyles';
import { useFocusWithin } from '../shared/useFocusWithin';

/**
 * Accordion Content Editor for accordion plugin
 * @param props
 * @returns
 */
export const AccordionContentEditor: React.FC<
  DirectiveEditorProps<AccordionContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [accordionIndex, setAccordionIndex] = useState(-1);
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
    'accordion-content',
  );

  /**
   * accordion content background color to contrast with title background
   */
  const basePageBg = useMemo(() => {
    if (muiTheme.palette.mode === 'dark') {
      return '#212125';
    }
    return '#f8f8f8';
  }, [muiTheme.palette.mode]);

  /**
   * determine accordion index for aria labels
   */
  useMemo(() => {
    parentEditor.update(() => {
      let myChildIndex = -1;
      const parentKeys = lexicalNode.getParent()?.getChildrenKeys();
      if (parentKeys) {
        myChildIndex = parentKeys?.indexOf(lexicalNode.getKey());
        setAccordionIndex(myChildIndex);
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
    <Accordion
      sx={{
        backgroundColor: (theme: any) => `${theme.form.backgroundColor}`,
        borderColor: 'white',
        border: (theme: any) => `1px solid ${theme.palette.divider}`,
        '&:not(:last-child)': {
          borderBottom: 0,
        },
        '&::before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon color="primary" />}
        aria-controls={`panel${accordionIndex}-content`}
        id={`panel${accordionIndex}-header`}
      >
        <Typography sx={{ fontWeight: 'bold' }} component="span">
          {mdastNode.attributes?.title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        id={`panel${accordionIndex}-content`}
        role="region"
        aria-labelledby={`panel${accordionIndex}-header`}
        sx={{ backgroundColor: basePageBg, position: 'relative' }}
        ref={contentRef}
      >
        {alignmentStyles}

        {isFocused && !isPlayback && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
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
          getContent={(node) => {
            return node.children;
          }}
          getUpdatedMdastNode={(node, children: any) => ({
            ...node,
            children,
          })}
          contentEditableProps={{
            className: scopedClass,
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
};
