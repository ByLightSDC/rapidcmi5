import { Dispatch } from '@reduxjs/toolkit';
import {
  ActivityScore,
  ActivityType,
  getActivityTypeFromDisplayName,
  SlideActivityScore,
  SlideActivityType,
} from '@rapid-cmi5/cmi5-build-common';
import { config } from '@rapid-cmi5/ui';
import { ResultScore, Statement } from '@xapi/xapi';
import sha256 from 'crypto-js/sha256';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../debug';
import { setAuProgress, setCourseAUProgress } from '../redux/auReducer';
import {
  queueProgressToast,
  setUnitResult,
} from '../redux/progressNotificationReducer';
import { RootState } from '../redux/store';
import { cmi5Instance } from '../session/cmi5';
import { CourseAUProgress, SlideStatus } from '../types/CourseAUProgress';
import { SlideChangedStatus } from '../types/SlideState';
import { shouldReportAuProgress } from './AuProgressTransition';
import {
  calculateQuizScore,
  sendDetailedInteractionStatements,
} from './Cmi5Helpers';
import {
  calculateProgressPercentage,
  getSlideChangedStatus,
  isAUCompletedCheck,
  isAUPassed,
  saveCourseAUProgressToLRS,
  updateSlideStatus,
} from './CourseAUProgressHelpers';
import { checkForDevMode } from './DevMode';
import { createSlideActivityScore, gradeActivity } from './gradeActivity';
import {
  buildActivityToast,
  buildUnitResult,
  getActivityTitle,
} from './ProgressNotifications';

export type SlideEventType =
  | 'navigation'
  | 'scroll_complete'
  | 'audio_play'
  | 'audio_pause'
  | 'audio_complete'
  | 'audio_progress_25'
  | 'audio_progress_50'
  | 'audio_progress_75'
  | 'video_play'
  | 'video_pause'
  | 'video_complete'
  | 'video_progress_25'
  | 'video_progress_50'
  | 'video_progress_75'
  | 'video_fullscreen_enter'
  | 'video_fullscreen_exit';

export interface SlideViewedParams {
  slideGuid: string;
  slideName: string;
  slideNumber: number;
  makeProgress?: boolean;
  eventType: SlideEventType;
}

export interface ActivityScoringParams {
  activityData: ActivityScore;
  slideGuid: string | null;
  slideIndex: number;
}

export const CMI5_VERBS = {
  LAUNCHED: 'http://adlnet.gov/expapi/verbs/launched',
  INITIALIZED: 'http://adlnet.gov/expapi/verbs/initialized',
  PASSED: 'http://adlnet.gov/expapi/verbs/passed',
  COMPLETED: 'http://adlnet.gov/expapi/verbs/completed',
  TERMINATED: 'http://adlnet.gov/expapi/verbs/terminated',
} as const;

export const XAPI_VERBS = {
  PROGRESS: 'http://adlnet.gov/expapi/verbs/progressed',
  ANSWERED: 'http://adlnet.gov/expapi/verbs/answered',
} as const;

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
  SLIDE_VIEWED: 'https://rangeos/verbs/SlideViewed',
  RANGEOS_OK: 'rangeos-ok',
} as const;

type StatementResult = Statement['result'];
type ActivityIdentifiers = {
  cmi5QuizId?: string;
  uuid?: string;
  scenarioUUID?: string;
  name?: string;
  scenarioName?: string;
};

type AuSnapshot = {
  progress: number;
  completed: boolean;
  passed: boolean;
};

const emptySlideStatus = (): SlideStatus => ({
  viewed: false,
  audioCompleted: false,
  scrolledToBottom: false,
  completed: false,
  passed: false,
  failed: false,
});

function getActivityId(activityContent: unknown): string {
  const content = activityContent as ActivityIdentifiers;
  return (
    content.cmi5QuizId ||
    content.uuid ||
    content.scenarioUUID ||
    content.name ||
    content.scenarioName ||
    SlideActivityType.UNKNOWN
  );
}

function getLaunchActivityId(): string {
  return cmi5Instance.getLaunchParameters().activityId;
}

function createBaseStatement(): Partial<Statement> {
  const launchParameters = cmi5Instance.getLaunchParameters();
  const contextTemplate = cmi5Instance.getLaunchData().contextTemplate;

  return {
    id: uuidv4(),
    actor: launchParameters.actor,
    context: {
      registration: launchParameters.registration,
      extensions: contextTemplate.extensions,
      contextActivities: contextTemplate.contextActivities,
    },
    timestamp: new Date().toISOString(),
  };
}

