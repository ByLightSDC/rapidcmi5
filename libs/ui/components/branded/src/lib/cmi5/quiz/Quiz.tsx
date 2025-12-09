import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  QuizQuestion,
  QuizCompletionEnum,
  QuizContent,
  AnswerType,
  QuestionResponse,
  AuContextProps,
  ActivityScore,
  RC5ActivityTypeEnum,
  QuizState,
} from '@rangeos-nx/types/cmi5';
import useQuizGrader from './hooks/useQuizGrader';

import AuQuizQuestion from './QuizQuestion';
import QuizScore from './QuizScore';

/** Icons */
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { debugLog } from '../../utility/logger';
import QuizReview from './QuizReview';
import QuestionNav from './QuestionNav';
import { usePersistQuizProgress } from './hooks/usePersistQuiz';
import { useHydrateQuiz } from './hooks/useHydrateQuiz';
import { ButtonMinorUi, ButtonMainUi } from '@rangeos-nx/ui/api/hooks';

export type PotentialAnswerType = AnswerType | null;

export function AuQuiz({
  auProps,
  content,
}: {
  auProps: Partial<AuContextProps>;
  content: QuizContent;
}) {
  const { getGrade, gradeQuiz } = useQuizGrader();
  const {
    setProgress,
    getActivityCache,
    submitScore,
    setActivityCache,
    activeTab,
    isAuthenticated,
    isTestMode,
  } = auProps;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [allAnswers, setAllAnswers] = useState<AnswerType[]>(
    Array(content.questions.length).fill(null),
  );

  const readyToHydrate = useMemo(() => {
    return isTestMode || isAuthenticated || false;
  }, [isTestMode, isAuthenticated]);

  const [isLoading, setIsLoading] = useState(true);

  // This cache autoloads the quiz with previous entries
  // Data is stored between window closes through LRS state
  // The cache is also stored in redux to allow for lower latency by skipping network calls

  const readyToPersist = useRef(false);

  usePersistQuizProgress({
    readyToPersist,
    setActivityCache,
    currentQuestion,
    allAnswers,
    quizId: content.cmi5QuizId,
    activeTab,
  });

  useHydrateQuiz({
    readyToHydrate,
    getActivityCache,
    quizId: content.cmi5QuizId,
    activeTab,
    setAllAnswers,
    setCurrentQuestion,
    readyToPersist,
    setIsLoading,
    allAnswers,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [showReviewAnswers, setShowReviewAnswers] = useState(false);

  const [unansweredQuestions, setUnansweredQuestions] = useState<
    null | number[]
  >(null);
  const [currentQuestionHasAnswer, setCurrentQuestionHasAnswer] =
    useState(false);

  const handleNextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevQuestion = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  const submitQuiz = () => {
    setIsSubmitted(true);

    // Trim whitespace from string answers before grading
    const trimmedAnswers = allAnswers.map((answer, index) => {
      const question = content.questions[index];
      if (
        question.type === QuestionResponse.FreeResponse ||
        question.type === QuestionResponse.TrueFalse ||
        question.type === QuestionResponse.Number
      ) {
        return typeof answer === 'string' ? answer.trim() : answer;
      }
      return answer;
    });

    const quizScore = gradeQuiz(content.questions, trimmedAnswers);
    setScore(quizScore);

    if (setProgress) {
      if (content.completionRequired === QuizCompletionEnum.Attempted) {
        setProgress(true);
      } else if (content.completionRequired === QuizCompletionEnum.Passed) {
        if (quizScore >= content.passingScore) {
          setProgress(true);
        }
      }
    }

    if (submitScore) {
      const scoreData: ActivityScore = {
        activityType: RC5ActivityTypeEnum.quiz,
        activityContent: content,
        scoreData: { allAnswers: trimmedAnswers },
      };
      submitScore(scoreData);
      console.log('submit score');
    }

    handleShowScore();
  };

  const findUnansweredQuestions = () => {
    const unanswered = content.questions
      .map((_question, index) => {
        const answer = allAnswers[index]?.toString() || null;
        if (answer) {
          return null;
        } else {
          return index + 1;
        }
      })
      .filter((text) => text !== null) as number[];

    return unanswered;
  };

  const handleShowScore = () => {
    setShowScore(true);
    setShowReviewAnswers(false);
    setShowQuestion(false);
  };

  const reviewAnswers = () => {
    setShowQuestion(true);
    setShowScore(false);
    setShowReviewAnswers(true);
    setShowQuestionNav(true);
  };

  const handleReset = () => {
    debugLog('[Quiz] reset');
    setCurrentQuestion(0);
    setUnansweredQuestions(null);
    setIsSubmitted(false);
    setShowScore(false);
    setShowReviewAnswers(false);
    setShowQuestion(true);
    setShowQuestionNav(false);
    setAllAnswers(Array(content.questions.length).fill(null));
  };

  const goToQuestion = (question: number) => {
    setCurrentQuestion(question - 1);
  };

  const handlePickAnswer = (answer: AnswerType) => {
    const qtype = content.questions[currentQuestion].type;

    if (qtype === QuestionResponse.SelectAll) {
      const answerIndex = answer as number;

      const currentAnswers = Array.isArray(allAnswers[currentQuestion])
        ? [...(allAnswers[currentQuestion] as number[])]
        : [];

      // Toggle the answer
      const updatedAnswers = currentAnswers.includes(answerIndex)
        ? currentAnswers.filter((a) => a !== answerIndex) // remove
        : [...currentAnswers, answerIndex]; // add

      const updated = [...allAnswers];
      updated[currentQuestion] = updatedAnswers;
      setAllAnswers(updated);
    } else if (qtype === QuestionResponse.MultipleChoice) {
      const updated = [...allAnswers];
      updated[currentQuestion] = answer;
      setAllAnswers(updated);
    } else if (qtype === QuestionResponse.TrueFalse) {
      const updated = [...allAnswers];
      updated[currentQuestion] = answer;
      setAllAnswers(updated);
    } else if (qtype === QuestionResponse.FreeResponse) {
      const updated = [...allAnswers];
      updated[currentQuestion] = answer;
      setAllAnswers(updated);
    } else if (qtype === QuestionResponse.Number) {
      const updated = [...allAnswers];
      updated[currentQuestion] = answer as number;
      setAllAnswers(updated);
    } else if (qtype === QuestionResponse.Matching) {
      const updated = [...allAnswers];
      updated[currentQuestion] = answer as string[];
      setAllAnswers(updated);
    }
  };

  const toggleQuestionNav = useCallback(() => {
    setShowQuestionNav(!showQuestionNav);
  }, [showQuestionNav]);

  const updateUnanswered = useCallback(() => {
    if (!unansweredQuestions) {
      setUnansweredQuestions(findUnansweredQuestions());
      return;
    }

    if (currentQuestionHasAnswer) {
      if (unansweredQuestions.includes(currentQuestion + 1)) {
        const index = unansweredQuestions.indexOf(currentQuestion + 1);
        if (index >= 0) {
          const arr = [...unansweredQuestions];
          arr.splice(index, 1);
          setUnansweredQuestions(arr);
        }
      }
    } else {
      if (!unansweredQuestions.includes(currentQuestion + 1)) {
        const arr = [...unansweredQuestions];
        arr.push(currentQuestion + 1);
        setUnansweredQuestions(arr);
      }
    }
  }, [currentQuestionHasAnswer, unansweredQuestions, currentQuestion]);

  const isSubmitEnabled: boolean =
    !showReviewAnswers &&
    unansweredQuestions &&
    unansweredQuestions.length === 0
      ? true
      : false;

  useEffect(() => {
    handleReset();
  }, [content]);

  useEffect(() => {
    if (isSubmitted) {
      handleShowScore();
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (
      currentQuestion >= 0 &&
      content?.questions &&
      currentQuestion < content.questions.length
    ) {
      setActiveQuestion(content?.questions[currentQuestion]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, content.questions]);

  useEffect(() => {
    //REF console.log('arr', unansweredQuestions);
  }, [unansweredQuestions]);

  useEffect(() => {
    let hasAnswer = false;
    if (content.questions.length > 0) {
      const qtype = content.questions[currentQuestion]?.type;
      if (
        typeof allAnswers[currentQuestion] !== 'undefined' &&
        allAnswers[currentQuestion] !== null
      ) {
        switch (qtype) {
          case QuestionResponse.SelectAll:
            // eslint-disable-next-line no-case-declarations
            const theCorrectAnswers = allAnswers[currentQuestion] as number[];
            hasAnswer = theCorrectAnswers.length > 0;
            break;
          case QuestionResponse.MultipleChoice:
            // eslint-disable-next-line no-case-declarations
            const theCorrectAnswerIndex = allAnswers[currentQuestion] as number;
            hasAnswer = theCorrectAnswerIndex >= 0;
            break;
          case QuestionResponse.Number:
            // eslint-disable-next-line no-case-declarations
            hasAnswer = true;
            break;
          default:
            hasAnswer = allAnswers[currentQuestion] ? true : false; //chars
            break;
        }
      }

      setCurrentQuestionHasAnswer(hasAnswer);
    }
  }, [allAnswers, currentQuestion]);

  useEffect(() => {
    updateUnanswered();
  }, [currentQuestionHasAnswer, currentQuestion, updateUnanswered]);

  return (
    <Paper
      className="paper-activity"
      variant="outlined"
      sx={{
        backgroundColor: 'background.default',
        minWidth: '320px',
        maxWidth: '1152px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '12px',
      }}
    >
      {content.title && (
        <Typography
          color="text.primary"
          align="center"
          variant="h2"
          style={{
            fontWeight: 800,
            paddingBottom: '8px',
          }}
        >
          {content.title}
        </Typography>
      )}
      {isLoading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Loading quiz...
          </Typography>
        </Box>
      )}
      {!isLoading && activeQuestion && (
        <>
          {showQuestion && (
            <>
              <AuQuizQuestion
                question={activeQuestion}
                currentQuestion={currentQuestion}
                numQuestions={content.questions.length}
                currentAnswer={allAnswers[currentQuestion]}
                handlePickAnswer={handlePickAnswer}
                correctAnswer={
                  content.questions[currentQuestion]?.typeAttributes
                    ?.correctAnswer
                }
                isCorrect={isSubmitted ? getGrade(currentQuestion) : false}
                isGraded={isSubmitted}
              />
              <div className="flex flex-row py-4 space-x-4">
                <div style={{ minWidth: '80px' }}>
                  <IconButton
                    aria-label="find unanswered"
                    //size={'small'}
                    color="primary"
                    onClick={toggleQuestionNav}
                  >
                    <Tooltip
                      arrow
                      enterDelay={200}
                      enterNextDelay={500}
                      title="Find Question"
                      placement="bottom"
                    >
                      <>
                        {showQuestionNav && <SearchOffIcon />}
                        {!showQuestionNav && <SavedSearchIcon />}
                      </>
                    </Tooltip>
                  </IconButton>
                  {!isSubmitted && (
                    <IconButton
                      aria-label="Reset"
                      color="primary"
                      onClick={handleReset}
                    >
                      <Tooltip
                        arrow
                        enterDelay={200}
                        enterNextDelay={500}
                        title="Reset"
                        placement="bottom"
                      >
                        <RestartAltIcon />
                      </Tooltip>
                    </IconButton>
                  )}
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <ButtonMinorUi
                    startIcon={null}
                    sxProps={{ marginRight: '4px' }}
                    endIcon={
                      <ArrowBackIosIcon
                        sx={{
                          padding: '0px',
                          margin: '0px',
                        }}
                      />
                    }
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion <= 0 ? true : false}
                    tooltip="Previous Question"
                  ></ButtonMinorUi>

                  <ButtonMinorUi
                    onClick={handleNextQuestion}
                    disabled={
                      currentQuestion >= content.questions.length - 1
                        ? true
                        : false
                    }
                    sxProps={{ marginLeft: '4px' }}
                    startIcon={null}
                    tooltip="Next Question"
                    endIcon={
                      <ArrowForwardIosIcon
                        sx={{
                          padding: '0px',
                          margin: '0px',
                        }}
                      />
                    }
                  ></ButtonMinorUi>
                </div>
                {!isSubmitted && (
                  <ButtonMainUi
                    disabled={!isSubmitEnabled}
                    sxProps={{ maxWidth: '180px' }}
                    onClick={submitQuiz}
                  >
                    Submit
                  </ButtonMainUi>
                )}
                {isSubmitted && (
                  <ButtonMainUi
                    sxProps={{ maxWidth: '180px' }}
                    startIcon={<RestartAltIcon />}
                    onClick={handleReset}
                  >
                    Retake
                  </ButtonMainUi>
                )}
              </div>
              {!showReviewAnswers && showQuestionNav && (
                <QuestionNav
                  content={content}
                  currentQuestion={currentQuestion}
                  unansweredQuestions={unansweredQuestions}
                  goToQuestion={goToQuestion}
                  setShowQuestionNav={setShowQuestionNav}
                />
              )}
              {showReviewAnswers && showQuestionNav && (
                <QuizReview
                  content={content}
                  currentQuestion={currentQuestion}
                  getGrade={getGrade}
                  goToQuestion={goToQuestion}
                  setShowQuestionNav={setShowQuestionNav}
                />
              )}
            </>
          )}

          {showScore && (
            <Stack
              direction="column"
              sx={{ justifyContent: 'center', alignItems: 'center' }}
              spacing={1}
            >
              <QuizScore quiz={content} score={score} />

              <ButtonMainUi
                sxProps={{ maxWidth: '180px' }}
                startIcon={<SavedSearchIcon />}
                onClick={reviewAnswers}
              >
                Review Answers
              </ButtonMainUi>
              <ButtonMainUi
                sxProps={{ maxWidth: '180px' }}
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Try Again
              </ButtonMainUi>
            </Stack>
          )}
        </>
      )}
    </Paper>
  );
}
