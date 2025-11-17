/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import { tChartCreate } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyCharts = 'charts-charts';

export const useGetCharts = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };
      //console.log('reqOptions', reqOptions);
      //return null;
      const response = await DevopsApiClient.chartsList(
        reqOptions?.name,
        reqOptions?.lang || '*',
        reqOptions?.other || '*',
        reqOptions?.part || '*',
        reqOptions?.product || '*',
        reqOptions?.softwareEdition || '*',
        reqOptions?.targetHardware || '*',
        reqOptions?.targetSoftware || '*',
        reqOptions?.update || '*',
        reqOptions?.vendor || '*',
        reqOptions?.version || '*',
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || 'name',
        reqOptions?.sort || defaultSortOrder,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Charts');
    }
  };

  return useQuery([queryKeyCharts, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetChart = ({ id }: { id: string }) => {
  const name = id;
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.chartsRetrieve(
        name,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Chart');
    }
  };

  return useQuery([queryKeyCharts, name], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostChart = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: tChartCreate) => {
    try {
      const configWithProgress = {
        ...queryHooksConfig,
        onUploadProgress: formData.onUploadProgress,
      };
      const response = await DevopsApiClient.chartsCreate(
        formData.cpe,
        formData.file,
        formData.iconType,
        formData.onUploadProgress ? configWithProgress : queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Chart');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCharts);
      }
    },
  });
};

//No PUT available for charts

export const useDeleteChart = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (name: string) => {
    try {
      const response = await DevopsApiClient.chartsDelete(
        name,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Chart');
    }
  };

  return useMutation((name: string) => deleteResult(name), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCharts);
      }
    },
  });
};
