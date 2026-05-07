import { InitClientReturn } from '@ts-rest/core';
import {
  codeRunnerContract,
  ExecuteCodeBodyApi,
  ExecuteCodeResponseApi,
  LanguagesResponseApi,
} from '../codeRunnerContract';

type CodeRunnerClient = InitClientReturn<
  typeof codeRunnerContract,
  { baseUrl: string }
>;

export class CodeRunnerApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(`${message} (status: ${status})`);
    this.name = 'CodeRunnerApiError';
  }
}

export const handleGetLanguages = async (
  apiClient: CodeRunnerClient,
): Promise<LanguagesResponseApi> => {
  const response = await apiClient.listLanguages();
  if (response.status === 200) {
    return response.body;
  }
  throw new CodeRunnerApiError('Failed to get languages', response.status);
};

export const handleExecuteCode = async (
  question: ExecuteCodeBodyApi,
  apiClient: CodeRunnerClient,
): Promise<ExecuteCodeResponseApi> => {
  const response = await apiClient.execute({ body: question });
  if (response.status === 200) {
    return response.body;
  }
  throw new CodeRunnerApiError('Failed to execute code', response.status);
};
