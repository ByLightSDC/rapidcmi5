import type {
  ActivityCompletionPayload,
  ActivityType,
  SlideActivityScore,
} from '@rapid-cmi5/cmi5-build-common';
import { SlideActivityType } from '@rapid-cmi5/cmi5-build-common';

import { logger } from '../debug';
import type { CourseAUProgress } from '../types/CourseAUProgress';
import { updateActivityStatus } from './ActivityStatusHelpers';
import { doesScorePass } from './ScoreUtils';
import {
  sendActivityCompletedVerb,
  sendActivityFailedVerb,
  sendActivityPassedVerb,
} from './LmsStatementManager';

type CourseProgressForGrading = Pick<CourseAUProgress, 'slideActivitiesMeta'>;

type CompletionPolicy = {
  meetsCriteria: boolean;
  sendCompletedVerb: boolean;
  sendGradingVerb: boolean;
};

export type GradeActivityResult = {
  completed: boolean;
  passed: boolean;
  score?: SlideActivityScore;
};

/**
 * Creates the normalized score shape used by activity status and statements.
 */
export function createSlideActivityScore(
  raw: number,
  min = 0,
  max = 100,
): SlideActivityScore {
  return {
    raw,
    min,
    max,
    scaled: raw / max,
  };
}

function determinePassed(
  score?: SlideActivityScore,
  passingScore?: number,
): boolean {
  if (!score) return false;
  if (passingScore === undefined) return score.raw === score.max;
  return doesScorePass(score, passingScore);
}

function getCompletionPolicy(
  activityType: ActivityType,
  completionRequired: string | undefined,
  passed: boolean,
): CompletionPolicy {
  if (
    activityType !== SlideActivityType.QUIZ &&
    activityType !== SlideActivityType.CTF
  ) {
    return {
      meetsCriteria: passed,
      sendCompletedVerb: true,
      sendGradingVerb: true,
    };
  }

  switch (completionRequired) {
    case 'attempted':
    case 'completed':
    case 'not-applicable':
      return {
        meetsCriteria: true,
        sendCompletedVerb: true,
        sendGradingVerb: false,
      };
    case 'passed':
      return {
        meetsCriteria: passed,
        sendCompletedVerb: false,
        sendGradingVerb: true,
      };
    case 'completed-and-passed':
      return {
        meetsCriteria: passed,
        sendCompletedVerb: true,
        sendGradingVerb: true,
      };
    default:
      return {
        meetsCriteria: passed,
        sendCompletedVerb: true,
        sendGradingVerb: true,
      };
  }
}

function sendCompletedStatement(
  activityId: string,
  activityType: ActivityType,
  metadata: Record<string, unknown>,
): void {
  void sendActivityCompletedVerb(activityId, activityType, metadata).catch(
    (error) => logger.error('error sending activityCompleted verb ', error),
  );
}

async function sendGradingStatement(
  activityId: string,
  activityType: ActivityType,
  passed: boolean,
  score: SlideActivityScore | undefined,
  metadata: Record<string, unknown>,
): Promise<void> {
  const sendStatement = passed
    ? sendActivityPassedVerb
    : sendActivityFailedVerb;

  await sendStatement(activityId, activityType, score?.raw, metadata);
}

/**
 * Grades an activity, persists its status, and emits the applicable xAPI
 * completion and pass/fail statements.
 */
export async function gradeActivity(
  activityId: string,
  slideIndex: number,
  slideGuid: string,
  activityType: ActivityType,
  score?: SlideActivityScore,
  passingScore?: number,
  metadata?: Record<string, unknown>,
  courseAUProgress?: CourseProgressForGrading,
): Promise<GradeActivityResult> {
  logger.info(
    'Grading activity - START',
    {
      activityId,
      activityType,
      slideIndex,
      slideGuid,
      score,
      passingScore,
      hasCourseAUProgress: !!courseAUProgress,
    },
    'lms',
  );

  if (!courseAUProgress?.slideActivitiesMeta) {
    logger.warn(
      'courseAUProgress or slideActivitiesMeta is undefined in gradeActivity',
      {
        hasCourseAUProgress: !!courseAUProgress,
        hasSlideActivitiesMeta: !!courseAUProgress?.slideActivitiesMeta,
        activityId,
      },
      'lms',
    );
  }

  try {
    const activityMetadata =
      courseAUProgress?.slideActivitiesMeta[slideGuid]?.[activityId];
    const passed = determinePassed(score, passingScore);
    const policy = getCompletionPolicy(
      activityType,
      activityMetadata?.completionRequired,
      passed,
    );

    const completionPayload: ActivityCompletionPayload = {
      activityId,
      slideIndex,
      slideGuid,
      type: activityType,
      score,
      metadata,
      meetsCriteria: policy.meetsCriteria,
    };

    await updateActivityStatus(completionPayload, passed);

    const ksats = activityMetadata?.ksats ?? [];
    const statementMetadata: Record<string, unknown> = {
      ...metadata,
      ...(ksats.length > 0 && { skills: ksats }),
    };

    if (policy.sendCompletedVerb) {
      sendCompletedStatement(activityId, activityType, statementMetadata);
    }

    if (policy.sendGradingVerb) {
      await sendGradingStatement(
        activityId,
        activityType,
        passed,
        score,
        statementMetadata,
      );
    }

    logger.info(
      'Activity grading completed - slide completion events handled by Redux action',
      { activityId, slideGuid, slideIndex },
      'lms',
    );

    return { completed: true, passed, score };
  } catch (error) {
    logger.error('Error in gradeActivity', error, 'lms');
    throw error;
  }
}
