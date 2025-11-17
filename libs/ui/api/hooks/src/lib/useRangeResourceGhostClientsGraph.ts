/* Query Range Resource Ghost Clients from Graph QL */

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

export const queryKeyRangeResourceGhostClientsGraph = 'ghost-clients-graph';

//REF - when a ghost client is deployed, a rangeIP is connected if an autoIP was defined
// so we only need to look at the rangeIP information in the graphql
export const graphqlGhostClientFields = `
     author
    c2Server
    dateCreated
    dateEdited
    description
    metadata
    name
    nameservers
    profile
    rangeIP {
      address
      latitude
      longitude
      countryCode
      name
      uuid
    }
    scenarioGroups
    uuid
`;
const rangeResourceGhostClientsQuery = gql`
query GhostClients($rangeId: String!, $scenarioId: String!) {
  ghostClients(rangeId: $rangeId, scenarioId: $scenarioId) {
        ${graphqlGhostClientFields}
    }
  }
`;

/* Get Ghost Clients for specified range/scenario */
export const useGetRangeResourceGhostClientsGraph = (
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
        rangeResourceGhostClientsQuery,
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
        'An error occurred retrieving the Range Scenario Ghost Clients',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceGhostClientsGraph, scenarioId],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );
};
