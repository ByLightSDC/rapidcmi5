import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import { useEffect, useMemo, useRef, useState } from 'react';

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

/**
 * Accordion Content Editor for accordion plugin
 * @param props
 * @returns
 */
export const AccordionContentEditor: React.FC<
  DirectiveEditorProps<AccordionContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [accordionIndex, setAccordionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const muiTheme = useTheme();
  const updateMdastNode = useMdastNodeUpdater();
  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);

  const textAlign = mdastNode.attributes?.textAlign ?? 'left';

  const justifyContent =
    textAlign === 'center'
      ? 'center'
      : textAlign === 'right'
        ? 'flex-end'
        : 'flex-start';

  const scopedClass = useRef(
    `accordion-content-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

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
