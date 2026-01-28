/* eslint-disable @typescript-eslint/no-explicit-any */
/* Subscribe to Range Updates from Graph QL */

import { useEffect, useState } from 'react';
import { useGraphQLClient } from './useGraphQLClient';
//REF import { gql } from 'graphql-request';

/* Get Real-Time Message When Range Is Updated */
export const useSubscription = (params: any, defaultVal: any) => {
  const [subscriptionData, setSubscriptionData] = useState(defaultVal);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({});

  const client = useGraphQLClient();

  useEffect(() => {
    const unsubscribe = client.subscribe(params, {
      next: (data: any) => {
        if (data) {
          setSubscriptionData(data);
        }
      },
      error: function (error: unknown): void {
        setIsError(true);
        setError(error as object);
      },
      complete: function (): void {
        //nothing to do
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    //REF console.log('data change');
  }, [subscriptionData]);

  return {
    data: subscriptionData,
    isError: isError,
    error: error,
  };
};
