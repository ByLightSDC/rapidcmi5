/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  PackageCreate,
  PackageUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyPackages = 'packages';

export const useGetPackages = (reqOptions?: any) => {
  const metadata = getMetadataFilterParam(reqOptions);
  const options: AxiosRequestConfig = {
    ...queryHooksConfig,
    params: { metadata },
    paramsSerializer(params) {
      return qs.stringify(params);
    },
    authToken: reqOptions?.authToken,
  };

  const getResult = async (reqOptions?: any) => {
    try {
      const response = await DevopsApiClient.packagesList(
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
      throw getErrorMessage(error, 'An error occurred retrieving the Packages');
    }
  };

  return useQuery([queryKeyPackages, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetPackage = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.packagesRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Package');
    }
  };

  return useQuery([queryKeyPackages, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostPackage = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: PackageCreate) => {
    try {
      const response = await DevopsApiClient.packagesCreate(
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Package');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyPackages);
      }
    },
  });
};

export const usePutPackage = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: PackageUpdate) => {
    try {
      const response = await DevopsApiClient.packagesUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Package');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyPackages);
      }
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.packagesDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Package');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyPackages);
      }
    },
  });
};
