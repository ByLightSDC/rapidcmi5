/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  RangeSpecificationAwsCreate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
export const queryKeyAwsRangeSpecs = 'aws-range-specifications';

export const useGetAwsRangeSpecs = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.rangeAwsSpecificationList(
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
        'An error occurred retrieving the AWS Range Specifications',
      );
    }
  };

  return useQuery(
    [queryKeyAwsRangeSpecs, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetAwsRangeSpec = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeAwsSpecificationRetrieve(
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the AWS Range Specification',
      );
    }
  };

  return useQuery([queryKeyAwsRangeSpecs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostAwsRangeSpec = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeSpecificationAwsCreate) => {
    try {
      const response = await DevopsApiClient.rangeAwsSpecificationCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the AWS Range Specification',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAwsRangeSpecs);
      }
    },
  });
};

export const usePutAwsRangeSpec = () => {
  const queryClient = useQueryClient();
  const putResult = async (data: any) => {
    try {
      const response = await DevopsApiClient.rangeAwsSpecificationUpdate(
        data.uuid,
        data.formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the AWS Range Specification',
      );
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAwsRangeSpecs);
      }
    },
  });
};

export const useDeleteAwsRangeSpec = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeAwsSpecificationDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the ASW Range Specification',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyAwsRangeSpecs);
      }
    },
  });
};
