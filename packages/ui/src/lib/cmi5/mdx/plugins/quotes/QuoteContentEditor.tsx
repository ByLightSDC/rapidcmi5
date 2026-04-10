import {
  DirectiveEditorProps,
  syntaxExtensions$,
  useCellValues,
} from '@mdxeditor/editor';
import {
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ContainerDirective } from 'mdast-util-directive';
import { QuoteContentDirectiveNode } from './types';
import { Box, Stack } from '@mui/material';
import type { Paragraph } from 'mdast';
import { RC5NestedLexicalEditor } from '../shared/RC5NestedLexicalEditor';
import { QuotesContext } from './QuotesContext';
import { convertMarkdownToMdast } from '../../util/conversion';
import { toMarkdown } from 'mdast-util-to-markdown';
import { imgCache } from '../image/constants';
import { LessonThemeContext } from '../../contexts/LessonThemeContext';
import { useLessonThemeStyles } from 'packages/ui/src/lib/hooks/useLessonThemeStyles';
import { fontPresets } from './constants';

/**
 * Quote Content Editor for the Quotes plugin.
 * Renders a single quote within a quotes container with a nested editor.
 */
export const QuoteContentEditor: React.FC<
  DirectiveEditorProps<QuoteContentDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [syntaxExtensions] = useCellValues(syntaxExtensions$);
  const [cellIndex, setCellIndex] = useState(-1);
  const { avatar, carouselIndex, imageSource, preset } =
    useContext(QuotesContext);

  //#region Styles
  const { lessonTheme } = useContext(LessonThemeContext);
  const { blockPadding } = useLessonThemeStyles(lessonTheme);

  const scopedClass = useRef(
    `quote-block-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const scopedAuthorClass = useRef(
    `quote-author-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const fontStyles = useMemo(() => {
    const config = fontPresets[preset as keyof typeof fontPresets];
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
            .${scopedAuthorClass} {
               font-size: ${config.authorFontSize};
               font-weight: ${config.authorFontWeight};
            }
          `}</style>
    );
  }, [preset]);

  //#endregion


  const avatarImage = useMemo(() => {
    let imageDim = '72px';
    let borderRadius = '50%';
    if (preset === '3') {
      imageDim = '160px';
      borderRadius = '';
    }
    return (
      <>
        {imageSource && (
          <img
            style={{
              width: imageDim,
              height: imageDim,
              borderRadius: borderRadius,
              objectFit: 'cover',
            }}
            src={imgCache.read(imageSource)}
            alt="Author Headshot"
          />
        )}
      </>
    );
  }, [imageSource, preset]);

  const quoteBlock = (
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
  );

  const authorEl = (
    <RC5NestedLexicalEditor<Paragraph>
      getContent={(node) => {
        const theNode = convertMarkdownToMdast(
          mdastNode.attributes.author || '',
          syntaxExtensions,
        );
        return theNode.children;
      }}
      getUpdatedMdastNode={(mdastParagraphNode, paragraphChildren: any) => {
        if (paragraphChildren.length > 0) {
          const authorStr = toMarkdown(paragraphChildren[0]);
          if (authorStr === mdastNode.attributes.author) {
            return mdastParagraphNode;
          }

          return {
            ...mdastParagraphNode,
            attributes: {
              ...mdastNode.attributes,
              author: authorStr,
              avatar: avatar,
            },
          };
        }

        return mdastParagraphNode;
      }}
      contentEditableProps={{
        className: scopedAuthorClass,
        'aria-label': 'Author Name',
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
            //REF paddingTop: 0, NestedLexicalEditor has overly fat padding, trying to balance top padding against it
          }}
        >
          {avatarImage}
          {quoteBlock}
          {authorEl}
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
          {avatarImage}
          {quoteBlock}
          {authorEl}
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
            paddingBottom: 0, //controlled by parent, lesson setting
            paddingTop: 0,
          }}
        >
          {avatarImage}
          <Stack direction="column">
            {quoteBlock}
            {authorEl}
          </Stack>
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
            paddingBottom: 0, //controlled by parent, lesson setting
            paddingTop: 0,
          }}
        >
          {avatarImage}
          <Stack direction="column">
            {quoteBlock}
            {authorEl}
          </Stack>
        </Stack>
      )}
    </Box>
  );
};
