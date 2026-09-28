jest.mock('../session/cmi5', () => ({
  cmi5Instance: {
    xapi: { sendStatement: jest.fn().mockResolvedValue(undefined) },
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
    getAuthToken: jest.fn(() => 'token'),
    progress: jest.fn().mockResolvedValue(undefined),
    pass: jest.fn(),
    complete: jest.fn(),
  },
}));

jest.mock('../debug', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('./DevMode', () => ({
  checkForDevMode: jest.fn(() => false),
}));

jest.mock('../redux/auReducer', () => ({
  setAuProgress: jest.fn((payload) => ({ type: 'setAuProgress', payload })),
  setCourseAUProgress: jest.fn((payload) => ({
    type: 'setCourseAUProgress',
    payload,
  })),
}));

jest.mock('./CourseAUProgressHelpers', () => ({
  calculateProgressPercentage: jest.fn(),
  getSlideChangedStatus: jest.fn(),
  isAUCompletedCheck: jest.fn(),
  isAUPassed: jest.fn(),
  saveCourseAUProgressToLRS: jest.fn().mockResolvedValue(undefined),
  updateSlideStatus: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./Cmi5Helpers', () => ({
  calculateQuizScore: jest.fn(),
  sendDetailedInteractionStatements: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./gradeActivity', () => ({
  // createSlideActivityScore is pure - keep the real shape so assertions on the
  // score handed to gradeActivity are meaningful.
  createSlideActivityScore: jest.fn((raw, min = 0, max = 100) => ({
    raw,
    min,
    max,
    scaled: raw / max,
  })),
  gradeActivity: jest.fn().mockResolvedValue({ completed: true, passed: true }),
}));

jest.mock(
  '@rapid-cmi5/cmi5-build-common',
  () => ({ getActivityTypeFromDisplayName: jest.fn() }),
  { virtual: true },
);

jest.mock(
  '@rapid-cmi5/ui',
  () => ({ config: { AUTH_URL: 'https://example.com/auth' } }),
  { virtual: true },
);

jest.mock('uuid', () => ({ v4: () => 'statement-id' }));

import { cmi5Instance } from '../session/cmi5';
import { checkForDevMode } from './DevMode';
import {
  calculateProgressPercentage,
  getSlideChangedStatus,
  isAUCompletedCheck,
  isAUPassed,
  saveCourseAUProgressToLRS,
} from './CourseAUProgressHelpers';
import {
  calculateQuizScore,
  sendDetailedInteractionStatements,
} from './Cmi5Helpers';
import { gradeActivity } from './gradeActivity';
import { getActivityTypeFromDisplayName } from '@rapid-cmi5/cmi5-build-common';
import {
  CMI5_VERBS,
  RANGEOS_VERBS,
  handleActivityScoring,
  handleSlideViewed,
  sendActivityCompletedVerb,
  sendActivityFailedVerb,
  sendActivityPassedVerb,
  sendAuPassedVerb,
  sendClassEventVerb,
  sendInitializedVerb,
  sendRangeosAuthVerb,
  sendScenarioEventVerb,
  sendSlideCompletedVerb,
  sendSlideEventVerb,
  sendTerminatedVerb,
} from './LmsStatementManager';

const mockSendStatement = cmi5Instance.xapi?.sendStatement as jest.Mock;
const mockCheckForDevMode = checkForDevMode as jest.Mock;
const mockGradeActivity = gradeActivity as jest.Mock;
const mockCalculateQuizScore = calculateQuizScore as jest.Mock;
const mockActivityTypeFromDisplayName =
  getActivityTypeFromDisplayName as jest.Mock;

const sentStatement = () => mockSendStatement.mock.calls[0][0].statement;
const sentStatements = () =>
  mockSendStatement.mock.calls.map(([request]) => request.statement);
const sentVerbIds = () => sentStatements().map((statement) => statement.verb.id);
const statementForVerb = (verbId: string) =>
  sentStatements().find((statement) => statement.verb.id === verbId);

/** Resolve every pending microtask so fire-and-forget sends settle. */
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

type ProgressOverrides = {
  moveOn?: string;
  activityStatus?: Record<string, any>;
  slideActivitiesMeta?: Record<string, any>;
  slides?: any[];
  slideStatus?: Record<string, any>;
};

/**
 * A single-slide AU carrying one quiz activity, which is the shape every
 * handleActivityScoring test starts from.
 */
function makeCourseAUProgress(overrides: ProgressOverrides = {}): any {
  return {
    courseStructure: {
      auId: 'course',
      auTitle: 'Course',
      totalSlides: 1,
      moveOn: overrides.moveOn,
      slides: overrides.slides ?? [
        { slideIndex: 0, slideGuid: 'slide.md', slideTitle: 'Slide' },
      ],
    },
    slideActivitiesMeta: overrides.slideActivitiesMeta ?? {
      'slide.md': { 'quiz-1': { completionRequired: 'passed' } },
    },
    progress: {
      auProgress: 0,
      auCompleted: false,
      auPassed: false,
      totalProgressSteps: 1,
      slideStatus: overrides.slideStatus ?? {
        'slide.md': {
          viewed: false,
          completed: false,
          passed: false,
          failed: false,
        },
      },
      activityStatus: overrides.activityStatus ?? {},
    },
    lastUpdated: '2026-01-01T00:00:00.000Z',
    version: '1.0.0',
  };
}

/** Drive handleActivityScoring against a fixture and return what it dispatched. */
async function runActivityScoring({
  activityContent = { cmi5QuizId: 'quiz-1', passingScore: 70 },
  scoreData = {},
  activityType = 'Quiz',
  resolvedType = 'quiz',
  slideGuid = null,
  slideIndex = 0,
  progress = makeCourseAUProgress(),
}: Record<string, any> = {}) {
  mockActivityTypeFromDisplayName.mockReturnValue(resolvedType);
  const dispatch = jest.fn();

  await handleActivityScoring(
    {
      activityData: { activityContent, scoreData, activityType } as any,
      slideGuid,
      slideIndex,
    },
    dispatch,
    () => ({ au: { courseAUProgress: progress } }) as any,
  );

  return { dispatch };
}

describe('LmsStatementManager statement builders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
  });


  it('builds slide statements with the shared launch context', async () => {
    await sendSlideCompletedVerb(2, 'Results');

    expect(sentStatement()).toMatchObject({
      id: 'statement-id',
      actor: { objectType: 'Agent', mbox: 'mailto:test@example.com' },
      verb: {
        id: RANGEOS_VERBS.SLIDE_COMPLETED,
        display: { 'en-US': 'slideCompleted' },
      },
      object: {
        objectType: 'Activity',
        id: 'https://example.com/course/slide-2',
      },
      context: { registration: 'registration-id' },
      result: {
        extensions: {
          'https://rangeos/extensions/slideCompleted/slideNumber': 2,
          'https://rangeos/extensions/slideCompleted/slideName': 'Results',
        },
      },
    });
  });

  it('preserves activity scores and metadata in activity statements', async () => {
    await sendActivityPassedVerb('quiz-1', 'quiz' as any, 80, {
      attempt: 1,
    });

    expect(sentStatement()).toMatchObject({
      verb: { id: RANGEOS_VERBS.ACTIVITY_PASSED },
      object: { id: 'https://example.com/course/activity/quiz-1' },
      result: {
        score: { scaled: 0.8, raw: 80, min: 0, max: 100 },
        extensions: {
          'https://rangeos/extensions/activityPassed/type': 'quiz',
          'https://rangeos/extensions/activityPassed/metadata': { attempt: 1 },
        },
      },
    });
  });

  it('uses the classEvent verb instead of a cmi5 lifecycle verb', async () => {
    await sendClassEventVerb('class-1');

    expect(sentStatement().verb.id).toBe(RANGEOS_VERBS.CLASS_EVENT);
  });

  it('does not access launch data or send statements in dev mode', async () => {
    mockCheckForDevMode.mockReturnValue(true);

    await sendInitializedVerb();

    expect(mockSendStatement).not.toHaveBeenCalled();
    expect(cmi5Instance.getLaunchParameters).not.toHaveBeenCalled();
  });

  it('emits each slide transition statement once when viewing completes a slide', async () => {
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: true,
      isNowPassed: true,
    });
    (calculateProgressPercentage as jest.Mock).mockReturnValue(100);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(true);
    (isAUPassed as jest.Mock).mockReturnValue(true);

    const courseAUProgress = {
      courseStructure: {
        auId: 'course',
        auTitle: 'Course',
        totalSlides: 1,
        slides: [{ slideIndex: 0, slideGuid: 'slide.md', slideTitle: 'Slide' }],
      },
      slideActivitiesMeta: { 'slide.md': {} },
      progress: {
        auProgress: 0,
        auCompleted: false,
        auPassed: false,
        totalProgressSteps: 1,
        slideStatus: {
          'slide.md': {
            viewed: false,
            completed: false,
            passed: false,
            failed: false,
          },
        },
        activityStatus: {},
      },
      lastUpdated: '2026-01-01T00:00:00.000Z',
      version: '1.0.0',
    };

    await handleSlideViewed(
      {
        slideGuid: 'slide.md',
        slideName: 'Slide',
        slideNumber: 0,
        eventType: 'navigation',
        makeProgress: false,
      },
      jest.fn(),
      () => ({ au: { courseAUProgress } }) as any,
    );

    const verbIds = mockSendStatement.mock.calls.map(
      ([request]) => request.statement.verb.id,
    );
    expect(verbIds).toEqual([
      RANGEOS_VERBS.SLIDE_VIEWED,
      RANGEOS_VERBS.SLIDE_EVENT,
      RANGEOS_VERBS.SLIDE_COMPLETED,
      RANGEOS_VERBS.SLIDE_PASSING,
    ]);
  });
});

