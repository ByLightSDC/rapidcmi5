import {
  CodeRunnerContent,
  MoveOnCriteriaEnum,
  QuestionResponse,
  QuestionGrading,
  CourseData,
  QuizContent,
  QuizCompletionEnum,
  CTFContent,
  DownloadFilesContent,
  RC5ActivityTypeEnum,
  ContentWidthEnum,
  ScenarioContent,
  CourseAU,
  SlideType,
} from '@rapid-cmi5/cmi5-build-common';
import {
  CreateCommitType,
  CreateCourseType,
  CreateLessonType,
  CreateLocalRepoType,
  GitConfigType,
  ImportRepoZipType,
} from './courseBuilderFormTypes';

export const jsonFormatSpaces = 1;

export const defaultEmptySlide: SlideType = {
  slideTitle: 'Slide 1',
  content: '# Slide',
  filepath: '',
};

export const defaultCreateCourseData: CreateCourseType = {
  courseName: '',
  courseDescription: '',
  courseId: 'https://',
  firstAuName: 'Introduction',
};

export const defaultCreateLessonData: CreateLessonType = {
  courseName: '',
  auName: '',
  blockName: '',
  coursePath: '',
};

export const defaultCloneRepoData: CreateLocalRepoType = {
  repoDirName: '',
  repoRemoteUrl: 'https://',
  repoBranch: 'main',
  repoUsername: '',
  repoPassword: '',
  authorName: '',
  authorEmail: '',
};

export const defaultImportRepoZipData: ImportRepoZipType = {
  repoDirName: '',
  authorName: '',
  authorEmail: '',
};

export const defaultCommitData: CreateCommitType = {
  authorName: '',
  authorEmail: '',
  commitMessage: '',
  branch: '',
};

export const defaultGitConfigData: GitConfigType = {
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
  buildTimeProps: {},
};

export const defaultCodeRunnerContent: CodeRunnerContent = {
  title: 'Code Runner',
  description: '',
  evaluator: '',
  student: '',
  cmi5QuizId: 'code-runner-activity-1',
  moveOnCriteria: MoveOnCriteriaEnum.Completed,
  languageVersion: '3.12.3',
  programmingLanguage: 'python3',
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
  promptClassId: false,
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
          slides: [{ ...defaultEmptySlide }],
          dirPath: '',
          buildTimeProps: {},
        },
      ],
    },
  ],
  buildTimeProps: {},
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
export const defaultScenarioContentData: ScenarioContent = {
  uuid: '',
  name: '',
  promptClass: false,
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
export const defaultTeamConsolesContentData: ScenarioContent = {
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

export const defaultCodeRunnerContentStr = JSON.stringify(
  defaultCodeRunnerContent,
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
    case RC5ActivityTypeEnum.codeRunner:
      return defaultCodeRunnerContentStr;
  }
};

/**
 * Retrieved default content width
 */

export const getDefaultContentWidth = (activity: RC5ActivityTypeEnum) => {
  switch (activity) {
    case RC5ActivityTypeEnum.scenario:
      return ContentWidthEnum.Medium;
    case RC5ActivityTypeEnum.consoles:
      return ContentWidthEnum.Medium;
    case RC5ActivityTypeEnum.quiz:
      return ContentWidthEnum.Medium;
    case RC5ActivityTypeEnum.ctf:
      return ContentWidthEnum.Large;
    case RC5ActivityTypeEnum.download:
      return ContentWidthEnum.Small;
    case RC5ActivityTypeEnum.codeRunner:
      return ContentWidthEnum.Medium;
  }
};
