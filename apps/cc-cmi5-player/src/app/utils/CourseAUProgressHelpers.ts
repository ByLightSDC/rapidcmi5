/**
 * CourseAUProgress Helper Functions
 *
 * This file contains helper functions for creating, managing, and updating
 * the CourseAUProgress object that serves as the global source of truth.
 */

import {
  CourseAUProgress,
  CourseAUProgressInit,
  CourseStructure,
  SlideIdentifier,
  SlideActivityMetadata,
  SlideStatus,
} from '../types/CourseAUProgress';

import {
  SlideActivityStatus,
  SlideActivityType,
} from '../types/SlideActivityStatusState';
import { SlideChangedStatus } from '../types/SlideState';
import { cmi5Instance } from '../session/cmi5';

// import { SlideActivityStatusState } from '../types/SlideActivityStatusState'; // Commented out - not used
import { logger } from '../debug';
import { CourseAU } from '@rapid-cmi5/cmi5-build-common';

/**
 * Create slide identifiers from CourseAU data
 */
function createSlideIdentifiers(auJson: CourseAU): SlideIdentifier[] {
  const slides: SlideIdentifier[] = [];

  if (auJson.slides && Array.isArray(auJson.slides)) {
    auJson.slides.forEach((slide, index: number) => {
      const slideIdentifier = {
        slideIndex: index,
        slideGuid: slide.filepath || `slide-${index}`, // Use filepath as GUID
        slideTitle: slide.slideTitle || `Slide ${index + 1}`,
      };
      slides.push(slideIdentifier);

      logger.debug(
        'Created slide identifier',
        {
          slideIndex: slideIdentifier.slideIndex,
          slideGuid: slideIdentifier.slideGuid,
          slideTitle: slideIdentifier.slideTitle,
          originalFilepath: slide.filepath,
          originalTitle: slide.slideTitle,
        },
        'auManager',
      );
    });
  }

  logger.debug(
    'Created slide identifiers',
    {
      totalSlides: slides.length,
      slides: slides.map((s) => ({
        index: s.slideIndex,
        guid: s.slideGuid,
        title: s.slideTitle,
      })),
    },
    'auManager',
  );
  return slides;
}

/**
 * Parse activity metadata from markdown content
 * This is a basic implementation - can be enhanced for more complex parsing
 */
