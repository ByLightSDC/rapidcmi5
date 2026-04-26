import {
  ScenarioApi,
  ScenarioQuery,
  PaginatedScenariosResponse,
  CourseAU,
  ExecuteCodeBodyApi,
  ExecuteCodeResponseApi,
  LanguagesResponseApi,
  QuestionBankApi,
  QuestionBankApiCreate,
} from '@rapid-cmi5/cmi5-build-common';

// Typed shape of window.rangeApi exposed by the Electron preload.
// Keep in sync with apps/rapid-cmi5-electron/src/app/api/main.preload.ts
export const rangeApi = (window as unknown as { rangeApi: RangeApi }).rangeApi;

interface RangeApi {
  fetchScenario: (baseUrl: string, token: string, uuid: string) => Promise<ScenarioApi>;
  listScenarios: (baseUrl: string, token: string, query: ScenarioQuery) => Promise<PaginatedScenariosResponse>;
  processAu: (baseUrl: string, token: string, au: CourseAU, blockId: string) => Promise<void>;
  listLanguages: (baseUrl: string, token: string, authType: 'Basic' | 'Bearer') => Promise<LanguagesResponseApi>;
  executeCode: (baseUrl: string, token: string, authType: 'Basic' | 'Bearer', body: ExecuteCodeBodyApi) => Promise<ExecuteCodeResponseApi>;
  searchQuestions: (baseUrl: string, token: string, query: string, page: number, limit: number, activityType?: string) => Promise<unknown>;
  addQuestion: (baseUrl: string, token: string, body: QuestionBankApiCreate) => Promise<QuestionBankApi>;
  deleteQuestion: (baseUrl: string, token: string, uuid: string) => Promise<void>;
}
