/* Subscribe to Range Updates from Graph QL */

import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';

// #region Query Operations
const rangeUpdatedQuery = gql`
  subscription RangeUpdated($uuid: String!) {
    rangeUpdated(uuid: $uuid) {
      name
      ready
      uuid
    }
  }
`;
// #endregion

/* Get Real-Time Message When Range Is Updated */
export const useGetRangeUpdates = ({ id }: { id: string }) => {
  const [subscriptionData, setSubscriptionData] = useState({});
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({});

  const client = useGraphQLClient();

  const variables = {
    uuid: id,
  };

  const params = {
    operationName: 'RangeUpdated',
    query: rangeUpdatedQuery,
    variables,
  };

  useEffect(() => {
    const unsubscribe = client.subscribe(params, {
      next: (data: any) => {
        if (data) {
          setSubscriptionData(data.data.rangeUpdated);
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

  return {
    data: subscriptionData,
    isError: isError,
    error: error,
  };
};
