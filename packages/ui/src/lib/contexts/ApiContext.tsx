import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import {
  codeRunnerContract,
  quizBankContract,
  scenarioContract,
} from '@rapid-cmi5/cmi5-build-common';
import { electronFetchApi } from './electronFetcher';

const queryClient = new QueryClient();

type RangeClient = ReturnType<
  typeof initTsrReactQuery<typeof scenarioContract, { baseUrl: string }>
>;
type QuizBankClient = ReturnType<
  typeof initTsrReactQuery<typeof quizBankContract, { baseUrl: string }>
>;
type CodeRunnerClient = ReturnType<
  typeof initTsrReactQuery<typeof codeRunnerContract, { baseUrl: string }>
>;

type ApiClients = {
  rangeClient?: RangeClient;
  quizBankClient?: QuizBankClient;
  codeRunnerClient?: CodeRunnerClient;
};

const ApiContext = createContext<ApiClients>({});

export const useRangeClient = () => useContext(ApiContext).rangeClient;
export const useQuizBankClient = () => useContext(ApiContext).quizBankClient;
export const useCodeRunnerClient = () =>
  useContext(ApiContext).codeRunnerClient;

export function ApiProviders({
  children,
  token,
  cmi5Enabled = false,
  isElectron = false,
  rangeUrl,
  quizBankUrl,
  codeRunnerUrl,
}: {
  children: React.ReactNode;
  token?: string;
  cmi5Enabled?: boolean;
  isElectron?: boolean;
  rangeUrl?: string;
  quizBankUrl?: string;
  codeRunnerUrl?: string;
}) {
  const clients = useMemo<ApiClients>(() => {
    if (!token) return {};
    const headers = {
      Authorization: cmi5Enabled ? `Basic ${token}` : `Bearer ${token}`,
    };
    return {
      rangeClient: rangeUrl
        ? initTsrReactQuery(scenarioContract, {
            baseUrl: rangeUrl,
            baseHeaders: headers,
            ...(isElectron ? { api: electronFetchApi } : {}),
          })
        : undefined,
      quizBankClient: quizBankUrl
        ? initTsrReactQuery(quizBankContract, {
            baseUrl: quizBankUrl,
            baseHeaders: headers,
            ...(isElectron ? { api: electronFetchApi } : {}),
          })
        : undefined,
      codeRunnerClient: codeRunnerUrl
        ? initTsrReactQuery(codeRunnerContract, {
            baseUrl: codeRunnerUrl,
            baseHeaders: headers,
            ...(isElectron ? { api: electronFetchApi } : {}),
          })
        : undefined,
    };
  }, [token, rangeUrl, quizBankUrl, codeRunnerUrl]);

  let tree = (
    <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>
  );

  if (clients.codeRunnerClient) {
    tree = (
      <clients.codeRunnerClient.ReactQueryProvider>
        {tree}
      </clients.codeRunnerClient.ReactQueryProvider>
    );
  }
  if (clients.quizBankClient) {
    tree = (
      <clients.quizBankClient.ReactQueryProvider>
        {tree}
      </clients.quizBankClient.ReactQueryProvider>
    );
  }
  if (clients.rangeClient) {
    tree = (
      <clients.rangeClient.ReactQueryProvider>
        {tree}
      </clients.rangeClient.ReactQueryProvider>
    );
  }

  return <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>;
}
