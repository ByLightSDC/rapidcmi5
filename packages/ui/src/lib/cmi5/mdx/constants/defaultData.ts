import {
  CourseAU,
  CourseData,
  CTFContent,
  DownloadFilesContent,
  JobeContent,
  MoveOnCriteriaEnum,
  QuestionGrading,
  QuestionResponse,
  QuizCompletionEnum,
  QuizContent,
  RC5ScenarioContent,
  ScenarioContent,
  SlideTypeEnum,
  TeamConsolesContent,
} from '@rapid-cmi5/cmi5-build-common';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';

export const jsonFormatSpaces = 1;

export const defaultEmptySlide = {
  slideTitle: 'Slide 1',
  type: SlideTypeEnum.Markdown,
  content: 'New Slide',
  filepath: '',
};

export const defaultAutoGraderData = {
  name: '',
  auId: undefined,
  testId: undefined,
  questionId: undefined,
  correctAnswers: [],
  steps: [],
  interactionName: {},
  interactionDescription: {},
  objective: {},
  context: {},
  script: undefined,
  scenario: undefined,
  metadata: {},
};
export const defaultCreateCourseData = {
  courseName: '',
  courseDescription: '',
  courseId: 'https://',
  firstAuName: 'Introduction',
  importCmi5Zip: false,
};

export const defaultCreateLessonData = {
  courseName: '',
  auName: '',
};
export const defaultCloneRepoData = {
  repoDirName: '',
  repoRemoteUrl: 'https://',
  repoBranch: 'main',
  repoUsername: '',
  repoPassword: '',
  authorName: '',
  authorEmail: ''
};

export const defaultImportRepoZipData = {
  repoDirName: '',
  authorName: '',
  authorEmail: '',
};

export const defaultCommitData = {
  authorName: '',
  authorEmail: '',
  commitMessage: '',
  branch: '',
};

export const defaultGitConfigData = {
  authorName: '',
  authorEmail: '',
  remoteRepoUrl: '',
};

export const defaultAUData: CourseAU = {
  auName: '',
  assetsPath: '',
  backgroundImage: '',
  rangeosScenarioName: '',
  rangeosScenarioUUID: '',
  slides: [],
  teamSSOEnabled: undefined,
  dirPath: '',
};

export const defaultJobeContent: JobeContent = {
  title: 'Jobe In The Box',
  description: '',
  evaluator: '',
  student: '',
  cmi5QuizId: 'jobe-activity-1',
  moveOnCriteria: MoveOnCriteriaEnum.Completed,
};

export const defaultQuestion = {
  question: '',
  type: QuestionResponse.FreeResponse,
  typeAttributes: {
    correctAnswer: '',
    grading: QuestionGrading.Exact,
    options: undefined,
  },
  cmi5QuestionId: '',
};

export const defaultScenarioContent: ScenarioContent = {
  introTitle: '',
  introContent: '',
  confirmStopButtonText: '',
  promptClassId: false,
  stopScenarioButtonTooltip: '',
  stopScenarioMessage: '',
  stopScenarioTitle: '',
};

export const defaultCourseData: CourseData = {
  courseTitle: '',
  courseDescription: '',
  courseId: '',
  blocks: [
    {
      blockName: '',
      blockDescription: '',
      aus: [
        {
          auName: '',
          assetsPath: '',
          backgroundImage: '',
          rangeosScenarioName: '',
          slides: [{ ...defaultEmptySlide }],
          dirPath: '',
        },
      ],
    },
  ],
};

export const defaultQuizContent: QuizContent = {
  cmi5QuizId: 'quiz',
  completionRequired: QuizCompletionEnum.Passed,
  moveOnCriteria: MoveOnCriteriaEnum.CompletedAndPassed,
  passingScore: 80,
  questions: [],
  title: 'Quiz',
};

export const defaultCTFContent: CTFContent = {
  title: 'Capture The Flag',
  questions: [],
  cmi5QuizId: 'quiz',
  completionRequired: QuizCompletionEnum.Attempted,
  moveOnCriteria: MoveOnCriteriaEnum.CompletedAndPassed,
  passingScore: 100,
};

export const defaultDownloadFilesContent: DownloadFilesContent = {
  files: [],
};

/**
 * Scenario activity insertion json
 */
export const defaultScenarioContentData: RC5ScenarioContent = {
  uuid: '',
  name: '',
  promptClass: true,
  moveOnCriteria: MoveOnCriteriaEnum.Completed,
};

export const defaultScenarioContentStr = JSON.stringify(
  defaultScenarioContentData,
  null,
  jsonFormatSpaces,
);

/**
 * Scenario activity insertion json
 */
export const defaultTeamConsolesContentData: TeamConsolesContent = {
  uuid: '',
  name: '',
  moveOnCriteria: MoveOnCriteriaEnum.Completed,
};

export const defaultTeamConsolesContentStr = JSON.stringify(
  defaultTeamConsolesContentData,
  null,
  jsonFormatSpaces,
);

export const defaultQuizContentStr = JSON.stringify(
  defaultQuizContent,
  null,
  jsonFormatSpaces,
);

export const defaultCTFContentStr = JSON.stringify(
  defaultCTFContent,
  null,
  jsonFormatSpaces,
);

export const defaulDownloadFileContentStr = JSON.stringify(
  defaultDownloadFilesContent,
  null,
  jsonFormatSpaces,
);

export const defaultJobeContentStr = JSON.stringify(
  defaultJobeContent,
  null,
  jsonFormatSpaces,
);

/**
 * Retrieve default form data by activity type
 */

export const getDefaultData = (activity: RC5ActivityTypeEnum) => {
  switch (activity) {
    case RC5ActivityTypeEnum.scenario:
      return defaultScenarioContentStr;
    case RC5ActivityTypeEnum.consoles:
      return defaultTeamConsolesContentStr;
    case RC5ActivityTypeEnum.quiz:
      return defaultQuizContentStr;
    case RC5ActivityTypeEnum.ctf:
      return defaultCTFContentStr;
    case RC5ActivityTypeEnum.download:
      return defaulDownloadFileContentStr;
    case RC5ActivityTypeEnum.jobe:
      return defaultJobeContentStr;
  }
  return null;
};
