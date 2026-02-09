import XAPI, { InteractionComponent, LanguageMap, Statement } from '@xapi/xapi';
import { cmi5Instance } from '../session/cmi5';
import { v4 as uuidv4 } from 'uuid';

import { AnswerType, IQuestionType, QuizOption } from '../types/QuizState';
import {
  State,
  stateQuizCurrentAnswers,
  stateQuizCurrentQuestion,
  stateViewedSlides,
} from '../types/SlideState';
import { AxiosPromise } from 'axios';
import { checkForDevMode } from './DevMode';
import { logger } from '../debug';

import { sendActivityCompletedVerb } from './LmsStatementManager';
import { gradeActivity, createSlideActivityScore } from './gradeActivity';
import {
  ActivityType,
  SlideActivityScore,
  SlideActivityType,
} from '../types/SlideActivityStatusState';
import {
  ActivityScore,
  RC5ActivityTypeEnum,
  CTFContent,
  QuizScore,
  QuizContent,
  QuestionResponse,
  CTFResponse,
  QuizQuestion,
  QuizState,
} from '@rapid-cmi5/cmi5-build-common';

/**
 * Extract activity ID from activity content based on content type
 */
function getActivityId(activityContent: any): string {
  if ('cmi5QuizId' in activityContent && activityContent.cmi5QuizId) {
    return activityContent.cmi5QuizId;
  } else if ('uuid' in activityContent && activityContent.uuid) {
    return activityContent.uuid;
  } else if (
    'scenarioUUID' in activityContent &&
    activityContent.scenarioUUID
  ) {
    return activityContent.scenarioUUID;
  } else if ('name' in activityContent && activityContent.name) {
    return activityContent.name;
  } else if (
    'scenarioName' in activityContent &&
    activityContent.scenarioName
  ) {
    return activityContent.scenarioName;
  }
  return SlideActivityType.UNKNOWN;
}

export async function submitCmi5ScoreLegacy(data: ActivityScore) {
  logger.debug('[CMI5 Helpers] Submit Score (Legacy)', undefined, 'auManager');
  if (!data.activityType || !data.scoreData) return;

  // Send activityCompleted verb for all activity types
  try {
    const activityId = getActivityId(data.activityContent);
    const activityType =
      data.activityType === RC5ActivityTypeEnum.ctf
        ? SlideActivityType.CTF
        : SlideActivityType.QUIZ;
    sendActivityCompletedVerb(activityId, activityType).catch((error) => {
      logger.error('error sending activityCompleted verb ', error);
    });
  } catch (error) {
    logger.error(
      'Error sending activityCompleted verb to LRS:',
      { error },
      'auManager',
    );
  }

  switch (data.activityType) {
    case RC5ActivityTypeEnum.ctf:
      submitCmi5CtfLRS(
        data.activityContent as CTFContent,
        data.scoreData as QuizScore,
      );
      break;
    case RC5ActivityTypeEnum.quiz:
      submitCmi5QuizLRS(
        data.activityContent as QuizContent,
        data.scoreData as QuizScore,
      );
      break;
    case RC5ActivityTypeEnum.jobe:
      // Jobe activities are handled by LmsStatementManager.handleActivityScoring
      // No additional LRS submission needed here
      logger.debug(
        'Jobe activity LRS handling delegated to LmsStatementManager',
        { content: data.activityContent, response: data.scoreData },
        'auManager',
      );
      break;
    case RC5ActivityTypeEnum.scenario:
      // Scenario activities are handled by LmsStatementManager.handleActivityScoring
      // No additional LRS submission needed here
      logger.debug(
        'Scenario activity LRS handling delegated to LmsStatementManager',
        { content: data.activityContent, response: data.scoreData },
        'auManager',
      );
      break;
    default:
      break;
  }
}

/**
 * Calculate quiz score from allAnswers and quiz content
 */
