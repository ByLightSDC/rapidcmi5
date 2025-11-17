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
  tVmImageCreate,
  VmImageUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';
import { BootDetailsCreate } from 'libs/frontend/clients/devops-api/src/lib';

export const queryKeyVmImages = 'vm-images';
export const queryKeyVMImageDownload = 'vm-image-download';

export const useGetVmImages = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.vmImagesList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.iconType,
        reqOptions?.includePublicUrl,
        reqOptions?.lang || '*',
        reqOptions?.other || '*',
        reqOptions?.part || '*',
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
      throw getErrorMessage(error, 'An error occurred retrieving the Images');
    }
  };

  return useQuery([queryKeyVmImages, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
    ...reqOptions?.queryConfig,
  });
};

export const useGetVmImage = ({
  id,
  includePublicURL,
}: {
  id: string;
  includePublicURL?: boolean;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.vmImagesRetrieve(
        id,
        includePublicURL,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Image');
    }
  };

  return useQuery([queryKeyVmImages, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostVmImage = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: tVmImageCreate) => {
    try {
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        onUploadProgress: formData.onUploadProgress,
        signal: formData.signal,
        transformRequest: (data) => {
          if (formData.metadata) {
            data.set('metadata', JSON.stringify(formData.metadata));
          }
          return data;
        },
      };
      const response = await DevopsApiClient.vmImagesCreate(
        formData?.name,
        formData.file,
        formData?.description || '',
        undefined,
        formData?.bootDetails,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Image');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVmImages);
      }
    },
  });
};

export const usePutVmImage = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: VmImageUpdate) => {
    try {
      const response = await DevopsApiClient.vmImagesUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Image');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyVmImages);
      }
    },
  });
};

export const useDeleteVmImage = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.vmImagesDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Image');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyVmImages);
      }
    },
  });
};

export const useGetVmImageDownload = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.vmImagesDownload(id, {
        ...queryHooksConfig,
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the VM Image data',
      );
    }
  };
  return useQuery([queryKeyVMImageDownload, id], getResult, {
    ...defaultQueryConfig,
  });
};
