// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

//the BE type name "Element' conflicts with React Element type, so duplicating here
export interface KSATElement {
  element_identifier?: string;
  element_type?: 'task' | 'knowledge' | 'skill';
  title?: string;
  text?: string;
  doc_identifier?: string;
}

export type BaseActivity = {
  rc5id?: string;
  ksats?: KSATElement[]; // Array of KSAT elements
  moveOnCriteria?: MoveOnCriteriaEnum;
};

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

export const getDisplayNameFromSlideType = (activity: RC5ActivityTypeEnum) => {
  const lookUpKey =
    Object.keys(RC5ActivityTypeEnum)[
      Object.values(RC5ActivityTypeEnum).indexOf(activity)
    ];
  return RC5ActivityTypeEnum[lookUpKey as keyof typeof RC5ActivityTypeEnum];
};

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

export enum MoveOnCriteriaEnum {
  Completed = 'completed',
  Passed = 'passed',
  CompletedAndPassed = 'completed-and-passed',
  NotApplicable = 'not-applicable',
}

export const moveOnCriteriaOptions = Object.values(MoveOnCriteriaEnum);
