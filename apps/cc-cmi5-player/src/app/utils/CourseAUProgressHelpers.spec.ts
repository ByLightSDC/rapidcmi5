import {
  calculateProgressPercentage,
  getCourseAUProgressFromLRS,
  getFirstIncompleteSlideIndex,
  getSlideChangedStatus,
  initializeCourseAUProgress,
  isAUCompletedByMoveOn,
  isAUPassed,
  saveCourseAUProgressToLRS,
  updateSlideStatus,
} from './CourseAUProgressHelpers';
import { getActivityStatusKey } from './ActivityStatusKey';
import { cmi5Instance } from '../session/cmi5';
import {
  sendSlideCompletedVerb,
  sendSlidePassingVerb,
} from './LmsStatementManager';

jest.mock('@rapid-cmi5/cmi5-build-common', () => ({
  ...jest.requireActual('@rapid-cmi5/cmi5-build-common'),
  getValidDirectiveMap: (content: string) => {
    const directives = {
      quiz: [] as any[],
      ctf: [] as any[],
      codeRunner: [] as any[],
      scenario: [] as any[],
      consoles: [] as any[],
      download: [] as any[],
    };
    const pattern =
      /:::(quiz|ctf|codeRunner|scenario|consoles)(?:\{[^}]*\})?\s*```json\s*({[\s\S]*?})\s*```\s*:::/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      directives[match[1] as keyof typeof directives].push(
        JSON.parse(match[2]),
      );
    }
    return directives;
  },
}));

