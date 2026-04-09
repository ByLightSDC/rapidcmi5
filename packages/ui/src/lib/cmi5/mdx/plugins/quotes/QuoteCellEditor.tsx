import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ContainerDirective } from 'mdast-util-directive';
import { QuoteCellDirectiveNode } from './types';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { editorInPlayback$ } from '../../state/vars';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
import type { Paragraph } from 'mdast';
import {
  TextAlign,
  useScopedAlignmentStyles,
} from '../shared/useScopedAlignmentStyles';
import { useFocusWithin } from '../shared/useFocusWithin';
import { RC5NestedLexicalEditor } from '../shared/RC5NestedLexicalEditor';
import { QuotesContext } from './QuotesContext';
import { convertMarkdownToMdast } from '../../util/conversion';
import { toMarkdown } from 'mdast-util-to-markdown';
import { stripLeadingHashes } from './methods';

/**
 * Quote Cell Editor for the Quotes plugin.
 * Renders a single quote within a quotes container with a nested editor.
 */
export const QuoteCellEditor: React.FC<
  DirectiveEditorProps<QuoteCellDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const [cellIndex, setCellIndex] = useState(-1);
  const { isFocused, ref: contentRef } = useFocusWithin<HTMLDivElement>();
  const muiTheme = useTheme();
  const updateMdastNode = useMdastNodeUpdater();
  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);
  const [author, setAuthor] = useState('');

  const { avatar, carouselIndex, preset } = useContext(QuotesContext);

  const scopedClass = useRef(
    `quote-cell-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const fontStyles = useMemo(() => {
    let fontSize = '14px';
    let fontWeight = 400;
    if (preset === '2') {
      fontSize = '32px';
      fontWeight = 300;
    }
    return (
      <style>{`
            .${scopedClass} {
               font-size: ${fontSize};
               font-weight: ${fontWeight};
            }
          `}</style>
    );
  }, [preset]);

  const authorHeader = useMemo(() => {
    if (mdastNode.attributes.author) {
      const justAuthor = stripLeadingHashes(mdastNode.attributes.author);
      switch (preset) {
        case '1':
          return `###### ${justAuthor}`;
        case '2':
          return `#### ${justAuthor}`;
      }
    }
    return mdastNode.attributes.author || '';
  }, [preset]);

  const updateAvatar = useCallback(
    (newAvatar?: string) => {
      const theAttributes = { ...mdastNode.attributes };
      theAttributes['avatar'] = newAvatar;
      updateMdastNode({
        ...mdastNode,
        attributes: theAttributes,
      });
      lexicalNode.markDirty();
    },
    [mdastNode, updateMdastNode],
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

  useEffect(() => {
    if (carouselIndex === cellIndex) {
      console.log('update the fucking avatar', avatar);
      updateAvatar(avatar);
    }
  }, [avatar, carouselIndex, cellIndex]);

  return (
    <Box
      ref={contentRef}
      sx={{
        position: 'relative',
        minHeight: '60px',
      }}
      role="quote"
      aria-label={`Quote ${cellIndex + 1}`}
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
            paddingBottom: 0, //controlled by parent, lesson setting
            paddingTop: 0,
          }}
        >
          {mdastNode.attributes.avatar && (
            <img
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
              src={mdastNode.attributes.avatar}
              alt="Author Headshot"
            />
          )}
          <RC5NestedLexicalEditor<ContainerDirective>
            block={true}
            getContent={(node) => node.children}
            getUpdatedMdastNode={(node, children: any) => ({
              ...node,
              children,
            })}
            contentEditableProps={{
              className: scopedClass,
              'aria-label': `Quote ${cellIndex + 1} content`,
            }}
          />

          <NestedLexicalEditor<Paragraph>
            getContent={(node) => {
              const theNode = convertMarkdownToMdast(
                mdastNode.attributes.author || '',
                syntaxExtensions,
              );
              return theNode.children;
            }}
            getUpdatedMdastNode={(
              mdastParagraphNode,
              paragraphChildren: any,
            ) => {
              if (paragraphChildren.length > 0) {
                const titleStr = toMarkdown(paragraphChildren[0]);
                if (titleStr === mdastNode.attributes.author) {
                  return mdastParagraphNode;
                }

                setAuthor(titleStr);

                return {
                  ...mdastParagraphNode,
                  attributes: {
                    ...mdastNode.attributes,
                    author: titleStr,
                  },
                };
              }

              return mdastParagraphNode;
            }}
            contentEditableProps={{ 'aria-label': 'Admonition Title' }}
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
            paddingBottom: 0, //controlled by parent, lesson setting
            paddingTop: 0,
          }}
        >
          {mdastNode.attributes.avatar && (
            <img
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
              src={mdastNode.attributes.avatar}
              alt="Author Headshot"
            />
          )}
          <RC5NestedLexicalEditor<ContainerDirective>
            block={true}
            getContent={(node) => node.children}
            getUpdatedMdastNode={(node, children: any) => ({
              ...node,
              children,
            })}
            contentEditableProps={{
              className: scopedClass,
              'aria-label': `Quote ${cellIndex + 1} content`,
            }}
          />

          <NestedLexicalEditor<Paragraph>
            getContent={(node) => {
              const theNode = convertMarkdownToMdast(
                authorHeader,
                syntaxExtensions,
              );
              return theNode.children;
            }}
            getUpdatedMdastNode={(
              mdastParagraphNode,
              paragraphChildren: any,
            ) => {
              if (paragraphChildren.length > 0) {
                const titleStr = toMarkdown(paragraphChildren[0]);
                if (titleStr === mdastNode.attributes.author) {
                  return mdastParagraphNode;
                }

                setAuthor(titleStr);

                return {
                  ...mdastParagraphNode,
                  attributes: {
                    ...mdastNode.attributes,
                    author: titleStr,
                  },
                };
              }

              return mdastParagraphNode;
            }}
            contentEditableProps={{ 'aria-label': 'Admonition Title' }}
          />
        </Stack>
      )}
    </Box>
  );
};
