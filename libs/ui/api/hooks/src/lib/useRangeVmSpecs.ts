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
  VMSpecification,
  VmSpecificationCreate,
  VmSpecificationUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyVmSpecs = 'vm-specs';

export const useGetRangeVmSpecs = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.vmSpecificationsList(
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
        'An error occurred retrieving the VM Specifications',
      );
    }
  };

  return useQuery([queryKeyVmSpecs, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetRangeVmSpec = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.vmSpecificationsRetrieve(
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the VM Specification',
      );
    }
  };

  return useQuery([queryKeyVmSpecs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeVmSpec = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: VmSpecificationCreate) => {
    try {
      const response = await DevopsApiClient.vmSpecificationsCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the VM Specification',
      );
    }
  };

  return useMutation(
    (formData: VmSpecificationCreate) => postResult(formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyVmSpecs);
        }
      },
    },
  );
};

export const usePutRangeVmSpec = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: VmSpecificationUpdate) => {
    try {
      const response = await DevopsApiClient.vmSpecificationsUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the VM Specification',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVmSpecs);
      }
    },
  });
};

export const useDeleteRangeVmSpec = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.vmSpecificationsDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the VM Specification',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyVmSpecs);
      }
    },
  });
};
