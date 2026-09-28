import { act, renderHook } from '@testing-library/react';
import {
  QuestionGrading,
  QuestionResponse,
} from '@rapid-cmi5/cmi5-build-common';
import type { QuizQuestion } from '@rapid-cmi5/cmi5-build-common';
import useQuizGrader, {
  calculateQuizGrade,
  getReviewIndication,
  gradeQuestion,
} from './useQuizGrader';

const options = [
  { text: 'Wrong', correct: false },
  { text: 'Correct one', correct: true },
  { text: 'Correct two', correct: true },
];

function question(
  type: QuestionResponse,
  correctAnswer: string | number,
  overrides: Partial<QuizQuestion['typeAttributes']> = {},
): QuizQuestion {
  return {
    question: `${type} question`,
    type,
    cmi5QuestionId: `${type}-id`,
    typeAttributes: {
      correctAnswer,
      grading: QuestionGrading.Exact,
      ...overrides,
    },
  } as QuizQuestion;
}

describe('quiz grading', () => {
  it('grades every supported response type', () => {
    const questions = [
      question(QuestionResponse.MultipleChoice, '', { options }),
      question(QuestionResponse.SelectAll, '', { options }),
      question(QuestionResponse.Number, 12),
      question(QuestionResponse.FreeResponse, 'Answer'),
      question(QuestionResponse.TrueFalse, 'true'),
      question(QuestionResponse.Matching, '', {
        matching: [
          { option: 'A', response: '1' },
          { option: 'B', response: '2' },
        ],
      }),
    ];

    expect(
      calculateQuizGrade(questions, [
        2,
        [1, 2],
        '12.0',
        ' answer ',
        'TRUE',
        ['1', '2'],
      ]),
    ).toEqual({ score: 100, grades: [true, true, true, true, true, true] });
  });

  it('requires every and only correct select-all option', () => {
    const selectAll = question(QuestionResponse.SelectAll, '', { options });

    expect(gradeQuestion(selectAll, [1])).toBe(false);
    expect(gradeQuestion(selectAll, [0, 1, 2])).toBe(false);
    expect(gradeQuestion(selectAll, [1, 2])).toBe(true);
  });

  it('rejects missing, malformed, and out-of-range answers', () => {
    const choice = question(QuestionResponse.MultipleChoice, '', { options });

    expect(gradeQuestion(choice, undefined)).toBe(false);
    expect(gradeQuestion(choice, 99)).toBe(false);
    expect(gradeQuestion(choice, [1])).toBe(false);
  });

  it('requires a complete ordered matching response', () => {
    const matching = question(QuestionResponse.Matching, '', {
      matching: [
        { option: 'A', response: '1' },
        { option: 'B', response: '2' },
      ],
    });

    expect(gradeQuestion(matching, ['1'])).toBe(false);
    expect(gradeQuestion(matching, ['2', '1'])).toBe(false);
    expect(gradeQuestion(matching, ['1', '2'])).toBe(true);
  });

  it('keeps grades aligned with question indexes when questions are ungraded', () => {
    const questions = [
      question(QuestionResponse.FreeResponse, 'ignored', {
        grading: QuestionGrading.None,
      }),
      question(QuestionResponse.FreeResponse, 'yes'),
      question(QuestionResponse.FreeResponse, 'yes'),
    ];

    expect(calculateQuizGrade(questions, ['anything', 'yes', 'no'])).toEqual({
      score: 50,
      grades: [true, true, false],
    });
  });

  it('returns full credit when every question is ungraded', () => {
    const questions = [
      question(QuestionResponse.FreeResponse, 'ignored', {
        grading: QuestionGrading.None,
      }),
    ];

    expect(calculateQuizGrade(questions, [])).toEqual({
      score: 100,
      grades: [true],
    });
  });
});

describe('review indications', () => {
  it('does not mark unselected options', () => {
    const choice = question(QuestionResponse.MultipleChoice, '', { options });

    expect(getReviewIndication(choice, 1, 0)).toBe('');
    expect(getReviewIndication(choice, 1, 1)).toBe('bg-green-800');
    expect(getReviewIndication(choice, 0, 0)).toBe('bg-red-800');
  });

  it('does not mark ungraded answers', () => {
    const ungraded = question(QuestionResponse.FreeResponse, 'ignored', {
      grading: QuestionGrading.None,
    });

    expect(getReviewIndication(ungraded, 'wrong')).toBe('');
  });
});

describe('useQuizGrader', () => {
  it('stores per-question grades after grading', () => {
    const { result } = renderHook(() => useQuizGrader());
    const questions = [
      question(QuestionResponse.FreeResponse, 'yes'),
      question(QuestionResponse.FreeResponse, 'yes'),
    ];

    let score = 0;
    act(() => {
      score = result.current.gradeQuiz(questions, ['yes', 'no']);
    });

    expect(score).toBe(50);
    expect(result.current.getGrade(0)).toBe(true);
    expect(result.current.getGrade(1)).toBe(false);
  });
});
