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
  createAuMappingNameWithAuId,
  generateAuId,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

function scenarioClient(baseUrl: string, token: string) {
  return initClient(scenarioContract, {
    baseUrl,
    baseHeaders: { Authorization: `Bearer ${token}` },
  });
}

function codeRunnerClient(baseUrl: string, token: string, authType: 'Basic' | 'Bearer') {
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
  const response = await scenarioClient(baseUrl, token).getScenario({
    params: { uuid },
  });
  if (response.status === 200) return response.body;
  throw new Error(`Failed to fetch scenario "${uuid}" (status: ${response.status})`);
}

export async function listScenarios(
  baseUrl: string,
  token: string,
  query: ScenarioQuery,
): Promise<PaginatedScenariosResponse> {
  const response = await scenarioClient(baseUrl, token).listScenarios({ query });
  if (response.status === 200) return response.body;
  throw new Error(`Failed to list scenarios (status: ${response.status})`);
}

export async function processAu(
  baseUrl: string,
  token: string,
  au: CourseAU,
  blockId: string,
): Promise<void> {
  const client = scenarioClient(baseUrl, token);

  let scenarioUUID: string | undefined;

  if (au.rangeosScenarioUUID) {
    const response = await client.getScenario({ params: { uuid: au.rangeosScenarioUUID } });
    if (response.status !== 200) {
      throw new Error(
        `Scenario UUID "${au.rangeosScenarioUUID}" does not exist in this environment.\n` +
          `Lesson: "${au.auName}".\n` +
          `Update the scenario UUID or remove it from the AU settings.`,
      );
    }
    scenarioUUID = au.rangeosScenarioUUID;
  } else if (au.rangeosScenarioName) {
    const response = await client.listScenarios({ query: { name: au.rangeosScenarioName } });
    if (response.status !== 200 || !response.body.data || response.body.totalCount === 0) {
      throw new Error(
        `No scenario found with name "${au.rangeosScenarioName}" for AU "${au.auName}". ` +
          `Check that the scenario name is correct and exists in this environment.`,
      );
    }
    scenarioUUID = response.body.data.at(0)?.uuid;
  }

  if (!scenarioUUID) return;

  const auId = generateAuId({ blockId, auName: au.auName });
  const encodedAuId = encodeURIComponent(auId);

  const existing = await client.getAuMapping({ params: { auId: encodedAuId } });

  if (existing.status === 200) {
    const res = await client.updateAuMapping({
      params: { auId: encodedAuId },
      body: { scenarios: [scenarioUUID] },
    });
    if (res.status !== 200) throw new Error(`Could not update AU mapping for auId: ${auId}`);
  } else if (existing.status === 404) {
    const res = await client.createAuMapping({
      body: { auId, scenarios: [scenarioUUID], name: createAuMappingNameWithAuId(auId) },
    });
    if (res.status !== 201) throw new Error(`Could not create AU mapping for auId: ${auId}`);
  } else {
    throw existing.body;
  }
}

// ── Code Runner API ───────────────────────────────────────────────────────────

export async function listLanguages(
  baseUrl: string,
  token: string,
  authType: 'Basic' | 'Bearer',
): Promise<LanguagesResponseApi> {
  const response = await codeRunnerClient(baseUrl, token, authType).listLanguages();
  if (response.status === 200) return response.body;
  throw new Error(`Failed to get languages (status: ${response.status})`);
}

export async function executeCode(
  baseUrl: string,
  token: string,
  authType: 'Basic' | 'Bearer',
  body: ExecuteCodeBodyApi,
): Promise<ExecuteCodeResponseApi> {
  const response = await codeRunnerClient(baseUrl, token, authType).execute({ body });
  if (response.status === 200) return response.body;
  throw new Error(`Failed to execute code (status: ${response.status})`);
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
  const response = await quizBankClient(baseUrl, token).getQuestions({
    query: {
      offset: (page - 1) * limit,
      limit,
      sortBy: 'dateEdited',
      sort: 'desc',
      search: query.trim(),
      questionType: activityType === RC5ActivityTypeEnum.ctf ? 'freeResponse' : undefined,
    },
  });
  if (response.status === 200) return response.body;
  throw new Error(`Failed to search questions (status: ${response.status})`);
}

export async function addQuestion(
  baseUrl: string,
  token: string,
  body: QuestionBankApiCreate,
): Promise<QuestionBankApi> {
  const response = await quizBankClient(baseUrl, token).createQuestion({ body });
  if (response.status === 200 || response.status === 201) return response.body as QuestionBankApi;
  throw new Error(`Failed to add question (status: ${response.status})`);
}

export async function deleteQuestion(
  baseUrl: string,
  token: string,
  uuid: string,
): Promise<void> {
  const response = await quizBankClient(baseUrl, token).deleteQuestion({
    params: { uuid },
  });
  if (response.status !== 200 && response.status !== 204) {
    throw new Error(`Failed to delete question (status: ${response.status})`);
  }
}
