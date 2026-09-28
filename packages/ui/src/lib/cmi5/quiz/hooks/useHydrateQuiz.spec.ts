import { renderHook, waitFor } from '@testing-library/react';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import type { AnswerType } from '@rapid-cmi5/cmi5-build-common';
import { debugLogError } from '../../../utility/logger';
import { useHydrateQuiz } from './useHydrateQuiz';

jest.mock('../../../utility/logger', () => ({ debugLogError: jest.fn() }));

const mockDebugLogError = debugLogError as jest.Mock;

function baseOptions() {
  return {
    readyToHydrate: true,
    getActivityCache: jest.fn(),
    quizId: 'quiz-id',
    activeTab: 2,
    setAllAnswers: jest.fn(),
    setCurrentQuestion: jest.fn(),
    readyToPersist: { current: false },
    setIsLoading: jest.fn(),
    allAnswers: [null, null] as AnswerType[],
  };
}

describe('useHydrateQuiz', () => {
  beforeEach(() => jest.clearAllMocks());

  it('immediately enables persistence when no cache handler exists', () => {
    const options = { ...baseOptions(), getActivityCache: null };

    renderHook(() => useHydrateQuiz(options));

    expect(options.readyToPersist.current).toBe(true);
    expect(options.setIsLoading).toHaveBeenCalledWith(false);
  });

  it('waits until hydration is ready and has an active slide', () => {
    const options = { ...baseOptions(), readyToHydrate: false };

    renderHook(() => useHydrateQuiz(options));

    expect(options.getActivityCache).not.toHaveBeenCalled();
    expect(options.setIsLoading).not.toHaveBeenCalled();
  });

  it('hydrates valid cached progress', async () => {
    const options = baseOptions();
    options.getActivityCache.mockResolvedValue({
      quizId: 'quiz-id',
      slideNumber: 2,
      currentQuestion: 1,
      answers: ['one', 'two'],
    });

    renderHook(() => useHydrateQuiz(options));

    await waitFor(() => {
      expect(options.setAllAnswers).toHaveBeenCalledWith(['one', 'two']);
    });
    expect(options.setCurrentQuestion).toHaveBeenCalledWith(1);
    expect(options.getActivityCache).toHaveBeenCalledWith(
      RC5ActivityTypeEnum.quiz,
      { quizId: 'quiz-id', slideNumber: 2 },
    );
    expect(options.readyToPersist.current).toBe(true);
    expect(options.setIsLoading).toHaveBeenCalledWith(false);
  });

  it('rejects stale or invalid cached progress but finishes loading', async () => {
    const options = baseOptions();
    options.getActivityCache.mockResolvedValue({
      quizId: 'quiz-id',
      slideNumber: 2,
      currentQuestion: 5,
      answers: ['wrong-length'],
    });

    renderHook(() => useHydrateQuiz(options));

    await waitFor(() =>
      expect(options.setIsLoading).toHaveBeenCalledWith(false),
    );
    expect(options.setAllAnswers).not.toHaveBeenCalled();
    expect(options.setCurrentQuestion).not.toHaveBeenCalled();
    expect(options.readyToPersist.current).toBe(true);
  });

  it('reports cache errors and still enables persistence', async () => {
    const options = baseOptions();
    options.getActivityCache.mockRejectedValue(new Error('offline'));

    renderHook(() => useHydrateQuiz(options));

    await waitFor(() => expect(mockDebugLogError).toHaveBeenCalled());
    expect(options.readyToPersist.current).toBe(true);
    expect(options.setIsLoading).toHaveBeenCalledWith(false);
  });

  it('does not update state after unmount', async () => {
    let resolveCache: (value: unknown) => void = () => undefined;
    const options = baseOptions();
    options.getActivityCache.mockReturnValue(
      new Promise((resolve) => {
        resolveCache = resolve;
      }),
    );
    const { unmount } = renderHook(() => useHydrateQuiz(options));

    expect(options.getActivityCache).toHaveBeenCalled();
    unmount();
    resolveCache({ currentQuestion: 0, answers: ['one', 'two'] });
    await Promise.resolve();

    expect(options.setAllAnswers).not.toHaveBeenCalled();
    expect(options.setIsLoading).not.toHaveBeenCalled();
    expect(options.readyToPersist.current).toBe(false);
  });
});
