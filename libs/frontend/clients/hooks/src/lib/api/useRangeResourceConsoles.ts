import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceConsoles = 'range-resource-consoles';
export const useGetRangeResourceConsoles = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.deployedRangeConsolesList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.name,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Consoles');
    }
  };

  return useQuery(
    [queryKeyRangeResourceConsoles, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceConsole = ({
  rangeId,
  scenarioId,
  id,
}: {
  rangeId: string;
  scenarioId: string;
  id: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.deployedRangeConsolesRetrieve(
        rangeId,
        scenarioId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Console');
    }
  };

  return useQuery([queryKeyRangeResourceConsoles, id], getResult, {
    ...defaultQueryConfig,
  });
};
