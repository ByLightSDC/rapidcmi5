/* Query Range Resources from Graph QL */

import { useQuery } from 'react-query';
import {
  defaultQueryConfig,
  getGraphQLUrl,
  queryHooksConfig,
} from './config';
import { request, gql } from 'graphql-request';
import { RangeStatusEnum } from '@rapid-cmi5/frontend/clients/devops-api';
import { getErrorMessage } from './errorMessages';

export type RangeResourceType = {
  kind: string;
  name: string;
  status: RangeStatusEnum;
  message: string;
};

// #region Query Operations
const rangeResourcesQuery = gql`
  query Range($uuid: String!) {
    range(uuid: $uuid) {
      uuid
      name
      resources {
        name
        kind
        status
        message
      }
    }
  }
`;
// #endregion

/* Get List of Range Resources for Specified Range */
export const useGetRangeResources = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const variables = {
        uuid: id,
        //#REF PRETEND ERROR
        // uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        rangeResourcesQuery,
        variables,
        headers,
      );

      return response;
    } catch (error: any) {
      //Supports Mocking GraphQL Queries Using Rest Methods
     
      throw getErrorMessage(
        error,
        'An error occurred retrieving the range resources',
      );
    }
  };

  return useQuery(['range-resources', id], getResult, {
    ...defaultQueryConfig,
  });
};
