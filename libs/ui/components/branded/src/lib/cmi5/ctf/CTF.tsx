import {
  ActivityScore,
  AnswerType,
  AuContextProps,
  CTFContent,
  CTFDisplay,
  CTFQuestion,
  QuizCompletionEnum,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/types/cmi5';
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debugLog } from '../../utility/logger';
import { useDisplayFocus } from '../../hooks/useDisplayFocus';
import useCTFGrader from './useCTFGrader';
import {
  Alert,
  Grid,
  Grid2,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

/* Icons */
import InfoIcon from '@mui/icons-material/Info';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import ErrorIcon from '@mui/icons-material/Error';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ReportIcon from '@mui/icons-material/Report';
import {
  getCurrentCTFAnswer as getCurrentAnswer,
  getCTFGrades as getGrades,
  getCTFSubmitted as getSubmitted,
  getCurrentCTFQuestion as getCurrentQuestion,
  setCurrentCTFQuestion as setCurrentQuestion,
  resetCTFActivity as resetActivity,
  setCTFScore as setScore,
  setCurrentCTFAnswer as setCurrentAnswer,
  getAllCTFAnswers as getAllAnswers,

} from './ctfReducer';
import { Box, Stack } from '@mui/system';
import { ButtonInfoField, ButtonMainUi, ButtonMinorUi } from '@rapid-cmi5/ui/api/hooks';

const answerBoxGridSize = 3.8;
const attemptedLabel = '#Attempted';
const accuracyLabel = 'Flags';

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
  //TODO const ctfContent = content || slides[activeTab].content as CTFContent;
  const ctfContent = content;

  const dispatch = useDispatch();

  //grader
  const currentAnswer = useSelector(getCurrentAnswer);
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFocused, setIsFocused] = useState(currentQuestionIndex >= 0);
  const focusHelper = useDisplayFocus();
  const countRef = useRef(currentQuestionIndex); //for tabbing

  /* Constants */
  const noneFound = 'No Questions Found';
  const passingScore = ctfContent.passingScore || 80;

  /**
   * Selects question if it is available (no grade or bad grade)
   * Correct answers are skipped
   * Returns whether question was available
   */
  const isAvailable = useCallback(
    (questionIndex: number) => {
      if (Object.prototype.hasOwnProperty.call(currentGrades, questionIndex)) {
        if (currentGrades[questionIndex] === 0) {
          //bad grade
          dispatch(setCurrentQuestion(questionIndex));
          setIsFocused(true);
          return true;
        }
      } else {
        //no grade
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

  /**
   * KeyDown handlers allows user to use arrow keys to cycle through questions
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      //REF stale console.log(currentQuestionIndex, countRef.current);
      if (event.key === 'ArrowDown') {
        event.stopPropagation();
        gotoNextAvailable(countRef.current);
      } else if (event.key === 'ArrowUp') {
        event.stopPropagation();
        gotoPrevAvailable(countRef.current);
      } else if (event.key === 'ArrowRight') {
        event.stopPropagation();
        gotoNextAvailable(countRef.current);
      } else if (event.key === 'ArrowLeft') {
        event.stopPropagation();
        gotoPrevAvailable(countRef.current);
      }
    },
    [currentQuestionIndex],
  );

  /**
   * Reset Activity
   */
  const handleReset = useCallback(() => {
    debugLog('[CTF Activity] reset');
    setIsFocused(true);
    focusHelper.focusOnElementById('me');
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
    //grade here
    dispatch(setCurrentAnswer(input));
    gradeAnswer(input, currentQuestionIndex);
    setIsFocused(false);
    //REF maybe go to next available here?
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
  };

  //#region UE

  useEffect(() => {
    if (ctfContent?.cmi5QuizId) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctfContent?.cmi5QuizId]);

  /**
   * Logs answer change
   */
  useEffect(() => {
    //console.log('change answer', currentAnswer);
  }, [currentAnswer]);

  /**
   * Listens for arrow key events
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * UI triggers focus on input element when question index changes
   * Updates question index ref used in key event handlers
   */
  useEffect(() => {
    debugLog('UE currentQuestionIndex', currentQuestionIndex);
    focusHelper.focusOnElementById('me');
    countRef.current = currentQuestionIndex;
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

  return (
    ctfContent.questions && (
      <Paper
        className="paper-activity"
        variant="outlined"
        sx={{
          backgroundColor: 'background.default',
          minWidth: '320px',
          marginBottom: '12px',
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
                      <Typography color="success" variant="h5">
                        Pass
                      </Typography>
                    </>
                  ) : numAttempted === ctfContent.questions.length ? (
                    <>
                      <ReportIcon color="error" sx={{ marginLeft: '8px' }} />
                      <Typography color="error" variant="h5">
                        Fail
                      </Typography>
                    </>
                  ) : undefined}
                </>
              </ScoreLabel>
              {numAttempted === ctfContent.questions.length && (
                <ScoreLabel label="" value="" gridSize={2.4}>
                  <ButtonMainUi
                    disabled={hasSubmitted}
                    tabIndex={3}
                    onClick={submitQuiz}
                  >
                    Submit
                  </ButtonMainUi>
                </ScoreLabel>
              )}
              <ScoreLabel label="" value="" gridSize={2.4}>
                <ButtonMinorUi
                  tabIndex={4}
                  onClick={handleReset}
                  startIcon={<RestartAltIcon />}
                >
                  Reset
                </ButtonMinorUi>
              </ScoreLabel>

              <div style={{ flexGrow: 1 }} />
            </Stack>

            <QuestionInput
              display={ctfContent.display}
              questionIndex={currentQuestionIndex}
              answer={currentAnswer || ''}
              handleSubmitAnswer={handleSubmitAnswer}
            />

            <Grid
              container
              rowSpacing={0}
              columnSpacing={0} //this warps buttons
              sx={{ padding: '8px' }}
            >
              {ctfContent.questions.map(
                (option: CTFQuestion, index: number) => {
                  let grade: undefined | 0 | 1 = undefined;
                  let defaultColor = undefined;
                  if (
                    Object.prototype.hasOwnProperty.call(currentGrades, index)
                  ) {
                    grade = currentGrades[index];
                    defaultColor = grade === 0 ? 'darkRed' : 'darkGreen';
                  }
                  //REF let theAnswer = option.typeAttributes.correctAnswer;

                  return (
                    <Grid
                      className={
                        currentQuestionIndex === index && isFocused
                          ? 'btn-rangeos'
                          : 'bg-zinc'
                      }
                      key={`q${index}`}
                      xs={answerBoxGridSize}
                      sx={{
                        borderColor:
                          currentQuestionIndex === index && isFocused
                            ? 'white'
                            : defaultColor,
                        borderRadius: '6px',
                        borderStyle: 'solid',
                        borderWidth:
                          currentQuestionIndex === index ? '2px' : '2px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        margin: '4px',
                        padding: '8px',
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
                            {grade === 0 && <ErrorIcon color="error" />}
                            {grade === 1 && (
                              <OutlinedFlagIcon color="success" />
                            )}
                          </div>
                          <Typography
                            variant="h5"
                            sx={{
                              lineHeight: 1.1,
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
                            variant="h5"
                            sx={{
                              lineHeight: 1.1,
                            }}
                          >
                            {option.question}
                          </Typography>
                          {grade === 0 && <ErrorIcon color="error" />}
                          {grade === 1 && <OutlinedFlagIcon color="success" />}
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

//TODO components

function QuestionInput({
  questionIndex,
  answer = '',
  display,
  grade = -1,
  handleSubmitAnswer,
}: {
  grade?: number;
  questionIndex: number;
  answer?: AnswerType;
  handleSubmitAnswer: (input: AnswerType) => void;
  display?: CTFDisplay;
}) {
  const [theAnswer, setTheAnswer] = useState<AnswerType>(answer);
  const [isEnabled, setIsEnabled] = useState(false);
  const currentGrades = useSelector(getGrades);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let grade: undefined | 0 | 1 = undefined;

    if (Object.prototype.hasOwnProperty.call(currentGrades, questionIndex)) {
      grade = currentGrades[questionIndex];
      setIsEnabled(grade !== 1); //dont let them write over correct
      // if (inputRef.current) {
      //   inputRef.current.selectionEnd = inputRef.current.selectionStart;
      // }
    } else {
      setIsEnabled(true);
    }
  }, [questionIndex, currentGrades]);

  /**
   * UE selects text when answer is populated for a new question
   */
  useEffect(() => {
    setTheAnswer(answer);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 100);
  }, [answer]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <TextField
        inputRef={inputRef}
        sx={{ position: 'relative', maxWidth: '480px', marginRight: '8px' }}
        InputLabelProps={{ shrink: true }} // always put label above box even if empty
        fullWidth={true}
        id="me"
        name=""
        margin="dense"
        variant="outlined"
        label={
          display?.shouldNumberQuestions
            ? `Answer #${questionIndex + 1} `
            : 'Answer'
        }
        rows={2}
        multiline={true}
        placeholder="Type Here"
        value={theAnswer}
        size="small"
        disabled={!isEnabled}
        InputProps={{
          readOnly: false, //TODO !isEnabled,
          inputProps: { tabIndex: 1 },
        }}
        onChange={(event) => {
          setTheAnswer(event.target.value);
        }}
        onFocus={(event) => {
          if (inputRef.current && theAnswer) {
            inputRef.current.select();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            handleSubmitAnswer(theAnswer);
          }
        }}
      />
      <ButtonMainUi
        id="enter-button"
        startIcon={undefined}
        tabIndex={2}
        disabled={!isEnabled}
        onClick={() => {
          handleSubmitAnswer(theAnswer);
        }}
        className="btn-rangeos"
      >
        Enter
      </ButtonMainUi>
      {/* <button
        id="enter-button"
        tabIndex={2}
        disabled={!isEnabled}
        onClick={() => {
          handleSubmitAnswer(theAnswer);
        }}
        className="btn-rangeos"
      >
        Enter
      </button> */}
    </div>
  );
}

function ScoreLabel({
  children,
  label,
  value,
  startIconDisplay,
  gridSize = 2.4,
}: {
  children?: JSX.Element;
  label: string;
  value: string;
  startIconDisplay?: JSX.Element;
  gridSize?: number;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: '40px',
      }}
    >
      {label && value && <h5>{label}</h5>}
      {startIconDisplay}
      {label && value && <h5 style={{ marginLeft: '1px' }}>{`:`}</h5>}
      {value && <h5 style={{ marginLeft: '4px' }}>{`${value}`}</h5>}
      {children}
    </Box>
  );
}
