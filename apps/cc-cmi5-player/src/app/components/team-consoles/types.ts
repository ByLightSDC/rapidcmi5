import {
  DeployedRangeConsole,
  DeployedScenario,
  RangeContainer,
  RangeVM,
} from '@rapid-cmi5/ui';

export type ScenarioResources = {
  deployedScenarioId?: string;
  initialized: { [topic: string]: boolean };
  rangeId: string;
  activityId: string;
  scenarioId: string;
  scenarioName: string;
  updates: { [key: string]: any };
  updatesByTopic: { [topic: string]: { [key: string]: any } };
  ownedConsoles: { [key: string]: Partial<DeployedRangeConsole>[] };
};

export const defaultScenarioResourceData = {
  initialized: {},
  ownedConsoles: {},
  rangeId: undefined,
  scenarioId: undefined,
  scenarioName: undefined,
  updates: {},
  updatesByTopic: {},
};
