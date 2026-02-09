import { ResultScore, Statement } from '@xapi/xapi';
import { v4 as uuidv4 } from 'uuid';
import { cmi5Instance } from '../session/cmi5';
import { debugLog, logger } from '../debug';
import { checkForDevMode } from './DevMode';
import sha256 from 'crypto-js/sha256';

// Imports for progress management functions
import { Dispatch } from '@reduxjs/toolkit';
import { RootState } from '../redux/store';
import { CourseAUProgress } from '../types/CourseAUProgress';
import { setCourseAUProgress, setAuProgress } from '../redux/auReducer';
// import { slideViewed } from './Cmi5Helpers'; // TODO: Fix this import
import {
  getSlideChangedStatus,
  isAUCompletedCheck,
  isAUPassed,
  updateSlideStatus,
  saveCourseAUProgressToLRS,
  calculateProgressPercentage,
} from './CourseAUProgressHelpers';

import {
  calculateQuizScore,
  sendDetailedInteractionStatements,
} from './Cmi5Helpers';
import { gradeActivity, createSlideActivityScore } from './gradeActivity';
import {
  ActivityType,
  SlideActivityScore,
  SlideActivityType,
} from '../types/SlideActivityStatusState';
import {
  ActivityScore,
  getActivityTypeFromDisplayName,
} from '@rapid-cmi5/cmi5-build-common';
import { config } from '@rapid-cmi5/ui';

/**
 * Extract activity ID from activity content based on content type
 */
function getActivityId(activityContent: any): string {
  // if (activityContent.rc5id) {
  //   return activityContent.rc5id;
  // }
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

/**
 * Slide event types for tracking user interactions with slides
 */
export type SlideEventType =
  | 'navigation'
  | 'scroll_complete'
  // Audio events
  | 'audio_play'
  | 'audio_pause'
  | 'audio_complete'
  | 'audio_progress_25'
  | 'audio_progress_50'
  | 'audio_progress_75'
  // Video events
  | 'video_play'
  | 'video_pause'
  | 'video_complete'
  | 'video_progress_25'
  | 'video_progress_50'
  | 'video_progress_75'
  | 'video_fullscreen_enter'
  | 'video_fullscreen_exit';

/**
 * Centralized LMS Statement Manager
 * This file provides a complete system for creating, managing, and sending xAPI statements to the LRS
 * and handling CMI5 protocol interactions with the LMS.
 * It includes:
 * - Verb definitions (CMI5, XAPI, and custom RangeOS verbs)
 * - Statement creation and validation
 * - Dev mode handling (skips statements in development)
 * - Error handling and logging
 * - Centralized statement sending logic
 * - LMS/LRS communication management
 */

// Standard CMI5 Verbs
export const CMI5_VERBS = {
  LAUNCHED: 'http://adlnet.gov/expapi/verbs/launched',
  INITIALIZED: 'http://adlnet.gov/expapi/verbs/initialized',
  PASSED: 'http://adlnet.gov/expapi/verbs/passed',
  COMPLETED: 'http://adlnet.gov/expapi/verbs/completed',
  TERMINATED: 'http://adlnet.gov/expapi/verbs/terminated',
} as const;

// Common XAPI Verbs
export const XAPI_VERBS = {
  PROGRESS: 'http://adlnet.gov/expapi/verbs/progressed',
  ANSWERED: 'http://adlnet.gov/expapi/verbs/answered',
} as const;

// Custom RangeOS Verbs
export const RANGEOS_VERBS = {
  CLASS_EVENT: 'https://rangeos/verbs/classEvent',
  SLIDE_EVENT: 'https://rangeos/verbs/slideEvent',
  AU_PASSED: 'https://rangeos/verbs/auPassed',
  AU_COMPLETED: 'https://rangeos/verbs/auCompleted',
  SLIDE_COMPLETED: 'https://rangeos/verbs/slideCompleted',
  SLIDE_PASSING: 'https://rangeos/verbs/slidePassing',
  ACTIVITY_COMPLETED: 'https://rangeos/verbs/activityCompleted',
  ACTIVITY_PASSED: 'https://rangeos/verbs/activityPassed',
  ACTIVITY_FAILED: 'https://rangeos/verbs/activityFailed',
  SCENARIO_EVENT: 'https://rangeos/verbs/scenarioEvent',
  SLIDE_VIEWED: 'https://rangeos/verbs/SlideViewed', // Already exists
  RANGEOS_OK: 'rangeos-ok', // Already exists
} as const;

/**
 * Base statement template
 */
function createBaseStatement(): Partial<Statement> {
  return {
    id: uuidv4(),
    actor: cmi5Instance.getLaunchParameters().actor,
    context: {
      registration: cmi5Instance.getLaunchParameters().registration,
      extensions: cmi5Instance.getLaunchData().contextTemplate.extensions,
      contextActivities:
        cmi5Instance.getLaunchData().contextTemplate.contextActivities,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send a statement to the LRS
 */
async function sendStatement(statement: Statement): Promise<void> {
  logger.debug(
    'in LmsStatementManager.sendStatement',
    statement ?? undefined,
    'lms',
  );

  // Check for dev mode - don't send statements in dev mode unless local LRS testing is enabled
  if (checkForDevMode()) {
    logger.debug(
      `LRS Statement skipped in dev mode: ${statement.verb?.display?.['en-US'] || 'Unknown'}`,
      undefined,
      'lms',
    );
    return;
  }

  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    throw new Error('XAPI is null - cannot send statement');
  }

  try {
    await xapi.sendStatement({ statement: statement as any });
    logger.debug(
      `LRS Statement sent: ${statement.verb?.display?.['en-US'] || 'Unknown'}`,
      undefined,
      'lms',
    );
  } catch (error) {
    logger.debug(`Error sending LRS statement: ${error}`, undefined, 'lms');
    throw error;
  }
}

/**
 * Standard CMI5 Verbs
 */

/**
 * Send Initialized verb - Sent by content when it is open and rendered
 */
export function sendInitializedVerb(): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: CMI5_VERBS.INITIALIZED,
      display: {
        'en-US': 'initialized',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent initialized statement to LRS', undefined, 'lms');
  });
}

/**
 * Send Terminated verb - Sent when users exit out of a session
 */
export function sendTerminatedVerb(): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: CMI5_VERBS.TERMINATED,
      display: {
        'en-US': 'terminated',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent terminated statement to LRS', undefined, 'lms');
  });
}

