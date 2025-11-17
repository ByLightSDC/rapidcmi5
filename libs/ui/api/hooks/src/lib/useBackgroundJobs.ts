/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrder,
  defaultSortOrderBy,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyBackgroundJobs = 'background-jobs';

export const useGetBackgroundJobs = (reqOptions?: any) => {
  const config = {
    ...defaultQueryConfig,
    refetchInterval: reqOptions?.shouldPoll || false,
  };
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.backgroundJobsList(
        reqOptions?.uuid || undefined,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata - not using yet??
        reqOptions?.scenarioId,
        reqOptions?.jobId || undefined,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Background Jobs',
      );
    }
  };

  return useQuery(
    [queryKeyBackgroundJobs, reqOptions.scenarioId, reqOptions.uuid],
    () => getResult(reqOptions),
    {
      ...config,
      keepPreviousData: true,
    },
  );
};

export const useGetBackgroundJob = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.backgroundJobsRetrieve(
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Background Job',
      );
    }
  };

  return useQuery([queryKeyBackgroundJobs, id], getResult, {
    ...defaultQueryConfig,
  });
};