function parseActivityMetadata(slideContent: string): {
  [activityId: string]: SlideActivityMetadata;
} {
  const activities: { [activityId: string]: SlideActivityMetadata } = {};

  logger.debug(
    'Parsing activity metadata from slide content',
    {
      contentLength: slideContent.length,
      hasQuizBlocks: slideContent.includes(':::quiz'),
      hasCtfBlocks: slideContent.includes(':::ctf'),
      hasJobeBlocks: slideContent.includes(':::jobe'),
      hasScenarioBlocks: slideContent.includes(':::scenario'),
      hasConsoleBlocks: slideContent.includes(':::consoles'),
    },
    'auManager',
  );

  // Basic regex to find quiz blocks in markdown
  const quizBlockRegex = /:::quiz\s*```json\s*({[\s\S]*?})\s*```\s*:::/g;
  let match;

  while ((match = quizBlockRegex.exec(slideContent)) !== null) {
    try {
      const quizData = JSON.parse(match[1]);
      if (quizData.cmi5QuizId) {
        const activityMetadata = {
          type: SlideActivityType.QUIZ,
          completionRequired: quizData.completionRequired || 'passed',
          passingScore: quizData.passingScore,
          questions: quizData.questions || [],
          ksats: quizData.ksats || [],
        };
        activities[quizData.cmi5QuizId] = activityMetadata;

        logger.debug(
          'Parsed quiz activity metadata',
          {
            activityId: quizData.cmi5QuizId,
            type: activityMetadata.type,
            completionRequired: activityMetadata.completionRequired,
            passingScore: activityMetadata.passingScore,
            questionCount: activityMetadata.questions.length,
            ksats: activityMetadata.ksats,
          },
          'auManager',
        );
      }
    } catch (error) {
      logger.warn(
        'Failed to parse quiz data from markdown',
        { error, match: match[1] },
        'auManager',
      );
    }
  }

  // Parse CTF blocks
  const ctfBlockRegex = /:::ctf\s*```json\s*({[\s\S]*?})\s*```\s*:::/g;
  let ctfMatch;

  while ((ctfMatch = ctfBlockRegex.exec(slideContent)) !== null) {
    try {
      const ctfData = JSON.parse(ctfMatch[1]);
      if (ctfData.cmi5QuizId) {
        const activityMetadata = {
          type: SlideActivityType.CTF,
          completionRequired: ctfData.completionRequired || 'attempted',
          passingScore: ctfData.passingScore,
          questions: ctfData.questions || [],
          ksats: ctfData.ksats || [],
        };
        activities[ctfData.cmi5QuizId] = activityMetadata;

        logger.debug(
          'Parsed CTF activity metadata',
          {
            activityId: ctfData.cmi5QuizId,
            type: activityMetadata.type,
            completionRequired: activityMetadata.completionRequired,
            passingScore: activityMetadata.passingScore,
            questionCount: activityMetadata.questions.length,
            ksats: activityMetadata.ksats,
          },
          'auManager',
        );
      }
    } catch (error) {
      logger.warn(
        'Failed to parse CTF data from markdown',
        { error, match: ctfMatch[1] },
        'auManager',
      );
    }
  }

  // Parse Jobe blocks
  const jobeBlockRegex = /:::jobe\s*```json\s*({[\s\S]*?})\s*```\s*:::/g;
  let jobeMatch;

  while ((jobeMatch = jobeBlockRegex.exec(slideContent)) !== null) {
    try {
      const jobeData = JSON.parse(jobeMatch[1]);
      logger.debug('Parsed Jobe data from markdown', jobeData, 'auManager');

      // Generate cmi5QuizId if not provided (use title or fallback)
      // TODO: don't like either of these... alsothis should be done in the JobeInTheBox component automatically during export/packaging (guid etc) remove this when that's working
      let activityId = jobeData.cmi5QuizId;
      if (!activityId) {
        // Generate deterministic ID from title or content hash
        if (jobeData.title) {
          activityId =
            jobeData.title
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/--+/g, '-')
              .replace(/^-|-$/g, '') + '-jobe';
        } else {
          // Create a simple hash from the evaluator content for consistency
          const contentHash = Math.abs(
            jobeData.evaluator?.split('').reduce((a: number, b: string) => {
              a = (a << 5) - a + b.charCodeAt(0);
              return a & a;
            }, 0) || 0,
          )
            .toString(36)
            .substr(0, 8);
          activityId = 'jobe-activity-' + contentHash;
        }
      }

      const activityMetadata = {
        type: SlideActivityType.JOBE,
        completionRequired: jobeData.completionRequired || 'passed', // Jobe activities should require passing (successful execution)
        passingScore: 100, // Jobe is binary - 100% success or failure
        questions: [], // Jobe doesn't have questions like quizzes
        ksats: jobeData.ksats || [],
      };
      activities[activityId] = activityMetadata;

      logger.debug(
        'Parsed Jobe activity metadata',
        {
          activityId: activityId,
          type: activityMetadata.type,
          completionRequired: activityMetadata.completionRequired,
          passingScore: activityMetadata.passingScore,
          title: jobeData.title,
          wasGenerated: !jobeData.cmi5QuizId,
          ksats: activityMetadata.ksats,
        },
        'auManager',
      );
    } catch (error) {
      logger.warn(
        'Failed to parse Jobe data from markdown',
        { error, match: jobeMatch[1] },
        'auManager',
      );
    }
  }

  // Parse Scenario blocks
  const scenarioBlockRegex =
    /:::scenario\s*```json\s*({[\s\S]*?})\s*```\s*:::/g;
  let scenarioMatch;

  while ((scenarioMatch = scenarioBlockRegex.exec(slideContent)) !== null) {
    try {
      const scenarioData = JSON.parse(scenarioMatch[1]);

      // Use the scenario UUID or name as the activity ID
      let activityId = scenarioData.uuid || scenarioData.name;
      if (!activityId) {
        // Fallback to generic scenario activity ID
        activityId =
          'scenario-activity-' + Math.random().toString(36).substr(2, 9);
      }

      const activityMetadata = {
        type: SlideActivityType.SCENARIO,
        completionRequired: scenarioData.completionRequired || 'passed', // Scenario activities require completing all AutoGrader tasks
        passingScore: 100, // All AutoGrader tasks must be completed (100%)
        questions: [], // Scenario doesn't have questions, it has AutoGrader tasks
        ksats: scenarioData.ksats || [],
      };
      activities[activityId] = activityMetadata;

      logger.debug(
        'Parsed Scenario activity metadata',
        {
          activityId: activityId,
          type: activityMetadata.type,
          completionRequired: activityMetadata.completionRequired,
          passingScore: activityMetadata.passingScore,
          scenarioUuid: scenarioData.uuid,
          scenarioName: scenarioData.name,
          ksats: activityMetadata.ksats,
        },
        'auManager',
      );
    } catch (error) {
      logger.warn(
        'Failed to parse Scenario data from markdown',
        { error, match: scenarioMatch[1] },
        'auManager',
      );
    }
  }

  // TODO: Add parsing for other activity types (autograder)
  const consoleScenarioBlockRegex =
    /:::consoles\s*```json\s*({[\s\S]*?})\s*```\s*:::/g;
  let consolesScenarioMatch;

  while (
    (consolesScenarioMatch = consoleScenarioBlockRegex.exec(slideContent)) !==
    null
  ) {
    try {
      const consolesScenarioData = JSON.parse(consolesScenarioMatch[1]);

      // Use the scenario UUID or name as the activity ID
      let activityId = consolesScenarioData.uuid || consolesScenarioData.name;
      if (!activityId) {
        // Fallback to generic scenario activity ID
        activityId =
          'scenario-activity-' + Math.random().toString(36).substr(2, 9);
      }

      const activityMetadata = {
        type: SlideActivityType.CONSOLES,
        completionRequired: consolesScenarioData.completionRequired || 'passed', // Scenario activities require completing all AutoGrader tasks
        passingScore: 100, // All AutoGrader tasks must be completed (100%)
        questions: [], // Scenario doesn't have questions, it has AutoGrader tasks
        ksats: consolesScenarioData.ksats || [],
      };
      activities[activityId] = activityMetadata;

      logger.debug(
        'Parsed Console activity metadata',
        {
          activityId: activityId,
          type: activityMetadata.type,
          completionRequired: activityMetadata.completionRequired,
          passingScore: activityMetadata.passingScore,
          scenarioUuid: consolesScenarioData.uuid,
          scenarioName: consolesScenarioData.name,
          ksats: activityMetadata.ksats,
        },
        'auManager',
      );
    } catch (error) {
      logger.warn(
        'Failed to parse Scenario data from markdown',
        { error, match: consolesScenarioMatch[1] },
        'auManager',
      );
    }
  }

  logger.debug(
    'Completed parsing activity metadata',
    {
      totalActivities: Object.keys(activities).length,
      activityIds: Object.keys(activities),
    },
    'auManager',
  );

  return activities;
}

