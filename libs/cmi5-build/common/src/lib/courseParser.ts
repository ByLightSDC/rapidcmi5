import {
  AdmonitionTypeEnum,
  BasicResponse,
  CourseData,
  QuestionGrading,
  QuestionResponse,
  QuizCompletionEnum,
  QuizContent,
  QuizOption,
  QuizQuestion,
} from '@rapid-cmi5/types/cmi5';
import { mdxJsxFromMarkdown, mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';

import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough';
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter';
import {
  gfmTaskListItemFromMarkdown,
  gfmTaskListItemToMarkdown,
} from 'mdast-util-gfm-task-list-item';
import { gfmTableFromMarkdown, gfmTableToMarkdown } from 'mdast-util-gfm-table';
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import { gfmTable } from 'micromark-extension-gfm-table';

import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { mdxMd } from 'micromark-extension-mdx-md';

import { toMarkdown } from 'mdast-util-to-markdown';
import type { Root, Code, RootContent, Text } from 'mdast';
import {
  directiveFromMarkdown,
  directiveToMarkdown,
} from 'mdast-util-directive';
import { frontmatter } from 'micromark-extension-frontmatter';

import { parse } from 'yaml';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { directive } from 'micromark-extension-directive';
import { SKIP, visit } from 'unist-util-visit';
export const rc5MetaFilename = 'RC5.yaml';

function getTagName(value: string) {
  return value
    .trim()
    .replace(/^<\/?\s*|\s*\/?>$/g, '') // remove <, </, >, />
    .split(/\s+/)[0] // take first chunk before any space
    .toLowerCase(); // normalize case
}

function parseToMdast(input: string) {
  const tree = fromMarkdown(input, {
    extensions: [frontmatter(), gfmTaskListItem(), gfmTable()],
    mdastExtensions: [
      gfmStrikethroughFromMarkdown(),
      frontmatterFromMarkdown('yaml'),
      gfmTaskListItemFromMarkdown(),
      gfmTableFromMarkdown(),
    ],
  });

  visit(tree, (node, index, parent) => {
    if (node.type === 'link') {
      try {
        const u = new URL(node.url);
        if (u.protocol === 'mailto:') {
          node.title = u.pathname;
        } else {
          node.title = u.hostname.replace(/^www\./, '');
        }
      } catch {
        // non-URL (relative, etc.) — fall back below
      }

      if (!node.title) {
        const child = node.children?.[0];
        node.title = child?.type === 'text' ? child.value : 'link';
      }
    }
    if (node.type === 'html' && parent && index != null) {
      const s = node.value || '';

      const tagname = getTagName(s);
      const whitelist = [
        'div',
        'b',
        'p',
        'strong',
        'mark',
        'a',
        'img',
        'br',
        'sup',
        'u',
      ];

      if (!whitelist.includes(tagname)) {
        parent.children.splice(index, 1, { type: 'text', value: s });
        return [SKIP, index + 1];
      }
    }
    return;
  });

  let md = toMarkdown(tree, {
    extensions: [
      mdxJsxToMarkdown(),
      gfmStrikethroughToMarkdown(),
      frontmatterToMarkdown('yaml'),
      gfmTaskListItemToMarkdown(),
      gfmTableToMarkdown(),
    ],
    bullet: '-',
    unsafe: [
      {
        character: '<',
        inConstruct: [
          'phrasing',
          'paragraph',
          'mdxJsxFlowElement',
          'mdxJsxTextElement',
          'containerDirective',
          'tableCell',
        ],
      },
      {
        character: ':',
        inConstruct: ['phrasing', 'paragraph', 'mdxJsxFlowElement'],
      },
    ],
  });

  return md;
}

function mkdocsToMdxRawTextCleanup(content: string) {
  let cleaned = content.replaceAll('<br>', '<br/>');

  cleaned = cleaned.replaceAll('quizdownb.init();', '');

  cleaned = cleaned
    .replaceAll('<li>', '- ')
    .replaceAll('</li>', '')
    .replaceAll('<ul>', '')
    .replaceAll('</ul>', '');

  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '');

  cleaned = cleaned.replace(
    /!\[([^\]]*)\]\((.*?)\)\{\:\s*style="height:(\d+)px;?"\s*\}/g,
    (_match, alt = '', src = '', height = '') =>
      `<img height="${height}" src="${src}" />`,
  );

  cleaned = cleaned.replace(
    /!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+"([^"]*)")?\s*\)/g,
    (m, alt, url, title) => {
      const t = title ? ` title="${title}"` : '';
      return `<img src="${url}" alt="${alt}" height="500"/>`;
    },
  );

  // Remvoe html comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  cleaned = cleaned.replace(/<head>[\s\S]*?<\/head>/gi, '');
  return cleaned;
}

