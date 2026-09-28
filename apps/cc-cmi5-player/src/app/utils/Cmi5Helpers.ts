import type { AxiosPromise } from 'axios';
import XAPI from '@xapi/xapi';
import type { InteractionComponent, LanguageMap } from '@xapi/xapi';
import { v4 as uuidv4 } from 'uuid';

import {
  CTFResponse,
  QuestionGrading,
  QuestionResponse,
  RC5ActivityTypeEnum,
  SlideActivityType,
} from '@rapid-cmi5/cmi5-build-common';
import type {
  ActivityScore,
  AnswerType,
  CTFContent,
  CTFQuestion,
  QuizContent,
  QuizQuestion,
  QuizScore,
  QuizState,
  SlideActivityScore,
} from '@rapid-cmi5/cmi5-build-common';
import { logger } from '../debug';
import { cmi5Instance } from '../session/cmi5';
import {
  stateQuizCurrentAnswers,
  stateQuizCurrentQuestion,
  stateViewedSlides,
} from '../types/SlideState';
import type { State } from '../types/SlideState';
import { checkForDevMode } from './DevMode';
import { sendActivityCompletedVerb } from './LmsStatementManager';

type ActivityQuestion = QuizQuestion | CTFQuestion;
type InteractionContent = {
  cmi5QuizId: string;
  questions: ActivityQuestion[];
};
type InteractionScoreData = { allAnswers: AnswerType[] };
type Cmi5Statement = Parameters<
  NonNullable<typeof cmi5Instance.xapi>['sendStatement']
>[0]['statement'];

const AUTO_GRADER_STATE_ID = 'rangeos.autograder.completed';

