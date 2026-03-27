import {
  ActivityScore,
  AnswerType,
  AuContextProps,
  CTFContent,
  CTFQuestion,
  QuizCompletionEnum,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

import Grid from '@mui/material/Grid2';

import { useCallback, useContext, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { debugLog } from '../../utility/logger';
import { useDisplayFocus } from '../../hooks/useDisplayFocus';
import useCTFGrader from './useCTFGrader';

import { Alert, alpha, Paper, Typography, useTheme } from '@mui/material';

/* Icons */
import UploadIcon from '@mui/icons-material/Upload';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import InfoIcon from '@mui/icons-material/Info';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ReportIcon from '@mui/icons-material/Report';

import {
  getCTFGrades as getGrades,
  getCTFSubmitted as getSubmitted,
  setCurrentCTFQuestion as setCurrentQuestion,
  resetCTFActivity as resetActivity,
  setCTFScore as setScore,
  setCurrentCTFAnswer as setCurrentAnswer,
  getAllCTFAnswers as getAllAnswers,
  currentAnswers,
  getCurrentQuestion,
} from './ctfReducer';
import { Box, Stack } from '@mui/material';
import { ButtonInfoField, ButtonMainUi } from '../../utility/buttons';
import { LessonThemeContext } from '../mdx/contexts/LessonThemeContext';
import {
  maxFormWidths,
  useLessonThemeStyles,
} from '../../hooks/useLessonThemeStyles';

import ScoreLabel from './ScoreLabel';
import QuestionInput from './QuestionInput';
import { useSignalEffect } from '@preact/signals-react';
import { isAnswerInputEnabled$, shouldCheckAnswer$ } from './vars';
import { FlagEffect } from './FlagEffect';
import { useToaster } from '../../utility/useToaster';
import { submitScoreMessage } from './constants';

const answerBoxGridSize = 3.8;
const attemptedLabel = '#Attempted';
const accuracyLabel = 'Flags';
const ctfButtonProps = {
  minWidth: 140,
  '&.Mui-disabled': {
    boxShadow: 0,
  },
};

/** Capture the Flag Activity
 * @param param0
 * @returns
 */
export function AuCTF({
  auProps,
  content,
}: {
  auProps: Partial<AuContextProps>;
  content: CTFContent;
}) {
  const { setProgress, submitScore } = auProps;
  const ctfContent = content;
  const dispatch = useDispatch();
  const currentAnswersSel = useSelector(currentAnswers);

  //grader
  const currentGrades = useSelector(getGrades);
  const currentQuestionIndex = useSelector(getCurrentQuestion);
  const allAnswers = useSelector(getAllAnswers);
  const hasSubmitted = useSelector(getSubmitted);

  const {
    accuracy,
    numAttempted,
    numCorrect,
    gradeAnswer,
    resetGrader,
    setAccuracy,
    setNumAttempted,
    setNumCorrect,
  } = useCTFGrader(ctfContent);

  const [isFocused, setIsFocused] = useState(currentQuestionIndex >= 0);
  const [focused, setFocused] = useState<Element | null>(null);
  const focusHelper = useDisplayFocus();
  const [isInputEnabled, setIsInputEnabled] = useState(false);
  const displayToaster = useToaster();

  /* Constants */
  const noneFound = 'No Questions Found';
  const passingScore = ctfContent.passingScore || 80;

  /* Lesson Theme */
  const { lessonTheme } = useContext(LessonThemeContext);
  const { outerActivitySxWithConstrainedWidth } = useLessonThemeStyles(
    lessonTheme,
    maxFormWidths.ctfPlayback,
  );

  const theme = useTheme();
  const { palette } = theme;
  const defaultHighContrastColor =
    theme.palette.mode === 'light' ? 'common.white' : 'common.black';

  /**
   * Selects question if it is available (no grade or bad grade)
   * Correct answers are skipped
   * Returns whether question was available
   */
  const isAvailable = useCallback(
    (questionIndex: number) => {
      debugLog(`check available ${questionIndex}`);
      if (Object.prototype.hasOwnProperty.call(currentGrades, questionIndex)) {
        if (currentGrades[questionIndex] === 0) {
          //bad grade
          debugLog(`found next incorrect question ${questionIndex}`);
          dispatch(setCurrentQuestion(questionIndex));
          setIsFocused(true);
          return true;
        }
      } else {
        //no grade
        debugLog(`found next question ${questionIndex}`);
        dispatch(setCurrentQuestion(questionIndex));
        setIsFocused(true);
        return true;
      }
      return false;
    },
    [currentQuestionIndex, currentGrades, setCurrentQuestion, dispatch],
  );

  /**
   * Starting with next question
   * Checks to determine next unanswered or incorrect question
   * And selects that question
   * @param {number} questionindex Current Question
   */
  const gotoNextAvailable = (questionindex: number) => {
    const startQuestionIndex = questionindex + 1;
    let jumpTo = undefined;

    for (let i = startQuestionIndex; i < ctfContent.questions.length; i++) {
      jumpTo = i;
      if (isAvailable(jumpTo)) {
        return;
      }
    }

    if (startQuestionIndex > 0) {
      for (let i = 0; i < startQuestionIndex; i++) {
        jumpTo = i;
        console.log('jj', jumpTo);
        if (isAvailable(jumpTo)) {
          return;
        }
      }
    }

    debugLog('no available question found');
  };

  /**
   * Starting with previous question
   * Checks to determine previous unanswered or incorrect question
   * And selects that question
   * @param {number} questionindex Current Question
   */
  const gotoPrevAvailable = (questionindex: number) => {
    const startQuestionIndex = questionindex - 1;
    let jumpTo = undefined;
    for (let i = startQuestionIndex; i >= 0; i--) {
      jumpTo = i;
      if (isAvailable(jumpTo)) {
        return;
      }
    }

    if (startQuestionIndex < ctfContent.questions.length - 1) {
      for (let i = ctfContent.questions.length - 1; i >= questionindex; i--) {
        jumpTo = i;
        if (isAvailable(jumpTo)) {
          return;
        }
      }
    }

    debugLog('no available question found');
  };

  const handleNextQuestion = useCallback(() => {
    gotoNextAvailable(currentQuestionIndex);
  }, [currentQuestionIndex]);

  const handlePreviousQuestion = useCallback(() => {
    gotoPrevAvailable(currentQuestionIndex);
  }, [currentQuestionIndex]);

  /**
   * Reset Activity
   */
  const handleReset = useCallback(() => {
    debugLog('[CTF Activity] reset');
    setIsFocused(true);
    focusHelper.focusOnElementById('ctf-answer');
    resetGrader();
    dispatch(resetActivity());
  }, [dispatch, focusHelper, resetGrader, setIsFocused]);

  /**
   * Selection Question
   * @param {number} index
   */
  const handleSelectQuestion = (index: number) => {
    dispatch(setCurrentQuestion(index));
    setIsFocused(true);
  };

  /**
   * Score Answer
   * @param {AnswerType} input
   */
  const handleSubmitAnswer = (input: AnswerType) => {
    debugLog('[CTF] Submit Answer');
    dispatch(setCurrentAnswer(input));
    gradeAnswer(input, currentQuestionIndex);
    setIsFocused(false);
    handleNextQuestion();
  };

  /**
   * Submit Score to LRS
   */
  const submitQuiz = () => {
    dispatch(setScore(accuracy));

    if (setProgress) {
      if (ctfContent.completionRequired === QuizCompletionEnum.Attempted) {
        setProgress(true);
      } else if (ctfContent.completionRequired === QuizCompletionEnum.Passed) {
        if (accuracy >= passingScore) {
          setProgress(true);
        }
      }
    }
    if (submitScore) {
      const scoreData: ActivityScore = {
        activityType: RC5ActivityTypeEnum.ctf,
        activityContent: content,
        scoreData: { allAnswers: allAnswers },
      };

      submitScore(scoreData);
    }

    displayToaster({
      message: submitScoreMessage,
      severity: 'success',
    });
  };

  //#region UE

  useEffect(() => {
    if (ctfContent?.cmi5QuizId) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctfContent?.cmi5QuizId]);

  /**
   * UI triggers focus on input element when question index changes
   * Updates question index ref used in key event handlers
   */
  useEffect(() => {
    focusHelper.focusOnElementById('ctf-answer');
  }, [currentQuestionIndex]);

  /**
   * UE updates accuracy score
   */
  useEffect(() => {
    const correct = Object.values(currentGrades).filter((x) => x === 1);
    const attempted = Object.values(currentGrades).filter(
      (x) => x === 0 || x === 1,
    );
    setNumCorrect(correct.length);
    setNumAttempted(attempted.length);
    if (attempted.length > 0) {
      const decimalAccuracy =
        (correct.length / (ctfContent.questions.length * 1.0)) * 100;

      setAccuracy(Math.round(decimalAccuracy * 10) / 10);
    } else {
      setAccuracy(0);
    }
  }, [currentGrades]);

  /**
   * UE Logs Question Box Focus
   */
  useEffect(() => {
    //console.log('UE isFocused', isFocused);
  }, [isFocused]);

  //#endregion

  const infoTag = (
    <ButtonInfoField
      infoIcon={<InfoIcon fontSize="small" color="info" />}
      alertProps={{
        icon: <InfoIcon fontSize="small" color="inherit" />,
        severity: 'info',
      }}
      message={`A score of ${passingScore}% is required to pass this activity`}
      props={{
        sx: {
          margin: 0,
        },
      }}
    />
  );

  /**
   * Listen for input enabled
   */
  useSignalEffect(() => {
    setIsInputEnabled(isAnswerInputEnabled$.value);
  });

  return (
    ctfContent.questions && (
      <Paper
        id="ctf-activity"
        className="paper-activity"
        variant="outlined"
        sx={{
          ...outerActivitySxWithConstrainedWidth,
        }}
      >
        {ctfContent.title && (
          <Typography
            color="text.primary"
            align="center"
            variant="h3"
            style={{
              fontWeight: 800,
              paddingBottom: '8px',
            }}
          >
            {ctfContent.title}
          </Typography>
        )}
        {ctfContent.questions.length > 0 && (
          <div
            className="w-full prose-xl"
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack
              direction="row"
              spacing={4}
              sx={{
                padding: '8px',
                displat: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flexGrow: 1 }} />
              <ScoreLabel
                label={attemptedLabel}
                value={`${numAttempted}/${ctfContent.questions.length}`}
              />

              <ScoreLabel
                label={accuracyLabel}
                value={`${numCorrect}`}
                startIconDisplay={<OutlinedFlagIcon />}
              />

              <ScoreLabel label="Score" value={`${accuracy}%`}>
                <>
                  {infoTag}
                  {accuracy >= passingScore ? (
                    <>
                      <SportsScoreIcon
                        color="success"
                        sx={{ marginLeft: '8px' }}
                      />
                      <Typography color="success" variant="h6">
                        Pass
                      </Typography>
                    </>
                  ) : numAttempted === ctfContent.questions.length ? (
                    <>
                      <ReportIcon color="error" sx={{ marginLeft: '8px' }} />
                      <Typography color="error" variant="h6">
                        Fail
                      </Typography>
                    </>
                  ) : (
                    <>
                      <HourglassBottomIcon
                        color="info"
                        sx={{ marginLeft: '8px' }}
                      />
                      <Typography
                        color="info"
                        variant="h6"
                        sx={{ lineHeight: 1.1 }}
                      >
                        In Progress
                      </Typography>
                    </>
                  )}
                </>
              </ScoreLabel>

              <div style={{ flexGrow: 1 }} />
            </Stack>
            {/* aria-live region */}
            <div aria-live="polite" className="sr-only">
              Now answering:
              {ctfContent.questions[currentQuestionIndex].question}
            </div>
            <QuestionInput
              display={ctfContent.display}
              answer={currentAnswersSel[currentQuestionIndex] || ''}
              handleNextQuestion={handleNextQuestion}
              handlePreviousQuestion={handlePreviousQuestion}
              handleSubmitAnswer={handleSubmitAnswer}
              numQuestions={ctfContent.questions?.length}
            />

            <Stack
              spacing={2}
              direction="row"
              sx={{
                margin: 1,
                flexGrow: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ButtonMainUi
                sxProps={ctfButtonProps}
                startIcon={<UploadIcon fontSize="small" />}
                disabled={
                  numAttempted !== ctfContent.questions.length || hasSubmitted
                }
                onClick={submitQuiz}
              >
                Submit Score
              </ButtonMainUi>
              <ButtonMainUi
                id="ctf-submit-answer"
                sxProps={{ ...ctfButtonProps, minWidth: 140 }}
                startIcon={null}
                disabled={!isInputEnabled}
                onClick={() => {
                  shouldCheckAnswer$.value = true;
                }}
              >
                Score Answer
              </ButtonMainUi>
              <ButtonMainUi
                id="ctf-reset"
                sxProps={{ ...ctfButtonProps, minWidth: 100 }}
                onClick={handleReset}
                startIcon={<RestartAltIcon />}
              >
                Reset All
              </ButtonMainUi>
            </Stack>
            <Typography
              variant="caption"
              id="keyboard-hint"
              sx={{
                margin: 1,
                display: 'flex',
                justifyContent: 'center',
                flexGrow: 1,
              }}
            >
              Use arrow keys at the start or end of your answer to switch
              questions.
            </Typography>
            <Grid
              container
              rowSpacing={0}
              columnSpacing={0} //this warps buttons
              sx={{ padding: '8px', width: '100%' }}
            >
              {ctfContent.questions.map(
                (option: CTFQuestion, index: number) => {
                  let grade: undefined | 0 | 1 = undefined;

                  if (
                    Object.prototype.hasOwnProperty.call(currentGrades, index)
                  ) {
                    grade = currentGrades[index];
                  }

                  return (
                    <Grid
                      aria-pressed={currentQuestionIndex === index}
                      key={`q${index}`}
                      size={answerBoxGridSize}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        margin: '4px',
                        padding: '8px',

                        borderRadius: 2,
                        background:
                          currentQuestionIndex === index && isFocused
                            ? alpha(palette.primary.main, 0.5)
                            : undefined,
                        backgroundColor:
                          currentQuestionIndex === index && isFocused
                            ? undefined
                            : defaultHighContrastColor,
                        border:
                          currentQuestionIndex === index && isFocused
                            ? `2px solid ${alpha(palette.primary.main, 0.8)}`
                            : `2px solid ${alpha(palette.primary.main, 0.4)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        color:
                          currentQuestionIndex === index && isFocused
                            ? 'common.white'
                            : 'text.primaryContrast',
                        '&:disabled': {
                          backgroundColor: 'pink',
                          background: 'none',
                        },
                        '&:hover': {
                          background: alpha(palette.primary.main, 0.17),
                          borderColor: alpha(palette.primary.main, 0.3),
                          transform: 'translateY(-2px)',
                          boxShadow: alpha(palette.primary.main, 0.3),
                          cursor: 'pointer',
                        },
                      }}
                      onClick={() => handleSelectQuestion(index)}
                    >
                      {option.title && (
                        <div
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <div
                            style={{ display: 'flex', flexDirection: 'row' }}
                          >
                            {ctfContent.display?.shouldNumberQuestions && (
                              <Typography
                                variant="body1"
                                sx={{ padding: '8px', paddingTop: '0px' }}
                              >
                                {`${index + 1}`}
                              </Typography>
                            )}
                            {option.title && (
                              <Typography
                                variant="body1"
                                sx={{ padding: '8px', paddingTop: '0px' }}
                              >
                                {option.title}
                              </Typography>
                            )}
                            {grade === 0 && <FlagEffect isSuccess={false} />}
                            {grade === 1 && <FlagEffect />}
                          </div>
                          <Typography
                            variant="h6"
                            sx={{
                              lineHeight: 1.3,
                            }}
                          >
                            {option.question}
                          </Typography>
                        </div>
                      )}
                      {!option.title && (
                        <>
                          {ctfContent.display?.shouldNumberQuestions && (
                            <Typography
                              variant="body1"
                              sx={{ padding: '8px', paddingTop: '0px' }}
                            >
                              {`${index + 1}`}
                            </Typography>
                          )}

                          <Typography
                            variant="h6"
                            sx={{
                              lineHeight: 1.3,
                            }}
                          >
                            {option.question}
                          </Typography>
                          {grade === 0 && <FlagEffect isSuccess={false} />}
                          {grade === 1 && <FlagEffect />}
                        </>
                      )}
                    </Grid>
                  );
                },
              )}
            </Grid>
          </div>
        )}
        {ctfContent.questions.length === 0 && (
          <Box sx={{ margin: '12px' }}>
            <Alert severity="info" sx={{ padding: '12px', maxWidth: '480px' }}>
              {noneFound}
            </Alert>
          </Box>
        )}
      </Paper>
    )
  );
}

export default AuCTF;
