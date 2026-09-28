import {
  CourseAU,
  getValidDirectiveMap,
  SlideActivityStatus,
  SlideActivityType,
} from '@rapid-cmi5/cmi5-build-common';
import { logger } from '../debug';
import { cmi5Instance } from '../session/cmi5';
import {
  CourseAUProgress,
  CourseAUProgressInit,
  CourseStructure,
  SlideActivityMetadata,
  SlideIdentifier,
  SlideStatus,
} from '../types/CourseAUProgress';
import { SlideChangedStatus } from '../types/SlideState';
import { getActivityStatus, getActivityStatusKey } from './ActivityStatusKey';

type ActivityMetadataMap = Record<string, SlideActivityMetadata>;
type ActivityDirectiveData = {
  completionRequired?: string;
  moveOnCriteria?: string;
  passingScore?: number;
  questions?: unknown[];
  ksats?: unknown[];
};

const COURSE_PROGRESS_STATE = '/states/courseAUProgress';
const DEFAULT_MOVE_ON: CourseStructure['moveOn'] = 'CompletedOrPassed';

const moveOnCriteriaMap: Record<string, CourseStructure['moveOn']> = {
  completed: 'Completed',
  passed: 'Passed',
  'completed-and-passed': 'CompletedAndPassed',
  'completed-or-passed': 'CompletedOrPassed',
  'not-applicable': 'NotApplicable',
};

function createSlideIdentifiers(auJson: CourseAU): SlideIdentifier[] {
  return (auJson.slides ?? []).map((slide, slideIndex) => ({
    slideIndex,
    slideGuid: slide.filepath || `slide-${slideIndex}`,
    slideTitle: slide.slideTitle || `Slide ${slideIndex + 1}`,
  }));
}

function createMetadata(
  type: SlideActivityType,
  data: ActivityDirectiveData,
  defaultRequirement: string,
  passingScore = data.passingScore,
): SlideActivityMetadata {
  return {
    type,
    completionRequired:
      data.completionRequired || data.moveOnCriteria || defaultRequirement,
    passingScore,
    questions: data.questions || [],
    ksats: (data.ksats || []) as SlideActivityMetadata['ksats'],
  };
}

function parseActivityMetadata(slideContent: string): ActivityMetadataMap {
  const activities: ActivityMetadataMap = {};
  const directives = getValidDirectiveMap(slideContent);

  for (const data of directives.quiz) {
    activities[data.cmi5QuizId] = createMetadata(
      SlideActivityType.QUIZ,
      data,
      'passed',
    );
  }

  for (const data of directives.ctf) {
    activities[data.cmi5QuizId] = createMetadata(
      SlideActivityType.CTF,
      data,
      'attempted',
    );
  }

  for (const data of directives.codeRunner) {
    activities[data.cmi5QuizId] = createMetadata(
      SlideActivityType.CODE_RUNNER,
      data,
      'passed',
      100,
    );
  }

  for (const data of directives.scenario) {
    activities[data.uuid || data.name] = createMetadata(
      SlideActivityType.SCENARIO,
      data,
      'passed',
      100,
    );
  }

  for (const data of directives.consoles) {
    activities[data.uuid || data.name] = createMetadata(
      SlideActivityType.CONSOLES,
      data,
      'passed',
      100,
    );
  }

  return activities;
}

function createSlideActivities(
  auJson: CourseAU,
): CourseAUProgress['slideActivitiesMeta'] {
  return Object.fromEntries(
    (auJson.slides ?? []).map((slide, slideIndex) => {
      const slideGuid = slide.filepath || `slide-${slideIndex}`;
      const activities =
        typeof slide.content === 'string'
          ? parseActivityMetadata(slide.content)
          : {};
      return [slideGuid, activities];
    }),
  );
}

function createSlideStatuses(
  slides: SlideIdentifier[],
): CourseAUProgress['progress']['slideStatus'] {
  return Object.fromEntries(
    slides.map((slide) => [
      slide.slideGuid,
      {
        viewed: false,
        audioCompleted: false,
        scrolledToBottom: false,
        completed: false,
        passed: false,
        failed: false,
      } satisfies SlideStatus,
    ]),
  );
}

