import { KSATElement, MoveOnCriteriaEnum } from './activity';
import { AuAutoGrader, SlideType } from './slide';

export type Cmi5Scenario = {
  uuid?: string;
  name?: string;
  message?: string;
  status?: string;
};

/**
 * @typedef {Object} CourseAU
 * @property {string} auName Lesson AU Name
 * @property {string} [assetsPath] Assets Path
 * @property {string} [backgroundImage] Background Image
 * @property {boolean} [promptClassId = true] Whether User Should Be Required to Enter Class Id
 * @property {Array<SlideType>} slides Slide Content
 * @property {string} [title] Title
 * @property {string} [rangeosScenarioName] Scenario Name
 * @property {string} [rangeosScenarioUUID] Scenario Id
 * @property {string} [rangeosScenarioDraftUUID] Draft Id
 * @property {boolean} [teamSSOEnabled] Whether SSO is enabled for team exercise
 * @property {string} [dirPath] Directory Path
 */

// --- Lesson Theme Defaults ---

export enum ContentWidthEnum {
  None = 'none',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum BlockPaddingEnum {
  None = 'none',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Custom = 'custom',
}

export enum DefaultAlignmentEnum {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export type LessonTheme = {
  contentWidth?: ContentWidthEnum;
  blockPadding?: BlockPaddingEnum;
  blockPaddingCustomValue?: number;
  defaultAlignment?: DefaultAlignmentEnum;
};

export const contentWidthOptions = Object.values(ContentWidthEnum);
export const blockPaddingOptions = Object.values(BlockPaddingEnum);
export const defaultAlignmentOptions = Object.values(DefaultAlignmentEnum);

export type CourseAU = {
  auName: string;
  assetsPath?: string;
  description?: string;
  backgroundImage?: string;
  promptClassId?: boolean;
  defaultClassId?: string;
  // CMI5 moveOn rule for this AU. Defaults to "CompletedOrPassed" if omitted
  // Allowed values per CMI5 spec: Passed | Completed | CompletedAndPassed | CompletedOrPassed | NotApplicable
  moveOn?: 'Passed' | 'Completed' | 'CompletedAndPassed' | 'CompletedOrPassed' | 'NotApplicable';
  slides: SlideType[];
  title?: string;
  rangeosScenarioName?: string;
  rangeosScenarioUUID?: string;
  rangeosScenarioDraftUUID?: string;
  teamSSOEnabled?: boolean;
  dirPath: string;
  ksats?: KSATElement[];
  moveOnCriteria?: MoveOnCriteriaEnum;
  lessonTheme?: LessonTheme;
};

export enum Operation {
  // Covers deleting a slide or AU
  Delete = 'Delete',
  // Covers any change to the slide or AU
  Edit = 'Edit',
  // Covers adding a new slide or AU
  Add = 'Add',
  // Slide was created and then deleted
  Cancel = 'Cancel',
}

export type CourseBlock = {
  blockName: string;
  blockDescription?: string;
  aus: CourseAU[];
};

export type CourseData = {
  author?: string;
  courseTitle: string;
  courseDescription?: string;
  courseId: string;
  blocks: CourseBlock[];
  designer?: any;
  rc5Version?: string;
};

export enum CourseLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}
