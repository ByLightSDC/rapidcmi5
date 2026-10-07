import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx';
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmTaskListItemFromMarkdown } from 'mdast-util-gfm-task-list-item';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import { gfmTable } from 'micromark-extension-gfm-table';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { mdxMd } from 'micromark-extension-mdx-md';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { frontmatter } from 'micromark-extension-frontmatter';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { directive } from 'micromark-extension-directive';
import { cleanMkdocsRawText, parseToMdast } from './markdownNormalization';
import { convertMkdocsAdmonitions } from './mkdocsAdmonitions';
import { collectQuizDown } from './quizdown';
import { extractMarkedQuizzes } from './markedQuiz';
import { extractMkdocsTabs } from './mkdocsTabs';

export { convertMkdocsAdmonitions } from './mkdocsAdmonitions';
export { parseQuizdownFile } from './quizdown';

export const RC5_FILENAME = 'RC5.yaml';
export const LESSON_CONFIG_FILENAME = 'config.json';

export function cleanMkdocs(
  content: string,
  slidename = '',
  strictMode = false,
) {
  const markedQuizzes = extractMarkedQuizzes(content, slidename);
  const mkdocsTabs = extractMkdocsTabs(markedQuizzes.markdown);
  let md = cleanMkdocsRawText(mkdocsTabs.markdown);

  md = parseToMdast(md);
  md = collectQuizDown(md);
  for (const { placeholder, directive } of markedQuizzes.replacements) {
    md = md.replace(placeholder, directive);
  }
  for (const { placeholder, directive } of mkdocsTabs.replacements) {
    md = md.replace(placeholder, directive);
  }

  md = convertMkdocsAdmonitions(md);

  try {
    fromMarkdown(md, {
      extensions: [
        mdxJsx(),
        mdxMd(),
        directive(),
        frontmatter(),
        gfmTaskListItem(),
        gfmTable(),
      ],
      mdastExtensions: [
        mdxJsxFromMarkdown(),
        directiveFromMarkdown(),
        gfmStrikethroughFromMarkdown(),
        frontmatterFromMarkdown('yaml'),
        gfmTaskListItemFromMarkdown(),
        gfmTableFromMarkdown(),
      ],
    });
  } catch (error) {
    const errorTemplate = `Could not parse the markdown provided ${error} ${slidename}`;
    if (strictMode) {
      throw Error(errorTemplate);
    } else {
      console.log(errorTemplate);
    }
  }
  return md;
}