/**
 * Send RangeOS Authentication verb - Posts hashed auth token to LRS for verification
 * DevopsAPI can then verify that the user on a particular AU ID is coming
 * from a registered LRS that RangeOS trusts.
 */

// ... existing code ...

// ... existing code ...
export function sendRangeosAuthVerb(): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const auth_endpoint = config.AUTH_URL;
  const hashedAuthToken = sha256(cmi5Instance.getAuthToken()).toString();

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: `${auth_endpoint}/${hashedAuthToken}`,
      display: {
        'en-US': 'rangeos-ok',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent rangeos-ok statement to LRS', undefined, 'lms');
  });
}

/**
 * Send ClassEvent verb - Sent when classroom mode is enabled
 */
export function sendClassEventVerb(classId: string): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.CLASS_EVENT,
      display: {
        'en-US': 'classEvent',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
    result: {
      extensions: {
        'https://rangeos/extensions/classId': classId,
      },
    },
  } as Statement;
  return sendStatement(statement).then(() => {
    logger.debug('Sent classEvent statement to LRS', undefined, 'lms');
  });
}

export function sendLegacySlideViewed(
  slideNumber: number,
  slideName: string,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    id: uuidv4(),
    actor: cmi5Instance.getLaunchParameters().actor,
    context: {
      extensions: cmi5Instance.getLaunchData().contextTemplate.extensions,
      contextActivities:
        cmi5Instance.getLaunchData().contextTemplate.contextActivities,
      registration: cmi5Instance.getLaunchParameters().registration,
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/slide-${slideNumber}`,
    },
    result: {
      extensions: {
        'https://rangeos/verbs/SlideViewed/slide': slideName,
      },
    },
    timestamp: new Date().toISOString(),
    verb: {
      id: RANGEOS_VERBS.SLIDE_VIEWED,
      display: {
        'en-US': 'SlideViewed',
      },
    },
  } as Statement;

  // Fire and forget - return the promise but don't await internally
  return sendStatement(statement).then(() => {
    logger.debug('Sent legacy SlideViewed statement to LRS', undefined, 'lms');
  });
}
/**
 * Send SlideEvent verb - Sent when user navigates to slide, audio completes, or slide is scrolled
 */
export function sendSlideEventVerb(
  slideNumber: number,
  eventType: SlideEventType,
  slideName?: string,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.SLIDE_EVENT,
      display: {
        'en-US': 'slideEvent',
      },
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/slide-${slideNumber}`,
    },
    result: {
      extensions: {
        'https://rangeos/extensions/slideEvent/type': eventType,
        'https://rangeos/extensions/slideEvent/slideNumber': slideNumber,
        ...(slideName && {
          'https://rangeos/extensions/slideEvent/slideName': slideName,
        }),
      },
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent slideEvent statement to LRS', undefined, 'lms');
  });
}

/**
 * Send SlideCompleted verb - Sent when all activities on a slide are complete
 */
export function sendSlideCompletedVerb(
  slideNumber: number,
  slideName?: string,
): Promise<void> {
  logger.debug(
    'sendSlideCompletedVerb called',
    {
      slideNumber,
      slideName,
      cmi5InstanceExists: !!cmi5Instance,
      launchParams: cmi5Instance?.getLaunchParameters(),
      isDevMode: checkForDevMode(),
    },
    'lms',
  );

  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.SLIDE_COMPLETED,
      display: {
        'en-US': 'slideCompleted',
      },
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/slide-${slideNumber}`,
    },
    result: {
      extensions: {
        'https://rangeos/extensions/slideCompleted/slideNumber': slideNumber,
        ...(slideName && {
          'https://rangeos/extensions/slideCompleted/slideName': slideName,
        }),
      },
    },
  } as Statement;
  return sendStatement(statement).then(() => {
    logger.debug('Sent slideCompleted statement to LRS', undefined, 'lms');
  });
}

/**
 * Send SlidePassing verb - Sent when all activities on a slide are complete and passing
 */
export function sendSlidePassingVerb(
  slideNumber: number,
  slideName?: string,
): Promise<void> {
  logger.debug(
    'sendSlidePassingVerb called',
    {
      slideNumber,
      slideName,
      cmi5InstanceExists: !!cmi5Instance,
      launchParams: cmi5Instance?.getLaunchParameters(),
      isDevMode: checkForDevMode(),
    },
    'lms',
  );

  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.SLIDE_PASSING,
      display: {
        'en-US': 'slidePassing',
      },
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/slide-${slideNumber}`,
    },
    result: {
      extensions: {
        'https://rangeos/extensions/slidePassing/slideNumber': slideNumber,
        ...(slideName && {
          'https://rangeos/extensions/slidePassing/slideName': slideName,
        }),
      },
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent slidePassing statement to LRS', undefined, 'lms');
  });
}

/**
 * Send ActivityCompleted verb - Sent when user completes an activity
 */
export function sendActivityCompletedVerb(
  activityId: string,
  activityType: ActivityType,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.ACTIVITY_COMPLETED,
      display: {
        'en-US': 'activityCompleted',
      },
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/activity/${activityId}`,
    },
    result: {
      extensions: {
        'https://rangeos/extensions/activityCompleted/type': activityType,
        ...(metadata && {
          'https://rangeos/extensions/activityCompleted/metadata': metadata,
        }),
      },
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug(
      'Sent activityCompleted statement to LRS',
      activityType,
      'lms',
    );
  });
}

/**
 * Send ActivityPassed verb - Sent when activity meets pass criteria
 */
export function sendActivityPassedVerb(
  activityId: string,
  activityType: ActivityType,
  score?: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  logger.debug(
    'sendActivityPassedVerb DEBUG - Score Analysis',
    {
      activityId,
      activityType,
      rawScoreReceived: score,
      willCalculateScaled: score ? score / 100 : 'no score',
      possibleLMSGradeImpact:
        score === 100 ? 'COULD SET GRADE TO 100%' : 'should not affect grade',
    },
    'lms',
  );

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.ACTIVITY_PASSED,
      display: {
        'en-US': 'activityPassed',
      },
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/activity/${activityId}`,
    },
    result: {
      ...(score && {
        score: { scaled: score / 100, raw: score, min: 0, max: 100 },
      }),
      extensions: {
        'https://rangeos/extensions/activityPassed/type': activityType,
        ...(metadata && {
          'https://rangeos/extensions/activityPassed/metadata': metadata,
        }),
      },
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent activityPassed statement to LRS', undefined, 'lms');
  });
}

