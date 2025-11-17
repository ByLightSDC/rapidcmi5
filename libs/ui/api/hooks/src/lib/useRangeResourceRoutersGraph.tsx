/* Query Range Resource Routers from Graph QL */

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

export const queryKeyRangeResourceRoutersGraph = 'routers-graph';

export const graphqlRangeRouterFields = `
    name
    uuid
    longitude
    latitude
    interfaces {
      interfaceType
      rangeIPs {
        name
        address
        countryCode
        latitude
        longitude
        uuid
      }
    }
    author
    countryCode
    dateCreated
    dateEdited
    description
    hostname
    metadata
    protocols
    scenarioGroups
`;
const rangeResourceRoutersQuery = gql`
query RangeRouters($rangeId: String!, $scenarioId: String!) {
  rangeRouters(rangeId: $rangeId, scenarioId: $scenarioId) {
        ${graphqlRangeRouterFields}
    }
  }
`;

/* Get Range Resource Routers for specified range/scenario */
export const useGetRangeResourceRoutersGraph = (
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
        rangeResourceRoutersQuery,
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
        'An error occurred retrieving the Range Scenario Routers',
      );
    }
  };

  return useQuery([queryKeyRangeResourceRoutersGraph, scenarioId], getResult, {
    ...defaultQueryConfig,
  });
};
