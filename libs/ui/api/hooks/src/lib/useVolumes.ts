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
  VolumeUpdate,
  tVolumeCreate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyVolumes = 'volumes';

export const useGetVolumes = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.volumesList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.volumeType,
        reqOptions?.includePublicURL,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Files');
    }
  };

  return useQuery([queryKeyVolumes, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetVolume = ({
  id,
  includePublicURL,
}: {
  id: string;
  includePublicURL?: boolean;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.volumesRetrieve(
        id,
        includePublicURL,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the File');
    }
  };

  return useQuery([queryKeyVolumes, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostVolume = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: tVolumeCreate) => {
    try {
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        onUploadProgress: formData.onUploadProgress,
        transformRequest: (data) => {
          if (formData.metadata) {
            data.set('metadata', JSON.stringify(formData.metadata));
          }
          return data;
        },
      };

      const response = await DevopsApiClient.volumesCreate(
        formData.name,
        formData.file,
        formData.volumeType,
        formData.description,
        undefined,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the File');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVolumes);
      }
    },
  });
};

export const usePutVolume = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: VolumeUpdate) => {
    try {
      const response = await DevopsApiClient.volumesUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the File record',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVolumes);
      }
    },
  });
};

export const useDeleteVolume = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.volumesDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the File');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyVolumes);
      }
    },
  });
};
