import { SlideActivityType } from '@rapid-cmi5/cmi5-build-common';

import { CourseAUProgress } from '../types/CourseAUProgress';
import {
  buildActivityToast,
  buildUnitResult,
  getActivityTitle,
} from './ProgressNotifications';

const score = (raw: number) => ({ raw, min: 0, max: 100, scaled: raw / 100 });

const gradedMeta = {
  type: SlideActivityType.QUIZ,
  completionRequired: 'passed',
  passingScore: 80,
};

const attemptedMeta = {
  type: SlideActivityType.CTF,
  completionRequired: 'attempted',
};

describe('getActivityTitle', () => {
  it('prefers the activity title', () => {
    expect(getActivityTitle({ title: 'Filter Syntax' }, 'Quiz')).toBe(
      'Filter Syntax',
    );
  });

  it('falls back to the display name when the content is untitled', () => {
    expect(getActivityTitle({}, 'Capture The Flag')).toBe('Capture The Flag');
  });

  it('tolerates missing content', () => {
    expect(getActivityTitle(undefined, 'Quiz')).toBe('Quiz');
  });
});

describe('buildActivityToast', () => {
  it('reports a pass with both scores when passing is required', () => {
    const toast = buildActivityToast({
      activityTypeLabel: 'Quiz',
      activityTitle: 'Protocol Fundamentals',
      result: { completed: true, passed: true, score: score(92) },
      metadata: gradedMeta,
    });

    expect(toast.severity).toBe('success');
    expect(toast.message).toContain('Quiz passed');
    expect(toast.message).toContain('92%');
    expect(toast.message).toContain('80%');
  });

  it('puts the headline on its own line for pre-line rendering', () => {
    const toast = buildActivityToast({
      activityTypeLabel: 'Quiz',
      activityTitle: 'Protocol Fundamentals',
      result: { completed: true, passed: true, score: score(92) },
      metadata: gradedMeta,
    });

    const [headline, ...rest] = toast.message.split('\n');
    expect(headline).toBe('Quiz passed');
    expect(rest).toHaveLength(1);
  });

  it('reports a failure as retryable rather than final', () => {
    const toast = buildActivityToast({
      activityTypeLabel: 'Quiz',
      activityTitle: 'Filter Syntax',
      result: { completed: true, passed: false, score: score(60) },
      metadata: gradedMeta,
    });

    expect(toast.severity).toBe('warning');
    expect(toast.message).toContain('Not passed yet');
    expect(toast.message).toContain('60%');
    expect(toast.message).toContain('try again');
  });

  it('does not claim a pass for an activity that only had to be attempted', () => {
    const toast = buildActivityToast({
      activityTypeLabel: 'Capture The Flag',
      activityTitle: 'Capture the Handshake',
      result: { completed: true, passed: false, score: score(100) },
      metadata: attemptedMeta,
    });

    expect(toast.severity).toBe('info');
    expect(toast.message).toContain('Capture The Flag complete');
    expect(toast.message).not.toContain('passed');
  });

  it('omits score wording when the activity produced no score', () => {
    const toast = buildActivityToast({
      activityTypeLabel: 'Scenario',
      activityTitle: 'Isolate the beacon',
      result: { completed: true, passed: true },
      metadata: {
        type: SlideActivityType.SCENARIO,
        completionRequired: 'passed',
      },
    });

    expect(toast.severity).toBe('success');
    expect(toast.message).not.toContain('%');
  });
});

