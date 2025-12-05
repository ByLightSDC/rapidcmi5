/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from 'react-query';
import { request, gql } from 'graphql-request';

import {
  defaultQueryConfig,
  getGraphQLUrl,
  infiniteRecordLimit,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

// #region Default Query Operations
export const graphqlRangeScenariosFields = `
  message
  name
  uuid
  status
  studentId
  studentUsername
`;
const rangeScenariosQuery = gql`
  query Scenarios($rangeId: String!, $limit: Int) {
    scenarios(rangeId: $rangeId, limit: $limit) {
      ${graphqlRangeScenariosFields}
    }
  }
`;

export const graphqlScenarioFields = gql`
  name
  uuid
  status
  author
  deployedBy
  dateCreated
  message
  dateEdited
  packages {
    name
    uuid
    status
  }
  scenarioId
  studentId
  studentUsername
`;
const graphqlScenarioQuery = gql`
  query Scenario($rangeId: String!, $uuid: String!) {
    scenario(rangeId: $rangeId, uuid: $uuid) {
      ${graphqlScenarioFields}
    }
  }
`;
// #endregion

/**
 * Get Scenarios for a specific range
 * @param {string} rangeId Id for range on which scenario is deployed
 * @returns
 */
export const useGetRangeScenariosGraph = (rangeId: string) => {
  const getResult = async () => {
    try {
      const variables = {
        rangeId: rangeId,
        //#REF PRETEND ERROR
        // rangeId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        limit: infiniteRecordLimit, //#REF - we want to get all - see CCR-1322
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        rangeScenariosQuery,
        variables,
        headers,
      );
      return response;
    } catch (error: any) {
      return []
    }
  };

  return useQuery(['range-scenarios-graph', rangeId], getResult, {
    ...defaultQueryConfig,
  });
};

/**
 * Get Content for Specified Deployed Scenario
 * @param {string} rangeId Id for range on which scenario is deployed
 * @param {string} uuid Id of deployed scenario
 * @param {string} [graphQuery] Override of default deployed scenario graph query
 * @returns
 */
export const useGetRangeResourceScenarioGraph = (
  rangeId: string,
  uuid: string,
  graphQuery?: string,
) => {
  const getResult = async () => {
    try {
      const variables = {
        rangeId: rangeId,
        uuid: uuid,
        //#REF PRETEND ERROR
        // uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        graphQuery || graphqlScenarioQuery,
        variables,
        headers,
      );
      return response;
    } catch (error: any) {
      //Supports Mocking GraphQL Queries Using Rest Methods

      throw getErrorMessage(
        error,
        'An error occurred retrieving the deployed Scenario data',
      );
    }
  };

  return useQuery(['scenario-data-graph', uuid], getResult, {
    ...defaultQueryConfig,
  });
};