export function calculateQuizScore(
  activityContent: any,
  scoreData: any,
): SlideActivityScore {
  console.log('in CMI5Helpers.calculateQuizScore');

  try {
    const logScoreCalc = false;

    if (!activityContent?.questions || !scoreData?.allAnswers) {
      if (logScoreCalc) {
        logger.debug(
          'calculateQuizScore: Missing questions or allAnswers',
          {
            hasQuestions: !!activityContent?.questions,
            hasAllAnswers: !!scoreData?.allAnswers,
          },
          'auManager',
        );
      }
      return { raw: 0, min: 0, max: 100 };
    }

    const questions = activityContent.questions;
    const allAnswers = scoreData.allAnswers;

    if (logScoreCalc) {
      logger.debug(
        'calculateQuizScore: Starting calculation',
        {
          totalQuestions: questions.length,
          allAnswers: allAnswers,
          questions: questions.map((q: any) => ({
            question: q.question,
            type: q.type,
            options: q.typeAttributes?.options?.map((opt: any) => ({
              text: opt.text,
              correct: opt.correct,
            })),
            correctAnswer: q.typeAttributes?.correctAnswer,
          })),
        },
        'auManager',
      );
    }

    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((question: any, index: number) => {
      const studentAnswer = allAnswers[index];
      const isCorrect = isAnswerCorrect(question, studentAnswer);

      if (logScoreCalc) {
        logger.debug(
          `calculateQuizScore: Question ${index + 1}`,
          {
            question: question.question,
            type: question.type,
            studentAnswer: studentAnswer,
            isCorrect: isCorrect,
            options: question.typeAttributes?.options?.map(
              (opt: any, optIndex: number) => ({
                index: optIndex,
                text: opt.text,
                correct: opt.correct,
                selected: Array.isArray(studentAnswer)
                  ? studentAnswer.includes(optIndex)
                  : studentAnswer === optIndex,
              }),
            ),
          },
          'auManager',
        );
      }

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const rawScore =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    if (logScoreCalc) {
      logger.debug(
        'calculateQuizScore: Final calculation',
        {
          correctAnswers,
          totalQuestions,
          rawScore,
          roundedScore: Math.round(rawScore),
        },
        'auManager',
      );
    }

    return {
      raw: Math.round(rawScore),
      min: 0,
      max: 100,
    };
  } catch (error) {
    logger.error(
      'Error calculating quiz score, returning default score',
      { error, activityContent, scoreData },
      'auManager',
    );
    return { raw: 0, min: 0, max: 100 };
  }
}

/**
 * Check if a student's answer is correct for a given question
 */
function isAnswerCorrect(question: any, studentAnswer: any): boolean {
  const logAnswers = false;
  if (!question || studentAnswer === null || studentAnswer === undefined) {
    if (logAnswers) {
      logger.debug(
        'isAnswerCorrect: Invalid input',
        { question, studentAnswer },
        'auManager',
      );
    }
    return false;
  }

  const questionType = question.type;
  const options = question.typeAttributes?.options || [];

  if (logAnswers) {
    logger.debug(
      'isAnswerCorrect: Starting evaluation',
      {
        question: question.question,
        type: questionType,
        studentAnswer: studentAnswer,
        options: options.map((opt: any, index: number) => ({
          index,
          text: opt.text,
          correct: opt.correct,
        })),
        correctAnswer: question.typeAttributes?.correctAnswer,
      },
      'auManager',
    );
  }

  let result = false;

  switch (questionType) {
    case 'multipleChoice': {
      // For multiple choice, check if selected option is correct
      const selectedOption = options[studentAnswer];
      result = selectedOption?.correct === true;
      if (logAnswers) {
        logger.debug(
          'isAnswerCorrect: multipleChoice result',
          {
            selectedIndex: studentAnswer,
            selectedOption: selectedOption,
            result,
          },
          'auManager',
        );
      }
      break;
    }

    case 'selectAll': {
      // For select all, check if all selected options are correct and all correct options are selected
      if (!Array.isArray(studentAnswer)) {
        if (logAnswers) {
          logger.debug(
            'isAnswerCorrect: selectAll - studentAnswer is not array',
            {
              studentAnswer,
            },
            'auManager',
          );
        }
        result = false;
        break;
      }

      const correctOptions = options.map((opt: any, index: number) => ({
        index,
        correct: opt.correct,
      }));
      const selectedIndices = studentAnswer;

      // Check if all selected options are correct
      const allSelectedCorrect = selectedIndices.every(
        (index: number) =>
          correctOptions.find((opt: any) => opt.index === index)?.correct ===
          true,
      );

      // Check if all correct options are selected
      const allCorrectSelected = correctOptions
        .filter((opt: any) => opt.correct === true)
        .every((opt: any) => selectedIndices.includes(opt.index));

      result = allSelectedCorrect && allCorrectSelected;

      if (logAnswers) {
        logger.debug(
          'isAnswerCorrect: selectAll result',
          {
            selectedIndices,
            correctOptions: correctOptions.filter((opt: any) => opt.correct),
            allSelectedCorrect,
            allCorrectSelected,
            result,
          },
          'auManager',
        );
      }
      break;
    }

    case 'trueFalse': {
      // For true/false, check if answer matches correct answer (case-insensitive)
      const studentAnswerLower = String(studentAnswer).toLowerCase();
      const correctAnswerLower = String(
        question.typeAttributes?.correctAnswer,
      ).toLowerCase();
      result = studentAnswerLower === correctAnswerLower;
      if (logAnswers) {
        logger.debug(
          'isAnswerCorrect: trueFalse result',
          {
            studentAnswer,
            correctAnswer: question.typeAttributes?.correctAnswer,
            studentAnswerLower,
            correctAnswerLower,
            studentAnswerType: typeof studentAnswer,
            correctAnswerType: typeof question.typeAttributes?.correctAnswer,
            result,
            questionData: question.typeAttributes,
          },
          'auManager',
        );
      }
      break;
    }

    case 'number':
      // For number, check if answer matches correct answer
      result = studentAnswer === question.typeAttributes?.correctAnswer;
      if (logAnswers) {
        logger.debug(
          'isAnswerCorrect: number result',
          {
            studentAnswer,
            correctAnswer: question.typeAttributes?.correctAnswer,
            result,
          },
          'auManager',
        );
      }
      break;

    case 'freeResponse':
      // For free response, check if answer matches correct answer
      result = studentAnswer === question.typeAttributes?.correctAnswer;
      if (logAnswers) {
        logger.debug(
          'isAnswerCorrect: freeResponse result',
          {
            studentAnswer,
            correctAnswer: question.typeAttributes?.correctAnswer,
            result,
          },
          'auManager',
        );
      }
      break;

    default:
      if (logAnswers) {
        logger.debug(
          'isAnswerCorrect: Unknown question type',
          { questionType },
          'auManager',
        );
      }
      result = false;
  }

  if (logAnswers) {
    logger.debug(
      'isAnswerCorrect: Final result',
      {
        question: question.question,
        result,
      },
      'auManager',
    );
  }
  return result;
}

/**
 * Send detailed interaction statements for each question (like legacy system)
 */
export async function sendDetailedInteractionStatements(
  activityContent: any,
  scoreData: any,
) {
  logger.debug(
    'sendDetailedInteractionStatements: Starting',
    undefined,
    'auManager',
  );

  if (!activityContent?.questions || !scoreData?.allAnswers) {
    logger.debug(
      'sendDetailedInteractionStatements: Missing data',
      {
        hasQuestions: !!activityContent?.questions,
        hasAllAnswers: !!scoreData?.allAnswers,
      },
      'auManager',
    );

    return;
  }

  const questions = activityContent.questions;
  const allAnswers = scoreData.allAnswers;
  const testId = activityContent.cmi5QuizId;

  logger.debug(
    'sendDetailedInteractionStatements: Processing questions',
    {
      testId,
      questionCount: questions.length,
      allAnswers,
    },
    'auManager',
  );

  // Send interaction statement for each question
  const interactionPromises = questions.map((question: any, index: number) => {
    const studentAnswer = allAnswers[index];

    logger.debug(
      `sendDetailedInteractionStatements: Processing question ${index + 1}`,
      {
        question: question.question,
        type: question.type,
        studentAnswer,
      },
      'auManager',
    );

    if (question.type === 'multipleChoice' || question.type === 'selectAll') {
      logger.debug(
        `sendDetailedInteractionStatements: Sending choice statement for question ${index + 1}`,
        undefined,
        'auManager',
      );

      return sendInteractionChoiceStatement(question, studentAnswer, testId);
    } else if (question.type === 'freeResponse' || question.type === 'number') {
      logger.debug(
        `sendDetailedInteractionStatements: Sending fill-in statement for question ${index + 1}`,
        undefined,
        'auManager',
      );

      return sendInteractionFillInStatement(question, studentAnswer, testId);
    } else if (question.type === 'trueFalse') {
      logger.debug(
        `sendDetailedInteractionStatements: Sending choice statement for trueFalse question ${index + 1}`,
        undefined,
        'auManager',
      );

      return sendInteractionChoiceStatement(question, studentAnswer, testId);
    }

    logger.debug(
      `sendDetailedInteractionStatements: Unknown question type for question ${index + 1}`,
      {
        type: question.type,
      },
      'auManager',
    );

    return Promise.resolve();
  });

  logger.debug(
    'sendDetailedInteractionStatements: Waiting for all statements to complete',
    undefined,
    'auManager',
  );

  const results = await Promise.allSettled(interactionPromises);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(
        `sendDetailedInteractionStatements: Error sending statement for question ${index + 1}`,
        { error: result.reason },
        'auManager',
      );
    } else {
      logger.debug(
        `sendDetailedInteractionStatements: Successfully sent statement for question ${index + 1}`,
        undefined,
        'auManager',
      );
    }
  });

  logger.debug(
    'sendDetailedInteractionStatements: Completed',
    undefined,
    'auManager',
  );
}