describe('score serialization on activity statements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
  });

  it('reports a raw score of 0 rather than omitting it', async () => {
    await sendActivityFailedVerb('runner-1', 'codeRunner' as any, 0);

    expect(sentStatement().result.score).toEqual({
      scaled: 0,
      raw: 0,
      min: 0,
      max: 100,
    });
  });

  it('omits the score object entirely when no score is supplied', async () => {
    await sendActivityFailedVerb('runner-1', 'codeRunner' as any, undefined);

    expect(sentStatement().result.score).toBeUndefined();
  });

  it('scales a full score to 1', async () => {
    await sendActivityPassedVerb('quiz-1', 'quiz' as any, 100);

    expect(sentStatement().result.score).toEqual({
      scaled: 1,
      raw: 100,
      min: 0,
      max: 100,
    });
  });

  it('scales a partial score against a 0-100 range', async () => {
    await sendActivityPassedVerb('quiz-1', 'quiz' as any, 45);

    expect(sentStatement().result.score).toMatchObject({
      scaled: 0.45,
      raw: 45,
    });
  });
});

describe('verb builders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
  });

  it('targets the launch activity when no object id is given', async () => {
    await sendInitializedVerb();

    expect(sentStatement()).toMatchObject({
      verb: { id: CMI5_VERBS.INITIALIZED, display: { 'en-US': 'initialized' } },
      object: { objectType: 'Activity', id: 'https://example.com/course' },
    });
  });

  it('sends the cmi5 terminated verb', async () => {
    await sendTerminatedVerb();

    expect(sentStatement().verb.id).toBe(CMI5_VERBS.TERMINATED);
  });

  it('hashes the auth token into the rangeos auth verb id', async () => {
    await sendRangeosAuthVerb();

    const statement = sentStatement();
    expect(statement.verb.display).toEqual({
      'en-US': RANGEOS_VERBS.RANGEOS_OK,
    });
    expect(statement.verb.id).toMatch(/^https:\/\/example\.com\/auth\/[a-f0-9]{64}$/);
    // The raw token must never reach the LRS.
    expect(statement.verb.id).not.toContain('token');
  });

  it('scopes slide verbs to a slide-specific activity id', async () => {
    await sendSlideEventVerb(3, 'audio_complete', 'Audio Slide');

    expect(sentStatement()).toMatchObject({
      object: { id: 'https://example.com/course/slide-3' },
      result: {
        extensions: {
          'https://rangeos/extensions/slideEvent/type': 'audio_complete',
          'https://rangeos/extensions/slideEvent/slideNumber': 3,
          'https://rangeos/extensions/slideEvent/slideName': 'Audio Slide',
        },
      },
    });
  });

  it('omits the slide name extension when no name is given', async () => {
    await sendSlideEventVerb(3, 'navigation');

    const extensions = sentStatement().result.extensions;
    expect(extensions).not.toHaveProperty(
      'https://rangeos/extensions/slideEvent/slideName',
    );
    expect(extensions).toHaveProperty(
      'https://rangeos/extensions/slideEvent/slideNumber',
      3,
    );
  });

  it('omits the metadata extension when no metadata is given', async () => {
    await sendActivityCompletedVerb('quiz-1', 'quiz' as any);

    expect(sentStatement().result.extensions).not.toHaveProperty(
      'https://rangeos/extensions/activityCompleted/metadata',
    );
  });

  it('scopes activity verbs to an activity-specific object id', async () => {
    await sendActivityCompletedVerb('ctf-9', 'ctf' as any, { attempts: 2 });

    expect(sentStatement().object.id).toBe(
      'https://example.com/course/activity/ctf-9',
    );
  });

  it('leaves scenario events on the launch activity id', async () => {
    // The scenario id travels as an extension, not in the object - asserting
    // current behavior so a future change to object scoping is deliberate.
    await sendScenarioEventVerb('scenario-1', 'started', { step: 1 });

    expect(sentStatement()).toMatchObject({
      object: { id: 'https://example.com/course' },
      result: {
        extensions: {
          'https://rangeos/extensions/scenarioEvent/scenarioId': 'scenario-1',
          'https://rangeos/extensions/scenarioEvent/eventType': 'started',
          'https://rangeos/extensions/scenarioEvent/eventData': { step: 1 },
        },
      },
    });
  });

  it('marks completion and success on a scored auPassed statement', async () => {
    await sendAuPassedVerb({ raw: 88, min: 0, max: 100, scaled: 0.88 });

    expect(sentStatement().result).toEqual({
      completion: true,
      success: true,
      score: { raw: 88, min: 0, max: 100, scaled: 0.88 },
    });
  });

  it('sends auPassed with no result when there are no scores', async () => {
    await sendAuPassedVerb(undefined);

    expect(sentStatement().result).toBeUndefined();
  });

  it('gives every statement a fresh id, actor and context', async () => {
    await sendInitializedVerb();

    expect(sentStatement()).toMatchObject({
      id: 'statement-id',
      actor: { objectType: 'Agent', mbox: 'mailto:test@example.com' },
      context: {
        registration: 'registration-id',
        extensions: { 'https://example.com/context': true },
      },
    });
    expect(sentStatement().timestamp).toEqual(expect.any(String));
  });

  it.each([
    ['sendInitializedVerb', () => sendInitializedVerb()],
    ['sendTerminatedVerb', () => sendTerminatedVerb()],
    ['sendRangeosAuthVerb', () => sendRangeosAuthVerb()],
    ['sendClassEventVerb', () => sendClassEventVerb('class-1')],
    ['sendSlideEventVerb', () => sendSlideEventVerb(1, 'navigation')],
    ['sendActivityPassedVerb', () => sendActivityPassedVerb('a', 'quiz' as any, 1)],
  ])('%s sends nothing in dev mode', async (_name, send) => {
    mockCheckForDevMode.mockReturnValue(true);

    await send();

    expect(mockSendStatement).not.toHaveBeenCalled();
  });
});

