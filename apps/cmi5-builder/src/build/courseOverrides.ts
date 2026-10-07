import {
  CourseData,
  QuestionGrading,
  QuestionResponse,
  QuizCompletionEnum,
  QuizContent,
  SlideType,
} from '@rapid-cmi5/cmi5-build-common';

export interface CourseMeta {
  courseName?: string;
  courseDescription?: string;
  courseBaseId?: string;
  // Mostly for opendash, puts a quiz in the last AU that the user must type in "Complete"
  // This prevents a student from finishing a cmi5 course before they are ready.
  completionExam?: boolean;
  scenarioOverride?: {
    uuid?: string;
    name?: string;
    introTitle?: string;
    introContent?: string;
    promptClassId?: boolean;
  };
}

export function applyOverrides(course: CourseData, o: CourseMeta): CourseData {
  const courseTitle = o.courseName ?? course.courseTitle;
  const courseId = o.courseBaseId ?? course.courseId;
  const courseDescription = o.courseDescription ?? course.courseDescription;

  const nextBlocks = (course.blocks ?? []).map((block) => {
    const blockName = o.courseName ?? block.blockName ?? courseTitle;
    const blockDescription =
      o.courseDescription ?? block.blockDescription ?? courseDescription;

    const nextAus = (block.aus ?? []).map((au) => {
      const rangeosScenarioName =
        o.scenarioOverride?.name ?? au.rangeosScenarioName;
      const rangeosScenarioUUID =
        o.scenarioOverride?.uuid ?? au.rangeosScenarioUUID;
      const promptClassId =
        o.scenarioOverride?.promptClassId ?? au.promptClassId;

      const scenarioSlide = makeScenarioSlide({
        uuid: rangeosScenarioUUID,
        name: rangeosScenarioName,
        promptClassId,
      });

      // Idempotently ensure the scenario slide is first
      const slides = ensureScenarioFirst(au.slides ?? [], scenarioSlide);

      return {
        ...au,
        rangeosScenarioName,
        rangeosScenarioUUID,
        promptClassId,
        slides,
      };
    });

    return {
      ...block,
      blockName,
      blockDescription,
      aus: nextAus,
    };
  });

  let nextCourse: CourseData = {
    ...course,
    courseTitle,
    courseId,
    courseDescription,
    blocks: nextBlocks,
  };

  if (o.completionExam) {
    nextCourse = ensureCompletionExam(nextCourse);
  }

  return nextCourse;
}

function makeScenarioSlide(args: {
  uuid?: string;
  name?: string;
  promptClassId?: boolean;
}): SlideType {
  const promptClass =
    typeof args.promptClassId === 'number' ? args.promptClassId : false;

  const payload = {
    uuid: args.uuid ?? '',
    name: args.name ?? '',
    promptClass,
  };

  return {
    slideTitle: 'Lab',
    content: [
      ':::scenario',
      '```json',
      JSON.stringify(payload, null, 2),
      '```',
      ':::',
    ].join('\n'),
    filepath: '',
  };
}

function isScenarioSlide(slide?: SlideType): boolean {
  if (slide?.content) {
    return slide?.content.includes(':::scenario');
  }
  return false;
}

function ensureScenarioFirst(
  slides: SlideType[],
  scenario: SlideType,
): SlideType[] {
  if (slides.length === 0) return [scenario];
  if (isScenarioSlide(slides[0])) return slides; // already first → idempotent
  // remove any existing scenario slide elsewhere to avoid duplicates
  const filtered = slides.filter((s) => !isScenarioSlide(s));
  return [scenario, ...filtered];
}

function ensureCompletionExam(course: CourseData): CourseData {
  const blocks = course.blocks ?? [];
  if (blocks.length === 0) return course;

  const lastBlockIndex = blocks.length - 1;
  const lastBlock = blocks[lastBlockIndex];
  const aus = lastBlock.aus ?? [];
  if (aus.length === 0) return course;

  const lastAuIndex = aus.length - 1;
  const lastAu = aus[lastAuIndex];
  const slides = lastAu.slides ?? [];

  // prevent duplicate completion slides
  const hasCompletion = slides.some(
    (s) =>
      typeof s.content === 'string' &&
      s.content.includes(':::quiz') &&
      s.content.includes('"cmi5QuizId": "course-completion"'),
  );
  if (hasCompletion) return course;

  const completionQuestion: QuizContent = {
    cmi5QuizId: 'course-completion',
    completionRequired: QuizCompletionEnum.Passed,
    passingScore: 100,
    questions: [
      {
        question: 'Type in : "Complete" in order to finish the exam.',
        type: QuestionResponse.FreeResponse,
        typeAttributes: {
          correctAnswer: 'Complete',
          grading: QuestionGrading.Exact,
        },
        cmi5QuestionId: 'course-complete',
      },
    ],
  };

  const completionSlide: SlideType = {
    slideTitle: 'Course Completion Acknowledgement',
    content: [
      ':::quiz',
      '```json',
      JSON.stringify(completionQuestion, null, 2),
      '```',
      ':::',
    ].join('\n'),
    filepath: '',
  };

  const nextAu = { ...lastAu, slides: [...slides, completionSlide] };
  const nextAus = [
    ...aus.slice(0, lastAuIndex),
    nextAu,
    ...aus.slice(lastAuIndex + 1),
  ];
  const nextBlock = { ...lastBlock, aus: nextAus };
  const nextBlocks = [
    ...blocks.slice(0, lastBlockIndex),
    nextBlock,
    ...blocks.slice(lastBlockIndex + 1),
  ];

  return { ...course, blocks: nextBlocks };
}