/**
 * Send interaction choice statement for multiple choice/select all questions
 */
async function sendInteractionChoiceStatement(
  question: any,
  studentAnswer: any,
  testId: string,
) {
  const questionId = question.cmi5QuestionId;
  const options = question.typeAttributes?.options || [];

  // Convert student answer to answer IDs
  let answerIds: string[] = [];
  if (Array.isArray(studentAnswer)) {
    // Select all - multiple answers
    answerIds = studentAnswer.map((index: number) => `q-${index}`);
  } else {
    // Single choice
    answerIds = [`q-${studentAnswer}`];
  }

  // Get correct answer IDs
  const correctAnswerIds = options
    .map((opt: any, index: number) => ({ index, correct: opt.correct }))
    .filter((opt: any) => opt.correct)
    .map((opt: any) => `q-${opt.index}`);

  // Create choices array
  const choices = options.map((opt: any, index: number) => ({
    id: `q-${index}`,
    description: { 'en-US': opt.text },
  }));

  // Determine success
  const isCorrect = isAnswerCorrect(question, studentAnswer);

  const name = { 'en-US': question.question };
  const description = { 'en-US': question.question };

  try {
    // debugLog(`sendInteractionChoiceStatement: Sending interaction choice`, {
    //   testId,
    //   questionId,
    //   answerIds,
    //   correctAnswerIds,
    //   isCorrect,
    // });

    await cmi5Instance.interactionChoice(
      testId,
      questionId,
      answerIds,
      correctAnswerIds,
      choices,
      name,
      description,
      isCorrect,
    );

    // debugLog(
    //   `sendInteractionChoiceStatement: Successfully sent interaction choice for ${questionId}`,
    // );
  } catch (error) {
    logger.error(
      `Error sending interaction choice for question ${questionId}:`,
      { error },
      'auManager',
    );
  }
}