describe('AU pass/complete reporting by moveOn', () => {
  const scoredActivity = {
    'quiz-1': {
      completed: true,
      passed: true,
      score: { raw: 90, min: 0, max: 100, scaled: 0.9 },
    },
  };

  /**
   * Grade one activity and report the AU, with the post-grading AU flags forced
   * to the given values. Returns which AU verbs went out.
   */
  async function reportAu({
    moveOn,
    auPassed,
    auCompleted,
    auProgress = 100,
    activityStatus = scoredActivity,
  }: Record<string, any>) {
    (calculateProgressPercentage as jest.Mock).mockReturnValue(auProgress);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(auCompleted);
    (isAUPassed as jest.Mock).mockReturnValue(auPassed);
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: true,
      isNowPassed: auPassed,
    });
    mockCalculateQuizScore.mockReturnValue({ raw: 90, min: 0, max: 100 });

    await runActivityScoring({
      progress: makeCourseAUProgress({ moveOn, activityStatus }),
    });

    return sentVerbIds().filter(
      (id) => id === RANGEOS_VERBS.AU_PASSED || id === RANGEOS_VERBS.AU_COMPLETED,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
  });

  it('does not report a pass when the AU was completed but not passed', async () => {
    // Regression: this used to key off "are there any scores?" and reported a
    // pass for a learner who failed.
    const verbs = await reportAu({
      moveOn: 'CompletedOrPassed',
      auPassed: false,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_COMPLETED]);
    expect(cmi5Instance.pass).not.toHaveBeenCalled();
    expect(cmi5Instance.complete).toHaveBeenCalled();
  });

  it('reports a pass when the AU actually passed', async () => {
    const verbs = await reportAu({
      moveOn: 'CompletedOrPassed',
      auPassed: true,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_PASSED]);
    expect(cmi5Instance.pass).toHaveBeenCalledWith({
      raw: 90,
      min: 0,
      max: 100,
      scaled: 0.9,
    });
  });

  it('treats a missing moveOn as CompletedOrPassed', async () => {
    const verbs = await reportAu({
      moveOn: undefined,
      auPassed: false,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_COMPLETED]);
  });

  it('under moveOn Passed, sends nothing when the AU only completed', async () => {
    // Regression: previously sent auPassed unconditionally.
    const verbs = await reportAu({
      moveOn: 'Passed',
      auPassed: false,
      auCompleted: true,
    });

    expect(verbs).toEqual([]);
    expect(cmi5Instance.pass).not.toHaveBeenCalled();
    expect(cmi5Instance.complete).not.toHaveBeenCalled();
  });

  it('under moveOn Passed, sends the pass when the AU passed', async () => {
    const verbs = await reportAu({
      moveOn: 'Passed',
      auPassed: true,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_PASSED]);
  });

  it('under moveOn Completed, never reports a pass', async () => {
    const verbs = await reportAu({
      moveOn: 'Completed',
      auPassed: false,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_COMPLETED]);
    expect(cmi5Instance.pass).not.toHaveBeenCalled();
  });

  it('under moveOn NotApplicable, reports completion', async () => {
    const verbs = await reportAu({
      moveOn: 'NotApplicable',
      auPassed: true,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_COMPLETED]);
  });

  it('under moveOn CompletedAndPassed, sends only completed when not passed', async () => {
    // Regression: previously sent both regardless of auPassed.
    const verbs = await reportAu({
      moveOn: 'CompletedAndPassed',
      auPassed: false,
      auCompleted: true,
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_COMPLETED]);
  });

  it('under moveOn CompletedAndPassed, sends both when both are true', async () => {
    const verbs = await reportAu({
      moveOn: 'CompletedAndPassed',
      auPassed: true,
      auCompleted: true,
    });

    expect(verbs).toEqual([
      RANGEOS_VERBS.AU_COMPLETED,
      RANGEOS_VERBS.AU_PASSED,
    ]);
  });

  it('reports progress but no AU verbs when neither flag is set', async () => {
    const verbs = await reportAu({
      moveOn: 'CompletedOrPassed',
      auPassed: false,
      auCompleted: false,
      auProgress: 50,
    });

    expect(verbs).toEqual([]);
    expect(cmi5Instance.progress).toHaveBeenCalledWith(50);
  });

  it('passes with no score when no activity carries one', async () => {
    const verbs = await reportAu({
      moveOn: 'CompletedOrPassed',
      auPassed: true,
      auCompleted: true,
      activityStatus: { 'quiz-1': { completed: true } },
    });

    expect(verbs).toEqual([RANGEOS_VERBS.AU_PASSED]);
    expect(statementForVerb(RANGEOS_VERBS.AU_PASSED).result).toBeUndefined();
    expect(cmi5Instance.pass).toHaveBeenCalledWith();
  });

  it('does not touch the LMS at all in dev mode', async () => {
    mockCheckForDevMode.mockReturnValue(true);

    await reportAu({
      moveOn: 'CompletedOrPassed',
      auPassed: true,
      auCompleted: true,
    });

    expect(cmi5Instance.progress).not.toHaveBeenCalled();
    expect(cmi5Instance.pass).not.toHaveBeenCalled();
  });
});