/**
 * Initialize CourseAUProgress from existing AU data
 */
export function initializeCourseAUProgress(
  init: CourseAUProgressInit,
): CourseAUProgress {
  logger.debug(
    'Initializing CourseAUProgress',
    {
      auName: init.auJson.auName,
      auTitle: init.auJson.title,
      totalSlides: init.auJson.slides?.length || 0,
      auProgress: init.auProgress,
      auViewedSlides: init.auViewedSlides,
      // Note: currentSlide is now tracked in navigationSlice.activeTab
    },
    'auManager',
  );

  // Create slide identifiers
  const slides = createSlideIdentifiers(init.auJson);

  // Parse slide activities from markdown content
  const slideActivitiesMeta: {
    [slideGuid: string]: { [activityId: string]: SlideActivityMetadata };
  } = {};

  if (init.auJson.slides && Array.isArray(init.auJson.slides)) {
    init.auJson.slides.forEach((slide, index: number) => {
      const slideGuid = slide.filepath || `slide-${index}`;
      if (slide.content && typeof slide.content === 'string') {
        slideActivitiesMeta[slideGuid] = parseActivityMetadata(slide.content);
        logger.debug(
          'Parsed activities for slide',
          {
            slideIndex: index,
            slideGuid,
            slideTitle: slide.slideTitle,
            activityCount: Object.keys(slideActivitiesMeta[slideGuid]).length,
            activityIds: Object.keys(slideActivitiesMeta[slideGuid]),
          },
          'auManager',
        );
      } else {
        slideActivitiesMeta[slideGuid] = {};
        logger.debug(
          'No content found for slide',
          {
            slideIndex: index,
            slideGuid,
            slideTitle: slide.slideTitle,
          },
          'auManager',
        );
      }
    });
  }

  // Initialize slide status
  const slideStatus: { [slideGuid: string]: SlideStatus } = {};
  slides.forEach((slide) => {
    slideStatus[slide.slideGuid] = {
      viewed: false,
      audioCompleted: false,
      scrolledToBottom: false,
      completed: false,
      passed: false,
      failed: false,
    };
    logger.debug(
      'Initialized slide status',
      {
        slideGuid: slide.slideGuid,
        slideIndex: slide.slideIndex,
        slideTitle: slide.slideTitle,
        status: slideStatus[slide.slideGuid],
      },
      'auManager',
    );
  });

  // Initialize activity status with default values for all activities
  const activityStatus: { [activityId: string]: SlideActivityStatus } = {};
  Object.keys(slideActivitiesMeta).forEach((slideGuid) => {
    const slideIndex = slides.findIndex(
      (slide) => slide.slideGuid === slideGuid,
    );
    const activities = slideActivitiesMeta[slideGuid];

    Object.keys(activities).forEach((activityId) => {
      const activityMetadata = activities[activityId];
      activityStatus[activityId] = {
        type: activityMetadata.type,
        slideIndex,
        slideGuid,
        completed: false,
        passed: false,
        completedAt: undefined,
        passedAt: undefined,
        score: undefined,
        metadata: undefined,
      };

      logger.debug(
        'Initialized activity status',
        {
          activityId,
          slideGuid,
          slideIndex,
          type: activityMetadata.type,
          status: activityStatus[activityId],
        },
        'auManager',
      );
    });
  });

  // Calculate total progress steps: slides + gradable activities
  const totalGradableActivities = Object.keys(slideActivitiesMeta).reduce(
    (count, slideGuid) => {
      const activities = slideActivitiesMeta[slideGuid];
      const gradableCount = Object.values(activities).filter((activity) => {
        // Gradable activities are:
        // - Quiz activities with 'attempted' or 'passed' criteria
        // - CTF activities with 'attempted' or 'passed' criteria
        // - All Jobe activities (regardless of criteria)
        // TODO: cleanup to just use activity.type and completionRequired
        if (
          activity.type === SlideActivityType.JOBE ||
          activity.type === SlideActivityType.SCENARIO ||
          activity.type === SlideActivityType.CONSOLES
        ) {
          return true;
        } else if (
          (activity.type === SlideActivityType.QUIZ ||
            activity.type === SlideActivityType.CTF) &&
          (activity.completionRequired === 'attempted' ||
            activity.completionRequired === 'passed')
        ) {
          return true;
        }
        return false;
      }).length;
      return count + gradableCount;
    },
    0,
  );

  const totalProgressSteps = slides.length + totalGradableActivities;

  logger.debug(
    'Calculated total progress steps',
    {
      totalSlides: slides.length,
      totalGradableActivities,
      totalProgressSteps,
      gradableActivitiesBreakdown: Object.entries(slideActivitiesMeta).map(
        ([slideGuid, activities]) => ({
          slideGuid,
          gradableActivities: Object.entries(activities)
            .filter(([, activity]) => {
              if (activity.type === SlideActivityType.JOBE) return true;
              if (
                (activity.type === SlideActivityType.QUIZ ||
                  activity.type === SlideActivityType.CTF) &&
                (activity.completionRequired === 'attempted' ||
                  activity.completionRequired === 'passed')
              ) {
                return true;
              }
              return false;
            })
            .map(([activityId, activity]) => ({
              activityId,
              type: activity.type,
              completionRequired: activity.completionRequired,
            })),
        }),
      ),
    },
    'auManager',
  );

  // Map moveOnCriteria (lowercase with hyphens) to moveOn (PascalCase) format
  let moveOnValue: CourseStructure['moveOn'] = init.auJson.moveOn;
  if (init.auJson.moveOnCriteria) {
    const moveOnMap: Record<string, CourseStructure['moveOn']> = {
      completed: 'Completed',
      passed: 'Passed',
      'completed-and-passed': 'CompletedAndPassed',
      'completed-or-passed': 'CompletedOrPassed',
      'not-applicable': 'NotApplicable',
    };
    moveOnValue = moveOnMap[init.auJson.moveOnCriteria] || init.auJson.moveOn;
  }

  const courseAUProgress: CourseAUProgress = {
    courseStructure: {
      auId: init.auJson.auName || '',
      auTitle: init.auJson.title || '',
      totalSlides: slides.length,
      // propagate moveOn from auJson (or mapped moveOnCriteria); default handled by verb logic
      moveOn: moveOnValue,
      slides,
    },
    slideActivitiesMeta: slideActivitiesMeta,
    progress: {
      auProgress: init.auProgress || 0,
      auCompleted: false,
      auPassed: false,
      totalProgressSteps,
      // Note: currentSlide is now tracked in navigationSlice.activeTab
      // viewedSlides: init.auViewedSlides || [], // COMMENTED OUT - field removed from ProgressTracking
      slideStatus,
      activityStatus,
    },
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  };

  logger.debug(
    'courseAUProgress after initializeCourseAUProgress',
    courseAUProgress,
    'auManager',
  );

  const totalActivities = Object.keys(slideActivitiesMeta).reduce(
    (sum, slideGuid) =>
      sum + Object.keys(slideActivitiesMeta[slideGuid]).length,
    0,
  );

  logger.debug(
    'CourseAUProgress initialized successfully',
    {
      auId: courseAUProgress.courseStructure.auId,
      auTitle: courseAUProgress.courseStructure.auTitle,
      totalSlides: courseAUProgress.courseStructure.totalSlides,
      totalActivities,
      totalGradableActivities,
      totalProgressSteps: courseAUProgress.progress.totalProgressSteps,
      auProgress: courseAUProgress.progress.auProgress,
      // Note: currentSlide is now tracked in navigationSlice.activeTab
      // viewedSlidesCount: courseAUProgress.progress.viewedSlides.length, // COMMENTED OUT - field removed from ProgressTracking
      version: courseAUProgress.version,
      lastUpdated: courseAUProgress.lastUpdated,
    },
    'auManager',
  );

  return courseAUProgress;
}

