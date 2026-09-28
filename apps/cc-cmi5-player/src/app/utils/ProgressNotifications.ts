import type { SlideActivityScore } from '@rapid-cmi5/cmi5-build-common';
import type { ToasterProps } from '@rapid-cmi5/ui';

import type {
  UnitResult,
  UnitResultActivity,
} from '../redux/progressNotificationReducer';
import type {
  CourseAUProgress,
  SlideActivityMetadata,
} from '../types/CourseAUProgress';
import type { AuProgressSnapshot } from './AuProgressTransition';
import type { GradeActivityResult } from './gradeActivity';
import { calculateScorePercentage } from './ScoreUtils';

type ActivityTitles = {
  title?: string;
  name?: string;
  scenarioName?: string;
};

export function getActivityTitle(
  activityContent: unknown,
  activityTypeLabel: string,
): string {
  const content = (activityContent ?? {}) as ActivityTitles;
  return (
    content.title || content.name || content.scenarioName || activityTypeLabel
  );
}

/**
 * Only these criteria make an activity's score decide the outcome. Anything
 * else is recorded as done the moment it is submitted, so telling the learner
 * they "passed" would overstate what happened.
 */
function requiresPassing(metadata?: SlideActivityMetadata): boolean {
  return (
    metadata?.completionRequired === 'passed' ||
    metadata?.completionRequired === 'completed-and-passed'
  );
}

function toPercent(score?: SlideActivityScore): number | undefined {
  if (!score) return undefined;
  return Math.round(calculateScorePercentage(score));
}

export interface ActivityNotificationParams {
  /** Display name from the player, e.g. "Quiz" or "Capture The Flag". */
  activityTypeLabel: string;
  /** The activity's own title, when it has one. */
  activityTitle: string;
  result: GradeActivityResult;
  metadata?: SlideActivityMetadata;
}

/**
 * Turns a graded activity into the toast shown to the learner. Called once per
 * submission, so no de-duplication is needed here - a rehydrated AU never
 * reaches this path.
 *
 * The headline and the detail are one string separated by a newline: useToaster
 * renders the message with `white-space: pre-line`, which is how the rest of the
 * app writes multi-line toasts.
 */
export function buildActivityToast(
  params: ActivityNotificationParams,
): ToasterProps {
  const { activityTypeLabel, activityTitle, result, metadata } = params;

  const percent = toPercent(result.score);
  const passingScore = metadata?.passingScore;
  const scored = percent !== undefined;

  // An activity that only has to be attempted is complete, not passed.
  if (!requiresPassing(metadata)) {
    return {
      severity: 'info',
      preventDuplicate: false,
      message: scored
        ? `${activityTypeLabel} complete\n${activityTitle} is recorded. You scored ${percent}%.`
        : `${activityTypeLabel} complete\n${activityTitle} is recorded.`,
    };
  }

  if (result.passed) {
    return {
      severity: 'success',
      preventDuplicate: false,
      message:
        scored && passingScore !== undefined
          ? `${activityTypeLabel} passed\n${activityTitle} - you scored ${percent}%, above the ${passingScore}% needed.`
          : `${activityTypeLabel} passed\n${activityTitle} - you met what this activity required.`,
    };
  }

  return {
    severity: 'warning',
    preventDuplicate: false,
    message:
      scored && passingScore !== undefined
        ? `Not passed yet\n${activityTitle} - you scored ${percent}%, and ${passingScore}% is needed to pass. You can try again.`
        : `Not passed yet\n${activityTitle} - you have not met what this activity requires yet. You can try again.`,
  };
}

function buildUnitBreakdown(courseAUProgress: CourseAUProgress): {
  activities: UnitResultActivity[];
  scoredActivityCount: number;
} {
  const { slides } = courseAUProgress.courseStructure;
  const completedActivities = Object.entries(
    courseAUProgress.progress.activityStatus,
  )
    .filter(([, status]) => status.completed)
    .sort(([, a], [, b]) => a.slideIndex - b.slideIndex);
  const scoredActivityCount = completedActivities.filter(
    ([, status]) => status.score,
  ).length;

  const activities = completedActivities.map(([id, status]) => {
    const percent = toPercent(status.score);

    return {
      id,
      // Activity titles are not persisted with status, so the slide they sit
      // on is the most specific label available from stored progress.
      title:
        slides[status.slideIndex]?.slideTitle ??
        `Slide ${status.slideIndex + 1}`,
      slideLabel: `Slide ${status.slideIndex + 1}`,
      scoreLabel:
        percent !== undefined
          ? `${percent}%`
          : status.passed
            ? 'Passed'
            : 'Complete',
    };
  });

  return { activities, scoredActivityCount };
}

export interface UnitResultParams {
  previous: AuProgressSnapshot;
  current: AuProgressSnapshot;
  courseAUProgress: CourseAUProgress;
  /** The same average the player sends to the LRS; null when nothing scored. */
  averageScores: SlideActivityScore | null;
}

/**
 * Returns the learner-facing unit result only on the transition into completed
 * or passed. A resumed AU restores auCompleted/auPassed from the LRS, so both
 * snapshots already agree and nothing is shown a second time.
 */
export function buildUnitResult(params: UnitResultParams): UnitResult | null {
  const { previous, current, courseAUProgress, averageScores } = params;

  const newlyPassed = current.passed && !previous.passed;
  const newlyCompleted = current.completed && !previous.completed;
  if (!newlyPassed && !newlyCompleted) return null;

  const { activities, scoredActivityCount } =
    buildUnitBreakdown(courseAUProgress);
  const outcome =
    current.passed &&
    courseAUProgress.courseStructure.moveOn !== 'NotApplicable'
      ? 'passed'
      : 'completed';

  return {
    outcome,
    auTitle: courseAUProgress.courseStructure.auTitle,
    gradePercent: toPercent(averageScores ?? undefined),
    scoredActivityCount,
    activities,
  };
}
