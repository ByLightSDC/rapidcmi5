jest.mock('./ActivityStatusHelpers', () => ({
  updateActivityStatus: jest.fn(),
}));

jest.mock('./LmsStatementManager', () => ({
  sendActivityCompletedVerb: jest.fn(),
  sendActivityPassedVerb: jest.fn(),
  sendActivityFailedVerb: jest.fn(),
}));

jest.mock('../debug', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { SlideActivityType } from '@rapid-cmi5/cmi5-build-common';
import { logger } from '../debug';
import { updateActivityStatus } from './ActivityStatusHelpers';
import { createSlideActivityScore, gradeActivity } from './gradeActivity';
import {
  sendActivityCompletedVerb,
  sendActivityFailedVerb,
  sendActivityPassedVerb,
} from './LmsStatementManager';
import { calculateScorePercentage, doesScorePass } from './ScoreUtils';

const mockUpdateActivityStatus = updateActivityStatus as jest.Mock;
const mockSendCompleted = sendActivityCompletedVerb as jest.Mock;
const mockSendPassed = sendActivityPassedVerb as jest.Mock;
const mockSendFailed = sendActivityFailedVerb as jest.Mock;
const mockLogger = logger as jest.Mocked<typeof logger>;

const score = createSlideActivityScore(80);

function progress(
  completionRequired?: string,
  ksats: Array<Record<string, unknown>> = [],
) {
  return {
    slideActivitiesMeta: {
      'slide-1': {
        'activity-1': {
          type: SlideActivityType.QUIZ,
          completionRequired,
          ksats,
        },
      },
    },
  } as Parameters<typeof gradeActivity>[7];
}

async function grade(
  activityType = SlideActivityType.QUIZ,
  completionRequired?: string,
  activityScore = score,
  passingScore: number | undefined = 70,
  metadata?: Record<string, unknown>,
) {
  return gradeActivity(
    'activity-1',
    2,
    'slide-1',
    activityType,
    activityScore,
    passingScore,
    metadata,
    progress(completionRequired),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateActivityStatus.mockResolvedValue(undefined);
  mockSendCompleted.mockResolvedValue(undefined);
  mockSendPassed.mockResolvedValue(undefined);
  mockSendFailed.mockResolvedValue(undefined);
});

describe('score helpers', () => {
  it('creates a normalized activity score', () => {
    expect(createSlideActivityScore(45, 0, 60)).toEqual({
      raw: 45,
      min: 0,
      max: 60,
      scaled: 0.75,
    });
  });

  it('calculates score percentages', () => {
    expect(calculateScorePercentage({ raw: 18, min: 0, max: 24 })).toBe(75);
  });

  it('treats the passing threshold as inclusive', () => {
    const thresholdScore = { raw: 42, min: 0, max: 60 };

    expect(doesScorePass(thresholdScore, 70)).toBe(true);
    expect(doesScorePass(thresholdScore, 71)).toBe(false);
  });
});

describe('gradeActivity', () => {
  it('persists the calculated pass result before sending statements', async () => {
    const result = await grade();

    expect(result).toEqual({ completed: true, passed: true, score });
    expect(mockUpdateActivityStatus).toHaveBeenCalledWith(
      {
        activityId: 'activity-1',
        slideIndex: 2,
        slideGuid: 'slide-1',
        type: SlideActivityType.QUIZ,
        score,
        metadata: undefined,
        meetsCriteria: true,
      },
      true,
    );
    expect(mockUpdateActivityStatus.mock.invocationCallOrder[0]).toBeLessThan(
      mockSendCompleted.mock.invocationCallOrder[0],
    );
  });

  it('requires a perfect score when no passing score is supplied', async () => {
    const result = await gradeActivity(
      'activity-1',
      2,
      'slide-1',
      SlideActivityType.CODE_RUNNER,
      score,
      undefined,
      undefined,
      progress(),
    );

    expect(result.passed).toBe(false);
    expect(mockSendFailed).toHaveBeenCalledWith(
      'activity-1',
      SlideActivityType.CODE_RUNNER,
      80,
      {},
    );
  });

  it('marks an unscored activity as failed', async () => {
    const result = await gradeActivity(
      'activity-1',
      2,
      'slide-1',
      SlideActivityType.AUTOGRADER,
      undefined,
      70,
      undefined,
      progress(),
    );

    expect(result.passed).toBe(false);
    expect(mockSendFailed).toHaveBeenCalledWith(
      'activity-1',
      SlideActivityType.AUTOGRADER,
      undefined,
      {},
    );
  });

  it.each(['attempted', 'completed', 'not-applicable'])(
    'treats %s quizzes as complete without grading statements',
    async (completionRequired) => {
      const result = await grade(
        SlideActivityType.QUIZ,
        completionRequired,
        createSlideActivityScore(0),
      );

      expect(result.passed).toBe(false);
      expect(mockUpdateActivityStatus).toHaveBeenCalledWith(
        expect.objectContaining({ meetsCriteria: true }),
        false,
      );
      expect(mockSendCompleted).toHaveBeenCalledTimes(1);
      expect(mockSendPassed).not.toHaveBeenCalled();
      expect(mockSendFailed).not.toHaveBeenCalled();
    },
  );

  it('uses only the passed statement for a pass-required quiz that passes', async () => {
    await grade(SlideActivityType.QUIZ, 'passed');

    expect(mockSendCompleted).not.toHaveBeenCalled();
    expect(mockSendPassed).toHaveBeenCalledWith(
      'activity-1',
      SlideActivityType.QUIZ,
      80,
      {},
    );
    expect(mockSendFailed).not.toHaveBeenCalled();
  });

  it('uses only the failed statement for a pass-required quiz that fails', async () => {
    await grade(SlideActivityType.QUIZ, 'passed', createSlideActivityScore(40));

    expect(mockSendCompleted).not.toHaveBeenCalled();
    expect(mockSendPassed).not.toHaveBeenCalled();
    expect(mockSendFailed).toHaveBeenCalledTimes(1);
    expect(mockUpdateActivityStatus).toHaveBeenCalledWith(
      expect.objectContaining({ meetsCriteria: false }),
      false,
    );
  });

  it('sends completion and grading statements when both are required', async () => {
    await grade(SlideActivityType.CTF, 'completed-and-passed');

    expect(mockSendCompleted).toHaveBeenCalledTimes(1);
    expect(mockSendPassed).toHaveBeenCalledTimes(1);
  });

  it('adds KSAT skills to statement metadata without changing status metadata', async () => {
    const ksats = [{ element_identifier: 'task-1', title: 'Task one' }];
    const metadata = { source: 'test' };

    await gradeActivity(
      'activity-1',
      2,
      'slide-1',
      SlideActivityType.QUIZ,
      score,
      70,
      metadata,
      progress('completed-and-passed', ksats),
    );

    expect(mockUpdateActivityStatus).toHaveBeenCalledWith(
      expect.objectContaining({ metadata }),
      true,
    );
    expect(mockSendCompleted).toHaveBeenCalledWith(
      'activity-1',
      SlideActivityType.QUIZ,
      { source: 'test', skills: ksats },
    );
    expect(mockSendPassed).toHaveBeenCalledWith(
      'activity-1',
      SlideActivityType.QUIZ,
      80,
      { source: 'test', skills: ksats },
    );
    expect(metadata).toEqual({ source: 'test' });
  });

  it('warns and applies the default policy when course progress is absent', async () => {
    await gradeActivity(
      'activity-1',
      2,
      'slide-1',
      SlideActivityType.QUIZ,
      score,
      70,
    );

    expect(mockLogger.warn).toHaveBeenCalled();
    expect(mockSendCompleted).toHaveBeenCalledTimes(1);
    expect(mockSendPassed).toHaveBeenCalledTimes(1);
  });

  it('does not send statements when persisting activity status fails', async () => {
    const error = new Error('status update failed');
    mockUpdateActivityStatus.mockRejectedValueOnce(error);

    await expect(grade()).rejects.toThrow(error);
    expect(mockSendCompleted).not.toHaveBeenCalled();
    expect(mockSendPassed).not.toHaveBeenCalled();
    expect(mockSendFailed).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error in gradeActivity',
      error,
      'lms',
    );
  });
});
