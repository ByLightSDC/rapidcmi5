import { useCallback, useMemo } from 'react';
import { initClient } from '@ts-rest/core';
import { codeRunnerContract, ExecuteCodeBodyApi, ExecuteCodeResponseApi, LanguagesResponseApi } from '../codeRunnerContract';
import {
  CodeRunnerApiError,
  handleExecuteCode,
  handleGetLanguages,
} from '../utils/codeRunner';

export { CodeRunnerApiError };

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

  const getLanguagesCb = useCallback(async (): Promise<LanguagesResponseApi> => {
    if (!apiClient) throw Error('API client is not set');
    return await handleGetLanguages(apiClient);
  }, [apiClient]);

  const executeCodeCb = useCallback(
    async (question: ExecuteCodeBodyApi): Promise<ExecuteCodeResponseApi> => {
      if (!apiClient) throw Error('API client is not set');
      return await handleExecuteCode(question, apiClient);
    },
    [apiClient],
  );

  const executeCode = apiClient ? executeCodeCb : undefined;
  const getLanguages = apiClient ? getLanguagesCb : undefined;

  return { getLanguages, executeCode };
}
