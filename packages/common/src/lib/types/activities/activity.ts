// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { CodeRunnerContent } from './codeRunner';
import { CTFContent } from './ctf';
import { DownloadFilesContent } from './download';
import { QuizContent } from './quiz';
import { ScenarioContent } from './scenario';

export type ActivityContent =
  | ScenarioContent
  | QuizContent
  | CTFContent
  | CodeRunnerContent
  | DownloadFilesContent;

export enum RC5ActivityTypeEnum {
  consoles = 'Team Exercise',
  ctf = 'Capture The Flag',
  download = 'Download File',
  codeRunner = 'Code Runner',
  quiz = 'Quiz',
  scenario = 'Scenario',
}

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
