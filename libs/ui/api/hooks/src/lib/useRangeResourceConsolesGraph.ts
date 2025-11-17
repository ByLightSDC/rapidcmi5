/* Query Range Resource Consoles from Graph QL */

import { useQuery } from 'react-query';
import {
  defaultQueryConfig,
  getGraphQLUrl,
  getIsMSWMock,
  infiniteRecordLimit,
  queryHooksConfig,
} from './config';
import { request, gql } from 'graphql-request';
import { getErrorMessage } from './errorMessages';
export const queryKeyRangeResourceConsolesGraph =
  'range-resource-consoles-graph';

export const graphqlConsoleFields = `
      name
      rangeContainer
      rangeVM
      uuid
      url
      protocol
      status
      message
      details {
        connectionId
        connectionType
        urlHash
        dataSource
      }
      parameters {
        resizeMethod
      }
`;
const rangeResourceConsolesQuery = gql`
  query RangeConsoles($rangeId: String!, $scenarioId: String!, $limit: Int) {
    rangeConsoles(rangeId: $rangeId, scenarioId: $scenarioId, limit: $limit) {
      ${graphqlConsoleFields}
    }
  }
`;

/* Get Consoles for specified range/scenario */
export const useGetRangeResourceConsolesGraph = (
  rangeId: string,
  scenarioId: string,
) => {
  const getResult = async () => {
    try {
      const variables = {
        rangeId: rangeId,
        scenarioId: scenarioId,
        //#REF PRETEND ERROR
        // scenarioId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        limit: infiniteRecordLimit, //#REF - we want to get all - see CCR-1322
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        rangeResourceConsolesQuery,
        variables,
        headers,
      );
      return response;
    } catch (error: any) {
      //Supports Mocking GraphQL Queries Using Rest Methods
      if (getIsMSWMock()) {
        if (error.response?.status === 200 && error.response) {
          //Not really an error so return data is if there was no error
          // eslint-disable-next-line no-prototype-builtins
          if (error.response.hasOwnProperty('0')) {
            return error.response['0'].data;
          }
        }
      }
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Range Scenario Consoles',
      );
    }
  };

  return useQuery(['range-resource-consoles-graph', scenarioId], getResult, {
    ...defaultQueryConfig,
  });
};
