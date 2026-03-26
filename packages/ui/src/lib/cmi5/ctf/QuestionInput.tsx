import { AnswerType, CTFDisplay } from '@rapid-cmi5/cmi5-build-common';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { TextField } from '@mui/material';

/* Icons */
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import {
  currentAnswers,
  getCurrentQuestion,
  getCTFGrades as getGrades,
} from './ctfReducer';

import { Stack } from '@mui/material';
import { ButtonIcon } from '../../utility/buttons';
import { useSignalEffect } from '@preact/signals-react';
import { isAnswerInputEnabled$, shouldCheckAnswer$ } from './vars';

/**
 * QuestionInput
 * @param param0
 * @returns
 */
export function QuestionInput({
  answer = '',
  display,
  handleNextQuestion,
  handlePreviousQuestion,
  handleSubmitAnswer,
  numQuestions = -1,
}: {
  answer?: AnswerType;
  handleNextQuestion: () => void;
  handlePreviousQuestion: () => void;
  handleSubmitAnswer: (input: AnswerType) => void;
  display?: CTFDisplay;
  numQuestions: number;
}) {
  const [theAnswer, setTheAnswer] = useState<AnswerType>(answer);
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const currentGrades = useSelector(getGrades);
  const questionIndex = useSelector(getCurrentQuestion);
  const currentAnswersSel = useSelector(currentAnswers);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Set answer text
   */
  const updateAnswer = useCallback(() => {
    if (
      Object.prototype.hasOwnProperty.call(currentAnswersSel, questionIndex)
    ) {
      setTheAnswer(currentAnswersSel[questionIndex]);
    } else {
      setTheAnswer('');
    }
  }, [currentAnswersSel, questionIndex]);

  /**
   * Update grades
   */
  const updateGrades = useCallback(() => {
    let grade: undefined | 0 | 1 = undefined;
    if (Object.prototype.hasOwnProperty.call(currentGrades, questionIndex)) {
      grade = currentGrades[questionIndex];
      setIsInputEnabled(grade !== 1); //dont let them write over correct
      isAnswerInputEnabled$.value = grade !== 1;
    } else {
      setIsInputEnabled(true);
      isAnswerInputEnabled$.value = true;
    }
  }, [currentGrades, questionIndex]);

  /**
   * UE update grade
   */
  useEffect(() => {
    updateGrades();
  }, [questionIndex, currentGrades]);

  /**
   * Update answer text
   * and select it
   */
  useEffect(() => {
    updateAnswer();

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 100);
  }, [questionIndex]);

  /**
   * Listen for check answer/enter button clicked
   */
  useSignalEffect(() => {
    if (shouldCheckAnswer$.value) {
      handleSubmitAnswer(theAnswer);
      shouldCheckAnswer$.value = false;
    }
  });

  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ButtonIcon
        id="previous-question"
        name="previous-question"
        tooltip="Previous Question"
        props={{
          disabled: questionIndex <= 0,
          onClick: handlePreviousQuestion,
        }}
      >
        <ArrowBackIosIcon />
      </ButtonIcon>

      <TextField
        aria-describedby="keyboard-hint"
        inputRef={inputRef}
        sx={{ position: 'relative', maxWidth: '480px', marginRight: '8px' }}
        fullWidth={true}
        id="ctf-answer"
        name=""
        margin="dense"
        variant="outlined"
        label={
          display?.shouldNumberQuestions
            ? `Answer #${questionIndex + 1} `
            : 'Answer'
        }
        rows={2}
        multiline={true}
        placeholder="Type Here"
        value={theAnswer}
        size="small"
        disabled={!isInputEnabled}
        slotProps={{
          inputLabel: { shrink: true }, // always put label above box even if empty
          input: {
            readOnly: !isInputEnabled,
          },
        }}
        onChange={(event) => {
          setTheAnswer(event.target.value);
        }}
        onFocus={(event) => {
          if (inputRef.current && theAnswer) {
            inputRef.current.select();
          }
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          // handle key down when answer input is focused
          // user can press enter key to submit answer
          // if cursor is collapsed, user can navigate with arrow keys
          const input = document.activeElement as HTMLTextAreaElement;
          const { selectionStart, selectionEnd, value } = input;

          if (event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            handleSubmitAnswer(theAnswer);
          } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            if (
              questionIndex === numQuestions - 1 ||
              selectionStart !== selectionEnd
            ) {
              console.log('return', questionIndex);
              return;
            }
            if (selectionStart === 0 || selectionStart === value.length) {
              event.preventDefault();
              event.stopPropagation();
              handleNextQuestion();
            }
          } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
            if (questionIndex === 0 || selectionStart !== selectionEnd) {
              console.log('return', questionIndex);
              return;
            }
            if (selectionStart === 0 || selectionStart === value.length) {
              event.preventDefault();
              event.stopPropagation();
              handlePreviousQuestion();
            }
          }
        }}
      />
      <ButtonIcon
        id="next-question"
        name="next-question"
        tooltip="Next Question"
        props={{
          disabled: questionIndex === numQuestions - 1,
          onClick: handleNextQuestion,
        }}
      >
        <ArrowForwardIosIcon />
      </ButtonIcon>
    </Stack>
  );
}
export default QuestionInput;