async function sendStatement(statement: Statement): Promise<void> {
  if (checkForDevMode()) return;

  const xapi = cmi5Instance.xapi;
  if (!xapi) throw new Error('XAPI is null - cannot send statement');

  try {
    await xapi.sendStatement({ statement: statement as any });
  } catch (error) {
    logger.error('Error sending LRS statement', error, 'lms');
    throw error;
  }
}

function sendVerb(
  verbId: string,
  display: string,
  objectId?: string | (() => string),
  result?: StatementResult,
): Promise<void> {
  if (checkForDevMode()) return Promise.resolve();
  const resolvedObjectId =
    typeof objectId === 'function'
      ? objectId()
      : objectId || getLaunchActivityId();

  return sendStatement({
    ...createBaseStatement(),
    verb: { id: verbId, display: { 'en-US': display } },
    object: { objectType: 'Activity', id: resolvedObjectId },
    ...(result && { result }),
  } as Statement);
}

function slideActivityId(slideNumber: number): string {
  return `${getLaunchActivityId()}/slide-${slideNumber}`;
}

function activityObjectId(activityId: string): string {
  return `${getLaunchActivityId()}/activity/${activityId}`;
}

function scoreResult(score?: number): Partial<StatementResult> {
  // 0 is a meaningful score (a failed codeRunner or an ungraded scenario), so
  // check for absence rather than falsiness.
  return score === undefined
    ? {}
    : { score: { scaled: score / 100, raw: score, min: 0, max: 100 } };
}

export function sendInitializedVerb(): Promise<void> {
  return sendVerb(CMI5_VERBS.INITIALIZED, 'initialized');
}

export function sendTerminatedVerb(): Promise<void> {
  return sendVerb(CMI5_VERBS.TERMINATED, 'terminated');
}

export function sendRangeosAuthVerb(): Promise<void> {
  if (checkForDevMode()) return Promise.resolve();
  const hashedToken = sha256(cmi5Instance.getAuthToken()).toString();
  return sendVerb(
    `${config.AUTH_URL}/${hashedToken}`,
    RANGEOS_VERBS.RANGEOS_OK,
  );
}

export function sendClassEventVerb(classId: string): Promise<void> {
  return sendVerb(RANGEOS_VERBS.CLASS_EVENT, 'classEvent', undefined, {
    extensions: { 'https://rangeos/extensions/classId': classId },
  });
}

export function sendLegacySlideViewed(
  slideNumber: number,
  slideName: string,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.SLIDE_VIEWED,
    'SlideViewed',
    () => slideActivityId(slideNumber),
    {
      extensions: {
        'https://rangeos/verbs/SlideViewed/slide': slideName,
      },
    },
  );
}

export function sendSlideEventVerb(
  slideNumber: number,
  eventType: SlideEventType,
  slideName?: string,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.SLIDE_EVENT,
    'slideEvent',
    () => slideActivityId(slideNumber),
    {
      extensions: {
        'https://rangeos/extensions/slideEvent/type': eventType,
        'https://rangeos/extensions/slideEvent/slideNumber': slideNumber,
        ...(slideName && {
          'https://rangeos/extensions/slideEvent/slideName': slideName,
        }),
      },
    },
  );
}

export function sendSlideCompletedVerb(
  slideNumber: number,
  slideName?: string,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.SLIDE_COMPLETED,
    'slideCompleted',
    () => slideActivityId(slideNumber),
    {
      extensions: {
        'https://rangeos/extensions/slideCompleted/slideNumber': slideNumber,
        ...(slideName && {
          'https://rangeos/extensions/slideCompleted/slideName': slideName,
        }),
      },
    },
  );
}

export function sendSlidePassingVerb(
  slideNumber: number,
  slideName?: string,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.SLIDE_PASSING,
    'slidePassing',
    () => slideActivityId(slideNumber),
    {
      extensions: {
        'https://rangeos/extensions/slidePassing/slideNumber': slideNumber,
        ...(slideName && {
          'https://rangeos/extensions/slidePassing/slideName': slideName,
        }),
      },
    },
  );
}