/**
 * Send ActivityFailed verb - Sent when activity doesn't meet pass criteria
 */
export function sendActivityFailedVerb(
  activityId: string,
  activityType: ActivityType,
  score?: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.ACTIVITY_FAILED,
      display: {
        'en-US': 'activityFailed',
      },
    },
    object: {
      objectType: 'Activity',
      id: `${cmi5Instance.getLaunchParameters().activityId}/activity/${activityId}`,
    },
    result: {
      ...(score && {
        score: { scaled: score / 100, raw: score, min: 0, max: 100 },
      }),
      extensions: {
        'https://rangeos/extensions/activityFailed/type': activityType,
        ...(metadata && {
          'https://rangeos/extensions/activityFailed/metadata': metadata,
        }),
      },
    },
  } as Statement;

  return sendStatement(statement).then(() => {
    logger.debug('Sent activityFailed statement to LRS', undefined, 'lms');
  });
}

/**
 * Send ScenarioEvent verb - Sent when user opens console, changes copy-paste buffer
 */
// ... existing code ...

export function sendScenarioEventVerb(
  scenarioId: string,
  eventType: string,
  eventData?: Record<string, unknown>,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.SCENARIO_EVENT,
      display: {
        'en-US': 'scenarioEvent',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
    result: {
      extensions: {
        'https://rangeos/extensions/scenarioEvent/scenarioId': scenarioId,
        'https://rangeos/extensions/scenarioEvent/eventType': eventType,
        ...(eventData && {
          'https://rangeos/extensions/scenarioEvent/eventData': eventData,
        }),
      },
    },
  } as Statement;

  // Fire and forget - return the promise but don't await internally
  return sendStatement(statement).then(() => {
    logger.debug('Sent scenarioEvent statement to LRS', undefined, 'lms');
  });
}

// ... existing code ...
/**
 * Calculate average scores from all completed activities in the AU
 */
function calculateAverageScores(
  courseAUProgress: CourseAUProgress,
): SlideActivityScore | null {
  const activityStatuses = Object.values(
    courseAUProgress.progress.activityStatus,
  );
  const activitiesWithScores = activityStatuses.filter(
    (status) => status.completed && status.score,
  );

  if (activitiesWithScores.length === 0) {
    logger.debug(
      'No activities with scores found for AU average calculation',
      undefined,
      'lms',
    );
    return null;
  }

  const totalRaw = activitiesWithScores.reduce(
    (sum, status) => sum + (status.score?.raw || 0),
    0,
  );
  const totalMin = activitiesWithScores.reduce(
    (sum, status) => sum + (status.score?.min || 0),
    0,
  );
  const totalMax = activitiesWithScores.reduce(
    (sum, status) => sum + (status.score?.max || 0),
    0,
  );
  const totalScaled = activitiesWithScores.reduce(
    (sum, status) => sum + (status.score?.scaled || 0),
    0,
  );

  const averageScores = {
    raw: Math.round(totalRaw / activitiesWithScores.length),
    min: Math.round(totalMin / activitiesWithScores.length),
    max: Math.round(totalMax / activitiesWithScores.length),
    scaled: Number((totalScaled / activitiesWithScores.length).toFixed(2)),
  };

  logger.debug(
    'Calculated average scores for AU',
    {
      activitiesWithScores: activitiesWithScores.length,
      totalActivities: activityStatuses.length,
      averageScores,
      individualScores: activitiesWithScores.map((status) => ({
        activityId: status.slideGuid,
        type: status.type,
        score: status.score,
      })),
    },
    'lms',
  );

  return averageScores;
}

/**
 * Send AU Completed verb - Sent when the entire AU is completed
 */
export function sendAuCompleteVerb(): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.AU_COMPLETED,
      display: {
        'en-US': 'auComplete',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
  } as Statement;

  // Fire and forget - return the promise but don't await internally
  return sendStatement(statement).then(() => {
    logger.debug('Sent auComplete statement to LRS', undefined, 'lms');
  });
}

/**
 * Send AU Passed verb - Sent when the entire AU is passed
 */
// ... existing code ...

export function sendAuPassedVerb(
  averageScores?: SlideActivityScore,
): Promise<void> {
  if (checkForDevMode()) {
    return Promise.resolve();
  }

  const statement: Statement = {
    ...createBaseStatement(),
    verb: {
      id: RANGEOS_VERBS.AU_PASSED,
      display: {
        'en-US': 'auPassed',
      },
    },
    object: {
      objectType: 'Activity',
      id: cmi5Instance.getLaunchParameters().activityId,
    },
  } as Statement;

  // Add result field with averaged scores if available

  if (averageScores) {
    (statement as Statement & { result?: unknown }).result = {
      completion: true,
      success: true,
      score: averageScores as ResultScore,
    };
    logger.debug(
      'Added averaged scores to AU passed statement',
      { averageScores },
      'lms',
    );
  }

  // Fire and forget - return the promise but don't await internally
  return sendStatement(statement).then(() => {
    logger.debug('Sent auPassed statement to LRS', undefined, 'lms');
  });
}

// ... existing code ...

// ============================================================================
// PROGRESS MANAGEMENT FUNCTIONS
// ============================================================================

export interface SlideViewedParams {
  slideGuid: string;
  slideName: string;
  slideNumber: number;
  makeProgress?: boolean;
  eventType: SlideEventType;
}

