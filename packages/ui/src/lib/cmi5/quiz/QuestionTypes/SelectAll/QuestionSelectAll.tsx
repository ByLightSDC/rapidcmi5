/* eslint-disable react/jsx-no-useless-fragment */

import { Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { useEffect, useState } from 'react';
import { QuizOption, QuizQuestion } from '@rapid-cmi5/cmi5-build-common';

function SelectAll({
  question,
  handlePickAnswer,
  currentQuestion,
  currentAnswers,
  isCorrect,
  isGraded,
}: {
  question: QuizQuestion;
  handlePickAnswer: (answerIndex: number) => void;
  currentQuestion: number;
  currentAnswers: number[];
  isCorrect: boolean;
  isGraded: boolean;
}) {
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [displayAnswers, setDisplayAnswers] = useState<number[]>([]);

  /**
   * UE to initially shuffle the choices and set the correct answers to display on review
   */

  useEffect(() => {
    if (!isGraded && question.typeAttributes?.shuffleAnswers === true) {
      const questionOptions = question.typeAttributes?.options
        ? question.typeAttributes?.options
        : [];
      const arr = question.typeAttributes?.options
        ? [...question.typeAttributes.options]
        : [];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      const shuffledAnswers: number[] = [];
      if (
        questionOptions.length > 0 &&
        currentAnswers &&
        currentAnswers.length > 0
      ) {
        for (let i = 0; i < currentAnswers.length; i++) {
          const displayIndex = arr.findIndex(
            (option) => option.text === questionOptions[currentAnswers[i]].text,
          );
          if (displayIndex !== -1) {
            shuffledAnswers.push(displayIndex);
          }
        }
      }
      setDisplayAnswers(shuffledAnswers);
      setOptions(arr);
    } else {
      setDisplayAnswers(currentAnswers || []);
      setOptions(question.typeAttributes?.options || []);
    }
  }, [currentQuestion, question.typeAttributes?.options]);

  //need to switch back / forth between the shuffled index and the "real" index
  const onAnswerClick = (index: number) => {
    // toggle display answer
    const updatedAnswers = displayAnswers.includes(index)
      ? displayAnswers.filter((a) => a !== index) // remove
      : [...displayAnswers, index]; // add

    setDisplayAnswers(updatedAnswers);

    if (question.typeAttributes?.shuffleAnswers === true) {
      const answerText = options[index].text;
      const orderedIndex = question.typeAttributes.options // check to keep typscript happy
        ? question.typeAttributes.options.findIndex(
            (option) => option.text === answerText,
          )
        : 0;
      handlePickAnswer(orderedIndex);
    } else {
      handlePickAnswer(index);
    }
  };

  if (options === undefined) {
    return <h1>Error</h1>;
  }

  return (
    <div>
      {options.map((option: QuizOption, index: number) => {
        return (
          <label key={index} style={{ color: 'white' }}>
            {isGraded && (
              <div style={{ position: 'sticky', width: '0px', height: '0px' }}>
                <div style={{ position: 'absolute', right: 0 }}>
                  {Array.isArray(currentAnswers) &&
                    currentAnswers.includes(index) && (
                      <>
                        {option.correct === true ? (
                          <DoneIcon color="success" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                      </>
                    )}
                </div>
              </div>
            )}
            <input
              disabled={isGraded}
              className="hidden"
              onClick={() => onAnswerClick(index)}
              name={`question-${currentQuestion}`}
              value={option.text}
            />

            <div
              className={`p-1 px-6 my-4 rounded-xl hover:bg-blue-600 
          cursor-pointer
          ${displayAnswers.includes(index) ? 'bg-blue-500' : 'bg-blue-900'}
          `}
            >
              {option.text}
            </div>
          </label>
        );
      })}
      {isGraded && (
        <Typography
          align="center"
          sx={{ width: '100%' }}
          variant="body2"
          color="palette.grey.50"
        >
          {isCorrect ? (
            'Your Answer is Correct'
          ) : (
            <>
              <Typography
                align="left"
                sx={{ width: '100%' }}
                variant="body2"
                color="palette.grey.50"
              >
                The Correct Answers are:
              </Typography>
              {options.map((option) => (
                <>
                  {option.correct === true ? (
                    <Typography
                      align="left"
                      sx={{
                        width: '100%',
                        paddingLeft: '20px', // indent
                        textIndent: '-20px', // first line - not indented
                        marginTop: '2px !important',
                        overflowWrap: 'break-word', // handles long words nicely
                      }}
                      variant="body2"
                      color="palette.grey.50"
                    >
                      • {`${option.text}`}
                    </Typography>
                  ) : (
                    <></>
                  )}
                </>
              ))}
            </>
          )}
        </Typography>
      )}
    </div>
  );
}

export default SelectAll;
