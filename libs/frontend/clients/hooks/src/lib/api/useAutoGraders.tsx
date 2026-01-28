/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';

import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
  getMetadataFilterParam,
  infiniteRecordLimit,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  AutoGraderCreate,
  AutoGraderUpdate,
  DevopsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyAutoGraders = 'auto-graders';

/**
 * list
 * @param reqOptions
 * @returns
 */
export const useGetAutoGraders = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.autoGradersList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.telemetryAgent,
        reqOptions?.offset,
        reqOptions?.limit || infiniteRecordLimit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving Auto Graders');
    }
  };

  return useQuery(
    [queryKeyAutoGraders, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

/**
 * retrieve
 * @param param0
 * @returns
 */
export const useGetAutoGrader = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.autoGradersRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Auto Grader',
      );
    }
  };

  return useQuery([queryKeyAutoGraders, id], getResult, {
    ...defaultQueryConfig,
  });
};

/**
 * create
 * @returns
 */
export const usePostAutoGrader = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: AutoGraderCreate) => {
    try {
      const response = await DevopsApiClient.autoGradersCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Auto Grader',
      );
    }
  };

  return useMutation((formData: AutoGraderCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAutoGraders);
      }
    },
  });
};

/**
 * update
 * @returns
 */
export const usePutAutoGrader = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: AutoGraderUpdate) => {
    try {
      const response = await DevopsApiClient.autoGradersUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Auto Grader',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAutoGraders);
      }
    },
  });
};

/**
 * delete
 * @returns
 */
export const useDeleteAutoGrader = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.autoGradersDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Auto Grader',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAutoGraders);
      }
    },
  });
};
