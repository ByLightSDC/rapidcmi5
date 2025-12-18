import { QuizOption, QuizQuestion } from '@rapid-cmi5/types/cmi5';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { Typography } from '@mui/material';

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
  const options = question.typeAttributes?.options || [];

  if (options === undefined) {
    return <h1>Error</h1>;
  }

  const theCorrectAnswer =
    correctAnswer || options.find((opt: QuizOption) => opt.correct)?.text;

  return (
    <div>
      {options.map((option: QuizOption, index: number) => {
        return (
          <label key={index} style={{ color: 'white' }}>
            {isGraded && index === currentAnswer && (
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
              onClick={() => handlePickAnswer(index)}
              type="radio"
              name={`question-${currentQuestion}`}
              value={option.text}
            />

            <div
              className={`p-1 px-6 my-4 rounded-xl hover:bg-blue-600 
          cursor-pointer
          ${currentAnswer === index ? 'bg-blue-500' : 'bg-blue-900'}`}
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
