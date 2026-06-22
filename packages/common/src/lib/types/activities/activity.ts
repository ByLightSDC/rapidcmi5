/**
 * Activity Status State Types
 *
 * This file defines the types for tracking individual activity completion and passing status
 * in the LRS Activity State system.
 */

import { CodeRunnerContent } from './codeRunner';
import { CTFContent } from './ctf';
import { DownloadFilesContent } from './download';
import { QuizContent } from './quiz';
import { ScenarioContent } from './scenario';
import { ActivityScore } from './score';

export type ActivityContent =
  | ScenarioContent
  | QuizContent
  | CTFContent
  | CodeRunnerContent
  | DownloadFilesContent;

// Activity types enum for type safety
export enum SlideActivityType {
  QUIZ = 'quiz',
  CTF = 'ctf',
  AUTOGRADER = 'autograder',
  SCENARIO = 'scenario',
  CODE_RUNNER = 'codeRunner',
  CONSOLES = 'consoles',
  DOWNLOAD = 'download',
  UNKNOWN = 'unknown',
}

// Legacy type alias for backward compatibility
export type ActivityType = SlideActivityType;

// Legacy constant for backward compatibility (deprecated - use SlideActivityType enum instead)
export const SLIDE_ACTIVITY_TYPES = Object.values(SlideActivityType);

export type DirectiveToActivityMapping =
  | { name: 'scenario'; content: ScenarioContent }
  | { name: 'quiz'; content: QuizContent }
  | { name: 'ctf'; content: CTFContent }
  | { name: 'codeRunner'; content: CodeRunnerContent }
  | { name: 'consoles'; content: ScenarioContent }
  | { name: 'download'; content: DownloadFilesContent };

export enum RC5ActivityTypeEnum {
  consoles = 'Team Exercise',
  ctf = 'Capture The Flag',
  download = 'Download File',
  codeRunner = 'Code Runner',
  quiz = 'Quiz',
  scenario = 'Scenario',
}

export type QuizVarations = RC5ActivityTypeEnum.ctf | RC5ActivityTypeEnum.quiz;

export const ActivityType: string[] = Object.keys(RC5ActivityTypeEnum);

export const activityLabels = Object.values(RC5ActivityTypeEnum).sort((a, b) =>
  a.localeCompare(b),
);

export const getActivityTypeFromDisplayName = (
  displayName: RC5ActivityTypeEnum,
) => {
  const keys = Object.keys(RC5ActivityTypeEnum).filter(
    (key) =>
      RC5ActivityTypeEnum[key as keyof typeof RC5ActivityTypeEnum] ===
      displayName,
  );
  return keys.length > 0 ? keys[0] : 'unknown';
};

export type ActivityJsonNode = {
  type: string;
  value: string;
};

export interface SlideActivityScore {
  raw: number;
  min: number;
  max: number;
  scaled?: number;
}

export interface ActivityScoringParams {
  activityData: ActivityScore;
  slideGuid: string | null; // Can be null - function will determine it
  slideIndex: number;
}
export interface SlideActivityStatus {
  type: ActivityType;
  slideIndex: number;
  slideGuid: string;
  completed: boolean;
  passed: boolean;
  completedAt?: string;
  passedAt?: string;
  score?: SlideActivityScore;
  metadata?: Record<string, unknown>;
  meetsCriteria?: boolean;
}

export interface SlideActivityStatusState {
  [activityId: string]: SlideActivityStatus;
}

// Store ID for Activity Status State
export const ACTIVITY_STATUS_STORE_ID = '/states/activityStatus';

// Helper type for activity completion payload
export interface ActivityCompletionPayload {
  activityId: string;
  slideIndex: number;
  slideGuid: string;
  type: ActivityType;
  score?: SlideActivityScore;
  metadata?: Record<string, unknown>;
  meetsCriteria?: boolean;
}

// Helper type for activity passing payload
export interface ActivityPassingPayload {
  activityId: string;
  score?: SlideActivityScore;
  metadata?: Record<string, unknown>;
}
