/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  DevopsApiClient,
  RangeSpecificationVsphereCreate,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
export const queryKeyVsphereRangeSpecs = 'vsphere-range-specifications';

export const useGetVsphereRangeSpecs = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.rangeVsphereSpecificationList(
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
        'An error occurred retrieving the vSphere Range Specifications',
      );
    }
  };

  return useQuery(
    [queryKeyVsphereRangeSpecs, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetVsphereRangeSpec = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.rangeVsphereSpecificationRetrieve(
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the vSphere Range Specification',
      );
    }
  };

  return useQuery([queryKeyVsphereRangeSpecs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostVsphereRangeSpec = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: RangeSpecificationVsphereCreate) => {
    try {
      const response = await DevopsApiClient.rangeVsphereSpecificationCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the vSphere Range Specification',
      );
    }
  };
  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVsphereRangeSpecs);
      }
    },
  });
};
export const usePutVsphereRangeSpec = () => {
  const queryClient = useQueryClient();
  const putResult = async (data: any) => {
    try {
      const response = await DevopsApiClient.rangeVsphereSpecificationUpdate(
        data.uuid,
        data.formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Vsphere Range Specification',
      );
    }
  };
  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVsphereRangeSpecs);
      }
    },
  });
};
export const useDeleteVsphereRangeSpec = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.rangeVsphereSpecificationDelete(
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
        queryClient.invalidateQueries(queryKeyVsphereRangeSpecs);
      }
    },
  });
};
