import { act, renderHook } from '@testing-library/react';
import type { AnswerType } from '@rapid-cmi5/cmi5-build-common';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { usePersistQuizProgress } from './usePersistQuiz';

type HookProps = {
  currentQuestion: number;
  allAnswers: AnswerType[];
};

describe('usePersistQuizProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('debounces answer persistence for five seconds', () => {
    const setActivityCache = jest.fn();
    const readyToPersist = { current: true };

    const { rerender } = renderHook(
      ({ allAnswers }: HookProps) =>
        usePersistQuizProgress({
          readyToPersist,
          setActivityCache,
          currentQuestion: 0,
          allAnswers,
          quizId: 'quiz-id',
          activeTab: 3,
        }),
      { initialProps: { currentQuestion: 0, allAnswers: [''] } },
    );
    setActivityCache.mockClear();
    rerender({ currentQuestion: 0, allAnswers: ['answer'] });

    act(() => jest.advanceTimersByTime(4999));
    expect(setActivityCache).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(setActivityCache).toHaveBeenCalledWith(RC5ActivityTypeEnum.quiz, {
      answers: ['answer'],
      quizId: 'quiz-id',
      slideNumber: 3,
    });
  });

  it('cancels stale answer saves when answers change', () => {
    const setActivityCache = jest.fn();
    const readyToPersist = { current: true };
    const { rerender } = renderHook(
      ({ allAnswers }: HookProps) =>
        usePersistQuizProgress({
          readyToPersist,
          setActivityCache,
          currentQuestion: 0,
          allAnswers,
          quizId: 'quiz-id',
          activeTab: 3,
        }),
      { initialProps: { currentQuestion: 0, allAnswers: ['old'] } },
    );
    setActivityCache.mockClear();

    act(() => jest.advanceTimersByTime(4000));
    rerender({ currentQuestion: 0, allAnswers: ['new'] });
    act(() => jest.advanceTimersByTime(5000));

    expect(setActivityCache).toHaveBeenCalledTimes(1);
    expect(setActivityCache).toHaveBeenCalledWith(
      RC5ActivityTypeEnum.quiz,
      expect.objectContaining({ answers: ['new'] }),
    );
  });

  it('persists question changes immediately', () => {
    const setActivityCache = jest.fn();
    const readyToPersist = { current: true };
    const { rerender } = renderHook(
      ({ currentQuestion }: HookProps) =>
        usePersistQuizProgress({
          readyToPersist,
          setActivityCache,
          currentQuestion,
          allAnswers: [],
          quizId: 'quiz-id',
          activeTab: 3,
        }),
      { initialProps: { currentQuestion: 0, allAnswers: [] } },
    );
    setActivityCache.mockClear();

    rerender({ currentQuestion: 2, allAnswers: [] });

    expect(setActivityCache).toHaveBeenCalledWith(RC5ActivityTypeEnum.quiz, {
      currentQuestion: 2,
      answers: [],
      quizId: 'quiz-id',
      slideNumber: 3,
    });
  });

  it('flushes the latest answers when moving to the next question', () => {
    const setActivityCache = jest.fn();
    const readyToPersist = { current: true };
    const { rerender } = renderHook(
      ({ currentQuestion, allAnswers }: HookProps) =>
        usePersistQuizProgress({
          readyToPersist,
          setActivityCache,
          currentQuestion,
          allAnswers,
          quizId: 'quiz-id',
          activeTab: 3,
        }),
      { initialProps: { currentQuestion: 0, allAnswers: [''] } },
    );
    setActivityCache.mockClear();

    rerender({ currentQuestion: 0, allAnswers: ['typed answer'] });
    expect(setActivityCache).not.toHaveBeenCalled();

    rerender({ currentQuestion: 1, allAnswers: ['typed answer'] });

    expect(setActivityCache).toHaveBeenCalledTimes(1);
    expect(setActivityCache).toHaveBeenCalledWith(RC5ActivityTypeEnum.quiz, {
      currentQuestion: 1,
      answers: ['typed answer'],
      quizId: 'quiz-id',
      slideNumber: 3,
    });

    act(() => jest.advanceTimersByTime(5000));
    expect(setActivityCache).toHaveBeenCalledTimes(1);
  });

  it('saves only the latest combined state on unmount', () => {
    const setActivityCache = jest.fn();
    const readyToPersist = { current: true };
    const { rerender, unmount } = renderHook(
      ({ currentQuestion, allAnswers }: HookProps) =>
        usePersistQuizProgress({
          readyToPersist,
          setActivityCache,
          currentQuestion,
          allAnswers,
          quizId: 'quiz-id',
          activeTab: 3,
        }),
      { initialProps: { currentQuestion: 0, allAnswers: ['old'] } },
    );
    setActivityCache.mockClear();

    rerender({ currentQuestion: 1, allAnswers: ['new'] });
    setActivityCache.mockClear();
    unmount();

    expect(setActivityCache).toHaveBeenCalledTimes(1);
    expect(setActivityCache).toHaveBeenCalledWith(RC5ActivityTypeEnum.quiz, {
      currentQuestion: 1,
      answers: ['new'],
      quizId: 'quiz-id',
      slideNumber: 3,
    });
  });

  it('does not persist before hydration is complete', () => {
    const setActivityCache = jest.fn();
    const readyToPersist = { current: false };
    const { unmount } = renderHook(() =>
      usePersistQuizProgress({
        readyToPersist,
        setActivityCache,
        currentQuestion: 0,
        allAnswers: ['answer'],
        quizId: 'quiz-id',
        activeTab: 3,
      }),
    );

    act(() => jest.advanceTimersByTime(5000));
    unmount();
    expect(setActivityCache).not.toHaveBeenCalled();
  });
});