export function sendActivityCompletedVerb(
  activityId: string,
  activityType: ActivityType,
  metadata?: Record<string, unknown>,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.ACTIVITY_COMPLETED,
    'activityCompleted',
    () => activityObjectId(activityId),
    {
      extensions: {
        'https://rangeos/extensions/activityCompleted/type': activityType,
        ...(metadata && {
          'https://rangeos/extensions/activityCompleted/metadata': metadata,
        }),
      },
    },
  );
}

export function sendActivityPassedVerb(
  activityId: string,
  activityType: ActivityType,
  score?: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.ACTIVITY_PASSED,
    'activityPassed',
    () => activityObjectId(activityId),
    {
      ...scoreResult(score),
      extensions: {
        'https://rangeos/extensions/activityPassed/type': activityType,
        ...(metadata && {
          'https://rangeos/extensions/activityPassed/metadata': metadata,
        }),
      },
    },
  );
}

export function sendActivityFailedVerb(
  activityId: string,
  activityType: ActivityType,
  score?: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.ACTIVITY_FAILED,
    'activityFailed',
    () => activityObjectId(activityId),
    {
      ...scoreResult(score),
      extensions: {
        'https://rangeos/extensions/activityFailed/type': activityType,
        ...(metadata && {
          'https://rangeos/extensions/activityFailed/metadata': metadata,
        }),
      },
    },
  );
}

export function sendScenarioEventVerb(
  scenarioId: string,
  eventType: string,
  eventData?: Record<string, unknown>,
): Promise<void> {
  return sendVerb(RANGEOS_VERBS.SCENARIO_EVENT, 'scenarioEvent', undefined, {
    extensions: {
      'https://rangeos/extensions/scenarioEvent/scenarioId': scenarioId,
      'https://rangeos/extensions/scenarioEvent/eventType': eventType,
      ...(eventData && {
        'https://rangeos/extensions/scenarioEvent/eventData': eventData,
      }),
    },
  });
}

export function sendAuCompleteVerb(): Promise<void> {
  return sendVerb(RANGEOS_VERBS.AU_COMPLETED, 'auComplete');
}

export function sendAuPassedVerb(
  averageScores?: SlideActivityScore,
): Promise<void> {
  return sendVerb(
    RANGEOS_VERBS.AU_PASSED,
    'auPassed',
    undefined,
    averageScores
      ? {
          completion: true,
          success: true,
          score: averageScores as ResultScore,
        }
      : undefined,
  );
}

function calculateAverageScores(
  courseAUProgress: CourseAUProgress,
): SlideActivityScore | null {
  const scores = Object.values(courseAUProgress.progress.activityStatus)
    .filter((status) => status.completed && status.score)
    .map((status) => status.score as SlideActivityScore);

  if (!scores.length) return null;

  const total = scores.reduce<{ raw: number; min: number; max: number }>(
    (sum, score) => ({
      raw: sum.raw + score.raw,
      min: sum.min + score.min,
      max: sum.max + score.max,
    }),
    { raw: 0, min: 0, max: 0 },
  );

  const raw = Math.round(total.raw / scores.length);
  const min = Math.round(total.min / scores.length);
  const max = Math.round(total.max / scores.length);

  // scaled is derived rather than averaged separately, so the emitted
  // ResultScore cannot contradict itself.
  return { raw, min, max, scaled: max > 0 ? raw / max : 0 };
}

function getAuSnapshot(courseAUProgress: CourseAUProgress): AuSnapshot {
  return {
    progress: courseAUProgress.progress.auProgress,
    completed: courseAUProgress.progress.auCompleted,
    passed: courseAUProgress.progress.auPassed,
  };
}

function updateAuStatus(courseAUProgress: CourseAUProgress): void {
  courseAUProgress.progress.auProgress =
    calculateProgressPercentage(courseAUProgress);
  courseAUProgress.progress.auCompleted = isAUCompletedCheck(courseAUProgress);
  courseAUProgress.progress.auPassed = isAUPassed(courseAUProgress);
  courseAUProgress.lastUpdated = new Date().toISOString();
}

function logAsyncError(promise: Promise<unknown>, message: string): void {
  void promise.catch((error) => logger.error(message, error, 'lms'));
}

async function sendAuPassed(
  averageScores: SlideActivityScore | null,
): Promise<void> {
  await sendAuPassedVerb(averageScores || undefined).catch((error) => {
    logger.error('Error sending AU passed verb', error, 'lms');
  });
  if (averageScores) cmi5Instance.pass(averageScores as ResultScore);
  else cmi5Instance.pass();
}

