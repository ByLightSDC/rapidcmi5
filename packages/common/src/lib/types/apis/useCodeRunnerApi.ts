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
export function useCodeRunnerApi(
  authType: AuthType,
  url?: string,
  token?: string,
) {
  const apiClient = useMemo(
    () =>
      url && token
        ? initClient(codeRunnerContract, {
            baseUrl: url,
            baseHeaders: {
              Authorization: `${authType} ${token}`,
            },
          })
        : undefined,
    [url, token, authType],
  );

  const getLanguagesCb =
    useCallback(async (): Promise<LanguagesResponseApi> => {
      if (!apiClient) throw Error('API client is not set');
      const response = await apiClient.listLanguages();

      if (response.status === 200) {
        const data = response.body;

        return data;
      }

      throw new CodeRunnerApiError('Failed to get languages', response.status);
    }, [apiClient]);

  const executeCodeCb = useCallback(
    async (question: ExecuteCodeBodyApi): Promise<ExecuteCodeResponseApi> => {
      if (!apiClient) throw Error('API client is not set');

      const response = await apiClient.execute({ body: question });
      if (response.status === 200) {
        return response.body;
      }
      throw new CodeRunnerApiError('Failed to execute code', response.status);
    },
    [apiClient],
  );

  const executeCode = apiClient ? executeCodeCb : undefined;
  const getLanguages = apiClient ? getLanguagesCb : undefined;

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