/**
 * Calculate AU progress percentage based on completed slides
 */
export function calculateProgressPercentage(
  courseAUProgress: CourseAUProgress,
): number {
  const { courseStructure, progress } = courseAUProgress;

  let progressPercentage = 0;
  const totalSlides = courseStructure.totalSlides;
  const passedSlides = Object.values(progress.slideStatus).filter(
    (status) => status.passed,
  ).length;

  // get all activities that have meetsCriteria == true
  const activitiesWithMeetsCriteria = Object.values(
    progress.activityStatus,
  ).filter((status) => status.meetsCriteria).length;

  logger.debug(
    'calculateProgressPercentage: activitiesWithMeetsCriteria, passedSlides',
    { activitiesWithMeetsCriteria, passedSlides },
    'auManager',
  );

  const totalProgressedSteps = passedSlides + activitiesWithMeetsCriteria;

  if (courseAUProgress.progress.totalProgressSteps > 0) {
    progressPercentage =
      totalProgressedSteps >= 0
        ? (totalProgressedSteps /
            courseAUProgress.progress.totalProgressSteps) *
          100
        : 0;

    logger.debug(
      'calculateProgressPercentage: totalProgressedSteps',
      totalProgressedSteps,
      'auManager',
    );
  } else {
    progressPercentage =
      totalSlides > 0 ? (passedSlides / totalSlides) * 100 : 0;
  }

  logger.debug(
    'Calculated AU progress',
    {
      totalSlides,
      passedSlides,
      progressPercentage,
    },
    'lms',
  );

  return Math.min(Math.round(progressPercentage), 100);
}

/**
 * Check if AU is completed based on slide completion (not just viewing)
 * This considers the AU complete only when all slides are actually completed
 */
export function isAUCompletedByMoveOn(
  courseAUProgress: CourseAUProgress,
): boolean {
  const { courseStructure, progress } = courseAUProgress;

  // If no slides, consider it complete
  if (courseStructure.totalSlides === 0) {
    return true;
  }

  const moveOn = courseStructure.moveOn || 'CompletedOrPassed';

  const allSlidesCompleted = Object.values(progress.slideStatus).every(
    (status) => status.completed,
  );

  const allSlidesPassed = Object.values(progress.slideStatus).every(
    (status) => status.passed,
  );

  // Evaluate completion according to moveOn
  let auSatisfied = false;
  switch (moveOn) {
    case 'Completed':
      auSatisfied = allSlidesCompleted;
      break;
    case 'Passed':
      auSatisfied = allSlidesPassed;
      break;
    case 'CompletedAndPassed':
      auSatisfied = allSlidesCompleted && allSlidesPassed;
      break;
    case 'NotApplicable':
      auSatisfied = true;
      break;
    case 'CompletedOrPassed':
    default:
      auSatisfied = allSlidesCompleted || allSlidesPassed;
      break;
  }

  // Check if all slides have been viewed (legacy fallback - only if no activities)
  // const allSlidesViewed = progress.viewedSlides.length >= courseStructure.totalSlides; // COMMENTED OUT - field removed from ProgressTracking

  logger.debug(
    'isAUCompletedByMoveOn check',
    {
      totalSlides: courseStructure.totalSlides,
      // viewedSlidesCount: progress.viewedSlides.length, // COMMENTED OUT - field removed from ProgressTracking
      // viewedSlides: progress.viewedSlides, // COMMENTED OUT - field removed from ProgressTracking
      // allSlidesViewed, // COMMENTED OUT - field removed from ProgressTracking
      moveOn,
      allSlidesCompleted,
      allSlidesPassed,
      slideStatuses: Object.entries(progress.slideStatus).map(
        ([guid, status]) => ({
          guid,
          viewed: status.viewed,
          completed: status.completed,
        }),
      ),
    },
    'auManager',
  );

  return auSatisfied;
}