describe('activity score calculation by activity type', () => {
  /** Arguments handed to gradeActivity: [id, slideIndex, guid, type, score, passingScore]. */
  const gradeCall = () => {
    const [activityId, slideIndex, slideGuid, activityType, score, passingScore] =
      mockGradeActivity.mock.calls[0];
    return { activityId, slideIndex, slideGuid, activityType, score, passingScore };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
    (calculateProgressPercentage as jest.Mock).mockReturnValue(0);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(false);
    (isAUPassed as jest.Mock).mockReturnValue(false);
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: false,
      isNowPassed: false,
    });
  });

  it('scores a successful codeRunner as 100 and demands a perfect pass', async () => {
    await runActivityScoring({
      resolvedType: 'codeRunner',
      scoreData: { isSuccess: true },
    });

    expect(gradeCall().score).toMatchObject({ raw: 100, max: 100 });
    expect(gradeCall().passingScore).toBe(100);
  });

  it('scores a failed codeRunner as 0', async () => {
    await runActivityScoring({
      resolvedType: 'codeRunner',
      scoreData: { isSuccess: false },
    });

    expect(gradeCall().score).toMatchObject({ raw: 0, scaled: 0 });
  });

  it('scores a codeRunner with no score data as 0', async () => {
    await runActivityScoring({ resolvedType: 'codeRunner', scoreData: undefined });

    expect(gradeCall().score).toMatchObject({ raw: 0 });
  });

  it('scores a scenario as the fraction of completed tasks', async () => {
    await runActivityScoring({
      resolvedType: 'scenario',
      scoreData: { completedTasks: 2, totalTasks: 4 },
    });

    expect(gradeCall().score).toMatchObject({ raw: 50 });
    expect(gradeCall().passingScore).toBe(100);
  });

  it('treats a scenario with no autograders but allCompleted as full marks', async () => {
    await runActivityScoring({
      resolvedType: 'scenario',
      scoreData: { autoGraderResults: [], allCompleted: true, completedTasks: 0, totalTasks: 5 },
    });

    expect(gradeCall().score).toMatchObject({ raw: 100 });
  });

  it('does not award full marks when autograders ran but allCompleted is set', async () => {
    await runActivityScoring({
      resolvedType: 'scenario',
      scoreData: {
        autoGraderResults: [{ passed: false }],
        allCompleted: true,
        completedTasks: 1,
        totalTasks: 4,
      },
    });

    expect(gradeCall().score).toMatchObject({ raw: 25 });
  });

  it('scores an empty scenario payload as 0', async () => {
    await runActivityScoring({ resolvedType: 'scenario', scoreData: {} });

    expect(gradeCall().score).toMatchObject({ raw: 0 });
  });

  it('scores consoles exactly like a scenario', async () => {
    await runActivityScoring({
      resolvedType: 'consoles',
      scoreData: { completedTasks: 3, totalTasks: 4 },
    });

    expect(gradeCall().score).toMatchObject({ raw: 75 });
    expect(gradeCall().passingScore).toBe(100);
  });

  it('scores a scenario with no tasks as 0 rather than overflowing', async () => {
    await runActivityScoring({
      resolvedType: 'scenario',
      scoreData: { completedTasks: 3, totalTasks: 0 },
    });

    expect(gradeCall().score).toMatchObject({ raw: 0, max: 100 });
  });

  it('scores a task-less scenario as 0', async () => {
    await runActivityScoring({
      resolvedType: 'scenario',
      scoreData: { completedTasks: 0, totalTasks: 0 },
    });

    expect(gradeCall().score).toMatchObject({ raw: 0 });
  });

  it('clamps a scenario reporting more completed tasks than it has', async () => {
    await runActivityScoring({
      resolvedType: 'scenario',
      scoreData: { completedTasks: 6, totalTasks: 4 },
    });

    expect(gradeCall().score).toMatchObject({ raw: 100, scaled: 1 });
  });

  it('scores a quiz through calculateQuizScore and honors its passing score', async () => {
    mockCalculateQuizScore.mockReturnValue({ raw: 85, min: 0, max: 100 });

    await runActivityScoring({
      resolvedType: 'quiz',
      activityContent: { cmi5QuizId: 'quiz-1', passingScore: 60 },
      scoreData: { allAnswers: [] },
    });

    expect(mockCalculateQuizScore).toHaveBeenCalledWith(
      { cmi5QuizId: 'quiz-1', passingScore: 60 },
      { allAnswers: [] },
    );
    expect(gradeCall().score).toMatchObject({ raw: 85 });
    expect(gradeCall().passingScore).toBe(60);
  });

  it('falls back to a passing score of 70 when the quiz omits one', async () => {
    mockCalculateQuizScore.mockReturnValue({ raw: 85, min: 0, max: 100 });

    await runActivityScoring({
      resolvedType: 'quiz',
      activityContent: { cmi5QuizId: 'quiz-1' },
    });

    expect(gradeCall().passingScore).toBe(70);
  });

  it('routes a download activity through the quiz path, where it scores 0', async () => {
    // EDGE CASE: download has no branch of its own, so it inherits quiz
    // scoring and can never pass the default 70. Latent today - nothing
    // submits a score for downloads - but it would surface the moment one did.
    mockCalculateQuizScore.mockReturnValue({ raw: 0, min: 0, max: 100 });

    await runActivityScoring({
      resolvedType: 'download',
      activityContent: { uuid: 'download-1' },
    });

    expect(gradeCall().score).toMatchObject({ raw: 0 });
    expect(gradeCall().passingScore).toBe(70);
  });

  it('skips detailed interaction statements for codeRunner and scenario', async () => {
    await runActivityScoring({
      resolvedType: 'codeRunner',
      scoreData: { isSuccess: true },
    });
    expect(sendDetailedInteractionStatements).not.toHaveBeenCalled();

    jest.clearAllMocks();
    (getSlideChangedStatus as jest.Mock).mockReturnValue({});
    await runActivityScoring({ resolvedType: 'scenario', scoreData: {} });
    expect(sendDetailedInteractionStatements).not.toHaveBeenCalled();
  });

  it('still sends interaction statements for consoles, unlike scenario', async () => {
    // EDGE CASE: the exclusion list in sendActivityInteractions omits
    // 'consoles' even though scoring treats it identically to 'scenario'.
    // Harmless today because the helper no-ops without `questions`.
    await runActivityScoring({ resolvedType: 'consoles', scoreData: {} });

    expect(sendDetailedInteractionStatements).toHaveBeenCalled();
  });

  it('does not fail the activity when interaction statements throw', async () => {
    mockCalculateQuizScore.mockReturnValue({ raw: 85, min: 0, max: 100 });
    (sendDetailedInteractionStatements as jest.Mock).mockRejectedValueOnce(
      new Error('lrs down'),
    );

    await expect(runActivityScoring({ resolvedType: 'quiz' })).resolves.toBeDefined();
    expect(mockGradeActivity).toHaveBeenCalled();
  });
});

