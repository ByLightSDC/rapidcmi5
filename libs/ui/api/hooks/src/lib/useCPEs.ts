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
  CPE,
  CpeCreate,
  CpeUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyCPEs = 'cpes';
export const useGetCPEs = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.cpeList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.lang || '*',
        reqOptions?.other || '*',
        reqOptions?.part === '*' ? undefined : reqOptions?.part, //work around for be inconsistency
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
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving CPEs');
    }
  };

  return useQuery([queryKeyCPEs, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetCPE = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.cpeRetrieve(id, queryHooksConfig);
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the CPE');
    }
  };

  return useQuery([queryKeyCPEs, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostCPE = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: CpeCreate) => {
    try {
      const response = await DevopsApiClient.cpeCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the CPE');
    }
  };

  return useMutation((formData: CpeCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCPEs);
      }
    },
  });
};

export const usePutCPE = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: CpeUpdate) => {
    try {
      const response = await DevopsApiClient.cpeUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the CPE');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCPEs);
      }
    },
  });
};

export const useDeleteCPE = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.cpeDelete(uuid, queryHooksConfig);
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the CPE');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyCPEs);
      }
    },
  });
};
