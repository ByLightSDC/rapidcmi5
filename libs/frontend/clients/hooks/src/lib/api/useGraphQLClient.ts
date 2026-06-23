import { useMemo } from 'react';
import { createClient } from 'graphql-ws';
import { getGraphQLSubscriptionsUrl, queryHooksConfig } from './config';

export const useGraphQLClient = (subscriptionsUrl?: string) => {
  if (!subscriptionsUrl) {
    subscriptionsUrl = getGraphQLSubscriptionsUrl();
  }

  const authorization = queryHooksConfig.headers.Authorization;
  // Recreate the client when the subscriptions URL (or auth) changes. The
  // player loads its config from cfg.json ASYNCHRONOUSLY, so on first render
  // config.DEVOPS_GQL_SUBSCRIPTIONS_URL is still empty and
  // getGraphQLSubscriptionsUrl() returns the 'http://localhost' fallback. With
  // empty deps ([]) the memo captured that localhost URL forever and the WS
  // never connected (→ no scenarioUpdated events → scenario header stuck
  // NotReady). Depending on subscriptionsUrl lets the client rebuild once
  // cfg.json resolves the real wss:// URL. (The dashboard loads env-config.js
  // synchronously, so its URL is correct on first render and this never churns.)
  return useMemo(
    () =>
      createClient({
        url: subscriptionsUrl as string,
        connectionParams: () => ({
          authorization,
        }),
      }),
    [subscriptionsUrl, authorization],
  );
};
