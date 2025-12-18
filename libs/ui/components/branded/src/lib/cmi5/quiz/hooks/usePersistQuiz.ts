import { useEffect } from 'react';
import { debounce } from 'lodash';
import {
  AnswerType,
  QuizState,
  RC5ActivityTypeEnum,
  SetActivityCacheHandler,
} from '@rapid-cmi5/types/cmi5';

/* 
  This component chooses when to write to the cache.
  We will have a debounce save feature as we update answers, this allows us
  to save free response questions which are longer. 
  If a user is typing and then hits refresh, his answer will be save in a 5 second window.
  We will also save when the component unmounts.
  Another thing which is persisted is the current question, we will keep track of this 
  seperate from answered questions. This is due to how state is saved in the LRS.
*/
export function usePersistQuizProgress({
  readyToPersist,
  setActivityCache,
  currentQuestion,
  allAnswers,
  quizId,
  activeTab,
}: {
  readyToPersist: React.MutableRefObject<boolean>;
  setActivityCache: SetActivityCacheHandler | null | undefined;
  currentQuestion: number;
  allAnswers: AnswerType[];
  quizId: string;
  activeTab?: number;
}) {
  // Debounced autosave, every 5 seconds
  useEffect(() => {
    if (!setActivityCache || !readyToPersist.current || activeTab === undefined)
      return;

    const debounced = debounce(() => {
      setActivityCache(RC5ActivityTypeEnum.quiz, {
        answers: allAnswers,
        quizId,
        slideNumber: activeTab,
      } as QuizState);
    }, 5000);

    debounced();
    return () => debounced.cancel?.();
  }, [allAnswers]);

  // Update currentQuestion
  // Broken up from updating both current question index and answers for performance reasons.
  useEffect(() => {
    if (!setActivityCache || !readyToPersist.current || activeTab === undefined)
      return;

    setActivityCache(RC5ActivityTypeEnum.quiz, {
      currentQuestion,
      quizId,
      slideNumber: activeTab,
    } as QuizState);
  }, [currentQuestion]);

  // Unmount save, (Save when navigating to a new slide)
  useEffect(() => {
    return () => {
      if (
        !setActivityCache ||
        !readyToPersist.current ||
        activeTab === undefined
      )
        return;

      setActivityCache(RC5ActivityTypeEnum.quiz, {
        currentQuestion,
        answers: allAnswers,
        quizId,
        slideNumber: activeTab,
      } as QuizState);
    };
  }, [readyToPersist.current, allAnswers, currentQuestion]);
}
