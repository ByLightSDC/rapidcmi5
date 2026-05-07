/*
  We are required to make api calls from the backend due to the 
  fact many api calls have CORs headers which will not work for 
  api calls made from a frontend running on localhost
*/
import { initClient } from '@ts-rest/core';
import {
  scenarioContract,
  ScenarioApi,
  ScenarioQuery,
  PaginatedScenariosResponse,
  codeRunnerContract,
  ExecuteCodeBodyApi,
  ExecuteCodeResponseApi,
  LanguagesResponseApi,
  quizBankContract,
  QuestionBankApi,
  QuestionBankApiCreate,
  CourseAU,
  RC5ActivityTypeEnum,
  handleAddQuestion,
  handleDeleteQuestion,
  handleExecuteCode,
  handleFetchScenario,
  handleGetLanguages,
  handleListScenarios,
  handleProcessAu,
  handleSearchQuestions,
} from '@rapid-cmi5/cmi5-build-common';

function scenarioClient(baseUrl: string, token: string) {
  return initClient(scenarioContract, {
    baseUrl,
    baseHeaders: { Authorization: `Bearer ${token}` },
  });
}

function codeRunnerClient(
  baseUrl: string,
  token: string,
  authType: 'Basic' | 'Bearer',
) {
  return initClient(codeRunnerContract, {
    baseUrl,
    baseHeaders: { Authorization: `${authType} ${token}` },
  });
}

function quizBankClient(baseUrl: string, token: string) {
  return initClient(quizBankContract, {
    baseUrl,
    baseHeaders: { Authorization: `Bearer ${token}` },
  });
}

// ── Scenario API ─────────────────────────────────────────────────────────────

export async function fetchScenario(
  baseUrl: string,
  token: string,
  uuid: string,
): Promise<ScenarioApi> {
  const client = scenarioClient(baseUrl, token);
  return await handleFetchScenario(uuid, client);
}

export async function listScenarios(
  baseUrl: string,
  token: string,
  query: ScenarioQuery,
): Promise<PaginatedScenariosResponse> {
  const client = scenarioClient(baseUrl, token);
  return await handleListScenarios(query, client);
}

export async function processAu(
  baseUrl: string,
  token: string,
  au: CourseAU,
  blockId: string,
): Promise<void> {
  const client = scenarioClient(baseUrl, token);
  return await handleProcessAu(au, blockId, client);
}

// ── Code Runner API ───────────────────────────────────────────────────────────

export async function listLanguages(
  baseUrl: string,
  token: string,
  authType: 'Basic' | 'Bearer',
): Promise<LanguagesResponseApi> {
  const client = codeRunnerClient(baseUrl, token, authType);
  return await handleGetLanguages(client);
}

export async function executeCode(
  baseUrl: string,
  token: string,
  authType: 'Basic' | 'Bearer',
  body: ExecuteCodeBodyApi,
): Promise<ExecuteCodeResponseApi> {
  const client = codeRunnerClient(baseUrl, token, authType);
  return await handleExecuteCode(body, client);
}

// ── Quiz Bank API ─────────────────────────────────────────────────────────────

export async function searchQuestions(
  baseUrl: string,
  token: string,
  query: string,
  page: number,
  limit: number,
  activityType?: RC5ActivityTypeEnum,
) {
  const client = quizBankClient(baseUrl, token);
  return await handleSearchQuestions(query, page, limit, client, activityType);
}

export async function addQuestion(
  baseUrl: string,
  token: string,
  body: QuestionBankApiCreate,
): Promise<QuestionBankApi> {
  const client = quizBankClient(baseUrl, token);
  return (await handleAddQuestion(body, client)) as QuestionBankApi;
}

export async function deleteQuestion(
  baseUrl: string,
  token: string,
  uuid: string,
): Promise<void> {
  const client = quizBankClient(baseUrl, token);
  return await handleDeleteQuestion(uuid, client);
}