async function sendAuCompleted(): Promise<void> {
  await sendAuCompleteVerb().catch((error) => {
    logger.error('Error sending AU completed verb', error, 'lms');
  });
  cmi5Instance.complete();
}

async function handleAuLMSProgress(
  makeProgress: boolean,
  progressPercentage: number,
  auCompleted: boolean,
  auPassed: boolean,
  courseAUProgress?: CourseAUProgress,
): Promise<void> {
  if (checkForDevMode() || !makeProgress) return;

  try {
    await cmi5Instance.progress(progressPercentage);
  } catch (error) {
    logger.error(
      'Failed to send progress to LMS',
      { error, progressPercentage },
      'lms',
    );
  }

  if (!courseAUProgress || (!auPassed && !auCompleted)) return;

  // Which verbs we may send is decided by moveOn; whether we actually send them
  // is decided by auPassed/auCompleted. averageScores only decides whether a
  // score rides along with a pass - never whether the learner passed.
  const averageScores = calculateAverageScores(courseAUProgress);
  switch (courseAUProgress.courseStructure.moveOn || 'CompletedOrPassed') {
    case 'Passed':
      if (auPassed) await sendAuPassed(averageScores);
      break;
    case 'Completed':
    case 'NotApplicable':
      if (auCompleted) await sendAuCompleted();
      break;
    case 'CompletedAndPassed':
      if (auCompleted) await sendAuCompleted();
      if (auPassed) await sendAuPassed(averageScores);
      break;
    case 'CompletedOrPassed':
    default:
      if (auPassed) await sendAuPassed(averageScores);
      else if (auCompleted) await sendAuCompleted();
  }
}

/**
 * Notifies the learner when the AU has just completed or passed. Both callers
 * already gate on shouldReportAuProgress, which is what keeps a resumed AU -
 * whose restored progress already says passed - from showing this again.
 */
function reportUnitResult(
  previousAu: AuSnapshot,
  currentAu: AuSnapshot,
  courseAUProgress: CourseAUProgress,
  dispatch: Dispatch,
): void {
  try {
    const unitResult = buildUnitResult({
      previous: previousAu,
      current: currentAu,
      courseAUProgress,
      averageScores: calculateAverageScores(courseAUProgress),
    });

    if (unitResult) dispatch(setUnitResult(unitResult));
  } catch (error) {
    // Learner-facing feedback must never prevent the AU verbs from going out.
    logger.error('Error building the unit result notification', error, 'lms');
  }
}

function cloneForSlideUpdate(
  courseAUProgress: CourseAUProgress,
): CourseAUProgress {
  return {
    ...courseAUProgress,
    progress: {
      ...courseAUProgress.progress,
      slideStatus: Object.fromEntries(
        Object.entries(courseAUProgress.progress.slideStatus).map(
          ([guid, status]) => [guid, { ...status }],
        ),
      ),
    },
  };
}

function sendSlideViewedStatements(params: SlideViewedParams): void {
  logAsyncError(
    sendLegacySlideViewed(params.slideNumber, params.slideName),
    'Error sending legacy SlideViewed to LRS',
  );
  logAsyncError(
    sendSlideEventVerb(params.slideNumber, params.eventType, params.slideName),
    'Error sending slideEvent to LRS',
  );
}

function sendSlideTransitionStatements(
  changes: SlideChangedStatus,
  slideNumber: number,
  slideName?: string,
): void {
  if (!changes.wasCompleted && changes.isNowCompleted) {
    logAsyncError(
      sendSlideCompletedVerb(slideNumber, slideName),
      'Error sending slideCompleted verb',
    );
  }
  if (!changes.wasPassed && changes.isNowPassed) {
    logAsyncError(
      sendSlidePassingVerb(slideNumber, slideName),
      'Error sending slidePassing verb',
    );
  }
}

