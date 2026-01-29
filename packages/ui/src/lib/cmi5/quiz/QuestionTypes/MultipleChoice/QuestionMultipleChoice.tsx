
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { Typography } from '@mui/material';
import { QuizQuestion, QuizOption } from '@rapid-cmi5/cmi5-build-common';
import { useEffect, useState } from 'react';

function QuestionMultipleChoice({
  question,
  handlePickAnswer,
  currentQuestion,
  currentAnswer,
  correctAnswer,
  isCorrect,
  isGraded,
}: {
  question: QuizQuestion;
  handlePickAnswer: (answerIndex: number) => void;
  currentQuestion: number;
  currentAnswer: number;
  correctAnswer: string;
  isCorrect: boolean;
  isGraded: boolean;
}) {
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [displayAnswer, setDisplayAnswer] = useState<number | null>(null);

  /**
   * UE to initially shuffle the choices and set the correct answers to display on review
   */

  useEffect(() => {
    if (!isGraded && question.typeAttributes?.shuffleAnswers === true) {
      const arr = question.typeAttributes?.options
        ? [...question.typeAttributes.options]
        : [];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      let shuffledAnswer = currentAnswer;
      if (
        question.typeAttributes?.options &&
        currentAnswer &&
        currentAnswer !== -1
      ) {
        const currentOption = question.typeAttributes.options[currentAnswer];
        shuffledAnswer = currentOption
          ? arr.findIndex((option) => option.text === currentOption.text)
          : -1;
      }
      setDisplayAnswer(shuffledAnswer);
      setOptions(arr);
    } else {
      setDisplayAnswer(currentAnswer);
      setOptions(question.typeAttributes?.options || []);
    }
  }, [currentQuestion, question.typeAttributes?.options]);

  if (options === undefined) {
    return <h1>Error</h1>;
  }

  const theCorrectAnswer =
    correctAnswer || options.find((opt: QuizOption) => opt.correct)?.text;

  //need to switch back / forth between the shuffled index and the "real" index
  const onAnswerClick = (index: number) => {
    setDisplayAnswer(index);
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

  return (
    <div>
      {options.map((option: QuizOption, index: number) => {
        return (
          <label key={index} style={{ color: 'white' }}>
            {isGraded && index === displayAnswer && (
              <div style={{ position: 'sticky', width: '0px', height: '0px' }}>
                <div style={{ position: 'absolute', right: 0 }}>
                  {option.correct ? (
                    <DoneIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )}
                </div>
              </div>
            )}
            <input
              disabled={isGraded}
              className="hidden"
              onClick={() => onAnswerClick(index)}
              type="radio"
              name={`question-${currentQuestion}`}
              value={option.text}
            />

            <div
              className={`p-1 px-6 my-4 rounded-xl hover:bg-blue-600 
          cursor-pointer
          ${displayAnswer === index ? 'bg-blue-500' : 'bg-blue-900'}`}
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
          {isCorrect
            ? 'Your Answer is Correct'
            : `The Correct Answer is ${theCorrectAnswer}`}
        </Typography>
      )}
    </div>
  );
}

export default QuestionMultipleChoice;
