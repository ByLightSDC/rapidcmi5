import {
  isSupportedDirectiveName,
  validateDirectiveContent,
} from './directiveValidators';

const quiz = {
  cmi5QuizId: 'quiz-1',
  passingScore: 80,
  questions: [],
};

describe('directive validators', () => {
  it('dispatches validation by directive name', () => {
    expect(isSupportedDirectiveName('quiz')).toBe(true);
    expect(isSupportedDirectiveName('unknown')).toBe(false);
    expect(validateDirectiveContent('quiz', quiz)).toEqual({
      valid: true,
      data: quiz,
    });
  });

  it('returns useful schema errors for invalid directive content', () => {
    const result = validateDirectiveContent('quiz', {
      passingScore: 80,
      questions: [],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('cmi5QuizId')]),
      );
    }
  });
});
