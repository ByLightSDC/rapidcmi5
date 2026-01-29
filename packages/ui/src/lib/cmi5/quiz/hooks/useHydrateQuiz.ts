import {
  QuizContent,
  AnswerType,
  GetCmi5QuizProgressHandler,
  GetActivityCacheHandler,
  RC5ActivityTypeEnum,
  QuizState,
} from '@rapid-cmi5/cmi5-build-common';
import { useEffect } from 'react';
import { debugLogError } from '../../../utility/logger';

/*
  This hook will allow a quiz to have a local cache of redux data which is very fast that
  is seeded from a remote LRS state. Once the LRS connection is ready, we will call the get method and have 
  the remote state returned to us and fill out the redux state. 
  After the inital call we only need to use the redux state and no longer need to 
  make get requests to the remote state in the LRS.
*/
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
}: {
  readyToHydrate: boolean;
  getActivityCache?: GetActivityCacheHandler | null | undefined;
  quizId: string;
  activeTab?: number;
  setAllAnswers: (a: AnswerType[]) => void;
  setCurrentQuestion: (q: number) => void;
  readyToPersist: React.MutableRefObject<boolean>;
  setIsLoading: (v: boolean) => void;
  allAnswers: AnswerType[];
}) {
  useEffect(() => {
    // Because of legacy setup, should remove this in the future.
    // Legacy build does not get persistance.
    if (!getActivityCache) {
      readyToPersist.current = true;
      setIsLoading(false);
      return;
    }
    if (!readyToHydrate || activeTab === undefined) {
      return;
    }

    const resetQuizFromLrs = async () => {
      try {
        const { currentQuestion, answers } = (await getActivityCache(
          RC5ActivityTypeEnum.quiz,
          {
            quizId,
            slideNumber: activeTab,
          },
        )) as QuizState;

        // If the current number of questions and the returned number of questions do not match
        // abort the operation and startfrom scratch.
        if (
          currentQuestion !== undefined &&
          answers !== undefined &&
          answers.length === allAnswers.length
        ) {
          setAllAnswers(answers);
          setCurrentQuestion(currentQuestion);
        }
      } catch (error) {
        debugLogError(`Could not get from LRS ${error}`);
      }
      readyToPersist.current = true;
      setIsLoading(false);
    };

    resetQuizFromLrs();
  }, [readyToHydrate, activeTab, quizId]);
}
