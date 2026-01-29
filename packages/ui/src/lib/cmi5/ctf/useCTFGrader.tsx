import { useDispatch } from 'react-redux';
import { debugLogError } from '../../utility/logger';
import { setCurrentCTFGrade as setCurrentGrade } from './ctfReducer';
import { useState } from 'react';
import { AnswerType, CTFContent, CTFResponse } from '@rapid-cmi5/cmi5-build-common';

export default function useCTFGrader(ctfContent: CTFContent) {
  const [accuracy, setAccuracy] = useState(0);
  const [numAttempted, setNumAttempted] = useState(0);
  const [numCorrect, setNumCorrect] = useState(0);

  const dispatch = useDispatch();

  /**
   * Grade Answer
   * @param {AnswerType} answerInput
   * @param {number} questionIndex
   */
  const gradeAnswer = (answerInput: AnswerType, questionIndex: number) => {
    if (ctfContent.questions[questionIndex].type === CTFResponse.FreeResponse) {
      if (
        answerInput ===
        ctfContent.questions[questionIndex].typeAttributes.correctAnswer
      ) {
        dispatch(setCurrentGrade(1));
      } else {
        dispatch(setCurrentGrade(0));
      }
    } else {
      debugLogError('unexpected question type');
    }
  };

  const resetGrader = () => {
    setAccuracy(0);
    setNumAttempted(0);
    setNumCorrect(0);
  };

  return {
    accuracy,
    numAttempted,
    numCorrect,
    gradeAnswer,
    resetGrader,
    setAccuracy,
    setNumAttempted,
    setNumCorrect,
  };
}
