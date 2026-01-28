import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';

import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { QuizQuestion } from '@rapid-cmi5/cmi5-build-common';
import { SelectorMainUi } from 'packages/ui/src/lib/inputs/selectors/selectors';


function Matching({
  question,
  handlePickAnswer,
  currentQuestion,
  currentAnswers,
  isCorrect,
  isGraded,
}: {
  question: QuizQuestion;
  handlePickAnswer: (answers: string[]) => void;
  currentQuestion: number;
  currentAnswers: string[];
  isCorrect: boolean;
  isGraded: boolean;
}) {
  const pairs = question.typeAttributes?.matching || [];
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    new Array(pairs.length).fill(''),
  );

  /**
   * UE to initially shuffle the choices and set the correct answers to display on review
   */

  useEffect(() => {
    const shuffled = [...pairs.map((p) => p.response)].sort(
      () => Math.random() - 0.5,
    );
    setAnswers(shuffled);
  }, [currentQuestion, pairs]);

  /**
   * UE to handle resetting selected answers
   */
  useEffect(() => {
    if (!isGraded && currentAnswers === null) {
      setSelectedAnswers(new Array(pairs.length).fill(''));
    } else if (currentAnswers) {
      setSelectedAnswers(currentAnswers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGraded, currentAnswers]);

  /**
   * Handle dropdown selection
   * @param {number} index item number
   * @param {string} response answer selected
   */
  const handleSelectChange = (index: number, response: string) => {
    const updatedAnswers = { ...selectedAnswers };
    updatedAnswers[index] = response;
    handlePickAnswer(updatedAnswers);
  };

  return (
    <>
      <Grid container spacing={2} sx={{ width: '100%' }}>
        {pairs.map((p, index) => (
          <React.Fragment key={index}>
            <Grid size={6} key={p.option}>
              <>
                {isGraded && (
                  <div
                    style={{
                      position: 'sticky',
                      width: '0px',
                      height: '0px',
                    }}
                  >
                    <div style={{ position: 'absolute', right: 0 }}>
                      {currentAnswers[index] === p.response ? (
                        <DoneIcon color="success" />
                      ) : (
                        <CloseIcon color="error" />
                      )}
                    </div>
                  </div>
                )}

                <Typography sx={{ whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>
                  {p.option}
                </Typography>
              </>
            </Grid>
            <Grid size={6}>
              <SelectorMainUi
                allowItemWrapping={true}
                disabled={isGraded}
                label="Select Correct Match"
                defaultValue={selectedAnswers[index] || ''}
                options={answers}
                onSelect={(newValue: string) => {
                  handleSelectChange(index, newValue);
                }}
              />
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {isGraded && (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {isCorrect ? (
            <Typography
              align="center"
              sx={{ width: '100%' }}
              variant="body2"
              color="palette.grey.50"
            >
              Your Answer is Correct
            </Typography>
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
              {pairs.map((p) => (
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
                  • <strong>{`${p.option}`}</strong>: {`${p.response}`}
                </Typography>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}

export default Matching;