export interface ActivityScoringParams {
  activityData: ActivityScore;
  slideGuid: string | null; // Can be null - function will determine it
  slideIndex: number;
}

/**
 * Handle slide viewed event with all async side effects
 * This replaces the LMSProgressManager.handleSlideViewed() method with a simple function
 */
export async function handleSlideViewed(
  params: SlideViewedParams,
  dispatch: Dispatch,
  getState: () => RootState,
): Promise<void> {
  const { slideGuid, slideName, slideNumber, makeProgress = true } = params;

  logger.debug(
    'LmsStatementManager: Handling slide viewed',
    { slideGuid, slideName, slideNumber, makeProgress },
    'lms',
  );

  try {
    // 1. Get current state from Redux (avoid proxy issues by getting fresh state)
    const currentState = getState();
    const courseAUProgress = currentState.au.courseAUProgress;

    if (!courseAUProgress) {
      logger.error('No courseAUProgress available', undefined, 'lms');
      return;
    }

    logger.debug('handleSlideViewed courseAUProgress', courseAUProgress, 'lms');

    // 2. Create a deep copy of slideStatus to avoid immutable object issues
    // We need to clone the individual SlideStatus objects to make them mutable
    const updatedProgress: CourseAUProgress = {
      ...courseAUProgress,
      progress: {
        ...courseAUProgress.progress,
        slideStatus: Object.fromEntries(
          Object.entries(courseAUProgress.progress.slideStatus).map(
            ([guid, status]) => [
              guid,
              { ...status }, // Clone each individual SlideStatus object
            ],
          ),
        ),
      },
      lastUpdated: new Date().toISOString(),
    };

    logger.debug(
      'after cloned progress, updtaedProgress',
      updatedProgress,
      'lms',
    );

    // 3. Update slide status
    const slideStatus = updatedProgress.progress.slideStatus[slideGuid];
    if (slideStatus) {
      logger.debug('current slideStatus', slideStatus, 'lms');
      // Check if slide was already completed/passed before this update
      const wasAlreadyCompleted = slideStatus.completed;
      //const wasAlreadyPassed = slideStatus.passed;
      const wasAlreadyViewed = slideStatus.viewed;

      slideStatus.viewed = true;
      if (!wasAlreadyViewed) {
        // Send legacy SlideViewed verb for backward compatibility
        try {
          sendLegacySlideViewed(slideNumber, slideName).catch((error) => {
            logger.error(
              'Error sending legacy SlideViewed to LRS',
              { error },
              'lms',
            );
          });

          // Send new SlideEvent verb for enhanced analytics
          sendSlideEventVerb(slideNumber, params.eventType, slideName).catch(
            (error) => {
              logger.error('Error sending slideEvent to LRS', { error }, 'lms');
            },
          );
        } catch (error) {
          logger.error(
            'Error sending slideEvent to LRS',
            { error },
            'auManager',
          );
        }
      }

      const statusChanges = getSlideChangedStatus(updatedProgress, slideGuid);

      logger.debug(
        'Status changes details',
        {
          statusChanges: statusChanges,
          updatedProgress: updatedProgress,
        },
        'lms',
      );

      // Determine if we should save progress to LRS based on status changes
      const shouldSaveToLRS =
        statusChanges?.isNowCompleted || // Slide just completed (includes slides with no activities)
        statusChanges?.isNowPassed || // Slide just passed
        makeProgress; // Explicit progress update requested

      if (shouldSaveToLRS) {
        logger.debug(
          'Will save progress to LRS due to significant event',
          {
            slideGuid,
            slideNumber,
            justCompleted: statusChanges?.isNowCompleted,
            justPassed: statusChanges?.isNowPassed,
            makeProgress,
          },
          'lms',
        );

        saveCourseAUProgressToLRS(updatedProgress).catch((error: any) => {
          logger.error('Error saving CourseAUProgress to LRS', error, 'lms');
        });
      } else {
        logger.debug(
          'Will skip LRS save - no significant progress change',
          { slideGuid, slideNumber },
          'lms',
        );
      }

      // 4. Calculate progress if slide status changed
      if (makeProgress || !wasAlreadyCompleted) {
        // Recalculate progress because either:
        // - makeProgress is true (forced recalculation), OR
        // - Slide wasn't completed before (status changed)

        const newProgress = calculateProgressPercentage(updatedProgress);
        updatedProgress.progress.auProgress = newProgress;

        // Only calculate completion status if progress changed significantly
        if (Math.abs(newProgress - courseAUProgress.progress.auProgress) > 0) {
          // Store previous AU completion status to detect transitions
          const wasAuCompleted = courseAUProgress.progress.auCompleted;
          const wasAuPassed = courseAUProgress.progress.auPassed;

          updatedProgress.progress.auCompleted =
            isAUCompletedCheck(updatedProgress);

          updatedProgress.progress.auPassed = isAUPassed(updatedProgress);
        } else {
          // Keep existing values to avoid unnecessary calculations
          updatedProgress.progress.auCompleted =
            courseAUProgress.progress.auCompleted;
          updatedProgress.progress.auPassed =
            courseAUProgress.progress.auPassed;
        }
      } else {
        logger.debug(
          'Skipping progress recalculation - slide already completed',
          { slideGuid, wasAlreadyCompleted, makeProgress },
          'auManager',
        );
      }

      // 5. Check for slide completion and passing transitions
      if (statusChanges) {
        // Check for slide completion transition
        if (!statusChanges.wasCompleted && statusChanges.isNowCompleted) {
          logger.info(
            'Slide just completed (via viewing) - important milestone',
            {
              slideGuid,
              slideNumber,
              wasCompleted: statusChanges.wasCompleted,
              nowCompleted: statusChanges.isNowCompleted,
            },
            'lms',
          );
        }

        // Check for slide passing transition and send appropriate xAPI verb
        if (!statusChanges.wasPassed && statusChanges.isNowPassed) {
          // Slide just passed - send slidePassed verb
          logger.debug(
            'handleSlideViewed:Slide just passed - sending slidePassed verb',
            {
              slideGuid,
              wasPassed: statusChanges.wasPassed,
              nowPassed: statusChanges.isNowPassed,
              wasCompleted: statusChanges.wasCompleted,
              nowCompleted: statusChanges.isNowCompleted,
            },
            'lms',
          );

          sendSlideCompletedVerb(slideNumber).catch((error) => {
            logger.error('Error sending slidePassed verb', error, 'lms');
          });

          // Save progress to LRS
          saveCourseAUProgressToLRS(updatedProgress).catch((error: any) => {
            logger.error('Error saving CourseAUProgress to LRS', error, 'lms');
          });

          handleAuLMSProgress(
            makeProgress,
            updatedProgress.progress.auProgress,
            updatedProgress.progress.auCompleted,
            updatedProgress.progress.auPassed,
            updatedProgress,
          ).catch((error) => {
            logger.error('Error in async progress operations', error, 'lms');
          });
        }
      } else {
        console.log('slideStatus not found for slideGuid', slideGuid);
      }

      // 5. Update timestamp
      updatedProgress.lastUpdated = new Date().toISOString();

      // 6. Dispatch the synchronous state update FIRST
      dispatch(setCourseAUProgress(updatedProgress));
    }

    // 8. Run async operations sequentially
  } catch (error) {
    logger.error('Error in handleSlideViewed', error, 'lms');
  }
}

