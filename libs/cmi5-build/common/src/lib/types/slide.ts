// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { BaseActivity, KSATElement } from './activity';
import { CTFContent } from './ctf';
import { JobeContent } from './jobe';
import { QuizContent } from './quiz';
import { SxProps } from '@mui/material';

export const defaultSlideContent = '# Slide'; //TODO focus issues if you try to paste blank

export enum SlideTypeEnum {
  CTF = 'ctf',
  Quiz = 'quiz',
  Markdown = 'markdown',
  Scenario = 'rangeosScenario',
  SourceDoc = 'sourceDoc',
  JobeInTheBox = 'jobeInTheBox',
}

export const slideOptions = Object.values(SlideTypeEnum);

/**
 * @typedef {Object} ScenarioContent
 * @property {string} [introTitle] Slide Title
 * @property {string} [introContent] Slide Content
 * @property {string} [confirmStopButtonText] Button Text that apears on confirmation button in dialog prompt
 * @property {string} [stopScenarioButtonTooltip] Tooltip text for stop icon
 * @property {string} [stopScenarioMessage] Prompt message for stop scenario confirmation
 * @property {string} [stopScenarioTitle] Prompt title message for stop scenario confirmation
 */
export type ScenarioContent = {
  introTitle?: string; // slideTitle
  introContent?: string; // instructions
  defaultClassId?: string;
  confirmStopButtonText?: string;
  stopScenarioButtonTooltip?: string;
  stopScenarioMessage?: string;
  stopScenarioTitle?: string;
  scenarioUUID?: string;
  scenarioName?: string;
  uuid?: string; // Added for consistency with markdown format
  name?: string; // Added for consistency with markdown format
  promptClassId?: boolean;
  promptClass?: boolean; // Added for consistency with markdown format
  autoGraders?: AuAutoGrader[];
  cmi5QuizId?: string; // Activity ID for LRS tracking
  completionRequired?: string; // Completion requirement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ksats?: KSATElement[]; // Array of KSAT elements
};

/**
 * New data type for RC5 will replace ScenarioContent above
 */
export type RC5ScenarioContent = BaseActivity & {
  uuid: string;
  name?: string;
  promptClass?: boolean;
  cmi5QuizId?: string; // Activity ID for LRS tracking (consistent with other activities)
};

// AutoGrader event structure from GraphQL subscription
export type AutoGraderEventResult = {
  answers: {
    performance: number;
  };
  success: boolean;
};

export type AutoGraderEventData = {
  name: string;
  telemetryAgent: string;
  uuid: string;
  metadata: {
    rangeOsUI: {
      quizQuestion: {
        question: string;
        activityId: string;
        questionId: string;
        questionType: string;
      };
    };
  };
};

export type AutoGraderEvent = {
  result: AutoGraderEventResult;
  autoGrader: AutoGraderEventData;
};

// Response from scenario completion for LRS tracking
export type ScenarioSubmitResponse = {
  completedTasks: number;
  totalTasks: number;
  allCompleted: boolean;
  autoGraderResults: AutoGraderEvent[];
};

export type AuAutoGrader = {
  name: string;
  activityId: string;
  questionId: string;
  uuid: string;
  question: string;
  questionType: string;
};

/**
 * @typedef {Object} SourceDocContent
 * @property {string} [introContent] Slide Content that appears above source doc
 * @property {string} [sourceDoc] iFrame Source Doc
 * @property {any} [styleProps] iFrame Styles If iFrame content sizes itself based on parent, we need to pass min dimensions in
 */
export type SourceDocContent = {
  introContent?: string;
  sourceDoc: string;
  styleProps?: SxProps;
};

/**
 * @typedef {Object} SlideType
 * @property {SlideTypeEnum} type Slide Type
 * @property {string} slideTitle  Slide Title
 * @property {string | ScenarioContent} Slide Content
 */
export type SlideType = {
  type: SlideTypeEnum;
  slideTitle: string;
  content?:
    | string
    | ScenarioContent
    | QuizContent
    | CTFContent
    | JobeContent
    | SourceDocContent;
  display?: string;
  filepath: string;
};

/**
 * @interface ScenarioSlide
 * @property {SlideTypeEnum} type Slide Type
 * @property {string} slideTitle  Slide Title
 * @property {ScenarioContent} Slide Content
 */
export interface ScenarioSlide extends SlideType {
  type: SlideTypeEnum;
  slideTitle: string;
  content: ScenarioContent;
}

/**

 */
export type SlideDevContent = {
  url: string;
};
