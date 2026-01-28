import React from 'react';
import { Paper, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import { Stack } from '@mui/system';
import { OverflowTypography } from '../../data-display/OverflowTypography';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import EditIcon from '@mui/icons-material/Edit';
import { QuizContent } from '@rapid-cmi5/cmi5-build-common';

export type QuizReviewProps = {
  content: QuizContent;
  setShowQuestionNav: (show: boolean) => void;
  currentQuestion: number;
  goToQuestion: (question: number) => void;
  getGrade: (index: number) => boolean;
};

/* 
  This exists to allow users to review quiz questions once they have
  successfully submitted a quiz.
  They are able to go back to specific questions and look at what they answered
  compared to the correct answer.
*/
export default function QuizReview({
  content,
  setShowQuestionNav,
  goToQuestion,
  currentQuestion,
  getGrade,
}: QuizReviewProps) {
  return (
    <Paper style={{ padding: '12px', borderRadius: '12px' }}>
      {content.questions.length > 0 && (
        <>
          {/* header row */}
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography variant="h4" sx={{ padding: '8px' }}>
              Review Answers
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <IconButton
              aria-label="Close Question Nav"
              color="inherit"
              onClick={() => setShowQuestionNav(false)}
              sx={{ position: 'sticky', color: 'primary' }}
            >
              <Tooltip
                arrow
                enterDelay={200}
                enterNextDelay={500}
                title="Close"
                placement="bottom"
              >
                <CloseIcon color="inherit" />
              </Tooltip>
            </IconButton>
          </Stack>

          <ul style={{ width: '100%' }}>
            {content.questions.map((question, index) => (
              <React.Fragment key={index}>
                <li
                  key={index}
                  className="flex"
                  style={{
                    width: '100%',
                  }}
                >
                  {/* div X qId Question Edit */}
                  <Stack
                    direction="row"
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* div X qId Question*/}
                    <Stack
                      direction="row"
                      onClick={() => goToQuestion(index + 1)}
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',

                        width: '95%', //DO NOT CHANGE 95% takes padding into account
                      }}
                    >
                      {currentQuestion === index && (
                        <DoubleArrowIcon
                          color="primary"
                          sx={{
                            position: 'sticky',
                            margin: 0,
                            padding: 0,
                            marginLeft: '-24px',
                          }}
                        />
                      )}
                      {getGrade(index) ? (
                        <DoneIcon color="success" />
                      ) : (
                        <CloseIcon color="error" />
                      )}
                      <Typography
                        sx={{ minWidth: '48px' }}
                      >{`Q${index + 1}`}</Typography>
                      <OverflowTypography
                        color="inherit"
                        title={`${question.question}`}
                        sxProps={{ width: '88%' }} //DO NOT CHANGE 88% takes padding into account
                      />
                    </Stack>
                    <IconButton
                      aria-label="View Question"
                      color="primary"
                      onClick={() => goToQuestion(index + 1)}
                    >
                      <Tooltip
                        arrow
                        enterDelay={200}
                        enterNextDelay={500}
                        title="View Question"
                        placement="bottom"
                      >
                        <EditIcon color="inherit" />
                      </Tooltip>
                    </IconButton>
                  </Stack>
                </li>
                <Divider sx={{ padding: 0, marginBottom: '12px' }} />
              </React.Fragment>
            ))}
          </ul>
        </>
      )}
    </Paper>
  );
}
