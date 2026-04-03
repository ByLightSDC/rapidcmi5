import { useCallback, useMemo } from 'react';
import { initClient } from '@ts-rest/core';
import {
  codeRunnerContract,
  ExecuteCodeBodyApi,
  ExecuteCodeResponseApi,
  LanguagesResponseApi,
} from './codeRunnerContract';

type AuthType = 'Basic' | 'Bearer';
// We will attempt to move to Tan stack React Query V5 in the future
export function useCodeRunnerApi(url: string, token: string, authType: AuthType) {
  const apiClient = useMemo(
    () =>
      initClient(codeRunnerContract, {
        baseUrl: url,
        baseHeaders: {
          Authorization: `${authType} ${token}`,
        },
      }),
    [url, token],
  );

  const getLanguages = useCallback(async (): Promise<LanguagesResponseApi> => {
    const response = await apiClient.listLanguages();

    if (response.status === 200) {
      const data = response.body;

      return data;
    }

    throw new CodeRunnerApiError('Failed to get languages', response.status);
  }, [apiClient]);

  const executeCode = useCallback(
    async (question: ExecuteCodeBodyApi): Promise<ExecuteCodeResponseApi> => {
      const response = await apiClient.execute({ body: question });
      if (response.status === 200) {
        return response.body;
      }
      throw new CodeRunnerApiError('Failed to execute code', response.status);
    },
    [apiClient],
  );

  return { getLanguages, executeCode };
}

export class CodeRunnerApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(`${message} (status: ${status})`);
    this.name = 'CodeRunnerApiError';
  }
}
