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

type ClientWithStatus<T> = {
  enabled: boolean;
  client: T;
};

type ApiClients = {
  rangeClient: ClientWithStatus<RangeClient>;
  quizBankClient: ClientWithStatus<QuizBankClient>;
  codeRunnerClient: ClientWithStatus<CodeRunnerClient>;
};

const makeDefaultClients = (): ApiClients => ({
  rangeClient: {
    enabled: false,
    client: initTsrReactQuery(scenarioContract, { baseUrl: '' }),
  },
  quizBankClient: {
    enabled: false,
    client: initTsrReactQuery(quizBankContract, { baseUrl: '' }),
  },
  codeRunnerClient: {
    enabled: false,
    client: initTsrReactQuery(codeRunnerContract, { baseUrl: '' }),
  },
});

const ApiContext = createContext<ApiClients>(makeDefaultClients());

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
    const headers: Record<string, string> = token
      ? { Authorization: cmi5Enabled ? `Basic ${token}` : `Bearer ${token}` }
      : {};
    const apiOverride = isElectron ? { api: electronFetchApi } : {};

    return {
      rangeClient: {
        enabled: Boolean(rangeUrl),
        client: initTsrReactQuery(scenarioContract, {
          baseUrl: rangeUrl ?? '',
          baseHeaders: headers,
          ...apiOverride,
        }),
      },
      quizBankClient: {
        enabled: Boolean(quizBankUrl),
        client: initTsrReactQuery(quizBankContract, {
          baseUrl: quizBankUrl ?? '',
          baseHeaders: headers,
          ...apiOverride,
        }),
      },
      codeRunnerClient: {
        enabled: Boolean(codeRunnerUrl),
        client: initTsrReactQuery(codeRunnerContract, {
          baseUrl: codeRunnerUrl ?? '',
          baseHeaders: headers,
          ...apiOverride,
        }),
      },
    };
  }, [token, rangeUrl, quizBankUrl, codeRunnerUrl]);

  return (
    <QueryClientProvider client={queryClient}>
      <clients.rangeClient.client.ReactQueryProvider>
        <clients.quizBankClient.client.ReactQueryProvider>
          <clients.codeRunnerClient.client.ReactQueryProvider>
            <ApiContext.Provider value={clients}>
              {children}
            </ApiContext.Provider>
          </clients.codeRunnerClient.client.ReactQueryProvider>
        </clients.quizBankClient.client.ReactQueryProvider>
      </clients.rangeClient.client.ReactQueryProvider>
    </QueryClientProvider>
  );
}