export function cleanMkdocs(
  content: string,
  slidename: string = '',
  strictMode: boolean = false,
) {
  let md = mkdocsToMdxRawTextCleanup(content);

  md = parseToMdast(md);
  md = collectQuizDown(md);

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

export function convertMkdocsAdmonitions(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let i = 0;

  const headerRE =
    /^\s*(\?\?\?|!!!)(\+)?\s+([A-Za-z][\w-]*)(?:\s+"([^"]*)")?\s*$/;

  function escAttr(raw: string) {
    if (!raw) return '';
    let s = String(raw);

    // Remove Markdown-style backslash escapes, but keep the escaped char
    s = s.replace(/\\([\\`*_{}\[\]()>#+\-.!|:~/])/g, '$1');

    // Drop any remaining backslashes (if you want to be strict)
    s = s.replace(/\\/g, '');

    // Remove asterisks entirely
    s = s.replace(/\*/g, '');

    // Escape double quotes for attribute context
    s = s.replace(/"/g, '&quot;');

    // Collapse newlines/extra whitespace
    s = s
      .replace(/\r?\n|\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return s;
  }

  type AdmonitionType =
    (typeof AdmonitionTypeEnum)[keyof typeof AdmonitionTypeEnum];

  function isAdmonitionType(s: string): s is AdmonitionType {
    return (Object.values(AdmonitionTypeEnum) as string[]).includes(s);
  }

  while (i < lines.length) {
    const m = lines[i].match(headerRE);
    if (!m) {
      out.push(lines[i++]);
      continue;
    }

    const marker = m[1]; // ??? or !!!
    const plus = !!m[2]; // ???+ means open by default
    let kind = m[3].toLowerCase(); // abstract, note, tip, etc.
    if (!isAdmonitionType(kind)) kind = AdmonitionTypeEnum.note;
    const title = m[4]; // optional "Title"

    const content: string[] = [];
    let j = i + 1;

    const fenceStartRE = /^[ \t]*`{3,}/;

    const fenceEndRE = /^[ \t]*`{3,}\s*$/;

    let openingBacktickCount = 3;

    while (j < lines.length) {
      const ln = lines[j];

      // start of fenced code?
      if (fenceStartRE.test(ln)) {
        openingBacktickCount = ln.length;
        j++;
        while (j < lines.length) {
          if (fenceEndRE.test(lines[j])) {
            if (lines[j].length === openingBacktickCount) break;
          }
          content.push(lines[j]);
          j++;
        }
        if (j < lines.length) j++;
        break;
      }
      if (ln === '') {
        const next = lines[j + 1];
        if (next && fenceStartRE.test(next)) {
          content.push('');
          j++;
          continue;
        }
        break; // end of admonition content
      }
      content.push(ln);
      j++;
    }

    // Build directive attributes
    const attrs: string[] = [];
    attrs.push(`title="${escAttr(title) || kind}"`);

    if (marker === '???') {
      attrs.push('collapse="closed"');
      if (plus) attrs.push('collapse="open"');
    }

    const attrStr = attrs.length ? `{${attrs.join(' ')}}` : '';

    out.push(`:::${kind}${attrStr}`);

    md = parseToMdast(content.join('\n'));

    out.push(md);
    out.push(':::');

    i = j;
  }

  return out.join('\n');
}

export function parseQuizdownFile(quizdownText: string): {
  metadata: string;
  questions: QuizQuestion[];
} {
  // Split metadata and questions
  const parts = quizdownText?.split('---');

  const metadataRaw = parts[1];
  const questionsRawList = parts.slice(2);

  const metadata = metadataRaw;

  // Parse questions
  const questions: QuizQuestion[] = [];
  questionsRawList.forEach((questionsRaw) => {
    // We are testing if its one of our question blocks

    let yamlQuestion;
    try {
      yamlQuestion = parse(questionsRaw);
    } catch {
      yamlQuestion = null;
    }

    try {
      if (yamlQuestion !== '</div>') {
        if (yamlQuestion && 'questionObject' in yamlQuestion) {
          questions.push(yamlQuestion['questionObject']);
        }
      }
    } catch (e) {
      console.error('Error parsing quiz yaml ', e);
    }

    const questionBlocks = questionsRaw.split(/###/).slice(1);

    questionBlocks.forEach((block, index) => {
      const questionContent = block.trim();

      // Extract question text
      const questionTextMatch = questionContent.match(/(.*?)(?:\n- \[|$)/s);
      const questionText = questionTextMatch
        ? questionTextMatch[1].trim().split('\n')[0]
        : '';

      const answersRaw = [
        ...questionContent.matchAll(/^\s*-\s\[(x| )\]\s(.+)/gim),
      ];
      const answers: QuizOption[] = answersRaw.map(([_, x, ans]) => ({
        text: ans.trim(),
        correct: x.toLowerCase() === 'x',
      }));

      // Determine question type
      const numberCorrect = answers.filter((ans) => ans.correct).length;
      const qtype: QuestionResponse =
        numberCorrect > 1
          ? QuestionResponse.SelectAll
          : QuestionResponse.MultipleChoice;
      const question: QuizQuestion = {
        question: questionText,
        type: qtype,
        typeAttributes: {
          options: answers,
          grading: QuestionGrading.Exact,
          correctAnswer: '',
        } as BasicResponse,
        cmi5QuestionId: index.toString(),
      };
      questions.push(question);
    });
  });

  return { metadata, questions };
}

function collectQuizDown(md: string): string {
  const quizdownRegex = /<div class="quizdown">([\s\S]*?)<\/div>/g;

  let match: RegExpExecArray | null;
  let output = md;
  const replacements: { original: string; transformed: string }[] = [];

  while ((match = quizdownRegex.exec(md)) !== null) {
    const fullMatch = match[0]; // The entire <div>...</div>
    const quizContent = match[1]; // Just the content inside

    const transformedContent = parseQuizdownFile(quizContent.trim());
    const rc5Quiz = {
      cmi5QuizId: 'COL',
      completionRequired: QuizCompletionEnum.Passed,
      passingScore: 80,
      // Did not realize JS did not have a shuffle function for arrays
      questions: transformedContent.questions.sort(() => Math.random() - 0.5),
      title: 'Check on Learning',
    } as QuizContent;

    const rc5QuizJson = JSON.stringify(rc5Quiz, null, 2);

    // This is the AST node for your quiz directive
    const quizDirective: RootContent = {
      type: 'containerDirective',
      name: 'quiz',
      attributes: {},
      children: [
        {
          type: 'code',
          lang: 'json',
          value: rc5QuizJson,
        } as Code,
      ],
    };

    const root: Root = {
      type: 'root',
      children: [quizDirective],
    };

    const markdown = toMarkdown(root, { extensions: [directiveToMarkdown()] });

    replacements.push({
      original: fullMatch,
      transformed: markdown,
    });
  }

  // Perform all replacements
  for (const { original, transformed } of replacements) {
    output = output.replace(original, transformed);
  }

  return output;
}