function createActivityStatuses(
  slides: SlideIdentifier[],
  slideActivities: CourseAUProgress['slideActivitiesMeta'],
): CourseAUProgress['progress']['activityStatus'] {
  const statuses: Record<string, SlideActivityStatus> = {};
  const slideIndexes = new Map(
    slides.map(({ slideGuid, slideIndex }) => [slideGuid, slideIndex]),
  );

  for (const [slideGuid, activities] of Object.entries(slideActivities)) {
    for (const [activityId, metadata] of Object.entries(activities)) {
      statuses[getActivityStatusKey(slideGuid, activityId)] = {
        type: metadata.type,
        slideIndex: slideIndexes.get(slideGuid) ?? -1,
        slideGuid,
        completed: false,
        passed: false,
      };
    }
  }

  return statuses;
}

function isGradableActivity(activity: SlideActivityMetadata): boolean {
  if (
    activity.type === SlideActivityType.CODE_RUNNER ||
    activity.type === SlideActivityType.SCENARIO ||
    activity.type === SlideActivityType.CONSOLES
  ) {
    return true;
  }

  const isQuiz =
    activity.type === SlideActivityType.QUIZ ||
    activity.type === SlideActivityType.CTF;
  return (
    isQuiz &&
    (activity.completionRequired === 'attempted' ||
      activity.completionRequired === 'passed')
  );
}

function getMoveOn(auJson: CourseAU): CourseStructure['moveOn'] {
  return auJson.moveOnCriteria
    ? moveOnCriteriaMap[auJson.moveOnCriteria] || auJson.moveOn
    : auJson.moveOn;
}

export function initializeCourseAUProgress(
  init: CourseAUProgressInit,
): CourseAUProgress {
  const slides = createSlideIdentifiers(init.auJson);
  const slideActivitiesMeta = createSlideActivities(init.auJson);
  const totalGradableActivities = Object.values(slideActivitiesMeta)
    .flatMap(Object.values)
    .filter(isGradableActivity).length;

  return {
    courseStructure: {
      auId: init.auJson.auName || '',
      auTitle: init.auJson.title || '',
      totalSlides: slides.length,
      moveOn: getMoveOn(init.auJson),
      slides,
    },
    slideActivitiesMeta,
    progress: {
      auProgress: init.auProgress || 0,
      auCompleted: false,
      auPassed: false,
      totalProgressSteps: slides.length + totalGradableActivities,
      slideStatus: createSlideStatuses(slides),
      activityStatus: createActivityStatuses(slides, slideActivitiesMeta),
    },
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  };
}

export function calculateProgressPercentage(
  courseAUProgress: CourseAUProgress,
): number {
  const { courseStructure, progress } = courseAUProgress;
  const passedSlides = Object.values(progress.slideStatus).filter(
    ({ passed }) => passed,
  ).length;
  const completedActivities = Object.values(progress.activityStatus).filter(
    ({ meetsCriteria }) => meetsCriteria,
  ).length;

  const percentage = progress.totalProgressSteps
    ? ((passedSlides + completedActivities) / progress.totalProgressSteps) * 100
    : courseStructure.totalSlides
      ? (passedSlides / courseStructure.totalSlides) * 100
      : 0;

  return Math.min(Math.round(percentage), 100);
}

function getAllSlidesStatus(courseAUProgress: CourseAUProgress): {
  allCompleted: boolean;
  allPassed: boolean;
} {
  const statuses = Object.values(courseAUProgress.progress.slideStatus);
  return {
    allCompleted: statuses.every(({ completed }) => completed),
    allPassed: statuses.every(({ passed }) => passed),
  };
}

export function isAUCompletedByMoveOn(
  courseAUProgress: CourseAUProgress,
): boolean {
  if (courseAUProgress.courseStructure.totalSlides === 0) return true;

  const moveOn = courseAUProgress.courseStructure.moveOn || DEFAULT_MOVE_ON;
  const { allCompleted, allPassed } = getAllSlidesStatus(courseAUProgress);

  switch (moveOn) {
    case 'Completed':
      return allCompleted;
    case 'Passed':
      return allPassed;
    case 'CompletedAndPassed':
      return allCompleted && allPassed;
    case 'NotApplicable':
      return true;
    case 'CompletedOrPassed':
    default:
      return allCompleted || allPassed;
  }
}

