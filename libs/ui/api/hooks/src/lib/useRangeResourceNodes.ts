import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import { RangeNode } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeResourceNodes = 'range-resource-nodes';
export const useGetRangeResourceNodes = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      if (!reqOptions?.rangeId) {
        return [];
      }

      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.nodesListByRangeId(
        reqOptions?.rangeId,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving Range Resource Nodes',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceNodes, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};
