import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { QuizCompletionEnum, QuizContent } from '@rapid-cmi5/cmi5-build/common';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CircleIcon from '@mui/icons-material/Circle';

export function QuizScore({
  quiz,
  score,
}: {
  quiz: QuizContent;
  score: number;
}) {
  const theScore = score;
  const pieSize = 150;
  const pieSizePx = `${pieSize}`;

  const maybePassingColor =
    quiz.completionRequired === QuizCompletionEnum.Passed &&
    quiz.passingScore &&
    theScore >= quiz.passingScore
      ? 'success'
      : 'warning';

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '150px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: pieSizePx,
            height: pieSizePx,
            position: 'relative',
            margin: '6px',
          }}
        >
          {/* pie background color */}
          <Box
            sx={{
              color: 'background.paper',
            }}
          >
            <CircularProgress
              variant="determinate"
              color="inherit"
              thickness={10}
              size={pieSize}
              value={100}
              className="z-1"
            />
          </Box>
          {/* show passing score in pie fill */}
          {quiz.completionRequired === QuizCompletionEnum.Passed &&
            quiz.passingScore && (
              <Box
                sx={{
                  color: '#3C59A2',
                  width: '100%',
                }}
              >
                <CircularProgress
                  variant="determinate"
                  color="inherit"
                  thickness={10}
                  size={pieSize}
                  value={quiz.passingScore || 0}
                  className="z-2 absolute top-0 left-0"
                />
              </Box>
            )}
          {theScore > 0 && (
            <CircularProgress
              variant="determinate"
              color={
                !quiz.passingScore || theScore >= quiz.passingScore
                  ? 'success'
                  : 'warning'
              }
              thickness={10}
              size={pieSize}
              value={theScore}
              className="z-3 absolute top-0 left-0"
            />
          )}
        </div>
      </div>

      <Stack
        direction="column"
        sx={{ display: 'flex', justifyCOntent: 'flex-start' }}
      >
        {quiz.completionRequired === QuizCompletionEnum.Passed && (
          <Stack
            direction="row"
            sx={{
              padding: '4px',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <CircleIcon
              fontSize="small"
              color="primary"
              sx={{ paddingRight: '4px' }}
            />
            <Typography variant="h4">
              Required Score: {quiz.passingScore}%
            </Typography>
          </Stack>
        )}
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          <CircleIcon
            fontSize="small"
            color={maybePassingColor}
            sx={{ paddingRight: '4px' }}
          />
          <Typography variant="h4">Your Score: {theScore}%</Typography>
          {quiz.completionRequired === QuizCompletionEnum.Passed &&
            quiz.passingScore &&
            theScore >= quiz.passingScore && (
              <>
                <SportsScoreIcon color="success" />

                <Typography color="success" variant="h6">
                  Passed
                </Typography>
              </>
            )}
        </Stack>
      </Stack>
    </>
  );
}

export default QuizScore;