jest.mock('../session/cmi5', () => ({
  cmi5Instance: {
    xapi: null,
    getLaunchParameters: jest.fn(() => ({
      actor: { objectType: 'Agent', mbox: 'mailto:test@example.com' },
      activityId: 'https://example.com/course',
    })),
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

jest.mock('./LmsStatementManager', () => ({
  sendSlideCompletedVerb: jest.fn().mockResolvedValue(undefined),
  sendSlidePassingVerb: jest.fn().mockResolvedValue(undefined),
}));

const quizSlide = (
  filepath: string,
  activityId = 'quiz',
  completionRequired = 'passed',
) => ({
  filepath,
  slideTitle: filepath,
  content: `:::quiz
\`\`\`json
${JSON.stringify({
  cmi5QuizId: activityId,
  completionRequired,
  passingScore: 80,
  questions: [],
})}
\`\`\`
:::`,
});

const courseWithDuplicateQuizIds = () =>
  ({
    auName: 'quiz-au',
    title: 'Quiz AU',
    moveOn: 'CompletedAndPassed',
    slides: [quizSlide('slides/01.md'), quizSlide('slides/02.md')],
  }) as any;

describe('CourseAUProgressHelpers', () => {
  afterEach(() => {
    (cmi5Instance as any).xapi = null;
    jest.clearAllMocks();
  });

  it('creates independent statuses when different slides reuse an activity ID', () => {
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const firstKey = getActivityStatusKey('slides/01.md', 'quiz');
    const secondKey = getActivityStatusKey('slides/02.md', 'quiz');

    expect(Object.keys(progress.progress.activityStatus)).toEqual([
      firstKey,
      secondKey,
    ]);
    expect(progress.progress.activityStatus[firstKey].slideIndex).toBe(0);
    expect(progress.progress.activityStatus[secondKey].slideIndex).toBe(1);
  });

  it('does not let a passed quiz satisfy another slide with the same ID', () => {
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const firstKey = getActivityStatusKey('slides/01.md', 'quiz');

    progress.progress.activityStatus[firstKey] = {
      ...progress.progress.activityStatus[firstKey],
      completed: true,
      passed: true,
      meetsCriteria: true,
    };

    const firstChange = getSlideChangedStatus(progress, 'slides/01.md');
    const secondChange = getSlideChangedStatus(progress, 'slides/02.md');

    expect(firstChange).toMatchObject({
      isNowCompleted: true,
      isNowPassed: true,
    });
    expect(secondChange).toMatchObject({
      isNowCompleted: false,
      isNowPassed: false,
    });
  });

  it('counts slide and activity progress independently', () => {
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const firstKey = getActivityStatusKey('slides/01.md', 'quiz');

    progress.progress.activityStatus[firstKey].meetsCriteria = true;
    progress.progress.slideStatus['slides/01.md'].passed = true;

    // Two slides + two gradable quizzes = four total progress steps.
    expect(progress.progress.totalProgressSteps).toBe(4);
    expect(calculateProgressPercentage(progress)).toBe(50);
  });

  it.each([
    ['Completed', true, false, true, false],
    ['Passed', false, true, true, true],
    ['CompletedAndPassed', true, false, false, false],
    ['CompletedAndPassed', true, true, true, true],
    ['CompletedOrPassed', false, true, true, true],
    ['NotApplicable', false, false, true, true],
  ])(
    'applies %s moveOn semantics',
    (moveOn, completed, passed, expectedCompleted, expectedPassed) => {
      const progress = initializeCourseAUProgress({
        auJson: courseWithDuplicateQuizIds(),
      });
      progress.courseStructure.moveOn = moveOn as any;
      Object.values(progress.progress.slideStatus).forEach((status) => {
        status.completed = completed as boolean;
        status.passed = passed as boolean;
      });

      expect(isAUCompletedByMoveOn(progress)).toBe(expectedCompleted);
      expect(isAUPassed(progress)).toBe(expectedPassed);
    },
  );

  it('returns the first incomplete slide and handles an empty AU', () => {
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    progress.progress.slideStatus['slides/01.md'].completed = true;

    expect(getFirstIncompleteSlideIndex(progress)).toBe(1);

    const empty = initializeCourseAUProgress({
      auJson: { auName: 'empty', slides: [] } as any,
    });
    expect(getFirstIncompleteSlideIndex(empty)).toBe(0);
    expect(isAUCompletedByMoveOn(empty)).toBe(true);
  });

  it('stores only mutable progress in the course State API document', async () => {
    const createState = jest.fn().mockResolvedValue(undefined);
    (cmi5Instance as any).xapi = { createState };
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });

    await saveCourseAUProgressToLRS(progress);

    expect(createState).toHaveBeenCalledWith({
      agent: { objectType: 'Agent', mbox: 'mailto:test@example.com' },
      activityId: 'https://example.com/course',
      stateId: 'https://example.com/course/states/courseAUProgress',
      state: {
        progress: progress.progress,
        lastUpdated: progress.lastUpdated,
        version: progress.version,
      },
    });
  });

  it('retrieves the course progress State API document', async () => {
    const savedProgress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const getState = jest.fn().mockResolvedValue({ data: savedProgress });
    (cmi5Instance as any).xapi = { getState };

    await expect(
      getCourseAUProgressFromLRS('https://example.com/course'),
    ).resolves.toBe(savedProgress);
    expect(getState).toHaveBeenCalledWith({
      agent: { objectType: 'Agent', mbox: 'mailto:test@example.com' },
      activityId: 'https://example.com/course',
      stateId: 'https://example.com/course/states/courseAUProgress',
    });
  });

  it('does not report a slide complete when a pass-required activity failed', async () => {
    // Regression: updateSlideStatus used to test `status.completed === true`
    // directly, ignoring completionRequired, so a graded-but-failed quiz on a
    // `passed`-required slide still emitted slideCompleted.
    const createState = jest.fn().mockResolvedValue(undefined);
    (cmi5Instance as any).xapi = { createState };
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const activityKey = getActivityStatusKey('slides/01.md', 'quiz');
    progress.progress.activityStatus[activityKey].completed = true;
    progress.progress.activityStatus[activityKey].passed = false;

    await updateSlideStatus(progress, 'slides/01.md', 0);

    expect(sendSlideCompletedVerb).not.toHaveBeenCalled();
    expect(sendSlidePassingVerb).not.toHaveBeenCalled();
    expect(progress.progress.slideStatus['slides/01.md'].completed).toBe(false);
  });

  it('reports a slide complete once a pass-required activity passes', async () => {
    const createState = jest.fn().mockResolvedValue(undefined);
    (cmi5Instance as any).xapi = { createState };
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const activityKey = getActivityStatusKey('slides/01.md', 'quiz');
    progress.progress.activityStatus[activityKey].completed = true;
    progress.progress.activityStatus[activityKey].passed = true;

    await updateSlideStatus(progress, 'slides/01.md', 0);

    expect(sendSlideCompletedVerb).toHaveBeenCalledWith(0);
  });

  it('sends slide verbs when recalculation has already updated the slide', async () => {
    const createState = jest.fn().mockResolvedValue(undefined);
    (cmi5Instance as any).xapi = { createState };
    const progress = initializeCourseAUProgress({
      auJson: courseWithDuplicateQuizIds(),
    });
    const activityKey = getActivityStatusKey('slides/01.md', 'quiz');
    progress.progress.activityStatus[activityKey].completed = true;
    progress.progress.activityStatus[activityKey].passed = true;

    const change = getSlideChangedStatus(progress, 'slides/01.md');
    await updateSlideStatus(progress, 'slides/01.md', 0, change);

    expect(sendSlideCompletedVerb).toHaveBeenCalledWith(0);
    expect(sendSlidePassingVerb).toHaveBeenCalledWith(0);
    expect(createState).toHaveBeenCalledTimes(1);
  });
});