describe('activity and slide identity resolution', () => {
  const gradedActivityId = () => mockGradeActivity.mock.calls[0][0];
  const gradedSlideGuid = () => mockGradeActivity.mock.calls[0][2];

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
    mockCalculateQuizScore.mockReturnValue({ raw: 80, min: 0, max: 100 });
    (calculateProgressPercentage as jest.Mock).mockReturnValue(0);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(false);
    (isAUPassed as jest.Mock).mockReturnValue(false);
    (getSlideChangedStatus as jest.Mock).mockReturnValue({});
  });

  it.each([
    ['cmi5QuizId', { cmi5QuizId: 'a', uuid: 'b', name: 'c' }, 'a'],
    ['uuid', { uuid: 'b', scenarioUUID: 'c', name: 'd' }, 'b'],
    ['scenarioUUID', { scenarioUUID: 'c', name: 'd' }, 'c'],
    ['name', { name: 'd', scenarioName: 'e' }, 'd'],
    ['scenarioName', { scenarioName: 'e' }, 'e'],
  ])('prefers %s when resolving the activity id', async (_field, content, expected) => {
    await runActivityScoring({
      activityContent: content,
      progress: makeCourseAUProgress({
        slideActivitiesMeta: { 'slide.md': { [expected]: {} } },
      }),
    });

    expect(gradedActivityId()).toBe(expected);
  });

  it('falls back to "unknown" when the content carries no identifier', async () => {
    await runActivityScoring({
      activityContent: {},
      progress: makeCourseAUProgress({
        slideActivitiesMeta: { 'slide.md': { unknown: {} } },
      }),
    });

    expect(gradedActivityId()).toBe('unknown');
  });

  it('uses a supplied slide guid verbatim', async () => {
    await runActivityScoring({ slideGuid: 'explicit.md' });

    expect(gradedSlideGuid()).toBe('explicit.md');
  });

  it('finds the slide by activity id when only one slide hosts it', async () => {
    await runActivityScoring({
      slideIndex: 7,
      progress: makeCourseAUProgress({
        slideActivitiesMeta: { 'a.md': {}, 'b.md': { 'quiz-1': {} } },
      }),
    });

    expect(gradedSlideGuid()).toBe('b.md');
  });

  it('disambiguates a repeated activity by slide index', async () => {
    await runActivityScoring({
      slideIndex: 1,
      progress: makeCourseAUProgress({
        slides: [
          { slideIndex: 0, slideGuid: 'a.md' },
          { slideIndex: 1, slideGuid: 'b.md' },
        ],
        slideActivitiesMeta: { 'a.md': { 'quiz-1': {} }, 'b.md': { 'quiz-1': {} } },
      }),
    });

    expect(gradedSlideGuid()).toBe('b.md');
  });

  it('falls back to the first match when the indexed slide does not host the activity', async () => {
    await runActivityScoring({
      slideIndex: 0,
      progress: makeCourseAUProgress({
        slides: [
          { slideIndex: 0, slideGuid: 'a.md' },
          { slideIndex: 1, slideGuid: 'b.md' },
        ],
        slideActivitiesMeta: { 'b.md': { 'quiz-1': {} }, 'c.md': { 'quiz-1': {} } },
      }),
    });

    expect(gradedSlideGuid()).toBe('b.md');
  });

  it('synthesizes a slide guid from the index when nothing matches', async () => {
    // EDGE CASE: the activity is graded under the synthesized guid - which
    // means gradeActivity has already emitted activityCompleted/passed/failed
    // to the LRS - but the metadata check then discards the progress update,
    // so the store never learns the activity happened.
    const { dispatch } = await runActivityScoring({
      slideIndex: 4,
      progress: makeCourseAUProgress({ slides: [], slideActivitiesMeta: {} }),
    });

    expect(gradedSlideGuid()).toBe('slide-4');
    expect(mockGradeActivity).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('handleActivityScoring failure handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
    mockCalculateQuizScore.mockReturnValue({ raw: 80, min: 0, max: 100 });
    (calculateProgressPercentage as jest.Mock).mockReturnValue(0);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(false);
    (isAUPassed as jest.Mock).mockReturnValue(false);
    (getSlideChangedStatus as jest.Mock).mockReturnValue({});
  });

  it('logs and returns when there is no course progress at all', async () => {
    mockActivityTypeFromDisplayName.mockReturnValue('quiz');
    const dispatch = jest.fn();

    await handleActivityScoring(
      { activityData: {} as any, slideGuid: null, slideIndex: 0 },
      dispatch,
      () => ({ au: { courseAUProgress: null } }) as any,
    );

    expect(mockGradeActivity).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not reject when activityContent is missing', async () => {
    // Regression: getActivityId dereferences activityContent, and this used to
    // run outside the try block, producing an unhandled rejection at the
    // un-awaited AuManager call site.
    mockActivityTypeFromDisplayName.mockReturnValue('quiz');

    await expect(
      handleActivityScoring(
        {
          activityData: { activityContent: null, activityType: 'Quiz' } as any,
          slideGuid: null,
          slideIndex: 0,
        },
        jest.fn(),
        () => ({ au: { courseAUProgress: makeCourseAUProgress() } }) as any,
      ),
    ).resolves.toBeUndefined();
  });

  it('does not reject when slideActivitiesMeta is missing', async () => {
    // Regression: resolveSlideGuid calls Object.entries on it. gradeActivity
    // itself warns about this case, so it is known to happen in the wild.
    const progress = makeCourseAUProgress();
    delete progress.slideActivitiesMeta;
    mockActivityTypeFromDisplayName.mockReturnValue('quiz');

    await expect(
      handleActivityScoring(
        {
          activityData: {
            activityContent: { cmi5QuizId: 'quiz-1' },
            activityType: 'Quiz',
          } as any,
          slideGuid: null,
          slideIndex: 0,
        },
        jest.fn(),
        () => ({ au: { courseAUProgress: progress } }) as any,
      ),
    ).resolves.toBeUndefined();
  });

  it('does not reject when grading throws', async () => {
    mockGradeActivity.mockRejectedValueOnce(new Error('grading exploded'));

    const { dispatch } = await runActivityScoring();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('bails without dispatching when activity metadata is absent after grading', async () => {
    const { dispatch } = await runActivityScoring({
      progress: makeCourseAUProgress({
        slideActivitiesMeta: { 'slide.md': { 'other-activity': {} } },
      }),
      slideGuid: 'slide.md',
    });

    expect(mockGradeActivity).toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches progress on the happy path', async () => {
    (calculateProgressPercentage as jest.Mock).mockReturnValue(42);

    const { dispatch } = await runActivityScoring();

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setCourseAUProgress' }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setAuProgress',
      payload: 42,
    });
  });

  it('does not mutate the store snapshot it was handed', async () => {
    const progress = makeCourseAUProgress();
    (calculateProgressPercentage as jest.Mock).mockReturnValue(99);

    await runActivityScoring({ progress });

    expect(progress.progress.auProgress).toBe(0);
    expect(progress.lastUpdated).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('handleSlideViewed', () => {
  const baseParams = {
    slideGuid: 'slide.md',
    slideName: 'Slide',
    slideNumber: 0,
    eventType: 'navigation' as const,
  };

  const view = (params: any = {}, progress: any = makeCourseAUProgress()) => {
    const dispatch = jest.fn();
    return handleSlideViewed(
      { ...baseParams, ...params },
      dispatch,
      () => ({ au: { courseAUProgress: progress } }) as any,
    ).then(() => ({ dispatch, progress }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
    (calculateProgressPercentage as jest.Mock).mockReturnValue(0);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(false);
    (isAUPassed as jest.Mock).mockReturnValue(false);
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: false,
      isNowPassed: false,
    });
  });

  it('sends nothing when there is no course progress', async () => {
    const dispatch = jest.fn();

    await handleSlideViewed(
      baseParams,
      dispatch,
      () => ({ au: { courseAUProgress: null } }) as any,
    );

    expect(mockSendStatement).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('sends nothing when the slide guid is unknown', async () => {
    const { dispatch } = await view({ slideGuid: 'missing.md' });

    expect(mockSendStatement).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('emits the viewed pair the first time a slide is seen', async () => {
    await view();

    expect(sentVerbIds()).toEqual([
      RANGEOS_VERBS.SLIDE_VIEWED,
      RANGEOS_VERBS.SLIDE_EVENT,
    ]);
  });

  it('does not re-emit the viewed pair on a second view', async () => {
    const progress = makeCourseAUProgress({
      slideStatus: {
        'slide.md': { viewed: true, completed: false, passed: false, failed: false },
      },
    });

    await view({}, progress);

    expect(sentVerbIds()).toEqual([]);
  });

  it('still reports transitions on a re-view of an already-viewed slide', async () => {
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: true,
      isNowPassed: false,
    });
    const progress = makeCourseAUProgress({
      slideStatus: {
        'slide.md': { viewed: true, completed: false, passed: false, failed: false },
      },
    });

    await view({}, progress);

    expect(sentVerbIds()).toEqual([RANGEOS_VERBS.SLIDE_COMPLETED]);
  });

  it('does not repeat a transition that had already happened', async () => {
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: true,
      wasPassed: true,
      isNowCompleted: true,
      isNowPassed: true,
    });

    await view();

    expect(sentVerbIds()).toEqual([
      RANGEOS_VERBS.SLIDE_VIEWED,
      RANGEOS_VERBS.SLIDE_EVENT,
    ]);
  });

  it('carries the event type through to the slideEvent statement', async () => {
    await view({ eventType: 'video_progress_75', slideNumber: 5 });

    expect(statementForVerb(RANGEOS_VERBS.SLIDE_EVENT)).toMatchObject({
      object: { id: 'https://example.com/course/slide-5' },
      result: {
        extensions: {
          'https://rangeos/extensions/slideEvent/type': 'video_progress_75',
        },
      },
    });
  });

  it('does not mutate the store snapshot', async () => {
    (calculateProgressPercentage as jest.Mock).mockReturnValue(75);
    const progress = makeCourseAUProgress();

    await view({}, progress);

    expect(progress.progress.slideStatus['slide.md'].viewed).toBe(false);
    expect(progress.progress.auProgress).toBe(0);
    expect(progress.lastUpdated).toBe('2026-01-01T00:00:00.000Z');
  });

  it('recomputes AU status when making progress', async () => {
    (calculateProgressPercentage as jest.Mock).mockReturnValue(60);

    const { dispatch } = await view({ makeProgress: true });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'setAuProgress',
      payload: 60,
    });
  });

  it('leaves AU progress untouched for a passive re-view of a completed slide', async () => {
    // makeProgress false on an already-completed slide must not recompute.
    const progress = makeCourseAUProgress({
      slideStatus: {
        'slide.md': { viewed: true, completed: true, passed: false, failed: false },
      },
    });
    (calculateProgressPercentage as jest.Mock).mockReturnValue(99);

    const { dispatch } = await view({ makeProgress: false }, progress);

    expect(calculateProgressPercentage).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: 'setAuProgress', payload: 0 });
  });

  it('skips the LRS save when nothing changed and progress is off', async () => {
    const progress = makeCourseAUProgress({
      slideStatus: {
        'slide.md': { viewed: true, completed: true, passed: false, failed: false },
      },
    });

    await view({ makeProgress: false }, progress);

    expect(saveCourseAUProgressToLRS).not.toHaveBeenCalled();
  });

  it('saves to the LRS when a transition occurred even with progress off', async () => {
    (getSlideChangedStatus as jest.Mock).mockReturnValue({
      wasCompleted: false,
      wasPassed: false,
      isNowCompleted: true,
      isNowPassed: false,
    });
    const progress = makeCourseAUProgress({
      slideStatus: {
        'slide.md': { viewed: true, completed: true, passed: false, failed: false },
      },
    });

    await view({ makeProgress: false }, progress);

    expect(saveCourseAUProgressToLRS).toHaveBeenCalled();
  });

  it('swallows helper failures rather than rejecting', async () => {
    (getSlideChangedStatus as jest.Mock).mockImplementation(() => {
      throw new Error('helper exploded');
    });

    await expect(view()).resolves.toBeDefined();
  });

  it('reports AU progress to the LMS once the AU flags change', async () => {
    (calculateProgressPercentage as jest.Mock).mockReturnValue(100);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(true);
    (isAUPassed as jest.Mock).mockReturnValue(true);

    await view({ makeProgress: true });
    await flushPromises();

    expect(cmi5Instance.progress).toHaveBeenCalledWith(100);
  });

  it('does not report AU progress when nothing about the AU changed', async () => {
    await view({ makeProgress: true });
    await flushPromises();

    expect(cmi5Instance.progress).not.toHaveBeenCalled();
  });
});