/**
 * Send interaction fill-in statement for free response/number questions
 */
async function sendInteractionFillInStatement(
  question: any,
  studentAnswer: any,
  testId: string,
) {
  const questionId = question.cmi5QuestionId;
  const answers = [studentAnswer?.toString() || ''];
  const correctAnswers = [
    question.typeAttributes?.correctAnswer?.toString() || '',
  ];
  const isCorrect = isAnswerCorrect(question, studentAnswer);

  const name = { 'en-US': question.question };
  const description = { 'en-US': question.question };

  try {
    // debugLog(`sendInteractionFillInStatement: Sending interaction fill-in`, {
    //   testId,
    //   questionId,
    //   answers,
    //   correctAnswers,
    //   isCorrect,
    // });

    await cmi5Instance.interactionFillIn(
      testId,
      questionId,
      answers,
      correctAnswers,
      name,
      description,
      isCorrect,
    );

    // debugLog(
    //   `sendInteractionFillInStatement: Successfully sent interaction fill-in for ${questionId}`,
    // );
  } catch (error) {
    logger.error(
      `Error sending interaction fill-in for question ${questionId}:`,
      { error },
      'auManager',
    );
  }
}

const AUTO_GRADER_STATE_ID = 'rangeos.autograder.completed';
export type AutoGraderState = {
  autoGraders: string[];
};

