/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  EnvironmentSpecificationAwsCreate,
  EnvironmentSpecificationAwsUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyEnvironmentSpecs = 'environment-specifications';

export const useGetEnvironmentSpecs = (reqOptions?: any) => {
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
      const response = await DevopsApiClient.environmentAwsSpecificationList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.awsAvailabilityZone,
        reqOptions?.awsRegion,
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
        'An error occurred deleting the Environment Specs',
      );
    }
  };

  return useQuery(
    [queryKeyEnvironmentSpecs, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetEnvironmentSpec = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.environmentAwsSpecificationRetrieve(
          id,
          queryHooksConfig,
        );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Environment Specification',
      );
    }
  };

  return useQuery([queryKeyEnvironmentSpecs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostEnvironmentSpec = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: EnvironmentSpecificationAwsCreate) => {
    try {
      const response = await DevopsApiClient.environmentAwsSpecificationCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Environment Specification',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEnvironmentSpecs);
      }
    },
  });
};

export const usePutEnvironmentSpec = () => {
  const queryClient = useQueryClient();
  const putResult = async (
    uuid: string,
    formData: EnvironmentSpecificationAwsUpdate,
  ) => {
    try {
      const response = await DevopsApiClient.environmentAwsSpecificationUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Environment Specification',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEnvironmentSpecs);
      }
    },
  });
};

export const useDeleteEnvironmentSpec = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.environmentAwsSpecificationDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Environment Specification',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyEnvironmentSpecs);
      }
    },
  });
};