export async function handleSlideViewed(
  params: SlideViewedParams,
  dispatch: Dispatch,
  getState: () => RootState,
): Promise<void> {
  const { slideGuid, makeProgress = true } = params;

  try {
    const currentProgress = getState().au.courseAUProgress;
    if (!currentProgress) {
      logger.error('No courseAUProgress available', undefined, 'lms');
      return;
    }

    const updatedProgress = cloneForSlideUpdate(currentProgress);
    const slideStatus = updatedProgress.progress.slideStatus[slideGuid];
    if (!slideStatus) {
      logger.warn('Slide status not found', { slideGuid }, 'lms');
      return;
    }

    const previousAu = getAuSnapshot(currentProgress);
    const wasViewed = slideStatus.viewed;
    const wasCompleted = slideStatus.completed;
    slideStatus.viewed = true;

    if (!wasViewed) sendSlideViewedStatements(params);

    const changes = getSlideChangedStatus(updatedProgress, slideGuid);
    if (makeProgress || !wasCompleted) updateAuStatus(updatedProgress);
    else updatedProgress.lastUpdated = new Date().toISOString();

    dispatch(setCourseAUProgress(updatedProgress));
    dispatch(setAuProgress(updatedProgress.progress.auProgress));

    sendSlideTransitionStatements(
      changes,
      params.slideNumber,
      params.slideName,
    );

    if (changes.isNowCompleted || changes.isNowPassed || makeProgress) {
      logAsyncError(
        saveCourseAUProgressToLRS(updatedProgress),
        'Error saving CourseAUProgress to LRS',
      );
    }

    const currentAu = getAuSnapshot(updatedProgress);
    if (shouldReportAuProgress(previousAu, currentAu)) {
      reportUnitResult(previousAu, currentAu, updatedProgress, dispatch);
      logAsyncError(
        handleAuLMSProgress(
          makeProgress,
          currentAu.progress,
          currentAu.completed,
          currentAu.passed,
          updatedProgress,
        ),
        'Error reporting AU progress',
      );
    }
  } catch (error) {
    logger.error('Error in handleSlideViewed', error, 'lms');
  }
}

function resolveSlideGuid(
  courseAUProgress: CourseAUProgress,
  activityId: string,
  slideIndex: number,
  suppliedSlideGuid: string | null,
): string {
  if (suppliedSlideGuid) return suppliedSlideGuid;

  const matchingSlides = Object.entries(courseAUProgress.slideActivitiesMeta)
    .filter(([, activities]) => activities[activityId])
    .map(([slideGuid]) => slideGuid);

  if (matchingSlides.length === 1) return matchingSlides[0];

  const indexedSlideGuid =
    courseAUProgress.courseStructure.slides[slideIndex]?.slideGuid;
  if (indexedSlideGuid && matchingSlides.includes(indexedSlideGuid)) {
    return indexedSlideGuid;
  }

  return matchingSlides[0] || indexedSlideGuid || `slide-${slideIndex}`;
}

type ScenarioScore = {
  completedTasks?: number;
  totalTasks?: number;
  allCompleted?: boolean;
  autoGraderResults?: unknown[];
};

function calculateActivityScore(
  activityData: ActivityScore,
  activityType: ActivityType,
): { score: SlideActivityScore; passingScore: number } {
  if (activityType === SlideActivityType.CODE_RUNNER) {
    const response = activityData.scoreData as { isSuccess?: boolean };
    return {
      score: createSlideActivityScore(response?.isSuccess ? 100 : 0, 0, 100),
      passingScore: 100,
    };
  }

  if (
    activityType === SlideActivityType.SCENARIO ||
    activityType === SlideActivityType.CONSOLES
  ) {
    const response = activityData.scoreData as ScenarioScore;
    let completedTasks = response?.completedTasks || 0;
    // No `|| 1` here: a scenario with no tasks scores 0, which is what the
    // `totalTasks > 0` guard below was always meant to express.
    let totalTasks = response?.totalTasks || 0;

    if (response?.autoGraderResults?.length === 0 && response.allCompleted) {
      completedTasks = 1;
      totalTasks = 1;
    }

    const percentage =
      totalTasks > 0 ? Math.min(100, (completedTasks / totalTasks) * 100) : 0;
    return {
      score: createSlideActivityScore(percentage, 0, 100),
      passingScore: 100,
    };
  }

  const quizScore = calculateQuizScore(
    activityData.activityContent,
    activityData.scoreData,
  );
  return {
    score: createSlideActivityScore(
      quizScore.raw,
      quizScore.min,
      quizScore.max,
    ),
    passingScore:
      (activityData.activityContent as { passingScore?: number })
        .passingScore || 70,
  };
}