export async function getAutoGradersProgress(): Promise<Set<string>> {
  const xapi = cmi5Instance.xapi;

  if (!xapi) {
    console.warn('XAPI is null');
    return new Set();
  }

  const actor = cmi5Instance.getLaunchParameters().actor;
  const activityId = cmi5Instance.getLaunchParameters().activityId;

  let result;
  try {
    result = await (xapi.getState({
      agent: actor,
      activityId,
      stateId: AUTO_GRADER_STATE_ID,
    }) as AxiosPromise<AutoGraderState>);
  } catch (err) {
    console.warn('AutoGrader progress state not found or failed to load:', err);
    return new Set();
  }

  // Parse and convert to Set

  const uuids: string[] = Array.isArray(result?.data.autoGraders)
    ? result.data.autoGraders
    : [];
  return new Set(uuids);
}

export async function setAutoGradersProgress(uuid: string): Promise<void> {
  const xapi = cmi5Instance.xapi;

  if (!xapi) {
    throw new Error('XAPI is null');
  }

  const actor = cmi5Instance.getLaunchParameters().actor;
  const activityId = cmi5Instance.getLaunchParameters().activityId;
  const registration = cmi5Instance.getLaunchParameters().registration;

  // 1. Get existing UUIDs from LRS state
  let existingUUIDs = new Set<string>();

  try {
    const result = await (xapi.getState({
      agent: actor,
      activityId,
      stateId: AUTO_GRADER_STATE_ID,
    }) as AxiosPromise<AutoGraderState>);

    const list: string[] = Array.isArray(result?.data.autoGraders)
      ? result.data.autoGraders
      : [];
    existingUUIDs = new Set(list);
  } catch (err) {
    // It's okay if there's no existing state yet
  }

  if (existingUUIDs.has(uuid)) {
    console.log(`UUID ${uuid} already recorded`);
    return;
  }

  // 2. Add UUID and persist updated state
  existingUUIDs.add(uuid);
  try {
    await xapi.createState({
      agent: actor,
      activityId,
      stateId: AUTO_GRADER_STATE_ID,
      state: { autoGraders: Array.from(existingUUIDs) } as AutoGraderState, // serialize Set,
    });
    console.log(`UUID ${uuid} added to LRS state`);
  } catch (error) {
    console.error('Failed to update LRS state with UUID:', error);
  }

  // 3. Send ANSWERED statement for audit/tracking
  // const statement: Statement = {
  //   id: uuidv4(),
  //   actor,
  //   verb: XAPI.Verbs.ANSWERED,
  //   object: {
  //     objectType: 'Activity',
  //     id: `${activityId}/autograder/${uuid}`,
  //     definition: {
  //       name: { 'en-US': 'AutoGrader Task Completed' },
  //       description: { 'en-US': `AutoGrader task with UUID ${uuid}` },
  //       type: 'http://adlnet.gov/expapi/activities/assessment',
  //     },
  //   },
  //   context: {
  //     registration,
  //     extensions: cmi5Instance.getLaunchData().contextTemplate.extensions,
  //     contextActivities:
  //       cmi5Instance.getLaunchData().contextTemplate.contextActivities,
  //   },
  //   timestamp: new Date().toISOString(),
  // };

  try {
    await xapi.sendStatement({
      statement: {
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
          extensions: cmi5Instance.getLaunchData().contextTemplate.extensions,
          contextActivities:
            cmi5Instance.getLaunchData().contextTemplate.contextActivities,
        },
        timestamp: new Date().toISOString(),
      },
    });
    console.log(`Sent statement for UUID ${uuid}`);
  } catch (error) {
    console.error('Failed to send statement for AutoGrader UUID:', error);
  }
}

/**
 * Submit Quiz Slide Activity
 * @param quiz
 * @param allAnswers
 * @returns
 */
