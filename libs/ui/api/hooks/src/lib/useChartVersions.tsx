/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

import { queryKeyCharts } from './useCharts';
export const queryKeyChartVersions = 'chart-version';
export const queryKeyChartVersionSchemas = 'chart-version-schema';

export const useGetChartVersionSchema = ({
  chart,
  chartVersion,
}: {
  chart: string;
  chartVersion: string;
}) => {
  const getResult = async () => {
    try {
      if (chart && chartVersion) {
        const response = await DevopsApiClient.chartVersionsRetrieveSchema(
          chart,
          chartVersion,
          queryHooksConfig,
        );
        // to handle bad data returning empty string
        return response.data || {};
      }

      return null;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Schema');
    }
  };

  return useQuery(
    [queryKeyChartVersionSchemas, chart + '_' + chartVersion],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );
};

//No PUT available for charts

export const useGetChartVersion = ({
  chart,
  chartVersion,
}: {
  chart: string;
  chartVersion: string;
}) => {
  const getResult = async () => {
    try {
      if (chart && chartVersion) {
        const response = await DevopsApiClient.chartVersionsRetrieve(
          chart,
          chartVersion,
          queryHooksConfig,
        );
        // to handle bad data returning empty string
        return response.data || {};
      }

      return null;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Chart Version',
      );
    }
  };

  return useQuery(
    [queryKeyChartVersions, chart + '_' + chartVersion],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );
};

export const useDeleteChartVersion = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (formData: any) => {
    try {
      const response = await DevopsApiClient.chartVersionsDelete(
        formData.name,
        formData.version,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Chart Version',
      );
    }
  };

  return useMutation((formData: any) => deleteResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCharts);
      }
    },
  });
};
