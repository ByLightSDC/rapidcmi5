import { useMemo } from 'react';
import { createClient } from 'graphql-ws';
import { getGraphQLSubscriptionsUrl, queryHooksConfig } from './config';

export const useGraphQLClient = (subscriptionsUrl?: string) => {
  if (!subscriptionsUrl) {
    subscriptionsUrl = getGraphQLSubscriptionsUrl();
  }

  const authorization = queryHooksConfig.headers.Authorization;
  return useMemo(
    () =>
      createClient({
        url: subscriptionsUrl as string,
        connectionParams: () => ({
          authorization,
        }),
      }),
    [],
  );
};
