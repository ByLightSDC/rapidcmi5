/* Query Deployed Packages from Graph QL */

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

// #region Default Query Operations
export const graphqlPackageFields = `
  uuid
  name
  status
  message
  containerSpecifications { uuid }
  rangeL3Networks { uuid }
  rangeRouters { uuid }
  vmSpecifications { uuid }
`;
const packagesQuery = gql`
query Packages($rangeId: String!, $scenarioId: String!, $limit: Int) {
  packages(rangeId: $rangeId, scenarioId: $scenarioId, limit: $limit) {
    ${graphqlPackageFields}
  }
}
`;
// #endregion

/**
 * Get Packages for Specified Deployed Scenario
 * @param {string} rangeId Id for range on which scenario is deployed
 * @param {string} scenarioId Id of deployed scenario
 * @param {string} [graphQuery] Override of default deployed package graph query
 * @returns
 */
export const useGetRangeResourcePackagesGraph = (
  rangeId: string,
  scenarioId: string,
  graphQuery?: string,
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
        graphQuery || packagesQuery,
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
        'An error occurred retrieving the Scenario Packages',
      );
    }
  };

  return useQuery(['packages-data-graph', scenarioId], getResult, {
    ...defaultQueryConfig,
  });
};