export async function submitCmi5QuizLRS(
  quiz: QuizContent,
  scoreData: QuizScore,
) {
  const { allAnswers } = scoreData;
  if (checkForDevMode()) {
    return;
  }

  const testId = quiz.cmi5QuizId;

  // eslint-disable-next-line array-callback-return
  const submissionPromises = quiz.questions.map((question, qindex) => {
    if (question.type === QuestionResponse.MultipleChoice) {
      return submitInteractionChoice(
        question,
        allAnswers[qindex] as number,
        testId,
      );
    } else if (question.type === QuestionResponse.FreeResponse) {
      return submitFreeResponse(question, allAnswers[qindex] as string, testId);
    } else if (question.type === QuestionResponse.Number) {
      return submitFreeResponse(question, allAnswers[qindex] as string, testId);
    } else {
      console.log('Submitted a non valid quiz question type');
      return Promise.resolve();
    }
  });

  const results = await Promise.allSettled(submissionPromises);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(
        `Error submitting question ${index}:`,
        { error: result.reason },
        'auManager',
      );
    }
  });
}

/**
 * Submit CTF Slide Activity
 * @param quiz
 * @param allAnswers
 * @returns
 */
export async function submitCmi5CtfLRS(quiz: CTFContent, scoreData: QuizScore) {
  if (checkForDevMode()) {
    return;
  }
  const { allAnswers } = scoreData;
  const testId = quiz.cmi5QuizId;

  // eslint-disable-next-line array-callback-return
  const submissionPromises = quiz.questions.map((question, qindex) => {
    if (question.type === CTFResponse.FreeResponse) {
      return submitFreeResponse(question, allAnswers[qindex] as string, testId);
    } else {
      console.log('Submitted a non valid ctf question type');
      return Promise.resolve();
    }
  });

  const results = await Promise.allSettled(submissionPromises);
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(
        `Error submitting question ${index}:`,
        { error: result.reason },
        'auManager',
      );
    }
  });
}

async function submitFreeResponse(
  question: IQuestionType,
  answer: string,
  testId: string,
) {
  const questionId = question.cmi5QuestionId;
  const answers: string[] = [answer];

  const correctAnswers: string[] = [question.typeAttributes.correctAnswer];

  const success = answer === question.typeAttributes.correctAnswer;

  const name: LanguageMap = {
    'en-US': question.question,
  };
  const description: LanguageMap = {
    'en-US': question.question,
  };

  return cmi5Instance.interactionFillIn(
    testId,
    questionId,
    answers,
    correctAnswers,
    name,
    description,
    success,
  );
}

async function submitInteractionChoice(
  question: QuizQuestion,
  answer: AnswerType,
  testId: string,
) {
  const questionId = question.cmi5QuestionId;
  const answerIds: string[] = [`q-${answer}`];

  const correctOptions = question.typeAttributes.options?.filter(
    (option) => option.correct,
  ) as QuizOption[];

  const correctAnswerIds: string[] = correctOptions.map(
    (option, index) => `q-${index}`,
  );
  if (question.typeAttributes.options === undefined) {
    console.error('Select all type question should have options');
    return;
  }
  const options = question.typeAttributes.options;

  let success = true;
  if (question.type === QuestionResponse.SelectAll) {
    const answers = answer as number[];
    answers.forEach((answerIndex) => {
      if (options[answerIndex].correct === false) {
        success = false;
      }
    });
  } else if (question.type === QuestionResponse.MultipleChoice) {
    if (options[answer as number].correct === false) {
      success = false;
    }
  }

  const choices: InteractionComponent[] = [];

  const name: LanguageMap = {
    'en-US': question.question,
  };
  const description: LanguageMap = {
    'en-US': question.question,
  };
  // eslint-disable-next-line array-callback-return
  question.typeAttributes.options?.map((option, aindex) => {
    const choice: InteractionComponent = {
      id: `q-${aindex}`,
      description: {
        'en-US': option.text,
      },
    };
    choices.push(choice);
  });
  return cmi5Instance.interactionChoice(
    testId,
    questionId,
    answerIds,
    correctAnswerIds,
    choices,
    name,
    description,
    success,
  );
}