/**
 * Get the index of the first incomplete slide
 * Returns 0 if no slides exist or last slide index if all are completed
 */
export function getFirstIncompleteSlideIndex(
  courseAUProgress: CourseAUProgress,
): number {
  const { courseStructure, progress } = courseAUProgress;

  // If no slides, return 0
  if (courseStructure.totalSlides === 0) {
    return 0;
  }

  // Find first incomplete slide
  for (let i = 0; i < courseStructure.slides.length; i++) {
    const slide = courseStructure.slides[i];
    const slideStatus = progress.slideStatus[slide.slideGuid];
    if (!slideStatus?.completed) {
      logger.debug(
        'Found first incomplete slide',
        {
          slideIndex: i,
          slideGuid: slide.slideGuid,
          slideTitle: slide.slideTitle,
          slideStatus: slideStatus,
        },
        'auManager',
      );
      return i;
    }
  }

  // All slides are completed, return last slide index to show completion
  logger.debug(
    'All slides completed, returning last slide index',
    {
      totalSlides: courseStructure.totalSlides,
      lastSlideIndex: courseStructure.totalSlides - 1,
    },
    'auManager',
  );
  return courseStructure.totalSlides - 1;
}

/**
 * Check if AU is completed
 * This considers the AU complete if all activities are completed
 */
export function isAUCompletedCheck(
  courseAUProgress: CourseAUProgress,
): boolean {
  return isAUCompletedByMoveOn(courseAUProgress);
}

/**
 * Check if AU is passed (all slides passed)
 */
export function isAUPassed(courseAUProgress: CourseAUProgress): boolean {
  const { courseStructure, progress } = courseAUProgress;
  const moveOn = courseStructure.moveOn || 'CompletedOrPassed';

  // Define "passed" at AU level consistent with moveOn semantics
  // For LMS verbs, we still need to know if AU is academically passed (success)
  // We'll treat AU-level "passed" as:
  // - Passed or CompletedOrPassed: allSlidesPassed
  // - Completed: false (no notion of success when only completion required)
  // - CompletedAndPassed: allSlidesPassed AND allSlidesCompleted
  // - NotApplicable: true
  const allSlidesCompleted = Object.values(progress.slideStatus).every(
    (s) => s.completed,
  );
  const allSlidesPassed = Object.values(progress.slideStatus).every(
    (s) => s.passed,
  );

  switch (moveOn) {
    case 'Completed':
      return false;
    case 'CompletedAndPassed':
      return allSlidesCompleted && allSlidesPassed;
    case 'NotApplicable':
      return true;
    case 'Passed':
    case 'CompletedOrPassed':
    default:
      return allSlidesPassed;
  }
}

/**
 * Update slide status based on slide activities or viewing
 * Returns information about what changed for LRS event handling
 */
