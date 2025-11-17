import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from '../config';
import { getErrorMessage } from '../errorMessages';
import { RangeNode } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyInfrastructureResourceNodes = 'nodes';
export const useGetNodes = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.nodesList(
        reqOptions?.offset,
        reqOptions?.limit,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving Infrastructure Nodes',
      );
    }
  };

  return useQuery(
    [queryKeyInfrastructureResourceNodes, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};
