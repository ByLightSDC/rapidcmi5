import { DirectiveEditorProps, NestedLexicalEditor } from '@mdxeditor/editor';
import { useMemo, useState } from 'react';

import { ContainerDirective } from 'mdast-util-directive';
import { AccordionContentDirectiveNode } from './types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  useTheme,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Accordion Content Editor for accordion plugin
 * @param props
 * @returns
 */
export const AccordionContentEditor: React.FC<
  DirectiveEditorProps<AccordionContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [accordionIndex, setAccordionIndex] = useState(-1);
  const muiTheme = useTheme();

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
        sx={{ backgroundColor: basePageBg }}
      >
        <NestedLexicalEditor<ContainerDirective>
          block={true}
          getContent={(node) => {
            return node.children;
          }}
          getUpdatedMdastNode={(node, children: any) => ({
            ...node,
            children,
          })}
        />
      </AccordionDetails>
    </Accordion>
  );
};
