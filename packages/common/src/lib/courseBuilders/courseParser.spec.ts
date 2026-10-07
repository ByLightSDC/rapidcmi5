import { describe, expect, it, vi } from 'vitest';
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
      '| Cape Town<BR>AS 36994 | Johannesburg<br>AS 5713 |',
    ].join('\n');

    const result = cleanMkdocs(input, 'network.md', true);

    expect(result).toContain('Cape Town');
    expect(result).toContain('AS 36994');
    expect(result).not.toMatch(/<\/?br\b/i);
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
