import {
  DirectiveEditorProps,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
} from '@mdxeditor/editor';
import { useContext, useMemo, useRef, useState } from 'react';
import { ContainerDirective } from 'mdast-util-directive';
import { StatementContentDirectiveNode } from './types';
import { Box, Divider, Stack } from '@mui/material';
import { RC5NestedLexicalEditor } from '../shared/RC5NestedLexicalEditor';
import { StatementsContext } from './StatementsContext';

import { LessonThemeContext } from '../../contexts/LessonThemeContext';
import { useLessonThemeStyles } from 'packages/ui/src/lib/hooks/useLessonThemeStyles';
import { statementFontPresets } from './constants';

/**
 * Statement Content Editor for the Statements plugin.
 * Renders a single statement within a statements container with a nested editor.
 */
export const StatementContentEditor: React.FC<
  DirectiveEditorProps<StatementContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [readOnly, syntaxExtensions] = useCellValues(
    readOnly$,
    syntaxExtensions$,
  );
  const [cellIndex, setCellIndex] = useState(-1);
  const { preset } = useContext(StatementsContext);

  //#region Styles
  const { lessonTheme } = useContext(LessonThemeContext);
  const { blockPadding } = useLessonThemeStyles(lessonTheme);

  const scopedClass = useRef(
    `statement-block-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const fontStyles = useMemo(() => {
    const config =
      statementFontPresets[preset as keyof typeof statementFontPresets];
    return (
      <style>{`
            .${scopedClass} {
               font-size: ${config.fontSize};
               font-weight: ${config.fontWeight};
               line-height:${config.fontLineHeight};

            }
            .${scopedClass} p {
               text-align: ${config.textAlign};
            }
           
          `}</style>
    );
  }, [preset]);

  //#endregion

  const statementBlock = (
    <RC5NestedLexicalEditor<ContainerDirective>
      block={true}
      getContent={(node) => node.children}
      getUpdatedMdastNode={(node, children: any) => ({
        ...node,
        children,
      })}
      contentEditableProps={{
        className: scopedClass,
        'aria-label': `Statement ${cellIndex + 1} content`,
      }}
    />
  );

  /**
   * Determine content index for accessibility labels
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

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '60px',
        marginLeft: blockPadding,
        marginRight: blockPadding,
      }}
      role="statement"
      aria-label={`Statement ${cellIndex + 1}`}
    >
      {fontStyles}
      {preset === '1' && (
        <Stack
          direction="column"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            marginLeft: '25%',
            marginRight: '25%',
          }}
        >
          <Box
            sx={{
              height: '2px',
              backgroundColor: 'background.default',
              width: '100%',
            }}
          />
          <Box />
          <strong>{statementBlock}</strong>
          <Box />
          <Box
            sx={{
              height: '2px',
              backgroundColor: 'background.default',
              width: '100%',
            }}
          />
        </Stack>
      )}
      {preset === '2' && (
        <Stack
          direction="column"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Box
            sx={{
              height: '4px',
              backgroundColor: 'primary.main',
              width: '10%',
            }}
          />
          <Box />
          {statementBlock}
        </Stack>
      )}
      {preset === '3' && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Stack direction="column">{statementBlock}</Stack>
        </Stack>
      )}
      {preset === '4' && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            paddingBottom: 0,
            paddingTop: 0,
          }}
        >
          <Stack direction="column">
            <Box
              sx={{
                margin: '8px',
                marginBottom: '16px', //this matches NestedLexicalEditor padding
                height: '6px',
                backgroundColor: 'primary.main',
                width: '10%',
              }}
            />
            <strong>{statementBlock}</strong>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};