async function sendActivityInteractions(
  activityData: ActivityScore,
  activityType: ActivityType,
): Promise<void> {
  if (
    checkForDevMode() ||
    activityType === SlideActivityType.CODE_RUNNER ||
    activityType === SlideActivityType.SCENARIO
  ) {
    return;
  }

  try {
    await sendDetailedInteractionStatements(
      activityData.activityContent,
      activityData.scoreData,
    );
  } catch (error) {
    logger.error(
      'Failed to send detailed interaction statements',
      error,
      'lms',
    );
  }
}

function cloneCurrentProgress(
  getState: () => RootState,
): CourseAUProgress | null {
  const progress = getState().au.courseAUProgress;
  return progress ? JSON.parse(JSON.stringify(progress)) : null;
}

function ensureSlideStatus(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
): void {
  courseAUProgress.progress.slideStatus[slideGuid] ||= emptySlideStatus();
}

function saveUpdatedProgress(
  courseAUProgress: CourseAUProgress,
  dispatch: Dispatch,
): void {
  dispatch(setCourseAUProgress(courseAUProgress));
  dispatch(setAuProgress(courseAUProgress.progress.auProgress));
  logAsyncError(
    saveCourseAUProgressToLRS(courseAUProgress),
    'Error saving CourseAUProgress to LRS after activity completion',
  );
}

export async function handleActivityScoring(
  params: ActivityScoringParams,
  dispatch: Dispatch,
  getState: () => RootState,
): Promise<void> {
  const { activityData, slideIndex } = params;
  const courseAUProgress = getState().au.courseAUProgress;
  if (!courseAUProgress) {
    logger.error(
      'No courseAUProgress available for activity completion',
      undefined,
      'lms',
    );
    return;
  }

  try {
    const activityId = getActivityId(activityData.activityContent);
    const activityType = getActivityTypeFromDisplayName(
      activityData.activityType,
    ) as ActivityType;
    const slideGuid = resolveSlideGuid(
      courseAUProgress,
      activityId,
      slideIndex,
      params.slideGuid,
    );

    // Captured before grading dispatches to the store, so it reflects the AU
    // as it was on entry.
    const previousAu = getAuSnapshot(courseAUProgress);

    const { score, passingScore } = calculateActivityScore(
      activityData,
      activityType,
    );

    const gradeResult = await gradeActivity(
      activityId,
      slideIndex,
      slideGuid,
      activityType,
      score,
      passingScore,
      { originalData: activityData, calculatedScore: score },
      courseAUProgress,
    );
    await sendActivityInteractions(activityData, activityType);

    const updatedProgress = cloneCurrentProgress(getState);
    if (!updatedProgress) {
      logger.error(
        'Course progress disappeared after grading',
        undefined,
        'lms',
      );
      return;
    }

    if (!updatedProgress.slideActivitiesMeta[slideGuid]?.[activityId]) {
      logger.error(
        'Activity metadata not found after grading',
        { activityId, activityType, slideGuid },
        'lms',
      );
      return;
    }

    ensureSlideStatus(updatedProgress, slideGuid);
    const slideChanges = getSlideChangedStatus(updatedProgress, slideGuid);

    // This owns activity-slide statements. Do not send slidePassing again here.
    await updateSlideStatus(
      updatedProgress,
      slideGuid,
      slideIndex,
      slideChanges,
    );

    updateAuStatus(updatedProgress);
    saveUpdatedProgress(updatedProgress, dispatch);

    try {
      dispatch(
        queueProgressToast(
          buildActivityToast({
            activityTypeLabel: activityData.activityType,
            activityTitle: getActivityTitle(
              activityData.activityContent,
              activityData.activityType,
            ),
            result: gradeResult,
            metadata:
              updatedProgress.slideActivitiesMeta[slideGuid][activityId],
          }),
        ),
      );
    } catch (error) {
      // A missing toast is recoverable; a missing statement is not.
      logger.error('Error building the activity toast', error, 'lms');
    }

    const currentAu = getAuSnapshot(updatedProgress);
    if (shouldReportAuProgress(previousAu, currentAu)) {
      reportUnitResult(previousAu, currentAu, updatedProgress, dispatch);
      await handleAuLMSProgress(
        true,
        currentAu.progress,
        currentAu.completed,
        currentAu.passed,
        updatedProgress,
      );
    }
  } catch (error) {
    logger.error('Error in handleActivityScoring', error, 'lms');
  }
}
