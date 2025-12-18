import { Paper, Typography, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import { AnswerType, QuizContent } from '@rapid-cmi5/types/cmi5';
import { OverflowTypography } from '../../data-display/OverflowTypography';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type QuestionNavProps = {
  unansweredQuestions: number[] | null;
  content: QuizContent;
  setShowQuestionNav: (show: boolean) => void;
  goToQuestion: (question: number) => void;
  currentQuestion: number;
};
export default function QuestionNav({
  content,
  unansweredQuestions,
  setShowQuestionNav,
  goToQuestion,
  currentQuestion,
}: QuestionNavProps) {

  // questions answered title
  const getTitle = () => {
    if (!unansweredQuestions) {
      return 'All Questions Answered...';
    }
    if (unansweredQuestions && unansweredQuestions.length === 1) {
      return '1 Question Unanswered...';
    }
    return `${unansweredQuestions.length} Questions Unanswered...`;
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {content.questions.length > 0 && (
        <Paper style={{ padding: '12px', borderRadius: '12px' }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', paddingLeft: '8px' }}
          >
            <Typography
              variant="h5"
              sx={{ padding: '12px', paddingBottom: '0px' }}
            >
              {getTitle()}
            </Typography>

            {!unansweredQuestions ||
              (unansweredQuestions.length === 0 && (
                <Typography>Edit Your Answers or Click Submit</Typography>
              ))}

            <div style={{ flexGrow: 1 }} />
            <IconButton
              aria-label="Close Navigation"
              color="primary"
              onClick={() => setShowQuestionNav(false)}
              sx={{ position: 'sticky', color: 'white' }}
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

          <ul
            className="divide-y divide-gray-600"
            style={{ width: '96%' }} //wonky
          >
            {content.questions.map((question, index) => (
              <li key={index} className="flex items-center px-6">
                <div
                  className="flex items-center justify-between w-full"
                  onClick={() => goToQuestion(index + 1)}
                >
                  <div
                    className="flex items-center space-x-3"
                    style={{
                      width: '90%',
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
                          marginRight: '-12px',
                        }}
                      />
                    )}
                    {unansweredQuestions &&
                    unansweredQuestions.includes(index + 1) ? (
                      <WarningAmberIcon color="warning" />
                    ) : (
                      <DoneIcon color="disabled" />
                    )}

                    <Typography
                      sx={{ minWidth: '48px' }}
                    >{`Q${index + 1}`}</Typography>
                    <OverflowTypography
                      title={`${question.question}`}
                      sxProps={{ width: '88%' }}
                    />
                  </div>
                  <IconButton aria-label="find unanswered" color="primary">
                    <Tooltip
                      arrow
                      enterDelay={200}
                      enterNextDelay={500}
                      title="Edit Question"
                      placement="bottom"
                    >
                      <EditIcon color="primary" />
                    </Tooltip>
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </>
  );
}
