import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import type {
  AnswerType,
  QuizState,
  SetActivityCacheHandler,
} from '@rapid-cmi5/cmi5-build-common';
import type { MutableRefObject } from 'react';

type UsePersistQuizOptions = {
  readyToPersist: MutableRefObject<boolean>;
  setActivityCache?: SetActivityCacheHandler | null;
  currentQuestion: number;
  allAnswers: AnswerType[];
  quizId: string;
  activeTab?: number;
};

type PersistSnapshot = Omit<UsePersistQuizOptions, 'readyToPersist'>;

function quizState(
  quizId: string,
  slideNumber: number,
  progress: Pick<QuizState, 'answers' | 'currentQuestion'>,
): QuizState {
  return { quizId, slideNumber, ...progress };
}

export function usePersistQuizProgress({
  readyToPersist,
  setActivityCache,
  currentQuestion,
  allAnswers,
  quizId,
  activeTab,
}: UsePersistQuizOptions): void {
  const pendingAnswerSave = useRef<ReturnType<typeof debounce> | null>(null);
  const latest = useRef<PersistSnapshot>({
    setActivityCache,
    currentQuestion,
    allAnswers,
    quizId,
    activeTab,
  });
  latest.current = {
    setActivityCache,
    currentQuestion,
    allAnswers,
    quizId,
    activeTab,
  };

  useEffect(() => {
    if (
      !setActivityCache ||
      !readyToPersist.current ||
      activeTab === undefined
    ) {
      return;
    }

    const saveAnswers = debounce(() => {
      setActivityCache(
        RC5ActivityTypeEnum.quiz,
        quizState(quizId, activeTab, { answers: allAnswers }),
      );
    }, 5000);

    pendingAnswerSave.current = saveAnswers;
    saveAnswers();
    return () => {
      saveAnswers.cancel();
      if (pendingAnswerSave.current === saveAnswers) {
        pendingAnswerSave.current = null;
      }
    };
  }, [activeTab, allAnswers, quizId, readyToPersist, setActivityCache]);

  useEffect(() => {
    if (
      !setActivityCache ||
      !readyToPersist.current ||
      activeTab === undefined
    ) {
      return;
    }

    // Moving between questions is an explicit save point. Cancel any pending
    // answer-only write and persist the complete latest state immediately.
    pendingAnswerSave.current?.cancel();
    pendingAnswerSave.current = null;
    setActivityCache(
      RC5ActivityTypeEnum.quiz,
      quizState(quizId, activeTab, {
        currentQuestion,
        answers: latest.current.allAnswers,
      }),
    );
  }, [activeTab, currentQuestion, quizId, readyToPersist, setActivityCache]);

  useEffect(
    () => () => {
      const snapshot = latest.current;
      if (
        !snapshot.setActivityCache ||
        !readyToPersist.current ||
        snapshot.activeTab === undefined
      ) {
        return;
      }

      snapshot.setActivityCache(
        RC5ActivityTypeEnum.quiz,
        quizState(snapshot.quizId, snapshot.activeTab, {
          currentQuestion: snapshot.currentQuestion,
          answers: snapshot.allAnswers,
        }),
      );
    },
    [readyToPersist],
  );
}