export type AutoGraderState = {
  autoGraders: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getActivityId(activityContent: unknown): string {
  if (!isRecord(activityContent)) return SlideActivityType.UNKNOWN;

  for (const key of [
    'cmi5QuizId',
    'uuid',
    'scenarioUUID',
    'name',
    'scenarioName',
  ]) {
    const value = activityContent[key];
    if (typeof value === 'string' && value) return value;
  }

  return SlideActivityType.UNKNOWN;
}

function getInteractionData(
  activityContent: unknown,
  scoreData: unknown,
): { content: InteractionContent; score: InteractionScoreData } | null {
  if (!isRecord(activityContent) || !isRecord(scoreData)) return null;
  if (
    typeof activityContent.cmi5QuizId !== 'string' ||
    !Array.isArray(activityContent.questions) ||
    !Array.isArray(scoreData.allAnswers)
  ) {
    return null;
  }

  return {
    content: activityContent as InteractionContent,
    score: scoreData as InteractionScoreData,
  };
}

function isAnswerCorrect(
  question: ActivityQuestion,
  studentAnswer: AnswerType | undefined,
): boolean {
  if (studentAnswer === null || studentAnswer === undefined) return false;

  const options = question.typeAttributes.options ?? [];

  switch (question.type) {
    case QuestionResponse.MultipleChoice: {
      const selectedIndex = Number(studentAnswer);
      return (
        Number.isInteger(selectedIndex) &&
        options[selectedIndex]?.correct === true
      );
    }
    case QuestionResponse.SelectAll: {
      if (!Array.isArray(studentAnswer)) return false;

      const selected = new Set(studentAnswer.map(Number));
      const correct = new Set(
        options.flatMap((option, index) => (option.correct ? [index] : [])),
      );

      return (
        selected.size === correct.size &&
        [...selected].every((index) => correct.has(index))
      );
    }
    case QuestionResponse.TrueFalse:
      return (
        String(studentAnswer).trim().toLowerCase() ===
        String(question.typeAttributes.correctAnswer).trim().toLowerCase()
      );
    case QuestionResponse.Number: {
      const answer = Number(studentAnswer);
      const correctAnswer = Number(question.typeAttributes.correctAnswer);
      return (
        Number.isFinite(answer) &&
        Number.isFinite(correctAnswer) &&
        answer === correctAnswer
      );
    }
    case QuestionResponse.FreeResponse:
    case CTFResponse.FreeResponse:
      return (
        String(studentAnswer) === String(question.typeAttributes.correctAnswer)
      );
    default:
      return false;
  }
}

function isGradedQuestion(question: ActivityQuestion): boolean {
  return question.typeAttributes.grading !== QuestionGrading.None;
}

export function calculateQuizScore(
  activityContent: unknown,
  scoreData: unknown,
): SlideActivityScore {
  const data = getInteractionData(activityContent, scoreData);
  if (!data) return { raw: 0, min: 0, max: 100 };

  try {
    const gradedQuestions = data.content.questions.filter(isGradedQuestion);
    if (gradedQuestions.length === 0) {
      return { raw: 100, min: 0, max: 100 };
    }

    const correctAnswers = data.content.questions.reduce(
      (total, question, index) =>
        isGradedQuestion(question) &&
        isAnswerCorrect(question, data.score.allAnswers[index])
          ? total + 1
          : total,
      0,
    );

    return {
      raw: Math.round((correctAnswers / gradedQuestions.length) * 100),
      min: 0,
      max: 100,
    };
  } catch (error) {
    logger.error(
      'Error calculating quiz score, returning default score',
      { error },
      'auManager',
    );
    return { raw: 0, min: 0, max: 100 };
  }
}

function choiceAnswerIds(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): string[] {
  if (Array.isArray(answer)) return answer.map((index) => `q-${index}`);
  if (answer === null || answer === undefined) return [];
  if (question.type === QuestionResponse.TrueFalse) {
    return [`q-${String(answer).toLowerCase()}`];
  }
  return [`q-${answer}`];
}

function correctChoiceIds(question: QuizQuestion): string[] {
  if (question.type === QuestionResponse.TrueFalse) {
    return [`q-${String(question.typeAttributes.correctAnswer).toLowerCase()}`];
  }
  return (question.typeAttributes.options ?? []).flatMap((option, index) =>
    option.correct ? [`q-${index}`] : [],
  );
}

function interactionChoices(question: QuizQuestion): InteractionComponent[] {
  if (question.type === QuestionResponse.TrueFalse) {
    return ['true', 'false'].map((value) => ({
      id: `q-${value}`,
      description: { 'en-US': value },
    }));
  }
  return (question.typeAttributes.options ?? []).map((option, index) => ({
    id: `q-${index}`,
    description: { 'en-US': option.text },
  }));
}

function questionLanguageMap(question: ActivityQuestion): LanguageMap {
  return { 'en-US': question.question };
}

async function sendChoiceInteraction(
  question: QuizQuestion,
  answer: AnswerType | undefined,
  testId: string,
): Promise<void> {
  if (
    question.type !== QuestionResponse.TrueFalse &&
    !question.typeAttributes.options
  ) {
    logger.warn(
      'Cannot submit choice question without options',
      { questionId: question.cmi5QuestionId },
      'auManager',
    );
    return;
  }

  const language = questionLanguageMap(question);
  await cmi5Instance.interactionChoice(
    testId,
    question.cmi5QuestionId,
    choiceAnswerIds(question, answer),
    correctChoiceIds(question),
    interactionChoices(question),
    language,
    language,
    isAnswerCorrect(question, answer),
  );
}

async function sendFillInInteraction(
  question: ActivityQuestion,
  answer: AnswerType | undefined,
  testId: string,
): Promise<void> {
  const language = questionLanguageMap(question);
  await cmi5Instance.interactionFillIn(
    testId,
    question.cmi5QuestionId,
    [answer === null || answer === undefined ? '' : String(answer)],
    [String(question.typeAttributes.correctAnswer)],
    language,
    language,
    isAnswerCorrect(question, answer),
  );
}

function sendQuestionInteraction(
  question: ActivityQuestion,
  answer: AnswerType | undefined,
  testId: string,
): Promise<void> {
  switch (question.type) {
    case QuestionResponse.MultipleChoice:
    case QuestionResponse.SelectAll:
    case QuestionResponse.TrueFalse:
      return sendChoiceInteraction(question as QuizQuestion, answer, testId);
    case QuestionResponse.FreeResponse:
    case QuestionResponse.Number:
    case CTFResponse.FreeResponse:
      return sendFillInInteraction(question, answer, testId);
    default:
      logger.warn(
        'Unsupported question type; interaction statement skipped',
        { questionId: question.cmi5QuestionId, type: question.type },
        'auManager',
      );
      return Promise.resolve();
  }
}

async function sendInteractions(
  activityContent: unknown,
  scoreData: unknown,
): Promise<void> {
  const data = getInteractionData(activityContent, scoreData);
  if (!data) return;

  const results = await Promise.allSettled(
    data.content.questions.map((question, index) =>
      sendQuestionInteraction(
        question,
        data.score.allAnswers[index],
        data.content.cmi5QuizId,
      ),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(
        `Error sending interaction statement for question ${index + 1}`,
        { error: result.reason },
        'auManager',
      );
    }
  });
}

