import { useRef, useState } from 'react';
import {
  getAutoGradersProgress,
  getQuizProgress,
  setAutoGradersProgress,
  setQuizProgress,
} from 'apps/cc-cmi5-player/src/app/utils/Cmi5Helpers';
import { QuizState } from '@rapid-cmi5/cmi5-build-common';
import { debugLogError } from '../debug';
import { useDispatch } from 'react-redux';
import { RootState, store } from '../redux/store';
import {
  addAutoGraderUUID,
  setAllAutoGraderUUIDs,
  setEntireQuizState,
  setQuizAnswers,
  setQuizCurrentQuestion,
} from '../redux/activitySessionReducer';

/**
 * Allows the caching of activity related information
 * A frontend layer for caching current state and a network layer for hydrating inital values
 */

export const useActivitySession = () => {
  const dispatch = useDispatch();

  // This allows us to retrieve quiz state from either redux or through
  // network call if not yet cached
  const handleGetQuizProgress = async (quizState: QuizState) => {
    const quizKey = `${quizState.slideNumber}/${quizState.quizId}`;

    const currentState = store.getState() as RootState;
    const cachedResult = currentState.activitySession.quizCache[quizKey];

    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await getQuizProgress(quizState);
      dispatch(setEntireQuizState({ key: quizKey, value: response }));
      return response;
    } catch (e) {
      debugLogError(`Could not get quiz content: ${e}`);
      return quizState;
    }
  };

  const handleSetQuizProgress = async (quizState: QuizState) => {
    const quizKey = `${quizState.slideNumber}/${quizState.quizId}`;

    // update redux first
    if (quizState.answers) {
      dispatch(setQuizAnswers({ key: quizKey, answers: quizState.answers }));
    }
    if (quizState.currentQuestion !== undefined) {
      dispatch(
        setQuizCurrentQuestion({
          key: quizKey,
          currentQuestion: quizState.currentQuestion,
        }),
      );
    }
    // update the LRS
    try {
      await setQuizProgress(quizState);
    } catch (e) {
      debugLogError(`Could not set quiz content: ${e}`);
    }
  };

  // This allows us to retrieve quiz state from either redux or through
  // network call if not yet cached
  const handleGetAutoGraderProgress = async () => {
    const currentState = store.getState() as RootState;
    const cachedResult = currentState.activitySession.autoGraderCache;

    if (cachedResult) {
      return new Set(cachedResult);
    }

    try {
      const response = await getAutoGradersProgress();
      dispatch(setAllAutoGraderUUIDs([...response]));
      return response;
    } catch (e) {
      debugLogError(`Could not get autograder progress: ${e}`);
      return new Set<string>();
    }
  };

  const handleSetSetAuoGraderProgress = async (uuid: string) => {
    // update redux first
    dispatch(addAutoGraderUUID(uuid));

    // update the LRS, wont await so there will be no error here, but just in case
    try {
      setAutoGradersProgress(uuid);
    } catch (e) {
      debugLogError(`Could not set autograder progress: ${e}`);
    }
  };

  return {
    handleGetQuizProgress,
    handleSetQuizProgress,
    handleGetAutoGraderProgress,
    handleSetSetAuoGraderProgress,
  };
};
