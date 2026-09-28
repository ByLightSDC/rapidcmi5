jest.mock('@xapi/xapi', () => ({
  __esModule: true,
  default: { Verbs: { ANSWERED: { id: 'answered' } } },
}));

jest.mock('uuid', () => ({ v4: () => 'statement-id' }));

jest.mock('../session/cmi5', () => ({
  cmi5Instance: {
    xapi: {
      getState: jest.fn(),
      createState: jest.fn(),
      sendStatement: jest.fn(),
    },
    getLaunchParameters: jest.fn(() => ({
      actor: { objectType: 'Agent', mbox: 'mailto:test@example.com' },
      activityId: 'https://example.com/course',
      registration: 'registration-id',
    })),
    getLaunchData: jest.fn(() => ({
      contextTemplate: {
        extensions: { 'https://example.com/context': true },
        contextActivities: {},
      },
    })),
    interactionChoice: jest.fn(),
    interactionFillIn: jest.fn(),
  },
}));

jest.mock('./DevMode', () => ({ checkForDevMode: jest.fn() }));

jest.mock('./LmsStatementManager', () => ({
  sendActivityCompletedVerb: jest.fn(),
}));

jest.mock('../debug', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import {
  QuestionGrading,
  QuestionResponse,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import type {
  ActivityScore,
  QuizContent,
  QuizScore,
  QuizState,
} from '@rapid-cmi5/cmi5-build-common';
import { logger } from '../debug';
import { cmi5Instance } from '../session/cmi5';
import { checkForDevMode } from './DevMode';
import {
  calculateQuizScore,
  getAutoGradersProgress,
  getQuizProgress,
  getSlideState,
  sendDetailedInteractionStatements,
  setAutoGradersProgress,
  setQuizProgress,
  submitCmi5QuizLRS,
  submitCmi5ScoreLegacy,
} from './Cmi5Helpers';
import { sendActivityCompletedVerb } from './LmsStatementManager';

const xapi = cmi5Instance.xapi as NonNullable<typeof cmi5Instance.xapi>;
const mockGetState = xapi.getState as jest.Mock;
const mockCreateState = xapi.createState as jest.Mock;
const mockSendStatement = xapi.sendStatement as jest.Mock;
const mockInteractionChoice = cmi5Instance.interactionChoice as jest.Mock;
const mockInteractionFillIn = cmi5Instance.interactionFillIn as jest.Mock;
const mockCheckForDevMode = checkForDevMode as jest.Mock;
const mockSendCompleted = sendActivityCompletedVerb as jest.Mock;
const mockLogger = logger as jest.Mocked<typeof logger>;

function question(
  type: QuestionResponse,
  correctAnswer: string | number,
  options?: Array<{ text: string; correct: boolean }>,
  grading = QuestionGrading.Exact,
) {
  return {
    question: `${type} question`,
    type,
    typeAttributes: { correctAnswer, grading, options },
    cmi5QuestionId: `${type}-id`,
  };
}

const choiceOptions = [
  { text: 'Wrong', correct: false },
  { text: 'Correct one', correct: true },
  { text: 'Correct two', correct: true },
];

function quiz(questions: ReturnType<typeof question>[]): QuizContent {
  return {
    title: 'Quiz',
    cmi5QuizId: 'quiz-id',
    passingScore: 70,
    questions,
  } as QuizContent;
}

beforeEach(() => {
  jest.clearAllMocks();
  cmi5Instance.xapi = xapi;
  mockCheckForDevMode.mockReturnValue(false);
  mockCreateState.mockResolvedValue(undefined);
  mockSendStatement.mockResolvedValue(undefined);
  mockInteractionChoice.mockResolvedValue(undefined);
  mockInteractionFillIn.mockResolvedValue(undefined);
  mockSendCompleted.mockResolvedValue(undefined);
});

describe('calculateQuizScore', () => {
  it('returns zero for missing quiz data', () => {
    expect(calculateQuizScore(undefined, undefined)).toEqual({
      raw: 0,
      min: 0,
      max: 100,
    });
  });

  it('grades supported question types and rounds the percentage', () => {
    const content = quiz([
      question(QuestionResponse.MultipleChoice, '', choiceOptions),
      question(QuestionResponse.SelectAll, '', choiceOptions),
      question(QuestionResponse.TrueFalse, 'true'),
      question(QuestionResponse.Number, 12),
      question(QuestionResponse.FreeResponse, 'exact'),
    ]);

    expect(
      calculateQuizScore(content, {
        allAnswers: [1, [1, 2], 'TRUE', '12', 'wrong'],
      }),
    ).toEqual({ raw: 80, min: 0, max: 100 });
  });

  it('requires select-all answers to contain every and only correct option', () => {
    const content = quiz([
      question(QuestionResponse.SelectAll, '', choiceOptions),
      question(QuestionResponse.SelectAll, '', choiceOptions),
    ]);

    expect(
      calculateQuizScore(content, { allAnswers: [[1], [0, 1, 2]] }),
    ).toMatchObject({ raw: 0 });
  });

  it('excludes ungraded questions from the score denominator', () => {
    const content = quiz([
      question(QuestionResponse.FreeResponse, 'correct'),
      question(
        QuestionResponse.FreeResponse,
        'ignored',
        undefined,
        QuestionGrading.None,
      ),
    ]);

    expect(
      calculateQuizScore(content, { allAnswers: ['correct', 'wrong'] }),
    ).toMatchObject({ raw: 100 });
  });

  it('gives full credit when a quiz has no graded questions', () => {
    const content = quiz([
      question(
        QuestionResponse.FreeResponse,
        'ignored',
        undefined,
        QuestionGrading.None,
      ),
    ]);

    expect(
      calculateQuizScore(content, { allAnswers: ['anything'] }),
    ).toMatchObject({ raw: 100 });
  });
});

describe('interaction statements', () => {
  it('encodes selected and correct choice IDs using original option indexes', async () => {
    const content = quiz([
      question(QuestionResponse.SelectAll, '', choiceOptions),
    ]);

    await sendDetailedInteractionStatements(content, {
      allAnswers: [[1, 2]],
    });

    expect(mockInteractionChoice).toHaveBeenCalledWith(
      'quiz-id',
      'selectAll-id',
      ['q-1', 'q-2'],
      ['q-1', 'q-2'],
      [
        { id: 'q-0', description: { 'en-US': 'Wrong' } },
        { id: 'q-1', description: { 'en-US': 'Correct one' } },
        { id: 'q-2', description: { 'en-US': 'Correct two' } },
      ],
      { 'en-US': 'selectAll question' },
      { 'en-US': 'selectAll question' },
      true,
    );
  });

  it('submits true/false as a complete choice interaction', async () => {
    const content = quiz([question(QuestionResponse.TrueFalse, 'true')]);

    await sendDetailedInteractionStatements(content, { allAnswers: ['TRUE'] });

    expect(mockInteractionChoice).toHaveBeenCalledWith(
      'quiz-id',
      'trueFalse-id',
      ['q-true'],
      ['q-true'],
      [
        { id: 'q-true', description: { 'en-US': 'true' } },
        { id: 'q-false', description: { 'en-US': 'false' } },
      ],
      expect.any(Object),
      expect.any(Object),
      true,
    );
  });

  it('submits numeric responses as fill-in interactions', async () => {
    const content = quiz([question(QuestionResponse.Number, 12)]);

    await sendDetailedInteractionStatements(content, { allAnswers: ['12'] });

    expect(mockInteractionFillIn).toHaveBeenCalledWith(
      'quiz-id',
      'number-id',
      ['12'],
      ['12'],
      expect.any(Object),
      expect.any(Object),
      true,
    );
  });

  it('logs rejected interaction statements without rejecting the batch', async () => {
    const error = new Error('statement failed');
    mockInteractionFillIn.mockRejectedValueOnce(error);
    const content = quiz([question(QuestionResponse.FreeResponse, 'answer')]);

    await expect(
      sendDetailedInteractionStatements(content, { allAnswers: ['answer'] }),
    ).resolves.toBeUndefined();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error sending interaction statement for question 1',
      { error },
      'auManager',
    );
  });

  it('does not submit quiz interactions in development mode', async () => {
    mockCheckForDevMode.mockReturnValue(true);

    await submitCmi5QuizLRS(
      quiz([question(QuestionResponse.FreeResponse, 'answer')]),
      { allAnswers: ['answer'] } as QuizScore,
    );

    expect(mockInteractionFillIn).not.toHaveBeenCalled();
  });
});

describe('legacy score submission', () => {
  it('awaits the completion and quiz interaction statements', async () => {
    const content = quiz([question(QuestionResponse.FreeResponse, 'answer')]);
    const data = {
      activityType: RC5ActivityTypeEnum.quiz,
      activityContent: content,
      scoreData: { allAnswers: ['answer'] },
    } as ActivityScore;

    await submitCmi5ScoreLegacy(data);

    expect(mockSendCompleted).toHaveBeenCalledWith('quiz-id', 'quiz');
    expect(mockInteractionFillIn).toHaveBeenCalledTimes(1);
  });

  it('continues quiz submission if the completion statement fails', async () => {
    mockSendCompleted.mockRejectedValueOnce(new Error('completion failed'));
    const content = quiz([question(QuestionResponse.FreeResponse, 'answer')]);

    await submitCmi5ScoreLegacy({
      activityType: RC5ActivityTypeEnum.quiz,
      activityContent: content,
      scoreData: { allAnswers: ['answer'] },
    } as ActivityScore);

    expect(mockInteractionFillIn).toHaveBeenCalledTimes(1);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('uses the correct shared activity type for non-quiz activities', async () => {
    await submitCmi5ScoreLegacy({
      activityType: RC5ActivityTypeEnum.codeRunner,
      activityContent: {
        cmi5QuizId: 'runner-id',
        title: 'Runner',
        description: 'Run code',
        evaluator: '',
        student: '',
        programmingLanguage: 'javascript',
        languageVersion: 'node18',
      },
      scoreData: { isSuccess: true, message: 'ok' },
    });

    expect(mockSendCompleted).toHaveBeenCalledWith('runner-id', 'codeRunner');
    expect(mockInteractionFillIn).not.toHaveBeenCalled();
  });
});

describe('AutoGrader state', () => {
  it('returns an empty set and warns when XAPI is unavailable', async () => {
    cmi5Instance.xapi = null;

    await expect(getAutoGradersProgress()).resolves.toEqual(new Set());
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('loads completed AutoGrader IDs', async () => {
    mockGetState.mockResolvedValue({ data: { autoGraders: ['a', 'b'] } });

    await expect(getAutoGradersProgress()).resolves.toEqual(
      new Set(['a', 'b']),
    );
  });

  it('does not persist or send a statement for an existing ID', async () => {
    mockGetState.mockResolvedValue({ data: { autoGraders: ['existing'] } });

    await setAutoGradersProgress('existing');

    expect(mockCreateState).not.toHaveBeenCalled();
    expect(mockSendStatement).not.toHaveBeenCalled();
  });

  it('creates state and an answered statement for a new ID', async () => {
    mockGetState.mockRejectedValue(new Error('not found'));

    await setAutoGradersProgress('new-id');

    expect(mockCreateState).toHaveBeenCalledWith(
      expect.objectContaining({
        stateId: 'rangeos.autograder.completed',
        state: { autoGraders: ['new-id'] },
      }),
    );
    expect(mockSendStatement).toHaveBeenCalledWith({
      statement: expect.objectContaining({
        id: 'statement-id',
        verb: { id: 'answered' },
        object: expect.objectContaining({
          id: 'https://example.com/course/autograder/new-id',
        }),
      }),
    });
  });
});

describe('LRS state helpers', () => {
  const quizState: QuizState = {
    quizId: 'quiz-id',
    slideNumber: 2,
  };

  it('returns initial slide state when the saved state cannot be loaded', async () => {
    mockGetState.mockRejectedValue(new Error('not found'));

    await expect(getSlideState()).resolves.toEqual({
      currentSlide: 0,
      slides: [],
    });
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('combines the two quiz progress documents', async () => {
    mockGetState
      .mockResolvedValueOnce({ data: { currentQuestion: 3 } })
      .mockResolvedValueOnce({ data: { answers: ['a', 2] } });

    await expect(getQuizProgress(quizState)).resolves.toEqual({
      ...quizState,
      currentQuestion: 3,
      answers: ['a', 2],
    });
  });

  it('returns empty quiz progress when either document is unavailable', async () => {
    mockGetState.mockRejectedValue(new Error('not found'));

    await expect(getQuizProgress(quizState)).resolves.toEqual({
      ...quizState,
      currentQuestion: 0,
      answers: [],
    });
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('saves current question and answers concurrently', async () => {
    await setQuizProgress({
      ...quizState,
      currentQuestion: 2,
      answers: [],
    });

    expect(mockCreateState).toHaveBeenCalledTimes(2);
    expect(mockCreateState).toHaveBeenCalledWith(
      expect.objectContaining({ state: { currentQuestion: 2 } }),
    );
    expect(mockCreateState).toHaveBeenCalledWith(
      expect.objectContaining({ state: { answers: [] } }),
    );
  });
});
