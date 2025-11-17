import {
  ActivityCompletionPayload,
  SlideActivityScore,
  ActivityType,
  SlideActivityType,
} from '../types/SlideActivityStatusState';

import {
  sendActivityCompletedVerb,
  sendActivityPassedVerb,
  sendActivityFailedVerb,
} from './LmsStatementManager';

import { logger } from '../debug';
import { updateActivityStatus } from './ActivityStatusHelpers';

/**
 * Shared grading function that handles activity completion and pass/fail determination
 *
 * This function:
 * 1. Determines if the activity passes based on score and criteria
 * 2. Marks the activity as completed and updates Redux store with pass/fail status in one call
 * 3. Sends activityCompleted xAPI verb
 * 4. Sends appropriate pass/fail xAPI verb (activityPassed or activityFailed)
 */
// TODO: separate out all LMS statements to own function (ideally fire and forget)
export async function gradeActivity(
  activityId: string,
  slideIndex: number,
  slideGuid: string,
  activityType: ActivityType,
  score?: SlideActivityScore,
  passingScore?: number,
  metadata?: Record<string, any>,
  courseAUProgress?: any,
): Promise<{
  completed: boolean;
  passed: boolean;
  score?: SlideActivityScore;
}> {
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

  // Check if courseAUProgress is provided and has the required structure
  if (!courseAUProgress || !courseAUProgress.slideActivitiesMeta) {
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

  const slideActivitiesMeta = courseAUProgress?.slideActivitiesMeta || {};
  const activities = slideActivitiesMeta[slideGuid] || {};

  try {
    // Step 1: Determine if activity passes first
    let passed = false;

    if (score && passingScore !== undefined) {
      // Check if score meets passing criteria
      const scorePercentage = (score.raw / score.max) * 100;
      passed = scorePercentage >= passingScore;

      logger.info(
        'Activity scoring result',
        {
          activityId,
          scorePercentage,
          passingScore,
          passed,
        },
        'lms',
      );
    } else if (score) {
      // If no passing score specified, assume 100% is required
      passed = score.raw === score.max;

      logger.info(
        'Activity scoring result (no passing score specified)',
        {
          activityId,
          score: score.raw,
          max: score.max,
          passed,
        },
        'lms',
      );
    }

    // need to handle meetsCriteria here
    let meetsCriteria = false;
    let shouldSendCompletedVerb = true; // Flag to determine if we should send activityCompleted
    let shouldSendGradingVerbs = true; // Flag to determine if we should send passed/failed verbs

    // Get the activity metadata for this specific activity
    const activityMetadata = activities[activityId];
    const completionRequired = activityMetadata?.completionRequired;

    switch (activityType) {
      case SlideActivityType.QUIZ:
      case SlideActivityType.CTF:
        // Handle different completion requirements
        switch (completionRequired) {
          case 'attempted':
          case 'completed':
            // Just completing the activity meets criteria - no grading needed
            meetsCriteria = true;
            shouldSendCompletedVerb = true;
            shouldSendGradingVerbs = false; // Don't send passed/failed verbs
            break;
          case 'passed':
            // Must pass to meet criteria - only send passed verb (passing implies completion)
            meetsCriteria = passed;
            shouldSendCompletedVerb = false; // Don't send completed - passed implies it
            shouldSendGradingVerbs = true;
            break;
          case 'completed-and-passed':
            // Must complete AND pass - send both verbs
            meetsCriteria = true && passed; // Completion is implicit, check pass
            shouldSendCompletedVerb = true; // Send completed verb
            shouldSendGradingVerbs = true; // And send passed/failed verb
            break;
          case 'not-applicable':
            // Always meets criteria
            meetsCriteria = true;
            shouldSendCompletedVerb = true;
            shouldSendGradingVerbs = false;
            break;
          default:
            // Default to requiring pass for backward compatibility
            meetsCriteria = passed;
            shouldSendCompletedVerb = true;
            shouldSendGradingVerbs = true;
        }
        break;
      case SlideActivityType.JOBE:
        meetsCriteria = passed; // Jobe activities must pass to meet criteria
        break;
      case SlideActivityType.AUTOGRADER:
        meetsCriteria = passed;
        break;
      case SlideActivityType.SCENARIO:
        meetsCriteria = passed; // might need to change this once non auto grader scenarios are supported
        break;
      default:
        meetsCriteria = passed; // Default: must pass to meet criteria
        break;
    }

    // Step 2: Mark activity as completed and update Redux store with pass/fail status
    const completionPayload: ActivityCompletionPayload = {
      activityId,
      slideIndex,
      slideGuid,
      type: activityType,
      score,
      metadata,
      meetsCriteria,
    };

    // Update Redux ActivityStatusState with completion and pass/fail, meetsCriteria status in one call
    await updateActivityStatus(completionPayload, passed);

    // Step 3: Conditionally send activityCompleted xAPI verb with skills data
    const ksatData = activityMetadata?.ksats || [];
    const enhancedMetadata = {
      ...metadata,
      ...(ksatData.length > 0 && { skills: ksatData }),
    };

    if (shouldSendCompletedVerb) {
      logger.info(
        'About to send activityCompleted verb',
        { activityId, activityType, skills: ksatData },
        'lms',
      );
      sendActivityCompletedVerb(
        activityId,
        activityType,
        enhancedMetadata,
      ).catch((error) => {
        logger.error('error sending activityCompleted verb ', error);
      });
      logger.info(
        'Successfully sent activityCompleted verb',
        { activityId, activityType },
        'lms',
      );
    } else {
      logger.info(
        'Skipping activityCompleted verb - passed verb implies completion',
        {
          activityId,
          activityType,
          completionRequired: activityMetadata?.completionRequired,
        },
        'lms',
      );
    }

    // Step 4: Handle pass/fail result and send appropriate xAPI verbs
    // Only send grading verbs if the activity requires grading

    if (shouldSendGradingVerbs) {
      if (passed) {
        // Activity passed - send activityPassed verb with ksat data
        logger.info(
          'Sending activityPassed verb',
          { activityId, activityType, skills: ksatData },
          'lms',
        );
        await sendActivityPassedVerb(
          activityId,
          activityType,
          score?.raw,
          enhancedMetadata,
        );
      } else {
        // Activity failed - send activityFailed verb with ksat data
        logger.info(
          'Sending activityFailed verb',
          { activityId, activityType, ksats: ksatData },
          'lms',
        );
        await sendActivityFailedVerb(
          activityId,
          activityType,
          score?.raw,
          enhancedMetadata,
        );
      }
    } else {
      logger.info(
        'Skipping grading verbs - activity does not require grading',
        {
          activityId,
          activityType,
          completionRequired: activityMetadata?.completionRequired,
        },
        'lms',
      );
    }

    logger.info(
      'Activity grading completed - slide completion events handled by Redux action',
      { activityId, slideGuid, slideIndex },
      'lms',
    );

    return {
      completed: true,
      passed,
      score,
    };
  } catch (error) {
    logger.error('Error in gradeActivity', error, 'lms');
    throw error;
  }
}

/**
 * Helper function to create an ActivityScore from raw score data
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

/**
 * Helper function to determine if a score passes given criteria
 */
export function doesScorePass(
  score: SlideActivityScore,
  passingScore: number,
): boolean {
  const scorePercentage = (score.raw / score.max) * 100;
  return scorePercentage >= passingScore;
}

/**
 * Helper function to calculate score percentage
 */
export function calculateScorePercentage(score: SlideActivityScore): number {
  return (score.raw / score.max) * 100;
}