export function getFirstIncompleteSlideIndex(
  courseAUProgress: CourseAUProgress,
): number {
  const { slides } = courseAUProgress.courseStructure;
  const firstIncomplete = slides.findIndex(
    ({ slideGuid }) =>
      !courseAUProgress.progress.slideStatus[slideGuid]?.completed,
  );

  if (firstIncomplete >= 0) return firstIncomplete;
  return Math.max(slides.length - 1, 0);
}

export function isAUCompletedCheck(
  courseAUProgress: CourseAUProgress,
): boolean {
  return isAUCompletedByMoveOn(courseAUProgress);
}

export function isAUPassed(courseAUProgress: CourseAUProgress): boolean {
  const moveOn = courseAUProgress.courseStructure.moveOn || DEFAULT_MOVE_ON;
  const { allCompleted, allPassed } = getAllSlidesStatus(courseAUProgress);

  switch (moveOn) {
    case 'Completed':
      return false;
    case 'CompletedAndPassed':
      return allCompleted && allPassed;
    case 'NotApplicable':
      return true;
    case 'Passed':
    case 'CompletedOrPassed':
    default:
      return allPassed;
  }
}

function requiresPassing(metadata: SlideActivityMetadata): boolean {
  return (
    metadata.completionRequired === 'passed' ||
    metadata.completionRequired === 'completed-and-passed'
  );
}

function activityIsCompleted(
  status: SlideActivityStatus,
  metadata: SlideActivityMetadata,
): boolean {
  if (metadata.completionRequired === 'passed') return status.passed;
  if (metadata.completionRequired === 'completed-and-passed') {
    return status.completed && status.passed;
  }
  return status.completed;
}

function activityIsPassed(
  status: SlideActivityStatus,
  metadata: SlideActivityMetadata,
): boolean {
  switch (metadata.completionRequired) {
    case 'attempted':
    case 'completed':
    case 'not-applicable':
      return status.completed;
    case 'passed':
    case 'completed-and-passed':
    default:
      return status.passed;
  }
}

function summarizeSlideActivities(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
  activities: ActivityMetadataMap,
): Pick<SlideStatus, 'completed' | 'passed' | 'failed'> {
  const results = Object.entries(activities).map(([activityId, metadata]) => {
    const status = getActivityStatus(
      courseAUProgress.progress.activityStatus,
      slideGuid,
      activityId,
    );

    return {
      completed: !!status && activityIsCompleted(status, metadata),
      passed: !!status && activityIsPassed(status, metadata),
      failed:
        !!status &&
        status.completed &&
        !status.passed &&
        requiresPassing(metadata),
    };
  });

  return {
    completed: results.every((result) => result.completed),
    passed: results.every((result) => result.passed),
    failed: results.some((result) => result.failed),
  };
}

export function getSlideChangedStatus(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
): SlideChangedStatus {
  const slideStatus = courseAUProgress.progress.slideStatus[slideGuid];
  if (!slideStatus) {
    logger.warn('Slide status not found for slideGuid', { slideGuid }, 'lms');
    return {
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: false,
      isNowPassed: false,
    };
  }

  const wasCompleted = slideStatus.completed;
  const wasPassed = slideStatus.passed;
  const activities = courseAUProgress.slideActivitiesMeta[slideGuid] || {};
  const nextStatus = Object.keys(activities).length
    ? summarizeSlideActivities(courseAUProgress, slideGuid, activities)
    : {
        completed: slideStatus.viewed,
        passed: slideStatus.viewed,
        failed: false,
      };

  Object.assign(slideStatus, nextStatus);

  return {
    wasCompleted,
    wasPassed,
    isNowCompleted: slideStatus.completed,
    isNowPassed: slideStatus.passed,
  };
}

export function getActivityMetadata(
  courseAUProgress: CourseAUProgress,
  activityId: string,
): SlideActivityMetadata | null {
  for (const activities of Object.values(
    courseAUProgress.slideActivitiesMeta,
  )) {
    if (activities[activityId]) return activities[activityId];
  }
  return null;
}

