import { useEffect } from 'react';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import type {
  AnswerType,
  GetActivityCacheHandler,
  QuizState,
} from '@rapid-cmi5/cmi5-build-common';
import type { MutableRefObject } from 'react';
import { debugLogError } from '../../../utility/logger';

type UseHydrateQuizOptions = {
  readyToHydrate: boolean;
  getActivityCache?: GetActivityCacheHandler | null;
  quizId: string;
  activeTab?: number;
  setAllAnswers: (answers: AnswerType[]) => void;
  setCurrentQuestion: (question: number) => void;
  readyToPersist: MutableRefObject<boolean>;
  setIsLoading: (loading: boolean) => void;
  allAnswers: AnswerType[];
};

function isValidProgress(
  progress: QuizState | null,
  answerCount: number,
): progress is Required<Pick<QuizState, 'currentQuestion' | 'answers'>> &
  QuizState {
  if (!progress || !Array.isArray(progress.answers)) return false;

  const currentQuestion = progress.currentQuestion;
  const currentQuestionIsValid =
    Number.isInteger(currentQuestion) &&
    currentQuestion !== undefined &&
    currentQuestion >= 0 &&
    (answerCount === 0 ? currentQuestion === 0 : currentQuestion < answerCount);

  return progress.answers.length === answerCount && currentQuestionIsValid;
}

export function useHydrateQuiz({
  readyToHydrate,
  getActivityCache,
  quizId,
  activeTab,
  setAllAnswers,
  setCurrentQuestion,
  readyToPersist,
  setIsLoading,
  allAnswers,
}: UseHydrateQuizOptions): void {
  useEffect(() => {
    if (!getActivityCache) {
      readyToPersist.current = true;
      setIsLoading(false);
      return;
    }
    if (!readyToHydrate || activeTab === undefined) return;

    let cancelled = false;

    const hydrate = async () => {
      try {
        const progress = (await getActivityCache(RC5ActivityTypeEnum.quiz, {
          quizId,
          slideNumber: activeTab,
        })) as QuizState | null;

        if (!cancelled && isValidProgress(progress, allAnswers.length)) {
          setAllAnswers(progress.answers);
          setCurrentQuestion(progress.currentQuestion);
        }
      } catch (error) {
        if (!cancelled) debugLogError(`Could not get quiz state: ${error}`);
      } finally {
        if (!cancelled) {
          readyToPersist.current = true;
          setIsLoading(false);
        }
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    allAnswers.length,
    getActivityCache,
    quizId,
    readyToHydrate,
    readyToPersist,
    setAllAnswers,
    setCurrentQuestion,
    setIsLoading,
  ]);
}
