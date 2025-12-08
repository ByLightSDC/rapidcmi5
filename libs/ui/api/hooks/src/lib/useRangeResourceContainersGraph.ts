/* Query Range Resource Containers from Graph QL */

import { useQuery } from 'react-query';
import {
  defaultQueryConfig,
  getGraphQLUrl,
  infiniteRecordLimit,
  queryHooksConfig,
} from './config';
import { request, gql } from 'graphql-request';
import { getErrorMessage } from './errorMessages';

export const graphqlContainerFields = `
      name
      uuid
      dateCreated
      dateEdited
      status
      author
      running
      message
      chartIcon
      chart
      chartVersion
      rangeCerts
      rangeDNSRecords
      interfaces {
        rangeAutoIP {
          address
        }
        rangeIP {
          address
        }
      }`;
const rangeResourceContainersQuery = gql`
  query RangeContainers($rangeId: String!, $scenarioId: String!, $limit: Int) {
    rangeContainers(rangeId: $rangeId, scenarioId: $scenarioId, limit: $limit) {
      ${graphqlContainerFields}
    }
  }
`;

/* Get Containers for specified range/scenario */
export const useGetRangeResourceContainersGraph = (
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
        rangeResourceContainersQuery,
        variables,
        headers,
      );
      return response;
    } catch (error: any) {
      //Supports Mocking GraphQL Queries Using Rest Methods
     
      
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Range Scenario Containers',
      );
    }
  };

  return useQuery(['range-resource-containers-graph', scenarioId], getResult, {
    ...defaultQueryConfig,
  });
};