function progressFixture(): CourseAUProgress {
  return {
    courseStructure: {
      auId: 'au-1',
      auTitle: 'Network Traffic Analysis',
      totalSlides: 2,
      moveOn: 'Passed',
      slides: [
        {
          slideIndex: 0,
          slideGuid: 'a.md',
          slideTitle: 'Protocol Fundamentals',
        },
        { slideIndex: 1, slideGuid: 'b.md', slideTitle: 'Filter Syntax' },
      ],
    },
    slideActivitiesMeta: {},
    progress: {
      auProgress: 100,
      auCompleted: true,
      auPassed: true,
      totalProgressSteps: 4,
      slideStatus: {},
      activityStatus: {
        'b::two': {
          type: SlideActivityType.QUIZ,
          slideIndex: 1,
          slideGuid: 'b.md',
          completed: true,
          passed: true,
          score: score(84),
        },
        'a::one': {
          type: SlideActivityType.QUIZ,
          slideIndex: 0,
          slideGuid: 'a.md',
          completed: true,
          passed: true,
          score: score(92),
        },
        'c::three': {
          type: SlideActivityType.SCENARIO,
          slideIndex: 1,
          slideGuid: 'b.md',
          completed: false,
          passed: false,
        },
      },
    },
    lastUpdated: '2026-09-27T00:00:00.000Z',
    version: '1.0.0',
  };
}

describe('buildUnitResult', () => {
  it('builds a passed result on the transition into passed', () => {
    const result = buildUnitResult({
      previous: { progress: 80, completed: false, passed: false },
      current: { progress: 100, completed: true, passed: true },
      courseAUProgress: progressFixture(),
      averageScores: score(88),
    });

    expect(result).not.toBeNull();
    expect(result?.outcome).toBe('passed');
    expect(result?.auTitle).toBe('Network Traffic Analysis');
    expect(result?.gradePercent).toBe(88);
    expect(result?.scoredActivityCount).toBe(2);
  });

  it('lists only completed activities, ordered by slide', () => {
    const result = buildUnitResult({
      previous: { progress: 80, completed: false, passed: false },
      current: { progress: 100, completed: true, passed: true },
      courseAUProgress: progressFixture(),
      averageScores: score(88),
    });

    expect(result?.activities).toEqual([
      {
        id: 'a::one',
        title: 'Protocol Fundamentals',
        slideLabel: 'Slide 1',
        scoreLabel: '92%',
      },
      {
        id: 'b::two',
        title: 'Filter Syntax',
        slideLabel: 'Slide 2',
        scoreLabel: '84%',
      },
    ]);
  });

  it('marks a completed-but-not-passed AU as complete rather than passed', () => {
    const result = buildUnitResult({
      previous: { progress: 80, completed: false, passed: false },
      current: { progress: 100, completed: true, passed: false },
      courseAUProgress: progressFixture(),
      averageScores: null,
    });

    expect(result?.outcome).toBe('completed');
    expect(result?.gradePercent).toBeUndefined();
  });

  it('describes a NotApplicable result as completed', () => {
    const progress = progressFixture();
    progress.courseStructure.moveOn = 'NotApplicable';

    const result = buildUnitResult({
      previous: { progress: 80, completed: false, passed: false },
      current: { progress: 100, completed: true, passed: true },
      courseAUProgress: progress,
      averageScores: score(88),
    });

    expect(result?.outcome).toBe('completed');
  });

  it('counts only scored activities in the grade summary', () => {
    const progress = progressFixture();
    progress.progress.activityStatus['b::unscored'] = {
      type: SlideActivityType.SCENARIO,
      slideIndex: 1,
      slideGuid: 'b.md',
      completed: true,
      passed: true,
    };

    const result = buildUnitResult({
      previous: { progress: 80, completed: false, passed: false },
      current: { progress: 100, completed: true, passed: true },
      courseAUProgress: progress,
      averageScores: score(88),
    });

    expect(result?.activities).toHaveLength(3);
    expect(result?.scoredActivityCount).toBe(2);
    expect(result?.activities.map(({ id }) => id)).toContain('b::unscored');
  });

  it('returns null when a resumed AU was already passed', () => {
    expect(
      buildUnitResult({
        previous: { progress: 100, completed: true, passed: true },
        current: { progress: 100, completed: true, passed: true },
        courseAUProgress: progressFixture(),
        averageScores: score(88),
      }),
    ).toBeNull();
  });

  it('returns null when only numeric progress moved', () => {
    expect(
      buildUnitResult({
        previous: { progress: 50, completed: false, passed: false },
        current: { progress: 75, completed: false, passed: false },
        courseAUProgress: progressFixture(),
        averageScores: null,
      }),
    ).toBeNull();
  });
});