describe('average score aggregation', () => {
  const passAu = async (activityStatus: Record<string, any>) => {
    (calculateProgressPercentage as jest.Mock).mockReturnValue(100);
    (isAUCompletedCheck as jest.Mock).mockReturnValue(true);
    (isAUPassed as jest.Mock).mockReturnValue(true);
    (getSlideChangedStatus as jest.Mock).mockReturnValue({});
    mockCalculateQuizScore.mockReturnValue({ raw: 90, min: 0, max: 100 });

    await runActivityScoring({
      progress: makeCourseAUProgress({ moveOn: 'Passed', activityStatus }),
    });

    return statementForVerb(RANGEOS_VERBS.AU_PASSED)?.result?.score;
  };

  const scored = (raw: number) => ({
    completed: true,
    passed: true,
    score: { raw, min: 0, max: 100, scaled: raw / 100 },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
  });

  it('reports a single score unchanged', async () => {
    expect(await passAu({ a: scored(80) })).toEqual({
      raw: 80,
      min: 0,
      max: 100,
      scaled: 0.8,
    });
  });

  it('averages several scores', async () => {
    expect(await passAu({ a: scored(80), b: scored(100) })).toMatchObject({
      raw: 90,
      scaled: 0.9,
    });
  });

  it('rounds the averaged raw score to a whole number', async () => {
    expect(
      (await passAu({ a: scored(80), b: scored(90), c: scored(95) })).raw,
    ).toBe(88);
  });

  it('excludes completed activities that carry no score', async () => {
    expect(
      await passAu({ a: scored(60), b: { completed: true, passed: false } }),
    ).toMatchObject({ raw: 60 });
  });

  it('excludes activities that were scored but never completed', async () => {
    expect(
      await passAu({
        a: scored(60),
        b: { completed: false, score: { raw: 100, min: 0, max: 100, scaled: 1 } },
      }),
    ).toMatchObject({ raw: 60 });
  });

  it('includes failed activities in the average', async () => {
    // The AU-level score is a course average, so a failed-but-scored activity
    // drags it down rather than being skipped.
    expect(
      await passAu({
        a: scored(100),
        b: { completed: true, passed: false, score: { raw: 0, min: 0, max: 100, scaled: 0 } },
      }),
    ).toMatchObject({ raw: 50 });
  });

  it('keeps scaled consistent with raw and max across mixed score ranges', async () => {
    // Regression: scaled used to be averaged independently of raw, so with
    // differing maxes the emitted ResultScore contradicted itself (0.7 here,
    // against a raw/max of 58/75).
    const score = await passAu({
      a: { completed: true, score: { raw: 25, min: 0, max: 50, scaled: 0.5 } },
      b: { completed: true, score: { raw: 90, min: 0, max: 100, scaled: 0.9 } },
    });

    expect(score.raw).toBe(58);
    expect(score.max).toBe(75);
    expect(score.scaled).toBeCloseTo(58 / 75, 10);
  });

  it('derives scaled from raw for a uniform 0-100 range', async () => {
    const score = await passAu({ a: scored(80), b: scored(85), c: scored(90) });

    expect(score.raw).toBe(85);
    expect(score.scaled).toBe(0.85);
  });
});

describe('statement transport failures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckForDevMode.mockReturnValue(false);
  });

  it('rejects when the xapi client is unavailable', async () => {
    const xapi = cmi5Instance.xapi;
    (cmi5Instance as any).xapi = null;

    await expect(sendInitializedVerb()).rejects.toThrow('XAPI is null');

    (cmi5Instance as any).xapi = xapi;
  });

  it('rethrows when the LRS rejects a statement', async () => {
    mockSendStatement.mockRejectedValueOnce(new Error('418 teapot'));

    await expect(sendInitializedVerb()).rejects.toThrow('418 teapot');
  });
});
