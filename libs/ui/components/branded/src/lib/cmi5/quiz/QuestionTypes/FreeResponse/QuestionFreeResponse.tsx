import { useEffect, useState } from 'react';
import { QuizQuestion } from '@rangeos-nx/types/cmi5';
import { Stack, TextField, Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';

function FreeResponse({
  question,
  handlePickAnswer,
  currentQuestion,
  currentAnswer,
  correctAnswer,
  isCorrect,
  isGraded,
}: {
  question: QuizQuestion;
  handlePickAnswer: (answer: string) => void;
  currentQuestion: number;
  currentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  isGraded: boolean;
}) {
  const [userInput, setUserInput] = useState<string | number>(
    currentAnswer || '',
  );

  useEffect(() => {
    setUserInput(currentAnswer || '');
  }, [currentQuestion, currentAnswer]); // Update userInput when currentQuestion or currentAnswer changes

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const currentText = event.target.value;
    setUserInput(currentText);
    handlePickAnswer(currentText);
  }
  return (
    <div>
      <Stack direction="row">
        {isGraded && (
          <div style={{ position: 'relative' }}>
            {isCorrect && (
              <DoneIcon
                sx={{ position: 'absolute', right: '0px', top: '8px' }}
                color="success"
              />
            )}
            {!isCorrect && (
              <CloseIcon
                sx={{ position: 'absolute', right: '-6px', top: '24px' }}
                color="error"
              />
            )}
          </div>
        )}

        {/*REF <input
          disabled={isGraded}
          autoComplete="off"
          type="text"
          placeholder="Your Answer..."
          value={userInput}
          name={`question-${currentQuestion}`}
          onChange={handleChange}
          className={
            isGraded
              ? 'w-full p-2 border border-gray-900 rounded-lg text-grey'
              : 'w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }
        /> */}
        <TextField
          className={
            isGraded
              ? 'w-full p-2 border border-gray-900 rounded-lg text-grey'
              : 'w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }
          InputLabelProps={{ shrink: true }} // always put label above box even if empty
          autoComplete="off"
          type="text"
          fullWidth={true}
          margin="dense"
          variant="outlined"
          rows={2}
          multiline={true}
          name={`question-${currentQuestion}`}
          placeholder="Your Answer..."
          value={userInput}
          size="small"
          disabled={isGraded}
          onChange={handleChange}
          autoFocus
        />
      </Stack>

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

export default FreeResponse;