export function sendDetailedInteractionStatements(
  activityContent: unknown,
  scoreData: unknown,
): Promise<void> {
  return sendInteractions(activityContent, scoreData);
}

export async function submitCmi5QuizLRS(
  quiz: QuizContent,
  scoreData: QuizScore,
): Promise<void> {
  if (checkForDevMode()) return;
  await sendInteractions(quiz, scoreData);
}

export async function submitCmi5CtfLRS(
  quiz: CTFContent,
  scoreData: QuizScore,
): Promise<void> {
  if (checkForDevMode()) return;
  await sendInteractions(quiz, scoreData);
}

export async function submitCmi5ScoreLegacy(
  data: ActivityScore,
): Promise<void> {
  if (!data.activityType || !data.scoreData) return;

  const activityTypes: Record<RC5ActivityTypeEnum, SlideActivityType> = {
    [RC5ActivityTypeEnum.consoles]: SlideActivityType.CONSOLES,
    [RC5ActivityTypeEnum.ctf]: SlideActivityType.CTF,
    [RC5ActivityTypeEnum.download]: SlideActivityType.DOWNLOAD,
    [RC5ActivityTypeEnum.codeRunner]: SlideActivityType.CODE_RUNNER,
    [RC5ActivityTypeEnum.quiz]: SlideActivityType.QUIZ,
    [RC5ActivityTypeEnum.scenario]: SlideActivityType.SCENARIO,
  };
  const activityType = activityTypes[data.activityType];

  try {
    await sendActivityCompletedVerb(
      getActivityId(data.activityContent),
      activityType,
    );
  } catch (error) {
    logger.error(
      'Error sending activityCompleted verb to LRS',
      { error },
      'auManager',
    );
  }

  if (data.activityType === RC5ActivityTypeEnum.ctf) {
    await submitCmi5CtfLRS(
      data.activityContent as CTFContent,
      data.scoreData as QuizScore,
    );
  } else if (data.activityType === RC5ActivityTypeEnum.quiz) {
    await submitCmi5QuizLRS(
      data.activityContent as QuizContent,
      data.scoreData as QuizScore,
    );
  }
}

export async function getAutoGradersProgress(): Promise<Set<string>> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    logger.warn(
      'Cannot load AutoGrader progress without XAPI',
      undefined,
      'lms',
    );
    return new Set();
  }

  const { actor, activityId } = cmi5Instance.getLaunchParameters();

  try {
    const result = await (xapi.getState({
      agent: actor,
      activityId,
      stateId: AUTO_GRADER_STATE_ID,
    }) as AxiosPromise<AutoGraderState>);
    return new Set(
      Array.isArray(result?.data.autoGraders) ? result.data.autoGraders : [],
    );
  } catch (error) {
    logger.warn('AutoGrader progress state was unavailable', { error }, 'lms');
    return new Set();
  }
}