export async function getSlideState() {
  const xapi = cmi5Instance.xapi;

  if (xapi === null) {
    console.error(
      'Error getting XAPI when attempting to resume AU, fatal error',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  const actor = cmi5Instance.getLaunchParameters().actor;
  const activityId = cmi5Instance.getLaunchParameters().activityId;
  const stateId: string = activityId + stateViewedSlides;

  const initState: State = {
    currentSlide: 0,
    slides: [],
  };

  let result;
  try {
    logger.debug('getting slides state', undefined, 'auManager');

    result = await (xapi.getState({
      agent: actor,
      activityId: activityId,
      stateId: stateId,
    }) as AxiosPromise<State>);
  } catch (error) {
    logger.error('Could not get AU state', { error }, 'auManager');
  }

  if (result === undefined) {
    logger.debug(
      'Result undefined after get state for slides',
      undefined,
      'auManager',
    );
    return initState;
  }

  return result.data;
}

export async function getQuizProgress(
  quizState: QuizState,
): Promise<QuizState> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    logger.error(
      'Error getting XAPI when attempting to resume AU, fatal error',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }
  const actor = cmi5Instance.getLaunchParameters().actor;
  const activityId = cmi5Instance.getLaunchParameters().activityId;
  const currentQuestionId: string =
    activityId +
    stateQuizCurrentQuestion +
    `/${quizState.slideNumber}/${quizState.quizId}`;
  const currentAnswersId: string =
    activityId +
    stateQuizCurrentAnswers +
    `/${quizState.slideNumber}/${quizState.quizId}`;

  try {
    const [resultCurrentQuestion, resultCurrentAnswers] = await Promise.all([
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
      answers: resultCurrentAnswers.data.answers,
      currentQuestion: resultCurrentQuestion.data.currentQuestion,
    };
  } catch (err) {
    logger.error(
      `Quiz progress state not found or failed to load: ${err}`,
      undefined,
      'auManager',
    );
    return {
      ...quizState,
      answers: [],
      currentQuestion: 0,
    };
  }
}

export async function setQuizProgress(newState: QuizState): Promise<void> {
  const xapi = cmi5Instance.xapi;
  if (xapi === null) {
    logger.error(
      'Error getting XAPI when attempting to resume AU, fatal error',
      undefined,
      'auManager',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }
  const actor = cmi5Instance.getLaunchParameters().actor;
  const activityId = cmi5Instance.getLaunchParameters().activityId;
  const currentQuestionId: string =
    activityId +
    stateQuizCurrentQuestion +
    `/${newState.slideNumber}/${newState.quizId}`;
  const currentAnswersId: string =
    activityId +
    stateQuizCurrentAnswers +
    `/${newState.slideNumber}/${newState.quizId}`;

  try {
    if (newState.currentQuestion !== undefined) {
      await xapi.createState({
        agent: actor,
        activityId: activityId,
        stateId: currentQuestionId,
        state: { currentQuestion: newState.currentQuestion },
      });
    }

    if (newState.answers) {
      await xapi.createState({
        agent: actor,
        activityId: activityId,
        stateId: currentAnswersId,
        state: { answers: newState.answers },
      });
    }
  } catch (error) {
    logger.error(
      `Quiz progress could not be set: ${error}`,
      undefined,
      'auManager',
    );
  }
}

// REF export async function setSlides(newState: State) {
//   const xapi = cmi5Instance.xapi;
//   if (xapi === null) {
//     console.error(
//       'Error getting XAPI when attempting to resume AU, fatal error',
//     );
//     throw new Error('An error occurred, XAPI null after authentication');
//   }
//   const actor = cmi5Instance.getLaunchParameters().actor;
//   const activityId = cmi5Instance.getLaunchParameters().activityId;
//   const stateId: string = activityId + stateViewedSlides;
//   try {
//     await xapi.createState({
//       agent: actor,
//       activityId: activityId,
//       stateId: stateId,
//       state: newState,
//     });
//   } catch (error) {
//     console.log('Error setting slides state', error);
//   }
//   console.log('attempted to create state in set slides');
// }

// export async function sendSlideViewedLRS(
//   slideNumber: number,
//   slideName: string,
//   slideGuid: string,
//   eventType: SlideEventType = 'navigation',
// ) {
//   try {
//     // Send legacy SlideViewed verb for backward compatibility
//     await sendLegacySlideViewed(slideNumber, slideName);
//     // Send new SlideEvent verb for enhanced analytics
//     await sendSlideEventVerb(slideNumber, eventType, slideName);
//   } catch (error) {
//     logger.error('Error sending slideEvent to LRS', { error }, 'auManager');
//   }
// }