/**
 * Run async operations for slide viewed (sequential)
 */
async function handleAuLMSProgress(
  makeProgress: boolean,
  progressPercentage: number,
  auCompleted: boolean,
  auPassed: boolean,
  courseAUProgress?: CourseAUProgress,
): Promise<void> {
  try {
    // Skip async operations in dev mode
    if (checkForDevMode()) {
      logger.debug(
        'Dev mode: Skipping async slide viewed operations',
        undefined,
        'lms',
      );
      return;
    }

    if (makeProgress) {
      try {
        await cmi5Instance.progress(progressPercentage);

        logger.debug(
          'Progress sent to LMS successfully',
          { progressPercentage },
          'lms',
        );
      } catch (error) {
        logger.error(
          'Failed to send progress to LMS',
          { error, progressPercentage },
          'lms',
        );
      }

      if (courseAUProgress && (auPassed || auCompleted)) {
        const averageScores = calculateAverageScores(courseAUProgress);
        const moveOn =
          courseAUProgress.courseStructure.moveOn || 'CompletedOrPassed';

        logger.debug(
          'handleAuLMSProgress moveOn decision',
          {
            moveOn,
            auCompleted,
            auPassed,
            hasAverageScores: !!averageScores,
          },
          'lms',
        );

        switch (moveOn) {
          case 'Passed': {
            await sendAuPassedVerb(averageScores || undefined).catch(
              (error) => {
                logger.error('Error sending AU passed verb', error, 'lms');
              },
            );
            if (averageScores) {
              cmi5Instance.pass(averageScores as ResultScore);
            } else {
              cmi5Instance.pass();
            }
            break;
          }
          case 'Completed': {
            await sendAuCompleteVerb().catch((error) => {
              logger.error('Error sending AU completed verb', error, 'lms');
            });
            cmi5Instance.complete();
            break;
          }
          case 'CompletedAndPassed': {
            // Must send both verbs
            await sendAuCompleteVerb().catch((error) => {
              logger.error('Error sending AU completed verb', error, 'lms');
            });
            cmi5Instance.complete();

            await sendAuPassedVerb(averageScores || undefined).catch(
              (error) => {
                logger.error('Error sending AU passed verb', error, 'lms');
              },
            );
            if (averageScores) {
              cmi5Instance.pass(averageScores as ResultScore);
            } else {
              cmi5Instance.pass();
            }
            break;
          }
          case 'NotApplicable': {
            // Consider satisfied as soon as we enter; prefer sending Completed
            await sendAuCompleteVerb().catch((error) => {
              logger.error('Error sending AU completed verb', error, 'lms');
            });
            cmi5Instance.complete();
            break;
          }
          case 'CompletedOrPassed':
          default: {
            // If we have scores (implying a notion of success), send Passed; else Completed
            if (averageScores) {
              await sendAuPassedVerb(averageScores).catch((error) => {
                logger.error('Error sending AU passed verb', error, 'lms');
              });
              cmi5Instance.pass(averageScores as ResultScore);
            } else {
              await sendAuCompleteVerb().catch((error) => {
                logger.error('Error sending AU completed verb', error, 'lms');
              });
              cmi5Instance.complete();
            }
            break;
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error in slide viewed async operations', error, 'lms');
  }
}

/**
 * Handle activity scoring with all async side effects
 * This replaces the old submitActivityScore/completeActivityScore pattern with a simple function
 */
export async function handleActivityScoring(
  params: ActivityScoringParams,
  dispatch: Dispatch,
  getState: () => RootState,
): Promise<void> {
  const { activityData, slideIndex } = params;
  let { slideGuid } = params;

  logger.debug(
    'LmsStatementManager: Handling activity scoring',
    { activityType: activityData.activityType, slideGuid, slideIndex },
    'lms',
  );

  const currentState = getState();
  const courseAUProgress = currentState.au.courseAUProgress;

  if (!courseAUProgress) {
    logger.error(
      'No courseAUProgress available for activity completion',
      undefined,
      'lms',
    );
    return;
  }
  const activityId = getActivityId(activityData.activityContent);

  // Resolve slideGuid if not provided - use courseAUProgress as source of truth
  // TODO: this was originally super defensive during prototyping to handle edge cases...update to agreed slideGuid logic
  if (!slideGuid) {
    // First, try to find the slide by searching for the activityId in slideActivities
    // But if there are multiple activities with the same ID, use slideIndex as a hint
    if (courseAUProgress) {
      const matchingSlides: string[] = [];

      // Find all slides that contain this activityId
      for (const [searchSlideGuid, activities] of Object.entries(
        courseAUProgress.slideActivitiesMeta,
      )) {
        if (activities[activityId]) {
          matchingSlides.push(searchSlideGuid);
        }
      }

      if (matchingSlides.length === 1) {
        // Only one match - use it
        slideGuid = matchingSlides[0];
        logger.debug(
          'Resolved slideGuid by searching for activityId (single match)',
          { activityId, resolvedSlideGuid: slideGuid },
          'lms',
        );
      } else if (matchingSlides.length > 1) {
        // Multiple matches - try to use slideIndex as a hint
        logger.warn(
          'Multiple slides found with same activityId - using slideIndex as hint',
          { activityId, matchingSlides, slideIndex },
          'lms',
        );

        // Try to find a slide that matches the expected slideIndex
        const expectedSlideGuid =
          courseAUProgress.courseStructure.slides[slideIndex]?.slideGuid;
        if (expectedSlideGuid && matchingSlides.includes(expectedSlideGuid)) {
          slideGuid = expectedSlideGuid;
          logger.debug(
            'Resolved slideGuid using slideIndex hint',
            { activityId, slideIndex, resolvedSlideGuid: slideGuid },
            'lms',
          );
        } else {
          // Fallback to first match
          slideGuid = matchingSlides[0];
          logger.warn(
            'Could not resolve slideGuid with slideIndex hint - using first match',
            {
              activityId,
              slideIndex,
              expectedSlideGuid,
              resolvedSlideGuid: slideGuid,
            },
            'lms',
          );
        }
      }
    }

    // Fallback to slideIndex if activityId search fails
    if (
      !slideGuid &&
      courseAUProgress &&
      courseAUProgress.courseStructure.slides[slideIndex]
    ) {
      slideGuid = courseAUProgress.courseStructure.slides[slideIndex].slideGuid;
      logger.debug(
        'Resolved slideGuid from courseAUProgress (fallback)',
        {
          slideIndex,
          resolvedSlideGuid: slideGuid,
          allSlides: courseAUProgress.courseStructure.slides.map((s, i) => ({
            index: i,
            slideGuid: s.slideGuid,
            slideTitle: s.slideTitle,
          })),
          requestedSlideIndex: slideIndex,
        },
        'lms',
      );
    }

    // Final fallback
    if (!slideGuid) {
      slideGuid = `slide-${slideIndex}`;
      logger.warn(
        'Could not resolve slideGuid - using fallback',
        { slideIndex, fallbackSlideGuid: slideGuid },
        'lms',
      );
    }
  }

  try {
    // Extract activity ID based on content type using the helper function
    const activityId = getActivityId(activityData.activityContent);
    const activityType: ActivityType = getActivityTypeFromDisplayName(
      activityData.activityType,
    ) as ActivityType;

    logger.debug(
      'Activity scoring - extracting IDs',
      {
        activityId,
        activityType,
        slideGuid,
        slideIndex,
        cmi5QuizId: activityId,
        activityContent: activityData.activityContent,
        scoreDataType: typeof activityData.scoreData,
      },
      'lms',
    );

    // TODO: separate this calculation to own function (ie getSlideActivityScore)
    let calculatedScore: SlideActivityScore;

    let passingScore: number;

    if (activityType === SlideActivityType.JOBE) {
      // For Jobe activities, the scoring is binary (pass/fail based on success)
      const jobeResponse = activityData.scoreData as {
        isSuccess: boolean;
        message: string;
      };
      const isSuccess = jobeResponse?.isSuccess || false;

      calculatedScore = createSlideActivityScore(isSuccess ? 100 : 0, 0, 100);

      // Jobe activities pass if they succeed (no configurable passing score)
      passingScore = 100; // Must be 100% successful to pass

      logger.debug(
        'Jobe activity scoring',
        {
          isSuccess,
          calculatedScore,
          jobeResponse,
        },
        'lms',
      );
    } else if (
      activityType === SlideActivityType.SCENARIO ||
      activityType === SlideActivityType.CONSOLES
    ) {
      // For Scenario activities, the scoring is based on completed AutoGrader tasks
      const scenarioResponse = activityData.scoreData as {
        completedTasks: number;
        totalTasks: number;
        allCompleted: boolean;
        autoGraderResults: any[];
      };
      let completedTasks = scenarioResponse?.completedTasks || 0;
      let totalTasks = scenarioResponse?.totalTasks || 1;
      const allCompleted = scenarioResponse?.allCompleted || false;

      // if there are no autograders  but allCompleted is true, set totalTasks to 1 and completedTasks to 1
      // we are using that to handle the case where there are no autograders
      if (scenarioResponse?.autoGraderResults?.length === 0 && allCompleted) {
        totalTasks = 1;
        completedTasks = 1;
      }

      const completionPercentage =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      calculatedScore = {
        raw: completionPercentage,
        min: 0,
        max: 100,
        scaled: completionPercentage / 100,
      };

      calculatedScore = createSlideActivityScore(completionPercentage, 0, 100);

      // Scenario activities pass when all AutoGrader tasks are completed
      passingScore = 100; // Must complete all AutoGrader tasks to pass

      logger.debug(
        'Scenario activity scoring',
        {
          completedTasks,
          totalTasks,
          allCompleted,
          completionPercentage,
          calculatedScore,
          scenarioResponse,
        },
        'lms',
      );
    } else {
      // For Quiz/CTF activities, use the existing scoring logic
      const quizScore = calculateQuizScore(
        activityData.activityContent,
        activityData.scoreData,
      );

      calculatedScore = createSlideActivityScore(
        quizScore.raw,
        quizScore.min,
        quizScore.max,
      );

      // Get passing score from activity content if available
      passingScore =
        (activityData.activityContent as { passingScore?: number })
          ?.passingScore || 70;

      logger.debug('Quiz/CTF activity scoring', { calculatedScore }, 'lms');
    }

    // Grade the activity (and handle any activity* xAPI Statements)
    const result = await gradeActivity(
      activityId,
      slideIndex,
      slideGuid,
      activityType,
      calculatedScore,
      passingScore,
      { originalData: activityData, calculatedScore },
      courseAUProgress,
    );

    logger.debug('Activity graded successfully', { result }, 'lms');

    logger.debug(
      'LmsStatementManager: courseAUProgress structure',
      {
        hasSlideActivities: !!courseAUProgress.slideActivitiesMeta,
        slideActivitiesKeys: Object.keys(courseAUProgress.slideActivitiesMeta),
        hasSlideStatus: !!courseAUProgress.progress.slideStatus,
        slideStatusKeys: Object.keys(courseAUProgress.progress.slideStatus),
        requestedSlideGuid: slideGuid,
        courseStructureSlides: courseAUProgress.courseStructure.slides.map(
          (s) => ({
            slideGuid: s.slideGuid,
            slideIndex: s.slideIndex,
            slideTitle: s.slideTitle,
          }),
        ),
      },
      'lms',
    );

    // handle sending activity interaction statements
    // Run async LMS/LRS operations
    // TODO: this is essentially blocking main thread while these are sent. Either we put up some display to user like
    // 'Saving User Interactions' or move this to be async and non-blocking.
    if (activityType === SlideActivityType.JOBE) {
      await handleJobeInteractionStatements(
        activityData,
        slideGuid,
        slideIndex,
        result,
        calculatedScore,
      );
    } else if (activityType === SlideActivityType.SCENARIO) {
      await handleScenarioInteractionStatements(
        activityData,
        slideGuid,
        slideIndex,
        result,
        calculatedScore,
      );
    } else {
      await handleQuizInteractionStatements(
        activityData,
        slideGuid,
        slideIndex,
        result,
        calculatedScore,
      );
    }

    // Get fresh state since activity state likely updated and need that for slide status updates
    let updatedProgress: CourseAUProgress;

    try {
      const updatedState = getState();
      updatedProgress = JSON.parse(
        JSON.stringify(updatedState.au.courseAUProgress),
      );
    } catch (error) {
      logger.error(
        'Error getting updated progress state  completed activity',
        error,
        'lms',
      );
      return;
    }
    // If it's missing, log an error - this indicates a bug in course compilation
    if (!updatedProgress.slideActivitiesMeta[slideGuid]?.[activityId]) {
      console.log(
        'updatedProgress data',
        updatedProgress.slideActivitiesMeta[slideGuid],
      );
      logger.error(
        'Activity metadata not found - this indicates a bug in course compilation or initialization',
        {
          slideGuid,
          activityId,
          activityType,
          availableSlides: Object.keys(updatedProgress.slideActivitiesMeta),
          slideActivities:
            updatedProgress.slideActivitiesMeta[slideGuid] || 'NO_SLIDE_ENTRY',
        },
        'lms',
      );

      return;
    }

    // Ensure slide status exists
    if (!updatedProgress.progress.slideStatus[slideGuid]) {
      logger.warn(
        'Slide status not found - creating entry',
        { slideGuid },
        'lms',
      );
      updatedProgress.progress.slideStatus[slideGuid] = {
        viewed: false,
        audioCompleted: false,
        scrolledToBottom: false,
        completed: false,
        passed: false,
        failed: false,
      };
    }

    // Get slide change status to detect if slide status has changed
    const statusChanges = getSlideChangedStatus(updatedProgress, slideGuid);

    // Check for slide completion and trigger events AFTER updating slide status
    await updateSlideStatus(
      updatedProgress,
      slideGuid,
      slideIndex,
      statusChanges,
    );

    // Debug: Log what statusChanges returned
    logger.debug(
      'Status changes from updateSlideStatus',
      {
        slideGuid,
        statusChanges,
        wasPassed: statusChanges?.wasPassed,
        isNowPassed: statusChanges?.isNowPassed,
        wasCompleted: statusChanges?.wasCompleted,
        isNowCompleted: statusChanges?.isNowCompleted,
      },
      'lms',
    );

    // Check for slide passing transition and send appropriate xAPI verb
    if (
      statusChanges &&
      !statusChanges.wasPassed &&
      statusChanges.isNowPassed
    ) {
      // Slide just passed - send slidePassed verb
      logger.debug(
        'Slide just passed - sending slidePassed verb',
        {
          slideGuid,
          wasPassed: statusChanges.wasPassed,
          nowPassed: statusChanges.isNowPassed,
          wasCompleted: statusChanges.wasCompleted,
          nowCompleted: statusChanges.isNowCompleted,
        },
        'lms',
      );

      // Send slidePassed verb asynchronously
      sendSlidePassingVerb(slideIndex).catch((error) => {
        logger.error('Error sending slidePassed verb', error, 'lms');
      });
    }

    // Log slide status for debugging
    logger.debug(
      'Activity completed - checking slide status',
      {
        activityId,
        slideGuid,
        slideIndex,
        slideStatus: updatedProgress.progress.slideStatus[slideGuid],
        statusChanges,
        allSlideGuids: Object.keys(updatedProgress.progress.slideStatus),
        allSlideActivities: Object.keys(updatedProgress.slideActivitiesMeta),
        slideActivities: Object.keys(
          updatedProgress.slideActivitiesMeta[slideGuid] || {},
        ),
        allActivityStatuses: Object.keys(
          updatedProgress.slideActivitiesMeta[slideGuid] || {},
        ).map((id) => ({
          id,
          completed: updatedProgress.progress.activityStatus[id]?.completed,
          passed: updatedProgress.progress.activityStatus[id]?.passed,
        })),
        // Enhanced debugging
        doesSlideExistInActivities: Object.prototype.hasOwnProperty.call(
          updatedProgress.slideActivitiesMeta,
          slideGuid,
        ),
        doesSlideExistInStatus: Object.prototype.hasOwnProperty.call(
          updatedProgress.progress.slideStatus,
          slideGuid,
        ),
        courseStructureSlides: updatedProgress.courseStructure.slides.map(
          (s) => ({
            slideGuid: s.slideGuid,
            slideIndex: s.slideIndex,
            slideTitle: s.slideTitle,
          }),
        ),
      },
      'lms',
    );

    // Update AU completion status after slide completion check
    // Store previous AU completion status to detect transitions
    const wasAuCompleted = courseAUProgress.progress.auCompleted;
    const wasAuPassed = courseAUProgress.progress.auPassed;

    // Always recalculate AU progress after slide status changes
    const newProgress = calculateProgressPercentage(updatedProgress);
    updatedProgress.progress.auProgress = newProgress;

    updatedProgress.progress.auCompleted = isAUCompletedCheck(updatedProgress);
    updatedProgress.progress.auPassed = isAUPassed(updatedProgress);

    updatedProgress.lastUpdated = new Date().toISOString();

    // Dispatch the final state update
    dispatch(setCourseAUProgress(updatedProgress));

    // Save progress to LRS asynchronously (non-blocking)
    saveCourseAUProgressToLRS(updatedProgress).catch((error: any) => {
      logger.error(
        'Error saving CourseAUProgress to LRS after activity completion',
        error,
        'lms',
      );
    });

    // Also update legacy auProgress in au slice for backward compatibility
    dispatch(setAuProgress(updatedProgress.progress.auProgress));

    // Send progress to LMS if it was updated
    if (
      updatedProgress.progress.auProgress !==
      courseAUProgress.progress.auProgress
    ) {
      try {
        await handleAuLMSProgress(
          true, // makeProgress - always update progress after activity completion
          updatedProgress.progress.auProgress,
          updatedProgress.progress.auCompleted,
          updatedProgress.progress.auPassed,
          updatedProgress,
        );

        logger.debug(
          'Progress sent to LMS after activity completion',
          { progress: updatedProgress.progress.auProgress },
          'lms',
        );
      } catch (error) {
        logger.error(
          'Failed to send progress to LMS after activity completion',
          { error, progress: updatedProgress.progress.auProgress },
          'lms',
        );
      }
    }
  } catch (error) {
    logger.error('Error in handleActivityScoring', error, 'lms');
  }
}

/**
 * Run async operations for activity scoring (sequential)
 */
async function handleQuizInteractionStatements(
  activityData: ActivityScore,
  slideGuid: string,
  slideIndex: number,
  result: {
    completed: boolean;
    passed: boolean;
    score?: SlideActivityScore;
  },
  calculatedScore: { raw: number; min: number; max: number; scaled?: number },
): Promise<void> {
  try {
    // Skip async operations in dev mode
    if (checkForDevMode()) {
      logger.debug(
        'Dev mode: Skipping async activity scoring operations',
        undefined,
        'lms',
      );
      return;
    }

    // 1. Send detailed interaction statements
    try {
      await sendDetailedInteractionStatements(
        activityData.activityContent,
        activityData.scoreData,
      );
      logger.debug(
        'Detailed interaction statements sent successfully',
        undefined,
        'lms',
      );
    } catch (error) {
      logger.error(
        'Failed to send detailed interaction statements',
        { error },
        'lms',
      );
    }

    // 2. Additional activity-specific LRS/LMS operations can be added here
    logger.debug(
      'Activity scoring async operations completed',
      {
        activityId: getActivityId(activityData.activityContent),
        slideGuid,
        slideIndex,
        passed: result.passed,
        score: result.score || { raw: 0, min: 0, max: 100, scaled: 0 },
      },
      'lms',
    );
  } catch (error) {
    logger.error('Error in quiz scored LMS operations', error, 'lms');
  }
}

/**
 * Run async operations for Jobe activity scoring (sequential)
 */
async function handleJobeInteractionStatements(
  activityData: ActivityScore,
  slideGuid: string,
  slideIndex: number,
  result: {
    completed: boolean;
    passed: boolean;
    score?: SlideActivityScore;
  },
  calculatedScore: { raw: number; min: number; max: number; scaled?: number },
): Promise<void> {
  try {
    // Skip async operations in dev mode
    if (checkForDevMode()) {
      logger.debug(
        'Dev mode: Skipping async Jobe activity scoring operations',
        undefined,
        'lms',
      );
      return;
    }

    // For Jobe activities, we don't have detailed interaction statements like quiz questions
    // Instead, we can log the submission and result
    logger.debug(
      'Jobe activity scoring async operations completed',
      {
        activityId: getActivityId(activityData.activityContent),
        slideGuid,
        slideIndex,
        passed: result.passed,
        score: result.score || { raw: 0, min: 0, max: 100, scaled: 0 },
        jobeResponse: activityData.scoreData,
      },
      'lms',
    );

    // Additional Jobe-specific LRS operations can be added here if needed
    // For example: logging code submission, execution results, etc.
  } catch (error) {
    logger.error('Error in Jobe activity scored LMS operations', error, 'lms');
  }
}

/**
 * Run async operations for Scenario activity scoring (sequential)
 */
async function handleScenarioInteractionStatements(
  activityData: ActivityScore,
  slideGuid: string,
  slideIndex: number,
  result: {
    completed: boolean;
    passed: boolean;
    score?: SlideActivityScore;
  },
  calculatedScore: { raw: number; min: number; max: number; scaled?: number },
): Promise<void> {
  try {
    // Skip async operations in dev mode
    if (checkForDevMode()) {
      logger.debug(
        'Dev mode: Skipping async Scenario activity scoring operations',
        undefined,
        'lms',
      );
      return;
    }

    // For Scenario activities, we can log AutoGrader completion details
    const scenarioResponse = activityData.scoreData as {
      completedTasks: number;
      totalTasks: number;
      allCompleted: boolean;
      autoGraderResults: any[];
    };

    logger.debug(
      'Scenario activity scoring async operations completed',
      {
        activityId: getActivityId(activityData.activityContent),
        slideGuid,
        slideIndex,
        passed: result.passed,
        score: result.score || { raw: 0, min: 0, max: 100, scaled: 0 },
        scenarioResponse,
        completedTasks: scenarioResponse?.completedTasks || 0,
        totalTasks: scenarioResponse?.totalTasks || 0,
      },
      'lms',
    );

    // Additional Scenario-specific LRS operations can be added here if needed
    // For example: logging individual AutoGrader task completions, performance metrics, etc.
  } catch (error) {
    logger.error(
      'Error in Scenario activity scored LMS operations',
      error,
      'lms',
    );
  }
}
