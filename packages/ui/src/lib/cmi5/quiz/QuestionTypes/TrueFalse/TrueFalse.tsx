import { Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';

function TrueFalse({
  handlePickAnswer,
  currentQuestion,
  currentAnswer,
  correctAnswer,
  isCorrect,
  isGraded,
}: {
  handlePickAnswer: (answer: string) => void;
  currentQuestion: number;
  currentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  isGraded: boolean;
}) {
  return (
    <div>
      <label key="True" style={{ color: 'white' }}>
        {isGraded && 'true' === currentAnswer && (
          <div style={{ position: 'sticky', width: '0px', height: '0px' }}>
            <div style={{ position: 'absolute', right: 0 }}>
              {isCorrect && <DoneIcon color="success" />}
              {!isCorrect && <CloseIcon color="error" />}
            </div>
          </div>
        )}
        <input
          disabled={isGraded}
          className="hidden"
          onClick={() => handlePickAnswer('true')}
          type="radio"
          name={`question-${currentQuestion}`}
          value="True"
        />
        <div
          className={`p-1 px-6 my-4 rounded-xl hover:bg-blue-600 
          cursor-pointer
          ${currentAnswer === 'true' ? 'bg-blue-600' : 'bg-blue-900'}
          `}
        >
          True
        </div>
      </label>

      <label key="False" style={{ color: 'white' }}>
        {isGraded && 'false' === currentAnswer && (
          <div style={{ position: 'sticky', width: '0px', height: '0px' }}>
            {isCorrect && (
              <DoneIcon
                sx={{ position: 'relative', right: '24px', top: '16px' }}
                color="success"
              />
            )}
            {!isCorrect && (
              <CloseIcon
                sx={{ position: 'relative', right: '24px', top: '16px' }}
                color="error"
              />
            )}
          </div>
        )}
        <input
          disabled={isGraded}
          className="hidden"
          onClick={() => handlePickAnswer('false')}
          type="radio"
          name={`question-${currentQuestion}`}
          value="False"
        />
        <div
          className={`p-1 px-6 my-4 rounded-xl hover:bg-blue-600 
      cursor-pointer
      ${currentAnswer === 'false' ? 'bg-blue-600' : 'bg-blue-900'}
      `}
        >
          False
        </div>
      </label>

      {isGraded && (
        <Typography
          align="center"
          sx={{ width: '100%' }}
          variant="body2"
          color="palette.grey.50"
        >
          {isCorrect
            ? 'Your Answer is Correct'
            : `The Correct Answer is ${correctAnswer}`}
        </Typography>
      )}
    </div>
  );
}

export default TrueFalse;
