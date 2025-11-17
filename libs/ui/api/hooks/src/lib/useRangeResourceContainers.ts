/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCache } from '@rangeos-nx/ui/branded';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceContainers = 'range-resource-containers';

export const useGetRangeResourceContainers = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.rangeContainersList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.name,
        reqOptions?.author,
        reqOptions?.chart,
        reqOptions?.chartVersion,
        reqOptions?.status,
        reqOptions?.containerSpecification,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || 'dateCreated', // this is the date the container was deployed
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      // endpoint returns paging information with the actual records embedded in data
      return response.data.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Containers',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceContainers, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceContainer = ({
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
      const response = await DevopsApiClient.rangeContainersRetrieve(
        rangeId,
        scenarioId,
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Container',
      );
    }
  };

  return useQuery([queryKeyRangeResourceContainers, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostPauseRangeResourceContainer = ({
  rangeId,
  scenarioId,
}: any) => {
  const queryClient = useQueryClient();
  const queryCache = useCache();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.rangeContainersStop(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      const cacheData: any = queryCache.getObjFromArrayById(
        queryKeyRangeResourceContainers + '-' + rangeId,
        scenarioId,
        uuid,
      );

      if (cacheData) {
        const responseData = { ...cacheData };
        responseData.running = false;
        queryCache.putObjInArray(
          queryKeyRangeResourceContainers + '-' + rangeId,
          scenarioId,
          responseData,
        );
        return responseData;
      }

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred pausing the Container');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          //TEMP queryCache.putObjInArray(queryKeyRangeResourceContainers + '-' + rangeId, scenarioId, data);
          queryClient.invalidateQueries([
            queryKeyRangeResourceContainers + '-' + rangeId,
            scenarioId,
          ]);
        }
      },
    },
  );
};

export const usePostResumeRangeResourceContainer = ({
  rangeId,
  scenarioId,
}: any) => {
  const queryClient = useQueryClient();
  const queryCache = useCache();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.rangeContainersStart(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      const cacheData: any = queryCache.getObjFromArrayById(
        queryKeyRangeResourceContainers + '-' + rangeId,
        scenarioId,
        uuid,
      );

      if (cacheData) {
        const responseData = { ...cacheData };
        responseData.running = true;

        queryCache.putObjInArray(
          queryKeyRangeResourceContainers + '-' + rangeId,
          scenarioId,
          responseData,
        );
        return responseData;
      }

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred resuming the Container');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          //TEMP we may use this to replace modifying cache directly
          // const queryClient = useQueryClient();
          queryClient.invalidateQueries([
            queryKeyRangeResourceContainers + '-' + rangeId,
            scenarioId,
          ]);
        }
      },
    },
  );
};

export const useDeleteRangeResourceContainer = ({
  rangeId,
  scenarioId,
}: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response = await DevopsApiClient.rangeContainersDelete(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Container');
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceContainers);
          queryClient.invalidateQueries([
            queryKeyRangeResourceContainers + '-' + rangeId,
          ]);
          queryClient.invalidateQueries([
            queryKeyRangeResourceContainers + '-' + rangeId,
            scenarioId,
          ]);
        }
      },
    },
  );
};
