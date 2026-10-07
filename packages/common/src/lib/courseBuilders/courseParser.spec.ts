import { describe, expect, it, vi } from 'vitest';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { gfmTable } from 'micromark-extension-gfm-table';
import { QuestionResponse } from '../types/activities';
import {
  cleanMkdocs,
  convertMkdocsAdmonitions,
  parseQuizdownFile,
} from './courseParser';

describe('cleanMkdocs', () => {
  it('accepts uppercase and lowercase HTML line breaks in a table', () => {
    const input = [
      '| Location | Network |',
      '| --- | --- |',
      '| Cape Town<BR>AS 36994 | Johannesburg<br>AS 5713<hr>Durban |',
    ].join('\n');

    const result = cleanMkdocs(input, 'network.md', true);

    expect(result).toContain('Cape Town<br />AS 36994');
    expect(result).toContain('Johannesburg<br />AS 5713<hr />Durban');
    const tree = fromMarkdown(result, {
      extensions: [gfmTable()],
      mdastExtensions: [gfmTableFromMarkdown()],
    });
    expect(tree.children[0].type).toBe('table');
    if (tree.children[0].type === 'table') {
      expect(tree.children[0].children).toHaveLength(2);
      expect(tree.children[0].children[1].children).toHaveLength(2);
    }
  });

  it('adds readable titles to links without titles', () => {
    const result = cleanMkdocs(
      '[Docs](https://www.example.com/guide)',
      'links.md',
      true,
    );

    expect(result).toContain('"example.com"');
  });

  it('keeps image paths containing spaces as image sources', () => {
    const result = cleanMkdocs(
      '![Network map](./assets/network map.png)',
      'images.md',
      true,
    );

    expect(result).toContain('src="./assets/network map.png"');
    expect(result).toContain('alt="Network map"');
  });

  it('throws a slide-specific error in strict mode for invalid MDX', () => {
    expect(() => cleanMkdocs('<img src="a">', 'broken.md', true)).toThrow(
      /Could not parse the markdown provided.*broken\.md/,
    );
  });

  it('logs invalid MDX and returns the cleaned text in non-strict mode', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      const result = cleanMkdocs('<img src="a">', 'broken.md');

      expect(result).toContain('<img src="a">');
      expect(log).toHaveBeenCalledWith(expect.stringContaining('broken.md'));
    } finally {
      log.mockRestore();
    }
  });

  it('turns Quizdown markup into a quiz directive', () => {
    const input = [
      '<div class="quizdown">',
      '---',
      'shuffle: false',
      '---',
      '### Check the network?',
      '- [x] Yes',
      '- [ ] No',
      '</div>',
    ].join('\n');

    const result = cleanMkdocs(input, 'quiz.md', true);

    expect(result).toContain(':::quiz');
    expect(result).toContain('"question": "Check the network?"');
    expect(result).toContain('"cmi5QuizId": "COL"');
  });

  it('converts marked questions into a quiz and omits the answer key', () => {
    const input = [
      'Before the quiz.',
      '<!-- rapid-cmi5:quiz id=module-01-practice title="Module 01 Practice Quiz" passing-score=80 -->',
      '# Practice Quiz',
      '<!-- rapid-cmi5:question id=q1 correct=B -->',
      '1. **What is ROS Greyspace?**',
      '   A. A public Internet replacement  ',
      '   B. A synthetic Internet for training  ',
      '<!-- rapid-cmi5:question id=q2 correct=A -->',
      '2. **How many regions?**',
      '   A. Seven  ',
      '   B. Three  ',
      '## Answer Key',
      '1. B',
      '2. A',
      '<!-- rapid-cmi5:quiz:end -->',
      'After the quiz.',
    ].join('\n');

    const result = cleanMkdocs(input, 'practice.md', true);
    const quizJson = /:::quiz\s+```json\s+([\s\S]*?)\s+```\s+:::/.exec(
      result,
    )?.[1];
    expect(quizJson).toBeDefined();
    const quiz = JSON.parse(quizJson!);
    expect(quiz).toMatchObject({
      cmi5QuizId: 'module-01-practice',
      passingScore: 80,
      questions: [
        {
          cmi5QuestionId: 'q1',
          question: 'What is ROS Greyspace?',
          typeAttributes: {
            correctAnswer: 'A synthetic Internet for training',
            options: [
              { text: 'A public Internet replacement', correct: false },
              { text: 'A synthetic Internet for training', correct: true },
            ],
          },
        },
        {
          cmi5QuestionId: 'q2',
          typeAttributes: { correctAnswer: 'Seven' },
        },
      ],
    });
    expect(result).toContain('Before the quiz.');
    expect(result).toContain('After the quiz.');
    expect(result).not.toContain('## Answer Key');
  });

  it('rejects a marked quiz whose answer does not match an option', () => {
    expect(() =>
      cleanMkdocs(
        [
          '<!-- rapid-cmi5:quiz id=practice title="Practice" passing-score=80 -->',
          '<!-- rapid-cmi5:question id=q1 correct=C -->',
          '1. **Question?**',
          '   A. One',
          '   B. Two',
          '<!-- rapid-cmi5:quiz:end -->',
        ].join('\n'),
        'practice.md',
        true,
      ),
    ).toThrow(/Question q1 has no matching answer/);
  });
});

describe('convertMkdocsAdmonitions', () => {
  it('converts an expanded warning into a directive', () => {
    const result = convertMkdocsAdmonitions(
      '???+ warning "Heads up"\n    Check the connection.\n',
    );

    expect(result).toContain(':::warning');
    expect(result).toContain('title="Heads up"');
    expect(result).toContain('collapse="open"');
    expect(result).not.toContain('collapse="closed"');
    expect(result).toContain('Check the connection.');
  });
});

describe('parseQuizdownFile', () => {
  it('parses single-answer and multiple-answer questions', () => {
    const input = [
      '---',
      'shuffle: false',
      '---',
      '### One answer?',
      '- [x] First',
      '- [ ] Second',
      '---',
      '### Two answers?',
      '- [x] First',
      '- [x] Second',
    ].join('\n');

    const result = parseQuizdownFile(input);

    expect(result.metadata).toContain('shuffle: false');
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]).toMatchObject({
      question: 'One answer?',
      type: QuestionResponse.MultipleChoice,
      typeAttributes: {
        options: [
          { text: 'First', correct: true },
          { text: 'Second', correct: false },
        ],
      },
    });
    expect(result.questions[1].type).toBe(QuestionResponse.SelectAll);
    expect(result.questions.map((question) => question.cmi5QuestionId)).toEqual(
      ['0', '1'],
    );
  });
});