function createAutoGraderStatement(
  uuid: string,
  actor: ReturnType<typeof cmi5Instance.getLaunchParameters>['actor'],
  activityId: string,
  registration: string,
): Cmi5Statement {
  const contextTemplate = cmi5Instance.getLaunchData().contextTemplate;
  return {
    id: uuidv4(),
    actor,
    verb: XAPI.Verbs.ANSWERED,
    object: {
      objectType: 'Activity',
      id: `${activityId}/autograder/${uuid}`,
      definition: {
        name: { 'en-US': 'AutoGrader Task Completed' },
        description: { 'en-US': `AutoGrader task with UUID ${uuid}` },
        type: 'http://adlnet.gov/expapi/activities/assessment',
      },
    },
    context: {
      registration,
      extensions: contextTemplate.extensions,
      contextActivities: contextTemplate.contextActivities,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function setAutoGradersProgress(uuid: string): Promise<void> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) throw new Error('XAPI is null');

  const { actor, activityId, registration } =
    cmi5Instance.getLaunchParameters();
  let completed = new Set<string>();

  try {
    const result = await (xapi.getState({
      agent: actor,
      activityId,
      stateId: AUTO_GRADER_STATE_ID,
    }) as AxiosPromise<AutoGraderState>);
    completed = new Set(
      Array.isArray(result?.data.autoGraders) ? result.data.autoGraders : [],
    );
  } catch {
    // A missing state document is expected on the first completion.
  }

  if (completed.has(uuid)) return;
  completed.add(uuid);

  try {
    await xapi.createState({
      agent: actor,
      activityId,
      stateId: AUTO_GRADER_STATE_ID,
      state: { autoGraders: [...completed] } satisfies AutoGraderState,
    });
  } catch (error) {
    logger.error(
      'Failed to update AutoGrader progress state',
      { error },
      'lms',
    );
  }

  try {
    await xapi.sendStatement({
      statement: createAutoGraderStatement(
        uuid,
        actor,
        activityId,
        registration,
      ),
    });
  } catch (error) {
    logger.error(
      'Failed to send AutoGrader completion statement',
      { error },
      'lms',
    );
  }
}

export async function getSlideState(): Promise<State> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    logger.error(
      'Cannot load slide state without XAPI',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  const { actor, activityId } = cmi5Instance.getLaunchParameters();
  const initialState: State = { currentSlide: 0, slides: [] };

  try {
    const result = await (xapi.getState({
      agent: actor,
      activityId,
      stateId: activityId + stateViewedSlides,
    }) as AxiosPromise<State>);
    return result?.data ?? initialState;
  } catch (error) {
    logger.error('Could not get AU state', { error }, 'auManager');
    return initialState;
  }
}

function quizProgressStateIds(activityId: string, state: QuizState) {
  const suffix = `/${state.slideNumber}/${state.quizId}`;
  return {
    currentQuestionId: activityId + stateQuizCurrentQuestion + suffix,
    currentAnswersId: activityId + stateQuizCurrentAnswers + suffix,
  };
}

export async function getQuizProgress(
  quizState: QuizState,
): Promise<QuizState> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    logger.error(
      'Cannot load quiz progress without XAPI',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  const { actor, activityId } = cmi5Instance.getLaunchParameters();
  const { currentQuestionId, currentAnswersId } = quizProgressStateIds(
    activityId,
    quizState,
  );

  try {
    const [questionResult, answersResult] = await Promise.all([
      xapi.getState({
        agent: actor,
        activityId,
        stateId: currentQuestionId,
      }) as AxiosPromise<{ currentQuestion: number }>,
      xapi.getState({
        agent: actor,
        activityId,
        stateId: currentAnswersId,
      }) as AxiosPromise<{ answers: AnswerType[] }>,
    ]);

    return {
      ...quizState,
      currentQuestion: questionResult.data.currentQuestion,
      answers: answersResult.data.answers,
    };
  } catch (error) {
    logger.warn('Quiz progress state was unavailable', { error }, 'auManager');
    return { ...quizState, currentQuestion: 0, answers: [] };
  }
}

export async function setQuizProgress(newState: QuizState): Promise<void> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    logger.error(
      'Cannot save quiz progress without XAPI',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  const { actor, activityId } = cmi5Instance.getLaunchParameters();
  const { currentQuestionId, currentAnswersId } = quizProgressStateIds(
    activityId,
    newState,
  );

  try {
    const updates: Promise<unknown>[] = [];
    if (newState.currentQuestion !== undefined) {
      updates.push(
        xapi.createState({
          agent: actor,
          activityId,
          stateId: currentQuestionId,
          state: { currentQuestion: newState.currentQuestion },
        }),
      );
    }
    if (newState.answers !== undefined) {
      updates.push(
        xapi.createState({
          agent: actor,
          activityId,
          stateId: currentAnswersId,
          state: { answers: newState.answers },
        }),
      );
    }
    await Promise.all(updates);
  } catch (error) {
    logger.error('Quiz progress could not be saved', { error }, 'auManager');
  }
}
