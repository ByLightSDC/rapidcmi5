/* Query Range Resource Ghost Machines from Graph QL */

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

export const queryKeyRangeResourceGhostMachinesGraph = 'ghost-machines-graph';

export const graphqlGhostMachineFields = `
    name
    uuid
    author
    c2Server
    dateCreated
    dateEdited
    dateLastReported
    message
    metadata
    profile
    running
    status
    statusUp
    timelineStatus
`;
const rangeResourceGhostMachinesQuery = gql`
query GhostMachines($rangeId: String!, $scenarioId: String!) {
  ghostMachines(rangeId: $rangeId, scenarioId: $scenarioId) {
        ${graphqlGhostMachineFields}
    }
  }
`;

/* Get Ghost Machines for specified range/scenario */
export const useGetRangeResourceGhostMachinesGraph = (
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
        rangeResourceGhostMachinesQuery,
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
        'An error occurred retrieving the Range Scenario Ghost Machines',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceGhostMachinesGraph, scenarioId],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );
};
