/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  TelemetryAgentCreate,
  TelemetryAgentUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyTelemetryAgents = 'telemetry-agents';

export const useGetTelemetryAgents = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const metadata = getMetadataFilterParam(reqOptions);
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        params: { metadata },
        paramsSerializer(params) {
          return qs.stringify(params);
        },
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.telemetryAgentsList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
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
        'An error occurred retrieving the Telemetry Agents',
      );
    }
  };

  return useQuery(
    [queryKeyTelemetryAgents, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetTelemetryAgent = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.telemetryAgentsRetrieve(
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Telemetry Agent',
      );
    }
  };

  return useQuery([queryKeyTelemetryAgents, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostTelemetryAgent = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: TelemetryAgentCreate) => {
    try {
      const response = await DevopsApiClient.telemetryAgentsCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Telemetry Agent',
      );
    }
  };

  return useMutation((formData: TelemetryAgentCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyTelemetryAgents);
      }
    },
  });
};

export const usePutTelemetryAgent = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: TelemetryAgentUpdate) => {
    try {
      const response = await DevopsApiClient.telemetryAgentsUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Telemetry Agent',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyTelemetryAgents);
      }
    },
  });
};

export const useDeleteTelemetryAgent = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.telemetryAgentsDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Telemetry Agent',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyTelemetryAgents);
      }
    },
  });
};
