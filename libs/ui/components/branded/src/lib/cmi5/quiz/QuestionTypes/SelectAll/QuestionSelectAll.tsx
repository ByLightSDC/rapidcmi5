import { QuizOption, QuizQuestion } from '@rangeos-nx/types/cmi5';
import { Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';

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
  const options = question.typeAttributes?.options || [];
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
                  currentAnswers.includes(index) ? (
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
              onClick={() => handlePickAnswer(index)}
              name={`question-${currentQuestion}`}
              value={option.text}
            />

            <div
              className={`p-1 px-6 my-4 rounded-xl hover:bg-blue-600 
          cursor-pointer
          ${
            Array.isArray(currentAnswers) && currentAnswers.includes(index)
              ? 'bg-blue-500'
              : 'bg-blue-900'
          }
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
          {isCorrect
            ? 'Your Answer is Correct'
            : `The Correct Answer is All of the Above`}
        </Typography>
      )}
    </div>
  );
}

export default SelectAll;