export function getSlideChangedStatus(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
): SlideChangedStatus {
  logger.debug('updateSlideStatus courseAUProgress', courseAUProgress, 'lms');
  const { slideActivitiesMeta: slideActivities, progress } = courseAUProgress;
  const activities = slideActivities[slideGuid] || {};
  const slideStatus = progress.slideStatus[slideGuid];

  if (!slideStatus) {
    logger.warn('Slide status not found for slideGuid', { slideGuid }, 'lms');
    return {
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: false,
      isNowPassed: false,
    };
  }

  // Capture previous values to detect changes
  const wasCompleted = slideStatus.completed;
  const wasPassed = slideStatus.passed;

  const hasActivities = Object.keys(activities).length > 0;

  logger.debug(
    'updateSlideStatus: checking activities for slide',
    {
      slideGuid,
      hasActivities,
      activityCount: Object.keys(activities).length,
      activityIds: Object.keys(activities),
      activities: activities,
    },
    'lms',
  );

  if (hasActivities) {
    // Slide with activities: complete when all activities meet their completion requirements
    // Use more efficient iteration with early exit
    let allCompleted = true;
    let allPassed = true;
    let anyFailed = false;

    for (const activityId of Object.keys(activities)) {
      const activityStatus = progress.activityStatus[activityId];
      const activityMetadata = activities[activityId];

      if (!activityStatus || !activityMetadata) {
        allCompleted = false;
        allPassed = false;
        break; // Early exit if any activity is missing
      }

      // Check completion based on activity's completion requirement
      let activityCompleted = false;
      switch (activityMetadata.completionRequired) {
        case 'passed':
          // Must pass to be considered complete
          activityCompleted = activityStatus.passed === true;
          break;
        case 'completed-and-passed':
          // Must complete AND pass
          activityCompleted =
            activityStatus.completed === true && activityStatus.passed === true;
          break;
        case 'attempted':
        case 'completed':
        case 'not-applicable':
          // Just needs to be completed (no passing required)
          activityCompleted = activityStatus.completed === true;
          break;
        default:
          // Default to completion-only for unknown types
          activityCompleted = activityStatus.completed === true;
      }

      if (!activityCompleted) {
        allCompleted = false;
      }

      // Check passing - only activities that require grading need to pass
      let activityPassed = true;
      switch (activityMetadata.completionRequired) {
        case 'passed':
        case 'completed-and-passed':
          // These require passing
          activityPassed = activityStatus.passed === true;
          break;
        case 'attempted':
        case 'completed':
        case 'not-applicable':
          // These don't require passing - just completing is enough
          activityPassed = activityStatus.completed === true;
          break;
        default:
          // Default to requiring pass for unknown types (backward compatible)
          activityPassed = activityStatus.passed === true;
      }

      if (!activityPassed) {
        allPassed = false;
      }

      // Check if activity has been attempted and failed
      // An activity is considered failed only if it requires grading and didn't pass
      // Activities with 'completed', 'attempted', or 'not-applicable' should never fail
      const requiresGrading =
        activityMetadata.completionRequired === 'passed' ||
        activityMetadata.completionRequired === 'completed-and-passed';

      if (
        activityStatus.completed &&
        !activityStatus.passed &&
        requiresGrading
      ) {
        anyFailed = true;
      }

      // Early exit if both completion conditions are already false
      if (!allCompleted && !allPassed) {
        break;
      }
    }

    slideStatus.completed = allCompleted;
    slideStatus.passed = allPassed;

    slideStatus.failed = anyFailed;
  } else {
    // Slide without activities: complete when viewed

    slideStatus.completed = slideStatus.viewed;
    slideStatus.passed = slideStatus.viewed;
    slideStatus.failed = false; // No activities = no failure
  }

  logger.debug(
    'Updated slide status',
    {
      slideGuid,
      hasActivities,
      completed: slideStatus.completed,
      passed: slideStatus.passed,
      failed: slideStatus.failed,
    },
    'lms',
  );

  // Return information about what changed for LRS event handling
  return {
    wasCompleted,
    wasPassed,
    isNowCompleted: slideStatus.completed,
    isNowPassed: slideStatus.passed,
  };
}

/**
 * Get activity metadata for a specific activity
 */
export function getActivityMetadata(
  courseAUProgress: CourseAUProgress,
  activityId: string,
): SlideActivityMetadata | null {
  const { slideActivitiesMeta: slideActivities } = courseAUProgress;

  for (const slideGuid of Object.keys(slideActivities)) {
    const activities = slideActivities[slideGuid];
    if (activities[activityId]) {
      return activities[activityId];
    }
  }

  return null;
}

/**
 * Save CourseAUProgress to LRS
 */
export async function saveCourseAUProgressToLRS(
  courseAUProgress: CourseAUProgress,
): Promise<void> {
  const xapi = cmi5Instance?.xapi ?? null;
  if (!xapi) {
    logger.error(
      'Error getting XAPI when attempting to save CourseAUProgress',
      undefined,
      'lms',
    );
    throw new Error('An error occurred, XAPI null after authentication');
  }

  const actor = cmi5Instance.getLaunchParameters().actor;
  const activityId = cmi5Instance.getLaunchParameters().activityId;

  // logger.debug(
  //   'Saving CourseAUProgress to LRS',
  //   { activityId, lastUpdated: courseAUProgress.lastUpdated },
  //   'lms',
  // );

  try {
    const stateId = activityId + '/states/courseAUProgress';

    // Create a clean progress-only object (exclude static course data)
    const progressOnlyData = {
      progress: courseAUProgress.progress,
      lastUpdated: courseAUProgress.lastUpdated,
      version: courseAUProgress.version,
    };

    // DEBUG: Log the clean object being saved
    // logger.info(
    //   'DEBUG: About to save CourseAUProgress to LRS - PROGRESS ONLY',
    //   {
    //     activityId,
    //     stateId,
    //     fullObject: JSON.stringify(progressOnlyData, null, 2),
    //     objectSize: JSON.stringify(progressOnlyData).length,
    //     hasProgress: !!progressOnlyData.progress,
    //     hasActivityStatus: !!progressOnlyData.progress?.activityStatus,
    //     activityCount: Object.keys(
    //       progressOnlyData.progress?.activityStatus || {},
    //     ).length,
    //     completedActivities: Object.values(
    //       progressOnlyData.progress?.activityStatus || {},
    //     ).filter((a) => a?.completed).length,
    //     passedActivities: Object.values(
    //       progressOnlyData.progress?.activityStatus || {},
    //     ).filter((a) => a?.passed).length,
    //     // Show what we're excluding
    //     excludedFields: ['courseStructure', 'slideActivitiesMeta'],
    //     originalObjectSize: JSON.stringify(courseAUProgress).length,
    //     cleanedObjectSize: JSON.stringify(progressOnlyData).length,
    //     sizeReduction:
    //       JSON.stringify(courseAUProgress).length -
    //       JSON.stringify(progressOnlyData).length,
    //   },
    //   'lms',
    // );

    await xapi?.createState({
      agent: actor,
      activityId: activityId,
      stateId: stateId,
      state: progressOnlyData,
    });

    // logger.info(
    //   'CourseAUProgress successfully saved to LRS',
    //   { activityId, stateId },
    //   'lms',
    // );

    // DEBUG: Immediately try to retrieve the saved data to verify it's there
    // try {
    //   logger.info(
    //     'DEBUG: Attempting immediate retrieval test...',
    //     { activityId, stateId },
    //     'lms',
    //   );
    //   const retrievedState = await xapi.getState({
    //     agent: actor,
    //     activityId: activityId,
    //     stateId: stateId,
    //   });

    //   if (retrievedState && retrievedState.data) {
    //     logger.info(
    //       'DEBUG: SUCCESS - Data immediately retrievable after save',
    //       {
    //         activityId,
    //         stateId,
    //         retrievedDataSize: JSON.stringify(retrievedState.data).length,
    //         retrievedActivityCount: Object.keys(
    //           (retrievedState.data as any)?.progress?.activityStatus || {},
    //         ).length,
    //         retrievedCompletedCount: Object.values(
    //           (retrievedState.data as any)?.progress?.activityStatus || {},
    //         ).filter((a: any) => a?.completed).length,
    //         retrievedPassedCount: Object.values(
    //           (retrievedState.data as any)?.progress?.activityStatus || {},
    //         ).filter((a: any) => a?.passed).length,
    //       },
    //       'lms',
    //     );

    //     // ADDITIONAL DEBUG: Log the complete retrieved object structure
    //     logger.info(
    //       'DEBUG: COMPLETE RETRIEVED OBJECT STRUCTURE',
    //       {
    //         activityId,
    //         stateId,
    //         fullObject: JSON.stringify(retrievedState.data, null, 2),
    //         objectKeys: Object.keys(retrievedState.data),
    //         hasProgress: !!(retrievedState.data as any).progress,
    //         progressKeys: (retrievedState.data as any).progress
    //           ? Object.keys((retrievedState.data as any).progress)
    //           : [],
    //         slideStatusKeys: (retrievedState.data as any).progress?.slideStatus
    //           ? Object.keys((retrievedState.data as any).progress.slideStatus)
    //           : [],
    //         activityStatusKeys: (retrievedState.data as any).progress
    //           ?.activityStatus
    //           ? Object.keys(
    //               (retrievedState.data as any).progress.activityStatus,
    //             )
    //           : [],
    //       },
    //       'lms',
    //     );
    //   } else {
    //     logger.warn(
    //       'DEBUG: FAILURE - Data not immediately retrievable after save',
    //       { activityId, stateId },
    //       'lms',
    //     );
    //   }
    // } catch (retrieveError) {
    //   logger.error(
    //     'DEBUG: ERROR during immediate retrieval test',
    //     { error: retrieveError, activityId, stateId },
    //     'lms',
    //   );
    // }
  } catch (error) {
    logger.error('Error saving CourseAUProgress to LRS', error, 'lms');
    throw error;
  }
}

