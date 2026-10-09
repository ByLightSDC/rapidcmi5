import {
  RC5ActivityTypeEnum,
  ScenarioContent,
} from '@rapid-cmi5/cmi5-build-common';

/**
 * How a scenario activity gets deployed. Each type maps onto markdown that
 * already exists, so the player and course builder are unaffected:
 *   individual -> :::scenario  { promptClass: false }
 *   class      -> :::scenario  { promptClass: true, defaultClassId }
 *   team       -> :::consoles
 */
export enum ScenarioDeploymentType {
  Individual = 'individual',
  Class = 'class',
  Team = 'team',
}

export const teamDirectiveName = 'consoles' as const;
export const scenarioDirectiveName = 'scenario' as const;

/**
 * Derive the deployment type from an existing directive.
 * Returns undefined for a freshly inserted :::scenario that has no type yet
 * (no promptClass and no scenario selected), which shows the type chooser.
 * @param {string} directiveName mdast directive name (scenario | consoles)
 * @param {ScenarioContent} content Directive json
 * @return {ScenarioDeploymentType | undefined}
 */
export const getScenarioDeploymentType = (
  directiveName: string,
  content?: ScenarioContent,
): ScenarioDeploymentType | undefined => {
  if (directiveName === teamDirectiveName) {
    return ScenarioDeploymentType.Team;
  }
  if (content?.promptClass === true) {
    return ScenarioDeploymentType.Class;
  }
  if (content?.promptClass === false || content?.uuid) {
    return ScenarioDeploymentType.Individual;
  }
  return undefined;
};

/**
 * Activity type that a deployment type saves as
 * @param {ScenarioDeploymentType} scenarioType
 * @return {RC5ActivityTypeEnum}
 */
export const getActivityForDeploymentType = (
  scenarioType: ScenarioDeploymentType,
) =>
  scenarioType === ScenarioDeploymentType.Team
    ? RC5ActivityTypeEnum.consoles
    : RC5ActivityTypeEnum.scenario;
