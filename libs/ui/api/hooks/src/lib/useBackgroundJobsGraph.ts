/* Query Background Jobs from Graph QL */
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
export const graphqlBackgroundJobFields = `
    name
    state
    attempts
    maxAttempts
    jobId
    dateCreated
    uuid
    history {
      message
      status
      timestamp
    }
`;
const backgroundJobsQuery = gql`
query BackgroundJobs($scenarioId: String, $limit: Int) {
  backgroundJobs(scenarioId: $scenarioId, limit: $limit) {
      ${graphqlBackgroundJobFields}
    }
  }
`;
/* Get Background Jobs for specified deployed scenario */
export const useGetBackgroundJobsGraph = (scenarioId?: string) => {
  const getResult = async () => {
    try {
      const variables = {
        scenarioId: scenarioId,
        //#REF PRETEND ERROR
        // scenarioId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        limit: infiniteRecordLimit, //#REF - we want to get all - see CCR-1322
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        backgroundJobsQuery,
        variables,
        headers,
      );
      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        'An error occurred retrieving the Scenario Background Jobs',
      );
    }
  };
  return useQuery(['background-jobs-graph', scenarioId], getResult, {
    ...defaultQueryConfig,
  });
};