/**
 * Get CourseAUProgress from LRS
 */
export async function getCourseAUProgressFromLRS(
  activityId: string,
): Promise<CourseAUProgress | null> {
  const xapi = cmi5Instance.xapi;
  if (xapi === null) {
    logger.warn(
      'XAPI null when attempting to get CourseAUProgress from LRS',
      undefined,
      'lms',
    );
    return null;
  }

  const actor = cmi5Instance.getLaunchParameters().actor;

  logger.debug(
    'Attempting to retrieve CourseAUProgress from LRS',
    { activityId },
    'lms',
  );

  try {
    const stateId = activityId + '/states/courseAUProgress';
    const state = await xapi.getState({
      agent: actor,
      activityId: activityId,
      stateId: stateId,
    });

    if (state && state.data) {
      // DEBUG: Log the retrieved progress data
      const retrievedProgressData = state.data as any; // Progress-only data from LRS
      logger.info(
        'DEBUG: Retrieved CourseAUProgress from LRS - PROGRESS ONLY DATA',
        {
          activityId,
          stateId,
          version: retrievedProgressData.version,
          lastUpdated: retrievedProgressData.lastUpdated,
          auProgress: retrievedProgressData.progress?.auProgress,
          auCompleted: retrievedProgressData.progress?.auCompleted,
          auPassed: retrievedProgressData.progress?.auPassed,
          // Detailed object analysis
          fullObject: JSON.stringify(retrievedProgressData, null, 2),
          objectSize: JSON.stringify(retrievedProgressData).length,
          hasProgress: !!retrievedProgressData.progress,
          hasActivityStatus: !!retrievedProgressData.progress?.activityStatus,
          activityCount: Object.keys(
            retrievedProgressData.progress?.activityStatus || {},
          ).length,
          completedActivities: Object.values(
            retrievedProgressData.progress?.activityStatus || {},
          ).filter((a: any) => a?.completed).length,
          passedActivities: Object.values(
            retrievedProgressData.progress?.activityStatus || {},
          ).filter((a: any) => a?.passed).length,
          // Show individual activity statuses
          activityDetails: Object.entries(
            retrievedProgressData.progress?.activityStatus || {},
          ).map(([id, status]) => ({
            id,
            type: (status as any).type,
            completed: (status as any).completed,
            passed: (status as any).passed,
            score: (status as any).score,
            slideGuid: (status as any).slideGuid,
          })),
          // Note about structure
          note: 'This is progress-only data - will be merged with fresh course structure',
        },
        'lms',
      );

      // Return the progress data (will be merged with fresh course structure later)
      return retrievedProgressData;
    }

    logger.debug(
      'No CourseAUProgress found in LRS (state empty)',
      { activityId, stateId },
      'lms',
    );
    return null;
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

/**
 * Get slide GUID for a specific activity (helper for backward compatibility)
 */
function getSlideGuidForActivity(
  courseAUProgress: CourseAUProgress,
  activityId: string,
): string | null {
  const { slideActivitiesMeta: slideActivities } = courseAUProgress;

  for (const slideGuid of Object.keys(slideActivities)) {
    const activities = slideActivities[slideGuid];
    if (activities[activityId]) {
      return slideGuid;
    }
  }

  return null;
}

/**
 * Check if all activities on a slide are completed and trigger slide-level events
 * This function should be called after an activity is completed (passed or failed)
 */
export async function updateSlideStatus(
  courseAUProgress: CourseAUProgress,
  slideGuid: string,
  slideIndex: number,
  previousStatus?: Pick<SlideChangedStatus, 'wasCompleted' | 'wasPassed'>,
): Promise<void> {
  const { slideActivitiesMeta: slideActivities, progress } = courseAUProgress;
  const slideActivitiesForSlide = slideActivities[slideGuid];

  if (!slideActivitiesForSlide) {
    // No activities on this slide, nothing to check
    return;
  }

  // Get current activity status for all activities on this slide
  const activityIds = Object.keys(slideActivitiesForSlide);

  // Use Redux data instead of LRS for faster access
  const activityStatuses = activityIds.map(
    (activityId) => progress.activityStatus[activityId],
  );

  // Check if all activities are completed
  const allActivitiesCompleted = activityStatuses.every(
    (status) => status?.completed === true,
  );

  // Check if all activities are passed
  const allActivitiesPassed = activityStatuses.every(
    (status) => status?.passed === true,
  );

  // logger.debug(
  //   'Checking slide completion status',
  //   {
  //     slideGuid,
  //     slideIndex,
  //     activityIds,
  //     allActivitiesCompleted,
  //     allActivitiesPassed,
  //     activityStatuses: activityIds.map((activityId) => ({
  //       activityId,
  //       completed: progress.activityStatus[activityId]?.completed,
  //       passed: progress.activityStatus[activityId]?.passed,
  //       // Log individual activities status
  //     })),
  //   },
  //   'lms',
  // );

  // Import slide verbs here to avoid circular dependencies
  const { sendSlideCompletedVerb, sendSlidePassingVerb } = await import(
    './LmsStatementManager'
  );

  // Use provided previous status or fall back to current status
  const wasPreviouslyCompleted =
    previousStatus?.wasCompleted ?? progress.slideStatus[slideGuid]?.completed;
  const wasPreviouslyPassed =
    previousStatus?.wasPassed ?? progress.slideStatus[slideGuid]?.passed;

  console.log(
    'wasPreviouslyCompleted, wasPreviouslyPassed,allActivitiesCompleted,allActivitiesPassed',
    wasPreviouslyCompleted,
    wasPreviouslyPassed,
    allActivitiesCompleted,
    allActivitiesPassed,
  );

  if (allActivitiesCompleted && !wasPreviouslyCompleted) {
    // All activities completed - send slideCompleted event
    logger.info(
      'All activities completed on slide - sending slideCompleted event',
      { slideGuid, slideIndex },
      'lms',
    );

    sendSlideCompletedVerb(slideIndex).catch((error) => {
      logger.error('error sending slideCompleted verb ', error);
    });

    // Update slide status to completed
    if (progress.slideStatus[slideGuid]) {
      progress.slideStatus[slideGuid].completed = true;
    }

    // Save progress to LRS when slide is completed
    try {
      courseAUProgress.lastUpdated = new Date().toISOString();
      await saveCourseAUProgressToLRS(courseAUProgress);
      logger.debug(
        'Saved CourseAUProgress to LRS after slide completion',
        { slideGuid, slideIndex },
        'lms',
      );
    } catch (error) {
      logger.error(
        'Error saving CourseAUProgress to LRS after slide completion',
        { error, slideGuid, slideIndex },
        'lms',
      );
    }
  }

  // Debug: Log all the conditions for slide passing
  logger.debug(
    'Slide passing condition check',
    {
      slideGuid,
      slideIndex,
      allActivitiesCompleted,
      allActivitiesPassed,
      wasPreviouslyPassed,
      conditionMet:
        allActivitiesCompleted && allActivitiesPassed && !wasPreviouslyPassed,
      // Log individual activities status
      activities: Object.keys(slideActivities).map((activityId) => ({
        activityId,
        completed: progress.activityStatus[activityId]?.completed,
        passed: progress.activityStatus[activityId]?.passed,
      })),
    },
    'lms',
  );

  if (allActivitiesCompleted && allActivitiesPassed && !wasPreviouslyPassed) {
    // All activities completed and passed - send slidePassing event
    logger.info(
      'ALL activities passed on slide - sending slidePassing event',
      { slideGuid, slideIndex },
      'lms',
    );

    await sendSlidePassingVerb(slideIndex);

    // Update slide status to passed
    if (progress.slideStatus[slideGuid]) {
      progress.slideStatus[slideGuid].passed = true;
    }

    // Save progress to LRS when slide is passed (only if not already saved for completion)
    if (wasPreviouslyCompleted) {
      try {
        courseAUProgress.lastUpdated = new Date().toISOString();
        await saveCourseAUProgressToLRS(courseAUProgress);
        logger.debug(
          'Saved CourseAUProgress to LRS after slide passed',
          { slideGuid, slideIndex },
          'lms',
        );
      } catch (error) {
        logger.error(
          'Error saving CourseAUProgress to LRS after slide passed',
          { error, slideGuid, slideIndex },
          'lms',
        );
      }
    }
  }

  // ============================================================================
  // ACTIVITY SCORING FUNCTIONS
  // ============================================================================

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
}
