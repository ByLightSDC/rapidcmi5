

// export type ScenarioProgressType = {
//   labName: string;
//   testId: string;
//   tasks: Array<TaskType>;
// };

// export type TaskType = {
//   name: string;
//   questionId: string;
// };

export type rangeDataType = {
  rangeId: string;
  deployedScenarios: Array<string>;
};

export type rangeConsoleDataType = {
  credentials: Array<{
    username: string;
    password: string;
    scenarioUUID: string;
  }>;
};