function getCourseProgressStateId(activityId: string): string {
  return activityId + COURSE_PROGRESS_STATE;
}

export async function saveCourseAUProgressToLRS(
  courseAUProgress: CourseAUProgress,
): Promise<void> {
  const xapi = cmi5Instance?.xapi ?? null;
  if (!xapi) {
    throw new Error('An error occurred, XAPI null after authentication');
  }

  const { actor, activityId } = cmi5Instance.getLaunchParameters();

  try {
    await xapi.createState({
      agent: actor,
      activityId,
      stateId: getCourseProgressStateId(activityId),
      state: {
        progress: courseAUProgress.progress,
        lastUpdated: courseAUProgress.lastUpdated,
        version: courseAUProgress.version,
      },
    });
  } catch (error) {
    logger.error('Error saving CourseAUProgress to LRS', error, 'lms');
    throw error;
  }
}

export async function getCourseAUProgressFromLRS(
  activityId: string,
): Promise<CourseAUProgress | null> {
  const xapi = cmi5Instance.xapi;
  if (!xapi) {
    logger.warn(
      'XAPI unavailable when retrieving CourseAUProgress from LRS',
      undefined,
      'lms',
    );
    return null;
  }

  try {
    const { actor } = cmi5Instance.getLaunchParameters();
    const state = await xapi.getState({
      agent: actor,
      activityId,
      stateId: getCourseProgressStateId(activityId),
    });
    return state?.data ? (state.data as CourseAUProgress) : null;
  } catch (error) {
    logger.warn(
      'No existing CourseAUProgress found in LRS',
      {
        activityId,
        error: error instanceof Error ? error.message : String(error),
      },
      'lms',
    );
    return null;
  }
}

const slidePassingInFlight = new Set<string>();

async function persistSlideProgress(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
  slideIndex: number,
): Promise<void> {
  try {
    courseAUProgress.lastUpdated = new Date().toISOString();
    await saveCourseAUProgressToLRS(courseAUProgress);
  } catch (error) {
    logger.error(
      'Error saving CourseAUProgress to LRS after slide update',
      { error, slideGuid, slideIndex },
      'lms',
    );
  }
}

export async function updateSlideStatus(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
  slideIndex: number,
  previousStatus?: Pick<SlideChangedStatus, 'wasCompleted' | 'wasPassed'>,
): Promise<void> {
  const activities = courseAUProgress.slideActivitiesMeta[slideGuid];
  const slideStatus = courseAUProgress.progress.slideStatus[slideGuid];
  if (!activities || !slideStatus) return;

  // Share one definition of "done" with getSlideChangedStatus: both must honor
  // each activity's completionRequired, or a slide can be reported complete
  // here while the status recalculation disagrees.
  const { completed: allCompleted, passed: allPassed } =
    summarizeSlideActivities(courseAUProgress, slideGuid, activities);
  const wasCompleted = previousStatus?.wasCompleted ?? slideStatus.completed;
  const wasPassed = previousStatus?.wasPassed ?? slideStatus.passed;
  const shouldComplete = allCompleted && !wasCompleted;
  const shouldPass =
    allCompleted &&
    allPassed &&
    !wasPassed &&
    !slidePassingInFlight.has(slideGuid);

  if (!shouldComplete && !shouldPass) return;
  if (shouldPass) slidePassingInFlight.add(slideGuid);

  slideStatus.completed ||= allCompleted;
  slideStatus.passed ||= allPassed;

  try {
    const { sendSlideCompletedVerb, sendSlidePassingVerb } = await import(
      './LmsStatementManager'
    );

    if (shouldComplete) {
      sendSlideCompletedVerb(slideIndex).catch((error) => {
        logger.error('Error sending slideCompleted verb', error, 'lms');
      });
      await persistSlideProgress(courseAUProgress, slideGuid, slideIndex);
    }

    if (shouldPass) {
      await sendSlidePassingVerb(slideIndex);
      if (!shouldComplete) {
        await persistSlideProgress(courseAUProgress, slideGuid, slideIndex);
      }
    }
  } finally {
    if (shouldPass) slidePassingInFlight.delete(slideGuid);
  }
}
