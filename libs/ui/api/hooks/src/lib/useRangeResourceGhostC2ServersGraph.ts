/* Query Range Resource Ghost C2 Servers from Graph QL */

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

export const queryKeyRangeResourceGhostC2ServersGraph =
  'ghost-c2-servers-graph';

export const graphqlGhostC2ServerFields = `
    author
    dateCreated
    dateEdited
    description
    hostname
    message
    metadata
    name
    scenarioGroups
    status
    storage
    uuid
`;
const rangeResourceGhostC2ServersQuery = gql`
query GhostC2Servers($rangeId: String!, $scenarioId: String!) {
  ghostC2Servers(rangeId: $rangeId, scenarioId: $scenarioId) {
        ${graphqlGhostC2ServerFields}
    }
  }
`;

/* Get Ghost C2Servers for specified range/scenario */
export const useGetRangeResourceGhostC2ServersGraph = (
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
        limit: infiniteRecordLimit, //#REF - we want to get all
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        rangeResourceGhostC2ServersQuery,
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
        'An error occurred retrieving the Range Scenario Ghost C2Servers',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceGhostC2ServersGraph, scenarioId],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );
};
